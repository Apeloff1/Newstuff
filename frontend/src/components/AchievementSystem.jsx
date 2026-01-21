import React, { useState, useEffect, useCallback } from 'react';

// ========================================================================
// AAA QUALITY ACHIEVEMENT SYSTEM
// Trophy unlocks with celebration animations
// ========================================================================

// Achievement categories
const ACHIEVEMENT_CATEGORIES = {
  FISHING: { name: 'Fishing', icon: '🎣', color: 'from-blue-500 to-cyan-500' },
  COLLECTION: { name: 'Collection', icon: '🐟', color: 'from-green-500 to-emerald-500' },
  PROGRESSION: { name: 'Progression', icon: '📈', color: 'from-purple-500 to-pink-500' },
  SKILL: { name: 'Skill', icon: '⭐', color: 'from-yellow-500 to-orange-500' },
  SOCIAL: { name: 'Social', icon: '👥', color: 'from-indigo-500 to-blue-500' },
  SECRET: { name: 'Secret', icon: '🔮', color: 'from-purple-900 to-pink-900' },
};

// Comprehensive achievement list
const ACHIEVEMENTS = {
  // Fishing Achievements
  first_catch: { id: 'first_catch', name: 'First Catch!', desc: 'Catch your first fish', category: 'FISHING', icon: '🐟', points: 10, rarity: 'common' },
  catch_10: { id: 'catch_10', name: 'Getting Started', desc: 'Catch 10 fish', category: 'FISHING', icon: '🎣', points: 25, rarity: 'common' },
  catch_50: { id: 'catch_50', name: 'Dedicated Angler', desc: 'Catch 50 fish', category: 'FISHING', icon: '🏅', points: 50, rarity: 'uncommon' },
  catch_100: { id: 'catch_100', name: 'Century Fisher', desc: 'Catch 100 fish', category: 'FISHING', icon: '🏆', points: 100, rarity: 'rare' },
  catch_500: { id: 'catch_500', name: 'Master Angler', desc: 'Catch 500 fish', category: 'FISHING', icon: '👑', points: 250, rarity: 'epic' },
  catch_1000: { id: 'catch_1000', name: 'Fishing Legend', desc: 'Catch 1000 fish', category: 'FISHING', icon: '🌟', points: 500, rarity: 'legendary' },
  
  // Perfect Catch Achievements
  perfect_1: { id: 'perfect_1', name: 'Perfect!', desc: 'Get your first perfect catch', category: 'SKILL', icon: '✨', points: 25, rarity: 'common' },
  perfect_10: { id: 'perfect_10', name: 'Precision Fisher', desc: 'Get 10 perfect catches', category: 'SKILL', icon: '🎯', points: 75, rarity: 'uncommon' },
  perfect_50: { id: 'perfect_50', name: 'Flawless Technique', desc: 'Get 50 perfect catches', category: 'SKILL', icon: '💎', points: 200, rarity: 'rare' },
  perfect_streak_5: { id: 'perfect_streak_5', name: 'On Fire!', desc: '5 perfect catches in a row', category: 'SKILL', icon: '🔥', points: 150, rarity: 'rare' },
  perfect_streak_10: { id: 'perfect_streak_10', name: 'Unstoppable', desc: '10 perfect catches in a row', category: 'SKILL', icon: '⚡', points: 400, rarity: 'epic' },
  
  // Rarity Achievements
  catch_uncommon: { id: 'catch_uncommon', name: 'Not So Common', desc: 'Catch an uncommon fish', category: 'COLLECTION', icon: '💚', points: 20, rarity: 'common' },
  catch_rare: { id: 'catch_rare', name: 'Rare Find', desc: 'Catch a rare fish', category: 'COLLECTION', icon: '💙', points: 50, rarity: 'uncommon' },
  catch_epic: { id: 'catch_epic', name: 'Epic Discovery', desc: 'Catch an epic fish', category: 'COLLECTION', icon: '💜', points: 150, rarity: 'rare' },
  catch_legendary: { id: 'catch_legendary', name: 'Legendary Hunter', desc: 'Catch a legendary fish', category: 'COLLECTION', icon: '💛', points: 500, rarity: 'epic' },
  catch_mythic: { id: 'catch_mythic', name: 'Myth Realized', desc: 'Catch a mythic fish', category: 'COLLECTION', icon: '❤️', points: 2000, rarity: 'legendary' },
  
  // Size Achievements
  big_catch: { id: 'big_catch', name: 'Big One!', desc: 'Catch a fish over 50cm', category: 'FISHING', icon: '📏', points: 30, rarity: 'common' },
  huge_catch: { id: 'huge_catch', name: 'Monster Catch', desc: 'Catch a fish over 100cm', category: 'FISHING', icon: '🦕', points: 100, rarity: 'rare' },
  record_breaker: { id: 'record_breaker', name: 'Record Breaker', desc: 'Catch a fish over 200cm', category: 'FISHING', icon: '🏅', points: 300, rarity: 'epic' },
  
  // Collection Achievements  
  collect_10_types: { id: 'collect_10_types', name: 'Collector', desc: 'Catch 10 different fish species', category: 'COLLECTION', icon: '📚', points: 75, rarity: 'uncommon' },
  collect_25_types: { id: 'collect_25_types', name: 'Fish Enthusiast', desc: 'Catch 25 different fish species', category: 'COLLECTION', icon: '📖', points: 200, rarity: 'rare' },
  collect_50_types: { id: 'collect_50_types', name: 'Ichthyologist', desc: 'Catch 50 different fish species', category: 'COLLECTION', icon: '🔬', points: 500, rarity: 'epic' },
  collect_all: { id: 'collect_all', name: 'Complete Encyclopedia', desc: 'Catch all fish species', category: 'COLLECTION', icon: '📕', points: 2000, rarity: 'legendary' },
  
  // Progression Achievements
  reach_level_5: { id: 'reach_level_5', name: 'Rising Star', desc: 'Reach level 5', category: 'PROGRESSION', icon: '⭐', points: 25, rarity: 'common' },
  reach_level_10: { id: 'reach_level_10', name: 'Skilled Fisher', desc: 'Reach level 10', category: 'PROGRESSION', icon: '🌟', points: 75, rarity: 'uncommon' },
  reach_level_25: { id: 'reach_level_25', name: 'Expert Angler', desc: 'Reach level 25', category: 'PROGRESSION', icon: '✨', points: 200, rarity: 'rare' },
  reach_level_50: { id: 'reach_level_50', name: 'Master Fisher', desc: 'Reach level 50', category: 'PROGRESSION', icon: '💫', points: 500, rarity: 'epic' },
  reach_level_100: { id: 'reach_level_100', name: 'Fishing God', desc: 'Reach level 100', category: 'PROGRESSION', icon: '👑', points: 1500, rarity: 'legendary' },
  
  // Score Achievements
  score_1000: { id: 'score_1000', name: 'First Thousand', desc: 'Score 1,000 points', category: 'PROGRESSION', icon: '📊', points: 25, rarity: 'common' },
  score_10000: { id: 'score_10000', name: 'High Roller', desc: 'Score 10,000 points', category: 'PROGRESSION', icon: '💰', points: 100, rarity: 'uncommon' },
  score_100000: { id: 'score_100000', name: 'Point Master', desc: 'Score 100,000 points', category: 'PROGRESSION', icon: '💎', points: 300, rarity: 'rare' },
  score_1000000: { id: 'score_1000000', name: 'Millionaire', desc: 'Score 1,000,000 points', category: 'PROGRESSION', icon: '🤑', points: 1000, rarity: 'legendary' },
  
  // Special/Secret Achievements
  night_owl: { id: 'night_owl', name: 'Night Owl', desc: 'Catch 10 fish at night', category: 'SECRET', icon: '🦉', points: 75, rarity: 'uncommon' },
  early_bird: { id: 'early_bird', name: 'Early Bird', desc: 'Catch 10 fish at dawn', category: 'SECRET', icon: '🐦', points: 75, rarity: 'uncommon' },
  storm_chaser: { id: 'storm_chaser', name: 'Storm Chaser', desc: 'Catch a rare fish during a storm', category: 'SECRET', icon: '⛈️', points: 150, rarity: 'rare' },
  full_moon_catch: { id: 'full_moon_catch', name: 'Lunar Luck', desc: 'Catch a legendary during full moon', category: 'SECRET', icon: '🌕', points: 300, rarity: 'epic' },
  speed_demon: { id: 'speed_demon', name: 'Speed Demon', desc: 'Catch 10 fish in under 2 minutes', category: 'SECRET', icon: '💨', points: 200, rarity: 'rare' },
  patient_fisher: { id: 'patient_fisher', name: 'Patience Pays', desc: 'Wait 30 seconds for a single catch', category: 'SECRET', icon: '⏰', points: 50, rarity: 'uncommon' },
  lucky_day: { id: 'lucky_day', name: 'Lucky Day', desc: 'Catch 3 rare+ fish in one session', category: 'SECRET', icon: '🍀', points: 200, rarity: 'rare' },
  
  // Social Achievements (if multiplayer)
  join_guild: { id: 'join_guild', name: 'Team Player', desc: 'Join a fishing guild', category: 'SOCIAL', icon: '🤝', points: 50, rarity: 'common' },
  guild_contributor: { id: 'guild_contributor', name: 'Contributor', desc: 'Contribute 10,000 points to guild', category: 'SOCIAL', icon: '🏛️', points: 150, rarity: 'uncommon' },
  tournament_win: { id: 'tournament_win', name: 'Champion', desc: 'Win a fishing tournament', category: 'SOCIAL', icon: '🏆', points: 500, rarity: 'epic' },
};

// Rarity colors
const RARITY_COLORS = {
  common: { bg: 'from-gray-500 to-gray-600', text: 'text-gray-300', border: 'border-gray-400' },
  uncommon: { bg: 'from-green-500 to-emerald-600', text: 'text-green-300', border: 'border-green-400' },
  rare: { bg: 'from-blue-500 to-indigo-600', text: 'text-blue-300', border: 'border-blue-400' },
  epic: { bg: 'from-purple-500 to-pink-600', text: 'text-purple-300', border: 'border-purple-400' },
  legendary: { bg: 'from-yellow-500 to-orange-600', text: 'text-yellow-300', border: 'border-yellow-400' },
};

// Confetti particle
const ConfettiParticle = ({ color, delay, x }) => (
  <div
    className="absolute w-3 h-3 confetti-particle"
    style={{
      left: `${x}%`,
      top: '-20px',
      backgroundColor: color,
      animationDelay: `${delay}s`,
      transform: `rotate(${Math.random() * 360}deg)`
    }}
  />
);

// Achievement Unlock Animation Component
const AchievementUnlockAnimation = ({ achievement, onComplete }) => {
  const [stage, setStage] = useState(0);
  const ach = typeof achievement === 'string' ? ACHIEVEMENTS[achievement] : achievement;
  const rarity = RARITY_COLORS[ach?.rarity || 'common'];
  const category = ACHIEVEMENT_CATEGORIES[ach?.category || 'FISHING'];
  
  // Animation stages
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 100),   // Show glow
      setTimeout(() => setStage(2), 500),   // Show trophy
      setTimeout(() => setStage(3), 1000),  // Show details
      setTimeout(() => setStage(4), 3500),  // Start exit
      setTimeout(() => onComplete?.(), 4000) // Complete
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, [onComplete]);
  
  const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F59E0B', '#EC4899'];
  
  if (!ach) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none" data-testid="achievement-unlock">
      {/* Background overlay */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${stage >= 1 ? 'opacity-80' : 'opacity-0'}`} />
      
      {/* Confetti */}
      {stage >= 2 && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <ConfettiParticle
              key={i}
              color={confettiColors[i % confettiColors.length]}
              delay={i * 0.05}
              x={Math.random() * 100}
            />
          ))}
        </div>
      )}
      
      {/* Radial glow */}
      {stage >= 1 && (
        <div className={`absolute w-96 h-96 rounded-full bg-gradient-radial ${rarity.bg} opacity-30 animate-pulse`} />
      )}
      
      {/* Achievement card */}
      <div className={`relative transition-all duration-500 ${
        stage >= 2 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
      } ${stage >= 4 ? 'scale-75 opacity-0' : ''}`}>
        
        {/* Trophy burst effect */}
        {stage >= 2 && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-16 bg-gradient-to-t ${rarity.bg} rounded-full`}
                style={{
                  transform: `rotate(${i * 45}deg)`,
                  animation: 'burstRay 0.5s ease-out forwards',
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>
        )}
        
        {/* Main card */}
        <div className={`relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-8 border-4 ${rarity.border} shadow-2xl min-w-[300px] max-w-[400px]`}>
          
          {/* Category badge */}
          <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r ${category.color} text-white text-xs font-bold`}>
            {category.icon} {category.name}
          </div>
          
          {/* Achievement header */}
          <div className="text-center mb-4">
            <p className={`text-xs uppercase tracking-wider ${rarity.text} mb-2`}>
              Achievement Unlocked!
            </p>
          </div>
          
          {/* Trophy icon */}
          <div className="flex justify-center mb-4">
            <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${rarity.bg} flex items-center justify-center trophy-unlock`}>
              <span className="text-5xl">{ach.icon}</span>
              {/* Sparkles */}
              <div className="absolute -top-2 -right-2 text-xl animate-ping">✨</div>
              <div className="absolute -bottom-1 -left-1 text-lg animate-ping" style={{ animationDelay: '0.3s' }}>✨</div>
            </div>
          </div>
          
          {/* Achievement name */}
          <h2 className={`text-2xl font-bold text-center mb-2 ${rarity.text} font-pixel`}>
            {ach.name}
          </h2>
          
          {/* Description */}
          <p className="text-white/70 text-center text-sm mb-4">
            {ach.desc}
          </p>
          
          {/* Points earned */}
          <div className="flex justify-center items-center gap-2 bg-black/30 rounded-xl py-2 px-4">
            <span className="text-yellow-400 text-xl">🪙</span>
            <span className="text-yellow-400 font-bold text-xl">+{ach.points}</span>
            <span className="text-white/50 text-sm">points</span>
          </div>
          
          {/* Rarity badge */}
          <div className="flex justify-center mt-4">
            <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${rarity.bg} text-white text-xs font-bold uppercase tracking-wider`}>
              {ach.rarity}
            </span>
          </div>
        </div>
      </div>
      
      {/* Custom animations */}
      <style>{`
        @keyframes burstRay {
          0% { height: 0; opacity: 1; }
          100% { height: 150px; opacity: 0; }
        }
        
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        
        .confetti-particle {
          animation: confettiFall 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// Achievement List Component (for viewing all achievements)
const AchievementList = ({ unlockedAchievements = [], onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const filteredAchievements = Object.values(ACHIEVEMENTS).filter(
    ach => !selectedCategory || ach.category === selectedCategory
  );
  
  const totalPoints = Object.values(ACHIEVEMENTS).reduce((sum, a) => sum + a.points, 0);
  const earnedPoints = unlockedAchievements.reduce((sum, id) => sum + (ACHIEVEMENTS[id]?.points || 0), 0);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" data-testid="achievement-list">
      <div className="w-full max-w-2xl max-h-[85vh] bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl overflow-hidden border-2 border-yellow-500/40">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-amber-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h2 className="text-xl font-bold text-white font-pixel">ACHIEVEMENTS</h2>
              <p className="text-xs text-yellow-200">{unlockedAchievements.length}/{Object.keys(ACHIEVEMENTS).length} Unlocked</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/70">Points Earned</p>
            <p className="text-lg font-bold text-white">{earnedPoints}/{totalPoints}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/30 text-white font-bold">×</button>
        </div>
        
        {/* Category filter */}
        <div className="p-4 border-b border-white/10 overflow-x-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                !selectedCategory ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'
              }`}
            >
              All
            </button>
            {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 ${
                  selectedCategory === key ? `bg-gradient-to-r ${cat.color} text-white` : 'bg-white/10 text-white'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Achievement grid */}
        <div className="p-4 overflow-y-auto max-h-[55vh]">
          <div className="grid grid-cols-2 gap-3">
            {filteredAchievements.map(ach => {
              const unlocked = unlockedAchievements.includes(ach.id);
              const rarity = RARITY_COLORS[ach.rarity];
              
              return (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    unlocked
                      ? `${rarity.border} bg-gradient-to-br ${rarity.bg}/20`
                      : 'border-white/10 bg-white/5 opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      unlocked ? `bg-gradient-to-br ${rarity.bg}` : 'bg-gray-800'
                    }`}>
                      {unlocked ? ach.icon : '❓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-sm ${unlocked ? rarity.text : 'text-white/50'}`}>
                        {ach.name}
                      </h3>
                      <p className="text-xs text-white/50 truncate">{ach.desc}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          unlocked ? `bg-gradient-to-r ${rarity.bg}` : 'bg-gray-700'
                        } text-white`}>
                          {ach.rarity}
                        </span>
                        <span className="text-xs text-yellow-400">+{ach.points}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export { AchievementUnlockAnimation, AchievementList, ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, RARITY_COLORS };
export default AchievementUnlockAnimation;
