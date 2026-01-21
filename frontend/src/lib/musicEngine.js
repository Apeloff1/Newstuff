// ========================================================================
// GO FISH! - AAA QUALITY MUSIC ENGINE
// Procedural Music System Inspired by Harvest Moon & Pokemon Silver
// Upbeat, Addictive, Nostalgic Chiptune/Lo-fi Soundtrack
// ========================================================================

// Web Audio API context singleton
let audioContext = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;

// Initialize audio context
const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    musicGain = audioContext.createGain();
    sfxGain = audioContext.createGain();
    
    musicGain.connect(masterGain);
    sfxGain.connect(masterGain);
    masterGain.connect(audioContext.destination);
    
    masterGain.gain.value = 0.7;
    musicGain.gain.value = 0.5;
    sfxGain.gain.value = 0.8;
  }
  return audioContext;
};

// Resume audio context (needed for mobile browsers)
const resumeAudio = async () => {
  const ctx = initAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  return ctx;
};

// ========== MUSICAL SCALES & CHORDS ==========
// Harvest Moon / Pokemon Silver inspired - major keys, pentatonic scales

const NOTES = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51,
};

// Major pentatonic scales (happy, upbeat feel like Pokemon)
const SCALES = {
  C_MAJOR_PENTA: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'],
  G_MAJOR_PENTA: ['G3', 'A3', 'B3', 'D4', 'E4', 'G4', 'A4', 'B4'],
  D_MAJOR_PENTA: ['D4', 'E4', 'F4', 'A4', 'B4', 'D5', 'E5', 'F5'],
  F_MAJOR_PENTA: ['F3', 'G3', 'A3', 'C4', 'D4', 'F4', 'G4', 'A4'],
  A_MAJOR_PENTA: ['A3', 'B3', 'C4', 'E4', 'F4', 'A4', 'B4', 'C5'],
};

// Chord progressions (Harvest Moon style - warm, nostalgic)
const CHORD_PROGRESSIONS = {
  HAPPY_MAIN: [
    ['C4', 'E4', 'G4'],      // C major
    ['G3', 'B3', 'D4'],      // G major  
    ['A3', 'C4', 'E4'],      // A minor
    ['F3', 'A3', 'C4'],      // F major
  ],
  UPBEAT_FISHING: [
    ['D4', 'F4', 'A4'],      // D minor
    ['G3', 'B3', 'D4'],      // G major
    ['C4', 'E4', 'G4'],      // C major
    ['A3', 'C4', 'E4'],      // A minor
  ],
  VICTORY: [
    ['C4', 'E4', 'G4'],      // C major
    ['D4', 'F4', 'A4'],      // D minor
    ['E4', 'G4', 'B4'],      // E minor
    ['G4', 'B4', 'D5'],      // G major
  ],
  MENU_CHILL: [
    ['F3', 'A3', 'C4'],      // F major
    ['C4', 'E4', 'G4'],      // C major
    ['G3', 'B3', 'D4'],      // G major
    ['A3', 'C4', 'E4'],      // A minor
  ],
  NIGHT_CALM: [
    ['A3', 'C4', 'E4'],      // A minor
    ['F3', 'A3', 'C4'],      // F major
    ['G3', 'B3', 'D4'],      // G major
    ['E3', 'G3', 'B3'],      // E minor
  ],
  STORM_INTENSE: [
    ['E3', 'G3', 'B3'],      // E minor
    ['A3', 'C4', 'E4'],      // A minor
    ['D3', 'F3', 'A3'],      // D minor
    ['G3', 'B3', 'D4'],      // G major
  ],
};

// Melodic patterns (Pokemon Silver style - catchy, memorable)
const MELODY_PATTERNS = {
  BOUNCE: [0, 2, 4, 2, 0, -2, 0, 2],
  RISE: [0, 1, 2, 3, 4, 5, 4, 3],
  FALL: [4, 3, 2, 1, 0, 1, 2, 1],
  WAVE: [0, 2, 4, 2, 0, 2, 4, 6],
  SKIP: [0, 2, 0, 3, 0, 4, 0, 5],
  DANCE: [0, 4, 2, 4, 0, 4, 3, 4],
  HOOK: [0, 0, 2, 4, 4, 2, 0, 2],
  CATCH: [0, 2, 4, 7, 4, 2, 0, 0],
};

// Rhythm patterns (durations in beats)
const RHYTHM_PATTERNS = {
  STEADY: [1, 1, 1, 1, 1, 1, 1, 1],
  SYNCOPATED: [1.5, 0.5, 1, 1, 1.5, 0.5, 1, 1],
  BOUNCY: [0.75, 0.25, 0.5, 0.5, 0.75, 0.25, 0.5, 0.5],
  SWING: [1.33, 0.67, 1.33, 0.67, 1.33, 0.67, 1, 1],
  DRIVING: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  RELAXED: [2, 1, 1, 2, 1, 1, 1, 1],
};

// Bass patterns
const BASS_PATTERNS = {
  WALKING: [0, 0, 4, 4, 0, 0, 2, 2],
  PUMPING: [0, 0, 0, 0, 0, 0, 0, 0],
  GROOVE: [0, -1, 0, 2, 0, -1, 0, 4],
  BOUNCE: [0, 4, 0, 4, 0, 4, 2, 4],
};

// ========== INSTRUMENT SYNTHESIZERS ==========

// Square wave synth (classic chiptune lead)
const createSquareSynth = (ctx, frequency, duration, volume = 0.3) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  osc.type = 'square';
  osc.frequency.value = frequency;
  
  filter.type = 'lowpass';
  filter.frequency.value = 2000;
  filter.Q.value = 1;
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(musicGain);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
  
  return { osc, gain };
};

// Triangle wave synth (softer lead, Harvest Moon style)
const createTriangleSynth = (ctx, frequency, duration, volume = 0.4) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.value = frequency;
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
  gain.gain.setValueAtTime(volume * 0.7, ctx.currentTime + duration * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(musicGain);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
  
  return { osc, gain };
};

// Sine wave synth (pure tones, bells)
const createSineSynth = (ctx, frequency, duration, volume = 0.25) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.value = frequency;
  
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(musicGain);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
  
  return { osc, gain };
};

// Sawtooth synth (rich harmonics, bass)
const createSawSynth = (ctx, frequency, duration, volume = 0.2) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  osc.type = 'sawtooth';
  osc.frequency.value = frequency;
  
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  filter.Q.value = 2;
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gain.gain.setValueAtTime(volume * 0.8, ctx.currentTime + duration * 0.5);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(musicGain);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
  
  return { osc, gain };
};

// Pulse wave with PWM (classic NES sound)
const createPulseSynth = (ctx, frequency, duration, pulseWidth = 0.25, volume = 0.25) => {
  const real = new Float32Array(256);
  const imag = new Float32Array(256);
  
  for (let i = 1; i < 256; i++) {
    real[i] = (4 / (i * Math.PI)) * Math.sin(i * Math.PI * pulseWidth);
  }
  
  const wave = ctx.createPeriodicWave(real, imag);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.setPeriodicWave(wave);
  osc.frequency.value = frequency;
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(musicGain);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
  
  return { osc, gain };
};

// Noise generator (percussion)
const createNoise = (ctx, duration, volume = 0.1, type = 'white') => {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  }
  
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  source.buffer = buffer;
  filter.type = 'highpass';
  filter.frequency.value = 1000;
  
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  source.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);
  
  source.start(ctx.currentTime);
  
  return { source, gain };
};

// ========== DRUM MACHINE ==========

const createKick = (ctx, time = 0) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, ctx.currentTime + time);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + time + 0.1);
  
  gain.gain.setValueAtTime(0.8, ctx.currentTime + time);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.3);
  
  osc.connect(gain);
  gain.connect(sfxGain);
  
  osc.start(ctx.currentTime + time);
  osc.stop(ctx.currentTime + time + 0.3);
};

const createSnare = (ctx, time = 0) => {
  // Noise component
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  const noiseGain = ctx.createGain();
  const noiseFilter = ctx.createBiquadFilter();
  
  noise.buffer = noiseBuffer;
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 2000;
  
  noiseGain.gain.setValueAtTime(0.3, ctx.currentTime + time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.1);
  
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(sfxGain);
  
  // Tone component
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.value = 200;
  
  oscGain.gain.setValueAtTime(0.4, ctx.currentTime + time);
  oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.05);
  
  osc.connect(oscGain);
  oscGain.connect(sfxGain);
  
  noise.start(ctx.currentTime + time);
  osc.start(ctx.currentTime + time);
  osc.stop(ctx.currentTime + time + 0.1);
};

const createHiHat = (ctx, time = 0, open = false) => {
  const duration = open ? 0.2 : 0.05;
  
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  noise.buffer = noiseBuffer;
  filter.type = 'highpass';
  filter.frequency.value = 7000;
  
  gain.gain.setValueAtTime(open ? 0.15 : 0.1, ctx.currentTime + time);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + duration);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);
  
  noise.start(ctx.currentTime + time);
};

// ========== ARPEGGIATOR ==========

class Arpeggiator {
  constructor(ctx, notes, bpm = 120, pattern = 'up') {
    this.ctx = ctx;
    this.notes = notes;
    this.bpm = bpm;
    this.pattern = pattern;
    this.isPlaying = false;
    this.currentIndex = 0;
    this.intervalId = null;
  }
  
  getNextNote() {
    let index;
    switch (this.pattern) {
      case 'up':
        index = this.currentIndex % this.notes.length;
        this.currentIndex++;
        break;
      case 'down':
        index = (this.notes.length - 1) - (this.currentIndex % this.notes.length);
        this.currentIndex++;
        break;
      case 'updown':
        const cycle = this.notes.length * 2 - 2;
        const pos = this.currentIndex % cycle;
        index = pos < this.notes.length ? pos : cycle - pos;
        this.currentIndex++;
        break;
      case 'random':
        index = Math.floor(Math.random() * this.notes.length);
        break;
      default:
        index = this.currentIndex % this.notes.length;
        this.currentIndex++;
    }
    return this.notes[index];
  }
  
  start(synthType = 'triangle', volume = 0.2) {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    const interval = (60 / this.bpm) * 1000 / 2; // 8th notes
    
    this.intervalId = setInterval(() => {
      const note = this.getNextNote();
      const freq = NOTES[note];
      if (freq) {
        if (synthType === 'triangle') {
          createTriangleSynth(this.ctx, freq, 0.1, volume);
        } else if (synthType === 'square') {
          createSquareSynth(this.ctx, freq, 0.1, volume);
        } else {
          createSineSynth(this.ctx, freq, 0.1, volume);
        }
      }
    }, interval);
  }
  
  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  setNotes(notes) {
    this.notes = notes;
  }
  
  setBPM(bpm) {
    this.bpm = bpm;
    if (this.isPlaying) {
      this.stop();
      this.start();
    }
  }
}

// ========== MUSIC SEQUENCER ==========

class MusicSequencer {
  constructor(ctx, bpm = 100) {
    this.ctx = ctx;
    this.bpm = bpm;
    this.isPlaying = false;
    this.currentBeat = 0;
    this.currentBar = 0;
    this.tracks = {
      melody: [],
      harmony: [],
      bass: [],
      drums: [],
    };
    this.loopLength = 16; // beats
    this.intervalId = null;
  }
  
  setBPM(bpm) {
    this.bpm = bpm;
  }
  
  setTrack(trackName, pattern) {
    this.tracks[trackName] = pattern;
  }
  
  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    const beatDuration = 60 / this.bpm; // seconds per beat
    
    this.intervalId = setInterval(() => {
      this.playBeat();
      this.currentBeat = (this.currentBeat + 1) % this.loopLength;
      if (this.currentBeat === 0) {
        this.currentBar++;
      }
    }, beatDuration * 1000);
  }
  
  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentBeat = 0;
    this.currentBar = 0;
  }
  
  playBeat() {
    // Play melody
    if (this.tracks.melody[this.currentBeat]) {
      const note = this.tracks.melody[this.currentBeat];
      if (note && note !== '-') {
        const freq = NOTES[note];
        if (freq) createTriangleSynth(this.ctx, freq, 0.3, 0.3);
      }
    }
    
    // Play harmony
    if (this.tracks.harmony[this.currentBeat]) {
      const chord = this.tracks.harmony[this.currentBeat];
      if (chord && Array.isArray(chord)) {
        chord.forEach(note => {
          const freq = NOTES[note];
          if (freq) createSineSynth(this.ctx, freq, 0.4, 0.15);
        });
      }
    }
    
    // Play bass
    if (this.tracks.bass[this.currentBeat]) {
      const note = this.tracks.bass[this.currentBeat];
      if (note && note !== '-') {
        const freq = NOTES[note];
        if (freq) createSawSynth(this.ctx, freq / 2, 0.3, 0.25);
      }
    }
    
    // Play drums
    if (this.tracks.drums[this.currentBeat]) {
      const drum = this.tracks.drums[this.currentBeat];
      if (drum === 'k') createKick(this.ctx);
      if (drum === 's') createSnare(this.ctx);
      if (drum === 'h') createHiHat(this.ctx);
      if (drum === 'H') createHiHat(this.ctx, 0, true);
    }
  }
}

// ========== PROCEDURAL MELODY GENERATOR ==========

class MelodyGenerator {
  constructor(scale = 'C_MAJOR_PENTA') {
    this.scale = SCALES[scale] || SCALES.C_MAJOR_PENTA;
    this.currentNote = 0;
    this.direction = 1;
  }
  
  setScale(scaleName) {
    this.scale = SCALES[scaleName] || SCALES.C_MAJOR_PENTA;
  }
  
  generateMelody(length = 8, pattern = 'BOUNCE') {
    const melodyPattern = MELODY_PATTERNS[pattern] || MELODY_PATTERNS.BOUNCE;
    const melody = [];
    
    for (let i = 0; i < length; i++) {
      const patternIndex = i % melodyPattern.length;
      const offset = melodyPattern[patternIndex];
      const noteIndex = Math.max(0, Math.min(this.scale.length - 1, this.currentNote + offset));
      melody.push(this.scale[noteIndex]);
    }
    
    return melody;
  }
  
  generateRandomMelody(length = 8) {
    const melody = [];
    let lastIndex = Math.floor(this.scale.length / 2);
    
    for (let i = 0; i < length; i++) {
      // Tend to move by steps or small jumps
      const jump = Math.floor(Math.random() * 5) - 2; // -2 to +2
      lastIndex = Math.max(0, Math.min(this.scale.length - 1, lastIndex + jump));
      melody.push(this.scale[lastIndex]);
    }
    
    return melody;
  }
  
  generateHookMelody(length = 8) {
    // Creates a catchy, memorable hook
    const melody = [];
    const hookPattern = [0, 0, 2, 4, 4, 2, 0, -2];
    const baseNote = Math.floor(this.scale.length / 2);
    
    for (let i = 0; i < length; i++) {
      const offset = hookPattern[i % hookPattern.length];
      const noteIndex = Math.max(0, Math.min(this.scale.length - 1, baseNote + offset));
      melody.push(this.scale[noteIndex]);
    }
    
    return melody;
  }
}

// ========== SONG DEFINITIONS ==========

const SONGS = {
  MENU_THEME: {
    name: 'Sunny Day Fishing',
    bpm: 110,
    scale: 'C_MAJOR_PENTA',
    chordProgression: 'MENU_CHILL',
    melody: ['C4', 'E4', 'G4', 'E4', 'C5', 'G4', 'E4', 'D4', 
             'F4', 'A4', 'C5', 'A4', 'G4', 'E4', 'D4', 'C4'],
    bass: ['C3', '-', 'G3', '-', 'F3', '-', 'G3', '-',
           'A3', '-', 'E3', '-', 'F3', '-', 'G3', '-'],
    drums: ['k', 'h', 's', 'h', 'k', 'h', 's', 'H',
            'k', 'h', 's', 'h', 'k', 'k', 's', 'h'],
  },
  
  FISHING_CALM: {
    name: 'Peaceful Waters',
    bpm: 95,
    scale: 'F_MAJOR_PENTA',
    chordProgression: 'HAPPY_MAIN',
    melody: ['F4', 'A4', 'C5', 'A4', 'G4', 'F4', 'E4', 'F4',
             'G4', 'A4', 'G4', 'F4', 'E4', 'D4', 'E4', 'F4'],
    bass: ['F3', '-', 'C3', '-', 'G3', '-', 'A3', '-',
           'F3', '-', 'C3', '-', 'G3', '-', 'C3', '-'],
    drums: ['k', '-', 'h', '-', 's', '-', 'h', '-',
            'k', '-', 'h', '-', 's', '-', '-', 'h'],
  },
  
  FISHING_UPBEAT: {
    name: 'Big Catch Energy',
    bpm: 130,
    scale: 'G_MAJOR_PENTA',
    chordProgression: 'UPBEAT_FISHING',
    melody: ['G4', 'A4', 'B4', 'D5', 'B4', 'A4', 'G4', 'A4',
             'G4', 'B4', 'D5', 'G5', 'D5', 'B4', 'A4', 'G4'],
    bass: ['G3', 'G3', 'D3', 'D3', 'C3', 'C3', 'D3', 'D3',
           'G3', 'G3', 'E3', 'E3', 'C3', 'C3', 'D3', 'G3'],
    drums: ['k', 'h', 's', 'h', 'k', 'h', 's', 'h',
            'k', 'h', 's', 'h', 'k', 'k', 's', 's'],
  },
  
  VICTORY: {
    name: 'Trophy Catch!',
    bpm: 140,
    scale: 'C_MAJOR_PENTA',
    chordProgression: 'VICTORY',
    melody: ['C5', 'E5', 'G5', 'C6', 'G5', 'E5', 'G5', 'C6',
             'D5', 'G5', 'B5', 'D6', 'B5', 'G5', 'A5', 'G5'],
    bass: ['C3', 'C3', 'E3', 'E3', 'G3', 'G3', 'C4', 'C4',
           'D3', 'D3', 'G3', 'G3', 'B3', 'B3', 'C4', 'C4'],
    drums: ['k', 's', 'k', 's', 'k', 's', 'k', 's',
            'k', 'k', 's', 's', 'k', 'k', 's', 's'],
  },
  
  NIGHT_FISHING: {
    name: 'Moonlit Waters',
    bpm: 85,
    scale: 'A_MAJOR_PENTA',
    chordProgression: 'NIGHT_CALM',
    melody: ['A4', 'C5', 'E5', 'C5', 'A4', 'G4', 'A4', 'B4',
             'C5', 'A4', 'G4', 'E4', 'F4', 'E4', 'D4', 'C4'],
    bass: ['A2', '-', '-', '-', 'F2', '-', '-', '-',
           'G2', '-', '-', '-', 'E2', '-', '-', '-'],
    drums: ['k', '-', '-', 'h', 's', '-', '-', 'h',
            'k', '-', '-', 'h', 's', '-', 'h', '-'],
  },
  
  STORM_FISHING: {
    name: 'Storm Chaser',
    bpm: 150,
    scale: 'D_MAJOR_PENTA',
    chordProgression: 'STORM_INTENSE',
    melody: ['D5', 'E5', 'F5', 'A5', 'F5', 'E5', 'D5', 'E5',
             'D5', 'F5', 'A5', 'D6', 'A5', 'F5', 'E5', 'D5'],
    bass: ['D3', 'D3', 'D3', 'D3', 'A2', 'A2', 'A2', 'A2',
           'G2', 'G2', 'G2', 'G2', 'A2', 'A2', 'D3', 'D3'],
    drums: ['k', 'k', 's', 'h', 'k', 'k', 's', 'h',
            'k', 'k', 's', 'h', 'k', 'k', 's', 's'],
  },
  
  BREEDING_LAB: {
    name: 'Lab Discovery',
    bpm: 105,
    scale: 'C_MAJOR_PENTA',
    chordProgression: 'HAPPY_MAIN',
    melody: ['C4', 'E4', 'G4', 'C5', 'D5', 'C5', 'G4', 'E4',
             'F4', 'A4', 'C5', 'F5', 'E5', 'D5', 'C5', 'G4'],
    bass: ['C3', '-', 'G2', '-', 'F2', '-', 'G2', '-',
           'A2', '-', 'E2', '-', 'F2', '-', 'G2', '-'],
    drums: ['k', 'h', 's', 'h', 'k', 'h', 's', 'h',
            'k', 'h', 's', 'h', 'k', 'h', 's', 'H'],
  },
  
  AQUARIUM: {
    name: 'Aquarium Dreams',
    bpm: 80,
    scale: 'F_MAJOR_PENTA',
    chordProgression: 'MENU_CHILL',
    melody: ['F4', '-', 'A4', '-', 'C5', '-', 'A4', '-',
             'G4', '-', 'F4', '-', 'E4', '-', 'F4', '-'],
    bass: ['F2', '-', '-', '-', 'C2', '-', '-', '-',
           'G2', '-', '-', '-', 'A2', '-', '-', '-'],
    drums: ['-', '-', 'h', '-', '-', '-', 'h', '-',
            '-', '-', 'h', '-', '-', '-', 'h', '-'],
  },
  
  MINIGAME: {
    name: 'Game Time!',
    bpm: 135,
    scale: 'G_MAJOR_PENTA',
    chordProgression: 'UPBEAT_FISHING',
    melody: ['G4', 'A4', 'B4', 'G4', 'D5', 'B4', 'A4', 'G4',
             'A4', 'B4', 'D5', 'E5', 'D5', 'B4', 'A4', 'G4'],
    bass: ['G3', 'G3', 'D3', 'D3', 'C3', 'C3', 'D3', 'D3',
           'G3', 'G3', 'E3', 'E3', 'C3', 'D3', 'G3', 'G3'],
    drums: ['k', 'h', 's', 'h', 'k', 'h', 's', 'h',
            'k', 'h', 's', 'h', 'k', 'k', 's', 'H'],
  },
  
  SHOP: {
    name: 'Shopping Spree',
    bpm: 115,
    scale: 'C_MAJOR_PENTA',
    chordProgression: 'HAPPY_MAIN',
    melody: ['C5', 'D5', 'E5', 'G5', 'E5', 'D5', 'C5', 'D5',
             'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'C5'],
    bass: ['C3', '-', 'E3', '-', 'G3', '-', 'E3', '-',
           'F3', '-', 'A3', '-', 'G3', '-', 'C3', '-'],
    drums: ['k', 'h', 's', 'h', 'k', 'h', 's', 'h',
            'k', 'h', 's', 'h', 'k', 'h', 's', 'h'],
  },
};

// ========== MAIN MUSIC CONTROLLER ==========

class MusicController {
  constructor() {
    this.ctx = null;
    this.sequencer = null;
    this.arpeggiator = null;
    this.melodyGen = null;
    this.currentSong = null;
    this.isInitialized = false;
    this.volume = 0.5;
    this.isMuted = false;
  }
  
  async init() {
    if (this.isInitialized) return;
    
    this.ctx = await resumeAudio();
    this.sequencer = new MusicSequencer(this.ctx);
    this.arpeggiator = new Arpeggiator(this.ctx, SCALES.C_MAJOR_PENTA);
    this.melodyGen = new MelodyGenerator();
    this.isInitialized = true;
  }
  
  async playSong(songKey) {
    await this.init();
    
    const song = SONGS[songKey];
    if (!song) return;
    
    this.stop();
    this.currentSong = songKey;
    
    this.sequencer.setBPM(song.bpm);
    this.sequencer.setTrack('melody', song.melody);
    this.sequencer.setTrack('bass', song.bass);
    this.sequencer.setTrack('drums', song.drums);
    
    // Set up harmony from chord progression
    const chords = CHORD_PROGRESSIONS[song.chordProgression];
    if (chords) {
      const harmonyTrack = [];
      for (let i = 0; i < 16; i++) {
        harmonyTrack.push(i % 4 === 0 ? chords[Math.floor(i / 4) % chords.length] : null);
      }
      this.sequencer.setTrack('harmony', harmonyTrack);
    }
    
    this.sequencer.start();
  }
  
  stop() {
    if (this.sequencer) {
      this.sequencer.stop();
    }
    if (this.arpeggiator) {
      this.arpeggiator.stop();
    }
    this.currentSong = null;
  }
  
  pause() {
    if (this.sequencer) {
      this.sequencer.stop();
    }
  }
  
  resume() {
    if (this.currentSong) {
      this.playSong(this.currentSong);
    }
  }
  
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (musicGain) {
      musicGain.gain.value = this.isMuted ? 0 : this.volume;
    }
  }
  
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (musicGain) {
      musicGain.gain.value = this.isMuted ? 0 : this.volume;
    }
    return this.isMuted;
  }
  
  // Play one-shot sound effects
  async playSFX(type) {
    await this.init();
    
    switch (type) {
      case 'catch':
        // Triumphant arpeggio
        ['C5', 'E5', 'G5', 'C6'].forEach((note, i) => {
          setTimeout(() => {
            createTriangleSynth(this.ctx, NOTES[note], 0.2, 0.4);
          }, i * 80);
        });
        break;
        
      case 'perfect':
        // Sparkly perfect catch
        ['C5', 'E5', 'G5', 'C6', 'E6'].forEach((note, i) => {
          setTimeout(() => {
            createSineSynth(this.ctx, NOTES[note], 0.3, 0.3);
            createSineSynth(this.ctx, NOTES[note] * 2, 0.2, 0.15);
          }, i * 60);
        });
        break;
        
      case 'cast':
        // Whoosh sound
        createNoise(this.ctx, 0.15, 0.2);
        createSineSynth(this.ctx, 400, 0.1, 0.2);
        setTimeout(() => createSineSynth(this.ctx, 200, 0.1, 0.15), 50);
        break;
        
      case 'bite':
        // Alert sound
        createSquareSynth(this.ctx, NOTES.A4, 0.1, 0.3);
        setTimeout(() => createSquareSynth(this.ctx, NOTES.C5, 0.1, 0.3), 100);
        break;
        
      case 'reel':
        // Quick clicking
        createNoise(this.ctx, 0.02, 0.1);
        break;
        
      case 'splash':
        // Water splash
        createNoise(this.ctx, 0.2, 0.15, 'pink');
        break;
        
      case 'levelup':
        // Level up fanfare
        ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6'].forEach((note, i) => {
          setTimeout(() => {
            createTriangleSynth(this.ctx, NOTES[note], 0.15, 0.4);
          }, i * 70);
        });
        break;
        
      case 'coin':
        // Coin collect
        createSineSynth(this.ctx, NOTES.E5, 0.08, 0.25);
        setTimeout(() => createSineSynth(this.ctx, NOTES.B5, 0.12, 0.25), 80);
        break;
        
      case 'menu_select':
        createSquareSynth(this.ctx, NOTES.C4, 0.05, 0.2);
        break;
        
      case 'menu_hover':
        createSineSynth(this.ctx, NOTES.G4, 0.03, 0.1);
        break;
        
      case 'error':
        createSquareSynth(this.ctx, NOTES.E3, 0.15, 0.3);
        setTimeout(() => createSquareSynth(this.ctx, NOTES.C3, 0.2, 0.3), 150);
        break;
        
      case 'achievement':
        // Achievement unlock fanfare
        const achievementNotes = ['G4', 'C5', 'E5', 'G5', 'C6'];
        achievementNotes.forEach((note, i) => {
          setTimeout(() => {
            createTriangleSynth(this.ctx, NOTES[note], 0.25, 0.35);
            createSineSynth(this.ctx, NOTES[note] * 1.5, 0.15, 0.2);
          }, i * 100);
        });
        break;
        
      case 'rare_catch':
        // Rare fish discovery
        const rareNotes = ['E4', 'G4', 'B4', 'E5', 'G5', 'B5', 'E6'];
        rareNotes.forEach((note, i) => {
          setTimeout(() => {
            createPulseSynth(this.ctx, NOTES[note], 0.2, 0.25, 0.35);
          }, i * 80);
        });
        break;
        
      case 'breeding_complete':
        // Breeding success
        ['C4', 'E4', 'G4', 'B4', 'C5'].forEach((note, i) => {
          setTimeout(() => {
            createTriangleSynth(this.ctx, NOTES[note], 0.3, 0.3);
          }, i * 120);
        });
        break;
    }
  }
  
  // Get current song info
  getCurrentSongInfo() {
    if (!this.currentSong) return null;
    return SONGS[this.currentSong];
  }
}

// Singleton instance
const musicController = new MusicController();

// Export everything
export {
  musicController,
  MusicController,
  MusicSequencer,
  MelodyGenerator,
  Arpeggiator,
  SONGS,
  NOTES,
  SCALES,
  CHORD_PROGRESSIONS,
  MELODY_PATTERNS,
  initAudioContext,
  resumeAudio,
  createSquareSynth,
  createTriangleSynth,
  createSineSynth,
  createSawSynth,
  createPulseSynth,
  createNoise,
  createKick,
  createSnare,
  createHiHat,
};

export default musicController;
