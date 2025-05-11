import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5001'; // 请替换为您的实际API地址

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

// 创建 axios 实例
export const api = axios.create({
    baseURL: API_URL,
});

// 请求拦截器
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
        }
        return Promise.reject(error);
    }
);

// 从本地获取当前用户信息
export const getCurrentUser = async (): Promise<UserInfo | null> => {
    try {
        const userStr = await AsyncStorage.getItem('userData');
        const token = await AsyncStorage.getItem('userToken');
        if(userStr && token){
            const user = JSON.parse(userStr);
            return {token: token, user: user};
        }
        return null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
};