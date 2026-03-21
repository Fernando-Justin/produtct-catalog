import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Trash2, User, Star } from 'lucide-react';

interface Props { product: any; onRefresh: () => void; }

export default function ProductDevsTab({ product, onRefresh }: Props) {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [isLead, setIsLead] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get('/users').then((r) => setAllUsers(r.data)); }, []);

  const assignedIds = new Set((product.devs || []).map((d: any) => d.userId));
  const available = allUsers.filter((u) => !assignedIds.has(u.id));

  const add = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await api.post(`/products/${product.id}/devs`, { userId: selectedUser, isLead });
      setSelectedUser(''); setIsLead(false); onRefresh();
    } finally { setSaving(false); }
  };

  const remove = async (userId: string) => {
    await api.delete(`/products/${product.id}/devs/${userId}`);
    onRefresh();
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <h3 className="text-slate-800 text-sm">Devs / Sustentação ({product.devs?.length || 0})</h3>
      </div>

      {/* Add Dev */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-2 flex items-end gap-2 flex-wrap">
        <div className="flex-1 min-w-48">
          <label>Adicionar Dev</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Selecionar usuário...</option>
            {available.map((u) => <option key={u.id} value={u.id}>{u.name} — {u.role?.name || 'Sem cargo'}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer pb-2">
          <input type="checkbox" checked={isLead} onChange={(e) => setIsLead(e.target.checked)} className="rounded" />
          Head
        </label>
        <button onClick={add} disabled={!selectedUser || saving} className="bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {/* Devs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {(product.devs || []).map((dev: any) => (
          <div key={dev.id} className="bg-white rounded-xl border border-slate-200 p-2 flex items-center gap-2">
            <div className="relative">
              {dev.user.avatar ? (
                <img src={dev.user.avatar} alt={dev.user.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User size={14} className="text-primary-600" />
                </div>
              )}
              {dev.isLead && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                  <Star size={9} className="text-white fill-white" />
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 text-sm truncate">{dev.user.name}</p>
              <p className="text-xs text-slate-400 truncate">{dev.user.role?.name || dev.user.email}</p>
              {dev.isLead && <p className="text-xs text-amber-600 font-medium">Head</p>}
            </div>
            <button onClick={() => remove(dev.userId)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors shrink-0">
              <Trash2 size={14} className="text-red-400" />
            </button>
          </div>
        ))}
      </div>
      {(!product.devs?.length) && <div className="text-center py-10 text-slate-400 text-sm">Nenhum dev associado</div>}
    </div>
  );
}
