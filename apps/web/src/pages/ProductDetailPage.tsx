import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ArrowLeft, Package, ExternalLink, Edit2 } from 'lucide-react';
import ProductAppsTab from '../components/Products/ProductAppsTab';
import ProductDevsTab from '../components/Products/ProductDevsTab';
import ProductClientsTab from '../components/Products/ProductClientsTab';
import ProductEnvironmentsTab from '../components/Products/ProductEnvironmentsTab';
import ProductRoadmapTab from '../components/Products/ProductRoadmapTab';
import ProductFormModal from '../components/Products/ProductFormModal';

const TABS = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'apps', label: 'Aplicações' },
  { id: 'devs', label: 'Devs' },
  { id: 'clients', label: 'Clientes' },
  { id: 'environments', label: 'Ambientes' },
  { id: 'roadmap', label: 'Roadmap' },
];

const STATUS_COLORS: Record<string, string> = {
  HOMOLOGACAO: 'bg-amber-100 text-amber-700',
  PRODUCAO: 'bg-green-100 text-green-700',
  DESCONTINUADO: 'bg-slate-100 text-slate-500',
};

const STACK_COLORS: Record<string, string> = {
  JAVA: 'bg-orange-100 text-orange-700', GO: 'bg-cyan-100 text-cyan-700',
  PYTHON: 'bg-blue-100 text-blue-700', REACT: 'bg-sky-100 text-sky-700',
  NODEJS: 'bg-green-100 text-green-700', OUTROS: 'bg-slate-100 text-slate-600',
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [tab, setTab] = useState('overview');
  const [showEdit, setShowEdit] = useState(false);

  const load = () => api.get(`/products/${id}`).then((r) => setProduct(r.data));
  useEffect(() => { load(); }, [id]);

  if (!product) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/products" className="mt-1 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Package size={18} className="text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{product.name}</h1>
              {product.squad && <p className="text-sm text-slate-500">{product.squad.name}</p>}
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[product.status] || ''}`}>
              {product.status}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowEdit(true)}
          className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Edit2 size={14} /> Editar
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            {product.description && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Descrição</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
              </div>
            )}
            {product.purpose && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Propósito</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{product.purpose}</p>
              </div>
            )}
            {product.observations && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Observações</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{product.observations}</p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {/* Stacks */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Stack</h3>
              <div className="flex flex-wrap gap-2">
                {product.stacks.length === 0 && <p className="text-sm text-slate-400">Nenhuma stack definida</p>}
                {product.stacks.map((s: any) => (
                  <span key={s.id} className={`text-xs px-2.5 py-1 rounded-full font-medium ${STACK_COLORS[s.stack] || STACK_COLORS.OUTROS}`}>
                    {s.stack} {s.environment !== 'AMBOS' && <span className="opacity-60">({s.environment})</span>}
                  </span>
                ))}
              </div>
            </div>
            {/* Links */}
            {product.confluenceUrl && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Documentação</h3>
                <a href={product.confluenceUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
                  <ExternalLink size={13} /> Confluence
                </a>
              </div>
            )}
            {product.links?.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Links</h3>
                <div className="space-y-2">
                  {product.links.map((l: any) => (
                    <a key={l.id} href={l.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
                      <ExternalLink size={12} /> {l.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {tab === 'apps' && <ProductAppsTab product={product} onRefresh={load} />}
      {tab === 'devs' && <ProductDevsTab product={product} onRefresh={load} />}
      {tab === 'clients' && <ProductClientsTab product={product} onRefresh={load} />}
      {tab === 'environments' && <ProductEnvironmentsTab product={product} onRefresh={load} />}
      {tab === 'roadmap' && <ProductRoadmapTab product={product} onRefresh={load} />}

      {showEdit && (
        <ProductFormModal
          product={product}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); load(); }}
        />
      )}
    </div>
  );
}
