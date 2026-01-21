import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  isTouchDevice,
  isMobile,
  hapticFeedback,
  GestureRecognizer,
  CastGestureHandler,
  ReelGestureHandler,
  TapReelHandler,
  TensionSliderHandler,
  JoystickHandler,
} from '../lib/touchEngine';

// ========================================================================
// MOBILE TOUCH UI COMPONENTS
// AAA Quality Touch-Optimized Interface Elements
// ========================================================================

// ========== TOUCH BUTTON ==========
const TouchButton = ({
  children,
  onClick,
  onLongPress,
  hapticType = 'light',
  className = '',
  disabled = false,
  size = 'medium',
  variant = 'primary',
  icon,
  label,
  ...props
}) => {
  const buttonRef = useRef(null);
  const longPressTimer = useRef(null);
  const [isPressed, setIsPressed] = useState(false);
  
  const sizeClasses = {
    small: 'w-12 h-12 text-sm',
    medium: 'w-16 h-16 text-base',
    large: 'w-20 h-20 text-lg',
    xlarge: 'w-24 h-24 text-xl',
  };
  
  const variantClasses = {
    primary: 'bg-gradient-to-b from-blue-500 to-blue-600 border-blue-400',
    secondary: 'bg-gradient-to-b from-gray-600 to-gray-700 border-gray-500',
    success: 'bg-gradient-to-b from-green-500 to-green-600 border-green-400',
    danger: 'bg-gradient-to-b from-red-500 to-red-600 border-red-400',
    warning: 'bg-gradient-to-b from-yellow-500 to-yellow-600 border-yellow-400',
    ghost: 'bg-white/10 border-white/20',
  };
  
  const handleTouchStart = (e) => {
    if (disabled) return;
    setIsPressed(true);
    hapticFeedback[hapticType]?.();
    
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        hapticFeedback.heavy();
        onLongPress(e);
      }, 500);
    }
  };
  
  const handleTouchEnd = (e) => {
    if (disabled) return;
    setIsPressed(false);
    clearTimeout(longPressTimer.current);
    
    if (onClick) {
      onClick(e);
    }
  };
  
  const handleTouchCancel = () => {
    setIsPressed(false);
    clearTimeout(longPressTimer.current);
  };
  
  return (
    <button
      ref={buttonRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onClick={(e) => !isTouchDevice() && onClick?.(e)}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-2xl border-2 flex flex-col items-center justify-center
        text-white font-bold shadow-lg
        transition-all duration-100 select-none
        ${isPressed ? 'scale-90 brightness-75' : 'scale-100'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-90'}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="text-2xl mb-1">{icon}</span>}
      {label && <span className="text-xs">{label}</span>}
      {children}
    </button>
  );
};

// ========== CAST BUTTON WITH CHARGE INDICATOR ==========
const CastButton = ({ onCast, disabled = false, className = '' }) => {
  const buttonRef = useRef(null);
  const [chargePercent, setChargePercent] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const castHandler = useRef(null);
  
  useEffect(() => {
    if (!buttonRef.current) return;
    
    castHandler.current = new CastGestureHandler(buttonRef.current, onCast);
    
    castHandler.current.on('chargeStart', () => {
      setIsCharging(true);
      setChargePercent(0);
    });
    
    castHandler.current.on('chargeUpdate', (data) => {
      setChargePercent(data.percent * 100);
    });
    
    castHandler.current.on('chargeEnd', () => {
      setIsCharging(false);
      setChargePercent(0);
    });
    
    return () => {
      castHandler.current?.destroy();
    };
  }, [onCast]);
  
  const getChargeColor = () => {
    if (chargePercent < 30) return 'from-yellow-500 to-yellow-600';
    if (chargePercent < 70) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };
  
  return (
    <div 
      ref={buttonRef}
      className={`
        relative w-32 h-32 rounded-full
        bg-gradient-to-b from-blue-500 to-blue-700
        border-4 border-blue-400
        flex items-center justify-center
        shadow-xl shadow-blue-500/50
        select-none touch-none
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
      data-testid="cast-button"
    >
      {/* Charge ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="58"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="8"
        />
        <circle
          cx="64"
          cy="64"
          r="58"
          fill="none"
          stroke="url(#chargeGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${chargePercent * 3.64} 364`}
          className="transition-all duration-75"
        />
        <defs>
          <linearGradient id="chargeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Button content */}
      <div className="relative z-10 text-center">
        <span className="text-4xl">🎣</span>
        <p className="text-white text-xs font-bold mt-1">
          {isCharging ? `${Math.round(chargePercent)}%` : 'CAST'}
        </p>
      </div>
      
      {/* Power indicator */}
      {isCharging && chargePercent > 0 && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/80 rounded-full">
          <span className={`text-xs font-bold ${
            chargePercent < 30 ? 'text-yellow-400' :
            chargePercent < 70 ? 'text-orange-400' : 'text-red-400'
          }`}>
            {chargePercent < 30 ? 'WEAK' : chargePercent < 70 ? 'MEDIUM' : 'POWER!'}
          </span>
        </div>
      )}
    </div>
  );
};

// ========== REEL WHEEL CONTROL ==========
const ReelWheel = ({ onReel, size = 120, disabled = false, className = '' }) => {
  const wheelRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isReeling, setIsReeling] = useState(false);
  const [speed, setSpeed] = useState(0);
  const reelHandler = useRef(null);
  
  useEffect(() => {
    if (!wheelRef.current) return;
    
    reelHandler.current = new ReelGestureHandler(wheelRef.current, onReel);
    
    reelHandler.current.on('reelStart', () => {
      setIsReeling(true);
    });
    
    reelHandler.current.on('reelTurn', (data) => {
      setRotation(prev => prev + data.delta);
      setSpeed(data.speed);
    });
    
    reelHandler.current.on('reelEnd', () => {
      setIsReeling(false);
      setSpeed(0);
    });
    
    return () => {
      reelHandler.current?.destroy();
    };
  }, [onReel]);
  
  return (
    <div 
      ref={wheelRef}
      className={`
        relative rounded-full
        bg-gradient-to-br from-gray-700 to-gray-900
        border-4 border-gray-600
        shadow-xl
        select-none touch-none
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
      style={{ width: size, height: size }}
      data-testid="reel-wheel"
    >
      {/* Wheel design */}
      <div 
        className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Spokes */}
        {[0, 45, 90, 135].map((angle) => (
          <div
            key={angle}
            className="absolute w-full h-0.5 bg-gray-500"
            style={{ transform: `rotate(${angle}deg)` }}
          />
        ))}
        
        {/* Center hub */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 border-2 border-yellow-400 flex items-center justify-center">
          <span className="text-xs">🔄</span>
        </div>
      </div>
      
      {/* Handle */}
      <div 
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-6 h-10 bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-full border-2 border-yellow-400"
        style={{ transform: `rotate(${rotation}deg) translateX(${size / 2 + 10}px) translateY(-50%)` }}
      />
      
      {/* Speed indicator */}
      {isReeling && speed > 0 && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/80 rounded-full">
          <span className={`text-xs font-bold ${
            speed < 50 ? 'text-green-400' : speed < 100 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {speed < 50 ? 'SLOW' : speed < 100 ? 'GOOD' : 'FAST!'}
          </span>
        </div>
      )}
    </div>
  );
};

// ========== TAP REEL BUTTON ==========
const TapReelButton = ({ onTap, disabled = false, className = '' }) => {
  const buttonRef = useRef(null);
  const [tapCount, setTapCount] = useState(0);
  const [tps, setTps] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const tapHandler = useRef(null);
  
  useEffect(() => {
    if (!buttonRef.current) return;
    
    tapHandler.current = new TapReelHandler(buttonRef.current, onTap);
    
    tapHandler.current.on('tap', (data) => {
      setTapCount(data.tapCount);
      setIsActive(true);
      setTimeout(() => setIsActive(false), 100);
    });
    
    tapHandler.current.on('rhythm', (data) => {
      setTps(data.tapsPerSecond);
    });
    
    return () => {
      tapHandler.current?.destroy();
    };
  }, [onTap]);
  
  return (
    <div 
      ref={buttonRef}
      className={`
        relative w-28 h-28 rounded-full
        bg-gradient-to-b from-green-500 to-green-700
        border-4 border-green-400
        flex flex-col items-center justify-center
        shadow-xl shadow-green-500/50
        select-none touch-none
        transition-transform duration-75
        ${isActive ? 'scale-95' : 'scale-100'}
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
      data-testid="tap-reel-button"
    >
      <span className="text-3xl">🎯</span>
      <p className="text-white text-xs font-bold">TAP!</p>
      
      {/* TPS indicator */}
      {tps > 0 && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/80 rounded-full">
          <span className={`text-xs font-bold ${
            tps < 3 ? 'text-green-400' : tps < 6 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {tps} TPS
          </span>
        </div>
      )}
      
      {/* Ripple effect */}
      {isActive && (
        <div className="absolute inset-0 rounded-full border-4 border-white/50 animate-ping" />
      )}
    </div>
  );
};

// ========== TENSION METER ==========
const TensionMeter = ({ value = 50, maxValue = 100, onChange, className = '' }) => {
  const meterRef = useRef(null);
  const [currentValue, setCurrentValue] = useState(value);
  const tensionHandler = useRef(null);
  
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);
  
  useEffect(() => {
    if (!meterRef.current) return;
    
    tensionHandler.current = new TensionSliderHandler(meterRef.current, {
      minValue: 0,
      maxValue,
      initialValue: value,
    });
    
    tensionHandler.current.on('change', (data) => {
      setCurrentValue(data.value);
      onChange?.(data);
    });
    
    return () => {
      tensionHandler.current?.destroy();
    };
  }, [maxValue, onChange]);
  
  const percent = (currentValue / maxValue) * 100;
  const getColor = () => {
    if (percent < 30) return 'from-green-500 to-green-600';
    if (percent < 70) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };
  
  return (
    <div 
      ref={meterRef}
      className={`relative w-16 h-48 select-none touch-none ${className}`}
      data-testid="tension-meter"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gray-800 rounded-full border-2 border-gray-600 overflow-hidden">
        {/* Fill */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getColor()} transition-all duration-100`}
          style={{ height: `${percent}%` }}
        />
        
        {/* Danger zone */}
        <div className="absolute top-0 left-0 right-0 h-[30%] bg-red-500/20" />
        
        {/* Scale marks */}
        {[25, 50, 75].map((mark) => (
          <div
            key={mark}
            className="absolute left-0 right-0 h-0.5 bg-white/30"
            style={{ bottom: `${mark}%` }}
          />
        ))}
      </div>
      
      {/* Labels */}
      <div className="absolute -right-8 top-2 text-xs text-red-400 font-bold">MAX</div>
      <div className="absolute -right-8 bottom-2 text-xs text-green-400 font-bold">MIN</div>
      
      {/* Current value */}
      <div className="absolute -left-12 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 rounded text-xs text-white font-bold">
        {Math.round(currentValue)}
      </div>
    </div>
  );
};

// ========== D-PAD CONTROLLER ==========
const DPad = ({ onDirection, size = 120, className = '' }) => {
  const [activeDirection, setActiveDirection] = useState(null);
  
  const handlePress = (direction) => {
    setActiveDirection(direction);
    hapticFeedback.light();
    onDirection?.(direction);
  };
  
  const handleRelease = () => {
    setActiveDirection(null);
    onDirection?.(null);
  };
  
  const buttonClass = (direction) => `
    absolute flex items-center justify-center
    bg-gradient-to-b from-gray-600 to-gray-700
    border-2 border-gray-500
    text-white text-xl
    transition-all duration-75
    ${activeDirection === direction ? 'scale-90 brightness-75' : ''}
  `;
  
  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      data-testid="d-pad"
    >
      {/* Up */}
      <button
        className={`${buttonClass('up')} top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-t-xl`}
        onTouchStart={() => handlePress('up')}
        onTouchEnd={handleRelease}
      >
        ▲
      </button>
      
      {/* Down */}
      <button
        className={`${buttonClass('down')} bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-b-xl`}
        onTouchStart={() => handlePress('down')}
        onTouchEnd={handleRelease}
      >
        ▼
      </button>
      
      {/* Left */}
      <button
        className={`${buttonClass('left')} left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-l-xl`}
        onTouchStart={() => handlePress('left')}
        onTouchEnd={handleRelease}
      >
        ◀
      </button>
      
      {/* Right */}
      <button
        className={`${buttonClass('right')} right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-r-xl`}
        onTouchStart={() => handlePress('right')}
        onTouchEnd={handleRelease}
      >
        ▶
      </button>
      
      {/* Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-600" />
    </div>
  );
};

// ========== VIRTUAL JOYSTICK ==========
const VirtualJoystick = ({ onMove, onEnd, size = 120, className = '' }) => {
  const joystickRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const joystickHandler = useRef(null);
  
  useEffect(() => {
    if (!joystickRef.current) return;
    
    joystickHandler.current = new JoystickHandler(joystickRef.current, {
      maxDistance: size / 2 - 20,
    });
    
    joystickHandler.current.on('start', () => {
      setIsActive(true);
    });
    
    joystickHandler.current.on('move', (data) => {
      setPosition(data.position);
      onMove?.(data);
    });
    
    joystickHandler.current.on('end', () => {
      setIsActive(false);
      setPosition({ x: 0, y: 0 });
      onEnd?.();
    });
    
    return () => {
      joystickHandler.current?.destroy();
    };
  }, [size, onMove, onEnd]);
  
  return (
    <div 
      ref={joystickRef}
      className={`relative rounded-full bg-gray-800/80 border-4 border-gray-600 ${className}`}
      style={{ width: size, height: size }}
      data-testid="virtual-joystick"
    >
      {/* Base markings */}
      <div className="absolute inset-4 rounded-full border-2 border-gray-700 border-dashed" />
      
      {/* Thumb */}
      <div 
        className={`
          absolute w-12 h-12 rounded-full
          bg-gradient-to-b from-blue-500 to-blue-700
          border-4 border-blue-400
          shadow-lg
          transition-transform duration-75
          ${isActive ? 'scale-110' : ''}
        `}
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        }}
      />
    </div>
  );
};

// ========== ACTION BUTTONS (A, B style) ==========
const ActionButtons = ({ onA, onB, className = '' }) => {
  const [aPressed, setAPressed] = useState(false);
  const [bPressed, setBPressed] = useState(false);
  
  return (
    <div className={`flex gap-4 ${className}`} data-testid="action-buttons">
      {/* B Button */}
      <button
        className={`
          w-16 h-16 rounded-full
          bg-gradient-to-b from-red-500 to-red-700
          border-4 border-red-400
          text-white text-2xl font-bold
          shadow-lg shadow-red-500/50
          transition-all duration-75
          ${bPressed ? 'scale-90 brightness-75' : ''}
        `}
        onTouchStart={() => {
          setBPressed(true);
          hapticFeedback.medium();
          onB?.();
        }}
        onTouchEnd={() => setBPressed(false)}
      >
        B
      </button>
      
      {/* A Button */}
      <button
        className={`
          w-20 h-20 rounded-full
          bg-gradient-to-b from-green-500 to-green-700
          border-4 border-green-400
          text-white text-2xl font-bold
          shadow-lg shadow-green-500/50
          transition-all duration-75
          ${aPressed ? 'scale-90 brightness-75' : ''}
        `}
        onTouchStart={() => {
          setAPressed(true);
          hapticFeedback.medium();
          onA?.();
        }}
        onTouchEnd={() => setAPressed(false)}
      >
        A
      </button>
    </div>
  );
};

// ========== SWIPE INDICATOR ==========
const SwipeIndicator = ({ direction = 'up', animated = true, className = '' }) => {
  const arrows = {
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
  };
  
  const animationClass = {
    up: 'animate-bounce',
    down: 'animate-bounce',
    left: 'animate-pulse',
    right: 'animate-pulse',
  };
  
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <span className={`text-4xl text-white/60 ${animated ? animationClass[direction] : ''}`}>
        {arrows[direction]}
      </span>
      <span className="text-xs text-white/40 uppercase">Swipe {direction}</span>
    </div>
  );
};

// ========== TOUCH TUTORIAL OVERLAY ==========
const TouchTutorial = ({ step, onNext, onSkip }) => {
  const tutorials = [
    {
      title: 'Casting',
      description: 'Pull down and release to cast your line. The longer you charge, the further it goes!',
      icon: '🎣',
      gesture: 'swipeUp',
    },
    {
      title: 'Reeling',
      description: 'Spin the reel wheel or tap rapidly to reel in your catch!',
      icon: '🔄',
      gesture: 'rotate',
    },
    {
      title: 'Tension Control',
      description: 'Drag up/down to control line tension. Don\'t let it snap!',
      icon: '📊',
      gesture: 'drag',
    },
    {
      title: 'Perfect Catch',
      description: 'Time your taps perfectly when the fish bites for bonus points!',
      icon: '⭐',
      gesture: 'tap',
    },
  ];
  
  const currentTutorial = tutorials[step] || tutorials[0];
  
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6">
      <div className="max-w-sm text-center">
        {/* Icon */}
        <div className="text-8xl mb-6 animate-bounce">{currentTutorial.icon}</div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-4">{currentTutorial.title}</h2>
        
        {/* Description */}
        <p className="text-white/70 mb-8">{currentTutorial.description}</p>
        
        {/* Gesture hint */}
        <div className="mb-8">
          {currentTutorial.gesture === 'swipeUp' && <SwipeIndicator direction="up" />}
          {currentTutorial.gesture === 'rotate' && (
            <div className="text-4xl text-white/60 animate-spin">🔄</div>
          )}
          {currentTutorial.gesture === 'drag' && (
            <div className="flex justify-center gap-2">
              <SwipeIndicator direction="up" />
              <SwipeIndicator direction="down" />
            </div>
          )}
          {currentTutorial.gesture === 'tap' && (
            <div className="text-4xl text-white/60 animate-pulse">👆</div>
          )}
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {tutorials.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i === step ? 'bg-blue-500' : 'bg-white/30'}`}
            />
          ))}
        </div>
        
        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onSkip}
            className="px-6 py-3 bg-white/10 rounded-xl text-white/70"
          >
            Skip
          </button>
          <button
            onClick={onNext}
            className="px-6 py-3 bg-blue-500 rounded-xl text-white font-bold"
          >
            {step < tutorials.length - 1 ? 'Next' : 'Got it!'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== MOBILE HUD LAYOUT ==========
const MobileHUD = ({
  onCast,
  onReel,
  onTensionChange,
  tension = 50,
  isReeling = false,
  isCasting = false,
  score = 0,
  className = '',
}) => {
  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`} data-testid="mobile-hud">
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        <div className="bg-black/60 rounded-xl px-4 py-2">
          <p className="text-xs text-white/60">SCORE</p>
          <p className="text-xl font-bold text-yellow-400">{score.toLocaleString()}</p>
        </div>
        
        <div className="flex gap-2">
          <TouchButton size="small" variant="ghost" icon="⏸" />
          <TouchButton size="small" variant="ghost" icon="⚙️" />
        </div>
      </div>
      
      {/* Left side - Tension meter */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto">
        <TensionMeter value={tension} onChange={onTensionChange} />
      </div>
      
      {/* Right side - Main controls */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-4 pointer-events-auto">
        {isReeling ? (
          <TapReelButton onTap={onReel} />
        ) : (
          <CastButton onCast={onCast} disabled={isCasting} />
        )}
      </div>
      
      {/* Bottom action buttons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
        <ActionButtons 
          onA={() => console.log('Action A')}
          onB={() => console.log('Action B')}
        />
      </div>
    </div>
  );
};

// Export all components
export {
  TouchButton,
  CastButton,
  ReelWheel,
  TapReelButton,
  TensionMeter,
  DPad,
  VirtualJoystick,
  ActionButtons,
  SwipeIndicator,
  TouchTutorial,
  MobileHUD,
};

export default MobileHUD;
