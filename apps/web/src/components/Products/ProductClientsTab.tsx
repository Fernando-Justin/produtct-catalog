import { useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Trash2, UserCheck, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

interface Props { product: any; onRefresh: () => void; }
const input = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

export default function ProductClientsTab({ product, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', squadOrContact: '', description: '' });
  const [suggForm, setSuggForm] = useState<{ [clientId: string]: { title: string; description: string; type: string } }>({});
  const [saving, setSaving] = useState(false);

  const saveClient = async () => {
    setSaving(true);
    try {
      await api.post(`/products/${product.id}/clients`, form);
      setForm({ name: '', squadOrContact: '', description: '' });
      setShowForm(false); onRefresh();
    } finally { setSaving(false); }
  };

  const removeClient = async (id: string) => {
    if (!confirm('Excluir cliente?')) return;
    await api.delete(`/products/${product.id}/clients/${id}`); onRefresh();
  };

  const addSuggestion = async (clientId: string) => {
    const sf = suggForm[clientId];
    if (!sf?.title) return;
    await api.post(`/clients/${clientId}/suggestions`, sf);
    setSuggForm({ ...suggForm, [clientId]: { title: '', description: '', type: '' } });
    onRefresh();
  };

  const removeSugg = async (id: string) => {
    await api.delete(`/suggestions/${id}`); onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Clientes ({product.clients?.length || 0})</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors">
          <Plus size={14} /> Novo Cliente
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Nome da Aplicação / Cliente *</label>
              <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Squad / Contato</label>
              <input className={input} value={form.squadOrContact} onChange={(e) => setForm({ ...form, squadOrContact: e.target.value })} placeholder="Squad ou pessoa" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Descritivo</label>
            <textarea className={input} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Como utiliza o produto?" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">Cancelar</button>
            <button onClick={saveClient} disabled={!form.name || saving} className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">Salvar</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(product.clients || []).map((client: any) => (
          <div key={client.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpanded(expanded === client.id ? null : client.id)}
            >
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <UserCheck size={16} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 text-sm">{client.name}</p>
                {client.squadOrContact && <p className="text-xs text-slate-400">{client.squadOrContact}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{client.suggestions?.length || 0} sugestões</span>
                <button onClick={(e) => { e.stopPropagation(); removeClient(client.id); }} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={13} className="text-red-400" />
                </button>
                {expanded === client.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </div>
            </div>

            {expanded === client.id && (
              <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-4">
                {client.description && <p className="text-sm text-slate-600">{client.description}</p>}

                {/* Sugestões */}
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                    <Lightbulb size={12} /> Sugestões de Evolução / Integração
                  </p>
                  <div className="space-y-2 mb-3">
                    {(client.suggestions || []).map((s: any) => (
                      <div key={s.id} className="flex items-start gap-2 bg-white rounded-lg p-3 border border-slate-200">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700">{s.title}</p>
                          {s.description && <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>}
                          {s.type && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full mt-1 inline-block">{s.type}</span>}
                        </div>
                        <button onClick={() => removeSugg(s.id)} className="p-1 hover:bg-red-50 rounded transition-colors">
                          <Trash2 size={12} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {/* Add suggestion form */}
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      className={`${input} col-span-2`}
                      placeholder="Título da sugestão"
                      value={suggForm[client.id]?.title || ''}
                      onChange={(e) => setSuggForm({ ...suggForm, [client.id]: { ...suggForm[client.id], title: e.target.value, description: suggForm[client.id]?.description || '', type: suggForm[client.id]?.type || '' } })}
                    />
                    <input
                      className={input}
                      placeholder="Tipo (ex: Integração)"
                      value={suggForm[client.id]?.type || ''}
                      onChange={(e) => setSuggForm({ ...suggForm, [client.id]: { ...suggForm[client.id], type: e.target.value, title: suggForm[client.id]?.title || '', description: suggForm[client.id]?.description || '' } })}
                    />
                    <textarea
                      className={`${input} col-span-2`}
                      rows={2}
                      placeholder="Descrição da sugestão"
                      value={suggForm[client.id]?.description || ''}
                      onChange={(e) => setSuggForm({ ...suggForm, [client.id]: { ...suggForm[client.id], description: e.target.value, title: suggForm[client.id]?.title || '', type: suggForm[client.id]?.type || '' } })}
                    />
                    <button
                      onClick={() => addSuggestion(client.id)}
                      disabled={!suggForm[client.id]?.title}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                      <Plus size={14} /> Adicionar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {(!product.clients?.length) && <div className="text-center py-10 text-slate-400 text-sm">Nenhum cliente cadastrado</div>}
    </div>
  );
}
