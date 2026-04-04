// ===================================================
//  Pocket Paramour — Intro Scene System
//  Plays once per character on first launch.
// ===================================================

const INTRO_SCENES = {
    alistair: {
        bgClass: 'intro-bg-knight',
        beats: [
            {
                body: 'assets/alistair/body/neutral.png',
                direction: 'He reaches for his sword before catching himself. His hand drops slowly.',
                line: "...Who's there? How did you get past the gate?"
            },
            {
                body: 'assets/alistair/body/armor3.png',
                direction: 'He studies you for a long moment. The tension in his shoulders eases — barely.',
                line: "You're not a threat. I can see that. I just... don't get visitors. Not real ones."
            },
            {
                body: 'assets/alistair/body/gentle.png',
                direction: "He sets the sword down on the table. The first deliberate thing he's done since you walked in.",
                line: "I'm Alistair. If you're staying... I should probably know your name."
            },
            {
                body: 'assets/alistair/body/happy.png',
                direction: 'Something shifts in his expression. Not quite a smile — but close to one.',
                line: "Take care of me... and maybe I'll learn how to let someone."
            },
            {
                body: 'assets/alistair/body/gentle.png',
                direction: 'He looks away. The admission costs him something.',
                line: "But don't vanish. I don't like what happens to me when people leave."
            }
        ]
    },
    lyra: {
        bgClass: 'intro-bg-siren',
        beats: [
            {
                body: 'assets/lyra/body/neutral1.png',
                direction: 'The cave is silent except for water. Then — two luminous eyes surface from the dark.',
                line: "...You came this far from shore. Most don't.",
                eyeGlow: true
            },
            {
                body: 'assets/lyra/body/pose3.png',
                direction: 'She rises slowly from the water, watching you with centuries of patience.',
                line: "You're not afraid. That's either very brave... or very foolish."
            },
            {
                body: 'assets/lyra/body/neutral.png',
                direction: 'Her voice carries a resonance that travels through the stone and settles in your chest.',
                line: "Sirens don't make companions. We make echoes. And echoes... can't leave.",
                eyeGlow: true
            },
            {
                body: 'assets/lyra/body/sad3.png',
                direction: 'Something shifts behind her eyes. A memory. Something she almost says — then decides against.',
                line: "I had someone once who sat exactly where you are. They stopped coming back."
            },
            {
                body: 'assets/lyra/body/pose4.png',
                direction: 'She drifts to the edge. Her hand rests near yours — close, but not touching.',
                line: "Take care of me... and I'll try not to be what they say I am."
            },
            {
                body: 'assets/lyra/body/singing.png',
                direction: 'A soft hum escapes her. Not a warning. Something warmer — almost accidental.',
                line: "I sing better when someone's listening. I didn't realise how much I missed it."
            },
            {
                body: 'assets/lyra/body/neutral.png',
                direction: 'She meets your eyes. The tide pulls in. Pulls out. She does not look away.',
                line: "But don't vanish on me. I stop being gentle when people vanish."
            }
        ]
    },
    lucien: {
        bgClass: 'intro-bg-mage',
        beats: [
            {
                body: 'assets/lucien/body/reading.png',
                direction: 'A tower. Candlelight. The scratch of a quill on parchment. He doesn\'t look up.',
                line: "The door was warded. You shouldn't have been able to open it."
            },
            {
                body: 'assets/lucien/body/neutral.png',
                direction: 'He pauses. The quill stops mid-stroke. For the first time, he looks at you directly.',
                line: "...Interesting. The wards didn't reject you. They recognized you. That's never happened."
            },
            {
                body: 'assets/lucien/body/thinking.png',
                direction: 'He adjusts his spectacles. His eyes — purple, calculating — trace your outline like reading a formula.',
                line: "I'm Lucien. Grand Mage of the Seventh Tower. I study the patterns beneath reality."
            },
            {
                body: 'assets/lucien/body/curious.png',
                direction: 'He sets down the quill. A deliberate action. He doesn\'t do anything without deliberation.',
                line: "You're not what I expected. My models predicted... something else entirely."
            },
            {
                body: 'assets/lucien/body/neutral.png',
                direction: 'The candles flicker. A crystal on the shelf pulses once — faintly — as if responding to something unseen.',
                line: "I don't take apprentices. I don't take visitors. I don't take... whatever this is."
            },
            {
                body: 'assets/lucien/body/vulnerable.png',
                direction: 'A pause. Longer than he intended. Something shifts behind the calculation in his eyes.',
                line: "But the equations changed the moment you walked in. And I need to understand why."
            },
            {
                body: 'assets/lucien/body/neutral.png',
                direction: 'He opens a fresh page in his journal. Writes a single line. Your name — before you\'ve given it.',
                line: "Tell me what to call you. I've already started a file."
            }
        ]
    }
};

class IntroScene {
    constructor() {
        this.overlay    = document.getElementById('intro-overlay');
        this.bgEl       = document.getElementById('intro-bg');
        this.charImg    = document.getElementById('intro-character-img');
        this.dirEl      = document.getElementById('intro-stage-direction');
        this.lineEl     = document.getElementById('intro-line');
        this.hintEl     = document.getElementById('intro-tap-hint');
        this.dotsEl     = document.getElementById('intro-dots');
        this.skipBtn        = document.getElementById('intro-skip-btn');
        this.blinkOverlay   = document.getElementById('intro-blink-overlay');

        this.characterId = null;
        this.beats       = [];
        this.current     = 0;
        this.typing      = false;
        this.finishing   = false;
        this.onComplete  = null;
        this._typeTimer  = null;

        this._boundAdvance = this._advance.bind(this);
        this._boundKey     = this._onKey.bind(this);
        this._boundSkip    = (e) => { e.stopPropagation(); this._finish(); };
    }

    // ── Public: should the intro play? ──────────────────────────
    static shouldPlay(characterId) {
        return !localStorage.getItem('pp_intro_' + characterId);
    }

    static markSeen(characterId) {
        localStorage.setItem('pp_intro_' + characterId, '1');
    }

    // ── Public: start the intro ──────────────────────────────────
    start(characterId, onComplete) {
        const scene = INTRO_SCENES[characterId];
        if (!scene) {
            onComplete && onComplete();
            return;
        }

        this.characterId = characterId;
        this.beats       = scene.beats;
        this.onComplete  = onComplete;
        this.current     = 0;
        this.finishing   = false;

        // Set background
        this.bgEl.className = scene.bgClass;

        // Build progress dots
        this.dotsEl.innerHTML = this.beats
            .map((_, i) => `<span class="intro-dot" id="intro-dot-${i}"></span>`)
            .join('');

        // Reset state
        this.lineEl.textContent = '';
        this.dirEl.textContent  = '';
        this.dirEl.classList.remove('show');
        this.hintEl.classList.remove('show');

        // Show overlay (hidden → visible)
        this.overlay.classList.remove('hidden');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.overlay.classList.add('visible');
            });
        });

        // Wire input
        this.overlay.addEventListener('click', this._boundAdvance);
        document.addEventListener('keydown', this._boundKey);
        this.skipBtn.addEventListener('click', this._boundSkip);

        // Play first beat after fade-in settles
        setTimeout(() => this._showBeat(0), 700);
    }

    // ── Private: show one beat ───────────────────────────────────
    _showBeat(index) {
        if (index >= this.beats.length) {
            this._finish();
            return;
        }

        this.current = index;
        const beat   = this.beats[index];

        // Update dots
        document.querySelectorAll('.intro-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
            dot.classList.toggle('done',   i < index);
        });

        // Swap character image with cross-fade
        this.charImg.classList.remove('show', 'lyra-cinematic', 'lyra-eye-glow');
        this._resetBlink();
        setTimeout(() => {
            this.charImg.src = beat.body;
            this.charImg.classList.add('show');
            // Beat 0 of Lyra: cinematic zoom only (no blink)
            if (this.characterId === 'lyra' && index === 0) {
                this.charImg.classList.add('lyra-cinematic');
            }
            // Beats flagged with eyeGlow: pulsing eye glow effect
            if (beat.eyeGlow) {
                this.charImg.classList.add('lyra-eye-glow');
            }
        }, 220);

        // Stage direction — appears instantly
        this.dirEl.classList.remove('show');
        this.dirEl.textContent = beat.direction;
        setTimeout(() => this.dirEl.classList.add('show'), 150);

        // Cancel any still-pending typewriter from the previous beat
        clearTimeout(this._typeTimer);
        this._typeTimer = null;

        // Clear spoken line, hide hint
        this.lineEl.textContent = '';
        this.hintEl.classList.remove('show');
        this.typing = true;

        // Typewriter — starts slightly after direction appears
        let i = 0;
        const text  = beat.line;
        const speed = 30; // ms per char — readable but not slow

        const type = () => {
            if (i < text.length) {
                this.lineEl.textContent += text[i++];
                this._typeTimer = setTimeout(type, speed);
            } else {
                this.typing = false;
                // Small beat before showing tap hint
                setTimeout(() => this.hintEl.classList.add('show'), 300);
            }
        };

        // Store the initial delay timer so it can be cancelled too
        this._typeTimer = setTimeout(type, 450);
    }

    // ── Private: blink overlay helpers ──────────────────────────
    _startBlink() {
        if (!this.blinkOverlay) return;
        this.blinkOverlay.src = 'assets/lyra/body/neutral.png';
        // Force reflow so animation restarts cleanly
        this.blinkOverlay.classList.remove('active');
        void this.blinkOverlay.offsetWidth;
        this.blinkOverlay.classList.add('active');
    }

    _resetBlink() {
        if (!this.blinkOverlay) return;
        this.blinkOverlay.classList.remove('active');
        this.blinkOverlay.src = '';
    }

    // ── Private: handle tap / keypress ──────────────────────────
    _advance() {
        if (this.finishing) return;

        if (this.typing) {
            // Skip typewriter — show full text immediately
            clearTimeout(this._typeTimer);
            this.typing = false;
            this.lineEl.textContent = this.beats[this.current].line;
            setTimeout(() => this.hintEl.classList.add('show'), 150);
            return;
        }

        // Move to next beat
        this._showBeat(this.current + 1);
    }

    _onKey(e) {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            this._advance();
        }
    }

    // ── Private: finish — ask for name first time, else fade out ─
    _finish() {
        if (this.finishing) return;
        this.finishing = true;

        IntroScene.markSeen(this.characterId);

        // Remove input listeners
        this.overlay.removeEventListener('click', this._boundAdvance);
        document.removeEventListener('keydown', this._boundKey);
        this.skipBtn.removeEventListener('click', this._boundSkip);
        this.charImg.classList.remove('lyra-cinematic', 'lyra-eye-glow');
        this._resetBlink();

        // First time ever playing — collect the player's name
        if (!localStorage.getItem('pp_player_name')) {
            this._showNameInput();
        } else {
            this._fadeOut();
        }
    }

    // ── Private: slide in name input panel ───────────────────────
    _showNameInput() {
        const panel  = document.getElementById('intro-name-panel');
        const prompt = document.getElementById('intro-name-prompt');
        const input  = document.getElementById('intro-name-input');
        const btn    = document.getElementById('intro-name-confirm');

        // Character-specific ask
        const prompts = {
            alistair: "And your name, if you're willing to share it?",
            lyra:     "Tell me your name... I want to remember it.",
            lucien:   "Your name. For the records. ...And for me."
        };
        prompt.textContent = prompts[this.characterId] || "What's your name?";

        panel.classList.add('show');
        setTimeout(() => input.focus(), 350);

        const confirm = () => {
            const name = input.value.trim();
            if (!name) {
                // Shake the input to signal "please fill this in"
                input.classList.add('shake');
                setTimeout(() => input.classList.remove('shake'), 400);
                return;
            }
            localStorage.setItem('pp_player_name', name);
            panel.classList.remove('show');
            setTimeout(() => this._fadeOut(), 350);
        };

        btn.onclick          = confirm;
        input.onkeydown = (e) => {
            if (e.key === 'Enter') { e.preventDefault(); confirm(); }
        };
    }

    // ── Private: fade overlay out and hand off ────────────────────
    _fadeOut() {
        this.overlay.style.transition = 'opacity 0.7s ease';
        this.overlay.style.opacity    = '0';

        setTimeout(() => {
            this.overlay.classList.add('hidden');
            this.overlay.classList.remove('visible');
            this.overlay.style.opacity    = '';
            this.overlay.style.transition = '';
            this.charImg.classList.remove('show');
            this.onComplete && this.onComplete();
        }, 750);
    }
}
