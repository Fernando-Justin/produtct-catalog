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
        include: { assignee: true, project: true },
        orderBy: { order: 'asc' },
      });
      res.json(items);
    } catch (e: any) {
      res.status(500).json({ error: 'Erro ao listar roadmap', detail: e.message });
    }
  },
  listAll: async (req: AuthRequest, res: Response) => {
    try {
      const { projectId, status, assigneeId } = req.query;
      const where: any = {};
      if (projectId && projectId !== 'ALL') where.projectId = projectId;
      if (status && status !== 'ALL') where.status = status;
      if (assigneeId && assigneeId !== 'ALL') where.assigneeId = parseInt(assigneeId as string);

      const items = await prisma.roadmapItem.findMany({
        where,
        include: { assignee: true, product: true, project: true },
        orderBy: [
          { product: { name: 'asc' } },
          { title: 'asc' }
        ],
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
      if (data.startDateAtividade) data.startDateAtividade = new Date(data.startDateAtividade);
      if (data.finishDateAtividade) data.finishDateAtividade = new Date(data.finishDateAtividade);
      if (data.completion !== undefined) data.completion = parseInt(data.completion);

      // Business Rule: Set finishDateAtividade if DONE and not provided
      if (data.status === 'DONE' && !data.finishDateAtividade) {
        data.finishDateAtividade = new Date();
      }
      
      const item = await prisma.roadmapItem.create({ data, include: { assignee: true, project: true } });
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
      if (data.startDateAtividade) data.startDateAtividade = new Date(data.startDateAtividade);
      if (data.finishDateAtividade) data.finishDateAtividade = new Date(data.finishDateAtividade);
      if (data.completion !== undefined) data.completion = parseInt(data.completion);

      // Business Rule: Set finishDateAtividade if DONE and not provided
      if (data.status === 'DONE' && !data.finishDateAtividade) {
        data.finishDateAtividade = new Date();
      }
      
      const item = await prisma.roadmapItem.update({ where: { id: req.params.id }, data, include: { assignee: true, project: true } });
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
  importItems: async (req: AuthRequest, res: Response) => {
    try {
      const { items } = req.body;
      const results = { created: 0, updated: 0, errors: [] as any[] };

      for (const item of items) {
        try {
          let product = await prisma.product.findFirst({
            where: { name: { equals: item.productName, mode: 'insensitive' } }
          });
          if (!product) {
            product = await prisma.product.create({
              data: { name: item.productName, status: 'PLANEJADO' }
            });
          }

          let assigneeId: number | null = null;
          if (item.assigneeEmail) {
            let user = await prisma.user.findUnique({ where: { email: item.assigneeEmail } });
            if (!user) {
              const nameFromEmail = item.assigneeEmail.split('@')[0].replace(/\./g, ' ');
              user = await prisma.user.create({
                data: { name: nameFromEmail, email: item.assigneeEmail, status: 'ATIVO' }
              });
            }
            assigneeId = user.id;
          }

          let projectId: string | null = null;
          if (item.projectName) {
            let project = await prisma.project.findFirst({
              where: { name: { equals: item.projectName, mode: 'insensitive' } }
            });
            if (!project) {
              const defaultPo = await prisma.user.findFirst({ where: { role: { type: 'PO' } } });
              const poId = defaultPo?.id || 1;
              project = await prisma.project.create({
                data: {
                  name: item.projectName,
                  status: 'PLANEJADO',
                  poId,
                  startDate: new Date(),
                  forecastDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
              });
            }
            projectId = project.id;
          }

          const data: any = {
            title: item.title,
            description: item.description || null,
            status: (item.status || 'BACKLOG').toUpperCase(),
            effort: (item.effort || 'M').toUpperCase(),
            plannedDate: item.plannedDate ? new Date(item.plannedDate) : null,
            completion: parseInt(item.completion) || 0,
            riskPoint: item.riskPoint || null,
            identifier: item.identifier || null,
            confluenceUrl: item.confluenceUrl || null,
            productId: product.id,
            projectId,
            assigneeId,
          };

          if (item.identifier) {
            const existing = await prisma.roadmapItem.findFirst({ where: { identifier: item.identifier } });
            if (existing) {
              await prisma.roadmapItem.update({ where: { id: existing.id }, data });
              results.updated++;
              continue;
            }
          }

          await prisma.roadmapItem.create({ data });
          results.created++;
        } catch (e: any) {
          results.errors.push({ item: item.title || item.identifier, error: e.message });
        }
      }
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: 'Erro ao importar itens', detail: e.message });
    }
  },

  importItemsFromXlsx: async (req: AuthRequest, res: Response) => {
    try {
      const { items } = req.body;
      const results = { created: 0, updated: 0, errors: [] as any[] };

      for (const item of items) {
        try {
          let product = await prisma.product.findFirst({
            where: { name: { equals: item.board, mode: 'insensitive' } }
          });
          if (!product) {
            product = await prisma.product.create({
              data: { name: item.board, status: 'PLANEJADO' }
            });
          }

          let assigneeId: number | null = null;
          if (item.responsaveis) {
            let user = await prisma.user.findFirst({
              where: { name: { equals: item.responsaveis, mode: 'insensitive' } }
            });
            if (!user) {
              const emailGenerated = item.responsaveis.toLowerCase().replace(/\s+/g, '.') + '@imported.local';
              user = await prisma.user.create({
                data: { name: item.responsaveis, email: emailGenerated, status: 'ATIVO' }
              });
            }
            assigneeId = user.id;
          }

          let projectId: string | null = null;
          if (item.raiaAtual) {
            let project = await prisma.project.findFirst({
              where: { name: { equals: item.raiaAtual, mode: 'insensitive' } }
            });
            if (!project) {
              const defaultPo = await prisma.user.findFirst({ where: { role: { type: 'PO' } } });
              const poId = defaultPo?.id || 1;
              project = await prisma.project.create({
                data: {
                  name: item.raiaAtual,
                  status: 'PLANEJADO',
                  poId,
                  startDate: new Date(),
                  forecastDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
              });
            }
            projectId = project.id;
          }

          const data: any = {
            title: item.tarefa || item.title || 'Untitled',
            description: item.descricao || item.descrição || item.description || null,
            status: (item.status || 'BACKLOG').toUpperCase(),
            effort: (item.esforco || item.esforço || item.effort || 'M').toUpperCase(),
            plannedDate: item.dataPrevista || item.data_prevista || item.plannedDate ? new Date(item.dataPrevista || item.data_prevista || item.plannedDate) : null,
            startDateAtividade: item.dataInicio || item.data_inicio || item.startDateAtividade ? new Date(item.dataInicio || item.data_inicio || item.startDateAtividade) : null,
            finishDateAtividade: item.dataFim || item.data_fim || item.finishDateAtividade ? new Date(item.dataFim || item.data_fim || item.finishDateAtividade) : null,
            completion: parseInt(item.conclusao || item.conclusão || item.completion) || 0,
            riskPoint: item.risco || item.riskPoint || null,
            identifier: item.identificador || item.id || item.identifier || null,
            confluenceUrl: item.confluenceUrl || null,
            productId: product.id,
            projectId,
            assigneeId,
          };

          if (data.status && !['BACKLOG', 'IN_PROGRESS', 'BLOCKED', 'HOMOLOGATION', 'DONE', 'ARCHIVED'].includes(data.status)) {
            data.status = 'BACKLOG';
          }
          if (data.effort && !['PP', 'P', 'M', 'G', 'GG'].includes(data.effort)) {
            data.effort = 'M';
          }

          if (item.identificador || item.id || item.identifier) {
            const existing = await prisma.roadmapItem.findFirst({ where: { identifier: data.identifier } });
            if (existing) {
              await prisma.roadmapItem.update({ where: { id: existing.id }, data });
              results.updated++;
              continue;
            }
          }

          await prisma.roadmapItem.create({ data });
          results.created++;
        } catch (e: any) {
          results.errors.push({ item: item.tarefa || item.title || item.id, error: e.message });
        }
      }
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: 'Erro ao importar itens do XLSX', detail: e.message });
    }
  },
};

// ─── PROJECTS ───────────────────────────────────────

export const projectController = {
  list: async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.query;
      const where: any = {};
      if (status && status !== 'ALL') where.status = status;

      const projects = await prisma.project.findMany({
        where,
        include: {
          po: true,
          roadmapItems: {
            select: { status: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const projectsWithCompletion = projects.map((p: any) => {
        const total = p.roadmapItems.length;
        const done = p.roadmapItems.filter((i: any) => i.status === 'DONE').length;
        const completion = total > 0 ? Math.round((done / total) * 100) : 0;
        
        const { roadmapItems, ...projData } = p;
        return { ...projData, completion };
      });


      res.json(projectsWithCompletion);
    } catch (e: any) {
      res.status(500).json({ error: 'Erro ao listar projetos', detail: e.message });
    }
  },

  get: async (req: AuthRequest, res: Response) => {
    try {
      const project = await prisma.project.findUnique({
        where: { id: req.params.id },
        include: {
          po: true,
          roadmapItems: {
            include: { assignee: true, product: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });

      const total = project.roadmapItems.length;
      const done = project.roadmapItems.filter((i: any) => i.status === 'DONE').length;
      const completion = total > 0 ? Math.round((done / total) * 100) : 0;


      res.json({ ...project, completion });
    } catch (e: any) {
      res.status(500).json({ error: 'Erro ao buscar projeto', detail: e.message });
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    try {
      const data = { ...req.body };
      if (data.poId) data.poId = parseInt(data.poId);
      if (data.startDate) data.startDate = new Date(data.startDate);
      if (data.forecastDate) data.forecastDate = new Date(data.forecastDate);
      if (data.finishDate) data.finishDate = new Date(data.finishDate);

      // Business Rule: finishDate logically tied to status FINALIZADO
      if (data.status === 'FINALIZADO' && !data.finishDate) {
        data.finishDate = new Date();
      }

      const project = await prisma.project.create({ data, include: { po: true } });
      res.status(201).json(project);
    } catch (e: any) {
      res.status(500).json({ error: 'Erro ao criar projeto', detail: e.message });
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    try {
      const { 
        id, createdAt, updatedAt, 
        po, roadmapItems, completion, ...rest 
      } = req.body;
      
      const data = { ...rest };
      if (data.poId) data.poId = parseInt(data.poId);
      if (data.startDate) data.startDate = new Date(data.startDate);
      if (data.forecastDate) data.forecastDate = new Date(data.forecastDate);
      if (data.finishDate) data.finishDate = new Date(data.finishDate);

      // Business Rule: finishDate logically tied to status FINALIZADO
      if (data.status === 'FINALIZADO' && !data.finishDate) {
        data.finishDate = new Date();
      } else if (data.status && data.status !== 'FINALIZADO') {
        data.finishDate = null;
      }


      const project = await prisma.project.update({ 
        where: { id: req.params.id }, 
        data,
        include: { po: true }
      });
      res.json(project);
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ error: 'Projeto não encontrado' });
      res.status(500).json({ error: 'Erro ao atualizar projeto', detail: e.message });
    }
  },

  delete: async (req: AuthRequest, res: Response) => {
    try {
      // Check for attached activities
      const count = await prisma.roadmapItem.count({ where: { projectId: req.params.id } });
      if (count > 0) {
        return res.status(409).json({ error: 'Não é possível excluir o projeto pois existem atividades vinculadas a ele.' });
      }

      await prisma.project.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ error: 'Projeto não encontrado' });
      res.status(500).json({ error: 'Erro ao deletar projeto', detail: e.message });
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
