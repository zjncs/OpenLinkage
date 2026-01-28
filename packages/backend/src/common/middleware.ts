import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ResponseHandler } from './response';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: 'user' | 'doctor' | 'admin';
}

// JWT认证中间件
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return ResponseHandler.unauthorized(res, '缺少认证令牌');
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return ResponseHandler.unauthorized(res, '无效的认证令牌');
  }
}

// 角色验证中间件
export function requireRole(...roles: Array<'user' | 'doctor' | 'admin'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return ResponseHandler.unauthorized(res, '权限不足');
    }
    next();
  };
}

// 错误处理中间件
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);
  ResponseHandler.serverError(res, err.message);
}
