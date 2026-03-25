import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Trash2, Edit2, Calendar, User, Flag, Layout, List as ListIcon, BarChart3, ExternalLink } from 'lucide-react';

interface Props { product: any; onRefresh: () => void; }
const input = 'w-full';

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  BLOCKED: 'bg-red-100 text-red-700',
  DONE: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-slate-200 text-slate-500',
};
const STATUS_LABELS: Record<string, string> = {
  BACKLOG: 'Backlog', IN_PROGRESS: 'Em Progresso', BLOCKED: 'Bloqueado', DONE: 'Concluído', ARCHIVED: 'Arquivado',
};
const EFFORT_LABELS: Record<string, string> = { PP: 'PP', P: 'P', M: 'M', G: 'G', GG: 'GG' };
const EFFORT_COLORS: Record<string, string> = {
  PP: 'bg-slate-100 text-slate-600', P: 'bg-blue-50 text-blue-600',
  M: 'bg-amber-50 text-amber-600', G: 'bg-orange-100 text-orange-600', GG: 'bg-red-100 text-red-600',
};

const emptyForm = { title: '', description: '', goalIndicator: '', startDateAtividade: '', plannedDate: '', effort: 'M', status: 'BACKLOG', assigneeId: '', identifier: '', confluenceUrl: '', completion: 0, riskPoint: '', projectId: '' };

type ViewMode = 'LIST' | 'KANBAN' | 'TIMELINE';

export default function ProductRoadmapTab({ product, onRefresh }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('KANBAN');
  const [showArchived, setShowArchived] = useState(false);

  const load = () => api.get(`/products/${product.id}/roadmap`).then((r) => setItems(r.data));
  useEffect(() => { load(); api.get('/users').then((r) => setUsers(r.data)); api.get('/projetos').then((r) => setProjects(r.data)); }, [product.id]);

  const openNew = () => { setForm({ ...emptyForm }); setEditItem(null); setShowForm(true); };
  const openEdit = (item: any) => {
    setForm({
      title: item.title, description: item.description || '', goalIndicator: item.goalIndicator || '',
      startDateAtividade: item.startDateAtividade ? item.startDateAtividade.slice(0, 10) : '',
      plannedDate: item.plannedDate ? item.plannedDate.slice(0, 10) : '', effort: item.effort,
      status: item.status, assigneeId: item.assigneeId || '', identifier: item.identifier || '',
      confluenceUrl: item.confluenceUrl || '', completion: item.completion || 0, riskPoint: item.riskPoint || '',
      projectId: item.projectId || '',
    });
    setEditItem(item); setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        productId: product.id,
        startDateAtividade: form.startDateAtividade ? new Date(form.startDateAtividade).toISOString() : null,
        plannedDate: form.plannedDate ? new Date(form.plannedDate).toISOString() : null,
        assigneeId: form.assigneeId ? parseInt(form.assigneeId as string) : null,
        projectId: form.projectId || null,
      };
      if (editItem) await api.put(`/roadmap/${editItem.id}`, payload);
      else await api.post('/roadmap', payload);
      setShowForm(false); load();
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir entrega?')) return;
    await api.delete(`/roadmap/${id}`); load();
  };

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/roadmap/${id}`, { status }); load();
  };

  const exportCSV = () => {
    const headers = ['ID', 'Título', 'Desc.', 'Responsável', 'Status', 'Esforço', 'Prazo', 'Ev. %', 'Risco'];
    const rows = filtered.map(i => [
      i.identifier || '',
      i.title,
      i.description || '',
      i.assignee?.name || '',
      STATUS_LABELS[i.status],
      i.effort,
      i.plannedDate ? new Date(i.plannedDate).toLocaleDateString('pt-BR') : '',
      `${i.completion}%`,
      i.riskPoint || ''
    ]);

    const content = [headers, ...rows].map(r => r.map(c => `"${c.toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `delivery_${product.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const filtered = items.filter(item => {
    if (showArchived) return item.status === 'ARCHIVED';
    if (item.status === 'ARCHIVED') return false;
    if (filter !== 'ALL' && item.status !== filter) return false;
    return true;
  });

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-slate-800 text-sm font-semibold">Delivery do Produto</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded">
            <button onClick={() => setViewMode('KANBAN')} className={`p-1 rounded transition-all ${viewMode === 'KANBAN' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}>
              <Layout size={14} />
            </button>
            <button onClick={() => setViewMode('LIST')} className={`p-1 rounded transition-all ${viewMode === 'LIST' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}>
              <ListIcon size={14} />
            </button>
            <button onClick={() => setViewMode('TIMELINE')} className={`p-1 rounded transition-all ${viewMode === 'TIMELINE' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}>
              <BarChart3 size={14} />
            </button>
          </div>

          <label className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold cursor-pointer hover:bg-slate-100 transition-colors">
            <input 
              type="checkbox" 
              checked={showArchived} 
              onChange={(e) => setShowArchived(e.target.checked)}
              className="w-3.5 h-3.5 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
            />
            <span className="text-slate-600 uppercase tracking-tight">Arquivados</span>
          </label>

          <button 
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ExternalLink size={12} /> CSV
          </button>

          <button onClick={openNew} className="bg-primary-600 text-white rounded-lg px-2 py-1 flex items-center gap-1 text-[10px] font-bold">
            <Plus size={14} /> Nova Entrega
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{editItem ? 'Editar Entrega' : 'Nova Entrega'}</h4>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-lg transition-colors">&times;</button>
            </div>
            <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">ID</label>
                  <input className="w-full text-xs p-1.5 border border-slate-200 rounded-lg font-bold focus:ring-1 focus:ring-primary-500 outline-none" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} placeholder="PROJ-001" />
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">Título *</label>
                  <input className="w-full text-xs p-1.5 border border-slate-200 rounded-lg font-bold focus:ring-1 focus:ring-primary-500 outline-none" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nome da entrega" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Detalhamento</label>
                <textarea className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary-500 outline-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Requisitos..." />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Projeto</label>
                  <select className="w-full text-xs p-1.5 border border-slate-200 rounded-lg font-bold" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                    <option value="">Sem Projeto</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Responsável</label>
                  <select className="w-full text-xs p-1.5 border border-slate-200 rounded-lg font-bold" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
                    <option value="">Ninguém</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Data Início</label>
                  <input type="date" className="w-full text-xs p-1.5 border border-slate-200 rounded-lg font-bold" value={form.startDateAtividade} onChange={(e) => setForm({ ...form, startDateAtividade: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Data Prevista</label>
                  <input type="date" className="w-full text-xs p-1.5 border border-slate-200 rounded-lg font-bold" value={form.plannedDate} onChange={(e) => setForm({ ...form, plannedDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">% Concluído</label>
                  <input type="number" min="0" max="100" className="w-full text-xs p-1.5 border border-slate-200 rounded-lg font-bold" value={form.completion} onChange={(e) => setForm({ ...form, completion: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Esforço</label>
                  <select className="w-full text-xs p-1.5 border border-slate-200 rounded-lg font-bold" value={form.effort} onChange={(e) => setForm({ ...form, effort: e.target.value })}>
                    {Object.entries(EFFORT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Status</label>
                  <select className="w-full text-xs p-1.5 border border-slate-200 rounded-lg font-bold" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Documentação</label>
                  <input className="w-full text-xs p-1.5 border border-slate-200 rounded-lg" value={form.confluenceUrl} onChange={(e) => setForm({ ...form, confluenceUrl: e.target.value })} placeholder="https://..." />
                </div>
              </div>
            </div>
            <div className="p-3 bg-red-50/50 border-t border-red-100">
              <label className="block text-[10px] font-black text-red-500 uppercase mb-0.5 tracking-widest flex items-center gap-1">
                <Flag size={10} /> Ponto de Risco
              </label>
              <textarea className="w-full text-xs p-1.5 border border-red-200 bg-white rounded-lg text-red-700 min-h-[50px] placeholder-red-300" value={form.riskPoint} onChange={(e) => setForm({ ...form, riskPoint: e.target.value })} placeholder="Descreva possíveis riscos..." />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
              <button onClick={save} disabled={!form.title || saving} className="px-4 py-1.5 bg-primary-600 text-white text-xs font-black rounded-lg shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all disabled:opacity-50">
                {saving ? 'Gravando...' : 'Salvar Entrega'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Switcher Output */}
      {viewMode === 'LIST' && <ListView filtered={filtered} openEdit={openEdit} remove={remove} updateStatus={updateStatus} />}
      {viewMode === 'KANBAN' && <KanbanView items={items} showArchived={showArchived} openEdit={openEdit} updateStatus={updateStatus} />}
      {viewMode === 'TIMELINE' && <TimelineView items={items} users={users} showArchived={showArchived} />}
    </div>
  );
}

function ListView({ filtered, openEdit, remove, updateStatus }: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-24">ID</th>
            <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Título / Detalhes</th>
            <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-32">Responsável</th>
            <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-32">Prazo</th>
            <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-20">Esforço</th>
            <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-40">Status</th>
            <th className="w-20" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.map((item: any) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
              <td className="px-4 py-4 text-xs font-mono text-slate-400">{item.identifier || '—'}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{item.title}</span>
                  {item.confluenceUrl && (
                    <a href={item.confluenceUrl} target="_blank" rel="noreferrer" title="Confluence" className="text-primary-500 hover:text-primary-700">
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                {item.description && <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>}
              </td>
              <td className="px-4 py-4 text-xs text-slate-600">
                {item.assignee ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-[10px]">
                      {item.assignee.name.charAt(0)}
                    </div>
                    <span>{item.assignee.name.split(' ')[0]}</span>
                  </div>
                ) : '—'}
              </td>
              <td className="px-4 py-4 text-xs text-slate-600">
                {item.plannedDate ? new Date(item.plannedDate).toLocaleDateString('pt-BR') : '—'}
              </td>
              <td className="px-4 py-4">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${EFFORT_COLORS[item.effort]}`}>{item.effort}</span>
              </td>
              <td className="px-4 py-4">
                <select
                  value={item.status}
                  onChange={(e) => updateStatus(item.id, e.target.value)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold border-0 outline-none cursor-pointer ${STATUS_COLORS[item.status]}`}
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"><Edit2 size={14} /></button>
                  <button onClick={() => remove(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && <div className="text-center py-12 text-slate-400">Nenhuma entrega encontrada</div>}
    </div>
  );
}

function KanbanView({ items, showArchived, openEdit, updateStatus }: any) {
  const columns = Object.entries(STATUS_LABELS).filter(([key]) => showArchived ? key === 'ARCHIVED' : key !== 'ARCHIVED');
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns.length} gap-4 items-start pb-4`}>
      {columns.map(([key, label]) => {
        const columnItems = items.filter((i: any) => i.status === key);
        return (
          <div key={key} className="flex flex-col h-full bg-slate-50/50 rounded-xl p-3 border border-slate-100">
            <div className={`flex items-center justify-between px-2 mb-3 border-l-4 ${key === 'DONE' ? 'border-green-500' : key === 'IN_PROGRESS' ? 'border-blue-500' : key === 'BLOCKED' ? 'border-red-500' : 'border-slate-300'}`}>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest">{label}</h4>
              <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">{columnItems.length}</span>
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto min-h-[500px]">
              {columnItems.map((item: any) => (
                <div key={item.id} onClick={() => openEdit(item)} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-primary-400 cursor-pointer transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-mono text-slate-400 uppercase">{item.identifier || 'Task'}</span>
                    <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${EFFORT_COLORS[item.effort]}`}>{item.effort}</span>
                  </div>
                  <h5 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-1 leading-snug">{item.title}</h5>
                  
                  {item.completion > 0 && (
                    <div className="mb-2">
                      <div className="flex justify-between items-center text-[9px] font-bold text-primary-600 mb-0.5">
                        <span>EVOLUÇÃO</span>
                        <span>{item.completion}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary-500 h-full rounded-full transition-all" style={{ width: `${item.completion}%` }} />
                      </div>
                    </div>
                  )}

                  {item.riskPoint && (
                    <div className="mb-2 p-1.5 bg-red-50 rounded border border-red-100 text-[10px] text-red-600 line-clamp-2">
                      <Flag size={10} className="inline mr-1" /> {item.riskPoint}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1">
                      {item.assignee ? (
                         <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-[8px]" title={item.assignee.name}>
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
              {columnItems.length === 0 && <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg text-slate-300 text-[10px] font-bold uppercase tracking-widest">Sem Entregas</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimelineView({ items, users, showArchived }: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
      <div className="mb-6">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          <Calendar size={18} className="text-primary-500" /> Cronograma por Usuário
        </h4>
        <p className="text-xs text-slate-500">Visualização de capacidade e prazos</p>
      </div>

      <div className="space-y-8">
        {users.map((u: any) => {
          const userTasks = items.filter((i: any) => i.assigneeId === u.id && (showArchived ? i.status === 'ARCHIVED' : i.status !== 'ARCHIVED')).sort((a: any, b: any) => (a.plannedDate || '').localeCompare(b.plannedDate || ''));
          if (userTasks.length === 0) return null;

          return (
            <div key={u.id} className="relative">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border-2 border-white shadow-sm ring-1 ring-slate-100">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm leading-none">{u.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">{userTasks.length} Entregas</p>
                </div>
              </div>

              <div className="flex gap-3 pb-2">
                {userTasks.map((t: any) => (
                   <div key={t.id} className="shrink-0 w-48 bg-slate-50 border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                    <p className="text-[9px] font-bold text-slate-400 mb-1">{t.identifier || 'TASK'}</p>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-2 h-8 leading-tight">{t.title}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${STATUS_COLORS[t.status]}`}>{STATUS_LABELS[t.status]}</span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {t.plannedDate ? new Date(t.plannedDate).toLocaleDateString('pt-BR') : 'Sem data'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {items.filter((i: any) => !i.assigneeId && (showArchived ? i.status === 'ARCHIVED' : i.status !== 'ARCHIVED')).length > 0 && (
           <div className="relative pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                  <User size={18} />
                </div>
                <div>
                  <p className="font-bold text-slate-400 text-sm leading-none italic">Não Atribuídos</p>
                </div>
              </div>
              <div className="flex gap-3 pb-2">
                {items.filter((i: any) => !i.assigneeId && (showArchived ? i.status === 'ARCHIVED' : i.status !== 'ARCHIVED')).map((t: any) => (
                  <div key={t.id} className="shrink-0 w-48 bg-slate-50 border border-slate-200 rounded-lg p-3 opacity-60">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-2 h-8">{t.title}</p>
                    <div className="mt-2 text-[10px] text-slate-500">
                      {t.plannedDate ? new Date(t.plannedDate).toLocaleDateString('pt-BR') : 'Sem data'}
                    </div>
                  </div>
                ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
