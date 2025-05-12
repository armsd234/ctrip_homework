import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, logout as logoutApi, getCurrentUser } from '../../services/api';

export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await loginApi(credentials);
            localStorage.setItem('token', response.token);
            // console.log('Login API response.data:', response.data);
            return response.data ;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || '登录失败');
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await logoutApi();
            localStorage.removeItem('token');
            return null;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || '退出失败');
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            console.log('Fetch Current User。。。。。');
            const token = localStorage.getItem('token');
            console.log('Fetch Current User token:', token); // Debugging informatio
            const response = await getCurrentUser();
            console.log('Fetch Current User Response:', response.data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || '获取用户信息失败');
        }
    }
);

const initialState = {
    user: null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                console.log('Login fulfilled:', state.user);
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
            })
            // Fetch Current User
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                console.log('Current User:', state.user); // Debugging informatio
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.log('Current User:',  state.error); 
            });
    },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer; 