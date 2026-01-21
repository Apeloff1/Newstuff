import React, { useState, useEffect, useMemo } from 'react';

// ========================================================================
// AAA QUALITY WEATHER WIDGET
// Dynamic weather display with fishing modifiers
// ========================================================================

// Weather conditions with fishing effects
const WEATHER_CONDITIONS = {
  sunny: {
    name: 'Sunny',
    icon: '☀️',
    background: 'from-yellow-400 to-orange-400',
    effects: { biteRate: 1.0, rarityBonus: 0, description: 'Normal fishing conditions' },
    particles: 'light-rays'
  },
  cloudy: {
    name: 'Cloudy',
    icon: '☁️',
    background: 'from-gray-400 to-slate-500',
    effects: { biteRate: 1.1, rarityBonus: 0.05, description: 'Fish are more active' },
    particles: 'clouds'
  },
  rainy: {
    name: 'Rainy',
    icon: '🌧️',
    background: 'from-blue-500 to-indigo-600',
    effects: { biteRate: 1.2, rarityBonus: 0.1, description: 'Great for freshwater fish!' },
    particles: 'rain'
  },
  stormy: {
    name: 'Stormy',
    icon: '⛈️',
    background: 'from-slate-700 to-purple-900',
    effects: { biteRate: 1.5, rarityBonus: 0.25, description: 'Rare fish emerge!' },
    particles: 'storm'
  },
  foggy: {
    name: 'Foggy',
    icon: '🌫️',
    background: 'from-gray-300 to-gray-500',
    effects: { biteRate: 0.9, rarityBonus: 0.15, description: 'Mysterious catches possible' },
    particles: 'fog'
  },
  snowy: {
    name: 'Snowy',
    icon: '❄️',
    background: 'from-blue-200 to-cyan-300',
    effects: { biteRate: 0.8, rarityBonus: 0.2, description: 'Arctic fish appear!' },
    particles: 'snow'
  },
  windy: {
    name: 'Windy',
    icon: '💨',
    background: 'from-teal-400 to-cyan-500',
    effects: { biteRate: 1.1, rarityBonus: 0.05, description: 'Casting is harder' },
    particles: 'wind'
  },
  heatwave: {
    name: 'Heat Wave',
    icon: '🔥',
    background: 'from-red-500 to-orange-600',
    effects: { biteRate: 0.7, rarityBonus: 0, description: 'Fish stay in deep water' },
    particles: 'heat'
  }
};

// Time of day effects
const TIME_OF_DAY = {
  dawn: { name: 'Dawn', icon: '🌅', biteMultiplier: 1.3, description: 'Golden hour fishing' },
  day: { name: 'Day', icon: '☀️', biteMultiplier: 1.0, description: 'Standard conditions' },
  dusk: { name: 'Dusk', icon: '🌆', biteMultiplier: 1.4, description: 'Peak feeding time' },
  night: { name: 'Night', icon: '🌙', biteMultiplier: 0.8, description: 'Nocturnal species active' }
};

// Moon phases with effects
const MOON_PHASES = {
  new: { name: 'New Moon', icon: '🌑', effect: 0.9, description: 'Dark nights' },
  waxing_crescent: { name: 'Waxing Crescent', icon: '🌒', effect: 0.95, description: 'Building light' },
  first_quarter: { name: 'First Quarter', icon: '🌓', effect: 1.0, description: 'Half moon' },
  waxing_gibbous: { name: 'Waxing Gibbous', icon: '🌔', effect: 1.1, description: 'Almost full' },
  full: { name: 'Full Moon', icon: '🌕', effect: 1.25, description: 'Best night fishing!' },
  waning_gibbous: { name: 'Waning Gibbous', icon: '🌖', effect: 1.1, description: 'Still bright' },
  last_quarter: { name: 'Last Quarter', icon: '🌗', effect: 1.0, description: 'Half moon' },
  waning_crescent: { name: 'Waning Crescent', icon: '🌘', effect: 0.95, description: 'Fading light' }
};

// Weather particles
const WeatherParticles = ({ type }) => {
  const particles = useMemo(() => {
    const count = type === 'rain' ? 50 : type === 'snow' ? 30 : type === 'storm' ? 80 : 20;
    return [...Array(count)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 1 + Math.random() * 2,
      size: 2 + Math.random() * 4
    }));
  }, [type]);
  
  if (type === 'rain') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute w-0.5 h-4 bg-blue-300/50 rain-drop"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
      </div>
    );
  }
  
  if (type === 'snow') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white/80"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animation: `snowFall ${2 + p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </div>
    );
  }
  
  if (type === 'storm') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute w-0.5 h-6 bg-blue-200/60 rain-drop"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration * 0.5}s`,
              transform: 'rotate(15deg)'
            }}
          />
        ))}
        {/* Lightning flash */}
        <div className="absolute inset-0 bg-white/20 animate-pulse" style={{ animationDuration: '3s' }} />
      </div>
    );
  }
  
  if (type === 'fog') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-white/30 animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute h-8 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{
              top: `${20 + i * 15}%`,
              animation: `fogDrift ${5 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>
    );
  }
  
  if (type === 'light-rays') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full w-10 bg-gradient-to-b from-yellow-300/20 to-transparent"
            style={{
              left: `${10 + i * 20}%`,
              transform: 'skewX(-15deg)',
              animation: 'lightRay 4s ease-in-out infinite',
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>
    );
  }
  
  return null;
};

// Compact weather display for game HUD
const WeatherBadge = ({ weather, timeOfDay, moon }) => {
  const w = WEATHER_CONDITIONS[weather] || WEATHER_CONDITIONS.sunny;
  const t = TIME_OF_DAY[timeOfDay] || TIME_OF_DAY.day;
  const m = MOON_PHASES[moon] || MOON_PHASES.first_quarter;
  
  const totalBiteBonus = Math.round((w.effects.biteRate * t.biteMultiplier * m.effect - 1) * 100);
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
      <span className="text-lg">{w.icon}</span>
      <span className="text-lg">{t.icon}</span>
      {timeOfDay === 'night' && <span className="text-sm">{m.icon}</span>}
      <span className={`text-xs font-bold ${totalBiteBonus >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {totalBiteBonus >= 0 ? '+' : ''}{totalBiteBonus}%
      </span>
    </div>
  );
};

// Main Weather Widget Component
const WeatherWidget = ({ onClose, currentWeather = 'sunny', currentTime = 'day' }) => {
  const [weather, setWeather] = useState(currentWeather);
  const [timeOfDay, setTimeOfDay] = useState(currentTime);
  const [moonPhase, setMoonPhase] = useState('first_quarter');
  const [forecast, setForecast] = useState([]);
  
  // Generate forecast
  useEffect(() => {
    const weatherKeys = Object.keys(WEATHER_CONDITIONS);
    const newForecast = [...Array(5)].map((_, i) => ({
      day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `Day ${i + 1}`,
      weather: weatherKeys[Math.floor(Math.random() * weatherKeys.length)],
      high: 15 + Math.floor(Math.random() * 20),
      low: 5 + Math.floor(Math.random() * 15)
    }));
    setForecast(newForecast);
  }, []);
  
  // Simulate time/moon changes
  useEffect(() => {
    const moonKeys = Object.keys(MOON_PHASES);
    const randomMoon = moonKeys[Math.floor(Math.random() * moonKeys.length)];
    setMoonPhase(randomMoon);
  }, []);
  
  const w = WEATHER_CONDITIONS[weather];
  const t = TIME_OF_DAY[timeOfDay];
  const m = MOON_PHASES[moonPhase];
  
  // Calculate total fishing bonus
  const totalBiteMultiplier = w.effects.biteRate * t.biteMultiplier * m.effect;
  const totalRarityBonus = w.effects.rarityBonus;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" data-testid="weather-widget">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border-2 border-white/20 shadow-2xl">
        
        {/* Weather header with particles */}
        <div className={`relative bg-gradient-to-br ${w.background} p-6 overflow-hidden`}>
          <WeatherParticles type={w.particles} />
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Current Conditions</p>
              <h2 className="text-4xl font-bold text-white">{w.name}</h2>
              <p className="text-white/80 text-sm mt-1">{w.effects.description}</p>
            </div>
            <div className="text-6xl">{w.icon}</div>
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white"
          >
            ×
          </button>
        </div>
        
        {/* Time and Moon */}
        <div className="bg-slate-900 p-4 border-b border-white/10">
          <div className="flex justify-around">
            <div className="text-center">
              <span className="text-3xl">{t.icon}</span>
              <p className="text-white text-sm font-bold">{t.name}</p>
              <p className="text-white/50 text-xs">{t.description}</p>
            </div>
            <div className="text-center">
              <span className="text-3xl">{m.icon}</span>
              <p className="text-white text-sm font-bold">{m.name}</p>
              <p className="text-white/50 text-xs">{m.description}</p>
            </div>
          </div>
        </div>
        
        {/* Fishing Modifiers */}
        <div className="bg-slate-800 p-4 border-b border-white/10">
          <h3 className="text-white font-bold text-sm mb-3">🎣 FISHING MODIFIERS</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/50 text-xs">Bite Rate</p>
              <p className={`text-lg font-bold ${totalBiteMultiplier >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                {(totalBiteMultiplier * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/50 text-xs">Rare Fish Bonus</p>
              <p className="text-lg font-bold text-purple-400">
                +{(totalRarityBonus * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
        
        {/* 5-Day Forecast */}
        <div className="bg-slate-900 p-4">
          <h3 className="text-white font-bold text-sm mb-3">📅 FORECAST</h3>
          <div className="flex justify-between">
            {forecast.map((day, i) => (
              <div key={i} className="text-center">
                <p className="text-white/50 text-[10px]">{day.day}</p>
                <span className="text-xl">{WEATHER_CONDITIONS[day.weather]?.icon || '☀️'}</span>
                <p className="text-white text-xs">{day.high}°</p>
                <p className="text-white/50 text-[10px]">{day.low}°</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Tips */}
        <div className="bg-cyan-900/50 p-4">
          <p className="text-cyan-300 text-xs">
            💡 <strong>Tip:</strong> {
              weather === 'stormy' ? 'Rare legendary fish are more likely to appear during storms!' :
              weather === 'rainy' ? 'Rain brings freshwater fish to the surface!' :
              weather === 'sunny' ? 'Perfect weather for a relaxing fishing session!' :
              timeOfDay === 'dusk' ? 'Dusk is peak feeding time for most fish!' :
              'Current conditions are favorable for fishing.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export { WeatherWidget, WeatherBadge, WEATHER_CONDITIONS, TIME_OF_DAY, MOON_PHASES };
export default WeatherWidget;
