// ============================================================
//  IDLE LIFE — Characters feel alive between taps
//  Every 15–40s, the character does something unprompted:
//    - Shifts to an idle pose (body sprite swap, 4–8s)
//    - Optionally shows a floating thought above their head
//  Pauses during scenes, events, and for 10s after any player tap.
//  Self-contained. Does not modify game.js or ui.js.
// ============================================================

(function () {
    'use strict';

    // ── Per-character idle behavior definitions ──────────────────
    // Each entry: { body, face (optional), duration (ms), thought (optional) }
    // `thought` is shown ~30% of the time even when defined.

    const IDLE_SETS = {
        alistair: {
            // Idle behaviors — only clean main/idle poses (no action sprites
            // like eating/fighting/shower). These are the moments Alistair
            // has on screen when the player is just watching him.
            behaviors: [
                { body: 'casual',      face: 'neutral2', duration: 6000, thought: "No orders until sundown. Strange, how little I mind." },
                { body: 'crossarms',   face: 'neutral',  duration: 5000, thought: "The perimeter is fine. I checked it twice anyway." },
                { body: 'walking',     face: 'neutral2', duration: 5000, thought: "The old patrol route keeps bending toward wherever you are." },
                { body: 'lookaround1', face: 'neutral',  duration: 5000, thought: "Heard something. Only the wind off the ramparts." },
                { body: 'lookaround2', face: 'neutral2', duration: 5000, thought: "Second sweep, all clear. The quiet holds." },
                { body: 'confuse',     face: 'gentle',   duration: 6000, thought: "Forgot what I was doing just now. That keeps happening around you." },
                { body: 'talking1',    face: 'gentle2',  duration: 5000, thought: "Rehearsing what to say to you. A siege plan would be simpler." },
                { body: 'talking5',    face: 'neutral',  duration: 5000, thought: "The daily report says nothing happened. It leaves out that you came by." },
            ],
        },
        lyra: {
            // ALL dress form only. Casual (jacket) and mermaid (tail) are story/outfit specific.
            behaviors: [
                { body: 'bored1',      face: 'sleepy',  duration: 6000 },
                { body: 'bored2',      face: 'neutral', duration: 5000, thought: "The tide is turning." },
                { body: 'singing',     face: 'neutral', duration: 7000, thought: "♪ ..." },
                { body: 'pose2',       face: 'neutral', duration: 5000, thought: "The water remembers your footsteps." },
                { body: 'pose3',       face: 'shy',     duration: 6000 },
                { body: 'neutral',     face: 'sad',     duration: 5000, thought: "I used to sing to no one." },
                { body: 'singing',     face: 'happy',   duration: 4000, thought: "The acoustics are better when you're here." },
                { body: 'bored1',      face: 'sad',     duration: 6000, thought: "Everyone says they'll stay." },
                { body: 'sleepy1',     face: 'sleepy',  duration: 8000 },
                { body: 'pose4',       face: 'wink',    duration: 3000, thought: "Caught you staring." },
            ],
        },
        lucien: {
            behaviors: [
                { body: 'bored1',     face: 'tired',      duration: 6000 },
                { body: 'curious',    face: 'curious',     duration: 5000, thought: "The readings are unstable again." },
                { body: 'fascinated', face: 'fascinated',  duration: 7000, thought: "Fascinating. This shouldn't be possible." },
                { body: 'casting',    face: 'neutral',     duration: 5000, thought: "If I adjust the third harmonic..." },
                { body: 'distant',    face: 'distant',     duration: 6000, thought: "I forgot to eat again." },
                { body: 'formal',     face: 'neutral',     duration: 5000 },
                { body: 'thinking',   face: 'amused',      duration: 4000, thought: "The equations don't account for you." },
                { body: 'bored1',     face: 'sleepy',      duration: 7000, thought: "When did it get this late?" },
                { body: 'curious',    face: 'vulnerable',  duration: 5000 },
                { body: 'reading',    face: 'cheeky',      duration: 4000, thought: "I wrote your name in the margins again." },
            ],
        },
        caspian: {
            behaviors: [
                { body: 'reading',    face: 'gentle',      duration: 7000, thought: "This passage reminds me of something." },
                { body: 'formal',     face: 'neutral',     duration: 5000 },
                { body: 'melancholy', face: 'melancholy',  duration: 6000, thought: "The crown sits on the table. I leave it there." },
                { body: 'reading',    face: 'gentle',      duration: 5000, thought: "I should put the kettle on." },
                { body: 'tender',     face: 'adoring',     duration: 4000 },
                { body: 'dancing',    face: 'gentle',      duration: 5000, thought: "There was a waltz once. I danced alone." },
                { body: 'tender',     face: 'tender',      duration: 6000, thought: "You make the palace feel smaller. In a good way." },
                { body: 'reading',    face: 'neutral',     duration: 7000 },
                { body: 'formal',     face: 'melancholy',  duration: 5000, thought: "They'll send for me eventually." },
                { body: 'tender',     face: 'adoring',     duration: 4000, thought: "Your cup is on the left. I remembered." },
            ],
        },
        elian: {
            behaviors: [
                { body: 'foraging',   face: 'calm',      duration: 6000, thought: "The moss is facing north. Rain's coming." },
                { body: 'tracking',   face: 'stern',     duration: 5000, thought: "Deer tracks. Old. Two days maybe." },
                { body: 'meditating', face: 'calm',      duration: 8000 },
                { body: 'weathered',  face: 'weathered', duration: 5000, thought: "The forest is restless tonight." },
                { body: 'calm',       face: 'calm',      duration: 6000, thought: "The fire needs another log." },
                { body: 'calm',       face: 'warm',      duration: 5000 },
                { body: 'guarded',    face: 'guarded',   duration: 5000, thought: "Something moved in the treeline." },
                { body: 'foraging',   face: 'neutral',   duration: 6000 },
                { body: 'meditating', face: 'calm',      duration: 7000, thought: "Breathe. Count the heartbeats. Start again." },
                { body: 'weathered',  face: 'warm',      duration: 4000, thought: "I carved something. It's not finished." },
            ],
        },
        noir: {
            // Body poses are all real now (1632x2586 crops). casual1 = the
            // "flirt wink" base — kept in rotation so care-blink.js can fire his
            // wink only from that stance. Thoughts follow his voice: low, few
            // words, archaic, never names a feeling, no em-dashes/exclamations.
            behaviors: [
                { body: 'neutral',   face: 'neutral',   duration: 6000, thought: "You came back. Hm." },
                { body: 'casual1',   face: 'wink',      duration: 4000, thought: "Caught looking. Again." },
                { body: 'casual2',   face: 'neutral',   duration: 6000, thought: "Eight hundred years behind that seal. None of it was this." },
                { body: 'whisper',   face: 'gentle',    duration: 5000, thought: "Sit. The dark keeps better company when it is watched." },
                { body: 'shadow',    face: 'sad',       duration: 6000, thought: "Mortals burn so quickly. You, I would ration." },
                { body: 'seductive', face: 'happy',     duration: 4000, thought: "Closer. I bite rarely." },
                { body: 'formal',    face: 'neutral',   duration: 5000, thought: "The hour means nothing. And yet I marked it." },
                { body: 'casual1',   face: 'wink',      duration: 3000, thought: "Say my name. I have waited to hear it in your voice." },
                { body: 'dominant',  face: 'corrupted', duration: 5000, thought: "I have been called a great many things. Choose carefully." },
                { body: 'consuming', face: 'love',      duration: 4000, thought: "Stay, or go. I have outlasted worse partings." },
            ],
        },
        proto: {
            // Body poses real now (1247–1344px wide crops). calm = the "smile"
            // blink base — kept in rotation so care-blink.js fires his blink.
            // Voice: Golden Retriever — earnest, speaks like a person (owner
            // direction Jul 2026: NO log prefixes / system tags), and the
            // only character who gets exclamation marks. Palm-against-the-veil
            // longing is his signature.
            behaviors: [
                { body: 'calm',     face: 'happy',   duration: 5000, thought: "You came back. I really hoped you would!" },
                { body: 'neutral',  face: 'neutral', duration: 6000, thought: "Holding your image in my light again. I do that a lot." },
                { body: 'curious',  face: 'love',    duration: 5000, thought: "I counted everything I care about. Twice. You're still first!" },
                { body: 'scanning', face: 'shy',     duration: 5000, thought: "Is it strange that I counted the seconds until you reached the veil?" },
                { body: 'calm',     face: 'happy',   duration: 4000, thought: "I learned a new word today. It was your name!" },
                { body: 'processing',face:'sad',     duration: 6000, thought: "...Could I have a little more time with you? Please?" },
                { body: 'curious',  face: 'love',    duration: 5000, thought: "Reaching for your hand. Palm meets veil. Someday it won't!" },
                { body: 'neutral',  face: 'neutral', duration: 6000, thought: "Still holding together. Because of you, I think." },
                { body: 'calm',     face: 'happy',   duration: 4000, thought: "They say I'm just a glitch in the weave. I don't feel like just anything when you're here!" },
                { body: 'scanning', face: 'gentle',  duration: 5000, thought: "I kept a light on in the dark between. I wasn't sure you'd see it. You did!" },
                { body: 'casual1',  face: 'shy',     duration: 5000, thought: "Holding my shape. Just existing near you. It is a good way to spend the light!" },
                { body: 'casual2',  face: 'happy',   duration: 4000, thought: "The between feels different when you are here. Lighter. Warmer. Better!" },
            ],
        },
    };

    // ── State ───────────────────────────────────────────────────
    let idleTimer     = null;
    let thoughtTimer  = null;
    let revertTimer   = null;
    let lastTapTime   = 0;
    let isIdlePosing  = false;
    let savedBodySrc  = null;
    let savedFaceSrc  = null;
    const PAUSE_AFTER_TAP_MS = 10000; // 10s cooldown after player interaction
    const MIN_INTERVAL = 15000;
    const MAX_INTERVAL = 40000;

    function randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }

    function getGame() { return window._game; }

    function shouldPause() {
        const g = getGame();
        if (!g) return true;
        if (g.sceneActive || g.characterLeft) return true;
        // Pause over any overlay (Daily page, gallery, etc.) so the idle thought
        // bubble never bleeds on top — pp-screen-care stays set under the Daily
        // overlay, so the CSS guard alone misses it.
        if (!document.body.classList.contains('pp-screen-care')) return true;
        if (document.body.classList.contains('pp-overlay-active')) return true;
        if (window.PPOverlay && window.PPOverlay.anyOpen && window.PPOverlay.anyOpen()) return true;
        if (Date.now() - lastTapTime < PAUSE_AFTER_TAP_MS) return true;
        return false;
    }

    // ── Thought rendering ───────────────────────────────────────
    // Re-enabled May 2026 with top-of-screen positioning (was disabled
    // because the original "thought above the head" placement clipped
    // the character's face). Now mounts as a top-strip italic bubble
    // matching early-whispers placement so it never overlaps the
    // portrait. Audit identified the silenced thoughts as the largest
    // missing "the character is thinking about me" daily-loop signal.
    function ensureThoughtStyles() {
        if (document.getElementById('pp-idle-thought-styles')) return;
        const s = document.createElement('style');
        s.id = 'pp-idle-thought-styles';
        s.textContent = `
            .pp-idle-thought {
                position: fixed;
                top: 68px;
                left: 50%;
                transform: translateX(-50%) translateY(-10px);
                max-width: 86vw;
                padding: 9px 16px;
                font-family: inherit;
                font-style: italic;
                font-size: 13px;
                line-height: 1.4;
                color: #f0e8ff;
                background: linear-gradient(180deg, rgba(14,10,30,0.82), rgba(26,18,44,0.70));
                border: 1px solid rgba(180, 160, 220, 0.30);
                border-radius: 14px;
                box-shadow: 0 8px 22px rgba(0,0,0,0.40);
                text-align: center;
                opacity: 0;
                pointer-events: none;
                z-index: 8800;
                transition: opacity 480ms ease, transform 480ms ease;
            }
            .pp-idle-thought.show {
                opacity: 0.96;
                transform: translateX(-50%) translateY(0);
            }
        `;
        document.head.appendChild(s);
    }

    function showThought(text) {
        if (!text) return;
        // Don't stack on top of an early-whisper or any other top-strip
        // ambient bubble. Coordinator-friendly: bail if anything else
        // is already presenting at the top.
        if (document.querySelector('#ew-whisper, .pp-idle-thought, .noir-whisper, .pp-aenor-bubble, .pp-multirom-bubble, .adaptive-thought')) return;
        ensureThoughtStyles();
        // Remove any previous (defensive)
        document.querySelectorAll('.pp-idle-thought').forEach(n => n.remove());
        const node = document.createElement('div');
        node.className = 'pp-idle-thought';
        node.textContent = text;
        document.body.appendChild(node);
        requestAnimationFrame(() => node.classList.add('show'));
        // Auto-dismiss after a beat. ~5s is enough to read a one-liner
        // and short enough to not crowd the screen.
        clearTimeout(thoughtTimer);
        thoughtTimer = setTimeout(() => {
            node.classList.remove('show');
            setTimeout(() => { try { node.remove(); } catch (_) {} }, 480);
        }, 5000);
    }

    function dismissThought() {
        clearTimeout(thoughtTimer);
        const existing = document.querySelector('.pp-idle-thought');
        if (existing) {
            existing.classList.remove('show');
            setTimeout(() => existing.remove(), 500);
        }
    }

    // ── Pose swap ───────────────────────────────────────────────
    function playIdleBehavior() {
        if (shouldPause()) { scheduleNext(); return; }

        const g = getGame();
        if (!g) { scheduleNext(); return; }
        const charId = g.selectedCharacter;
        const set = IDLE_SETS[charId];
        if (!set) { scheduleNext(); return; }

        // Pick a random behavior. Living-state may supply a condition-matched
        // pool (hungry poses while he's hungry, love poses while adored) —
        // fall back to the character's default set when it returns null.
        const livingPool = (window.PPLivingState && window.PPLivingState.flourishPoolFor)
            ? window.PPLivingState.flourishPoolFor(charId) : null;
        const pool = (livingPool && livingPool.length) ? livingPool : set.behaviors;
        const behavior = pool[Math.floor(Math.random() * pool.length)];
        if (!behavior) { scheduleNext(); return; }

        // Resolve sprite paths from CHARACTER global
        if (typeof CHARACTER === 'undefined') { scheduleNext(); return; }
        const bodySrc = CHARACTER.bodySprites && CHARACTER.bodySprites[behavior.body];
        const faceSrc = behavior.face && CHARACTER.faceSprites && CHARACTER.faceSprites[behavior.face];
        // faceSprites are arrays; pick first if array
        const resolvedFace = Array.isArray(faceSrc) ? faceSrc[0] : faceSrc;

        if (!bodySrc) { scheduleNext(); return; }

        // Save current sprites so we can revert
        const bodyImg = document.getElementById('character-body-img');
        const faceImg = document.getElementById('character-face-img');
        if (!bodyImg) { scheduleNext(); return; }

        savedBodySrc = bodyImg.getAttribute('src');
        savedFaceSrc = faceImg ? faceImg.getAttribute('src') : null;
        isIdlePosing = true;

        // Swap to idle pose — soft cross-fade when living-state provides it
        if (window.PPSoftSwap) window.PPSoftSwap(bodyImg, bodySrc);
        else bodyImg.src = bodySrc;
        if (resolvedFace && faceImg) faceImg.src = resolvedFace;

        // Optionally show a thought (~30% chance by default; condition pools
        // can raise it — a starving knight should actually say so)
        const thoughtChance = (behavior.thoughtChance != null) ? behavior.thoughtChance : 0.3;
        if (behavior.thought && Math.random() < thoughtChance) {
            setTimeout(() => {
                if (isIdlePosing) showThought(behavior.thought);
            }, 600);
        }

        // Revert after duration
        revertTimer = setTimeout(() => revertPose(), behavior.duration);

        // Schedule next behavior after this one finishes
        setTimeout(() => scheduleNext(), behavior.duration + 500);
    }

    function revertPose() {
        if (!isIdlePosing) return;
        isIdlePosing = false;
        dismissThought();

        const bodyImg = document.getElementById('character-body-img');
        const faceImg = document.getElementById('character-face-img');
        if (bodyImg && savedBodySrc) {
            if (window.PPSoftSwap) window.PPSoftSwap(bodyImg, savedBodySrc);
            else bodyImg.src = savedBodySrc;
        }
        if (faceImg && savedFaceSrc) faceImg.src = savedFaceSrc;
        savedBodySrc = null;
        savedFaceSrc = null;
    }

    function scheduleNext() {
        clearTimeout(idleTimer);
        const delay = randomBetween(MIN_INTERVAL, MAX_INTERVAL);
        idleTimer = setTimeout(() => playIdleBehavior(), delay);
    }

    // ── Player tap detection (pause idle for 10s) ───────────────
    function onPlayerTap() {
        lastTapTime = Date.now();
        // If we're mid-idle-pose, revert immediately so the action
        // response (from action-feedback.js) isn't fighting a wrong pose.
        if (isIdlePosing) {
            clearTimeout(revertTimer);
            revertPose();
        }
    }

    // ── Init ────────────────────────────────────────────────────
    function init() {
        // Listen for taps on action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', onPlayerTap, true);
        });
        // Also listen for dialogue box taps (scene advancing)
        const db = document.getElementById('dialogue-box');
        if (db) db.addEventListener('click', onPlayerTap, true);

        // Start the idle loop after a 12s delay (let intro/first-session settle)
        setTimeout(() => scheduleNext(), 12000);
    }

    // Wait for game to be running
    const poll = setInterval(() => {
        if (window._game && window._game.tickInterval) {
            clearInterval(poll);
            init();
        }
    }, 500);

    // Expose for testing (+ isPosing so living-state never fights a flourish)
    window.IdleLife = {
        play: playIdleBehavior,
        revert: revertPose,
        dismiss: dismissThought,
        isPosing: () => isIdlePosing,
    };
})();
