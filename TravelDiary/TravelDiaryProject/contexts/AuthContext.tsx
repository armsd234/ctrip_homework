import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (email: string) => Promise<any>;
  verifyCode: (email: string, code: string, password: string) => Promise<any>;
  sendVerificationCode: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setIsAuthenticated(true);
      setUser(response.data?.userInfo || null);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string) => {
    try {
      const response = await authService.register({ email });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const verifyCode = async (email: string, code: string, password: string) => {
    try {
      const response = await authService.verifyCode(email, code, password);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const sendVerificationCode = async (email: string) => {
    try {
      const response = await authService.sendVerificationCode(email);
      return response;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      login,
      logout,
      register,
      verifyCode,
      sendVerificationCode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};