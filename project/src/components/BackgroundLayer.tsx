import React from 'react';
import { useApp } from '../context/AppContext';

const DotsBackground: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(#7c3aed 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
        opacity: 0.12,
      }}
    />
    <div style={{ position: 'absolute', top: '8%', left: '6%', width: 60, height: 60, border: '3px solid #7c3aed', borderRadius: '12px', opacity: 0.18, transform: 'rotate(15deg)', animation: 'bgFloat1 7s ease-in-out infinite' }} />
    <div style={{ position: 'absolute', top: '20%', right: '8%', width: 40, height: 40, border: '3px solid #f59e0b', borderRadius: '50%', opacity: 0.22, animation: 'bgFloat2 9s ease-in-out infinite' }} />
    <div style={{ position: 'absolute', top: '55%', left: '4%', fontSize: '3rem', color: '#7c3aed', opacity: 0.1, fontWeight: 900, animation: 'bgFloat1 11s ease-in-out infinite', lineHeight: 1 }}>★</div>
    <div style={{ position: 'absolute', top: '35%', right: '5%', fontSize: '2.5rem', color: '#6d28d9', opacity: 0.1, fontWeight: 900, animation: 'bgFloat2 8s ease-in-out infinite', lineHeight: 1 }}>✦</div>
    <div style={{ position: 'absolute', bottom: '15%', right: '12%', width: 50, height: 50, border: '3px solid #a78bfa', opacity: 0.18, transform: 'rotate(45deg)', animation: 'bgFloat1 10s ease-in-out infinite' }} />
    <div style={{ position: 'absolute', bottom: '25%', left: '10%', fontSize: '2rem', color: '#7c3aed', opacity: 0.1, fontWeight: 900, animation: 'bgFloat2 12s ease-in-out infinite', lineHeight: 1 }}>◆</div>
    <style>{`
      @keyframes bgFloat1 {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-18px) rotate(8deg); }
      }
      @keyframes bgFloat2 {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-14px) rotate(-6deg); }
      }
    `}</style>
  </div>
);

const ShapesBackground: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div style={{ position: 'absolute', top: '4%', left: '8%', width: 110, height: 110, background: '#FDE68A', border: '3px solid #1e1b4b', borderRadius: '14px', opacity: 0.75, transform: 'rotate(15deg)', animation: 'geoFloat1 10s ease-in-out infinite alternate' }} />
    <div style={{ position: 'absolute', top: '18%', right: '6%', width: 80, height: 80, background: 'transparent', border: '4px solid #FF6B6B', borderRadius: '50%', opacity: 0.65, animation: 'geoFloat2 12s ease-in-out infinite alternate' }} />
    <div style={{ position: 'absolute', top: '45%', left: '3%', width: 70, height: 70, background: '#6EE7B7', border: '3px solid #1e1b4b', borderRadius: '10px', opacity: 0.6, transform: 'rotate(-20deg)', animation: 'geoFloat2 14s ease-in-out infinite alternate' }} />
    <div style={{ position: 'absolute', top: '38%', right: '4%', width: 95, height: 95, background: '#C4B5FD', border: '3px solid #1e1b4b', borderRadius: '50%', opacity: 0.55, animation: 'geoFloat1 11s ease-in-out infinite alternate' }} />
    <div style={{ position: 'absolute', bottom: '20%', left: '7%', width: 85, height: 85, background: 'transparent', border: '4px solid #FDE68A', opacity: 0.65, transform: 'rotate(30deg)', animation: 'geoFloat2 9s ease-in-out infinite alternate' }} />
    <div style={{ position: 'absolute', bottom: '8%', right: '9%', width: 65, height: 65, background: '#FF6B6B', border: '3px solid #1e1b4b', borderRadius: '12px', opacity: 0.55, transform: 'rotate(-15deg)', animation: 'geoFloat1 13s ease-in-out infinite alternate' }} />
    <div style={{ position: 'absolute', top: '70%', right: '18%', width: 50, height: 50, background: '#FDE68A', border: '3px solid #1e1b4b', borderRadius: '50%', opacity: 0.5, animation: 'geoFloat2 8s ease-in-out infinite alternate' }} />
    <style>{`
      @keyframes geoFloat1 {
        0% { transform: translate(0, 0) rotate(15deg); }
        100% { transform: translate(16px, -18px) rotate(28deg); }
      }
      @keyframes geoFloat2 {
        0% { transform: translate(0, 0) rotate(-10deg); }
        100% { transform: translate(-12px, 20px) rotate(-22deg); }
      }
    `}</style>
  </div>
);

const StripesBackground: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `repeating-linear-gradient(
          45deg,
          rgba(124, 58, 237, 0.05),
          rgba(124, 58, 237, 0.05) 20px,
          transparent 20px,
          transparent 40px
        )`,
      }}
    />
    <div style={{ position: 'absolute', top: '12%', left: '-40px', fontSize: '11rem', fontWeight: 900, color: '#7c3aed', opacity: 0.07, transform: 'rotate(12deg)', lineHeight: 1, pointerEvents: 'none' }}>★</div>
    <div style={{ position: 'absolute', top: '48%', right: '-50px', fontSize: '13rem', fontWeight: 900, color: '#6d28d9', opacity: 0.07, transform: 'rotate(-12deg)', lineHeight: 1, pointerEvents: 'none' }}>+</div>
    <div style={{ position: 'absolute', bottom: '-20px', left: '-30px', fontSize: '9rem', fontWeight: 900, color: '#7c3aed', opacity: 0.07, transform: 'rotate(45deg)', lineHeight: 1, pointerEvents: 'none' }}>×</div>
    <div style={{ position: 'absolute', top: 16, left: 16, width: 44, height: 44, background: '#fbbf24', border: '3px solid #1e1b4b', boxShadow: '0px 4px 0px #1e1b4b', borderRadius: '10px', opacity: 0.7 }} />
    <div style={{ position: 'absolute', bottom: 16, right: 16, width: 56, height: 56, background: '#f87171', border: '3px solid #1e1b4b', boxShadow: '0px 4px 0px #1e1b4b', borderRadius: '50%', opacity: 0.65 }} />
    <div style={{ position: 'absolute', top: 16, right: 80, width: 32, height: 32, background: '#a78bfa', border: '3px solid #1e1b4b', boxShadow: '0px 3px 0px #1e1b4b', borderRadius: '8px', opacity: 0.6, transform: 'rotate(20deg)' }} />
  </div>
);

const BackgroundLayer: React.FC = () => {
  const { bgStyle } = useApp();
  if (bgStyle === 'dots') return <DotsBackground />;
  if (bgStyle === 'shapes') return <ShapesBackground />;
  if (bgStyle === 'stripes') return <StripesBackground />;
  return null;
};

export default BackgroundLayer;
