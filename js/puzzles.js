// Puzzle Training System — Lucien's unique training mechanic
// Replaces physical training (sword/singing) with mental puzzles

class PuzzleSystem {
    constructor(game) {
        this.game = game;
        this.puzzlesMastered = 0;
    }

    // ── Logic Puzzle: Simon Says with arcane symbols ─────────────
    playLogicPuzzle(container, onComplete) {
        const symbols = ['\u2660', '\u2666', '\u2663', '\u2665', '\u2736', '\u262F'];
        const seqLength = Math.min(3 + Math.floor(this.puzzlesMastered / 5), 7);
        const sequence = [];
        for (let i = 0; i < seqLength; i++) {
            sequence.push(symbols[Math.floor(Math.random() * symbols.length)]);
        }

        container.innerHTML = `
            <div class="puzzle-title">Logic Sequence</div>
            <div class="puzzle-hint">Watch, then repeat</div>
            <div class="puzzle-display" id="puzzle-display"></div>
            <div class="puzzle-buttons" id="puzzle-buttons"></div>
        `;

        const display = container.querySelector('#puzzle-display');
        const buttons = container.querySelector('#puzzle-buttons');

        // Show sequence
        let showIndex = 0;
        buttons.style.pointerEvents = 'none';
        buttons.style.opacity = '0.4';

        // Create symbol buttons
        symbols.forEach(sym => {
            const btn = document.createElement('button');
            btn.className = 'puzzle-btn';
            btn.textContent = sym;
            btn.dataset.symbol = sym;
            buttons.appendChild(btn);
        });

        const showNext = () => {
            if (showIndex < sequence.length) {
                display.textContent = sequence[showIndex];
                display.classList.add('puzzle-flash');
                setTimeout(() => display.classList.remove('puzzle-flash'), 400);
                showIndex++;
                setTimeout(showNext, 700);
            } else {
                display.textContent = '?';
                buttons.style.pointerEvents = 'all';
                buttons.style.opacity = '1';
                this._handleLogicInput(container, buttons, sequence, onComplete);
            }
        };
        setTimeout(showNext, 500);
    }

    _handleLogicInput(container, buttons, sequence, onComplete) {
        let inputIndex = 0;
        const display = container.querySelector('#puzzle-display');

        buttons.querySelectorAll('.puzzle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.symbol === sequence[inputIndex]) {
                    // Correct
                    display.textContent = btn.dataset.symbol;
                    display.classList.add('puzzle-correct');
                    setTimeout(() => display.classList.remove('puzzle-correct'), 300);
                    sounds.pop();
                    inputIndex++;
                    if (inputIndex >= sequence.length) {
                        this.puzzlesMastered++;
                        this._showResult(container, true, 'logic', onComplete);
                    }
                } else {
                    // Wrong
                    display.textContent = '\u2717';
                    display.classList.add('puzzle-wrong');
                    sounds.sad();
                    setTimeout(() => {
                        this._showResult(container, false, 'logic', onComplete);
                    }, 600);
                }
            });
        });
    }

    // ── Arcane Study: Theory questions with 3 choices ────────────
    playArcanePuzzle(container, onComplete) {
        const questions = [
            { q: "The Third Law of Resonance states that all magic...", a: 1, opts: ["Creates matter", "Returns to its source", "Destroys entropy"] },
            { q: "A ward's strength is determined by...", a: 2, opts: ["The caster's voice", "The moon phase", "The caster's focus"] },
            { q: "When two spells collide, the result depends on...", a: 0, opts: ["Their harmonic frequency", "The time of day", "The caster's age"] },
            { q: "The fundamental particle of magic is called a...", a: 1, opts: ["Prism", "Mote", "Fragment"] },
            { q: "Siren magic differs from arcane magic because it...", a: 0, opts: ["Uses emotion as fuel", "Requires a wand", "Only works at sea"] },
            { q: "Memory spells fail when the caster...", a: 2, opts: ["Is too young", "Uses the wrong hand", "Doubts the memory"] },
            { q: "The color of pure mana is...", a: 1, opts: ["Blue", "No color at all", "Gold"] },
            { q: "Reality fractures occur when...", a: 0, opts: ["Logic overrides entropy", "Stars misalign", "The caster sleeps"] },
            { q: "A mage's bond with another person affects...", a: 2, opts: ["Their height", "Their appetite", "Their casting range"] },
            { q: "The oldest known spell is...", a: 1, opts: ["Fireball", "A lullaby", "Teleportation"] }
        ];

        const qData = questions[Math.floor(Math.random() * questions.length)];

        container.innerHTML = `
            <div class="puzzle-title">Arcane Study</div>
            <div class="puzzle-question">${qData.q}</div>
            <div class="puzzle-choices" id="puzzle-choices"></div>
        `;

        const choices = container.querySelector('#puzzle-choices');
        qData.opts.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'puzzle-choice-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => {
                if (i === qData.a) {
                    btn.classList.add('puzzle-correct');
                    sounds.chime();
                    this.puzzlesMastered++;
                    setTimeout(() => this._showResult(container, true, 'arcane', onComplete), 600);
                } else {
                    btn.classList.add('puzzle-wrong');
                    choices.querySelectorAll('.puzzle-choice-btn')[qData.a].classList.add('puzzle-correct');
                    sounds.sad();
                    setTimeout(() => this._showResult(container, false, 'arcane', onComplete), 800);
                }
                choices.style.pointerEvents = 'none';
            });
            choices.appendChild(btn);
        });
    }

    // ── Memory Trial: Rune sequence recall ───────────────────────
    playMemoryPuzzle(container, onComplete) {
        const runes = ['\u16A0', '\u16A2', '\u16A6', '\u16B1', '\u16B7', '\u16C1'];
        const seqLength = Math.min(4 + Math.floor(this.puzzlesMastered / 4), 8);
        const sequence = [];
        for (let i = 0; i < seqLength; i++) {
            sequence.push(Math.floor(Math.random() * runes.length));
        }

        container.innerHTML = `
            <div class="puzzle-title">Memory Trial</div>
            <div class="puzzle-hint">Remember the rune sequence</div>
            <div class="puzzle-rune-grid" id="puzzle-runes"></div>
            <div class="puzzle-display" id="puzzle-display"></div>
        `;

        const grid = container.querySelector('#puzzle-runes');
        const display = container.querySelector('#puzzle-display');

        // Create rune buttons
        runes.forEach((rune, i) => {
            const btn = document.createElement('button');
            btn.className = 'puzzle-rune-btn';
            btn.textContent = rune;
            btn.dataset.index = i;
            grid.appendChild(btn);
        });

        grid.style.pointerEvents = 'none';
        grid.style.opacity = '0.4';

        // Show sequence
        let showIndex = 0;
        const showNext = () => {
            if (showIndex < sequence.length) {
                const runeIdx = sequence[showIndex];
                const btn = grid.querySelectorAll('.puzzle-rune-btn')[runeIdx];
                btn.classList.add('puzzle-rune-active');
                display.textContent = runes[runeIdx];
                setTimeout(() => btn.classList.remove('puzzle-rune-active'), 500);
                showIndex++;
                setTimeout(showNext, 800);
            } else {
                display.textContent = `Repeat (${sequence.length} runes)`;
                grid.style.pointerEvents = 'all';
                grid.style.opacity = '1';
                this._handleMemoryInput(container, grid, runes, sequence, onComplete);
            }
        };
        setTimeout(showNext, 600);
    }

    _handleMemoryInput(container, grid, runes, sequence, onComplete) {
        let inputIndex = 0;
        const display = container.querySelector('#puzzle-display');

        grid.querySelectorAll('.puzzle-rune-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                if (idx === sequence[inputIndex]) {
                    btn.classList.add('puzzle-rune-correct');
                    setTimeout(() => btn.classList.remove('puzzle-rune-correct'), 300);
                    sounds.pop();
                    inputIndex++;
                    display.textContent = `${inputIndex} / ${sequence.length}`;
                    if (inputIndex >= sequence.length) {
                        this.puzzlesMastered++;
                        this._showResult(container, true, 'memory', onComplete);
                    }
                } else {
                    btn.classList.add('puzzle-rune-wrong');
                    sounds.sad();
                    setTimeout(() => this._showResult(container, false, 'memory', onComplete), 600);
                }
            });
        });
    }

    // ── Result display ───────────────────────────────────────────
    _showResult(container, success, type, onComplete) {
        const lines = CHARACTER.trainingDialogue?.[type] || ["..."];
        const line = lines[Math.floor(Math.random() * lines.length)];

        container.innerHTML = `
            <div class="puzzle-result ${success ? 'puzzle-success' : 'puzzle-fail'}">
                <div class="puzzle-result-icon">${success ? '\u2728' : '\uD83D\uDCA8'}</div>
                <div class="puzzle-result-text">${success ? 'Solved' : 'Failed'}</div>
                <div class="puzzle-result-line">"${line}"</div>
            </div>
        `;

        setTimeout(() => {
            if (onComplete) onComplete(success);
        }, 2000);
    }

    // ── Timing Game: tap when indicator hits the target zone ─────
    playTimingGame(container, onComplete) {
        container.innerHTML = `
            <div class="puzzle-title">Timing</div>
            <div class="puzzle-hint">Tap when the light hits the center!</div>
            <div class="timing-track">
                <div class="timing-zone"></div>
                <div class="timing-indicator"></div>
            </div>
            <button class="timing-tap-btn">TAP!</button>
        `;

        const indicator = container.querySelector('.timing-indicator');
        const tapBtn = container.querySelector('.timing-tap-btn');
        let position = 0;
        let direction = 1;
        let speed = 2 + Math.floor(this.puzzlesMastered / 5); // gets faster
        let running = true;

        const animate = () => {
            if (!running) return;
            position += direction * speed;
            if (position >= 100) { position = 100; direction = -1; }
            if (position <= 0) { position = 0; direction = 1; }
            indicator.style.left = position + '%';
            requestAnimationFrame(animate);
        };
        animate();

        tapBtn.addEventListener('click', () => {
            if (!running) return;
            running = false;
            // Target zone is 40-60%
            const success = position >= 35 && position <= 65;
            if (success) this.puzzlesMastered++;
            this._showResult(container, success, Object.keys(CHARACTER.trainingDialogue || {})[0] || 'logic', onComplete);
        });

        // Auto-fail after 5 seconds
        setTimeout(() => {
            if (running) {
                running = false;
                this._showResult(container, false, Object.keys(CHARACTER.trainingDialogue || {})[0] || 'logic', onComplete);
            }
        }, 5000);
    }

    // ── Entry point: play a random puzzle of the given type ──────
    play(type, container, onComplete) {
        switch (type) {
            case 'logic':
                this.playLogicPuzzle(container, onComplete);
                break;
            case 'arcane':
                this.playArcanePuzzle(container, onComplete);
                break;
            case 'memory':
                this.playMemoryPuzzle(container, onComplete);
                break;
            case 'timing':
                this.playTimingGame(container, onComplete);
                break;
            default:
                this.playTimingGame(container, onComplete);
        }
    }
}
