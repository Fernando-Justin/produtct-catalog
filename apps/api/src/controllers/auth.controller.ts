import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const authController = {
  googleCallback: (req: Request, res: Response) => {
    const user = req.user as any;
    if (!user) return res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${token}`);
  },

  me: async (req: AuthRequest, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: { role: true, squad: true },
      });
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  },
};
