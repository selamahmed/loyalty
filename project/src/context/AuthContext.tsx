import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { activityLogService } from '../lib/activityLogger';

export type UserRole = 'customer' | 'super_admin' | 'store_admin' | 'cashier';

export interface AuthUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: UserRole;
  avatar?: string;
  provider?: string;
}

export interface UserProfile {
  id: string;
  username: string | null;
  email: string | null;
  role: UserRole | null;
  avatar_url: string | null;
  total_points: number;
  level: number;
  status: string | null;
}

interface AuthContextType {
  authUser: AuthUser | null;
  profile: UserProfile | null;
  session: Session | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean; // alias for backward compatibility
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  dashboardPath: string;
}

export const getDashboardPath = (role: UserRole | string | null): string => {
  switch (role) {
    case 'super_admin':  return '/admin';
    case 'store_admin':  return '/store-admin';
    case 'cashier':      return '/cashier';
    case 'customer':
    default:             return '/app';
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

function mapSupabaseUser(user: User): AuthUser {
  const meta = user.user_metadata ?? {};
  const role: UserRole = (meta.role as UserRole) ?? 'customer';
  return {
    id: user.id,
    name: meta.full_name ?? meta.name ?? meta.username ?? user.email?.split('@')[0] ?? 'User',
    username: meta.username ?? undefined,
    email: user.email ?? '',
    role,
    avatar: meta.avatar_url ?? meta.picture ?? undefined,
    provider: user.app_metadata?.provider ?? 'email',
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser]   = useState<AuthUser | null>(null);
  const [profile,  setProfile]    = useState<UserProfile | null>(null);
  const [session,  setSession]    = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track in-flight profile fetches so we don't stack them
  const fetchingRef = useRef(false);

  const refreshProfile = useCallback(async (user: User) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select('id, username, email, role, avatar_url, total_points, level, status')
        .eq('id', user.id)
        .maybeSingle();

      const base = mapSupabaseUser(user);
      const dbRole = (prof?.role as UserRole) ?? base.role;

      setProfile(prof ? {
        id:           prof.id,
        username:     prof.username,
        email:        prof.email,
        role:         dbRole,
        avatar_url:   prof.avatar_url,
        total_points: prof.total_points ?? 0,
        level:        prof.level ?? 1,
        status:       prof.status,
      } : null);

      setAuthUser({
        ...base,
        role:     dbRole,
        name:     prof?.username ?? base.name,
        username: prof?.username ?? base.username,
        avatar:   prof?.avatar_url ?? base.avatar,
      });
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  /* ── Bootstrap session on mount ── */
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        refreshProfile(s.user).finally(() => { if (mounted) setIsLoading(false); });
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        refreshProfile(s.user);
      } else {
        setAuthUser(null);
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refreshProfile]);

  const role           = authUser?.role ?? null;
  const isAuthenticated = authUser !== null && session !== null;
  const dashboardPath  = getDashboardPath(role);

  /* ── Register ── */
  const register = async (email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: username, username, role: 'customer' } },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  /* ── Login ── */
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    // Eagerly hydrate so the calling component can navigate immediately
    if (data.user) await refreshProfile(data.user);
    return { success: true };
  };

  /* ── Google OAuth ── */
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    const redirectTo = `${window.location.origin}/#/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  /* ── Logout — robust version ── */
  const logout = async (): Promise<void> => {
    // Log before clearing state so we still have user info
    const snap = authUser;
    if (snap) {
      void activityLogService.logActivity({
        userId:     snap.id,
        username:   snap.username ?? snap.name ?? snap.email,
        email:      snap.email,
        role:       snap.role,
        action:     'Çıkış yapıldı',
        actionType: 'logout',
        riskLevel:  'low',
      });
    }

    // 1. Clear React state immediately so UI feels instant
    setAuthUser(null);
    setProfile(null);
    setSession(null);

    // 2. Tell Supabase to invalidate the server session
    try {
      await supabase.auth.signOut();
    } catch {
      // Network error — local state already cleared, still safe
    }

    // 3. Force-clear any residual Supabase tokens from localStorage
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('sb-'))
        .forEach(k => localStorage.removeItem(k));
    } catch { /* ignore storage errors */ }
  };

  return (
    <AuthContext.Provider value={{
      authUser,
      profile,
      session,
      role,
      isAuthenticated,
      isLoading,
      loading: isLoading,   // alias so older components using `loading` still work
      login,
      register,
      loginWithGoogle,
      logout,
      dashboardPath,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
