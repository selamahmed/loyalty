import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, role, dashboardPath } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'customer') return <Navigate to={dashboardPath} replace />;
  return <>{children}</>;
};

export default CustomerRoute;
