# 🚀 Inicio Rápido

## Pasos para ejecutar el proyecto:

### 1️⃣ Configurar Supabase
1. Ve a https://supabase.com y crea una cuenta (si no tienes)
2. Crea un nuevo proyecto
3. Ve a SQL Editor
4. Copia y pega el contenido de `database-setup.sql`
5. Ejecuta el script (botón RUN)
6. Ve a Settings → API y copia:
   - Project URL
   - anon/public key

### 2️⃣ Configurar Variables de Entorno
Edita el archivo `.env` y reemplaza:
```
VITE_SUPABASE_URL=pega_aqui_tu_project_url
VITE_SUPABASE_ANON_KEY=pega_aqui_tu_anon_key
```

### 3️⃣ Instalar y Ejecutar
```bash
npm install
npm run dev
```

### 4️⃣ Abrir en el Navegador
Abre http://localhost:5173

## 🔑 Credenciales de Prueba

**Administrador:**
- Usuario: `admin`
- Contraseña: `Admin123!`

**Cliente:**
- Puedes registrarte desde la aplicación
- La contraseña debe cumplir:
  - Mínimo 8 caracteres
  - Al menos 1 mayúscula
  - Al menos 1 minúscula
  - Al menos 1 número
  - Al menos 1 carácter especial

Ejemplo: `Cliente123!`

## 📝 ¿Qué puedes hacer?

### Como Cliente:
✅ Ver catálogo de productos
✅ Filtrar por categoría, nombre y precio
✅ Agregar productos al carrito
✅ Gestionar cantidades en el carrito
✅ Ver el total de tu compra

### Como Admin:
✅ Agregar nuevos productos
✅ Editar productos existentes
✅ Eliminar productos
✅ Ver todo el inventario

## 🆘 Problemas Comunes

**Error de conexión con Supabase:**
- Verifica que copiaste correctamente la URL y la key
- Asegúrate de no tener espacios extra en el archivo `.env`
- Reinicia el servidor después de editar `.env`

**No aparecen productos:**
- Verifica que ejecutaste el script SQL completo
- El script incluye 8 productos de ejemplo

**No puedo iniciar sesión:**
- El usuario admin se crea automáticamente con el script SQL
- Usuario: `admin` (todo en minúsculas)
- Contraseña: `Admin123!` (exactamente así)

## 📚 Más Información

Lee el archivo `README.md` para documentación completa.
