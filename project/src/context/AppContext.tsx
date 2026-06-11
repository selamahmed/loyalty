import React, { createContext, useContext, useState, useEffect } from 'react';
import { currentUser } from '../data/mockData';

export type AppUser = typeof currentUser & {
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

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: AppUser;
  updateUser: (data: Partial<AppUser>) => void;
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
}

export interface RewardPopupData {
  type: 'levelup' | 'reward' | 'achievement' | 'redeem';
  title: string;
  subtitle: string;
  points?: number;
  icon?: string;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });
  const [user, setUser] = useState<AppUser>(() => {
    try {
      const saved = localStorage.getItem('userProfile');
      return saved ? { ...currentUser, ...JSON.parse(saved) } : currentUser;
    } catch {
      return currentUser;
    }
  });
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => {
    try {
      const saved = localStorage.getItem('privacySettings');
      return saved ? { ...defaultPrivacySettings, ...JSON.parse(saved) } : defaultPrivacySettings;
    } catch {
      return defaultPrivacySettings;
    }
  });
  const [points, setPoints] = useState(currentUser.currentPoints);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [rewardPopup, setRewardPopup] = useState<RewardPopupData | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const isDarkMode = theme === 'dark';

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
  };

  const spendPoints = (amount: number): boolean => {
    if (points >= amount) {
      setPoints(p => p - amount);
      return true;
    }
    return false;
  };

  const showRewardPopup = (data: RewardPopupData) => {
    setRewardPopup(data);
  };

  const dismissRewardPopup = () => {
    setRewardPopup(null);
  };

  const updateUser = (data: Partial<AppUser>) => {
    setUser(prev => {
      const next = { ...prev, ...data };
      localStorage.setItem('userProfile', JSON.stringify({
        username: next.username,
        email: next.email,
        phone: next.phone,
        bio: next.bio,
        avatar: next.avatar,
      }));
      return next;
    });
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
