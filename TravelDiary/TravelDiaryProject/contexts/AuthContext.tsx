import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService,UserInfo } from '../services/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  login: (email: string, password: string) => Promise<UserInfo | null>;
  logout: () => Promise<void>;
  register: (email: string) => Promise<any>;
  verifyCode: (email: string, code: string, password: string) => Promise<any>;
  sendVerificationCode: (email: string) => Promise<any>;
  checkToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setIsAuthenticated(true);
      console.log('登录：',response);
      setUser(response || null);
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

  const checkToken = async () => {
    try {
      const flag = await authService.isAuthenticated();
      
      if (flag) {
        setIsAuthenticated(flag);
        
        const userInfo = await authService.getUserInfo();
        setUser(userInfo || null);
        console.log('userInfo',userInfo);
         
      }else{
        setUser(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
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
      sendVerificationCode,
      checkToken,
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