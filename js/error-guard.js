// ============================================================
//  ERROR-GUARD — global JS error visibility (Jul 2026)
//  ────────────────────────────────────────────────────────────
//  The codebase has ~385 try/catch blocks. They keep the game
//  from crashing — but they also SWALLOW bugs silently, which is
//  exactly why problems went unseen until a player hit them.
//
//  This module makes anything that goes wrong VISIBLE without
//  changing behaviour:
//    - window.onerror + unhandledrejection are captured
//    - console.error is wrapped (many catch blocks log then swallow)
//    - everything lands in a de-duplicated ring buffer
//    - window.PPErrors.dump() / .count() / .clear() for any dev
//    - Analytics.emit('js_error', …) so it can be measured later
//    - a small tap-to-dismiss toast, DEV ONLY (localhost / ?ppdebug=1)
//
//  Loads FIRST (before every other module) so it catches boot
//  errors too. The handlers themselves NEVER throw.
//  "Robust" is not "never throws" — it is "when it does, you know."
// ============================================================
(function () {
    'use strict';

    var MAX = 60;
    var _ring = [];
    var _counts = Object.create(null); // dedupe key -> times seen

    function _debug() {
        try {
            if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return true;
            if (/[?&]ppdebug=1/.test(location.search)) return true;
            if (localStorage.getItem('pp_debug') === '1') return true;
        } catch (_) {}
        return false;
    }

    function _screen() {
        try { return (document.body.className.match(/pp-screen-\S+/) || [''])[0]; }
        catch (_) { return ''; }
    }

    function _record(type, msg, extra) {
        try {
            msg = String(msg == null ? '' : msg).slice(0, 400);
            extra = extra || {};
            var key = type + '|' + msg.slice(0, 120) + '|' + (extra.line || '');
            _counts[key] = (_counts[key] || 0) + 1;

            // On a repeat, just bump the existing entry's count — don't spam the ring.
            if (_counts[key] > 1) {
                for (var i = _ring.length - 1; i >= 0; i--) {
                    if (_ring[i]._key === key) { _ring[i].count = _counts[key]; _maybeToast(_ring[i]); return _ring[i]; }
                }
            }

            var entry = {
                _key: key, type: type, msg: msg, count: _counts[key],
                line: extra.line || null, col: extra.col || null,
                source: extra.source || null,
                stack: extra.stack ? String(extra.stack).slice(0, 1200) : null,
                at: new Date().toISOString(), screen: _screen()
            };
            _ring.push(entry);
            if (_ring.length > MAX) _ring.shift();

            try { if (typeof Analytics !== 'undefined' && Analytics.emit) Analytics.emit('js_error', { type: type, msg: msg.slice(0, 160), line: entry.line, screen: entry.screen }); } catch (_) {}
            _maybeToast(entry);
            return entry;
        } catch (_) { /* the error handler must NEVER throw */ }
    }

    // ── Dev-only toast ───────────────────────────────────────────
    var _toastEl = null, _toastTimer = null;
    function _maybeToast(entry) {
        if (!_debug()) return;
        try {
            if (!_toastEl) {
                _toastEl = document.createElement('div');
                _toastEl.id = 'pp-error-toast';
                _toastEl.style.cssText = [
                    'position:fixed', 'left:8px', 'bottom:8px', 'z-index:2147483647',
                    'max-width:min(92vw,420px)', 'background:rgba(60,8,20,0.95)',
                    'border:1px solid rgba(232,76,140,0.7)', 'border-radius:10px',
                    'padding:10px 12px', 'color:#ffd7e6', 'font:12px/1.4 ui-monospace,monospace',
                    'box-shadow:0 8px 30px rgba(0,0,0,0.6)', 'pointer-events:auto', 'cursor:pointer',
                    'white-space:pre-wrap', 'word-break:break-word'
                ].join(';');
                _toastEl.addEventListener('click', function () { try { _toastEl.style.display = 'none'; } catch (_) {} });
                (document.body || document.documentElement).appendChild(_toastEl);
            }
            _toastEl.style.display = 'block';
            _toastEl.textContent = '⚠ JS error (' + entry.count + '×): ' + entry.msg +
                (entry.line ? '  @' + entry.line : '') + '\n(tap to dismiss · PPErrors.dump() in console)';
            if (_toastTimer) clearTimeout(_toastTimer);
            _toastTimer = setTimeout(function () { try { if (_toastEl) _toastEl.style.display = 'none'; } catch (_) {} }, 8000);
        } catch (_) {}
    }

    // ── Global listeners ─────────────────────────────────────────
    window.addEventListener('error', function (e) {
        _record('error', (e && e.message) || 'error', {
            line: e && e.lineno, col: e && e.colno,
            source: e && e.filename && String(e.filename).split('/').slice(-1)[0],
            stack: e && e.error && e.error.stack
        });
    }, true);

    window.addEventListener('unhandledrejection', function (e) {
        var r = e && e.reason;
        _record('promise', (r && (r.message || r)) || 'unhandled rejection', { stack: r && r.stack });
    });

    // Wrap console.error — many catch blocks log before swallowing.
    try {
        var _ce = console.error.bind(console);
        console.error = function () {
            try {
                var parts = Array.prototype.map.call(arguments, function (a) {
                    if (a instanceof Error) return a.message + (a.stack ? ' | ' + String(a.stack).split('\n')[1] : '');
                    if (a && typeof a === 'object') { try { return JSON.stringify(a).slice(0, 200); } catch (_) { return String(a); } }
                    return String(a);
                });
                _record('console', parts.join(' ').slice(0, 400), {});
            } catch (_) {}
            return _ce.apply(console, arguments);
        };
    } catch (_) {}

    window.PPErrors = {
        dump: function () { return _ring.slice(); },
        count: function () { return _ring.reduce(function (n, e) { return n + (e.count || 1); }, 0); },
        distinct: function () { return _ring.length; },
        hasErrors: function () { return _ring.length > 0; },
        last: function () { return _ring[_ring.length - 1] || null; },
        clear: function () {
            _ring.length = 0;
            for (var k in _counts) { delete _counts[k]; }
            try { if (_toastEl) _toastEl.style.display = 'none'; } catch (_) {}
        }
    };
})();
