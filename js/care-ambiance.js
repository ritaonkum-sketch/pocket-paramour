// ============================================================================
// CARE AMBIANCE (Aug 2026) — procedural "living" care screen, NO new art.
// ----------------------------------------------------------------------------
// Chosen over Live2D/Remotion (those need a hand-built rig or art labor); this
// is pure code on flat art. For every character with REAL care art it adds:
//   1. Deeper BREATHING — scale from the feet on #character-fullbody.
//   2. Slow WEIGHT-SHIFT sway on #character-body-img (pivot at feet, ~11s).
//   3. A soft RIM-LIGHT glow behind them, tinted per character.
//   4. Drifting DUST motes (lightweight canvas) behind them.
//
// LIVE characters = all 7 now have real care art (Alistair, Lyra, Caspian,
// Lucien, Elian, Noir, Proto). The wink/blink lives in care-blink.js
// (Alistair, Caspian, Noir wink; Proto blinks — each needs same-stance frames).
//
// Respects prefers-reduced-motion. Dust rAF pauses off-care / when hidden.
// NOTE: the `character-<id>` class lives on #game-container, NOT <body> — the
// selectors below use a DESCENDANT combinator accordingly.
// ============================================================================
(function () {
    'use strict';

    // Characters whose care art is real enough to animate. Keep in sync with
    // the per-character glow tints in the CSS below.
    var LIVE = { alistair: 1, lyra: 1, caspian: 1, lucien: 1, elian: 1, noir: 1, proto: 1 };

    var REDUCE = false;
    try { REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (_) {}

    // ---- scoped CSS (idle motion + per-character glow + dust canvas) ---------
    var LIVE_SEL_FB = [
        'body.pp-screen-care .character-alistair #character-fullbody',
        'body.pp-screen-care .character-lyra #character-fullbody',
        'body.pp-screen-care .character-caspian #character-fullbody',
        'body.pp-screen-care .character-lucien #character-fullbody',
        'body.pp-screen-care .character-elian #character-fullbody',
        'body.pp-screen-care .character-noir #character-fullbody',
        'body.pp-screen-care .character-proto #character-fullbody'
    ].join(',');
    var LIVE_SEL_IMG = [
        'body.pp-screen-care .character-alistair #character-body-img',
        'body.pp-screen-care .character-lyra #character-body-img',
        'body.pp-screen-care .character-caspian #character-body-img',
        'body.pp-screen-care .character-lucien #character-body-img',
        'body.pp-screen-care .character-elian #character-body-img',
        'body.pp-screen-care .character-noir #character-body-img',
        'body.pp-screen-care .character-proto #character-body-img'
    ].join(',');

    var CSS = [
        LIVE_SEL_FB + '{transform-origin:50% 100%;animation:ppca-breathe 4.8s ease-in-out infinite;}',
        '@keyframes ppca-breathe{0%,100%{transform:scale(1);}50%{transform:scale(1.016);}}',
        LIVE_SEL_IMG + '{transform-origin:50% 100%;animation:ppca-weight 11s ease-in-out infinite;}',
        '@keyframes ppca-weight{',
        '  0%{transform:translateX(0) rotate(0deg);}',
        '  25%{transform:translateX(-3px) rotate(-0.6deg);}',
        '  50%{transform:translateX(0) rotate(0deg);}',
        '  75%{transform:translateX(3px) rotate(0.6deg);}',
        '  100%{transform:translateX(0) rotate(0deg);}',
        '}',
        // Per-character glow tint (custom prop set on #game-container.character-*,
        // inherits down to the glow div inside #character-area).
        '.character-alistair{--ppca-glow:255,198,112;}',   // warm gold/steel
        '.character-lyra{--ppca-glow:120,205,215;}',        // sea-aqua
        '.character-caspian{--ppca-glow:150,165,235;}',     // royal blue-violet
        '.character-lucien{--ppca-glow:185,150,230;}',      // arcane violet
        '.character-elian{--ppca-glow:140,195,120;}',       // forest green
        '.character-noir{--ppca-glow:198,60,72;}',          // blood-crimson (red gems / red eyes)
        '.character-proto{--ppca-glow:190,225,255;}',       // luminous blue-white (woven from light)
        // ambiance container = own stacking context (z-index:0), inserted as the
        // FIRST child of #character-area so it paints BEHIND the character.
        '#pp-care-amb{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;}',
        '#pp-care-amb .ppca-glow{position:absolute;left:50%;top:55%;width:80%;height:72%;',
        '  transform:translate(-50%,-50%);border-radius:50%;',
        '  background:radial-gradient(ellipse at center, rgba(var(--ppca-glow,255,198,112),0.18), rgba(var(--ppca-glow,255,198,112),0.07) 46%, rgba(0,0,0,0) 70%);',
        '  filter:blur(12px);animation:ppca-glow 6.5s ease-in-out infinite;}',
        '@keyframes ppca-glow{0%,100%{opacity:.45;transform:translate(-50%,-50%) scale(1);}50%{opacity:.85;transform:translate(-50%,-50%) scale(1.06);}}',
        '#pp-care-amb canvas.ppca-dust{position:absolute;inset:0;width:100%;height:100%;}',
        '@media (prefers-reduced-motion: reduce){',
        '  ' + LIVE_SEL_FB + ',' + LIVE_SEL_IMG + '{animation:none;}',
        '  #pp-care-amb .ppca-glow{animation:none;opacity:.5;}',
        '}'
    ].join('\n');

    function injectCSS() {
        if (document.getElementById('pp-care-amb-css')) return;
        var s = document.createElement('style');
        s.id = 'pp-care-amb-css';
        s.textContent = CSS;
        (document.head || document.documentElement).appendChild(s);
    }

    function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function activeChar() {
        var g = window._game;
        return (g && (g.characterId || g.selectedCharacter)) || lsGet('pp_cc_active_companion') || null;
    }
    function onCareLive() {
        return document.body.classList.contains('pp-screen-care') && !!LIVE[activeChar()];
    }

    var amb = null, canvas = null, ctx = null, motes = [], rafId = 0, running = false;

    function ensureLayers() {
        var area = document.getElementById('character-area');
        if (!area) return false;
        try { if (getComputedStyle(area).position === 'static') area.style.position = 'relative'; } catch (_) {}
        amb = document.getElementById('pp-care-amb');
        if (!amb) {
            amb = document.createElement('div');
            amb.id = 'pp-care-amb';
            var glow = document.createElement('div');
            glow.className = 'ppca-glow';
            canvas = document.createElement('canvas');
            canvas.className = 'ppca-dust';
            amb.appendChild(glow);      // glow first → behind dust
            amb.appendChild(canvas);
            area.insertBefore(amb, area.firstChild); // first child → behind character
        } else {
            canvas = amb.querySelector('canvas.ppca-dust');
        }
        ctx = canvas ? canvas.getContext('2d') : null;
        return !!ctx;
    }

    function sizeCanvas() {
        if (!canvas) return;
        var r = canvas.getBoundingClientRect();
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round((r.width || 300) * dpr));
        canvas.height = Math.max(1, Math.round((r.height || 500) * dpr));
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function rand(a, b) { return a + Math.random() * (b - a); }

    function initMotes() {
        if (!canvas) return;
        var r = canvas.getBoundingClientRect();
        var W = r.width || 300, H = r.height || 500;
        motes = [];
        for (var i = 0; i < 18; i++) {
            motes.push({
                x: rand(0, W), y: rand(0, H),
                r: rand(0.8, 2.6),
                vy: rand(0.10, 0.34),
                sway: rand(0.2, 0.7), phase: rand(0, Math.PI * 2), sphz: rand(0.004, 0.012),
                a: rand(0.05, 0.18)
            });
        }
    }

    function draw() {
        if (!ctx || !canvas) { running = false; return; }
        var r = canvas.getBoundingClientRect();
        var W = r.width, H = r.height;
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < motes.length; i++) {
            var m = motes[i];
            m.y -= m.vy;
            m.phase += m.sphz;
            var x = m.x + Math.sin(m.phase) * m.sway * 18;
            if (m.y < -4) { m.y = H + rand(0, 40); m.x = rand(0, W); }
            var tw = 0.6 + 0.4 * Math.sin(m.phase * 1.7);
            ctx.beginPath();
            ctx.fillStyle = 'rgba(255,240,212,' + (m.a * tw).toFixed(3) + ')';
            ctx.arc(x, m.y, m.r, 0, Math.PI * 2);
            ctx.fill();
        }
        rafId = requestAnimationFrame(draw);
    }

    function start() {
        if (running || REDUCE) return;
        if (!ensureLayers()) return;
        amb.style.display = 'block';
        sizeCanvas();
        initMotes();
        running = true;
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(draw);
    }

    function stop() {
        running = false;
        cancelAnimationFrame(rafId);
        rafId = 0;
        if (ctx && canvas) {
            var r = canvas.getBoundingClientRect();
            ctx.clearRect(0, 0, r.width, r.height);
        }
        if (amb) amb.style.display = 'none';
    }

    function control() {
        if (onCareLive() && !document.hidden) { if (!running) start(); }
        else { if (running) stop(); }
    }

    function boot() {
        injectCSS();
        setInterval(control, 700);
        window.addEventListener('resize', function () { if (running) sizeCanvas(); });
        document.addEventListener('visibilitychange', control);
        control();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    window.PPCareAmbiance = { _start: start, _stop: stop, _control: control, _reduce: REDUCE, _live: LIVE };
})();
