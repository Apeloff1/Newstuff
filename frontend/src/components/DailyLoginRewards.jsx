import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';

// ========================================================================
// DAILY LOGIN REWARDS - AAA Quality Daily Rewards System
// ========================================================================

// 30-day reward calendar
const DAILY_REWARDS = [
  { day: 1, type: 'coins', amount: 100, icon: '🪙' },
  { day: 2, type: 'coins', amount: 150, icon: '🪙' },
  { day: 3, type: 'coins', amount: 200, icon: '🪙' },
  { day: 4, type: 'lure', item: 'Silver Lure', icon: '🎣' },
  { day: 5, type: 'coins', amount: 300, icon: '💰' },
  { day: 6, type: 'coins', amount: 350, icon: '💰' },
  { day: 7, type: 'chest', item: 'Bronze Chest', icon: '📦', milestone: true },
  { day: 8, type: 'coins', amount: 400, icon: '🪙' },
  { day: 9, type: 'coins', amount: 450, icon: '🪙' },
  { day: 10, type: 'bait', item: 'Premium Bait x10', icon: '🪱' },
  { day: 11, type: 'coins', amount: 500, icon: '💰' },
  { day: 12, type: 'coins', amount: 550, icon: '💰' },
  { day: 13, type: 'coins', amount: 600, icon: '💰' },
  { day: 14, type: 'chest', item: 'Silver Chest', icon: '🎁', milestone: true },
  { day: 15, type: 'coins', amount: 700, icon: '💰' },
  { day: 16, type: 'rod', item: 'Carbon Rod Skin', icon: '🎣' },
  { day: 17, type: 'coins', amount: 800, icon: '💰' },
  { day: 18, type: 'coins', amount: 850, icon: '💰' },
  { day: 19, type: 'coins', amount: 900, icon: '💰' },
  { day: 20, type: 'coins', amount: 950, icon: '💰' },
  { day: 21, type: 'chest', item: 'Gold Chest', icon: '🎁', milestone: true },
  { day: 22, type: 'coins', amount: 1000, icon: '💎' },
  { day: 23, type: 'coins', amount: 1100, icon: '💎' },
  { day: 24, type: 'coins', amount: 1200, icon: '💎' },
  { day: 25, type: 'fish', item: 'Rare Fish Voucher', icon: '🐟' },
  { day: 26, type: 'coins', amount: 1300, icon: '💎' },
  { day: 27, type: 'coins', amount: 1400, icon: '💎' },
  { day: 28, type: 'chest', item: 'Platinum Chest', icon: '👑', milestone: true },
  { day: 29, type: 'coins', amount: 1500, icon: '💎' },
  { day: 30, type: 'legendary', item: 'Legendary Lure', icon: '⭐', milestone: true, legendary: true },
];

// Streak bonuses
const STREAK_BONUSES = {
  3: { multiplier: 1.1, name: '3-Day Streak', icon: '🔥' },
  7: { multiplier: 1.25, name: 'Week Warrior', icon: '🔥🔥' },
  14: { multiplier: 1.5, name: 'Two Week Champion', icon: '🔥🔥🔥' },
  21: { multiplier: 1.75, name: 'Three Week Legend', icon: '💥' },
  30: { multiplier: 2.0, name: 'Monthly Master', icon: '👑' },
};

// Reward Card Component
const RewardCard = ({ reward, dayIndex, currentDay, claimed, onClaim, streak }) => {
  const isPast = dayIndex < currentDay;
  const isCurrent = dayIndex === currentDay;
  const isFuture = dayIndex > currentDay;
  const canClaim = isCurrent && !claimed;
  
  // Calculate streak bonus
  const streakBonus = Object.entries(STREAK_BONUSES)
    .reverse()
    .find(([days]) => streak >= parseInt(days));
  
  const finalAmount = reward.amount 
    ? Math.round(reward.amount * (streakBonus ? streakBonus[1].multiplier : 1))
    : null;
  
  return (
    <div
      className={`relative p-2 rounded-xl border-2 transition-all ${
        isCurrent
          ? 'border-yellow-400 bg-yellow-900/30 shadow-lg shadow-yellow-500/30 scale-105 z-10'
          : isPast
            ? claimed
              ? 'border-green-500/50 bg-green-900/20 opacity-60'
              : 'border-gray-600 bg-gray-900/50 opacity-40'
            : 'border-white/20 bg-white/5 opacity-70'
      } ${reward.milestone ? 'ring-2 ring-purple-500/50' : ''}`}
    >
      {/* Day number */}
      <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
        isPast && claimed ? 'bg-green-500 text-white' : 
        isCurrent ? 'bg-yellow-500 text-black' : 
        'bg-white/20 text-white'
      }`}>
        {isPast && claimed ? '✓' : dayIndex + 1}
      </div>
      
      {/* Milestone badge */}
      {reward.milestone && (
        <div className="absolute -top-2 -right-2 text-sm">
          {reward.legendary ? '👑' : '🌟'}
        </div>
      )}
      
      {/* Reward icon */}
      <div className={`text-2xl text-center mb-1 ${isFuture ? 'grayscale' : ''}`}>
        {reward.icon}
      </div>
      
      {/* Reward info */}
      <div className="text-center">
        {reward.amount ? (
          <p className={`text-xs font-bold ${isCurrent ? 'text-yellow-400' : 'text-white/70'}`}>
            {finalAmount?.toLocaleString()}
          </p>
        ) : (
          <p className={`text-[9px] font-medium ${isCurrent ? 'text-yellow-400' : 'text-white/70'}`}>
            {reward.item}
          </p>
        )}
      </div>
      
      {/* Claim button overlay */}
      {canClaim && (
        <button
          onClick={onClaim}
          className="absolute inset-0 flex items-center justify-center bg-yellow-500/90 rounded-xl text-black font-bold text-xs animate-pulse"
        >
          CLAIM!
        </button>
      )}
    </div>
  );
};

// Main Daily Login Component
const DailyLoginRewards = ({ onClose }) => {
  const store = useGameStore();
  const [loginData, setLoginData] = useState({
    lastLogin: null,
    currentDay: 0,
    streak: 0,
    claimedToday: false,
    claimedDays: [],
  });
  const [showClaimAnimation, setShowClaimAnimation] = useState(false);
  const [claimedReward, setClaimedReward] = useState(null);
  
  // Load login data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gofish_daily_login');
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toDateString();
      const lastLogin = data.lastLogin;
      
      // Check if it's a new day
      if (lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Check if streak continues
        if (lastLogin === yesterday.toDateString()) {
          // Continue streak
          setLoginData({
            ...data,
            currentDay: (data.currentDay + 1) % 30,
            streak: data.streak + 1,
            claimedToday: false,
          });
        } else if (lastLogin !== today) {
          // Streak broken, but not if first time
          setLoginData({
            ...data,
            currentDay: data.lastLogin ? 0 : data.currentDay,
            streak: data.lastLogin ? 1 : data.streak,
            claimedToday: false,
          });
        }
      } else {
        setLoginData(data);
      }
    }
  }, []);
  
  // Get current streak bonus
  const currentStreakBonus = useMemo(() => {
    const entry = Object.entries(STREAK_BONUSES)
      .reverse()
      .find(([days]) => loginData.streak >= parseInt(days));
    return entry ? entry[1] : null;
  }, [loginData.streak]);
  
  // Handle claim
  const handleClaim = useCallback(() => {
    const reward = DAILY_REWARDS[loginData.currentDay];
    const today = new Date().toDateString();
    
    // Calculate final reward with streak bonus
    const multiplier = currentStreakBonus?.multiplier || 1;
    const finalAmount = reward.amount ? Math.round(reward.amount * multiplier) : null;
    
    // Grant reward
    if (finalAmount) {
      store.addScore(finalAmount);
    }
    
    // Update login data
    const newData = {
      ...loginData,
      lastLogin: today,
      claimedToday: true,
      claimedDays: [...loginData.claimedDays, loginData.currentDay],
    };
    setLoginData(newData);
    localStorage.setItem('gofish_daily_login', JSON.stringify(newData));
    
    // Show animation
    setClaimedReward({ ...reward, finalAmount });
    setShowClaimAnimation(true);
    setTimeout(() => setShowClaimAnimation(false), 2000);
  }, [loginData, currentStreakBonus, store]);
  
  // Days until next milestone
  const nextMilestone = useMemo(() => {
    const milestones = DAILY_REWARDS.filter(r => r.milestone).map(r => r.day);
    return milestones.find(d => d > loginData.currentDay + 1);
  }, [loginData.currentDay]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fade-in" data-testid="daily-login">
      <div className="w-full max-w-2xl max-h-[90vh] bg-gradient-to-b from-amber-900/80 to-orange-900/80 rounded-3xl overflow-hidden border-2 border-yellow-500/40 shadow-2xl shadow-orange-500/30">
        
        {/* Claim Animation Overlay */}
        {showClaimAnimation && claimedReward && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in">
            <div className="text-center animate-scale-pop">
              <div className="text-8xl mb-4 animate-bounce">{claimedReward.icon}</div>
              <h2 className="text-3xl font-bold text-yellow-400 mb-2">CLAIMED!</h2>
              {claimedReward.finalAmount ? (
                <p className="text-2xl text-white">+{claimedReward.finalAmount.toLocaleString()} Points</p>
              ) : (
                <p className="text-xl text-white">{claimedReward.item}</p>
              )}
              {currentStreakBonus && (
                <p className="text-sm text-orange-400 mt-2">
                  {currentStreakBonus.icon} {currentStreakBonus.multiplier}x Streak Bonus!
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4 flex items-center justify-between border-b border-yellow-400/30">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📅</span>
            <div>
              <h2 className="text-xl font-bold text-white font-pixel">DAILY REWARDS</h2>
              <p className="text-xs text-yellow-200">Login every day for amazing rewards!</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white font-bold text-xl transition-all"
          >
            ×
          </button>
        </div>
        
        {/* Streak Info */}
        <div className="p-4 bg-black/30 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] text-white/50 uppercase">Current Streak</p>
              <p className="text-2xl font-bold text-orange-400">
                {loginData.streak} {currentStreakBonus?.icon || '🔥'}
              </p>
            </div>
            {currentStreakBonus && (
              <div className="px-3 py-1 bg-orange-900/50 rounded-lg border border-orange-500/30">
                <p className="text-xs text-orange-400 font-bold">{currentStreakBonus.name}</p>
                <p className="text-[10px] text-white/60">{currentStreakBonus.multiplier}x bonus</p>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/50 uppercase">Day</p>
            <p className="text-2xl font-bold text-yellow-400">{loginData.currentDay + 1}/30</p>
          </div>
        </div>
        
        {/* Next Milestone */}
        {nextMilestone && (
          <div className="px-4 py-2 bg-purple-900/30 border-b border-purple-500/20 flex items-center justify-center gap-2">
            <span className="text-lg">🎯</span>
            <p className="text-sm text-purple-300">
              Next milestone in <span className="font-bold text-purple-400">{nextMilestone - loginData.currentDay - 1} days</span>
            </p>
          </div>
        )}
        
        {/* Calendar Grid */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-7 gap-2">
            {DAILY_REWARDS.map((reward, i) => (
              <RewardCard
                key={i}
                reward={reward}
                dayIndex={i}
                currentDay={loginData.currentDay}
                claimed={loginData.claimedDays.includes(i) || (i === loginData.currentDay && loginData.claimedToday)}
                onClaim={handleClaim}
                streak={loginData.streak}
              />
            ))}
          </div>
          
          {/* Week Labels */}
          <div className="flex justify-around mt-4 text-[10px] text-white/30 uppercase">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </div>
        
        {/* Streak Progress */}
        <div className="p-4 bg-black/30 border-t border-white/10">
          <p className="text-xs text-white/50 mb-2">Streak Milestones:</p>
          <div className="flex gap-2">
            {Object.entries(STREAK_BONUSES).map(([days, bonus]) => (
              <div
                key={days}
                className={`flex-1 p-2 rounded-lg text-center ${
                  loginData.streak >= parseInt(days)
                    ? 'bg-orange-900/50 border border-orange-500/50'
                    : 'bg-white/5 border border-white/10 opacity-50'
                }`}
              >
                <p className="text-sm">{bonus.icon}</p>
                <p className="text-[10px] text-white/70">{days}d</p>
                <p className="text-[8px] text-orange-400">{bonus.multiplier}x</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyLoginRewards;
