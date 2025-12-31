import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  stock: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productApi.getProducts({ limit: 8 });
        setProducts(response.data.products);
      } catch (error) {
        console.error('获取商品失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">欢迎来到电商网站</h1>
          <p className="text-xl mb-8">发现优质商品，享受购物乐趣</p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100"
          >
            浏览商品
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">热门商品</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">暂无图片</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-bold">¥{product.price.toFixed(2)}</span>
                  <span className="text-sm text-gray-500">库存: {product.stock}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


