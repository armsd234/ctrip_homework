import {api, getCurrentUser} from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5001'; // 请替换为您的实际API地址

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
  user: {
    _id: string;
    username: string;
    email: string;
    nickname: string;
    gender: string;
    avatar: string;
    birthday: Date;
    status: string;
    backgroundImage: string;
    signature: string;
    location: string;
    posts: number;
    likeds: number;
    followers: number;
    followings: number;
    favoriteds: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
// 定义登录凭证类型
export interface LoginCredentials {
  email: string;
  password: string;
}



export const authService = {
  async getUserInfo() {
    try {
      return await getCurrentUser();
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  },

  async login(credentials: LoginCredentials) {
    try {
      const response = await api.post<ApiResponse<UserInfo>>(`${API_URL}/api/auth/login`, credentials);
      
      if (response.data.data?.token) {
        await AsyncStorage.setItem('userToken', response.data.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user));
      }
      return response.data.data || null;
    } catch (error) {
      throw error;
    }
  },

  async register(data: RegisterData) {
    try {
      const response = await api.post<ApiResponse>(`${API_URL}/api/auth/register`, data);
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
    try {
      const response = await api.get<ApiResponse<UserInfo>>(`${API_URL}/api/auth/me`);
      
      if(response.data.data?.user){
        //console.log('isAuthenticated:', response.data.data?.user);
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.data?.user));

        return true;
      }else{
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('userToken');
        return false;
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
  },

  async sendVerificationCode(email: string) {
    try {
      const response = await api.post<ApiResponse>(`${API_URL}/api/auth/send-verification`, { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async verifyCode(email: string, code: string, password: string) {
    try {
      const response = await api.post<ApiResponse>(`${API_URL}/api/auth/verify-code`, { email, code, password});
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};