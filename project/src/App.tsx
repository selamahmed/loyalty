import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { RewardEventsProvider } from './context/RewardEventsContext';
import Layout from './components/Layout';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Main pages
import Home from './pages/Home';
import Profile from './pages/Profile';
import Inventory from './pages/Inventory';
import RewardsShop from './pages/RewardsShop';
import MiniGames from './pages/MiniGames';
import ProgressPath from './pages/ProgressPath';
import QRScanner from './pages/QRScanner';
import RedeemPoints from './pages/RedeemPoints';
import Achievements from './pages/Achievements';
import Missions from './pages/Missions';
import Notifications from './pages/Notifications';
import History from './pages/History';
import Settings from './pages/Settings';
import Support from './pages/Support';
import SeasonalEvents from './pages/SeasonalEvents';
import Leaderboard from './pages/Leaderboard';
import UserStats from './pages/UserStats';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRewards from './pages/admin/AdminRewards';
import AdminEvents from './pages/admin/AdminEvents';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminQR from './pages/admin/AdminQR';
import AdminGames from './pages/admin/AdminGames';

// Additional admin pages
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminPointsEconomy from './pages/admin/AdminPointsEconomy';
import AdminDashboard2 from './pages/admin/AdminDashboard2';
import AdminUsers2 from './pages/admin/AdminUsers2';
import AdminRewardEvents from './pages/admin/AdminRewardEvents';

// Error pages
import { NotFound, NoConnection, Maintenance } from './pages/ErrorPages';

const WrappedPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Layout>{children}</Layout>
);

function App() {
  return (
    <RewardEventsProvider>
    <AppProvider>
      <HashRouter>
        <Routes>

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Main Pages */}
          <Route path="/" element={<WrappedPage><Home /></WrappedPage>} />
          <Route path="/profile" element={<WrappedPage><Profile /></WrappedPage>} />
          <Route path="/inventory" element={<WrappedPage><Inventory /></WrappedPage>} />
          <Route path="/shop" element={<WrappedPage><RewardsShop /></WrappedPage>} />
          <Route path="/games" element={<WrappedPage><MiniGames /></WrappedPage>} />
          <Route path="/progress" element={<WrappedPage><ProgressPath /></WrappedPage>} />
          <Route path="/qr" element={<WrappedPage><QRScanner /></WrappedPage>} />
          <Route path="/redeem" element={<WrappedPage><RedeemPoints /></WrappedPage>} />
          <Route path="/achievements" element={<WrappedPage><Achievements /></WrappedPage>} />
          <Route path="/missions" element={<WrappedPage><Missions /></WrappedPage>} />
          <Route path="/notifications" element={<WrappedPage><Notifications /></WrappedPage>} />
          <Route path="/history" element={<WrappedPage><History /></WrappedPage>} />
          <Route path="/settings" element={<WrappedPage><Settings /></WrappedPage>} />
          <Route path="/support" element={<WrappedPage><Support /></WrappedPage>} />
          <Route path="/events" element={<WrappedPage><SeasonalEvents /></WrappedPage>} />
          <Route path="/leaderboard" element={<WrappedPage><Leaderboard /></WrappedPage>} />
          <Route path="/stats" element={<WrappedPage><UserStats /></WrappedPage>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/rewards" element={<AdminRewards />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/qr" element={<AdminQR />} />
          <Route path="/admin/games" element={<AdminGames />} />

          {/* New Admin Pages */}
          <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
          <Route path="/admin/points-economy" element={<AdminPointsEconomy />} />
          <Route path="/admin/dashboard-v2" element={<AdminDashboard2 />} />
          <Route path="/admin/users-v2" element={<AdminUsers2 />} />
          <Route path="/admin/reward-events" element={<AdminRewardEvents />} />

          {/* Error Pages */}
          <Route path="/no-connection" element={<NoConnection />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="*" element={<NotFound />} />

        </Routes>
      </HashRouter>
    </AppProvider>
    </RewardEventsProvider>
  );
}

export default App;
