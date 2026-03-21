import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

// ─── PRODUCTS ───────────────────────────────────────

export const productController = {
  list: async (_req: AuthRequest, res: Response) => {
    try {
      const products = await prisma.product.findMany({
        include: {
          squad: true,
          stacks: true,
          devs: { include: { user: true } },
          _count: { select: { apps: true, clients: true, roadmapItems: true } },
        },
        orderBy: { name: 'asc' },
      });
      res.json(products);
    } catch (e: any) {
      res.status(500).json({ error: 'Erro ao listar produtos', detail: e.message });
    }
  },

  get: async (req: AuthRequest, res: Response) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: req.params.id },
        include: {
          squad: true,
          stacks: true,
          devs: { include: { user: { include: { role: true } } } },
          apps: { include: { stacks: true, environments: true, links: true } },
          clients: { include: { suggestions: true } },
          environments: true,
          databases: true,
          links: true,
          roadmapItems: { include: { assignee: true }, orderBy: { order: 'asc' } },
        },
      });
      if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
      res.json(product);
    } catch (e: any) {
      res.status(500).json({ error: 'Erro ao buscar produto', detail: e.message });
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    try {
      const product = await prisma.product.create({ data: req.body });
      res.status(201).json(product);
    } catch (e: any) {
      res.status(500).json({ error: 'Erro ao criar produto', detail: e.message });
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    try {
      const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
      res.json(product);
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ error: 'Produto não encontrado' });
      res.status(500).json({ error: 'Erro ao atualizar produto', detail: e.message });
    }
  },

  delete: async (req: AuthRequest, res: Response) => {
    try {
      await prisma.product.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ error: 'Produto não encontrado' });
      res.status(500).json({ error: 'Erro ao deletar produto', detail: e.message });
    }
  },
};

// ─── SQUADS ─────────────────────────────────────────

export const squadController = {
  list: async (_req: AuthRequest, res: Response) => {
    try {
      const squads = await prisma.squad.findMany({ include: { users: true, _count: { select: { products: true } } }, orderBy: { name: 'asc' } });
      res.json(squads);
    } catch (e: any) {
      res.status(500).json({ error: 'Erro ao listar squads', detail: e.message });
    }
  },
  create: async (req: AuthRequest, res: Response) => {
    try {
      const squad = await prisma.squad.create({ data: req.body });
      res.status(201).json(squad);
    } catch (e: any) {
      if (e.code === 'P2002') return res.status(409).json({ error: 'Squad com esse nome já existe' });
      res.status(500).json({ error: 'Erro ao criar squad', detail: e.message });
    }
  },
  update: async (req: AuthRequest, res: Response) => {
    try {
      const squad = await prisma.squad.update({ where: { id: req.params.id }, data: req.body });
      res.json(squad);
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ error: 'Squad não encontrada' });
      if (e.code === 'P2002') return res.status(409).json({ error: 'Squad com esse nome já existe' });
      res.status(500).json({ error: 'Erro ao atualizar squad', detail: e.message });
    }
  },
  delete: async (req: AuthRequest, res: Response) => {
    try {
      await prisma.squad.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ error: 'Squad não encontrada' });
      if (e.code === 'P2003') return res.status(409).json({ error: 'Squad possui registros vinculados' });
      res.status(500).json({ error: 'Erro ao deletar squad', detail: e.message });
    }
  },
};

// ─── USERS ──────────────────────────────────────────

export const userController = {
  list: async (_req: AuthRequest, res: Response) => {
    try {
      const users = await prisma.user.findMany({ include: { role: true, squad: true }, orderBy: { name: 'asc' } });
      res.json(users);
    } catch (e: any) {
      res.status(500).json({ error: 'Erro ao listar usuários', detail: e.message });
    }
  },
  create: async (req: AuthRequest, res: Response) => {
    try {
      const data = { ...req.body };
      if (data.admissionDate) data.admissionDate = new Date(data.admissionDate);
      if (data.roleId === '') data.roleId = null;
      if (data.squadId === '') data.squadId = null;
      
      const user = await prisma.user.create({ data, include: { role: true, squad: true } });
      res.status(201).json(user);
    } catch (e: any) {
      if (e.code === 'P2002') return res.status(409).json({ error: 'Usuário com esse e-mail já existe' });
      res.status(500).json({ error: 'Erro ao criar usuário', detail: e.message });
    }
  },
  update: async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
      const data = { ...req.body };
      if (data.admissionDate) data.admissionDate = new Date(data.admissionDate);
      // Limpar campos vazios para não enviar string vazia ao Prisma
      for (const key of Object.keys(data)) {
        if (data[key] === '') data[key] = null;
      }
      const user = await prisma.user.update({ where: { id }, data, include: { role: true, squad: true } });
      res.json(user);
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ error: 'Usuário não encontrado' });
      if (e.code === 'P2002') return res.status(409).json({ error: 'Usuário com esse e-mail já existe' });
      res.status(500).json({ error: 'Erro ao atualizar usuário', detail: e.message });
    }
  },
  delete: async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
      await prisma.user.delete({ where: { id } });
      res.status(204).send();
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ error: 'Usuário não encontrado' });
      if (e.code === 'P2003') return res.status(409).json({ error: 'Usuário possui registros vinculados' });
      res.status(500).json({ error: 'Erro ao deletar usuário', detail: e.message });
    }
  },
};

// ─── ROLES ──────────────────────────────────────────

export const roleController = {
  list: async (_req: AuthRequest, res: Response) => {
    try {
      const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } });
      res.json(roles);
    } catch (e: any) {
      res.status(500).json({ error: 'Erro ao listar cargos', detail: e.message });
    }
  },
  create: async (req: AuthRequest, res: Response) => {
    try {
      const role = await prisma.role.create({ data: req.body });
      res.status(201).json(role);
    } catch (e: any) {
      if (e.code === 'P2002') return res.status(409).json({ error: 'Cargo com esse nome já existe' });
      res.status(500).json({ error: 'Erro ao criar cargo', detail: e.message });
    }
  },
  update: async (req: AuthRequest, res: Response) => {
    try {
      const role = await prisma.role.update({ where: { id: req.params.id }, data: req.body });
      res.json(role);
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ error: 'Cargo não encontrado' });
      if (e.code === 'P2002') return res.status(409).json({ error: 'Cargo com esse nome já existe' });
      res.status(500).json({ error: 'Erro ao atualizar cargo', detail: e.message });
    }
  },
  delete: async (req: AuthRequest, res: Response) => {
    try {
      await prisma.role.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ error: 'Cargo não encontrado' });
      if (e.code === 'P2003') return res.status(409).json({ error: 'Cargo possui usuários vinculados' });
      res.status(500).json({ error: 'Erro ao deletar cargo', detail: e.message });
    }
  },
};

// ─── ROADMAP ────────────────────────────────────────

export const roadmapController = {
  list: async (req: AuthRequest, res: Response) => {
    try {
      const items = await prisma.roadmapItem.findMany({
        where: { productId: req.params.productId },
        include: { assignee: true },
        orderBy: { order: 'asc' },
      });
      res.json(items);
    } catch (e: any) {
      res.status(500).json({ error: 'Erro ao listar roadmap', detail: e.message });
    }
  },
  listAll: async (_req: AuthRequest, res: Response) => {
    try {
      const items = await prisma.roadmapItem.findMany({
        include: { assignee: true, product: true },
        orderBy: { plannedDate: 'asc' },
      });
      res.json(items);
    } catch (e: any) {
      res.status(500).json({ error: 'Erro ao listar roadmap', detail: e.message });
    }
  },
  create: async (req: AuthRequest, res: Response) => {
    try {
      const data = { ...req.body };
      if (data.assigneeId) data.assigneeId = parseInt(data.assigneeId);
      if (data.plannedDate) data.plannedDate = new Date(data.plannedDate);
      if (data.completion !== undefined) data.completion = parseInt(data.completion);
      
      const item = await prisma.roadmapItem.create({ data, include: { assignee: true } });
      res.status(201).json(item);
    } catch (e: any) {
      res.status(500).json({ error: 'Erro ao criar item do roadmap', detail: e.message });
    }
  },
  update: async (req: AuthRequest, res: Response) => {
    try {
      const data = { ...req.body };
      if (data.assigneeId) data.assigneeId = parseInt(data.assigneeId);
      if (data.plannedDate) data.plannedDate = new Date(data.plannedDate);
      if (data.completion !== undefined) data.completion = parseInt(data.completion);
      
      const item = await prisma.roadmapItem.update({ where: { id: req.params.id }, data, include: { assignee: true } });
      res.json(item);
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ error: 'Item não encontrado' });
      res.status(500).json({ error: 'Erro ao atualizar item do roadmap', detail: e.message });
    }
  },
  delete: async (req: AuthRequest, res: Response) => {
    try {
      await prisma.roadmapItem.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ error: 'Item não encontrado' });
      res.status(500).json({ error: 'Erro ao deletar item do roadmap', detail: e.message });
    }
  },
};

// ─── DASHBOARD ──────────────────────────────────────

export const dashboardController = {
  stats: async (_req: AuthRequest, res: Response) => {
    try {
      const [totalProducts, totalApps, totalDevs, totalClients, statusCounts, effortCounts, stackCounts, roadmapByProduct, roadmapByUser] = await Promise.all([
        prisma.product.count(),
        prisma.app.count(),
        prisma.user.count(),
        prisma.client.count(),
        prisma.roadmapItem.groupBy({ by: ['status'], _count: true }),
        prisma.roadmapItem.groupBy({ by: ['effort'], _count: true }),
        prisma.productStack.groupBy({ by: ['stack'], _count: true }),
        prisma.roadmapItem.groupBy({ by: ['productId'], _count: true }),
        prisma.roadmapItem.groupBy({ by: ['assigneeId'], _count: true }),
      ]);
      
      const [products, users, roadmapItems] = await Promise.all([
        prisma.product.findMany({ select: { id: true, name: true } }),
        prisma.user.findMany({ select: { id: true, name: true } }),
        prisma.roadmapItem.findMany({ 
          where: { status: { not: 'DONE' }, plannedDate: { not: null } },
          select: { plannedDate: true } 
        }),
      ]);

      const now = new Date();
      const deadlines = {
        overdue: roadmapItems.filter(i => i.plannedDate! < now).length,
        soon: roadmapItems.filter(i => {
          const due = new Date(i.plannedDate!);
          const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff <= 7;
        }).length,
        future: roadmapItems.filter(i => {
          const due = new Date(i.plannedDate!);
          const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return diff > 7;
        }).length,
      };

      res.json({ 
        totalProducts, totalApps, totalDevs, totalClients, 
        statusCounts, effortCounts, stackCounts,
        deadlines,
        roadmapByProduct: roadmapByProduct.map(r => ({ 
          name: products.find(p => p.id === r.productId)?.name || 'Desconhecido', 
          count: r._count 
        })),
        roadmapByUser: roadmapByUser.map(r => ({ 
          name: users.find(u => u.id === r.assigneeId)?.name || 'Não atribuído', 
          count: r._count 
        }))
      });
    } catch (e: any) {
      res.status(500).json({ error: 'Erro ao buscar estatísticas', detail: e.message });
    }
  },
};
