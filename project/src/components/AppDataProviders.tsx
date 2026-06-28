import React, { useEffect } from 'react';
import { AppProvider } from '../context/AppContext';
import { RewardEventsProvider } from '../context/RewardEventsContext';
import { InventoryProvider } from '../context/InventoryContext';
import { SystemSettingsProvider } from '../context/SystemSettingsContext';
import { useAuth } from '../context/AuthContext';
import { markMissionPageVisit } from '../lib/missionVisitTracker';

const MissionDailyVisit: React.FC = () => {
  const { authUser } = useAuth();
  useEffect(() => {
    if (authUser?.id) markMissionPageVisit('daily_visit', authUser.id);
  }, [authUser?.id]);
  return null;
};

/** Data-heavy app providers loaded only after auth-protected routes need them. */
const AppDataProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SystemSettingsProvider>
    <RewardEventsProvider>
      <AppProvider>
        <InventoryProvider>
          <MissionDailyVisit />
          {children}
        </InventoryProvider>
      </AppProvider>
    </RewardEventsProvider>
  </SystemSettingsProvider>
);

export default AppDataProviders;
