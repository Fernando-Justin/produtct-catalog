import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { User, Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';

const input = 'w-full';

interface Toast { msg: string; type: 'ok' | 'err' }

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [squads, setSquads] = useState<any[]>([]);
  const [editUser, setEditUser] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const emptyForm = {
    name: '', email: '', roleId: '', squadId: '', status: 'ATIVO',
    idAppRh: '', fullName: '', emailCorporate: '', cpf: '', admissionDate: '', observations: '',
    logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '',
  };
  const [form, setForm] = useState(emptyForm);

  const load = () => Promise.all([
    api.get('/users').then((r) => setUsers(r.data)),
    api.get('/roles').then((r) => setRoles(r.data)),
    api.get('/squads').then((r) => setSquads(r.data)),
  ]);
  useEffect(() => { load(); }, []);

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openNew = () => {
    setForm(emptyForm);
    setEditUser({});
    setIsNew(true);
  };

  const openEdit = (u: any) => {
    setForm({
      name: u.name || '', email: u.email || '',
      roleId: u.roleId || '', squadId: u.squadId || '', status: u.status || 'ATIVO',
      idAppRh: u.idAppRh || '', fullName: u.fullName || '', emailCorporate: u.emailCorporate || '',
      cpf: u.cpf || '', admissionDate: u.admissionDate ? u.admissionDate.split('T')[0] : '',
      observations: u.observations || '',
      logradouro: u.logradouro || '', numero: u.numero || '', complemento: u.complemento || '',
      bairro: u.bairro || '', cidade: u.cidade || '', estado: u.estado || '', cep: u.cep || '',
    });
    setEditUser(u);
    setIsNew(false);
  };

  const save = async () => {
    if (!form.name || !form.email) { showToast('Nome e e-mail são obrigatórios', 'err'); return; }
    setSaving(true);
    try {
      const data: any = { ...form };
      if (data.admissionDate) data.admissionDate = new Date(data.admissionDate).toISOString();
      else data.admissionDate = null;
      if (isNew) {
        await api.post('/users', data);
        showToast('Usuário criado com sucesso', 'ok');
      } else {
        await api.put(`/users/${editUser.id}`, data);
        showToast('Usuário atualizado com sucesso', 'ok');
      }
      setEditUser(null);
      load();
    } catch (e: any) {
      showToast(e.response?.data?.error || 'Erro ao salvar', 'err');
    } finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm('Excluir este usuário?')) return;
    try {
      await api.delete(`/users/${id}`);
      showToast('Usuário excluído', 'ok');
      load();
    } catch (e: any) {
      showToast(e.response?.data?.error || 'Erro ao excluir', 'err');
    }
  };

  const F = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });

  return (
    <div className="space-y-3">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium transition-all ${toast.type === 'ok' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'ok' ? <Check size={15} /> : <AlertCircle size={15} />} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Usuários</h1>
          <p className="text-slate-500 text-xs">{users.length} cadastrado(s)</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          <Plus size={15} /> Novo Usuário
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Cód.</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Usuário</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">E-mail</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Cargo</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Squad</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Status</th>
              <th className="w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-2 text-xs text-slate-400 font-mono">{u.id}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                        <User size={12} className="text-primary-600" />
                      </div>
                    )}
                    <span className="font-medium text-slate-800 text-sm">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-slate-500 text-xs">{u.email}</td>
                <td className="px-4 py-2 text-slate-600 text-xs">{u.role?.name || <span className="text-slate-300">—</span>}</td>
                <td className="px-4 py-2 text-slate-600 text-xs">{u.squad?.name || <span className="text-slate-300">—</span>}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(u)} className="p-1 hover:bg-slate-100 rounded transition-colors"><Edit2 size={12} className="text-slate-400" /></button>
                    <button onClick={() => remove(u.id)} className="p-1 hover:bg-red-50 rounded transition-colors"><Trash2 size={12} className="text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="text-center py-6 text-slate-400 text-xs">Nenhum usuário</div>}
      </div>

      {/* Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-2">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh]">
            <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-slate-900">{isNew ? 'Novo Usuário' : `Editar: ${editUser.name}`}</h2>
              <div className="text-[10px] text-slate-400 font-mono">ID: {isNew ? '(auto)' : editUser.id}</div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
              {/* Linha 1: Nome + Email Login */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label>Nome *</label>
                  <input type="text" className={input} value={form.name} onChange={(e) => F('name', e.target.value)} />
                </div>
                <div>
                  <label>E-mail (login) *</label>
                  <input type="email" className={input} value={form.email} onChange={(e) => F('email', e.target.value)} disabled={!isNew} />
                </div>
              </div>

              {/* Linha 2: ID App RH + Data Admissão + CPF */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label>ID App RH</label>
                  <input type="text" className={input} value={form.idAppRh} onChange={(e) => F('idAppRh', e.target.value)} />
                </div>
                <div>
                  <label>Data de Admissão</label>
                  <input type="date" className={input} value={form.admissionDate} onChange={(e) => F('admissionDate', e.target.value)} />
                </div>
                <div>
                  <label>CPF</label>
                  <input type="text" className={input} maxLength={11} value={form.cpf} onChange={(e) => F('cpf', e.target.value.replace(/\D/g, ''))} />
                </div>
              </div>

              {/* Dados Principais */}
              <div>
                <h3 className="text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-1">Dados Principais</h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-2">
                    <label>Nome Completo</label>
                    <input type="text" className={input} value={form.fullName} onChange={(e) => F('fullName', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label>E-mail Corporativo</label>
                    <input type="email" className={input} value={form.emailCorporate} onChange={(e) => F('emailCorporate', e.target.value)} />
                  </div>
                  <div>
                    <label>Cargo</label>
                    <select className={input} value={form.roleId} onChange={(e) => F('roleId', e.target.value)}>
                      <option value="">—</option>
                      {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Squad</label>
                    <select className={input} value={form.squadId} onChange={(e) => F('squadId', e.target.value)}>
                      <option value="">—</option>
                      {squads.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Status</label>
                    <select className={input} value={form.status} onChange={(e) => F('status', e.target.value)}>
                      <option value="ATIVO">Ativo</option>
                      <option value="INATIVO">Inativo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              {/* Endereço */}
              <div>
                <h3 className="text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-1">Endereço</h3>
                <div className="grid grid-cols-8 gap-2">
                  <div className="col-span-3">
                    <label>Logradouro</label>
                    <input type="text" className={input} value={form.logradouro} onChange={(e) => F('logradouro', e.target.value)} />
                  </div>
                  <div>
                    <label>Número</label>
                    <input type="text" className={input} value={form.numero} onChange={(e) => F('numero', e.target.value)} />
                  </div>
                  <div>
                    <label>Compl.</label>
                    <input type="text" className={input} value={form.complemento} onChange={(e) => F('complemento', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label>Bairro</label>
                    <input type="text" className={input} value={form.bairro} onChange={(e) => F('bairro', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label>Cidade</label>
                    <input type="text" className={input} value={form.cidade} onChange={(e) => F('cidade', e.target.value)} />
                  </div>
                  <div>
                    <label>UF</label>
                    <input type="text" className={input} maxLength={2} value={form.estado} onChange={(e) => F('estado', e.target.value.toUpperCase())} />
                  </div>
                  <div className="col-span-2">
                    <label>CEP</label>
                    <input type="text" className={input} maxLength={8} value={form.cep} onChange={(e) => F('cep', e.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label>Observações</label>
                <textarea className={input} rows={1} value={form.observations} onChange={(e) => F('observations', e.target.value)} />
              </div>
            </div>

            <div className="px-3 py-2 border-t border-slate-100 flex gap-2 bg-slate-50 rounded-b-xl">
              <button onClick={() => setEditUser(null)} className="flex-1 bg-white">Cancelar</button>
              <button onClick={save} disabled={saving} className="flex-1 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
                {saving ? 'Salvando...' : isNew ? 'Criar Usuário' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
