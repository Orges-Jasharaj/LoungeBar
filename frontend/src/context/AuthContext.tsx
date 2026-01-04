import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../services/api';
import type { LoginDto, CreateUserDto, LoginResponseDto, User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (loginData: LoginDto) => Promise<void>;
  register: (registerData: CreateUserDto) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kontrollo nëse ka user të ruajtur në localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setLoading(false);
  }, []);

  const login = async (loginData: LoginDto) => {
    try {
      const response: LoginResponseDto = await authApi.login(loginData);
      
      // Ruaj token dhe user info
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Sigurohu që roles është një array
      const roles = Array.isArray(response.roles) ? response.roles : [];
      
      const userData: User = {
        displayName: response.displayName,
        email: response.email,
        roles: roles,
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS')) {
        throw new Error('Nuk mund të lidhemi me serverin. Sigurohu që backend-i është duke u ekzekutuar në http://localhost:5067');
      }
      const errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || 'Login dështoi';
      throw new Error(errorMessage);
    }
  };

  const register = async (registerData: CreateUserDto) => {
    try {
      await authApi.register(registerData);
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS')) {
        throw new Error('Nuk mund të lidhemi me serverin. Sigurohu që backend-i është duke u ekzekutuar në http://localhost:5067');
      }
      const errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || 'Regjistrimi dështoi';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

