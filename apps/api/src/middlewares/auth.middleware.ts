import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user: { id: number; email: string; name: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: number; email: string; name: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};
