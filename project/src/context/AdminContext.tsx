import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser, adminAuthService } from '../lib/adminAuth';

interface AdminContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAdmin = async () => {
      try {
        const currentAdmin = await adminAuthService.getCurrentAdmin();
        setAdmin(currentAdmin);
      } catch (error) {
        console.error('Failed to restore admin session:', error);
      } finally {
        setLoading(false);
      }
    };
    initAdmin();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const session = await adminAuthService.login(email, password);
    const currentAdmin = await adminAuthService.getCurrentAdmin();
    setAdmin(currentAdmin);
  };

  const handleLogout = async () => {
    await adminAuthService.logout();
    setAdmin(null);
  };

  const value: AdminContextType = {
    admin,
    loading,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: !!admin,
    hasRole: adminAuthService.hasRole.bind(adminAuthService),
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
