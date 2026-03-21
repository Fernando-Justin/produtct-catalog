import { useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Database, Cpu, Code2, Trash2 } from 'lucide-react';

interface Props { product: any; onRefresh: () => void; }

const STACK_OPTIONS = {
  'Linguagens': [
    { value: 'JAVA', label: 'Java' },
    { value: 'GO_LANG', label: 'Go Lang' },
    { value: 'PYTHON', label: 'Python' },
    { value: 'REACT', label: 'React' },
    { value: 'NODEJS', label: 'NodeJs' },
    { value: 'DOTNET', label: '.Net' },
    { value: 'RUST', label: 'Rust' },
    { value: 'TYPESCRIPT', label: 'TypeScript' },
    { value: 'PHP', label: 'PHP' },
  ],
  'Frameworks': [
    { value: 'SPRING_BOOT', label: 'Spring Boot' },
    { value: 'GIN', label: 'Gin' },
    { value: 'FAST_API', label: 'FastAPI' },
    { value: 'NEXT_JS', label: 'Next.js' },
    { value: 'EXPRESS', label: 'Express' },
    { value: 'NEST_JS', label: 'NestJS' },
    { value: 'ASP_NET_CORE', label: 'ASP.NET Core' },
    { value: 'LARAVEL', label: 'Laravel' },
    { value: 'SYMFONY', label: 'Symfony' },
  ],
  'Bancos de Dados': [
    { value: 'POSTGRESQL', label: 'PostgreSQL' },
    { value: 'MYSQL', label: 'MySQL' },
    { value: 'ORACLE', label: 'Oracle' },
    { value: 'SQL_SERVER', label: 'SQL Server' },
    { value: 'NOSQL', label: 'NoSQL' },
    { value: 'MONGODB', label: 'MongoDB' },
    { value: 'REDIS', label: 'Redis' },
    { value: 'KEYDB', label: 'KeyDB' },
  ],
  'Outros': [
    { value: 'OUTROS', label: 'Outros' }
  ]
};

const STACK_ICONS: Record<string, any> = {
  'Linguagens': Code2,
  'Frameworks': Cpu,
  'Bancos de Dados': Database,
  'Outros': Plus
};

export default function ProductStacksTab({ product, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ stack: 'JAVA', version: '', environment: 'AMBOS' });
  const [saving, setSaving] = useState(false);

  const addStack = async () => {
    setSaving(true);
    try {
      await api.post(`/products/${product.id}/stacks`, form);
      setShowForm(false);
      onRefresh();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erro ao adicionar stack');
    } finally {
      setSaving(false);
    }
  };

  const removeStack = async (id: string) => {
    if (!confirm('Remover esta tecnologia do produto?')) return;
    try {
      await api.delete(`/products/${product.id}/stacks/${id}`);
      onRefresh();
    } catch (e: any) {
      alert('Erro ao remover stack');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-slate-800">Stack Tecnológica</h3>
          <p className="text-xs text-slate-500">Tecnologias que compõem este produto</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
          >
            <Plus size={14} /> Adicionar Tecnologia
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Tecnologia</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={form.stack}
                onChange={(e) => setForm({ ...form, stack: e.target.value })}
              >
                {Object.entries(STACK_OPTIONS).map(([group, options]) => (
                  <optgroup key={group} label={group}>
                    {options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Versão (Opcional)</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                placeholder="Ex: 17, 3.2.1..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Ambiente</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={form.environment}
                onChange={(e) => setForm({ ...form, environment: e.target.value })}
              >
                <option value="AMBOS">Ambos</option>
                <option value="HOMOLOGACAO">Homologação</option>
                <option value="PRODUCAO">Produção</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={addStack}
              disabled={saving}
              className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(STACK_OPTIONS).map(([group, options]) => {
          const GroupIcon = STACK_ICONS[group];
          const groupStacks = (product.stacks || []).filter((s: any) =>
            options.some((opt) => opt.value === s.stack)
          );

          if (groupStacks.length === 0 && !showForm) return null;

          return (
            <div key={group} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                  {GroupIcon && <GroupIcon size={16} />}
                </div>
                <h4 className="font-semibold text-slate-700 text-sm">{group}</h4>
              </div>
              <div className="space-y-3">
                {groupStacks.length === 0 && (
                  <p className="text-xs text-slate-400 italic">Nenhuma tecnologia registrada</p>
                )}
                {groupStacks.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between group/item">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">
                          {options.find(o => o.value === s.stack)?.label || s.stack}
                        </span>
                        {s.version && (
                          <span className="text-[10px] px-1.5 bg-slate-100 text-slate-500 rounded font-mono">
                            v{s.version}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                        {s.environment === 'AMBOS' ? 'Homologação & Produção' : s.environment}
                      </span>
                    </div>
                    <button
                      onClick={() => removeStack(s.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover/item:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
