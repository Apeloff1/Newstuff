import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { PixelFish } from './GameSprites';

// Bubble component
const Bubble = ({ delay, x }) => (
  <div 
    className="absolute w-2 h-2 md:w-3 md:h-3 rounded-full bg-white/30 animate-bubble"
    style={{ 
      left: `${x}%`, 
      bottom: '-10px',
      animationDelay: `${delay}s`,
      animationDuration: `${3 + Math.random() * 2}s`
    }}
  />
);

// Seaweed component
const Seaweed = ({ x, height, delay }) => (
  <svg 
    className="absolute bottom-0 animate-sway"
    style={{ left: `${x}%`, animationDelay: `${delay}s` }}
    width="20" 
    height={height} 
    viewBox={`0 0 20 ${height}`}
  >
    <path 
      d={`M10,${height} Q5,${height * 0.7} 10,${height * 0.5} Q15,${height * 0.3} 10,${height * 0.1} Q8,0 12,0`}
      fill="none"
      stroke="#2d6a4f"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path 
      d={`M10,${height} Q5,${height * 0.7} 10,${height * 0.5} Q15,${height * 0.3} 10,${height * 0.1} Q8,0 12,0`}
      fill="none"
      stroke="#40916c"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Sand/gravel at bottom
const AquariumFloor = () => (
  <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16">
    <svg width="100%" height="100%" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#a68a2c" />
        </linearGradient>
      </defs>
      <path 
        d="M0,20 Q50,10 100,18 Q150,25 200,15 Q250,10 300,20 Q350,28 400,15 L400,60 L0,60 Z" 
        fill="url(#sandGradient)"
        className="w-full"
        style={{ transform: 'scaleX(4)' }}
      />
    </svg>
    {/* Pebbles */}
    {[...Array(15)].map((_, i) => (
      <div 
        key={i}
        className="absolute rounded-full"
        style={{
          left: `${5 + i * 6}%`,
          bottom: `${8 + Math.random() * 20}px`,
          width: `${8 + Math.random() * 12}px`,
          height: `${6 + Math.random() * 8}px`,
          background: ['#8b7355', '#a0522d', '#6b5344', '#9e9e9e'][i % 4],
          opacity: 0.7 + Math.random() * 0.3
        }}
      />
    ))}
  </div>
);

// Coral decoration
const Coral = ({ x, type }) => {
  const colors = ['#ff6b6b', '#f8a5c2', '#f368e0', '#ff9ff3'];
  return (
    <div className="absolute bottom-10" style={{ left: `${x}%` }}>
      {type === 0 && (
        <svg width="40" height="50" viewBox="0 0 40 50">
          <ellipse cx="10" cy="10" rx="8" ry="10" fill={colors[0]} />
          <ellipse cx="25" cy="15" rx="10" ry="12" fill={colors[1]} />
          <ellipse cx="15" cy="25" rx="7" ry="8" fill={colors[2]} />
          <rect x="12" y="30" width="6" height="20" fill="#a0522d" rx="2" />
        </svg>
      )}
      {type === 1 && (
        <svg width="35" height="45" viewBox="0 0 35 45">
          <path d="M17,0 L5,20 L12,18 L8,35 L17,30 L26,35 L22,18 L29,20 Z" fill={colors[3]} />
          <rect x="14" y="30" width="6" height="15" fill="#8b7355" rx="2" />
        </svg>
      )}
    </div>
  );
};

// Treasure chest
const TreasureChest = () => (
  <div className="absolute bottom-12 right-[15%]">
    <svg width="50" height="40" viewBox="0 0 50 40">
      <rect x="5" y="15" width="40" height="25" rx="3" fill="#8b4513" stroke="#654321" strokeWidth="2" />
      <rect x="5" y="10" width="40" height="10" rx="3" fill="#a0522d" stroke="#654321" strokeWidth="2" />
      <rect x="20" y="20" width="10" height="8" rx="1" fill="#ffd700" />
      <circle cx="25" cy="24" r="2" fill="#b8860b" />
      {/* Gold coins peeking out */}
      <circle cx="15" cy="14" r="4" fill="#ffd700" className="animate-pulse" />
      <circle cx="35" cy="13" r="3" fill="#ffd700" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
    </svg>
  </div>
);

// Swimming fish in aquarium
const SwimmingFish = ({ fish, index, totalFish }) => {
  const [position, setPosition] = useState({
    x: Math.random() * 80 + 10,
    y: Math.random() * 50 + 15,
    direction: Math.random() > 0.5 ? 1 : -1,
    speed: 0.3 + Math.random() * 0.5,
    verticalOffset: Math.random() * Math.PI * 2
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        let newX = prev.x + (prev.speed * prev.direction);
        let newDirection = prev.direction;
        
        // Bounce off walls
        if (newX > 90) {
          newDirection = -1;
          newX = 90;
        } else if (newX < 5) {
          newDirection = 1;
          newX = 5;
        }
        
        // Gentle vertical bobbing
        const verticalBob = Math.sin(Date.now() * 0.001 + prev.verticalOffset) * 2;
        
        return {
          ...prev,
          x: newX,
          y: Math.max(15, Math.min(70, prev.y + verticalBob * 0.1)),
          direction: newDirection
        };
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  // Size based on fish rarity
  const size = 25 + (fish.rarity || 1) * 8;

  return (
    <div 
      className="absolute transition-all duration-100 z-10"
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        transform: `scaleX(${position.direction}) translateX(-50%)`,
      }}
    >
      <div className="relative group cursor-pointer">
        <PixelFish 
          color={fish.color || '#FFD700'} 
          size={size} 
          wiggle 
        />
        {/* Fish info tooltip on hover */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <div className="bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap border border-white/20">
            <div className="font-bold">{fish.name}</div>
            <div className="text-yellow-400">{fish.size?.toFixed?.(1) || fish.size}cm</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Light rays from top
const LightRays = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(5)].map((_, i) => (
      <div 
        key={i}
        className="absolute top-0 h-full opacity-10 animate-light-ray"
        style={{
          left: `${15 + i * 18}%`,
          width: '60px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 70%)',
          transform: 'skewX(-15deg)',
          animationDelay: `${i * 0.5}s`
        }}
      />
    ))}
  </div>
);

// Main Aquarium View Component
const AquariumView = ({ onClose }) => {
  const store = useGameStore();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  
  // Get fish from tacklebox (limit to 20 for performance)
  const tackleboxFish = useMemo(() => {
    const items = store.tacklebox?.items || [];
    let filtered = [...items];
    
    // Apply filter
    if (filter !== 'all') {
      const rarityMap = { 'common': 1, 'uncommon': 2, 'rare': 3, 'legendary': 4 };
      filtered = filtered.filter(f => f.rarity >= rarityMap[filter]);
    }
    
    // Apply sort
    if (sortBy === 'size') {
      filtered.sort((a, b) => (b.size || 0) - (a.size || 0));
    } else if (sortBy === 'rarity') {
      filtered.sort((a, b) => (b.rarity || 0) - (a.rarity || 0));
    } else if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.caughtAt) - new Date(a.caughtAt));
    }
    
    return filtered.slice(0, 20);
  }, [store.tacklebox?.items, filter, sortBy]);

  // Generate bubbles
  const bubbles = useMemo(() => 
    [...Array(15)].map((_, i) => ({
      x: 5 + Math.random() * 90,
      delay: Math.random() * 5
    })), 
  []);

  // Generate seaweed
  const seaweeds = useMemo(() => 
    [...Array(8)].map((_, i) => ({
      x: 3 + i * 12 + Math.random() * 5,
      height: 40 + Math.random() * 40,
      delay: Math.random() * 2
    })), 
  []);

  const stats = store.getTackleboxStats?.() || {
    totalFishCaught: store.tacklebox?.totalFishCaught || 0,
    uniqueTypes: Object.keys(store.tacklebox?.fishByType || {}).length,
    rareFishCount: store.tacklebox?.rareFishCount || 0,
    totalItems: store.tacklebox?.items?.length || 0
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fade-in" data-testid="aquarium-view">
      <div className="relative w-full max-w-4xl h-[80vh] max-h-[600px] rounded-3xl overflow-hidden border-4 border-cyan-600/50 shadow-2xl shadow-cyan-500/30">
        
        {/* Aquarium glass effect border */}
        <div className="absolute inset-0 rounded-3xl border-8 border-cyan-900/30 pointer-events-none z-30" />
        
        {/* Water background gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #0a4a6e 0%, #0d5c87 30%, #115e89 50%, #0a4a6e 100%)'
          }}
        />
        
        {/* Light rays */}
        <LightRays />
        
        {/* Bubbles */}
        {bubbles.map((bubble, i) => (
          <Bubble key={i} x={bubble.x} delay={bubble.delay} />
        ))}
        
        {/* Seaweed */}
        {seaweeds.map((sw, i) => (
          <Seaweed key={i} x={sw.x} height={sw.height} delay={sw.delay} />
        ))}
        
        {/* Corals */}
        <Coral x={10} type={0} />
        <Coral x={75} type={1} />
        
        {/* Treasure chest */}
        <TreasureChest />
        
        {/* Aquarium floor */}
        <AquariumFloor />
        
        {/* Swimming fish */}
        {tackleboxFish.length > 0 ? (
          tackleboxFish.map((fish, i) => (
            <SwimmingFish key={fish.id || i} fish={fish} index={i} totalFish={tackleboxFish.length} />
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center text-white/60 glass-panel px-8 py-6 rounded-2xl">
              <div className="text-4xl mb-3">🐟</div>
              <p className="text-lg font-bold">Your aquarium is empty!</p>
              <p className="text-sm mt-2">Catch some fish to see them swim here.</p>
            </div>
          </div>
        )}
        
        {/* Top UI Panel */}
        <div className="absolute top-0 left-0 right-0 p-4 z-30">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="glass-panel px-4 py-2 rounded-xl border border-cyan-400/30">
              <h2 className="text-xl md:text-2xl font-bold font-pixel text-cyan-300 flex items-center gap-2">
                <span className="text-2xl">🐠</span>
                MY AQUARIUM
              </h2>
            </div>
            
            {/* Close button */}
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white font-bold text-xl transition-all border-2 border-red-400"
              data-testid="close-aquarium-button"
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Bottom Stats Panel */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-30">
          <div className="glass-panel rounded-2xl p-4 border border-cyan-400/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Stats */}
              <div className="flex gap-4 md:gap-6">
                <div className="text-center">
                  <p className="text-[10px] text-cyan-300/60 uppercase tracking-wider">Fish in Tank</p>
                  <p className="text-lg md:text-xl font-bold text-cyan-400 font-pixel">{tackleboxFish.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-cyan-300/60 uppercase tracking-wider">Total Caught</p>
                  <p className="text-lg md:text-xl font-bold text-green-400 font-pixel">{stats.totalFishCaught}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-cyan-300/60 uppercase tracking-wider">Species</p>
                  <p className="text-lg md:text-xl font-bold text-yellow-400 font-pixel">{stats.uniqueTypes}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-cyan-300/60 uppercase tracking-wider">Rare Fish</p>
                  <p className="text-lg md:text-xl font-bold text-purple-400 font-pixel">{stats.rareFishCount}</p>
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex gap-2">
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-cyan-900/50 text-white text-xs px-3 py-2 rounded-lg border border-cyan-500/30 cursor-pointer"
                  data-testid="aquarium-filter"
                >
                  <option value="all">All Fish</option>
                  <option value="common">Common+</option>
                  <option value="uncommon">Uncommon+</option>
                  <option value="rare">Rare+</option>
                  <option value="legendary">Legendary</option>
                </select>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-cyan-900/50 text-white text-xs px-3 py-2 rounded-lg border border-cyan-500/30 cursor-pointer"
                  data-testid="aquarium-sort"
                >
                  <option value="recent">Recent</option>
                  <option value="size">Size</option>
                  <option value="rarity">Rarity</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom CSS for aquarium animations */}
      <style>{`
        @keyframes bubble {
          0% { 
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-200px) scale(1.2);
            opacity: 0.4;
          }
          100% { 
            transform: translateY(-500px) scale(0.8);
            opacity: 0;
          }
        }
        
        @keyframes sway {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        
        @keyframes light-ray {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        
        .animate-bubble {
          animation: bubble 4s ease-in-out infinite;
        }
        
        .animate-sway {
          animation: sway 3s ease-in-out infinite;
          transform-origin: bottom center;
        }
        
        .animate-light-ray {
          animation: light-ray 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AquariumView;
