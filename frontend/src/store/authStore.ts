import { create } from 'zustand';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  username: string;
  role: 'CUSTOMER' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // 从localStorage恢复状态
  const savedToken = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  const initialState = {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken,
  };

  // 设置axios默认header
  if (savedToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
  }

  return {
    ...initialState,
    login: async (email: string, password: string) => {
      try {
        const response = await axios.post('/api/auth/login', { email, password });
        const { user, token } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        set({ user, token });
      } catch (error: any) {
        throw new Error(error.response?.data?.message || '登录失败');
      }
    },
    register: async (email: string, username: string, password: string) => {
      try {
        const response = await axios.post('/api/auth/register', {
          email,
          username,
          password,
        });
        const { user, token } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        set({ user, token });
      } catch (error: any) {
        throw new Error(error.response?.data?.message || '注册失败');
      }
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      set({ user: null, token: null });
    },
    checkAuth: async () => {
      if (!savedToken) return;
      
      try {
        const response = await axios.get('/api/auth/me');
        const { user } = response.data;
        set({ user });
      } catch (error) {
        // Token无效，清除状态
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        set({ user: null, token: null });
      }
    },
  };
});


