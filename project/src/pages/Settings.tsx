import React, { useState } from 'react';
import { Sun, Moon, Bell, Volume2, VolumeX, Globe, User, Shield, ChevronRight, Check, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { tr } from '../lib/tr';
import { playSound } from '../lib/sounds';

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <button
    onClick={() => { playSound('click'); onChange(!value); }}
    className={`relative w-12 h-6 rounded-full border-2 border-black dark:border-gray-500 transition-colors duration-200 hover:shadow-md active:scale-95 ${value ? 'bg-[#7B6EF6] dark:bg-[#4F8EF7]' : 'bg-gray-200 dark:bg-gray-700'}`}
  >
    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
  </button>
);

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h2 className="font-black text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">{title}</h2>
    <div className="card overflow-hidden divide-y-2 divide-black dark:divide-gray-700 hover:shadow-md transition-shadow">
      {children}
    </div>
  </div>
);

const SettingsRow: React.FC<{
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  value?: React.ReactNode;
  onClick?: () => void;
  iconColor?: string;
}> = ({ icon: Icon, label, value, onClick, iconColor = 'text-gray-600 dark:text-gray-400' }) => (
  <div
    className={`flex items-center gap-3 px-4 py-3.5 transition-all ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 active:scale-95 transform' : ''}`}
    onClick={onClick}
  >
    <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform">
      <Icon size={16} className={iconColor} />
    </div>
    <span className="flex-1 font-medium text-sm text-gray-900 dark:text-white">{label}</span>
    {value !== undefined ? value : onClick ? <ChevronRight size={16} className="text-gray-400" /> : null}
  </div>
);

const languages = ['Turkish', 'English', 'Spanish', 'French', 'German'];

const Settings: React.FC = () => {
  const { theme, toggleTheme, soundEnabled, setSoundEnabled, notificationsEnabled, setNotificationsEnabled, setIsLoggedIn } = useApp();
  const navigate = useNavigate();
  const [language, setLanguage] = useState(tr.settings.language);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [activityAlerts, setActivityAlerts] = useState(true);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white">{tr.settings.title}</h1>

      <SettingsSection title={tr.settings.appearance || 'Appearance'}>
        <SettingsRow
          icon={theme === 'light' ? Sun : Moon}
          label={tr.settings.theme}
          iconColor={theme === 'light' ? 'text-amber-500' : 'text-blue-400'}
          value={
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 p-0.5 gap-1">
              <button
                onClick={e => { e.stopPropagation(); if (theme === 'dark') { playSound('click'); toggleTheme(); } }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all active:scale-90 ${theme === 'light' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tr.settings.light || 'Light'}
              </button>
              <button
                onClick={e => { e.stopPropagation(); if (theme === 'light') { playSound('click'); toggleTheme(); } }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all active:scale-90 ${theme === 'dark' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tr.settings.dark || 'Dark'}
              </button>
            </div>
          }
        />
      </SettingsSection>

      <SettingsSection title={tr.settings.languageRegion || 'Language & Region'}>
        <div
          className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors active:scale-95 transform"
          onClick={() => { playSound('click'); setShowLangPicker(!showLangPicker); }}
        >
          <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:scale-110 transition-transform">
            <Globe size={16} className="text-blue-500" />
          </div>
          <span className="flex-1 font-medium text-sm text-gray-900 dark:text-white">{tr.settings.language}</span>
          <span className="text-sm text-[#7B6EF6] dark:text-[#4F8EF7] font-bold">{language}</span>
          <ChevronRight size={16} className={`text-gray-400 transition-transform ${showLangPicker ? 'rotate-90' : ''}`} />
        </div>
        {showLangPicker && (
          <div className="border-t-2 border-black dark:border-gray-700 animate-slideDown">
            {languages.map(lang => (
              <button
                key={lang}
                onClick={() => { playSound('click'); setLanguage(lang); setShowLangPicker(false); }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors active:scale-95 transform"
              >
                <span className={`font-medium ${lang === language ? 'text-[#7B6EF6] dark:text-[#4F8EF7]' : 'text-gray-700 dark:text-gray-300'}`}>{lang}</span>
                {lang === language && <Check size={14} className="text-[#7B6EF6] dark:text-[#4F8EF7]" />}
              </button>
            ))}
          </div>
        )}
      </SettingsSection>

      <SettingsSection title={tr.settings.notifications}>
        <SettingsRow icon={Bell} label={tr.settings.pushNotifications || 'Push Notifications'} iconColor="text-[#7B6EF6] dark:text-[#4F8EF7]"
          value={<Toggle value={notificationsEnabled} onChange={setNotificationsEnabled} />}
        />
        <SettingsRow icon={Bell} label={tr.settings.emailNotifications || 'Email Notifications'} iconColor="text-blue-500"
          value={<Toggle value={emailNotifs} onChange={setEmailNotifs} />}
        />
        <SettingsRow icon={Bell} label={tr.settings.activityAlerts || 'Activity Alerts'} iconColor="text-green-500"
          value={<Toggle value={activityAlerts} onChange={setActivityAlerts} />}
        />
      </SettingsSection>

      <SettingsSection title={tr.settings.sound}>
        <SettingsRow
          icon={soundEnabled ? Volume2 : VolumeX}
          label={tr.settings.soundEffects || 'Sound Effects'}
          iconColor={soundEnabled ? 'text-green-500' : 'text-gray-400'}
          value={<Toggle value={soundEnabled} onChange={setSoundEnabled} />}
        />
      </SettingsSection>

      <SettingsSection title={tr.settings.account}>
        <SettingsRow icon={User} label={tr.settings.editProfile || 'Edit Profile'} iconColor="text-gray-600 dark:text-gray-400" onClick={() => { playSound('click'); navigate('/profile'); }} />
        <SettingsRow icon={Shield} label={tr.settings.privacySecurity || 'Privacy & Security'} iconColor="text-blue-500" onClick={() => playSound('click')} />
        <SettingsRow icon={Shield} label={tr.settings.changePassword || 'Change Password'} iconColor="text-amber-500" onClick={() => playSound('click')} />
      </SettingsSection>

      <button
        onClick={() => { playSound('click'); setIsLoggedIn(false); navigate('/login'); }}
        className="btn-danger w-full flex items-center justify-center gap-2 transition-all active:scale-95 hover:shadow-lg"
      >
        <LogOut size={16} />
        <span>{tr.settings.logout}</span>
      </button>

      <p className="text-center text-xs text-gray-400">NexReward v2.0.0 • {tr.settings.frontendDemo || 'Frontend Demo'}</p>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Settings;
