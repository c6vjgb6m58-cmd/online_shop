import express from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { authenticate, AuthRequest, requireAdmin } from '../utils/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// 所有管理员路由都需要认证和管理员权限
router.use(authenticate);
router.use(requireAdmin);

// 获取所有订单
router.get('/orders', async (req: AuthRequest, res) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
          orderItems: {
            include: {
              product: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: '获取订单列表失败', error: error.message });
  }
});

// 更新订单状态
router.put('/orders/:id/status', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = z
      .object({
        status: z.nativeEnum(OrderStatus),
      })
      .parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    // 如果取消订单，恢复库存
    if (status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: id },
      });

      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json({ message: '订单状态已更新', order: updatedOrder });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: '验证失败',
        errors: error.errors,
      });
    }
    res.status(500).json({ message: '更新订单状态失败', error: error.message });
  }
});

// 获取所有用户
router.get('/users', async (req: AuthRequest, res) => {
  try {
    const { page = '1', limit = '20', search } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search as string } },
        { username: { contains: search as string } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: '获取用户列表失败', error: error.message });
  }
});

// 获取用户详情（包括日志）
router.get('/users/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 获取用户订单
    const orders = await prisma.order.findMany({
      where: { userId: id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 获取用户行为日志
    const logs = await prisma.userLog.findMany({
      where: { userId: id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // 限制返回最近100条
    });

    res.json({
      user,
      orders,
      logs,
    });
  } catch (error: any) {
    res.status(500).json({ message: '获取用户详情失败', error: error.message });
  }
});

// 获取销售统计
router.get('/statistics', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate as string);
    }

    // 总销售额
    const totalSales = await prisma.order.aggregate({
      where: {
        ...dateFilter,
        status: {
          in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.COMPLETED],
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // 订单统计
    const orderStats = await prisma.order.groupBy({
      by: ['status'],
      where: dateFilter,
      _count: {
        id: true,
      },
    });

    // 商品销售统计
    const productStats = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          ...dateFilter,
          status: {
            in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.COMPLETED],
          },
        },
      },
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    // 获取商品详情
    const productIds = productStats.map((s) => s.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    const productStatsWithDetails = productStats.map((stat) => {
      const product = products.find((p) => p.id === stat.productId);
      return {
        ...stat,
        product,
        totalRevenue: (product?.price || 0) * (stat._sum.quantity || 0),
      };
    });

    // 按日期统计（最近30天）
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total_amount) as total_revenue
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND status IN ('PAID', 'SHIPPED', 'COMPLETED')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    res.json({
      totalSales: totalSales._sum.totalAmount || 0,
      orderStats,
      topProducts: productStatsWithDetails,
      dailyStats,
    });
  } catch (error: any) {
    res.status(500).json({ message: '获取统计信息失败', error: error.message });
  }
});

export default router;

