import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Plus, Shield, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';

const input = 'w-full border border-slate-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';
const label = 'text-xs font-medium text-slate-600 mb-0.5 block';

const ROLE_TYPES = ['ADMIN', 'PO', 'DEV', 'SQUAD_LEAD', 'VIEWER'];

interface Toast { msg: string; type: 'ok' | 'err' }

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editRole, setEditRole] = useState<any>(null);
  const [form, setForm] = useState({ name: '', type: 'DEV', description: '', status: 'ATIVO' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const load = () => api.get('/roles').then((r) => setRoles(r.data));
  useEffect(() => { load(); }, []);

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openNew = () => { setForm({ name: '', type: 'DEV', description: '', status: 'ATIVO' }); setEditRole(null); setShowForm(true); };
  const openEdit = (r: any) => { setForm({ name: r.name, type: r.type, description: r.description || '', status: r.status }); setEditRole(r); setShowForm(true); };

  const save = async () => {
    if (!form.name) { showToast('Nome é obrigatório', 'err'); return; }
    setSaving(true);
    try {
      if (editRole) {
        await api.put(`/roles/${editRole.id}`, form);
        showToast('Cargo atualizado', 'ok');
      } else {
        await api.post('/roles', form);
        showToast('Cargo criado', 'ok');
      }
      setShowForm(false); load();
    } catch (e: any) {
      showToast(e.response?.data?.error || 'Erro ao salvar', 'err');
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir cargo?')) return;
    try {
      await api.delete(`/roles/${id}`);
      showToast('Cargo excluído', 'ok');
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
          <h1 className="text-xl font-bold text-slate-900">Cargos</h1>
          <p className="text-slate-500 text-xs">{roles.length} cadastrado(s)</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          <Plus size={15} /> Novo Cargo
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 max-w-lg space-y-2">
          <h3 className="font-semibold text-slate-800 text-sm">{editRole ? 'Editar Cargo' : 'Novo Cargo'}</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={label}>Nome *</label>
              <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Backend Dev" />
            </div>
            <div>
              <label className={label}>Tipo</label>
              <select className={input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {ROLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={label}>Descrição</label>
            <textarea className={input} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição do cargo..." />
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

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Cargo</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Tipo</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Descrição</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Status</th>
              <th className="w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Shield size={13} className="text-primary-500" />
                    <span className="font-medium text-slate-800">{role.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full font-medium">{role.type}</span>
                </td>
                <td className="px-4 py-2 text-slate-500 max-w-xs truncate text-xs">{role.description || '—'}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${role.status === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {role.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(role)} className="p-1 hover:bg-slate-100 rounded transition-colors"><Edit2 size={13} className="text-slate-400" /></button>
                    <button onClick={() => remove(role.id)} className="p-1 hover:bg-red-50 rounded transition-colors"><Trash2 size={13} className="text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {roles.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">Nenhum cargo cadastrado</div>}
      </div>
    </div>
  );
}
