import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Gamepad2, Star, Trophy, X, RotateCcw, Play, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../lib/tr';

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

const SpinWheel: React.FC<{ onWin: (pts: number) => void }> = ({ onWin }) => {
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
      if (wheelSegments[segIdx].value > 0) onWin(wheelSegments[segIdx].value);
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
        <div className={`text-center p-4 rounded-2xl border-2 ${result > 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}>
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
const MemoryGame: React.FC<{ onWin: (pts: number) => void }> = ({ onWin }) => {
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
            onWin(pts);
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
      {won && <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 text-center w-full max-w-xs">
        <p className="font-black text-green-600 dark:text-green-400">You Won! ({moves} moves)</p>
      </div>}
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

// --- Quiz Game ---
const quizQuestions = [
  { q: 'How many points for a daily login?', options: ['5', '10', '20', '50'], answer: 2 },
  { q: 'What level is "Champion"?', options: ['4', '6', '8', '10'], answer: 1 },
  { q: 'Which feature earns the most points per scan?', options: ['Daily login', 'QR Code', 'Profile update', 'Browse shop'], answer: 1 },
  { q: 'How many days for the "Week Warrior" streak?', options: ['3', '5', '7', '14'], answer: 2 },
  { q: 'What rarity is the "Legend" achievement?', options: ['Common', 'Rare', 'Epic', 'Legendary'], answer: 3 },
];

const QuizGame: React.FC<{ onWin: (pts: number) => void }> = ({ onWin }) => {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [answered, setAnswered] = useState(false);

  const reset = () => { setQIdx(0); setSelected(null); setScore(0); setDone(false); setAnswered(false); };

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = idx === quizQuestions[qIdx].answer;
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      if (qIdx + 1 >= quizQuestions.length) {
        setDone(true);
        const pts = (score + (correct ? 1 : 0)) * 25;
        onWin(pts);
      } else {
        setQIdx(q => q + 1);
        setSelected(null);
        setAnswered(false);
      }
    }, 1000);
  };

  const q = quizQuestions[qIdx];

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      {done ? (
        <div className="text-center space-y-4">
          <div className="text-5xl">🧠</div>
          <h3 className="font-black text-2xl text-gray-900 dark:text-white">{score}/{quizQuestions.length} Correct!</h3>
          <p className="text-gray-500">You earned <span className="font-black text-amber-500">{score * 25} points</span></p>
          <button onClick={reset} className="btn-primary px-8">Play Again</button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-500">Q {qIdx + 1}/{quizQuestions.length}</span>
            <span className="badge bg-[#7B6EF6]/10 dark:bg-[#4F8EF7]/20 text-[#7B6EF6] dark:text-[#4F8EF7]">Score: {score}</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
            <div className="h-full bg-[#7B6EF6] dark:bg-[#4F8EF7] rounded-full transition-all" style={{ width: `${(qIdx / quizQuestions.length) * 100}%` }} />
          </div>
          <div className="card p-4">
            <p className="font-bold text-gray-900 dark:text-white">{q.q}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className={`p-3 rounded-2xl border-2 font-medium text-sm transition-all ${
                  !answered ? 'bg-white dark:bg-gray-800 border-black dark:border-gray-600 hover:bg-[#7B6EF6]/10 dark:hover:bg-[#4F8EF7]/20'
                  : i === q.answer ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300'
                  : i === selected && selected !== q.answer ? 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// --- Cup Catch Game ---
type FallingItem = { id: number; x: number; y: number; type: 'gift' | 'star' | 'bomb' };

const CatchGame: React.FC<{ onWin: (pts: number) => void }> = ({ onWin }) => {
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
        onWin(Math.max(0, scoreRef.current) * 5);
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
        <div className="text-center space-y-3">
          <div className="text-5xl">🏆</div>
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

// --- Flappy Bird Style Game ---
const FlappyGame: React.FC<{ onWin: (pts: number) => void }> = ({ onWin }) => {
  const [active, setActive] = useState(false);
  const [birdY, setBirdY] = useState(150);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [pipes, setPipes] = useState<{ id: number; x: number; gapY: number }[]>([]);
  const nextId = useRef(0);

  const start = () => {
    setBirdY(150);
    setScore(0);
    setGameOver(false);
    setPipes([]);
    setActive(true);
    nextId.current = 0;
  };

  useEffect(() => {
    if (!active || gameOver) return;

    // Gravity
    const gravityInterval = setInterval(() => {
      setBirdY(prev => Math.min(280, prev + 5));
    }, 50);

    // Pipe generation
    const pipeInterval = setInterval(() => {
      const gapY = Math.random() * 120 + 40;
      setPipes(prev => [...prev, { id: nextId.current++, x: 400, gapY }]);
    }, 2500);

    // Pipe movement
    const moveInterval = setInterval(() => {
      setPipes(prev => {
        const updated = prev
          .map(p => ({ ...p, x: p.x - 6 }))
          .filter(p => p.x > -40);

        updated.forEach(p => {
          if (p.x === 0) setScore(s => s + 1);
          if (p.x < 50 && p.x > -40) {
            if (birdY < p.gapY || birdY > p.gapY + 80) {
              setGameOver(true);
              setActive(false);
            }
          }
        });
        if (birdY > 280) {
          setGameOver(true);
          setActive(false);
        }
        return updated;
      });
    }, 40);

    return () => {
      clearInterval(gravityInterval);
      clearInterval(pipeInterval);
      clearInterval(moveInterval);
    };
  }, [active, gameOver, birdY]);

  useEffect(() => {
    if (gameOver) onWin(score * 10);
  }, [gameOver, score, onWin]);

  const flap = () => setBirdY(prev => Math.max(0, prev - 60));

  return (
    <div className="flex flex-col items-center gap-4">
      {!active && !gameOver && (
        <div className="text-center space-y-3">
          <div className="text-5xl animate-float">🐦</div>
          <p className="font-bold text-gray-700 dark:text-gray-300">Tap to fly! Avoid pipes!</p>
          <button onClick={start} className="btn-primary px-8">Start Game</button>
        </div>
      )}
      {gameOver && (
        <div className="text-center space-y-3">
          <div className="text-5xl">💥</div>
          <p className="font-black text-2xl text-gray-900 dark:text-white">Score: {score}</p>
          <p className="text-gray-500">Earned <span className="font-black text-amber-500">{score * 10} points</span></p>
          <button onClick={start} className="btn-primary px-8">Play Again</button>
        </div>
      )}
      {active && (
        <div className="w-full max-w-xs">
          <div className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">Score: {score}</div>
          <button
            onClick={flap}
            className="relative w-full h-80 bg-gradient-to-b from-sky-200 to-sky-100 dark:from-sky-900/30 dark:to-sky-800/20 rounded-3xl border-2 border-black dark:border-gray-600 overflow-hidden"
          >
            {/* Bird */}
            <div
              className="absolute left-8 text-3xl transition-all"
              style={{ top: `${birdY}px` }}
            >
              🐦
            </div>

            {/* Pipes */}
            {pipes.map(pipe => (
              <div key={pipe.id} className="absolute top-0 w-12 bg-green-500 border-2 border-green-700" style={{ left: `${pipe.x}px`, height: `${pipe.gapY}px` }} />
            ))}
            {pipes.map(pipe => (
              <div key={`bottom-${pipe.id}`} className="absolute bottom-0 w-12 bg-green-500 border-2 border-green-700" style={{ left: `${pipe.x}px`, height: `${280 - pipe.gapY - 80}px` }} />
            ))}
          </button>
        </div>
      )}
    </div>
  );
};

// --- Snake Game ---
const SnakeGame: React.FC<{ onWin: (pts: number) => void }> = ({ onWin }) => {
  const [active, setActive] = useState(false);
  const [snake, setSnake] = useState<[number, number][]>([[5, 5]]);
  const [food, setFood] = useState<[number, number]>([10, 10]);
  const [direction, setDirection] = useState<[number, number]>([1, 0]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const dirRef = useRef<[number, number]>([1, 0]);

  const start = () => {
    setSnake([[5, 5]]);
    setFood([10, 10]);
    setDirection([1, 0]);
    setScore(0);
    setGameOver(false);
    setActive(true);
    dirRef.current = [1, 0];
  };

  const changeDirection = (dir: [number, number]) => {
    if (dir[0] !== 0 && dirRef.current[0] === 0) dirRef.current = dir;
    if (dir[1] !== 0 && dirRef.current[1] === 0) dirRef.current = dir;
  };

  useEffect(() => {
    if (!active || gameOver) return;
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && dirRef.current[1] === 0) { dirRef.current = [0, -1]; e.preventDefault(); }
      if (e.key === 'ArrowDown' && dirRef.current[1] === 0) { dirRef.current = [0, 1]; e.preventDefault(); }
      if (e.key === 'ArrowLeft' && dirRef.current[0] === 0) { dirRef.current = [-1, 0]; e.preventDefault(); }
      if (e.key === 'ArrowRight' && dirRef.current[0] === 0) { dirRef.current = [1, 0]; e.preventDefault(); }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [active, gameOver]);

  useEffect(() => {
    if (!active || gameOver) return;
    const interval = setInterval(() => {
      setSnake(prev => {
        const head: [number, number] = [prev[0][0] + dirRef.current[0], prev[0][1] + dirRef.current[1]];
        if (head[0] < 0 || head[0] >= 15 || head[1] < 0 || head[1] >= 15 || prev.some(s => s[0] === head[0] && s[1] === head[1])) {
          setGameOver(true);
          setActive(false);
          return prev;
        }
        let newSnake = [head, ...prev];
        if (head[0] === food[0] && head[1] === food[1]) {
          setFood([Math.floor(Math.random() * 15), Math.floor(Math.random() * 15)]);
          setScore(s => s + 1);
        } else {
          newSnake = newSnake.slice(0, -1);
        }
        return newSnake;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [active, gameOver, food]);

  useEffect(() => {
    if (gameOver) onWin(score * 15);
  }, [gameOver, score, onWin]);

  return (
    <div className="flex flex-col items-center gap-4">
      {!active && !gameOver && (
        <div className="text-center space-y-3">
          <div className="text-5xl animate-float">🐍</div>
          <p className="font-bold text-gray-700 dark:text-gray-300">Use arrow keys or buttons to move</p>
          <button onClick={start} className="btn-primary px-8">Start Game</button>
        </div>
      )}
      {gameOver && (
        <div className="text-center space-y-3">
          <div className="text-5xl">💀</div>
          <p className="font-black text-2xl text-gray-900 dark:text-white">Score: {score}</p>
          <p className="text-gray-500">Earned <span className="font-black text-amber-500">{score * 15} points</span></p>
          <button onClick={start} className="btn-primary px-8">Play Again</button>
        </div>
      )}
      {active && (
        <div className="w-full max-w-xs space-y-4">
          <div className="text-center text-sm font-bold text-gray-700 dark:text-gray-300">Score: {score}</div>
          <div className="grid gap-0.5 bg-gray-800 p-2 rounded-2xl border-2 border-black dark:border-gray-600 mx-auto" style={{ gridTemplateColumns: 'repeat(15, 1fr)', maxWidth: '240px' }}>
            {Array.from({ length: 15 * 15 }).map((_, i) => {
              const x = i % 15;
              const y = Math.floor(i / 15);
              const isSnake = snake.some(s => s[0] === x && s[1] === y);
              const isFood = food[0] === x && food[1] === y;
              const isHead = snake[0][0] === x && snake[0][1] === y;
              return (
                <div
                  key={i}
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm transition-colors ${
                    isHead ? 'bg-green-400' : isSnake ? 'bg-green-500' : isFood ? 'bg-red-500' : 'bg-gray-700'
                  }`}
                />
              );
            })}
          </div>

          {/* Touch Controls for Mobile */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => changeDirection([0, -1])}
              className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-700 border-2 border-black dark:border-gray-600 flex items-center justify-center text-2xl font-bold active:scale-95 hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform"
            >
              ⬆️
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => changeDirection([-1, 0])}
                className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-700 border-2 border-black dark:border-gray-600 flex items-center justify-center text-2xl font-bold active:scale-95 hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform"
              >
                ⬅️
              </button>
              <button
                onClick={() => changeDirection([0, 1])}
                className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-700 border-2 border-black dark:border-gray-600 flex items-center justify-center text-2xl font-bold active:scale-95 hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform"
              >
                ⬇️
              </button>
              <button
                onClick={() => changeDirection([1, 0])}
                className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-700 border-2 border-black dark:border-gray-600 flex items-center justify-center text-2xl font-bold active:scale-95 hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform"
              >
                ➡️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Tap Rhythm Game ---
const TapRhythmGame: React.FC<{ onWin: (pts: number) => void }> = ({ onWin }) => {
  const [active, setActive] = useState(false);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [finished, setFinished] = useState(false);
  const [targetY, setTargetY] = useState(250);
  const [timeLeft, setTimeLeft] = useState(15);

  const start = () => {
    setHits(0);
    setMisses(0);
    setFinished(false);
    setTimeLeft(15);
    setActive(true);
  };

  useEffect(() => {
    if (!active) return;
    const targetInterval = setInterval(() => {
      setTargetY(prev => prev - 15);
    }, 50);

    const checkInterval = setInterval(() => {
      setTargetY(prev => {
        if (prev < 0) {
          setMisses(m => m + 1);
          return 250;
        }
        return prev;
      });
    }, 100);

    const timerInterval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setActive(false);
          setFinished(true);
          clearInterval(targetInterval);
          clearInterval(checkInterval);
          clearInterval(timerInterval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(targetInterval);
      clearInterval(checkInterval);
      clearInterval(timerInterval);
    };
  }, [active]);

  useEffect(() => {
    if (finished) onWin(Math.max(0, (hits - misses) * 8));
  }, [finished, hits, misses, onWin]);

  const tap = () => {
    if (targetY > 120 && targetY < 160) {
      setHits(h => h + 1);
      setTargetY(250);
    } else {
      setMisses(m => m + 1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!active && !finished && (
        <div className="text-center space-y-3">
          <div className="text-5xl animate-float">🎵</div>
          <p className="font-bold text-gray-700 dark:text-gray-300">Tap when the circle hits the line!</p>
          <button onClick={start} className="btn-primary px-8">Start Game</button>
        </div>
      )}
      {finished && (
        <div className="text-center space-y-3">
          <div className="text-5xl">🎶</div>
          <p className="font-black text-2xl text-gray-900 dark:text-white">{hits} Hits!</p>
          <p className="text-gray-500">Earned <span className="font-black text-amber-500">{Math.max(0, (hits - misses) * 8)} points</span></p>
          <button onClick={start} className="btn-primary px-8">Play Again</button>
        </div>
      )}
      {active && (
        <div className="w-full max-w-xs">
          <div className="flex justify-between mb-2 text-sm font-bold">
            <span>Hits: {hits}</span>
            <span className={timeLeft <= 5 ? 'text-red-500 animate-pulse' : ''}>{timeLeft}s</span>
          </div>
          <button
            onClick={tap}
            className="relative w-full bg-gradient-to-b from-purple-200 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-3xl border-2 border-black dark:border-gray-600 overflow-hidden"
            style={{ height: '280px' }}
          >
            {/* Target circle */}
            <div
              className="absolute left-1/2 w-12 h-12 -translate-x-1/2 bg-blue-500 rounded-full transition-all"
              style={{ top: `${targetY}px` }}
            />
            {/* Hit line */}
            <div className="absolute left-0 right-0 h-1 bg-green-400 border-t-2 border-b-2 border-green-600" style={{ top: '140px' }} />
          </button>
        </div>
      )}
    </div>
  );
};

// --- Color Match Game ---
const ColorMatchGame: React.FC<{ onWin: (pts: number) => void }> = ({ onWin }) => {
  const [active, setActive] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [correctColor, setCorrectColor] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const colorNames = ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠'];
  const colorValues = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7', '#f97316'];

  const generateRound = (lvl: number) => {
    const count = Math.min(3 + Math.floor(lvl / 2), 6);
    const shuffled = [...colorValues].sort(() => Math.random() - 0.5).slice(0, count);
    const correct = shuffled[Math.floor(Math.random() * shuffled.length)];
    setCorrectColor(correct);
    setColors(shuffled.sort(() => Math.random() - 0.5));
  };

  const start = () => {
    setScore(0);
    setLevel(1);
    setFinished(false);
    setActive(true);
    generateRound(1);
  };

  useEffect(() => {
    if (level > 10) {
      setActive(false);
      setFinished(true);
    }
  }, [level]);

  useEffect(() => {
    if (finished) onWin(score * 12);
  }, [finished, score, onWin]);

  const selectColor = (color: string) => {
    if (color === correctColor) {
      setScore(s => s + 1);
      if (level < 10) {
        setLevel(l => l + 1);
        generateRound(level + 1);
      }
    } else {
      setFinished(true);
      setActive(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!active && !finished && (
        <div className="text-center space-y-3">
          <div className="text-5xl animate-float">🎨</div>
          <p className="font-bold text-gray-700 dark:text-gray-300">Match the color!</p>
          <button onClick={start} className="btn-primary px-8">Start Game</button>
        </div>
      )}
      {finished && (
        <div className="text-center space-y-3">
          <div className="text-5xl">✨</div>
          <p className="font-black text-2xl text-gray-900 dark:text-white">Score: {score}</p>
          <p className="text-gray-500">Earned <span className="font-black text-amber-500">{score * 12} points</span></p>
          <button onClick={start} className="btn-primary px-8">Play Again</button>
        </div>
      )}
      {active && (
        <div className="w-full max-w-xs space-y-4">
          <div className="flex justify-between text-sm font-bold">
            <span>Level: {level}</span>
            <span>Score: {score}</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
            <div className="h-full bg-[#7B6EF6] dark:bg-[#4F8EF7] rounded-full" style={{ width: `${(level / 10) * 100}%` }} />
          </div>
          <div className="p-4 rounded-2xl border-2 border-black dark:border-gray-600 text-center">
            <p className="font-bold text-gray-600 dark:text-gray-400 mb-3">Match this color:</p>
            <div className="w-20 h-20 mx-auto rounded-2xl border-4 border-black" style={{ backgroundColor: correctColor }} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {colors.map((color, i) => (
              <button
                key={i}
                onClick={() => selectColor(color)}
                className="aspect-square rounded-2xl border-2 border-black dark:border-gray-600 hover:scale-110 transition-transform active:scale-95 shadow-md"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Daily Challenge ---
const DailyChallenge: React.FC<{ onWin: (pts: number) => void }> = ({ onWin }) => {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const challenge = { q: 'How many days make up a "Week Warrior" streak?', a: '7' };

  const submit = () => {
    setSubmitted(true);
    const ok = answer.trim() === challenge.a;
    setCorrect(ok);
    if (ok) onWin(150);
  };

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      <div className="card p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-amber-500" />
          <span className="font-bold text-amber-700 dark:text-amber-400">Daily Challenge</span>
        </div>
        <p className="font-bold text-gray-900 dark:text-white">{challenge.q}</p>
      </div>
      <input
        type="text"
        placeholder="Your answer..."
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        disabled={submitted}
        className="input-field"
      />
      {!submitted ? (
        <button onClick={submit} disabled={!answer} className="btn-primary w-full disabled:opacity-50">Submit Answer</button>
      ) : (
        <div className={`p-4 rounded-2xl border-2 text-center ${correct ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'}`}>
          {correct ? (
            <p className="font-black text-green-600 dark:text-green-400">Correct! +150 Points!</p>
          ) : (
            <p className="font-black text-red-600 dark:text-red-400">Wrong! Answer: {challenge.a}</p>
          )}
        </div>
      )}
    </div>
  );
};

const gamesList = [
  { id: 'spin',   label: 'Spin Wheel',       emoji: '🎰', desc: 'Spin to win up to 200 pts',     points: '5-200',  img: 'https://picsum.photos/seed/spinw77/120/120',   color: '#7B6EF6' },
  { id: 'memory', label: 'Memory Game',       emoji: '🧩', desc: 'Match pairs to win',             points: '50-200', img: 'https://picsum.photos/seed/memgm77/120/120',   color: '#22c55e' },
  { id: 'quiz',   label: 'Quiz',              emoji: '🧠', desc: 'Answer 5 questions',             points: '0-125',  img: 'https://picsum.photos/seed/quizz77/120/120',   color: '#f59e0b' },
  { id: 'catch',  label: 'Catch Game',        emoji: '🎁', desc: 'Catch gifts, avoid bombs',       points: '0-100',  img: 'https://picsum.photos/seed/catchg77/120/120',  color: '#ef4444' },
  { id: 'flappy', label: 'Flappy Bird',       emoji: '🐦', desc: 'Tap to fly through pipes',       points: '0-100',  img: 'https://picsum.photos/seed/flppy77/120/120',   color: '#06b6d4' },
  { id: 'snake',  label: 'Snake',             emoji: '🐍', desc: 'Arrow keys to move',             points: '0-150',  img: 'https://picsum.photos/seed/snakk77/120/120',   color: '#22c55e' },
  { id: 'rhythm', label: 'Tap Rhythm',        emoji: '🎵', desc: 'Tap when circle hits line',      points: '0-120',  img: 'https://picsum.photos/seed/rhyth77/120/120',   color: '#ec4899' },
  { id: 'color',  label: 'Color Match',       emoji: '🎨', desc: '10 levels of color matching',    points: '0-120',  img: 'https://picsum.photos/seed/colorr77/120/120',  color: '#8b5cf6' },
  { id: 'daily',  label: 'Daily Challenge',   emoji: '⚡', desc: 'One question, big reward',       points: '150',    img: 'https://picsum.photos/seed/daylch77/120/120',  color: '#f59e0b' },
];

const MiniGames: React.FC = () => {
  const { addPoints, showRewardPopup } = useApp();
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const handleWin = (pts: number) => {
    if (pts > 0) {
      addPoints(pts);
      showRewardPopup({ type: 'reward', title: 'Points Earned!', subtitle: 'Great job playing the game!', points: pts });
    }
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
            {activeGame === 'spin' && <SpinWheel onWin={handleWin} />}
            {activeGame === 'memory' && <MemoryGame onWin={handleWin} />}
            {activeGame === 'quiz' && <QuizGame onWin={handleWin} />}
            {activeGame === 'catch' && <CatchGame onWin={handleWin} />}
            {activeGame === 'flappy' && <FlappyGame onWin={handleWin} />}
            {activeGame === 'snake' && <SnakeGame onWin={handleWin} />}
            {activeGame === 'rhythm' && <TapRhythmGame onWin={handleWin} />}
            {activeGame === 'color' && <ColorMatchGame onWin={handleWin} />}
            {activeGame === 'daily' && <DailyChallenge onWin={handleWin} />}
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

        {/* Hero illustration banner */}
        <div style={{ ...cardStyle, overflow: 'hidden', position: 'relative', height: 140 }}>
          <img
            src="https://picsum.photos/seed/gamehero55/900/280"
            alt="Mini Games"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.5) saturate(1.2)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(34,197,94,0.88) 0%, rgba(22,163,74,0.2) 70%)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 18, transform: 'translateY(-50%)' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 7,
              background: '#FFE500', color: '#000', borderRadius: 999, padding: '2px 9px', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em',
            }}>🎮 MİNİ OYUNLAR</div>
            <h2 style={{ fontWeight: 900, fontSize: 'clamp(16px,3vw,22px)', margin: '0 0 4px', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Oyna & Kazan</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, margin: 0, fontWeight: 600 }}>Her oyun gerçek puan kazandırır!</p>
          </div>
          <div style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(48px,9vw,68px)', opacity: 0.9, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>🕹️</div>
        </div>

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
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 0 var(--dark-border)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 0 var(--dark-border)'; }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 var(--dark-border)'; }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 0 var(--dark-border)'; }}
            >
              <div style={{
                width: 60, height: 60, borderRadius: 16, flexShrink: 0,
                overflow: 'hidden', position: 'relative',
                border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)',
              }}>
                <img src={game.img} alt={game.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.65) saturate(1.2)' }} />
                <div style={{ position: 'absolute', inset: 0, background: `${game.color}55` }} />
                <div style={{ position: 'absolute', bottom: 1, right: 2, fontSize: 20, lineHeight: 1, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}>{game.emoji}</div>
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
