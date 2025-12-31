import { useEffect, useState } from 'react';
import { adminApi } from '../../api/api';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
}

interface UserDetail {
  user: User;
  orders: any[];
  logs: Array<{
    id: string;
    action: string;
    productId?: string;
    product?: {
      id: string;
      name: string;
    };
    createdAt: string;
  }>;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      const response = await adminApi.getUsers(params);
      setUsers(response.data.users);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (userId: string) => {
    try {
      const response = await adminApi.getUser(userId);
      setSelectedUser(response.data);
    } catch (error) {
      console.error('获取用户详情失败:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">客户管理</h1>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索用户..."
          className="px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                用户名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                邮箱
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                角色
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                注册时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role === 'ADMIN' ? '管理员' : '客户'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleViewDetail(user.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    查看详情
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">用户详情</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">基本信息</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p>
                  <span className="font-medium">用户名:</span> {selectedUser.user.username}
                </p>
                <p>
                  <span className="font-medium">邮箱:</span> {selectedUser.user.email}
                </p>
                <p>
                  <span className="font-medium">角色:</span> {selectedUser.user.role}
                </p>
                <p>
                  <span className="font-medium">注册时间:</span>{' '}
                  {new Date(selectedUser.user.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">订单记录 ({selectedUser.orders.length})</h3>
              <div className="bg-gray-50 p-4 rounded max-h-48 overflow-y-auto">
                {selectedUser.orders.length === 0 ? (
                  <p className="text-gray-500">暂无订单</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.orders.map((order: any) => (
                      <div key={order.id} className="text-sm">
                        <span className="font-medium">订单 {order.id.substring(0, 8)}...</span> - ¥
                        {order.totalAmount.toFixed(2)} - {order.status}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">行为日志 ({selectedUser.logs.length})</h3>
              <div className="bg-gray-50 p-4 rounded max-h-64 overflow-y-auto">
                {selectedUser.logs.length === 0 ? (
                  <p className="text-gray-500">暂无日志</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.logs.map((log) => (
                      <div key={log.id} className="text-sm border-b pb-2">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {log.action === 'VIEW_PRODUCT' ? '浏览商品' : '购买商品'}
                          </span>
                          <span className="text-gray-500">
                            {new Date(log.createdAt).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        {log.product && (
                          <div className="text-gray-600 mt-1">商品: {log.product.name}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


