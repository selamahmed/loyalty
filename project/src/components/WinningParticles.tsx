import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  life: number;
  vx: number;
  vy: number;
  emoji?: string;
}

interface WinningParticlesProps {
  trigger?: boolean;
  emoji?: string;
  count?: number;
  intensity?: 'normal' | 'mega';
}

/**
 * Celebration burst.
 *
 * Performance notes:
 * - Driven by a single requestAnimationFrame loop (delta-time based) instead of
 *   setInterval, so motion is vsync-aligned, frame-paced, and auto-throttled in
 *   background tabs.
 * - Each particle animates ONLY `transform` (translate3d) and `opacity`, which
 *   the browser can run entirely on the compositor — no per-frame layout or
 *   paint. Positions use vw/vh so the fixed full-screen container maps 1:1 to
 *   the previous left(%)/top(vh) layout, keeping the look identical.
 * - DOM nodes are created once per burst; the rAF loop mutates their style
 *   directly (refs) rather than calling setState every frame, eliminating ~33
 *   React reconciliations per second.
 * - Honors `prefers-reduced-motion`.
 */
export const WinningParticles: React.FC<WinningParticlesProps> = ({
  trigger,
  emoji = '🎉',
  count = 30,
  intensity = 'normal',
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const nodeRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!trigger) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const total = intensity === 'mega' ? Math.max(count, 54) : count;
    const gravity = intensity === 'mega' ? 0.16 : 0.2;
    const decay = intensity === 'mega' ? 0.022 : 0.03;
    const sparkleSet = [emoji, '⭐', '✨', '🌟', '💫', '🎁', '🎟️'];
    const seeded: Particle[] = [];

    for (let i = 0; i < total; i++) {
      seeded.push({
        id: i,
        x: 8 + Math.random() * 84,
        y: intensity === 'mega' ? -8 - Math.random() * 18 : 0,
        life: 1,
        vx: (Math.random() - 0.5) * (intensity === 'mega' ? 12 : 8),
        vy: Math.random() * (intensity === 'mega' ? 4 : 6) + (intensity === 'mega' ? 2 : 3),
        emoji: sparkleSet[Math.floor(Math.random() * sparkleSet.length)],
      });
    }

    setParticles(seeded);

    if (reduceMotion) {
      // Render the burst statically, then clear it shortly after.
      const clear = window.setTimeout(() => setParticles([]), 600);
      return () => window.clearTimeout(clear);
    }

    // Mutable simulation state owned by the loop (no React state churn).
    const sim = seeded.map((p) => ({ ...p }));
    let rafId = 0;
    let last = performance.now();

    const applyStyles = () => {
      for (const p of sim) {
        const node = nodeRefs.current.get(p.id);
        if (!node) continue;
        const scale = 0.62 + p.life * 0.62;
        const rot = (1 - p.life) * 34;
        node.style.transform = `translate3d(${p.x}vw, ${p.y}vh, 0) scale(${scale}) rotate(${rot}deg)`;
        node.style.opacity = `${Math.max(0, p.life)}`;
      }
    };

    const step = (now: number) => {
      // Normalize to the original 30ms tick cadence so velocities feel the same
      // regardless of the device's actual refresh rate.
      const elapsed = Math.min(now - last, 64);
      last = now;
      const stepScale = elapsed / 30;

      let alive = false;
      for (const p of sim) {
        if (p.life <= 0) continue;
        p.y += p.vy * stepScale;
        p.vy += gravity * stepScale;
        p.x += p.vx * stepScale;
        p.life -= decay * stepScale;
        if (p.life > 0) alive = true;
      }

      applyStyles();

      if (alive) {
        rafId = requestAnimationFrame(step);
      } else {
        setParticles([]);
      }
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [trigger, emoji, count, intensity]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[90]">
      {particles.map((particle) => (
        <div
          key={particle.id}
          ref={(el) => {
            if (el) nodeRefs.current.set(particle.id, el);
            else nodeRefs.current.delete(particle.id);
          }}
          className="fixed left-0 top-0 text-2xl sm:text-3xl select-none"
          style={{
            opacity: particle.life,
            transform: `translate3d(${particle.x}vw, ${particle.y}vh, 0) scale(${
              0.62 + particle.life * 0.62
            }) rotate(0deg)`,
            filter: 'drop-shadow(0 5px 0 rgba(0,0,0,0.18))',
            willChange: 'transform, opacity',
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
};

export default WinningParticles;
