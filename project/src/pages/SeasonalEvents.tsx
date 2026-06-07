import React, { useState } from 'react';
import { Zap, Clock, Star, Lock, Clock as Unlock, Trophy, ChevronRight, Calendar } from 'lucide-react';
import { seasonalEvents } from '../data/mockData';
import { tr } from '../lib/tr';

const eventRewards = [
  { id: '1', title: 'Summer Tote Bag', points: 300, unlocked: true, icon: '👜' },
  { id: '2', title: 'Sunscreen Pack', points: 150, unlocked: true, icon: '🧴' },
  { id: '3', title: 'Beach Towel', points: 500, unlocked: false, icon: '🏖️' },
  { id: '4', title: 'Summer Gift Box', points: 1000, unlocked: false, icon: '🎁' },
  { id: '5', title: 'VIP Pool Party Pass', points: 2000, unlocked: false, icon: '🎪' },
];

const SeasonalEvents: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState(seasonalEvents[0]);

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-2xl mx-auto overflow-x-hidden">
      <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Seasonal Events</h1>

      {/* Event cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {seasonalEvents.map(event => (
          <div
            key={event.id}
            onClick={() => setSelectedEvent(event)}
            className={`card w-full min-w-0 cursor-pointer transition-all duration-200 overflow-hidden ${
              selectedEvent.id === event.id ? 'ring-2 ring-[#7B6EF6] dark:ring-[#4F8EF7] shadow-md' : 'hover:shadow-md'
            }`}
          >
            <div className={`h-20 sm:h-24 lg:h-28 bg-gradient-to-br ${event.color} flex items-center justify-center relative overflow-hidden border-b-2 border-black dark:border-gray-700`}>
              <div className="absolute inset-0 opacity-20">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="absolute w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white" style={{ left: `${i * 20}%`, top: `${(i % 3) * 40}%` }} />
                ))}
              </div>
              <div className="text-center z-10 px-2">
                <p className="font-black text-white text-base sm:text-lg lg:text-xl">{event.title}</p>
                {event.active && <span className="badge bg-white/40 text-white text-xs mt-1">{event.multiplier} Points</span>}
                {!event.active && <span className="badge bg-black/20 text-white/80 text-xs mt-1">{event.active ? 'Active' : event.progress === 100 ? 'Ended' : 'Coming Soon'}</span>}
              </div>
            </div>
            <div className="p-2 sm:p-3">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar size={10} />
                  <span>{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <span className="text-xs font-bold text-[#7B6EF6] dark:text-[#4F8EF7]">{event.unlockedRewards}/{event.totalRewards} rewards</span>
              </div>
              <div className="h-1 sm:h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full bg-[#7B6EF6] dark:bg-[#4F8EF7] rounded-full" style={{ width: `${event.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected event details */}
      {selectedEvent && (
        <>
          <div className={`card p-3 sm:p-4 lg:p-5 bg-gradient-to-br ${selectedEvent.color} text-white border-black overflow-hidden relative`}>
            <div className="absolute -top-8 sm:-top-10 -right-8 sm:-right-10 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="font-black text-xl sm:text-2xl">{selectedEvent.title}</h2>
                  <p className="text-white/80 text-xs sm:text-sm mt-1 line-clamp-2">{selectedEvent.description}</p>
                </div>
                {selectedEvent.active && (
                  <span className="badge bg-white/20 text-white border-white/30 text-xs sm:text-sm flex-shrink-0">
                    <Zap size={10} className="sm:w-3 sm:h-3" /> {selectedEvent.multiplier}
                  </span>
                )}
              </div>
              <div className="mt-3 sm:mt-4">
                <div className="flex justify-between text-xs text-white/70 mb-1">
                  <span>Event Progress</span>
                  <span>{selectedEvent.progress}%</span>
                </div>
                <div className="h-2 sm:h-3 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${selectedEvent.progress}%` }} />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm">
                <div className="flex items-center gap-1 text-white/80">
                  <Calendar size={12} />
                  <span>Ends: {new Date(selectedEvent.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-white/80">
                  <Trophy size={12} />
                  <span>{selectedEvent.unlockedRewards}/{selectedEvent.totalRewards} rewards unlocked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Event rewards */}
          <div>
            <h2 className="font-black text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">Event Rewards</h2>
            <div className="space-y-2 sm:space-y-3">
              {eventRewards.map(reward => (
                <div key={reward.id} className={`card p-3 sm:p-4 flex items-center gap-3 sm:gap-4 ${!reward.unlocked ? 'opacity-70' : ''}`}>
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl border-2 flex-shrink-0 ${
                    reward.unlocked
                      ? 'bg-[#7B6EF6]/10 dark:bg-[#4F8EF7]/20 border-[#7B6EF6]/40 dark:border-[#4F8EF7]/40'
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}>
                    {reward.unlocked ? reward.icon : <Lock size={16} className="sm:w-5 sm:h-5 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">{reward.title}</p>
                    <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                      <Star size={10} className="sm:w-3 sm:h-3 text-amber-500" fill="currentColor" />
                      <span className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">{reward.points} pts required</span>
                    </div>
                  </div>
                  {reward.unlocked ? (
                    <div className="flex items-center gap-1 text-green-500 flex-shrink-0">
                      <Unlock size={14} className="sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm font-bold">Unlocked</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-400 flex-shrink-0">
                      <Lock size={14} className="sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm font-bold">Locked</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SeasonalEvents;
