import React, { useEffect, useCallback, useState } from 'react';
import { Routes, Route, Navigate, useLocation ,useNavigate } from 'react-router-dom';
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

  // const dispatchGetUser = useCallback(async () => {
  //   try {
  //     setIsChecking(true);
  //     await dispatch(fetchCurrentUser()).unwrap();
  //   } catch (error) {
  //     console.error('获取当前用户信息失败:', error);
  //   } finally {
  //     setIsChecking(false);
  //   }
  // }, [dispatch]);

  // // 检查 token 并获取用户信息
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (token && !user && !loading) {
  //     dispatch(fetchCurrentUser());
  //     if (!user?.user) {
  //       console.log('用户信息不存在');
  //      <Navigate to="/login" replace />;
  //     }
  //   }else{
  //     console.log('用户信息不存在');
  //     <Navigate to="/login" replace />;
  //   }
  // }, [dispatch, user, loading]);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login', { replace: true, state: { from: location } });
      return;
    }
  
    if (token && !user && !loading) {
      dispatch(fetchCurrentUser()); // 发起请求，等待 user 更新
    }
    // console.log('依赖项变化:', { user, loading, location },'User 123:', user);
  }, [dispatch, user, loading, navigate, location]);
  
  // 渲染逻辑
  if (loading) return <div>加载中...</div>;
  if (!user) return null; // 短暂空白，等待 useEffect 处理导航
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
