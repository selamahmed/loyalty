import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trophy, Zap, Target, Settings, LogOut, ChevronRight, Package, CreditCard as Edit3, Bell, HelpCircle, History, BarChart2, Gamepad2, Home, QrCode, ShoppingBag, Sun, Moon, LayoutGrid } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { useFeatureFlags } from '../context/SystemSettingsContext';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import { useXpProgress } from '../hooks/useXpProgress';
import NeoAvatar from '../components/NeoAvatar';
import LevelBadge from '../components/LevelBadge';
import PageMainSticker from '../components/PageMainSticker';
import { getLevelBadge } from '../lib/levelBadges';
import InventoryWalletCard from '../components/InventoryWalletCard';
import InventoryDetailModal from '../components/InventoryDetailModal';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

/* ── Reusable section header ── */
const SectionHeader: React.FC<{
  micro: string; title: string;
  action?: { label: string; onClick: () => void };
}> = ({ micro, title, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
    <div>
      <p className="section-label">{micro}</p>
      <h2 className="section-title">{title}</h2>
    </div>
    {action && (
      <button onClick={action.onClick} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 900, color: 'var(--primary-blue)', background: 'none', border: 'none', cursor: 'pointer' }}>
        {action.label} <ChevronRight size={13} />
      </button>
    )}
  </div>
);

/* ── Compact settings shortcut button ── */
const SettingButton: React.FC<{
  icon: LucideIcon;
  label: string;
  color: string;
  bg: string;
  onClick: () => void;
  large?: boolean;
}> = ({ icon: Icon, label, color, bg, onClick, large = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`press-card profile-setting-button${large ? ' profile-setting-button--large' : ''}`}
    style={{
      ...card,
      padding: large ? '18px 10px' : '12px 8px',
      minHeight: large ? 96 : undefined,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: large ? 10 : 8,
      cursor: 'pointer',
      textAlign: 'center',
    }}
  >
    <div style={{
      width: large ? 52 : 42,
      height: large ? 52 : 42,
      borderRadius: large ? 14 : 12,
      background: bg,
      border: `2px solid ${color}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Icon size={large ? 24 : 18} color={color} />
    </div>
    <span style={{ fontWeight: 900, fontSize: large ? 12 : 10, color: 'var(--text-dark)', lineHeight: 1.2 }}>{label}</span>
  </button>
);

type ProfileMenuItem = {
  icon: LucideIcon;
  label: string;
  color: string;
  bg: string;
  path?: string;
  onClick?: () => void;
};

const PROFILE_MENU_SECTIONS: { label: string; items: ProfileMenuItem[] }[] = [
  {
    label: 'HESAP',
    items: [
      { icon: Target, label: 'Günlük Görevler', path: '/missions', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
      { icon: Trophy, label: 'Başarılar', path: '/achievements', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
      { icon: BarChart2, label: 'İstatistikler', path: '/stats', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
      { icon: History, label: 'Geçmiş', path: '/history', color: '#56C8FF', bg: 'rgba(86,200,255,0.14)' },
      { icon: Bell, label: 'Bildirimler', path: '/notifications', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
      { icon: Settings, label: 'Ayarlar', path: '/settings', color: '#7B6EF6', bg: 'rgba(123,110,246,0.1)' },
      { icon: HelpCircle, label: 'Destek', path: '/support', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    ],
  },
  {
    label: 'KEŞFET',
    items: [
      { icon: Home, label: 'Ana Sayfa', path: '/home', color: '#7B6EF6', bg: 'rgba(123,110,246,0.1)' },
      { icon: QrCode, label: 'QR Tara', path: '/qr', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
      { icon: Trophy, label: 'Lider Tablosu', path: '/leaderboard', color: '#FFE500', bg: 'rgba(255,229,0,0.14)' },
      { icon: ShoppingBag, label: 'Ürün Mağazası', path: '/shop', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
      { icon: Package, label: 'Envanter', path: '/inventory', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
      { icon: Gamepad2, label: 'Mini Oyunlar', path: '/games', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
      { icon: BarChart2, label: 'İlerleme Yolu', path: '/progress', color: '#7B6EF6', bg: 'rgba(123,110,246,0.1)' },
      { icon: Zap, label: 'Etkinlikler', path: '/events', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
    ],
  },
];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, points, theme, toggleTheme } = useApp();
  const { logout } = useAuth();
  const { items: inventoryItems } = useInventory();
  const flags = useFeatureFlags();
  const [showAllInventory, setShowAllInventory] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const xpProgress = useXpProgress(user.xp, user.level, user.xpToNext);

  const handleNavigate = (path: string) => {
    playSound('click');
    navigate(path);
  };

  const activeInventory = inventoryItems.filter(i => !i.used && new Date(i.expires) >= new Date());
  const displayedInventory = showAllInventory ? activeInventory : activeInventory.slice(0, 3);
  const selectedInventoryItem = inventoryItems.find(i => i.id === selectedInventoryId);

  const stats = [
    { label: tr.profile.totalPoints, value: user.totalPoints.toLocaleString(), color: '#f59e0b', emoji: '⭐' },
    { label: tr.profile.achievements, value: `${user.achievements}/${user.totalAchievements}`, color: '#7B6EF6', emoji: '🏆' },
  ];

  const quickActions = [
    { icon: QrCode, label: 'QR Tara', path: '/qr', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    { icon: ShoppingBag, label: 'Mağaza', path: '/shop', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    { icon: Gamepad2, label: 'Oyunlar', path: '/games', color: '#FF3E9D', bg: 'rgba(255,62,157,0.12)' },
  ].filter(item => {
    if (item.path === '/qr') return flags.qr_enabled;
    if (item.path === '/games') return flags.games_enabled;
    return true;
  });

  const menuSections = PROFILE_MENU_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (item.path === '/qr') return flags.qr_enabled;
      if (item.path === '/games') return flags.games_enabled;
      if (item.path === '/missions') return flags.missions_enabled;
      return true;
    }),
  })).filter(section => section.items.length > 0);

  return (
    <div className="profile-auth-page" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{ position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)', fontSize: 'clamp(60px,15vw,200px)', fontWeight: 900, color: 'var(--dark-border)', opacity: 0.03 }}>👻</div>
      </div>

      <div
        className="page-enter profile-auth-content"
        style={{ padding: 'clamp(12px,4vw,24px)', paddingBottom: 32, maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}
      >

        {/* ── Profile hero ── */}
        <div className="hero-card-brand profile-hero-card" style={{ ...card, background: 'linear-gradient(135deg,var(--gradient-start) 0%,var(--gradient-end) 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <PageMainSticker page="profile" variant="hero-card" />
          <div className="hero-card-brand__body profile-hero-card__body">
            <div className="profile-hero-user">
              <div className="profile-hero-user__avatar-wrap">
                <NeoAvatar
                  src={user.avatar}
                  name={user.username}
                  email={user.email}
                  size={72}
                  shape="circle"
                  className="profile-hero-user__avatar profile-hero-user__avatar--editable"
                  style={{ border: '4px solid rgba(255,255,255,0.55)', boxShadow: '0 4px 0 rgba(0,0,0,0.18)' }}
                  onClick={() => handleNavigate('/settings/edit-profile')}
                  title="Avatar özelleştir"
                />
                <LevelBadge
                  level={user.level}
                  width={34}
                  className="level-badge-overlay profile-hero-user__level-chip"
                  style={{ bottom: -4, right: -10 }}
                />
                <button
                  type="button"
                  className="profile-hero-edit"
                  onClick={() => handleNavigate('/settings/edit-profile')}
                  aria-label="Edit profile"
                >
                  <Edit3 size={14} />
                  <span>Duzenle</span>
                </button>
              </div>

              <div className="profile-hero-user__info">
                <div className="profile-hero-user__identity">
                  <h1 className="profile-hero-user__name">{user.username}</h1>
                  <p className="profile-hero-user__email">{user.email}</p>
                </div>

                <div className="profile-hero-meta">
                  <LevelBadge level={user.level} width={58} className="profile-hero-meta__badge" />
                  <div className="profile-hero-meta__text">
                    <span className="profile-hero-meta__level">{getLevelBadge(user.level).label}</span>
                    <span className="profile-hero-meta__streak">
                      🔥 {user.streak}g serisi
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* XP bar */}
            <div className="profile-hero-xp">
              <div className="profile-hero-xp__labels">
                <span>Lv.{user.level}{xpProgress.nextTitle ? ` → ${user.level + 1}` : ''}</span>
                <span>{xpProgress.inLevel.toLocaleString()} / {xpProgress.isMaxLevel ? 'MAX' : xpProgress.needed.toLocaleString()} XP</span>
              </div>
              <div
                className="profile-hero-xp__track"
                role="progressbar"
                aria-label="Level progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(xpProgress.pct)}
              >
                <div className="profile-hero-xp__fill" style={{ width: `${xpProgress.pct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="profile-stats-grid">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="profile-stat-card"
              style={{
                ...card,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(123,110,246,0.07)), var(--card-bg)',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              <div
                className="profile-stat-card__icon"
                style={{
                  background: `${stat.color}15`,
                  border: `2.5px solid ${stat.color}`,
                  boxShadow: `0 3px 0 ${stat.color}40`,
                }}
              >
                {stat.emoji}
              </div>
              <div className="profile-stat-card__body">
                <p className="profile-stat-card__value">{stat.value}</p>
                <p className="profile-stat-card__label">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Points card ── */}
        <div className="profile-points-card" style={{
          ...card,
          background: 'linear-gradient(135deg,rgba(123,110,246,0.14) 0%,rgba(167,139,250,0.07) 100%)',
          border: '3px solid #7B6EF6', boxShadow: '0 6px 0 var(--dark-border)',
          padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16,
          position: 'relative', overflow: 'visible',
        }}>
          <div className="profile-points-card__copy" style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: '#a78bfa', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{tr.profile.availablePoints}</p>
            <div className="profile-points-card__value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Star size={26} fill="#a78bfa" color="#a78bfa" />
              <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-dark)', lineHeight: 1 }}>{points.toLocaleString()}</span>
            </div>
          </div>
          <button
            className="profile-points-card__button"
            onClick={() => navigate('/shop')}
            style={{
              padding: '12px 20px', borderRadius: 14, fontWeight: 900, fontSize: 14,
              background: '#7B6EF6', color: 'white',
              border: '3px solid var(--dark-border)', boxShadow: '0 5px 0 var(--dark-border)',
              cursor: 'pointer', flexShrink: 0, transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 var(--dark-border)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 5px 0 var(--dark-border)'; }}
          >{tr.profile.redeem}</button>
        </div>

        {/* ── Inventory wallet ── */}
        {activeInventory.length > 0 && (
          <div>
            <SectionHeader
              micro="ENVANTER"
              title="Cüzdanım"
              action={{ label: tr.profile.seeAll, onClick: () => handleNavigate('/inventory') }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {displayedInventory.map(item => (
                <InventoryWalletCard
                  key={item.id}
                  item={item}
                  compact
                  onClick={() => setSelectedInventoryId(item.id)}
                />
              ))}
            </div>

            {activeInventory.length > 3 && (
              <button
                type="button"
                onClick={() => { playSound('click'); setShowAllInventory(!showAllInventory); }}
                style={{
                  width: '100%', marginTop: 10, padding: '12px 16px', borderRadius: 14,
                  background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)',
                  boxShadow: '0 3px 0 var(--dark-border)', cursor: 'pointer',
                  fontWeight: 900, fontSize: 13, color: 'var(--text-dark)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {showAllInventory ? 'Daha Az Göster' : `${activeInventory.length - 3} bilet daha`}
                <ChevronRight size={14} style={{ transform: showAllInventory ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }} />
              </button>
            )}
          </div>
        )}

        {/* ── Quick actions ── */}
        <div>
          <SectionHeader micro="HIZLI" title="Hızlı Erişim" />
          <div className="profile-quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {quickActions.map(action => (
              <SettingButton
                key={action.path}
                icon={action.icon}
                label={action.label}
                color={action.color}
                bg={action.bg}
                large
                onClick={() => handleNavigate(action.path)}
              />
            ))}
          </div>
        </div>

        {/* ── Collapsible full menu ── */}
        <div>
          <button
            type="button"
            onClick={() => { playSound('click'); setMenuOpen(open => !open); }}
            className="press-card profile-menu-trigger"
            style={{
              ...card,
              width: '100%',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(123,110,246,0.12)', border: '2px solid #7B6EF6',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <LayoutGrid size={22} color="#7B6EF6" />
            </div>
            <span style={{ flex: 1, fontWeight: 900, fontSize: 15, color: 'var(--text-dark)' }}>
              Menü & Ayarlar
            </span>
            <ChevronRight
              size={18}
              color="var(--text-muted)"
              style={{ transform: menuOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            />
          </button>

          {menuOpen && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {menuSections.map(section => (
                <div key={section.label}>
                  <p className="section-label" style={{ marginBottom: 10 }}>{section.label}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {section.items.map(item => (
                      <SettingButton
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        color={item.color}
                        bg={item.bg}
                        onClick={() => item.path && handleNavigate(item.path)}
                      />
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                <SettingButton
                  icon={theme === 'light' ? Moon : Sun}
                  label={theme === 'light' ? 'Karanlık Mod' : 'Açık Mod'}
                  color="var(--text-dark)"
                  bg="var(--tab-bg)"
                  onClick={() => { playSound('click'); toggleTheme(); }}
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => { playSound('click'); logout().then(() => navigate('/login', { replace: true })).catch(() => navigate('/login', { replace: true })); }}
          className="profile-logout-button"
          style={{
            ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', border: '3px solid #ef4444', boxShadow: '0 6px 0 #dc2626',
            background: 'rgba(239,68,68,0.05)', width: '100%', textAlign: 'left',
          }}
        >
          <div style={{ width: 42, height: 42, borderRadius: 12, background: '#ef4444', border: '2px solid #dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <LogOut size={18} color="white" />
          </div>
          <span style={{ flex: 1, fontWeight: 900, fontSize: 14, color: '#ef4444' }}>{tr.profile.logout}</span>
          <ChevronRight size={16} color="#ef4444" />
        </button>

      </div>

      {selectedInventoryItem && (
        <InventoryDetailModal
          item={selectedInventoryItem}
          onClose={() => setSelectedInventoryId(null)}
        />
      )}
    </div>
  );
};

export default Profile;
