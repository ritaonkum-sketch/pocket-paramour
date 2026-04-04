// Sound effects system - generates sounds with Web Audio API (no files needed)

class SoundSystem {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn("Web Audio not supported");
            this.enabled = false;
        }
    }

    // Ensure audio context is ready (must be called from user gesture)
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // ===== SOUND EFFECTS =====

    // Soft "pop" for button clicks
    pop() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.15);
    }

    // Gentle chime for gifts/love moments
    chime() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        const notes = [523, 659, 784]; // C5, E5, G5
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.12);
            gain.gain.setValueAtTime(0.12, this.ctx.currentTime + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.12 + 0.4);
            osc.start(this.ctx.currentTime + i * 0.12);
            osc.stop(this.ctx.currentTime + i * 0.12 + 0.4);
        });
    }

    // Dialogue blip (typewriter sound)
    blip() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(280 + Math.random() * 60, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.05);
    }

    // Sad/warning sound
    sad() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.5);
    }

    // Level up / milestone fanfare
    fanfare() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.15);
            gain.gain.setValueAtTime(0.15, this.ctx.currentTime + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.15 + 0.6);
            osc.start(this.ctx.currentTime + i * 0.15);
            osc.stop(this.ctx.currentTime + i * 0.15 + 0.6);
        });
    }

    // Heartbeat (for emotional moments)
    heartbeat() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        [0, 0.15].forEach(delay => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.frequency.setValueAtTime(60, this.ctx.currentTime + delay);
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + 0.2);
            osc.start(this.ctx.currentTime + delay);
            osc.stop(this.ctx.currentTime + delay + 0.2);
        });
    }

    // Soft ambient hum
    ambientNote() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        const notes = [261, 329, 392, 440, 523];
        osc.frequency.setValueAtTime(notes[Math.floor(Math.random() * notes.length)], this.ctx.currentTime);
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.03, this.ctx.currentTime + 0.5);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 2);
    }

    // Corruption dark sound
    dark() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.8);
    }

    // Low thud — weight impact / physical exertion hit
    thud() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        const osc  = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(110, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(38, this.ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.22);
    }

    // Slow exhale — end of exertion / meditation breath
    breathe() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        const osc  = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(240, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(190, this.ctx.currentTime + 0.9);
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.07, this.ctx.currentTime + 0.25);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.9);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.9);
    }

    // Soft focus tone — rising hum for meditation
    focusTone() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        [0, 0.3, 0.6].forEach((delay, i) => {
            const osc  = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.frequency.setValueAtTime(220 + i * 55, this.ctx.currentTime + delay);
            gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
            gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + delay + 0.2);
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + delay + 0.7);
            osc.start(this.ctx.currentTime + delay);
            osc.stop(this.ctx.currentTime + delay + 0.7);
        });
    }

    // Lyra's siren song — ascending harmonic melody
    sirenSong() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        const notes = [330, 415, 494, 587, 698]; // E4, Ab4, B4, D5, F5
        notes.forEach((freq, i) => {
            const osc  = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.17);
            gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.17);
            gain.gain.linearRampToValueAtTime(0.09, this.ctx.currentTime + i * 0.17 + 0.1);
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + i * 0.17 + 0.55);
            osc.start(this.ctx.currentTime + i * 0.17);
            osc.stop(this.ctx.currentTime  + i * 0.17 + 0.55);
        });
    }

    // Siren magic charge — deep resonance that builds then shimmers
    magicCharge() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        // Deep drone building up
        const drone = this.ctx.createOscillator();
        const dGain = this.ctx.createGain();
        drone.type = 'sawtooth';
        drone.connect(dGain);
        dGain.connect(this.ctx.destination);
        drone.frequency.setValueAtTime(70, this.ctx.currentTime);
        drone.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.7);
        dGain.gain.setValueAtTime(0, this.ctx.currentTime);
        dGain.gain.linearRampToValueAtTime(0.07, this.ctx.currentTime + 0.35);
        dGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);
        drone.start(this.ctx.currentTime);
        drone.stop(this.ctx.currentTime + 0.8);
        // Shimmering overtones
        [440, 554, 659].forEach((freq, i) => {
            const osc  = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + 0.2 + i * 0.1);
            gain.gain.setValueAtTime(0, this.ctx.currentTime + 0.2 + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.045, this.ctx.currentTime + 0.32 + i * 0.1);
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime  + 0.85 + i * 0.1);
            osc.start(this.ctx.currentTime + 0.2 + i * 0.1);
            osc.stop(this.ctx.currentTime  + 0.9 + i * 0.1);
        });
    }

    // Water splash — short burst of filtered noise, light and watery
    splash() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        const duration   = 0.55;
        const bufferSize = Math.floor(this.ctx.sampleRate * duration);
        const buffer     = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data       = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            // Shape: sharp attack, long airy tail
            const env = Math.exp(-i / (bufferSize * 0.28));
            data[i] = (Math.random() * 2 - 1) * env;
        }
        const source  = this.ctx.createBufferSource();
        const gain    = this.ctx.createGain();
        const lowpass = this.ctx.createBiquadFilter();
        const highpass = this.ctx.createBiquadFilter();
        lowpass.type            = 'lowpass';
        lowpass.frequency.value = 3200;
        highpass.type            = 'highpass';
        highpass.frequency.value = 400;
        source.buffer = buffer;
        source.connect(highpass);
        highpass.connect(lowpass);
        lowpass.connect(gain);
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        source.start(this.ctx.currentTime);
        // Tiny secondary drip overtone
        const drip  = this.ctx.createOscillator();
        const dGain = this.ctx.createGain();
        drip.type = 'sine';
        drip.connect(dGain);
        dGain.connect(this.ctx.destination);
        drip.frequency.setValueAtTime(1200, this.ctx.currentTime + 0.05);
        drip.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.3);
        dGain.gain.setValueAtTime(0.06, this.ctx.currentTime + 0.05);
        dGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
        drip.start(this.ctx.currentTime + 0.05);
        drip.stop(this.ctx.currentTime + 0.35);
    }

    // Soft munching / eating sound — short crunchy bites
    munch() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        // Three quick crunch hits with slight pitch variation
        const bites = [0, 0.18, 0.36];
        bites.forEach((delay, idx) => {
            const bufferSize = Math.floor(this.ctx.sampleRate * 0.07);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data   = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2.5);
            }
            const source = this.ctx.createBufferSource();
            const gain   = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();
            filter.type            = 'bandpass';
            filter.frequency.value = 900 + idx * 180;
            filter.Q.value         = 1.2;
            source.buffer = buffer;
            source.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            gain.gain.setValueAtTime(0.18, this.ctx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + 0.07);
            source.start(this.ctx.currentTime + delay);
        });
    }

    // Sword whoosh — air displacement on each swing
    swoosh() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        const bufferSize = this.ctx.sampleRate * 0.13;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data   = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }
        const source = this.ctx.createBufferSource();
        const gain   = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        filter.type            = 'bandpass';
        filter.frequency.value = 1400;
        filter.Q.value         = 0.7;
        source.buffer = buffer;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.13);
        source.start(this.ctx.currentTime);
    }

    // ===== LYRA AMBIENT SOUNDS =====

    // Ocean wave — slow filtered noise swell (Feature 11)
    oceanWave() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        const duration   = 2.2;
        const bufferSize = Math.floor(this.ctx.sampleRate * duration);
        const buffer     = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data       = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const progress = i / bufferSize;
            // Swell: soft attack, long gentle release
            const env = progress < 0.25
                ? progress / 0.25
                : Math.pow(1 - (progress - 0.25) / 0.75, 1.8);
            data[i] = (Math.random() * 2 - 1) * env * 0.35;
        }
        const source   = this.ctx.createBufferSource();
        const lowpass  = this.ctx.createBiquadFilter();
        const highpass = this.ctx.createBiquadFilter();
        const gain     = this.ctx.createGain();
        lowpass.type             = 'lowpass';
        lowpass.frequency.value  = 700;
        highpass.type            = 'highpass';
        highpass.frequency.value = 60;
        source.buffer = buffer;
        source.connect(highpass);
        highpass.connect(lowpass);
        lowpass.connect(gain);
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        source.start(this.ctx.currentTime);
    }

    // Siren hum — soft floating harmonic overtones (Feature 11)
    sirenHum() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        const base = 220; // A3
        [1, 1.5, 2.0, 2.5].forEach((mult, i) => {
            const osc  = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.frequency.setValueAtTime(base * mult, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(base * mult * 1.006, this.ctx.currentTime + 2.0);
            const vol = 0.022 / (i + 1);
            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.5);
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2.8);
            osc.start(this.ctx.currentTime);
            osc.stop(this.ctx.currentTime + 2.8);
        });
    }

    // Train/sword clash
    clash() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
        }
        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        source.buffer = buffer;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
        source.start(this.ctx.currentTime);
    }
    // ===== CARD REVEAL SFX =====

    // Paper whoosh for card flip
    cardFlip() {
        if (!this.enabled) return;
        this.init(); this.resume();
        const bufferSize = this.ctx.sampleRate * 0.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(2400, this.ctx.currentTime + 0.15);
        filter.Q.value = 1.5;
        source.buffer = buffer;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
        source.start(this.ctx.currentTime);
    }

    // Rarity-scaled chime — pitch rises with rarity
    rarityChime(tier) {
        if (!this.enabled) return;
        this.init(); this.resume();
        const tiers = { common: [523], uncommon: [523, 659], rare: [523, 659, 784], legendary: [523, 659, 784, 1047], premium: [523, 659, 784, 1047, 1319] };
        const notes = tiers[tier] || tiers.common;
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            const t = this.ctx.currentTime + i * 0.12;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.12, t + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            osc.start(t);
            osc.stop(t + 0.4);
        });
    }

    // Grand fanfare for legendary/premium reveals
    legendaryFanfare() {
        if (!this.enabled) return;
        this.init(); this.resume();
        const chord = [523, 659, 784, 1047];
        chord.forEach((freq) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            const t = this.ctx.currentTime;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.08, t + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
            osc.start(t);
            osc.stop(t + 1.2);
        });
        // Add sub bass hit
        const bass = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bass.type = 'sine';
        bass.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bass.frequency.setValueAtTime(130, this.ctx.currentTime);
        bassGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        bassGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
        bass.start(this.ctx.currentTime);
        bass.stop(this.ctx.currentTime + 0.8);
    }
}

// Singleton instance
const sounds = new SoundSystem();
