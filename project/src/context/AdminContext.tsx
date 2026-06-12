import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface AdminContextType {
  isAuthenticated: boolean;
  loading: boolean;
  hasRole: (role: string) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { authUser, isLoading } = useAuth();

  const hasRole = (role: string) => authUser?.role === role;

  return (
    <AdminContext.Provider value={{ isAuthenticated: !!authUser, loading: isLoading, hasRole }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};
