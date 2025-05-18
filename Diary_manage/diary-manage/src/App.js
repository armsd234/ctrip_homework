import React, { useEffect, useCallback, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';
import Mainindex from './pages/Mainindex';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from './store/slices/authSlice';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
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
  }, [dispatch, user, loading, navigate, location]);

  if (loading) return <div>加载中...</div>;
  if (!user) return <div>加载中...</div>;
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
      <Route path="/" element={<Navigate to="/mainindex" replace />} />
      <Route
        path="/mainindex"
        element={
          <PrivateRoute>
            <Mainindex />
          </PrivateRoute>
        }
      />

    </Routes>

  );
};

export default App;
