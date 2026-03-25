import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Calendar, User, Flag, Package, Layout, List as ListIcon, Search, ExternalLink, Plus, AlertCircle, Filter, ChevronDown, Check, FolderKanban } from 'lucide-react';
import GanttChart from '../components/Gantt/GanttChart';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

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

const EFFORT_LABELS: Record<string, string> = { PP: 'PP', P: 'P', M: 'M', G: 'G', GG: 'GG' };

const USER_COLORS = [
  'bg-blue-500',   // #3B82F6
  'bg-emerald-500', // #10B981
  'bg-amber-500',   // #F59E0B
  'bg-purple-500',  // #8B5CF6
  'bg-pink-500',    // #EC4899
  'bg-yellow-500',  // #EAB308
  'bg-indigo-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-orange-500',
];

const getUserColor = (userId: number | string | null) => {
  if (!userId) return 'bg-slate-400';
  const id = typeof userId === 'string' ? userId.length : userId;
  return USER_COLORS[id % USER_COLORS.length];
};

const getStatusOpacity = (status: string) => {
  switch (status) {
    case 'BACKLOG': return 'opacity-50';
    case 'DONE': return 'opacity-70 bg-stripe'; 
    case 'BLOCKED': return 'opacity-40 border-2 border-dashed border-red-400';
    case 'IN_PROGRESS': return 'opacity-100';
    default: return 'opacity-100';
  }
};

type ViewMode = 'KANBAN' | 'LIST' | 'GANTT';

// Componente de Filtro Discreto e Escalável
function FilterableMenu({ label, icon, options, selected, onToggle, onClear }: any) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-all text-[10px] font-black tracking-tight outline-none shadow-sm ${selected.length > 0 ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
          {icon}
          <span>{label}</span>
          {selected.length > 0 && (
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary-600 text-white text-[8px] font-bold animate-in zoom-in duration-200">
              {selected.length}
            </span>
          )}
          <ChevronDown size={12} className={`opacity-50 transition-transform duration-200 ${selected.length > 0 ? 'rotate-180' : ''}`} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="z-[100] min-w-[200px] bg-white rounded-xl border border-slate-200 shadow-2xl p-1 animate-in slide-in-from-top-2 duration-200"
          align="start"
          sideOffset={5}
        >
          <div className="max-h-[300px] overflow-y-auto scrollbar-hide py-1">
             <div className="px-2 py-1.5 flex justify-between items-center border-b border-slate-50 mb-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</span>
                <button onClick={onClear} className="text-[9px] font-bold text-primary-600 hover:text-primary-700 leading-none">LIMPAR</button>
             </div>
             {options.map((opt: any) => (
               <DropdownMenu.CheckboxItem
                 key={opt.id}
                 className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-slate-600 outline-none cursor-pointer hover:bg-slate-50 rounded-lg transition-colors group select-none"
                 checked={selected.includes(opt.id)}
                 onCheckedChange={() => onToggle(opt.id)}
               >
                 <div className={`w-3.5 h-3.5 rounded border border-slate-300 flex items-center justify-center shrink-0 transition-all ${selected.includes(opt.id) ? 'bg-primary-600 border-primary-600' : 'bg-white'}`}>
                   {selected.includes(opt.id) && <Check size={10} className="text-white" />}
                 </div>
                 <span className={selected.includes(opt.id) ? 'text-primary-700' : ''}>{opt.name.toUpperCase()}</span>
               </DropdownMenu.CheckboxItem>
             ))}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default function RoadmapPage() {
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('KANBAN');
  
  // Filters
  const [filterProducts, setFilterProducts] = useState<string[]>([]);
  const [filterProjects, setFilterProjects] = useState<string[]>([]);
  const [filterUsers, setFilterUsers] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>(['BACKLOG', 'IN_PROGRESS', 'BLOCKED', 'DONE']);

  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const [sortBy, setSortBy] = useState('PRODUCT');
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const load = () => {
    api.get('/roadmap').then((r) => setItems(r.data));
    api.get('/products').then((r) => setProducts(r.data));
    api.get('/projetos').then((r) => setProjects(r.data));
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

  const updateProject = async (id: string, projectId: string) => {
    await api.put(`/roadmap/${id}`, { projectId: projectId || null });
    load();
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      title: item.title,
      description: item.description || '',
      goalIndicator: item.goalIndicator || '',
      plannedDate: item.plannedDate ? item.plannedDate.slice(0, 10) : '',
      startDateAtividade: item.startDateAtividade ? item.startDateAtividade.slice(0, 10) : '',
      finishDateAtividade: item.finishDateAtividade ? item.finishDateAtividade.slice(0, 10) : '',
      effort: item.effort,
      status: item.status,
      assigneeId: item.assigneeId || '',
      productId: item.productId,
      projectId: item.projectId || '',
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
        startDateAtividade: form.startDateAtividade ? new Date(form.startDateAtividade).toISOString() : null,
        finishDateAtividade: form.status === 'DONE' && form.finishDateAtividade ? new Date(form.finishDateAtividade).toISOString() : null,
      });
      setEditItem(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter((i) => {
    if (filterProducts.length > 0 && !filterProducts.includes(i.productId)) return false;
    if (filterProjects.length > 0 && !filterProjects.includes(i.projectId)) return false;
    if (filterUsers.length > 0 && !filterUsers.includes(i.assigneeId?.toString())) return false;
    if (!filterStatus.includes(i.status)) return false;

    if (searchTerm && !i.title.toLowerCase().includes(searchTerm.toLowerCase()) && !i.identifier?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (showArchived) return i.status === 'ARCHIVED';
    return i.status !== 'ARCHIVED';

  }).sort((a, b) => {
    if (sortBy === 'PRODUCT') return (a.product?.name || '').localeCompare(b.product?.name || '') || a.title.localeCompare(b.title);
    if (sortBy === 'PROJECT') return (a.project?.name || '').localeCompare(b.project?.name || '') || a.title.localeCompare(b.title);
    if (sortBy === 'DATE') return (a.plannedDate || '').localeCompare(b.plannedDate || '');
    if (sortBy === 'STATUS') return a.status.localeCompare(b.status);
    if (sortBy === 'TITLE') return a.title.localeCompare(b.title);
    if (sortBy === 'EVOLUTION') return (b.completion || 0) - (a.completion || 0);
    return 0;
  });

  const exportCSV = () => {
    const headers = ['Produto', 'Projeto', 'ID', 'Título', 'Responsável', 'Status', 'Esforço', 'Data Prevista', 'Conclusão %', 'Risco'];
    const rows = filtered.map(i => [
      i.product?.name || '',
      i.project?.name || '',
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
    const headers = ['ID', 'Produto', 'Projeto', 'Título', 'Descrição', 'Responsável Email', 'Status', 'Esforço', 'Data Prevista', 'Conclusão', 'Risco', 'Confluence'];
    const row = ['PRJ-001', 'Nome do Produto', 'Nome do Projeto', 'Minha Atividade', 'Detalhes da atividade', 'user@company.com', 'BACKLOG', 'M', '2024-12-31', '0', 'Riscos aqui', 'https://confluence.com/link'];

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
          if (h === 'Projeto') obj.projectName = val;
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
      {/* Header compactado e elegante */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-2 px-3 rounded-2xl border border-slate-200 shadow-sm mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200 shrink-0">
            <Layout size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none uppercase">Delivery Global</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Visão consolidada</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Busca minimalista */}
          <div className="relative group">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all w-28 focus:w-40 outline-none font-bold text-slate-600 shadow-inner tracking-tight"
            />
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* Filtros Consolidados */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-50 rounded-xl border border-slate-100">
             <FilterableMenu 
               label="PROJETOS" 
               icon={<FolderKanban size={12} />} 
               options={projects.map(p => ({ id: p.id, name: p.name }))}
               selected={filterProjects}
               onToggle={(id: string) => setFilterProjects(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
               onClear={() => setFilterProjects([])}
             />
             <FilterableMenu 
               label="PRODUTOS" 
               icon={<Package size={12} />} 
               options={products.map(p => ({ id: p.id, name: p.name }))}
               selected={filterProducts}
               onToggle={(id: string) => setFilterProducts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
               onClear={() => setFilterProducts([])}
             />
             <FilterableMenu 
               label="RESPONSÁVEL" 
               icon={<User size={12} />} 
               options={users.map(u => ({ id: u.id.toString(), name: u.name }))}
               selected={filterUsers}
               onToggle={(id: string) => setFilterUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
               onClear={() => setFilterUsers([])}
             />
             <FilterableMenu 
               label="STATUS" 
               icon={<Flag size={12} />} 
               options={Object.entries(STATUS_LABELS).map(([id, name]) => ({ id, name }))}
               selected={filterStatus}
               onToggle={(id: string) => setFilterStatus(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
               onClear={() => setFilterStatus([])}
             />
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* Troca de Visão Compacta */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button onClick={() => setViewMode('KANBAN')} title="Kanban" className={`p-1.5 rounded-md transition-all ${viewMode === 'KANBAN' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}>
              <Layout size={14} />
            </button>
            <button onClick={() => setViewMode('GANTT')} title="Gantt Chart" className={`p-1.5 rounded-md transition-all ${viewMode === 'GANTT' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}>
              <Calendar size={14} />
            </button>
            <button onClick={() => setViewMode('LIST')} title="Lista" className={`p-1.5 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}>
              <ListIcon size={14} />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          <button onClick={() => { setForm({ status: 'BACKLOG', effort: 'M' }); setEditItem(null); setShowModal(true); }} className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-black hover:bg-primary-700 transition-all shadow-sm hover:translate-y-[-1px] active:translate-y-0 flex items-center gap-1.5 tracking-tight">
            <Plus size={14} /> NOVO
          </button>
          
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 shadow-sm transition-all focus:ring-1 focus:ring-primary-500 outline-none">
                <ChevronDown size={14} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="z-[100] bg-white rounded-xl border border-slate-200 shadow-2xl p-1 w-40 animate-in slide-in-from-top-1 duration-200" align="end">
               <div className="px-2 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">AÇÕES</div>
               <DropdownMenu.Item className="flex items-center gap-2 px-2 py-2 text-xs font-bold text-slate-600 outline-none cursor-pointer hover:bg-slate-50 rounded-lg transition-colors" onClick={exportCSV}>
                 <ExternalLink size={14} className="text-slate-400" /> EXPORTAR CSV
               </DropdownMenu.Item>
               <DropdownMenu.Item className="flex items-center gap-2 px-2 py-2 text-xs font-bold text-slate-600 outline-none cursor-pointer hover:bg-slate-50 rounded-lg transition-colors" onClick={() => setShowImport(true)}>
                 <Package size={14} className="text-slate-400" /> IMPORTAR CSV
               </DropdownMenu.Item>
               <DropdownMenu.Item className="flex items-center gap-2 px-2 py-2 text-xs font-bold text-slate-600 outline-none cursor-pointer hover:bg-slate-50 rounded-lg transition-colors" onClick={downloadTemplate}>
                 <Calendar size={14} className="text-slate-400" /> TEMPLATE CSV
               </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>

      {editItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 uppercase tracking-tight">Editar Atividade</h2>
              <button onClick={() => setEditItem(null)} className="text-slate-400 hover:text-slate-600 text-lg transition-colors">&times;</button>
            </div>
            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-4 gap-3">
                 <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">ID</label>
                    <input className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold bg-slate-50 focus:ring-1 focus:ring-primary-500 outline-none" value={form.identifier} onChange={(e) => setForm({...form, identifier: e.target.value})} />
                 </div>
                 <div className="col-span-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Título</label>
                    <input className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold focus:ring-1 focus:ring-primary-500 outline-none" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
                 </div>
              </div>
              <div>
                 <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Detalhamento</label>
                 <textarea className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary-500 outline-none" rows={2} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data Início</label>
                    <input type="date" className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold" value={form.startDateAtividade} onChange={(e) => setForm({...form, startDateAtividade: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data Prevista (Fim)</label>
                    <input type="date" className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold" value={form.plannedDate} onChange={(e) => setForm({...form, plannedDate: e.target.value})} />
                 </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">% Evolução</label>
                    <input type="number" className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold" value={form.completion} onChange={(e) => setForm({...form, completion: parseInt(e.target.value) || 0})} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Esforço</label>
                    <select className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold" value={form.effort} onChange={(e) => setForm({...form, effort: e.target.value})}>
                      {Object.entries(EFFORT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Conclusão Real</label>
                    <input type="date" className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold opacity-60" value={form.finishDateAtividade} onChange={(e) => setForm({...form, finishDateAtividade: e.target.value})} />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Responsável</label>
                    <select className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold" value={form.assigneeId} onChange={(e) => setForm({...form, assigneeId: e.target.value})}>
                      <option value="">Ninguém</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                    <select className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold text-primary-600" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                      {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Projeto</label>
                    <select className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold" value={form.projectId} onChange={(e) => setForm({...form, projectId: e.target.value})}>
                      <option value="">Sem Projeto</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Produto</label>
                    <select className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold bg-slate-50 text-slate-500" value={form.productId} disabled>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                 </div>
              </div>
            </div>
            <div className="p-4 bg-red-50/50 border-t border-red-100">
              <label className="block text-[10px] font-black text-red-500 uppercase mb-1 tracking-widest flex items-center gap-1">
                <Flag size={10} /> Ponto de Risco
              </label>
              <textarea className="w-full text-sm p-2 border border-red-200 bg-white rounded-lg text-red-700 min-h-[60px] placeholder-red-300" value={form.riskPoint} onChange={(e) => setForm({...form, riskPoint: e.target.value})} placeholder="Descreva possíveis riscos..." />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
               <button onClick={() => setEditItem(null)} className="px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
               <button onClick={save} disabled={saving} className="px-6 py-2 bg-primary-600 text-white text-xs font-black rounded-lg shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all hover:translate-y-[-1px] active:translate-y-0 disabled:opacity-50">
                 {saving ? 'GRAVANDO...' : 'GRAVAR ALTERAÇÕES'}
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

      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {filtered.length} Entregas encontradas
        </div>
      </div>

      {viewMode === 'KANBAN' && (
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
                        <span className="truncate">{item.product?.name} {item.project ? ` | ${item.project.name}` : ''}</span>
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
      )}

      {viewMode === 'GANTT' && (
        <GanttChart 
          items={filtered} 
          projects={projects} 
          products={products} 
          onEditTask={openEdit}
          getUserColor={getUserColor}
          getStatusOpacity={getStatusOpacity}
        />
      )}

      {viewMode === 'LIST' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Produto</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Projeto</th>
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
                  <td className="px-3 py-1.5 text-xs text-slate-500 font-medium truncate max-w-[150px]">
                    <select
                      value={item.projectId || ''}
                      onChange={(e) => updateProject(item.id, e.target.value)}
                      className="bg-transparent border-0 text-slate-600 focus:ring-0 cursor-pointer hover:text-primary-600 transition-colors p-0 text-xs w-full"
                    >
                      <option value="">Sem Projeto</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
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

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 uppercase tracking-tight">Nova Atividade</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
            </div>
            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">ID</label>
                  <input className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold bg-slate-50 focus:ring-1 focus:ring-primary-500 outline-none" value={form.identifier || ''} onChange={(e) => setForm({...form, identifier: e.target.value})} placeholder="PROJ-001" />
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Título *</label>
                  <input className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold focus:ring-1 focus:ring-primary-500 outline-none" value={form.title || ''} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Título da atividade" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Detalhamento</label>
                <textarea className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary-500 outline-none" rows={2} value={form.description || ''} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Descrição da atividade..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Produto *</label>
                  <select className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold" value={form.productId || ''} onChange={(e) => setForm({...form, productId: e.target.value})}>
                    <option value="">Selecione o Produto</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Projeto</label>
                  <select className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold" value={form.projectId || ''} onChange={(e) => setForm({...form, projectId: e.target.value})}>
                    <option value="">Sem Projeto</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data Início</label>
                  <input type="date" className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold" value={form.startDateAtividade || ''} onChange={(e) => setForm({...form, startDateAtividade: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data Prevista (Fim)</label>
                  <input type="date" className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold" value={form.plannedDate || ''} onChange={(e) => setForm({...form, plannedDate: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">% Evolução</label>
                  <input type="number" className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold" value={form.completion || 0} onChange={(e) => setForm({...form, completion: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Esforço</label>
                  <select className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold" value={form.effort || 'M'} onChange={(e) => setForm({...form, effort: e.target.value})}>
                    {Object.entries(EFFORT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Responsável</label>
                  <select className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold" value={form.assigneeId || ''} onChange={(e) => setForm({...form, assigneeId: e.target.value})}>
                    <option value="">Ninguém</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                  <select className="w-full text-sm p-2 border border-slate-200 rounded-lg font-bold text-primary-600" value={form.status || 'BACKLOG'} onChange={(e) => setForm({...form, status: e.target.value})}>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Documentação</label>
                  <input className="w-full text-sm p-2 border border-slate-200 rounded-lg" value={form.confluenceUrl || ''} onChange={(e) => setForm({...form, confluenceUrl: e.target.value})} placeholder="https://..." />
                </div>
              </div>
            </div>
            <div className="p-4 bg-red-50/50 border-t border-red-100">
              <label className="block text-[10px] font-black text-red-500 uppercase mb-1 tracking-widest flex items-center gap-1">
                <Flag size={10} /> Ponto de Risco
              </label>
              <textarea className="w-full text-sm p-2 border border-red-200 bg-white rounded-lg text-red-700 min-h-[60px] placeholder-red-300" value={form.riskPoint || ''} onChange={(e) => setForm({...form, riskPoint: e.target.value})} placeholder="Descreva possíveis riscos..." />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
              <button
                onClick={async () => {
                  setSaving(true);
                  try {
                    await api.post('/roadmap', {
                      ...form,
                      assigneeId: form.assigneeId ? parseInt(form.assigneeId) : null,
                      plannedDate: form.plannedDate ? new Date(form.plannedDate).toISOString() : null,
                      startDateAtividade: form.startDateAtividade ? new Date(form.startDateAtividade).toISOString() : null,
                      projectId: form.projectId || null,
                    });
                    setShowModal(false);
                    setForm({ status: 'BACKLOG', effort: 'M' });
                    load();
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving || !form.productId || !form.title}
                className="px-6 py-2 bg-primary-600 text-white text-xs font-black rounded-lg shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all disabled:opacity-50"
              >
                {saving ? 'CRIANDO...' : 'CRIAR ATIVIDADE'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
