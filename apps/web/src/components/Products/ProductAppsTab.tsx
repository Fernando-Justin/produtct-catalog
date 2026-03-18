import { useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Boxes, Trash2, ExternalLink, Edit2 } from 'lucide-react';

interface Props { product: any; onRefresh: () => void; }

const input = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';
const STATUS_COLORS: Record<string, string> = {
  HOMOLOGACAO: 'bg-amber-100 text-amber-700',
  PRODUCAO: 'bg-green-100 text-green-700',
  DESCONTINUADO: 'bg-slate-100 text-slate-500',
};

export default function ProductAppsTab({ product, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editApp, setEditApp] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'HOMOLOGACAO', confluenceUrl: '' });
  const [saving, setSaving] = useState(false);

  const openNew = () => { setForm({ name: '', description: '', status: 'HOMOLOGACAO', confluenceUrl: '' }); setEditApp(null); setShowForm(true); };
  const openEdit = (app: any) => { setForm({ name: app.name, description: app.description || '', status: app.status, confluenceUrl: app.confluenceUrl || '' }); setEditApp(app); setShowForm(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editApp) await api.put(`/apps/${editApp.id}`, form);
      else await api.post(`/products/${product.id}/apps`, form);
      setShowForm(false); onRefresh();
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir esta aplicação?')) return;
    await api.delete(`/apps/${id}`); onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Aplicações ({product.apps?.length || 0})</h3>
        <button onClick={openNew} className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors">
          <Plus size={14} /> Nova App
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Nome *</label>
              <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome da aplicação" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Status</label>
              <select className={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="HOMOLOGACAO">Homologação</option>
                <option value="PRODUCAO">Produção</option>
                <option value="DESCONTINUADO">Descontinuado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Descrição</label>
            <textarea className={input} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Confluence URL</label>
            <input className={input} value={form.confluenceUrl} onChange={(e) => setForm({ ...form, confluenceUrl: e.target.value })} placeholder="https://..." />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">Cancelar</button>
            <button onClick={save} disabled={saving || !form.name} className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(product.apps || []).map((app: any) => (
          <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Boxes size={16} className="text-primary-500 shrink-0" />
                <span className="font-medium text-slate-800">{app.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[app.status]}`}>{app.status}</span>
                <button onClick={() => openEdit(app)} className="p-1 hover:bg-slate-100 rounded-md transition-colors"><Edit2 size={12} className="text-slate-400" /></button>
                <button onClick={() => remove(app.id)} className="p-1 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={12} className="text-red-400" /></button>
              </div>
            </div>
            {app.description && <p className="text-xs text-slate-500 mb-2">{app.description}</p>}
            {app.confluenceUrl && (
              <a href={app.confluenceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
                <ExternalLink size={11} /> Confluence
              </a>
            )}
            {app.environments?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-1.5">Ambientes</p>
                <div className="flex gap-2 flex-wrap">
                  {app.environments.map((env: any) => (
                    <span key={env.id} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{env.environment}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {(product.apps?.length === 0) && (
        <div className="text-center py-10 text-slate-400 text-sm">Nenhuma aplicação cadastrada</div>
      )}
    </div>
  );
}
