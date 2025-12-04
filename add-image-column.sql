-- Agregar columna image_url a la tabla products
ALTER TABLE products 
ADD COLUMN image_url TEXT;

-- Opcional: Agregar un comentario a la columna
COMMENT ON COLUMN products.image_url IS 'URL pública de la imagen del producto almacenada en Supabase Storage';
