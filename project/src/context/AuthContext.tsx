import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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

interface AuthContextType {
  authUser: AuthUser | null;
  session: Session | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  dashboardPath: string;
}

export const getDashboardPath = (role: UserRole | null): string => {
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
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async (user: User) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, username, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    const base = mapSupabaseUser(user);
    if (profile) {
      setAuthUser({
        ...base,
        role: (profile.role as UserRole) ?? base.role,
        name: profile.username ?? base.name,
        username: profile.username ?? base.username,
        avatar: profile.avatar_url ?? base.avatar,
      });
    } else {
      setAuthUser(base);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        refreshProfile(s.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        refreshProfile(s.user);
      } else {
        setAuthUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshProfile]);

  const role = authUser?.role ?? null;
  const isAuthenticated = authUser !== null && session !== null;
  const dashboardPath = getDashboardPath(role);

  const register = async (email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: username, username, role: 'customer' },
      },
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    // redirectTo points to the hash-based callback route.
    // With PKCE flow Supabase appends ?code=XXX to the URL, so the final
    // URL becomes: <origin>/?code=XXX#/auth/callback
    // HashRouter renders /auth/callback; detectSessionInUrl exchanges the code.
    const redirectTo = `${window.location.origin}/#/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{
      authUser,
      session,
      role,
      isAuthenticated,
      isLoading,
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
