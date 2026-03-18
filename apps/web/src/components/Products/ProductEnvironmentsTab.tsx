import { useState } from 'react';
import { api } from '../../lib/api';
import { Save, ExternalLink, Server } from 'lucide-react';

interface Props { product: any; onRefresh: () => void; }

const input = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

function getEnvData(product: any, env: string) {
  return product.environments?.find((e: any) => e.environment === env) || {};
}

function EnvForm({ label, envKey, product, onRefresh }: { label: string; envKey: string; product: any; onRefresh: () => void }) {
  const existing = getEnvData(product, envKey);
  const [form, setForm] = useState({
    clusterUrl: existing.clusterUrl || '',
    logsUrl: existing.logsUrl || '',
    argoUrl: existing.argoUrl || '',
    datadogUrl: existing.datadogUrl || '',
    grafanaUrl: existing.grafanaUrl || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/products/${product.id}/environments/${envKey}`, form);
      setSaved(true); setTimeout(() => setSaved(false), 2000); onRefresh();
    } finally { setSaving(false); }
  };

  const fields = [
    { key: 'clusterUrl', label: 'Cluster URL' },
    { key: 'logsUrl', label: 'Logs URL' },
    { key: 'argoUrl', label: 'ArgoCD URL' },
    { key: 'datadogUrl', label: 'Datadog URL' },
    { key: 'grafanaUrl', label: 'Grafana URL' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Server size={16} className="text-primary-500" />
        <h3 className="font-semibold text-slate-800">{label}</h3>
      </div>
      <div className="space-y-3">
        {fields.map(({ key, label }) => (
          <div key={key}>
            <label className="text-xs font-medium text-slate-500 mb-1 block">{label}</label>
            <div className="flex gap-2">
              <input
                className={input}
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder="https://..."
              />
              {(form as any)[key] && (
                <a href={(form as any)[key]} target="_blank" rel="noreferrer"
                  className="px-2 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <ExternalLink size={14} className="text-slate-400" />
                </a>
              )}
            </div>
          </div>
        ))}
        <div className="flex justify-end pt-1">
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50 transition-colors">
            <Save size={14} /> {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductEnvironmentsTab({ product, onRefresh }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-800">Ambientes de Infraestrutura</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <EnvForm label="Homologação" envKey="HOMOLOGACAO" product={product} onRefresh={onRefresh} />
        <EnvForm label="Produção" envKey="PRODUCAO" product={product} onRefresh={onRefresh} />
      </div>
    </div>
  );
}
