import React, { useState, useEffect, useCallback, useRef } from 'react';

// ========================================================================
// AAA QUALITY MINI-GAMES COLLECTION
// Additional gameplay modes for bonus rewards
// ========================================================================

// ==================== FISH MEMORY GAME ====================
// Match fish pairs to earn bonus points

const FishMemoryGame = ({ onComplete, onClose }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [timer, setTimer] = useState(60);
  const timerRef = useRef(null);
  
  const fishTypes = ['🐟', '🐠', '🐡', '🦈', '🐳', '🐋', '🐬', '🦑'];
  
  // Initialize game
  useEffect(() => {
    const shuffled = [...fishTypes, ...fishTypes]
      .sort(() => Math.random() - 0.5)
      .map((fish, index) => ({ id: index, fish, matched: false }));
    setCards(shuffled);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerRef.current);
  }, []);
  
  // Check for matches
  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].fish === cards[second].fish) {
        setMatched(prev => [...prev, first, second]);
        setCards(prev => prev.map((card, i) => 
          i === first || i === second ? { ...card, matched: true } : card
        ));
      }
      setTimeout(() => setFlipped([]), 500);
      setMoves(prev => prev + 1);
    }
  }, [flipped, cards]);
  
  // Check win condition
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setGameComplete(true);
      clearInterval(timerRef.current);
      const bonus = Math.max(100, 500 - (moves * 10) + (timer * 5));
      onComplete(bonus);
    }
  }, [matched, cards, moves, timer, onComplete]);
  
  // Handle card click
  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;
    setFlipped(prev => [...prev, index]);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" data-testid="fish-memory-game">
      <div className="w-full max-w-lg bg-gradient-to-b from-blue-900 to-indigo-900 rounded-3xl p-6 border-2 border-blue-500/40">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white font-pixel">🧠 FISH MEMORY</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>
        
        <div className="flex justify-between mb-4 text-sm">
          <span className="text-blue-300">Moves: {moves}</span>
          <span className={`font-bold ${timer <= 10 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
            ⏱️ {timer}s
          </span>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              disabled={gameComplete || timer === 0}
              className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-all transform ${
                flipped.includes(index) || matched.includes(index)
                  ? 'bg-blue-500 rotate-0'
                  : 'bg-blue-800 hover:bg-blue-700 rotate-y-180'
              } ${matched.includes(index) ? 'ring-2 ring-green-400' : ''}`}
            >
              {(flipped.includes(index) || matched.includes(index)) ? card.fish : '❓'}
            </button>
          ))}
        </div>
        
        {gameComplete && (
          <div className="mt-4 text-center animate-scale-pop">
            <p className="text-2xl font-bold text-yellow-400">🎉 Complete!</p>
            <p className="text-white">Bonus: +{Math.max(100, 500 - (moves * 10) + (timer * 5))} pts</p>
          </div>
        )}
        
        {timer === 0 && !gameComplete && (
          <div className="mt-4 text-center">
            <p className="text-xl font-bold text-red-400">⏰ Time's Up!</p>
            <button 
              onClick={onClose}
              className="mt-2 px-4 py-2 bg-blue-600 rounded-lg text-white"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== FISH CATCH TIMING GAME ====================
// Hit the button at the right time to catch fish

const FishTimingGame = ({ onComplete, onClose }) => {
  const [position, setPosition] = useState(50);
  const [direction, setDirection] = useState(1);
  const [speed, setSpeed] = useState(2);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [maxRounds] = useState(10);
  const [isActive, setIsActive] = useState(true);
  const animationRef = useRef(null);
  
  // Target zones
  const perfectZone = { start: 45, end: 55 };
  const goodZone = { start: 35, end: 65 };
  
  // Animation loop
  useEffect(() => {
    if (!isActive) return;
    
    const animate = () => {
      setPosition(prev => {
        let newPos = prev + (speed * direction);
        if (newPos >= 100 || newPos <= 0) {
          setDirection(d => -d);
          newPos = Math.max(0, Math.min(100, newPos));
        }
        return newPos;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isActive, speed, direction]);
  
  // Handle catch attempt
  const handleCatch = () => {
    cancelAnimationFrame(animationRef.current);
    
    let points = 0;
    let result = '';
    
    if (position >= perfectZone.start && position <= perfectZone.end) {
      points = 100;
      result = 'PERFECT!';
    } else if (position >= goodZone.start && position <= goodZone.end) {
      points = 50;
      result = 'GOOD!';
    } else {
      points = 10;
      result = 'MISS';
    }
    
    setScore(prev => prev + points);
    
    if (round >= maxRounds) {
      setIsActive(false);
      setTimeout(() => onComplete(score + points), 1000);
    } else {
      setRound(prev => prev + 1);
      setSpeed(prev => Math.min(prev + 0.3, 6));
      setPosition(Math.random() > 0.5 ? 10 : 90);
      setDirection(Math.random() > 0.5 ? 1 : -1);
      
      setTimeout(() => {
        animationRef.current = requestAnimationFrame(() => {});
      }, 500);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" data-testid="fish-timing-game">
      <div className="w-full max-w-md bg-gradient-to-b from-cyan-900 to-blue-900 rounded-3xl p-6 border-2 border-cyan-500/40">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white font-pixel">🎯 TIMING CATCH</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>
        
        <div className="flex justify-between mb-4 text-sm">
          <span className="text-cyan-300">Round: {round}/{maxRounds}</span>
          <span className="text-yellow-400 font-bold">Score: {score}</span>
        </div>
        
        {/* Timing bar */}
        <div className="relative h-12 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-yellow-500 to-red-500 rounded-full overflow-hidden mb-6">
          {/* Perfect zone highlight */}
          <div 
            className="absolute top-0 bottom-0 bg-green-400/50 border-x-2 border-green-300"
            style={{ left: `${perfectZone.start}%`, width: `${perfectZone.end - perfectZone.start}%` }}
          />
          
          {/* Marker */}
          <div 
            className="absolute top-0 bottom-0 w-2 bg-white shadow-lg shadow-white/50 transition-none"
            style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
          />
          
          {/* Target indicator */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
            🐟
          </div>
        </div>
        
        {/* Catch button */}
        <button
          onClick={handleCatch}
          disabled={!isActive}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl font-bold text-white text-xl hover:from-orange-400 hover:to-red-400 transition-all active:scale-95 disabled:opacity-50"
        >
          CATCH! 🎣
        </button>
        
        {!isActive && round >= maxRounds && (
          <div className="mt-4 text-center animate-scale-pop">
            <p className="text-2xl font-bold text-yellow-400">🏆 Game Over!</p>
            <p className="text-white">Final Score: {score}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== FISH QUIZ GAME ====================
// Answer fish trivia questions

const FishQuizGame = ({ onComplete, onClose }) => {
  const questions = [
    { q: "Which fish is the fastest swimmer?", a: ["Sailfish", "Tuna", "Shark", "Marlin"], correct: 0 },
    { q: "What do goldfish NOT have?", a: ["Scales", "Stomach", "Fins", "Gills"], correct: 1 },
    { q: "Which fish can fly?", a: ["Salmon", "Flying Fish", "Catfish", "Cod"], correct: 1 },
    { q: "What is a group of fish called?", a: ["Herd", "Pack", "School", "Flock"], correct: 2 },
    { q: "Which fish produces electricity?", a: ["Clownfish", "Electric Eel", "Goldfish", "Trout"], correct: 1 },
    { q: "How do fish breathe?", a: ["Lungs", "Skin", "Gills", "Mouth"], correct: 2 },
    { q: "Which is the largest fish?", a: ["Blue Whale", "Whale Shark", "Great White", "Manta Ray"], correct: 1 },
    { q: "What is a baby fish called?", a: ["Pup", "Calf", "Fry", "Kid"], correct: 2 },
    { q: "Which fish can change color?", a: ["Salmon", "Cuttlefish", "Tuna", "Perch"], correct: 1 },
    { q: "How many hearts does an octopus have?", a: ["1", "2", "3", "4"], correct: 2 },
  ];
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  
  const handleAnswer = (index) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(index);
    
    if (index === questions[currentQuestion].correct) {
      setScore(prev => prev + 100);
    }
    
    setTimeout(() => {
      if (currentQuestion + 1 >= questions.length) {
        setGameComplete(true);
        onComplete(score + (index === questions[currentQuestion].correct ? 100 : 0));
      } else {
        setCurrentQuestion(prev => prev + 1);
        setAnswered(false);
        setSelectedAnswer(null);
      }
    }, 1500);
  };
  
  const q = questions[currentQuestion];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" data-testid="fish-quiz-game">
      <div className="w-full max-w-md bg-gradient-to-b from-purple-900 to-indigo-900 rounded-3xl p-6 border-2 border-purple-500/40">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white font-pixel">🧠 FISH QUIZ</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>
        
        <div className="flex justify-between mb-4 text-sm">
          <span className="text-purple-300">Q: {currentQuestion + 1}/{questions.length}</span>
          <span className="text-yellow-400 font-bold">Score: {score}</span>
        </div>
        
        {!gameComplete ? (
          <>
            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <p className="text-white text-lg text-center">{q.q}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {q.a.map((answer, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={answered}
                  className={`p-3 rounded-xl font-medium transition-all ${
                    answered
                      ? i === q.correct
                        ? 'bg-green-500 text-white'
                        : i === selectedAnswer
                          ? 'bg-red-500 text-white'
                          : 'bg-white/10 text-white/50'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {answer}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center animate-scale-pop">
            <p className="text-4xl mb-4">🎓</p>
            <p className="text-2xl font-bold text-yellow-400">Quiz Complete!</p>
            <p className="text-white mt-2">Final Score: {score}</p>
            <p className="text-purple-300 text-sm mt-1">
              {score >= 800 ? 'Fish Expert!' : score >= 500 ? 'Good Knowledge!' : 'Keep Learning!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== FISH SORTING GAME ====================
// Sort fish by size as they appear

const FishSortingGame = ({ onComplete, onClose }) => {
  const [fish, setFish] = useState([]);
  const [buckets, setBuckets] = useState({ small: [], medium: [], large: [] });
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [round, setRound] = useState(0);
  const [currentFish, setCurrentFish] = useState(null);
  const [gameActive, setGameActive] = useState(true);
  
  const fishSizes = [
    { size: 'small', emoji: '🐟', label: 'Small (< 30cm)' },
    { size: 'medium', emoji: '🐠', label: 'Medium (30-60cm)' },
    { size: 'large', emoji: '🐋', label: 'Large (> 60cm)' },
  ];
  
  // Generate new fish
  useEffect(() => {
    if (!gameActive || round >= 15) return;
    
    const sizes = ['small', 'medium', 'large'];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const sizeValue = size === 'small' ? 10 + Math.random() * 20 
                    : size === 'medium' ? 30 + Math.random() * 30 
                    : 60 + Math.random() * 40;
    
    setCurrentFish({
      id: Date.now(),
      size,
      sizeValue: Math.round(sizeValue),
      emoji: fishSizes.find(f => f.size === size).emoji,
    });
    setRound(prev => prev + 1);
  }, [round, gameActive]);
  
  // Handle sorting
  const handleSort = (bucket) => {
    if (!currentFish || !gameActive) return;
    
    if (bucket === currentFish.size) {
      setScore(prev => prev + 50);
      setBuckets(prev => ({
        ...prev,
        [bucket]: [...prev[bucket], currentFish]
      }));
    } else {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameActive(false);
          onComplete(score);
        }
        return newLives;
      });
    }
    
    if (round >= 15) {
      setGameActive(false);
      onComplete(score);
    }
    
    setCurrentFish(null);
    setTimeout(() => setRound(prev => prev), 300);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" data-testid="fish-sorting-game">
      <div className="w-full max-w-md bg-gradient-to-b from-teal-900 to-cyan-900 rounded-3xl p-6 border-2 border-teal-500/40">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white font-pixel">📦 FISH SORT</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>
        
        <div className="flex justify-between mb-4 text-sm">
          <span className="text-teal-300">Round: {Math.min(round, 15)}/15</span>
          <span className="text-red-400">{'❤️'.repeat(lives)}</span>
          <span className="text-yellow-400 font-bold">Score: {score}</span>
        </div>
        
        {/* Current fish display */}
        <div className="bg-white/10 rounded-xl p-6 mb-4 text-center min-h-[100px] flex flex-col items-center justify-center">
          {currentFish && gameActive ? (
            <>
              <span className="text-5xl mb-2 animate-bounce">{currentFish.emoji}</span>
              <p className="text-white text-xl font-bold">{currentFish.sizeValue} cm</p>
            </>
          ) : !gameActive ? (
            <div className="animate-scale-pop">
              <p className="text-2xl font-bold text-yellow-400">Game Over!</p>
              <p className="text-white">Final Score: {score}</p>
            </div>
          ) : (
            <p className="text-white/50">Loading...</p>
          )}
        </div>
        
        {/* Sorting buckets */}
        <div className="grid grid-cols-3 gap-2">
          {fishSizes.map(({ size, label }) => (
            <button
              key={size}
              onClick={() => handleSort(size)}
              disabled={!currentFish || !gameActive}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all disabled:opacity-50"
            >
              <p className="text-2xl mb-1">
                {size === 'small' ? '📦' : size === 'medium' ? '📫' : '🗃️'}
              </p>
              <p className="text-[10px] text-white">{label}</p>
              <p className="text-xs text-teal-300">{buckets[size].length}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== MINI GAMES LAUNCHER ====================
const MiniGamesLauncher = ({ onClose, onGameComplete }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  
  const games = [
    { id: 'memory', name: 'Fish Memory', icon: '🧠', desc: 'Match fish pairs', difficulty: 'Easy' },
    { id: 'timing', name: 'Timing Catch', icon: '🎯', desc: 'Perfect your timing', difficulty: 'Medium' },
    { id: 'quiz', name: 'Fish Quiz', icon: '🎓', desc: 'Test your knowledge', difficulty: 'Easy' },
    { id: 'sorting', name: 'Fish Sort', icon: '📦', desc: 'Sort by size', difficulty: 'Medium' },
  ];
  
  const handleGameComplete = (score) => {
    onGameComplete(score);
    setSelectedGame(null);
  };
  
  // Render selected mini-game
  if (selectedGame === 'memory') {
    return <FishMemoryGame onComplete={handleGameComplete} onClose={() => setSelectedGame(null)} />;
  }
  if (selectedGame === 'timing') {
    return <FishTimingGame onComplete={handleGameComplete} onClose={() => setSelectedGame(null)} />;
  }
  if (selectedGame === 'quiz') {
    return <FishQuizGame onComplete={handleGameComplete} onClose={() => setSelectedGame(null)} />;
  }
  if (selectedGame === 'sorting') {
    return <FishSortingGame onComplete={handleGameComplete} onClose={() => setSelectedGame(null)} />;
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" data-testid="minigames-launcher">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-6 border-2 border-cyan-500/40">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white font-pixel">🎮 MINI GAMES</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl">✕</button>
        </div>
        
        <p className="text-white/60 text-sm mb-4 text-center">
          Play mini-games to earn bonus points!
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {games.map(game => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 transition-all text-left"
            >
              <span className="text-3xl">{game.icon}</span>
              <h3 className="font-bold text-white mt-2">{game.name}</h3>
              <p className="text-xs text-white/50">{game.desc}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full mt-2 inline-block ${
                game.difficulty === 'Easy' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'
              }`}>
                {game.difficulty}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export { MiniGamesLauncher, FishMemoryGame, FishTimingGame, FishQuizGame, FishSortingGame };
export default MiniGamesLauncher;
