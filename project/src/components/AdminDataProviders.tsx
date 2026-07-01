import React from 'react';
import { SystemSettingsProvider } from '../context/SystemSettingsContext';

const AdminDataProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SystemSettingsProvider>{children}</SystemSettingsProvider>
);

export default AdminDataProviders;
