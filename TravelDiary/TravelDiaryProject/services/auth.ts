import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000'; // 请替换为您的实际API地址

// 定义用户注册信息类型
export interface RegisterData {
  email: string;
}

// 定义用户登录信息类型
export interface LoginData {
  username: string;
  password: string;
}

// 定义用户信息类型
export interface UserInfo {
  token: string;
  userInfo: {
    userId: string;
    username: string;
    nickname: string;
    avatar: string;
    backgroundImage: string;
    signature: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// 创建 axios 实例
const api = axios.create({
  baseURL: API_URL,
});

// 请求拦截器
api.interceptors.request.use(
  async (config) => {
    const user = await getCurrentUser();
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // token 过期，清除用户信息并跳转到登录页
      await logout();
      // 这里需要处理路由跳转，可以通过事件总线或其他方式实现
    }
    return Promise.reject(error);
  }
);

// 注册请求
export const register = async (data: RegisterData) => {
  return api.post<UserInfo>('/auth/register', data);
};

// 登录请求
export const login = async (data: LoginData) => {
  const response = await api.post<UserInfo>('/auth/login', data);
  if (response.data.token) {
    await AsyncStorage.setItem('userToken', response.data.token);
    await AsyncStorage.setItem('userData', JSON.stringify(response.data.userInfo));
  }
  return response.data;
};

// 退出登录
export const logout = async () => {
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('userData');
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<UserInfo | null> => {
  try {
    const userStr = await AsyncStorage.getItem('userData');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// 检查用户是否已登录
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getCurrentUser();
  return !!token?.token;
};

// 获取用户信息
export const getUserInfo = async () => {
  return api.get('/me');
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    try {
      const response = await axios.post<ApiResponse<UserInfo>>(`${API_URL}/auth/login`, credentials);
      console.log('Login response:', response.data);
      if (response.data.data?.token) {
        await AsyncStorage.setItem('userToken', response.data.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.userInfo));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async register(data: RegisterData) {
    try {
      const response = await axios.post<ApiResponse>(`${API_URL}/auth/register`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  async getToken() {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },

  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  },

  async sendVerificationCode(email: string) {
    try {
      const response = await axios.post<ApiResponse>(`${API_URL}/auth/send-verification`, { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async verifyCode(email: string, code: string, password: string) {
    try {
      const response = await axios.post<ApiResponse>(`${API_URL}/auth/verify-code`, { email, code, password});
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};