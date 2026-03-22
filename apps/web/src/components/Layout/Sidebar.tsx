import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, GitBranch, Users, Shield,
  Boxes, ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Produtos' },
  { to: '/delivery', icon: GitBranch, label: 'Delivery' },
  { to: '/squads', icon: Boxes, label: 'Squads' },
  { to: '/users', icon: Users, label: 'Usuários' },
  { to: '/roles', icon: Shield, label: 'Cargos' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-slate-900 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Package size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Product</p>
            <p className="text-primary-400 text-xs leading-none mt-0.5">Catalog</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className="shrink-0" />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="opacity-60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-700/50">
        <p className="text-slate-500 text-xs text-center">v1.0.0</p>
      </div>
    </aside>
  );
}
