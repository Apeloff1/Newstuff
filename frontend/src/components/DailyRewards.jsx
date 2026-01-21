// ========== GO FISH! DAILY REWARDS COMPONENT ==========
// Login bonuses, streaks, and daily reward calendar

import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { retroSounds } from '../lib/audioManager';

// Reward type icons
const REWARD_ICONS = {
  coins: '🪙',
  gems: '💎',
  energy: '⚡',
  bait: '🪱',
  mystery_box: '📦',
  legendary_box: '🎁',
  lucky_ticket: '🎟️',
  rare_lure: '🎣',
  premium_currency: '💰',
};

// Milestone rewards
const MILESTONES = {
  7: { name: 'Weekly Warrior', icon: '🎖️' },
  14: { name: 'Dedicated Fisher', icon: '🏅' },
  21: { name: 'True Angler', icon: '🎗️' },
  28: { name: 'Fishing Legend', icon: '👑' },
};

// Daily Reward Card
const RewardCard = ({ day, reward, isClaimed, isToday, isLocked, isPremium, onClaim }) => {
  const isMilestone = MILESTONES[day];
  
  return (
    <div 
      className={`relative p-2 rounded-xl border-2 transition-all ${
        isClaimed 
          ? 'bg-green-500/20 border-green-500/50 opacity-70' 
          : isToday 
            ? 'bg-yellow-500/30 border-yellow-400 animate-pulse shadow-lg shadow-yellow-500/30' 
            : isLocked 
              ? 'bg-white/5 border-white/10 opacity-50' 
              : 'bg-white/10 border-white/20'
      } ${isMilestone ? 'ring-2 ring-purple-500/50' : ''}`}
      data-testid={`daily-reward-day-${day}`}
    >
      {/* Day Number */}
      <div className="text-center mb-1">
        <span className={`text-[10px] font-bold ${
          isToday ? 'text-yellow-400' : isClaimed ? 'text-green-400' : 'text-white/60'
        }`}>
          Day {day}
        </span>
      </div>
      
      {/* Reward Icon */}
      <div className="flex justify-center mb-1">
        <span className="text-2xl">{REWARD_ICONS[reward.type] || '🎁'}</span>
      </div>
      
      {/* Amount */}
      <div className="text-center">
        <span className={`text-xs font-bold ${
          isPremium ? 'text-purple-400' : 'text-white'
        }`}>
          {isPremium ? `×${reward.premium_amount}` : `×${reward.amount}`}
        </span>
      </div>
      
      {/* Claimed Check */}
      {isClaimed && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
          <span className="text-2xl">✓</span>
        </div>
      )}
      
      {/* Milestone Badge */}
      {isMilestone && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white">
          <span className="text-xs">{MILESTONES[day].icon}</span>
        </div>
      )}
      
      {/* Today Claim Button */}
      {isToday && !isClaimed && (
        <button 
          onClick={onClaim}
          className="absolute inset-0 flex items-center justify-center bg-yellow-500/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity"
        >
          <span className="text-lg font-bold text-yellow-400">TAP!</span>
        </button>
      )}
    </div>
  );
};

// Main Daily Rewards Component
const DailyRewards = ({ onClose }) => {
  const store = useGameStore();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [claimedReward, setClaimedReward] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  
  const userId = store.userId;
  
  // Load daily reward status
  const loadStatus = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/rewards/daily/status/${userId}`);
      const data = await response.json();
      setStatus(data);
      setIsPremium(data.status?.is_premium || false);
    } catch (err) {
      console.error('Failed to load daily rewards:', err);
    }
    setLoading(false);
  }, [userId]);
  
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);
  
  // Claim daily reward
  const handleClaim = async () => {
    if (claiming || !status?.can_claim) return;
    
    setClaiming(true);
    retroSounds.select();
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/rewards/daily/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.detail || 'Failed to claim');
        setClaiming(false);
        return;
      }
      
      const data = await response.json();
      
      // Show celebration
      setClaimedReward(data.reward);
      setShowCelebration(true);
      retroSounds.achievement();
      
      // Update store if coins
      if (data.reward.type === 'coins') {
        store.addScore(data.reward.amount);
      }
      
      // Reload status
      setTimeout(() => {
        loadStatus();
        setShowCelebration(false);
        setClaiming(false);
      }, 2000);
      
    } catch (err) {
      console.error('Failed to claim:', err);
      setClaiming(false);
    }
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  const rewards = status?.all_rewards || [];
  const currentDay = status?.current_day || 1;
  const streak = status?.status?.current_streak || 0;
  const maxStreak = status?.status?.max_streak || 0;
  const claimedDays = new Set(
    (status?.status?.claimed_days || []).map(d => {
      const date = new Date(d);
      const today = new Date();
      const dayDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
      return currentDay - dayDiff;
    }).filter(d => d > 0 && d <= 30)
  );
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" data-testid="daily-rewards">
      {/* Celebration Overlay */}
      {showCelebration && claimedReward && (
        <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/60 pointer-events-none">
          <div className="text-center animate-scale-pop">
            <span className="text-8xl block mb-4">{REWARD_ICONS[claimedReward.type]}</span>
            <p className="text-3xl font-bold text-yellow-400 font-pixel">+{claimedReward.amount}</p>
            <p className="text-white text-lg mt-2">Daily Reward Claimed!</p>
          </div>
        </div>
      )}
      
      <div className="glass-panel rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto border-2 border-yellow-500/30 animate-modal">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📅</span>
            <div>
              <h2 className="text-2xl font-bold gradient-text font-pixel">DAILY REWARDS</h2>
              <p className="text-white/60 text-sm">Login daily for bonuses!</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-3xl">×</button>
        </div>
        
        {/* Streak Display */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl p-4 mb-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🔥</span>
              <div>
                <p className="text-orange-400 text-sm font-bold">CURRENT STREAK</p>
                <p className="text-3xl font-bold text-white">{streak} <span className="text-lg text-white/60">days</span></p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">Best Streak</p>
              <p className="text-xl font-bold text-yellow-400">{maxStreak} days</p>
            </div>
          </div>
        </div>
        
        {/* Claim Button (if available) */}
        {status?.can_claim && (
          <button 
            onClick={handleClaim}
            disabled={claiming}
            className={`w-full py-4 mb-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              claiming 
                ? 'bg-gray-500 text-white/60' 
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white animate-pulse'
            }`}
            data-testid="claim-daily-reward"
          >
            {claiming ? (
              'Claiming...'
            ) : (
              <>
                <span>🎁</span>
                <span>CLAIM DAY {currentDay} REWARD!</span>
              </>
            )}
          </button>
        )}
        
        {/* Already Claimed Message */}
        {!status?.can_claim && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 mb-6 text-center">
            <p className="text-green-400">✓ Today's reward claimed!</p>
            <p className="text-white/60 text-sm">Come back tomorrow for more!</p>
          </div>
        )}
        
        {/* Calendar Grid */}
        <div className="mb-4">
          <p className="text-white/60 text-sm mb-2">30-Day Reward Calendar</p>
          <div className="grid grid-cols-7 gap-2">
            {rewards.slice(0, 28).map((reward, i) => {
              const day = i + 1;
              const isClaimed = day < currentDay || (day === currentDay && !status?.can_claim);
              const isToday = day === currentDay && status?.can_claim;
              const isLocked = day > currentDay;
              
              return (
                <RewardCard
                  key={day}
                  day={day}
                  reward={reward}
                  isClaimed={isClaimed}
                  isToday={isToday}
                  isLocked={isLocked}
                  isPremium={isPremium}
                  onClaim={handleClaim}
                />
              );
            })}
          </div>
        </div>
        
        {/* Final Days (29-30) */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {rewards.slice(28, 30).map((reward, i) => {
            const day = 29 + i;
            const isClaimed = day < currentDay;
            const isToday = day === currentDay && status?.can_claim;
            const isLocked = day > currentDay;
            
            return (
              <div 
                key={day}
                className={`p-3 rounded-xl border-2 text-center ${
                  isClaimed 
                    ? 'bg-green-500/20 border-green-500/50' 
                    : isToday 
                      ? 'bg-yellow-500/30 border-yellow-400 animate-pulse' 
                      : 'bg-white/10 border-white/20 opacity-50'
                }`}
              >
                <p className="text-xs text-white/60 mb-1">Day {day}</p>
                <span className="text-3xl block mb-1">{REWARD_ICONS[reward.type]}</span>
                <p className="text-white font-bold">×{isPremium ? reward.premium_amount : reward.amount}</p>
                {isClaimed && <span className="text-green-400">✓</span>}
              </div>
            );
          })}
        </div>
        
        {/* Milestone Rewards */}
        <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30 mb-4">
          <p className="text-purple-400 font-bold mb-3">🏆 Milestone Bonuses</p>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(MILESTONES).map(([day, milestone]) => {
              const reached = streak >= parseInt(day);
              return (
                <div 
                  key={day}
                  className={`p-2 rounded-lg text-center ${reached ? 'bg-purple-500/30' : 'bg-white/5 opacity-60'}`}
                >
                  <span className="text-xl">{milestone.icon}</span>
                  <p className="text-[10px] text-white/80">{milestone.name}</p>
                  <p className="text-[10px] text-purple-400">Day {day}</p>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Premium Banner */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl p-4 border border-purple-500/50 text-center">
            <p className="text-purple-300 font-bold mb-1">👑 PREMIUM REWARDS</p>
            <p className="text-white/70 text-sm mb-2">Get 2x daily rewards with Premium!</p>
            <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-bold text-white text-sm">
              Upgrade Now
            </button>
          </div>
        )}
        
        <button 
          onClick={onClose}
          className="w-full mt-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DailyRewards;
