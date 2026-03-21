import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Calendar, User, Flag, Package, Layout, List as ListIcon, Search, ExternalLink } from 'lucide-react';

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

type ViewMode = 'KANBAN' | 'LIST';

export default function RoadmapPage() {
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('KANBAN');
  
  // Filters
  const [filterProduct, setFilterProduct] = useState('ALL');
  const [filterUser, setFilterUser] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const load = () => {
    api.get('/roadmap').then((r) => setItems(r.data));
    api.get('/products').then((r) => setProducts(r.data));
    api.get('/users').then((r) => setUsers(r.data));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/roadmap/${id}`, { status });
    load();
  };

  const filtered = items.filter((i) => {
    if (filterProduct !== 'ALL' && i.productId !== filterProduct) return false;
    if (filterUser !== 'ALL' && i.assigneeId?.toString() !== filterUser) return false;
    if (searchTerm && !i.title.toLowerCase().includes(searchTerm.toLowerCase()) && !i.identifier?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">Roadmap Global</h1>
          <p className="text-slate-500 text-[11px]">Visão consolidada de todas as atividades e evolução</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setViewMode('KANBAN')} className={`p-1.5 rounded-md transition-all ${viewMode === 'KANBAN' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}>
              <Layout size={18} />
            </button>
            <button onClick={() => setViewMode('LIST')} className={`p-1.5 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}>
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por título ou ID..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
        >
          <option value="ALL">Todos os Produtos</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <select 
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
        >
          <option value="ALL">Todos os Usuários</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-auto">
          {filtered.length} Atividades
        </div>
      </div>

      {viewMode === 'KANBAN' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {Object.entries(STATUS_LABELS).map(([key, label]) => {
            const columnItems = filtered.filter(i => i.status === key);
            return (
              <div key={key} className="flex flex-col bg-slate-50/50 rounded-xl p-2 border border-slate-100 min-h-[500px]">
                <div className={`flex items-center justify-between px-2 mb-2 border-l-4 ${key === 'DONE' ? 'border-green-500' : key === 'IN_PROGRESS' ? 'border-blue-500' : key === 'BLOCKED' ? 'border-red-500' : 'border-slate-300'}`}>
                  <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{label}</h4>
                  <span className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.5 rounded-full font-bold">{columnItems.length}</span>
                </div>
                
                <div className="space-y-3">
                  {columnItems.map(item => (
                    <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-primary-400 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-mono text-slate-400 uppercase">{item.identifier || 'Task'}</span>
                        <div className="flex gap-1">
                          <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${EFFORT_COLORS[item.effort]}`}>{item.effort}</span>
                        </div>
                      </div>
                      
                      <h5 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-1 leading-tight">{item.title}</h5>
                      
                      {item.completion > 0 && (
                        <div className="mb-2">
                          <div className="flex justify-between items-center text-[9px] font-bold text-primary-600 mb-0.5">
                            <span>EVOLUÇÃO</span>
                            <span>{item.completion}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div className="bg-primary-500 h-full rounded-full transition-all" style={{ width: `${item.completion}%` }} />
                          </div>
                        </div>
                      )}

                      {item.riskPoint && (
                        <div className="mb-2 p-1 bg-red-50 rounded border border-red-100 text-[10px] text-red-600 line-clamp-2">
                          <Flag size={10} className="inline mr-1" /> {item.riskPoint}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-[10px] text-primary-600 font-bold mb-3">
                        <Package size={10} />
                        <span className="truncate">{item.product?.name}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-1">
                          {item.assignee ? (
                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[8px]" title={item.assignee.name}>
                              {item.assignee.name.charAt(0)}
                            </div>
                          ) : <User size={12} className="text-slate-300" />}
                          <span className="text-[10px] text-slate-400">
                            {item.plannedDate ? new Date(item.plannedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—'}
                          </span>
                        </div>
                        {item.confluenceUrl && <ExternalLink size={10} className="text-slate-300 group-hover:text-primary-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Produto</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Atividade</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Usuário</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data Prevista</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded bg-primary-50 flex items-center justify-center text-primary-600">
                          <Package size={14} />
                       </div>
                       <span className="font-semibold text-slate-700">{item.product?.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-slate-400 uppercase leading-none">{item.identifier || '—'}</span>
                      <span className="font-medium text-slate-900 leading-tight">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-xs">
                    {item.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                          {item.assignee.name.charAt(0)}
                        </div>
                        <span className="text-slate-600">{item.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300">Não atribuído</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                      className={`text-[10px] px-2 py-0.5 rounded font-bold border-0 outline-none cursor-pointer ${STATUS_COLORS[item.status]}`}
                    >
                      {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-1.5">
                    <div className="flex items-center gap-2 text-slate-600 text-xs">
                      <Calendar size={12} className="text-slate-400" />
                      <span>{item.plannedDate ? new Date(item.plannedDate).toLocaleDateString('pt-BR') : '—'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-20 bg-slate-50/50">
              <Search size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 text-sm font-medium">Nenhuma atividade encontrada com os filtros atuais</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
