import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi, orderApi } from '../api/api';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
  };
}

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    shippingName: '',
    shippingPhone: '',
    shippingAddress: '',
    paymentMethod: '模拟支付',
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartApi.getCart();
      setCartItems(response.data.cartItems);
      if (response.data.cartItems.length === 0) {
        navigate('/cart');
      }
    } catch (error) {
      console.error('获取购物车失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await orderApi.createOrder(formData);
      navigate(`/orders/${response.data.order.id}`);
    } catch (error: any) {
      alert(error.response?.data?.message || '创建订单失败');
    } finally {
      setSubmitting(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">结算</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">收货信息</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                收货人姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.shippingName}
                onChange={(e) => setFormData({ ...formData, shippingName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                联系电话 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.shippingPhone}
                onChange={(e) => setFormData({ ...formData, shippingPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                收货地址 <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.shippingAddress}
                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">支付方式</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="模拟支付">模拟支付</option>
                <option value="支付宝">支付宝</option>
                <option value="微信支付">微信支付</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? '提交中...' : '提交订单'}
            </button>
          </form>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">订单摘要</h2>
            <div className="space-y-2 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span>¥{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>总计:</span>
                <span className="text-blue-600">¥{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


