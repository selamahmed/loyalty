import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { playSound } from '../lib/sounds';
import { getLevelConfig, DEFAULT_LEVELS, calcXpProgress, type LevelConfig } from '../services/xp';
import LevelBadge from '../components/LevelBadge';
import DuoProgressPath from '../components/DuoProgressPath';
import PageMainSticker from '../components/PageMainSticker';
import { getLevelBadge } from '../lib/levelBadges';

type LevelRow = { level: number; title: string; xp: number; reward: string; bonus: number };

function mapLevels(rows: LevelConfig[]): LevelRow[] {
  return rows.map(r => ({
    level: r.level,
    title: r.title,
    xp: r.xp_required,
    reward: r.reward_label ?? '',
    bonus: r.bonus_points,
  }));
}

const FALLBACK_LEVELS = mapLevels(DEFAULT_LEVELS);

const TIERS = [
  { from: 1, to: 4, label: 'BAŞLANGIÇ', emoji: '🌱', color: '#FFE500' },
  { from: 5, to: 8, label: 'SAVAŞÇI', emoji: '⚔️', color: '#4CAF50' },
  { from: 9, to: 12, label: 'KAHRAMAN', emoji: '🦸', color: '#2196F3' },
  { from: 13, to: 16, label: 'EFSANE', emoji: '🔥', color: '#FF5722' },
  { from: 17, to: 99, label: 'ÖLÜMSÜZ', emoji: '👑', color: '#E91E63' },
];

const getTier = (lv: number) => TIERS.find(t => lv >= t.from && lv <= t.to) ?? TIERS[0];
const getLvlData = (levels: LevelRow[], lv: number) => levels.find(l => l.level === lv) ?? levels[0];
const getNextLvlData = (levels: LevelRow[], lv: number) => levels.find(l => l.level > lv);

const Skeleton: React.FC<{ h?: number; w?: string; r?: number }> = ({ h = 18, w = '100%', r = 8 }) => (
  <div className="progress-journey__skeleton" style={{ height: h, width: w, borderRadius: r }} />
);

const ProgressPath: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();

  const [levelRows, setLevelRows] = useState<LevelRow[]>(FALLBACK_LEVELS);
  const [levelConfig, setLevelConfig] = useState<LevelConfig[]>(DEFAULT_LEVELS);
  const [liveXp, setLiveXp] = useState<number | null>(null);
  const [liveLevel, setLiveLevel] = useState<number | null>(null);
  const [liveXpToNext, setLiveXpToNext] = useState<number | null>(null);
  const [rtBadge, setRtBadge] = useState(false);
  const [animXp, setAnimXp] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const currentRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    getLevelConfig()
      .then(rows => {
        setLevelConfig(rows);
        setLevelRows(mapLevels(rows));
      })
      .catch(() => {
        setLevelConfig(DEFAULT_LEVELS);
        setLevelRows(FALLBACK_LEVELS);
      });
  }, []);

  const userXp = liveXp ?? profile?.xp ?? 0;
  const userLevel = liveLevel ?? profile?.level ?? 1;
  const userXpToNext = liveXpToNext ?? profile?.xp_to_next ?? null;

  const xpProgress = calcXpProgress(userXp, userLevel, levelConfig, userXpToNext);
  const currentLvl = getLvlData(levelRows, userLevel);
  const nextLvl = getNextLvlData(levelRows, userLevel);
  const xpPct = xpProgress.pct;
  const xpLeft = xpProgress.remaining;
  const isMaxLevel = xpProgress.isMaxLevel;
  const currentTier = getTier(userLevel);

  const enriched = levelRows.map((l, i, arr) => {
    const tier = getTier(l.level);
    const prevTier = i > 0 ? getTier(arr[i - 1].level) : null;
    return {
      ...l,
      unlocked: l.level < userLevel,
      isCurrent: l.level === userLevel,
      tierLabel: tier.label,
      tierEmoji: tier.emoji,
      tierColor: tier.color,
      isTierStart: !prevTier || prevTier.label !== tier.label,
    };
  });

  const unlockedCount = enriched.filter(l => l.unlocked || l.isCurrent).length;
  const journeyPct = levelRows.length > 1
    ? Math.round(((unlockedCount - 1 + (isMaxLevel ? 1 : xpPct / 100)) / (levelRows.length - 1)) * 100)
    : 100;
  const selLvl = enriched.find(l => l.level === selectedLevel);

  useEffect(() => {
    if (!profile?.id) return;
    const ch = supabase
      .channel(`progress_${profile.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'profiles',
        filter: `id=eq.${profile.id}`,
      }, (payload) => {
        const p = payload.new as { xp?: number; level?: number; xp_to_next?: number };
        if (p.xp !== undefined) setLiveXp(p.xp);
        if (p.level !== undefined) setLiveLevel(p.level);
        if (p.xp_to_next !== undefined) setLiveXpToNext(p.xp_to_next);
        setRtBadge(true);
        setTimeout(() => setRtBadge(false), 3000);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [profile?.id]);

  useEffect(() => {
    const t = setTimeout(() => setAnimXp(xpPct), 300);
    return () => clearTimeout(t);
  }, [xpPct]);

  useEffect(() => {
    const t = setTimeout(() => currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 600);
    return () => clearTimeout(t);
  }, [levelRows.length, userLevel]);

  if (authLoading) {
    return (
      <div className="progress-journey progress-journey--loading p-3 sm:p-4 max-w-lg mx-auto">
        <Skeleton h={28} w="50%" r={10} />
        <Skeleton h={160} r={20} />
        <Skeleton h={480} r={16} />
      </div>
    );
  }

  return (
    <div className="progress-journey page-enter">
      <div className="progress-journey__inner max-w-lg mx-auto p-3 sm:p-4">

        <header className="progress-journey__header">
          <div>
            <p className="progress-journey__eyebrow">İlerleme Yolu</p>
            <h1 className="progress-journey__title">Seviye Yolculuğun</h1>
          </div>
          <span className={`progress-journey__live ${rtBadge ? 'progress-journey__live--pulse' : ''}`}>
            <span className="progress-journey__live-dot" />
            {rtBadge ? 'Güncellendi' : 'Canlı'}
          </span>
        </header>

        <section
          className="progress-journey__hero"
          style={{ ['--hero-accent' as string]: currentTier.color }}
        >
          <div className="progress-journey__hero-main">
            <div className="progress-journey__hero-level">
              <LevelBadge level={userLevel} width={56} />
              <div>
                <p className="progress-journey__hero-tier">
                  {currentTier.emoji} {currentTier.label}
                </p>
                <p className="progress-journey__hero-name">{currentLvl.title}</p>
                <p className="progress-journey__hero-badge">{getLevelBadge(userLevel).label}</p>
              </div>
            </div>

            <div className="progress-journey__hero-progress">
              <div className="progress-journey__hero-progress-head">
                <span>
                  {isMaxLevel
                    ? 'Maksimum seviye'
                    : `${xpLeft.toLocaleString('tr-TR')} XP kaldı`}
                </span>
                <span className="progress-journey__hero-pct">%{isMaxLevel ? 100 : animXp}</span>
              </div>
              <div className="progress-journey__bar" role="progressbar" aria-valuenow={animXp} aria-valuemin={0} aria-valuemax={100}>
                <div className="progress-journey__bar-fill" style={{ width: `${isMaxLevel ? 100 : animXp}%` }} />
              </div>
            </div>

            {!isMaxLevel && nextLvl && (
              <div className="progress-journey__next">
                <span className="progress-journey__next-label">Sonraki ödül</span>
                <p className="progress-journey__next-reward">
                  Lv.{nextLvl.level} · {nextLvl.reward || nextLvl.title}
                </p>
              </div>
            )}

            <div className="progress-journey__stats">
              <div>
                <strong>%{journeyPct}</strong>
                <span>Yolculuk</span>
              </div>
              <div>
                <strong>{unlockedCount}/{levelRows.length}</strong>
                <span>Açılan</span>
              </div>
              <div>
                <strong>{userXp.toLocaleString('tr-TR')}</strong>
                <span>Toplam XP</span>
              </div>
            </div>
          </div>

          <PageMainSticker page="progress" variant="hero-inline" className="progress-journey__sticker" />
        </section>

        <section className="progress-journey__path" aria-label="Seviye yolu">
          <DuoProgressPath
            levels={enriched}
            currentRef={currentRef}
            selectedLevel={selectedLevel}
            onSelect={(level) => setSelectedLevel(selectedLevel === level ? null : level)}
          />
        </section>
      </div>

      {selLvl && (
        <div className="progress-journey__sheet" role="dialog" aria-label={`Seviye ${selLvl.level} detayı`}>
          <div
            className="progress-journey__sheet-head"
            style={{ ['--sheet-accent' as string]: getTier(selLvl.level).color }}
          >
            <LevelBadge level={selLvl.level} width={44} dimmed={!selLvl.unlocked && !selLvl.isCurrent} />
            <div className="progress-journey__sheet-head-copy">
              <span className="progress-journey__sheet-meta">
                {getLevelBadge(selLvl.level).label}
                {selLvl.isCurrent && ' · Şu an'}
                {selLvl.unlocked && !selLvl.isCurrent && ' · Açık'}
              </span>
              <p className="progress-journey__sheet-title">{selLvl.title}</p>
            </div>
            <button
              type="button"
              className="progress-journey__sheet-close"
              onClick={() => { playSound('click'); setSelectedLevel(null); }}
              aria-label="Kapat"
            >
              ✕
            </button>
          </div>

          <div className="progress-journey__sheet-body">
            <p>
              {selLvl.unlocked || selLvl.isCurrent
                ? `Bu seviyeyi tamamladın. Ödül: ${selLvl.reward || '—'}`
                : `${selLvl.xp.toLocaleString('tr-TR')} XP gerekli · ${Math.max(0, selLvl.xp - userXp).toLocaleString('tr-TR')} XP kaldı`}
              {selLvl.bonus > 0 && ` · +${selLvl.bonus} bonus puan`}
            </p>

            {!selLvl.unlocked && !selLvl.isCurrent && selLvl.xp > 0 && (
              <div className="progress-journey__bar progress-journey__bar--sm">
                <div
                  className="progress-journey__bar-fill"
                  style={{ width: `${Math.min(100, Math.round((userXp / selLvl.xp) * 100))}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressPath;
