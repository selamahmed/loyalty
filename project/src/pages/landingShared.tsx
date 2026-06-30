import React from 'react';
import { Zap, Gift, Gamepad2, Target, Trophy, Users } from 'lucide-react';
import { LANDING_BANNER_STICKERS } from '../lib/pageStickers';

export interface TickerItem {
  text: string;
  emoji?: string;
}

export const TickerStrip: React.FC<{
  items: TickerItem[];
  direction?: 'left' | 'right';
  bg: string;
  textColor: string;
  borderTop?: string;
  borderBottom?: string;
  speed?: number;
}> = ({ items, direction = 'left', bg, textColor, borderTop, borderBottom, speed = 28 }) => {
  const tripled = [...items, ...items, ...items];
  return (
    <div className="overflow-hidden w-full" style={{ background: bg, borderTop, borderBottom, padding: '11px 0' }}>
      <div
        style={{
          display: 'flex',
          width: 'max-content',
          animation: `ticker${direction === 'left' ? 'Left' : 'Right'} ${speed}s linear infinite`,
        }}
      >
        {tripled.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-5 whitespace-nowrap flex-shrink-0">
            {item.emoji && <span style={{ fontSize: '1rem' }}>{item.emoji}</span>}
            <span className="font-black text-sm tracking-widest uppercase" style={{ color: textColor }}>
              {item.text}
            </span>
            <span style={{ color: textColor, opacity: 0.3, margin: '0 4px', fontWeight: 900 }}>◆</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export type ShapeProps = { color: string; size?: number; opacity?: number; rotate?: number };

export const NStar5 = ({ color, size = 100, opacity = 0.18, rotate = 0 }: ShapeProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 56 56"
    fill="none"
    style={{
      position: 'absolute',
      top: -size * 0.18,
      right: -size * 0.18,
      opacity,
      pointerEvents: 'none',
      transform: `rotate(${rotate}deg)`,
      zIndex: 0,
    }}
  >
    <polygon
      points="28,3 33,21 52,21 37,33 43,51 28,40 13,51 19,33 4,21 23,21"
      fill={color}
      stroke="#000"
      strokeWidth="3"
      strokeLinejoin="round"
    />
  </svg>
);

export const NBolt = ({ color, size = 94, opacity = 0.18, rotate = 0 }: ShapeProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    style={{
      position: 'absolute',
      top: -size * 0.12,
      right: -size * 0.12,
      opacity,
      pointerEvents: 'none',
      transform: `rotate(${rotate}deg)`,
      zIndex: 0,
    }}
  >
    <polygon
      points="28,2 15,26 24,26 19,46 36,22 27,22"
      fill={color}
      stroke="#000"
      strokeWidth="3"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

export const NDiamond = ({ color, size = 96, opacity = 0.18, rotate = 0 }: ShapeProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 50 50"
    fill="none"
    style={{
      position: 'absolute',
      top: -size * 0.14,
      right: -size * 0.14,
      opacity,
      pointerEvents: 'none',
      transform: `rotate(${rotate}deg)`,
      zIndex: 0,
    }}
  >
    <polygon points="25,3 46,18 25,47 4,18" fill={color} stroke="#000" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);

export const NHeart = ({ color, size = 98, opacity = 0.18, rotate = 0 }: ShapeProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 52 52"
    fill="none"
    style={{
      position: 'absolute',
      top: -size * 0.14,
      right: -size * 0.14,
      opacity,
      pointerEvents: 'none',
      transform: `rotate(${rotate}deg)`,
      zIndex: 0,
    }}
  >
    <path
      d="M26 45C26 45 5 32 5 17C5 10 11 4 19 6C22 7 26 12 26 12C26 12 30 7 33 6C41 4 47 10 47 17C47 32 26 45 26 45Z"
      fill={color}
      stroke="#000"
      strokeWidth="3"
      strokeLinejoin="round"
    />
  </svg>
);

export const NBurst = ({ color, size = 102, opacity = 0.18, rotate = 0 }: ShapeProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 54 54"
    fill="none"
    style={{
      position: 'absolute',
      top: -size * 0.16,
      right: -size * 0.16,
      opacity,
      pointerEvents: 'none',
      transform: `rotate(${rotate}deg)`,
      zIndex: 0,
    }}
  >
    <polygon
      points="27,1 31,19 47,11 39,26 52,36 34,34 31,51 23,34 5,40 15,27 2,15 20,19"
      fill={color}
      stroke="#000"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const NStar4 = ({ color, size = 96, opacity = 0.18, rotate = 0 }: ShapeProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    style={{
      position: 'absolute',
      top: -size * 0.14,
      right: -size * 0.14,
      opacity,
      pointerEvents: 'none',
      transform: `rotate(${rotate}deg)`,
      zIndex: 0,
    }}
  >
    <path
      d="M24 3 L28 20 L45 24 L28 28 L24 45 L20 28 L3 24 L20 20 Z"
      fill={color}
      stroke="#000"
      strokeWidth="3"
      strokeLinejoin="round"
    />
  </svg>
);

export const features: {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
  stickerSeed: string;
  Shape: React.FC<ShapeProps>;
  sRotate: number;
}[] = [
  { icon: Zap, title: 'Anında Ödüller', desc: 'Her etkileşimde anında puan kazan.', color: '#9122FF', stickerSeed: 'feat-bolt', Shape: NBolt, sRotate: 15 },
  { icon: Gamepad2, title: 'Eğlenceli Oyunlar', desc: 'Oyunlar oyna, görevleri tamamla, bonus kazan.', color: '#FF3E9D', stickerSeed: 'feat-game', Shape: NStar5, sRotate: -10 },
  { icon: Gift, title: 'Özel Ödüller', desc: 'Puanlarını harika ödüllerle değiştir.', color: '#FF6B35', stickerSeed: 'feat-gift', Shape: NHeart, sRotate: 8 },
  { icon: Target, title: 'Günlük Görevler', desc: 'Günlük zorlukları tamamla, serini koru.', color: '#56C8FF', stickerSeed: 'feat-target', Shape: NBurst, sRotate: -12 },
  { icon: Trophy, title: 'Liderlik Tablosu', desc: 'Diğerleriyle yarış ve sıralamada yüksel.', color: '#FFE500', stickerSeed: 'feat-trophy', Shape: NStar4, sRotate: 20 },
  { icon: Users, title: 'Sosyal Ödüller', desc: 'Arkadaşlarınla paylaş, ekstra puan kazan.', color: '#C8FF00', stickerSeed: 'feat-social', Shape: NDiamond, sRotate: -8 },
];

export const tickerHero: TickerItem[] = [
  { text: 'Yakında Yayında', emoji: '🚀' },
  { text: '4 Mini Oyun', emoji: '🎮' },
  { text: 'Pilot Test Hazır', emoji: '✨' },
  { text: '8 Ödül Kategorisi', emoji: '🎁' },
  { text: 'Ödül Sistemi Hazır', emoji: '🏆' },
  { text: 'Günlük Görevler', emoji: '🎯' },
  { text: 'Ücretsiz Kayıt', emoji: '🎉' },
  { text: 'Liderlik Tablosu', emoji: '👑' },
];

export const banners = [
  { bg: '#FFE500', textColor: '#000', tag: '🚀 YAKINDA', headline: 'PİLOT', sub: 'Açılışa Hazır', body: "NeşveNext yayın öncesi pilot aşamasında. İlk kullanıcılar için sadakat, QR, ödül ve oyun sistemi hazırlanıyor.", sticker: LANDING_BANNER_STICKERS[0], stickerSize: 92, stickerRotate: 12 },
  { bg: '#C8FF00', textColor: '#000', tag: '⚡ HIZ', headline: 'ANINDA', sub: 'Ödül Sistemi', body: 'Alışveriş yaptığınız anda puanlar hesabınıza geçer. Bekleme yok, gecikme yok — sadece anlık kazanç.', sticker: LANDING_BANNER_STICKERS[1], stickerSize: 84, stickerRotate: -10 },
  { bg: '#FF6B35', textColor: '#fff', tag: '💰 KAZANÇ', headline: 'QR', sub: 'Puan Kazan', body: 'Kasada QR tara, puanını anında hesabında gör. Yayına hazır güvenli tek kullanımlık kod sistemi.', sticker: LANDING_BANNER_STICKERS[2], stickerSize: 88, stickerRotate: 8 },
  { bg: '#FF3E9D', textColor: '#fff', tag: '🏆 BAŞARI', headline: 'CANLI', sub: 'Liderlik', body: 'Etkinlikler, ödüller, mini oyunlar ve liderlik tabloları yayına hazır şekilde tek platformda buluşuyor.', sticker: LANDING_BANNER_STICKERS[3], stickerSize: 96, stickerRotate: -8 },
];

export const steps = [
  { step: 1, emoji: '📝', title: 'Kayıt Ol', desc: 'Saniyeler içinde ücretsiz hesap oluştur.', color: '#9122FF', Shape: NBolt },
  { step: 2, emoji: '🛍️', title: 'Alışveriş & Kazan', desc: 'Her alışveriş veya QR taramada puan kazan.', color: '#FF6B35', Shape: NStar5 },
  { step: 3, emoji: '🎮', title: 'Oyun Oyna', desc: 'Mini oyunlar ve görevlerle bonus kazan.', color: '#22c55e', Shape: NDiamond },
  { step: 4, emoji: '🎉', title: 'Ödülünü Al', desc: 'Puanlarını dilediğin ödülle değiştir.', color: '#FF3E9D', Shape: NHeart },
];
