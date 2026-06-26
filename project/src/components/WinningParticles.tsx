import React, { useEffect, useState } from 'react';

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

export const WinningParticles: React.FC<WinningParticlesProps> = ({
  trigger,
  emoji = '🎉',
  count = 30,
  intensity = 'normal',
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const total = intensity === 'mega' ? Math.max(count, 54) : count;
    const gravity = intensity === 'mega' ? 0.16 : 0.2;
    const sparkleSet = [emoji, '⭐', '✨', '🌟', '💫', '🎁', '🎟️'];
    const newParticles: Particle[] = [];

    for (let i = 0; i < total; i++) {
      newParticles.push({
        id: Math.random(),
        x: 8 + Math.random() * 84,
        y: intensity === 'mega' ? -8 - Math.random() * 18 : 0,
        life: 1,
        vx: (Math.random() - 0.5) * (intensity === 'mega' ? 12 : 8),
        vy: Math.random() * (intensity === 'mega' ? 4 : 6) + (intensity === 'mega' ? 2 : 3),
        emoji: sparkleSet[Math.floor(Math.random() * sparkleSet.length)],
      });
    }

    setParticles(newParticles);

    const interval = window.setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            y: p.y + p.vy,
            vy: p.vy + gravity,
            life: p.life - (intensity === 'mega' ? 0.022 : 0.03),
            x: p.x + p.vx,
          }))
          .filter(p => p.life > 0),
      );
    }, 30);

    return () => window.clearInterval(interval);
  }, [trigger, emoji, count, intensity]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[90]">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed text-2xl sm:text-3xl select-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}vh`,
            opacity: particle.life,
            transform: `scale(${0.62 + particle.life * 0.62}) rotate(${(1 - particle.life) * 34}deg)`,
            filter: 'drop-shadow(0 5px 0 rgba(0,0,0,0.18))',
            transition: 'all 0.03s ease-out',
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
};

export default WinningParticles;
