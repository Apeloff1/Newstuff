import React, { useState, useEffect, useMemo, useCallback } from 'react';

// ========================================================================
// AAA QUALITY ENHANCED LEADERBOARD SYSTEM
// Global rankings with filters, seasons, and detailed stats
// ========================================================================

// Leaderboard categories
const LEADERBOARD_CATEGORIES = {
  SCORE: { id: 'score', name: 'High Score', icon: '🏆', description: 'Total points earned' },
  CATCHES: { id: 'catches', name: 'Fish Caught', icon: '🐟', description: 'Total fish caught' },
  RARE: { id: 'rare', name: 'Rare Catches', icon: '💎', description: 'Rare fish caught' },
  STREAK: { id: 'streak', name: 'Best Streak', icon: '🔥', description: 'Longest combo streak' },
  PERFECT: { id: 'perfect', name: 'Perfect Catches', icon: '⭐', description: 'Perfect catch count' },
  SPEED: { id: 'speed', name: 'Speed Run', icon: '⚡', description: 'Fastest 10 catches' },
};

// Time filters
const TIME_FILTERS = {
  ALL: { id: 'all', name: 'All Time', icon: '♾️' },
  SEASON: { id: 'season', name: 'This Season', icon: '📅' },
  WEEKLY: { id: 'weekly', name: 'This Week', icon: '📆' },
  DAILY: { id: 'daily', name: 'Today', icon: '☀️' },
};

// Mock leaderboard data generator
const generateMockLeaderboard = (category, count = 100) => {
  const names = [
    'FishMaster99', 'OceanKing', 'ReelDeal', 'CatchMeNow', 'BassHunter',
    'TroutSlayer', 'PikeChaser', 'SalmonQueen', 'DeepSeaDiver', 'SurfCaster',
    'HookLegend', 'BaitKing', 'NetPro', 'TideRider', 'WaveWalker',
    'AquaAce', 'SeaShark', 'RiverRat', 'LakeMonster', 'PondPro',
    'CarpCatcher', 'TunaTerminator', 'MarlinMaster', 'SwordfishSlayer', 'GoldfishGuru',
  ];
  
  const avatars = ['🎣', '🐟', '🐠', '🐡', '🦈', '🐳', '🐬', '🦑', '🐙', '🦐'];
  
  return [...Array(count)].map((_, i) => ({
    rank: i + 1,
    id: `user_${i}`,
    username: names[i % names.length] + (i >= names.length ? Math.floor(i / names.length) : ''),
    avatar: avatars[i % avatars.length],
    score: Math.max(1, Math.floor(100000 / (i + 1) + Math.random() * 1000)),
    catches: Math.max(1, Math.floor(5000 / (i + 1) + Math.random() * 100)),
    level: Math.max(1, Math.floor(100 / (i + 1) * 5)),
    country: ['🇺🇸', '🇬🇧', '🇯🇵', '🇰🇷', '🇩🇪', '🇫🇷', '🇧🇷', '🇦🇺', '🇨🇦', '🇮🇳'][i % 10],
    badge: i < 3 ? ['👑', '🥈', '🥉'][i] : null,
    isOnline: Math.random() > 0.7,
    lastActive: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
  }));
};

// Rank badge component
const RankBadge = ({ rank }) => {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return <span className="text-lg font-bold text-white/60">#{rank}</span>;
};

// Player row component
const PlayerRow = ({ player, isCurrentUser, onClick }) => (
  <div 
    onClick={() => onClick?.(player)}
    className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
      isCurrentUser 
        ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/50' 
        : 'bg-white/5 hover:bg-white/10 border border-transparent'
    }`}
  >
    {/* Rank */}
    <div className="w-12 flex justify-center">
      <RankBadge rank={player.rank} />
    </div>
    
    {/* Avatar & Name */}
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
          {player.avatar}
        </div>
        {player.isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-bold truncate ${isCurrentUser ? 'text-yellow-400' : 'text-white'}`}>
            {player.username}
          </p>
          <span className="text-sm">{player.country}</span>
          {player.badge && <span className="text-sm">{player.badge}</span>}
        </div>
        <p className="text-xs text-white/50">Level {player.level}</p>
      </div>
    </div>
    
    {/* Score */}
    <div className="text-right">
      <p className="font-bold text-yellow-400">{player.score.toLocaleString()}</p>
      <p className="text-xs text-white/50">{player.catches} catches</p>
    </div>
  </div>
);

// Top 3 podium component
const TopThreePodium = ({ players }) => (
  <div className="flex justify-center items-end gap-4 mb-6 h-48">
    {/* 2nd Place */}
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-3xl mb-2 ring-4 ring-gray-400/50">
        {players[1]?.avatar || '🐟'}
      </div>
      <p className="text-sm font-bold text-white truncate max-w-[80px]">{players[1]?.username || '-'}</p>
      <p className="text-xs text-gray-400">{players[1]?.score?.toLocaleString() || 0}</p>
      <div className="w-20 h-24 bg-gradient-to-t from-gray-500 to-gray-400 rounded-t-lg mt-2 flex items-center justify-center">
        <span className="text-4xl">🥈</span>
      </div>
    </div>
    
    {/* 1st Place */}
    <div className="flex flex-col items-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-4xl mb-2 ring-4 ring-yellow-400/50 animate-pulse">
        {players[0]?.avatar || '👑'}
      </div>
      <p className="text-base font-bold text-yellow-400 truncate max-w-[100px]">{players[0]?.username || '-'}</p>
      <p className="text-sm text-yellow-300">{players[0]?.score?.toLocaleString() || 0}</p>
      <div className="w-24 h-32 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg mt-2 flex items-center justify-center">
        <span className="text-5xl">🥇</span>
      </div>
    </div>
    
    {/* 3rd Place */}
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-3xl mb-2 ring-4 ring-orange-400/50">
        {players[2]?.avatar || '🐟'}
      </div>
      <p className="text-sm font-bold text-white truncate max-w-[80px]">{players[2]?.username || '-'}</p>
      <p className="text-xs text-orange-300">{players[2]?.score?.toLocaleString() || 0}</p>
      <div className="w-20 h-20 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-lg mt-2 flex items-center justify-center">
        <span className="text-4xl">🥉</span>
      </div>
    </div>
  </div>
);

// Player detail modal
const PlayerDetailModal = ({ player, onClose }) => {
  if (!player) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6 w-full max-w-sm border-2 border-white/20">
        <div className="text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl mx-auto mb-3 ring-4 ring-blue-400/30">
            {player.avatar}
          </div>
          <h3 className="text-xl font-bold text-white">{player.username}</h3>
          <p className="text-white/50">Rank #{player.rank} {player.country}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-xs text-white/50">Score</p>
            <p className="text-lg font-bold text-yellow-400">{player.score.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-xs text-white/50">Catches</p>
            <p className="text-lg font-bold text-green-400">{player.catches.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-xs text-white/50">Level</p>
            <p className="text-lg font-bold text-blue-400">{player.level}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-xs text-white/50">Status</p>
            <p className={`text-lg font-bold ${player.isOnline ? 'text-green-400' : 'text-gray-400'}`}>
              {player.isOnline ? '🟢 Online' : '⚫ Offline'}
            </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl font-bold text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Main Enhanced Leaderboard Component
const EnhancedLeaderboard = ({ onClose, currentUserId = 'user_42' }) => {
  const [category, setCategory] = useState('score');
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load leaderboard data
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const data = generateMockLeaderboard(category, 100);
      // Add current user somewhere in the list
      const userIndex = data.findIndex(p => p.id === currentUserId);
      if (userIndex === -1) {
        data[41] = {
          ...data[41],
          id: currentUserId,
          username: 'You',
          isCurrentUser: true,
        };
      }
      setLeaderboardData(data);
      setIsLoading(false);
    }, 500);
  }, [category, timeFilter, currentUserId]);
  
  // Filter by search
  const filteredData = useMemo(() => {
    if (!searchQuery) return leaderboardData;
    return leaderboardData.filter(p => 
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leaderboardData, searchQuery]);
  
  // Get current user's rank
  const currentUserRank = useMemo(() => {
    const user = leaderboardData.find(p => p.id === currentUserId);
    return user?.rank || 0;
  }, [leaderboardData, currentUserId]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" data-testid="enhanced-leaderboard">
      <div className="w-full max-w-2xl max-h-[90vh] bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl overflow-hidden border-2 border-blue-500/40 shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h2 className="text-xl font-bold text-white font-pixel">LEADERBOARD</h2>
              <p className="text-xs text-blue-200">Your Rank: #{currentUserRank}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/30 text-white font-bold">×</button>
        </div>
        
        {/* Category tabs */}
        <div className="p-4 border-b border-white/10 overflow-x-auto">
          <div className="flex gap-2">
            {Object.values(LEADERBOARD_CATEGORIES).map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                  category === cat.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Time filter & search */}
        <div className="p-4 border-b border-white/10 flex gap-3 items-center">
          <div className="flex gap-1">
            {Object.values(TIME_FILTERS).map(filter => (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  timeFilter === filter.id
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 rounded-lg text-white text-sm placeholder-white/40 border border-white/10 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        
        {/* Top 3 podium */}
        {!searchQuery && !isLoading && (
          <div className="p-4 bg-gradient-to-b from-slate-800/50 to-transparent">
            <TopThreePodium players={filteredData.slice(0, 3)} />
          </div>
        )}
        
        {/* Player list */}
        <div className="p-4 overflow-y-auto max-h-[40vh]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredData.slice(searchQuery ? 0 : 3).map(player => (
                <PlayerRow
                  key={player.id}
                  player={player}
                  isCurrentUser={player.id === currentUserId}
                  onClick={setSelectedPlayer}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Player detail modal */}
        <PlayerDetailModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      </div>
    </div>
  );
};

export { EnhancedLeaderboard, LEADERBOARD_CATEGORIES, TIME_FILTERS };
export default EnhancedLeaderboard;
