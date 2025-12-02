import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validatePassword } from '../utils/passwordUtils';
import toast, { Toaster } from 'react-hot-toast';

export function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar complejidad de la contraseña
    const validation = validatePassword(password);
    if (!validation.valid) {
      setError(validation.message || 'Contraseña inválida');
      return;
    }

    setLoading(true);
    const result = await register(username, password);

    if (result.success) {
      toast.success('Cuenta creada exitosamente');
      // Redirigir al login después del registro exitoso
      navigate('/', { replace: true });
    } else {
      setError(result.error || 'Error al registrar usuario');
      toast.error(result.error || 'Error al registrar usuario');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FFFFFF' }}>
      <Toaster position="top-center" />
      <div className="max-w-md w-full space-y-8 p-10 rounded-xl shadow-2xl" style={{ backgroundColor: '#D1D5DB' }}>
        <div className="text-center">
          <h2 className="text-3xl font-extrabold" style={{ color: '#000000' }}>
            Crear Cuenta
          </h2>
          <p className="mt-2 text-sm" style={{ color: '#000000', opacity: 0.7 }}>
            Regístrate para empezar a comprar
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
                style={{ borderColor: '#E5E7EB', borderWidth: '1px', backgroundColor: '#FFFFFF' }}
                placeholder="Elige un nombre de usuario"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#0D1117' }}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2"
                style={{ borderColor: '#E5E7EB', borderWidth: '1px', backgroundColor: '#FFFFFF' }}
                placeholder="Crea una contraseña segura"
              />
              <p className="mt-1 text-xs" style={{ color: '#0D1117', opacity: 0.6 }}>
                Debe contener mayúsculas, minúsculas, números y caracteres especiales
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium" style={{ color: '#0D1117' }}>
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2"
                style={{ borderColor: '#E5E7EB', borderWidth: '1px', backgroundColor: '#FFFFFF' }}
                placeholder="Confirma tu contraseña"
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
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

          <div className="text-center text-sm">
            <span style={{ color: '#000000', opacity: 0.7 }}>¿Ya tienes una cuenta? </span>
            <Link to="/login" className="font-medium hover:opacity-80" style={{ color: '#000000' }}>
              Inicia sesión aquí
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
