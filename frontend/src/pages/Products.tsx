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
  category?: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productApi.getCategories();
        setCategories(response.data.categories);
      } catch (error) {
        console.error('获取分类失败:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = {
          page,
          limit: 12,
        };
        if (search) params.search = search;
        if (selectedCategory) params.category = selectedCategory;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;

        const response = await productApi.getProducts(params);
        setProducts(response.data.products);
        setTotalPages(response.data.pagination.totalPages);
      } catch (error) {
        console.error('获取商品失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, selectedCategory, minPrice, maxPrice, page]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">商品列表</h1>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="搜索商品..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">全部</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">最低价格</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">最高价格</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              placeholder="9999"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">没有找到商品</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50"
              >
                上一页
              </button>
              <span className="px-4 py-2">
                第 {page} 页，共 {totalPages} 页
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-md disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}


