import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Trash2, Edit2, Calendar, User, Flag } from 'lucide-react';

interface Props { product: any; onRefresh: () => void; }
const input = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  BLOCKED: 'bg-red-100 text-red-700',
  DONE: 'bg-green-100 text-green-700',
};
const STATUS_LABELS: Record<string, string> = {
  BACKLOG: 'Backlog', IN_PROGRESS: 'Em Progresso', BLOCKED: 'Bloqueado', DONE: 'Concluído',
};
const EFFORT_LABELS: Record<string, string> = { PP: 'PP', P: 'P', M: 'M', G: 'G', GG: 'GG' };
const EFFORT_COLORS: Record<string, string> = {
  PP: 'bg-slate-100 text-slate-600', P: 'bg-blue-50 text-blue-600',
  M: 'bg-amber-50 text-amber-600', G: 'bg-orange-100 text-orange-600', GG: 'bg-red-100 text-red-600',
};

const emptyForm = { title: '', description: '', goalIndicator: '', plannedDate: '', effort: 'M', status: 'BACKLOG', assigneeId: '', identifier: '' };

export default function ProductRoadmapTab({ product, onRefresh }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const load = () => api.get(`/products/${product.id}/roadmap`).then((r) => setItems(r.data));
  useEffect(() => { load(); api.get('/users').then((r) => setUsers(r.data)); }, [product.id]);

  const openNew = () => { setForm({ ...emptyForm }); setEditItem(null); setShowForm(true); };
  const openEdit = (item: any) => {
    setForm({
      title: item.title, description: item.description || '', goalIndicator: item.goalIndicator || '',
      plannedDate: item.plannedDate ? item.plannedDate.slice(0, 10) : '', effort: item.effort,
      status: item.status, assigneeId: item.assigneeId || '', identifier: item.identifier || '',
    });
    setEditItem(item); setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, productId: product.id, plannedDate: form.plannedDate || null, assigneeId: form.assigneeId || null };
      if (editItem) await api.put(`/roadmap/${editItem.id}`, payload);
      else await api.post('/roadmap', payload);
      setShowForm(false); load();
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir atividade?')) return;
    await api.delete(`/roadmap/${id}`); load();
  };

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/roadmap/${id}`, { status }); load();
  };

  const filtered = filter === 'ALL' ? items : items.filter((i) => i.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold text-slate-800">Roadmap & Atividades ({items.length})</h3>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={openNew} className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors">
            <Plus size={14} /> Nova Atividade
          </button>
        </div>
      </div>

      {/* Kanban-style status summary */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(STATUS_LABELS).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(filter === k ? 'ALL' : k)}
            className={`rounded-lg p-3 text-center border transition-all ${filter === k ? 'border-primary-400 shadow-sm' : 'border-slate-200'} bg-white`}>
            <p className="text-lg font-bold text-slate-800">{items.filter((i) => i.status === k).length}</p>
            <p className="text-xs text-slate-500">{v}</p>
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">ID / Identificador</label>
              <input className={input} value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} placeholder="Ex: PROJ-001" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Título *</label>
              <input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nome da atividade" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Descrição</label>
            <textarea className={input} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreva a atividade..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Indicador de Meta</label>
              <input className={input} value={form.goalIndicator} onChange={(e) => setForm({ ...form, goalIndicator: e.target.value })} placeholder="Ex: Reduzir latência 20%" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Data Prevista</label>
              <input type="date" className={input} value={form.plannedDate} onChange={(e) => setForm({ ...form, plannedDate: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Esforço</label>
              <select className={input} value={form.effort} onChange={(e) => setForm({ ...form, effort: e.target.value })}>
                {Object.entries(EFFORT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Status</label>
              <select className={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Dev Responsável</label>
              <select className={input} value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
                <option value="">Ninguém</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">Cancelar</button>
            <button onClick={save} disabled={!form.title || saving} className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-24">ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Título</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-28">Dev</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-28">Data Prev.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-16">Esforço</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-36">Status</th>
              <th className="w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
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
                      <span className="text-xs text-slate-600 truncate">{item.assignee.name.split(' ')[0]}</span>
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
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Edit2 size={12} className="text-slate-400" /></button>
                    <button onClick={() => remove(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={12} className="text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">Nenhuma atividade encontrada</div>}
      </div>
    </div>
  );
}
