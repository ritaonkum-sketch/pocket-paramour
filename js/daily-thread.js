// ============================================================
//  DAILY THREAD — the reason to come back tomorrow
//
//  Aug 2026 playtest finding: every mechanical goal on a care route can be
//  satisfied in one ~3 minute sitting (bond hits ~98/100, affection passes the
//  Bond-3 gate), while the route's ENDING needs storyDay >= 8 — eight separate
//  real days. Days 2-7 therefore had no new content and no reason to open the
//  app: the player had already "finished" him and was just waiting on a clock.
//
//  This module adds the missing daily rhythm. Three pieces, one system:
//
//    ARRIVE  (#2) one small scene per care-route day, played on the first
//                 visit of that day. Days are counted PER CHARACTER from the
//                 day their route opened, so everyone sees day 2, 3, 4 ... in
//                 order no matter when they start the route.
//    PROMISE (#5) at the end of a session he names one SPECIFIC thing about
//                 tomorrow. The next day's ARRIVE beat is that exact thing,
//                 so the promise is always kept. This is the hook.
//    STREAK  (#9) consecutive days acknowledged in his own voice, never as a
//                 UI badge.
//
//  SAFETY CONTRACT:
//   - Purely additive and read-only with respect to progression. It never
//     touches affection, bond, corruption, the balanced-care flag, or
//     bondLevelFor() — so the care-route ladder that unlocks chapters and the
//     next character is completely unaffected. This only SHOWS content.
//   - Speaks through the existing care dialogue box and always waits for it to
//     be free (the ambient-bubble busy() invariant), so it can never collide
//     with a care response.
//   - Characters with no thread data simply get nothing. No breakage.
// ============================================================

(function () {
    'use strict';

    function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
    function todayStr() { return new Date().toISOString().slice(0, 10); }

    // ── Content ──────────────────────────────────────────────────────────
    // day N: `arrive` pays off the promise made on day N-1.
    //        `promise` is the hook for day N+1.
    // Voice rules: no em-dashes, understated, a knight who states facts and
    // lets the feeling sit underneath them.
    var THREAD = {
        alistair: {
            1: {
                promise: "Come at first light tomorrow. There is something on the north wall I have never shown anyone."
            },
            2: {
                arrive: [
                    "You came at first light. I did not entirely expect it.",
                    "The north wall. That notch in the stone is mine. I put my sword through it the first night I stood watch alone, because I was seventeen and certain something was coming.",
                    "Nothing came. I have kept the notch anyway. It reminds me that being afraid and standing still are not opposites."
                ],
                promise: "Tomorrow, come at the change of the guard. I want you to hear the horn from inside the gate. It sounds different when you belong to it."
            },
            3: {
                arrive: [
                    "There. The horn. Listen to it from here.",
                    "From outside the wall it is a warning. From in here it is only tired men telling each other they are still awake.",
                    "You did not flinch this time. Good."
                ],
                promise: "Tomorrow I am off the roster until noon. I have never had a morning I did not owe to someone. Spend it with me and I will not know what to do with either of us."
            },
            4: {
                arrive: [
                    "No armour today. It felt strange on the stairs, walking without the sound of myself.",
                    "Every morning of my life has been owed to a roster. This one I gave away on purpose. To you.",
                    "Do not make it mean more than it does. ...Or do. I am not certain which I would prefer."
                ],
                promise: "Come after dark tomorrow. There is a thing I do at the end of a watch that no one has ever watched me do."
            },
            5: {
                arrive: [
                    "You came after dark. Stand there, and do not speak for a moment.",
                    "*He sets the sword across his knees and cleans it slowly, hilt to point*",
                    "That is the whole of it. A man, a blade, and the counting of a day that did not go wrong. It is not a ceremony. It only feels like one because you are watching."
                ],
                promise: "Tomorrow, ask me the question you have been not asking. I have watched you decide against it three times. I will answer it."
            },
            6: {
                arrive: [
                    "You have been carrying a question since the moss. Ask it.",
                    "...Yes. I knew the one before you. I stood this same watch for her.",
                    "I am not going to tell you it is different this time. I am going to show you, and you may decide for yourself."
                ],
                promise: "Tomorrow I report to the King. Come to the gate at noon and hear what I say when they ask him what you are."
            },
            7: {
                arrive: [
                    "They asked me what you are to the Kingdom. In front of the whole hall.",
                    "I said she is the reason the wards are still lit, and she is under my watch. Both. In that order, because the second one is mine and I did not want to hand it to them.",
                    "The King let it stand. ...I did not know I was going to say the second part."
                ],
                promise: "Tomorrow, bring me nothing. Tend to nothing. Just come and sit. I want to know what we are when there is nothing to do."
            },
            8: {
                arrive: [
                    "Nothing to do. No orders, no wall, no horn.",
                    "Sit. There. That is the chair I moved to the window on your first day, and you have never once used it.",
                    "...This is the part I did not know how to want. The room, and you in it, and no reason for it."
                ],
                promise: "Come back tomorrow anyway. There is no plan. That is rather the point."
            }
        }
    };

    // Consecutive-day acknowledgement, in his voice. Nearest lower key is used.
    var STREAK = {
        alistair: {
            2: "Two mornings running. I have started listening for the door.",
            3: "Three days. I have stopped telling myself it is a coincidence.",
            5: "Five. The other men have noticed I watch the gate. I have decided not to mind.",
            7: "Seven days. A siege lasts a week. I have never minded one less."
        }
    };

    // ── Per-character route day ──────────────────────────────────────────
    // Counted from the first day the player cared for THIS character, so the
    // beats always run 1, 2, 3 ... in order regardless of when the route began.
    function routeDay(charId) {
        var dayKey = 'pp_dt_day_' + charId, dateKey = 'pp_dt_date_' + charId;
        var d = parseInt(lsGet(dayKey) || '0', 10) || 0;
        var last = lsGet(dateKey);
        var t = todayStr();
        if (!d) { d = 1; lsSet(dayKey, '1'); lsSet(dateKey, t); }
        else if (last !== t) { d = d + 1; lsSet(dayKey, String(d)); lsSet(dateKey, t); }
        return d;
    }

    // Is this element actually on screen (not just present, and not merely
    // carrying a stale ".visible" class)? Presence/class tests are what made
    // the route-open popup mount over the title screen, so test real geometry.
    function reallyShowing(el) {
        if (!el) return false;
        if (!el.offsetWidth || !el.offsetHeight) return false;
        var cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        if (parseFloat(cs.opacity || '1') < 0.05) return false;
        // A full-screen shell with nothing in it is not blocking anything.
        return !!(el.innerText || '').trim() || !!el.querySelector('img, canvas, button');
    }

    // The care box is rarely EMPTY — greetings, return lines and idle thoughts
    // keep it populated, so waiting for a truly idle box meant the day's beat
    // could wait forever. Instead: never interrupt a line that is still typing,
    // and give the player a few seconds with whatever is on screen first. Then
    // the day beat takes the stage, the same way a greeting does.
    var _lastText = null, _lastChangeAt = 0;
    var READ_GRACE_MS = 3500;

    function boxSettled(g) {
        var dt = document.getElementById('dialogue-text');
        var t = dt ? (dt.textContent || '') : '';
        var now = Date.now();
        if (t !== _lastText) { _lastText = t; _lastChangeAt = now; }
        try { if (g && g.typewriter && g.typewriter.isTyping) return false; } catch (_) {}
        return (now - _lastChangeAt) >= READ_GRACE_MS;
    }

    function boxFree(g) {
        // Never cut off a line mid-type; let the current one be read first.
        if (!boxSettled(g)) return false;
        // Any ambient bubble already speaking.
        if (document.querySelector('#ew-whisper, .pp-idle-thought, .noir-whisper, .pp-aenor-bubble, .pp-multirom-bubble, .adaptive-thought')) return false;
        // Genuinely-showing blocking surfaces. Deliberately NOT PPOverlay.busy():
        // that reports true on a calm care screen whenever some overlay is left
        // with a stale ".visible" class (observed live), which would mute these
        // beats forever. Check the real blockers, and check that they are real.
        var blockers = ['#mscard-root', '#tp-root', '#story-overlay', '#cinematic-overlay',
                        '#game-over-overlay', '#chp-page'];
        for (var i = 0; i < blockers.length; i++) {
            if (reallyShowing(document.querySelector(blockers[i]))) return false;
        }
        if (document.querySelector('[class*="-backdrop"]')) return false;
        return document.body.classList.contains('pp-screen-care')
            && !document.body.classList.contains('pp-chapter-active');
    }

    function speak(g, lines) {
        if (!g || !g.typewriter) return;
        if (Array.isArray(lines) && lines.length > 1 && typeof g._showMicroSequence === 'function') {
            g._showMicroSequence(lines.slice());
        } else {
            g.typewriter.show(Array.isArray(lines) ? lines[0] : lines);
        }
    }

    // ── The daily beats ──────────────────────────────────────────────────
    function tick() {
        var g = window._game;
        if (!g || !g.selectedCharacter) return;
        if (g.characterLeft) return;
        var charId = g.selectedCharacter;
        var thread = THREAD[charId];
        if (!thread) return;                    // no content authored yet: stay silent
        if (!boxFree(g)) return;

        var day = routeDay(charId);

        // 1) ARRIVE — first visit of this day pays off yesterday's promise.
        var arriveKey = 'pp_dt_arrived_' + charId + '_' + day;
        if (lsGet(arriveKey) !== '1') {
            var beat = thread[day];
            if (beat && beat.arrive && beat.arrive.length) {
                lsSet(arriveKey, '1');
                var lines = beat.arrive.slice();
                // Streak, spoken by him, folded into the arrival.
                var s = streakLine(charId, g);
                if (s) lines.push(s);
                speak(g, lines);
                return;
            }
            lsSet(arriveKey, '1');              // nothing authored for this day
        }

        // 2) PROMISE — once he has been kept company a while today, he names
        //    one specific thing about tomorrow. This is the return hook.
        var promiseKey = 'pp_dt_promised_' + charId + '_' + day;
        if (lsGet(promiseKey) !== '1') {
            var today = (g.dayInteractions || 0);
            if (today >= 4) {
                var p = thread[day] && thread[day].promise;
                if (p) { lsSet(promiseKey, '1'); speak(g, [p]); }
                else   { lsSet(promiseKey, '1'); }
            }
        }
    }

    function streakLine(charId, g) {
        var pool = STREAK[charId];
        if (!pool) return null;
        var n = (g && g.dailyStreak) || 0;
        if (n < 2) return null;
        var key = 'pp_dt_streak_' + charId + '_' + n;
        if (lsGet(key) === '1') return null;
        var best = null;
        Object.keys(pool).forEach(function (k) {
            var kk = parseInt(k, 10);
            if (kk <= n && (best === null || kk > best)) best = kk;
        });
        if (best === null) return null;
        lsSet(key, '1');
        return pool[best];
    }

    // Poll gently. The beats wait for a calm care screen, so this only ever
    // fires between actions, never over one.
    var timer = null;
    function start() {
        if (timer) return;
        timer = setInterval(function () { try { tick(); } catch (_) {} }, 4000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else { start(); }

    window.PPDailyThread = {
        _tick: tick,
        routeDay: routeDay,
        // Test helper: jump the route to a given day without waiting for dates.
        _setDay: function (charId, d) {
            lsSet('pp_dt_day_' + charId, String(d));
            lsSet('pp_dt_date_' + charId, todayStr());
        },
        _data: THREAD
    };
})();
