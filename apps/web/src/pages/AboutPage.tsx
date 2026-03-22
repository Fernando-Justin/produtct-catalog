import React from 'react';
import { 
  Rocket, Shield, Zap, Info, Cpu, Code2, 
  Workflow, Database, Box, Send, Github, 
  Heart, Sparkles, LayoutPanelLeft, GanttChartIcon 
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-full bg-slate-50/50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-12 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/20 rotate-3">
              <Rocket size={48} className="text-white animate-bounce-slow" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">
                Product <span className="text-primary-400">Catalog</span>
              </h1>
              <p className="text-slate-400 text-lg font-medium mt-2 max-w-xl">
                Uma plataforma moderna de gestão de produtos e delivery, construída com o estado da arte do desenvolvimento orientado à inteligência artificial.
              </p>
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <GanttChartIcon size={20} />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Gestão à Vista</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Transparência total no fluxo de trabalho com um Gráfico de Gantt moderno e interativo, permitindo identificar gargalos em tempo real.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Workflow size={20} />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Engenharia SDD</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Desenvolvido via <span className="font-bold text-slate-700">Spec-Driven Development</span>, garantindo que cada requisito seja uma realidade funcional e testada.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Cpu size={20} />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">AI Frameworks</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Construído com <span className="font-bold text-slate-700">Antigravity</span> e <span className="font-bold text-slate-700">Claude Code</span>, utilizando agentes especializados para código de alta performance.
            </p>
          </div>
        </div>

        {/* The Story Section */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 p-8 lg:p-12 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-widest">
              <Sparkles size={12} /> Engenharia Moderna
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase">A Revolução do Desenvolvimento</h2>
            <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
              <p>
                O Product Catalog não é apenas um software de gestão; é um experimento de sucesso em **Advanced Agentic Coding**. Utilizando o poder do **Claude 3.7 Sonnet** e a arquitetura **Antigravity**, conseguimos iterar em velocidades sem precedentes.
              </p>
              <p>
                A metodologia **SDD** permitiu que a aplicação nascesse de especificações robustas, onde cada componente — do banco de dados ao Gráfico de Gantt — foi otimizado por agentes de IA treinados em padrões de arquitetura modernos.
              </p>
              <p>
                O resultado é um sistema responsivo, escalável e visualmente premium, focado no que realmente importa: a entrega de valor contínua.
              </p>
            </div>
          </div>
          <div className="md:w-1/2 bg-slate-50 p-8 border-l border-slate-200">
             <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
               <Database size={16} className="text-primary-500" /> Stack Tecnológica
             </h4>
             <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Typescript', icon: Code2, color: 'text-blue-500' },
                  { name: 'React', icon: LayoutPanelLeft, color: 'text-cyan-500' },
                  { name: 'Tailwind CSS', icon: Box, color: 'text-sky-400' },
                  { name: 'Prisma ORM', icon: Database, color: 'text-indigo-600' },
                  { name: 'Supabase', icon: Shield, color: 'text-emerald-500' },
                  { name: 'Node.js', icon: Zap, color: 'text-amber-500' },
                ].map((tech) => (
                  <div key={tech.name} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <tech.icon size={16} className={tech.color} />
                    <span className="text-xs font-bold text-slate-700">{tech.name}</span>
                  </div>
                ))}
             </div>
             
             <div className="mt-8 p-4 rounded-2xl bg-slate-900 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 translate-x-12 -translate-y-12 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1">Developer</p>
                  <p className="text-xl font-black italic tracking-tight">By Justin</p>
                  <div className="flex gap-3 mt-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors">
                      <Github size={14} />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors">
                      <Send size={14} />
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center pb-8">
           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
             Desenvolvido com <Heart size={10} className="text-red-400 fill-red-400" /> para a Modernidade v1.0.0
           </p>
        </div>

      </div>
    </div>
  );
}
