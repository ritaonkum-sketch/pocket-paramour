// ============================================================================
// ROUTE GATES — per-chapter bond requirement + chapter-complete bond reward
// ----------------------------------------------------------------------------
// Turns the 33-chapter spine from a flat reading sequence into an otome route.
//
//   • Each chapter declares a bond floor against its primary suitor.
//   • Tapping a locked chapter opens a branded checklist (matches PPMSGate's
//     popup register).
//   • The popup offers a "Care for <name>" action that swaps Active Companion
//     to the chapter's suitor, so the player can earn the unlock immediately.
//   • Finishing a chapter for the first time awards a modest bond bump to the
//     chapter's charId — the reward half of the loop.
//
// DESIGN NOTES
//   • Gates are PERMISSIVE for early chapters and tighten in the back half.
//     Plot-critical reveal chapters (20 Noir-debut, 26 thread, 28 the Hunt)
//     stay open: the player must not be soft-locked by bond level on a major
//     reveal beat.
//   • Ch6 is still owned by PPMSGate (two-milestone balanced-care gate). This
//     module deliberately defers to it.
//   • Affection writes prefer the live _game.affection for the active
//     companion, otherwise localStorage pp_affection_<char>. Mirrors the
//     reader in PPMSGate.affectionFor() so the two stay coherent.
//   • Reward fires once per chapter (latched in pp_chapter_bond_awarded_<id>).
//     Replays don't farm affection.
//
// PUBLIC API
//   window.PPRouteGates.evaluate(chapter)        → {locked, hint, milestones[]}
//   window.PPRouteGates.showChapterGate(chapter) → branded popup
//   window.PPRouteGates.onChapterDone(id)        → award bond (first play)
//   window.PPRouteGates.strongestBond()          → { charId, raw, level } | null
// ============================================================================
(function () {
    'use strict';

    // ── Gate map ───────────────────────────────────────────────────────
    // For each chapter id (number or string), declare:
    //   charId        — primary suitor whose bond is required (or null)
    //   minBondLevel  — bond level required (uses the same 0-9 scale as
    //                   index.html's bondLevel() and PPMSGate.bondLevelFor())
    //   reward        — bond points awarded on first completion (default 6).
    //                   Use 0 for shared/plot chapters that should not bias
    //                   the player into a particular route.
    //   sharedNote    — optional hint shown when the chapter has no gate,
    //                   replaces the regular bond-lock message.
    //
    // Ch0 (Prologue), Ch1, Ch6, Ch20, Ch26, Ch28 are intentionally open.
    // Ch6 keeps its existing PPMSGate (balanced-care milestone) — we skip
    // it here so the two systems don't both shout at the player.
    var GATES = {
        // ── Phase 1: Inland road · Alistair tutorial ──
        2:  { charId: 'alistair', minBondLevel: 1, reward: 6 },
        3:  { charId: 'alistair', minBondLevel: 1, reward: 6 },
        4:  { charId: 'alistair', minBondLevel: 2, reward: 6 },
        5:  { charId: 'alistair', minBondLevel: 2, reward: 6 },
        // 6 owned by PPMSGate (balanced care) — skipped here

        // ── Phase 2: The wood · Elian, Lyra ──
        7:  { charId: 'elian',    minBondLevel: 1, reward: 6 },
        8:  { charId: 'elian',    minBondLevel: 2, reward: 8 },
        // Ch9 "The Short Way South" is an ELIAN chapter (charId elian, speaker
        // ELIAN throughout — his second morning, the road south, introduces
        // Lyra). It was gated by 'alistair' (a leftover) — wrong character for
        // both the gate AND the completion reward. Aligned to Elian like Ch7/8.
        // (Functionally invisible before — Alistair bond is always >=3 by Ch9 —
        // but now consistent: every character-chapter gates on its own char.)
        9:  { charId: 'elian',    minBondLevel: 2, reward: 6 },
        10: { charId: 'lyra',     minBondLevel: 1, reward: 6 },

        // ── Phase 3: Castle · the prince's favourite ──
        // Ch11–13 are the Prince's LEAD-IN (his letter arrives, the court
        // stirs) — intentionally OPEN, read as Lyra's companion BEFORE
        // Caspian introduces himself in person at Ch14, where his care route
        // opens (LADDER[14]='lyra'). They are deliberately NOT in GATES:
        // gating them on Caspian's own bond was an unwinnable deadlock — you
        // needed his bond to read the very chapters that unlock his route.
        // (Ch14 is the ladder gateway, gated by Lyra's care target via LADDER;
        // the GATES[14] line below is shadowed by that — evaluate() checks
        // LADDER first — and kept only as a fallback if the ladder entry is
        // ever removed.)
        14: { charId: 'caspian',  minBondLevel: 2, reward: 6 },
        // Ch15/16 give Caspian a gentle on-ramp (Bond 1 → 2) right after his
        // route opens at Ch14 — mirroring Alistair's 1,1,2,2 and Elian's 1,2
        // tutorials. They used to both jump straight to Bond 3, a 0→20-affection
        // wall the instant you met him. The real "you must actually care for
        // Caspian (balanced)" friction lands correctly at Ch17 — his care-target
        // ladder gateway to Lucien — not the moment he's introduced.
        15: { charId: 'caspian',  minBondLevel: 1, reward: 8 },
        16: { charId: 'caspian',  minBondLevel: 2, reward: 6 },

        // ── Phase 4: Court ensemble ──
        17: { charId: 'lucien',   minBondLevel: 1, reward: 6 },
        18: { charId: 'caspian',  minBondLevel: 3, reward: 6 },
        19: { charId: 'alistair', minBondLevel: 3, reward: 8 },
        // 20 (Noir debut) intentionally open
        21: { charId: 'caspian',  minBondLevel: 3, reward: 6 },
        22: { charId: 'alistair', minBondLevel: 4, reward: 10 },
        23: { charId: 'lucien',   minBondLevel: 2, reward: 8 },
        24: { charId: 'caspian',  minBondLevel: 4, reward: 8 },
        25: { charId: 'caspian',  minBondLevel: 4, reward: 10 },

        // ── Phase 5: Queen's hunt · the seventh ──
        // 26 (Stranger at the Thread / Noir intrusion) intentionally open
        27: { charId: 'lucien',   minBondLevel: 3, reward: 8 },
        // 28 (The Hunt — Marra dies) intentionally open
        29: { charId: 'caspian',  minBondLevel: 4, reward: 8 },
        30: { charId: 'caspian',  minBondLevel: 5, reward: 12 },
        31: { charId: 'elian',    minBondLevel: 3, reward: 8 },
        32: { charId: 'elian',    minBondLevel: 4, reward: 10 },
        33: { charId: 'elian',    minBondLevel: 4, reward: 10 }
    };

    // ── Suitor display data ───────────────────────────────────────────
    var SUITORS = {
        alistair: { name: 'Alistair',   role: 'The Captain',     accent: '#c8a878' },
        elian:    { name: 'Elian',      role: 'The Warden',      accent: '#7ea870' },
        caspian:  { name: 'Caspian',    role: 'The Prince',      accent: '#a83a50' },
        lucien:   { name: 'Lucien',     role: 'The Grand Mage',  accent: '#9a7ec8' },
        lyra:     { name: 'Lyra',       role: 'The Singer',      accent: '#6aa8c8' },
        noir:     { name: 'Noir',       role: 'The Stranger',    accent: '#b53a48' },
        proto:    { name: 'Proto',      role: 'The Sixth',       accent: '#c8c0e0' }
    };

    // ── Storage helpers ───────────────────────────────────────────────
    function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

    function affectionFor(charId) {
        if (!charId) return 0;
        try {
            var g = window._game;
            if (g && typeof g.affection === 'number') {
                var live = (g.selectedCharacter || g.characterId);
                if (live === charId) return Math.max(0, g.affection);
            }
        } catch (_) {}
        var raw = parseInt(lsGet('pp_affection_' + charId) || '0', 10) || 0;
        return raw < 0 ? 0 : raw;
    }

    function bondLevelFor(charId) {
        var raw = affectionFor(charId);
        if (raw === 0)  return 0;
        if (raw < 10)   return 1;
        if (raw < 20)   return 2;
        if (raw < 35)   return 3;
        if (raw < 55)   return 4;
        if (raw < 80)   return 5;
        if (raw < 110)  return 6;
        if (raw < 150)  return 7;
        if (raw < 200)  return 8;
        return 9;
    }

    // Affection floor required to hit a given bond level. Mirrors the
    // step table used by bondLevelFor() above and by the same function
    // in index.html. Used to render "X / Y affection" progress in the
    // gate popup so the player has a concrete target.
    function affectionForLevel(level) {
        switch (level) {
            case 1: return 1;
            case 2: return 10;
            case 3: return 20;
            case 4: return 35;
            case 5: return 55;
            case 6: return 80;
            case 7: return 110;
            case 8: return 150;
            case 9: return 200;
            default: return 0;
        }
    }

    // ── CARE-ROUTE LADDER (Aug 2026) ───────────────────────────────────
    // The spine of the first-player experience: each character's care
    // route is the key to the NEXT one. Completing character C's "care
    // target" unlocks the next character's INTRODUCTION chapter AND opens
    // their care route. A ladder chapter stays locked even if every prior
    // chapter is read, until the previous character's target is met.
    //
    //   LADDER[introChapterId] = the character whose care target gates it.
    // (Ch6 = Elian's intro, gated by Alistair; Ch10 = Lyra's intro, gated
    //  by Elian; etc.) Ch6 is ALSO handled by PPMSGate today — both read
    // the same Alistair Bond-3 + balanced flag, so they agree; chapters.js
    // keeps Ch6 on PPMSGate and routes 10/11/17/20 through here.
    var CARE_TARGET_BOND = 3;
    var LADDER = {
        6:  'alistair',   // Ch6  (Elian intro)   ← Alistair target
        10: 'elian',      // Ch10 (Lyra intro)    ← Elian target
        14: 'lyra',       // Ch14 (Caspian intro: "The Prince of Aethermoor") ← Lyra target. (Was Ch11, but Ch11 "The Prince Writes a Letter" is an ENSEMBLE beat; Caspian actually introduces himself in Ch14 — owner direction Jun 2026.)
        17: 'caspian',    // Ch17 (Lucien intro)  ← Caspian target
        20: 'lucien'      // Ch20 (Noir intro)    ← Lucien target
    };
    // Which care route opens when a character's target is met (the next
    // rung). Used by the Stage-2 unlock/popup layer.
    var LADDER_NEXT = {
        alistair: 'elian',
        elian:    'lyra',
        lyra:     'caspian',
        caspian:  'lucien',
        lucien:   'noir',
        noir:     'proto'
    };

    // True once a character's care stats were all > 50 at the same time
    // (latched by main-story-gate.checkBalanced as pp_<char>_balanced_care).
    function balancedFor(charId) {
        return lsGet('pp_' + charId + '_balanced_care') === '1';
    }

    // A character's "care target" = Bond Level 3 AND balanced care once.
    // This is the single, uniform unlock criterion for the whole ladder
    // (the same target Ch6 has used since June).
    function careTargetMet(charId) {
        if (!charId) return false;
        return bondLevelFor(charId) >= CARE_TARGET_BOND && balancedFor(charId);
    }

    // Inverse of LADDER_NEXT — which character's target unlocks THIS one's
    // care route. (elian ← alistair, lyra ← elian, …)
    var PREV_ROUTE = (function () {
        var m = {};
        Object.keys(LADDER_NEXT).forEach(function (k) { m[LADDER_NEXT[k]] = k; });
        return m;
    })();

    function chapterDone(id) { return lsGet('pp_chapter_done_' + id) === '1'; }

    // Is a character's CARE ROUTE currently open to tend? This is the
    // access half of the ladder (Stage 2): you cannot tend Lyra until
    // Elian's care target is met, etc.
    //   - Alistair: open once Chapter 1 is done (the existing first gate).
    //   - Everyone else: open once the PREVIOUS rung's target is met,
    //     OR an explicit legacy unlock flag is set (pp_select_unlock_<c>,
    //     written by game.js's Proto/Noir reveal paths — kept so those
    //     alternate unlocks still work).
    function careRouteOpen(charId) {
        if (charId === 'alistair') return chapterDone(1);
        var prev = PREV_ROUTE[charId];
        if (!prev) return true; // unknown char — fail open, never trap the player
        if (lsGet('pp_select_unlock_' + charId) === '1') return true;
        // Owner direction (Jun 2026): the care route stays LOCKED until the
        // PREVIOUS rung's FULL task is finished — ALL THREE milestones the
        // "NEXT ROUTE" chip advertises (Bond Level 3 + balanced care + read the
        // story through the gateway chapter), not just the care target. This
        // previously returned careTargetMet(prev) (the first two only), so the
        // route opened while the story-read milestone was still incomplete —
        // contradicting the chip the player is looking at. Gate on the full
        // readiness so the care route, the story chapter, and the unlock
        // celebration all agree on the same finish line.
        try {
            var prog = careLadderProgress(prev);
            if (prog) return !!prog.ready;
        } catch (_) {}
        return careTargetMet(prev); // fallback only if progress can't be computed
    }

    // What does a locked care route need? Lets the UI render an honest
    // lock hint instead of a one-size-fits-all "play Chapter 1" line.
    //   - { type:'chapter', chapter:1 }   → Alistair (read Ch1)
    //   - { type:'care', prev:'alistair' } → laddered char (tend prev to target)
    //   - null                            → no known prerequisite
    function routePrereq(charId) {
        if (charId === 'alistair') return { type: 'chapter', chapter: 1 };
        var prev = PREV_ROUTE[charId];
        if (!prev) return null;
        return { type: 'care', prev: prev };
    }

    // Reverse of LADDER: the intro chapter that THIS character's care target
    // gates (alistair→6, elian→10, lyra→14, caspian→17, lucien→20). noir has
    // none — its next rung (proto) is care-only with no story chapter.
    var GATEWAY_FOR = (function () {
        var m = {};
        Object.keys(LADDER).forEach(function (ch) { m[LADDER[ch]] = parseInt(ch, 10); });
        return m;
    })();

    // ── Generic care-target progress (Aug 2026) ───────────────────────
    // The SINGLE source of truth for the care-target chip AND the route-open
    // celebration, for EVERY character — not just Alistair/Ch6. On charId's
    // care screen, this is the progress toward unlocking the NEXT rung.
    //   milestones: bond3 + balanced (+ a "read through Chapter N" step when
    //               the next character has an intro chapter to reach).
    //   careReady:  bond3 && balanced              (the care half is done)
    //   ready:      careReady && sequence-read     (next rung truly unlocks —
    //               same stacked-gate model Ch6 uses: care target AND story)
    // Returns null at the end of the chain (proto / any char with no next).
    function careLadderProgress(charId) {
        var next = LADDER_NEXT[charId];
        if (!next) return null;
        var suitor     = SUITORS[charId] || { name: charId, role: '' };
        var nextSuitor = SUITORS[next]   || { name: next, role: '' };
        var gateway    = GATEWAY_FOR[charId] || null;   // next char's intro chapter

        var bl  = bondLevelFor(charId);
        var aff = affectionFor(charId);
        var bond3Aff = affectionForLevel(CARE_TARGET_BOND);
        var m1 = bl >= CARE_TARGET_BOND;
        var m2 = balancedFor(charId);

        var milestones = [
            {
                key: 'bond3',
                label: 'Bond Level ' + CARE_TARGET_BOND + ' with ' + suitor.name,
                progress: m1 ? 'Reached' : (aff + ' / ' + bond3Aff + ' affection'),
                pct: m1 ? 1 : Math.max(0, Math.min(1, aff / bond3Aff)),
                done: m1
            },
            {
                key: 'balanced',
                label: 'Care for ' + suitor.name + ' in balance (every stat above 50)',
                progress: m2 ? 'Once' : 'Not yet',
                pct: m2 ? 1 : 0,
                done: m2
            }
        ];

        var seqDone = true;
        if (gateway) {
            seqDone = chapterDone(gateway - 1);   // linear: read up to the chapter before the gateway
            var cur = parseInt(lsGet('pp_chapter_current') || '1', 10) || 1;
            milestones.push({
                key: 'sequence',
                label: 'Read the story through Chapter ' + (gateway - 1),
                progress: seqDone ? 'Reached' : ('Chapter ' + Math.min(cur, gateway - 1) + ' of ' + (gateway - 1)),
                pct: seqDone ? 1 : Math.max(0, Math.min(1, cur / gateway)),
                done: seqDone
            });
        }

        return {
            charId: charId,
            nextChar: next,
            nextName: nextSuitor.name,
            nextRole: nextSuitor.role,
            gatewayChapter: gateway,
            milestones: milestones,
            careReady: m1 && m2,
            ready: m1 && m2 && seqDone
        };
    }

    // Build the ladder gate verdict for an intro chapter, keyed on the
    // PREVIOUS character's care target (Bond 3 + balanced care).
    function evaluateLadder(chapter, prevCharId) {
        var suitor = SUITORS[prevCharId] || { name: prevCharId, role: '', accent: '#c8a878' };
        var bond = bondLevelFor(prevCharId);
        var bondAff = affectionFor(prevCharId);
        var bond3Aff = affectionForLevel(CARE_TARGET_BOND);
        var bondDone = bond >= CARE_TARGET_BOND;
        var balDone = balancedFor(prevCharId);
        var met = bondDone && balDone;
        var hint = met
            ? (suitor.name + '’s thread is woven. The next chapter opens.')
            : ('Walk ' + suitor.name + '’s care route to its depth before this chapter opens.');
        return {
            gated: true,
            ladder: true,
            locked: !met,
            opened: met,
            suitor: { id: prevCharId, name: suitor.name, role: suitor.role, accent: suitor.accent },
            hint: hint,
            milestones: [
                {
                    key: 'bond',
                    label: 'Bond Level ' + CARE_TARGET_BOND + ' with ' + suitor.name,
                    progress: bondDone ? ('Reached · ' + bondAff + ' affection')
                                       : (bondAff + ' / ' + bond3Aff + ' affection'),
                    pct: bondDone ? 1 : Math.max(0, Math.min(1, bondAff / Math.max(1, bond3Aff))),
                    done: bondDone
                },
                {
                    key: 'balanced',
                    label: 'Care for ' + suitor.name + ' in balance (every stat above 50)',
                    progress: balDone ? 'Once' : 'Not yet',
                    pct: balDone ? 1 : 0,
                    done: balDone
                }
            ]
        };
    }

    // ── Evaluator ─────────────────────────────────────────────────────
    // Resolves a single chapter's gate state.
    //   chapter — full chapter object from MSChapters (has id, title, charId).
    // Returns:
    //   {
    //     gated: boolean        — does this chapter have a route gate at all
    //     locked: boolean       — true if gate is unmet AND chapter not yet done
    //     opened: boolean       — true if gate is met
    //     suitor: {id, name, role, accent}      — suitor info (or null)
    //     milestones: [{label, progress, pct, done}]
    //     hint: string          — short flavour line shown at the top of popup
    //   }
    function evaluate(chapter) {
        if (!chapter || (chapter.id !== 0 && !chapter.id)) {
            return { gated: false, locked: false, opened: true, suitor: null, milestones: [], hint: '' };
        }
        // Aug 2026 — ladder chapters gate on the PREVIOUS character's care
        // target (Bond 3 + balanced), not on their own bond floor. This
        // takes precedence over the per-chapter GATES entry below.
        if (LADDER[chapter.id]) {
            return evaluateLadder(chapter, LADDER[chapter.id]);
        }
        var gate = GATES[chapter.id];
        if (!gate || !gate.charId || !gate.minBondLevel) {
            return {
                gated: false,
                locked: false,
                opened: true,
                suitor: null,
                milestones: [],
                hint: 'This chapter belongs to the shared spine. The thread weaves on.'
            };
        }
        var charId = gate.charId;
        var suitor = SUITORS[charId] || { name: charId, role: '', accent: '#c8a878' };
        var currentLevel = bondLevelFor(charId);
        var requiredLevel = gate.minBondLevel;
        var requiredAff   = affectionForLevel(requiredLevel);
        var currentAff    = affectionFor(charId);
        var met = currentLevel >= requiredLevel;
        var pct = Math.max(0, Math.min(1, currentAff / Math.max(1, requiredAff)));

        var hint;
        if (met) {
            hint = suitor.name + ' is ready to walk this thread with you.';
        } else if (currentLevel === 0) {
            hint = 'Care for ' + suitor.name + ' to begin weaving this thread.';
        } else {
            hint = 'Your bond with ' + suitor.name + ' is not yet deep enough for this chapter.';
        }

        return {
            gated: true,
            locked: !met,
            opened: met,
            suitor: { id: charId, name: suitor.name, role: suitor.role, accent: suitor.accent },
            milestones: [
                {
                    key: 'bond',
                    label: 'Bond Level ' + requiredLevel + ' with ' + suitor.name,
                    progress: met
                        ? ('Reached · ' + currentAff + ' affection')
                        : (currentAff + ' / ' + requiredAff + ' affection'),
                    pct: met ? 1 : pct,
                    done: met
                }
            ],
            hint: hint
        };
    }

    // ── Strongest bond (for the route-header on the chapter page) ───
    // Walks all known suitors and returns the one with the highest raw
    // affection. Null if no one has been cared for yet.
    function strongestBond() {
        var best = null;
        Object.keys(SUITORS).forEach(function (cid) {
            var raw = affectionFor(cid);
            if (raw <= 0) return;
            if (!best || raw > best.raw) {
                best = {
                    charId: cid,
                    name: SUITORS[cid].name,
                    role: SUITORS[cid].role,
                    accent: SUITORS[cid].accent,
                    raw: raw,
                    level: bondLevelFor(cid)
                };
            }
        });
        return best;
    }

    // ── Active companion swap ─────────────────────────────────────────
    // Used by the "Care for <name>" action in the gate popup. Writes the
    // Companion Chronicle's selection key and dispatches a custom event
    // so the running app updates without a hard reload. Falls back to a
    // reload only if the in-page setter isn't available (defensive).
    function switchActiveCompanion(charId) {
        if (!charId) return;
        try {
            // The Chronicle's setActive(c) is the canonical writer —
            // it persists pp_cc_active_companion AND triggers the
            // visual fade-swap. It's defined in index.html.
            if (typeof window.setActive === 'function') {
                window.setActive(charId);
                return;
            }
        } catch (_) {}
        // Fallback: write the key directly and reload.
        lsSet('pp_cc_active_companion', charId);
        try { window.location.reload(); } catch (_) {}
    }

    // ── Chapter-complete bond reward ──────────────────────────────────
    // Called by chapters.js after markDone(id). Awards the chapter's
    // configured reward to its charId. Latched per chapter id so
    // replays don't re-award. Bond ticks land both on the live in-game
    // value (if active companion matches) AND on the localStorage key
    // (so the bond is visible whether you switch companions or not).
    //
    // Also fires a single "bond +N" toast via ActionFeedback if it's
    // loaded, so the reward feels good rather than silent.
    function onChapterDone(id) {
        var gate = GATES[id];
        if (!gate || !gate.charId || !gate.reward) return;
        var awardedKey = 'pp_chapter_bond_awarded_' + id;
        if (lsGet(awardedKey) === '1') return; // already rewarded — replay
        lsSet(awardedKey, '1');

        var charId = gate.charId;
        var reward = gate.reward;

        // Bump in-memory affection if the active companion matches.
        // This is the value the care HUD displays and reads from.
        try {
            var g = window._game;
            if (g && typeof g.affection === 'number') {
                var live = (g.selectedCharacter || g.characterId);
                if (live === charId) {
                    g.affection = Math.max(0, g.affection + reward);
                    if (typeof g.updateUI === 'function') {
                        try { g.updateUI(); } catch (_) {}
                    }
                }
            }
        } catch (_) {}

        // Mirror to localStorage so the bond persists across companion
        // swaps and across sessions.
        try {
            var key = 'pp_affection_' + charId;
            var prev = parseInt(lsGet(key) || '0', 10) || 0;
            lsSet(key, String(Math.max(0, prev + reward)));
        } catch (_) {}

        // Subtle reward feedback if the toast layer is around.
        try {
            var name = (SUITORS[charId] && SUITORS[charId].name) || charId;
            if (window.PPActionFeedback && typeof window.PPActionFeedback.toast === 'function') {
                window.PPActionFeedback.toast('Bond with ' + name + ' deepened (+' + reward + ')');
            } else {
                // Quiet console breadcrumb for dev visibility — no UI noise.
                if (typeof console !== 'undefined' && console.info) {
                    console.info('[PPRouteGates] bond reward +' + reward + ' → ' + charId);
                }
            }
        } catch (_) {}
    }

    // ── Popup styles ──────────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('pp-route-gate-styles')) return;
        var s = document.createElement('style');
        s.id = 'pp-route-gate-styles';
        s.textContent =
            '#pp-route-gate-backdrop {' +
            '  position: fixed; inset: 0; z-index: 13000;' +
            '  background: radial-gradient(ellipse at center,' +
            '    rgba(11, 4, 16, 0.78) 0%, rgba(11, 4, 16, 0.92) 80%);' +
            '  display: flex; align-items: center; justify-content: center;' +
            '  padding: 24px;' +
            '  opacity: 0; transition: opacity 260ms cubic-bezier(0.22, 1, 0.36, 1);' +
            '}' +
            '#pp-route-gate-backdrop.show { opacity: 1; }' +
            '#pp-route-gate-panel {' +
            '  width: 100%; max-width: 360px;' +
            '  background: linear-gradient(180deg,' +
            '    rgba(43, 17, 51, 0.96) 0%, rgba(21, 8, 26, 0.96) 100%);' +
            '  border: 1px solid rgba(212, 168, 91, 0.32);' +
            '  border-radius: 16px;' +
            '  padding: 22px 22px 20px;' +
            '  box-shadow:' +
            '    inset 0 1px 0 rgba(212, 168, 91, 0.18),' +
            '    0 16px 48px -16px rgba(0, 0, 0, 0.8),' +
            '    0 0 48px rgba(122, 18, 36, 0.25);' +
            '  transform: translateY(8px) scale(0.97);' +
            '  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);' +
            '}' +
            '#pp-route-gate-backdrop.show #pp-route-gate-panel {' +
            '  transform: translateY(0) scale(1);' +
            '}' +
            '#pp-route-gate-eyebrow {' +
            '  font-family: "Quicksand", "Inter", sans-serif;' +
            '  font-size: 9px; letter-spacing: 0.22em; font-weight: 600;' +
            '  color: rgba(232, 168, 91, 0.75); text-transform: uppercase;' +
            '  text-align: center; margin: 0 0 6px;' +
            '}' +
            '#pp-route-gate-title {' +
            '  font-family: "Cormorant Garamond", serif; font-style: italic;' +
            '  font-size: 18px; font-weight: 500;' +
            '  color: rgba(244, 235, 220, 0.96);' +
            '  text-align: center; margin: 0 0 4px;' +
            '}' +
            '#pp-route-gate-subtitle {' +
            '  font-family: "Quicksand", "Inter", sans-serif;' +
            '  font-size: 10px; letter-spacing: 0.16em;' +
            '  color: rgba(232, 168, 91, 0.6); text-transform: uppercase;' +
            '  text-align: center; margin: 0 0 14px;' +
            '}' +
            '#pp-route-gate-hint {' +
            '  font-family: "Cormorant Garamond", serif; font-style: italic;' +
            '  font-size: 13px; line-height: 1.5;' +
            '  color: rgba(232, 200, 220, 0.78);' +
            '  text-align: center; margin: 0 0 16px;' +
            '}' +
            '.pp-route-gate-row {' +
            '  display: flex; align-items: flex-start; gap: 10px;' +
            '  padding: 10px 12px; margin-bottom: 6px;' +
            '  background: rgba(15, 8, 26, 0.55);' +
            '  border: 1px solid rgba(212, 168, 91, 0.14);' +
            '  border-radius: 10px;' +
            '}' +
            '.pp-route-gate-row.is-done {' +
            '  border-color: rgba(212, 168, 91, 0.45);' +
            '  background: linear-gradient(180deg,' +
            '    rgba(43, 28, 56, 0.7) 0%, rgba(21, 8, 26, 0.7) 100%);' +
            '}' +
            '.pp-route-gate-check {' +
            '  flex: 0 0 18px; width: 18px; height: 18px;' +
            '  border-radius: 50%;' +
            '  border: 1.5px solid rgba(212, 168, 91, 0.4);' +
            '  display: flex; align-items: center; justify-content: center;' +
            '  color: rgba(244, 235, 220, 0.5);' +
            '  font-size: 10px; line-height: 1;' +
            '  margin-top: 2px;' +
            '}' +
            '.pp-route-gate-row.is-done .pp-route-gate-check {' +
            '  border-color: #D4A85B;' +
            '  background: radial-gradient(circle at 32% 32%, #F2D690, #B8923E);' +
            '  color: #2B1133;' +
            '}' +
            '.pp-route-gate-text { flex: 1 1 auto; }' +
            '.pp-route-gate-label {' +
            '  font-family: "Cormorant Garamond", serif;' +
            '  font-size: 13px; line-height: 1.35;' +
            '  color: rgba(244, 235, 220, 0.92);' +
            '}' +
            '.pp-route-gate-progress {' +
            '  font-family: "Quicksand", "Inter", sans-serif;' +
            '  font-size: 10px; letter-spacing: 0.08em;' +
            '  color: rgba(232, 168, 91, 0.72);' +
            '  margin-top: 3px;' +
            '}' +
            '.pp-route-gate-bar {' +
            '  margin-top: 6px;' +
            '  width: 100%; height: 4px;' +
            '  background: rgba(15, 8, 26, 0.85);' +
            '  border: 1px solid rgba(212, 168, 91, 0.18);' +
            '  border-radius: 999px;' +
            '  overflow: hidden;' +
            '}' +
            '.pp-route-gate-bar-fill {' +
            '  display: block; height: 100%;' +
            '  background: linear-gradient(90deg, #B8923E 0%, #F2D690 100%);' +
            '  border-radius: 999px;' +
            '  transition: width 280ms ease;' +
            '  box-shadow: 0 0 6px rgba(232, 168, 91, 0.55);' +
            '}' +
            '#pp-route-gate-actions {' +
            '  display: flex; gap: 8px; justify-content: center;' +
            '  margin-top: 16px;' +
            '}' +
            '.pp-route-gate-btn {' +
            '  flex: 0 0 auto;' +
            '  background: linear-gradient(180deg, rgba(122, 18, 36, 0.65), rgba(76, 14, 34, 0.85));' +
            '  border: 1px solid rgba(212, 168, 91, 0.4);' +
            '  color: rgba(244, 235, 220, 0.96);' +
            '  padding: 9px 18px; border-radius: 10px;' +
            '  font-family: "Cormorant Garamond", serif; font-style: italic;' +
            '  font-size: 13px; letter-spacing: 0.04em;' +
            '  cursor: pointer;' +
            '}' +
            '.pp-route-gate-btn.primary {' +
            '  background: linear-gradient(180deg, rgba(184, 146, 62, 0.7), rgba(122, 90, 30, 0.85));' +
            '  color: #1a0a14;' +
            '  font-weight: 600;' +
            '}' +
            '.pp-route-gate-btn:active { transform: scale(0.96); }';
        document.head.appendChild(s);
    }

    // ── Popup ─────────────────────────────────────────────────────────
    // Pass the full chapter object so the popup can show the right title
    // and route to the right suitor. Wraps PPMSGate's checklist register
    // for visual continuity — same fonts, same colours, same shape.
    function showChapterGate(chapter) {
        if (!chapter) return;
        injectStyles();
        var state = evaluate(chapter);

        // If the chapter isn't actually gated, nothing to show — caller
        // shouldn't be hitting this. Bail cleanly.
        if (!state.gated || !state.suitor) return;

        var existing = document.getElementById('pp-route-gate-backdrop');
        if (existing) existing.remove();

        var bd = document.createElement('div');
        bd.id = 'pp-route-gate-backdrop';

        var ttl = chapter.title || ('Chapter ' + chapter.id);
        if (chapter.subtitle) ttl += ' · ' + chapter.subtitle;

        // Compose without template strings so this file stays
        // single-script-tag compatible with older mobile WebViews.
        var html = '' +
            '<div id="pp-route-gate-panel" role="dialog" aria-modal="true">' +
            '  <div id="pp-route-gate-eyebrow">Thread Locked</div>' +
            '  <h3 id="pp-route-gate-title">' + escapeHtml(ttl) + '</h3>' +
            '  <div id="pp-route-gate-subtitle">' + escapeHtml(state.suitor.role) + ' · ' + escapeHtml(state.suitor.name) + '</div>' +
            '  <p id="pp-route-gate-hint">' + escapeHtml(state.hint) + '</p>' +
            '  <div id="pp-route-gate-list"></div>' +
            '  <div id="pp-route-gate-actions">' +
            '    <button class="pp-route-gate-btn" id="pp-route-gate-close" type="button">Close</button>' +
            '    <button class="pp-route-gate-btn primary" id="pp-route-gate-switch" type="button">' +
            '      Care for ' + escapeHtml(state.suitor.name) +
            '    </button>' +
            '  </div>' +
            '</div>';
        bd.innerHTML = html;
        document.body.appendChild(bd);

        var list = bd.querySelector('#pp-route-gate-list');
        state.milestones.forEach(function (m) {
            var pct = (typeof m.pct === 'number') ? Math.round(m.pct * 100) : (m.done ? 100 : 0);
            var row = document.createElement('div');
            row.className = 'pp-route-gate-row' + (m.done ? ' is-done' : '');
            row.innerHTML =
                '<span class="pp-route-gate-check">' + (m.done ? '✓' : '') + '</span>' +
                '<span class="pp-route-gate-text">' +
                '  <div class="pp-route-gate-label">' + escapeHtml(m.label) + '</div>' +
                '  <div class="pp-route-gate-progress">' + escapeHtml(m.progress) + '</div>' +
                '  <div class="pp-route-gate-bar"><span class="pp-route-gate-bar-fill" style="width:' + pct + '%"></span></div>' +
                '</span>';
            list.appendChild(row);
        });

        function close() {
            bd.classList.remove('show');
            setTimeout(function () {
                if (bd.parentNode) bd.parentNode.removeChild(bd);
            }, 280);
        }
        bd.querySelector('#pp-route-gate-close').addEventListener('click', close);
        bd.querySelector('#pp-route-gate-switch').addEventListener('click', function () {
            // Close the popup, swap the active companion, and close the
            // chapter-list page if it is open so the player drops back
            // into the Chronicle ready to care.
            close();
            try {
                if (window.MSChapters && typeof window.MSChapters.close === 'function') {
                    window.MSChapters.close();
                }
            } catch (_) {}
            switchActiveCompanion(state.suitor.id);
        });
        bd.addEventListener('click', function (e) {
            if (e.target === bd) close();
        });

        void bd.offsetHeight;
        bd.classList.add('show');
    }

    // Tiny escape helper — we're inserting suitor names + chapter titles
    // that originated in our own data, but routing user-visible strings
    // through this is cheap and keeps us defensive.
    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ── Linear-lock fallback popup ────────────────────────────────────
    // Some chapters are locked by the linear plot-pointer (player hasn't
    // finished the previous chapter yet) and don't have a route bond
    // gate of their own. The chapter-list used to defer to PPChain for
    // these, but PPChain is a no-op after the June clean-slate, so a
    // tap silently did nothing. This popup is the graceful fallback —
    // same visual register as the route popup, no "Care for X" button
    // (there's no specific suitor to direct the player to).
    function showLinearLockPopup(chapter, reason) {
        if (!chapter) return;
        injectStyles();
        var existing = document.getElementById('pp-route-gate-backdrop');
        if (existing) existing.remove();

        var ttl = chapter.title || ('Chapter ' + chapter.id);
        if (chapter.subtitle) ttl += ' · ' + chapter.subtitle;
        var hint = reason || 'Complete the previous chapter first.';

        var bd = document.createElement('div');
        bd.id = 'pp-route-gate-backdrop';
        bd.innerHTML = '' +
            '<div id="pp-route-gate-panel" role="dialog" aria-modal="true">' +
            '  <div id="pp-route-gate-eyebrow">Chapter Locked</div>' +
            '  <h3 id="pp-route-gate-title">' + escapeHtml(ttl) + '</h3>' +
            '  <p id="pp-route-gate-hint" style="margin-top:10px">' + escapeHtml(hint) + '</p>' +
            '  <div id="pp-route-gate-actions">' +
            '    <button class="pp-route-gate-btn primary" id="pp-route-gate-close" type="button">Close</button>' +
            '  </div>' +
            '</div>';
        document.body.appendChild(bd);

        function close() {
            bd.classList.remove('show');
            setTimeout(function () {
                if (bd.parentNode) bd.parentNode.removeChild(bd);
            }, 280);
        }
        bd.querySelector('#pp-route-gate-close').addEventListener('click', close);
        bd.addEventListener('click', function (e) { if (e.target === bd) close(); });

        void bd.offsetHeight;
        bd.classList.add('show');
    }

    // ── Care-route OPENED announcement (Aug 2026, Stage 2) ─────────────
    // When a character's care target is met, the NEXT rung's care route
    // opens. This celebratory popup announces it ("✦ Elian's care route
    // is open"). Fires once per route (latched pp_care_route_popup_<c>).
    // The Alistair→Elian (Ch6) beat is owned by the richer, dedicated
    // ch6-unlock-celebration.js, so this generic popup deliberately
    // skips 'elian' (see checkLadderUnlocks).
    function announceRouteOpen(charId) {
        injectStyles();
        var suitor = SUITORS[charId] || { name: charId, role: '', accent: '#c8a878' };
        var existing = document.getElementById('pp-route-gate-backdrop');
        if (existing) existing.remove();

        var nextChar = LADDER_NEXT[charId];
        var nextLine = nextChar && SUITORS[nextChar]
            ? ('Deepen your bond with ' + suitor.name + ', and ' + SUITORS[nextChar].name + '’s thread opens after.')
            : ('A new thread of fate begins.');

        var bd = document.createElement('div');
        bd.id = 'pp-route-gate-backdrop';
        bd.innerHTML = '' +
            '<div id="pp-route-gate-panel" role="dialog" aria-modal="true">' +
            '  <div id="pp-route-gate-eyebrow">✦ A New Thread Opens ✦</div>' +
            '  <h3 id="pp-route-gate-title">' + escapeHtml(suitor.name) + '’s care route is open</h3>' +
            '  <div id="pp-route-gate-subtitle">' + escapeHtml(suitor.role) + '</div>' +
            '  <p id="pp-route-gate-hint" style="margin-top:8px">' + escapeHtml(nextLine) + '</p>' +
            '  <div id="pp-route-gate-actions">' +
            '    <button class="pp-route-gate-btn" id="pp-route-gate-close" type="button">Later</button>' +
            '    <button class="pp-route-gate-btn primary" id="pp-route-gate-switch" type="button">Care for ' + escapeHtml(suitor.name) + '</button>' +
            '  </div>' +
            '</div>';
        document.body.appendChild(bd);

        function close() {
            bd.classList.remove('show');
            setTimeout(function () { if (bd.parentNode) bd.parentNode.removeChild(bd); }, 280);
        }
        bd.querySelector('#pp-route-gate-close').addEventListener('click', close);
        bd.querySelector('#pp-route-gate-switch').addEventListener('click', function () {
            close();
            switchActiveCompanion(charId);
        });
        bd.addEventListener('click', function (e) { if (e.target === bd) close(); });
        void bd.offsetHeight;
        bd.classList.add('show');
    }

    // Don't pop the announcement over a chapter, cinematic, or another
    // modal — defer to a later poll tick. Only surface it on the calm
    // Chronicle/care screens.
    function announceOK() {
        try {
            var onCalm = document.body.classList.contains('pp-screen-select') ||
                         document.body.classList.contains('pp-screen-care');
            if (!onCalm) return false;
            var busy = document.getElementById('chp-page') ||
                       document.querySelector('#mscard-root:not(:empty)') ||
                       document.getElementById('pp-ch6-backdrop') ||
                       document.getElementById('pp-ms-gate-backdrop') ||
                       document.getElementById('pp-route-gate-backdrop') ||
                       document.querySelector('#cinematic-overlay.visible');
            return !busy;
        } catch (_) { return false; }
    }

    // Poll: when a gatekeeper's target becomes met, announce the next
    // rung's route (once). The CARE-ACCESS unlock itself is computed
    // live by careRouteOpen() — no flag needed for that; this poll is
    // purely for the one-shot celebratory popup.
    function checkLadderUnlocks() {
        Object.keys(PREV_ROUTE).forEach(function (nextChar) {
            var prev = PREV_ROUTE[nextChar];
            if (!careTargetMet(prev)) return;
            var key = 'pp_care_route_popup_' + nextChar;
            if (lsGet(key) === '1') return;            // already announced
            if (nextChar === 'elian') { lsSet(key, '1'); return; } // owned by ch6 celebration
            if (!announceOK()) return;                 // defer; try next tick
            lsSet(key, '1');
            announceRouteOpen(nextChar);
        });
    }

    // Aug 2026 — RETIRED the per-rung announce poll. The route-open
    // celebration is now owned entirely by ch6-unlock-celebration.js,
    // generalized to EVERY handoff (driven by careLadderProgress and
    // correctly gated on the linear story step, not just the care target).
    // Running both would double-fire popups. checkLadderUnlocks() +
    // announceRouteOpen() are left defined (exported) for any manual/debug
    // use, but nothing polls them now.
    void checkLadderUnlocks; // keep reference; no auto-poll

    // ── Exports ───────────────────────────────────────────────────────
    window.PPRouteGates = {
        evaluate:           evaluate,
        showChapterGate:    showChapterGate,
        showLinearLockPopup: showLinearLockPopup,
        onChapterDone:      onChapterDone,
        strongestBond:      strongestBond,
        // Care-route ladder (Aug 2026) — used by the Stage-2 unlock/popup
        // layer and by the Chronicle care-access lock.
        careTargetMet:      careTargetMet,
        careRouteOpen:      careRouteOpen,
        routePrereq:        routePrereq,
        careLadderProgress: careLadderProgress,
        balancedFor:        balancedFor,
        nextRoute:          function (charId) { return LADDER_NEXT[charId] || null; },
        announceRouteOpen:  announceRouteOpen,
        // Exposed for the chapter-page header + dev tooling.
        _bondLevelFor:      bondLevelFor,
        _affectionFor:      affectionFor,
        _careTargetBond:    CARE_TARGET_BOND,
        _ladder:            LADDER,
        _ladderNext:        LADDER_NEXT,
        _suitors:           SUITORS,
        _gates:             GATES
    };
})();
