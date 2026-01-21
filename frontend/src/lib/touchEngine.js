// ========================================================================
// GO FISH! - AAA MOBILE TOUCH CONTROLS ENGINE
// Comprehensive touch gesture recognition and haptic feedback
// Optimized for fishing game mechanics on mobile devices
// ========================================================================

// ========== TOUCH DETECTION UTILITIES ==========

// Check if device supports touch
export const isTouchDevice = () => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
};

// Check if device is mobile
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Get touch position relative to element
export const getTouchPosition = (touch, element) => {
  const rect = element.getBoundingClientRect();
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
    clientX: touch.clientX,
    clientY: touch.clientY,
    pageX: touch.pageX,
    pageY: touch.pageY,
  };
};

// Calculate distance between two points
export const getDistance = (p1, p2) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Calculate angle between two points (in degrees)
export const getAngle = (p1, p2) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

// Calculate velocity
export const getVelocity = (distance, time) => {
  return time > 0 ? distance / time : 0;
};

// ========== HAPTIC FEEDBACK ==========

export const hapticFeedback = {
  // Light tap feedback
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  // Medium feedback
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  },
  
  // Heavy/strong feedback
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  },
  
  // Success pattern
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 50, 30]);
    }
  },
  
  // Error pattern
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50, 100, 50]);
    }
  },
  
  // Cast pattern (wind up and release)
  cast: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 20, 10, 20, 10, 20, 50]);
    }
  },
  
  // Reel click pattern
  reelClick: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  },
  
  // Fish bite alert
  bite: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  },
  
  // Fish caught celebration
  caught: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50, 30, 100]);
    }
  },
  
  // Fish escape
  escape: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  },
  
  // Tension warning
  tensionWarning: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 30, 30, 30, 30]);
    }
  },
  
  // Custom pattern
  custom: (pattern) => {
    if ('vibrate' in navigator && Array.isArray(pattern)) {
      navigator.vibrate(pattern);
    }
  },
  
  // Stop all vibration
  stop: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
  },
};

// ========== GESTURE RECOGNIZER ==========

export class GestureRecognizer {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      tapThreshold: 10,        // Max movement for tap
      tapTimeout: 300,         // Max time for tap (ms)
      doubleTapTimeout: 300,   // Max time between taps for double tap
      longPressTimeout: 500,   // Time for long press
      swipeThreshold: 50,      // Min distance for swipe
      swipeVelocityThreshold: 0.3, // Min velocity for swipe
      pinchThreshold: 10,      // Min scale change for pinch
      rotateThreshold: 10,     // Min rotation for rotate
      ...options,
    };
    
    this.callbacks = {
      tap: [],
      doubleTap: [],
      longPress: [],
      swipe: [],
      swipeUp: [],
      swipeDown: [],
      swipeLeft: [],
      swipeRight: [],
      pinch: [],
      rotate: [],
      pan: [],
      panStart: [],
      panMove: [],
      panEnd: [],
      touchStart: [],
      touchMove: [],
      touchEnd: [],
    };
    
    this.state = {
      isTracking: false,
      startTime: 0,
      startPosition: null,
      lastPosition: null,
      lastTapTime: 0,
      longPressTimer: null,
      initialPinchDistance: 0,
      initialRotation: 0,
      touches: [],
    };
    
    this.bindEvents();
  }
  
  bindEvents() {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
  }
  
  unbindEvents() {
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this));
  }
  
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
    return this;
  }
  
  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
    return this;
  }
  
  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }
  
  handleTouchStart(e) {
    const touches = Array.from(e.touches);
    const touch = touches[0];
    const position = getTouchPosition(touch, this.element);
    
    this.state.isTracking = true;
    this.state.startTime = Date.now();
    this.state.startPosition = position;
    this.state.lastPosition = position;
    this.state.touches = touches.map(t => getTouchPosition(t, this.element));
    
    // Start long press timer
    this.state.longPressTimer = setTimeout(() => {
      if (this.state.isTracking) {
        const distance = getDistance(this.state.startPosition, this.state.lastPosition);
        if (distance < this.options.tapThreshold) {
          this.emit('longPress', {
            position: this.state.startPosition,
            duration: Date.now() - this.state.startTime,
          });
          hapticFeedback.medium();
        }
      }
    }, this.options.longPressTimeout);
    
    // Handle multi-touch for pinch/rotate
    if (touches.length === 2) {
      const p1 = getTouchPosition(touches[0], this.element);
      const p2 = getTouchPosition(touches[1], this.element);
      this.state.initialPinchDistance = getDistance(p1, p2);
      this.state.initialRotation = getAngle(p1, p2);
    }
    
    this.emit('touchStart', { position, touches: this.state.touches, event: e });
    this.emit('panStart', { position, event: e });
  }
  
  handleTouchMove(e) {
    if (!this.state.isTracking) return;
    
    const touches = Array.from(e.touches);
    const touch = touches[0];
    const position = getTouchPosition(touch, this.element);
    const delta = {
      x: position.x - this.state.lastPosition.x,
      y: position.y - this.state.lastPosition.y,
    };
    const totalDelta = {
      x: position.x - this.state.startPosition.x,
      y: position.y - this.state.startPosition.y,
    };
    
    this.state.lastPosition = position;
    this.state.touches = touches.map(t => getTouchPosition(t, this.element));
    
    // Cancel long press if moved too much
    const distance = getDistance(this.state.startPosition, position);
    if (distance > this.options.tapThreshold) {
      clearTimeout(this.state.longPressTimer);
    }
    
    // Handle multi-touch gestures
    if (touches.length === 2) {
      const p1 = getTouchPosition(touches[0], this.element);
      const p2 = getTouchPosition(touches[1], this.element);
      
      // Pinch
      const currentDistance = getDistance(p1, p2);
      const scale = currentDistance / this.state.initialPinchDistance;
      if (Math.abs(scale - 1) * 100 > this.options.pinchThreshold) {
        this.emit('pinch', {
          scale,
          center: {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
          },
        });
      }
      
      // Rotate
      const currentRotation = getAngle(p1, p2);
      const rotation = currentRotation - this.state.initialRotation;
      if (Math.abs(rotation) > this.options.rotateThreshold) {
        this.emit('rotate', {
          rotation,
          center: {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
          },
        });
      }
    }
    
    // Emit pan/move events
    this.emit('touchMove', { position, delta, totalDelta, touches: this.state.touches, event: e });
    this.emit('panMove', { position, delta, totalDelta, event: e });
    this.emit('pan', { position, delta, totalDelta, event: e });
    
    // Prevent scrolling during gesture
    e.preventDefault();
  }
  
  handleTouchEnd(e) {
    if (!this.state.isTracking) return;
    
    clearTimeout(this.state.longPressTimer);
    
    const duration = Date.now() - this.state.startTime;
    const distance = getDistance(this.state.startPosition, this.state.lastPosition);
    const velocity = getVelocity(distance, duration);
    const angle = getAngle(this.state.startPosition, this.state.lastPosition);
    
    // Determine gesture type
    if (distance < this.options.tapThreshold && duration < this.options.tapTimeout) {
      // Tap detection
      const now = Date.now();
      if (now - this.state.lastTapTime < this.options.doubleTapTimeout) {
        this.emit('doubleTap', { position: this.state.startPosition });
        hapticFeedback.light();
        this.state.lastTapTime = 0;
      } else {
        this.emit('tap', { position: this.state.startPosition });
        hapticFeedback.light();
        this.state.lastTapTime = now;
      }
    } else if (distance >= this.options.swipeThreshold || velocity >= this.options.swipeVelocityThreshold) {
      // Swipe detection
      const direction = this.getSwipeDirection(angle);
      const swipeData = {
        direction,
        distance,
        velocity,
        angle,
        startPosition: this.state.startPosition,
        endPosition: this.state.lastPosition,
        duration,
      };
      
      this.emit('swipe', swipeData);
      this.emit(`swipe${direction.charAt(0).toUpperCase() + direction.slice(1)}`, swipeData);
      hapticFeedback.medium();
    }
    
    this.emit('touchEnd', { position: this.state.lastPosition, duration, event: e });
    this.emit('panEnd', { position: this.state.lastPosition, duration, event: e });
    
    this.state.isTracking = false;
  }
  
  handleTouchCancel(e) {
    clearTimeout(this.state.longPressTimer);
    this.state.isTracking = false;
    this.emit('touchEnd', { position: this.state.lastPosition, cancelled: true, event: e });
  }
  
  getSwipeDirection(angle) {
    if (angle >= -45 && angle < 45) return 'right';
    if (angle >= 45 && angle < 135) return 'down';
    if (angle >= -135 && angle < -45) return 'up';
    return 'left';
  }
  
  destroy() {
    this.unbindEvents();
    clearTimeout(this.state.longPressTimer);
  }
}

// ========== FISHING CAST GESTURE ==========

export class CastGestureHandler {
  constructor(element, onCast) {
    this.element = element;
    this.onCast = onCast;
    this.isCharging = false;
    this.chargeStartTime = 0;
    this.chargeStartPosition = null;
    this.maxChargeTime = 1500; // ms
    this.minSwipeDistance = 100;
    this.maxChargeDistance = 300;
    this.callbacks = {
      chargeStart: [],
      chargeUpdate: [],
      chargeEnd: [],
      cast: [],
    };
    
    this.gestureRecognizer = new GestureRecognizer(element);
    this.setupGestures();
  }
  
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
    return this;
  }
  
  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(cb => cb(data));
    }
  }
  
  setupGestures() {
    this.gestureRecognizer.on('touchStart', (data) => {
      this.isCharging = true;
      this.chargeStartTime = Date.now();
      this.chargeStartPosition = data.position;
      hapticFeedback.light();
      this.emit('chargeStart', { position: data.position });
    });
    
    this.gestureRecognizer.on('panMove', (data) => {
      if (!this.isCharging) return;
      
      const chargeTime = Date.now() - this.chargeStartTime;
      const pullDistance = getDistance(this.chargeStartPosition, data.position);
      const angle = getAngle(this.chargeStartPosition, data.position);
      
      // Only count upward pulls (for casting forward)
      const isUpwardPull = angle < -30 && angle > -150;
      
      const chargePercent = Math.min(1, Math.max(
        chargeTime / this.maxChargeTime,
        pullDistance / this.maxChargeDistance
      ));
      
      this.emit('chargeUpdate', {
        percent: chargePercent,
        distance: pullDistance,
        angle,
        isValidDirection: isUpwardPull,
        position: data.position,
      });
      
      // Haptic feedback at milestones
      if (chargePercent >= 0.5 && chargePercent < 0.55) {
        hapticFeedback.light();
      } else if (chargePercent >= 0.75 && chargePercent < 0.8) {
        hapticFeedback.medium();
      } else if (chargePercent >= 1) {
        hapticFeedback.heavy();
      }
    });
    
    this.gestureRecognizer.on('swipeUp', (data) => {
      if (!this.isCharging) return;
      this.performCast(data);
    });
    
    this.gestureRecognizer.on('touchEnd', (data) => {
      if (!this.isCharging) return;
      
      const chargeTime = Date.now() - this.chargeStartTime;
      const pullDistance = getDistance(this.chargeStartPosition, data.position);
      
      // If released without proper swipe, still cast if charged enough
      if (pullDistance > this.minSwipeDistance * 0.5 || chargeTime > this.maxChargeTime * 0.3) {
        this.performCast({
          distance: pullDistance,
          velocity: pullDistance / chargeTime * 1000,
          duration: chargeTime,
        });
      } else {
        this.emit('chargeEnd', { cancelled: true });
      }
      
      this.isCharging = false;
    });
  }
  
  performCast(data) {
    const chargeTime = Date.now() - this.chargeStartTime;
    const power = Math.min(1, Math.max(0.2,
      (data.distance / this.maxChargeDistance) * 0.5 +
      (chargeTime / this.maxChargeTime) * 0.3 +
      (data.velocity / 2) * 0.2
    ));
    
    const castData = {
      power,
      distance: data.distance,
      velocity: data.velocity,
      chargeTime,
      angle: data.angle,
    };
    
    hapticFeedback.cast();
    this.emit('cast', castData);
    
    if (this.onCast) {
      this.onCast(castData);
    }
    
    this.isCharging = false;
    this.emit('chargeEnd', { cancelled: false, castData });
  }
  
  destroy() {
    this.gestureRecognizer.destroy();
  }
}

// ========== REEL GESTURE HANDLER ==========

export class ReelGestureHandler {
  constructor(element, onReel) {
    this.element = element;
    this.onReel = onReel;
    this.isReeling = false;
    this.lastAngle = 0;
    this.totalRotation = 0;
    this.reelSpeed = 0;
    this.lastReelTime = 0;
    this.centerPoint = null;
    this.callbacks = {
      reelStart: [],
      reelTurn: [],
      reelEnd: [],
    };
    
    this.gestureRecognizer = new GestureRecognizer(element);
    this.setupGestures();
  }
  
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
    return this;
  }
  
  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(cb => cb(data));
    }
  }
  
  setupGestures() {
    this.gestureRecognizer.on('touchStart', (data) => {
      this.isReeling = true;
      const rect = this.element.getBoundingClientRect();
      this.centerPoint = {
        x: rect.width / 2,
        y: rect.height / 2,
      };
      this.lastAngle = getAngle(this.centerPoint, data.position);
      this.totalRotation = 0;
      this.emit('reelStart', {});
    });
    
    this.gestureRecognizer.on('panMove', (data) => {
      if (!this.isReeling) return;
      
      const currentAngle = getAngle(this.centerPoint, data.position);
      let angleDelta = currentAngle - this.lastAngle;
      
      // Handle angle wrap-around
      if (angleDelta > 180) angleDelta -= 360;
      if (angleDelta < -180) angleDelta += 360;
      
      this.totalRotation += angleDelta;
      this.lastAngle = currentAngle;
      
      // Calculate reel speed
      const now = Date.now();
      const timeDelta = now - this.lastReelTime;
      this.reelSpeed = Math.abs(angleDelta) / Math.max(timeDelta, 1) * 100;
      this.lastReelTime = now;
      
      // Haptic feedback on rotation
      if (Math.abs(this.totalRotation) % 30 < Math.abs(angleDelta)) {
        hapticFeedback.reelClick();
      }
      
      const reelData = {
        rotation: this.totalRotation,
        delta: angleDelta,
        speed: this.reelSpeed,
        direction: angleDelta > 0 ? 'clockwise' : 'counterclockwise',
      };
      
      this.emit('reelTurn', reelData);
      
      if (this.onReel) {
        this.onReel(reelData);
      }
    });
    
    this.gestureRecognizer.on('touchEnd', () => {
      this.isReeling = false;
      this.emit('reelEnd', {
        totalRotation: this.totalRotation,
        averageSpeed: this.reelSpeed,
      });
    });
  }
  
  destroy() {
    this.gestureRecognizer.destroy();
  }
}

// ========== TAP TO REEL HANDLER (Simpler Alternative) ==========

export class TapReelHandler {
  constructor(element, onTap) {
    this.element = element;
    this.onTap = onTap;
    this.tapCount = 0;
    this.tapsPerSecond = 0;
    this.lastTapTime = 0;
    this.tpsUpdateInterval = null;
    this.callbacks = {
      tap: [],
      rhythm: [],
    };
    
    this.gestureRecognizer = new GestureRecognizer(element);
    this.setupGestures();
    this.startTPSCounter();
  }
  
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
    return this;
  }
  
  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(cb => cb(data));
    }
  }
  
  setupGestures() {
    this.gestureRecognizer.on('tap', (data) => {
      this.tapCount++;
      this.lastTapTime = Date.now();
      
      hapticFeedback.light();
      
      const tapData = {
        position: data.position,
        tapCount: this.tapCount,
        tapsPerSecond: this.tapsPerSecond,
      };
      
      this.emit('tap', tapData);
      
      if (this.onTap) {
        this.onTap(tapData);
      }
    });
  }
  
  startTPSCounter() {
    let previousCount = 0;
    this.tpsUpdateInterval = setInterval(() => {
      this.tapsPerSecond = this.tapCount - previousCount;
      previousCount = this.tapCount;
      
      if (this.tapsPerSecond > 0) {
        this.emit('rhythm', {
          tapsPerSecond: this.tapsPerSecond,
          totalTaps: this.tapCount,
        });
      }
    }, 1000);
  }
  
  reset() {
    this.tapCount = 0;
    this.tapsPerSecond = 0;
  }
  
  destroy() {
    this.gestureRecognizer.destroy();
    clearInterval(this.tpsUpdateInterval);
  }
}

// ========== TENSION SLIDER HANDLER ==========

export class TensionSliderHandler {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      minValue: 0,
      maxValue: 100,
      initialValue: 50,
      sensitivity: 1,
      ...options,
    };
    
    this.currentValue = this.options.initialValue;
    this.callbacks = {
      change: [],
      release: [],
    };
    
    this.gestureRecognizer = new GestureRecognizer(element);
    this.setupGestures();
  }
  
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
    return this;
  }
  
  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(cb => cb(data));
    }
  }
  
  setupGestures() {
    this.gestureRecognizer.on('panMove', (data) => {
      // Vertical drag to adjust tension
      const deltaY = -data.delta.y * this.options.sensitivity;
      this.currentValue = Math.max(
        this.options.minValue,
        Math.min(this.options.maxValue, this.currentValue + deltaY * 0.5)
      );
      
      // Haptic at boundaries
      if (this.currentValue >= this.options.maxValue * 0.9) {
        hapticFeedback.tensionWarning();
      }
      
      this.emit('change', {
        value: this.currentValue,
        percent: this.currentValue / this.options.maxValue,
        delta: deltaY,
      });
    });
    
    this.gestureRecognizer.on('touchEnd', () => {
      this.emit('release', {
        value: this.currentValue,
        percent: this.currentValue / this.options.maxValue,
      });
    });
  }
  
  setValue(value) {
    this.currentValue = Math.max(
      this.options.minValue,
      Math.min(this.options.maxValue, value)
    );
  }
  
  getValue() {
    return this.currentValue;
  }
  
  destroy() {
    this.gestureRecognizer.destroy();
  }
}

// ========== JOYSTICK HANDLER ==========

export class JoystickHandler {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      maxDistance: 50,
      deadzone: 5,
      ...options,
    };
    
    this.position = { x: 0, y: 0 };
    this.normalizedPosition = { x: 0, y: 0 };
    this.isActive = false;
    this.callbacks = {
      move: [],
      start: [],
      end: [],
    };
    
    this.gestureRecognizer = new GestureRecognizer(element);
    this.setupGestures();
  }
  
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
    return this;
  }
  
  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(cb => cb(data));
    }
  }
  
  setupGestures() {
    const rect = this.element.getBoundingClientRect();
    const center = { x: rect.width / 2, y: rect.height / 2 };
    
    this.gestureRecognizer.on('touchStart', (data) => {
      this.isActive = true;
      this.emit('start', {});
    });
    
    this.gestureRecognizer.on('panMove', (data) => {
      if (!this.isActive) return;
      
      const deltaX = data.totalDelta.x;
      const deltaY = data.totalDelta.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Clamp to max distance
      const clampedDistance = Math.min(distance, this.options.maxDistance);
      const angle = Math.atan2(deltaY, deltaX);
      
      this.position = {
        x: Math.cos(angle) * clampedDistance,
        y: Math.sin(angle) * clampedDistance,
      };
      
      // Apply deadzone
      if (clampedDistance < this.options.deadzone) {
        this.normalizedPosition = { x: 0, y: 0 };
      } else {
        this.normalizedPosition = {
          x: this.position.x / this.options.maxDistance,
          y: this.position.y / this.options.maxDistance,
        };
      }
      
      this.emit('move', {
        position: this.position,
        normalized: this.normalizedPosition,
        distance: clampedDistance,
        angle: (angle * 180) / Math.PI,
      });
    });
    
    this.gestureRecognizer.on('touchEnd', () => {
      this.isActive = false;
      this.position = { x: 0, y: 0 };
      this.normalizedPosition = { x: 0, y: 0 };
      this.emit('end', {});
    });
  }
  
  destroy() {
    this.gestureRecognizer.destroy();
  }
}

// ========== MULTI-TOUCH BUTTON HANDLER ==========

export class MultiTouchButtonHandler {
  constructor(buttons) {
    this.buttons = buttons; // Array of { element, action }
    this.activeButtons = new Set();
    this.handlers = [];
    
    this.setupButtons();
  }
  
  setupButtons() {
    this.buttons.forEach(({ element, action, haptic = 'light' }) => {
      const handler = (e) => {
        e.preventDefault();
        this.activeButtons.add(action);
        hapticFeedback[haptic]?.();
        
        element.classList.add('active');
        
        const handleEnd = () => {
          this.activeButtons.delete(action);
          element.classList.remove('active');
        };
        
        element.addEventListener('touchend', handleEnd, { once: true });
        element.addEventListener('touchcancel', handleEnd, { once: true });
      };
      
      element.addEventListener('touchstart', handler, { passive: false });
      this.handlers.push({ element, handler });
    });
  }
  
  isPressed(action) {
    return this.activeButtons.has(action);
  }
  
  getActiveActions() {
    return Array.from(this.activeButtons);
  }
  
  destroy() {
    this.handlers.forEach(({ element, handler }) => {
      element.removeEventListener('touchstart', handler);
    });
  }
}

// Export all
export default {
  isTouchDevice,
  isMobile,
  getTouchPosition,
  getDistance,
  getAngle,
  getVelocity,
  hapticFeedback,
  GestureRecognizer,
  CastGestureHandler,
  ReelGestureHandler,
  TapReelHandler,
  TensionSliderHandler,
  JoystickHandler,
  MultiTouchButtonHandler,
};
