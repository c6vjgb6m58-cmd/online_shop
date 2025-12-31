import express from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateToken, verifyToken } from '../utils/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// 注册验证模式
const registerSchema = z.object({
  email: z.string().email('无效的邮箱地址'),
  username: z.string().min(3, '用户名至少3个字符').max(20, '用户名最多20个字符'),
  password: z.string().min(6, '密码至少6个字符'),
});

// 登录验证模式
const loginSchema = z.object({
  email: z.string().email('无效的邮箱地址'),
  password: z.string().min(1, '密码不能为空'),
});

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, username, password } = validatedData;

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? '邮箱已被注册' : '用户名已被使用',
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    // 生成token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: '注册成功',
      user,
      token,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: '验证失败',
        errors: error.errors,
      });
    }
    res.status(500).json({ message: '注册失败', error: error.message });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    // 生成token
    const token = generateToken(user.id, user.role);

    res.json({
      message: '登录成功',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      token,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: '验证失败',
        errors: error.errors,
      });
    }
    res.status(500).json({ message: '登录失败', error: error.message });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: '无效的认证令牌' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

export default router;

