/* ============================================================================
 * AFFINITY REWARD LADDER (Jun 2026) — the visible goal gradient.
 * ----------------------------------------------------------------------------
 * THE ADDICTION MECHANIC: the game already unlocks intimate "affection scenes"
 * (warm → closer → chosen → midnight → aftermath, at affection 10/25/50/75/90)
 * plus gallery cards as you care for a character — but that reward schedule was
 * INVISIBLE. The player couldn't see what they were climbing toward, so the
 * "just a little more care" compulsion never fired.
 *
 * This panel SURFACES that climb: a per-character "Bond Journey" showing every
 * milestone, what's unlocked, and — crucially — the NEXT reward dangled with a
 * progress bar ("Affection 42 / 50 → 'The Word'"). Unlocked moments are
 * tappable to relive. This is the goal-gradient + endowed-progress loop that
 * top otome (Love & Deepspace, Tears of Themis) run on.
 *
 * Purely additive + read-only on existing systems:
 *   - content    ← window.AffectionScenes.list() (scene titles/subtitles)
 *   - replay     ← window.AffectionScenes.force(char, tier)
 *   - affection  ← window._game.affection / PPRouteGates._affectionFor(char)
 *   - seen-state ← localStorage pp_aff_<char>_<tier>
 *   - cards      ← window._game.gallery (count only)
 * Entry point: tapping the care-screen bond HUD (#affection-display). No new
 * persistent care-screen pill (owner removed the Memories pill for clutter).
 * ========================================================================== */
(function () {
    'use strict';

    var FLAG_KEY = 'pp_main_story_enabled';
    var OVERLAY_ID = 'pp-affinity-overlay';
    var STYLE_ID = 'pp-affinity-styles';
    var HINT_SEEN_KEY = 'pp_affinity_hint_seen';

    // Must match affection-scenes.js TIERS (the reward schedule we surface).
    var TIERS = [
        { key: 'warm',      min: 10, tag: 'A warm moment' },
        { key: 'closer',    min: 25, tag: 'Growing closer' },
        { key: 'chosen',    min: 50, tag: 'Chosen' },
        { key: 'midnight',  min: 75, tag: 'Midnight' },
        { key: 'aftermath', min: 90, tag: 'The morning after' }
    ];
    var AFF_MAX = 100;

    // ── helpers ──────────────────────────────────────────────────────────
    function ls(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
    function enabled() { return ls(FLAG_KEY) === '1'; }

    function activeChar() {
        var g = window._game;
        return (g && (g.selectedCharacter || g.characterId)) || ls('pp_cc_active_companion') || null;
    }
    function affectionFor(char) {
        try {
            var g = window._game;
            if (g && typeof g.affection === 'number' && (g.selectedCharacter || g.characterId) === char) {
                return Math.max(0, Math.min(AFF_MAX, g.affection));
            }
        } catch (_) {}
        try {
            if (window.PPRouteGates && PPRouteGates._affectionFor) {
                return Math.max(0, Math.min(AFF_MAX, PPRouteGates._affectionFor(char)));
            }
        } catch (_) {}
        var raw = parseInt(ls('pp_affection_' + char) || '0', 10) || 0;
        return Math.max(0, Math.min(AFF_MAX, raw));
    }
    function scenesFor(char) {
        try { return (window.AffectionScenes && AffectionScenes.list && AffectionScenes.list()[char]) || null; }
        catch (_) { return null; }
    }
    function suitorName(char) {
        try {
            if (window.PPRouteGates && PPRouteGates._suitors && PPRouteGates._suitors[char]) {
                return PPRouteGates._suitors[char].name;
            }
        } catch (_) {}
        return char ? char.charAt(0).toUpperCase() + char.slice(1) : '';
    }
    // Pull the evocative name out of a scene subtitle ("ALISTAIR · The Word" → "The Word").
    function sceneName(scene, fallback) {
        if (!scene) return fallback;
        var s = scene.subtitle || '';
        if (s.indexOf('·') !== -1) return s.split('·').pop().trim();
        return s || fallback;
    }
    function galleryProgress(char) {
        try {
            var gal = window._game && window._game.gallery;
            if (!gal || typeof gal.cardsForChar !== 'function') return null;
            var all = gal.cardsForChar(char) || [];
            if (!all.length) return null;
            var got = all.filter(function (c) { return gal.unlockedCards && gal.unlockedCards.has(c.id); }).length;
            return { got: got, total: all.length };
        } catch (_) { return null; }
    }

    // ── styles ───────────────────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        var s = document.createElement('style');
        s.id = STYLE_ID;
        s.textContent = [
            '#' + OVERLAY_ID + ' {',
            '  position: fixed; inset: 0; z-index: 13800;',
            '  background: radial-gradient(ellipse at center, rgba(11,4,16,0.90) 0%, rgba(11,4,16,0.97) 80%);',
            '  display: flex; align-items: center; justify-content: center; padding: 20px;',
            '  opacity: 0; transition: opacity 320ms cubic-bezier(0.22,1,0.36,1);',
            '  -webkit-tap-highlight-color: transparent;',
            '}',
            '#' + OVERLAY_ID + '.show { opacity: 1; }',
            '.pp-aff-panel {',
            '  position: relative; width: 100%; max-width: 380px; max-height: 90vh; overflow-y: auto;',
            '  background: linear-gradient(180deg, rgba(43,17,51,0.98) 0%, rgba(21,8,26,0.98) 100%);',
            '  border: 1px solid rgba(212,168,91,0.50); border-radius: 18px; padding: 22px 18px 18px;',
            '  box-shadow: inset 0 1px 0 rgba(212,168,91,0.25), 0 28px 64px -18px rgba(0,0,0,0.88), 0 0 70px rgba(232,168,91,0.30);',
            '  transform: translateY(14px) scale(0.96); transition: transform 360ms cubic-bezier(0.22,1,0.36,1);',
            '}',
            '#' + OVERLAY_ID + '.show .pp-aff-panel { transform: translateY(0) scale(1); }',
            '.pp-aff-close { position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; border-radius: 50%;',
            '  border: 1px solid rgba(247,236,209,0.45); background: rgba(30,18,10,0.55); color: #f7ecd1; font-size: 16px;',
            '  display: flex; align-items: center; justify-content: center; cursor: pointer; }',
            '.pp-aff-eyebrow { font-family: Quicksand, Inter, sans-serif; font-size: 9.5px; letter-spacing: 0.24em; font-weight: 600;',
            '  text-transform: uppercase; color: rgba(232,168,91,0.92); text-align: center; margin: 0 0 4px; }',
            '.pp-aff-title { font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 23px; color: #f4ebdc;',
            '  text-align: center; margin: 0 0 12px; text-shadow: 0 0 18px rgba(232,168,91,0.30); }',
            '.pp-aff-meter-wrap { margin: 0 6px 6px; }',
            '.pp-aff-meter-top { display: flex; justify-content: space-between; align-items: baseline; font-family: Quicksand, Inter, sans-serif;',
            '  font-size: 10px; letter-spacing: 0.08em; color: rgba(232,200,220,0.80); margin-bottom: 5px; }',
            '.pp-aff-meter-top b { color: #f4ebdc; font-size: 12px; }',
            '.pp-aff-bar { height: 7px; border-radius: 999px; background: rgba(15,8,26,0.85); border: 1px solid rgba(212,168,91,0.20); overflow: hidden; }',
            '.pp-aff-bar-fill { display: block; height: 100%; border-radius: 999px;',
            '  background: linear-gradient(90deg, #B8923E 0%, #F2D690 100%); box-shadow: 0 0 8px rgba(232,168,91,0.6);',
            '  transition: width 700ms cubic-bezier(0.22,1,0.36,1); }',
            '.pp-aff-next { text-align: center; font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 13px;',
            '  color: rgba(232,200,220,0.90); margin: 9px 4px 14px; }',
            '.pp-aff-next b { color: #F2D690; font-style: normal; }',
            // rungs
            '.pp-aff-rung { display: flex; align-items: center; gap: 12px; padding: 11px 12px; margin: 0 0 8px;',
            '  border-radius: 12px; border: 1px solid rgba(212,168,91,0.14); background: rgba(15,8,26,0.45); position: relative; }',
            '.pp-aff-rung.reached { border-color: rgba(212,168,91,0.50);',
            '  background: linear-gradient(180deg, rgba(60,30,80,0.55), rgba(36,18,52,0.7)); cursor: pointer; }',
            '.pp-aff-rung.next { border-color: rgba(232,76,140,0.65);',
            '  background: linear-gradient(180deg, rgba(232,76,140,0.18), rgba(122,18,36,0.22));',
            '  box-shadow: 0 0 22px rgba(232,76,140,0.30) inset, 0 0 16px rgba(232,76,140,0.25); }',
            '.pp-aff-rung.locked { opacity: 0.6; }',
            '.pp-aff-node { flex: 0 0 36px; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;',
            '  font-size: 15px; border: 1.5px solid rgba(212,168,91,0.4); color: rgba(244,235,220,0.6); background: rgba(15,8,26,0.6); }',
            '.pp-aff-rung.reached .pp-aff-node { border-color: #D4A85B; color: #2B1133;',
            '  background: radial-gradient(circle at 32% 32%, #F2D690, #B8923E); box-shadow: 0 0 12px rgba(232,168,91,0.5); }',
            '.pp-aff-rung.next .pp-aff-node { border-color: #E84C8C; color: #ffe; background: radial-gradient(circle at 32% 32%, #ff8fbf, #b8123a); }',
            '.pp-aff-rtext { flex: 1 1 auto; min-width: 0; }',
            '.pp-aff-rtag { font-family: Quicksand, Inter, sans-serif; font-size: 8.5px; letter-spacing: 0.18em; text-transform: uppercase;',
            '  color: rgba(232,168,91,0.70); margin-bottom: 2px; }',
            '.pp-aff-rname { font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 16px; color: #f4ebdc; line-height: 1.15; }',
            '.pp-aff-rung.locked .pp-aff-rname { color: rgba(244,235,220,0.55); }',
            '.pp-aff-rmeta { font-family: Quicksand, Inter, sans-serif; font-size: 9.5px; color: rgba(232,200,220,0.65); margin-top: 3px; }',
            '.pp-aff-rung.next .pp-aff-rmeta { color: #ffc6dd; }',
            '.pp-aff-rung.reached .pp-aff-relive { color: rgba(232,168,91,0.85); font-size: 11px; flex: 0 0 auto; font-family: "Cormorant Garamond", serif; font-style: italic; }',
            // footer
            '.pp-aff-foot { margin: 10px 6px 2px; padding-top: 12px; border-top: 1px dashed rgba(212,168,91,0.22);',
            '  display: flex; align-items: center; justify-content: space-between; cursor: pointer; }',
            '.pp-aff-foot-label { font-family: Quicksand, Inter, sans-serif; font-size: 10px; letter-spacing: 0.1em; color: rgba(232,200,220,0.8); }',
            '.pp-aff-foot-val { font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 15px; color: #F2D690; }',
            // entry-point affordance on the bond HUD
            '#affection-display { cursor: pointer; position: relative; }',
            '#affection-display .pp-aff-glint { margin-left: 5px; color: #F2D690; font-size: 11px; opacity: 0.9;',
            '  animation: pp-aff-glint 2.4s ease-in-out infinite; }',
            '@keyframes pp-aff-glint { 0%,100% { opacity: 0.35; } 50% { opacity: 1; text-shadow: 0 0 8px rgba(242,214,144,0.8); } }',
            // one-time coach hint
            '.pp-aff-hint { position: fixed; z-index: 13700; max-width: 230px; padding: 10px 13px; border-radius: 12px;',
            '  background: linear-gradient(180deg, rgba(60,30,80,0.97), rgba(36,18,52,0.97)); border: 1px solid rgba(232,168,91,0.5);',
            '  box-shadow: 0 10px 30px -8px rgba(0,0,0,0.7); color: #f4ebdc; font-family: "Cormorant Garamond", serif; font-style: italic;',
            '  font-size: 13px; line-height: 1.35; opacity: 0; transition: opacity 400ms ease; }',
            '.pp-aff-hint.show { opacity: 1; }'
        ].join('\n');
        (document.head || document.documentElement).appendChild(s);
    }

    // ── panel ────────────────────────────────────────────────────────────
    function close() {
        var ov = document.getElementById(OVERLAY_ID);
        if (!ov) return;
        ov.classList.remove('show');
        setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 340);
    }

    function open(char) {
        char = char || activeChar();
        if (!char || document.getElementById(OVERLAY_ID)) return;
        var scenes = scenesFor(char);
        injectStyles();

        var aff = affectionFor(char);
        var name = suitorName(char);

        // Find the NEXT (lowest not-yet-reached) tier — the goal gradient.
        var nextTier = null;
        for (var i = 0; i < TIERS.length; i++) { if (aff < TIERS[i].min) { nextTier = TIERS[i]; break; } }

        var nextLine;
        if (nextTier) {
            var nm = sceneName(scenes && scenes[nextTier.key], nextTier.tag);
            nextLine = 'Next: <b>' + esc(nm) + '</b> &middot; ' + (nextTier.min - aff) + ' more affection';
        } else {
            nextLine = '<b>Every moment unlocked.</b> His heart is yours.';
        }

        var ov = document.createElement('div');
        ov.id = OVERLAY_ID;
        ov.setAttribute('role', 'dialog');
        ov.setAttribute('aria-modal', 'true');

        var rungsHtml = '';
        for (var j = 0; j < TIERS.length; j++) {
            var t = TIERS[j];
            var reached = aff >= t.min;
            var isNext = nextTier && t.key === nextTier.key;
            var sc = scenes && scenes[t.key];
            var rname = reached ? esc(sceneName(sc, t.tag)) : (isNext ? esc(sceneName(sc, t.tag)) : '? ? ?');
            var cls = reached ? 'reached' : (isNext ? 'next' : 'locked');
            var node = reached ? '♥' : (isNext ? '✦' : '◇');
            var meta = reached
                ? 'Reached at ' + t.min + ' affection'
                : (isNext ? (t.min - aff) + ' more to unlock' : 'Affection ' + t.min);
            var relive = reached ? '<span class="pp-aff-relive">relive ›</span>' : '';
            rungsHtml +=
                '<div class="pp-aff-rung ' + cls + '" data-tier="' + t.key + '" data-reached="' + (reached ? '1' : '0') + '">' +
                '  <div class="pp-aff-node">' + node + '</div>' +
                '  <div class="pp-aff-rtext">' +
                '    <div class="pp-aff-rtag">' + esc(t.tag) + '</div>' +
                '    <div class="pp-aff-rname">' + rname + '</div>' +
                '    <div class="pp-aff-rmeta">' + meta + '</div>' +
                '  </div>' + relive +
                '</div>';
        }

        var gp = galleryProgress(char);
        var footHtml = gp
            ? '<div class="pp-aff-foot" id="pp-aff-gallery"><span class="pp-aff-foot-label">✦ MEMORIES COLLECTED</span><span class="pp-aff-foot-val">' + gp.got + ' / ' + gp.total + '</span></div>'
            : '';

        ov.innerHTML =
            '<div class="pp-aff-panel" role="document">' +
            '  <button class="pp-aff-close" type="button" aria-label="Close">✕</button>' +
            '  <div class="pp-aff-eyebrow">The Bond Journey</div>' +
            '  <h2 class="pp-aff-title">' + esc(name) + '’s Heart</h2>' +
            '  <div class="pp-aff-meter-wrap">' +
            '    <div class="pp-aff-meter-top"><span>Affection</span><span><b>' + aff + '</b> / ' + AFF_MAX + '</span></div>' +
            '    <div class="pp-aff-bar"><span class="pp-aff-bar-fill" style="width:' + Math.round(aff / AFF_MAX * 100) + '%"></span></div>' +
            '  </div>' +
            '  <div class="pp-aff-next">' + nextLine + '</div>' +
            rungsHtml +
            footHtml +
            '</div>';
        document.body.appendChild(ov);

        // interactions
        ov.querySelector('.pp-aff-close').addEventListener('click', function (e) { e.stopPropagation(); close(); });
        ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
        // relive a reached scene
        ov.querySelectorAll('.pp-aff-rung.reached').forEach(function (row) {
            row.addEventListener('click', function (e) {
                e.stopPropagation();
                var tier = row.getAttribute('data-tier');
                close();
                setTimeout(function () {
                    try { if (window.AffectionScenes && AffectionScenes.force) AffectionScenes.force(char, tier); } catch (_) {}
                }, 380);
            });
        });
        // gallery jump
        var foot = ov.querySelector('#pp-aff-gallery');
        if (foot) foot.addEventListener('click', function (e) {
            e.stopPropagation(); close();
            setTimeout(function () { try { if (window._game && window._game.gallery) window._game.gallery.open(); } catch (_) {} }, 380);
        });

        try { if (window.sounds && sounds.swoosh) sounds.swoosh(); } catch (_) {}
        void ov.offsetHeight;
        ov.classList.add('show');
    }

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    // ── entry point: make the bond HUD tappable + a glint + one-time hint ──
    function wireEntry() {
        var hud = document.getElementById('affection-display');
        if (!hud || hud.dataset.ppAffWired) return;
        hud.dataset.ppAffWired = '1';
        injectStyles();
        // glint affordance (so it reads as interactive)
        if (!hud.querySelector('.pp-aff-glint')) {
            var g = document.createElement('span');
            g.className = 'pp-aff-glint';
            g.textContent = '✦';
            hud.appendChild(g);
        }
        hud.addEventListener('click', function (e) {
            e.stopPropagation();
            if (!enabled()) return;
            open(activeChar());
        });
    }

    // One-time coach hint pointing at the bond HUD, shown the first time the
    // player is calmly on the care screen.
    function maybeHint() {
        if (ls(HINT_SEEN_KEY) === '1') return;
        if (!document.body.classList.contains('pp-screen-care')) return;
        if (!enabled()) return;
        // don't pop over a beat / overlay
        try { if (window.PPOverlay && PPOverlay.anyOpen && PPOverlay.anyOpen()) return; } catch (_) {}
        if (document.body.classList.contains('pp-chapter-active')) return;
        var hud = document.getElementById('affection-display');
        if (!hud) return;
        var rect = hud.getBoundingClientRect();
        if (!rect.width) return;
        lsSet(HINT_SEEN_KEY, '1');
        injectStyles();
        var nm = suitorName(activeChar());
        var hint = document.createElement('div');
        hint.className = 'pp-aff-hint';
        hint.innerHTML = '✦ Tap here to see ' + esc(nm) + '’s Bond Journey — and what you’ll unlock next.';
        document.body.appendChild(hint);
        // position under the HUD
        hint.style.top = Math.min(window.innerHeight - 90, rect.bottom + 8) + 'px';
        hint.style.left = Math.max(10, Math.min(window.innerWidth - 240, rect.left)) + 'px';
        void hint.offsetHeight;
        hint.classList.add('show');
        var dismiss = function () {
            hint.classList.remove('show');
            setTimeout(function () { if (hint.parentNode) hint.parentNode.removeChild(hint); }, 420);
            document.removeEventListener('click', dismiss, true);
        };
        setTimeout(function () { document.addEventListener('click', dismiss, true); }, 50);
        setTimeout(dismiss, 7000);
    }

    function boot() {
        wireEntry();
        // re-wire when the care screen (re)mounts, and offer the one-time hint
        document.addEventListener('pp:scene-change', function (e) {
            var scene = e && e.detail && e.detail.scene;
            // The ladder is a care-screen modal — if the player navigates ANYWHERE,
            // dismiss it so a lingering overlay can't bleed onto the next screen.
            close();
            if (scene === 'care') { setTimeout(function () { wireEntry(); maybeHint(); }, 900); }
        });
        // initial attempt (covers a hard-refresh already on care)
        setTimeout(function () { wireEntry(); maybeHint(); }, 1500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else { boot(); }

    window.PPAffinityLadder = { open: open, close: close };
})();
