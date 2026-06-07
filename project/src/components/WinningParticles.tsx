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

export const WinningParticles: React.FC<{ trigger?: boolean; emoji?: string }> = ({ trigger, emoji = '🎉' }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const newParticles: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: Math.random(),
        x: Math.random() * 100,
        y: 0,
        life: 1,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 6 + 3,
        emoji: [emoji, '⭐', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)],
      });
    }

    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            y: p.y + p.vy,
            vy: p.vy + 0.2,
            life: p.life - 0.03,
            x: p.x + p.vx,
          }))
          .filter(p => p.life > 0)
      );
    }, 30);

    return () => clearInterval(interval);
  }, [trigger, emoji]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed text-2xl sm:text-3xl select-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}vh`,
            opacity: particle.life,
            transform: `scale(${particle.life})`,
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
