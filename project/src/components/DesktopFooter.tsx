import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Home, QrCode, ShoppingBag, Trophy, User, Gamepad2, Target, Zap,
  Package, BarChart2, History, Bell, Settings, HelpCircle, TrendingUp,
} from 'lucide-react';
import { prefetchRoute } from '../lib/routePrefetch';
import AppLogo from './AppLogo';

type FooterLink = {
  path: string;
  label: string;
  icon: LucideIcon;
};

const FOOTER_SECTIONS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Ana',
    links: [
      { path: '/home', label: 'Ana Sayfa', icon: Home },
      { path: '/qr', label: 'QR Tara', icon: QrCode },
      { path: '/shop', label: 'Mağaza', icon: ShoppingBag },
      { path: '/leaderboard', label: 'Liderlik', icon: Trophy },
      { path: '/profile', label: 'Profil', icon: User },
    ],
  },
  {
    title: 'Keşfet',
    links: [
      { path: '/games', label: 'Oyunlar', icon: Gamepad2 },
      { path: '/missions', label: 'Görevler', icon: Target },
      { path: '/events', label: 'Etkinlikler', icon: Zap },
      { path: '/inventory', label: 'Envanter', icon: Package },
      { path: '/progress', label: 'İlerleme', icon: TrendingUp },
    ],
  },
  {
    title: 'Hesap',
    links: [
      { path: '/achievements', label: 'Başarılar', icon: Trophy },
      { path: '/stats', label: 'İstatistikler', icon: BarChart2 },
      { path: '/history', label: 'Geçmiş', icon: History },
      { path: '/notifications', label: 'Bildirimler', icon: Bell },
      { path: '/settings', label: 'Ayarlar', icon: Settings },
      { path: '/support', label: 'Destek', icon: HelpCircle },
    ],
  },
];

function isActivePath(pathname: string, path: string): boolean {
  if (path === '/home') return pathname === '/home' || pathname === '/app';
  return pathname === path || pathname.startsWith(`${path}/`);
}

type DesktopFooterProps = {
  onNavigate: (path: string) => void;
};

const DesktopFooter: React.FC<DesktopFooterProps> = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <footer className="app-desktop-footer hidden lg:block">
      <div className="app-desktop-footer__inner">
        <div className="app-desktop-footer__brand">
          <button
            type="button"
            className="app-desktop-footer__logo"
            onClick={() => onNavigate('/home')}
            aria-label="NexReward ana sayfa"
          >
            <AppLogo size={36} className="app-desktop-footer__logo-mark" />
            <div>
              <p className="app-desktop-footer__logo-title">NexReward</p>
              <p className="app-desktop-footer__logo-sub">Puan kazan, ödül topla</p>
            </div>
          </button>
        </div>

        {FOOTER_SECTIONS.map(section => (
          <div key={section.title} className="app-desktop-footer__col">
            <p className="app-desktop-footer__col-title">{section.title}</p>
            <ul className="app-desktop-footer__links">
              {section.links.map(link => {
                const active = isActivePath(location.pathname, link.path);
                const Icon = link.icon;
                return (
                  <li key={link.path}>
                    <button
                      type="button"
                      className={`app-desktop-footer__link${active ? ' app-desktop-footer__link--active' : ''}`}
                      onClick={() => onNavigate(link.path)}
                      onMouseEnter={() => prefetchRoute(link.path)}
                      onFocus={() => prefetchRoute(link.path)}
                    >
                      <Icon size={14} strokeWidth={active ? 2.5 : 2} />
                      <span>{link.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="app-desktop-footer__cta">
          <button
            type="button"
            className="app-desktop-footer__qr-btn"
            onClick={() => onNavigate('/qr')}
            onMouseEnter={() => prefetchRoute('/qr')}
          >
            <QrCode size={20} />
            QR Tara
          </button>
          <button
            type="button"
            className="app-desktop-footer__shop-btn"
            onClick={() => onNavigate('/shop')}
            onMouseEnter={() => prefetchRoute('/shop')}
          >
            <ShoppingBag size={18} />
            Mağazaya Git
          </button>
        </div>
      </div>

      <div className="app-desktop-footer__bar">
        <span>© {new Date().getFullYear()} NexReward</span>
        <div className="app-desktop-footer__legal">
          <button type="button" onClick={() => navigate('/terms')}>Kullanım</button>
          <button type="button" onClick={() => navigate('/privacy')}>Gizlilik</button>
        </div>
      </div>
    </footer>
  );
};

export default DesktopFooter;
