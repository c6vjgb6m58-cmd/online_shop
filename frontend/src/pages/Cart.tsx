import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi } from '../api/api';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    stock: number;
  };
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartApi.getCart();
      setCartItems(response.data.cartItems);
    } catch (error) {
      console.error('获取购物车失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;

    setUpdating(id);
    try {
      await cartApi.updateCartItem(id, quantity);
      await fetchCart();
    } catch (error: any) {
      alert(error.response?.data?.message || '更新失败');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (id: string) => {
    if (!confirm('确定要删除这个商品吗？')) return;

    try {
      await cartApi.removeFromCart(id);
      await fetchCart();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">购物车是空的</p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          去购物
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">购物车</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="divide-y">
          {cartItems.map((item) => (
            <div key={item.id} className="p-4 flex items-center space-x-4">
              <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                {item.product.image ? (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">暂无图片</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.product.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-1">{item.product.description}</p>
                <p className="text-blue-600 font-bold mt-1">¥{item.product.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={updating === item.id || item.quantity <= 1}
                  className="w-8 h-8 border rounded disabled:opacity-50"
                >
                  -
                </button>
                <span className="w-12 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={updating === item.id || item.quantity >= item.product.stock}
                  className="w-8 h-8 border rounded disabled:opacity-50"
                >
                  +
                </button>
              </div>
              <div className="text-right">
                <p className="font-bold">¥{(item.product.price * item.quantity).toFixed(2)}</p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 text-sm hover:text-red-700 mt-1"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-semibold">总计:</span>
            <span className="text-2xl font-bold text-blue-600">¥{total.toFixed(2)}</span>
          </div>
          <button
            onClick={() => navigate('/orders/checkout')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            去结算
          </button>
        </div>
      </div>
    </div>
  );
}


