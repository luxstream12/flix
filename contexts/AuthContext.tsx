import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, AdminUser } from '../services/authService';

interface AuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = '@flixbr:admin';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAdmin();
  }, []);

  const loadStoredAdmin = async () => {
    try {
      const stored = await AsyncStorage.getItem(ADMIN_STORAGE_KEY);
      if (stored) {
        const adminData = JSON.parse(stored);
        setAdmin(adminData);
      }
    } catch (error) {
      console.error('Error loading stored admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const { data, error } = await authService.loginAdmin(username, password);
      
      if (error || !data) {
        return { error: error || 'Erro ao fazer login' };
      }

      setAdmin(data);
      await AsyncStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(data));
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Erro ao fazer login' };
    }
  };

  const logout = async () => {
    setAdmin(null);
    await AsyncStorage.removeItem(ADMIN_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
