import React, { useMemo, useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, User, Package, FolderKanban, Calendar, Check, AlertTriangle } from 'lucide-react';

interface GanttChartProps {
  items: any[];
  projects: any[];
  products: any[];
  onEditTask: (task: any) => void;
  getUserColor: (userId: any) => string;
  getStatusOpacity: (status: string) => string;
}

export default function GanttChart({ items, projects, products, onEditTask, getUserColor, getStatusOpacity }: GanttChartProps) {
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const scrollRef = React.useRef<HTMLDivElement>(null);
  
  // Timeline setup: Full Year (Current Year)
  const timeline = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Start from Jan 1st of current year
    const startDate = new Date(today.getFullYear(), 0, 1);

    const days: Date[] = [];
    const yearEnd = new Date(today.getFullYear(), 11, 31);
    const totalDays = Math.ceil((yearEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      days.push(d);
    }
    return { startDate, days, today };
  }, []);

  // Grouping
  const groupedData = useMemo(() => {
    const projMap: Record<string, any> = {};
    
    // Ensure all current projects are represented if they have items
    projects.forEach(p => {
      projMap[p.id] = { ...p, products: {} };
    });
    
    // "No Project" catch-all
    projMap['none'] = { id: 'none', name: 'Sem Projeto', products: {} };

    items.forEach(item => {
      const pId = item.projectId || 'none';
      if (!projMap[pId]) projMap[pId] = { id: pId, name: 'Projeto Desconhecido', products: {} };
      
      const prodId = item.productId || 'none';
      if (!projMap[pId].products[prodId]) {
        projMap[pId].products[prodId] = { 
          id: prodId, 
          name: products.find(p => p.id === prodId)?.name || 'Sem Produto',
          items: [] 
        };
      }
      projMap[pId].products[prodId].items.push(item);
    });

    return Object.values(projMap).filter(p => Object.keys(p.products).length > 0);
  }, [items, projects, products]);

  // Expand all by default
  useEffect(() => {
    if (groupedData.length > 0) {
      const initial: Record<string, boolean> = {};
      groupedData.forEach(p => {
        initial[p.id] = true;
      });
      setExpandedProjects(initial);
    }
  }, [groupedData.length]);

  // Auto-scroll to today
  useEffect(() => {
    if (scrollRef.current) {
      const todayIdx = getDayPosition(new Date().toISOString());
      if (todayIdx !== null) {
        // Scroll slightly back from center to show context
        scrollRef.current.scrollLeft = (todayIdx * 32) - 200; 
      }
    }
  }, [timeline]);

  const toggleProject = (id: string) => {
    setExpandedProjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getDayPosition = (dateStr: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    const diff = d.getTime() - timeline.startDate.getTime();
    const dayIndex = Math.floor(diff / (1000 * 60 * 60 * 24));
    return dayIndex;
  };

  const todayIndex = getDayPosition(new Date().toISOString());

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Scrollable Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
      >
        <div className="min-w-max relative">
          
          {/* Timeline Header Row */}
          <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-40">
            <div className="w-64 border-r border-slate-200 bg-slate-50 flex items-center px-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest shrink-0 sticky left-0 z-50">
              Estrutura / Timeline {new Date().getFullYear()}
            </div>
            {timeline.days.map((day, idx) => {
              const isMonday = day.getDay() === 1;
              const isToday = day.getTime() === timeline.today.getTime();
              const isFirstOfMonth = day.getDate() === 1;

              return (
                <div 
                  key={idx} 
                  className={`min-w-[32px] w-8 h-12 flex flex-col items-center justify-center border-r border-slate-100/50 relative ${isMonday ? 'bg-slate-100/30' : ''}`}
                >
                  <span className="text-[7px] font-black text-slate-300 absolute top-1 uppercase tracking-tighter">
                    {day.toLocaleDateString('pt-BR', { weekday: 'short' }).charAt(0)}
                  </span>
                  {(isFirstOfMonth || (isMonday && day.getDate() <= 7)) && (
                    <span className="absolute -top-0.5 text-[8px] font-black text-primary-500/50 whitespace-nowrap">
                      {day.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold mt-1 ${isToday ? 'text-primary-600' : 'text-slate-500'}`}>
                    {day.getDate()}
                  </span>
                  {isToday && <div className="absolute bottom-1 w-1 h-1 bg-primary-500 rounded-full" />}
                </div>
              );
            })}
          </div>

          {/* Today Divider Plane */}
          {todayIndex !== null && todayIndex >= 0 && todayIndex < timeline.days.length && (
            <div 
              className="absolute top-12 bottom-0 border-l border-primary-500/20 border-dashed z-0 pointer-events-none"
              style={{ left: `calc(16rem + ${todayIndex * 32}px)` }}
            />
          )}

          {/* Body Content */}
          <div className="relative">
            {groupedData.map((project: any) => (
              <div key={project.id} className="border-b border-slate-100">
                {/* Project Row */}
                <div className="flex group hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toggleProject(project.id)}>
                  <div className="w-64 border-r border-slate-200 py-2 px-3 flex items-center gap-2 sticky left-0 bg-white group-hover:bg-slate-50 z-30 shadow-[4px_0_10_px_-4px_rgba(0,0,0,0.05)]">
                    {expandedProjects[project.id] ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                    <FolderKanban size={14} className="text-primary-500" />
                    <span className="text-xs font-bold text-slate-800 truncate uppercase tracking-tight">{project.name}</span>
                  </div>
                  <div className="flex-1 h-10 bg-slate-50/10 flex">
                    {timeline.days.map((_, i) => (
                      <div key={i} className="min-w-[32px] w-8 border-r border-slate-50/50 h-full" />
                    ))}
                  </div>
                </div>

                {expandedProjects[project.id] && Object.values(project.products).map((product: any) => (
                  <React.Fragment key={product.id}>
                    {/* Product Row */}
                    <div className="flex group hover:bg-slate-50 transition-colors">
                      <div className="w-64 border-r border-slate-200 py-1.5 px-6 flex items-center gap-2 sticky left-0 bg-white group-hover:bg-slate-50 z-30 opacity-90">
                        <Package size={12} className="text-slate-400" />
                        <span className="text-[11px] font-semibold text-slate-600 truncate">{product.name}</span>
                      </div>
                      <div className="flex-1 h-8 bg-slate-50/5 flex">
                        {timeline.days.map((_, i) => (
                          <div key={i} className="min-w-[32px] w-8 border-r border-slate-50/30 h-full" />
                        ))}
                      </div>
                    </div>

                    {/* Activity Rows */}
                    {product.items.map((item: any) => {
                      const startIdx = getDayPosition(item.startDateAtividade || item.plannedDate);
                      const endIdx = getDayPosition(item.plannedDate || item.startDateAtividade);
                      
                      const barStart = startIdx !== null ? startIdx : -1;
                      const barEnd = endIdx !== null ? endIdx : barStart;
                      const duration = Math.max(1, barEnd - barStart + 1);
                      const isVisible = barStart !== -1 && barStart < timeline.days.length;

                      // Calculate label position relative to today
                      const getLabelOffset = () => {
                        if (todayIndex === null || todayIndex < barStart) return 0;
                        if (todayIndex > barEnd) return Math.max(0, (duration * 32) - 80); 
                        // Within bar: Align with today vertical line
                        return Math.min(Math.max(0, (duration * 32) - 80), (todayIndex - barStart) * 32); 
                      };

                      return (
                        <div key={item.id} className="flex group hover:bg-slate-50 transition-colors border-b border-slate-50/50">
                          <div className="w-64 border-r border-slate-200 py-1.5 px-9 flex items-center gap-2 sticky left-0 bg-white group-hover:bg-slate-50 z-30 overflow-hidden relative">
                             <div className={`shrink-0 w-1.5 h-1.5 rounded-full ${getUserColor(item.assigneeId)}`} />
                             <div className="flex items-center gap-1 min-w-0 flex-1">
                               <span className="text-[10px] text-slate-500 truncate font-medium">{item.title}</span>
                               {item.status === 'DONE' && <Check size={8} className="text-green-600 shrink-0 font-bold" />}
                               {item.riskPoint && <AlertTriangle size={8} className="text-red-500 shrink-0 animate-pulse" />}
                             </div>
                          </div>
                          <div className="flex-1 h-8 relative flex items-center">
                            <div className="absolute inset-0 flex pointer-events-none">
                              {timeline.days.map((_, i) => (
                                <div key={i} className="min-w-[32px] w-8 h-full border-r border-slate-100/30" />
                              ))}
                            </div>

                            {isVisible && (
                              <div 
                                onClick={() => onEditTask(item)}
                                className={`absolute h-5 rounded-md shadow-sm cursor-pointer transition-all hover:scale-[1.01] hover:brightness-110 flex items-center group/bar overflow-hidden ${getUserColor(item.assigneeId)} ${getStatusOpacity(item.status)}`}
                                style={{ 
                                  left: `${barStart * 32}px`, 
                                  width: `${duration * 32}px`,
                                  zIndex: 10
                                }}
                              >
                                <div 
                                  className="flex items-center gap-1.5 px-1.5 transition-all duration-300 w-full"
                                  style={{ paddingLeft: `${getLabelOffset()}px` }}
                                >
                                  <span className="text-[9px] font-black text-white truncate drop-shadow-md uppercase tracking-tight whitespace-nowrap">
                                    {item.assignee?.name?.split(' ')[0] || '—'}
                                  </span>
                                  
                                  <div className="flex items-center gap-0.5 shrink-0">
                                    {item.riskPoint && <AlertTriangle size={8} className="text-white drop-shadow-sm animate-pulse" />}
                                    {item.status === 'DONE' && <Check size={8} className="text-white drop-shadow-sm font-black" />}
                                  </div>
                                </div>
                                
                                {item.completion > 0 && item.completion < 100 && (
                                  <div className="absolute bottom-0 left-0 h-0.5 bg-black/20" style={{ width: `${item.completion}%` }} />
                                )}
                                
                                {item.status === 'DONE' && (
                                  <div className="absolute inset-0 opacity-10 pointer-events-none bg-stripe" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center px-4 z-40">
        <div className="flex gap-4">
           {[
             { label: 'PLANEJADO', color: 'bg-slate-300 opacity-50' },
             { label: 'EM ANDAMENTO', color: 'bg-slate-500' },
             { label: 'BLOQUEADO', color: 'bg-slate-400 border-2 border-dashed border-red-400' },
             { label: 'CONCLUÍDO', color: 'bg-slate-400 opacity-70 bg-stripe' }
           ].map(leg => (
             <div key={leg.label} className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 tracking-wider">
               <div className={`w-2 h-2 rounded ${leg.color}`} /> {leg.label}
             </div>
           ))}
        </div>
        <div className="flex items-center gap-4">
           <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
             <Calendar size={12} className="text-primary-500" /> {timeline.startDate.getFullYear()}
           </div>
           <div className="h-3 w-px bg-slate-300" />
           <div className="text-[9px] text-slate-400 font-bold uppercase italic tracking-tighter">Clique nas barras para editar</div>
        </div>
      </div>
    </div>
  );
}
