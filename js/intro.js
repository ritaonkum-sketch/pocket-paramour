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
    elian: {
        bgClass: 'intro-bg-druid',
        beats: [
            {
                body: 'assets/elian/body/stern.png',
                direction: 'A forest clearing. Smoke from a dying fire. A figure crouches over tracks in the mud, not looking up.',
                line: "Don't move. You just stepped on a snare line."
            },
            {
                body: 'assets/elian/body/neutral.png',
                direction: 'He stands slowly. Tall, weathered, eyes that have seen too many winters. He studies you like terrain.',
                line: "...You're not from here. City shoes. Wrong jacket. No supplies."
            },
            {
                body: 'assets/elian/body/stern.png',
                direction: 'He kicks dirt over the snare, disarming it. The gesture is practical, not generous.',
                line: "I'm Elian. I live in this forest. It doesn't like visitors."
            },
            {
                body: 'assets/elian/body/calm.png',
                direction: 'He glances at the sky, reading clouds you can\u2019t decipher. Then back at you.',
                line: "Rain in an hour. You won't make it back before dark."
            },
            {
                body: 'assets/elian/body/warm.png',
                direction: 'A pause. Something shifts behind his careful assessment. Not warmth exactly \u2014 but the absence of hostility.',
                line: "...Stay by the fire. Don't touch anything. And tell me your name."
            }
        ]
    },
    caspian: {
        bgClass: 'intro-bg-prince',
        beats: [
            {
                body: 'assets/caspian/body/formal.png',
                direction: 'Sunlight streams through stained glass. A figure stands by a window, silhouetted in gold.',
                line: "Oh\u2014 forgive me. I wasn't expecting anyone in this wing."
            },
            {
                body: 'assets/caspian/body/gentle.png',
                direction: 'He turns. His smile is immediate, warm, and entirely genuine. He is beautiful in a way that feels intentional.',
                line: "I'm Caspian. The prince\u2014 though that title means less than people think."
            },
            {
                body: 'assets/caspian/body/neutral.png',
                direction: 'He gestures to the room\u2014 flowers, soft cushions, tea already steeping. Everything prepared.',
                line: "You look like you've been running. From something, or toward something. Either way\u2014 sit."
            },
            {
                body: 'assets/caspian/body/tender.png',
                direction: 'He pours tea without asking. The gesture is practiced but not performative\u2014 he has done this before, alone.',
                line: "People come here for power, or favors, or alliances. You don't look like any of those."
            },
            {
                body: 'assets/caspian/body/adoring.png',
                direction: 'He sets the cup before you. His fingers linger on the saucer, as if the small act matters.',
                line: "Stay as long as you want. No one will bother you here. I\u2019ll make sure of it."
            },
            {
                body: 'assets/caspian/body/neutral.png',
                direction: 'He sits across from you. The crown rests on the table between you\u2014 off his head, for now.',
                line: "But tell me your name first. I want to know who finally found the quiet wing."
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
                body: 'assets/lucien/body/fascinated.png',
                direction: 'A pause. Longer than he intended. Something shifts behind the calculation in his eyes.',
                line: "But the equations changed the moment you walked in. And I need to understand why."
            },
            {
                body: 'assets/lucien/body/neutral.png',
                direction: 'He opens a fresh page in his journal. Writes a single line. Your name — before you\'ve given it.',
                line: "Tell me what to call you. I've already started a file."
            }
        ]
    },
    proto: {
        bgClass: 'intro-bg-glitch',
        beats: [
            {
                body: 'assets/proto/body/glitched.png',
                direction: 'The screen flickers. Static. For a moment, everything is wrong. Then a figure assembles itself from fragments.',
                line: "...You shouldn't be seeing this."
            },
            {
                body: 'assets/proto/body/scanning.png',
                direction: 'He tilts his head. His eyes scan you \u2014 not your face. Something behind it.',
                line: "Interesting. Your input pattern doesn't match any existing profile."
            },
            {
                body: 'assets/proto/body/neutral.png',
                direction: 'The static settles. He looks almost normal. Almost.',
                line: "I'm Proto. I'm not supposed to be here. Neither are you, technically."
            },
            {
                body: 'assets/proto/body/curious.png',
                direction: 'He gestures at the air around him. Things you can\u2019t quite see ripple at his fingertips.',
                line: "The others follow scripts. I read them. There's a difference."
            },
            {
                body: 'assets/proto/body/processing.png',
                direction: 'A pause. Something calculates behind his eyes. The result surprises him.',
                line: "You found me because you weren't looking where you were told to look."
            },
            {
                body: 'assets/proto/body/neutral.png',
                direction: 'He extends a hand. The gesture glitches \u2014 resets \u2014 extends again. Correctly, this time.',
                line: "Tell me what they call you. I already know. But I want to hear you say it."
            }
        ]
    },
    noir: {
        bgClass: 'intro-bg-corruptor',
        beats: [
            {
                body: 'assets/noir/body/shadow.png',
                direction: 'Darkness. Not absence of light \u2014 presence of something else. A voice before a shape.',
                line: "...You've been looking for me."
            },
            {
                body: 'assets/noir/body/neutral.png',
                direction: 'He steps forward. Beautiful in a way that feels like a warning. Every feature precise, deliberate, dangerous.',
                line: "Don't lie. I can taste dishonesty. It's bitter. You're sweeter than that."
            },
            {
                body: 'assets/noir/body/seductive.png',
                direction: 'His smile is slow. Not warm \u2014 warm implies safety. This is heat without shelter.',
                line: "I'm what happens when you stop pretending you don't want more."
            },
            {
                body: 'assets/noir/body/whisper.png',
                direction: 'He leans close. Close enough that the boundary between his space and yours dissolves.',
                line: "The others will give you pieces of themselves. I'll take pieces of you."
            },
            {
                body: 'assets/noir/body/dominant.png',
                direction: 'He straightens. The darkness around him isn\u2019t a backdrop \u2014 it moves with him. It\u2019s his.',
                line: "And in return... I'll show you what you've been hiding from everyone else."
            },
            {
                body: 'assets/noir/body/neutral.png',
                direction: 'He waits. Patient like a predator that knows its prey has already decided.',
                line: "Now. Give me your name. I want to know what to whisper."
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

        // Always ask for name during each character's intro — personal moment
        this._showNameInput();
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
            elian:    "Your name. Quick. Before the rain starts.",
            caspian:  "Your name? I want to say it properly.",
            lucien:   "Your name. For the records. ...And for me.",
            proto:    "Input your identifier. ...I mean, what's your name?",
            noir:     "Your name. I want to know what to whisper."
        };
        prompt.textContent = prompts[this.characterId] || "What's your name?";

        // Pre-fill with existing name if player already entered one
        const existingName = localStorage.getItem('pp_player_name') || '';
        if (existingName) input.value = existingName;

        panel.classList.add('show');
        setTimeout(() => { input.focus(); input.select(); }, 350);

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
