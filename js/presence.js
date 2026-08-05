// ============================================================
//  PRESENCE — "Stand watch with me"
//
//  The quiet mode. He is simply THERE while you do something else: no stats,
//  no buttons asking to be tapped, no goal. You open it, put the phone down,
//  and he keeps you company. Every so often he says one undemanding thing.
//
//  This is the single mechanic modern otome leans on hardest for long-term
//  retention (Love and Deepspace's "Quality Time" study/rest modes): the
//  character stops being a task list and becomes company. For a knight whose
//  whole identity is standing watch, joining that watch is the natural form.
//
//  DESIGN RULES (from owner feedback):
//   - The care screen stays CALM: no permanent affordance is added to it. The
//     entry point is a small topbar icon (same pattern letters-archive uses)
//     and he can also invite you.
//   - Nothing here demands a tap. The only control is leaving.
//   - No visible scrollbars anywhere.
//   - Time together is remembered and he mentions it. That is the reward.
//
//  SAFETY CONTRACT:
//   - Never writes affection, corruption, or the balanced-care flag, and never
//     calls bondLevelFor(). The care-route ladder that unlocks chapters and
//     characters is untouched. It grants a little BOND only (the closeness
//     stat, which does not gate any unlock).
//   - Characters without bespoke lines fall back to their existing ambient
//     pools, so the mode works for all seven without new writing.
// ============================================================

(function () {
    'use strict';

    function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

    // ── Per-character framing ────────────────────────────────────────────
    // `lines` is optional. Without it the mode uses the character's existing
    // idle/neutral pools, so every character works out of the box.
    var MODES = {
        alistair: {
            label: 'THE WATCH',
            invite: 'Stand watch with me.',
            enter: 'Then stand there. You do not have to talk. Watches are mostly not talking.',
            lines: [
                'Nothing on the road. Good.',
                'The torches on the east wall burn faster. I have never worked out why.',
                'You can sit if you like. The stone is cold but it is honest.',
                '...',
                'I used to count the hours. I have stopped doing that since you started coming.',
                'That sound is only the gate settling. It does that when the cold comes in.',
                'You are quiet company. I did not know that was a thing a person could be good at.',
                'Half the watch is gone already. I did not notice it going.',
                'If you are tired, lean. I am not going anywhere.',
                'The sky does that just before first light. Watch the edge of it.',
                'I have stood this post a thousand times. It has never once been like this.',
                '...I am glad you are here. That is all. Back to the wall.'
            ],
            leave: [
                'Go on then. I have the rest of it.',
                'The watch is easier now. I will not tell the others why.',
                'Come back when you can. I will be at the wall.'
            ]
        },
        lyra:    { label: 'THE SHALLOWS',  invite: 'Sit by the water with me.',  enter: 'Then sit. The tide does not need conversation either.' },
        caspian: { label: 'THE QUIET HOUR',invite: 'Stay a while. No court, no crown.', enter: 'No titles in this room. Just the tea going cold.' },
        lucien:  { label: 'THE TOWER',     invite: 'Read with me.',              enter: 'Then read. I will not explain anything unless you ask.' },
        elian:   { label: 'THE FIRESIDE',  invite: 'Sit by the fire.',           enter: 'Sit. The wood is dry tonight. It will burn slow.' },
        noir:    { label: 'THE DARK',      invite: 'Keep the dark with me.',     enter: 'Then keep it. The dark is better when it is watched.' },
        proto:   { label: 'THE VEIL',      invite: 'Stay near the light.',       enter: 'Then stay. I will hold the shape as long as you are here.' }
    };

    function modeFor(charId) { return MODES[charId] || { label: 'TOGETHER', invite: 'Stay a while.', enter: 'Then stay.' }; }

    // Ambient lines: bespoke if written, otherwise the character's own existing
    // idle / neutral pools so no one is silent.
    // NOTE: CHARACTER is declared with `let`, so it is a lexical global and is
    // NOT reachable as window.CHARACTER (that reads undefined). Referencing it
    // bare is required — this exact trap has silently disabled features here
    // before, and it is why the watch first rendered a headshot instead of him.
    function activeCharacter() {
        try { return (typeof CHARACTER !== 'undefined') ? CHARACTER : null; } catch (_) { return null; }
    }

    function ambientPool(charId) {
        var m = MODES[charId];
        if (m && m.lines && m.lines.length) return m.lines;
        var out = [];
        try {
            var C = activeCharacter();
            if (C) {
                var idle = C.idleDialogue;
                if (Array.isArray(idle)) out = out.concat(idle);
                else if (idle && typeof idle === 'object') {
                    Object.keys(idle).forEach(function (k) { if (Array.isArray(idle[k])) out = out.concat(idle[k]); });
                }
                if (C.stateDialogue && Array.isArray(C.stateDialogue.neutral)) out = out.concat(C.stateDialogue.neutral);
            }
        } catch (_) {}
        return out.length ? out : ['...'];
    }

    function calmPose(charId) {
        try {
            var _C = activeCharacter();
            var bs = _C && _C.bodySprites;
            if (bs) {
                var prefer = ['casual', 'crossarms', 'neutral', 'calm', 'formal', 'reading', 'casual1'];
                for (var i = 0; i < prefer.length; i++) if (bs[prefer[i]]) return bs[prefer[i]];
                for (var k in bs) if (bs[k] && typeof bs[k] === 'string') return bs[k];
            }
        } catch (_) {}
        return 'assets/' + charId + '/select-portrait.png';
    }

    // ── Time kept ────────────────────────────────────────────────────────
    function totalMs(charId) { return parseInt(lsGet('pp_watch_ms_' + charId) || '0', 10) || 0; }
    function addMs(charId, ms) { lsSet('pp_watch_ms_' + charId, String(totalMs(charId) + Math.max(0, ms | 0))); }
    function prettyMs(ms) {
        var mins = Math.floor(ms / 60000);
        if (mins < 1) return 'a few moments';
        if (mins < 60) return mins + (mins === 1 ? ' minute' : ' minutes');
        var h = Math.floor(mins / 60), m = mins % 60;
        return h + (h === 1 ? ' hour' : ' hours') + (m ? ' ' + m + ' min' : '');
    }

    // ── Styles ───────────────────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('pp-presence-styles')) return;
        var s = document.createElement('style');
        s.id = 'pp-presence-styles';
        s.textContent = [
            // Above the care UI: the back arrow sits at 11600 and the "NEXT"
            // companion chip at 9450, and both bled through the watch at 9200.
            // Sitting above them also means the only way out is "Leave the
            // watch", which is the point: nothing here competes for a tap.
            '#pp-presence{position:fixed;inset:0;z-index:11700;display:flex;flex-direction:column;align-items:center;',
            '  background:radial-gradient(circle at 50% 42%, rgba(38,20,48,.96) 0%, rgba(12,6,18,.99) 68%), #08040e;',
            '  opacity:0;transition:opacity 700ms ease;overflow:hidden;}',
            '#pp-presence.show{opacity:1;}',
            '#pp-presence .ppw-label{margin-top:max(26px,env(safe-area-inset-top,26px));font-family:Quicksand,Inter,sans-serif;',
            '  font-size:11px;letter-spacing:4px;color:rgba(232,200,138,.72);text-transform:uppercase;}',
            '#pp-presence .ppw-figure{flex:1;display:flex;align-items:flex-end;justify-content:center;width:100%;min-height:0;}',
            '#pp-presence .ppw-figure img{max-height:74vh;max-width:88vw;object-fit:contain;',
            '  filter:brightness(.72) saturate(.86) drop-shadow(0 0 46px rgba(232,180,110,.14));',
            '  animation:ppw-breathe 6.4s ease-in-out infinite;}',
            '@keyframes ppw-breathe{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-5px) scale(1.006);}}',
            '#pp-presence .ppw-line{min-height:3.2em;max-width:82vw;text-align:center;margin:0 0 14px;',
            '  font-family:"Cormorant Garamond",Garamond,Georgia,serif;font-style:italic;font-size:17px;line-height:1.5;',
            '  color:#F0E4D0;text-shadow:0 1px 10px rgba(0,0,0,.8);opacity:0;transition:opacity 1400ms ease;}',
            '#pp-presence .ppw-line.on{opacity:.95;}',
            '#pp-presence .ppw-foot{padding:0 20px max(22px,env(safe-area-inset-bottom,22px));text-align:center;width:100%;}',
            '#pp-presence .ppw-kept{font-family:Quicksand,Inter,sans-serif;font-size:11px;letter-spacing:1.6px;',
            '  color:rgba(240,228,208,.5);text-transform:uppercase;margin-bottom:14px;}',
            '#pp-presence .ppw-leave{background:transparent;border:1px solid rgba(212,168,91,.5);color:#F4ECDC;',
            '  font-family:Quicksand,Inter,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;',
            '  padding:11px 26px;border-radius:999px;cursor:pointer;}',
            '#pp-presence .ppw-leave:active{transform:scale(.97);}',
            '#pp-presence *{scrollbar-width:none;}',
            '#pp-presence *::-webkit-scrollbar{display:none;}',
            '#pp-watch-btn{background:transparent;border:none;font-size:17px;line-height:1;cursor:pointer;',
            '  padding:4px 6px;filter:drop-shadow(0 0 6px rgba(232,200,138,.4));}',
            '@media (prefers-reduced-motion: reduce){#pp-presence .ppw-figure img{animation:none;}}'
        ].join('\n');
        document.head.appendChild(s);
    }

    // ── The watch ────────────────────────────────────────────────────────
    var _root = null, _timer = null, _lineTimer = null, _startedAt = 0, _charId = null;

    function open(charId) {
        if (_root) return;
        var g = window._game;
        charId = charId || (g && g.selectedCharacter);
        if (!charId) return;
        injectStyles();
        _charId = charId;
        _startedAt = Date.now();
        var mode = modeFor(charId);

        _root = document.createElement('div');
        _root.id = 'pp-presence';
        _root.innerHTML =
            '<div class="ppw-label">' + mode.label + '</div>' +
            '<div class="ppw-figure"><img alt=""></div>' +
            '<div class="ppw-line"></div>' +
            '<div class="ppw-foot">' +
              '<div class="ppw-kept"></div>' +
              '<button class="ppw-leave" type="button">Leave the watch</button>' +
            '</div>';
        document.body.appendChild(_root);
        _root.querySelector('img').src = calmPose(charId);
        updateKept();
        requestAnimationFrame(function () { _root.classList.add('show'); });

        // His opening line, then quiet company.
        say(mode.enter);
        var pool = ambientPool(charId).slice();
        _lineTimer = setInterval(function () {
            if (!pool.length) pool = ambientPool(charId).slice();
            var i = Math.floor(Math.random() * pool.length);
            say(pool.splice(i, 1)[0]);
        }, 52000);
        _timer = setInterval(updateKept, 30000);

        _root.querySelector('.ppw-leave').addEventListener('click', close);
        try { if (window.PPOverlay && window.PPOverlay.show) window.PPOverlay.show('#pp-presence'); } catch (_) {}
    }

    function say(text) {
        if (!_root || !text) return;
        var el = _root.querySelector('.ppw-line');
        el.classList.remove('on');
        setTimeout(function () {
            if (!_root) return;
            el.textContent = text;
            el.classList.add('on');
        }, 900);
    }

    function updateKept() {
        if (!_root) return;
        var live = totalMs(_charId) + (Date.now() - _startedAt);
        _root.querySelector('.ppw-kept').textContent = 'Kept watch together · ' + prettyMs(live);
    }

    function close() {
        if (!_root) return;
        var elapsed = Date.now() - _startedAt;
        addMs(_charId, elapsed);
        clearInterval(_timer); clearInterval(_lineTimer);
        _timer = _lineTimer = null;

        // Closeness only. Never affection/corruption — the ladder must not move.
        try {
            var g = window._game;
            if (g && typeof g.bond === 'number' && elapsed > 60000) {
                g.bond = Math.min(100, g.bond + Math.min(4, elapsed / 300000));
                if (typeof g.save === 'function') g.save();
            }
        } catch (_) {}

        var mode = modeFor(_charId);
        var farewell = (mode.leave && mode.leave.length)
            ? mode.leave[Math.floor(Math.random() * mode.leave.length)] : null;

        var node = _root; _root = null;
        node.classList.remove('show');
        setTimeout(function () {
            if (node.parentNode) node.parentNode.removeChild(node);
            try { if (window.PPOverlay && window.PPOverlay.hide) window.PPOverlay.hide('#pp-presence'); } catch (_) {}
            // He says goodbye in the care box, once it is free.
            if (farewell) {
                var g2 = window._game;
                if (g2 && g2.typewriter && typeof g2.typewriter.showIfIdle === 'function') {
                    setTimeout(function () { g2.typewriter.showIfIdle(farewell); }, 900);
                }
            }
        }, 700);
    }

    // ── Entry point: a small topbar icon, care screen only ───────────────
    // Deliberately NOT a button on the care canvas itself — that surface is
    // kept calm (the Memories pill was removed from it for the same reason).
    function mountButton() {
        if (document.getElementById('pp-watch-btn')) return;
        var menu = document.getElementById('topbar-menu-btn');
        var bar = menu && menu.parentNode;
        if (!bar) return;
        var b = document.createElement('button');
        b.id = 'pp-watch-btn';
        b.type = 'button';
        b.title = 'Stand watch together';
        b.setAttribute('aria-label', 'Stand watch together');
        b.textContent = '🕯';
        b.addEventListener('click', function () { open(); });
        bar.insertBefore(b, menu);
    }

    function syncButton() {
        var onCare = document.body.classList.contains('pp-screen-care');
        var b = document.getElementById('pp-watch-btn');
        if (onCare && !b) { mountButton(); b = document.getElementById('pp-watch-btn'); }
        if (b) b.style.display = onCare ? '' : 'none';
        // Safety: the watch sits above the whole care UI, so if the game
        // navigates away underneath it (chapter, select, game over), close it
        // rather than leaving a full-screen overlay stranded on top.
        if (_root && !onCare) close();
    }

    setInterval(syncButton, 1500);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncButton);
    else syncButton();

    window.PPPresence = {
        open: open,
        close: close,
        totalMs: totalMs,
        pretty: prettyMs,
        inviteLine: function (charId) { return modeFor(charId || (window._game && window._game.selectedCharacter)).invite; }
    };
})();
