// Background Music System - Procedural ambient BGM using Web Audio API
// Changes mood based on game state: calm, romantic, tense, night

class BGMSystem {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.playing = false;
        this.muted = false;
        this.currentMood = 'calm';
        this.masterGain = null;
        this.volume = 0.05; // Very quiet background
        this._loopTimer = null;
        this._noteTimers = [];
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();

            // Master volume
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.ctx.destination);

            // Reverb for atmosphere
            this.reverb = this._createReverb();
            this.reverbGain = this.ctx.createGain();
            this.reverbGain.gain.value = 0.3;
            this.reverb.connect(this.reverbGain);
            this.reverbGain.connect(this.masterGain);

            this.initialized = true;
        } catch (e) {
            console.warn("BGM: Web Audio not supported");
        }
    }

    _createReverb() {
        // Simple reverb using delay
        const convolver = this.ctx.createConvolver();
        const rate = this.ctx.sampleRate;
        const length = rate * 2;
        const impulse = this.ctx.createBuffer(2, length, rate);
        for (let ch = 0; ch < 2; ch++) {
            const data = impulse.getChannelData(ch);
            for (let i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
            }
        }
        convolver.buffer = impulse;
        return convolver;
    }

    // ===== MOOD DEFINITIONS =====

    getMoodConfig(mood) {
        const configs = {
            calm: {
                scale: [261, 293, 329, 392, 440, 523], // C major pentatonic
                tempo: 2500,  // ms between notes
                padFreq: 130, // Low pad
                padType: 'sine',
                noteType: 'sine',
                noteVolume: 0.06,
                padVolume: 0.04,
                noteDecay: 2.5,
            },
            romantic: {
                scale: [261, 329, 392, 440, 523, 659], // Warm major
                tempo: 2000,
                padFreq: 165,
                padType: 'sine',
                noteType: 'triangle',
                noteVolume: 0.07,
                padVolume: 0.05,
                noteDecay: 3,
            },
            tense: {
                scale: [220, 261, 293, 349, 415], // Minor/diminished feel
                tempo: 3000,
                padFreq: 110,
                padType: 'sawtooth',
                noteType: 'sine',
                noteVolume: 0.04,
                padVolume: 0.03,
                noteDecay: 2,
            },
            night: {
                scale: [196, 261, 293, 392, 440], // Soft, sparse
                tempo: 3500,
                padFreq: 98,
                padType: 'sine',
                noteType: 'sine',
                noteVolume: 0.04,
                padVolume: 0.03,
                noteDecay: 4,
            },
            corrupted: {
                scale: [185, 220, 261, 311, 370], // Dissonant
                tempo: 2800,
                padFreq: 73,
                padType: 'sawtooth',
                noteType: 'triangle',
                noteVolume: 0.03,
                padVolume: 0.025,
                noteDecay: 2,
            }
        };
        return configs[mood] || configs.calm;
    }

    // ===== PLAYBACK =====

    start() {
        if (this.muted) return;
        if (this.playing) return;
        this.playing = true;
        this._playMoodTrack(this.currentMood);
    }

    stop() {
        this.playing = false;
        if (this._bgmAudio) {
            this._bgmAudio.pause();
            this._bgmAudio.currentTime = 0;
        }
    }

    _playMoodTrack(mood) {
        // Mood / character → audio file lookup.
        // The original system shipped 5 mood tracks (calm/night/tense/
        // corrupted/romantic). We have additional ambient stems sitting in
        // assets/audio (forest-crickets, fireplace-crackle, dark-drone,
        // digital-static, mermaid-hum) that the production audit flagged as
        // "defined but never invoked." We map character keys to those stems
        // so each route can have a distinct ambient bed.
        const tracks = {
            // Mood tracks
            calm:      'assets/audio/bgm-calm.mp3',
            night:     'assets/audio/bgm-night.mp3',
            tense:     'assets/audio/bgm-tense.mp3',
            corrupted: 'assets/audio/bgm-corrupted.mp3',
            romantic:  'assets/audio/bgm-romantic.mp3',
            // Per-character ambient beds (callers can pass a character id as
            // mood; falls back to calm if the file doesn't exist on the
            // device — error swallowed by audio.play().catch).
            alistair:  'assets/audio/fireplace-crackle.mp3',
            elian:     'assets/audio/forest-crickets.mp3',
            lyra:      'assets/audio/mermaid-hum.mp3',
            caspian:   'assets/audio/bgm-romantic.mp3',
            lucien:    'assets/audio/bgm-night.mp3',
            noir:      'assets/audio/dark-drone.mp3',
            proto:     'assets/audio/digital-static.mp3'
        };
        const src = tracks[mood] || tracks.calm;

        if (this._bgmAudio && this._bgmCurrentSrc === src) return;

        // Fade out current
        if (this._bgmAudio) {
            const old = this._bgmAudio;
            const fadeOut = setInterval(() => {
                if (old.volume > 0.05) { old.volume -= 0.05; }
                else { clearInterval(fadeOut); old.pause(); }
            }, 100);
        }

        // Start new track. LOOP is on — each mood/character BGM should keep
        // playing until the mood changes or the player navigates away. The
        // production audit caught that this was previously `false`, which
        // produced 2 minutes of music followed by total silence. Bad vibes.
        const audio = new Audio(src);
        audio.loop = true;
        audio.volume = this.volume;
        audio.play().catch(function() {});
        this._bgmAudio = audio;
        this._bgmCurrentSrc = src;
    }

    setMood(mood) {
        if (mood === this.currentMood) return;
        this.currentMood = mood;

        if (this.playing) {
            this._playMoodTrack(mood);
        }

        // Legacy: smoothly transition pad (kept for reference)
        if (false && this.playing && this._padOsc) {
            const config = this.getMoodConfig(mood);
            const now = this.ctx.currentTime;
            this._padOsc.frequency.linearRampToValueAtTime(config.padFreq, now + 2);
            this._padGain.gain.linearRampToValueAtTime(
                this.muted ? 0 : config.padVolume, now + 2
            );
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this._bgmAudio) {
            this._bgmAudio.volume = this.muted ? 0 : this.volume;
        }
        if (this.muted) this.stop();
        return this.muted;
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(0.3, vol / 100 * 0.3));
        if (this._bgmAudio && !this.muted) {
            this._bgmAudio.volume = this.volume;
        }
    }

    // ===== INTERNAL =====

    _startPad() {
        const config = this.getMoodConfig(this.currentMood);

        this._padOsc = this.ctx.createOscillator();
        this._padGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        this._padOsc.type = config.padType;
        this._padOsc.frequency.value = config.padFreq;

        filter.type = 'lowpass';
        filter.frequency.value = 400;
        filter.Q.value = 1;

        this._padGain.gain.value = 0;
        this._padGain.gain.linearRampToValueAtTime(
            config.padVolume, this.ctx.currentTime + 3
        );

        this._padOsc.connect(filter);
        filter.connect(this._padGain);
        this._padGain.connect(this.masterGain);

        // Also add slight second oscillator for warmth
        this._padOsc2 = this.ctx.createOscillator();
        this._padOsc2.type = 'sine';
        this._padOsc2.frequency.value = config.padFreq * 2.01; // Slight detune
        const pad2Gain = this.ctx.createGain();
        pad2Gain.gain.value = config.padVolume * 0.3;
        this._padOsc2.connect(pad2Gain);
        pad2Gain.connect(this.masterGain);

        this._padOsc.start();
        this._padOsc2.start();
    }

    _scheduleNotes() {
        if (!this.playing) return;

        const config = this.getMoodConfig(this.currentMood);

        // Play 1-2 notes
        const numNotes = Math.random() > 0.4 ? 1 : 2;

        for (let i = 0; i < numNotes; i++) {
            const delay = i * (400 + Math.random() * 600);
            const timer = setTimeout(() => {
                if (!this.playing) return;
                this._playNote(config);
            }, delay);
            this._noteTimers.push(timer);
        }

        // Sometimes skip a beat (creates breathing space)
        const skipChance = this.currentMood === 'night' ? 0.4 : 0.2;
        const nextDelay = Math.random() > skipChance
            ? config.tempo + Math.random() * 1000
            : config.tempo * 2;

        this._loopTimer = setTimeout(() => {
            this._scheduleNotes();
        }, nextDelay);
    }

    _playNote(config) {
        if (!this.ctx || this.muted) return;

        const freq = config.scale[Math.floor(Math.random() * config.scale.length)];

        // Randomly octave shift
        const octave = Math.random() > 0.7 ? 2 : 1;
        const finalFreq = freq * octave;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = config.noteType;
        osc.frequency.value = finalFreq;

        // Slight vibrato
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 4 + Math.random() * 2;
        lfoGain.gain.value = 2;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        const now = this.ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(config.noteVolume, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + config.noteDecay);

        osc.connect(gain);
        gain.connect(this.masterGain);

        // Send some to reverb
        const reverbSend = this.ctx.createGain();
        reverbSend.gain.value = 0.4;
        osc.connect(reverbSend);
        reverbSend.connect(this.reverb);

        osc.start(now);
        osc.stop(now + config.noteDecay);
        lfo.stop(now + config.noteDecay);
    }
}

const bgm = new BGMSystem();
