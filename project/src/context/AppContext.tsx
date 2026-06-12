import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getProfile, updateProfile } from '../services/profile';

export type AppUser = {
  id: string;
  username: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNext: number;
  totalPoints: number;
  currentPoints: number;
  rank: number;
  joinDate: string;
  streak: number;
  achievements: number;
  totalAchievements: number;
  phone?: string;
  bio?: string;
};

export type PrivacySettings = {
  publicProfile: boolean;
  showOnLeaderboard: boolean;
  shareActivity: boolean;
  twoFactor: boolean;
  loginAlerts: boolean;
};

const defaultPrivacySettings: PrivacySettings = {
  publicProfile: true,
  showOnLeaderboard: true,
  shareActivity: false,
  twoFactor: false,
  loginAlerts: true,
};

const defaultUser: AppUser = {
  id: '',
  username: '',
  email: '',
  avatar: '',
  level: 1,
  xp: 0,
  xpToNext: 200,
  totalPoints: 0,
  currentPoints: 0,
  rank: 0,
  joinDate: '',
  streak: 0,
  achievements: 0,
  totalAchievements: 0,
};

export interface RewardPopupData {
  type: 'levelup' | 'reward' | 'achievement' | 'redeem';
  title: string;
  subtitle: string;
  points?: number;
  icon?: string;
}

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: AppUser;
  updateUser: (data: Partial<AppUser>) => Promise<void>;
  privacySettings: PrivacySettings;
  updatePrivacySettings: (data: Partial<PrivacySettings>) => void;
  points: number;
  addPoints: (amount: number) => void;
  spendPoints: (amount: number) => boolean;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  showRewardPopup: (data: RewardPopupData) => void;
  rewardPopup: RewardPopupData | null;
  dismissRewardPopup: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (val: boolean) => void;
  isDarkMode: boolean;
  isProfileLoading: boolean;
  reloadProfile: () => Promise<void>;
  bgStyle: string;
  setBgStyle: (val: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authUser, isAuthenticated } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });
  const [user, setUser] = useState<AppUser>(defaultUser);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [bgStyle, setBgStyle] = useState(() => localStorage.getItem('bgStyle') || 'none');
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => {
    try {
      const saved = localStorage.getItem('privacySettings');
      return saved ? { ...defaultPrivacySettings, ...JSON.parse(saved) } : defaultPrivacySettings;
    } catch {
      return defaultPrivacySettings;
    }
  });
  const [points, setPoints] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rewardPopup, setRewardPopup] = useState<RewardPopupData | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const isDarkMode = theme === 'dark';

  const reloadProfile = useCallback(async () => {
    if (!authUser?.id) return;
    setIsProfileLoading(true);
    try {
      const profile = await getProfile(authUser.id);
      if (profile) {
        const appUser: AppUser = {
          id: profile.id,
          username: profile.username ?? authUser.name,
          email: profile.email,
          avatar: profile.avatar_url ?? '',
          level: profile.level,
          xp: profile.xp,
          xpToNext: profile.xp_to_next,
          totalPoints: profile.total_points,
          currentPoints: profile.current_points,
          rank: 0,
          joinDate: profile.created_at.split('T')[0],
          streak: profile.streak,
          achievements: 0,
          totalAchievements: 0,
          phone: profile.phone ?? undefined,
          bio: profile.bio ?? undefined,
        };
        setUser(appUser);
        setPoints(profile.current_points);
        setIsLoggedIn(true);
      } else {
        setUser({
          ...defaultUser,
          id: authUser.id,
          username: authUser.name,
          email: authUser.email,
          avatar: authUser.avatar ?? '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsProfileLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (isAuthenticated && authUser?.id) {
      reloadProfile();
    } else {
      setUser(defaultUser);
      setPoints(0);
      setIsLoggedIn(false);
    }
  }, [isAuthenticated, authUser?.id, reloadProfile]);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme, isDarkMode]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const addPoints = (amount: number) => {
    setPoints(p => p + amount);
    setUser(u => ({ ...u, currentPoints: u.currentPoints + amount, totalPoints: u.totalPoints + amount }));
  };

  const spendPoints = (amount: number): boolean => {
    if (points >= amount) {
      setPoints(p => p - amount);
      setUser(u => ({ ...u, currentPoints: Math.max(0, u.currentPoints - amount) }));
      return true;
    }
    return false;
  };

  const showRewardPopup = (data: RewardPopupData) => setRewardPopup(data);
  const dismissRewardPopup = () => setRewardPopup(null);

  const updateUser = async (data: Partial<AppUser>) => {
    setUser(prev => ({ ...prev, ...data }));
    if (authUser?.id) {
      try {
        await updateProfile(authUser.id, {
          username: data.username,
          avatar_url: data.avatar,
          phone: data.phone ?? null,
          bio: data.bio ?? null,
        });
      } catch (err) {
        console.error('Failed to update profile:', err);
      }
    }
  };

  const updatePrivacySettings = (data: Partial<PrivacySettings>) => {
    setPrivacySettings(prev => {
      const next = { ...prev, ...data };
      localStorage.setItem('privacySettings', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      user,
      updateUser,
      privacySettings,
      updatePrivacySettings,
      points,
      addPoints,
      spendPoints,
      isLoggedIn,
      setIsLoggedIn,
      showRewardPopup,
      rewardPopup,
      dismissRewardPopup,
      soundEnabled,
      setSoundEnabled,
      notificationsEnabled,
      setNotificationsEnabled,
      isDarkMode,
      isProfileLoading,
      reloadProfile,
      bgStyle,
      setBgStyle: (val: string) => { setBgStyle(val); localStorage.setItem('bgStyle', val); },
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
