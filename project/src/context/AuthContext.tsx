import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { activityLogService } from '../lib/activityLogger';
import { fetchMyAccountStatus, isRestrictedStatus, type AccountStatus } from '../services/accountStatus';
import { useCanonicalProfile, useInvalidateProfile } from '../hooks/useCanonicalProfile';
import type { CanonicalProfile } from '../services/canonicalProfile';

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

export type UserProfile = CanonicalProfile;

interface AuthContextType {
  authUser: AuthUser | null;
  profile: CanonicalProfile | null;
  session: Session | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  profileLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; restricted?: boolean }>;
  register: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  dashboardPath: string;
}

export const getDashboardPath = (role: UserRole | string | null): string => {
  switch (role) {
    case 'super_admin':  return '/admin';
    case 'store_admin':  return '/store-admin';
    case 'cashier':      return '/cashier';
    default:             return '/app';
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

function mapSupabaseUser(user: User, dbRole?: UserRole | null): AuthUser {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    name: meta.full_name ?? meta.name ?? meta.username ?? user.email?.split('@')[0] ?? 'User',
    username: meta.username ?? undefined,
    email: user.email ?? '',
    role: dbRole ?? (meta.role as UserRole) ?? 'customer',
    avatar: meta.avatar_url ?? meta.picture ?? undefined,
    provider: user.app_metadata?.provider ?? 'email',
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authBootLoading, setAuthBootLoading] = useState(true);
  const invalidateProfile = useInvalidateProfile();
  const profileFetchId = useRef(0);
  const syncedUserIdRef = useRef<string | null>(null);
  const syncAuthUserRef = useRef<(user: User, knownStatus?: AccountStatus | null) => Promise<void>>(async () => {});

  const { data: canonicalProfile, isLoading: profileQueryLoading, refetch } = useCanonicalProfile(
    sessionUser?.id,
  );

  const signOutBannedUser = useCallback(async () => {
    syncedUserIdRef.current = null;
    setSessionUser(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
      Object.keys(localStorage).filter(k => k.startsWith('sb-')).forEach(k => localStorage.removeItem(k));
    } catch { /* ignore */ }
  }, []);

  const syncAuthUser = useCallback(async (user: User, knownStatus?: AccountStatus | null) => {
    const fetchId = ++profileFetchId.current;

    let accountStatus = knownStatus ?? null;
    if (!accountStatus) {
      accountStatus = await fetchMyAccountStatus(user.id);
    }
    if (fetchId !== profileFetchId.current) return;

    if (accountStatus === 'deleted') {
      await signOutBannedUser();
      return;
    }

    const alreadySynced = syncedUserIdRef.current === user.id;
    syncedUserIdRef.current = user.id;
    setSessionUser(prev => (prev?.id === user.id ? prev : user));

    if (alreadySynced && knownStatus === undefined) return;

    invalidateProfile(user.id);
    await refetch();
  }, [signOutBannedUser, invalidateProfile, refetch]);

  syncAuthUserRef.current = syncAuthUser;

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        void syncAuthUserRef.current(s.user).finally(() => { if (mounted) setAuthBootLoading(false); });
      } else {
        setAuthBootLoading(false);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) void syncAuthUserRef.current(s.user);
      else setSessionUser(null);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!sessionUser?.id) return;
    const channel = supabase
      .channel(`profile_status_${sessionUser.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${sessionUser.id}` },
        payload => {
          const next = payload.new as { status?: string };
          if (!next.status) return;
          if (next.status === 'deleted') { void signOutBannedUser(); return; }
          invalidateProfile(sessionUser.id);
          void refetch();
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionUser?.id, signOutBannedUser, invalidateProfile, refetch]);

  const authUser = useMemo((): AuthUser | null => {
    if (!sessionUser) return null;
    const base = mapSupabaseUser(sessionUser, (canonicalProfile?.role as UserRole) ?? undefined);
    if (!canonicalProfile) return base;
    return {
      ...base,
      name: canonicalProfile.username ?? base.name,
      username: canonicalProfile.username ?? base.username,
      avatar: canonicalProfile.avatar_url ?? base.avatar,
      role: (canonicalProfile.role as UserRole) ?? base.role,
    };
  }, [sessionUser, canonicalProfile]);

  const role = authUser?.role ?? null;
  const isAuthenticated = authUser !== null && session !== null;
  const isLoading = authBootLoading || (isAuthenticated && profileQueryLoading);

  const refreshProfile = useCallback(async () => {
    if (sessionUser?.id) {
      invalidateProfile(sessionUser.id);
      await refetch();
    }
  }, [sessionUser?.id, invalidateProfile, refetch]);

  const register = async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: username, username, role: 'customer' } },
    });
    return error ? { success: false, error: error.message } : { success: true };
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    if (data.user) {
      const status = await fetchMyAccountStatus(data.user.id);
      if (status === 'deleted') {
        await signOutBannedUser();
        return { success: false, error: 'Hesabınız yasaklandı. Destek ekibiyle iletişime geçin.' };
      }
      await syncAuthUser(data.user, status);
      if (isRestrictedStatus(status)) return { success: true, restricted: true };
    }
    return { success: true };
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/#/auth/callback` },
    });
    return error ? { success: false, error: error.message } : { success: true };
  };

  const logout = async () => {
    if (authUser) {
      void activityLogService.logActivity({
        userId: authUser.id,
        username: authUser.username ?? authUser.name ?? authUser.email,
        email: authUser.email,
        role: authUser.role,
        action: 'Çıkış yapıldı',
        actionType: 'logout',
        riskLevel: 'low',
      });
    }
    syncedUserIdRef.current = null;
    setSessionUser(null);
    setSession(null);
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    try {
      Object.keys(localStorage).filter(k => k.startsWith('sb-')).forEach(k => localStorage.removeItem(k));
    } catch { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{
      authUser,
      profile: canonicalProfile ?? null,
      session,
      role,
      isAuthenticated,
      isLoading,
      loading: isLoading,
      profileLoading: profileQueryLoading,
      login,
      register,
      loginWithGoogle,
      logout,
      refreshProfile,
      dashboardPath: getDashboardPath(role),
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
