import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Calendar, User, Flag, Package } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  BLOCKED: 'bg-red-100 text-red-700',
  DONE: 'bg-green-100 text-green-700',
};
const STATUS_LABELS: Record<string, string> = {
  BACKLOG: 'Backlog', IN_PROGRESS: 'Em Progresso', BLOCKED: 'Bloqueado', DONE: 'Concluído',
};
const EFFORT_COLORS: Record<string, string> = {
  PP: 'bg-slate-100 text-slate-600', P: 'bg-blue-50 text-blue-600',
  M: 'bg-amber-50 text-amber-600', G: 'bg-orange-100 text-orange-600', GG: 'bg-red-100 text-red-600',
};

export default function RoadmapPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterProduct, setFilterProduct] = useState('ALL');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    api.get('/roadmap').then((r) => setItems(r.data));
    api.get('/products').then((r) => setProducts(r.data));
  }, []);

  const filtered = items.filter((i) => {
    if (filterStatus !== 'ALL' && i.status !== filterStatus) return false;
    if (filterProduct !== 'ALL' && i.productId !== filterProduct) return false;
    return true;
  });

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/roadmap/${id}`, { status });
    api.get('/roadmap').then((r) => setItems(r.data));
  };

  return (
    <div className="space-y-3">
      <div>
          <h1 className="text-xl font-bold text-slate-900">Roadmap Global</h1>
          <p className="text-slate-500 text-xs">Todas as atividades em andamento e planejadas</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(STATUS_LABELS).map(([k, v]) => {
          const count = items.filter((i) => i.status === k).length;
          return (
            <button key={k} onClick={() => setFilterStatus(filterStatus === k ? 'ALL' : k)}
              className={`bg-white rounded-xl border p-4 text-center transition-all hover:shadow-sm ${filterStatus === k ? 'border-primary-400 shadow-sm' : 'border-slate-200'}`}>
              <p className="text-2xl font-bold text-slate-900">{count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{v}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="ALL">Todos os produtos</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="ALL">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span className="text-sm text-slate-400 self-center">{filtered.length} atividades</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Produto</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Título</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-28">Dev</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-28">Data Prev.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-16">Esforço</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-36">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Package size={11} className="text-primary-400" />
                    <span className="truncate max-w-[120px]">{item.product?.name || '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{item.identifier || '—'}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800 truncate max-w-xs">{item.title}</p>
                  {item.goalIndicator && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Flag size={10} /> {item.goalIndicator}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {item.assignee ? (
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-600">{item.assignee.name.split(' ')[0]}</span>
                    </div>
                  ) : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  {item.plannedDate ? (
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <Calendar size={11} className="text-slate-400" />
                      {new Date(item.plannedDate).toLocaleDateString('pt-BR')}
                    </div>
                  ) : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EFFORT_COLORS[item.effort]}`}>{item.effort}</span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full font-medium border-0 outline-none cursor-pointer ${STATUS_COLORS[item.status]}`}
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">Nenhuma atividade encontrada</div>}
      </div>
    </div>
  );
}
