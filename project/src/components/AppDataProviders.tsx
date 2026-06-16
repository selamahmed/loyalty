import React from 'react';
import { AppProvider } from '../context/AppContext';
import { RewardEventsProvider } from '../context/RewardEventsContext';
import { InventoryProvider } from '../context/InventoryContext';

/** Data-heavy app providers loaded only after auth-protected routes need them. */
const AppDataProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RewardEventsProvider>
    <AppProvider>
      <InventoryProvider>{children}</InventoryProvider>
    </AppProvider>
  </RewardEventsProvider>
);

export default AppDataProviders;
