import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  QrCode,
  Gamepad2,
  Gift,
  ChevronRight,
  Zap,
  Target,
  Trophy,
  TrendingUp,
  Sparkles,
  Heart,
  Users,
  ArrowRight,
  Play,
  Shield,
  Rocket,
} from 'lucide-react';
import { WinningParticles } from '../components/WinningParticles';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [animatedIndex, setAnimatedIndex] = useState(-1);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'Instant Rewards',
      description: 'Earn points instantly with every interaction',
      color: '#7B6EF6',
      gradient: 'from-purple-400 to-purple-600',
      emoji: '⚡',
    },
    {
      icon: Gamepad2,
      title: 'Fun Gamification',
      description: 'Play games and complete missions for bonuses',
      color: '#22c55e',
      gradient: 'from-green-400 to-green-600',
      emoji: '🎮',
    },
    {
      icon: Gift,
      title: 'Exclusive Rewards',
      description: 'Redeem your points for amazing prizes',
      color: '#f59e0b',
      gradient: 'from-yellow-400 to-orange-500',
      emoji: '🎁',
    },
    {
      icon: Target,
      title: 'Daily Missions',
      description: 'Complete daily challenges and earn streaks',
      color: '#ef4444',
      gradient: 'from-red-400 to-red-600',
      emoji: '🎯',
    },
    {
      icon: Trophy,
      title: 'Leaderboards',
      description: 'Compete with others and climb the ranks',
      color: '#06b6d4',
      gradient: 'from-cyan-400 to-cyan-600',
      emoji: '🏆',
    },
    {
      icon: Heart,
      title: 'Social Rewards',
      description: 'Earn bonus points by sharing with friends',
      color: '#ec4899',
      gradient: 'from-pink-400 to-pink-600',
      emoji: '💖',
    },
  ];

  const stats = [
    { icon: Users, value: '50K+', label: 'Active Users', color: '#7B6EF6' },
    { icon: Sparkles, value: '2M+', label: 'Points Earned', color: '#f59e0b' },
    { icon: Trophy, value: '10K+', label: 'Rewards Given', color: '#22c55e' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--bg-color)' }}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-96 h-96 rounded-full opacity-10"
            style={{
              background: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)',
              top: '-200px',
              left: '-200px',
              animation: 'float 6s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-96 h-96 rounded-full opacity-10"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              bottom: '-200px',
              right: '-200px',
              animation: 'float 8s ease-in-out infinite reverse',
            }}
          />
          <div
            className="absolute w-64 h-64 rounded-full opacity-5"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)',
              top: '50%',
              left: '50%',
              animation: 'pulse-glow 4s ease-in-out infinite',
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          {/* Animated Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-var(--dark-border) bg-white dark:bg-gray-800"
            style={{ boxShadow: '0px 3px 0px var(--dark-border)' }}
          >
            <Sparkles size={16} style={{ color: 'var(--gradient-start)' }} />
            <span className="text-xs sm:text-sm font-black">Welcome to Loyalty Rewards!</span>
          </div>

          {/* Main Title with Gradient */}
          <div className="space-y-4 sm:space-y-6">
            <h1
              className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight"
              style={{
                background: 'linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'bounce-in 0.6s ease-out',
              }}
            >
              Earn Rewards While You Shop
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto animate-fadeIn">
              Join thousands of happy customers earning points, redeeming exclusive rewards, and having fun with our gamified loyalty platform.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-xl sm:rounded-2xl font-black text-white border-2 border-var(--dark-border) transition-all active:scale-95 hover:scale-105 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)',
                boxShadow: '0px 6px 0px var(--dark-border)',
              }}
            >
              <Play size={18} /> Get Started
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 rounded-xl sm:rounded-2xl font-black border-2 border-var(--dark-border) transition-all active:scale-95 hover:scale-105"
              style={{
                background: 'var(--card-bg)',
                color: 'var(--text-dark)',
                boxShadow: '0px 6px 0px var(--dark-border)',
              }}
            >
              Learn More
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="card p-3 sm:p-4"
                style={{
                  background: 'var(--card-bg)',
                  border: '2px solid var(--dark-border)',
                  boxShadow: '0px 4px 0px var(--dark-border)',
                  animation: `slideIn 0.3s ease-out ${idx * 0.1}s both`,
                }}
              >
                <stat.icon size={20} className="sm:w-6 sm:h-6 mx-auto mb-2" style={{ color: stat.color }} />
                <p className="font-black text-lg sm:text-xl" style={{ color: stat.color }}>
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-3 sm:space-y-4 mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black" style={{ color: 'var(--text-dark)' }}>
            Why You'll Love Us
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to maximize your rewards and enjoy the shopping experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group card p-4 sm:p-6 transition-all active:scale-95 hover:scale-105 cursor-pointer relative overflow-hidden"
              style={{
                background: 'var(--card-bg)',
                border: '2px solid var(--dark-border)',
                boxShadow: '0px 4px 0px var(--dark-border)',
                animation: `slideIn 0.3s ease-out ${idx * 0.08}s both`,
              }}
              onMouseEnter={() => setAnimatedIndex(idx)}
              onMouseLeave={() => setAnimatedIndex(-1)}
            >
              {/* Gradient Overlay on Hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${feature.color} 0%, transparent 100%)`,
                }}
              />

              <div className="relative space-y-4">
                {/* Icon Container */}
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color}20 0%, ${feature.color}10 100%)`,
                    border: `2px solid ${feature.color}`,
                    boxShadow: `0px 3px 0px ${feature.color}40`,
                  }}
                >
                  {feature.emoji}
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="font-black text-lg sm:text-xl" style={{ color: 'var(--text-dark)' }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>

                {/* Arrow */}
                <div
                  className="pt-2 transition-all group-hover:translate-x-1"
                  style={{ color: feature.color }}
                >
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-3 sm:space-y-4 mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black" style={{ color: 'var(--text-dark)' }}>
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { step: 1, title: 'Sign Up', desc: 'Create your account in seconds', icon: '📝' },
              { step: 2, title: 'Shop & Earn', desc: 'Get points on every purchase', icon: '🛍️' },
              { step: 3, title: 'Play Games', desc: 'Have fun and earn bonuses', icon: '🎮' },
              { step: 4, title: 'Redeem', desc: 'Exchange points for rewards', icon: '🎉' },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                {/* Connector Line */}
                {idx < 3 && (
                  <div
                    className="hidden lg:block absolute top-1/3 left-full w-full h-1 -translate-y-1/2"
                    style={{
                      background: 'linear-gradient(90deg, var(--gradient-start) 0%, var(--gradient-end) 100%)',
                      opacity: 0.3,
                    }}
                  />
                )}

                <div
                  className="card p-6 text-center relative z-10"
                  style={{
                    background: 'var(--card-bg)',
                    border: '2px solid var(--dark-border)',
                    boxShadow: '0px 4px 0px var(--dark-border)',
                    animation: `slideIn 0.3s ease-out ${idx * 0.1}s both`,
                  }}
                >
                  {/* Step Badge */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white mb-4 mx-auto"
                    style={{
                      background: 'linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)',
                      border: '2px solid var(--dark-border)',
                      boxShadow: '0px 2px 0px var(--dark-border)',
                    }}
                  >
                    {item.step}
                  </div>

                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-black text-lg mb-2" style={{ color: 'var(--text-dark)' }}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div
          className="card p-8 sm:p-12 max-w-3xl mx-auto text-center space-y-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)',
            border: '3px solid var(--dark-border)',
            boxShadow: '0px 8px 0px var(--dark-border)',
          }}
        >
          {/* Animated Background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              animation: 'float 10s ease-in-out infinite',
            }}
          />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Ready to Start Earning?</h2>
            <p className="text-white/90 text-base sm:text-lg mb-6">Join our loyalty program and start collecting rewards today.</p>

            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 rounded-xl font-black text-white border-2 border-white transition-all active:scale-95 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                boxShadow: '0px 4px 0px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              Join Now <ArrowRight size={18} className="inline ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Global Styles */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          60% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
