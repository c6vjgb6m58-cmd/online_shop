import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderApi.getOrders();
      setOrders(response.data.orders);
    } catch (error) {
      console.error('获取订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">您还没有订单</p>
        <Link
          to="/products"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
        >
          去购物
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">我的订单</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusMap[order.status] || {
            label: order.status,
            color: 'bg-gray-100 text-gray-800',
          };

          return (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">订单号: {order.id}</p>
                  <p className="text-sm text-gray-500">
                    下单时间: {new Date(order.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {order.orderItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">无图</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        ¥{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
                {order.orderItems.length > 3 && (
                  <p className="text-sm text-gray-500">
                    还有 {order.orderItems.length - 3} 件商品...
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <span className="text-xl font-bold text-blue-600">
                  总计: ¥{order.totalAmount.toFixed(2)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


