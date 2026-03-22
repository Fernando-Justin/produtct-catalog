import React from 'react';
import { 
  Rocket, Shield, Zap, Cpu, Code2, 
  Workflow, Database, Box, Send, Github, 
  Heart, Sparkles, LayoutPanelLeft, GanttChart as GanttIcon,
  Search, Target, BarChart3, Layers, AppWindow,
  Users2, Globe, MousePointer2, Settings2, Terminal,
  Package, LayoutDashboard, GitBranch, Boxes, Users, ClipboardList
} from 'lucide-react';

export default function AboutPage() {
  const modules = [
    { icon: LayoutDashboard, name: 'Dashboard Inteligente', desc: 'Métricas em tempo real de saúde técnica e progresso de entregas.', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: Package, name: 'Catálogo de Produtos', desc: 'Single Source of Truth para todos os produtos e suas stacks.', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: GitBranch, name: 'Delivery Global', desc: 'Gestão de roadmaps com visão Kanban e Gráfico de Gantt moderno.', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { icon: Boxes, name: 'Gestão de Squads', desc: 'Organização de times alocados por produto e responsabilidades.', color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: Users, name: 'Usuários & Permissões', desc: 'Controle de acesso granular via roles (Admin, PO, Dev, Lead).', color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: ClipboardList, name: 'Sugestões & Clientes', desc: 'Captura de feedbacks e integração direta com o backlog.', color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  return (
    <div className="min-h-full bg-white animate-in fade-in duration-500">
      
      {/* Top Header / Logo Area */}
      <div className="border-b border-slate-100 px-8 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 rotate-1">
            <Package size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              Product<span className="text-primary-600">SQUAD</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manager v1.0.0</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
           <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Online</span>
           </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-16">
        
        {/* Compact Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-[0.2em] border border-primary-100">
              <Sparkles size={12} /> Engenharia de Alta Performance
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
              A Nova Era da <span className="text-primary-600">Gestão Visual</span> de Produtos.
            </h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-xl">
              Elimine o caos das planilhas. Garanta visibilidade técnica, transparência de delivery e eficiência operacional em uma única plataforma comercial.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
               <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white shadow-xl shadow-slate-900/10 transition-transform hover:-translate-y-0.5 cursor-default">
                  <Database size={16} className="text-primary-400" />
                  <span className="text-xs font-bold uppercase tracking-tight">Single Source of Truth</span>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm transition-transform hover:-translate-y-0.5 cursor-default">
                  <GanttIcon size={16} className="text-indigo-500" />
                  <span className="text-xs font-bold uppercase tracking-tight">Modern Gantt</span>
               </div>
            </div>
          </div>
          
          {/* Visual Elements Group */}
          <div className="md:w-1/3 grid grid-cols-2 gap-4 p-4">
             <div className="bg-blue-500 h-24 rounded-3xl shadow-lg shadow-blue-500/20 flex items-center justify-center -rotate-6"><Zap size={32} className="text-white" /></div>
             <div className="bg-emerald-500 h-24 rounded-3xl shadow-lg shadow-emerald-500/20 flex items-center justify-center rotate-3 mt-8"><Target size={32} className="text-white" /></div>
             <div className="bg-amber-500 h-24 rounded-3xl shadow-lg shadow-amber-500/20 flex items-center justify-center -rotate-3 -mt-4"><Shield size={32} className="text-white" /></div>
             <div className="bg-indigo-500 h-24 rounded-3xl shadow-lg shadow-indigo-500/20 flex items-center justify-center rotate-6 mt-4"><Rocket size={32} className="text-white" /></div>
          </div>
        </div>

        {/* Modules Section - Cleaner Grid */}
        <div className="space-y-8">
           <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-900 uppercase italic">Ecossistema de Módulos</h3>
              <p className="text-slate-400 text-sm font-medium">Arquitetura modular desenhada para eficiência máxima.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((m, idx) => (
                <div key={idx} className="group p-6 rounded-[2rem] bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:border-primary-100 flex flex-col items-start gap-4">
                   <div className={`w-12 h-12 rounded-2xl ${m.bg} ${m.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                      <m.icon size={24} />
                   </div>
                   <div className="space-y-1">
                      <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">{m.name}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{m.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Methodology & Tech - Compact Horizontal */}
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
           
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="md:w-1/2 space-y-6">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-400 text-[10px] font-black uppercase tracking-widest border border-white/5">
                    <Workflow size={12} /> Engenharia SDD
                 </div>
                 <h3 className="text-3xl font-black italic tracking-tighter">Poder Artificial, <br/>Precisão de Especialista.</h3>
                 <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    Construído com agentes de IA especializados do framework **Antigravity** e **Claude Code**, seguindo a metodologia **Spec-Driven Development**. Código robusto, escalável e 100% testado.
                 </p>
                 <div className="flex gap-4 pt-2">
                    {[Code2, Layers, Cpu, Terminal].map((Ico, idx) => (
                       <div key={idx} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary-500 transition-colors cursor-default">
                          <Ico size={18} />
                       </div>
                    ))}
                 </div>
              </div>
              
              <div className="md:w-1/2 grid grid-cols-2 gap-4">
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <h5 className="text-[10px] font-black text-primary-400 uppercase tracking-widest leading-none">Stack</h5>
                    <p className="text-xs font-bold text-slate-200">React + Prisma + Supabase</p>
                 </div>
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <h5 className="text-[10px] font-black text-primary-400 uppercase tracking-widest leading-none">Architecture</h5>
                    <p className="text-xs font-bold text-slate-200">Turborepo & Micro-Services</p>
                 </div>
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <h5 className="text-[10px] font-black text-primary-400 uppercase tracking-widest leading-none">Security</h5>
                    <p className="text-xs font-bold text-slate-200">Roles-Based JWT Control</p>
                 </div>
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <h5 className="text-[10px] font-black text-primary-400 uppercase tracking-widest leading-none">Design</h5>
                    <p className="text-xs font-bold text-slate-200">Tailwind Visual High Density</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Simple Commercial Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-slate-100 pb-12 px-2">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/20 group">
                 <Users2 size={24} className="group-hover:scale-110 transition-transform" />
              </div>
              <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Crafted by</p>
                 <p className="text-xl font-black text-slate-900 tracking-tighter italic">By Justin</p>
              </div>
           </div>
           
           <div className="flex flex-col items-center md:items-end gap-2">
              <div className="flex items-center gap-3">
                 <Github size={16} className="text-slate-300 hover:text-slate-900 transition-colors cursor-pointer" />
                 <Globe size={16} className="text-slate-300 hover:text-slate-900 transition-colors cursor-pointer" />
                 <Send size={16} className="text-slate-300 hover:text-slate-900 transition-colors cursor-pointer" />
              </div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center gap-2">
                 Modern Software Excellence <Heart size={10} className="text-rose-400 fill-rose-400" /> 2026
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}
