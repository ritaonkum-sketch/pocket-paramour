// ============================================================
//  FIRST SESSION POLISH
//  Patches the three dead moments in the first 10 minutes:
//   A. "What do I do?" — one-time action hint tooltip
//   B. No urgency — lower starting stats so the care loop bites
//   C. No story beat — day-1 quiet moment after 6+ interactions
//  All additive. Does NOT modify game.js. Safe to delete entirely.
// ============================================================

(function () {
    'use strict';

    const STORAGE_KEY_HINT   = 'pp_first_action_hint_shown';
    const STORAGE_KEY_MOMENT = 'pp_day1_quiet_moment';

    // ── A. First-action hint ────────────────────────────────────
    // A gentle tooltip near the Talk button the first time a player
    // lands on the care loop. Fires once, never again.
    function showFirstActionHint() {
        if (localStorage.getItem(STORAGE_KEY_HINT)) return;
        const g = window._game;
        if (!g) return;
        // Only show if truly no interactions yet.
        const total = (g.timesFed||0) + (g.timesWashed||0) + (g.timesTalked||0) + (g.timesGifted||0) + (g.timesTrained||0);
        if (total > 0) return;

        const talkBtn = document.getElementById('btn-talk');
        const container = document.getElementById('game-container');
        if (!talkBtn || !container) return;

        const hint = document.createElement('div');
        hint.className = 'pp-first-hint';
        // Character-specific hint text
        const hints = {
            alistair: "Try talking to him.\nHe's been alone a long time.",
            lyra:     "Try talking to her.\nThe cave has been quiet.",
            lucien:   "Try talking to him.\nThe tower gets lonely.",
            caspian:  "Try talking to him.\nPrinces rarely get honesty.",
            elian:    "Try talking to him.\nThe forest listens, but it doesn't answer.",
        };
        const charId = g.selectedCharacter || 'alistair';
        hint.textContent = hints[charId] || "Try talking to them.";
        hint.style.whiteSpace = 'pre-line';
        container.appendChild(hint);

        // Position above the stats panel (not directly above the talk button,
        // which would put it on top of the Bond bar). Centered horizontally
        // over the Talk button for clear visual association.
        requestAnimationFrame(() => {
            const btnRect = talkBtn.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const statsBar = document.getElementById('stats-bar');
            const fading  = document.getElementById('fading-meter');
            const dialogueRow = document.getElementById('dialogue-row');
            // Find the highest (smallest top) UI element above the buttons and
            // sit above that, so we don't overlap any stat/dialogue chrome.
            let topOfBottomStack = btnRect.top;
            [statsBar, fading, dialogueRow].forEach(el => {
                if (el) {
                    const r = el.getBoundingClientRect();
                    if (r.top > 0 && r.top < topOfBottomStack) topOfBottomStack = r.top;
                }
            });
            hint.style.left = (btnRect.left - containerRect.left + btnRect.width / 2) + 'px';
            hint.style.bottom = (containerRect.bottom - topOfBottomStack + 16) + 'px';
            hint.classList.add('show');
        });

        // Dismiss on any action button click.
        function dismiss() {
            hint.classList.remove('show');
            setTimeout(() => hint.remove(), 400);
            localStorage.setItem(STORAGE_KEY_HINT, '1');
            document.querySelectorAll('.action-btn').forEach(b => b.removeEventListener('click', dismiss));
        }
        document.querySelectorAll('.action-btn').forEach(b => b.addEventListener('click', dismiss, { once: true }));

        // Auto-dismiss after 8 seconds if player is just looking.
        setTimeout(() => {
            if (hint.parentNode) dismiss();
        }, 8000);
    }

    // ── B. First-session stat adjustment ────────────────────────
    // On a brand-new save, lower starting stats so the urgency loop
    // is visible in the first few minutes. Bond starts at 30 (Talk
    // button will pulse immediately), hunger at 65, clean at 60.
    // Only fires once — subsequent loads read from save.
    function adjustFirstSessionStats() {
        const g = window._game;
        if (!g) return;
        const total = (g.timesFed||0) + (g.timesWashed||0) + (g.timesTalked||0) + (g.timesGifted||0) + (g.timesTrained||0);
        // Only adjust if this is a completely fresh session.
        if (total > 0) return;
        // Check that stats are at defaults (100/100/50) — if not, save was loaded.
        if (g.hunger < 90 || g.clean < 90) return;

        g.hunger = 65;
        g.clean  = 60;
        g.bond   = 30;
        // Don't save yet — let the first action save naturally.
    }

    // ── C. Day-1 quiet moment ───────────────────────────────────
    // After 6+ interactions on day 1, if no scene is playing, fire
    // a small scripted beat through the existing dialogue typewriter.
    // One-shot per character. Not a full cinematic — just 3 lines
    // that make the player feel seen.
    const QUIET_LINES = {
        alistair: [
            "You've been here all morning.",
            "Most people leave after five minutes. You're still here.",
            "...I'm glad. That's all."
        ],
        lyra: [
            "You've stayed longer than anyone has in a very long time.",
            "The cave is warmer. That's not the tide. That's me.",
            "...Don't read into it."
        ],
        lucien: [
            "My notes are... less organized than usual today.",
            "It appears your presence introduces a variable I haven't accounted for.",
            "I will need to redesign the entire model. I don't mind."
        ],
        caspian: [
            "You've been here for hours and you haven't asked me for a single thing.",
            "Do you know how rare that is in a palace?",
            "...Stay for tea. Please."
        ],
        elian: [
            "You're still here.",
            "The forest usually scares people off by now. You're either brave or stubborn.",
            "...I'm not complaining."
        ],
        _default: [
            "You've been here a while now.",
            "Most people don't stay this long.",
            "...Thank you."
        ]
    };

    let quietMomentFired = false;
    let quietLineIndex = 0;
    let quietLines = null;

    function checkQuietMoment() {
        if (quietMomentFired) return;
        const g = window._game;
        if (!g || g.sceneActive || g.characterLeft) return;
        if ((g.storyDay || 1) !== 1) return;
        const charId = g.selectedCharacter || 'alistair';
        const key = STORAGE_KEY_MOMENT + '_' + charId;
        if (localStorage.getItem(key)) return;

        const total = (g.dayInteractions || 0);
        if (total < 6) return;

        // Fire the quiet moment.
        quietMomentFired = true;
        localStorage.setItem(key, '1');
        quietLines = QUIET_LINES[charId] || QUIET_LINES._default;
        quietLineIndex = 0;

        // Briefly dim the background to signal "something different is happening"
        const focus = document.getElementById('focusOverlay');
        if (focus) focus.classList.add('active');

        showQuietLine();
    }

    function showQuietLine() {
        if (!quietLines || quietLineIndex >= quietLines.length) {
            // Done — un-dim
            const focus = document.getElementById('focusOverlay');
            if (focus) focus.classList.remove('active');
            quietLines = null;
            return;
        }

        const g = window._game;
        if (!g || !g.typewriter) return;

        const line = quietLines[quietLineIndex];
        quietLineIndex++;

        g.typewriter.show(line);

        // Wait for the player to tap the dialogue box, then show next line.
        const db = document.getElementById('dialogue-box');
        if (!db) return;
        function onTap() {
            db.removeEventListener('click', onTap);
            if (quietLineIndex < quietLines.length) {
                setTimeout(() => showQuietLine(), 200);
            } else {
                showQuietLine(); // will hit the "Done" branch
            }
        }
        // Delay attaching listener so the current show() finishes.
        setTimeout(() => db.addEventListener('click', onTap), 600);
    }

    // ── Init ────────────────────────────────────────────────────
    function init() {
        // Poll until game is running.
        const poll = setInterval(() => {
            const g = window._game;
            if (!g || !g.tickInterval) return;
            clearInterval(poll);

            // B: adjust stats for first session
            adjustFirstSessionStats();

            // A: show hint after a brief delay (let player absorb the scene)
            setTimeout(() => showFirstActionHint(), 1500);

            // C: poll for quiet moment trigger
            setInterval(() => checkQuietMoment(), 3000);
        }, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
