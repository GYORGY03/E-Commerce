import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast, { Toaster } from 'react-hot-toast';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  if (user) {
    navigate(user.role === 'Admin' ? '/admin' : '/', { replace: true });
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      toast.success('Inicio de sesión exitoso');
      // Redirigir según el rol (el contexto ya tiene el usuario actualizado)
      // La redirección se manejará por el useEffect cuando el user esté disponible
    } else {
      setError(result.error || 'Error al iniciar sesión');
      toast.error(result.error || 'Error al iniciar sesión');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
      <Toaster position="top-center" />
      <div className="max-w-md w-full space-y-8 p-10 rounded-xl shadow-2xl" style={{ backgroundColor: '#D1D5DB' }}>
        <div className="text-center">
          <h2 className="text-3xl font-extrabold" style={{ color: '#000000' }}>
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm" style={{ color: '#000000', opacity: 0.7 }}>
            Accede a tu cuenta de E-commerce
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium" style={{ color: '#000000' }}>
                Usuario
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2"
                style={{ borderColor: '#F3F4F6', borderWidth: '1px', backgroundColor: '#FFFFFF', color: '#6B7280' }}
                placeholder="Ingresa tu usuario"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#000000' }}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2"
                style={{ borderColor: '#F3F4F6', borderWidth: '1px', backgroundColor: '#FFFFFF', color: '#6B7280' }}
                placeholder="Ingresa tu contraseña"
              />
            </div>
          </div>

          {error && (
            <div className="border px-4 py-3 rounded-md text-sm" style={{ backgroundColor: '#E8F5E9', borderColor: '#4CAF50', color: '#0D1117' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            style={{ backgroundColor: '#4CAF50', color: '#FFFFFF' }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <div className="text-center text-sm">
            <span style={{ color: '#000000', opacity: 0.7 }}>¿No tienes una cuenta? </span>
            <Link to="/register" className="font-medium hover:opacity-80" style={{ color: '#000000' }}>
              Regístrate aquí
            </Link>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 border rounded-md shadow-sm text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#F3F4F6', color: '#000000', borderColor: '#E5E7EB' }}
            >
              ← Volver a la tienda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
