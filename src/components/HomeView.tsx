import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import type { Product } from '../types';
import toast, { Toaster } from 'react-hot-toast';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { Slider } from 'primereact/slider';
import ProductCarousel from './Carousel';

// Componente de Slider para precios
function PriceSlider({ label, value, maxValue, onChange }: { 
  label: string; 
  value: number; 
  maxValue: number; 
  onChange: (value: number) => void 
}) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-3" style={{ color: '#000000' }}>
        {label}: <strong>${value}</strong>
      </label>
      <Slider 
        value={value} 
        onChange={(e) => onChange(e.value as number)} 
        max={maxValue}
        step={1}
        style={{ width: '100%' }}
        pt={{
          root: { style: { backgroundColor: '#E5E7EB' } },
          range: { style: { backgroundColor: '#4CAF50' } },
          handle: { style: { backgroundColor: '#FFFFFF', border: '3px solid #4CAF50' } }
        }}
      />
    </div>
  );
}

export function HomeView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [maxProductPrice, setMaxProductPrice] = useState(1000);
  
  // Filtros
  const [searchName, setSearchName] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
    if (user) {
      loadCartCount();
    }
  }, [user]);

  const applyFilters = () => {
    let filtered = [...products];

    // Filtrar por nombre
    if (searchName) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filtrar por rango de precios
    filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, searchName, minPrice, maxPrice]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      setProducts(data || []);
      
      // Calcular precio máximo de los productos
      if (data && data.length > 0) {
        const maxPrice = Math.max(...data.map(p => p.price));
        setMaxProductPrice(Math.ceil(maxPrice));
        setMaxPrice(Math.ceil(maxPrice));
      }
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

  const addToCart = async (productCode: string) => {
    if (!user) {
      // Redirigir al login si no está autenticado
      navigate('/login');
      return;
    }

    try {
      // Verificar si el producto ya está en el carrito
      const { data: existingItem } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_code', productCode)
        .single();

      if (existingItem) {
        // Incrementar cantidad
        const { error } = await supabase
          .from('cart')
          .update({ count: existingItem.count + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Agregar nuevo item
        const { error } = await supabase
          .from('cart')
          .insert({
            user_id: user.id,
            product_code: productCode,
            count: 1
          });

        if (error) throw error;
      }

      toast.success('Producto agregado al carrito');
      loadCartCount();
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      toast.error('Error al agregar al carrito');
    }
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
              navigate('/login', { replace: true });
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#D1D5DB' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <Toaster position="top-center" />
      {/* Header */}
      <header style={{ backgroundColor: '#E5E7EB' }} className="shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold italic" style={{ color: '#000000' }}>Los Champions</h1>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              {user ? (
                <>
                  <i className="pi pi-user text-xl sm:text-2xl" style={{ color: '#000000' }}></i>
                  <button
                    onClick={() => navigate('/cart')}
                    className="relative px-2 py-2 sm:px-3 md:px-4 text-white rounded-md hover:opacity-90 transition-opacity text-sm sm:text-base"
                    style={{ backgroundColor: '#4CAF50' }}
                  >
                    <i className="pi pi-shopping-cart mr-0 sm:mr-1"></i>
                    <span className="hidden sm:inline">Carrito</span>
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full" style={{ backgroundColor: '#EF4444' }}></span>
                    )}
                  </button>
                  {user.role === 'Admin' && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="px-2 py-2 sm:px-3 md:px-4 text-white rounded-md hover:opacity-90 transition-opacity text-sm sm:text-base"
                      style={{ backgroundColor: '#4CAF50' }}
                    >
                      <i className="pi pi-user-edit mr-0 sm:mr-1"></i>
                      <span className="hidden sm:inline">Admin Panel</span>
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-2 py-2 sm:px-3 md:px-4 rounded-md hover:opacity-90 transition-opacity text-sm sm:text-base"
                    style={{ color: '#FFFFFF', backgroundColor: '#f03737ff' }}
                  >
                    <i className="pi pi-sign-out mr-0 sm:mr-1"></i>
                    <span className="hidden sm:inline">Cerrar Sesión</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-2 py-2 sm:px-3 md:px-4 rounded-md hover:opacity-90 transition-opacity font-medium text-sm sm:text-base"
                    style={{ color: '#FFFFFF', backgroundColor: '#6B7280' }}
                  >
                    <i className="pi pi-lock mr-0 sm:mr-1"></i>
                    <span className="hidden sm:inline">Iniciar Sesión</span>
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-2 py-2 sm:px-3 md:px-4 text-white rounded-md hover:opacity-90 transition-opacity text-sm sm:text-base"
                    style={{ backgroundColor: '#4CAF50' }}
                  >
                    <i className="pi pi-user-plus mr-0 sm:mr-1"></i>
                    <span className="hidden sm:inline">Registrarse</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Carousel de productos */}
        <div className="mb-8">
          <ProductCarousel />
        </div>

        {/* Botón para abrir filtros */}
        <div className="mb-6">
          <Button 
            icon="pi pi-filter" 
            label="Filtros" 
            onClick={() => setSidebarVisible(true)}
            className="p-button-rounded"
            style={{ backgroundColor: '#4CAF50', border: 'none' }}
          />
        </div>

        {/* Sidebar con Filtros */}
        <Sidebar 
          visible={sidebarVisible} 
          onHide={() => setSidebarVisible(false)}
          position="left"
          style={{ width: '300px' }}
        >
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#000000' }}>Filtros</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>
                Buscar por nombre
              </label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 text-sm"
                style={{ borderColor: '#D1D5DB', borderWidth: '1px', backgroundColor: '#FFFFFF', color: '#000000' }}
              />
            </div>

            <PriceSlider 
              label="Precio mínimo"
              value={minPrice}
              maxValue={maxProductPrice}
              onChange={setMinPrice}
            />

            <PriceSlider 
              label="Precio máximo"
              value={maxPrice}
              maxValue={maxProductPrice}
              onChange={setMaxPrice}
            />

            <button
              onClick={() => setSidebarVisible(false)}
              className="w-full py-2 px-4 text-white rounded-md hover:opacity-90 transition-opacity text-sm font-medium mt-4"
              style={{ backgroundColor: '#4CAF50' }}
            >
              Aplicar Filtros
            </button>
          </div>
        </Sidebar>

        {/* Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col" style={{ backgroundColor: '#D1D5DB' }}>
              <div className="w-full h-40 sm:h-48 flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#F3F4F6', borderBottom: '2px solid #E5E7EB' }}>
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                      if (sibling) sibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                {!product.image_url && (
                  <i className="pi pi-shopping-bag items-center justify-center flex" style={{ fontSize: '4rem', color: '#9CA3AF' }}></i>
                )}
              </div>
              <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow">
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 line-clamp-2" style={{ color: '#000000' }}>
                  {product.name}
                </h3>
                <p className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2" style={{ color: '#4CAF50' }}>
                  ${product.price.toFixed(2)}
                </p>
                <p className="text-xs sm:text-sm mb-3 sm:mb-4" style={{ color: '#000000' }}>
                  Stock disponible: <span className="font-semibold">{product.stock}</span>
                </p>
                <button
                  onClick={() => addToCart(product.code)}
                  disabled={product.stock === 0}
                  className="w-full py-2 sm:py-2.5 px-3 sm:px-4 text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-sm sm:text-base font-medium mt-auto"
                  style={{ backgroundColor: product.stock === 0 ? '#F3F4F6' : '#4CAF50', color: product.stock === 0 ? '#000000' : '#FFFFFF' }}
                >
                  {product.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg" style={{ color: '#000000' }}>No se encontraron productos</p>
          </div>
        )}
      </main>
    </div>
  );
}
