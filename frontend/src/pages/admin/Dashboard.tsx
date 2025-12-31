import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">管理后台</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/admin/products"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">商品管理</h2>
          <p className="text-gray-600">管理商品信息、库存等</p>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">订单管理</h2>
          <p className="text-gray-600">查看和处理订单</p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">客户管理</h2>
          <p className="text-gray-600">查看客户信息和日志</p>
        </Link>

        <Link
          to="/admin/statistics"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">销售统计</h2>
          <p className="text-gray-600">查看销售数据和报表</p>
        </Link>
      </div>
    </div>
  );
}


