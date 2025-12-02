import { useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { supabase } from '../supabaseClient';
import { hashPassword } from '../utils/passwordUtils';
import { AuthContext } from './AuthContextDefinition';

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicializar el estado con el valor del sessionStorage
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading] = useState(false);

  const login = async (username: string, password: string) => {
    try {
      const hashedPassword = await hashPassword(password);
      
      const { data, error } = await supabase
        .from('users')
        .select('id, username, role')
        .eq('username', username)
        .eq('password', hashedPassword)
        .single();

      if (error || !data) {
        return { success: false, error: 'Credenciales inválidas' };
      }

      const userData: User = {
        id: data.id,
        username: data.username,
        role: data.role as 'Admin' | 'Cliente'
      };

      setUser(userData);
      sessionStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: 'Error al iniciar sesión' };
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const hashedPassword = await hashPassword(password);

      const { error } = await supabase
        .from('users')
        .insert({
          username,
          password: hashedPassword,
          role: 'Cliente'
        });

      if (error) {
        if (error.code === '23505') { // Código de error para violación de constraint UNIQUE
          return { success: false, error: 'El nombre de usuario ya existe' };
        }
        return { success: false, error: 'Error al registrar usuario' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: 'Error al registrar usuario' };
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
