import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
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
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// 认证相关 API
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const getCurrentUser = () => api.get('/auth/me');

// 游记相关 API
export const getDiaryList = (params) => api.get('/diaries', { params });
export const getDiaryDetail = (id) => api.get(`/diaries/${id}`);
export const approveDiary = (id) => api.post(`/diaries/${id}/approve`);
export const rejectDiary = (id, reason) => api.post(`/diaries/${id}/reject`, { reason });
export const deleteDiary = (id) => api.delete(`/diaries/${id}`);

export default api; 