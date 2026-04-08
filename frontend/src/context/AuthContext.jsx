import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as loginService, register as registerService, logout as logoutService, getUser } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const userData = getUser();
    if (userData) {
      try {
        setUser(userData);
      } catch (e) {
        console.error('Error loading user:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // REAL LOGIN - Calls backend API
  const login = async (credentials) => {
    try {
      const response = await loginService(credentials);
      setUser(response.data.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // REAL REGISTER - Calls backend API
  const register = async (userData) => {
    try {
      const response = await registerService(userData);
      setUser(response.data.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // LOGOUT
  const logout = () => {
    logoutService();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isRider: user?.role === 'rider',
    isCustomer: user?.role === 'customer'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};