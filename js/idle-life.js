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
            behaviors: [
                { body: 'crossarms',  face: 'neutral2', duration: 6000 },
                { body: 'crossarms',  face: 'annoyed',  duration: 5000, thought: "The candle's getting low." },
                { body: 'armor2',     face: 'neutral',  duration: 5000, thought: "I should polish this before morning." },
                { body: 'gentle',     face: 'gentle',   duration: 7000, thought: "It's quiet tonight." },
                { body: 'default',    face: 'neutral2', duration: 6000 },
                { body: 'fighting1',  face: 'neutral',  duration: 4000, thought: "Left foot forward. Pivot. Again." },
                { body: 'talk',       face: 'gentle2',  duration: 5000, thought: "I wonder if you'll come back tomorrow." },
                { body: 'armor3',     face: 'sad',      duration: 6000, thought: "The kingdom used to feel closer than this." },
                { body: 'happy3',     face: 'cheeky',   duration: 5000 },
                { body: 'crossarms',  face: 'happy',    duration: 4000, thought: "...Hm. That was almost a smile." },
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
        if (Date.now() - lastTapTime < PAUSE_AFTER_TAP_MS) return true;
        return false;
    }

    // ── Thought rendering ───────────────────────────────────────
    // NOTE: Disabled per user request — the floating "thought" text
    // was overlapping the character's face/body. Dialogue now fully
    // lives in the dialogue-row at the character's feet.
    function showThought(/* text */) {
        return;
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

        // Pick a random behavior
        const behavior = set.behaviors[Math.floor(Math.random() * set.behaviors.length)];
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

        // Swap to idle pose
        bodyImg.src = bodySrc;
        if (resolvedFace && faceImg) faceImg.src = resolvedFace;

        // Optionally show a thought (~30% chance when thought exists)
        if (behavior.thought && Math.random() < 0.3) {
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
        if (bodyImg && savedBodySrc) bodyImg.src = savedBodySrc;
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

    // Expose for testing
    window.IdleLife = {
        play: playIdleBehavior,
        revert: revertPose,
        dismiss: dismissThought,
    };
})();
