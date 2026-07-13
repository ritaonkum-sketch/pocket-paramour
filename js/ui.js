// UI controller - handles all DOM updates, panels, animations, day/night

class GameUI {
    constructor(game) {
        this.game = game;

        // ── SINGLE-ACTIVE-INSTANCE GUARD (Jul 2026 audit) ──────────────────
        // Switching companions builds a fresh game + GameUI, but nothing tore
        // down the OLD instance's self-rescheduling timers (_idleTimer,
        // _idlePoseTimer, _ambientLoopTimer, _notifTimer). The orphaned idle
        // loop kept firing forever with the PREVIOUS game's frozen stats —
        // stale "I'm getting hungry..." chatter at double rate on the new
        // companion's screen. Each new GameUI now destroys the previous one.
        try {
            if (GameUI._active && typeof GameUI._active.destroy === 'function') {
                GameUI._active.destroy();
            }
        } catch (_) {}
        GameUI._active = this;
        this._destroyed = false;

        // Cache DOM refs
        this.hungerBar = document.getElementById('hunger-bar');
        this.cleanBar = document.getElementById('clean-bar');
        this.bondBar = document.getElementById('bond-bar');
        this.corruptionBar = document.getElementById('corruption-bar');
        this.corruptionIndicator = document.getElementById('corruption-indicator');
        this.characterSprite = document.getElementById('character-fullbody');
        this.affectionText = document.getElementById('affection-text');
        this.personalityBadge = document.getElementById('personality-badge');
        this.gameOverOverlay = document.getElementById('game-over-overlay');
        this.gameOverText = document.getElementById('game-over-text');
        this.container = document.getElementById('game-container');
        this.timeOverlay = document.getElementById('time-overlay');
        this.timeDisplay = document.getElementById('time-display');
        // (outfitLabel removed May 2026 — outfit system removed)

        // Story scene refs
        this.storyOverlay = document.getElementById('story-overlay');
        this.storyPortrait = document.getElementById('story-portrait');
        this.storyDialogue = document.getElementById('story-dialogue');

        // Panels
        // (dressPanel removed May 2026 — outfit system removed)
        this.giftPanel = document.getElementById('gift-panel');

        // Wire up buttons — each gets haptic + particle feedback
        document.getElementById('btn-feed')?.addEventListener('click', () => {
            sounds.munch();  // eating SFX for ALL characters (was a generic pop)
            this._actionFeedback('btn-feed', '\uD83C\uDF54');
            this._resetIdlePoseTimer();
            this._requestNotificationPermission(); // Feature 12: ask on first action
            if (typeof CHARACTER !== 'undefined' && CHARACTER.name === 'Lyra') {
                this._lyraEatSequence();  // munch already played above for everyone
            }
            this.game.feed();
        });
        document.getElementById('btn-wash')?.addEventListener('click', () => {
            sounds.splash();  // water SFX for ALL characters (was a generic pop)
            this._actionFeedback('btn-wash', '\uD83D\uDCA7');
            this._resetIdlePoseTimer();
            if (typeof CHARACTER !== 'undefined' && CHARACTER.name === 'Lyra') {
                this._lyraWashSequence();  // splash already played above for everyone
            }
            this.game.wash();
        });
        document.getElementById('btn-gift')?.addEventListener('click', () => {
            sounds.chime();
            this._actionFeedback('btn-gift', '\uD83C\uDF81');
            this._resetIdlePoseTimer();
            this.toggleGiftPanel();
        });
        document.getElementById('btn-train')?.addEventListener('click', () => {
            sounds.clash();
            this._actionFeedback('btn-train', '\u2728');
            this._resetIdlePoseTimer();
            this.game.train();
        });
        document.getElementById('btn-talk')?.addEventListener('click', () => {
            sounds.pop();
            this._actionFeedback('btn-talk', '\uD83D\uDCAC');
            this._resetIdlePoseTimer();
            // Show talk pose immediately on click — no waiting for game logic
            this.setCharacterSprite(this._lastEmotion || 'neutral', 'talk');
            this.game.talk();
        });
        document.getElementById('revival-btn')?.addEventListener('click', () => this.game.revive());

        // Close panels
        // (dress-close listener removed May 2026 — outfit system removed)
        document.getElementById('gift-close')?.addEventListener('click', () => this.closeGiftPanel());
        document.getElementById('achievement-close')?.addEventListener('click', () => this.closeAchievementPanel());

        // Trophy button
        document.getElementById('trophy-btn')?.addEventListener('click', () => this.toggleAchievementPanel());

        // Story continue
        document.getElementById('story-continue')?.addEventListener('click', () => this.closeStoryScene());

        // Init subsystems
        // (initDressPanel removed May 2026 — outfit system removed)
        this.initGiftPanel();
        this.startIdleAnimations();
        this.startDayNightCycle();
        this.startIdleDialogue();
        this.initCharacterTap();
        // Debug panel only initialized when ?debug=1 is in the URL
        if (/[?&]debug=1\b/.test(location.search)) {
            this.initDebugPanel();
        }
    }

    // ===== DAY/NIGHT CYCLE =====

    startDayNightCycle() {
        this.updateTimeOfDay();
        setInterval(() => {
            this.updateTimeOfDay();
            this._checkMidnightSleep(); // re-check every minute for midnight/5am transitions
        }, 60000);
    }

    updateTimeOfDay() {
        const hour = new Date().getHours();
        let period;

        if (hour >= 6 && hour < 10) period = 'morning';
        else if (hour >= 10 && hour < 17) period = 'day';
        else if (hour >= 17 && hour < 21) period = 'evening';
        else period = 'night';

        // Update overlay
        this.timeOverlay.className = period;

        // Update time display
        const h = hour % 12 || 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const min = String(new Date().getMinutes()).padStart(2, '0');
        const day = this.game.storyDay || 1;
        this.timeDisplay.textContent = `Day ${day} \u2022 ${h}:${min} ${ampm}`;

        // Night mode class on container
        if (period === 'night') {
            this.container.classList.add('night-mode');
        } else {
            this.container.classList.remove('night-mode');
        }

        // Lyra background — day (6am–7pm) or evening (7pm–6am)
        if (typeof CHARACTER !== 'undefined' && CHARACTER.name === 'Lyra') {
            const lyraBg = (hour >= 6 && hour < 19)
                ? "url('assets/bg-lyra-day.png')"
                : "url('assets/bg-lyra-evening.png')";
            this._crossfadeBg(lyraBg);
        }
        // Caspian background — balcony (day) / night / bedroom
        if (typeof CHARACTER !== 'undefined' && CHARACTER.name === 'Caspian') {
            var casBg;
            if (hour >= 6 && hour < 18) casBg = "url('assets/bg-caspian-balcony.png')";
            else if (hour >= 18 && hour < 22) casBg = "url('assets/bg-caspian-night.png')";
            else casBg = "url('assets/bg-caspian-bedroom.png')";
            this._crossfadeBg(casBg);
        }
        // Lucien background — day / evening / night
        if (typeof CHARACTER !== 'undefined' && CHARACTER.name === 'Lucien') {
            var lucBg;
            if (hour >= 6 && hour < 18) lucBg = "url('assets/bg-lucien-night.png')";
            else if (hour >= 18 && hour < 22) lucBg = "url('assets/bg-lucien-evening.png')";
            else lucBg = "url('assets/bg-lucien-bedroom.png')";
            this._crossfadeBg(lucBg);
        }

        // Store for dialogue system
        this.game.timeOfDay = period;
    }

    // ── Smooth background crossfade ──────────────────────────────────
    _crossfadeBg(newBg) {
        if (!this.container) return;
        const current = this.container.style.backgroundImage;
        if (current === newBg) return; // no change
        // Fade opacity briefly then swap
        this.container.style.transition = 'opacity 0.8s ease';
        this.container.style.opacity = '0.7';
        setTimeout(() => {
            this.container.style.backgroundImage = newBg;
            this.container.style.opacity = '1';
        }, 400);
        setTimeout(() => { this.container.style.transition = ''; }, 1200);
    }

    // ===== IDLE ANIMATIONS =====

    // ── Cross-character jealousy dialogue ──────────────────────────────
    _getJealousyLines(currentChar, lastChar) {
        const lines = {
            Alistair: {
                lyra:   [
                    "You smell like the ocean. ...Have you been to the shore?",
                    "There's salt on your clothes. Were you visiting someone?",
                    "A knight notices things. Like the scent of seawater on someone who wasn't at sea.",
                    "You have a faraway look today. Like someone who's been listening to singing.",
                    "...My sister-in-arms says jealousy is beneath a knight. She's never been in love."
                ],
                lucien: [
                    "There's ink on your sleeve. That's not mine.",
                    "You were at the tower, weren't you? I can smell the reagents.",
                    "The mage's magic leaves traces. I can feel it on you.",
                    "You seem... distracted. Like someone who's been solving puzzles.",
                    "I don't compete with scholars. I compete with swords. But still."
                ],
                caspian: [
                    "You smell like roses. The palace, then.",
                    "You're more relaxed today. Like someone who's been... pampered.",
                    "A knight offers protection. A prince offers comfort. Different things.",
                    "There's silk thread on your shoulder. That's not from my barracks.",
                    "...The prince is generous. I hope he's also honest."
                ],
                elian: [
                    "Dirt on your boots. Forest path.",
                    "You smell like pine and campfire smoke. The druid.",
                    "He teaches survival. I teach duty. Both matter.",
                    "You seem... grounded today. Less careful. His influence."
                ],
                proto: [
                    "Something's off about you today. I can't place it.",
                    "You're questioning things more than usual. The anomaly.",
                    "Whatever he showed you... it's not the whole picture.",
                    "The glitch sees patterns. I see people. There's a difference."
                ],
                noir: [
                    "There's shadow on you. I don't like it.",
                    "You've been somewhere dark. A knight knows darkness when he sees it.",
                    "Whatever he offered you... a sword is more honest.",
                    "The corruptor leaves marks. Even I can see them."
                ]
            },
            Lyra: {
                alistair: [
                    "You smell like steel and leather. You were with him.",
                    "There's dust on you. Castle dust. Not cave dust.",
                    "Your heartbeat is different today. Steadier. Like someone who's been near armor.",
                    "...I'm not jealous. Sirens don't get jealous. We get *Territorial.*",
                    "He can protect you with a sword. I can protect you with a song. Choose."
                ],
                lucien: [
                    "My brother's magic clings to you. I can taste it.",
                    "You were with Lucien. The resonance is unmistakable.",
                    "He studies. I feel. We're the same problem, different solutions.",
                    "...Did he talk about me? He never talks about me.",
                    "The tower and the cave are not so different. Both are lonely."
                ],
                caspian: [
                    "You smell like roses and gold. The palace.",
                    "He wraps you in silk. I wrap you in song. His is softer. Mine is deeper.",
                    "The prince makes everything easy. That's not always a gift.",
                    "You're calmer today. Like someone who's been told everything is fine.",
                    "...Comfort is a tide that pulls you out slowly. Be careful."
                ],
                elian: [
                    "There's earth on you. The forest.",
                    "He grounds you. I drown you. Different kinds of love.",
                    "The druid is practical. I'm emotional. You need both.",
                    "You smell like rain and bark. His world."
                ],
                proto: [
                    "You're... different today. Colder. More analytical.",
                    "He showed you something, didn't he? Behind the curtain.",
                    "The glitch sees code. I see hearts. Don't confuse them.",
                    "Whatever he told you about me... it wasn't personal. It was data."
                ],
                noir: [
                    "The darkness is on you. I can feel it in my song.",
                    "He takes pieces of you. I give pieces of me. See the difference?",
                    "My brother... half-brother... whatever he is now... be careful.",
                    "The corruption hums at a frequency I recognize. It scares me."
                ]
            },
            Lucien: {
                alistair: [
                    "There's iron on your hands. You've been handling a sword. Or a knight.",
                    "Your posture changed. More rigid. Military influence.",
                    "The knight's dedication is admirable. Irrational, but admirable.",
                    "You carry yourself differently after visiting the castle. I've documented it.",
                    "...I don't feel jealousy. That would require an emotional attachment I haven't— never mind."
                ],
                lyra: [
                    "Someone else's magic lingers on you. Familiar magic.",
                    "You've been singing. Or listening to singing. The resonance is in your voice.",
                    "My sister has a gift for making people forget everything else. Including me.",
                    "The ocean is in your eyes today. That's not a compliment. It's an observation.",
                    "...She and I share blood. But not this. Not you."
                ],
                caspian: [
                    "You smell like roses and silk. Palace visit.",
                    "You're softer today. More relaxed. That concerns me.",
                    "Comfort is the enemy of discovery. The prince specializes in comfort.",
                    "He gives you luxury. I give you understanding. Different currencies.",
                    "...The prince is kind. Kindness can be a cage."
                ],
                elian: [
                    "Pine sap on your sleeve. The druid.",
                    "His approach is instinctive. Mine is systematic. Both have merit.",
                    "The forest teaches patience. My tower teaches precision.",
                    "You're more decisive today. His influence. Not bad."
                ],
                proto: [
                    "Your thought patterns shifted. You spoke to the anomaly.",
                    "He showed you something. I can see it in how you process information now.",
                    "The glitch and I see similar things. We interpret them differently.",
                    "Whatever he revealed... be careful. Some knowledge corrupts."
                ],
                noir: [
                    "Someone else's magic lingers on you. Dark magic.",
                    "The corruptor's influence is... measurable. And growing.",
                    "He consumes. I preserve. My sister knows the difference.",
                    "...That darkness isn't yours. But it's settling in."
                ]
            },
            Caspian: {
                alistair: [
                    "You came from the barracks. I can tell by the dust.",
                    "He protects you with steel. I protect you with peace.",
                    "The knight is noble. But nobility is cold comfort.",
                    "You looked more tense. I noticed.",
                    "A prince doesn't compete. He provides."
                ],
                lyra: [
                    "There's salt in your hair. The sea? Or the siren?",
                    "She sings beautifully. But songs end. What I offer doesn't.",
                    "The ocean is unpredictable. The palace is constant.",
                    "You seem distant. Like someone hearing music I can't.",
                    "I won't ask where you were. I'll just make sure you come back."
                ],
                lucien: [
                    "Ink on your fingers. The tower again.",
                    "The mage deals in questions. I deal in comfort.",
                    "He challenges you. I shelter you. Which feels like home?",
                    "You seem tired. Like someone thinking too hard.",
                    "The tower is cold. The palace is warm. Choose."
                ],
                elian: [
                    "Mud on your shoes. The forest.",
                    "He lives without luxury. I can't imagine why. By choice?",
                    "The druid is... rugged. I'm refined. There's room for both.",
                    "You look windswept. The palace has walls for a reason."
                ],
                proto: [
                    "You seem distant today. Like you're seeing through things.",
                    "He showed you something unsettling. I can see it in your eyes.",
                    "The anomaly offers perspective. I offer peace. Which heals?",
                    "Whatever he told you about reality... this is real. I'm real."
                ],
                noir: [
                    "There's something dark on you. I don't like it at all.",
                    "He takes. And takes. The palace gives.",
                    "The darkness he carries... it's not romantic. It's dangerous.",
                    "Promise me you'll be careful. Whatever he offers isn't free."
                ]
            },
            Elian: {
                alistair: ["You carry yourself like a soldier today. Castle influence.", "Steel and polish. The forest doesn't need either.", "The knight offers walls. I offer roots. Different shelters.", "You're stiffer. More guarded. His training, not mine."],
                lyra: ["There's salt on your skin. The sea.", "She sings to hold you. I just... stay.", "You're softer today. Ocean-touched.", "The siren offers echoes. I offer solid ground."],
                lucien: ["You smell like old paper and reagents. The tower.", "He fills your head with questions. I teach answers.", "You're overthinking. That's his influence.", "The mage and I agree on nothing. Especially you."],
                caspian: ["Rose petals on your sleeve. The palace.", "He wraps everything in silk. Even the truth.", "You're too comfortable today. That worries me.", "Comfort makes you soft. The forest won't."],
                proto: ["There's something... off about you today. Glitched.", "He showed you things you shouldn't see.", "You're questioning reality. His doing.", "The anomaly leaves traces. I can feel them."],
                noir: ["Darkness clings to you. I don't like it.", "You were with him. The shadows told me.", "The corruption is subtle. But the forest feels it.", "He takes. I give. Remember the difference."]
            },
            Proto: {
                alistair: ["You hold yourself differently after the castle. Straighter. I noticed by the second breath.", "The captain's influence is steady. Predictable. Unlike you.", "Steel does not talk back. But you still went to it."],
                lyra: ["Something in you is still singing. The siren.", "Her song is still moving through you. I can feel it in the thread.", "You are more feeling today. You have been with the singer."],
                lucien: ["His equations and my weave are not that different. But he does not know that.", "The mage sees patterns too. Just... slower ones.", "You visited the tower. You came back asking different questions."],
                caspian: ["You are very comfortable today. The palace does that.", "The prince arranges everything to stay the same. I arrange myself around... you.", "You take fewer risks after seeing him. I counted. Interesting."],
                elian: ["Dirt under your nails. The forest keeps writing on you.", "The druid trusts his instincts. I trust my counting. You need both.", "You smell like pine. That is not a judgment. It is an observation. I am keeping it."],
                noir: ["The dark around you is seven shades deeper today. His doing.", "What grows on him is... hungry. Be careful.", "There is a shadow woven into your thread that was not there before. I do not like where it learned its shape."]
            },
            Noir: {
                alistair: ["You still go to the knight. How... safe.", "Steel and honor. Such a boring shield.", "He protects you FROM things. I protect you FROM yourself.", "The knight's loyalty is a leash. Mine is a liberation."],
                lyra: ["The siren's song is sweet. Mine is sweeter.", "She holds you with music. I hold you with truth.", "You went to the sea. But the deep water is mine.", "Her love is gentle. Mine is consuming. Which do you crave?"],
                lucien: ["The mage thinks he understands darkness. He studies it. I AM it.", "His equations can't solve me. I've tried giving him the variables.", "You visited my... sister's brother. How quaint.", "Knowledge without power is just anxiety. I offer both."],
                caspian: ["The prince draped you in comfort. I can taste it on you. Cloying.", "He builds golden cages. I break all cages.", "Comfort or desire. You know which one keeps you up at night.", "His roses wilt. My shadows grow. Choose your garden."],
                elian: ["Dirt and practicality. The druid's influence.", "He teaches survival. I teach transcendence.", "The forest is honest. But it's not as honest as the dark.", "His grounding pulls you down. I pull you... deeper."],
                proto: ["The glitch sees code. I see hunger.", "His awareness is cold. Mine is hot.", "He reads your data. I read your desires.", "The anomaly and I share one thing: we both see through the illusion."]
            }
        };
        return lines[currentChar]?.[lastChar] || [];
    }

    // ── Action Feedback: haptic + floating particles on button press ──
    _actionFeedback(btnId, emoji) {
        // Haptic feedback on mobile
        if (navigator.vibrate) navigator.vibrate(30);

        // Spawn 3-4 floating emoji from button position
        const btn = document.getElementById(btnId);
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const container = document.getElementById('game-container');
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const count = 3 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
            const p = document.createElement('span');
            p.className = 'pp-btn-particle';
            p.textContent = emoji;
            p.style.left = (rect.left - containerRect.left + rect.width / 2 + (Math.random() - 0.5) * 30) + 'px';
            p.style.top = (rect.top - containerRect.top) + 'px';
            p.style.animationDelay = (i * 60) + 'ms';
            container.appendChild(p);
            setTimeout(() => p.remove(), 1200);
        }
    }

    startIdleAnimations() {
        // Real blink — swap face to eyes-closed then back
        this.blinkLoop();

        // Per-character subtle sway via CSS custom properties
        const fullbody = document.getElementById('character-fullbody');
        if (fullbody) {
            const charName = CHARACTER?.name || '';
            if (charName === 'Lyra') {
                fullbody.style.setProperty('--sway-amount', '0.8deg');
                fullbody.style.setProperty('--sway-x', '2px');
                fullbody.style.setProperty('--sway-speed', '4s');
            } else if (charName === 'Lucien') {
                fullbody.style.setProperty('--sway-amount', '0.2deg');
                fullbody.style.setProperty('--sway-x', '0.5px');
                fullbody.style.setProperty('--sway-speed', '8s');
            } else {
                // Alistair — rigid soldier
                fullbody.style.setProperty('--sway-amount', '0.3deg');
                fullbody.style.setProperty('--sway-x', '0.8px');
                fullbody.style.setProperty('--sway-speed', '6s');
            }
            fullbody.classList.add('pp-idle-sway');
        }
    }

    blinkLoop() {
        // Emotion-reactive blink timing
        const emotionalState = this.game?.emotionalState || 'neutral';
        let minDelay, maxDelay, closeDuration;

        if (emotionalState === 'unstable' || emotionalState === 'obsessed') {
            minDelay = 1500; maxDelay = 3000; closeDuration = 100;
        } else if (emotionalState === 'secure' || this.game?.affectionLevel >= 4) {
            minDelay = 4000; maxDelay = 7000; closeDuration = 250;
        } else {
            minDelay = 3000; maxDelay = 5000; closeDuration = 150;
        }

        const nextBlink = minDelay + Math.random() * (maxDelay - minDelay);

        setTimeout(() => {
            const faceImg = document.getElementById('character-face-img');
            if (!faceImg) { this.blinkLoop(); return; }

            // Use dedicated blink sprite if available, otherwise fall back to sleeping
            const blinkFace = (CHARACTER.faceSprites.blink && CHARACTER.faceSprites.blink[0])
                || (CHARACTER.faceSprites.sleeping && CHARACTER.faceSprites.sleeping[0])
                || null;
            // Skip blink if no sleeping face or if current face failed to load
            if (!blinkFace || !faceImg.naturalWidth) { this.blinkLoop(); return; }

            // Validate blink face exists (avoid 404 spam) — cache result
            if (this._blinkFaceValid === undefined) {
                const testImg = new Image();
                testImg.onload = () => { this._blinkFaceValid = true; };
                testImg.onerror = () => { this._blinkFaceValid = false; };
                testImg.src = blinkFace;
                // Skip this blink cycle while checking
                this.blinkLoop();
                return;
            }
            if (!this._blinkFaceValid) { this.blinkLoop(); return; }

            const currentSrc = faceImg.src;
            faceImg.src = blinkFace;

            setTimeout(() => {
                faceImg.src = currentSrc;

                const doubleBlink = emotionalState === 'unstable' ? 0.4 : 0.3;
                if (Math.random() < doubleBlink) {
                    setTimeout(() => {
                        faceImg.src = blinkFace;
                        setTimeout(() => { faceImg.src = currentSrc; }, closeDuration * 0.8);
                    }, 200);
                }

                if (this.game?.affectionLevel >= 3 && this._lastEmotion === 'love' && Math.random() < 0.08) {
                    const winkFace = CHARACTER.faceSprites.wink?.[0];
                    if (winkFace) {
                        setTimeout(() => {
                            faceImg.src = winkFace;
                            setTimeout(() => { faceImg.src = currentSrc; }, 500);
                        }, 800);
                    }
                }
            }, closeDuration);

            this.blinkLoop();
        }, nextBlink);
    }

    // ===== REMOVE WHITE BACKGROUND FROM BODY SPRITES =====

    // ===== TAP CHARACTER (players love this) =====

    initCharacterTap() {
        const bodyImg = document.getElementById('character-body-img');
        if (!bodyImg) return;

        this._tapCount = 0;
        this._lastTapTime = 0;

        bodyImg.addEventListener('click', (e) => {
            const g = this.game;
            if (g.characterLeft) return;

            sounds.pop();
            this.bounceCharacter();
            this._tapCount++;

            // Small bond boost
            g.bond = Math.min(100, g.bond + 1);
            g.affection = Math.min(100, g.affection + 0.5);

            // Spawn sparkles at tap position
            const rect = document.getElementById('character-area').getBoundingClientRect();
            this.spawnSparkles(e.clientX - rect.left, e.clientY - rect.top);

            // Tap reactions — use character-specific data if available
            const tapLines = CHARACTER.tapDialogue || {
                shy: ["H-hey...!", "That tickles...", "I-I don't mind..."],
                clingy: ["More!", "Don't stop!", "Again!"],
                tsundere: ["H-hey!", "D-don't just touch me!", "...Fine. One more."]
            };

            const lines = tapLines[g.personality] || tapLines.shy || ["...!"];
            const line = lines[Math.floor(Math.random() * lines.length)];
            g.typewriter.show(line);

            // Rapid tapping = special reaction
            const now = Date.now();
            if (now - this._lastTapTime < 500) {
                this._tapCount++;
                if (this._tapCount >= 5) {
                    this._tapCount = 0;
                    this.flashEmotion("love", 3000);
                    sounds.heartbeat();
                    this.spawnFloatingHearts(5);
                    g.typewriter.show("My heart... it's beating so fast...");
                }
            } else {
                this._tapCount = 1;
            }
            this._lastTapTime = now;

            g.lastInteractionTime = Date.now();
        });
    }

    // ===== IDLE DIALOGUE (he speaks on his own) =====

    startIdleDialogue() {
        this._idleTimer = null;
        this._midnightSleeping = false;
        this._returnSleepShown = false;
        this._peekTimeout = null;
        this._idlePoseTimer = null;
        this._ambientLoopTimer = null;
        this._notifTimer = null;
        this.scheduleIdleDialogue();
        this._startIdlePoseTimer(); // Feature 6: 30s idle bored/yawn

        // Feature 11: ambient ocean/siren sounds for Lyra
        if (typeof CHARACTER !== 'undefined' && CHARACTER.name === 'Lyra') {
            this._startAmbientLoop();
        }

        // Feature 12: push notification system
        this._initNotifications();
    }

    // Tear down every self-rescheduling timer this instance owns. Called by
    // the next GameUI's constructor (single-active-instance guard) so an old
    // instance can never keep talking over the new companion.
    destroy() {
        this._destroyed = true;
        try { clearTimeout(this._idleTimer); } catch (_) {}
        try { clearTimeout(this._idlePoseTimer); } catch (_) {}
        try { clearTimeout(this._ambientLoopTimer); } catch (_) {}
        try { clearTimeout(this._notifTimer); } catch (_) {}
        try { clearInterval(this._notifTimer); } catch (_) {}
        try { clearTimeout(this._trainingCloseTimer); } catch (_) {}
    }

    scheduleIdleDialogue() {
        if (this._destroyed) return;
        // Speak every 20-40 seconds when idle
        const delay = 20000 + Math.random() * 20000;

        this._idleTimer = setTimeout(() => {
            if (this._destroyed) return;
            const g = this.game;
            if (g.characterLeft) { this.scheduleIdleDialogue(); return; }

            const timeSinceInteraction = Date.now() - g.lastInteractionTime;

            // Only speak if player hasn't interacted for 15+ seconds
            // AND the typewriter isn't busy (typing OR a finished line is
            // still on screen). Jun 2026 — the old check used isTyping
            // only, so a finished line waiting for tap-dismissal would
            // get overwritten by the idle scheduler. Use busy() which
            // covers both states.
            if (timeSinceInteraction > 15000 && !(g.typewriter && g.typewriter.busy())) {

                // ── Lyra: tiered idle — short / medium / long ────────────────
                // Routes to per-tier + per-personality-profile pools instead of
                // the flat stateDialogue fallback. More reactive, less repetitive.
                if (typeof CHARACTER !== 'undefined' && CHARACTER.name === 'Lyra') {
                    const tier    = timeSinceInteraction < 30000 ? 'short'
                                  : timeSinceInteraction < 90000 ? 'medium'
                                  : 'long';
                    const profile = typeof g.getPersonalityProfile === 'function'
                                  ? g.getPersonalityProfile() : 'neutral';
                    const lyraLine = g.dialogueSystem?.getLyraIdleLine(tier, profile);
                    if (lyraLine) {
                        g.typewriter.show(lyraLine);
                        if (Math.random() > 0.6) sounds.ambientNote?.();
                        this.scheduleIdleDialogue();
                        return;
                    }
                }

                // ── Gift memory callback (10% chance) ────────────────
                if (Math.random() < 0.10 && g._lastGiftName && g._giftMemory) {
                    var totalGifts = Object.values(g._giftMemory).reduce(function(a,b){return a+b;},0);
                    if (totalGifts >= 3) {
                        var giftLines = [
                            "You gave me that " + g._lastGiftName + "... I still have it.",
                            "I think about that " + g._lastGiftName + " you brought me.",
                            "The " + g._lastGiftName + " is on my shelf. I look at it sometimes.",
                            "Every time I see that " + g._lastGiftName + ", I think of you.",
                            "You've given me " + totalGifts + " gifts now. I've kept every one."
                        ];
                        g.typewriter.show(giftLines[Math.floor(Math.random() * giftLines.length)]);
                        this.scheduleIdleDialogue();
                        return;
                    }
                }

                // ── Date afterglow (8% chance) ────────────────────────
                // Recalls the PEAK moment of a past date in the character's
                // voice. PPDates.afterglowLine returns null until the player
                // has actually reached a date's peak with this character.
                if (Math.random() < 0.08 && window.PPDates && typeof window.PPDates.afterglowLine === 'function') {
                    var agChar = g.selectedCharacter || g.characterId;
                    var agLine = window.PPDates.afterglowLine(agChar);
                    if (agLine) {
                        g.typewriter.show(agLine);
                        this.scheduleIdleDialogue();
                        return;
                    }
                }

                // ── Noir cross-character corruption taint (8% chance) ────
                if (Math.random() < 0.08 && g.selectedCharacter !== 'noir' && typeof g._loadMetaMemory === 'function') {
                    var meta = g._loadMetaMemory();
                    var noirCorr = meta.noirCorruption || 0;
                    if (noirCorr >= 10) {
                        var taintedLines = [
                            "...Something feels darker today. I can't explain it.",
                            "Did you hear that? ...No. Nothing. I'm imagining things.",
                            "I had a dream about shadows. They were warm.",
                            "...You seem different lately. Like something is pulling at you.",
                            "The air feels heavier. Is it just me?",
                            "I keep seeing things in the corners of my vision.",
                            "Something whispered my name last night. It sounded like you.",
                            "...I don't feel like myself today.",
                            "There's a coldness I can't shake. It came from nowhere.",
                            "You smell like smoke. But there's no fire."
                        ];
                        if (noirCorr >= 50) {
                            taintedLines.push(
                                "...He's still here, isn't he. Even when you're with me.",
                                "The darkness doesn't leave. It just waits.",
                                "I can feel it changing me. Through you.",
                                "Whatever you brought back from him... it's spreading."
                            );
                        }
                        g.typewriter.show(taintedLines[Math.floor(Math.random() * taintedLines.length)]);
                        this.scheduleIdleDialogue();
                        return;
                    }
                }

                // ── Cross-character jealousy (15% chance per idle) ────────
                if (Math.random() < 0.15 && typeof g._loadMetaMemory === 'function') {
                    const meta = g._loadMetaMemory();
                    const last = meta.lastPlayedCharacter;
                    const lastTime = meta.lastPlayedTime || 0;
                    const sameDay = (Date.now() - lastTime) < 86400000;
                    if (last && last !== g.selectedCharacter && sameDay) {
                        const jealousyLines = this._getJealousyLines(CHARACTER.name, last);
                        if (jealousyLines.length) {
                            g.typewriter.show(jealousyLines[Math.floor(Math.random() * jealousyLines.length)]);
                            this.scheduleIdleDialogue();
                            return;
                        }
                    }
                }

                let lines;
                const c = CHARACTER;

                if (g.hunger < 25) {
                    lines = (c.stateDialogue && c.stateDialogue.hungry) || ["I'm getting hungry..."];
                } else if (g.clean < 25) {
                    lines = (c.stateDialogue && c.stateDialogue.dirty) || ["I feel so dirty..."];
                } else if (g.bond < 25) {
                    lines = (c.stateDialogue && c.stateDialogue.neutral) || ["Talk to me... please?"];
                } else if (g.affectionLevel >= 3) {
                    lines = (c.stateDialogue && c.stateDialogue.happy) || ["I'm glad you're here..."];
                } else if (g.timeOfDay && c.timeDialogue && c.timeDialogue[g.timeOfDay]) {
                    lines = c.timeDialogue[g.timeOfDay];
                } else {
                    lines = (c.stateDialogue && c.stateDialogue.neutral) || ["..."];
                }

                // idleDialogue (Jul 2026 audit): a per-character idle pool that
                // was authored for everyone but never read. When needs aren't
                // urgent, mix its flattened lines into the pick for variety.
                if (g.hunger >= 25 && g.clean >= 25 && c.idleDialogue) {
                    var idlePool = Array.isArray(c.idleDialogue) ? c.idleDialogue
                        : [].concat.apply([], Object.keys(c.idleDialogue).map(function (k) { return c.idleDialogue[k]; }).filter(Array.isArray));
                    if (idlePool.length && Math.random() < 0.5) lines = idlePool;
                }

                const line = lines[Math.floor(Math.random() * lines.length)];
                g.typewriter.show(line);

                // Sometimes play ambient sound
                if (Math.random() > 0.6) {
                    sounds.ambientNote();
                }
            }

            this.scheduleIdleDialogue();
        }, delay);
    }

    // ═══════════════════════════════════════════════════════════════
    // FEATURE 11: AMBIENT SOUND LOOP
    // Plays ocean waves and siren hums softly in the background for Lyra.
    // ═══════════════════════════════════════════════════════════════
    _startAmbientLoop() {
        const scheduleNext = () => {
            const delay = 18000 + Math.random() * 14000; // 18–32 s
            this._ambientLoopTimer = setTimeout(() => {
                // Jun 2026 — scene-state gate. The ambient loop self-
                // reschedules forever; without this check, the per-
                // character ambient (fireplaceCrackle for Alistair /
                // Caspian, oceanWave for Lyra, etc.) keeps firing on
                // Companion Chronicle and other screens after the
                // player leaves care. Owner heard fireplace crackle on
                // the Chronicle. Skip the play, but DO reschedule so
                // the loop is ready again when care resumes.
                // Care-view gate (Jun 2026). Must match the BGM guard: skip not
                // only when off-care, but also when a page COVERS care (Main
                // Story / gallery / settings) or a chapter is playing — else the
                // per-character ambient bleeds onto the Main Story etc. (body
                // stays pp-screen-care while #chp-page overlays it). Falls back
                // to the plain body check if the shared helper isn't loaded.
                var _careOK = (typeof window.PPCareView === 'function')
                    ? window.PPCareView()
                    : document.body.classList.contains('pp-screen-care');
                if (!_careOK) {
                    scheduleNext();
                    return;
                }
                if (typeof sounds !== 'undefined' && sounds.enabled && !this._midnightSleeping) {
                    const g = this.game;
                    if (!g.characterLeft) {
                        const isMuted = typeof bgm !== 'undefined' && bgm.muted;
                        if (!isMuted) {
                            const charName = CHARACTER?.name || '';
                            // Character-specific ambient sounds
                            if (charName === 'Lyra') {
                                const isNight = new Date().getHours() < 6 || new Date().getHours() >= 20;
                                if (isNight || (g.affectionLevel || 0) >= 2) {
                                    Math.random() < 0.55 ? sounds.sirenHum() : sounds.oceanWave();
                                } else { sounds.oceanWave(); }
                            } else if (charName === 'Alistair') {
                                sounds.fireplaceCrackle();
                            } else if (charName === 'Caspian') {
                                sounds.fireplaceCrackle();
                            } else if (charName === 'Elian') {
                                sounds.forestCrickets();
                            } else if (charName === 'Lucien') {
                                sounds.ambientNote();
                            } else if (charName === 'Proto') {
                                sounds.digitalStatic();
                            } else if (charName === 'Noir') {
                                sounds.darkDrone();
                            } else {
                                sounds.ambientNote();
                            }
                        }
                    }
                }
                scheduleNext();
            }, delay);
        };
        scheduleNext();
    }

    // ═══════════════════════════════════════════════════════════════
    // FEATURE 12: PUSH NOTIFICATIONS
    // Requests permission once, then schedules a delayed notification
    // whenever the player hides the page.  Cancelled if they return in time.
    // ═══════════════════════════════════════════════════════════════
    _initNotifications() {
        if (typeof Notification === 'undefined') return;

        // Passive: listen for page hide/show to schedule away-notifications
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this._scheduleAwayNotification();
            } else {
                // Player returned — cancel pending notification
                if (this._notifTimer) {
                    clearTimeout(this._notifTimer);
                    this._notifTimer = null;
                }
            }
        });
    }

    _requestNotificationPermission() {
        if (typeof Notification === 'undefined') return;
        if (Notification.permission === 'default') {
            Notification.requestPermission().catch(() => {});
        }
    }

    _scheduleAwayNotification() {
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
        if (this._notifTimer) clearTimeout(this._notifTimer);

        const g = this.game;
        const c = (typeof CHARACTER !== 'undefined' && CHARACTER.name) || 'Your companion';
        const id = g.selectedCharacter || 'alistair';

        // Character-specific notification messages
        const msgs = {
            alistair: {
                hungry: { t: c + ' needs fuel \u2694\uFE0F', b: 'A knight can\'t fight on an empty stomach.' },
                lonely: { t: c + ' kept the post \uD83D\uDEE1\uFE0F', b: 'He\'s been standing watch alone. Waiting.' },
                miss:   { t: c + ' is thinking of you', b: 'He polished the sword again. Third time today.' }
            },
            lyra: {
                hungry: { t: c + ' is getting hungry \uD83C\uDF0A', b: 'Even sirens need to eat...' },
                lonely: { t: c + ' misses you \uD83D\uDC99', b: 'She\'s been staring at the tide alone.' },
                miss:   { t: c + ' is humming softly \uD83C\uDFB5', b: 'She sings better when someone\'s listening.' }
            },
            lucien: {
                hungry: { t: c + ' forgot to eat \uD83D\uDCDA', b: 'The theorem was more urgent. His stomach disagrees.' },
                lonely: { t: c + ' noticed you\'re gone \uD83D\uDD2E', b: 'He filled three journals. None about magic.' },
                miss:   { t: c + ' is recalibrating \u2728', b: 'The equations don\'t balance without you.' }
            },
            caspian: {
                hungry: { t: c + ' skipped dinner \uD83D\uDC51', b: 'The servants set your place. It went cold.' },
                lonely: { t: c + ' is alone in the palace \uD83C\uDFF0', b: 'A hundred rooms and none feel like home.' },
                miss:   { t: c + ' is waiting \uD83C\uDF39', b: 'He reorganized the library. By mood.' }
            },
            elian: {
                hungry: { t: c + ' needs food \uD83C\uDF3F', b: 'The traps were empty this morning.' },
                lonely: { t: c + ' kept the fire lit \uD83D\uDD25', b: 'He almost went looking. Almost.' },
                miss:   { t: c + ' is watching the trail \uD83C\uDF32', b: 'The forest is quieter without you.' }
            },
            proto: {
                hungry: { t: c + ' is low on resources \u26A0\uFE0F', b: 'Hunger stat critical. Manual intervention required.' },
                lonely: { t: c + ' detected your absence \uD83D\uDCE1', b: 'Session idle for too long. He noticed.' },
                miss:   { t: c + ' is monitoring \uD83D\uDCBB', b: 'He\'s been watching the door. The digital one.' }
            },
            noir: {
                hungry: { t: c + ' stirs \uD83C\uDF11', b: 'The darkness doesn\'t need food. But it needs you.' },
                lonely: { t: c + ' whispers your name \uD83D\uDDA4', b: 'Even shadows get lonely.' },
                miss:   { t: c + ' is waiting \uD83C\uDF1A', b: 'The dark is patient. Are you?' }
            }
        };
        const m = msgs[id] || msgs.alistair;

        let delay, title, body;
        if ((g.hunger || 100) < 40) {
            delay = 12 * 60 * 1000;
            title = m.hungry.t; body = m.hungry.b;
        } else if ((g.bond || 100) < 30) {
            delay = 20 * 60 * 1000;
            title = m.lonely.t; body = m.lonely.b;
        } else {
            delay = 2 * 60 * 60 * 1000;
            title = m.miss.t; body = m.miss.b;
        }

        this._notifTimer = setTimeout(() => {
            if (document.hidden && Notification.permission === 'granted') {
                try {
                    new Notification(title, { body, icon: 'assets/icon-192.png', badge: 'assets/icon-192.png', tag: id + '-reminder' });
                } catch (e) {}
            }
        }, delay);
    }




    // Close all slide-up panels to prevent stacking.
    // Pass an optional panel name to exclude from closing (the one about to open).
    closeAllPanels(except) {
        // (dress branch removed May 2026 — outfit system removed)
        if (except !== 'gift')        this.closeGiftPanel();
        if (except !== 'achievement') this.closeAchievementPanel();
        if (except !== 'training')    this.closeTrainingPanel();
    }

    closeTrainingPanel() {
        const panel = document.getElementById('training-panel');
        if (!panel) return;
        clearTimeout(this._trainingCloseTimer);
        panel.classList.remove('visible');
        this._trainingCloseTimer = setTimeout(() => panel.classList.add('hidden'), 320);
    }


    // ===== ACHIEVEMENT PANEL =====

    toggleAchievementPanel() {
        const panel = document.getElementById('achievement-panel');
        if (panel.classList.contains('visible')) {
            this.closeAchievementPanel();
        } else {
            this.openAchievementPanel();
        }
    }

    openAchievementPanel() {
        const panel = document.getElementById('achievement-panel');
        const grid = document.getElementById('achievement-grid');
        const count = document.getElementById('achievement-count');
        const progressFill = document.getElementById('achievement-progress-fill');

        const achievements = this.game.achievementSystem.getAll();
        const stats = this.game.achievementSystem.getStats();

        // Update count
        count.textContent = `${stats.unlocked}/${stats.total}`;

        // Update progress bar
        progressFill.style.width = stats.percent + '%';

        // Build grid
        grid.innerHTML = '';
        achievements.forEach(ach => {
            const card = document.createElement('div');
            card.className = `achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`;

            const showName = ach.unlocked || !ach.secret;
            const showDesc = ach.unlocked || !ach.secret;

            card.innerHTML = `
                <div class="achievement-card-icon">${ach.unlocked ? ach.icon : (ach.secret ? '❓' : ach.icon)}</div>
                <div class="achievement-card-name">${showName ? ach.name : '???'}</div>
                <div class="achievement-card-desc">${showDesc ? ach.description : 'Secret achievement'}</div>
            `;
            grid.appendChild(card);
        });

        // Close other panels first
        this.closeAllPanels('achievement');

        // Show panel
        clearTimeout(this._achievementCloseTimer);
        panel.classList.remove('hidden');
        requestAnimationFrame(() => panel.classList.add('visible'));

        sounds.pop();
    }

    closeAchievementPanel() {
        const panel = document.getElementById('achievement-panel');
        panel.classList.remove('visible');
        clearTimeout(this._achievementCloseTimer);
        this._achievementCloseTimer = setTimeout(() => panel.classList.add('hidden'), 300);
    }

    // ===== GIFT SYSTEM =====

    initGiftPanel() {
        const charId = this.game.selectedCharacter;

        const giftSets = {
            alistair: [
                { id: 'apple', name: 'Apple',       icon: '\uD83C\uDF4E', bond: 5,  hunger: 10, effect: '+Hunger +Bond' },
                { id: 'rose',  name: 'Rose',         icon: '\uD83C\uDF39', bond: 15, affection: 3, effect: '+Bond +Love' },
                { id: 'sword', name: 'Whetstone',    icon: '\uD83E\uDE93', bond: 8,  effect: '+Bond' },
                { id: 'cake',  name: 'Cake',         icon: '\uD83C\uDF70', hunger: 30, bond: 10, effect: '+Hunger +Bond' },
                { id: 'ring',  name: 'Silver Ring',  icon: '\uD83D\uDC8D', bond: 20, affection: 8, effect: '+Bond ++Love' },
                { id: 'book',  name: 'Poetry Book',  icon: '\uD83D\uDCD6', bond: 12, affection: 5, effect: '+Bond +Love' }
            ],
            lyra: [
                { id: 'pearl',    name: 'Pearl',       icon: '\uD83E\uDDAA', bond: 20, affection: 8, effect: '+Bond ++Love' },
                { id: 'shell',    name: 'Seashell',    icon: '\uD83D\uDC1A', bond: 10, hunger: 5, effect: '+Bond +Hunger' },
                { id: 'song',     name: 'Song Sheet',  icon: '\uD83C\uDFB5', bond: 15, affection: 5, effect: '+Bond +Love' },
                { id: 'starfish', name: 'Starfish',    icon: '\u2B50', bond: 8, effect: '+Bond' },
                { id: 'stone',    name: 'Ocean Stone', icon: '\uD83E\uDEA8', bond: 5, clean: 5, effect: '+Bond +Clean' },
                { id: 'coral',    name: 'Coral Piece', icon: '\uD83E\uDEB8', bond: 12, affection: 4, effect: '+Bond +Love' }
            ],
            lucien: [
                { id: 'book',    name: 'Rare Tome',     icon: '\uD83D\uDCD6', bond: 18, affection: 6, effect: '+Bond +Love' },
                { id: 'crystal', name: 'Crystal',        icon: '\uD83D\uDD2E', bond: 15, affection: 5, effect: '+Bond +Love' },
                { id: 'scroll',  name: 'Ancient Scroll', icon: '\uD83D\uDCDC', bond: 12, affection: 4, effect: '+Bond +Love' },
                { id: 'cake',    name: 'Sweet Pastry',   icon: '\uD83C\uDF70', hunger: 25, bond: 8, effect: '+Hunger +Bond' },
                { id: 'ring',    name: 'Arcane Ring',    icon: '\uD83D\uDC8D', bond: 22, affection: 8, effect: '+Bond ++Love' },
                { id: 'pearl',   name: 'Mana Pearl',     icon: '\u2728', bond: 10, clean: 5, effect: '+Bond +Clean' }
            ],
            caspian: [
                { id: 'rose',   name: 'Royal Rose',    icon: '\uD83C\uDF39', bond: 18, affection: 6, effect: '+Bond +Love' },
                { id: 'wine',   name: 'Fine Wine',     icon: '\uD83C\uDF77', bond: 15, affection: 5, effect: '+Bond +Love' },
                { id: 'cake',   name: 'Palace Cake',   icon: '\uD83C\uDF70', hunger: 30, bond: 10, effect: '+Hunger +Bond' },
                { id: 'ring',   name: 'Gold Ring',     icon: '\uD83D\uDC8D', bond: 22, affection: 8, effect: '+Bond ++Love' },
                { id: 'flower', name: 'Garden Lily',   icon: '\uD83C\uDF3A', bond: 12, affection: 4, effect: '+Bond +Love' },
                { id: 'book',   name: 'Poetry',        icon: '\uD83D\uDCDC', bond: 10, affection: 3, effect: '+Bond +Love' }
            ],
            elian: [
                { id: 'herbs',  name: 'Wild Herbs',    icon: '\uD83C\uDF3F', bond: 12, hunger: 10, effect: '+Hunger +Bond' },
                { id: 'stone',  name: 'River Stone',   icon: '\uD83E\uDEA8', bond: 10, affection: 3, effect: '+Bond +Love' },
                { id: 'apple',  name: 'Wild Berries',  icon: '\uD83C\uDF53', hunger: 25, bond: 5, effect: '+Hunger +Bond' },
                { id: 'knife',  name: 'Carved Knife',  icon: '\uD83D\uDD2A', bond: 15, affection: 5, effect: '+Bond +Love' },
                { id: 'flower', name: 'Forest Flower', icon: '\uD83C\uDF3B', bond: 8, affection: 4, effect: '+Bond +Love' },
                { id: 'book',   name: 'Field Guide',   icon: '\uD83D\uDCD7', bond: 10, affection: 3, effect: '+Bond +Love' }
            ],
            proto: [
                { id: 'crystal', name: 'Data Crystal',  icon: '\uD83D\uDD2E', bond: 15, affection: 5, effect: '+Bond +Love' },
                { id: 'book',    name: 'Source Code',    icon: '\uD83D\uDCBB', bond: 18, affection: 6, effect: '+Bond +Love' },
                { id: 'cake',    name: 'Energy Pack',    icon: '\u26A1', hunger: 30, bond: 8, effect: '+Hunger +Bond' },
                { id: 'ring',    name: 'Circuit Ring',   icon: '\uD83D\uDD17', bond: 20, affection: 8, effect: '+Bond ++Love' },
                { id: 'scroll',  name: 'Debug Log',      icon: '\uD83D\uDCDD', bond: 10, affection: 3, effect: '+Bond +Love' },
                { id: 'stone',   name: 'Memory Chip',    icon: '\uD83D\uDCBE', bond: 12, affection: 4, effect: '+Bond +Love' }
            ],
            noir: [
                { id: 'rose',    name: 'Black Rose',    icon: '\uD83C\uDF39', bond: 18, affection: 6, effect: '+Bond +Love' },
                { id: 'ring',    name: 'Shadow Ring',    icon: '\uD83D\uDC8D', bond: 22, affection: 8, effect: '+Bond ++Love' },
                { id: 'crystal', name: 'Dark Crystal',   icon: '\uD83D\uDD2E', bond: 15, affection: 5, effect: '+Bond +Love' },
                { id: 'wine',    name: 'Midnight Wine',  icon: '\uD83C\uDF77', bond: 12, hunger: 10, effect: '+Hunger +Bond' },
                { id: 'book',    name: 'Forbidden Text', icon: '\uD83D\uDCD5', bond: 15, affection: 5, effect: '+Bond +Love' },
                { id: 'stone',   name: 'Void Stone',     icon: '\uD83C\uDF11', bond: 10, affection: 4, effect: '+Bond +Love' }
            ]
        };

        const gifts = giftSets[charId] || giftSets.alistair;

        const grid = document.getElementById('gift-grid');
        grid.innerHTML = '';

        // Heart Threads spend side (increment 2): show a cost per gift + dim
        // what the player can't afford yet. Free + unchanged when the economy
        // is off (no PPCurrency / main story disabled).
        const _econOn = (function () { try { return localStorage.getItem('pp_main_story_enabled') === '1' && !!window.PPCurrency; } catch (_) { return false; } })();
        gifts.forEach(gift => {
            const item = document.createElement('div');
            item.className = 'gift-item';
            const cost = _econOn ? window.PPCurrency.giftCost(gift) : 0;
            if (_econOn && !window.PPCurrency.canAfford(cost)) item.classList.add('gift-unaffordable');
            item.innerHTML = `
                <span class="gift-icon">${gift.icon}</span>
                <span class="gift-name">${gift.name}</span>
                <span class="gift-effect">${gift.effect}</span>
                ${_econOn ? `<span class="gift-cost">${window.PPCurrency.icon} ${cost}</span>` : ''}
            `;
            item.addEventListener('click', () => this.giveGift(gift));
            grid.appendChild(item);
        });

        // Wallet balance in the gift-panel header (tap → Bonds & Rewards).
        if (_econOn) {
            try {
                const hdr = document.getElementById('gift-panel-header');
                if (hdr) {
                    let bal = document.getElementById('gift-balance');
                    if (!bal) {
                        bal = document.createElement('span');
                        bal.id = 'gift-balance';
                        bal.title = 'Open Bonds & Rewards';
                        bal.addEventListener('click', (e) => { e.stopPropagation(); try { window.PPCurrency.open(); } catch (_) {} });
                        const closeBtn = document.getElementById('gift-close');
                        if (closeBtn) hdr.insertBefore(bal, closeBtn); else hdr.appendChild(bal);
                    }
                    bal.innerHTML = window.PPCurrency.icon + ' <span>' + window.PPCurrency.get() + '</span>';
                }
            } catch (_) {}
        }

        this.gifts = gifts;
    }

    giveGift(gift) {
        const g = this.game;
        if (g.characterLeft) return;

        // Heart Threads cost (spend side, increment 2). Only enforced when the
        // economy is enabled; otherwise gifts stay free (backward compatible).
        const _econOn = (function () { try { return localStorage.getItem('pp_main_story_enabled') === '1' && !!window.PPCurrency; } catch (_) { return false; } })();
        if (_econOn) {
            const _cost = window.PPCurrency.giftCost(gift);
            if (!window.PPCurrency.canAfford(_cost)) {
                this.showNotification('Not enough ' + window.PPCurrency.name + ', care daily to earn more');
                try { (sounds.blip ? sounds.blip() : sounds.chime()); } catch (_) {}
                try {
                    const _gi = [...document.querySelectorAll('#gift-grid .gift-item')]
                        .find(el => el.querySelector('.gift-name') && el.querySelector('.gift-name').textContent === gift.name);
                    if (_gi) { _gi.classList.remove('ht-shake'); void _gi.offsetWidth; _gi.classList.add('ht-shake'); }
                } catch (_) {}
                return; // do NOT apply or close the panel — let them pick a cheaper gift
            }
            window.PPCurrency.spend(_cost);
        }

        // Track gift memory — character remembers what you gave them
        if (!g._giftMemory) g._giftMemory = {};
        g._giftMemory[gift.id] = (g._giftMemory[gift.id] || 0) + 1;
        g._lastGiftId = gift.id;
        g._lastGiftName = gift.name;

        // Apply gift effects
        if (gift.hunger)    g.hunger    = Math.min(100, g.hunger    + gift.hunger);
        if (gift.bond)      g.bond      = Math.min(100, g.bond      + gift.bond);
        // Jul 2026 playtest fix — EVERY gift warms affection a little (+2
        // base, plus the item's own affection stat). Previously a practical
        // gift (Apple, Whetstone) moved NO affection at all, so the player's
        // first gift read as a dead tap on the meter the whole game is
        // about. _gainAffection also floats "+n ♥" over the character.
        if (typeof g._gainAffection === 'function') g._gainAffection(2 + (gift.affection || 0));
        else if (gift.affection) g.affection = Math.min(100, g.affection + gift.affection);
        if (gift.clean)     g.clean     = Math.min(100, g.clean     + gift.clean);
        g.corruption = Math.max(0, g.corruption - 3);

        g.timesGifted++;
        g.careScore += 3;
        g.lastInteractionTime = Date.now();
        g.lastAction = 'gift';
        g._recordAction('gift');
        g.recentNeglect = false;
        g.neglectLevel = Math.max(0, g.neglectLevel - 0.5);

        // Emotional engine updates
        const _gp = CHARACTER.emotionalProfile || { attachmentSpeed: 0.6, intensity: 0.7 };
        const gTrust = CHARACTER.name === "Lyra" ? 1.2 : 0.6;
        const gObs   = CHARACTER.name === "Lyra" ? 1.8 : 0.8;
        g.emotion.trust     += gTrust * _gp.attachmentSpeed;
        g.emotion.obsession += gObs   * _gp.intensity;
        g.emotion.fear       = Math.max(0, g.emotion.fear - 2);

        g.sessionGift++;
        g.playerProfile.care++;
        g.dayInteractions++;
        g.playerInfluence = Math.min(100, g.playerInfluence + 7);
        g.lyraMemory.playerWasKind = true;
        if (g.endingPlayed === 'corrupted') g.redemption = Math.min(100, g.redemption + 3);

        g.updatePersonality();

        // Special dialogue — use character data if available, then built-in fallbacks
        const charDialogue = CHARACTER.giftDialogue && CHARACTER.giftDialogue[gift.id];

        const alistairDialogues = {
            apple: [
                "Rations on patrol are worse than this. Far worse. *He eats it in three bites.* Thank you.",
                "Practical. You thought about whether I had eaten. People usually do not. I noticed that you did.",
                "An apple. I will not make a speech about an apple. *Pause.* But I will remember you brought it."
            ],
            rose: [
                "A rose. *He holds it like it might give an order he has to obey.* I do not own a vase. I will find one.",
                "Knights are handed medals, not flowers. I find I prefer the flower. Do not repeat that.",
                "*Looks at it, then at you, then away.* I will press it in the watch-log. Where I will see it."
            ],
            sword: [
                "A whetstone. *His whole posture eases.* This is the kindest thing anyone has handed me in years. You understand the work.",
                "A blade goes dull and a man stops noticing. You noticed for me. That is what this is.",
                "Good stone. I will keep an edge through the night watch with it. And think of who gave it. Every time."
            ],
            cake: [
                "This is too much. *He eats it anyway.* It is very good. I am a simple man with one weakness, it seems.",
                "We did not have cake at the wall. I am a grown man and I think this is my first. Do not laugh.",
                "You went to trouble. For me. I am still learning what to do when someone does that. Thank you."
            ],
            ring: [
                "*He goes very still.* I know what a ring means. I will not pretend I do not. Ask me the question and I will answer it.",
                "I have sworn one oath in my life, to the realm. *He closes his hand around it.* I am prepared to swear a second.",
                "I will wear it on my sword hand. So it is the last thing between you and any harm that comes."
            ],
            book: [
                "Poetry. *He turns it over carefully.* I read slowly. I will read every line. That is a promise, not a courtesy.",
                "You think I am the sort of man who reads poetry. *Quiet.* You are right. I simply never tell anyone.",
                "I will read this on the night watch, when it is quiet enough to hear the words. Thank you for knowing I would."
            ]
        };

        const lyraDialogues = {
            pearl:    ["You found a pearl... for me? The sea only gives these when it means it.", "I've dived for pearls my whole life. I never expected to receive one."],
            shell:    ["A shell... I can hear the ocean in this one. Did you know that?", "Hold it to your ear. You'll hear home."],
            song:     ["A song sheet? You thought I'd want this... you're right.", "New music. I'll learn it tonight. For you."],
            starfish: ["A starfish! They always find their way back. I like that about them.", "I'll keep it near the water. Where it's safe."],
            stone:    ["It's smooth from the tide. You held this... and thought of me.", "Ocean stones carry memories. This one's yours now."],
            coral:    ["Coral from the deep... you went far for this.", "I have a piece like this. From before. I'll keep yours next to it."]
        };

        const fallbackDialogues  = g.selectedCharacter === 'lyra' ? lyraDialogues : alistairDialogues;
        const lines              = charDialogue || fallbackDialogues[gift.id] || ["Thank you."];
        const _gpLine            = lines[Math.floor(Math.random() * lines.length)];
        const _gpEmotion         = (gift.affection && gift.affection >= 5) ? "love" : "happy";
        const _gpEmotState       = g.getEmotionalState();

        this.showNotification(`+${gift.name}`);
        this.preReact(
            { emotionalState: _gpEmotState, action: 'gift', reactionType: _gpEmotion },
            () => {
                g.typewriter.show(_gpLine);
                this.flashEmotion(_gpEmotion, _gpEmotion === 'love' ? 3000 : 2500);
                if (_gpEmotion === 'love') sounds.fanfare(); else sounds.chime();
                this.bounceCharacter();
            }
        );
        this.closeGiftPanel();
        g.save();
    }

    toggleGiftPanel() {
        if (this.giftPanel.classList.contains('visible')) {
            this.closeGiftPanel();
        } else {
            this.closeAllPanels('gift');
            clearTimeout(this._giftCloseTimer);
            this.initGiftPanel(); // rebuild grid w/ current Heart Threads balance + affordability
            this.giftPanel.classList.remove('hidden');
            requestAnimationFrame(() => this.giftPanel.classList.add('visible'));
        }
    }

    closeGiftPanel() {
        this.giftPanel.classList.remove('visible');
        clearTimeout(this._giftCloseTimer);
        this._giftCloseTimer = setTimeout(() => this.giftPanel.classList.add('hidden'), 300);
    }

    // ===== STORY SCENES =====

    showStoryScene(dialogue, emotion) {
        // {name} substitution — milestone-event lines (character.js
        // milestoneEvents, e.g. deepFeeling) embed {name} tokens. Swap in the
        // player's chosen name before typing it out. PPApplyName (dialogue.js)
        // is a no-op when there's no token or no stored name.
        dialogue = (dialogue && window.PPApplyName) ? window.PPApplyName(dialogue) : (dialogue || '');
        const faces = CHARACTER.faceSprites[emotion || 'love'];
        const fallback = CHARACTER.faceSprites.neutral ? CHARACTER.faceSprites.neutral[0] : 'assets/alistair/face/neutral.png';
        const src = faces ? faces[Math.floor(Math.random() * faces.length)] : fallback;

        this.storyPortrait.style.backgroundImage = `url('${src}')`;
        this.storyDialogue.textContent = '';

        // Update character name in story overlay
        const nameEl = document.getElementById('story-name');
        if (nameEl) nameEl.textContent = CHARACTER.name;

        this.storyOverlay.classList.remove('hidden');
        requestAnimationFrame(() => this.storyOverlay.classList.add('visible'));

        sounds.fanfare();

        // Cancel any in-flight typewriter from a PREVIOUS milestone scene.
        // The generation token lives on the SHARED #story-dialogue ELEMENT, not
        // on `this` — so a scene shown from ANY game/ui instance cancels an older
        // typewriter still running on the same element. A per-instance token
        // failed when TWO instances wrote into #story-dialogue at once (e.g. a
        // lingering pre-navigation game whose 1500ms level-up timer still fires,
        // plus the fresh instance): each had its own `this._storyTypeGen`, so
        // neither stopped the other and every character got typed twice ("I trust
        // you" → "II ttrruusstt yyoouu"). Element-scoped token = one writer wins.
        const _el = this.storyDialogue;
        const _gen = (_el._ppStoryTypeGen = (_el._ppStoryTypeGen || 0) + 1);

        // Typewrite the story dialogue
        let i = 0;
        const typeStory = () => {
            if (_gen !== _el._ppStoryTypeGen) return; // a newer scene took over — stop
            if (i < dialogue.length) {
                _el.textContent += dialogue[i];
                i++;
                // if (i % 2 === 0) sounds.blip();
                setTimeout(typeStory, 40);
            }
        };
        setTimeout(typeStory, 500);
    }

    closeStoryScene() {
        this.storyOverlay.classList.remove('visible');
        setTimeout(() => this.storyOverlay.classList.add('hidden'), 500);
    }

    // ===== CORE UI UPDATES =====

    updateAll() {
        this.updateStats();
        this.updateEmotion();
        this.updateCorruption();
        this.updateFadingMeter();
        this.updateSirenStage();
        this.applyTensionStage(this.game.tensionStage || 0);
        this.updateAffection();
        this.updatePersonalityBadge();
        // Check midnight sleep on first full update
        this._checkMidnightSleep();
        this._checkReturnSleepPose();
    }

    updateStats() {
        const g = this.game;
        const prevH = parseFloat(this.hungerBar.style.width) || 0;
        const prevC = parseFloat(this.cleanBar.style.width) || 0;
        const prevB = parseFloat(this.bondBar.style.width) || 0;

        this.hungerBar.style.width = g.hunger + '%';
        this.cleanBar.style.width = g.clean + '%';
        this.bondBar.style.width = g.bond + '%';

        // Visual polish: write integer values into the .stat-value spans so
        // the player has a concrete number alongside each bar. (Audit: bars
        // alone don't tell you the difference between 30 and 50 at a glance.)
        // Cached element refs so we don't query every tick.
        if (!this._hungerValEl) this._hungerValEl = document.getElementById('hunger-value');
        if (!this._cleanValEl)  this._cleanValEl  = document.getElementById('clean-value');
        if (!this._bondValEl)   this._bondValEl   = document.getElementById('bond-value');
        if (this._hungerValEl) this._hungerValEl.textContent = ' ' + Math.round(g.hunger);
        if (this._cleanValEl)  this._cleanValEl.textContent  = ' ' + Math.round(g.clean);
        if (this._bondValEl)   this._bondValEl.textContent   = ' ' + Math.round(g.bond);

        // Brief glow + icon bounce when stat increases significantly
        if (g.hunger - prevH > 3) {
            this.hungerBar.classList.add('stat-changed'); setTimeout(() => this.hungerBar.classList.remove('stat-changed'), 600);
            var hi = this.hungerBar.closest('.stat')?.querySelector('.stat-icon');
            if (hi) { hi.classList.add('stat-icon-bounce'); setTimeout(() => hi.classList.remove('stat-icon-bounce'), 400); }
        }
        if (g.clean - prevC > 3) {
            this.cleanBar.classList.add('stat-changed'); setTimeout(() => this.cleanBar.classList.remove('stat-changed'), 600);
            var ci = this.cleanBar.closest('.stat')?.querySelector('.stat-icon');
            if (ci) { ci.classList.add('stat-icon-bounce'); setTimeout(() => ci.classList.remove('stat-icon-bounce'), 400); }
        }
        if (g.bond - prevB > 3) {
            this.bondBar.classList.add('stat-changed'); setTimeout(() => this.bondBar.classList.remove('stat-changed'), 600);
            var bi = this.bondBar.closest('.stat')?.querySelector('.stat-icon');
            if (bi) { bi.classList.add('stat-icon-bounce'); setTimeout(() => bi.classList.remove('stat-icon-bounce'), 400); }
        }

        // Pulse when critical
        this.hungerBar.classList.toggle('critical', g.hunger < 20);
        this.cleanBar.classList.toggle('critical', g.clean < 20);
        this.bondBar.classList.toggle('critical', g.bond < 20);

        // ── TIER-LABEL REFRESH (May 2026 audit) ──────────────────────────
        // Owner reported topbar still said "STRANGER → ACQUAINTED" even
        // after affectionLevel had progressed to 2. updateAffection() was
        // only called from updateAll() on certain events, so programmatic
        // state changes (dev panel, save load mid-progress) didn't refresh
        // the tier label until the next player action triggered updateAll.
        // Now: call updateAffection on every stats tick. Cheap.
        try { this.updateAffection(); } catch (_) {}

        // ── HOME-SCREEN MINIMALISM (May 2026, revised) ───────────────────
        // EARLIER ATTEMPT: hid the entire stats bar when all stats > 75 to
        // give the character more screen space (L&D pattern). Owner pushed
        // back: "where is it all the bar?" — they need to SEE stats at a
        // glance, even when high. So instead of hiding, we just keep the
        // bar visually compact (CSS handles the visual minimisation). The
        // bar stays visible as decoration when healthy, expands to its
        // full visual treatment when something is below 60.
        //
        // Hysteresis: compact above 75, expanded below 60. Prevents flicker.
        if (!this._statsBar) this._statsBar = document.getElementById('stats-bar');
        if (this._statsBar) {
            const minStat = Math.min(g.hunger, g.clean, g.bond);
            const wasCompact = this._statsBar.classList.contains('stats-compact');
            let nextCompact = wasCompact;
            if (!wasCompact && minStat > 75) nextCompact = true;
            else if (wasCompact && minStat < 60) nextCompact = false;
            if (nextCompact !== wasCompact) {
                this._statsBar.classList.toggle('stats-compact', nextCompact);
            }
        }

        // Mood vignette
        const anyLow = g.hunger < 20 || g.clean < 20 || g.bond < 15;
        const inLove = g.affectionLevel >= 3 && g.bond > 70;
        this.container.classList.toggle('low-stats', anyLow);
        this.container.classList.toggle('high-love', inLove && !anyLow);

        // Character glow when in love — skip during training sequences
        if (!this._seqActive) {
            const bodyImg = document.getElementById('character-body-img');
            if (bodyImg) bodyImg.classList.toggle('in-love', inLove);
        }

        // Lyra hunger pose — update every stat tick
        if (typeof CHARACTER !== 'undefined' && CHARACTER.name === 'Lyra' && !this._flashActive && !this._seqActive) {
            this._updateLyraHungerPose(this.game);
        }
        // Alistair hunger pose — show hungry1/2 when hunger is low
        if (typeof CHARACTER !== 'undefined' && CHARACTER.name === 'Alistair' && !this._flashActive && !this._seqActive) {
            this._updateAlistairHungerPose(this.game);
        }
    }

    _updateAlistairHungerPose(g) {
        const bodyImg = document.getElementById('character-body-img');
        if (!bodyImg) return;
        const curSrc = bodyImg.src || '';
        const isHungry = curSrc.includes('hungry');
        if (g.hunger < 35) {
            if (!isHungry) {
                const key = Math.random() < 0.5 ? 'hungry1' : 'hungry2';
                const src = CHARACTER.bodySprites && CHARACTER.bodySprites[key];
                if (src) bodyImg.src = src;
            }
        } else if (isHungry) {
            // Hunger recovered — restore via emotion system
            this.setCharacterSprite(this._lastEmotion || 'neutral');
        }
    }

    updateEmotion() {
        // Don't override during a flash or training sequence
        if (this._flashActive) return;
        if (this._seqActive) return;

        const g = this.game;
        let emotion;

        if (g.characterLeft) {
            emotion = "left";
        } else if (g.corruptionState === 'corrupted') {
            emotion = "corrupted";
        } else if (g.bond < 10) {
            // Only bond critically low triggers crying/depressed face+body.
            // Hunger/clean have their own body-only pose system (_updateLyraHungerPose/_updateLyraDirtyPose)
            emotion = "crying";
        } else if (g.bond < 25) {
            // Bond low but not critical — sad face, but body handled by hunger/dirty system
            emotion = "sad";
        } else if (g.timeOfDay === 'night' && g.bond > 40) {
            // At night, keep normal emotion — blink system handles sleepy look
            emotion = this._lastEmotion || "neutral";
        } else if (g.bond > 80 && g.affectionLevel >= 3) {
            emotion = "love";
        } else if (g.bond > 65) {
            emotion = "happy";
        } else {
            emotion = "neutral";
        }

        // Skip the emotion-based sprite swap while an action flash is active
        // (feed/wash/gift/train/talk). Those flashes set action-specific
        // sprites (eating1-5, splash1-3, etc.) that must not be overridden
        // by the generic emotionToBody map until the flash timer expires.
        if (emotion !== this._lastEmotion && !this._flashActive) {
            this._lastEmotion = emotion;
            this.setCharacterSprite(emotion);
        } else if (emotion !== this._lastEmotion) {
            // Record the new emotion so the next non-flash tick picks it up
            this._lastEmotion = emotion;
        }

        // Lyra hunger + dirty body override — swap body pose only, keep face emotion
        // (_flashActive and _seqActive already checked at top of this function)
        if (CHARACTER.name === 'Lyra') {
            this._updateLyraHungerPose(g);
            // Feature 10: late-night sleepy pose (probabilistic, doesn't block other systems)
            if (!this._midnightSleeping) this._checkNightPose();
        }
    }

    _updateLyraHungerPose(g) {
        const bodyImg = document.getElementById('character-body-img');
        if (!bodyImg) return;

        const curSrc     = bodyImg.src;
        const isHungry   = curSrc.includes('hungry') && !curSrc.includes('starving');
        const isStarving = curSrc.includes('starving');

        if (g.hunger < 35) {
            if (!isStarving) {
                const key = Math.random() < 0.5 ? 'starving1' : 'starving2';
                const src = CHARACTER.bodySprites && CHARACTER.bodySprites[key];
                if (src) bodyImg.src = src;
            }
            return; // hunger pose active — skip dirty check
        } else if (g.hunger < 65) {
            if (!isHungry) {
                const key = Math.random() < 0.5 ? 'hungry1' : 'hungry2';
                const src = CHARACTER.bodySprites && CHARACTER.bodySprites[key];
                if (src) bodyImg.src = src;
            }
            return; // hunger pose active — skip dirty check
        } else if (isHungry || isStarving) {
            // Hunger recovered — restore before dirty check runs
            this.setCharacterSprite(this._lastEmotion || 'neutral');
        }

        // Hunger is fine — let dirty system take over if needed
        this._updateLyraDirtyPose(g);
    }

    _updateLyraDirtyPose(g) {
        const bodyImg = document.getElementById('character-body-img');
        if (!bodyImg) return;

        const curSrc      = bodyImg.src;
        const isVeryDirty = curSrc.includes('verydirty');
        const isDirty     = curSrc.includes('dirty') && !curSrc.includes('verydirty');

        if (g.clean < 10) {
            if (!isVeryDirty) {
                const key = Math.random() < 0.5 ? 'verydirty1' : 'verydirty2';
                const src = CHARACTER.bodySprites && CHARACTER.bodySprites[key];
                if (src) bodyImg.src = src;
            }
            return; // dirty pose active — skip corruption check
        } else if (g.clean < 40) {
            if (!isDirty) {
                const key = Math.random() < 0.5 ? 'dirty1' : 'dirty2';
                const src = CHARACTER.bodySprites && CHARACTER.bodySprites[key];
                if (src) bodyImg.src = src;
            }
            return; // dirty pose active — skip corruption check
        } else if (isDirty || isVeryDirty) {
            // Clean recovered — restore normal emotion-based pose
            this.setCharacterSprite(this._lastEmotion || 'neutral');
        }

        // Feature 9: corruption stage poses when hunger + clean are okay
        this._updateLyraCorruptPose(g);
    }

    // ═══════════════════════════════════════════════════════════════
    // CORRUPTION POSE SYSTEM  (Feature 9)
    // Shows gradual visual degradation before full corruption state.
    // corrupt1 > 33%,  corrupt2 > 66%,  corrupt3 > 85%
    // Only runs when hunger and clean are fine (dirty/hunger poses take priority).
    // Does NOT override the full corruptionState === 'corrupted' emotion path.
    // ═══════════════════════════════════════════════════════════════
    _updateLyraCorruptPose(g) {
        // Full corruption handled by the emotion system — don't double-override
        if (g.corruptionState === 'corrupted') return;

        const bodyImg = document.getElementById('character-body-img');
        if (!bodyImg) return;

        const sprites = CHARACTER.bodySprites;
        if (!sprites) return;

        const cor = g.corruption || 0;
        let targetKey = null;

        if      (cor > 85) targetKey = 'corrupt3';
        else if (cor > 66) targetKey = 'corrupt2';
        else if (cor > 33) targetKey = 'corrupt1';

        const curSrc = bodyImg.src;
        const hasCorruptPose = curSrc.includes('corrupt1') || curSrc.includes('corrupt2') || curSrc.includes('corrupt3');

        if (targetKey) {
            // Only swap if we're not already showing this exact corruption stage
            if (!curSrc.includes(targetKey)) {
                const src = sprites[targetKey];
                if (src) bodyImg.src = src;
            }
        } else if (hasCorruptPose) {
            // Corruption fell below 33% — restore normal pose
            this.setCharacterSprite(this._lastEmotion || 'neutral');
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // MIDNIGHT SLEEP SYSTEM  (Feature 3)
    // Lyra hides in her cave 12am–5am. ZZZ overlay, tap to peek.
    // ═══════════════════════════════════════════════════════════════
    _checkMidnightSleep() {
        if (typeof CHARACTER === 'undefined' || CHARACTER.name !== 'Lyra') return;
        const hour = new Date().getHours();
        const isSleepHour = (hour >= 0 && hour < 5);
        if (isSleepHour && !this._midnightSleeping) {
            this._enterMidnightSleep();
        } else if (!isSleepHour && this._midnightSleeping) {
            this._exitMidnightSleep();
        }
    }

    _enterMidnightSleep() {
        if (this._midnightSleeping) return;
        this._midnightSleeping = true;
        const bodyImg = document.getElementById('character-body-img');
        const sprites = CHARACTER.bodySprites;
        if (bodyImg && sprites) {
            const key = Math.random() < 0.5 ? 'sleepy1' : 'sleepy2';
            if (sprites[key]) bodyImg.src = sprites[key];
        }
        // Show ZZZ overlay
        const zzz = document.getElementById('zzz-overlay');
        if (zzz) zzz.classList.add('visible');
        // Show cave text
        if (this.game && this.game.typewriter) {
            this.game.typewriter.show("*Curls up in the cave… sleeping*");
        }
        // Tap to peek handler
        this._sleepTapHandler = () => this._midnightPeek();
        const area = document.getElementById('character-area');
        if (area) area.addEventListener('click', this._sleepTapHandler);
    }

    _exitMidnightSleep() {
        this._midnightSleeping = false;
        const zzz = document.getElementById('zzz-overlay');
        if (zzz) zzz.classList.remove('visible');
        const area = document.getElementById('character-area');
        if (area && this._sleepTapHandler) {
            area.removeEventListener('click', this._sleepTapHandler);
            this._sleepTapHandler = null;
        }
        if (this.game && this.game.typewriter) {
            this.game.typewriter.show("*Yawns and stretches… good morning*");
        }
        this.updateEmotion();
    }

    _midnightPeek() {
        if (!this._midnightSleeping) return;
        if (this._peekTimeout) return; // debounce
        const bodyImg = document.getElementById('character-body-img');
        const sprites = CHARACTER.bodySprites;
        if (bodyImg && sprites) {
            const key = Math.random() < 0.5 ? 'yawn1' : 'yawn2';
            if (sprites[key]) bodyImg.src = sprites[key];
        }
        const zzz = document.getElementById('zzz-overlay');
        if (zzz) zzz.classList.remove('visible');
        if (this.game && this.game.typewriter) {
            this.game.typewriter.show("…mm? …go away… sleeping…");
        }
        // Fade back to sleep after 3s
        this._peekTimeout = setTimeout(() => {
            this._peekTimeout = null;
            if (!this._midnightSleeping) return;
            const bk = Math.random() < 0.5 ? 'sleepy1' : 'sleepy2';
            if (bodyImg && sprites && sprites[bk]) bodyImg.src = sprites[bk];
            if (zzz) zzz.classList.add('visible');
        }, 3000);
    }

    // ═══════════════════════════════════════════════════════════════
    // RETURN SLEEP POSE  (Feature 5)
    // If player was away ≥4 hours, Lyra greets them sleepy.
    // ═══════════════════════════════════════════════════════════════
    _checkReturnSleepPose() {
        if (typeof CHARACTER === 'undefined' || CHARACTER.name !== 'Lyra') return;
        if (this._returnSleepShown) return;
        this._returnSleepShown = true;
        const away = Date.now() - (this.game.lastInteractionTime || Date.now());
        if (away < 4 * 3600 * 1000) return; // < 4 hours, skip
        const sprites = CHARACTER.bodySprites;
        const bodyImg = document.getElementById('character-body-img');
        if (!bodyImg || !sprites) return;
        const key = Math.random() < 0.5 ? 'sleepy1' : 'sleepy2';
        if (sprites[key]) bodyImg.src = sprites[key];
        // Restore after 5 seconds
        setTimeout(() => {
            if (!this._seqActive && !this._flashActive) this.updateEmotion();
        }, 5000);
    }

    // ═══════════════════════════════════════════════════════════════
    // IDLE BORED / YAWN POSE  (Feature 6)
    // After 30s of no interaction, Lyra yawns or looks bored.
    // ═══════════════════════════════════════════════════════════════
    _startIdlePoseTimer() {
        if (this._idlePoseTimer) clearTimeout(this._idlePoseTimer);
        this._idlePoseTimer = setTimeout(() => this._doIdlePose(), 30000);
    }

    _resetIdlePoseTimer() {
        if (this._idlePoseTimer) clearTimeout(this._idlePoseTimer);
        this._idlePoseTimer = null;
        this._startIdlePoseTimer();
    }

    _doIdlePose() {
        if (this._seqActive || this._flashActive || this._midnightSleeping) {
            this._startIdlePoseTimer(); return;
        }
        if (typeof CHARACTER === 'undefined' || CHARACTER.name !== 'Lyra') {
            this._startIdlePoseTimer(); return;
        }
        const sprites = CHARACTER.bodySprites;
        const bodyImg = document.getElementById('character-body-img');
        if (!bodyImg || !sprites) { this._startIdlePoseTimer(); return; }

        const pool = ['yawn1','yawn2','bored1','bored2'].filter(k => sprites[k]);
        if (!pool.length) { this._startIdlePoseTimer(); return; }
        const key = pool[Math.floor(Math.random() * pool.length)];
        bodyImg.src = sprites[key];

        // Restore after 3s
        setTimeout(() => {
            if (!this._seqActive && !this._flashActive && !this._midnightSleeping) {
                this.updateEmotion();
            }
            this._startIdlePoseTimer();
        }, 3000);
    }

    // ═══════════════════════════════════════════════════════════════
    // DAY/NIGHT BODY POSES  (Feature 10)
    // Late night (10pm–5am): occasional sleepy/yawn body pose.
    // Called from updateEmotion chain, runs probabilistically.
    // ═══════════════════════════════════════════════════════════════
    _checkNightPose() {
        if (typeof CHARACTER === 'undefined' || CHARACTER.name !== 'Lyra') return false;
        const hour = new Date().getHours();
        const isLateNight = (hour >= 22 || hour < 5);
        if (!isLateNight) return false;
        if (this._midnightSleeping) return false;
        if (Math.random() > 0.15) return false; // 15% chance per emotion tick
        const sprites = CHARACTER.bodySprites;
        const bodyImg = document.getElementById('character-body-img');
        if (!bodyImg || !sprites) return false;
        const pool = ['yawn1','yawn2','sleepy1','sleepy2'].filter(k => sprites[k]);
        if (!pool.length) return false;
        const key = pool[Math.floor(Math.random() * pool.length)];
        bodyImg.src = sprites[key];
        setTimeout(() => {
            if (!this._seqActive && !this._flashActive && !this._midnightSleeping) {
                this.updateEmotion();
            }
        }, 2500);
        return true;
    }

    setCharacterSprite(emotion, action) {
        // Update pixel face portrait
        const faces = CHARACTER.faceSprites[emotion];
        if (faces && faces.length > 0) {
            const faceSrc = faces[Math.floor(Math.random() * faces.length)];
            // Aug 2026 — same missing-art fallback as the body sprite: some
            // characters ship 1×1 placeholder faces; swap to the select
            // portrait so the dialogue avatar isn't a blank square.
            var _fid = (faceSrc.match(/assets\/([^/]+)\//) || [])[1] || null;
            var _faceFallback = _fid ? ('assets/' + _fid + '/select-portrait.png') : null;
            var faceFallbackOnLoad = function () {
                if (this.naturalWidth <= 1 && _faceFallback &&
                    this.getAttribute('data-art-fellback') !== '1') {
                    this.setAttribute('data-art-fellback', '1');
                    this.src = _faceFallback;
                }
            };
            var faceFallbackOnError = function () {
                if (_faceFallback && this.getAttribute('data-art-fellback') !== '1') {
                    this.setAttribute('data-art-fellback', '1');
                    this.src = _faceFallback;
                }
            };
            const faceImg = document.getElementById('character-face-img');
            // Guard: only swap src when it actually changed. Prevents ERR_ABORTED
            // spam from the browser aborting in-flight fetches on rapid re-sets.
            if (faceImg && faceImg.getAttribute('src') !== faceSrc) {
                faceImg.removeAttribute('data-art-fellback');
                faceImg.onload = faceFallbackOnLoad;
                faceImg.onerror = faceFallbackOnError;
                faceImg.src = faceSrc;
            }
            // Sync dialogue face portrait
            const dlgFace = document.getElementById('dialogue-face-img');
            if (dlgFace && dlgFace.getAttribute('src') !== faceSrc) {
                dlgFace.removeAttribute('data-art-fellback');
                dlgFace.onload = faceFallbackOnLoad;
                dlgFace.onerror = faceFallbackOnError;
                dlgFace.src = faceSrc;
            }
        }

        // Update full body pose — action-specific pose takes priority
        let bodyMapping;
        if (action && CHARACTER.actionToBody && CHARACTER.actionToBody[action]) {
            bodyMapping = CHARACTER.actionToBody[action];
        } else {
            bodyMapping = CHARACTER.emotionToBody[emotion] || "neutral";
        }

        // Handle arrays (random pick) or single string
        let bodyKey;
        if (Array.isArray(bodyMapping)) {
            bodyKey = bodyMapping[Math.floor(Math.random() * bodyMapping.length)];
        } else {
            bodyKey = bodyMapping;
        }

        // ── Intimacy gate: shy/vulnerable/shirtless poses require deep relationship ──
        const intimatePoses = ['shy1','shy2','shy3','vulnerable','shirtless','shirtless1','shirtless2','shirtless3',
            'shy','tender','kiss1','kiss2','kiss3','falllove2','falllove3','shyhug1','shyhug2'];
        if (intimatePoses.includes(bodyKey)) {
            const affLevel = this.game?.affectionLevel || 0;
            if (affLevel < 4) {
                // Not deep enough — fall back to neutral/gentle
                bodyKey = Array.isArray(bodyMapping)
                    ? (bodyMapping.find(function(k) { return !intimatePoses.includes(k); }) || 'neutral')
                    : 'neutral';
            }
        }

        // Don't override body sprite during a training sequence
        if (!this._seqActive) {
            const bodySrc = CHARACTER.bodySprites[bodyKey];
            if (bodySrc) {
                const bodyImg = document.getElementById('character-body-img');
                // Guard: only swap src when it actually changed (prevents ERR_ABORTED spam).
                if (bodyImg && bodyImg.getAttribute('src') !== bodySrc) {
                    // Aug 2026 — graceful fallback for MISSING care art. Some
                    // characters ship placeholder 1×1 body poses (Elian, Noir,
                    // Proto today); without this the care screen renders a
                    // blank character. Derive the character's select-portrait
                    // from the pose path and swap to it if the pose loads as a
                    // 1×1 stub (or fails). Clears the one-shot flag on every
                    // real pose change so a later valid pose still shows.
                    var _charId = (bodySrc.match(/assets\/([^/]+)\//) || [])[1] || null;
                    var _fallbackSrc = _charId ? ('assets/' + _charId + '/select-portrait.png') : null;
                    bodyImg.removeAttribute('data-art-fellback');
                    bodyImg.src = bodySrc;
                    // Detect aspect ratio on load and tag the element so the
                    // CSS can switch between landscape (cover) and portrait
                    // (contain) fitting. Matters for Alistair who mixes both.
                    bodyImg.onload = function() {
                        if (this.naturalWidth <= 1 && _fallbackSrc &&
                            this.getAttribute('data-art-fellback') !== '1') {
                            this.setAttribute('data-art-fellback', '1');
                            this.src = _fallbackSrc;   // re-fires onload with the portrait
                            return;
                        }
                        const ratio = this.naturalWidth / (this.naturalHeight || 1);
                        this.classList.toggle('is-landscape', ratio > 1.1);
                        this.classList.toggle('is-portrait', ratio < 0.95);
                    };
                    bodyImg.onerror = function() {
                        if (_fallbackSrc && this.getAttribute('data-art-fellback') !== '1') {
                            this.setAttribute('data-art-fellback', '1');
                            this.src = _fallbackSrc;
                        }
                    };
                }
            }
        }
    }

    // Dims + blurs the background for dramatic scenes
    setFocusMode(active) {
        const overlay = document.getElementById('focusOverlay');
        if (!overlay) return;
        if (active) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }

    flashEmotion(emotion, durationMs, action) {
        this._flashActive = true;
        this.setCharacterSprite(emotion, action);
        this._lastEmotion = emotion;

        // Lyra eating — override body with random eating pose during the flash window
        if (action === 'feed' && typeof CHARACTER !== 'undefined' && CHARACTER.name === 'Lyra') {
            const eatKeys = ['eating1', 'eating2', 'eating3', 'eating4'];
            const key = eatKeys[Math.floor(Math.random() * eatKeys.length)];
            const src = CHARACTER.bodySprites[key];
            if (src) {
                const bodyImg = document.getElementById('character-body-img');
                if (bodyImg) bodyImg.src = src;
            }
        }

        // Lyra wash — override body with random splash pose during the flash window
        if (action === 'wash' && typeof CHARACTER !== 'undefined' && CHARACTER.name === 'Lyra') {
            const splashKeys = ['splash1', 'splash2', 'splash3'];
            const key = splashKeys[Math.floor(Math.random() * splashKeys.length)];
            const src = CHARACTER.bodySprites && CHARACTER.bodySprites[key];
            if (src) {
                const bodyImg = document.getElementById('character-body-img');
                if (bodyImg) bodyImg.src = src;
            }
        }

        // Elian wash — override body with a random bath pose during the flash window
        // (his default wash showed the static towel-round-neck pose; these are
        // active bathing poses. Same one-shot pattern as Lyra above — the pose
        // reverts when _flashActive clears and the next updateBody runs.)
        if (action === 'wash' && typeof CHARACTER !== 'undefined' && CHARACTER.name === 'Elian') {
            const bathKeys = ['washShower', 'washClean1', 'washClean2', 'washBubble'];
            const key = bathKeys[Math.floor(Math.random() * bathKeys.length)];
            const src = CHARACTER.bodySprites && CHARACTER.bodySprites[key];
            if (src) {
                const bodyImg = document.getElementById('character-body-img');
                if (bodyImg) bodyImg.src = src;
            }
        }

        // Noir feed / wash / talk — random pose pools from the Full-body-crop
        // wiring (v979). Before this his eating/splash keys aliased neutral.png,
        // so care actions never visibly changed him. Same one-shot pattern as
        // Lyra/Elian above.
        if (typeof CHARACTER !== 'undefined' && CHARACTER.name === 'Noir') {
            const noirPools = {
                feed: ['eating1', 'eating2', 'eating3', 'eating4'],
                wash: ['splash1', 'splash2', 'splash3', 'splash4', 'splash5',
                       'shower6', 'shower7', 'shower8', 'shower9', 'shower10'],
                talk: ['talking1', 'talking2', 'talking3', 'talking4',
                       'talking5', 'talking6', 'talking7']
            };
            const noirPool = noirPools[action];
            if (noirPool) {
                const key = noirPool[Math.floor(Math.random() * noirPool.length)];
                const src = CHARACTER.bodySprites && CHARACTER.bodySprites[key];
                if (src) {
                    const bodyImg = document.getElementById('character-body-img');
                    if (bodyImg) bodyImg.src = src;
                }
            }
        }

        if (this._flashTimer) clearTimeout(this._flashTimer);
        this._flashTimer = setTimeout(() => {
            this._flashActive = false;
            this._lastEmotion = null;
        }, durationMs || 2000);
    }

    updateFadingMeter() {
        const fill = document.getElementById('fading-bar-fill');
        if (!fill) return;
        // Kingdom health = average bond across all character saves + current character
        let totalBond = 0;
        let count = 0;
        ['alistair','lyra','lucien','caspian','elian','proto','noir'].forEach(function(c) {
            try {
                var raw = localStorage.getItem('pocketLoveSave_' + c);
                if (raw) {
                    var d = JSON.parse(raw);
                    totalBond += (d.bond || 0) + (d.affection || 0);
                    count++;
                }
            } catch(e) {}
        });
        // Add current character's live bond
        if (this.game) {
            totalBond += (this.game.bond || 0) + (this.game.affection || 0);
            count = Math.max(count, 1);
        }
        // Calculate percentage (max 200 per char = 100 bond + 100 affection)
        var health = Math.min(100, Math.round(totalBond / (count * 200) * 100));
        // Memory fragments boost kingdom health significantly
        var fragments = this.game?.fragmentsUnlocked || 0;
        health = Math.min(100, health + fragments * 8);
        fill.style.width = health + '%';

        // ── HOME-SCREEN MINIMALISM (May 2026) ─────────────────────────────
        // The Kingdom meter is a story-scale indicator. For players who
        // haven't engaged the main story OR haven't played multiple
        // characters, it's chrome they don't understand and never act on.
        // Hide it on the care screen unless EITHER:
        //   (a) main story route is enabled (player opted in), OR
        //   (b) Kingdom is in genuine danger (health < 30 — narrative cue), OR
        //   (c) player has 3+ character saves (a multi-romance player)
        // Otherwise it disappears, ceding the screen to the character.
        if (!this._fadingMeter) this._fadingMeter = document.getElementById('fading-meter');
        if (this._fadingMeter) {
            const mainStoryOn = (function () {
                try { return localStorage.getItem('pp_main_story_enabled') === '1'; }
                catch (_) { return false; }
            })();
            const inDanger = health < 30;
            const multiPlayer = count >= 3;
            const shouldShow = mainStoryOn || inDanger || multiPlayer;
            this._fadingMeter.classList.toggle('kingdom-hidden', !shouldShow);
        }
    }

    updateCorruption() {
        const g = this.game;

        // ── HOME-SCREEN MINIMALISM (May 2026) ─────────────────────────────
        // Old threshold of 5% surfaced the corruption bar almost immediately
        // for any player who took even one neglectful action. The bar then
        // sat on screen as chrome the player couldn't interpret. Bumped to
        // 25% — the meter only appears when corruption is actually a
        // narrative concern, not from incidental drift.
        if (g.corruption > 25) {
            this.corruptionIndicator.classList.remove('hidden');
            this.corruptionBar.style.width = g.corruption + '%';
        } else {
            this.corruptionIndicator.classList.add('hidden');
        }

        if (g.corruptionState === 'corrupted') {
            this.container.classList.add('corrupted');
        } else {
            this.container.classList.remove('corrupted');
        }

        // Progressive corruption vignette — subtle red darkening at edges
        this.container.classList.remove('corruption-low', 'corruption-mid', 'corruption-high');
        if (g.corruption >= 60) {
            this.container.classList.add('corruption-high');
        } else if (g.corruption >= 30) {
            this.container.classList.add('corruption-mid');
        } else if (g.corruption >= 15) {
            this.container.classList.add('corruption-low');
        }
    }

    updateSirenStage() {
        const g = this.game;
        if (!g.sirenStage || CHARACTER.name !== "Lyra") return;

        const bodyImg = document.getElementById('character-body-img');
        if (!bodyImg || this._seqActive) return;

        const ALL_SIREN_CLASSES = ['siren-affection', 'siren-resonant', 'siren-unstable', 'siren-monster'];
        bodyImg.classList.remove(...ALL_SIREN_CLASSES);
        this.container.classList.remove('siren-monster-env');

        const stage = g.sirenStage;

        // Apply body sprite for advanced stages (only outside sequences)
        const stageSprite = {
            affection: null,                    // keep current natural pose
            resonant:  'singing',               // singing.png — warm, connected, at ease
            unstable:  'siren',                 // siren.png — something is wrong
            monster:   'siren'                  // same sprite, CSS transforms it
        };
        const spriteKey = stageSprite[stage];
        if (spriteKey && CHARACTER.bodySprites[spriteKey]) {
            // Only swap if we're already on a "neutral" base sprite to avoid overriding training poses
            const currentSrc = bodyImg.src.split('/').pop().replace('.png', '');
            const neutralKeys = ['neutral', 'happy', 'shy', 'pose2', 'wave', 'sad', 'depressed'];
            if (neutralKeys.includes(currentSrc)) {
                bodyImg.src = CHARACTER.bodySprites[spriteKey];
            }
        }

        // Apply CSS class
        if (stage !== 'fragile') {
            bodyImg.classList.add('siren-' + stage);
        }

        // Monster env darkens the whole UI
        if (stage === 'monster') {
            this.container.classList.add('siren-monster-env');
        }
    }

    applyTensionStage(stage) {
        this.container.classList.remove('tension-stage-1', 'tension-stage-2', 'tension-stage-3');
        if (stage > 0) this.container.classList.add('tension-stage-' + stage);
    }

    updateAffection() {
        const names = CHARACTER.affectionNames || {0:"Stranger",1:"Familiar",2:"Close",3:"Devoted",4:"In Love"};
        const level = this.game.affectionLevel;
        const name = names[level] || "Stranger";
        const nextName = names[level + 1];
        // Show current level + hint of what's next
        this.affectionText.textContent = nextName ? name + ' \u2192 ' + nextName : name + ' \u2764';
        this.affectionText.title = nextName ? 'Next: ' + nextName : 'Max affection reached!';

        // Feature 8: streak badge — show flame + count when player returns 2+ days in a row
        const streakBadge = document.getElementById('streak-badge');
        if (streakBadge) {
            const streak = this.game.dailyStreak || 0;
            if (streak >= 2) {
                streakBadge.textContent = `🔥${streak}`;
                streakBadge.title = `${streak}-day streak! Keep it up!`;
                streakBadge.classList.remove('hidden');
            } else {
                streakBadge.classList.add('hidden');
            }
        }
    }

    updatePersonalityBadge() {
        const p = this.game.personality;
        const labels = { shy: "Shy", clingy: "Clingy", tsundere: "Tsundere" };

        if (this.game.affectionLevel >= 1) {
            this.personalityBadge.textContent = labels[p] || p;
            this.personalityBadge.classList.remove('hidden');
        }
    }

    bounceCharacter() {
        this.characterSprite.classList.remove('bounce');
        void this.characterSprite.offsetWidth;
        this.characterSprite.classList.add('bounce');
        // Restore breathing after bounce
        setTimeout(() => this.characterSprite.classList.remove('bounce'), 300);

        // Reset idle dialogue timer so it doesn't overwrite action dialogue
        if (this._idleTimer) {
            clearTimeout(this._idleTimer);
            this.scheduleIdleDialogue();
        }
    }

    // ===== PRE-REACTION PIPELINE =====
    // Fires a micro-expression + brief delay before the main dialogue/emotion lands.
    // This makes each tap feel like a real moment — the character takes a beat first.
    //
    // config: { emotionalState, action, reactionType }
    // callback: fires after the delay — should contain typewriter.show() + flashEmotion()
    preReact(config, callback) {
        const { emotionalState = 'neutral', action = '', reactionType = 'happy' } = config;

        // Delay ranges [min, max] ms — HALVED Jul 2026 (owner: "delay when I tap
        // Feed/Wash/Talk, the poses are delayed"). Kept a micro-beat for juice,
        // but the reaction pose now lands ~2x faster; the image-LOAD half of the
        // lag is separately handled by the care-pose preload in care-blink.js.
        const delayTable = {
            unstable: [80,  150],   // volatile — still a beat, but snappy
            obsessed: [30,  80],    // hyper-aware — reacts fast
            guarded:  [60,  120],   // controlled — brief hold
            secure:   [30,  80],    // settled — warm and ready
            neutral:  [40,  100]    // default — natural beat
        };

        // Pre-expression shown on the FACE only before the action registers
        // This is the "taking a breath" expression before the real reaction
        const preExprTable = {
            unstable: 'sad',     // looks down / something weighing on them
            obsessed: 'shy',     // flustered before snapping into full emotion
            guarded:  'neutral', // schooled expression — you can't read them yet
            secure:   'happy',   // soft readiness
            neutral:  'neutral'
        };

        // Action overrides — certain interactions always have a specific physical beat
        const actionOverrides = {
            wash:  { preExpr: 'shy', range: [45, 95] },   // intimate — quick shy flash
            gift:  { preExpr: 'shy', range: [40, 90] },   // surprise before warmth
            train: {                  range: [30, 70] },   // decisive — almost instant
        };

        const override   = actionOverrides[action] || {};
        const range      = override.range  || delayTable[emotionalState] || delayTable.neutral;
        const preExpr    = override.hasOwnProperty('preExpr')
                           ? override.preExpr
                           : (preExprTable[emotionalState] || null);

        const delay = range[0] + Math.random() * (range[1] - range[0]);

        // Step 1 — flash the pre-expression on the face (body stays as-is)
        if (preExpr) this._flashFaceOnly(preExpr);

        // Step 1b — shift breathing speed to match emotional state
        this.setBreathingSpeed(emotionalState);

        // Step 2 — CSS pull-back on the character body
        const area = document.getElementById('character-area');
        if (area) area.classList.add('pre-react');

        // Step 3 — after the beat, remove the class and fire the full reaction
        // Auto-shift map: what emotion naturally follows the reaction type mid-line
        // "happy response that drifts to shy" — "sad that composes into neutral" etc.
        const autoShiftMap = {
            happy:   'shy',     // warmth → vulnerability
            sad:     'neutral', // grief → composure reasserting
            angry:   'sad',     // anger cracking to reveal hurt
            shy:     'happy',   // shyness blooming
            love:    'shy',     // love → vulnerable exposure
            neutral: null,      // no clear direction
            crying:  'neutral'  // break → trying to hold together
        };

        setTimeout(() => {
            if (area) area.classList.remove('pre-react');

            // Determine auto-shift — default follows the reaction naturally
            let autoShift = autoShiftMap[reactionType] || null;

            // ── Mismatch layer ───────────────────────────────────────────
            // Ask the game engine if the character's hidden emotional state
            // contradicts the surface reaction. If yes, the true feeling
            // surfaces mid-line as the auto-shift instead.
            // This creates the "she says X but feels Y" effect.
            let hasMicro = false;
            if (this.game && this.game._getMismatchedEmotion) {
                const mismatch = this.game._getMismatchedEmotion(reactionType);
                if (mismatch.leak) {
                    autoShift = mismatch.leak; // truth bleeds through
                }
                // Micro-dissonance — not a full leak, just a flicker of wrongness.
                // Brief neutral face + ~400ms pause before dialogue starts.
                // Creates "everything is fine… but something is off" texture.
                if (mismatch.micro === 'hesitation') hasMicro = true;
            }

            if (this.game && this.game.typewriter) {
                this.game.typewriter._autoShiftEmotion = autoShift;
            }

            // Update debug panel with what we decided
            const dbgDisplayed = document.getElementById('dbg-displayed');
            const dbgAutoshift  = document.getElementById('dbg-autoshift');
            if (dbgDisplayed) dbgDisplayed.textContent = reactionType;
            if (dbgAutoshift)  dbgAutoshift.textContent = autoShift || (hasMicro ? '(micro)' : '—');

            // ── Pattern echo + micro-hesitation ──────────────────────────
            // Log this interaction and check if a pattern echo should fire.
            // Echo = a subtle verbal line that anchors the player's vague unease
            // without ever explaining what's wrong.
            const echo = this.game && this.game._checkPatternEcho
                ? this.game._checkPatternEcho(hasMicro)
                : null;

            if (hasMicro) {
                // Face briefly flickers to neutral — a visible but unreadable hesitation
                this._flashFaceOnly('neutral');
                setTimeout(() => {
                    callback();
                    // Pattern echo fires after the main dialogue settles
                    if (echo && this.game && this.game.typewriter) {
                        setTimeout(() => this.game.typewriter.show(echo), 2400);
                    }
                }, 380 + Math.random() * 160);
            } else {
                callback();
                // Echo can also fire on non-micro interactions (the pattern built up
                // from previous hesitations — this is the delayed consequence)
                if (echo && this.game && this.game.typewriter) {
                    setTimeout(() => this.game.typewriter.show(echo), 2400);
                }
            }
        }, delay);
    }

    // Swaps only the face portrait sprite — used for subtle pre-reaction beats.
    // Does NOT touch the body sprite.
    _flashFaceOnly(emotion) {
        const faces = CHARACTER.faceSprites[emotion];
        if (!faces || !faces.length) return;
        const faceImg = document.getElementById('character-face-img');
        if (!faceImg) return;
        faceImg.src = faces[Math.floor(Math.random() * faces.length)];
    }

    // ===== PREMIUM CHOICE UI =====
    // Renders a single choice button that pauses the scene for the player.
    // Clicking it calls onConfirm() which triggers the premium scene continuation.
    // Auto-dismisses after 9 s if ignored (scene ends normally).
    //
    // To wire real payments: replace game.unlockPremiumScene() — this UI is not
    // the payment layer, it's just the visual trigger point.
    showPremiumChoice(label, onConfirm) {
        this.hidePremiumChoice();

        // Pre-choice tension boost — applies TUNE.preChoiceTensionBoost (auto-tuned)
        if (this.game && window.TUNE) {
            const boost = window.TUNE.preChoiceTensionBoost ?? 0;
            if (boost !== 0) {
                this.game.emotion.fear = Math.max(0, Math.min(100,
                    this.game.emotion.fear + boost * 12
                ));
            }
        }

        // Analytics: gate shown — fires once per gate regardless of scene
        if (typeof Analytics !== 'undefined') {
            Analytics.emit('premium_gate_shown', {
                label,
                character:       this.game?.selectedCharacter || 'unknown',
                storyDay:        this.game?.storyDay          || 0,
                personalityPath: this.game?.personalityPath   || 'none',
                whaleScore:      Math.round(this.game?.whaleScore ?? 0)
            });
        }

        const wrap = document.createElement('div');
        wrap.id = 'premium-choice';
        const autoClose = window.TUNE?.premiumAutoClose ?? 9000;
        wrap.innerHTML = `
            <div class="premium-backdrop"></div>
            <div class="premium-content">
                <div class="premium-emotion">${CHARACTER?.name || 'They'} is waiting...</div>
                <button class="premium-btn premium-heartbeat">${label}</button>
                <div class="premium-timer-bar"><div class="premium-timer-fill"></div></div>
                <div class="premium-hint">This moment won't last forever</div>
            </div>
        `;
        const container = document.getElementById('game-container') || document.body;
        container.appendChild(wrap);
        wrap.querySelector('.premium-btn').addEventListener('click', () => {
            this.hidePremiumChoice();
            if (typeof onConfirm === 'function') onConfirm();
        });
        // Animate timer bar
        const timerFill = wrap.querySelector('.premium-timer-fill');
        if (timerFill) {
            timerFill.style.transition = `width ${autoClose}ms linear`;
            requestAnimationFrame(() => { timerFill.style.width = '0%'; });
        }
        // Fade in
        requestAnimationFrame(() => wrap.classList.add('visible'));
    }

    hidePremiumChoice() {
        const el = document.getElementById('premium-choice');
        if (el) {
            el.classList.remove('visible');
            setTimeout(() => el.remove(), 300);
        }
    }

    // ===== DEBUG PANEL =====
    // Dev-only overlay. Toggle with backtick (`) key.
    // Shows hidden emotional stats, mismatch decisions, and display emotion in real-time.

    initDebugPanel() {
        this._debugVisible = false;
        document.addEventListener('keydown', (e) => {
            if (e.key === '`' || e.key === '~') {
                this._debugVisible = !this._debugVisible;
                const panel = document.getElementById('debug-panel');
                if (panel) panel.classList.toggle('hidden', !this._debugVisible);
            }
        });
    }

    updateDebugPanel() {
        if (!this._debugVisible) return;
        const g = this.game;

        const trust = Math.round(g.emotion?.trust    || 0);
        const fear  = Math.round(g.emotion?.fear     || 0);
        const obs   = Math.round(g.emotion?.obsession || 0);
        const ts    = g.tensionStage || 0;
        const cor   = Math.round(g.corruption || 0);
        const state = g.getEmotionalState ? g.getEmotionalState() : '–';
        const phase = g.lyraPhase ? g.lyraPhase : (g.dutyTension !== undefined ? `duty:${Math.round(g.dutyTension||0)}` : '–');

        const set = (id, val, colorFn) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = val;
            if (colorFn) el.style.color = colorFn(val);
        };

        const tensionColor = (v) => v < 30 ? '#00ff88' : v < 65 ? '#ffcc00' : '#ff4444';
        const trustColor   = (v) => v > 65 ? '#00ff88' : v > 35 ? '#ffcc00' : '#ff4444';

        set('dbg-trust',   trust,         trustColor);
        set('dbg-fear',    fear,          tensionColor);
        set('dbg-obs',     obs,           null);
        set('dbg-tension', `stage ${ts}`, (v) => tensionColor(ts * 25));
        set('dbg-corrupt', cor,           tensionColor);
        set('dbg-state',   state,         null);
        set('dbg-phase',   phase,         null);
    }

    // Adjusts the body breathing animation speed to reflect emotional state.
    // Faster breathing = anxious/excited. Slower = guarded/calm.
    setBreathingSpeed(emotionalState) {
        const el = document.getElementById('character-fullbody');
        if (!el) return;

        const config = {
            unstable: { speed: '1.7s', scale: '1.015', y: '4px' },
            obsessed: { speed: '2.0s', scale: '1.012', y: '3px' },
            guarded:  { speed: '3.4s', scale: '1.005', y: '2px' },
            secure:   { speed: '4.8s', scale: '1.004', y: '2px' },
            neutral:  { speed: '4.0s', scale: '1.006', y: '3px' }
        };

        const c = config[emotionalState] || config.neutral;
        el.style.animationDuration = c.speed;
        el.style.setProperty('--breathe-scale', c.scale);
        el.style.setProperty('--breathe-y', c.y);
    }

    // ── Sword training sequence (Alistair only) ──────────────────
    playSwordSequence(onComplete) {
        const sprites = CHARACTER.bodySprites || CHARACTER.bodyPoses;

        if (!sprites || !sprites.fighting) {
            this.bounceCharacter();
            onComplete && onComplete();
            return;
        }

        const bodyImg = document.getElementById('character-body-img');
        if (!bodyImg) { onComplete && onComplete(); return; }

        this._seqActive = true;

        const f1   = sprites.fighting1 || sprites.fighting;
        const f2   = sprites.fighting2 || sprites.fighting1 || sprites.fighting;
        const base = sprites.neutral   || sprites.default;

        const ALL_SWORD = ['sword-swing-right','sword-swing-left','sword-impact','sword-charge','sword-peak','sword-fade','bounce'];

        // Clear all sword classes, force reflow, set src, add ONE class only
        const set = (src, cls) => {
            bodyImg.classList.remove(...ALL_SWORD);
            void bodyImg.offsetWidth;
            bodyImg.src = src;
            if (cls) bodyImg.classList.add(cls);
        };

        // Strip any persistent classes before starting
        bodyImg.classList.remove('in-love');

        // Phase 1 — three quick swings (transform only, no filter)
        set(f1, 'sword-swing-right');  sounds.swoosh();
        setTimeout(() => { set(f2, 'sword-swing-left');  sounds.swoosh(); }, 300);
        setTimeout(() => { set(f1, 'sword-swing-right'); sounds.swoosh(); }, 580);

        // Phase 2 — power charges up (filter only, no transform)
        //   Switch back to neutral pose so charge glow is clearly visible
        setTimeout(() => { set(base, 'sword-charge'); sounds.clash(); }, 850);

        // Phase 3 — peak: bright white pulse (filter only, infinite loop)
        setTimeout(() => { set(base, 'sword-peak'); sounds.clash(); }, 1700);

        // Phase 4 — release: power fades out
        setTimeout(() => { set(base, 'sword-fade'); sounds.breathe(); }, 2350);

        // Done — back to neutral, release lock
        setTimeout(() => {
            bodyImg.classList.remove(...ALL_SWORD, 'in-love');
            bodyImg.src = base;
            this._seqActive = false;
            onComplete && onComplete();
            if (this._idleTimer) { clearTimeout(this._idleTimer); this.scheduleIdleDialogue(); }
        }, 3000);
    }

    // ── Training picker (slides up panel, returns chosen type) ───
    showTrainingPicker(onSelect) {
        const panel = document.getElementById('training-panel');
        if (!panel) { onSelect('sword'); return; }

        // Build grid dynamically from CHARACTER data — works for any character
        const options = CHARACTER.trainingOptions || [
            { type: 'sword', icon: '⚔️', label: 'Train', desc: '' }
        ];
        const grid = document.getElementById('training-grid');
        grid.innerHTML = options.map(opt => `
            <button class="training-option" data-type="${opt.type}">
                <span class="training-option-icon">${opt.icon}</span>
                <span class="training-option-label">${opt.label}</span>
                <span class="training-option-desc">${opt.desc}</span>
            </button>
        `).join('');

        // Update panel title for character
        const panelHeader = panel.querySelector('#training-panel-header span');
        if (panelHeader) {
            const titles = { lyra: 'Choose Practice', lucien: 'Choose Challenge' };
            panelHeader.textContent = titles[this.game.selectedCharacter] || 'Choose Training';
        }

        this.closeAllPanels('training');
        clearTimeout(this._trainingCloseTimer);
        panel.classList.remove('hidden');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => panel.classList.add('visible'));
        });

        const close = () => this.closeTrainingPanel();

        document.getElementById('training-close').onclick = () => close();

        grid.querySelectorAll('.training-option').forEach(btn => {
            btn.onclick = () => {
                const type = btn.dataset.type;
                close();
                setTimeout(() => onSelect(type), 330);
            };
        });
    }

    // ── Strength training sequence (bare chest) ──────────────────
    playStrengthSequence(onComplete) {
        const poses = CHARACTER.bodySprites || CHARACTER.bodyPoses;
        if (!poses || !poses.shirtless) {
            this.bounceCharacter();
            onComplete && onComplete();
            return;
        }

        const bodyImg = document.getElementById('character-body-img');
        if (!bodyImg) { onComplete && onComplete(); return; }

        const s0   = poses.shirtless;
        const s1   = poses.shirtless1 || s0;
        const s2   = poses.shirtless2 || s1;
        const s3   = poses.shirtless3 || s2;
        const base = poses.neutral || poses.default;

        const ALL_STR = ['strength-strain','strength-glow','strength-peak','bounce'];

        const set = (src, cls) => {
            bodyImg.classList.remove(...ALL_STR);
            void bodyImg.offsetWidth;
            if (src) bodyImg.src = src;
            if (cls) bodyImg.classList.add(cls);
        };

        this._seqActive = true;
        bodyImg.classList.remove('in-love');
        // Shirt comes off — swap to base shirtless, no animation yet
        set(s0, null);

        // Rep 1 — strain (transform only)
        setTimeout(() => { set(s1, 'strength-strain'); sounds.thud(); }, 200);
        // Rep 2 — strain
        setTimeout(() => { set(s2, 'strength-strain'); sounds.thud(); }, 520);
        // Rep 3 — strain, effort building
        setTimeout(() => { set(s3, 'strength-strain'); sounds.thud(); }, 840);
        // Rep 4 — absolute limit: strain pose + pulsing orange glow (filter only, one class)
        setTimeout(() => { set(s3, 'strength-peak');   sounds.thud(); }, 1150);
        // Exhale — warm glow fades (filter only)
        setTimeout(() => { set(s3, 'strength-glow');   sounds.breathe(); }, 1620);
        // Return to neutral, release lock
        setTimeout(() => {
            bodyImg.classList.remove(...ALL_STR, 'in-love');
            bodyImg.src = base;
            this._seqActive = false;
            onComplete && onComplete();
            if (this._idleTimer) { clearTimeout(this._idleTimer); this.scheduleIdleDialogue(); }
        }, 2250);
    }

    // ── Fighting sequence (Elian: spar / combat flourish) ─────────
    // Runs a fast 4-pose combat flourish on the care body sprite:
    // ready stance → blade strike → cut back → draw-and-loose finisher,
    // then settles to neutral. Poses are the clean cut-outs added Jul 2026
    // (fightready/fightslash/fightbow + the deployed fighting.png). CSS
    // motion classes live under body.pp-screen-care .character-elian so they
    // out-specificity the elianCareBreathe !important idle rule.
    playFightingSequence(onComplete) {
        const poses   = CHARACTER.bodySprites || CHARACTER.bodyPoses;
        const bodyImg = document.getElementById('character-body-img');
        if (!poses || !bodyImg) { this.bounceCharacter(); onComplete && onComplete(); return; }

        const ready  = poses.fightReady || poses.neutral || poses.default;
        const slash1 = poses.fighting   || poses.fightSlash || ready;   // deployed fighting.png
        const slash2 = poses.fightSlash || poses.fighting   || ready;   // Fighting (dagger + trail)
        const bow    = poses.fightBow   || ready;                       // arrow fight — winged finisher
        const base   = poses.neutral || poses.default;

        const ALL_FIGHT = ['fight-lunge-r','fight-lunge-l','fight-impact','fight-loose','bounce'];
        const set = (src, cls) => {
            bodyImg.classList.remove(...ALL_FIGHT);
            void bodyImg.offsetWidth;               // restart the animation
            if (src) bodyImg.src = src;
            if (cls) bodyImg.classList.add(cls);
        };
        // guarded SFX — returns true if it actually played, so `a() || b()` falls back cleanly
        const sfx = (name) => { try { if (window.sounds && sounds[name]) { sounds[name](); return true; } } catch (_) {} return false; };

        this._seqActive = true;
        bodyImg.classList.remove('in-love','strength-strain','strength-glow','strength-peak');
        set(ready, null);

        // Settle into the ready stance
        setTimeout(() => { set(ready, 'fight-lunge-l'); sfx('swoosh'); }, 180);
        // Strike 1 — lunge right, blade
        setTimeout(() => { set(slash1, 'fight-lunge-r'); sfx('clash') || sfx('thud'); }, 640);
        // Strike 2 — cut back to the left
        setTimeout(() => { set(slash2, 'fight-lunge-l'); sfx('clash') || sfx('thud'); }, 1120);
        // Finisher — draw the bow and loose
        setTimeout(() => { set(bow, 'fight-loose'); sfx('swoosh'); }, 1520);
        // Recoil hold on the release
        setTimeout(() => { set(bow, 'fight-impact'); sfx('thud'); }, 1880);
        // Return to neutral, release the button lock
        setTimeout(() => {
            bodyImg.classList.remove(...ALL_FIGHT, 'in-love');
            bodyImg.src = base;
            this._seqActive = false;
            onComplete && onComplete();
            if (this._idleTimer) { clearTimeout(this._idleTimer); this.scheduleIdleDialogue(); }
        }, 2400);
    }

    // ── Focus / Drift sequence (Lyra: mermaid ocean swim) ─────────
    playFocusSequence(onComplete) {
        const poses = CHARACTER.bodySprites || CHARACTER.bodyPoses;
        if (!poses) { this.bounceCharacter(); onComplete && onComplete(); return; }

        const bodyImg = document.getElementById('character-body-img');
        if (!bodyImg) { onComplete && onComplete(); return; }

        const isLyra = typeof CHARACTER !== 'undefined' && CHARACTER.name === 'Lyra';
        const isAlistair = typeof CHARACTER !== 'undefined' && CHARACTER.name === 'Alistair';

        // ── Lyra Drift: swap to ocean background + mermaid poses ──
        const prevBg = this.container.style.backgroundImage;
        if (isLyra) {
            this.container.style.transition = 'background-image 0.6s ease';
            this.container.style.backgroundImage = "url('assets/bg-lyra-ocean.png')";
        }

        const mermaidPoses = isLyra
            ? [poses.mermaid1, poses.mermaid2, poses.mermaid3, poses.mermaid4].filter(Boolean)
            : null;

        // ── Alistair "Steel of Mind": 3-frame kneeling-vigil animation ──
        const focusFrames = isAlistair
            ? [poses.focus1, poses.focus2, poses.focus3].filter(Boolean)
            : null;

        const focusPose = (mermaidPoses && mermaidPoses.length)
            ? mermaidPoses[Math.floor(Math.random() * mermaidPoses.length)]
            : (focusFrames && focusFrames.length)
                ? focusFrames[0]
                : (poses.gentle || poses.neutral);
        const base = poses.neutral || poses.default;

        const ALL_FOCUS = ['focus-active','focus-enlighten','focus-breathe','focus-aura','mermaid-swim','bounce'];

        const set = (src, cls) => {
            bodyImg.classList.remove(...ALL_FOCUS);
            void bodyImg.offsetWidth;
            if (src) bodyImg.src = src;
            if (cls) bodyImg.classList.add(cls);
        };

        this._seqActive = true;
        bodyImg.classList.remove('strength-strain','strength-glow','strength-peak','sword-swing-right','sword-swing-left','sword-peak','sword-charge','sword-fade','in-love');
        void bodyImg.offsetWidth;
        bodyImg.src = focusPose;

        if (isLyra) {
            // Lyra drift — swim animation with wave particles
            setTimeout(() => { set(null, 'mermaid-swim'); sounds.splash(); }, 250);
            setTimeout(() => {
                const alt = (mermaidPoses && mermaidPoses.length > 1)
                    ? mermaidPoses[Math.floor(Math.random() * mermaidPoses.length)]
                    : focusPose;
                set(alt, 'mermaid-swim');
                sounds.splash();
                this._spawnWaterParticles();
            }, 900);
            setTimeout(() => { set(null, 'focus-enlighten'); sounds.focusTone(); sounds.chime(); }, 1700);
            setTimeout(() => { set(null, 'mermaid-swim'); sounds.breathe(); }, 2400);
        } else if (isAlistair && focusFrames && focusFrames.length >= 2) {
            // Alistair Steel of Mind — cycle through the 3 kneeling frames
            // frame 1 (standing / starting) → frame 2 (kneeling) → frame 3 (deep focus + aura)
            const f1 = focusFrames[0];
            const f2 = focusFrames[1] || f1;
            const f3 = focusFrames[2] || f2;
            setTimeout(() => { set(f1, 'focus-active'); sounds.focusTone(); }, 200);
            setTimeout(() => { set(f2, 'focus-active'); sounds.focusTone(); }, 900);
            setTimeout(() => { set(f3, 'focus-enlighten'); sounds.focusTone(); sounds.chime(); }, 1700);
            setTimeout(() => { set(f3, 'focus-breathe'); sounds.breathe(); }, 2500);
        } else {
            setTimeout(() => { set(null, 'focus-active'); sounds.focusTone(); }, 300);
            setTimeout(() => sounds.focusTone(), 950);
            setTimeout(() => { set(null, 'focus-enlighten'); sounds.focusTone(); sounds.chime(); }, 1650);
            setTimeout(() => { set(null, 'focus-active'); sounds.breathe(); }, 2400);
        }

        // Done — restore background + release lock
        setTimeout(() => {
            bodyImg.classList.remove(...ALL_FOCUS, 'in-love');
            bodyImg.src = base;
            if (isLyra) this.container.style.backgroundImage = prevBg;
            this._seqActive = false;
            onComplete && onComplete();
            if (this._idleTimer) { clearTimeout(this._idleTimer); this.scheduleIdleDialogue(); }
        }, 3050);
    }

    // ── Lyra: singing scene (cliff background + sing poses + notes) ─
    playSingingSequence(onComplete) {
        const sprites = CHARACTER.bodySprites || CHARACTER.bodyPoses;
        if (!sprites) { this.bounceCharacter(); onComplete && onComplete(); return; }

        const bodyImg = document.getElementById('character-body-img');
        if (!bodyImg) { onComplete && onComplete(); return; }

        const singPoses = [sprites.sing1, sprites.sing2, sprites.sing3, sprites.sing4].filter(Boolean);
        const pickSing  = () => singPoses.length
            ? singPoses[Math.floor(Math.random() * singPoses.length)]
            : (sprites.singing || sprites.neutral);
        const base = sprites.neutral || sprites.default;

        // Swap to cliff background
        const prevBg = this.container.style.backgroundImage;
        this.container.style.transition = 'background-image 0.5s ease';
        this.container.style.backgroundImage = "url('assets/bg-lyra-cliff.png')";

        const resetAnim = (cls) => {
            bodyImg.classList.remove('lyra-sway', 'lyra-voice-glow', 'bounce');
            void bodyImg.offsetWidth;
            if (cls) bodyImg.classList.add(cls);
        };

        this._seqActive = true;
        bodyImg.src = pickSing();
        this._spawnMusicNotes();

        // Sway 1 — first verse
        setTimeout(() => { resetAnim('lyra-sway'); sounds.sirenSong(); }, 150);
        // Glow peak
        setTimeout(() => { resetAnim('lyra-voice-glow'); }, 600);
        // Sway 2 — swap pose for second verse
        setTimeout(() => {
            bodyImg.src = pickSing();
            resetAnim('lyra-sway');
            sounds.sirenSong();
            this._spawnMusicNotes();
        }, 1000);
        // Glow peak again
        setTimeout(() => { resetAnim('lyra-voice-glow'); }, 1450);
        // Soft exhale
        setTimeout(() => { sounds.breathe(); }, 1700);

        // Return to neutral + restore background
        setTimeout(() => {
            bodyImg.classList.remove('lyra-sway', 'lyra-voice-glow');
            bodyImg.src = base;
            this.container.style.backgroundImage = prevBg;
            this._seqActive = false;
            onComplete && onComplete();
            if (this._idleTimer) { clearTimeout(this._idleTimer); this.scheduleIdleDialogue(); }
        }, 2200);
    }

    // ── Lyra: siren magic scene (cliff power bg + power poses + sparks)
    playMagicSequence(onComplete) {
        const sprites = CHARACTER.bodySprites || CHARACTER.bodyPoses;
        if (!sprites) { this.bounceCharacter(); onComplete && onComplete(); return; }

        const bodyImg = document.getElementById('character-body-img');
        if (!bodyImg) { onComplete && onComplete(); return; }

        const powerPoses = [sprites.power1, sprites.power2, sprites.power3, sprites.power4, sprites.power5].filter(Boolean);
        const pickPower  = () => powerPoses.length
            ? powerPoses[Math.floor(Math.random() * powerPoses.length)]
            : (sprites.power || sprites.neutral);
        const base = sprites.neutral || sprites.default;

        // Swap to cliff power background
        const prevBg = this.container.style.backgroundImage;
        this.container.style.transition = 'background-image 0.4s ease';
        this.container.style.backgroundImage = "url('assets/bg-lyra-cliff-power.png')";

        const resetAnim = (...remove) => {
            bodyImg.classList.remove(...remove, 'bounce');
            void bodyImg.offsetWidth;
        };

        this._seqActive = true;
        bodyImg.src = pickPower();
        resetAnim('magic-charge', 'magic-release', 'siren-peak');
        bodyImg.classList.add('magic-charge');
        sounds.magicCharge();

        // Second charge — swap power pose
        setTimeout(() => {
            bodyImg.src = pickPower();
            resetAnim('magic-charge', 'magic-release', 'siren-peak');
            bodyImg.classList.add('magic-charge');
            sounds.magicCharge();
        }, 700);

        // Peak — power surges + sparkle burst
        setTimeout(() => {
            bodyImg.src = pickPower();
            resetAnim('magic-charge', 'magic-release', 'siren-peak');
            bodyImg.classList.add('siren-peak');
            sounds.magicCharge();
            const area = document.getElementById('character-area');
            if (area) {
                this.spawnSparkles(area.offsetWidth * 0.5, area.offsetHeight * 0.25);
                this.spawnSparkles(area.offsetWidth * 0.3, area.offsetHeight * 0.35);
                this.spawnSparkles(area.offsetWidth * 0.7, area.offsetHeight * 0.35);
            }
        }, 1350);

        // Release — power fades
        setTimeout(() => {
            resetAnim('magic-charge', 'siren-peak');
            bodyImg.classList.add('magic-release');
            sounds.breathe();
        }, 1950);

        // Return to neutral + restore background
        setTimeout(() => {
            bodyImg.classList.remove('magic-charge', 'magic-release', 'siren-peak');
            bodyImg.src = base;
            this.container.style.backgroundImage = prevBg;
            this._seqActive = false;
            onComplete && onComplete();
            if (this._idleTimer) { clearTimeout(this._idleTimer); this.scheduleIdleDialogue(); }
        }, 2600);
    }

    // ── Puzzle training sequence (Lucien only) ─────────────────────
    playPuzzleSequence(type, onComplete) {
        if (!this.game._puzzleSystem) {
            this.game._puzzleSystem = new PuzzleSystem(this.game);
        }

        // Use training panel area for puzzle UI
        const panel = document.getElementById('training-panel');
        const grid = document.getElementById('training-grid');
        if (!panel || !grid) { onComplete && onComplete(); return; }

        // Cancel any pending close timer from the picker dismiss
        clearTimeout(this._trainingCloseTimer);

        // Force show training panel with puzzle content
        this.closeAllPanels('training');
        panel.classList.remove('hidden');
        // Must use double-rAF to ensure 'hidden' removal is painted before adding 'visible'
        requestAnimationFrame(() => {
            requestAnimationFrame(() => panel.classList.add('visible'));
        });

        // Update header
        const panelHeader = panel.querySelector('#training-panel-header span');
        if (panelHeader) panelHeader.textContent = 'Puzzle Challenge';

        // Hide close button during puzzle
        const closeBtn = document.getElementById('training-close');
        if (closeBtn) closeBtn.style.display = 'none';

        this._seqActive = true;

        this.game._puzzleSystem.play(type, grid, (success) => {
            // Restore close button
            if (closeBtn) closeBtn.style.display = '';

            // Close panel after delay
            setTimeout(() => {
                this.closeTrainingPanel();
                this._seqActive = false;

                // Bonus for puzzle success
                if (success) {
                    this.game.bond = Math.min(100, this.game.bond + 3);
                    this.game.affection = Math.min(100, this.game.affection + 2);
                    this.bounceCharacter();
                }

                onComplete && onComplete();
            }, 2200);
        });
    }

    // ── Forage sequence (Elian) — dedicated wrapper ────────────────
    // Like playPuzzleSequence but tailored to the forage catch-game:
    // header reads "Foraging", rewards are applied INSIDE playForage
    // (performance-scaled + moonpetal + personal best), so this wrapper
    // only opens the panel and closes it promptly when the player taps
    // Done — no generic +3/+2 double-dip, no 2.2s lingering close.
    playForageSequence(onComplete) {
        if (!this.game._puzzleSystem) {
            this.game._puzzleSystem = new PuzzleSystem(this.game);
        }
        const panel = document.getElementById('training-panel');
        const grid = document.getElementById('training-grid');
        if (!panel || !grid) { onComplete && onComplete(); return; }

        clearTimeout(this._trainingCloseTimer);
        this.closeAllPanels('training');
        panel.classList.remove('hidden');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => panel.classList.add('visible'));
        });

        const panelHeader = panel.querySelector('#training-panel-header span');
        if (panelHeader) panelHeader.textContent = 'Foraging';
        const closeBtn = document.getElementById('training-close');
        if (closeBtn) closeBtn.style.display = 'none';
        this._seqActive = true;

        this.game._puzzleSystem.playForage(grid, () => {
            if (closeBtn) closeBtn.style.display = '';
            this.closeTrainingPanel();
            this._seqActive = false;
            onComplete && onComplete();
        });
    }

    // ── Spawn floating music notes (for singing scene) ────────────
    _spawnMusicNotes() {
        const area = document.getElementById('character-area');
        if (!area) return;
        const notes = ['🎵', '🎶', '♪', '♫', '🎤'];
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                el.className = 'floating-note';
                el.textContent = notes[Math.floor(Math.random() * notes.length)];
                el.style.left   = (15 + Math.random() * 70) + '%';
                el.style.bottom = (30 + Math.random() * 30) + '%';
                el.style.setProperty('--dx', (Math.random() - 0.5) * 60 + 'px');
                el.style.setProperty('--rot', (Math.random() * 30 - 15) + 'deg');
                area.appendChild(el);
                setTimeout(() => el.remove(), 1600);
            }, i * 120);
        }
    }

    showNotification(text) {
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.textContent = text;
        document.getElementById('character-area').appendChild(notif);
        setTimeout(() => notif.remove(), 1800);

        // Spawn floating hearts for bond-related actions
        if (text.includes('+') && (text.toLowerCase().includes('bond') || text.toLowerCase().includes('love') || text.toLowerCase().includes('talk') || text.toLowerCase().includes('gift') || text.toLowerCase().includes('rose'))) {
            this.spawnFloatingHearts(3);
        }
    }

    // ── Lyra wash sequence ───────────────────────────────────────
    // Plays splash sound + spawns water droplet particles on Wash click.
    _lyraWashSequence() {
        // Second splash hit — sounds like water settling
        setTimeout(() => sounds.splash(), 380);
        // Water particle burst
        this._spawnWaterParticles();
        // Sparkle follow-up for the shimmery "clean" feeling
        setTimeout(() => {
            const area = document.getElementById('character-area');
            if (area) {
                const cx = area.offsetWidth  * 0.5;
                const cy = area.offsetHeight * 0.3;
                this.spawnSparkles(cx, cy);
                this.spawnSparkles(cx - 40, cy + 20);
            }
        }, 250);
    }

    _spawnWaterParticles() {
        const area = document.getElementById('character-area');
        if (!area) return;
        const dropEmoji = ['💧', '💦', '🫧', '✨', '🌊'];
        const count = 6;
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                el.className = 'floating-water';
                el.textContent = dropEmoji[Math.floor(Math.random() * dropEmoji.length)];
                el.style.left   = (20 + Math.random() * 60) + '%';
                el.style.bottom = (25 + Math.random() * 25) + '%';
                el.style.setProperty('--dx', (Math.random() - 0.5) * 70 + 'px');
                el.style.setProperty('--rot', (Math.random() * 40 - 20) + 'deg');
                area.appendChild(el);
                setTimeout(() => el.remove(), 1400);
            }, i * 100);
        }
    }

    // ── Lyra eating sequence ─────────────────────────────────────
    // Plays munching sound repeats + food particles; eating pose is
    // set inside flashEmotion so it lines up with the reaction window.
    _lyraEatSequence() {
        // Second munch hit after a short beat (feels like a second bite)
        setTimeout(() => sounds.munch(), 420);
        // Spawn food particles from character area centre
        this._spawnFoodParticles();
        // Sparkle burst to go with it
        setTimeout(() => {
            const area = document.getElementById('character-area');
            if (area) {
                const cx = area.offsetWidth  * 0.5;
                const cy = area.offsetHeight * 0.35;
                this.spawnSparkles(cx, cy);
            }
        }, 300);
    }

    _spawnFoodParticles() {
        const area = document.getElementById('character-area');
        if (!area) return;
        const foodEmoji = ['🍎', '🐚', '🌿', '✨', '🫧', '🎵'];
        const count = 5;
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                el.className = 'floating-food';
                el.textContent = foodEmoji[Math.floor(Math.random() * foodEmoji.length)];
                el.style.left   = (25 + Math.random() * 50) + '%';
                el.style.bottom = (30 + Math.random() * 20) + '%';
                el.style.setProperty('--dx', (Math.random() - 0.5) * 60 + 'px');
                area.appendChild(el);
                setTimeout(() => el.remove(), 1200);
            }, i * 130);
        }
    }

    spawnFloatingHearts(count) {
        const area = document.getElementById('character-area');
        const hearts = ['\u2764\uFE0F', '\uD83D\uDC95', '\uD83D\uDC96', '\u2728'];
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.className = 'floating-heart';
                heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
                heart.style.left = (30 + Math.random() * 60) + '%';
                heart.style.bottom = '20%';
                area.appendChild(heart);
                setTimeout(() => heart.remove(), 1500);
            }, i * 200);
        }
    }

    spawnSparkles(x, y) {
        const area = document.getElementById('character-area');
        for (let i = 0; i < 5; i++) {
            const spark = document.createElement('div');
            spark.className = 'sparkle';
            spark.style.left = (x + (Math.random() - 0.5) * 60) + 'px';
            spark.style.top = (y + (Math.random() - 0.5) * 60) + 'px';
            spark.style.background = ['#fff', '#f8bbd0', '#e91e63', '#ffeb3b'][Math.floor(Math.random() * 4)];
            area.appendChild(spark);
            setTimeout(() => spark.remove(), 800);
        }
    }

    showGameOver(message) {
        this.gameOverText.textContent = message;
        this.gameOverOverlay.classList.remove('hidden');
        sounds.sad();
    }

    hideGameOver() {
        this.gameOverOverlay.classList.add('hidden');
    }
}
