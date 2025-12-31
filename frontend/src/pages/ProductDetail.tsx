import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, cartApi } from '../api/api';
import { useAuthStore } from '../store/authStore';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  stock: number;
  category?: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productApi.getProduct(id!);
        setProduct(response.data.product);
      } catch (error) {
        console.error('获取商品详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!product) return;

    setAdding(true);
    setMessage('');

    try {
      await cartApi.addToCart(product.id, quantity);
      setMessage('已添加到购物车！');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || '添加失败');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  if (!product) {
    return <div className="text-center py-12">商品不存在</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-gray-400">暂无图片</span>
            )}
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          {product.category && (
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mb-4">
              {product.category}
            </span>
          )}
          <div className="mb-4">
            <span className="text-3xl font-bold text-blue-600">¥{product.price.toFixed(2)}</span>
          </div>
          <div className="mb-6">
            <p className="text-gray-700 mb-2">库存: {product.stock}</p>
            <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
          </div>

          {product.stock > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">数量:</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              {message && (
                <div
                  className={`p-3 rounded ${
                    message.includes('失败') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                  }`}
                >
                  {message}
                </div>
              )}
              <button
                onClick={handleAddToCart}
                disabled={adding || quantity > product.stock}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? '添加中...' : '加入购物车'}
              </button>
            </div>
          ) : (
            <div className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg text-center">
              商品已售罄
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


