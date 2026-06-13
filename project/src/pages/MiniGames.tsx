import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Gamepad2, Star, Trophy, X, RotateCcw, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { tr } from '../lib/tr';
import StickerAccent from '../components/StickerAccent';
import StickerHero from '../components/StickerHero';
import { GAME_LOSE_STICKER, GAME_WIN_STICKER } from '../lib/pageStickers';

const GameOutcomeSticker: React.FC<{ won: boolean; size?: number }> = ({ won, size = 88 }) => (
  <div style={{ display: 'flex', justifyContent: 'center' }}>
    <StickerAccent
      group={won ? GAME_WIN_STICKER : GAME_LOSE_STICKER}
      variant="colorful"
      size={size}
      rotate={won ? 10 : -8}
    />
  </div>
);

// --- Spin Wheel Game ---
const wheelSegments = [
  { label: '10 pts', value: 10, color: '#7B6EF6' },
  { label: '50 pts', value: 50, color: '#4F8EF7' },
  { label: '5 pts', value: 5, color: '#22c55e' },
  { label: '100 pts', value: 100, color: '#f59e0b' },
  { label: '25 pts', value: 25, color: '#ef4444' },
  { label: '75 pts', value: 75, color: '#8b5cf6' },
  { label: '0 pts', value: 0, color: '#6b7280' },
  { label: '200 pts', value: 200, color: '#ec4899' },
];

const SpinWheel: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [canSpin, setCanSpin] = useState(true);

  const spin = () => {
    if (spinning || !canSpin) return;
    setSpinning(true);
    setResult(null);
    const segIdx = Math.floor(Math.random() * wheelSegments.length);
    const segAngle = 360 / wheelSegments.length;
    const newRotation = rotation + 1440 + (360 - segIdx * segAngle - segAngle / 2);
    setRotation(newRotation);
    setTimeout(() => {
      setSpinning(false);
      setResult(wheelSegments[segIdx].value);
      if (wheelSegments[segIdx].value > 0) onWin();
      setCanSpin(false);
    }, 3000);
  };

  const segAngle = 360 / wheelSegments.length;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-10 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-black dark:border-t-white" />

        {/* Wheel SVG */}
        <div
          className="w-64 h-64 rounded-full border-4 border-black dark:border-gray-400 relative overflow-hidden shadow-xl"
          style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 3s cubic-bezier(0.2, 0, 0.1, 1)' : 'none' }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {wheelSegments.map((seg, i) => {
              const startAngle = (i * segAngle - 90) * (Math.PI / 180);
              const endAngle = ((i + 1) * segAngle - 90) * (Math.PI / 180);
              const x1 = 100 + 100 * Math.cos(startAngle);
              const y1 = 100 + 100 * Math.sin(startAngle);
              const x2 = 100 + 100 * Math.cos(endAngle);
              const y2 = 100 + 100 * Math.sin(endAngle);
              const midAngle = ((i + 0.5) * segAngle - 90) * (Math.PI / 180);
              const tx = 100 + 65 * Math.cos(midAngle);
              const ty = 100 + 65 * Math.sin(midAngle);
              return (
                <g key={i}>
                  <path d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`} fill={seg.color} stroke="white" strokeWidth="1" />
                  <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="bold" transform={`rotate(${(i + 0.5) * segAngle}, ${tx}, ${ty})`}>
                    {seg.label}
                  </text>
                </g>
              );
            })}
            <circle cx="100" cy="100" r="15" fill="white" stroke="black" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {result !== null && (
        <div className={`text-center p-4 rounded-2xl border-2 flex flex-col items-center gap-3 ${result > 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}>
          <GameOutcomeSticker won={result > 0} size={72} />
          {result > 0 ? (
            <p className="font-black text-xl text-green-600 dark:text-green-400">+{result} Points!</p>
          ) : (
            <p className="font-black text-xl text-gray-500">Better luck next time!</p>
          )}
        </div>
      )}

      <button
        onClick={spin}
        disabled={spinning || !canSpin}
        className="btn-primary px-8 py-4 text-lg disabled:opacity-50"
      >
        {spinning ? 'Spinning...' : canSpin ? '🎰 Spin!' : '✓ Spun Today'}
      </button>
    </div>
  );
};

// --- Memory Game ---
const memoryCards = ['🎮', '⭐', '🏆', '🎁', '🔥', '💎', '🎯', '🚀'];
const MemoryGame: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [checking, setChecking] = useState(false);

  const init = useCallback(() => {
    const pairs = [...memoryCards, ...memoryCards].sort(() => Math.random() - 0.5);
    setCards(pairs.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false })));
    setFlipped([]);
    setMoves(0);
    setWon(false);
  }, []);

  useEffect(() => { init(); }, [init]);

  const handleFlip = (id: number) => {
    if (checking || flipped.length === 2) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;

    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setChecking(true);
      const [a, b] = newFlipped;
      setTimeout(() => {
        if (newCards[a].emoji === newCards[b].emoji) {
          const matched = newCards.map(c => newFlipped.includes(c.id) ? { ...c, matched: true } : c);
          setCards(matched);
          setFlipped([]);
          setChecking(false);
          if (matched.every(c => c.matched)) {
            setWon(true);
            const pts = Math.max(50, 200 - moves * 5);
            onWin();
          }
        } else {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c));
          setFlipped([]);
          setChecking(false);
        }
      }, 900);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-xs">
        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Moves: {moves}</span>
        <button onClick={init} className="flex items-center gap-1 text-sm font-bold text-[#7B6EF6] dark:text-[#4F8EF7]">
          <RotateCcw size={14} /> Reset
        </button>
      </div>
      {won && (
        <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 text-center w-full max-w-xs flex flex-col items-center gap-2">
          <GameOutcomeSticker won size={72} />
          <p className="font-black text-green-600 dark:text-green-400">You Won! ({moves} moves)</p>
        </div>
      )}
      <div className="grid grid-cols-4 gap-2 max-w-xs w-full">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            className={`aspect-square rounded-2xl border-2 border-black dark:border-gray-600 flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
              card.flipped || card.matched
                ? card.matched ? 'bg-green-100 dark:bg-green-900/30 scale-95' : 'bg-[#7B6EF6]/20 dark:bg-[#4F8EF7]/20'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer'
            }`}
          >
            {(card.flipped || card.matched) ? card.emoji : '?'}
          </button>
        ))}
      </div>
    </div>
  );
};


type FallingItem = { id: number; x: number; y: number; type: 'gift' | 'star' | 'bomb' };

const CatchGame: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'done'>('idle');
  const [displayItems, setDisplayItems] = useState<FallingItem[]>([]);
  const [displayScore, setDisplayScore] = useState(0);
  const [displayTime, setDisplayTime] = useState(20);
  const [cupX, setCupX] = useState(50);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const cupXRef   = useRef(50);
  const scoreRef  = useRef(0);
  const itemsRef  = useRef<FallingItem[]>([]);
  const nextIdRef = useRef(0);
  const activeRef = useRef(false);
  const timeRef   = useRef(20);
  const holdDir   = useRef<-1 | 0 | 1>(0);

  const CUP_HALF = 10; // % half-width of cup

  const clampCup = (x: number) => Math.max(CUP_HALF + 1, Math.min(100 - CUP_HALF - 1, x));

  const start = () => {
    scoreRef.current = 0; itemsRef.current = []; nextIdRef.current = 0; timeRef.current = 20;
    setDisplayScore(0); setDisplayTime(20); setDisplayItems([]);
    const cx = 50; cupXRef.current = cx; setCupX(cx);
    setGameState('playing'); activeRef.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = clampCup(((e.clientX - rect.left) / rect.width) * 100);
    cupXRef.current = x; setCupX(x);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = clampCup(((e.touches[0].clientX - rect.left) / rect.width) * 100);
    cupXRef.current = x; setCupX(x);
  };

  // Hold-button movement
  useEffect(() => {
    if (gameState !== 'playing') return;
    const id = setInterval(() => {
      if (holdDir.current !== 0) {
        const nx = clampCup(cupXRef.current + holdDir.current * 4);
        cupXRef.current = nx; setCupX(nx);
      }
    }, 40);
    return () => clearInterval(id);
  }, [gameState]);

  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    activeRef.current = true;

    const spawnId = setInterval(() => {
      if (!activeRef.current) return;
      const r = Math.random();
      itemsRef.current = [...itemsRef.current, {
        id: nextIdRef.current++,
        x: Math.random() * 78 + 11,
        y: -6,
        type: r > 0.8 ? 'bomb' : r > 0.5 ? 'star' : 'gift',
      }];
    }, 750);

    const loopId = setInterval(() => {
      if (!activeRef.current) return;
      const cup = cupXRef.current;
      itemsRef.current = itemsRef.current
        .map(i => ({ ...i, y: i.y + 2.4 }))
        .filter(i => {
          if (i.y >= 78 && i.y < 94) {
            if (Math.abs(i.x - cup) <= CUP_HALF + 2) {
              if (i.type === 'bomb')  scoreRef.current = Math.max(0, scoreRef.current - 3);
              else if (i.type === 'star') scoreRef.current += 2;
              else                    scoreRef.current += 1;
              setDisplayScore(scoreRef.current);
              return false;
            }
          }
          return i.y < 102;
        });
      setDisplayItems([...itemsRef.current]);
    }, 40);

    const timerId = setInterval(() => {
      if (!activeRef.current) return;
      timeRef.current--;
      setDisplayTime(timeRef.current);
      if (timeRef.current <= 0) {
        activeRef.current = false;
        clearInterval(spawnId); clearInterval(loopId); clearInterval(timerId);
        setGameState('done');
        onWin();
      }
    }, 1000);

    return () => {
      activeRef.current = false;
      clearInterval(spawnId); clearInterval(loopId); clearInterval(timerId);
    };
  }, [gameState, onWin]);

  const emoji = (t: FallingItem['type']) => t === 'gift' ? '🎁' : t === 'star' ? '⭐' : '💣';

  return (
    <div className="flex flex-col items-center gap-4">
      {gameState === 'idle' && (
        <div className="text-center space-y-3">
          <div className="text-6xl">🏆</div>
          <p className="font-black text-lg text-gray-900 dark:text-white">Düşen Ödülleri Yakala!</p>
          <div className="flex justify-center gap-6 text-sm font-black">
            <span className="px-2 py-1 rounded-lg border-2 border-black bg-white dark:bg-gray-800 shadow-[2px_2px_0_#000]">🎁 = +1</span>
            <span className="px-2 py-1 rounded-lg border-2 border-black bg-white dark:bg-gray-800 shadow-[2px_2px_0_#000]">⭐ = +2</span>
            <span className="px-2 py-1 rounded-lg border-2 border-black bg-white dark:bg-gray-800 shadow-[2px_2px_0_#000]">💣 = -3</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">🖱️ Fare veya parmağınla kupayı hareket ettir</p>
          <button onClick={start} className="btn-primary px-8 py-3">Oyunu Başlat</button>
        </div>
      )}

      {gameState === 'done' && (
        <div className="text-center space-y-3 flex flex-col items-center">
          <GameOutcomeSticker won={displayScore > 0} size={88} />
          <p className="font-black text-2xl text-gray-900 dark:text-white">Skor: {displayScore}</p>
          <p className="text-gray-500 dark:text-gray-400">Kazandın: <span className="font-black text-amber-500">{Math.max(0, displayScore) * 5} puan</span></p>
          <button onClick={start} className="btn-primary px-8">Tekrar Oyna</button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full max-w-xs">
          {/* HUD */}
          <div className="flex justify-between items-center mb-2 px-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black dark:border-gray-400 bg-white dark:bg-gray-800 shadow-[3px_3px_0_#000] dark:shadow-[3px_3px_0_#374151] font-black text-sm text-gray-900 dark:text-white">
              🏆 {displayScore}
            </div>
            <div className={`px-3 py-1.5 rounded-xl border-2 border-black dark:border-gray-400 shadow-[3px_3px_0_#000] dark:shadow-[3px_3px_0_#374151] font-black text-sm ${displayTime <= 5 ? 'bg-red-400 text-white animate-pulse' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'}`}>
              ⏱ {displayTime}s
            </div>
          </div>

          {/* Game area */}
          <div
            ref={gameAreaRef}
            onPointerMove={handlePointerMove}
            onTouchMove={handleTouchMove}
            style={{
              position: 'relative', height: 360, width: '100%',
              background: '#f0f9ff',
              border: '3px solid #000',
              borderRadius: 18, overflow: 'hidden',
              cursor: 'none', touchAction: 'none',
              boxShadow: '5px 5px 0 #000',
              userSelect: 'none',
            }}
          >
            {/* Grid background (neo-brutalism) */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }} xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="cgrid" width="28" height="28" patternUnits="userSpaceOnUse">
                  <path d="M 28 0 L 0 0 0 28" fill="none" stroke="black" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cgrid)"/>
            </svg>

            {/* Catch zone indicator */}
            <div style={{ position: 'absolute', bottom: '14%', left: 0, right: 0, height: 2, background: '#000', opacity: 0.12 }} />

            {/* Falling items */}
            {displayItems.map(item => (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: 30, lineHeight: 1,
                  pointerEvents: 'none',
                  filter: item.type === 'bomb' ? 'drop-shadow(0 0 5px rgba(239,68,68,0.8))' : 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
                }}
              >
                {emoji(item.type)}
              </div>
            ))}

            {/* Cup */}
            <div style={{
              position: 'absolute', bottom: '5%',
              left: `${cupX}%`, transform: 'translateX(-50%)',
              width: `${CUP_HALF * 2}%`, pointerEvents: 'none',
            }}>
              <svg viewBox="0 0 80 52" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                {/* Rim */}
                <rect x="1" y="1" width="78" height="12" rx="5" fill="#fbbf24" stroke="#000" strokeWidth="3"/>
                {/* Body */}
                <path d="M 10 13 L 70 13 L 62 49 L 18 49 Z" fill="#fbbf24" stroke="#000" strokeWidth="3" strokeLinejoin="round"/>
                {/* Shine stripe */}
                <line x1="22" y1="18" x2="18" y2="44" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
                {/* Star */}
                <text x="44" y="36" textAnchor="middle" dominantBaseline="middle" fontSize="15">⭐</text>
              </svg>
            </div>

            {/* Ground */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: '#000' }} />
          </div>

          {/* Mobile hold-buttons */}
          <div className="flex gap-3 mt-3">
            <button
              onPointerDown={() => { holdDir.current = -1; }}
              onPointerUp={() => { holdDir.current = 0; }}
              onPointerLeave={() => { holdDir.current = 0; }}
              className="flex-1 py-4 rounded-2xl font-black text-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white select-none"
              style={{ border: '3px solid #000', boxShadow: '4px 4px 0 #000', touchAction: 'none' }}
            >
              ◀ Sol
            </button>
            <button
              onPointerDown={() => { holdDir.current = 1; }}
              onPointerUp={() => { holdDir.current = 0; }}
              onPointerLeave={() => { holdDir.current = 0; }}
              className="flex-1 py-4 rounded-2xl font-black text-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white select-none"
              style={{ border: '3px solid #000', boxShadow: '4px 4px 0 #000', touchAction: 'none' }}
            >
              Sağ ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Flappy Bird Style Game (fixed physics & collision) ---
const FLAPPY_W = 320;
const FLAPPY_H = 320;
const FLAPPY_BIRD_X = 64;
const FLAPPY_PIPE_W = 52;
const FLAPPY_GAP = 92;

const FlappyGame: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'over'>('idle');
  const [renderTick, setRenderTick] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  const birdRef = useRef({ y: FLAPPY_H / 2 - 20, vy: 0 });
  const pipesRef = useRef<{ id: number; x: number; gapY: number; passed: boolean }[]>([]);
  const scoreRef = useRef(0);
  const nextIdRef = useRef(0);
  const activeRef = useRef(false);
  const awardedRef = useRef(false);

  const start = () => {
    birdRef.current = { y: FLAPPY_H / 2 - 20, vy: 0 };
    pipesRef.current = [];
    scoreRef.current = 0;
    nextIdRef.current = 0;
    awardedRef.current = false;
    setDisplayScore(0);
    setPhase('playing');
    activeRef.current = true;
    setRenderTick(t => t + 1);
  };

  const flap = () => {
    if (phase !== 'playing') return;
    birdRef.current.vy = -6.5;
  };

  const endGame = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    setPhase('over');
    if (!awardedRef.current) {
      awardedRef.current = true;
      onWin();
    }
  }, [onWin]);

  useEffect(() => {
    if (phase !== 'playing') return;

    let spawnTimer = 0;
    const loop = setInterval(() => {
      if (!activeRef.current) return;

      const bird = birdRef.current;
      bird.vy = Math.min(bird.vy + 0.38, 8);
      bird.y += bird.vy;

      spawnTimer += 1;
      if (spawnTimer >= 55) {
        spawnTimer = 0;
        const gapY = 50 + Math.random() * (FLAPPY_H - FLAPPY_GAP - 100);
        pipesRef.current.push({ id: nextIdRef.current++, x: FLAPPY_W + 10, gapY, passed: false });
      }

      pipesRef.current = pipesRef.current
        .map(p => {
          const x = p.x - 3.2;
          let passed = p.passed;
          if (!passed && x + FLAPPY_PIPE_W < FLAPPY_BIRD_X) {
            passed = true;
            scoreRef.current += 1;
            setDisplayScore(scoreRef.current);
          }
          return { ...p, x, passed };
        })
        .filter(p => p.x > -FLAPPY_PIPE_W - 10);

      const birdTop = bird.y;
      const birdBottom = bird.y + 28;
      const birdLeft = FLAPPY_BIRD_X;
      const birdRight = FLAPPY_BIRD_X + 32;

      if (birdBottom >= FLAPPY_H - 8 || birdTop <= 0) {
        endGame();
        return;
      }

      for (const p of pipesRef.current) {
        const pipeLeft = p.x;
        const pipeRight = p.x + FLAPPY_PIPE_W;
        const gapTop = p.gapY;
        const gapBottom = p.gapY + FLAPPY_GAP;

        const overlapX = birdRight > pipeLeft + 4 && birdLeft < pipeRight - 4;
        if (overlapX && (birdTop < gapTop || birdBottom > gapBottom)) {
          endGame();
          return;
        }
      }

      setRenderTick(t => t + 1);
    }, 1000 / 60);

    return () => clearInterval(loop);
  }, [phase, endGame]);

  void renderTick;

  const pipes = pipesRef.current;
  const birdY = birdRef.current.y;

  return (
    <div className="flex flex-col items-center gap-4">
      {phase === 'idle' && (
        <div className="text-center space-y-3">
          <div className="text-5xl animate-float">🐦</div>
          <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Tıkla ve uç! Borulardan kaç!</p>
          <button onClick={start} className="btn-primary px-8">Oyunu Başlat</button>
        </div>
      )}
      {phase === 'over' && (
        <div className="text-center space-y-3 flex flex-col items-center">
          <GameOutcomeSticker won={false} size={88} />
          <p style={{ fontWeight: 900, fontSize: 22, color: 'var(--text-dark)' }}>Skor: {displayScore}</p>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Kazanıldı: <span style={{ fontWeight: 900, color: '#f59e0b' }}>{displayScore * 10} puan</span></p>
          <button onClick={start} className="btn-primary px-8">Tekrar Oyna</button>
        </div>
      )}
      {phase === 'playing' && (
        <div className="w-full max-w-xs">
          <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 900, color: 'var(--text-dark)' }}>Skor: {displayScore}</div>
          <div
            role="button"
            tabIndex={0}
            onClick={flap}
            onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') flap(); }}
            style={{
              position: 'relative', width: FLAPPY_W, height: FLAPPY_H, maxWidth: '100%',
              margin: '0 auto',
              background: 'linear-gradient(180deg, #87CEEB 0%, #E0F4FF 70%, #90EE90 100%)',
              border: '3px solid var(--dark-border)',
              boxShadow: '5px 5px 0 var(--dark-border)',
              borderRadius: 18, overflow: 'hidden', cursor: 'pointer', userSelect: 'none',
            }}
          >
            {/* Clouds */}
            <div style={{ position: 'absolute', top: 24, left: 40, fontSize: 28, opacity: 0.7 }}>☁️</div>
            <div style={{ position: 'absolute', top: 48, right: 30, fontSize: 22, opacity: 0.5 }}>☁️</div>

            {/* Pipes */}
            {pipes.map(p => (
              <React.Fragment key={p.id}>
                <div style={{
                  position: 'absolute', left: p.x, top: 0, width: FLAPPY_PIPE_W, height: p.gapY,
                  background: 'linear-gradient(90deg, #16a34a, #22c55e)',
                  border: '3px solid #000', borderBottom: 'none',
                  boxShadow: 'inset -4px 0 0 rgba(0,0,0,0.15)',
                }}>
                  <div style={{ position: 'absolute', bottom: -8, left: -4, right: -4, height: 14, background: '#15803d', border: '3px solid #000', borderRadius: 4 }} />
                </div>
                <div style={{
                  position: 'absolute', left: p.x, top: p.gapY + FLAPPY_GAP, width: FLAPPY_PIPE_W,
                  height: FLAPPY_H - p.gapY - FLAPPY_GAP,
                  background: 'linear-gradient(90deg, #16a34a, #22c55e)',
                  border: '3px solid #000', borderTop: 'none',
                }}>
                  <div style={{ position: 'absolute', top: -8, left: -4, right: -4, height: 14, background: '#15803d', border: '3px solid #000', borderRadius: 4 }} />
                </div>
              </React.Fragment>
            ))}

            {/* Bird SVG */}
            <div style={{
              position: 'absolute', left: FLAPPY_BIRD_X, top: birdY,
              width: 36, height: 28, transform: `rotate(${Math.max(-25, Math.min(35, birdRef.current.vy * 3))}deg)`,
              transition: 'transform 0.08s',
            }}>
              <svg viewBox="0 0 36 28" width="36" height="28">
                <ellipse cx="16" cy="14" rx="14" ry="11" fill="#FFE500" stroke="#000" strokeWidth="2.5" />
                <circle cx="22" cy="10" r="3.5" fill="#fff" stroke="#000" strokeWidth="1.5" />
                <circle cx="23" cy="10" r="1.5" fill="#000" />
                <polygon points="28,12 36,14 28,16" fill="#FF6B00" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
                <ellipse cx="10" cy="18" rx="7" ry="4" fill="#f59e0b" stroke="#000" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Ground */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 28,
              background: 'linear-gradient(180deg, #84cc16, #65a30d)',
              borderTop: '3px solid #000',
            }} />
          </div>
          <p style={{ textAlign: 'center', marginTop: 8, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Uçmak için tıkla</p>
        </div>
      )}
    </div>
  );
};

// --- Snake Game (canvas + cached background) ---
const SNAKE_GRID = 15;
const SNAKE_CELL = 18;
const SNAKE_TICK_MS = 160;
const SNAKE_BOARD = SNAKE_GRID * SNAKE_CELL;

let snakeBgCanvas: HTMLCanvasElement | null = null;

function getSnakeBgCanvas(): HTMLCanvasElement {
  if (snakeBgCanvas) return snakeBgCanvas;
  const canvas = document.createElement('canvas');
  canvas.width = SNAKE_BOARD;
  canvas.height = SNAKE_BOARD;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const bg = ctx.createRadialGradient(SNAKE_BOARD * 0.3, SNAKE_BOARD * 0.3, 0, SNAKE_BOARD * 0.5, SNAKE_BOARD * 0.5, SNAKE_BOARD * 0.7);
  bg.addColorStop(0, '#1a3a2a');
  bg.addColorStop(1, '#0c1a12');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SNAKE_BOARD, SNAKE_BOARD);

  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let y = 0; y < SNAKE_GRID; y += 1) {
    for (let x = 0; x < SNAKE_GRID; x += 1) {
      ctx.fillRect(x * SNAKE_CELL + SNAKE_CELL / 2 - 1, y * SNAKE_CELL + SNAKE_CELL / 2 - 1, 2, 2);
    }
  }

  snakeBgCanvas = canvas;
  return canvas;
}

function randomFood(snake: [number, number][]): [number, number] {
  let pos: [number, number];
  do {
    pos = [Math.floor(Math.random() * SNAKE_GRID), Math.floor(Math.random() * SNAKE_GRID)];
  } while (snake.some(s => s[0] === pos[0] && s[1] === pos[1]));
  return pos;
}

type SnakeGameState = {
  snake: [number, number][];
  food: [number, number];
  dir: [number, number];
  nextDir: [number, number];
  score: number;
  awarded: boolean;
};

function drawSnakeBoard(ctx: CanvasRenderingContext2D, g: SnakeGameState) {
  ctx.drawImage(getSnakeBgCanvas(), 0, 0);

  const fx = g.food[0] * SNAKE_CELL + SNAKE_CELL / 2;
  const fy = g.food[1] * SNAKE_CELL + SNAKE_CELL / 2;
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(fx, fy, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#166534';
  ctx.beginPath();
  ctx.arc(fx - 2, fy - 3, 2, 0, Math.PI * 2);
  ctx.fill();

  for (let i = g.snake.length - 1; i >= 0; i -= 1) {
    const seg = g.snake[i];
    const isHead = i === 0;
    const pad = isHead ? 1 : 2;
    const size = SNAKE_CELL - pad * 2;
    const x = seg[0] * SNAKE_CELL + pad;
    const y = seg[1] * SNAKE_CELL + pad;

    ctx.fillStyle = isHead ? '#22c55e' : i % 2 ? '#15803d' : '#16a34a';
    ctx.fillRect(x, y, size, size);

    if (isHead) {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const ex = g.dir[0] * 3;
      const ey = g.dir[1] * 3;
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx + ex - 4, cy + ey - 2, 3, 3);
      ctx.fillRect(cx + ex + 1, cy + ey - 2, 3, 3);
    }
  }
}

const SnakeGame: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const gameRef = useRef<SnakeGameState>({
    snake: [[7, 7], [6, 7], [5, 7]],
    food: [10, 7],
    dir: [1, 0],
    nextDir: [1, 0],
    score: 0,
    awarded: false,
  });

  const changeDirection = useCallback((dir: [number, number]) => {
    const cur = gameRef.current.dir;
    if (dir[0] !== 0 && cur[0] === 0) gameRef.current.nextDir = dir;
    if (dir[1] !== 0 && cur[1] === 0) gameRef.current.nextDir = dir;
  }, []);

  const start = useCallback(() => {
    const initial: [number, number][] = [[7, 7], [6, 7], [5, 7]];
    gameRef.current = {
      snake: initial,
      food: randomFood(initial),
      dir: [1, 0],
      nextDir: [1, 0],
      score: 0,
      awarded: false,
    };
    setScore(0);
    setPhase('playing');
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp')    changeDirection([0, -1]);
      if (e.key === 'ArrowDown')  changeDirection([0, 1]);
      if (e.key === 'ArrowLeft')  changeDirection([-1, 0]);
      if (e.key === 'ArrowRight') changeDirection([1, 0]);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, changeDirection]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    drawSnakeBoard(ctx, gameRef.current);

    const id = window.setInterval(() => {
      const g = gameRef.current;
      g.dir = g.nextDir;
      const dir = g.dir;
      const head: [number, number] = [g.snake[0][0] + dir[0], g.snake[0][1] + dir[1]];

      if (head[0] < 0 || head[0] >= SNAKE_GRID || head[1] < 0 || head[1] >= SNAKE_GRID) {
        window.clearInterval(id);
        setPhase('over');
        return;
      }
      if (g.snake.some(s => s[0] === head[0] && s[1] === head[1])) {
        window.clearInterval(id);
        setPhase('over');
        return;
      }

      let next = [head, ...g.snake] as [number, number][];
      if (head[0] === g.food[0] && head[1] === g.food[1]) {
        g.food = randomFood(next);
        g.score += 1;
        setScore(g.score);
      } else {
        next = next.slice(0, -1);
      }
      g.snake = next;
      drawSnakeBoard(ctx, g);
    }, SNAKE_TICK_MS);

    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === 'over' && !gameRef.current.awarded) {
      gameRef.current.awarded = true;
      onWin();
    }
  }, [phase, onWin]);

  const boardSize = SNAKE_BOARD;

  return (
    <div className="flex flex-col items-center gap-4">
      {phase === 'idle' && (
        <div className="text-center space-y-3">
          <div className="text-5xl animate-float">🐍</div>
          <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Elmayı ye, büyü, duvara çarpma!</p>
          <button onClick={start} className="btn-primary px-8">Oyunu Başlat</button>
        </div>
      )}
      {phase === 'over' && (
        <div className="text-center space-y-3 flex flex-col items-center">
          <GameOutcomeSticker won={false} size={88} />
          <p style={{ fontWeight: 900, fontSize: 22, color: 'var(--text-dark)' }}>Skor: {score}</p>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Kazanıldı: <span style={{ fontWeight: 900, color: '#f59e0b' }}>{score * 15} puan</span></p>
          <button onClick={start} className="btn-primary px-8">Tekrar Oyna</button>
        </div>
      )}
      {phase === 'playing' && (
        <div className="w-full max-w-xs space-y-4">
          <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 900, color: 'var(--text-dark)' }}>Skor: {score}</div>
          <canvas
            ref={canvasRef}
            width={boardSize}
            height={boardSize}
            style={{
              display: 'block',
              margin: '0 auto',
              borderRadius: 18,
              border: '3px solid var(--dark-border)',
              boxShadow: '4px 4px 0 var(--dark-border)',
            }}
          />

          {/* Touch controls */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <button type="button" onClick={() => changeDirection([0, -1])} style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', fontSize: 22, fontWeight: 900, cursor: 'pointer' }}>▲</button>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" onClick={() => changeDirection([-1, 0])} style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', fontSize: 22, fontWeight: 900, cursor: 'pointer' }}>◀</button>
              <button type="button" onClick={() => changeDirection([0, 1])} style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', fontSize: 22, fontWeight: 900, cursor: 'pointer' }}>▼</button>
              <button type="button" onClick={() => changeDirection([1, 0])} style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', fontSize: 22, fontWeight: 900, cursor: 'pointer' }}>▶</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const gamesList = [
  { id: 'spin',   label: 'Spin Wheel',  emoji: '🎰', desc: 'Spin to win up to 200 pts',   points: '5-200', color: '#7B6EF6' },
  { id: 'memory', label: 'Memory Game', emoji: '🧩', desc: 'Match pairs to win',          points: '50-200', color: '#22c55e' },
  { id: 'catch',  label: 'Catch Game',  emoji: '🎁', desc: 'Catch gifts, avoid bombs',    points: '0-100', color: '#ef4444' },
  { id: 'flappy', label: 'Flappy Bird', emoji: '🐦', desc: 'Tap to fly through pipes',    points: '0-100', color: '#06b6d4' },
  { id: 'snake',  label: 'Snake',       emoji: '🐍', desc: 'Eat apples and grow longer',  points: '0-150', color: '#22c55e' },
];

const MiniGames: React.FC = () => {
  const { earnReward, showRewardPopup } = useApp();
  const { authUser } = useAuth();
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const handleWin = (gameId: string) => {
    if (!authUser?.id) return;
    void earnReward('game_win', { referenceId: gameId }).then(result => {
      if (result && result.points > 0) {
        showRewardPopup({ type: 'reward', title: 'Points Earned!', subtitle: 'Great job playing the game!', points: result.points });
      }
    });
  };

  const cardStyle = {
    background: 'var(--card-bg)',
    border: '3px solid var(--dark-border)',
    boxShadow: '0px 6px 0px var(--dark-border)',
    borderRadius: 20,
  };

  if (activeGame) {
    const game = gamesList.find(g => g.id === activeGame)!;
    return (
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
          <div style={{ position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)', fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)', opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em' }}>OYUN</div>
        </div>
        <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setActiveGame(null)}
              style={{ ...cardStyle, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 0 var(--dark-border)', padding: 0 }}
            >
              <X size={18} color="var(--text-dark)" />
            </button>
            <div>
              <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 22, margin: 0, lineHeight: 1 }}>{game.emoji} {game.label}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>En fazla {game.points} puan kazan</p>
            </div>
          </div>
          <div style={{ ...cardStyle, padding: 24 }}>
            {activeGame === 'spin' && <SpinWheel onWin={() => handleWin('spin')} />}
            {activeGame === 'memory' && <MemoryGame onWin={() => handleWin('memory')} />}
            {activeGame === 'catch' && <CatchGame onWin={() => handleWin('catch')} />}
            {activeGame === 'flappy' && <FlappyGame onWin={() => handleWin('flappy')} />}
            {activeGame === 'snake' && <SnakeGame onWin={() => handleWin('snake')} />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{ position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)', fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)', opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em' }}>MİNİ OYUN</div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: 'linear-gradient(180deg,#4ade80,#16a34a)', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🎮</div>
          <div>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>Mini Oyunlar</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>Oyna, eğlen, puan kazan</p>
          </div>
        </div>

        {/* Hero banner (sticker) */}
        <StickerHero
          page="games"
          bg="linear-gradient(135deg,#22c55e,#16a34a)"
          badge="🎮 MİNİ OYUNLAR"
          title="Oyna & Kazan"
          highlight="Her oyun puan kazandırır!"
          accentSeed="games-hero-accent"
        />

        {/* Game list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {gamesList.map((game, index) => (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.id)}
              style={{
                ...cardStyle, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer', textAlign: 'left', transition: 'transform 0.1s, box-shadow 0.1s',
                animation: `gameSlideIn 0.3s ease-out ${index * 0.04}s both`,
                position: 'relative', overflow: 'visible',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 0 var(--dark-border)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 0 var(--dark-border)'; }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 var(--dark-border)'; }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 0 var(--dark-border)'; }}
            >
              <StickerAccent seed={`game-card-${game.id}`} size={24} rotate={-10 + index * 5} style={{ position: 'absolute', top: -6, right: 10 }} />
              <div style={{
                width: 60, height: 60, borderRadius: 16, flexShrink: 0,
                overflow: 'hidden', position: 'relative',
                border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)',
                background: game.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28,
              }}>
                {game.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 3px' }}>{game.label}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{game.desc}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                  <Star size={13} fill="#f59e0b" color="#f59e0b" />
                  <span style={{ fontWeight: 900, fontSize: 14, color: '#f59e0b' }}>{game.points}</span>
                </div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '1px 0 0', fontWeight: 600 }}>puan</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes gameSlideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default MiniGames;
