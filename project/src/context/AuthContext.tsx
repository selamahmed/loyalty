import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'customer' | 'super_admin' | 'store_admin' | 'cashier';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  authUser: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  dashboardPath: string;
}

const STORAGE_KEY = 'nexreward_auth';

const MOCK_ACCOUNTS: (AuthUser & { password: string })[] = [
  {
    id: '1', name: 'StarPlayer99', email: 'customer@nexreward.com', password: '123456',
    role: 'customer', avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    id: '2', name: 'Super Admin', email: 'admin@nexreward.com', password: '123456',
    role: 'super_admin',
  },
  {
    id: '3', name: 'Store Manager', email: 'store@nexreward.com', password: '123456',
    role: 'store_admin',
  },
  {
    id: '4', name: 'Cashier Ali', email: 'cashier@nexreward.com', password: '123456',
    role: 'cashier',
  },
];

export const getDashboardPath = (role: UserRole | null): string => {
  switch (role) {
    case 'super_admin':  return '/admin';
    case 'store_admin':  return '/store-admin';
    case 'cashier':      return '/cashier';
    case 'customer':
    default:             return '/app';
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const role = authUser?.role ?? null;
  const isAuthenticated = authUser !== null;
  const dashboardPath = getDashboardPath(role);

  useEffect(() => {
    if (authUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [authUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(r => setTimeout(r, 800));
    const account = MOCK_ACCOUNTS.find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (!account) {
      return { success: false, error: 'Geçersiz e-posta veya şifre.' };
    }
    const { password: _pw, ...user } = account;
    setAuthUser(user);
    return { success: true };
  };

  const logout = () => {
    setAuthUser(null);
  };

  return (
    <AuthContext.Provider value={{ authUser, role, isAuthenticated, login, logout, dashboardPath }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
