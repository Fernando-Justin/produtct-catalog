import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Package, Boxes, Users, UserCheck, GitBranch, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Stats {
  totalProducts: number;
  totalApps: number;
  totalDevs: number;
  totalClients: number;
  statusCounts: { status: string; _count: number }[];
  effortCounts: { effort: string; _count: number }[];
  stackCounts: { stack: string; _count: number }[];
  roadmapByProduct: { name: string; count: number }[];
  roadmapByUser: { name: string; count: number }[];
  deadlines?: { overdue: number; soon: number; future: number };
}

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: '#94a3b8', IN_PROGRESS: '#3b82f6', BLOCKED: '#ef4444', DONE: '#22c55e',
};
const STATUS_LABELS: Record<string, string> = {
  BACKLOG: 'Backlog', IN_PROGRESS: 'Em Progresso', BLOCKED: 'Bloqueado', DONE: 'Concluído',
};
const EFFORT_COLORS = ['#e2e8f0', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6'];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/dashboard/stats').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Produtos', value: stats?.totalProducts ?? 0, icon: Package, color: 'bg-blue-500' },
    { label: 'Aplicações', value: stats?.totalApps ?? 0, icon: Boxes, color: 'bg-purple-500' },
    { label: 'Devs', value: stats?.totalDevs ?? 0, icon: Users, color: 'bg-green-500' },
    { label: 'Clientes', value: stats?.totalClients ?? 0, icon: UserCheck, color: 'bg-orange-500' },
  ];

  const statusData = (stats?.statusCounts || []).map((s) => ({
    name: STATUS_LABELS[s.status] || s.status,
    value: s._count,
    color: STATUS_COLORS[s.status] || '#94a3b8',
  }));

  const effortData = (stats?.effortCounts || []).map((e, i) => ({
    name: e.effort,
    value: e._count,
    fill: EFFORT_COLORS[i % EFFORT_COLORS.length],
  }));

  const stackData = (stats?.stackCounts || [])
    .sort((a, b) => b._count - a._count)
    .slice(0, 8)
    .map((s) => ({ name: s.stack, qtd: s._count }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Visão geral do catálogo de produtos</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className={`${color} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <GitBranch size={14} /> Status das Atividades
          </h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">Sem dados</div>
          )}
          <div className="flex flex-wrap gap-3 mt-2">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </div>

        {/* Esforço */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Clock size={14} /> Atividades por Esforço
          </h2>
          {effortData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={effortData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {effortData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">Sem dados</div>
          )}
        </div>
      </div>

      {/* Charts Row 2 - Roadmap Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Atividades por Produto */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Package size={14} /> Entregas por Produto
          </h2>
          {stats?.roadmapByProduct && stats.roadmapByProduct.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.roadmapByProduct} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">Sem dados</div>
          )}
        </div>

        {/* Atividades por Usuário */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Users size={14} /> Entregas por Usuário
          </h2>
          {stats?.roadmapByUser && stats.roadmapByUser.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.roadmapByUser}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">Sem dados</div>
          )}
        </div>
      </div>

      {/* Prazos / Deadlines */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Clock size={16} className="text-red-500" /> Próximos Prazos (Pendentes)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-100 rounded-lg p-5 flex flex-col items-center text-center">
            <p className="text-3xl font-bold text-red-600">{stats?.deadlines?.overdue ?? 0}</p>
            <p className="text-xs text-red-500 font-bold uppercase tracking-wider mt-1">Atrasadas</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-5 flex flex-col items-center text-center">
            <p className="text-3xl font-bold text-amber-600">{stats?.deadlines?.soon ?? 0}</p>
            <p className="text-xs text-amber-500 font-bold uppercase tracking-wider mt-1">Vencendo nos prx. 7 dias</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 flex flex-col items-center text-center">
            <p className="text-3xl font-bold text-blue-600">{stats?.deadlines?.future ?? 0}</p>
            <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mt-1">Dentro do Prazo (Futuras)</p>
          </div>
        </div>
      </div>

      {/* Stacks */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Boxes size={14} /> Tecnologias mais utilizadas
        </h2>
        {stackData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stackData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="qtd" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">Sem dados de stack</div>
        )}
      </div>
    </div>
  );
}
