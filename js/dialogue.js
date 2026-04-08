// Typewriter effect + smart dialogue selection

// ── Player name token replacement ────────────────────────────
// Replaces {name} in any dialogue string with the stored player name.
// Falls back gracefully if no name has been set yet.
function applyPlayerName(text) {
    if (!text) return text;
    const name = localStorage.getItem('pp_player_name');
    if (!name) return text;
    return text.replace(/\{name\}/g, name);
}

class TypewriterEffect {
    constructor(element) {
        this.element = element;
        this.isTyping = false;
        this.fullText = "";
        this.currentIndex = 0;
        this.timer = null;
        this.speed = 35; // ms per character
        this.onComplete = null;

        // ── Mid-line emotion shift system ────────────────────────────────
        // onEmotionTrigger: fn(emotion) — wired in game.init() to ui._flashFaceOnly
        // _emotionTriggers: [{at, emotion, fired}] — positions parsed from [tag] markers
        // _autoShiftEmotion: fallback emotion for lines with no inline markers
        this.onEmotionTrigger  = null;
        this._emotionTriggers  = [];
        this._autoShiftEmotion = null;

        // Click to skip typing, or dismiss finished dialogue
        this.element.parentElement.addEventListener('click', () => {
            if (this.isTyping) {
                this.skip();
            } else if (this.element.textContent) {
                // Dismiss finished dialogue
                this.element.textContent = '';
                const hint = document.getElementById('dialogue-tap-hint');
                if (hint) hint.classList.add('hidden');
            }
        });
    }

    show(text, callback) {
        if (this.isTyping) {
            this.skip();
        }

        // ── Parse inline [emotion] shift markers ─────────────────────────
        // Format: "Some text[shy] continues here" → shifts face at that position.
        // Tags are stripped from display text; only their position is recorded.
        const VALID_EMOTIONS = new Set(['happy','sad','shy','love','angry','neutral','crying']);
        this._emotionTriggers = [];
        let rawText = applyPlayerName(text);
        // Proto 4th-wall token resolution — replace ${BOND} etc with actual values
        if (typeof window._game?._resolveProtoDialogue === 'function' && window._game?.selectedCharacter === 'proto') {
            rawText = window._game._resolveProtoDialogue(rawText);
        }
        let cleanText = '';
        let i = 0;

        while (i < rawText.length) {
            if (rawText[i] === '[') {
                const close = rawText.indexOf(']', i + 1);
                if (close !== -1) {
                    const tag = rawText.slice(i + 1, close);
                    if (VALID_EMOTIONS.has(tag)) {
                        // Record trigger at current clean-text position
                        this._emotionTriggers.push({ at: cleanText.length, emotion: tag, fired: false });
                        i = close + 1;
                        continue;
                    }
                }
            }
            cleanText += rawText[i];
            i++;
        }

        // ── Auto mid-shift for long lines with no authored markers ────────
        // Fires _autoShiftEmotion at the first natural pause point (ellipsis / mid-comma)
        // after the 28% mark, before the 72% mark. Creates organic emotional turns
        // on unmarkered lines without any dialogue editing.
        if (this._emotionTriggers.length === 0 && cleanText.length >= 72) {
            const searchFrom = Math.floor(cleanText.length * 0.28);
            const searchTo   = Math.floor(cleanText.length * 0.72);
            const pauseRe    = /\.{2,} |, /g;
            pauseRe.lastIndex = searchFrom;
            const m = pauseRe.exec(cleanText);
            if (m && m.index < searchTo) {
                this._emotionTriggers.push({ at: m.index + m[0].length, emotion: '_auto', fired: false });
            }
        }

        this.fullText = cleanText;
        this.currentIndex = 0;
        this.isTyping = true;
        this.onComplete = callback || null;
        this.element.textContent = "";
        // Hide tap hint when new dialogue starts
        const _hint = document.getElementById('dialogue-tap-hint');
        if (_hint) _hint.classList.add('hidden');

        // ── Ellipsis hesitation ───────────────────────────────────────────
        // Lines opening with silence get a pre-typing beat — character holds before speaking.
        const opensWithSilence = this.fullText.startsWith("...") ||
                                 this.fullText.startsWith("…")   ||
                                 this.fullText.startsWith("I…")  ||
                                 this.fullText.startsWith("I...");
        if (opensWithSilence) {
            setTimeout(() => this._type(), 260 + Math.random() * 200);
        } else {
            this._type();
        }
    }

    _type() {
        // ── Check for emotion shift triggers at this character position ───
        if (this.onEmotionTrigger && this._emotionTriggers.length) {
            for (const t of this._emotionTriggers) {
                if (!t.fired && t.at === this.currentIndex) {
                    t.fired = true;
                    const em = t.emotion === '_auto' ? this._autoShiftEmotion : t.emotion;
                    if (em) this.onEmotionTrigger(em);
                }
            }
        }

        if (this.currentIndex < this.fullText.length) {
            this.element.textContent += this.fullText[this.currentIndex];
            this.currentIndex++;
            this.timer = setTimeout(() => this._type(), this.speed);
        } else {
            this.isTyping = false;
            // Show "tap to continue" hint when typing finishes
            const hint = document.getElementById('dialogue-tap-hint');
            if (hint) {
                hint.classList.remove('hidden');
                // Hide after 4 seconds (auto-dismiss)
                setTimeout(() => hint.classList.add('hidden'), 4000);
            }
            if (this.onComplete) this.onComplete();
        }
    }

    skip() {
        if (!this.isTyping) return;
        clearTimeout(this.timer);
        this.element.textContent = this.fullText;
        this.isTyping = false;
        // Fire any remaining unfired triggers when player skips
        if (this.onEmotionTrigger && this._emotionTriggers.length) {
            for (const t of this._emotionTriggers) {
                if (!t.fired) {
                    t.fired = true;
                    const em = t.emotion === '_auto' ? this._autoShiftEmotion : t.emotion;
                    if (em) this.onEmotionTrigger(em);
                }
            }
        }
        if (this.onComplete) this.onComplete();
    }
}

class DialogueSystem {
    constructor(state) {
        this.state = state;
    }

    getDialogue(action, reaction = "normal", emotionalState = "neutral") {
        const s = this.state;
        const profile = CHARACTER.emotionalProfile || { volatility: 0.5, stability: 0.6 };

        // ── MEMORY CALLBACKS — rare echoes of past choices ────────
        if (Math.random() > 0.85 && s.choiceMemory) {
            const n = CHARACTER.name;
            if (s.choiceMemory.hesitatedConfession) {
                const pool = n === "Alistair"
                    ? ["You didn't answer me right away that time. I noticed.", "You took your time before responding... I've thought about that.", "You hesitated. I haven't forgotten."]
                    : ["You hesitated before... I still think about that.", "You didn't say it back right away. I understand, but I remember.", "Sometimes I wonder what you were thinking when you went quiet."];
                return this._random(pool);
            }
            if (s.choiceMemory.confessedBack) {
                const pool = n === "Alistair"
                    ? ["You said it back. I didn't expect that to stay with me.", "I still think about what you said. More than I should.", "That moment changed something. I'm still adjusting."]
                    : ["You said it back to me... I haven't forgotten.", "I keep thinking about what you said. I hope you meant it.", "That moment meant more than you probably know."];
                return this._random(pool);
            }
            if (s.choiceMemory.stayedSilentAfterBreak) {
                const pool = n === "Alistair"
                    ? ["You didn't say anything — but you stayed. That counted.", "Silence can still mean something. Yours did.", "You didn't have to explain yourself. You being there was enough."]
                    : ["You stayed quiet... but you were still there.", "Sometimes not saying anything is an answer. I understood yours.", "You didn't say a word. But you stayed. That was enough."];
                return this._random(pool);
            }
        }

        // CORRUPTION OVERRIDE
        if (s.corruptionState === "corrupted") {
            return this._random(CHARACTER.stateDialogue.corrupted);
        }

        // TENSION OVERRIDE — high tension pulls from unstable pool
        if (CHARACTER.name === "Lyra" && s.tensionStage >= 2 && CHARACTER.stateDialogue?.unstable && Math.random() > 0.55) {
            return this._random(CHARACTER.stateDialogue.unstable);
        }

        // LOW CORRUPTION BLEED — subtle darkness before full corruption
        if (s.corruption > 18 && s.corruptionState !== "corrupted" && Math.random() > 0.78) {
            return this._random(CHARACTER.stateDialogue?.unsettled || [
                "You always come back... right?",
                "I don't like it when you're gone.",
                "You're not going to disappear, are you?"
            ]);
        }

        // MILESTONE CHECK (special one-time events)
        const milestone = this.checkMilestone(action);
        if (milestone) return milestone;

        // POST-LUCIEN ECHO — first 4 interactions after the scene carry its weight
        // Fires at 55% chance while echo turns remain, then decays naturally.
        if (CHARACTER.name === 'Lyra' && (this.state._postLucienEchoTurns ?? 0) > 0 && Math.random() < 0.55) {
            const echoPool = [
                "…that didn't feel finished.",
                "He's still there, isn't he.",
                "…you felt that too.",
                "Something changed after that.",
                "…stay close for a bit.",
                "I don't know what to do with what just happened.",
                "…he said things I can't unhear."
            ];
            const echoLine = this._filterRecent(echoPool, this.state);
            if (echoLine) {
                this.state._addRecentLine?.(echoLine);
                return echoLine;
            }
        }

        // RETURN STATE — first 4 interactions after 6h+ absence carry distance
        // Fires at 45% chance while return turns remain.
        if (CHARACTER.name === 'Lyra' && (this.state._returnStateTurns ?? 0) > 0 && Math.random() < 0.45) {
            const returnPool = [
                "…I'm still adjusting to you being back.",
                "Don't act like nothing happened.",
                "…it takes a second to trust this again.",
                "You were gone.",
                "…I noticed more than I should have.",
                "I had time to think. …that's not always good."
            ];
            const returnLine = this._filterRecent(returnPool, this.state);
            if (returnLine) {
                this.state._addRecentLine?.(returnLine);
                return returnLine;
            }
        }

        // DEEP EMOTIONAL ANCHOR — rare, high-bond moment line (bond 65+, Day 5+)
        // Fires at 8% — low enough to feel earned, high enough to appear eventually.
        if (CHARACTER.name === 'Lyra' && (this.state.storyDay ?? 1) >= 5
                && (this.state.bond ?? 0) >= 65 && Math.random() < 0.08) {
            const s = this.state;
            const obs = s.emotion?.obsession ?? 0;
            if (obs > 40 && s.tensionStage <= 1) {
                const deepLine = "I don't know what this becomes… but I feel it changing me.";
                if (!this.state._wasRecentLine?.(deepLine)) {
                    this.state._addRecentLine?.(deepLine);
                    return deepLine;
                }
            }
        }

        // PERSONALITY PROFILE DIALOGUE — Day 4+ per-state deep variations
        // Fires before phase check (higher emotional specificity).
        // 30% chance when a non-neutral profile is active on Day 4+.
        if (CHARACTER.name === 'Lyra' && (this.state.storyDay ?? 1) >= 4) {
            const _profile = this.state.getPersonalityProfile?.() ?? 'neutral';
            if (_profile !== 'neutral' && Math.random() < 0.30) {
                const profileLine = this._getLyraProfileDialogue(action, _profile);
                if (profileLine) {
                    this.state._addRecentLine?.(profileLine);
                    return profileLine;
                }
            }
        }

        // PHASE-AWARE LYRA DAILY DIALOGUE — surfaces more as relationship deepens
        // cold=20% · cracked=38% · attached=50% · postLucien=65%
        if (CHARACTER.name === 'Lyra' && this.state.lyraPhase) {
            const phaseChance = { cold: 0.20, cracked: 0.38, attached: 0.50, postLucien: 0.65 };
            const chance = phaseChance[this.state.lyraPhase] ?? 0;
            if (Math.random() < chance) {
                const phaseLine = this._getLyraPhaseDialogue(action, this.state.lyraPhase);
                if (phaseLine) {
                    this.state._addRecentLine?.(phaseLine);
                    return phaseLine;
                }
            }
        }

        // EMOTIONAL STATE OVERRIDE — hidden system, triggers occasionally
        const overrideChance = 0.15 + (profile.volatility * 0.08);
        if (Math.random() < overrideChance) {
            const override = this._getEmotionalOverride(emotionalState);
            if (override) return override;
        }

        // REACTION-BASED (from variable talk() mood roll)
        if (reaction === "sad") {
            const pool = CHARACTER.stateDialogue?.distant || CHARACTER.stateDialogue?.neglected;
            if (pool) return this._pickFresh(pool, this.state);
        }

        // NEGLECT CHECK (more than 30 seconds since last action)
        if (s.lastInteractionTime > 0 && (Date.now() - s.lastInteractionTime) > 30000) {
            return this._pickFresh(CHARACTER.stateDialogue.neglected, this.state);
        }

        // MEMORY-BASED (after enough interactions)
        // Helper: pick from a pool whether it's an array or legacy string
        const memPick = (pool) => Array.isArray(pool) ? this._random(pool) : pool;

        // Deep-tier memory echoes (Alistair only — fire at high counts, lower priority)
        if (CHARACTER.name === "Alistair") {
            const md = CHARACTER.memoryDialogue;
            if (s.timesFed >= 35  && action === "feed"  && md.fedOftenDeep    && Math.random() > 0.65) return memPick(md.fedOftenDeep);
            if (s.timesTalked >= 50 && action === "talk" && md.talkedOftenDeep && Math.random() > 0.65) return memPick(md.talkedOftenDeep);
        }

        if (s.timesFed > 10    && action === "feed"  && Math.random() > 0.62) return memPick(CHARACTER.memoryDialogue.fedOften);
        if (s.timesTalked > 10 && action === "talk"  && Math.random() > 0.62) return memPick(CHARACTER.memoryDialogue.talkedOften);
        if (s.timesWashed > 8  && action === "wash"  && Math.random() > 0.62) return memPick(CHARACTER.memoryDialogue.washedOften);
        if (s.timesGifted > 10 && action === "gift"  && Math.random() > 0.62) return memPick(CHARACTER.memoryDialogue.giftedOften);
        if (s.timesTrained > 10 && action === "train" && Math.random() > 0.62) return memPick(CHARACTER.memoryDialogue.trainedOften);

        // AFFECTION-BASED
        if (s.affectionLevel >= 3 && Math.random() > 0.6) return this._pickFresh(CHARACTER.stateDialogue.happy, this.state);
        if (s.affectionLevel === 0 && s.affection < 5) return "I don't really know you yet...";

        // STATE-BASED (urgent needs first)
        if (s.hunger < 25) return this._pickFresh(CHARACTER.stateDialogue.hungry, this.state);
        if (s.clean < 25)  return this._pickFresh(CHARACTER.stateDialogue.dirty, this.state);
        if (s.bond > 75)   return this._pickFresh(CHARACTER.stateDialogue.happy, this.state);

        // PERSONALITY-BASED
        const pool = CHARACTER.personalities[s.personality];
        if (pool && pool[action]) return this._pickFresh(pool[action], this.state);

        // TIME-OF-DAY (small chance)
        if (Math.random() > 0.7) {
            const timePool = CHARACTER.timeDialogue[s.timeOfDay];
            if (timePool) return this._pickFresh(timePool, this.state);
        }

        // FALLBACK
        return this._pickFresh(CHARACTER.stateDialogue.neutral, this.state);
    }

    // Emotional state override — character-specific, uses eventDialogue pools if defined
    _getEmotionalOverride(emotionalState) {
        const dialogue = CHARACTER.eventDialogue || {};
        const n = CHARACTER.name;

        const defaults = {
            obsessed: n === "Alistair"
                ? ["You're distracting me. I've decided that's your fault.", "I keep thinking about you when I should be running drills.", "Don't stay away too long. That's not a request."]
                : ["Why do I feel like I need you here all the time...", "I keep thinking about you even when I try not to.", "Don't stay away too long... I don't like it."],
            unstable: n === "Alistair"
                ? ["Something's off. I can't get my footing today.", "I keep running the same thoughts on rotation.", "Don't disappear on me right now."]
                : ["Don't disappear on me again.", "I can't breathe when you're gone too long.", "Something feels wrong when you're not here."],
            guarded: n === "Alistair"
                ? ["I'm still deciding if I trust this.", "Old habits. Knights watch for traps.", "You haven't given me reason to doubt. I'm working on accepting that."]
                : ["Sirens don't trust easily. I'm still learning how.", "I want to trust this. I'm scared to.", "This feels too good. I keep waiting for the tide to turn."],
            secure: n === "Alistair"
                ? ["This feels steady. I didn't know things could feel steady.", "I don't question this anymore. That took a while.", "I feel calm when you're here. Properly calm."]
                : ["I feel calm when you're here. I like that.", "I don't question this anymore.", "The water feels warmer since you came."]
        };

        const pool = (dialogue[emotionalState] && dialogue[emotionalState].length)
            ? dialogue[emotionalState]
            : defaults[emotionalState];

        return pool ? this._random(pool) : null;
    }

    // ===== TIME-AWAY REACTION =====
    getTimeAwayReaction(minutesAway) {
        const reactions = CHARACTER.timeAwayReactions;
        if (!reactions) return null;

        if (minutesAway < 1) return null;
        if (minutesAway < 5) return this._random(reactions.brief || []);
        if (minutesAway < 30) return this._random(reactions.short || []);
        if (minutesAway < 120) return this._random(reactions.medium || []);
        if (minutesAway < 480) return this._random(reactions.long || []);
        if (minutesAway < 1440) return this._random(reactions.veryLong || []);
        return this._random(reactions.extreme || []);
    }

    // ===== MILESTONE CHECKER =====
    checkMilestone(action) {
        const s = this.state;
        const triggered = s.triggeredMilestones || [];
        const events = CHARACTER.milestoneEvents;
        if (!events) return null;
        const totalInteractions = s.timesFed + s.timesWashed + s.timesTalked + s.timesGifted + s.timesTrained;

        for (const [key, event] of Object.entries(events)) {
            // Skip already triggered
            if (triggered.includes(key)) continue;

            const t = event.trigger;
            let match = true;

            // Check each trigger condition
            if (t.timesFed !== undefined && s.timesFed < t.timesFed) match = false;
            if (t.timesWashed !== undefined && s.timesWashed < t.timesWashed) match = false;
            if (t.timesTalked !== undefined && s.timesTalked < t.timesTalked) match = false;
            if (t.timesGifted !== undefined && s.timesGifted < t.timesGifted) match = false;
            if (t.timesTrained !== undefined && s.timesTrained < t.timesTrained) match = false;
            if (t.totalInteractions !== undefined && totalInteractions < t.totalInteractions) match = false;
            if (t.affectionLevel !== undefined && s.affectionLevel < t.affectionLevel) match = false;
            if (t.corruption !== undefined && s.corruption < t.corruption) match = false;
            if (t.personality !== undefined && s.personality !== t.personality) match = false;
            if (t.revivedOnce !== undefined && !s.revivedOnce) match = false;

            if (match) {
                // Mark as triggered
                if (!s.triggeredMilestones) s.triggeredMilestones = [];
                s.triggeredMilestones.push(key);

                // Flash the appropriate emotion
                if (event.emotion && s.ui) {
                    s.ui.flashEmotion(event.emotion, 4000);
                }

                return event.dialogue;
            }
        }

        return null; // No milestone triggered
    }

    // ── Phase-aware daily dialogue bank ──────────────────────────────
    // Returns a line for Lyra based on current action × phase, or null.
    // postLucien branches further by balance state (who's winning: player/unstable/lucien).
    // Lines are specific enough to feel personal, short enough to land fast.
    _getLyraPhaseDialogue(action, phase) {
        // postLucien sub-states — same phase, different emotional position
        if (phase === 'postLucien' && this.state._getBalanceState) {
            const sub = this.state._getBalanceState();
            const postBank = {
                talk: {
                    player:   ["…You didn't leave.", "You're the one who stayed.", "You make things… easier than I expected.", "…I trust you. A little.", "You're nothing like what I thought you'd be."],
                    unstable: ["…You're still here.", "You didn't take it back.", "…I remember what you said.", "You make things… complicated.", "…He thinks you'll leave.", "…You haven't.", "You're not what I expected.", "…Stay like this."],
                    lucien:   ["…He said you'd come back. He was right.", "You always show up. I'm not sure how to feel about that anymore.", "…He knows things about me. Different things than you.", "I don't know whose side I'm on."]
                },
                feed: {
                    player:   ["…You always come back to this.", "You're consistent. It's starting to matter.", "You don't forget. I noticed.", "…I like that you do this."],
                    unstable: ["…You're still doing this.", "You didn't stop after that.", "…You're not like him.", "You don't make it feel like a debt.", "…I notice."],
                    lucien:   ["…He doesn't do this.", "You're trying harder than usual.", "…I don't know if that's good or not."]
                },
                wash: {
                    player:   ["…You're careful with me.", "You don't rush.", "I feel it when you pay attention like this.", "…Stay like this."],
                    unstable: ["…You're different from him.", "…Stay like this.", "You don't rush.", "…I feel it."],
                    lucien:   ["…He doesn't do this either. Or maybe he does.", "You're gentle. I'm watching for when that changes."]
                },
                train: {
                    player:   ["…You keep pushing me forward.", "You believe in this more than I do.", "…You didn't give up.", "You're serious about this."],
                    unstable: ["…You didn't back down.", "You're serious about this.", "…Even after everything.", "You're still trying."],
                    lucien:   ["…He thinks you're doing this wrong.", "You push hard. He pushes differently.", "…I keep comparing. I hate that I do."]
                },
                gift: {
                    player:   ["…You remembered exactly.", "You know things about me that I didn't tell you.", "…I didn't stop you.", "You're getting closer. I'm letting you."],
                    unstable: ["…You remember things about me.", "…That's dangerous.", "You're getting closer.", "…I didn't stop you."],
                    lucien:   ["…He gave me something once too.", "You're both doing this. It feels like a game.", "…I don't know which one of you I should trust."]
                }
            };
            const pool = postBank[action]?.[sub];
            if (pool?.length) return this._random(pool);
        }

        const bank = {
            talk: {
                // cold — shut down, not engaging
                cold: [
                    "What is it this time.",
                    "You don't need to keep coming back.",
                    "…You're persistent. I'll give you that.",
                    "I'm not as interesting as you think.",
                    "You're expecting something from me.",
                    "Don't look at me like that.",
                    "You're wasting your time here.",
                    "…Still here.",
                    "You're… quiet.",
                    "Good. I don't like loud people.",
                    "You don't say much.",
                    "…I don't mind."
                ],
                // cracked — walls starting to show cracks, noticing the player
                cracked: [
                    "…You came back again.",
                    "You're starting to become predictable.",
                    "I don't mind the silence. With you.",
                    "…You don't push. That's… unusual.",
                    "You always wait before speaking.",
                    "You're trying to understand me.",
                    "…I notice things like that.",
                    "I tried not to think about it.",
                    "…but I did.",
                    "You're different.",
                    "…I can't tell how yet.",
                    "I can feel you watching.",
                    "…it's not uncomfortable.",
                    "You don't push.",
                    "…that's rare.",
                    "...you're thinking something.",
                    "You pause like that a lot.",
                    "...you're not as predictable as you think."
                ],
                // attached — walls down, vulnerable
                attached: [
                    "You always show up when I'm like this.",
                    "…Why do you stay?",
                    "You could leave. It would be easier.",
                    "…I don't know what to do with this.",
                    "You make things feel… less heavy.",
                    "…Don't get used to this version of me.",
                    "I wasn't expecting you today.",
                    "If you stopped showing up…",
                    "…no. never mind.",
                    "I keep checking for you.",
                    "…it's annoying.",
                    "You're becoming part of this.",
                    "…of me.",
                    "Were you with someone else?",
                    "…don't answer that.",
                    "Stay with me.",
                    "…just for now.",
                    "I notice when you're distracted.",
                    "…it shows.",
                    "You make this quieter.",
                    "…in a good way.",
                    "I don't like waiting.",
                    "…but I do it anyway.",
                    "...I notice the small things you do.",
                    "...say it properly this time.",
                    "That almost meant something.",
                    "You're affecting me.",
                    "...I don't know what to do with that."
                ]
            },
            feed: {
                cold: [
                    "You didn't have to.",
                    "This is unnecessary.",
                    "…I could've done that myself.",
                    "You're trying too hard.",
                    "…Why bother.",
                    "You think that fixes things?",
                    "…don't make it a habit."
                ],
                cracked: [
                    "…Thanks.",
                    "You always do this without asking.",
                    "…You're consistent.",
                    "You remember things like this.",
                    "…I don't dislike it.",
                    "…you always do this at the right time.",
                    "…it's annoying.",
                    "…you remembered.",
                    "…no one ever does."
                ],
                attached: [
                    "…You're taking care of me.",
                    "I'm not used to that.",
                    "…It feels strange.",
                    "You don't expect anything back?",
                    "…That's new.",
                    "…thank you.",
                    "…I mean that.",
                    "Stop trying to fix everything.",
                    "…you don't even understand what's wrong."
                ]
            },
            wash: {
                cold: [
                    "I can handle myself.",
                    "…You don't need to do that.",
                    "This is unnecessary.",
                    "…Stop hovering.",
                    "Careful…",
                    "…I'm not something you can reset."
                ],
                cracked: [
                    "…Fine.",
                    "Just don't make it awkward.",
                    "…You're careful.",
                    "You think I'll let you?",
                    "You don't rush.",
                    "…I like that."
                ],
                attached: [
                    "…You're gentle.",
                    "I didn't expect that.",
                    "…You're paying attention.",
                    "That's… different.",
                    "…You're careful with me.",
                    "I feel it when you pay attention like this."
                ]
            },
            train: {
                cold:     ["This won't change anything.", "…You're stubborn.", "Why do you keep trying.", "…Pointless."],
                cracked:  ["…You think this helps?", "You're pushing me.", "…You don't give up.", "That's… annoying."],
                attached: ["…You believe I can do this.", "I'm not sure I do.", "…You're still here.", "Even now."]
            },
            gift: {
                cold: [
                    "I don't need this.",
                    "…Why give me this.",
                    "You're wasting resources.",
                    "…Unnecessary."
                ],
                cracked: [
                    "…You chose this?",
                    "You thought of me.",
                    "…That's unusual.",
                    "You pay attention.",
                    "…You remembered.",
                    "You know things about me I didn't tell you."
                ],
                attached: [
                    "…For me?",
                    "You didn't have to.",
                    "…I don't know what to say.",
                    "You make this difficult.",
                    "…You're getting closer.",
                    "…I didn't stop you.",
                    "Don't split yourself.",
                    "…I want all of it."
                ]
            }
        };

        const actionBank = bank[action];
        if (!actionBank) return null;
        const pool = actionBank[phase];
        if (!pool || !pool.length) return null;
        return this._random(pool);
    }

    // ── Anti-repetition filter ───────────────────────────────────────────
    // Removes recently-shown lines from a pool before selecting.
    // Falls back to the full pool if all lines have been recently shown.
    _filterRecent(pool, state) {
        if (!state?._wasRecentLine || !pool?.length) return this._random(pool);
        const fresh = pool.filter(l => !state._wasRecentLine(l));
        return this._random(fresh.length > 0 ? fresh : pool);
    }

    // ── Pick fresh + register ────────────────────────────────────────────
    // Combines _filterRecent + _addRecentLine in one call.
    // Used throughout the general dialogue path so ALL pools deduplicate.
    _pickFresh(pool, state) {
        const line = this._filterRecent(pool, state);
        state?._addRecentLine?.(line);
        return line;
    }

    // ── Lyra tiered idle dialogue ────────────────────────────────────────
    // Called from scheduleIdleDialogue() in ui.js when CHARACTER is Lyra.
    // Tier is determined by time since last interaction:
    //   short  = 15–30s   — she notices the pause, quick and profile-aware
    //   medium = 30–90s   — internal drift, starting to wonder
    //   long   = 90s+     — vulnerable, anxiety-adjacent, almost a push
    getLyraIdleLine(tier, profile) {
        // Short tier uses per-profile idle lines from the profile dialogue bank
        if (tier === 'short' && profile && profile !== 'neutral') {
            const profileLine = this._getLyraProfileDialogue('idle', profile);
            if (profileLine) return profileLine;
        }

        const pools = {
            short: [
                "...still here.",
                "I like this quiet.",
                "...you stopped.",
                "Did I lose you?",
                "Say something.",
                "...you're there, right?"
            ],
            medium: [
                "You drift sometimes.",
                "...I notice.",
                "I start thinking too much when it's quiet.",
                "...you're still there, right?",
                "This silence is loud.",
                "...I don't like waiting.",
                "Something's off.",
                "...or maybe it's me.",
                "...you always slow down here.",
                "This is when it gets quiet between us.",
                "...I start noticing patterns when you stop.",
                "You're still there. Just... distant.",
                "...don't drift too far."
            ],
            long: [
                "...this feels like leaving.",
                "I don't like when it gets like this.",
                "...say something before I assume things.",
                "I was here.",
                "...still am.",
                "You went quiet.",
                "...I'm starting to feel it.",
                "...don't disappear right now."
            ]
        };

        const pool = pools[tier] || pools.short;
        return this._filterRecent(pool, this.state);
    }

    // ── Per-personality-profile deep dialogue ────────────────────────────
    // Fires at Day 4+ when getPersonalityProfile() returns a non-neutral state.
    // Same action, completely different emotional register per profile.
    // Covers: feed · talk · idle — the three highest-frequency action types.
    _getLyraProfileDialogue(action, profile) {
        const bank = {
            feed: {
                secure: [
                    "...you always notice.",
                    "I didn't even have to ask.",
                    "...I like that about you.",
                    "You do this naturally."
                ],
                clingy: [
                    "You remembered again.",
                    "...you always do.",
                    "Don't stop doing this.",
                    "...please don't.",
                    "I was waiting for this."
                ],
                anxious: [
                    "You almost didn't.",
                    "...I thought you forgot.",
                    "It's fine.",
                    "...no — it's not.",
                    "I shouldn't care this much.",
                    "...but I do."
                ],
                withdrawn: [
                    "...thanks.",
                    "You didn't have to.",
                    "I was fine.",
                    "...really.",
                    "It's unnecessary."
                ],
                chaotic: [
                    "Why now?",
                    "...what changed?",
                    "You think this fixes it?",
                    "...maybe it does.",
                    "Don't make patterns.",
                    "...I notice patterns."
                ]
            },
            talk: {
                secure: [
                    "I like when you stay like this.",
                    "...it's easy.",
                    "You don't force things.",
                    "...it works."
                ],
                clingy: [
                    "Say more.",
                    "...don't stop.",
                    "I like hearing you.",
                    "...even if it's nothing.",
                    "Stay here."
                ],
                anxious: [
                    "...that's all?",
                    "I thought you'd say more.",
                    "You're hard to read.",
                    "...I don't like that.",
                    "You're here but not fully."
                ],
                withdrawn: [
                    "You don't need to fill the silence.",
                    "...it's fine.",
                    "I prefer this.",
                    "...less expectation."
                ],
                chaotic: [
                    "You're different today.",
                    "...I don't trust that.",
                    "You shift too much.",
                    "...or maybe I do.",
                    "Say it again.",
                    "...no, don't."
                ]
            },
            idle: {
                secure: [
                    "...you're still here.",
                    "Good."
                ],
                clingy: [
                    "...you stopped.",
                    "Don't drift away.",
                    "...stay with me."
                ],
                anxious: [
                    "...did I say something wrong?",
                    "You're quieter now.",
                    "...I noticed."
                ],
                withdrawn: [
                    "...better this way."
                ],
                chaotic: [
                    "Silence again.",
                    "...it never lasts.",
                    "Something always breaks it."
                ]
            }
        };

        const actionBank = bank[action];
        if (!actionBank) return null;
        const pool = actionBank[profile];
        if (!pool || !pool.length) return null;
        return this._random(pool);
    }

    // ── Micro-reaction follow-up lines ───────────────────────────────────
    // Returns a short "afterthought" line that can be chained after the
    // primary dialogue line via _showMicroSequence() in game.js.
    // Only called for anxious / chaotic profiles at high tension.
    getLyraMicroFollow(profile) {
        const follows = {
            anxious: [
                "...I'm fine.",
                "...forget I said that.",
                "...no, it's not fine.",
                "...I'm not saying it again.",
                "...just — never mind."
            ],
            chaotic: [
                "...don't do that again.",
                "...actually, do.",
                "...I don't know what I want.",
                "...forget it.",
                "...I change my mind."
            ]
        };
        const pool = follows[profile];
        if (!pool) return null;
        return this._random(pool);
    }

    _random(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}
