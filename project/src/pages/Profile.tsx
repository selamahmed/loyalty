import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trophy, Zap, Target, Settings, LogOut, ChevronRight, Package, CreditCard as Edit3, Bell, HelpCircle, History, BarChart2, Gamepad2, Home, QrCode, ShoppingBag, Sun, Moon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import { useXpProgress } from '../hooks/useXpProgress';
import NeoAvatar from '../components/NeoAvatar';
import LevelBadge from '../components/LevelBadge';
import PageMainSticker from '../components/PageMainSticker';
import { getLevelBadge } from '../lib/levelBadges';
import InventoryWalletCard, { inventoryTypeConfig, getDaysLeft } from '../components/InventoryWalletCard';
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
      <button onClick={action.onClick} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 900, color: 'var(--primary-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
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
}> = ({ icon: Icon, label, color, bg, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="press-card"
    style={{
      ...card,
      padding: '12px 8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      textAlign: 'center',
    }}
  >
    <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={18} color={color} />
    </div>
    <span style={{ fontWeight: 900, fontSize: 10, color: 'var(--text-dark)', lineHeight: 1.2 }}>{label}</span>
  </button>
);

/* ── Hub link row (reused across account sections) ── */
const HubLink: React.FC<{
  icon: LucideIcon;
  label: string;
  path: string;
  color: string;
  bg: string;
  onNavigate: (path: string) => void;
}> = ({ icon: Icon, label, path, color, bg, onNavigate }) => (
  <button
    type="button"
    onClick={() => onNavigate(path)}
    className="press-card"
    style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', width: '100%' }}
  >
    <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} color={color} />
    </div>
    <span style={{ flex: 1, fontWeight: 900, fontSize: 14, color: 'var(--text-dark)' }}>{label}</span>
    <ChevronRight size={16} color="var(--text-muted)" />
  </button>
);

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, points, theme, toggleTheme } = useApp();
  const { logout } = useAuth();
  const { items: inventoryItems } = useInventory();
  const [showAllInventory, setShowAllInventory] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
  const xpProgress = useXpProgress(user.xp, user.level);

  const handleNavigate = (path: string) => {
    playSound('click');
    navigate(path);
  };

  const activeInventory = inventoryItems.filter(i => !i.used && new Date(i.expires) >= new Date());
  const urgentInventory = activeInventory.filter(i => getDaysLeft(i.expires) <= 3);
  const displayedInventory = showAllInventory ? activeInventory : activeInventory.slice(0, 3);
  const selectedInventoryItem = inventoryItems.find(i => i.id === selectedInventoryId);

  const inventoryCounts = {
    coupon: activeInventory.filter(i => i.type === 'coupon').length,
    ticket: activeInventory.filter(i => i.type === 'ticket').length,
    reward: activeInventory.filter(i => i.type === 'reward').length,
  };

  const stats = [
    { label: tr.profile.totalPoints,  value: user.totalPoints.toLocaleString(), color: '#f59e0b', emoji: '⭐' },
    { label: tr.profile.currentLevel, value: getLevelBadge(user.level).label, color: '#22c55e', emoji: '📈' },
    { label: tr.profile.achievements, value: `${user.achievements}/${user.totalAchievements}`, color: '#7B6EF6', emoji: '🏆' },
    { label: tr.profile.dayStreak,    value: `${user.streak}g`,                 color: '#f97316', emoji: '🔥' },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{ position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)', fontSize: 'clamp(60px,15vw,200px)', fontWeight: 900, color: 'var(--dark-border)', opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em' }}>PROFİL</div>
      </div>

      <div
        className="page-enter"
        style={{ padding: 'clamp(12px,4vw,24px)', paddingBottom: 32, maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}
      >

        {/* ── Profile hero ── */}
        <div className="hero-card-brand" style={{ ...card, background: 'linear-gradient(135deg,var(--gradient-start) 0%,var(--gradient-end) 100%)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <PageMainSticker page="profile" variant="hero-card" />
          <div className="hero-card-brand__body" style={{ padding: 'clamp(16px,5vw,28px)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <NeoAvatar
                  src={user.avatar}
                  name={user.username}
                  email={user.email}
                  size={80}
                  shape="circle"
                  style={{ border: '4px solid rgba(255,255,255,0.55)', boxShadow: '0 4px 0 rgba(0,0,0,0.18)' }}
                />
                <LevelBadge
                  level={user.level}
                  width={38}
                  className="level-badge-overlay"
                  style={{ bottom: -4, right: -12 }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <h1 style={{ color: 'white', fontWeight: 900, fontSize: 24, margin: '0 0 3px', lineHeight: 1 }}>{user.username}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0, fontWeight: 600 }}>{user.email}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={tr.profile.editProfile}
                    onClick={() => { playSound('click'); navigate('/settings'); }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: '#ffffff',
                      border: '2.5px solid var(--dark-border)',
                      boxShadow: '0 4px 0 var(--dark-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      position: 'relative',
                      zIndex: 3,
                    }}
                  >
                    <Edit3 size={16} color="#6d28d9" strokeWidth={2.5} />
                  </button>
                </div>

                <div className="profile-hero-meta">
                  <LevelBadge level={user.level} width={72} className="profile-hero-meta__badge" />
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
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.65)', marginBottom: 6, fontWeight: 700 }}>
                <span>Lv.{user.level}{xpProgress.nextTitle ? ` → ${user.level + 1}` : ''}</span>
                <span>{xpProgress.inLevel.toLocaleString()} / {xpProgress.isMaxLevel ? 'MAX' : xpProgress.needed.toLocaleString()} XP</span>
              </div>
              <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.25)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${xpProgress.pct}%`, background: 'white', borderRadius: 999, transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="profile-stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="profile-stat-card" style={{ ...card, position: 'relative', overflow: 'visible' }}>
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
        <div style={{
          ...card,
          background: 'linear-gradient(135deg,rgba(123,110,246,0.14) 0%,rgba(167,139,250,0.07) 100%)',
          border: '3px solid #7B6EF6', boxShadow: '0 6px 0 var(--dark-border)',
          padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16,
          position: 'relative', overflow: 'visible',
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: '#a78bfa', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{tr.profile.availablePoints}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Star size={26} fill="#a78bfa" color="#a78bfa" />
              <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-dark)', lineHeight: 1 }}>{points.toLocaleString()}</span>
            </div>
          </div>
          <button
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

            <div style={{
              ...card,
              padding: '12px 14px',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              background: 'linear-gradient(135deg,rgba(59,130,246,0.08) 0%,rgba(6,182,212,0.06) 100%)',
            }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 900, color: '#3b82f6', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {activeInventory.length} aktif bilet
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
                  {urgentInventory.length > 0
                    ? `⚡ ${urgentInventory.length} bilet yakında doluyor`
                    : 'Koda tıkla, kasada göster'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {(['coupon', 'ticket', 'reward'] as const)
                  .filter(type => inventoryCounts[type] > 0)
                  .map(type => (
                    <span
                      key={type}
                      style={{
                        fontSize: 9, fontWeight: 900, padding: '4px 8px', borderRadius: 999,
                        background: inventoryTypeConfig[type].bg,
                        color: inventoryTypeConfig[type].color,
                        border: `1.5px solid ${inventoryTypeConfig[type].color}44`,
                      }}
                    >
                      {inventoryTypeConfig[type].emoji} {inventoryCounts[type]}
                    </span>
                  ))}
              </div>
            </div>

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

        {/* ── Account hub — secondary routes via progressive disclosure ── */}
        <div>
          <SectionHeader micro="HESAP" title="Ayarlar & Daha Fazla" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Settings shortcuts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <SettingButton icon={Target}    label="Günlük Görevler"              color="#ef4444" bg="rgba(239,68,68,0.1)"   onClick={() => handleNavigate('/missions')} />
              <SettingButton icon={Trophy}    label="Başarılar"                    color="#f59e0b" bg="rgba(245,158,11,0.1)"  onClick={() => handleNavigate('/achievements')} />
              <SettingButton icon={BarChart2} label="İstatistikler"                color="#3b82f6" bg="rgba(59,130,246,0.1)"  onClick={() => handleNavigate('/stats')} />
              <SettingButton icon={History}   label="Geçmiş"                       color="#56C8FF" bg="rgba(86,200,255,0.14)" onClick={() => handleNavigate('/history')} />
              <SettingButton icon={Bell}       label="Bildirimler"                  color="#f59e0b" bg="rgba(245,158,11,0.1)"  onClick={() => handleNavigate('/notifications')} />
              <SettingButton icon={Settings}   label={tr.profile.accountSettings}   color="#7B6EF6" bg="rgba(123,110,246,0.1)" onClick={() => handleNavigate('/settings')} />
              <SettingButton icon={HelpCircle} label="Destek"                       color="#22c55e" bg="rgba(34,197,94,0.1)"   onClick={() => handleNavigate('/support')} />
              <SettingButton
                icon={theme === 'light' ? Moon : Sun}
                label={theme === 'light' ? 'Karanlık Mod' : 'Açık Mod'}
                color="var(--text-dark)"
                bg="var(--tab-bg)"
                onClick={() => { playSound('click'); toggleTheme(); }}
              />
            </div>

            {/* Genel */}
            <div>
              <p className="section-label" style={{ marginBottom: 10 }}>GENEL</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <HubLink icon={Home}     label="Ana Sayfa"     path="/home"        color="#7B6EF6" bg="rgba(123,110,246,0.1)" onNavigate={handleNavigate} />
                <HubLink icon={QrCode}   label="QR Tara"       path="/qr"          color="#a78bfa" bg="rgba(167,139,250,0.1)" onNavigate={handleNavigate} />
                <HubLink icon={Trophy}   label="Lider Tablosu" path="/leaderboard" color="#FFE500" bg="rgba(255,229,0,0.14)"  onNavigate={handleNavigate} />
              </div>
            </div>

            {/* Mağaza & Ödüller */}
            <div>
              <p className="section-label" style={{ marginBottom: 10 }}>MAĞAZA & ÖDÜLLER</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <HubLink icon={ShoppingBag} label="Ürün Mağazası"          path="/shop"      color="#22c55e" bg="rgba(34,197,94,0.1)"  onNavigate={handleNavigate} />
                <HubLink icon={Package}     label={tr.profile.myInventory} path="/inventory" color="#06b6d4" bg="rgba(6,182,212,0.1)"  onNavigate={handleNavigate} />
              </div>
            </div>

            {/* Aktiviteler */}
            <div>
              <p className="section-label" style={{ marginBottom: 10 }}>AKTİVİTELER</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <HubLink icon={Gamepad2} label="Mini Oyunlar"    path="/games"    color="#22c55e" bg="rgba(34,197,94,0.1)"   onNavigate={handleNavigate} />
                <HubLink icon={BarChart2} label="İlerleme Yolu" path="/progress" color="#7B6EF6" bg="rgba(123,110,246,0.1)" onNavigate={handleNavigate} />
                <HubLink icon={Zap}      label="Etkinlikler"     path="/events"   color="#ec4899" bg="rgba(236,72,153,0.1)" onNavigate={handleNavigate} />
              </div>
            </div>

            <button
              type="button"
              onClick={() => { playSound('click'); logout().then(() => navigate('/login', { replace: true })).catch(() => navigate('/login', { replace: true })); }}
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
        </div>

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
