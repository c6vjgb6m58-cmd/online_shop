import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../utils/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// 更新用户信息验证模式
const updateUserSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  email: z.string().email().optional(),
});

// 获取当前用户信息
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
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

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: '获取用户信息失败', error: error.message });
  }
});

// 更新当前用户信息
router.put('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const validatedData = updateUserSchema.parse(req.body);

    // 检查邮箱或用户名是否已被使用
    if (validatedData.email || validatedData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: req.userId! } },
            {
              OR: [
                validatedData.email ? { email: validatedData.email } : {},
                validatedData.username ? { username: validatedData.username } : {},
              ],
            },
          ],
        },
      });

      if (existingUser) {
        return res.status(400).json({
          message:
            existingUser.email === validatedData.email
              ? '邮箱已被使用'
              : '用户名已被使用',
        });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: validatedData,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({ message: '用户信息已更新', user });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: '验证失败',
        errors: error.errors,
      });
    }
    res.status(500).json({ message: '更新用户信息失败', error: error.message });
  }
});

export default router;


