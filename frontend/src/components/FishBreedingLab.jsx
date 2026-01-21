import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { PixelFish } from './GameSprites';
import { FISH_DATABASE, RARITY_TIERS, getFishById } from '../lib/fishData';

// ========================================================================
// FISH BREEDING LAB - AAA Quality Fish Breeding/Evolution System
// ========================================================================

// Breeding combinations and results
const BREEDING_COMBINATIONS = [
  { parent1: 'Minnow', parent2: 'Goldfish', result: 'Golden Minnow', chance: 0.3 },
  { parent1: 'Bass', parent2: 'Perch', result: 'Striped Perch', chance: 0.25 },
  { parent1: 'Catfish', parent2: 'Carp', result: 'Whisker Carp', chance: 0.2 },
  { parent1: 'Trout', parent2: 'Salmon', result: 'Silver Trout', chance: 0.15 },
  { parent1: 'Pike', parent2: 'Muskie', result: 'Tiger Pike', chance: 0.1 },
  { parent1: 'Golden Koi', parent2: 'Golden Koi', result: 'Phoenix Koi', chance: 0.01 },
];

// Evolution paths
const EVOLUTION_PATHS = {
  'Minnow': { level: 10, evolves: 'Perch', cost: 500 },
  'Perch': { level: 25, evolves: 'Bass', cost: 1500 },
  'Bass': { level: 50, evolves: 'Largemouth Bass', cost: 5000 },
  'Catfish': { level: 30, evolves: 'Blue Catfish', cost: 3000 },
  'Goldfish': { level: 20, evolves: 'Golden Koi', cost: 10000 },
};

// Tank decorations
const TANK_DECORATIONS = [
  { id: 1, name: 'Coral Castle', price: 500, bonus: { breedingSpeed: 1.1 } },
  { id: 2, name: 'Bubble Chest', price: 750, bonus: { successRate: 1.05 } },
  { id: 3, name: 'Mystical Plant', price: 1000, bonus: { xpGain: 1.2 } },
  { id: 4, name: 'Golden Statue', price: 2500, bonus: { breedingSpeed: 1.25, successRate: 1.1 } },
  { id: 5, name: 'Ancient Ruins', price: 5000, bonus: { all: 1.15 } },
];

// DNA Strand visualization component
const DNAStrand = ({ color1, color2, animated }) => (
  <svg width="60" height="100" viewBox="0 0 60 100" className={animated ? 'animate-spin-slow' : ''}>
    <defs>
      <linearGradient id={`dna-grad-${color1}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color1} />
        <stop offset="100%" stopColor={color2} />
      </linearGradient>
    </defs>
    {[...Array(8)].map((_, i) => (
      <g key={i} transform={`translate(0, ${i * 12})`}>
        <ellipse cx="15" cy="6" rx="12" ry="4" fill={color1} opacity={0.8 - i * 0.05} />
        <ellipse cx="45" cy="6" rx="12" ry="4" fill={color2} opacity={0.8 - i * 0.05} />
        <line x1="20" y1="6" x2="40" y2="6" stroke="#fff" strokeWidth="2" opacity={0.5} />
      </g>
    ))}
  </svg>
);

// Breeding Tank component
const BreedingTank = ({ fish1, fish2, onRemove, progress, isBreeding }) => (
  <div className="relative bg-gradient-to-b from-cyan-900/50 to-blue-900/50 rounded-2xl p-4 border-2 border-cyan-500/30 min-h-[200px]">
    {/* Water effect */}
    <div className="absolute inset-0 overflow-hidden rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent" />
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white/30 animate-bubble"
          style={{
            left: `${10 + i * 9}%`,
            bottom: '-10px',
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${2 + Math.random()}s`
          }}
        />
      ))}
    </div>
    
    {/* Fish slots */}
    <div className="relative z-10 flex justify-around items-center h-40">
      {/* Fish 1 slot */}
      <div className={`w-24 h-24 rounded-xl border-2 border-dashed ${fish1 ? 'border-green-400 bg-green-900/30' : 'border-white/30 bg-white/5'} flex items-center justify-center transition-all`}>
        {fish1 ? (
          <div className="relative group cursor-pointer" onClick={() => !isBreeding && onRemove(1)}>
            <PixelFish color={fish1.color} size={50} wiggle />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white whitespace-nowrap">
              {fish1.name}
            </div>
            {!isBreeding && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</div>
            )}
          </div>
        ) : (
          <span className="text-white/40 text-xs">Drop Fish</span>
        )}
      </div>
      
      {/* Heart/breeding indicator */}
      <div className={`text-3xl ${isBreeding ? 'animate-pulse text-pink-400' : 'text-white/30'}`}>
        {isBreeding ? '💕' : '❤️'}
      </div>
      
      {/* Fish 2 slot */}
      <div className={`w-24 h-24 rounded-xl border-2 border-dashed ${fish2 ? 'border-green-400 bg-green-900/30' : 'border-white/30 bg-white/5'} flex items-center justify-center transition-all`}>
        {fish2 ? (
          <div className="relative group cursor-pointer" onClick={() => !isBreeding && onRemove(2)}>
            <PixelFish color={fish2.color} size={50} wiggle />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white whitespace-nowrap">
              {fish2.name}
            </div>
            {!isBreeding && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</div>
            )}
          </div>
        ) : (
          <span className="text-white/40 text-xs">Drop Fish</span>
        )}
      </div>
    </div>
    
    {/* Progress bar */}
    {isBreeding && (
      <div className="relative z-10 mt-4">
        <div className="h-3 bg-black/40 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-xs text-white/60 mt-1">Breeding... {Math.round(progress)}%</p>
      </div>
    )}
  </div>
);

// Fish Selection Grid
const FishSelectionGrid = ({ fish, onSelect, selectedIds }) => (
  <div className="grid grid-cols-5 gap-2 max-h-[200px] overflow-y-auto p-2 bg-black/20 rounded-xl">
    {fish.length === 0 ? (
      <div className="col-span-5 text-center py-8 text-white/40">
        <p className="text-2xl mb-2">🐟</p>
        <p className="text-sm">No fish available for breeding</p>
        <p className="text-xs">Catch more fish to start breeding!</p>
      </div>
    ) : (
      fish.map((f, i) => (
        <button
          key={f.id || i}
          onClick={() => onSelect(f)}
          disabled={selectedIds.includes(f.id)}
          className={`p-2 rounded-lg border-2 transition-all ${
            selectedIds.includes(f.id)
              ? 'border-yellow-400 bg-yellow-900/30 opacity-50'
              : 'border-white/20 bg-white/5 hover:border-cyan-400 hover:bg-cyan-900/30'
          }`}
        >
          <PixelFish color={f.color} size={30} />
          <p className="text-[8px] text-white truncate mt-1">{f.name}</p>
        </button>
      ))
    )}
  </div>
);

// Evolution Card
const EvolutionCard = ({ fish, evolution, onEvolve, canAfford, xpLevel }) => (
  <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-xl p-4 border border-purple-500/30">
    <div className="flex items-center gap-4">
      {/* Current fish */}
      <div className="text-center">
        <PixelFish color={fish.color} size={40} />
        <p className="text-xs text-white mt-1">{fish.name}</p>
        <p className="text-[10px] text-purple-300">Lv.{xpLevel}</p>
      </div>
      
      {/* Arrow */}
      <div className="text-2xl text-purple-400 animate-pulse">→</div>
      
      {/* Evolved fish */}
      <div className="text-center">
        <div className={xpLevel >= evolution.level ? 'opacity-100' : 'opacity-30'}>
          <PixelFish color="#FFD700" size={50} wiggle={xpLevel >= evolution.level} />
        </div>
        <p className="text-xs text-yellow-400 mt-1">{evolution.evolves}</p>
        <p className="text-[10px] text-purple-300">Req: Lv.{evolution.level}</p>
      </div>
    </div>
    
    {/* Evolve button */}
    <button
      onClick={onEvolve}
      disabled={xpLevel < evolution.level || !canAfford}
      className={`w-full mt-4 py-2 rounded-lg font-bold text-sm transition-all ${
        xpLevel >= evolution.level && canAfford
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400'
          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
      }`}
    >
      {xpLevel < evolution.level ? `Need Lv.${evolution.level}` : `Evolve (${evolution.cost} pts)`}
    </button>
  </div>
);

// Main Fish Breeding Lab Component
const FishBreedingLab = ({ onClose }) => {
  const store = useGameStore();
  const [activeTab, setActiveTab] = useState('breed'); // breed, evolve, results
  const [breedingSlot1, setBreedingSlot1] = useState(null);
  const [breedingSlot2, setBreedingSlot2] = useState(null);
  const [isBreeding, setIsBreeding] = useState(false);
  const [breedingProgress, setBreedingProgress] = useState(0);
  const [breedingResult, setBreedingResult] = useState(null);
  const [breedingHistory, setBreedingHistory] = useState([]);
  const breedingInterval = useRef(null);
  
  // Get available fish for breeding (from tacklebox)
  const availableFish = useMemo(() => {
    const items = store.tacklebox?.items || [];
    // Group by type and take unique fish
    const uniqueFish = [];
    const seenTypes = new Set();
    
    items.forEach(fish => {
      if (!seenTypes.has(fish.name)) {
        seenTypes.add(fish.name);
        uniqueFish.push(fish);
      }
    });
    
    return uniqueFish.slice(0, 30); // Limit to 30 for performance
  }, [store.tacklebox?.items]);
  
  const selectedIds = useMemo(() => {
    const ids = [];
    if (breedingSlot1) ids.push(breedingSlot1.id);
    if (breedingSlot2) ids.push(breedingSlot2.id);
    return ids;
  }, [breedingSlot1, breedingSlot2]);
  
  // Handle fish selection
  const handleSelectFish = useCallback((fish) => {
    if (!breedingSlot1) {
      setBreedingSlot1(fish);
    } else if (!breedingSlot2 && fish.id !== breedingSlot1.id) {
      setBreedingSlot2(fish);
    }
  }, [breedingSlot1]);
  
  // Remove fish from slot
  const handleRemoveFish = useCallback((slot) => {
    if (slot === 1) setBreedingSlot1(null);
    else setBreedingSlot2(null);
    setBreedingResult(null);
  }, []);
  
  // Start breeding
  const startBreeding = useCallback(() => {
    if (!breedingSlot1 || !breedingSlot2 || isBreeding) return;
    
    setIsBreeding(true);
    setBreedingProgress(0);
    setBreedingResult(null);
    
    // Simulate breeding progress
    breedingInterval.current = setInterval(() => {
      setBreedingProgress(prev => {
        if (prev >= 100) {
          clearInterval(breedingInterval.current);
          completeBreeding();
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  }, [breedingSlot1, breedingSlot2, isBreeding]);
  
  // Complete breeding
  const completeBreeding = useCallback(() => {
    setIsBreeding(false);
    
    // Check for special combinations
    const combo = BREEDING_COMBINATIONS.find(
      c => (c.parent1 === breedingSlot1?.name && c.parent2 === breedingSlot2?.name) ||
           (c.parent1 === breedingSlot2?.name && c.parent2 === breedingSlot1?.name)
    );
    
    let result;
    if (combo && Math.random() < combo.chance) {
      // Special offspring!
      result = {
        name: combo.result,
        color: '#FFD700',
        rarity: 3,
        points: 500,
        special: true,
        parents: [breedingSlot1?.name, breedingSlot2?.name]
      };
    } else {
      // Regular offspring - inherits traits from parents
      const inheritedColor = Math.random() > 0.5 ? breedingSlot1?.color : breedingSlot2?.color;
      const inheritedRarity = Math.max(
        (breedingSlot1?.rarity || 0),
        (breedingSlot2?.rarity || 0)
      );
      
      result = {
        name: `${breedingSlot1?.name?.split(' ')[0]} ${breedingSlot2?.name?.split(' ').pop()}`,
        color: inheritedColor,
        rarity: Math.min(inheritedRarity + (Math.random() > 0.8 ? 1 : 0), 4),
        points: Math.round(((breedingSlot1?.points || 10) + (breedingSlot2?.points || 10)) * 0.75),
        special: false,
        parents: [breedingSlot1?.name, breedingSlot2?.name]
      };
    }
    
    setBreedingResult(result);
    setBreedingHistory(prev => [result, ...prev.slice(0, 9)]);
  }, [breedingSlot1, breedingSlot2]);
  
  // Collect offspring
  const collectOffspring = useCallback(() => {
    if (!breedingResult) return;
    
    // Add to tacklebox
    store.addFishToTacklebox({
      ...breedingResult,
      actualSize: 20 + Math.random() * 30,
      caughtAt: new Date().toISOString(),
      bred: true
    });
    
    // Reset slots
    setBreedingSlot1(null);
    setBreedingSlot2(null);
    setBreedingResult(null);
    setBreedingProgress(0);
  }, [breedingResult, store]);
  
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (breedingInterval.current) {
        clearInterval(breedingInterval.current);
      }
    };
  }, []);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fade-in" data-testid="breeding-lab">
      <div className="w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl overflow-hidden border-2 border-purple-500/40 shadow-2xl shadow-purple-500/20">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-4 flex items-center justify-between border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧬</span>
            <div>
              <h2 className="text-xl font-bold text-white font-pixel">FISH BREEDING LAB</h2>
              <p className="text-xs text-purple-300">Create new species through breeding</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white font-bold text-xl transition-all"
            data-testid="close-breeding-lab"
          >
            ×
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {['breed', 'evolve', 'results'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-purple-900/50 text-purple-300 border-b-2 border-purple-400'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {tab === 'breed' && '🐟 Breed'}
              {tab === 'evolve' && '⬆️ Evolve'}
              {tab === 'results' && '📜 History'}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Breeding Tab */}
          {activeTab === 'breed' && (
            <div className="space-y-6">
              {/* Breeding Tank */}
              <BreedingTank
                fish1={breedingSlot1}
                fish2={breedingSlot2}
                onRemove={handleRemoveFish}
                progress={breedingProgress}
                isBreeding={isBreeding}
              />
              
              {/* Result display */}
              {breedingResult && (
                <div className="bg-gradient-to-r from-yellow-900/50 to-amber-900/50 rounded-xl p-4 border-2 border-yellow-500/50 animate-scale-pop">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <PixelFish color={breedingResult.color} size={60} wiggle />
                        {breedingResult.special && (
                          <div className="absolute -top-2 -right-2 text-xl animate-bounce">⭐</div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-yellow-400">{breedingResult.name}</h3>
                        <p className="text-xs text-yellow-300/70">
                          {breedingResult.special ? '✨ Rare Combination!' : 'New Offspring'}
                        </p>
                        <p className="text-xs text-white/60">
                          Parents: {breedingResult.parents.join(' + ')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={collectOffspring}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold text-white hover:from-green-400 hover:to-emerald-400 transition-all"
                    >
                      Collect! 🎉
                    </button>
                  </div>
                </div>
              )}
              
              {/* Breed button */}
              {!breedingResult && (
                <button
                  onClick={startBreeding}
                  disabled={!breedingSlot1 || !breedingSlot2 || isBreeding}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    breedingSlot1 && breedingSlot2 && !isBreeding
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-400 hover:to-purple-400 shadow-lg shadow-pink-500/30'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isBreeding ? 'Breeding in Progress...' : breedingSlot1 && breedingSlot2 ? 'Start Breeding 💕' : 'Select Two Fish to Breed'}
                </button>
              )}
              
              {/* Fish selection */}
              <div>
                <h3 className="text-sm font-bold text-white/70 mb-2 uppercase tracking-wider">Available Fish</h3>
                <FishSelectionGrid
                  fish={availableFish}
                  onSelect={handleSelectFish}
                  selectedIds={selectedIds}
                />
              </div>
              
              {/* Breeding tips */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-sm font-bold text-cyan-400 mb-2">💡 Breeding Tips</h4>
                <ul className="text-xs text-white/60 space-y-1">
                  <li>• Certain fish combinations create rare offspring</li>
                  <li>• Higher rarity parents increase chance of rare babies</li>
                  <li>• Breeding two Golden Koi may create a Phoenix Koi!</li>
                  <li>• Offspring inherit traits from both parents</li>
                </ul>
              </div>
            </div>
          )}
          
          {/* Evolution Tab */}
          {activeTab === 'evolve' && (
            <div className="space-y-4">
              <p className="text-sm text-white/60 mb-4">
                Fish can evolve into stronger forms when they reach certain XP levels.
              </p>
              
              {availableFish.filter(f => EVOLUTION_PATHS[f.name]).length === 0 ? (
                <div className="text-center py-12 text-white/40">
                  <p className="text-4xl mb-4">🐣</p>
                  <p>No fish ready for evolution</p>
                  <p className="text-xs mt-2">Catch fish with evolution paths!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {availableFish
                    .filter(f => EVOLUTION_PATHS[f.name])
                    .map((fish, i) => (
                      <EvolutionCard
                        key={i}
                        fish={fish}
                        evolution={EVOLUTION_PATHS[fish.name]}
                        xpLevel={Math.floor(Math.random() * 30) + 1} // Simulated XP level
                        canAfford={store.score >= EVOLUTION_PATHS[fish.name].cost}
                        onEvolve={() => {
                          // Evolution logic here
                          console.log('Evolving', fish.name);
                        }}
                      />
                    ))}
                </div>
              )}
            </div>
          )}
          
          {/* History Tab */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Breeding History</h3>
              
              {breedingHistory.length === 0 ? (
                <div className="text-center py-12 text-white/40">
                  <p className="text-4xl mb-4">📜</p>
                  <p>No breeding history yet</p>
                  <p className="text-xs mt-2">Start breeding to see results here!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {breedingHistory.map((result, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
                      <PixelFish color={result.color} size={35} />
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{result.name}</p>
                        <p className="text-xs text-white/50">{result.parents.join(' + ')}</p>
                      </div>
                      {result.special && <span className="text-xl">⭐</span>}
                      <span className="text-yellow-400 font-bold text-sm">+{result.points}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FishBreedingLab;
