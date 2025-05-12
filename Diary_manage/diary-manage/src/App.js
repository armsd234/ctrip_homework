import React, { useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from './store/slices/authSlice';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  const dispatchGetUser = useCallback(async () => {
    try {
      console.log('尝试获取当前用户信息...');
      //在这阻塞 10 秒
      await new Promise(resolve => setTimeout(resolve, 10000)); 
      await dispatch(fetchCurrentUser()).unwrap();
    } catch (error) {
      console.error('获取当前用户信息失败:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('jiaz token', token);
    console.log('jiaz user', user);
    console.log('jiaz loading', loading);
    if (token && !user && !loading) {
      dispatchGetUser();
    }
  }, [user, loading, dispatchGetUser]);

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
