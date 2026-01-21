import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { PixelFish } from './GameSprites';

// ========================================================================
// SKILL TREE SYSTEM - AAA Quality Player Progression
// ========================================================================

// Skill categories
const SKILL_CATEGORIES = {
  CASTING: { name: 'Casting', icon: '🎯', color: '#3B82F6', description: 'Improve cast distance and accuracy' },
  REELING: { name: 'Reeling', icon: '🔄', color: '#22C55E', description: 'Master the art of reeling' },
  PATIENCE: { name: 'Patience', icon: '⏳', color: '#A855F7', description: 'Wait longer for better catches' },
  STRENGTH: { name: 'Strength', icon: '💪', color: '#EF4444', description: 'Handle bigger fish' },
  LUCK: { name: 'Luck', icon: '🍀', color: '#F59E0B', description: 'Increase rare fish chances' },
  MASTERY: { name: 'Mastery', icon: '👑', color: '#EC4899', description: 'Ultimate fishing abilities' },
};

// Complete skill tree data
const SKILL_TREE = {
  // CASTING TREE
  casting_1: { category: 'CASTING', name: 'Novice Cast', level: 1, maxLevel: 5, cost: [100, 200, 400, 800, 1600], effect: { castDistance: 0.05 }, requires: [], description: '+5% cast distance per level' },
  casting_2: { category: 'CASTING', name: 'Power Cast', level: 1, maxLevel: 3, cost: [500, 1000, 2000], effect: { castPower: 0.1 }, requires: ['casting_1:3'], description: '+10% cast power per level' },
  casting_3: { category: 'CASTING', name: 'Precision', level: 1, maxLevel: 5, cost: [300, 600, 1200, 2400, 4800], effect: { accuracy: 0.08 }, requires: ['casting_1:2'], description: '+8% accuracy per level' },
  casting_4: { category: 'CASTING', name: 'Wind Master', level: 1, maxLevel: 3, cost: [1000, 2000, 4000], effect: { windResist: 0.15 }, requires: ['casting_2:2', 'casting_3:3'], description: 'Ignore 15% wind per level' },
  casting_5: { category: 'CASTING', name: 'Perfect Cast', level: 1, maxLevel: 1, cost: [10000], effect: { perfectCastChance: 0.1 }, requires: ['casting_4:3'], description: '10% chance for perfect cast', ultimate: true },
  
  // REELING TREE
  reeling_1: { category: 'REELING', name: 'Quick Hands', level: 1, maxLevel: 5, cost: [100, 200, 400, 800, 1600], effect: { reelSpeed: 0.05 }, requires: [], description: '+5% reel speed per level' },
  reeling_2: { category: 'REELING', name: 'Tension Control', level: 1, maxLevel: 5, cost: [300, 600, 1200, 2400, 4800], effect: { tensionReduction: 0.06 }, requires: ['reeling_1:2'], description: '-6% tension buildup per level' },
  reeling_3: { category: 'REELING', name: 'Smooth Reel', level: 1, maxLevel: 3, cost: [500, 1000, 2000], effect: { lineBreakResist: 0.1 }, requires: ['reeling_1:3'], description: '+10% line durability per level' },
  reeling_4: { category: 'REELING', name: 'Auto Adjust', level: 1, maxLevel: 3, cost: [1500, 3000, 6000], effect: { autoTension: 0.1 }, requires: ['reeling_2:3', 'reeling_3:2'], description: 'Auto tension management' },
  reeling_5: { category: 'REELING', name: 'Iron Grip', level: 1, maxLevel: 1, cost: [10000], effect: { noBreak: true }, requires: ['reeling_4:3'], description: 'Line never breaks', ultimate: true },
  
  // PATIENCE TREE
  patience_1: { category: 'PATIENCE', name: 'Calm Mind', level: 1, maxLevel: 5, cost: [100, 200, 400, 800, 1600], effect: { biteChance: 0.03 }, requires: [], description: '+3% bite chance per level' },
  patience_2: { category: 'PATIENCE', name: 'Long Wait', level: 1, maxLevel: 3, cost: [400, 800, 1600], effect: { rareChance: 0.05 }, requires: ['patience_1:2'], description: '+5% rare fish per level' },
  patience_3: { category: 'PATIENCE', name: 'Meditation', level: 1, maxLevel: 3, cost: [600, 1200, 2400], effect: { xpGain: 0.1 }, requires: ['patience_1:3'], description: '+10% XP per level' },
  patience_4: { category: 'PATIENCE', name: 'Zen Master', level: 1, maxLevel: 3, cost: [2000, 4000, 8000], effect: { perfectChance: 0.08 }, requires: ['patience_2:2', 'patience_3:2'], description: '+8% perfect catch per level' },
  patience_5: { category: 'PATIENCE', name: 'Time Freeze', level: 1, maxLevel: 1, cost: [10000], effect: { freezeTime: 2 }, requires: ['patience_4:3'], description: '+2s reaction time', ultimate: true },
  
  // STRENGTH TREE
  strength_1: { category: 'STRENGTH', name: 'Muscle Up', level: 1, maxLevel: 5, cost: [100, 200, 400, 800, 1600], effect: { fishSize: 0.05 }, requires: [], description: '+5% max fish size per level' },
  strength_2: { category: 'STRENGTH', name: 'Power Pull', level: 1, maxLevel: 3, cost: [500, 1000, 2000], effect: { pullPower: 0.1 }, requires: ['strength_1:2'], description: '+10% pull power per level' },
  strength_3: { category: 'STRENGTH', name: 'Endurance', level: 1, maxLevel: 5, cost: [300, 600, 1200, 2400, 4800], effect: { stamina: 0.08 }, requires: ['strength_1:3'], description: '+8% stamina per level' },
  strength_4: { category: 'STRENGTH', name: 'Beast Mode', level: 1, maxLevel: 3, cost: [1500, 3000, 6000], effect: { bossChance: 0.05 }, requires: ['strength_2:2', 'strength_3:3'], description: '+5% boss encounter per level' },
  strength_5: { category: 'STRENGTH', name: 'Titan Grip', level: 1, maxLevel: 1, cost: [10000], effect: { giantFish: true }, requires: ['strength_4:3'], description: 'Catch giant fish', ultimate: true },
  
  // LUCK TREE
  luck_1: { category: 'LUCK', name: 'Lucky Charm', level: 1, maxLevel: 5, cost: [100, 200, 400, 800, 1600], effect: { luckBonus: 0.04 }, requires: [], description: '+4% luck per level' },
  luck_2: { category: 'LUCK', name: 'Double Catch', level: 1, maxLevel: 3, cost: [600, 1200, 2400], effect: { doubleCatch: 0.05 }, requires: ['luck_1:2'], description: '+5% double catch per level' },
  luck_3: { category: 'LUCK', name: 'Treasure Finder', level: 1, maxLevel: 3, cost: [500, 1000, 2000], effect: { treasureChance: 0.08 }, requires: ['luck_1:3'], description: '+8% treasure per level' },
  luck_4: { category: 'LUCK', name: 'Rainbow Fish', level: 1, maxLevel: 3, cost: [2000, 4000, 8000], effect: { epicChance: 0.03 }, requires: ['luck_2:2', 'luck_3:2'], description: '+3% epic fish per level' },
  luck_5: { category: 'LUCK', name: 'Golden Touch', level: 1, maxLevel: 1, cost: [10000], effect: { goldenFish: 0.01 }, requires: ['luck_4:3'], description: '1% golden fish chance', ultimate: true },
  
  // MASTERY TREE (requires skills from multiple trees)
  mastery_1: { category: 'MASTERY', name: 'Jack of Trades', level: 1, maxLevel: 3, cost: [5000, 10000, 20000], effect: { allBonus: 0.05 }, requires: ['casting_3:3', 'reeling_3:2', 'patience_3:2'], description: '+5% all stats per level' },
  mastery_2: { category: 'MASTERY', name: 'Fish Whisperer', level: 1, maxLevel: 1, cost: [15000], effect: { fishAffinity: true }, requires: ['mastery_1:2', 'patience_4:2'], description: 'See fish before they bite' },
  mastery_3: { category: 'MASTERY', name: 'Legend', level: 1, maxLevel: 1, cost: [50000], effect: { legendary: true }, requires: ['casting_5:1', 'reeling_5:1', 'patience_5:1', 'strength_5:1', 'luck_5:1'], description: 'Become a fishing legend', ultimate: true },
};

// Skill Node Component
const SkillNode = ({ skillId, skill, currentLevel, onUpgrade, canUpgrade, totalPoints }) => {
  const category = SKILL_CATEGORIES[skill.category];
  const isMaxed = currentLevel >= skill.maxLevel;
  const cost = skill.cost[currentLevel] || skill.cost[skill.cost.length - 1];
  const canAfford = totalPoints >= cost;
  const isLocked = !canUpgrade;
  
  return (
    <div 
      className={`relative group ${skill.ultimate ? 'col-span-2' : ''}`}
      data-testid={`skill-${skillId}`}
    >
      {/* Skill node */}
      <button
        onClick={() => !isMaxed && canUpgrade && canAfford && onUpgrade(skillId)}
        disabled={isMaxed || !canUpgrade || !canAfford}
        className={`relative w-full p-3 rounded-xl border-2 transition-all ${
          isMaxed
            ? 'bg-gradient-to-br from-yellow-500/30 to-amber-500/30 border-yellow-500 shadow-lg shadow-yellow-500/30'
            : isLocked
              ? 'bg-gray-800/50 border-gray-600/50 opacity-50'
              : canAfford
                ? 'bg-white/5 border-white/30 hover:border-cyan-400 hover:bg-cyan-900/30 cursor-pointer'
                : 'bg-white/5 border-white/20 opacity-70'
        } ${skill.ultimate ? 'border-4 border-dashed' : ''}`}
      >
        {/* Icon */}
        <div className={`text-2xl mb-1 ${isLocked ? 'grayscale' : ''}`}>
          {category.icon}
        </div>
        
        {/* Name */}
        <p className={`text-xs font-bold ${isMaxed ? 'text-yellow-400' : 'text-white'}`}>
          {skill.name}
        </p>
        
        {/* Level indicator */}
        <div className="flex justify-center gap-0.5 mt-1">
          {[...Array(skill.maxLevel)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < currentLevel ? 'bg-yellow-400' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        
        {/* Cost */}
        {!isMaxed && (
          <p className={`text-[10px] mt-1 ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
            {cost.toLocaleString()} pts
          </p>
        )}
        
        {/* Ultimate badge */}
        {skill.ultimate && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-[8px] text-white font-bold">
            ULTIMATE
          </div>
        )}
        
        {/* Maxed badge */}
        {isMaxed && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-xs">
            ✓
          </div>
        )}
      </button>
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-gray-900 rounded-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
        <p className="font-bold text-white text-sm mb-1">{skill.name}</p>
        <p className="text-xs text-white/70 mb-2">{skill.description}</p>
        {skill.requires.length > 0 && (
          <p className="text-[10px] text-purple-400">
            Requires: {skill.requires.map(r => {
              const [id, lvl] = r.split(':');
              return `${SKILL_TREE[id]?.name} Lv.${lvl}`;
            }).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};

// Category Section Component
const CategorySection = ({ categoryKey, category, skills, playerSkills, onUpgrade, totalPoints }) => {
  const categorySkills = Object.entries(skills).filter(([_, s]) => s.category === categoryKey);
  
  // Check if requirements are met
  const canUpgradeSkill = (skillId) => {
    const skill = SKILL_TREE[skillId];
    if (skill.requires.length === 0) return true;
    
    return skill.requires.every(req => {
      const [reqId, reqLevel] = req.split(':');
      return (playerSkills[reqId] || 0) >= parseInt(reqLevel);
    });
  };
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
        <span className="text-2xl">{category.icon}</span>
        <div>
          <h3 className="font-bold text-white">{category.name}</h3>
          <p className="text-[10px] text-white/50">{category.description}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {categorySkills.map(([skillId, skill]) => (
          <SkillNode
            key={skillId}
            skillId={skillId}
            skill={skill}
            currentLevel={playerSkills[skillId] || 0}
            canUpgrade={canUpgradeSkill(skillId)}
            onUpgrade={onUpgrade}
            totalPoints={totalPoints}
          />
        ))}
      </div>
    </div>
  );
};

// Main Skill Tree Component
const SkillTree = ({ onClose }) => {
  const store = useGameStore();
  const [playerSkills, setPlayerSkills] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Load saved skills from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gofish_skills');
    if (saved) {
      setPlayerSkills(JSON.parse(saved));
    }
  }, []);
  
  // Calculate total skill points spent
  const totalSpent = useMemo(() => {
    return Object.entries(playerSkills).reduce((total, [skillId, level]) => {
      const skill = SKILL_TREE[skillId];
      if (!skill) return total;
      return total + skill.cost.slice(0, level).reduce((a, b) => a + b, 0);
    }, 0);
  }, [playerSkills]);
  
  // Calculate total effects
  const totalEffects = useMemo(() => {
    const effects = {};
    Object.entries(playerSkills).forEach(([skillId, level]) => {
      const skill = SKILL_TREE[skillId];
      if (!skill || level === 0) return;
      
      Object.entries(skill.effect).forEach(([effectKey, effectValue]) => {
        if (typeof effectValue === 'number') {
          effects[effectKey] = (effects[effectKey] || 0) + (effectValue * level);
        } else {
          effects[effectKey] = effectValue;
        }
      });
    });
    return effects;
  }, [playerSkills]);
  
  // Handle skill upgrade
  const handleUpgrade = useCallback((skillId) => {
    const skill = SKILL_TREE[skillId];
    const currentLevel = playerSkills[skillId] || 0;
    const cost = skill.cost[currentLevel];
    
    if (store.score < cost) return;
    if (currentLevel >= skill.maxLevel) return;
    
    // Deduct points and upgrade skill
    store.addScore(-cost);
    const newSkills = { ...playerSkills, [skillId]: currentLevel + 1 };
    setPlayerSkills(newSkills);
    localStorage.setItem('gofish_skills', JSON.stringify(newSkills));
  }, [playerSkills, store]);
  
  // Reset all skills
  const handleReset = useCallback(() => {
    if (window.confirm('Reset all skills? You will get 80% of spent points back.')) {
      const refund = Math.floor(totalSpent * 0.8);
      store.addScore(refund);
      setPlayerSkills({});
      localStorage.setItem('gofish_skills', JSON.stringify({}));
    }
  }, [totalSpent, store]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fade-in" data-testid="skill-tree">
      <div className="w-full max-w-5xl max-h-[90vh] bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl overflow-hidden border-2 border-indigo-500/40 shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-4 flex items-center justify-between border-b border-indigo-500/30">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌳</span>
            <div>
              <h2 className="text-xl font-bold text-white font-pixel">SKILL TREE</h2>
              <p className="text-xs text-indigo-300">Upgrade your fishing abilities</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-white/50">Available Points</p>
              <p className="text-lg font-bold text-yellow-400">{store.score.toLocaleString()}</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white font-bold text-xl transition-all"
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="p-4 bg-black/30 border-b border-white/10 flex items-center gap-6 overflow-x-auto">
          <div className="text-center min-w-[80px]">
            <p className="text-[10px] text-white/50 uppercase">Skills Unlocked</p>
            <p className="text-lg font-bold text-cyan-400">{Object.keys(playerSkills).length}</p>
          </div>
          <div className="text-center min-w-[80px]">
            <p className="text-[10px] text-white/50 uppercase">Points Spent</p>
            <p className="text-lg font-bold text-purple-400">{totalSpent.toLocaleString()}</p>
          </div>
          <div className="flex-1" />
          <button
            onClick={handleReset}
            disabled={totalSpent === 0}
            className="px-4 py-2 bg-red-900/50 hover:bg-red-800/50 text-red-400 text-xs font-bold rounded-lg border border-red-500/30 transition-all disabled:opacity-50"
          >
            Reset Skills (80% refund)
          </button>
        </div>
        
        {/* Active Effects */}
        {Object.keys(totalEffects).length > 0 && (
          <div className="p-4 bg-green-900/20 border-b border-green-500/20">
            <p className="text-xs text-green-400 font-bold mb-2">ACTIVE BONUSES:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(totalEffects).map(([key, value]) => (
                <span key={key} className="px-2 py-1 bg-green-900/50 rounded text-[10px] text-green-300">
                  {key}: {typeof value === 'number' ? `+${(value * 100).toFixed(0)}%` : '✓'}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Skill Trees */}
        <div className="p-6 overflow-y-auto max-h-[55vh]">
          {Object.entries(SKILL_CATEGORIES).map(([categoryKey, category]) => (
            <CategorySection
              key={categoryKey}
              categoryKey={categoryKey}
              category={category}
              skills={SKILL_TREE}
              playerSkills={playerSkills}
              onUpgrade={handleUpgrade}
              totalPoints={store.score}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillTree;
