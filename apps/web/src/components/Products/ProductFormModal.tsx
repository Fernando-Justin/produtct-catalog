import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { X, Check, AlertCircle } from 'lucide-react';

interface Props {
  product?: any;
  onClose: () => void;
  onSaved: () => void;
}

interface Toast { msg: string; type: 'ok' | 'err' }

export default function ProductFormModal({ product, onClose, onSaved }: Props) {
  const [squads, setSquads] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    purpose: product?.purpose || '',
    observations: product?.observations || '',
    confluenceUrl: product?.confluenceUrl || '',
    status: product?.status || 'PLANEJADO',
    squadId: product?.squadId || '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    api.get('/squads').then((r) => setSquads(r.data));
  }, []);

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    if (!form.name) { showToast('Nome é obrigatório', 'err'); return; }
    setSaving(true);
    try {
      if (product) {
        await api.put(`/products/${product.id}`, form);
      } else {
        await api.post('/products', form);
      }
      onSaved();
    } catch (e: any) {
      showToast(e.response?.data?.error || 'Erro ao salvar produto', 'err');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'ok' ? <Check size={15} /> : <AlertCircle size={15} />} {toast.msg}
        </div>
      )}
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200">
          <h2 className="text-slate-900">{product ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded transition-colors"><X size={14} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-3 py-2 space-y-1.5">
          <Field label="Nome *">
            <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do produto" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Squad">
              <select className={input} value={form.squadId} onChange={(e) => setForm({ ...form, squadId: e.target.value })}>
                <option value="">Selecionar...</option>
                {squads.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="DEPRECIADO">Depreciado</option>
                <option value="PLANEJADO">Planejado</option>
              </select>
            </Field>
          </div>
          <Field label="Descrição">
            <textarea className={input} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição do produto" />
          </Field>
          <Field label="Propósito">
            <textarea className={input} rows={2} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Qual o propósito deste produto?" />
          </Field>
          <Field label="Observações">
            <textarea className={input} rows={2} value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} placeholder="Observações adicionais" />
          </Field>
          <Field label="Link Confluence">
            <input className={input} value={form.confluenceUrl} onChange={(e) => setForm({ ...form, confluenceUrl: e.target.value })} placeholder="https://..." />
          </Field>
        </div>
        <div className="flex justify-end gap-2 px-3 py-2 border-t border-slate-200">
          <button onClick={onClose} className="border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving || !form.name} className="bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

const input = 'w-full';
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label>{label}</label>
      {children}
    </div>
  );
}
