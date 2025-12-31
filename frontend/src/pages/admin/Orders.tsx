import { useEffect, useState } from 'react';
import { adminApi } from '../../api/api';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
  orderItems: OrderItem[];
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: '待付款', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: '已付款', color: 'bg-blue-100 text-blue-800' },
  SHIPPED: { label: '已发货', color: 'bg-purple-100 text-purple-800' },
  COMPLETED: { label: '已完成', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: '已取消', color: 'bg-red-100 text-red-800' },
};

const statusOptions = [
  { value: 'PENDING_PAYMENT', label: '待付款' },
  { value: 'PAID', label: '已付款' },
  { value: 'SHIPPED', label: '已发货' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const response = await adminApi.getOrders(params);
      setOrders(response.data.orders);
    } catch (error) {
      console.error('获取订单列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!confirm('确定要更改订单状态吗？')) return;

    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (error: any) {
      alert(error.response?.data?.message || '更新失败');
    }
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">订单管理</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">全部状态</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  订单号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  客户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  下单时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => {
                const status = statusMap[order.status] || {
                  label: order.status,
                  color: 'bg-gray-100 text-gray-800',
                };

                return (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {order.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.user.username}</div>
                      <div className="text-sm text-gray-500">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                      ¥{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


