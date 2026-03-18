import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function AuthCallbackPage() {
  const [params] = useSearchParams();
  const { setAuthData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (!token) return navigate('/login');
    localStorage.setItem('token', token);
    api.get('/auth/me').then((res) => {
      setAuthData(token, res.data);
      navigate('/dashboard');
    }).catch(() => navigate('/login'));
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Autenticando...</p>
      </div>
    </div>
  );
}
