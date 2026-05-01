// ============================================================
//  FIRST SESSION POLISH
//  Patches the dead moments in the first 10 minutes:
//   A. (REMOVED) "What do I do?" hint tooltip — was a tall narrow
//      vertical column over the Talk button. Per user feedback the
//      pulsing Talk button + dialogue line are sufficient cue, and
//      the explicit "Try talking to him" tooltip read as a 2016
//      indie-game tutorial overlay rather than a 2025 Otome.
//   B. No urgency — lower starting stats so the care loop bites
//   C. No story beat — day-1 quiet moment after 6+ interactions
//  All additive. Does NOT modify game.js. Safe to delete entirely.
// ============================================================

(function () {
    'use strict';

    const STORAGE_KEY_MOMENT = 'pp_day1_quiet_moment';

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

            // A (REMOVED): the Talk-button hint tooltip used to fire here.
            // It was rendering as a tall narrow vertical column over the
            // Talk button (broken layout) AND, even when positioned
            // correctly, it read like a 2016 indie-game tutorial overlay
            // rather than a clean Otome cue. The pulsing Talk button
            // (existing UI affordance) plus the dialogue line are
            // sufficient to direct a new player.

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
