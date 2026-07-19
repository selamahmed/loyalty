# Route map

The app uses React Router with hash routing. Customer pages are wrapped by the authenticated `Layout` shell.

Key routes:

- `/home` → `src/pages/Home.tsx` → customer `Layout`
- `/shop` → `src/pages/RewardsShop.tsx` → customer `Layout`
- `/qr` → `src/pages/QRScanner.tsx` → customer `Layout`
- `/leaderboard` → `src/pages/Leaderboard.tsx` → customer `Layout`
- `/profile` → `src/pages/Profile.tsx` → customer `Layout`
- `/inventory` → `src/pages/Inventory.tsx` → customer `Layout`
- `/login` → `src/pages/Login.tsx` → auth shell
- `/register` → `src/pages/Register.tsx` → auth shell
- `/admin/*` → admin layout and role guards
- `/store-admin/*` → store-admin layout and role guards

## Full router source

```tsx
import React, { Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { prefetchAdminRoutes, prefetchCommonRoutes } from './lib/routePrefetch';

const AuthProviders = React.lazy(() => import('./components/AuthProviders'));
const AppDataProviders = React.lazy(() => import('./components/AppDataProviders'));
const AdminDataProviders = React.lazy(() => import('./components/AdminDataProviders'));
const Layout = React.lazy(() => import('./components/Layout'));

// Route Guards (small â€” always loaded)
const CustomerRoute = React.lazy(() => import('./components/guards/CustomerRoute'));
const AccountStatusGuard = React.lazy(() => import('./components/guards/AccountStatusGuard'));
const SuperAdminRoute = React.lazy(() => import('./components/guards/SuperAdminRoute'));
const StoreAdminRoute = React.lazy(() => import('./components/guards/StoreAdminRoute'));
const CashierRoute = React.lazy(() => import('./components/guards/CashierRoute'));
const MaintenanceGuard = React.lazy(() => import('./components/guards/MaintenanceGuard'));

// Always-needed pages (tiny, keep eager)
import LandingPage      from './pages/LandingPage';
import { NotFound, NoConnection, Maintenance } from './pages/ErrorPages';

const Login = React.lazy(() => import('./pages/Login'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Register = React.lazy(() => import('./pages/Register'));
const Unauthorized = React.lazy(() => import('./pages/Unauthorized'));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback'));

const TermsOfService   = React.lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy    = React.lazy(() => import('./pages/PrivacyPolicy'));
const AdminSupport     = React.lazy(() => import('./pages/admin/AdminSupport'));
const CookieConsent    = React.lazy(() => import('./components/CookieConsent'));

// â”€â”€ Lazy: Customer pages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Lazy: Super Admin pages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AdminDashboard    = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminDashboard2   = React.lazy(() => import('./pages/admin/AdminDashboard2'));
const AdminAnalytics    = React.lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminUsers        = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminRewards      = React.lazy(() => import('./pages/admin/AdminRewards'));
const AdminRewardEvents = React.lazy(() => import('./pages/admin/AdminRewardEvents'));
const AdminEvents       = React.lazy(() => import('./pages/admin/AdminEvents'));
const AdminNotifications= React.lazy(() => import('./pages/admin/AdminNotifications'));
const AdminInventory    = React.lazy(() => import('./pages/admin/AdminInventory'));
const AdminCheckout     = React.lazy(() => import('./pages/admin/AdminCheckout'));
const AdminQR           = React.lazy(() => import('./pages/admin/AdminQR'));
const AdminGames        = React.lazy(() => import('./pages/admin/AdminGames'));
const AdminMissions     = React.lazy(() => import('./pages/admin/AdminMissions'));
const AdminDailyRewards = React.lazy(() => import('./pages/admin/AdminDailyRewards'));
const AdminPointsEconomy= React.lazy(() => import('./pages/admin/AdminPointsEconomy'));
const AdminAuditLogs    = React.lazy(() => import('./pages/admin/AdminAuditLogs'));
const AdminSettings     = React.lazy(() => import('./pages/admin/AdminSettings'));

// â”€â”€ Lazy: Store Admin pages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const StoreAdminDashboard     = React.lazy(() => import('./pages/admin/store/StoreAdminDashboard'));
const StoreAdminItems         = React.lazy(() => import('./pages/admin/store/StoreAdminItems'));
const StoreAdminRewards       = React.lazy(() => import('./pages/admin/store/StoreAdminRewards'));
const StoreAdminInventory     = React.lazy(() => import('./pages/admin/store/StoreAdminInventory'));
const StoreAdminPromotions    = React.lazy(() => import('./pages/admin/store/StoreAdminPromotions'));
const StoreAdminCustomers     = React.lazy(() => import('./pages/admin/store/StoreAdminCustomers'));
const StoreAdminQR            = React.lazy(() => import('./pages/admin/store/StoreAdminQR'));
const StoreAdminNotifications = React.lazy(() => import('./pages/admin/store/StoreAdminNotifications'));
const StoreAdminAnalytics     = React.lazy(() => import('./pages/admin/store/StoreAdminAnalytics'));

// â”€â”€ Lazy: Cashier pages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CashierDashboard = React.lazy(() => import('./pages/admin/cashier/CashierDashboard'));
const CashierScan      = React.lazy(() => import('./pages/admin/cashier/CashierScan'));
const CashierRedeem    = React.lazy(() => import('./pages/admin/cashier/CashierRedeem'));
const CashierHistory   = React.lazy(() => import('./pages/admin/cashier/CashierHistory'));

// â”€â”€ Loading spinner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Spinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-color, #0c0c0e)' }}>
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-violet-400 border-t-transparent animate-spin" />
      <p className="text-sm font-bold text-violet-400 tracking-widest uppercase">YÃ¼kleniyorâ€¦</p>
    </div>
  </div>
);

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DeferredCookieConsent: React.FC = () => {
  const [ready, setReady] = React.useState(false);

  useEffect(() => {
    const show = () => setReady(true);
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(show, { timeout: 2500 });
    } else {
      timeoutId = setTimeout(show, 1200);
    }

    return () => {
      if (idleId !== undefined && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <CookieConsent />
    </Suspense>
  );
};

const CustomerShell: React.FC = () => {
  useEffect(() => {
    const run = () => prefetchCommonRoutes();
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(run, { timeout: 4000 });
    } else {
      timeoutId = setTimeout(run, 500);
    }
    return () => {
      if (idleId !== undefined && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <MaintenanceGuard>
        <CustomerRoute>
          <AccountStatusGuard>
            <AppDataProviders>
              <Layout><Outlet /></Layout>
            </AppDataProviders>
          </AccountStatusGuard>
        </CustomerRoute>
      </MaintenanceGuard>
    </Suspense>
  );
};

const AdminRouteShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const run = () => prefetchAdminRoutes();
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(run, { timeout: 2500 });
    } else {
      timeoutId = setTimeout(run, 400);
    }
    return () => {
      if (idleId !== undefined && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <AdminDataProviders>{children}</AdminDataProviders>
    </Suspense>
  );
};

const SA: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={null}>
    <SuperAdminRoute><AdminRouteShell>{children}</AdminRouteShell></SuperAdminRoute>
  </Suspense>
);

const STA: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={null}>
    <StoreAdminRoute><AdminRouteShell>{children}</AdminRouteShell></StoreAdminRoute>
  </Suspense>
);

const CA: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={null}>
    <CashierRoute><AdminRouteShell>{children}</AdminRouteShell></CashierRoute>
  </Suspense>
);

const AuthenticatedShell: React.FC = () => (
  <Suspense fallback={null}>
    <AuthProviders>
      <Outlet />
    </AuthProviders>
  </Suspense>
);

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   OAuthErrorInterceptor
   Runs once on mount. Detects Supabase OAuth error redirects like:
     http://localhost:5173/?error=server_error&error_description=...#error=...&sb=
   Supabase redirects errors to the Site URL (not the redirectTo), which means
   HashRouter sees a hash that doesn't start with "/" â€” no route matches.
   This component catches that case, stores the message, and redirects to /login.
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const OAuthErrorInterceptor: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const search = window.location.search;   // ?error=...
    const hash   = window.location.hash;     // #error=... or #/auth/callback

    const hasQueryError = search.includes('error=') && search.includes('error_code=');
    const hasHashError  = hash.includes('error=') && !hash.startsWith('#/');

    if (hasQueryError || hasHashError) {
      // Parse from query params first, then hash
      const raw    = hasQueryError ? search.slice(1) : hash.slice(1);
      const params = new URLSearchParams(raw);
      const desc   = decodeURIComponent(
        params.get('error_description') ?? 'Google ile giriÅŸ baÅŸarÄ±sÄ±z oldu'
      );

      // Clean URL so refreshing doesn't re-trigger
      window.history.replaceState({}, '', window.location.origin + '/#/login');

      // Pass error to Login page via sessionStorage
      sessionStorage.setItem('oauth_error', desc);
      navigate('/login', { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

// â”€â”€ App â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function App() {
  return (
    <ThemeProvider>
    <HashRouter>
        <OAuthErrorInterceptor />
        <DeferredCookieConsent />
        <Suspense fallback={<Spinner />}>
          <Routes>

            {/* Public landing â€” no Supabase/auth providers on critical path */}
            <Route path="/"                 element={<LandingPage />} />
            <Route path="/landing"          element={<LandingPage />} />

            <Route element={<AuthenticatedShell />}>

            <Route path="/login"            element={<Login />} />
            <Route path="/admin-login"      element={<AdminLogin />} />
            <Route path="/forgot-password"  element={<ForgotPassword />} />
            <Route path="/reset-password"   element={<ResetPassword />} />
            <Route path="/register"         element={<Register />} />
            <Route path="/terms"           element={<TermsOfService />} />
            <Route path="/privacy"          element={<PrivacyPolicy />} />
            <Route path="/unauthorized"     element={<Unauthorized />} />
            {/* OAuth callback â€” Supabase redirects here after Google sign-in */}
            <Route path="/auth/callback"    element={<AuthCallback />} />

            {/* Customer â€” persistent layout (sidebar stays mounted) */}
            <Route element={<CustomerShell />}>
            <Route path="/app"           element={<Home />} />
            <Route path="/home"          element={<Home />} />
            <Route path="/profile"       element={<Profile />} />
            <Route path="/inventory"     element={<Inventory />} />
            <Route path="/shop"          element={<RewardsShop />} />
            <Route path="/games"         element={<MiniGames />} />
            <Route path="/progress"      element={<ProgressPath />} />
            <Route path="/qr"            element={<QRScanner />} />
            <Route path="/achievements"  element={<Achievements />} />
            <Route path="/missions"      element={<Missions />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/history"       element={<History />} />
            <Route path="/settings"                  element={<Settings />} />
            <Route path="/settings/edit-profile"    element={<EditProfile />} />
            <Route path="/settings/privacy"         element={<PrivacySecurity />} />
            <Route path="/settings/change-password" element={<ChangePassword />} />
            <Route path="/support"              element={<Support />} />
            <Route path="/support/live-chat"     element={<LiveChat />} />
            <Route path="/support/email"         element={<SupportEmail />} />
            <Route path="/support/call"          element={<SupportCall />} />
            <Route path="/events"        element={<SeasonalEvents />} />
            <Route path="/leaderboard"   element={<Leaderboard />} />
            <Route path="/stats"         element={<UserStats />} />
            </Route>

            {/* Super Admin */}
            <Route path="/admin"                   element={<SA><AdminDashboard /></SA>} />
            <Route path="/admin/dashboard-v2"      element={<SA><AdminDashboard2 /></SA>} />
            <Route path="/admin/analytics"         element={<SA><AdminAnalytics /></SA>} />
            <Route path="/admin/users"             element={<SA><AdminUsers /></SA>} />
            <Route path="/admin/rewards"           element={<SA><AdminRewards /></SA>} />
            <Route path="/admin/reward-events"     element={<SA><AdminRewardEvents /></SA>} />
            <Route path="/admin/events"            element={<SA><AdminEvents /></SA>} />
            <Route path="/admin/notifications"     element={<SA><AdminNotifications /></SA>} />
            <Route path="/admin/inventory"         element={<SA><AdminInventory /></SA>} />
            <Route path="/admin/checkout"          element={<SA><AdminCheckout /></SA>} />
            <Route path="/admin/qr"                element={<SA><AdminQR /></SA>} />
            <Route path="/admin/games"             element={<SA><AdminGames /></SA>} />
            <Route path="/admin/missions"          element={<SA><AdminMissions /></SA>} />
            <Route path="/admin/daily-rewards"     element={<SA><AdminDailyRewards /></SA>} />
            <Route path="/admin/points-economy"    element={<SA><AdminPointsEconomy /></SA>} />
            <Route path="/admin/audit-logs"        element={<SA><AdminAuditLogs /></SA>} />
            <Route path="/admin/settings"          element={<SA><AdminSettings /></SA>} />
            <Route path="/admin/support"           element={<SA><AdminSupport /></SA>} />

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
            {/* Catch-all: unknown routes â†’ login */}
            <Route path="*" element={<Navigate to="/login" replace />} />

            </Route>

          </Routes>
        </Suspense>
    </HashRouter>
    </ThemeProvider>
  );
}

export default App;

```

