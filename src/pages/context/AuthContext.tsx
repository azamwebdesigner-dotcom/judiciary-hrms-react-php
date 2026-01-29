
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';
import { api } from '../services/api';

interface LoginResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Check for existing session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('hrms_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<LoginResult> => {
  try {
    const response = await api.login({ username, password });
    
    if (response.success && response.user) {
      const userData: AuthUser = {
        id: response.user.id,
        username: response.user.username,
        fullName: response.user.full_name,
        role: response.user.role as UserRole,
        avatar: response.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(response.user.full_name)}&background=random`
      };
      setUser(userData);
      localStorage.setItem('hrms_user', JSON.stringify(userData));
      return { success: true };
    }
    
    return { 
      success: false, 
      message: response.message || 'Invalid credentials' 
    };
  } catch (error) {
    console.error("Login Error", error);
    return { 
      success: false, 
      message: 'Connection failed. Ensure XAMPP (Apache/MySQL) is running and the URL in api.ts is correct.' 
    };
  }
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hrms_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
