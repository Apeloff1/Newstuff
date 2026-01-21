import React, { useState, useEffect, useMemo } from 'react';

// ========================================================================
// AAA QUALITY SEASONAL EVENTS SYSTEM
// Special limited-time events with unique rewards
// ========================================================================

// Event types
const EVENT_TYPES = {
  FISHING_FRENZY: 'fishing_frenzy',
  RARE_SPAWN: 'rare_spawn',
  DOUBLE_XP: 'double_xp',
  GOLDEN_HOUR: 'golden_hour',
  STORM_CHASE: 'storm_chase',
  TOURNAMENT: 'tournament',
  COLLECTION: 'collection',
  BOSS_BATTLE: 'boss_battle',
};

// Current and upcoming events
const EVENTS = [
  {
    id: 'winter_wonderland',
    name: 'Winter Wonderland',
    type: EVENT_TYPES.RARE_SPAWN,
    icon: '❄️',
    banner: '🎄',
    description: 'Rare winter fish are appearing! Catch the elusive Ice Koi and Frost Marlin.',
    startDate: new Date('2026-01-15').toISOString(),
    endDate: new Date('2026-01-31').toISOString(),
    rewards: [
      { type: 'fish', item: 'Ice Koi', rarity: 'legendary', icon: '🐟', unlocked: false },
      { type: 'lure', item: 'Snowflake Lure', rarity: 'epic', icon: '❄️', unlocked: false },
      { type: 'coins', amount: 5000, icon: '💰', unlocked: true },
      { type: 'badge', item: 'Winter Champion', rarity: 'rare', icon: '🏅', unlocked: false },
    ],
    tasks: [
      { id: 1, name: 'Catch 10 winter fish', progress: 7, target: 10, reward: 500 },
      { id: 2, name: 'Catch Ice Koi', progress: 0, target: 1, reward: 2000 },
      { id: 3, name: 'Perfect catch 5 times', progress: 3, target: 5, reward: 800 },
      { id: 4, name: 'Complete 3 mini-games', progress: 2, target: 3, reward: 600 },
    ],
    bonuses: {
      rareChance: 2.0,
      winterFishSpawn: 3.0,
      xpMultiplier: 1.5,
    },
    active: true,
  },
  {
    id: 'new_year_bash',
    name: 'New Year Fishing Bash',
    type: EVENT_TYPES.DOUBLE_XP,
    icon: '🎆',
    banner: '🥳',
    description: 'Double XP and double rewards for the new year celebration!',
    startDate: new Date('2026-01-01').toISOString(),
    endDate: new Date('2026-01-07').toISOString(),
    rewards: [
      { type: 'title', item: '2026 Angler', rarity: 'rare', icon: '🏷️', unlocked: true },
      { type: 'coins', amount: 10000, icon: '💎', unlocked: true },
      { type: 'booster', item: '2x XP (24h)', rarity: 'epic', icon: '⚡', unlocked: false },
    ],
    tasks: [
      { id: 1, name: 'Catch 50 fish', progress: 50, target: 50, reward: 1000, completed: true },
      { id: 2, name: 'Score 10000 points', progress: 10000, target: 10000, reward: 1500, completed: true },
      { id: 3, name: 'Win a tournament', progress: 0, target: 1, reward: 3000 },
    ],
    bonuses: {
      xpMultiplier: 2.0,
      coinMultiplier: 2.0,
    },
    active: false,
    completed: true,
  },
  {
    id: 'lunar_festival',
    name: 'Lunar New Year Festival',
    type: EVENT_TYPES.GOLDEN_HOUR,
    icon: '🐉',
    banner: '🧧',
    description: 'Celebrate the Year of the Dragon! Golden Dragon Fish awaits.',
    startDate: new Date('2026-02-10').toISOString(),
    endDate: new Date('2026-02-17').toISOString(),
    rewards: [
      { type: 'fish', item: 'Golden Dragon', rarity: 'mythic', icon: '🐲', unlocked: false },
      { type: 'rod', item: 'Dragon Rod', rarity: 'legendary', icon: '🎣', unlocked: false },
      { type: 'coins', amount: 25000, icon: '🧧', unlocked: false },
    ],
    tasks: [
      { id: 1, name: 'Catch Golden Dragon', progress: 0, target: 1, reward: 10000 },
      { id: 2, name: 'Collect 8 lucky fish', progress: 0, target: 8, reward: 2000 },
    ],
    bonuses: {
      goldenFishChance: 5.0,
      luckyDrops: true,
    },
    active: false,
    upcoming: true,
  },
  {
    id: 'leviathan_awakens',
    name: 'Leviathan Awakens',
    type: EVENT_TYPES.BOSS_BATTLE,
    icon: '🐋',
    banner: '⚔️',
    description: 'The legendary Leviathan has been spotted! Team up to defeat it.',
    startDate: new Date('2026-02-01').toISOString(),
    endDate: new Date('2026-02-03').toISOString(),
    rewards: [
      { type: 'material', item: 'Leviathan Scale', rarity: 'epic', icon: '🔮', unlocked: false },
      { type: 'trophy', item: 'Leviathan Slayer', rarity: 'legendary', icon: '🏆', unlocked: false },
    ],
    tasks: [
      { id: 1, name: 'Deal 10000 damage', progress: 0, target: 10000, reward: 5000 },
      { id: 2, name: 'Defeat Leviathan', progress: 0, target: 1, reward: 15000 },
    ],
    bonuses: {
      bossSpawn: true,
      teamDamage: 1.5,
    },
    active: false,
    upcoming: true,
  },
];

// Calculate time remaining
const getTimeRemaining = (endDate) => {
  const total = new Date(endDate) - new Date();
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  return { total, days, hours, minutes };
};

// Event card component
const EventCard = ({ event, onClick }) => {
  const timeRemaining = getTimeRemaining(event.endDate);
  const isActive = event.active;
  const isUpcoming = event.upcoming;
  const isCompleted = event.completed;
  
  // Calculate progress
  const totalTasks = event.tasks?.length || 0;
  const completedTasks = event.tasks?.filter(t => t.completed || t.progress >= t.target).length || 0;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  return (
    <div 
      onClick={() => onClick(event)}
      className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] ${
        isActive ? 'ring-2 ring-yellow-400' : isCompleted ? 'opacity-60' : ''
      }`}
    >
      {/* Background gradient based on event type */}
      <div className={`absolute inset-0 bg-gradient-to-br ${
        isActive ? 'from-yellow-600/80 to-orange-700/80' :
        isUpcoming ? 'from-purple-600/80 to-indigo-700/80' :
        'from-gray-600/80 to-gray-700/80'
      }`} />
      
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 text-8xl transform rotate-12 translate-x-8 -translate-y-4">
          {event.banner}
        </div>
      </div>
      
      <div className="relative p-4">
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          {isActive && (
            <span className="px-2 py-1 bg-green-500 rounded-full text-xs font-bold text-white animate-pulse">
              LIVE
            </span>
          )}
          {isUpcoming && (
            <span className="px-2 py-1 bg-purple-500 rounded-full text-xs font-bold text-white">
              SOON
            </span>
          )}
          {isCompleted && (
            <span className="px-2 py-1 bg-gray-500 rounded-full text-xs font-bold text-white">
              ENDED
            </span>
          )}
        </div>
        
        {/* Event info */}
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-3xl">
            {event.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-lg">{event.name}</h3>
            <p className="text-xs text-white/70 line-clamp-2">{event.description}</p>
          </div>
        </div>
        
        {/* Time remaining */}
        {isActive && timeRemaining.total > 0 && (
          <div className="mt-3 flex items-center gap-4 text-white/80">
            <span className="text-xs">⏰ Ends in:</span>
            <div className="flex gap-2">
              {timeRemaining.days > 0 && (
                <span className="px-2 py-1 bg-black/30 rounded text-xs font-mono">
                  {timeRemaining.days}d
                </span>
              )}
              <span className="px-2 py-1 bg-black/30 rounded text-xs font-mono">
                {timeRemaining.hours}h
              </span>
              <span className="px-2 py-1 bg-black/30 rounded text-xs font-mono">
                {timeRemaining.minutes}m
              </span>
            </div>
          </div>
        )}
        
        {/* Progress bar */}
        {totalTasks > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>Progress</span>
              <span>{completedTasks}/{totalTasks} tasks</span>
            </div>
            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Rewards preview */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-white/60">Rewards:</span>
          <div className="flex -space-x-1">
            {event.rewards.slice(0, 4).map((reward, i) => (
              <div 
                key={i}
                className={`w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm border-2 border-white/30 ${reward.unlocked ? 'opacity-100' : 'opacity-50'}`}
                title={reward.item || `${reward.amount} coins`}
              >
                {reward.icon}
              </div>
            ))}
            {event.rewards.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-[10px] text-white font-bold">
                +{event.rewards.length - 4}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Event detail modal
const EventDetailModal = ({ event, onClose }) => {
  if (!event) return null;
  
  const timeRemaining = getTimeRemaining(event.endDate);
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl border-2 border-yellow-500/30">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-yellow-600/50 to-orange-600/50 overflow-hidden">
          <div className="absolute top-0 right-0 text-9xl opacity-20 transform rotate-12 translate-x-8 -translate-y-8">
            {event.banner}
          </div>
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl">
                {event.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{event.name}</h2>
                <p className="text-white/70">{event.description}</p>
              </div>
            </div>
            {event.active && timeRemaining.total > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-white/60">⏰</span>
                <div className="flex gap-2">
                  <div className="px-3 py-2 bg-black/40 rounded-lg text-center">
                    <p className="text-xl font-bold text-white">{timeRemaining.days}</p>
                    <p className="text-[10px] text-white/50">DAYS</p>
                  </div>
                  <div className="px-3 py-2 bg-black/40 rounded-lg text-center">
                    <p className="text-xl font-bold text-white">{timeRemaining.hours}</p>
                    <p className="text-[10px] text-white/50">HOURS</p>
                  </div>
                  <div className="px-3 py-2 bg-black/40 rounded-lg text-center">
                    <p className="text-xl font-bold text-white">{timeRemaining.minutes}</p>
                    <p className="text-[10px] text-white/50">MINS</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 text-white"
          >
            ×
          </button>
        </div>
        
        {/* Bonuses */}
        {event.bonuses && (
          <div className="p-4 bg-green-900/20 border-b border-white/10">
            <h3 className="text-sm font-bold text-green-400 mb-2">🎁 EVENT BONUSES</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(event.bonuses).map(([key, value]) => (
                <span key={key} className="px-3 py-1 bg-green-900/50 rounded-full text-xs text-green-300">
                  {key}: {typeof value === 'number' ? `${value}x` : '✓'}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Tasks */}
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-bold text-white mb-3">📋 TASKS</h3>
          <div className="space-y-3">
            {event.tasks?.map(task => (
              <div key={task.id} className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${task.completed || task.progress >= task.target ? 'text-green-400 line-through' : 'text-white'}`}>
                    {task.name}
                  </span>
                  <span className="text-xs text-yellow-400">+{task.reward}</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${task.completed || task.progress >= task.target ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(100, (task.progress / task.target) * 100)}%` }}
                  />
                </div>
                <p className="text-right text-[10px] text-white/50 mt-1">
                  {task.progress}/{task.target}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Rewards */}
        <div className="p-4">
          <h3 className="text-sm font-bold text-white mb-3">🏆 REWARDS</h3>
          <div className="grid grid-cols-2 gap-3">
            {event.rewards.map((reward, i) => (
              <div 
                key={i}
                className={`p-3 rounded-xl border ${
                  reward.unlocked 
                    ? 'bg-yellow-900/30 border-yellow-500/50' 
                    : 'bg-white/5 border-white/10 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{reward.icon}</span>
                  <div>
                    <p className={`text-sm font-bold ${reward.unlocked ? 'text-yellow-400' : 'text-white'}`}>
                      {reward.item || `${reward.amount} coins`}
                    </p>
                    {reward.rarity && (
                      <p className="text-[10px] text-white/50 uppercase">{reward.rarity}</p>
                    )}
                  </div>
                </div>
                {reward.unlocked && (
                  <span className="block mt-2 text-center text-xs text-green-400">✓ Claimed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Events System Component
const EventsSystem = ({ onClose }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, upcoming, completed
  
  const filteredEvents = useMemo(() => {
    switch (filter) {
      case 'active': return EVENTS.filter(e => e.active);
      case 'upcoming': return EVENTS.filter(e => e.upcoming);
      case 'completed': return EVENTS.filter(e => e.completed);
      default: return EVENTS;
    }
  }, [filter]);
  
  const activeEvents = EVENTS.filter(e => e.active);
  const upcomingEvents = EVENTS.filter(e => e.upcoming);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" data-testid="events-system">
      <div className="w-full max-w-3xl max-h-[90vh] bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl overflow-hidden border-2 border-purple-500/40 shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h2 className="text-xl font-bold text-white font-pixel">EVENTS</h2>
              <p className="text-xs text-purple-200">
                {activeEvents.length} active • {upcomingEvents.length} upcoming
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/30 text-white font-bold">×</button>
        </div>
        
        {/* Filter tabs */}
        <div className="p-4 border-b border-white/10">
          <div className="flex gap-2">
            {['all', 'active', 'upcoming', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                  filter === f
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {f === 'active' && '🔴 '}{f}
              </button>
            ))}
          </div>
        </div>
        
        {/* Events list */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              <p className="text-4xl mb-4">📭</p>
              <p>No events in this category</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={setSelectedEvent}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Event detail modal */}
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </div>
    </div>
  );
};

export { EventsSystem, EVENTS, EVENT_TYPES };
export default EventsSystem;
