import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StoreAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!['store_admin', 'super_admin'].includes(role ?? '')) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
};

export default StoreAdminRoute;
