import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://your-api-url.com';

// 定义用户注册信息类型
export interface RegisterData {
  username: string;
  email: string;
  password: string;
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
  return api.post<UserInfo>('/register', data);
};

// 登录请求
export const login = async (data: LoginData) => {
  const response = await api.post<UserInfo>('/login', data);
  if (response.data.token) {
    await AsyncStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// 退出登录
export const logout = async () => {
  await AsyncStorage.removeItem('user');
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<UserInfo | null> => {
  try {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// 检查用户是否已登录
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user?.token;
};

// 获取用户信息
export const getUserInfo = async () => {
  return api.get('/me');
};