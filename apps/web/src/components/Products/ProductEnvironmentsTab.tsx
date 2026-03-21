import { useState } from 'react';
import { api } from '../../lib/api';
import { Save, ExternalLink, Server } from 'lucide-react';

interface Props { product: any; onRefresh: () => void; }

const input = 'w-full';

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
    <div className="bg-white rounded-xl border border-slate-200 p-3">
      <div className="flex items-center gap-1 mb-1">
        <Server size={14} className="text-primary-500" />
        <h3 className="font-semibold text-slate-800 text-sm">{label}</h3>
      </div>
      <div className="space-y-1">
        {fields.map(({ key, label }) => (
          <div key={key}>
            <label>{label}</label>
            <div className="flex gap-2">
              <input
                className={input}
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder="https://..."
              />
              {(form as any)[key] && (
                <a href={(form as any)[key]} target="_blank" rel="noreferrer"
                  className="px-2 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <ExternalLink size={14} className="text-slate-400" />
                </a>
              )}
            </div>
          </div>
        ))}
        <div className="flex justify-end pt-1">
          <button onClick={save} disabled={saving} className="bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            <Save size={14} /> {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DbForm({ label, envKey, product, onRefresh }: { label: string; envKey: string; product: any; onRefresh: () => void }) {
  const existing = product.databases?.find((d: any) => d.environment === envKey) || {};
  const [form, setForm] = useState({
    url: existing.url || '',
    host: existing.host || '',
    database: existing.database || '',
    username: existing.username || '',
    password: existing.password || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/products/${product.id}/databases/${envKey}`, form);
      setSaved(true); setTimeout(() => setSaved(false), 2000); onRefresh();
    } finally { setSaving(false); }
  };

  const fields = [
    { key: 'url', label: 'URL' },
    { key: 'host', label: 'Host' },
    { key: 'database', label: 'Database' },
    { key: 'username', label: 'Username' },
    { key: 'password', label: 'Password', type: 'password' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 mt-1">
      <div className="flex items-center gap-1 mb-1">
        <Server size={14} className="text-indigo-500" />
        <h3 className="font-semibold text-slate-800 text-sm">Banco de Dados - {label}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
        {fields.map(({ key, label, type }) => (
          <div key={key} className={key === 'url' ? 'md:col-span-2' : ''}>
            <label>{label}</label>
            <input
              type={type || 'text'}
              className={input}
              value={(form as any)[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-1">
        <button onClick={save} disabled={saving} className="bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          <Save size={14} /> {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
}

export default function ProductEnvironmentsTab({ product, onRefresh }: Props) {
  return (
    <div className="space-y-1">
      <div>
        <h3 className="text-slate-800 text-sm">Ambientes de Infraestrutura</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-1">
          <EnvForm label="Homologação" envKey="HOMOLOGACAO" product={product} onRefresh={onRefresh} />
          <EnvForm label="Produção" envKey="PRODUCAO" product={product} onRefresh={onRefresh} />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-2 mt-2">
        <h3 className="text-slate-800 text-sm">Bancos de Dados</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-1">
          <DbForm label="Homologação" envKey="HOMOLOGACAO" product={product} onRefresh={onRefresh} />
          <DbForm label="Produção" envKey="PRODUCAO" product={product} onRefresh={onRefresh} />
        </div>
      </div>
    </div>
  );
}
