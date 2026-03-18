import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import passport from '../config/passport';
import { authController } from '../controllers/auth.controller';
import {
  productController, squadController, userController,
  roleController, roadmapController, dashboardController
} from '../controllers/product.controller';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/database';
import { env } from '../config/env';

const router = Router();

// Utilitário para garantir tipagem correta nas rotas autenticadas
const asAuth = (fn: (req: AuthRequest, res: Response, next: NextFunction) => any): RequestHandler => fn as any;

// ─── AUTH ───────────────────────────────────────────

// Login local para desenvolvimento (sem Google OAuth)
router.post('/auth/dev-login', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      res.status(400).json({ error: 'Nome e e-mail são obrigatórios' });
      return;
    }
    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name },
    });
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user });
  } catch (e: any) {
    console.error('❌ Erro no dev-login:', e.message);
    res.status(500).json({ error: 'Erro ao fazer login', detail: e.message });
  }
});

// Google OAuth (so ativo se credenciais estiverem no .env)
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'], session: false }));
  router.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    authController.googleCallback
  );
}

router.get('/auth/me', authMiddleware, asAuth(authController.me));

// ─── DASHBOARD ──────────────────────────────────────
router.get('/dashboard/stats', authMiddleware, asAuth(dashboardController.stats));

// ─── PRODUTOS ───────────────────────────────────────
router.get('/products', authMiddleware, asAuth(productController.list));
router.get('/products/:id', authMiddleware, asAuth(productController.get));
router.post('/products', authMiddleware, asAuth(productController.create));
router.put('/products/:id', authMiddleware, asAuth(productController.update));
router.delete('/products/:id', authMiddleware, asAuth(productController.delete));

router.post('/products/:productId/devs', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.body.userId);
    if (isNaN(userId)) return res.status(400).json({ error: 'User ID inválido' });
    const dev = await prisma.productDev.create({ data: { productId: req.params.productId, userId, isLead: req.body.isLead } });
    res.status(201).json(dev);
  } catch (e: any) {
    res.status(500).json({ error: 'Erro ao adicionar dev', detail: e.message });
  }
}));
router.delete('/products/:productId/devs/:userId', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  try {
    await prisma.productDev.deleteMany({ 
      where: { 
        productId: req.params.productId, 
        userId: parseInt(req.params.userId)
      } 
    });
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ error: 'Erro ao remover dev', detail: e.message });
  }
}));

router.post('/products/:productId/stacks', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  const stack = await prisma.productStack.create({ data: { productId: req.params.productId, ...req.body } });
  res.status(201).json(stack);
}));
router.delete('/products/:productId/stacks/:id', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  await prisma.productStack.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

router.put('/products/:productId/environments/:envName', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  const data = await prisma.productEnvironment.upsert({
    where: { productId_environment: { productId: req.params.productId, environment: req.params.envName as any } },
    update: req.body,
    create: { productId: req.params.productId, environment: req.params.envName as any, ...req.body },
  });
  res.json(data);
}));

router.post('/products/:productId/links', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  const link = await prisma.productLink.create({ data: { productId: req.params.productId, ...req.body } });
  res.status(201).json(link);
}));
router.delete('/products/:productId/links/:id', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  await prisma.productLink.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

router.get('/products/:productId/clients', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  const clients = await prisma.client.findMany({ where: { productId: req.params.productId }, include: { suggestions: true } });
  res.json(clients);
}));
router.post('/products/:productId/clients', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  const client = await prisma.client.create({ data: { productId: req.params.productId, ...req.body } });
  res.status(201).json(client);
}));
router.put('/products/:productId/clients/:id', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  const client = await prisma.client.update({ where: { id: req.params.id }, data: req.body });
  res.json(client);
}));
router.delete('/products/:productId/clients/:id', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  await prisma.client.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

router.post('/clients/:clientId/suggestions', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  const sug = await prisma.clientSuggestion.create({ data: { clientId: req.params.clientId, ...req.body } });
  res.status(201).json(sug);
}));
router.put('/suggestions/:id', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  const sug = await prisma.clientSuggestion.update({ where: { id: req.params.id }, data: req.body });
  res.json(sug);
}));
router.delete('/suggestions/:id', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  await prisma.clientSuggestion.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

// ─── APPS ───────────────────────────────────────────
router.get('/products/:productId/apps', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  const apps = await prisma.app.findMany({
    where: { productId: req.params.productId },
    include: { stacks: true, environments: true, links: true },
  });
  res.json(apps);
}));
router.post('/products/:productId/apps', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  const app = await prisma.app.create({ data: { productId: req.params.productId, ...req.body } });
  res.status(201).json(app);
}));
router.put('/apps/:id', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  const app = await prisma.app.update({ where: { id: req.params.id }, data: req.body });
  res.json(app);
}));
router.delete('/apps/:id', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  await prisma.app.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

router.put('/apps/:appId/environments/:envName', authMiddleware, asAuth(async (req: AuthRequest, res: Response) => {
  const data = await prisma.appEnvironment.upsert({
    where: { appId_environment: { appId: req.params.appId, environment: req.params.envName as any } },
    update: req.body,
    create: { appId: req.params.appId, environment: req.params.envName as any, ...req.body },
  });
  res.json(data);
}));

// ─── ROADMAP ────────────────────────────────────────
router.get('/roadmap', authMiddleware, asAuth(roadmapController.listAll));
router.get('/products/:productId/roadmap', authMiddleware, asAuth(roadmapController.list));
router.post('/roadmap', authMiddleware, asAuth(roadmapController.create));
router.put('/roadmap/:id', authMiddleware, asAuth(roadmapController.update));
router.delete('/roadmap/:id', authMiddleware, asAuth(roadmapController.delete));

// ─── SQUADS ─────────────────────────────────────────
router.get('/squads', authMiddleware, asAuth(squadController.list));
router.post('/squads', authMiddleware, asAuth(squadController.create));
router.put('/squads/:id', authMiddleware, asAuth(squadController.update));
router.delete('/squads/:id', authMiddleware, asAuth(squadController.delete));

// ─── USUÁRIOS ───────────────────────────────────────
router.get('/users', authMiddleware, asAuth(userController.list));
router.post('/users', authMiddleware, asAuth(userController.create));
router.put('/users/:id', authMiddleware, asAuth(userController.update));
router.delete('/users/:id', authMiddleware, asAuth(userController.delete));

// ─── CARGOS ─────────────────────────────────────────
router.get('/roles', authMiddleware, asAuth(roleController.list));
router.post('/roles', authMiddleware, asAuth(roleController.create));
router.put('/roles/:id', authMiddleware, asAuth(roleController.update));
router.delete('/roles/:id', authMiddleware, asAuth(roleController.delete));

export default router;
