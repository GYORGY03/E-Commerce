# E-Commerce Application

Aplicación completa de E-commerce construida con React, TypeScript, Tailwind CSS, React Router DOM y Supabase.

## 🚀 Características

- ✅ Autenticación completa (Login/Registro)
- ✅ Validación de contraseñas con alta seguridad
- ✅ Roles de usuario (Admin/Cliente)
- ✅ Catálogo de productos con filtros avanzados
- ✅ Carrito de compras persistente
- ✅ Panel de administración con CRUD de productos
- ✅ Rutas protegidas por rol

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- Cuenta en Supabase (https://supabase.com)

## 🔧 Configuración

### 1. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Ve al Editor SQL en tu proyecto de Supabase
3. Ejecuta el script SQL que se encuentra en `database-setup.sql`
4. Copia tu `URL` y `anon key` desde Project Settings → API

### 2. Configurar Variables de Entorno

Edita el archivo `.env` en la raíz del proyecto y reemplaza los valores:

```env
VITE_SUPABASE_URL=tu_url_de_supabase_aqui
VITE_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase_aqui
```

### 3. Instalar Dependencias e Iniciar

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 👤 Credenciales de Prueba

### Usuario Administrador
- Usuario: `admin`
- Contraseña: `Admin123!`

Los clientes pueden registrarse desde la aplicación.

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes de React
│   ├── Login.tsx        # Página de inicio de sesión
│   ├── Register.tsx     # Página de registro
│   ├── ProtectedRoute.tsx # HOC para rutas protegidas
│   ├── HomeView.tsx     # Vista de productos (Cliente)
│   ├── CartView.tsx     # Vista del carrito (Cliente)
│   └── AdminDashboard.tsx # Panel de administración
├── contexts/            # Context API de React
│   └── AuthContext.tsx  # Contexto de autenticación
├── utils/              # Utilidades
│   └── passwordUtils.ts # Validación y hash de contraseñas
├── types.ts            # Definiciones de TypeScript
├── supabaseClient.ts   # Configuración de Supabase
├── App.tsx             # Componente principal con rutas
└── main.tsx            # Punto de entrada
```

## 🗄️ Estructura de la Base de Datos

### Tabla `users`
- `id` (UUID, PK)
- `username` (TEXT, UNIQUE)
- `password` (TEXT)
- `role` (TEXT: 'Admin' o 'Cliente')

### Tabla `products`
- `id` (UUID, PK)
- `name` (TEXT)
- `price` (NUMERIC)
- `stock` (INTEGER)
- `code` (TEXT, UNIQUE)
- `category` (TEXT)

### Tabla `cart`
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `product_code` (TEXT, FK → products.code)
- `count` (INTEGER)

## 🛣️ Rutas de la Aplicación

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Página de inicio de sesión |
| `/register` | Público | Página de registro |
| `/home` | Cliente | Catálogo de productos con filtros |
| `/cart` | Cliente | Carrito de compras |
| `/admin` | Admin | Panel de administración de productos |

## 🔐 Seguridad

- Las contraseñas deben cumplir con:
  - Mínimo 8 caracteres
  - Al menos una mayúscula
  - Al menos una minúscula
  - Al menos un número
  - Al menos un carácter especial
- Hash SHA-256 de contraseñas (en frontend - para producción debería ser en backend)
- Autenticación basada en roles
- Rutas protegidas con redirección automática

## 🎨 Tecnologías Utilizadas

- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **React Router DOM** - Enrutamiento
- **Supabase** - Backend as a Service (BaaS)
  - Base de datos PostgreSQL
  - Autenticación
  - APIs REST automáticas

## 📝 Funcionalidades Principales

### Para Clientes:
- Registro de nueva cuenta
- Inicio de sesión
- Búsqueda y filtrado de productos por:
  - Categoría
  - Nombre
  - Rango de precios
- Agregar productos al carrito
- Gestionar cantidad de productos en el carrito
- Eliminar productos del carrito
- Ver total de la compra

### Para Administradores:
- Agregar nuevos productos
- Editar productos existentes
- Eliminar productos
- Ver listado completo de productos

## 🚧 Notas de Desarrollo

- La funcionalidad de pago está marcada como "en desarrollo"
- El hash de contraseñas se hace en el frontend para simplificar, pero en producción debería hacerse en el backend
- El carrito es persistente en la base de datos
- Los productos con stock 0 no pueden agregarse al carrito

## 🤝 Contribuir

Este es un proyecto educativo. Siéntete libre de fork y mejorar!

## 📄 Licencia

MIT
