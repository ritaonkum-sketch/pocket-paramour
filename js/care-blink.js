// ============================================================================
// CARE BLINK / WINK (Aug 2026)
// ----------------------------------------------------------------------------
// Adds frame-based life to the FULL-BODY care sprite. The small pixel face
// portrait already blinks; the big care sprite never did — it only swapped to
// whole new poses (idle-life.js) and breathed via CSS. Here we flash an
// occasional WINK using the character's same-stance wink frames (e.g. Alistair
// casual ↔ winks1/winks2). Because the wink frames share the idle stance, the
// swap is seamless — it reads as a live, characterful blink with NO rig.
//
// Cooperates with idle-life.js: it captures whatever pose is currently showing
// and restores it after the wink, and ONLY winks while a matching base pose is
// up (so it never jumps to a different stance). Care screen only.
//
// To extend to another character: add a WINK entry with that character's base
// pose filenames + wink frame paths once their art lands.
// ============================================================================
(function () {
    'use strict';

    var WINK = {
        alistair: {
            bases:  ['casual.png', 'winks1.png', 'winks2.png', 'wink.png'],
            frames: ['assets/alistair/body/winks1.png', 'assets/alistair/body/winks2.png']
        },
        caspian: {
            // winks1/winks2 are a matched wink pair (source "cas winks 1/2").
            // bodySprites.casual1 maps to winks1.png so the wink-base stance
            // appears in the idle rotation; the wink swaps to winks2 (same
            // stance) → seamless, no cross-pose jump.
            bases:  ['winks1.png'],
            frames: ['assets/caspian/body/winks2.png']
        },
        noir: {
            // casual1.png = source "flirt wink (2)" (eyes open); winkclosed.png =
            // source "flirt wink" (same body, one eye closed + a blown kiss).
            // Identical 1632x2586 crop → seamless. casual1 is in his idle
            // rotation (idle-life), so the wink only fires from that stance.
            bases:  ['casual1.png'],
            frames: ['assets/noir/body/winkclosed.png']
        },
        proto: {
            // Proto is earnest (Golden Retriever), so his is a soft BLINK, not a
            // flirty wink. calm.png = source "smile" (eyes open, arms at sides);
            // blinkclosed.png = source "smile close eyes (2)" — same stance, eyes
            // closed. Identical 1344x3142 crop → seamless. calm is his most-shown
            // idle/happy pose, so he blinks naturally while you watch him.
            bases:  ['calm.png'],
            frames: ['assets/proto/body/blinkclosed.png']
        },
        lyra: {
            // Lyra is the melancholy siren — a soft BLINK, not a flirty wink.
            // neutral.png / neutral1.png = her resting stance (eyes open);
            // blinkclosed.png = source "Lyra Close eyes full body" (same stance,
            // eyes closed). Aspect 0.738 ≈ neutral, so it renders identically via
            // the care screen's contain-fit → the 180ms swap is seamless. neutral
            // is her idle anchor (idle-life), so she blinks while you watch her.
            bases:  ['neutral.png', 'neutral1.png'],
            frames: ['assets/lyra/body/blinkclosed.png']
        },
        elian: {
            // Elian is the terse forest druid — a soft BLINK, not a flirty wink.
            // neutral.png = source "Elian Casual" (his resting/idle anchor, eyes
            // open); blinkclosed.png = source "close eyes" — same stance, eyes
            // closed. idle-life reverts to neutral between behaviors, so he blinks
            // in those windows. (No 'calm' base — that's his Smile, a different
            // stance that would jump.)
            bases:  ['neutral.png'],
            frames: ['assets/elian/body/blinkclosed.png']
        },
        lucien: {
            // Lucien is the precise scholar-mage — a soft, considered BLINK.
            // neutral.png = source "Lucien Neutral 1" (his resting/default stance,
            // eyes open; same image as casual/casual2); blinkclosed.png = source
            // "Close eyes" (eyes shut). 1632×2552 vs neutral 1660×2592 — aspect
            // 0.640 ≈ 0.640, so both render at the same box via the care screen's
            // contain-fit → seamless. neutral is the default shown between his idle
            // behaviors (rotation = bored1/curious/fascinated/etc.).
            bases:  ['neutral.png'],
            frames: ['assets/lucien/body/blinkclosed.png']
        }
    };

    // Preload wink frames so the first wink doesn't flash an unloaded image.
    try {
        Object.keys(WINK).forEach(function (c) {
            WINK[c].frames.forEach(function (src) { var im = new Image(); im.src = src; });
        });
    } catch (_) {}

    // ── Preload the ACTIVE character's care poses on care entry ──────────
    // Owner: "there is a delay when I tap Feed/Wash/Talk for Elian — the poses
    // are delayed." Measured cause: the reaction pose (e.g. eating2.png, ~2.7MB)
    // is set as #character-body-img.src on tap but takes ~300ms to load, so the
    // sprite shows blank/stale until it decodes. Preloading every body sprite of
    // the current character the moment we land on the care screen means the tap
    // swaps to an already-decoded image (instant). This is the SAME bytes the
    // player would fetch on tap anyway — just moved to the idle beat before it,
    // and the browser + SW cache them so later visits cost nothing. Deduped by
    // URL; only the current character (not all 7).
    var _posePreloadFor = null;
    function preloadCarePoses() {
        try {
            var C = (typeof CHARACTER !== 'undefined' && CHARACTER) ? CHARACTER : null;
            if (!C || !C.bodySprites || C.name === _posePreloadFor) return;
            _posePreloadFor = C.name;
            var seen = {};
            Object.keys(C.bodySprites).forEach(function (k) {
                var src = C.bodySprites[k];
                if (src && !seen[src]) { seen[src] = 1; var im = new Image(); im.src = src; }
            });
        } catch (_) {}
    }
    try {
        document.addEventListener('pp:scene-change', function (e) {
            if (e && e.detail && e.detail.scene === 'care') preloadCarePoses();
        });
        // Also run once now in case care-blink loads after the care screen is
        // already up (scene-change already fired).
        if (document.body.classList.contains('pp-screen-care')) preloadCarePoses();
    } catch (_) {}

    function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function activeChar() {
        var g = window._game;
        return (g && (g.characterId || g.selectedCharacter)) || lsGet('pp_cc_active_companion') || null;
    }

    function tick() {
        try {
            if (!document.body.classList.contains('pp-screen-care')) return;
            // Never wink over a story scene / overlay on top of care.
            if (document.querySelector(
                '#mscard-root:not(:empty), #chp-page:not(.hidden):not(:empty),' +
                '#intro-overlay.visible, #cinematic-overlay.visible,' +
                '#pp-aci-backdrop, #pp-ch6-unlock-backdrop, #pp-soul-frag-overlay'
            )) return;
            var c = activeChar();
            var cfg = WINK[c];
            if (!cfg) return;
            var img = document.getElementById('character-body-img');
            if (!img || img.getAttribute('data-winking') === '1') return;
            var src = img.getAttribute('src') || '';
            // Only wink when a base (same-stance) pose is showing.
            var onBase = cfg.bases.some(function (b) { return src.indexOf(b) >= 0; });
            if (!onBase) return;
            // Jul 2026 playtest fix — at 40%/5s the blink almost never landed
            // inside the short windows when a base pose is actually up
            // (idle-life rotates poses every 5-6s), so testers reported "he
            // never blinks." 65% per 3.5s tick → a blink typically lands
            // within ~5s of a base pose showing, while still reading as
            // occasional (base poses are only up part of the time).
            if (Math.random() > 0.65) return;
            var prev = src;
            var frame = cfg.frames[Math.floor(Math.random() * cfg.frames.length)];
            img.setAttribute('data-winking', '1');
            img.src = frame;
            setTimeout(function () {
                try {
                    if (img && img.getAttribute('data-winking') === '1') {
                        img.src = prev;          // restore whatever pose was showing
                        img.removeAttribute('data-winking');
                    }
                } catch (_) {}
            }, 180);
        } catch (_) {}
    }

    function boot() { setInterval(tick, 3500); }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    // Debug surface
    window.PPCareBlink = { _config: WINK, _tick: tick };
})();
