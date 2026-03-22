import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ArrowLeft, Package, ExternalLink, Edit2 } from 'lucide-react';
import ProductAppsTab from '../components/Products/ProductAppsTab';
import ProductDevsTab from '../components/Products/ProductDevsTab';
import ProductClientsTab from '../components/Products/ProductClientsTab';
import ProductEnvironmentsTab from '../components/Products/ProductEnvironmentsTab';
import ProductRoadmapTab from '../components/Products/ProductRoadmapTab';
import ProductStacksTab from '../components/Products/ProductStacksTab';
import ProductFormModal from '../components/Products/ProductFormModal';

const TABS = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'stacks', label: 'Stack' },
  { id: 'apps', label: 'Aplicações' },
  { id: 'devs', label: 'Devs' },
  { id: 'clients', label: 'Clientes' },
  { id: 'environments', label: 'Ambiente' },
  { id: 'roadmap', label: 'Delivery' },
];

const STATUS_COLORS: Record<string, string> = {
  ATIVO: 'bg-green-100 text-green-700',
  INATIVO: 'bg-red-100 text-red-700',
  DEPRECIADO: 'bg-amber-100 text-amber-700',
  PLANEJADO: 'bg-blue-100 text-blue-700',
};

const STACK_COLORS: Record<string, string> = {
  JAVA: 'bg-orange-100 text-orange-700', GO_LANG: 'bg-cyan-100 text-cyan-700',
  PYTHON: 'bg-blue-100 text-blue-700', REACT: 'bg-sky-100 text-sky-700',
  NODEJS: 'bg-green-100 text-green-700', DOTNET: 'bg-indigo-100 text-indigo-700',
  TYPESCRIPT: 'bg-blue-100 text-blue-700', PHP: 'bg-purple-100 text-purple-700',
  RUST: 'bg-orange-100 text-orange-700', NEXT_JS: 'bg-black text-white',
  POSTGRESQL: 'bg-blue-100 text-blue-800', MONGODB: 'bg-green-100 text-green-800',
  OUTROS: 'bg-slate-100 text-slate-600',
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
    <div className="space-y-1.5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/products" className="mt-0.5 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
              <Package size={16} className="text-primary-600" />
            </div>
            <div>
              <h1 className="text-lg">{product.name}</h1>
              {product.squad && <p className="text-[11px] text-slate-500 leading-none">{product.squad.name}</p>}
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[product.status] || ''}`}>
              {product.status}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowEdit(true)}
          className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Edit2 size={12} /> Editar
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 space-y-1.5">
            {product.description && (
              <div className="bg-white rounded-xl border border-slate-200 p-3">
                <h3>Descrição</h3>
                <p className="text-sm text-slate-600 leading-tight">{product.description}</p>
              </div>
            )}
            {product.purpose && (
              <div className="bg-white rounded-xl border border-slate-200 p-3">
                <h3>Propósito</h3>
                <p className="text-sm text-slate-600 leading-tight">{product.purpose}</p>
              </div>
            )}
            {product.observations && (
              <div className="bg-white rounded-xl border border-slate-200 p-3">
                <h3>Observações</h3>
                <p className="text-sm text-slate-600 leading-tight">{product.observations}</p>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            {/* Stacks */}
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <h3>Stack</h3>
              <div className="flex flex-wrap gap-1">
                {product.stacks.length === 0 && <p className="text-xs text-slate-400">Nenhuma stack definida</p>}
                {product.stacks.map((s: any) => (
                  <span key={s.id} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STACK_COLORS[s.stack] || STACK_COLORS.OUTROS}`}>
                    {s.stack} {s.environment !== 'AMBOS' && <span className="opacity-60">({s.environment})</span>}
                  </span>
                ))}
              </div>
            </div>
            {/* Links */}
            {product.confluenceUrl && (
              <div className="bg-white rounded-xl border border-slate-200 p-3">
                <h3>Documentação</h3>
                <a href={product.confluenceUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary-600 hover:underline">
                  <ExternalLink size={12} /> Confluence
                </a>
              </div>
            )}
            {product.links?.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-3">
                <h3>Links</h3>
                <div className="space-y-1">
                  {product.links.map((l: any) => (
                    <a key={l.id} href={l.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary-600 hover:underline">
                      <ExternalLink size={11} /> {l.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {tab === 'stacks' && <ProductStacksTab product={product} onRefresh={load} />}
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
