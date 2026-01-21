// ========== GO FISH! TOURNAMENT COMPONENT ==========
// Competitive fishing tournaments with leaderboards and rewards

import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { apiService } from '../lib/api';
import { PixelFish } from './GameSprites';
import { retroSounds } from '../lib/audioManager';

// Tournament types
const TOURNAMENT_TYPES = {
  daily: { name: 'Daily', icon: '📅', color: 'from-blue-500 to-cyan-500' },
  weekly: { name: 'Weekly', icon: '📆', color: 'from-purple-500 to-pink-500' },
  special: { name: 'Special', icon: '⭐', color: 'from-yellow-500 to-orange-500' },
  guild: { name: 'Guild', icon: '🏰', color: 'from-green-500 to-emerald-500' },
};

// Reward tier icons
const TROPHY_ICONS = {
  gold: '🥇',
  silver: '🥈', 
  bronze: '🥉',
  participation: '🎖️',
};

// Tournament Card Component
const TournamentCard = ({ tournament, onJoin, isJoined, myEntry }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const typeConfig = TOURNAMENT_TYPES[tournament.tournament_type] || TOURNAMENT_TYPES.daily;
  
  useEffect(() => {
    const updateTime = () => {
      const end = new Date(tournament.end_time);
      const now = new Date();
      const diff = end - now;
      
      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 24) {
        setTimeLeft(`${Math.floor(hours / 24)}d ${hours % 24}h`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [tournament.end_time]);
  
  return (
    <div 
      className={`relative overflow-hidden rounded-2xl border-2 border-white/20 bg-gradient-to-br ${typeConfig.color} p-4 transition-all hover:scale-[1.02] hover:border-white/40`}
      data-testid={`tournament-card-${tournament.id}`}
    >
      {/* Tournament Type Badge */}
      <div className="absolute top-2 right-2 bg-black/30 rounded-full px-2 py-1 text-xs flex items-center gap-1">
        <span>{typeConfig.icon}</span>
        <span className="text-white/80">{typeConfig.name}</span>
      </div>
      
      {/* Tournament Info */}
      <div className="mb-3">
        <h3 className="text-lg font-bold text-white truncate pr-16">{tournament.name}</h3>
        <p className="text-white/70 text-xs line-clamp-2">{tournament.description}</p>
      </div>
      
      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-3 text-sm">
        <div className="flex items-center gap-1">
          <span>👥</span>
          <span className="text-white">{tournament.current_participants}/{tournament.max_participants}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>⏱️</span>
          <span className="text-white">{timeLeft}</span>
        </div>
        {tournament.entry_fee > 0 && (
          <div className="flex items-center gap-1">
            <span>🪙</span>
            <span className="text-yellow-300">{tournament.entry_fee}</span>
          </div>
        )}
      </div>
      
      {/* My Entry (if joined) */}
      {isJoined && myEntry && (
        <div className="bg-black/30 rounded-xl p-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/70">Your Position</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-yellow-400">#{myEntry.rank || '—'}</span>
              <span className="text-white text-sm">{myEntry.score?.toLocaleString() || 0} pts</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Rewards Preview */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-white/60">Rewards:</span>
        <div className="flex gap-1">
          {tournament.reward_tiers?.slice(0, 3).map((tier, i) => (
            <span key={i} className="text-lg">{TROPHY_ICONS[tier.trophy_type] || '🎖️'}</span>
          ))}
        </div>
      </div>
      
      {/* Action Button */}
      {isJoined ? (
        <button 
          className="w-full py-2 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white text-sm transition-all"
          onClick={() => onJoin(tournament, 'view')}
        >
          View Leaderboard
        </button>
      ) : (
        <button 
          className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-white text-sm transition-all"
          onClick={() => onJoin(tournament, 'join')}
        >
          {tournament.entry_fee > 0 ? `Join (${tournament.entry_fee} 🪙)` : 'Join Free'}
        </button>
      )}
    </div>
  );
};

// Leaderboard Modal
const LeaderboardModal = ({ tournament, onClose, myEntry }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tournaments/${tournament.id}/leaderboard?limit=50`);
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      }
      setLoading(false);
    };
    loadLeaderboard();
  }, [tournament.id]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-backdrop" onClick={onClose}>
      <div 
        className="glass-panel rounded-3xl p-6 w-full max-w-lg max-h-[85vh] overflow-auto border-2 border-yellow-500/30 animate-modal"
        onClick={e => e.stopPropagation()}
        data-testid="tournament-leaderboard-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">{tournament.name}</h2>
            <p className="text-white/60 text-sm">{TOURNAMENT_TYPES[tournament.tournament_type]?.name} Tournament</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">×</button>
        </div>
        
        {/* My Position Highlight */}
        {myEntry && (
          <div className="bg-yellow-500/20 border-2 border-yellow-500/50 rounded-xl p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-yellow-400">#{myEntry.rank || '—'}</span>
              <div>
                <p className="text-white font-bold">{myEntry.username}</p>
                <p className="text-white/60 text-xs">Your Position</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-yellow-400 font-bold">{myEntry.score?.toLocaleString()}</p>
              <p className="text-white/60 text-xs">{myEntry.fish_caught} fish</p>
            </div>
          </div>
        )}
        
        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-8 text-white/60">Loading...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 text-white/60">No participants yet. Be the first!</div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, i) => (
              <div 
                key={entry.user_id || i}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  i < 3 
                    ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border border-yellow-500/30' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    i === 0 ? 'bg-yellow-500 text-black' :
                    i === 1 ? 'bg-gray-300 text-black' :
                    i === 2 ? 'bg-amber-600 text-white' :
                    'bg-white/10 text-white/60'
                  }`}>
                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : entry.rank || i + 1}
                  </span>
                  <div>
                    <p className="text-white font-medium">{entry.username}</p>
                    <p className="text-white/50 text-xs">{entry.fish_caught} fish • Best: {entry.biggest_fish}cm</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold">{entry.score?.toLocaleString()}</p>
                  {entry.perfect_catches > 0 && (
                    <p className="text-green-400 text-xs">✨ {entry.perfect_catches} perfect</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Rewards Section */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <h3 className="text-white font-bold mb-3">Rewards</h3>
          <div className="grid grid-cols-2 gap-2">
            {tournament.reward_tiers?.map((tier, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span>{TROPHY_ICONS[tier.trophy_type]}</span>
                  <span className="text-white/80 text-sm">
                    {tier.rank_min === tier.rank_max ? `#${tier.rank_min}` : `#${tier.rank_min}-${tier.rank_max}`}
                  </span>
                </div>
                <div className="text-xs text-white/60">
                  {tier.rewards?.coins && <span>🪙 {tier.rewards.coins.toLocaleString()} </span>}
                  {tier.rewards?.gems && <span>💎 {tier.rewards.gems} </span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="w-full mt-4 py-3 bg-gradient-to-b from-red-500 to-red-700 rounded-xl font-bold text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Main Tournament Component
const TournamentMode = ({ onClose, onPlay }) => {
  const store = useGameStore();
  const [tournaments, setTournaments] = useState([]);
  const [myEntries, setMyEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [history, setHistory] = useState([]);
  
  const userId = store.userId;
  const username = store.username || 'Angler';
  
  // Load tournaments
  const loadTournaments = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tournaments/active`);
      const data = await response.json();
      setTournaments(data.tournaments || []);
      
      // Load my entries for each tournament
      const entries = {};
      for (const tournament of (data.tournaments || [])) {
        try {
          const entryResponse = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/tournaments/${tournament.id}/my-entry/${userId}`
          );
          const entryData = await entryResponse.json();
          if (entryData.joined) {
            entries[tournament.id] = entryData.entry;
          }
        } catch (err) {
          // Not joined this tournament
        }
      }
      setMyEntries(entries);
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    }
    setLoading(false);
  }, [userId]);
  
  // Load history
  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tournaments/history/${userId}?limit=10`);
      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, [userId]);
  
  useEffect(() => {
    loadTournaments();
    loadHistory();
  }, [loadTournaments, loadHistory]);
  
  // Handle join/view tournament
  const handleTournamentAction = async (tournament, action) => {
    retroSounds.select();
    
    if (action === 'view') {
      setSelectedTournament(tournament);
      setShowLeaderboard(true);
      return;
    }
    
    // Join tournament
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tournaments/${tournament.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, username })
      });
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.detail || 'Failed to join');
        return;
      }
      
      const data = await response.json();
      setMyEntries(prev => ({ ...prev, [tournament.id]: data.entry }));
      retroSounds.achievement();
      
      // Refresh tournaments
      loadTournaments();
    } catch (err) {
      console.error('Failed to join tournament:', err);
      alert('Failed to join tournament');
    }
  };
  
  // Calculate stats
  const totalTournaments = Object.keys(myEntries).length;
  const statsFromHistory = history.reduce((acc, h) => ({
    wins: acc.wins + (h.final_rank === 1 ? 1 : 0),
    topTen: acc.topTen + (h.final_rank <= 10 ? 1 : 0),
    totalRewards: acc.totalRewards + (h.rewards?.coins || 0)
  }), { wins: 0, topTen: 0, totalRewards: 0 });
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" data-testid="tournament-mode">
      <div className="glass-panel rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto border-2 border-purple-500/30 animate-modal">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏆</span>
            <div>
              <h2 className="text-2xl font-bold gradient-text font-pixel">TOURNAMENTS</h2>
              <p className="text-white/60 text-sm">Compete for glory and rewards!</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-3xl">×</button>
        </div>
        
        {/* Stats Banner */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-purple-500/20 rounded-xl p-3 text-center border border-purple-500/30">
            <p className="text-2xl font-bold text-purple-400">{totalTournaments}</p>
            <p className="text-xs text-white/60">Active</p>
          </div>
          <div className="bg-yellow-500/20 rounded-xl p-3 text-center border border-yellow-500/30">
            <p className="text-2xl font-bold text-yellow-400">{statsFromHistory.wins}</p>
            <p className="text-xs text-white/60">Wins</p>
          </div>
          <div className="bg-green-500/20 rounded-xl p-3 text-center border border-green-500/30">
            <p className="text-2xl font-bold text-green-400">{statsFromHistory.topTen}</p>
            <p className="text-xs text-white/60">Top 10</p>
          </div>
          <div className="bg-cyan-500/20 rounded-xl p-3 text-center border border-cyan-500/30">
            <p className="text-2xl font-bold text-cyan-400">{statsFromHistory.totalRewards.toLocaleString()}</p>
            <p className="text-xs text-white/60">🪙 Won</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'active' 
                ? 'bg-purple-500 text-white' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Active ({tournaments.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'history' 
                ? 'bg-purple-500 text-white' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            History ({history.length})
          </button>
        </div>
        
        {/* Content */}
        {loading ? (
          <div className="text-center py-12 text-white/60">Loading tournaments...</div>
        ) : activeTab === 'active' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {tournaments.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-white/60">
                <p className="text-4xl mb-2">🎣</p>
                <p>No active tournaments right now.</p>
                <p className="text-sm">Check back soon!</p>
              </div>
            ) : (
              tournaments.map(tournament => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onJoin={handleTournamentAction}
                  isJoined={!!myEntries[tournament.id]}
                  myEntry={myEntries[tournament.id]}
                />
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="text-center py-12 text-white/60">
                <p>No tournament history yet.</p>
                <p className="text-sm">Join a tournament to get started!</p>
              </div>
            ) : (
              history.map((result, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {result.final_rank === 1 ? '🥇' : result.final_rank <= 3 ? '🥈' : result.final_rank <= 10 ? '🥉' : '🎖️'}
                    </span>
                    <div>
                      <p className="text-white font-medium">{result.tournament_name || 'Tournament'}</p>
                      <p className="text-white/50 text-xs">Rank #{result.final_rank} • {result.final_score?.toLocaleString()} pts</p>
                    </div>
                  </div>
                  {result.rewards?.coins > 0 && (
                    <div className="text-yellow-400 font-bold">+{result.rewards.coins.toLocaleString()} 🪙</div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Play Button */}
        {totalTournaments > 0 && (
          <button 
            onClick={() => {
              retroSounds.select();
              onClose();
              onPlay?.();
            }}
            className="w-full mt-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2 transition-all"
            data-testid="tournament-play-button"
          >
            <span>🎣</span>
            <span>Play in Tournament Mode</span>
          </button>
        )}
        
        <button 
          onClick={onClose}
          className="w-full mt-3 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white transition-all"
        >
          Close
        </button>
      </div>
      
      {/* Leaderboard Modal */}
      {showLeaderboard && selectedTournament && (
        <LeaderboardModal 
          tournament={selectedTournament}
          onClose={() => setShowLeaderboard(false)}
          myEntry={myEntries[selectedTournament.id]}
        />
      )}
    </div>
  );
};

export default TournamentMode;
