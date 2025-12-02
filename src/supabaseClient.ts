import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your_supabase_url_here' || 
    supabaseAnonKey === 'your_supabase_anon_key_here') {
  console.error(`
  ❌ ERROR DE CONFIGURACIÓN DE SUPABASE
  
  Necesitas configurar tus credenciales de Supabase:
  
  1. Ve a https://supabase.com y crea un proyecto
  2. Ejecuta el script SQL en database-setup.sql
  3. Ve a Settings → API
  4. Copia tu Project URL y anon/public key
  5. Edita el archivo .env con tus credenciales reales
  
  Archivo: .env
  VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
  VITE_SUPABASE_ANON_KEY=tu-clave-anon-aqui
  `);
  throw new Error('Configuración de Supabase incompleta. Lee las instrucciones en la consola.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
