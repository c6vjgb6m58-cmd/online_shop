import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireAdmin, verifyToken } from '../utils/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// 商品创建验证模式
const createProductSchema = z.object({
  name: z.string().min(1, '商品名称不能为空'),
  description: z.string().min(1, '商品描述不能为空'),
  price: z.number().positive('价格必须大于0'),
  stock: z.number().int().min(0, '库存不能为负数'),
  image: z.string().url().optional().or(z.literal('')),
  category: z.string().optional(),
});

// 获取商品列表（支持搜索和筛选）
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 构建查询条件
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }
    if (category) {
      where.category = category;
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    // 获取商品列表和总数
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: order },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: '获取商品列表失败', error: error.message });
  }
});

// 获取单个商品详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    // 记录用户浏览日志（如果已登录）
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        await prisma.userLog.create({
          data: {
            userId: decoded.userId,
            action: 'VIEW_PRODUCT',
            productId: id,
          },
        });
      }
    }

    res.json({ product });
  } catch (error: any) {
    res.status(500).json({ message: '获取商品详情失败', error: error.message });
  }
});

// 创建商品（管理员）
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const validatedData = createProductSchema.parse(req.body);

    const product = await prisma.product.create({
      data: validatedData,
    });

    res.status(201).json({ message: '商品创建成功', product });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: '验证失败',
        errors: error.errors,
      });
    }
    res.status(500).json({ message: '创建商品失败', error: error.message });
  }
});

// 更新商品（管理员）
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const validatedData = createProductSchema.partial().parse(req.body);

    const product = await prisma.product.update({
      where: { id },
      data: validatedData,
    });

    res.json({ message: '商品更新成功', product });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: '验证失败',
        errors: error.errors,
      });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: '商品不存在' });
    }
    res.status(500).json({ message: '更新商品失败', error: error.message });
  }
});

// 删除商品（管理员）
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: '商品删除成功' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: '商品不存在' });
    }
    res.status(500).json({ message: '删除商品失败', error: error.message });
  }
});

// 获取商品分类列表
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { category: { not: null } },
    });

    const categoryList = categories
      .map((c) => c.category)
      .filter((c): c is string => c !== null);

    res.json({ categories: categoryList });
  } catch (error: any) {
    res.status(500).json({ message: '获取分类列表失败', error: error.message });
  }
});

export default router;

