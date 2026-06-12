import React, { Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { RewardEventsProvider } from './context/RewardEventsContext';
import { InventoryProvider } from './context/InventoryContext';
import Layout from './components/Layout';

// Route Guards (small — always loaded)
import CustomerRoute   from './components/guards/CustomerRoute';
import SuperAdminRoute from './components/guards/SuperAdminRoute';
import StoreAdminRoute from './components/guards/StoreAdminRoute';
import CashierRoute    from './components/guards/CashierRoute';

// Always-needed pages (tiny, keep eager)
import LandingPage    from './pages/LandingPage';
import Login          from './pages/Login';
import AdminLogin     from './pages/AdminLogin';
import Register       from './pages/Register';
import Unauthorized   from './pages/Unauthorized';
import { NotFound, NoConnection, Maintenance } from './pages/ErrorPages';
import CookieConsent  from './components/CookieConsent';

// ── Lazy: Customer pages ─────────────────────────────────────────────────────
const Home           = React.lazy(() => import('./pages/Home'));
const Profile        = React.lazy(() => import('./pages/Profile'));
const Inventory      = React.lazy(() => import('./pages/Inventory'));
const RewardsShop    = React.lazy(() => import('./pages/RewardsShop'));
const MiniGames      = React.lazy(() => import('./pages/MiniGames'));
const ProgressPath   = React.lazy(() => import('./pages/ProgressPath'));
const QRScanner      = React.lazy(() => import('./pages/QRScanner'));
const Achievements   = React.lazy(() => import('./pages/Achievements'));
const Missions       = React.lazy(() => import('./pages/Missions'));
const Notifications  = React.lazy(() => import('./pages/Notifications'));
const History        = React.lazy(() => import('./pages/History'));
const Settings       = React.lazy(() => import('./pages/Settings'));
const EditProfile    = React.lazy(() => import('./pages/EditProfile'));
const PrivacySecurity = React.lazy(() => import('./pages/PrivacySecurity'));
const ChangePassword = React.lazy(() => import('./pages/ChangePassword'));
const Support        = React.lazy(() => import('./pages/Support'));
const LiveChat       = React.lazy(() => import('./pages/support/LiveChat'));
const SupportEmail   = React.lazy(() => import('./pages/support/SupportEmail'));
const SupportCall    = React.lazy(() => import('./pages/support/SupportCall'));
const SeasonalEvents = React.lazy(() => import('./pages/SeasonalEvents'));
const Leaderboard    = React.lazy(() => import('./pages/Leaderboard'));
const UserStats      = React.lazy(() => import('./pages/UserStats'));

// ── Lazy: Super Admin pages ──────────────────────────────────────────────────
const AdminDashboard    = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminDashboard2   = React.lazy(() => import('./pages/admin/AdminDashboard2'));
const AdminAnalytics    = React.lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminUsers        = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminUsers2       = React.lazy(() => import('./pages/admin/AdminUsers2'));
const AdminRewards      = React.lazy(() => import('./pages/admin/AdminRewards'));
const AdminRewardEvents = React.lazy(() => import('./pages/admin/AdminRewardEvents'));
const AdminEvents       = React.lazy(() => import('./pages/admin/AdminEvents'));
const AdminNotifications= React.lazy(() => import('./pages/admin/AdminNotifications'));
const AdminInventory    = React.lazy(() => import('./pages/admin/AdminInventory'));
const AdminCheckout     = React.lazy(() => import('./pages/admin/AdminCheckout'));
const AdminQR           = React.lazy(() => import('./pages/admin/AdminQR'));
const AdminGames        = React.lazy(() => import('./pages/admin/AdminGames'));
const AdminDailyRewards = React.lazy(() => import('./pages/admin/AdminDailyRewards'));
const AdminPointsEconomy= React.lazy(() => import('./pages/admin/AdminPointsEconomy'));
const AdminAuditLogs    = React.lazy(() => import('./pages/admin/AdminAuditLogs'));
const AdminSettings     = React.lazy(() => import('./pages/admin/AdminSettings'));

// ── Lazy: Store Admin pages ──────────────────────────────────────────────────
const StoreAdminDashboard     = React.lazy(() => import('./pages/admin/store/StoreAdminDashboard'));
const StoreAdminItems         = React.lazy(() => import('./pages/admin/store/StoreAdminItems'));
const StoreAdminRewards       = React.lazy(() => import('./pages/admin/store/StoreAdminRewards'));
const StoreAdminInventory     = React.lazy(() => import('./pages/admin/store/StoreAdminInventory'));
const StoreAdminPromotions    = React.lazy(() => import('./pages/admin/store/StoreAdminPromotions'));
const StoreAdminCustomers     = React.lazy(() => import('./pages/admin/store/StoreAdminCustomers'));
const StoreAdminQR            = React.lazy(() => import('./pages/admin/store/StoreAdminQR'));
const StoreAdminNotifications = React.lazy(() => import('./pages/admin/store/StoreAdminNotifications'));
const StoreAdminAnalytics     = React.lazy(() => import('./pages/admin/store/StoreAdminAnalytics'));

// ── Lazy: Cashier pages ──────────────────────────────────────────────────────
const CashierDashboard = React.lazy(() => import('./pages/admin/cashier/CashierDashboard'));
const CashierScan      = React.lazy(() => import('./pages/admin/cashier/CashierScan'));
const CashierRedeem    = React.lazy(() => import('./pages/admin/cashier/CashierRedeem'));
const CashierHistory   = React.lazy(() => import('./pages/admin/cashier/CashierHistory'));

// ── Loading spinner ────────────────────────────────────────────────────────
const Spinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-color, #0c0c0e)' }}>
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-violet-400 border-t-transparent animate-spin" />
      <p className="text-sm font-bold text-violet-400 tracking-widest uppercase">Yükleniyor…</p>
    </div>
  </div>
);

// ── Helpers ───────────────────────────────────────────────────────────────
const C: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CustomerRoute><Layout>{children}</Layout></CustomerRoute>
);

const SA: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SuperAdminRoute>{children}</SuperAdminRoute>
);

const STA: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <StoreAdminRoute>{children}</StoreAdminRoute>
);

const CA: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CashierRoute>{children}</CashierRoute>
);

// ── App ────────────────────────────────────────────────────────────────────
function App() {
  return (
    <RewardEventsProvider>
    <AuthProvider>
    <AppProvider>
    <InventoryProvider>
      <HashRouter>
        <CookieConsent />
        <Suspense fallback={<Spinner />}>
          <Routes>

            {/* Public */}
            <Route path="/"             element={<LandingPage />} />
            <Route path="/landing"      element={<LandingPage />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/admin-login"  element={<AdminLogin />} />
            <Route path="/register"     element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Customer */}
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
            <Route path="/settings"                  element={<C><Settings /></C>} />
            <Route path="/settings/edit-profile"    element={<C><EditProfile /></C>} />
            <Route path="/settings/privacy"         element={<C><PrivacySecurity /></C>} />
            <Route path="/settings/change-password" element={<C><ChangePassword /></C>} />
            <Route path="/support"              element={<C><Support /></C>} />
            <Route path="/support/live-chat"     element={<C><LiveChat /></C>} />
            <Route path="/support/email"         element={<C><SupportEmail /></C>} />
            <Route path="/support/call"          element={<C><SupportCall /></C>} />
            <Route path="/events"        element={<C><SeasonalEvents /></C>} />
            <Route path="/leaderboard"   element={<C><Leaderboard /></C>} />
            <Route path="/stats"         element={<C><UserStats /></C>} />

            {/* Super Admin */}
            <Route path="/admin"                   element={<SA><AdminDashboard /></SA>} />
            <Route path="/admin/dashboard-v2"      element={<SA><AdminDashboard2 /></SA>} />
            <Route path="/admin/analytics"         element={<SA><AdminAnalytics /></SA>} />
            <Route path="/admin/users"             element={<SA><AdminUsers /></SA>} />
            <Route path="/admin/users-v2"          element={<SA><AdminUsers2 /></SA>} />
            <Route path="/admin/rewards"           element={<SA><AdminRewards /></SA>} />
            <Route path="/admin/reward-events"     element={<SA><AdminRewardEvents /></SA>} />
            <Route path="/admin/events"            element={<SA><AdminEvents /></SA>} />
            <Route path="/admin/notifications"     element={<SA><AdminNotifications /></SA>} />
            <Route path="/admin/inventory"         element={<SA><AdminInventory /></SA>} />
            <Route path="/admin/checkout"          element={<SA><AdminCheckout /></SA>} />
            <Route path="/admin/qr"                element={<SA><AdminQR /></SA>} />
            <Route path="/admin/games"             element={<SA><AdminGames /></SA>} />
            <Route path="/admin/daily-rewards"     element={<SA><AdminDailyRewards /></SA>} />
            <Route path="/admin/points-economy"    element={<SA><AdminPointsEconomy /></SA>} />
            <Route path="/admin/audit-logs"        element={<SA><AdminAuditLogs /></SA>} />
            <Route path="/admin/settings"          element={<SA><AdminSettings /></SA>} />

            {/* Store Admin */}
            <Route path="/store-admin"                    element={<STA><StoreAdminDashboard /></STA>} />
            <Route path="/store-admin/items"              element={<STA><StoreAdminItems /></STA>} />
            <Route path="/store-admin/rewards"            element={<STA><StoreAdminRewards /></STA>} />
            <Route path="/store-admin/inventory"          element={<STA><StoreAdminInventory /></STA>} />
            <Route path="/store-admin/promotions"         element={<STA><StoreAdminPromotions /></STA>} />
            <Route path="/store-admin/customers"          element={<STA><StoreAdminCustomers /></STA>} />
            <Route path="/store-admin/qr"                 element={<STA><StoreAdminQR /></STA>} />
            <Route path="/store-admin/notifications"      element={<STA><StoreAdminNotifications /></STA>} />
            <Route path="/store-admin/analytics"          element={<STA><StoreAdminAnalytics /></STA>} />

            {/* Cashier */}
            <Route path="/cashier"          element={<CA><CashierDashboard /></CA>} />
            <Route path="/cashier/scan"     element={<CA><CashierScan /></CA>} />
            <Route path="/cashier/redeem"   element={<CA><CashierRedeem /></CA>} />
            <Route path="/cashier/history"  element={<CA><CashierHistory /></CA>} />

            {/* Error pages */}
            <Route path="/no-connection" element={<NoConnection />} />
            <Route path="/maintenance"   element={<Maintenance />} />
            <Route path="*"              element={<NotFound />} />

          </Routes>
        </Suspense>
      </HashRouter>
    </InventoryProvider>
    </AppProvider>
    </AuthProvider>
    </RewardEventsProvider>
  );
}

export default App;
