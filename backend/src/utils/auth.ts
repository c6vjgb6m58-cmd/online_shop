import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: UserRole;
}

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 生成JWT token
export function generateToken(userId: string, role: UserRole): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

// 验证JWT token
export function verifyToken(token: string): { userId: string; role: UserRole } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: UserRole };
    return decoded;
  } catch (error) {
    return null;
  }
}

// 认证中间件
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ message: '未提供认证令牌' });
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({ message: '无效的认证令牌' });
      return;
    }

    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      res.status(401).json({ message: '用户不存在' });
      return;
    }

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: '认证失败' });
  }
}

// 管理员权限中间件
export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.userRole !== UserRole.ADMIN) {
    res.status(403).json({ message: '需要管理员权限' });
    return;
  }
  next();
}


