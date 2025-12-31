import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderApi } from '../api/api';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image?: string;
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  paymentMethod?: string;
  createdAt: string;
  orderItems: OrderItem[];
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: '待付款', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: '已付款', color: 'bg-blue-100 text-blue-800' },
  SHIPPED: { label: '已发货', color: 'bg-purple-100 text-purple-800' },
  COMPLETED: { label: '已完成', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: '已取消', color: 'bg-red-100 text-red-800' },
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderApi.getOrder(id!);
        setOrder(response.data.order);
      } catch (error) {
        console.error('获取订单详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handlePay = async () => {
    if (!order || !confirm('确认支付？')) return;

    setPaying(true);
    try {
      await orderApi.payOrder(order.id);
      // 刷新订单
      const response = await orderApi.getOrder(id!);
      setOrder(response.data.order);
    } catch (error: any) {
      alert(error.response?.data?.message || '支付失败');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  if (!order) {
    return <div className="text-center py-12">订单不存在</div>;
  }

  const status = statusMap[order.status] || {
    label: order.status,
    color: 'bg-gray-100 text-gray-800',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">订单详情</h1>
        <button
          onClick={() => navigate('/orders')}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          返回订单列表
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">订单号</p>
            <p className="font-mono">{order.id}</p>
          </div>
          <span className={`px-4 py-2 rounded-full font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>

        {order.status === 'PENDING_PAYMENT' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 mb-2">订单待支付</p>
            <button
              onClick={handlePay}
              disabled={paying}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {paying ? '支付中...' : '立即支付'}
            </button>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">商品信息</h2>
          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
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
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-gray-600 text-sm">
                    单价: ¥{item.price.toFixed(2)} × 数量: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">¥{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">收货信息</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-medium">收货人:</span> {order.shippingName}
              </p>
              <p>
                <span className="font-medium">联系电话:</span> {order.shippingPhone}
              </p>
              <p>
                <span className="font-medium">收货地址:</span> {order.shippingAddress}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">订单信息</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-medium">下单时间:</span>{' '}
                {new Date(order.createdAt).toLocaleString('zh-CN')}
              </p>
              {order.paymentMethod && (
                <p>
                  <span className="font-medium">支付方式:</span> {order.paymentMethod}
                </p>
              )}
              <p>
                <span className="font-medium">订单总额:</span>
                <span className="text-2xl font-bold text-blue-600 ml-2">
                  ¥{order.totalAmount.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


