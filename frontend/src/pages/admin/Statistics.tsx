import { useEffect, useState } from 'react';
import { adminApi } from '../../api/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Statistics {
  totalSales: number;
  orderStats: Array<{ status: string; _count: { id: number } }>;
  topProducts: Array<{
    productId: string;
    product?: { name: string; price: number };
    _sum: { quantity: number | null };
    totalRevenue: number;
  }>;
  dailyStats: Array<{ date: string; order_count: number; total_revenue: number }>;
}

export default function AdminStatistics() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, [startDate, endDate]);

  const fetchStatistics = async () => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await adminApi.getStatistics(params);
      setStats(response.data);
    } catch (error) {
      console.error('获取统计信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  if (!stats) {
    return <div className="text-center py-12">无法加载统计数据</div>;
  }

  const orderStatsData = stats.orderStats.map((item) => ({
    name:
      item.status === 'PENDING_PAYMENT'
        ? '待付款'
        : item.status === 'PAID'
        ? '已付款'
        : item.status === 'SHIPPED'
        ? '已发货'
        : item.status === 'COMPLETED'
        ? '已完成'
        : item.status === 'CANCELLED'
        ? '已取消'
        : item.status,
    count: item._count.id,
  }));

  const dailyStatsData = (stats.dailyStats as any[]).map((item) => ({
    date: new Date(item.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    revenue: parseFloat(item.total_revenue) || 0,
    orders: parseInt(item.order_count) || 0,
  }));

  const topProductsData = stats.topProducts.slice(0, 10).map((item) => ({
    name: item.product?.name || '未知商品',
    sales: item._sum.quantity || 0,
    revenue: item.totalRevenue,
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">销售统计</h1>
        <div className="flex space-x-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
            placeholder="开始日期"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
            placeholder="结束日期"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">总销售额</h3>
          <p className="text-3xl font-bold text-blue-600">¥{stats.totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">总订单数</h3>
          <p className="text-3xl font-bold text-green-600">
            {stats.orderStats.reduce((sum, item) => sum + item._count.id, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">热销商品数</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.topProducts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">订单状态分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderStatsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">每日销售趋势（最近30天）</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyStatsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="销售额" />
              <Line type="monotone" dataKey="orders" stroke="#10b981" name="订单数" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">热销商品TOP10</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topProductsData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#8b5cf6" name="销量" />
            <Bar dataKey="revenue" fill="#3b82f6" name="销售额" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


