import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Plus, Boxes, Edit2, Trash2, Users, Check, AlertCircle } from 'lucide-react';

const input = 'w-full border border-slate-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';
const label = 'text-xs font-medium text-slate-600 mb-0.5 block';

interface Toast { msg: string; type: 'ok' | 'err' }

export default function SquadsPage() {
  const [squads, setSquads] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editSquad, setEditSquad] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'ATIVO' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const load = () => api.get('/squads').then((r) => setSquads(r.data));
  useEffect(() => { load(); }, []);

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openNew = () => { setForm({ name: '', description: '', status: 'ATIVO' }); setEditSquad(null); setShowForm(true); };
  const openEdit = (s: any) => { setForm({ name: s.name, description: s.description || '', status: s.status }); setEditSquad(s); setShowForm(true); };

  const save = async () => {
    if (!form.name) { showToast('Nome é obrigatório', 'err'); return; }
    setSaving(true);
    try {
      if (editSquad) {
        await api.put(`/squads/${editSquad.id}`, form);
        showToast('Squad atualizada', 'ok');
      } else {
        await api.post('/squads', form);
        showToast('Squad criada', 'ok');
      }
      setShowForm(false); load();
    } catch (e: any) {
      showToast(e.response?.data?.error || 'Erro ao salvar', 'err');
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir squad?')) return;
    try {
      await api.delete(`/squads/${id}`);
      showToast('Squad excluída', 'ok');
      load();
    } catch (e: any) {
      showToast(e.response?.data?.error || 'Erro ao excluir', 'err');
    }
  };

  return (
    <div className="space-y-3">
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'ok' ? <Check size={15} /> : <AlertCircle size={15} />} {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Squads</h1>
          <p className="text-slate-500 text-xs">{squads.length} cadastrada(s)</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          <Plus size={15} /> Nova Squad
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2 max-w-lg">
          <h3 className="font-semibold text-slate-800 text-sm">{editSquad ? 'Editar Squad' : 'Nova Squad'}</h3>
          <div>
            <label className={label}>Nome *</label>
            <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome da squad" />
          </div>
          <div>
            <label className={label}>Descrição</label>
            <textarea className={input} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Responsabilidades..." />
          </div>
          <div>
            <label className={label}>Status</label>
            <select className={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">Cancelar</button>
            <button onClick={save} disabled={!form.name || saving} className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {squads.map((squad) => (
          <div key={squad.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Boxes size={16} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{squad.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${squad.status === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {squad.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(squad)} className="p-1 hover:bg-slate-100 rounded transition-colors"><Edit2 size={13} className="text-slate-400" /></button>
                <button onClick={() => remove(squad.id)} className="p-1 hover:bg-red-50 rounded transition-colors"><Trash2 size={13} className="text-red-400" /></button>
              </div>
            </div>
            {squad.description && <p className="text-xs text-slate-500 mb-2">{squad.description}</p>}
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Users size={11} /> {squad.users?.length || 0} membros</span>
              <span>{squad._count?.products || 0} produtos</span>
            </div>
          </div>
        ))}
      </div>
      {squads.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Boxes size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhuma squad cadastrada</p>
        </div>
      )}
    </div>
  );
}
