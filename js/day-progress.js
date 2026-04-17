// ============================================================
//  DAY PROGRESS STRIP
//  7-dot arc visualizer + evocative "next beat" hint.
//  Surfaces existing storyDay-gated scenes so the player can
//  FEEL the shape of the game.
// ============================================================

(function () {
    'use strict';

    // Vague, evocative — no spoilers. These are hints about the
    // emotional direction, not specific scene names.
    const HINTS_BY_CHAR = {
        alistair: {
            1: "He's watching for any sign you'll leave.",
            2: "Something in him is starting to soften.",
            3: "A memory is rising he hasn't thought about in years.",
            4: "The kingdom is pulling at him.",
            5: "He's on the edge of asking for something.",
            6: "A choice is coming he won't be able to unmake.",
            7: "Everything changes at dawn.",
            8: "The ending is yours to shape.",
        },
        lyra: {
            1: "The cave is still deciding about you.",
            2: "The tide is listening now.",
            3: "An old song is getting louder.",
            4: "Something ancient is beginning to answer.",
            5: "Her voice is changing when you're near.",
            6: "The moon is not a witness anymore.",
            7: "What she sings next cannot be unsung.",
            8: "The ending is yours to shape.",
        },
        lucien: {
            1: "His notes have started naming you.",
            2: "The equations no longer balance.",
            3: "He is rereading pages he already knows.",
            4: "The tower does not feel like his anymore.",
            5: "He is building a theory he's afraid to test.",
            6: "The experiment is about to run.",
            7: "One answer is waiting for you in the margins.",
            8: "The ending is yours to shape.",
        },
        caspian: {
            1: "The prince is used to being approached, not met.",
            2: "He's started leaving you a cup of tea.",
            3: "The crown is feeling heavier than it used to.",
            4: "He's thinking about what he could become.",
            5: "A door is being held open for you.",
            6: "Something is being offered that cannot be returned.",
            7: "The palace will not look the same tomorrow.",
            8: "The ending is yours to shape.",
        },
        elian: {
            1: "The forest is still taking your measure.",
            2: "He's leaving you the warmer side of the fire.",
            3: "Something is being carved, slowly.",
            4: "The Thornwood is restless.",
            5: "He's started saving stories for you.",
            6: "Tomorrow he will have to decide who you are to him.",
            7: "The forest remembers its promises.",
            8: "The ending is yours to shape.",
        },
        _default: {
            1: "They're studying you.",
            2: "Something is softening.",
            3: "A memory is rising.",
            4: "The air is changing.",
            5: "They're on the edge of something.",
            6: "A choice is close.",
            7: "Everything changes at dawn.",
            8: "The ending is yours to shape.",
        }
    };

    let lastDay = -1;
    let lastChar = null;

    function getHint(charId, day) {
        const table = HINTS_BY_CHAR[charId] || HINTS_BY_CHAR._default;
        const clamped = Math.min(8, Math.max(1, day));
        return table[clamped] || HINTS_BY_CHAR._default[clamped];
    }

    function update() {
        const g = window._game;
        const strip = document.getElementById('day-progress');
        if (!strip) return;
        if (!g || !g.selectedCharacter) {
            strip.classList.add('hidden');
            return;
        }
        strip.classList.remove('hidden');

        const day = Math.max(1, Math.min(8, g.storyDay || 1));
        const charId = g.selectedCharacter;

        if (day === lastDay && charId === lastChar) return;
        lastDay = day;
        lastChar = charId;

        // Dots: past = filled, current = active (pulsing), future = empty
        const dots = strip.querySelectorAll('.day-dot');
        dots.forEach((dot) => {
            const d = parseInt(dot.getAttribute('data-day'), 10);
            dot.classList.remove('past', 'active', 'future');
            if (d < day) dot.classList.add('past');
            else if (d === day) dot.classList.add('active');
            else dot.classList.add('future');
        });
        // Day 8+ lights the final dot as active (story past the dot row)
        if (day >= 8) {
            const last = strip.querySelector('.day-dot[data-day="7"]');
            if (last) { last.classList.remove('future', 'past'); last.classList.add('active'); }
        }

        // Update the "Day N" label in the topbar
        const dayLabel = document.getElementById('topbar-day-label');
        if (dayLabel) dayLabel.textContent = 'Day ' + (day >= 8 ? '7+' : day);

        // Hint: fade out, swap text, fade in
        const hint = strip.querySelector('.day-hint');
        if (hint) {
            const newText = getHint(charId, day);
            if (hint.textContent !== newText) {
                hint.style.opacity = '0';
                setTimeout(() => {
                    hint.textContent = newText;
                    hint.style.opacity = '';
                }, 300);
            }
        }
    }

    // Relocate the day dots INTO the affection-display topbar so they share
    // one horizontal row with "CLOSE → DEVOTED". Saves vertical space and
    // stops the old strip from overlapping the character's head. Also
    // relocate the day-hint to sit compactly under the topbar.
    function relocateDots() {
        const dots = document.querySelector('#day-progress .day-dots');
        const hint = document.querySelector('#day-progress .day-hint');
        const topbar = document.getElementById('affection-display');
        const container = document.getElementById('game-container');
        if (!dots || !topbar) return false;
        if (dots.parentElement && dots.parentElement.id === 'topbar-day-dots-wrap') return true;

        // Wrap: "Day 1" label + dots, inline inside topbar
        const wrap = document.createElement('span');
        wrap.id = 'topbar-day-dots-wrap';
        const dayLabel = document.createElement('span');
        dayLabel.id = 'topbar-day-label';
        dayLabel.textContent = 'Day 1';
        wrap.appendChild(dayLabel);
        wrap.appendChild(dots);

        // Insert after the affection text + streak badge, before the buttons.
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            timeDisplay.parentNode.insertBefore(wrap, timeDisplay);
        } else {
            topbar.insertBefore(wrap, topbar.children[1] || null);
        }

        // Move the hint text to its own slim strip that sits DIRECTLY under
        // the topbar (above the character area). This keeps the evocative
        // line visible without covering the character's head/face.
        if (hint && container) {
            const hintBar = document.createElement('div');
            hintBar.id = 'topbar-day-hint-bar';
            hintBar.appendChild(hint);
            // Insert right after the affection-display in DOM order.
            topbar.parentNode.insertBefore(hintBar, topbar.nextSibling);
        }
        return true;
    }

    function init() {
        // Try to move dots into topbar; retry if topbar not ready yet
        if (!relocateDots()) {
            const retry = setInterval(() => { if (relocateDots()) clearInterval(retry); }, 300);
            setTimeout(() => clearInterval(retry), 10000);
        }
        update();
        setInterval(update, 2000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for tests
    window.DayProgress = { update, getHint };
})();
