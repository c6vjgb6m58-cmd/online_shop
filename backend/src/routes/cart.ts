import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../utils/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// 购物车项验证模式
const cartItemSchema = z.object({
  productId: z.string().uuid('无效的商品ID'),
  quantity: z.number().int().positive('数量必须大于0'),
});

// 获取购物车
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.userId! },
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ cartItems });
  } catch (error: any) {
    res.status(500).json({ message: '获取购物车失败', error: error.message });
  }
});

// 添加商品到购物车
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const validatedData = cartItemSchema.parse(req.body);
    const { productId, quantity } = validatedData;

    // 检查商品是否存在
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    // 检查库存
    if (product.stock < quantity) {
      return res.status(400).json({ message: '库存不足' });
    }

    // 检查购物车中是否已有该商品
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.userId!,
          productId,
        },
      },
    });

    let cartItem;
    if (existingItem) {
      // 更新数量
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      });
    } else {
      // 创建新项
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.userId!,
          productId,
          quantity,
        },
        include: { product: true },
      });
    }

    res.status(201).json({ message: '已添加到购物车', cartItem });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: '验证失败',
        errors: error.errors,
      });
    }
    res.status(500).json({ message: '添加购物车失败', error: error.message });
  }
});

// 更新购物车项数量
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { quantity } = z.object({ quantity: z.number().int().positive() }).parse(req.body);

    // 检查购物车项是否属于当前用户
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: req.userId!,
      },
      include: { product: true },
    });

    if (!cartItem) {
      return res.status(404).json({ message: '购物车项不存在' });
    }

    // 检查库存
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({ message: '库存不足' });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true },
    });

    res.json({ message: '购物车项已更新', cartItem: updatedItem });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: '验证失败',
        errors: error.errors,
      });
    }
    res.status(500).json({ message: '更新购物车失败', error: error.message });
  }
});

// 删除购物车项
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // 检查购物车项是否属于当前用户
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: req.userId!,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ message: '购物车项不存在' });
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    res.json({ message: '已从购物车删除' });
  } catch (error: any) {
    res.status(500).json({ message: '删除购物车项失败', error: error.message });
  }
});

// 清空购物车
router.delete('/', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.userId! },
    });

    res.json({ message: '购物车已清空' });
  } catch (error: any) {
    res.status(500).json({ message: '清空购物车失败', error: error.message });
  }
});

export default router;


