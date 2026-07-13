// ============================================================
//  SELF-TEST — provable stability invariants (Jul 2026)
//  ────────────────────────────────────────────────────────────
//  88k lines, zero automated tests, meant every change was a leap
//  of faith. This is the missing PROOF layer: an on-demand battery
//  of invariants that, if any fails, means the game is in a bad
//  state. Runnable in seconds after any change — by a dev in the
//  browser preview, or by the owner via the console:
//
//      PPSelfTest.run()             // synchronous invariant battery
//      PPSelfTest.selectorAudit()   // every overlay selector parses?
//      await PPSelfTest.stress(20)  // hammer care actions, re-check
//
//  It never mutates game state (except stress(), which only taps
//  the same buttons a player would). Passive until called.
// ============================================================
(function () {
    'use strict';

    function check(name, passFn, detailFn) {
        var pass = false, detail = '';
        try { pass = !!passFn(); }
        catch (e) { pass = false; detail = 'threw: ' + (e && e.message); }
        if (!detail && detailFn) { try { detail = detailFn() || ''; } catch (_) {} }
        return { name: name, pass: pass, detail: detail };
    }

    // Validate every canonical overlay selector parses. This is the direct
    // regression guard against the comma-hole / malformed-selector class of
    // bug that silently disabled modules for months (Aenor, adaptive-thoughts).
    function selectorAudit() {
        var out = { pass: true, tested: 0, bad: [] };
        var sels = (window.PPOverlay && PPOverlay.selectors) ? PPOverlay.selectors.slice() : [];
        // A few known module-specific extras that live outside the registry.
        var extra = [
            '#pp-fm-root:not(:empty)', '#card-reveal-overlay:not(.hidden)',
            '#world-intro:not(.hidden)', '#pp-aci-backdrop', '#letter-overlay:not(.hidden)'
        ];
        sels.concat(extra).forEach(function (s) {
            out.tested++;
            try { document.querySelector(s); }
            catch (e) { out.pass = false; out.bad.push(s + ' :: ' + (e && e.message)); }
        });
        return out;
    }

    function run() {
        var g = window._game;
        var checks = [];

        // ── Infrastructure invariants (always) ───────────────────
        checks.push(check('PPOverlay authority present',
            function () { return window.PPOverlay && typeof PPOverlay.busy === 'function' && typeof PPOverlay.anyOpen === 'function'; }));
        checks.push(check('PPErrors guard present',
            function () { return window.PPErrors && typeof PPErrors.dump === 'function'; }));
        checks.push(check('no captured JS errors',
            function () { return !window.PPErrors || PPErrors.count() === 0; },
            function () { return window.PPErrors ? (PPErrors.count() + ' err; last=' + JSON.stringify(PPErrors.last())) : ''; }));

        var sa = selectorAudit();
        checks.push({ name: 'all overlay selectors parse (' + sa.tested + ')', pass: sa.pass, detail: sa.bad.join(' ; ') });

        checks.push(check('PPOverlay.busy() does not throw',
            function () { PPOverlay.busy(); return true; }));

        // ── Live game-state invariants (only when a character is loaded) ──
        if (g) {
            checks.push(check('scene lock not stuck past heal threshold',
                function () { return !(g.sceneActive && (g._sceneLockTicks || 0) >= 24); },
                function () { return 'sceneActive=' + g.sceneActive + ' ticks=' + (g._sceneLockTicks || 0); }));
            checks.push(check('scene queue bounded (<8)',
                function () { return (g._sceneQueue ? g._sceneQueue.length : 0) < 8; },
                function () { return 'queue=' + (g._sceneQueue ? g._sceneQueue.length : 0); }));
            checks.push(check('scene-lock watchdog live',
                function () { return !!g._sceneLockWatchdog; }));
            checks.push(check('tick loop live OR intentionally paused',
                function () { return !!g.tickInterval || g.sceneActive || PPOverlay.busy() || g.characterLeft; },
                function () { return 'tick=' + !!g.tickInterval + ' sceneActive=' + g.sceneActive + ' busy=' + PPOverlay.busy(); }));
            checks.push(check('core stats sane (no NaN / wild values)',
                function () {
                    var ok = true;
                    ['hunger', 'clean', 'bond', 'affection', 'corruption'].forEach(function (k) {
                        var v = g[k];
                        if (typeof v === 'number' && (isNaN(v) || v < -1 || v > 1000)) ok = false;
                    });
                    return ok;
                },
                function () { return 'h=' + g.hunger + ' c=' + g.clean + ' b=' + g.bond + ' a=' + g.affection; }));
            checks.push(check('no leaked cross-character scene',
                function () {
                    var dt = document.getElementById('dialogue-text');
                    return !dt || (dt.textContent || '').indexOf('LEAKED') === -1;
                }));
            // On the care screen, the topbar chrome must not be latched hidden
            // with no overlay actually open (the "topbar reaper" invariant).
            checks.push(check('topbar not orphan-hidden on bare care screen',
                function () {
                    if (!document.body.classList.contains('pp-screen-care')) return true;
                    if (PPOverlay.busy()) return true; // legitimately hidden
                    if (document.body.classList.contains('pp-overlay-active')) return false;
                    return true;
                }));
        }

        var failed = checks.filter(function (c) { return !c.pass; });
        var result = {
            pass: failed.length === 0, total: checks.length,
            passed: checks.length - failed.length, failed: failed.length,
            checks: checks, at: new Date().toISOString()
        };
        try {
            console[result.pass ? 'log' : 'warn'](
                '[PPSelfTest] ' + (result.pass ? 'PASS ✓' : 'FAIL ✗') + '  ' +
                result.passed + '/' + result.total,
                result.pass ? '' : failed.map(function (f) { return f.name + (f.detail ? ' (' + f.detail + ')' : ''); }));
        } catch (_) {}
        return result;
    }

    // stress(n): tap the care actions n times fast, then assert invariants
    // still hold AND no new JS error appeared. This is the closest thing to
    // a fuzz test — it reproduces the rapid-tap conditions that surfaced the
    // original scene/overlay races. Returns a Promise.
    function stress(n) {
        n = n || 12;
        return new Promise(function (resolve) {
            var g = window._game;
            if (!g || !document.body.classList.contains('pp-screen-care')) {
                resolve({ pass: false, detail: 'not on a care screen — load a character first' });
                return;
            }
            var before = window.PPErrors ? PPErrors.count() : 0;
            var btns = ['btn-talk', 'btn-feed', 'btn-wash', 'btn-gift']
                .map(function (id) { return document.getElementById(id); })
                .filter(Boolean);
            var i = 0;
            (function step() {
                if (i++ >= n) {
                    setTimeout(function () {
                        var after = window.PPErrors ? PPErrors.count() : 0;
                        var inv = run();
                        var res = {
                            pass: inv.pass && after === before,
                            taps: n, newErrors: after - before, invariants: inv
                        };
                        try { console[res.pass ? 'log' : 'warn']('[PPSelfTest.stress] ' + (res.pass ? 'PASS ✓' : 'FAIL ✗') + ' (' + n + ' taps, ' + res.newErrors + ' new errors)'); } catch (_) {}
                        resolve(res);
                    }, 1400);
                    return;
                }
                try { var b = btns[i % btns.length]; if (b) b.click(); } catch (_) {}
                setTimeout(step, 180);
            })();
        });
    }

    window.PPSelfTest = { run: run, stress: stress, selectorAudit: selectorAudit };
})();
