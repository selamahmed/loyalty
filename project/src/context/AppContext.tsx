import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';

import { updateProfile } from '../services/profile';

import { performAction, type EarnResult, type EarnAction, type PerformOptions } from '../services/earn';

import { updateUserSettings } from '../services/userSettings';

import { canonicalToAppUser } from '../hooks/useCanonicalProfile';

import { captureError } from '../lib/monitoring';



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

  id: '', username: '', email: '', avatar: '',

  level: 1, xp: 0, xpToNext: 200, totalPoints: 0, currentPoints: 0,

  rank: 0, joinDate: '', streak: 0, achievements: 0, totalAchievements: 0,

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

  updatePrivacySettings: (data: Partial<PrivacySettings>) => Promise<void>;

  points: number;

  earnReward: (action: EarnAction | string, options?: PerformOptions) => Promise<EarnResult | null>;

  spendPoints: (amount: number) => boolean;

  isLoggedIn: boolean;

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

  const { profile, isAuthenticated, profileLoading, refreshProfile, authUser } = useAuth();

  const { theme, isDarkMode, toggleTheme } = useTheme();

  const [user, setUser] = useState<AppUser>(defaultUser);

  const [bgStyle, setBgStyle] = useState(() => localStorage.getItem('bgStyle') || 'none');

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(defaultPrivacySettings);

  const [points, setPoints] = useState(0);

  const [rewardPopup, setRewardPopup] = useState<RewardPopupData | null>(null);

  const [soundEnabled, setSoundEnabled] = useState(true);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);



  useEffect(() => {

    if (profile && isAuthenticated) {

      const appUser = canonicalToAppUser(profile);

      setUser(appUser);

      setPoints(appUser.currentPoints);

      setPrivacySettings({

        publicProfile: profile.settings.public_profile,

        showOnLeaderboard: profile.settings.show_on_leaderboard,

        shareActivity: profile.settings.share_activity,

        twoFactor: profile.settings.two_factor_enabled,

        loginAlerts: profile.settings.login_alerts,

      });

    } else if (!isAuthenticated) {

      setUser(defaultUser);

      setPoints(0);

      setPrivacySettings(defaultPrivacySettings);

    }

  }, [profile, isAuthenticated]);



  const earnReward = useCallback(async (

    action: EarnAction | string,

    options: PerformOptions = {},

  ): Promise<EarnResult | null> => {

    if (!authUser?.id) return null;

    try {

      const result = await performAction(action as EarnAction, options);

      await refreshProfile();

      if (result.leveledUp) {

        setRewardPopup({

          type: 'levelup',

          title: `Seviye ${result.level}!`,

          subtitle: result.bonusPoints > 0

            ? `Tebrikler! +${result.bonusPoints} bonus puan kazandın.`

            : 'Yeni seviyeye ulaştın!',

          points: result.bonusPoints || undefined,

          icon: '🏆',

        });

      }

      return result;

    } catch (err) {

      captureError(err, { action, referenceId: options.referenceId });

      return null;

    }

  }, [authUser?.id, refreshProfile]);

  const updateUser = useCallback(async (data: Partial<AppUser>) => {
    setUser(prev => ({ ...prev, ...data }));
    if (authUser?.id) {
      try {
        await updateProfile(authUser.id, {
          username: data.username,
          avatar_url: data.avatar,
          phone: data.phone ?? null,
          bio: data.bio ?? null,
        });
        await refreshProfile();
      } catch (err) {
        captureError(err, { context: 'updateUser' });
      }
    }
  }, [authUser?.id, refreshProfile]);

  const updatePrivacySettings = useCallback(async (data: Partial<PrivacySettings>) => {
    if (!authUser?.id) return;
    const next = { ...privacySettings, ...data };
    setPrivacySettings(next);
    try {
      await updateUserSettings(authUser.id, {
        public_profile: next.publicProfile,
        show_on_leaderboard: next.showOnLeaderboard,
        share_activity: next.shareActivity,
        login_alerts: next.loginAlerts,
        two_factor_enabled: next.twoFactor,
      });
      await refreshProfile();
    } catch (err) {
      captureError(err, { context: 'updatePrivacySettings' });
    }
  }, [authUser?.id, privacySettings, refreshProfile]);

  const spendPoints = useCallback((amount: number): boolean => {
    if (points >= amount) {
      setPoints(p => p - amount);
      setUser(u => ({ ...u, currentPoints: Math.max(0, u.currentPoints - amount) }));
      return true;
    }
    return false;
  }, [points]);

  const showRewardPopup = useCallback((data: RewardPopupData) => setRewardPopup(data), []);
  const dismissRewardPopup = useCallback(() => setRewardPopup(null), []);
  const setBgStylePersist = useCallback((val: string) => {
    setBgStyle(val);
    localStorage.setItem('bgStyle', val);
  }, []);

  const contextValue = useMemo(() => ({
    theme,
    toggleTheme,
    user,
    updateUser,
    privacySettings,
    updatePrivacySettings,
    points,
    earnReward,
    spendPoints,
    isLoggedIn: isAuthenticated,
    showRewardPopup,
    rewardPopup,
    dismissRewardPopup,
    soundEnabled,
    setSoundEnabled,
    notificationsEnabled,
    setNotificationsEnabled,
    isDarkMode,
    isProfileLoading: profileLoading,
    reloadProfile: refreshProfile,
    bgStyle,
    setBgStyle: setBgStylePersist,
  }), [
    theme, toggleTheme, user, updateUser, privacySettings, updatePrivacySettings,
    points, earnReward, spendPoints, isAuthenticated, showRewardPopup, rewardPopup,
    dismissRewardPopup, soundEnabled, notificationsEnabled, isDarkMode, profileLoading,
    refreshProfile, bgStyle, setBgStylePersist,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};



export const useApp = () => {

  const ctx = useContext(AppContext);

  if (!ctx) throw new Error('useApp must be used within AppProvider');

  return ctx;

};


