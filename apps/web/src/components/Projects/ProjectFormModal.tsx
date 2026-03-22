import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { X, Calendar, User, Flag, Link, AlertTriangle } from 'lucide-react';

interface ProjectFormModalProps {
  project?: any;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProjectFormModal({ project, onClose, onSaved }: ProjectFormModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    name: '',
    description: '',
    status: 'PLANEJADO',
    startDate: '',
    forecastDate: '',
    finishDate: '',
    documentationLink: '',
    poId: '',
    riskPoint: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/users').then((r) => setUsers(r.data));
    if (project) {
      setForm({
        ...project,
        poId: project.poId.toString(),
        startDate: project.startDate.slice(0, 10),
        forecastDate: project.forecastDate.slice(0, 10),
        finishDate: project.finishDate ? project.finishDate.slice(0, 10) : '',
      });
    }
  }, [project]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const data = {
        ...form,
        poId: parseInt(form.poId),
        startDate: new Date(form.startDate).toISOString(),
        forecastDate: new Date(form.forecastDate).toISOString(),
        finishDate: form.status === 'FINALIZADO' && form.finishDate ? new Date(form.finishDate).toISOString() : null,
      };

      // Remove relation objects and auto-generated fields that crash Prisma
      delete data.po;
      delete data.roadmapItems;
      delete data.completion;
      delete data.createdAt;
      delete data.updatedAt;

      if (project) {
        await api.put(`/projetos/${project.id}`, data);
      } else {
        await api.post('/projetos', data);
      }

      onSaved();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erro ao salvar projeto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Excluir este projeto?')) return;
    try {
      await api.delete(`/projetos/${project.id}`);
      onSaved();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erro ao excluir projeto');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-primary-600 font-bold">
            <span className="p-1.5 bg-white rounded-lg border border-slate-100 shadow-sm">
                <Flag size={16} />
            </span>
            <h2 className="text-slate-800 text-sm tracking-tight">{project ? 'Editar Projeto' : 'Novo Projeto'}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={save} className="p-4 space-y-3">
          {error && (
            <div className="p-2 bg-red-50 border border-red-100 rounded-lg text-red-700 text-[11px] font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertTriangle size={14} className="shrink-0" /> {error}
            </div>
          )}

          <div className="grid grid-cols-6 gap-3">
             <div className="col-span-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Nome do Projeto</label>
                <div className="relative group">
                  <input 
                    required 
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-semibold outline-none" 
                    value={form.name} 
                    onChange={(e) => setForm({...form, name: e.target.value})} 
                    placeholder="Ex: Novo Filtro de Buscas"
                  />
                </div>
             </div>
             <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Status</label>
                <select 
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-bold outline-none" 
                    value={form.status} 
                    onChange={(e) => setForm({...form, status: e.target.value})}
                >
                  <option value="PLANEJADO">Planejado</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="PAUSADO">Pausado</option>
                  <option value="FINALIZADO">Finalizado</option>
                </select>
             </div>
          </div>

          <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Descrição Detalhada</label>
             <textarea 
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none leading-relaxed min-h-[60px]" 
                rows={2} 
                value={form.description} 
                onChange={(e) => setForm({...form, description: e.target.value})} 
                placeholder="Descreva o objetivo deste projeto..."
             />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Product Owner (PO)</label>
                <div className="relative">
                    <User size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                        required 
                        className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-bold outline-none appearance-none" 
                        value={form.poId} 
                        onChange={(e) => setForm({...form, poId: e.target.value})}
                    >
                      <option value="">Selecione...</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
             </div>
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Documentação</label>
                <div className="relative">
                    <Link size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" 
                        value={form.documentationLink} 
                        onChange={(e) => setForm({...form, documentationLink: e.target.value})} 
                        placeholder="Link do Confluence/Drive"
                    />
                </div>
             </div>
          </div>

          <div className={`grid ${form.status === 'FINALIZADO' ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Início</label>
                <input required type="date" className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none font-bold text-slate-700" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} />
             </div>
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Previsão</label>
                <input required type="date" className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none font-bold text-slate-700" value={form.forecastDate} onChange={(e) => setForm({...form, forecastDate: e.target.value})} />
             </div>
             {form.status === 'FINALIZADO' && (
                <div className="animate-in slide-in-from-left-2 duration-300">
                    <label className="block text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1 ml-1">Finalização</label>
                    <input required type="date" className="w-full text-xs p-2 bg-primary-50 border border-primary-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none font-bold text-primary-700" value={form.finishDate} onChange={(e) => setForm({...form, finishDate: e.target.value})} />
                </div>
             )}
          </div>

          <div>
             <label className="block text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 ml-1">Pontos de Risco / Impedimentos</label>
             <div className="relative">
                <AlertTriangle size={14} className="absolute left-2.5 top-3 text-red-400" />
                <textarea 
                    className="w-full text-xs pl-8 pr-3 py-2 bg-red-50/30 border border-red-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all outline-none text-red-900 font-medium leading-relaxed" 
                    rows={2} 
                    value={form.riskPoint} 
                    onChange={(e) => setForm({...form, riskPoint: e.target.value})} 
                    placeholder="Descreva eventuais riscos ou bloqueios para este projeto..."
                />
             </div>
          </div>

          <div className="flex items-center justify-between pt-4 gap-4">
            {project && (
              <button 
                type="button" 
                onClick={handleDelete}
                className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center gap-1.5 px-3 py-1 bg-red-50 rounded-lg hover:bg-red-100/50"
              >
                Remover Projeto
              </button>
            )}
            <div className="flex items-center gap-2 ml-auto">
                <button type="button" onClick={onClose} className="px-5 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Cancelar</button>
                <button 
                    disabled={saving} 
                    className="px-8 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:bg-primary-700 hover:translate-y-[-1px] active:translate-y-[0px] transition-all disabled:opacity-50 tracking-widest uppercase"
                >
                {saving ? 'Gravando...' : 'Gravar Projeto'}
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
