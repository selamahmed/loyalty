import React from 'react';
import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';
import { RewardEventsProvider } from '../context/RewardEventsContext';
import { InventoryProvider } from '../context/InventoryContext';

/** Auth, Supabase, and app state — not loaded for the public landing route. */
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RewardEventsProvider>
    <AuthProvider>
      <AppProvider>
        <InventoryProvider>{children}</InventoryProvider>
      </AppProvider>
    </AuthProvider>
  </RewardEventsProvider>
);

export default AppProviders;
