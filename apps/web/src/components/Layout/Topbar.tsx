import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

export default function Topbar() {
  const { user, logout } = useAuth();
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800">{user?.name}</p>
          <p className="text-xs text-slate-400">{user?.role?.name || user?.email}</p>
        </div>
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <User size={14} className="text-primary-600" />
          </div>
        )}
        <button
          onClick={logout}
          className="ml-1 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Sair"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
