import React, { useState, useEffect, useCallback, useRef } from 'react';
import { musicController, SONGS } from '../lib/musicEngine';

// ========================================================================
// MUSIC PLAYER UI COMPONENT
// Visual controls for the music system
// ========================================================================

// Visualizer bars component
const VisualizerBars = ({ isPlaying, intensity = 1 }) => {
  const [bars, setBars] = useState([0.3, 0.5, 0.7, 0.4, 0.6, 0.8, 0.5, 0.4]);
  
  useEffect(() => {
    if (!isPlaying) {
      setBars([0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]);
      return;
    }
    
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => 0.2 + Math.random() * 0.8 * intensity));
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying, intensity]);
  
  return (
    <div className="flex items-end gap-0.5 h-8">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-1.5 bg-gradient-to-t from-green-500 to-green-300 rounded-t transition-all duration-100"
          style={{ height: `${height * 100}%` }}
        />
      ))}
    </div>
  );
};

// Mini player for corner of screen
const MiniMusicPlayer = ({ onExpand }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  
  useEffect(() => {
    const songInfo = musicController.getCurrentSongInfo();
    setCurrentSong(songInfo);
    setIsPlaying(!!songInfo);
  }, []);
  
  const toggleMute = () => {
    const muted = musicController.toggleMute();
    setIsMuted(muted);
  };
  
  const togglePlay = () => {
    if (isPlaying) {
      musicController.pause();
      setIsPlaying(false);
    } else {
      musicController.resume();
      setIsPlaying(true);
    }
  };
  
  return (
    <div 
      className="fixed bottom-4 right-4 z-40 bg-black/80 backdrop-blur-sm rounded-2xl p-3 border border-white/20 flex items-center gap-3 cursor-pointer hover:bg-black/90 transition-all"
      onClick={onExpand}
      data-testid="mini-music-player"
    >
      <VisualizerBars isPlaying={isPlaying && !isMuted} />
      
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-400 transition-all"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        
        <button
          onClick={(e) => { e.stopPropagation(); toggleMute(); }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white'
          }`}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
      
      {currentSong && (
        <div className="text-xs text-white/70 max-w-[100px] truncate">
          {currentSong.name}
        </div>
      )}
    </div>
  );
};

// Full music player modal
const MusicPlayerModal = ({ onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentSong, setCurrentSong] = useState('MENU_THEME');
  const [isMuted, setIsMuted] = useState(false);
  
  // Initialize music on mount
  useEffect(() => {
    const init = async () => {
      await musicController.init();
      const songInfo = musicController.getCurrentSongInfo();
      if (songInfo) {
        setCurrentSong(Object.keys(SONGS).find(key => SONGS[key].name === songInfo.name) || 'MENU_THEME');
        setIsPlaying(true);
      }
    };
    init();
  }, []);
  
  const handlePlaySong = async (songKey) => {
    setCurrentSong(songKey);
    await musicController.playSong(songKey);
    setIsPlaying(true);
  };
  
  const handleTogglePlay = () => {
    if (isPlaying) {
      musicController.pause();
      setIsPlaying(false);
    } else {
      musicController.playSong(currentSong);
      setIsPlaying(true);
    }
  };
  
  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    musicController.setVolume(value);
  };
  
  const handleToggleMute = () => {
    const muted = musicController.toggleMute();
    setIsMuted(muted);
  };
  
  const handlePlaySFX = (sfxType) => {
    musicController.playSFX(sfxType);
  };
  
  const songCategories = {
    'Main': ['MENU_THEME', 'SHOP'],
    'Fishing': ['FISHING_CALM', 'FISHING_UPBEAT', 'NIGHT_FISHING', 'STORM_FISHING'],
    'Features': ['AQUARIUM', 'BREEDING_LAB', 'MINIGAME'],
    'Special': ['VICTORY'],
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" data-testid="music-player-modal">
      <div className="w-full max-w-2xl max-h-[90vh] bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl overflow-hidden border-2 border-green-500/40 shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎵</span>
            <div>
              <h2 className="text-xl font-bold text-white font-pixel">MUSIC PLAYER</h2>
              <p className="text-xs text-green-200">Harvest Moon × Pokemon Silver Vibes</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/30 text-white font-bold">×</button>
        </div>
        
        {/* Now Playing */}
        <div className="p-6 bg-gradient-to-b from-green-900/30 to-transparent border-b border-white/10">
          <div className="flex items-center gap-6">
            {/* Album art placeholder */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-5xl shadow-lg">
              {isPlaying ? '🎶' : '🎵'}
            </div>
            
            <div className="flex-1">
              <p className="text-xs text-white/50 uppercase tracking-wider">Now Playing</p>
              <h3 className="text-2xl font-bold text-white">
                {SONGS[currentSong]?.name || 'Select a song'}
              </h3>
              <p className="text-sm text-green-400">{SONGS[currentSong]?.bpm || 0} BPM</p>
              
              {/* Visualizer */}
              <div className="mt-3">
                <VisualizerBars isPlaying={isPlaying && !isMuted} intensity={1.2} />
              </div>
            </div>
          </div>
          
          {/* Playback controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => {
                const keys = Object.keys(SONGS);
                const idx = keys.indexOf(currentSong);
                const prevIdx = (idx - 1 + keys.length) % keys.length;
                handlePlaySong(keys[prevIdx]);
              }}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-all"
            >
              ⏮
            </button>
            
            <button
              onClick={handleTogglePlay}
              className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center text-white text-2xl transition-all shadow-lg shadow-green-500/50"
            >
              {isPlaying ? '⏸' : '▶️'}
            </button>
            
            <button
              onClick={() => {
                const keys = Object.keys(SONGS);
                const idx = keys.indexOf(currentSong);
                const nextIdx = (idx + 1) % keys.length;
                handlePlaySong(keys[nextIdx]);
              }}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-all"
            >
              ⏭
            </button>
          </div>
          
          {/* Volume control */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleToggleMute}
              className={`text-xl ${isMuted ? 'text-red-400' : 'text-white'}`}
            >
              {isMuted ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500"
            />
            <span className="text-white text-sm w-12 text-right">{Math.round(volume * 100)}%</span>
          </div>
        </div>
        
        {/* Song list */}
        <div className="p-4 overflow-y-auto max-h-[40vh]">
          {Object.entries(songCategories).map(([category, songKeys]) => (
            <div key={category} className="mb-4">
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">{category}</h4>
              <div className="grid grid-cols-2 gap-2">
                {songKeys.map(songKey => {
                  const song = SONGS[songKey];
                  const isCurrentSong = currentSong === songKey;
                  return (
                    <button
                      key={songKey}
                      onClick={() => handlePlaySong(songKey)}
                      className={`p-3 rounded-xl text-left transition-all ${
                        isCurrentSong
                          ? 'bg-green-500/30 border-2 border-green-500'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{isCurrentSong && isPlaying ? '🎶' : '🎵'}</span>
                        <div>
                          <p className={`text-sm font-bold ${isCurrentSong ? 'text-green-400' : 'text-white'}`}>
                            {song.name}
                          </p>
                          <p className="text-xs text-white/50">{song.bpm} BPM</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Sound Effects */}
        <div className="p-4 bg-black/30 border-t border-white/10">
          <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Sound Effects Test</h4>
          <div className="flex flex-wrap gap-2">
            {['catch', 'perfect', 'cast', 'bite', 'splash', 'levelup', 'coin', 'achievement', 'rare_catch'].map(sfx => (
              <button
                key={sfx}
                onClick={() => handlePlaySFX(sfx)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition-all"
              >
                {sfx}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Music context hook for easy access throughout app
const useMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  
  const play = useCallback(async (songKey) => {
    await musicController.playSong(songKey);
    setIsPlaying(true);
    setCurrentSong(songKey);
  }, []);
  
  const stop = useCallback(() => {
    musicController.stop();
    setIsPlaying(false);
    setCurrentSong(null);
  }, []);
  
  const pause = useCallback(() => {
    musicController.pause();
    setIsPlaying(false);
  }, []);
  
  const resume = useCallback(() => {
    musicController.resume();
    setIsPlaying(true);
  }, []);
  
  const playSFX = useCallback((type) => {
    musicController.playSFX(type);
  }, []);
  
  const setVolume = useCallback((value) => {
    musicController.setVolume(value);
  }, []);
  
  return {
    isPlaying,
    currentSong,
    play,
    stop,
    pause,
    resume,
    playSFX,
    setVolume,
    controller: musicController,
  };
};

export { MiniMusicPlayer, MusicPlayerModal, useMusicPlayer, VisualizerBars };
export default MusicPlayerModal;
