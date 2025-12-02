import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import type { CartItem, Product } from '../types';
import toast, { Toaster } from 'react-hot-toast';

interface CartItemWithProduct extends CartItem {
  product?: Product;
}

export function CartView() {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const loadCart = async () => {
    if (!user) return;

    try {
      // Obtener items del carrito
      const { data: cart, error: cartError } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id);

      if (cartError) throw cartError;

      // Obtener información de los productos
      const itemsWithProducts: CartItemWithProduct[] = await Promise.all(
        (cart || []).map(async (item) => {
          const { data: product } = await supabase
            .from('products')
            .select('*')
            .eq('code', item.product_code)
            .single();

          return {
            ...item,
            product
          };
        })
      );

      setCartItems(itemsWithProducts);
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQuantity = async (itemId: string, newCount: number) => {
    if (newCount <= 0) {
      await removeItem(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart')
        .update({ count: newCount })
        .eq('id', itemId);

      if (error) throw error;

      // Actualizar el estado local
      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, count: newCount } : item
        )
      );
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      alert('Error al actualizar cantidad');
    }
  };

  const removeItem = async (itemId: string) => {
    toast((t) => (
      <div>
        <p className="font-semibold mb-2">¿Estás seguro de eliminar este producto del carrito?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const { error } = await supabase
                  .from('cart')
                  .delete()
                  .eq('id', itemId);

                if (error) throw error;

                toast.success('Producto eliminado del carrito');
                // Actualizar el estado local
                setCartItems(prev => prev.filter(item => item.id !== itemId));
              } catch (error) {
                console.error('Error al eliminar item:', error);
                toast.error('Error al eliminar del carrito');
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

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      if (item.product) {
        return total + (item.product.price * item.count);
      }
      return total;
    }, 0);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Mi Carrito</h1>
            <div className="flex items-center gap-4">
              <span className="text-2xl">👤</span>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-white rounded-md hover:opacity-90 transition-opacity"
                style={{ color: '#0D1117' }}
              >
                ← Seguir Comprando
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#4CAF50' }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          <div className="rounded-lg shadow-md p-12 text-center" style={{ backgroundColor: '#FFFFFF' }}>
            <p className="text-lg mb-4" style={{ color: '#0D1117', opacity: 0.7 }}>Tu carrito está vacío</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 text-white rounded-md hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#4CAF50' }}
            >
              Ir a Comprar
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-lg shadow-md overflow-hidden mb-6" style={{ backgroundColor: '#FFFFFF' }}>
              {cartItems.map(item => (
                item.product && (
                  <div key={item.id} className="p-6" style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1" style={{ color: '#0D1117' }}>
                          {item.product.name}
                        </h3>
                        <p className="text-lg font-bold" style={{ color: '#4CAF50' }}>
                          ${item.product.price.toFixed(2)} c/u
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.count - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: '#E5E7EB', color: '#0D1117' }}
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-semibold" style={{ color: '#0D1117' }}>
                            {item.count}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.count + 1)}
                            disabled={item.count >= item.product.stock}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#E5E7EB', color: '#0D1117' }}
                          >
                            +
                          </button>
                        </div>

                        <div className="w-32 text-right">
                          <p className="text-xl font-bold" style={{ color: '#0D1117' }}>
                            ${(item.product.price * item.count).toFixed(2)}
                          </p>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-4 p-2 rounded-md hover:opacity-80 transition-opacity"
                          style={{ color: '#4CAF50' }}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>

            {/* Total */}
            <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: '#D1D5DB' }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-semibold" style={{ color: '#000000' }}>Total:</span>
              <span className="text-2xl font-bold" style={{ color: '#4CAF50' }}>
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
              <button
                className="w-full py-3 px-4 text-white rounded-md hover:opacity-90 transition-opacity font-semibold text-lg"
                style={{ backgroundColor: '#4CAF50' }}
                onClick={() => toast('Funcionalidad de compra en desarrollo', { icon: '🛍️' })}
              >
                Proceder al Pago
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
