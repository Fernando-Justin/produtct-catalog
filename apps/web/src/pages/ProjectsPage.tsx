import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Plus, Search, FolderKanban, ChevronRight, Calendar, User, Flag, AlertCircle, ListTodo, X, Loader2 } from 'lucide-react';
import ProjectFormModal from '../components/Projects/ProjectFormModal';

const ACTIVITY_STATUS_COLORS: Record<string, string> = {
  BACKLOG: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  BLOCKED: 'bg-red-100 text-red-700',
  DONE: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-slate-200 text-slate-500',
};

const ACTIVITY_STATUS_LABELS: Record<string, string> = {
  BACKLOG: 'Backlog', IN_PROGRESS: 'Em Progresso', BLOCKED: 'Bloqueado', DONE: 'Concluído', ARCHIVED: 'Arquivado',
};

const formatDateShort = (dateStr: string | null | undefined) => {
  if (!dateStr) return '';
  const datePart = dateStr.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}`;
};

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'PLANEJADO' | 'EM_ANDAMENTO' | 'PAUSADO' | 'FINALIZADO';
  startDate: string;
  forecastDate: string;
  finishDate?: string;
  documentationLink?: string;
  poId: number;
  po: { name: string };
  riskPoint?: string;
  completion: number;
  createdAt: string;
}

const STATUS_COLORS = {
  PLANEJADO: 'bg-blue-100 text-blue-700',
  EM_ANDAMENTO: 'bg-green-100 text-green-700',
  PAUSADO: 'bg-amber-100 text-amber-700',
  FINALIZADO: 'bg-slate-100 text-slate-700',
};

const STATUS_LABELS = {
  PLANEJADO: 'Planejado',
  EM_ANDAMENTO: 'Em Andamento',
  PAUSADO: 'Pausado',
  FINALIZADO: 'Finalizado',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [loading, setLoading] = useState(true);
  const [activitiesProject, setActivitiesProject] = useState<Project | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projetos', { params: { status: filterStatus } });
      setProjects(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterStatus]);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.po?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (p: Project) => {
    setEditingProject(p);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingProject(undefined);
    setShowModal(true);
  };

  const openActivities = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setActivitiesProject(project);
    setLoadingActivities(true);
    try {
      const res = await api.get('/roadmap', { params: { projectId: project.id } });
      setActivities(res.data);
    } catch {
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">Projetos</h1>
          <p className="text-slate-500 text-[11px] leading-tight">Gerencie os projetos e acompanhe a evolução das entregas</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> Novo Projeto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar projeto ou PO..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
          />
        </div>

        <select
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Todos os Status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => handleEdit(p)}
              className="bg-white rounded-xl border border-slate-200 hover:border-primary-400 hover:shadow-lg transition-all p-4 group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary-600 transition-colors">
                      <FolderKanban size={20} className="text-primary-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-slate-900 group-hover:text-primary-700 transition-colors leading-tight font-bold">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <User size={12} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{p.po?.name || 'Sem PO'}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${STATUS_COLORS[p.status]}`}>
                    {STATUS_LABELS[p.status]}
                  </span>
                </div>

                {p.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed italic">"{p.description}"</p>
                )}

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-tight">Evolução</span>
                    </div>
                    <span className="text-[10px] font-black text-primary-600">{p.completion}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(37,99,235,0.3)]" 
                      style={{ width: `${p.completion}%` }} 
                    />
                  </div>
                </div>

                {p.riskPoint && (
                  <div className="mb-4 p-2 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2">
                    <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-red-700 font-medium leading-tight line-clamp-2">{p.riskPoint}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[8px] opacity-60">Início</span>
                    <span className="text-slate-600">{formatDateShort(p.startDate)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] opacity-60">Previsão</span>
                    <span className="text-slate-600">{formatDateShort(p.forecastDate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => openActivities(e, p)}
                    className="flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100 transition-all text-[9px] font-black uppercase tracking-tight border border-primary-100 hover:border-primary-200 shadow-sm"
                    title="Ver Atividades"
                  >
                    <ListTodo size={12} />
                    Atividades
                  </button>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <FolderKanban size={48} className="mx-auto mb-4 text-slate-200" />
          <p className="text-slate-500 font-medium">Nenhum projeto encontrado</p>
          <button onClick={handleCreate} className="mt-4 text-primary-600 font-bold text-sm hover:underline">Criar primeiro projeto</button>
        </div>
      )}

      {showModal && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}

      {/* Popup de Atividades do Projeto */}
      {activitiesProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActivitiesProject(null)}>
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center">
                  <ListTodo size={14} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xs font-black text-slate-800 uppercase tracking-tight leading-none">{activitiesProject.name}</h2>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Atividades do projeto</p>
                </div>
              </div>
              <button onClick={() => setActivitiesProject(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-md">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto">
              {loadingActivities ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={20} className="animate-spin text-primary-500" />
                  <span className="ml-2 text-xs text-slate-400 font-bold">Carregando...</span>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-10">
                  <ListTodo size={28} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-[10px] text-slate-400 font-bold">Nenhuma atividade vinculada</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-3 py-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">Título</th>
                      <th className="text-left px-2 py-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest w-24">Responsável</th>
                      <th className="text-left px-2 py-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest w-24">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {activities.map((act: any) => (
                      <tr key={act.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-3 py-1.5">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-700 leading-tight line-clamp-1">{act.title}</span>
                            {act.identifier && <span className="text-[8px] font-mono text-slate-400 mt-0.5">{act.identifier}</span>}
                          </div>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex items-center gap-1">
                            {act.assignee ? (
                              <>
                                <div className="w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-[7px] shrink-0">
                                  {act.assignee.name.charAt(0)}
                                </div>
                                <span className="text-[9px] text-slate-600 font-medium truncate">{act.assignee.name.split(' ')[0]}</span>
                              </>
                            ) : (
                              <span className="text-[9px] text-slate-300 italic">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-1.5">
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap ${ACTIVITY_STATUS_COLORS[act.status] || 'bg-slate-100 text-slate-500'}`}>
                            {ACTIVITY_STATUS_LABELS[act.status] || act.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="px-3 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {activities.length} {activities.length === 1 ? 'atividade' : 'atividades'}
              </span>
              <button onClick={() => setActivitiesProject(null)} className="px-3 py-1 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-700 transition-colors">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
