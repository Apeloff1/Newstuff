// ========== GO FISH! QUEST LOG COMPONENT ==========
// Daily quests, weekly missions, and story progression

import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { retroSounds } from '../lib/audioManager';

// Quest difficulty colors
const DIFFICULTY_COLORS = {
  easy: 'from-green-500 to-emerald-500',
  normal: 'from-blue-500 to-cyan-500',
  hard: 'from-orange-500 to-red-500',
  legendary: 'from-purple-500 to-pink-500',
};

const DIFFICULTY_ICONS = {
  easy: '⭐',
  normal: '⭐⭐',
  hard: '⭐⭐⭐',
  legendary: '👑',
};

// Objective type descriptions
const OBJECTIVE_DESCRIPTIONS = {
  catch_fish: 'Catch {target} fish',
  catch_type: 'Catch {target} {fish_type}',
  catch_size: 'Catch a fish larger than {target}cm',
  catch_rarity: 'Catch {target} rare fish',
  catch_stage: 'Catch {target} fish in stage {stage}',
  perfect_catch: 'Get {target} perfect catches',
  combo: 'Achieve a {target}x combo',
  score: 'Score {target} points',
  send_gift: 'Send {target} gifts',
  tournament_join: 'Join {target} tournaments',
};

// Quest Card Component
const QuestCard = ({ quest, onClaim }) => {
  const questData = quest.quest_data || quest;
  const progress = quest.objectives_progress || [];
  const objectives = questData.objectives || [];
  const rewards = questData.rewards || {};
  
  const isCompleted = quest.status === 'completed';
  const isClaimed = !!quest.claimed_at;
  
  // Calculate overall progress
  const totalProgress = objectives.reduce((sum, obj, i) => sum + Math.min(progress[i] || 0, obj.target), 0);
  const totalTarget = objectives.reduce((sum, obj) => sum + obj.target, 0);
  const progressPercent = totalTarget > 0 ? (totalProgress / totalTarget) * 100 : 0;
  
  return (
    <div 
      className={`p-4 rounded-xl border-2 transition-all ${
        isClaimed 
          ? 'bg-white/5 border-white/10 opacity-60' 
          : isCompleted 
            ? 'bg-green-500/20 border-green-500/50 animate-pulse' 
            : 'bg-white/10 border-white/20 hover:border-white/40'
      }`}
      data-testid={`quest-card-${quest.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r ${DIFFICULTY_COLORS[questData.difficulty || 'normal']} text-white`}>
              {DIFFICULTY_ICONS[questData.difficulty || 'normal']} {(questData.difficulty || 'normal').toUpperCase()}
            </span>
            {questData.quest_type === 'daily' && <span className="text-xs text-yellow-400">Daily</span>}
            {questData.quest_type === 'weekly' && <span className="text-xs text-purple-400">Weekly</span>}
            {questData.quest_type === 'story' && <span className="text-xs text-cyan-400">Story</span>}
          </div>
          <h3 className="text-white font-bold">{questData.name}</h3>
          <p className="text-white/60 text-sm">{questData.description}</p>
        </div>
        
        {isClaimed && (
          <span className="text-2xl">✅</span>
        )}
      </div>
      
      {/* Objectives */}
      <div className="space-y-2 mb-3">
        {objectives.map((obj, i) => {
          const current = Math.min(progress[i] || 0, obj.target);
          const percent = (current / obj.target) * 100;
          
          // Generate description
          let desc = OBJECTIVE_DESCRIPTIONS[obj.type] || obj.type;
          desc = desc.replace('{target}', obj.target);
          if (obj.fish_type) desc = desc.replace('{fish_type}', obj.fish_type);
          if (obj.stage !== undefined) desc = desc.replace('{stage}', ['Sunny Lake', 'Sunset River', 'Deep Ocean', 'Storm Sea'][obj.stage] || obj.stage);
          
          return (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-white/80">{desc}</span>
                <span className={`font-bold ${current >= obj.target ? 'text-green-400' : 'text-white/60'}`}>
                  {current}/{obj.target}
                </span>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    current >= obj.target ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Rewards */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">Rewards:</span>
          {rewards.coins && <span className="text-xs text-yellow-400">🪙 {rewards.coins}</span>}
          {rewards.gems && <span className="text-xs text-purple-400">💎 {rewards.gems}</span>}
          {rewards.xp && <span className="text-xs text-cyan-400">⭐ {rewards.xp} XP</span>}
          {rewards.bait && <span className="text-xs text-green-400">🪱 {rewards.bait}</span>}
        </div>
        
        {isCompleted && !isClaimed && (
          <button 
            onClick={() => onClaim(quest)}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-bold text-white text-sm animate-pulse"
          >
            Claim!
          </button>
        )}
      </div>
    </div>
  );
};

// Story Quest Card
const StoryQuestCard = ({ quest, onStart, activeQuest }) => {
  const isAvailable = quest.status === 'available';
  const isCompleted = quest.status === 'completed';
  const isLocked = quest.status === 'locked';
  const isActive = activeQuest?.quest_data?.id === quest.id;
  
  return (
    <div 
      className={`p-4 rounded-xl border-2 transition-all ${
        isCompleted 
          ? 'bg-green-500/20 border-green-500/50' 
          : isActive 
            ? 'bg-yellow-500/20 border-yellow-500/50 ring-2 ring-yellow-500/50' 
            : isAvailable 
              ? 'bg-white/10 border-white/30 hover:border-white/50 cursor-pointer' 
              : 'bg-white/5 border-white/10 opacity-50'
      }`}
      onClick={() => isAvailable && !isActive && onStart(quest)}
      data-testid={`story-quest-${quest.id}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
          isCompleted ? 'bg-green-500/30' : isActive ? 'bg-yellow-500/30' : isAvailable ? 'bg-blue-500/30' : 'bg-white/10'
        }`}>
          {isCompleted ? '✅' : isLocked ? '🔒' : isActive ? '▶️' : `${quest.chapter}`}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-xs">Chapter {quest.chapter}</span>
            {isActive && <span className="text-yellow-400 text-xs font-bold">IN PROGRESS</span>}
          </div>
          <h3 className={`font-bold ${isLocked ? 'text-white/40' : 'text-white'}`}>{quest.name}</h3>
          <p className={`text-sm ${isLocked ? 'text-white/30' : 'text-white/60'}`}>{quest.description}</p>
        </div>
      </div>
      
      {/* Active Quest Progress */}
      {isActive && activeQuest && (
        <div className="mt-3 pt-3 border-t border-white/10">
          {activeQuest.quest_data?.objectives?.map((obj, i) => {
            const current = activeQuest.objectives_progress?.[i] || 0;
            const percent = (current / obj.target) * 100;
            return (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">{OBJECTIVE_DESCRIPTIONS[obj.type]?.replace('{target}', obj.target) || obj.type}</span>
                  <span className="text-white/60">{current}/{obj.target}</span>
                </div>
                <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Rewards preview */}
      {!isLocked && quest.rewards && (
        <div className="flex items-center gap-2 mt-2 text-xs">
          {quest.rewards.coins && <span className="text-yellow-400">🪙 {quest.rewards.coins}</span>}
          {quest.rewards.gems && <span className="text-purple-400">💎 {quest.rewards.gems}</span>}
          {quest.rewards.xp && <span className="text-cyan-400">⭐ {quest.rewards.xp} XP</span>}
          {quest.rewards.lure_unlock && <span className="text-green-400">🎣 New Lure!</span>}
          {quest.rewards.rod_unlock && <span className="text-orange-400">🎣 New Rod!</span>}
        </div>
      )}
    </div>
  );
};

// Main Quest Log Component
const QuestLog = ({ onClose }) => {
  const store = useGameStore();
  const [activeTab, setActiveTab] = useState('daily');
  const [dailyQuests, setDailyQuests] = useState([]);
  const [weeklyQuests, setWeeklyQuests] = useState([]);
  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const userId = store.userId;
  
  // Load quests
  const loadQuests = useCallback(async () => {
    try {
      // Load daily quests
      const dailyRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/quests/daily/${userId}`);
      const dailyData = await dailyRes.json();
      setDailyQuests(dailyData.quests || []);
      
      // Load weekly quests
      const weeklyRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/quests/weekly/${userId}`);
      const weeklyData = await weeklyRes.json();
      setWeeklyQuests(weeklyData.quests || []);
      
      // Load story progress
      const storyRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/quests/story/${userId}`);
      const storyD = await storyRes.json();
      setStoryData(storyD);
      
    } catch (err) {
      console.error('Failed to load quests:', err);
    }
    setLoading(false);
  }, [userId]);
  
  useEffect(() => {
    loadQuests();
  }, [loadQuests]);
  
  // Claim reward
  const handleClaim = async (quest) => {
    retroSounds.select();
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/quests/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, quest_id: quest.id })
      });
      
      if (response.ok) {
        const data = await response.json();
        retroSounds.achievement();
        
        // Update local score if coins rewarded
        if (data.rewards?.coins) {
          store.addScore(data.rewards.coins);
        }
        
        // Reload quests
        loadQuests();
      }
    } catch (err) {
      console.error('Failed to claim reward:', err);
    }
  };
  
  // Start story quest
  const handleStartStory = async (quest) => {
    retroSounds.select();
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/quests/story/${userId}/start/${quest.id}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        retroSounds.cast();
        loadQuests();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to start quest');
      }
    } catch (err) {
      console.error('Failed to start story quest:', err);
    }
  };
  
  // Calculate completion stats
  const dailyCompleted = dailyQuests.filter(q => q.claimed_at).length;
  const weeklyCompleted = weeklyQuests.filter(q => q.claimed_at).length;
  const storyCompleted = storyData?.completed?.length || 0;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" data-testid="quest-log">
      <div className="glass-panel rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto border-2 border-cyan-500/30 animate-modal">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📜</span>
            <div>
              <h2 className="text-2xl font-bold gradient-text font-pixel">QUESTS</h2>
              <p className="text-white/60 text-sm">Complete missions for rewards!</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-3xl">×</button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1 ${
              activeTab === 'daily' ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <span>📅</span>
            <span>Daily</span>
            <span className="text-xs">({dailyCompleted}/{dailyQuests.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1 ${
              activeTab === 'weekly' ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <span>📆</span>
            <span>Weekly</span>
            <span className="text-xs">({weeklyCompleted}/{weeklyQuests.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('story')}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1 ${
              activeTab === 'story' ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <span>📖</span>
            <span>Story</span>
            <span className="text-xs">({storyCompleted}/6)</span>
          </button>
        </div>
        
        {/* Content */}
        {loading ? (
          <div className="text-center py-12 text-white/60">Loading quests...</div>
        ) : (
          <div className="space-y-3">
            {activeTab === 'daily' && (
              <>
                {dailyQuests.length === 0 ? (
                  <div className="text-center py-8 text-white/60">No daily quests available.</div>
                ) : (
                  dailyQuests.map(quest => (
                    <QuestCard key={quest.id} quest={quest} onClaim={handleClaim} />
                  ))
                )}
                <div className="text-center text-white/40 text-xs mt-4">
                  Resets daily at midnight UTC
                </div>
              </>
            )}
            
            {activeTab === 'weekly' && (
              <>
                {weeklyQuests.length === 0 ? (
                  <div className="text-center py-8 text-white/60">No weekly quests available.</div>
                ) : (
                  weeklyQuests.map(quest => (
                    <QuestCard key={quest.id} quest={quest} onClaim={handleClaim} />
                  ))
                )}
                <div className="text-center text-white/40 text-xs mt-4">
                  Resets every Monday at midnight UTC
                </div>
              </>
            )}
            
            {activeTab === 'story' && storyData && (
              <>
                <div className="bg-cyan-500/10 rounded-xl p-3 mb-4 border border-cyan-500/30">
                  <p className="text-cyan-400 text-sm font-bold">Chapter {storyData.current_chapter || 1}</p>
                  <p className="text-white/60 text-xs">Complete quests to unlock new chapters!</p>
                </div>
                
                {storyData.story_quests?.map(quest => (
                  <StoryQuestCard 
                    key={quest.id} 
                    quest={quest} 
                    onStart={handleStartStory}
                    activeQuest={storyData.active_quest}
                  />
                ))}
              </>
            )}
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

export default QuestLog;
