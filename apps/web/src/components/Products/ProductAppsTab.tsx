import { useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Boxes, Trash2, ExternalLink, Edit2, Code2 } from 'lucide-react';

interface Props { product: any; onRefresh: () => void; }

const input = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';
const STATUS_COLORS: Record<string, string> = {
  ATIVO: 'bg-green-100 text-green-700',
  INATIVO: 'bg-red-100 text-red-700',
  DEPRECIADO: 'bg-amber-100 text-amber-700',
  PLANEJADO: 'bg-blue-100 text-blue-700',
};

const STACK_OPTIONS = [
  { group: 'Linguagens', options: ['JAVA', 'GO_LANG', 'PYTHON', 'REACT', 'NODEJS', 'DOTNET', 'RUST', 'TYPESCRIPT', 'PHP'] },
  { group: 'Frameworks', options: ['SPRING_BOOT', 'GIN', 'FAST_API', 'NEXT_JS', 'EXPRESS', 'NEST_JS', 'ASP_NET_CORE', 'LARAVEL', 'SYMFONY'] },
  { group: 'Bancos', options: ['POSTGRESQL', 'MYSQL', 'ORACLE', 'SQL_SERVER', 'NOSQL', 'MONGODB', 'REDIS', 'KEYDB'] },
  { group: 'Outros', options: ['OUTROS'] }
];

export default function ProductAppsTab({ product, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editApp, setEditApp] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'PLANEJADO', confluenceUrl: '' });
  const [saving, setSaving] = useState(false);

  // Stacks for Apps
  const [addingStackTo, setAddingStackTo] = useState<string | null>(null);
  const [stackForm, setStackForm] = useState({ stack: 'JAVA', version: '' });

  const openNew = () => { setForm({ name: '', description: '', status: 'PLANEJADO', confluenceUrl: '' }); setEditApp(null); setShowForm(true); };
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

  const addStack = async (appId: string) => {
    await api.post(`/apps/${appId}/stacks`, stackForm);
    setAddingStackTo(null);
    setStackForm({ stack: 'JAVA', version: '' });
    onRefresh();
  };

  const removeStack = async (appId: string, id: string) => {
    await api.delete(`/apps/${appId}/stacks/${id}`);
    onRefresh();
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
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="DEPRECIADO">Depreciado</option>
                <option value="PLANEJADO">Planejado</option>
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
          <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Boxes size={16} className="text-primary-500 shrink-0" />
                <span className="font-medium text-slate-800">{app.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[app.status]}`}>{app.status}</span>
                <button onClick={() => openEdit(app)} className="p-1 hover:bg-slate-100 rounded-md transition-colors"><Edit2 size={12} className="text-slate-400" /></button>
                <button onClick={() => remove(app.id)} className="p-1 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={12} className="text-red-400" /></button>
              </div>
            </div>
            
            <div className="flex-1">
              {app.description && <p className="text-xs text-slate-500 mb-2">{app.description}</p>}
              {app.confluenceUrl && (
                <a href={app.confluenceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary-600 hover:underline mb-3">
                  <ExternalLink size={11} /> Confluence
                </a>
              )}

              {/* Stacks for this App */}
              <div className="mt-3 pt-3 border-t border-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Stacks da App</p>
                  <button onClick={() => setAddingStackTo(app.id)} className="text-[10px] text-primary-600 hover:underline flex items-center gap-0.5">
                    <Plus size={10} /> Add
                  </button>
                </div>
                
                {addingStackTo === app.id && (
                  <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                    <select className="w-full text-xs border border-slate-200 rounded px-1.5 py-1" value={stackForm.stack} onChange={(e) => setStackForm({...stackForm, stack: e.target.value})}>
                      {STACK_OPTIONS.map(g => (
                        <optgroup key={g.group} label={g.group}>
                          {g.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <input className="w-full text-xs border border-slate-200 rounded px-1.5 py-1" placeholder="Versão" value={stackForm.version} onChange={(e) => setStackForm({...stackForm, version: e.target.value})} />
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setAddingStackTo(null)} className="text-[10px] px-1.5 py-0.5 border border-slate-200 rounded">X</button>
                      <button onClick={() => addStack(app.id)} className="text-[10px] px-1.5 py-0.5 bg-primary-600 text-white rounded">OK</button>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {(app.stacks || []).map((s: any) => (
                    <div key={s.id} className="group relative flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium">
                      {s.stack} {s.version && <span className="opacity-50">v{s.version}</span>}
                      <button onClick={() => removeStack(app.id, s.id)} className="ml-1 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600">
                        <Trash2 size={8} />
                      </button>
                    </div>
                  ))}
                  {(app.stacks || []).length === 0 && <p className="text-[10px] text-slate-300 italic">Nenhuma stack</p>}
                </div>
              </div>
            </div>

            {app.environments?.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1.5">Ambientes</p>
                <div className="flex gap-2 flex-wrap">
                  {app.environments.map((env: any) => (
                    <span key={env.id} className="text-[10px] px-2 py-0.5 border border-slate-200 text-slate-500 rounded-full">{env.environment}</span>
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
