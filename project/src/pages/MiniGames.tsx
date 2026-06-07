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

// --- Catch Game (FIXED) ---
const CatchGame: React.FC<{ onWin: (pts: number) => void }> = ({ onWin }) => {
  const [active, setActive] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [items, setItems] = useState<{ id: number; x: number; y: number; type: string }[]>([]);
  const [finished, setFinished] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  const start = () => {
    setScore(0);
    setTimeLeft(15);
    setItems([]);
    setFinished(false);
    setActive(true);
    nextId.current = 0;
  };

  useEffect(() => {
    if (!active) return;

    // Create new items every 600ms
    const itemInterval = setInterval(() => {
      setItems(prev => {
        const newItem = {
          id: nextId.current++,
          x: Math.random() * 85 + 7.5,
          y: -8,
          type: Math.random() > 0.8 ? '💣' : Math.random() > 0.5 ? '⭐' : '🎁',
        };
        return [...prev.slice(-8), newItem];
      });
    }, 600);

    // Move items down every 40ms (smooth animation)
    const moveInterval = setInterval(() => {
      setItems(prev =>
        prev
          .map(item => ({ ...item, y: item.y + 2.5 }))
          .filter(item => item.y <= 110)
      );
    }, 40);

    // Timer countdown
    const timerInterval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setActive(false);
          setFinished(true);
          clearInterval(itemInterval);
          clearInterval(moveInterval);
          clearInterval(timerInterval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(itemInterval);
      clearInterval(moveInterval);
      clearInterval(timerInterval);
    };
  }, [active]);

  useEffect(() => {
    if (finished) onWin(Math.max(0, score * 5));
  }, [finished, score, onWin]);

  const catchItem = (id: number, type: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    if (type === '💣') setScore(s => Math.max(0, s - 2));
    else setScore(s => s + (type === '⭐' ? 2 : 1));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!active && !finished && (
        <div className="text-center space-y-3">
          <div className="text-5xl animate-float">🎁</div>
          <p className="font-bold text-gray-700 dark:text-gray-300">Catch gifts, avoid bombs!</p>
          <button onClick={start} className="btn-primary px-8">Start Game</button>
        </div>
      )}
      {finished && (
        <div className="text-center space-y-3">
          <div className="text-5xl">🏆</div>
          <p className="font-black text-2xl text-gray-900 dark:text-white">Score: {score}</p>
          <p className="text-gray-500">Earned <span className="font-black text-amber-500">{Math.max(0, score * 5)} points</span></p>
          <button onClick={start} className="btn-primary px-8">Play Again</button>
        </div>
      )}
      {active && (
        <div className="w-full max-w-xs">
          <div className="flex justify-between mb-2 text-sm font-bold">
            <span className="text-gray-700 dark:text-gray-300">Score: {score}</span>
            <span className={timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-700 dark:text-gray-300'}>{timeLeft}s</span>
          </div>
          <div
            ref={gameRef}
            className="relative w-full bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-3xl border-2 border-black dark:border-gray-600 overflow-hidden"
            style={{ height: '320px' }}
          >
            {/* Falling items */}
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => catchItem(item.id, item.type)}
                className="absolute text-3xl hover:scale-125 transition-transform cursor-pointer active:scale-90"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                {item.type}
              </button>
            ))}
            {/* Bottom safe zone */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-green-200/30 to-transparent border-t-2 border-green-400 flex items-center justify-center">
              <span className="text-xs font-bold text-green-600 dark:text-green-400">Safe Zone</span>
            </div>
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
  { id: 'spin', label: 'Spin Wheel', emoji: '🎰', desc: 'Spin to win up to 200 pts', points: '5-200' },
  { id: 'memory', label: 'Memory Game', emoji: '🧩', desc: 'Match pairs to win', points: '50-200' },
  { id: 'quiz', label: 'Quiz', emoji: '🧠', desc: 'Answer 5 questions', points: '0-125' },
  { id: 'catch', label: 'Catch Game', emoji: '🎁', desc: 'Catch gifts, avoid bombs', points: '0-100' },
  { id: 'flappy', label: 'Flappy Bird', emoji: '🐦', desc: 'Tap to fly through pipes', points: '0-100' },
  { id: 'snake', label: 'Snake', emoji: '🐍', desc: 'Arrow keys to move', points: '0-150' },
  { id: 'rhythm', label: 'Tap Rhythm', emoji: '🎵', desc: 'Tap when circle hits line', points: '0-120' },
  { id: 'color', label: 'Color Match', emoji: '🎨', desc: '10 levels of color matching', points: '0-120' },
  { id: 'daily', label: 'Daily Challenge', emoji: '⚡', desc: 'One question, big reward', points: '150' },
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

  if (activeGame) {
    const game = gamesList.find(g => g.id === activeGame)!;
    return (
      <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveGame(null)} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X size={18} />
          </button>
          <div>
            <h1 className="font-black text-xl text-gray-900 dark:text-white">{game.emoji} {game.label}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Win up to {game.points} points</p>
          </div>
        </div>
        <div className="card p-6">
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
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Mini Games</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Play games to earn bonus points</p>
      </div>

      {/* Hero */}
      <div className="card p-6 bg-gradient-to-br from-[#7B6EF6] to-[#4F8EF7] text-white border-black">
        <div className="flex items-center gap-4">
          <div className="text-5xl animate-float">🎮</div>
          <div>
            <h2 className="font-black text-xl">Play & Earn</h2>
            <p className="text-white/80 text-sm mt-1">Each game earns you real points. Play daily for maximum rewards!</p>
          </div>
        </div>
      </div>

      {/* Game list */}
      <div className="space-y-3">
        {gamesList.map(game => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className="w-full card p-4 flex items-center gap-4 hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] text-left"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#7B6EF6]/10 dark:bg-[#4F8EF7]/20 flex items-center justify-center text-3xl flex-shrink-0">
              {game.emoji}
            </div>
            <div className="flex-1">
              <p className="font-black text-gray-900 dark:text-white">{game.label}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{game.desc}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <Star size={12} className="text-amber-500" fill="currentColor" />
                <span className="text-sm font-black text-amber-600 dark:text-amber-400">{game.points}</span>
              </div>
              <p className="text-xs text-gray-400">pts</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MiniGames;
