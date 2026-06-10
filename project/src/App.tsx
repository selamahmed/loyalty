import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { RewardEventsProvider } from './context/RewardEventsContext';
import { InventoryProvider } from './context/InventoryContext';
import Layout from './components/Layout';

// Route Guards
import CustomerRoute from './components/guards/CustomerRoute';
import SuperAdminRoute from './components/guards/SuperAdminRoute';
import StoreAdminRoute from './components/guards/StoreAdminRoute';
import CashierRoute from './components/guards/CashierRoute';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Landing page
import LandingPage from './pages/LandingPage';

// Error / Utility pages
import Unauthorized from './pages/Unauthorized';
import { NotFound, NoConnection, Maintenance } from './pages/ErrorPages';

// Customer pages
import Home from './pages/Home';
import Profile from './pages/Profile';
import Inventory from './pages/Inventory';
import RewardsShop from './pages/RewardsShop';
import MiniGames from './pages/MiniGames';
import ProgressPath from './pages/ProgressPath';
import QRScanner from './pages/QRScanner';
import Achievements from './pages/Achievements';
import Missions from './pages/Missions';
import Notifications from './pages/Notifications';
import History from './pages/History';
import Settings from './pages/Settings';
import Support from './pages/Support';
import SeasonalEvents from './pages/SeasonalEvents';
import Leaderboard from './pages/Leaderboard';
import UserStats from './pages/UserStats';

// Super Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRewards from './pages/admin/AdminRewards';
import AdminEvents from './pages/admin/AdminEvents';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminQR from './pages/admin/AdminQR';
import AdminGames from './pages/admin/AdminGames';
import AdminInventory from './pages/admin/AdminInventory';
import AdminCheckout from './pages/admin/AdminCheckout';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminPointsEconomy from './pages/admin/AdminPointsEconomy';
import AdminDashboard2 from './pages/admin/AdminDashboard2';
import AdminUsers2 from './pages/admin/AdminUsers2';
import AdminRewardEvents from './pages/admin/AdminRewardEvents';
import AdminDailyRewards from './pages/admin/AdminDailyRewards';

// Store Admin pages
import StoreAdminDashboard from './pages/admin/store/StoreAdminDashboard';
import StoreAdminCustomers from './pages/admin/store/StoreAdminCustomers';

// Cashier pages
import CashierDashboard from './pages/admin/cashier/CashierDashboard';

const C: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CustomerRoute><Layout>{children}</Layout></CustomerRoute>
);

function App() {
  return (
    <RewardEventsProvider>
    <AuthProvider>
    <AppProvider>
    <InventoryProvider>
      <HashRouter>
        <Routes>

          {/* ── Public ─────────────────────────────────────────────────── */}
          <Route path="/"        element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ── Customer (/app + legacy /home alias) ───────────────────── */}
          <Route path="/app"           element={<C><Home /></C>} />
          <Route path="/home"          element={<C><Home /></C>} />
          <Route path="/profile"       element={<C><Profile /></C>} />
          <Route path="/inventory"     element={<C><Inventory /></C>} />
          <Route path="/shop"          element={<C><RewardsShop /></C>} />
          <Route path="/games"         element={<C><MiniGames /></C>} />
          <Route path="/progress"      element={<C><ProgressPath /></C>} />
          <Route path="/qr"            element={<C><QRScanner /></C>} />
          <Route path="/achievements"  element={<C><Achievements /></C>} />
          <Route path="/missions"      element={<C><Missions /></C>} />
          <Route path="/notifications" element={<C><Notifications /></C>} />
          <Route path="/history"       element={<C><History /></C>} />
          <Route path="/settings"      element={<C><Settings /></C>} />
          <Route path="/support"       element={<C><Support /></C>} />
          <Route path="/events"        element={<C><SeasonalEvents /></C>} />
          <Route path="/leaderboard"   element={<C><Leaderboard /></C>} />
          <Route path="/stats"         element={<C><UserStats /></C>} />

          {/* ── Super Admin (/admin/*) ─────────────────────────────────── */}
          <Route path="/admin"                  element={<SuperAdminRoute><AdminDashboard /></SuperAdminRoute>} />
          <Route path="/admin/dashboard-v2"     element={<SuperAdminRoute><AdminDashboard2 /></SuperAdminRoute>} />
          <Route path="/admin/analytics"        element={<SuperAdminRoute><AdminAnalytics /></SuperAdminRoute>} />
          <Route path="/admin/users"            element={<SuperAdminRoute><AdminUsers /></SuperAdminRoute>} />
          <Route path="/admin/users-v2"         element={<SuperAdminRoute><AdminUsers2 /></SuperAdminRoute>} />
          <Route path="/admin/rewards"          element={<SuperAdminRoute><AdminRewards /></SuperAdminRoute>} />
          <Route path="/admin/reward-events"    element={<SuperAdminRoute><AdminRewardEvents /></SuperAdminRoute>} />
          <Route path="/admin/events"           element={<SuperAdminRoute><AdminEvents /></SuperAdminRoute>} />
          <Route path="/admin/notifications"    element={<SuperAdminRoute><AdminNotifications /></SuperAdminRoute>} />
          <Route path="/admin/inventory"        element={<SuperAdminRoute><AdminInventory /></SuperAdminRoute>} />
          <Route path="/admin/checkout"         element={<SuperAdminRoute><AdminCheckout /></SuperAdminRoute>} />
          <Route path="/admin/qr"               element={<SuperAdminRoute><AdminQR /></SuperAdminRoute>} />
          <Route path="/admin/games"            element={<SuperAdminRoute><AdminGames /></SuperAdminRoute>} />
          <Route path="/admin/daily-rewards"    element={<SuperAdminRoute><AdminDailyRewards /></SuperAdminRoute>} />
          <Route path="/admin/points-economy"   element={<SuperAdminRoute><AdminPointsEconomy /></SuperAdminRoute>} />
          <Route path="/admin/audit-logs"       element={<SuperAdminRoute><AdminAuditLogs /></SuperAdminRoute>} />
          <Route path="/admin/settings"         element={<SuperAdminRoute><AdminSettings /></SuperAdminRoute>} />

          {/* ── Store Admin (/store-admin/*) ───────────────────────────── */}
          <Route path="/store-admin"             element={<StoreAdminRoute><StoreAdminDashboard /></StoreAdminRoute>} />
          <Route path="/store-admin/customers"   element={<StoreAdminRoute><StoreAdminCustomers /></StoreAdminRoute>} />
          <Route path="/store-admin/rewards"     element={<StoreAdminRoute><StoreAdminDashboard /></StoreAdminRoute>} />
          <Route path="/store-admin/inventory"   element={<StoreAdminRoute><StoreAdminDashboard /></StoreAdminRoute>} />
          <Route path="/store-admin/promotions"  element={<StoreAdminRoute><StoreAdminDashboard /></StoreAdminRoute>} />
          <Route path="/store-admin/qr"          element={<StoreAdminRoute><StoreAdminDashboard /></StoreAdminRoute>} />
          <Route path="/store-admin/analytics"   element={<StoreAdminRoute><StoreAdminDashboard /></StoreAdminRoute>} />
          <Route path="/store-admin/notifications" element={<StoreAdminRoute><StoreAdminDashboard /></StoreAdminRoute>} />

          {/* ── Cashier (/cashier/*) ───────────────────────────────────── */}
          <Route path="/cashier"         element={<CashierRoute><CashierDashboard /></CashierRoute>} />
          <Route path="/cashier/scan"    element={<CashierRoute><CashierDashboard /></CashierRoute>} />
          <Route path="/cashier/history" element={<CashierRoute><CashierDashboard /></CashierRoute>} />

          {/* ── Error pages ────────────────────────────────────────────── */}
          <Route path="/no-connection" element={<NoConnection />} />
          <Route path="/maintenance"   element={<Maintenance />} />
          <Route path="*"              element={<NotFound />} />

        </Routes>
      </HashRouter>
    </InventoryProvider>
    </AppProvider>
    </AuthProvider>
    </RewardEventsProvider>
  );
}

export default App;
