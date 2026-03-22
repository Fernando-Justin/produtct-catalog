import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Calendar, User, Flag, Package, Layout, List as ListIcon, Search, ExternalLink, Plus, AlertCircle } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  BLOCKED: 'bg-red-100 text-red-700',
  DONE: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-slate-200 text-slate-500',
};
const STATUS_LABELS: Record<string, string> = {
  BACKLOG: 'Backlog', IN_PROGRESS: 'Em Progresso', BLOCKED: 'Bloqueado', DONE: 'Concluído', ARCHIVED: 'Arquivado',
};
const EFFORT_COLORS: Record<string, string> = {
  PP: 'bg-slate-100 text-slate-600', P: 'bg-blue-50 text-blue-600',
  M: 'bg-amber-50 text-amber-600', G: 'bg-orange-100 text-orange-600', GG: 'bg-red-100 text-red-600',
};

type ViewMode = 'KANBAN' | 'LIST';

export default function RoadmapPage() {
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('KANBAN');
  
  // Filters
  const [filterProduct, setFilterProduct] = useState('ALL');
  const [filterUser, setFilterUser] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState('PRODUCT');
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const load = () => {
    api.get('/roadmap').then((r) => setItems(r.data));
    api.get('/products').then((r) => setProducts(r.data));
    api.get('/users').then((r) => setUsers(r.data));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/roadmap/${id}`, { status });
    load();
  };

  const updateAssignee = async (id: string, assigneeId: string) => {
    await api.put(`/roadmap/${id}`, { assigneeId: assigneeId ? parseInt(assigneeId) : null });
    load();
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      title: item.title,
      description: item.description || '',
      goalIndicator: item.goalIndicator || '',
      plannedDate: item.plannedDate ? item.plannedDate.slice(0, 10) : '',
      effort: item.effort,
      status: item.status,
      assigneeId: item.assigneeId || '',
      identifier: item.identifier || '',
      completion: item.completion || 0,
      riskPoint: item.riskPoint || '',
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/roadmap/${editItem.id}`, {
        ...form,
        assigneeId: form.assigneeId ? parseInt(form.assigneeId) : null,
        plannedDate: form.plannedDate ? new Date(form.plannedDate).toISOString() : null,
      });
      setEditItem(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter((i) => {
    if (filterProduct !== 'ALL' && i.productId !== filterProduct) return false;
    if (filterUser !== 'ALL' && i.assigneeId?.toString() !== filterUser) return false;
    if (searchTerm && !i.title.toLowerCase().includes(searchTerm.toLowerCase()) && !i.identifier?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (showArchived) return i.status === 'ARCHIVED';
    return i.status !== 'ARCHIVED';
  }).sort((a, b) => {
    if (sortBy === 'PRODUCT') return (a.product?.name || '').localeCompare(b.product?.name || '') || a.title.localeCompare(b.title);
    if (sortBy === 'DATE') return (a.plannedDate || '').localeCompare(b.plannedDate || '');
    if (sortBy === 'STATUS') return a.status.localeCompare(b.status);
    if (sortBy === 'TITLE') return a.title.localeCompare(b.title);
    if (sortBy === 'EVOLUTION') return (b.completion || 0) - (a.completion || 0);
    return 0;
  });

  const exportCSV = () => {
    const headers = ['Produto', 'ID', 'Título', 'Responsável', 'Status', 'Esforço', 'Data Prevista', 'Conclusão %', 'Risco'];
    const rows = filtered.map(i => [
      i.product?.name || '',
      i.identifier || '',
      i.title,
      i.assignee?.name || '',
      STATUS_LABELS[i.status],
      i.effort,
      i.plannedDate ? new Date(i.plannedDate).toLocaleDateString('pt-BR') : '',
      `${i.completion}%`,
      i.riskPoint || ''
    ]);

    const content = [headers, ...rows].map(r => r.map(c => `"${c.toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `delivery_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const downloadTemplate = () => {
    const headers = ['ID', 'Produto', 'Título', 'Descrição', 'Responsável Email', 'Status', 'Esforço', 'Data Prevista', 'Conclusão', 'Risco', 'Confluence'];
    const row = ['PRJ-001', 'Nome do Produto', 'Minha Atividade', 'Detalhes da atividade', 'user@company.com', 'BACKLOG', 'M', '2024-12-31', '0', 'Riscos aqui', 'https://confluence.com/link'];
    const content = [headers, row].map(r => r.map(c => `"${c.toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'modelo_importacao_delivery.csv';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleImport = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const headerLine = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.trim().replace(/^"|"$/g, ''));
      
      const items = lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
        const obj: any = {};
        headerLine.forEach((h, i) => {
          const val = values[i];
          if (h === 'ID') obj.identifier = val;
          if (h === 'Produto') obj.productName = val;
          if (h === 'Título') obj.title = val;
          if (h === 'Descrição') obj.description = val;
          if (h === 'Responsável Email') obj.assigneeEmail = val;
          if (h === 'Status') obj.status = val;
          if (h === 'Esforço') obj.effort = val;
          if (h === 'Data Prevista') obj.plannedDate = val;
          if (h === 'Conclusão') obj.completion = val;
          if (h === 'Risco') obj.riskPoint = val;
          if (h === 'Confluence') obj.confluenceUrl = val;
        });
        return obj;
      });

      try {
        const res = await api.post('/roadmap/import', { items });
        setImportResult(res.data);
        load();
      } catch (err) {
        alert('Erro ao importar arquivo');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">Delivery Global</h1>
          <p className="text-slate-500 text-[11px]">Visão consolidada de todas as entregas e prazos</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ExternalLink size={14} /> Exportar CSV
          </button>

          <button 
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Package size={14} /> Importar CSV
          </button>

          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setViewMode('KANBAN')} className={`p-1.5 rounded-md transition-all ${viewMode === 'KANBAN' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}>
              <Layout size={18} />
            </button>
            <button onClick={() => setViewMode('LIST')} className={`p-1.5 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}>
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por título ou ID..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
        >
          <option value="ALL">Todos os Produtos</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <select 
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
        >
          <option value="ALL">Todos os Usuários</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
          <input 
            type="checkbox" 
            checked={showArchived} 
            onChange={(e) => setShowArchived(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-slate-700">Ver Arquivados</span>
        </label>

        <select 
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="PRODUCT">Ordenar por Produto</option>
          <option value="DATE">Ordenar por Data</option>
          <option value="TITLE">Ordenar por Título</option>
          <option value="EVOLUTION">Ordenar por Evolução</option>
          <option value="STATUS">Ordenar por Status</option>
        </select>

        {editItem && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h2 className="font-bold text-slate-800">Editar Atividade</h2>
                <button onClick={() => setEditItem(null)} className="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
              </div>
              <div className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-4 gap-2">
                   <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">ID</label>
                      <input className="w-full text-sm p-1.5 border border-slate-200 rounded" value={form.identifier} onChange={(e) => setForm({...form, identifier: e.target.value})} />
                   </div>
                   <div className="col-span-3">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Título</label>
                      <input className="w-full text-sm p-1.5 border border-slate-200 rounded" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Detalhamento</label>
                   <textarea className="w-full text-sm p-1.5 border border-slate-200 rounded" rows={2} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">% Evolução</label>
                      <input type="number" className="w-full text-sm p-1.5 border border-slate-200 rounded" value={form.completion} onChange={(e) => setForm({...form, completion: parseInt(e.target.value) || 0})} />
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data Prevista</label>
                      <input type="date" className="w-full text-sm p-1.5 border border-slate-200 rounded" value={form.plannedDate} onChange={(e) => setForm({...form, plannedDate: e.target.value})} />
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-red-400 uppercase mb-1">Ponto de Risco</label>
                   <textarea className="w-full text-sm p-1.5 border border-red-100 bg-red-50/30 rounded text-red-700" rows={2} value={form.riskPoint} onChange={(e) => setForm({...form, riskPoint: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Responsável</label>
                      <select className="w-full text-sm p-1.5 border border-slate-200 rounded" value={form.assigneeId} onChange={(e) => setForm({...form, assigneeId: e.target.value})}>
                        <option value="">Ninguém</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                      <select className="w-full text-sm p-1.5 border border-slate-200 rounded" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                   </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button onClick={() => setEditItem(null)} className="px-4 py-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700">Cancelar</button>
                <button onClick={save} disabled={saving} className="px-6 py-1.5 bg-primary-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-primary-700 transition-all disabled:opacity-50">
                  {saving ? 'Gravando...' : 'Gravar Alterações'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showImport && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-primary-600">
                  <Package size={20} />
                  <h2 className="font-bold text-slate-800">Importação de Entregas</h2>
                </div>
                <button onClick={() => { setShowImport(false); setImportResult(null); }} className="text-slate-400 hover:text-slate-600 text-2xl transition-colors">&times;</button>
              </div>
              
              <div className="p-6 space-y-5">
                {!importResult ? (
                  <>
                    <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 space-y-3">
                      <h3 className="text-sm font-bold text-primary-900 uppercase tracking-tight">Instruções de Importação</h3>
                      <ul className="text-xs text-primary-800 space-y-2 list-disc pl-4 font-medium opacity-90">
                        <li>Utilize os nomes exatos das colunas do modelo.</li>
                        <li>A coluna <strong>Produto</strong> deve conter o nome exato cadastrado no sistema.</li>
                        <li>O campo <strong>ID</strong> é opcional, mas se preenchido, será usado para <strong>deduplicação</strong>: se o ID já existir, a entrega será atualizada; caso contrário, será criada uma nova.</li>
                        <li><strong>Status</strong> aceitos: BACKLOG, IN_PROGRESS, BLOCKED, DONE, ARCHIVED.</li>
                        <li><strong>Esforço</strong> aceito: PP, P, M, G, GG.</li>
                        <li>A coluna <strong>Responsável Email</strong> deve conter o e-mail do usuário cadastrado.</li>
                      </ul>
                      <button 
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-primary-200 text-primary-700 rounded-lg text-xs font-bold hover:bg-primary-50 transition-all shadow-sm group"
                      >
                        <ExternalLink size={14} className="group-hover:translate-y-[-1px] transition-transform" /> Baixar Modelo CSV
                      </button>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-slate-700">Selecione o arquivo CSV</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 hover:border-primary-300 transition-all cursor-pointer relative">
                        <input 
                          type="file" 
                          accept=".csv"
                          onChange={handleImport}
                          disabled={importing}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-primary-600 mb-3">
                          <Plus size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-600">{importing ? 'Processando arquivo...' : 'Arraste ou clique para selecionar seu CSV'}</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Máximo 5MB</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 py-4">
                    <div className="flex items-center gap-4 justify-center">
                      <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-100 min-w-[120px]">
                        <p className="text-3xl font-black text-green-600">{importResult.created}</p>
                        <p className="text-[10px] text-green-700 font-bold uppercase tracking-widest">Criados</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-100 min-w-[120px]">
                        <p className="text-3xl font-black text-blue-600">{importResult.updated}</p>
                        <p className="text-[10px] text-blue-700 font-bold uppercase tracking-widest">Atualizados</p>
                      </div>
                    </div>
                    
                    {importResult.errors.length > 0 && (
                      <div className="max-h-[200px] overflow-y-auto border border-red-100 rounded-xl bg-red-50/30 p-4">
                        <h4 className="text-xs font-bold text-red-600 uppercase mb-3 flex items-center gap-2">
                          <AlertCircle size={14} /> Erros encontrados ({importResult.errors.length})
                        </h4>
                        <div className="space-y-2">
                          {importResult.errors.map((err: any, idx: number) => (
                            <div key={idx} className="text-[11px] text-red-700 border-b border-red-100 pb-1 flex justify-between gap-4">
                              <span className="font-bold flex-1">{err.item}</span>
                              <span className="opacity-70">{err.error}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => { setShowImport(false); setImportResult(null); }}
                      className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg mt-4"
                    >
                      Concluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-auto">
          {filtered.length} Entregas
        </div>
      </div>

      {viewMode === 'KANBAN' ? (
        <div className={`grid grid-cols-1 md:grid-cols-${showArchived ? 1 : 4} gap-4 items-start`}>
          {Object.entries(STATUS_LABELS).filter(([key]) => showArchived ? key === 'ARCHIVED' : key !== 'ARCHIVED').map(([key, label]) => {
            const columnItems = filtered.filter(i => i.status === key);
            return (
              <div key={key} className="flex flex-col bg-slate-50/50 rounded-xl p-2 border border-slate-100 min-h-[500px]">
                <div className={`flex items-center justify-between px-2 mb-2 border-l-4 ${key === 'DONE' ? 'border-green-500' : key === 'IN_PROGRESS' ? 'border-blue-500' : key === 'BLOCKED' ? 'border-red-500' : 'border-slate-300'}`}>
                  <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{label}</h4>
                  <span className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.5 rounded-full font-bold">{columnItems.length}</span>
                </div>
                
                <div className="space-y-3">
                  {columnItems.map(item => (
                    <div key={item.id} onClick={() => openEdit(item)} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-primary-400 transition-all group cursor-pointer relative">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-mono text-slate-400 uppercase">{item.identifier || 'Task'}</span>
                        <div className="flex gap-1">
                          <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${EFFORT_COLORS[item.effort]}`}>{item.effort}</span>
                        </div>
                      </div>
                      
                      <h5 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-1 leading-tight">{item.title}</h5>
                      
                      {item.completion > 0 && (
                        <div className="mb-2">
                          <div className="flex justify-between items-center text-[9px] font-bold text-primary-600 mb-0.5">
                            <span>EVOLUÇÃO</span>
                            <span>{item.completion}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div className="bg-primary-500 h-full rounded-full transition-all" style={{ width: `${item.completion}%` }} />
                          </div>
                        </div>
                      )}

                      {item.riskPoint && (
                        <div className="mb-2 p-1 bg-red-50 rounded border border-red-100 text-[10px] text-red-600 line-clamp-2">
                          <Flag size={10} className="inline mr-1" /> {item.riskPoint}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-[10px] text-primary-600 font-bold mb-3">
                        <Package size={10} />
                        <span className="truncate">{item.product?.name}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-1">
                          {item.assignee ? (
                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[8px]" title={item.assignee.name}>
                              {item.assignee.name.charAt(0)}
                            </div>
                          ) : <User size={12} className="text-slate-300" />}
                          <span className="text-[10px] text-slate-400">
                            {item.plannedDate ? new Date(item.plannedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—'}
                          </span>
                        </div>
                        {item.confluenceUrl && <ExternalLink size={10} className="text-slate-300 group-hover:text-primary-500" />}
                      </div>

                      <button 
                        onClick={(e) => { e.stopPropagation(); updateStatus(item.id, item.status === 'ARCHIVED' ? 'DONE' : 'ARCHIVED'); }}
                        className="absolute bottom-2 right-8 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-50 border border-slate-200 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        title={item.status === 'ARCHIVED' ? 'Restaurar' : 'Arquivar'}
                      >
                        <Package size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Produto</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Atividade</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Usuário</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data Prevista</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded bg-primary-50 flex items-center justify-center text-primary-600">
                          <Package size={14} />
                       </div>
                       <span className="font-semibold text-slate-700">{item.product?.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-slate-400 uppercase leading-none">{item.identifier || '—'}</span>
                      <span className="font-medium text-slate-900 leading-tight">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-xs">
                    <select
                      value={item.assigneeId || ''}
                      onChange={(e) => updateAssignee(item.id, e.target.value)}
                      className="bg-transparent border-0 text-slate-600 focus:ring-0 cursor-pointer hover:text-primary-600 transition-colors p-0 text-xs"
                    >
                      <option value="">Não atribuído</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                      className={`text-[10px] px-2 py-0.5 rounded font-bold border-0 outline-none cursor-pointer ${STATUS_COLORS[item.status]}`}
                    >
                      {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-1.5">
                    <div className="flex items-center gap-2 text-slate-600 text-xs">
                      <Calendar size={12} className="text-slate-400" />
                      <span>{item.plannedDate ? new Date(item.plannedDate).toLocaleDateString('pt-BR') : '—'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-1.5">
                    <button 
                      onClick={() => updateStatus(item.id, item.status === 'ARCHIVED' ? 'DONE' : 'ARCHIVED')}
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                      title={item.status === 'ARCHIVED' ? 'Restaurar' : 'Arquivar'}
                    >
                      <Package size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-20 bg-slate-50/50">
              <Search size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 text-sm font-medium">Nenhuma entrega encontrada com os filtros atuais</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
