import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Plus, Search, Package, ChevronRight } from 'lucide-react';
import ProductFormModal from '../components/Products/ProductFormModal';

interface Product {
  id: string;
  name: string;
  description?: string;
  status: string;
  squad?: { name: string };
  stacks: { stack: string }[];
  _count: { apps: number; clients: number; roadmapItems: number };
}

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const load = () => api.get('/products').then((r) => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.squad?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg">Produtos</h1>
          <p className="text-slate-500 text-[10px] leading-tight">{products.length} cadastrado(s)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white rounded-lg"
        >
          <Plus size={14} /> Novo Produto
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto ou squad..."
          className="w-full pl-8"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {filtered.map((p) => (
          <Link
            key={p.id}
            to={`/products/${p.id}`}
            className="bg-white rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all p-3 group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center shrink-0">
                  <Package size={16} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="text-slate-800 group-hover:text-primary-600 transition-colors leading-tight text-sm font-semibold">
                    {p.name}
                  </h3>
                  {p.squad && <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{p.squad.name}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status] || 'bg-slate-100 text-slate-500'}`}>
                  {p.status}
                </span>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-primary-400 transition-colors" />
              </div>
            </div>

            {p.description && (
              <p className="text-xs text-slate-500 line-clamp-2 mb-2 leading-tight">{p.description}</p>
            )}

            {/* Stacks */}
            <div className="flex flex-wrap gap-1 mb-2">
              {[...new Set(p.stacks.map((s) => s.stack))].slice(0, 5).map((s) => (
                <span key={s} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STACK_COLORS[s] || STACK_COLORS.OUTROS}`}>
                  {s}
                </span>
              ))}
            </div>

            {/* Counters */}
            <div className="flex gap-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
              <span>{p._count.apps} apps</span>
              <span>{p._count.clients} clientes</span>
              <span>{p._count.roadmapItems} atividades</span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nenhum produto encontrado</p>
        </div>
      )}

      {showModal && (
        <ProductFormModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
