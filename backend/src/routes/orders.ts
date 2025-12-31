import express from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { authenticate, AuthRequest } from '../utils/auth';
import { sendOrderConfirmationEmail } from '../utils/email';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// 创建订单验证模式
const createOrderSchema = z.object({
  shippingName: z.string().min(1, '收货人姓名不能为空'),
  shippingPhone: z.string().min(1, '收货人电话不能为空'),
  shippingAddress: z.string().min(1, '收货地址不能为空'),
  paymentMethod: z.string().optional(),
});

// 创建订单
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);

    // 获取购物车
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.userId! },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: '购物车为空' });
    }

    // 计算总金额并验证库存
    let totalAmount = 0;
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `商品 "${item.product.name}" 库存不足`,
        });
      }
      totalAmount += item.product.price * item.quantity;
    }

    // 创建订单（使用事务）
    const order = await prisma.$transaction(async (tx) => {
      // 创建订单
      const newOrder = await tx.order.create({
        data: {
          userId: req.userId!,
          totalAmount,
          status: OrderStatus.PENDING_PAYMENT,
          ...validatedData,
        },
      });

      // 创建订单项并减少库存
      const orderItems = [];
      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        orderItems.push({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        });
      }

      // 清空购物车
      await tx.cartItem.deleteMany({
        where: { userId: req.userId! },
      });

      return { order: newOrder, orderItems };
    });

    // 记录购买日志
    for (const item of cartItems) {
      await prisma.userLog.create({
        data: {
          userId: req.userId!,
          action: 'PURCHASE',
          productId: item.productId,
          details: { orderId: order.order.id, quantity: item.quantity },
        },
      });
    }

    // 发送确认邮件
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId! },
      });
      if (user) {
        await sendOrderConfirmationEmail(
          user.email,
          order.order.id,
          totalAmount,
          order.orderItems
        );
      }
    } catch (emailError) {
      console.error('发送邮件失败:', emailError);
      // 邮件发送失败不影响订单创建
    }

    res.status(201).json({
      message: '订单创建成功',
      order: order.order,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: '验证失败',
        errors: error.errors,
      });
    }
    res.status(500).json({ message: '创建订单失败', error: error.message });
  }
});

// 模拟支付
router.post('/:id/pay', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: req.userId!,
      },
    });

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      return res.status(400).json({ message: '订单状态不允许支付' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: OrderStatus.PAID },
    });

    res.json({ message: '支付成功', order: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ message: '支付失败', error: error.message });
  }
});

// 获取订单列表
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId! },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error: any) {
    res.status(500).json({ message: '获取订单列表失败', error: error.message });
  }
});

// 获取订单详情
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: req.userId!,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    res.json({ order });
  } catch (error: any) {
    res.status(500).json({ message: '获取订单详情失败', error: error.message });
  }
});

export default router;


