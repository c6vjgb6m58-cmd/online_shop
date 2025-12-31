import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// 商品API
export const productApi = {
  getProducts: (params?: any) => axios.get(`${API_BASE_URL}/products`, { params }),
  getProduct: (id: string) => axios.get(`${API_BASE_URL}/products/${id}`),
  createProduct: (data: any) => axios.post(`${API_BASE_URL}/products`, data),
  updateProduct: (id: string, data: any) => axios.put(`${API_BASE_URL}/products/${id}`, data),
  deleteProduct: (id: string) => axios.delete(`${API_BASE_URL}/products/${id}`),
  getCategories: () => axios.get(`${API_BASE_URL}/products/categories/list`),
};

// 购物车API
export const cartApi = {
  getCart: () => axios.get(`${API_BASE_URL}/cart`),
  addToCart: (productId: string, quantity: number) =>
    axios.post(`${API_BASE_URL}/cart`, { productId, quantity }),
  updateCartItem: (id: string, quantity: number) =>
    axios.put(`${API_BASE_URL}/cart/${id}`, { quantity }),
  removeFromCart: (id: string) => axios.delete(`${API_BASE_URL}/cart/${id}`),
  clearCart: () => axios.delete(`${API_BASE_URL}/cart`),
};

// 订单API
export const orderApi = {
  getOrders: () => axios.get(`${API_BASE_URL}/orders`),
  getOrder: (id: string) => axios.get(`${API_BASE_URL}/orders/${id}`),
  createOrder: (data: any) => axios.post(`${API_BASE_URL}/orders`, data),
  payOrder: (id: string) => axios.post(`${API_BASE_URL}/orders/${id}/pay`),
};

// 管理员API
export const adminApi = {
  getOrders: (params?: any) => axios.get(`${API_BASE_URL}/admin/orders`, { params }),
  updateOrderStatus: (id: string, status: string) =>
    axios.put(`${API_BASE_URL}/admin/orders/${id}/status`, { status }),
  getUsers: (params?: any) => axios.get(`${API_BASE_URL}/admin/users`, { params }),
  getUser: (id: string) => axios.get(`${API_BASE_URL}/admin/users/${id}`),
  getStatistics: (params?: any) => axios.get(`${API_BASE_URL}/admin/statistics`, { params }),
};

// 用户API
export const userApi = {
  getMe: () => axios.get(`${API_BASE_URL}/users/me`),
  updateMe: (data: any) => axios.put(`${API_BASE_URL}/users/me`, data),
};


