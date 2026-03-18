import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const GOOGLE_CONFIGURED = import.meta.env.VITE_GOOGLE_ENABLED === 'true';

export default function LoginPage() {
  const { setAuthData } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDevLogin = async () => {
    if (!form.name || !form.email) { setError('Preencha nome e e-mail'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/dev-login', form);
      setAuthData(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (e: any) {
      const msg = e.response?.data?.error || 'Erro ao conectar-se à API.';
      const detail = e.response?.data?.detail ? ` (${e.response.data.detail})` : '';
      setError(`${msg}${detail} Verifique se o servidor está rodando.`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package size={32} className="text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 text-center mb-1">Product Catalog</h1>
          <p className="text-slate-500 text-sm text-center mb-8">Gestão centralizada de produtos e aplicações</p>

          {/* Dev Login Form */}
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Nome</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Seu nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleDevLogin()}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">E-mail</label>
              <input
                type="email"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleDevLogin()}
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              onClick={handleDevLogin}
              disabled={loading}
              className="w-full py-2.5 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          {/* Divider + Google */}
          {GOOGLE_CONFIGURED && (
            <>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">ou</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700 text-sm"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
                Entrar com Google
              </button>
            </>
          )}

          <p className="text-xs text-slate-400 text-center mt-6">Acesso restrito a usuários autorizados</p>
        </div>
      </div>
    </div>
  );
}
