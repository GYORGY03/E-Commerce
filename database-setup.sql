-- Crear la tabla users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Cliente' CHECK (role IN ('Admin', 'Cliente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear la tabla products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear la tabla cart
CREATE TABLE IF NOT EXISTS cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_code TEXT NOT NULL REFERENCES products(code) ON DELETE CASCADE,
  count INTEGER NOT NULL DEFAULT 1 CHECK (count > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_code)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product_code ON cart(product_code);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);

-- Insertar un usuario administrador de ejemplo (contraseña: Admin123!)
-- Nota: En producción, debes hashear la contraseña adecuadamente
INSERT INTO users (username, password, role) 
VALUES ('admin', 'Admin123!', 'Admin')
ON CONFLICT (username) DO NOTHING;

-- Insertar algunos productos de ejemplo
INSERT INTO products (name, price, stock, code) VALUES
  ('Laptop Dell XPS 13', 1299.99, 10, 'LAPTOP-001'),
  ('Mouse Logitech MX Master', 99.99, 25, 'MOUSE-001'),
  ('Teclado Mecánico RGB', 149.99, 15, 'KEYBOARD-001'),
  ('Monitor Samsung 27"', 299.99, 8, 'MONITOR-001'),
  ('Auriculares Sony WH-1000XM4', 349.99, 12, 'AUDIO-001'),
  ('Webcam Logitech C920', 79.99, 20, 'WEBCAM-001'),
  ('Disco SSD 1TB', 129.99, 30, 'STORAGE-001'),
  ('Router WiFi 6', 199.99, 18, 'NETWORK-001')
ON CONFLICT (code) DO NOTHING;
