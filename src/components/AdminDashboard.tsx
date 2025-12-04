import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import type { Product } from '../types';
import toast, { Toaster } from 'react-hot-toast';

export function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Formulario
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    code: ''
  });

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
    if (user) {
      loadCartCount();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCartCount = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('cart')
        .select('count')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const totalCount = (data || []).reduce((sum, item) => sum + item.count, 0);
      setCartItemCount(totalCount);
    } catch (error) {
      console.error('Error al cargar conteo del carrito:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    let imageUrl = editingProduct?.image_url || '';

    try {
      // Si hay una nueva imagen, subirla primero
      if (imageFile) {
        setUploadingImage(true);
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${formData.code}_${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('img')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Obtener URL pública de la imagen
        const { data: urlData } = supabase.storage
          .from('img')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
        setUploadingImage(false);
      }

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        code: formData.code,
        image_url: imageUrl
      };

      if (editingProduct) {
        // Actualizar producto existente
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Producto actualizado correctamente');
      } else {
        // Crear nuevo producto
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) {
          if (error.code === '23505') {
            toast.error('El código del producto ya existe');
            return;
          }
          throw error;
        }
        toast.success('Producto creado correctamente');
      }

      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      toast.error('Error al guardar producto');
      setUploadingImage(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      code: product.code
    });
    setImagePreview(product.image_url || '');
    setImageFile(null);
  };

  const handleDelete = async (productId: string) => {
    toast((t) => (
      <div>
        <p className="font-semibold mb-2">¿Estás seguro de eliminar este producto?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const { error } = await supabase
                  .from('products')
                  .delete()
                  .eq('id', productId);

                if (error) throw error;
                toast.success('Producto eliminado correctamente');
                loadProducts();
              } catch (error) {
                console.error('Error al eliminar producto:', error);
                toast.error('Error al eliminar producto');
              }
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Eliminar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      stock: '',
      code: ''
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleLogout = () => {
    toast((t) => (
      <div>
        <p className="font-semibold mb-2">¿Estás seguro de cerrar sesión?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              logout();
              navigate('/', { replace: true });
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Cerrar Sesión
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#4CAF50' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <Toaster position="top-center" />
      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: '#E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-base sm:text-xl md:text-2xl font-bold" style={{ color: '#000000' }}>Panel de Administración</h1>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <i className="pi pi-user-edit text-lg sm:text-xl md:text-2xl" style={{ color: '#000000' }}></i>
              <button
                onClick={() => navigate('/')}
                className="relative px-2 py-1.5 sm:px-3 md:px-4 sm:py-2 rounded-md transition-opacity hover:opacity-90 text-xs sm:text-sm md:text-base"
                style={{ backgroundColor: '#F3F4F6', color: '#000000' }}
              >
                <i className="pi pi-shopping-bag mr-0 sm:mr-1"></i>
                <span className="hidden sm:inline">Ir a la Tienda</span>
                {cartItemCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full"
                    style={{ backgroundColor: '#EF4444' }}
                  ></span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="px-2 py-1.5 sm:px-3 md:px-4 sm:py-2 rounded-md transition-opacity hover:opacity-90 text-xs sm:text-sm md:text-base"
                style={{ backgroundColor: '#4CAF50', color: '#FFFFFF' }}
              >
                <i className="pi pi-sign-out mr-0 sm:mr-1"></i>
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Formulario */}
          <div className="rounded-lg shadow-md p-4 sm:p-5 md:p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: '#0D1117' }}>
              {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: '#0D1117' }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm sm:text-base"
                  style={{ borderColor: '#E5E7EB', color: '#0D1117' }}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: '#0D1117' }}>
                  Precio *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm sm:text-base"
                  style={{ borderColor: '#E5E7EB', color: '#0D1117' }}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: '#0D1117' }}>
                  Stock *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm sm:text-base"
                  style={{ borderColor: '#E5E7EB', color: '#0D1117' }}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: '#0D1117' }}>
                  Código *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={!!editingProduct}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm sm:text-base"
                  style={{ borderColor: '#E5E7EB', color: '#0D1117', backgroundColor: editingProduct ? '#E5E7EB' : 'white' }}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1" style={{ color: '#0D1117' }}>
                  Imagen del Producto
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm sm:text-base"
                  style={{ borderColor: '#E5E7EB', color: '#0D1117' }}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-md border"
                      style={{ borderColor: '#E5E7EB' }}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="flex-1 py-2 px-3 sm:px-4 rounded-md transition-opacity hover:opacity-90 text-sm sm:text-base font-medium"
                  style={{ backgroundColor: uploadingImage ? '#A5D6A7' : '#4CAF50', color: '#FFFFFF' }}
                >
                  {uploadingImage ? 'Subiendo imagen...' : (editingProduct ? 'Actualizar' : 'Agregar')}
                </button>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 sm:px-4 py-2 rounded-md transition-opacity hover:opacity-90 text-sm sm:text-base"
                    style={{ backgroundColor: '#F3F4F6', color: '#000000' }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Lista de Productos */}
          <div className="rounded-lg shadow-md p-4 sm:p-5 md:p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: '#0D1117' }}>
              Productos ({products.length})
            </h2>
            <div className="overflow-auto max-h-[400px] sm:max-h-[500px] md:max-h-[600px]">
              {products.length === 0 ? (
                <p className="text-center py-8" style={{ color: '#000000' }}>No hay productos registrados</p>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {products.map(product => (
                    <div key={product.id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow" style={{ borderColor: '#F3F4F6', backgroundColor: '#FFFFFF' }}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate" style={{ color: '#000000' }}>
                            {product.name}
                          </h3>
                          <p className="text-xs sm:text-sm" style={{ color: '#000000' }}>Código: {product.code}</p>
                        </div>
                        <div className="flex gap-1 sm:gap-2 shrink-0">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1.5 sm:p-2 rounded-md transition-opacity hover:opacity-80"
                            style={{ backgroundColor: '#4CAF50' }}
                            title="Editar"
                          >
                            <i className="pi pi-pencil" style={{ color: '#FFFFFF' }}></i>
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 sm:p-2 rounded-md transition-opacity hover:opacity-80"
                            style={{ backgroundColor: '#EF4444' }}
                            title="Eliminar"
                          >
                            <i className="pi pi-trash" style={{ color: '#FFFFFF' }}></i>
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-base sm:text-lg font-bold" style={{ color: '#4CAF50' }}>
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-xs sm:text-sm" style={{ color: '#000000' }}>
                          Stock: <span className="font-semibold">{product.stock}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
