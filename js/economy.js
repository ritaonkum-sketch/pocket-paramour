/* ============================================================================
 * economy.js — HEART THREADS: the daily-return earned economy. (Jun 2026)
 * ----------------------------------------------------------------------------
 * The retention engine. A player earns Heart Threads by SHOWING UP and caring,
 * then spends them on gifts (gift cost is increment 2, wired in ui.js later).
 *
 * EARN (all CLAIM-by-tap inside the Bonds & Rewards panel — NEVER an auto
 * popup, so it can never bleed over a story scene; see feedback_stale_overlay):
 *   • Daily check-in   — once per calendar day, scales with login streak
 *   • 4 daily tasks    — Care / Groom / Bond / Devotion (~50/day), all from
 *                        the FREE care loop so a f2p player is never blocked
 *   • Chapter bonus    — +50 when a new Main-Story chapter completes
 *                        (watches pp_chapter_done_<id>; init-baselines existing
 *                         completions so we never retro-dump a returning player)
 *
 * DESIGN NOTES
 *   - ONE currency for now (not L&D's three). A premium/paid tier waits until
 *     native billing exists (roadmap P4).
 *   - Global wallet (localStorage pp_heart_threads) — shared across all
 *     characters, so caring for one funds gifts for another.
 *   - Rename the currency in ONE place: the CUR object below.
 *   - Self-contained. Reads window._game READ-ONLY. Gated on
 *     pp_main_story_enabled. If anything throws, it disables itself silently.
 *   - The counter lives inside #affection-display (the care top bar), so it
 *     inherits the existing hide-during-overlay / hide-during-chapter rules.
 *     It is NOT a floating idle-screen pill (owner removed those).
 * ========================================================================== */
(function () {
    'use strict';

    // ── Identity (single source of truth — rename here only) ───────────────
    var CUR = { name: 'Roses', one: 'Rose', icon: '<img src="assets/ui/rose-coin.png" class="cur-ico" alt="">' }; // custom glossy rose-coin emblem (v939); was emoji 🌹, originally Heart Threads 🧵. NOTE: icon is now an <img> HTML string — render via innerHTML, never textContent.

    var FLAG_KEY    = 'pp_main_story_enabled';
    var BAL_KEY     = 'pp_heart_threads';     // global wallet (integer string)
    var DAY_KEY     = 'pp_ht_day';            // toDateString() of the active day
    var BASE_DAY    = 'pp_ht_base_day';       // day the counters were baselined
    var INIT_KEY    = 'pp_ht_init';           // first-run migration done
    var CHECKIN_KEY = 'pp_ht_checkin';        // = day string once claimed today
    var PEND_CH_KEY = 'pp_ht_pending_ch';     // JSON array of chapter ids awaiting claim
    var OVERLAY_ID  = 'pp-economy-overlay';
    var COUNTER_ID  = 'pp-ht-counter';
    var STYLE_ID    = 'pp-economy-styles';

    var AMOUNTS = { care: 10, groom: 10, bond: 15, devotion: 15, chapter: 50 };

    // ── tiny safe helpers ──────────────────────────────────────────────────
    function ls(k)      { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function lsSet(k,v) { try { localStorage.setItem(k, String(v)); } catch (_) {} }
    function lsDel(k)   { try { localStorage.removeItem(k); } catch (_) {} }
    function intLs(k)   { var n = parseInt(ls(k) || '0', 10); return isNaN(n) ? 0 : n; }
    function enabled()  { return ls(FLAG_KEY) === '1'; }
    function today()    { try { return new Date().toDateString(); } catch (_) { return 'd'; } }
    function esc(s)     { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' })[c]; }); }
    function game()     { return window._game || null; }

    // ── Wallet ──────────────────────────────────────────────────────────────
    function get()        { return Math.max(0, intLs(BAL_KEY)); }
    function setBal(n)    { lsSet(BAL_KEY, Math.max(0, Math.round(n || 0))); renderCounter(); }
    function canAfford(n) { return get() >= (Math.round(n) || 0); }
    function add(n, reason) {
        n = Math.round(n) || 0; if (n <= 0) return get();
        setBal(get() + n);
        floatGain(n);
        return get();
    }
    function spend(n) {
        n = Math.round(n) || 0; if (n <= 0) return true;
        if (get() < n) return false;
        setBal(get() - n);
        return true;
    }
    // Price a gift from its value (bond + love-weighted), rounded to a clean 5,
    // floored at 10 (always daily-affordable) and capped at 40 (premium). One
    // source of truth so the gift panel + giveGift() agree. (Increment 2.)
    function giftCost(gift) {
        if (!gift) return 0;
        var v = (gift.bond || 0) + (gift.affection || 0) * 2 + (gift.hunger || 0) * 0.2 + (gift.clean || 0) * 0.3;
        var c = Math.round(v / 5) * 5;
        return Math.max(10, Math.min(40, c));
    }

    // ── Day rollover + counter baselines ─────────────────────────────────────
    // Daily claim flags + task baselines reset at calendar-day rollover.
    function ensureDayReset() {
        var d = today();
        if (ls(DAY_KEY) === d) return;
        lsSet(DAY_KEY, d);
        // clear per-day claim flags (task claims are keyed by day, so they
        // fall away naturally; just clear the baseline so today re-snapshots).
        lsDel(BASE_DAY);
        // check-in flag is compared against the day string, so no clear needed.
    }
    // Snapshot the cumulative counters at the first moment _game is available
    // on a new day, so "today's" deltas are correct + survive reopening.
    function ensureBaseline(g) {
        if (!g) return;
        if (ls(BASE_DAY) === today()) return;
        lsSet(BASE_DAY, today());
        lsSet('pp_ht_b_fed',   g.timesFed    || 0);
        lsSet('pp_ht_b_wash',  g.timesWashed || 0);
        lsSet('pp_ht_b_talk',  g.talkScore   || 0);
        lsSet('pp_ht_b_total', totalInteractions(g));
    }
    function totalInteractions(g) {
        if (!g) return 0;
        return (g.timesFed || 0) + (g.timesWashed || 0) + (g.timesGifted || 0)
             + Math.floor((g.talkScore || 0) / 3);
    }

    // ── Daily check-in + STREAK (loss-aversion) ───────────────────────────
    // Self-contained consecutive-day streak — NO _game needed, so it works on
    // the Daily tab too. The check-in keeps the streak alive; missing a full
    // day breaks it. Reward scales with the streak + milestone bonuses, so the
    // player has something to protect ("don't lose your 6-day streak").
    function yesterdayStr() { try { return new Date(Date.now() - 86400000).toDateString(); } catch (_) { return ''; } }
    function twoDaysAgoStr() { try { return new Date(Date.now() - 2 * 86400000).toDateString(); } catch (_) { return ''; } }
    // Grace = a single "streak save." One missed day is forgiven if the player
    // holds a grace token (earned at day 3, then refreshed every 7 days). Modern,
    // kind lapse-forgiveness (Duolingo-style streak freeze) — far fewer streaks
    // lost to one off day = less churn, and it's on-vision: a pull, not a
    // punishment. Consumed on use; not refilled until the next 7-day milestone,
    // so it can't be abused into an every-other-day "streak."
    function graceAvail() { return ls('pp_ht_grace') === '1'; }
    function streakInfo() {
        var last = ls('pp_ht_streak_day'), n = intLs('pp_ht_streak');
        if (last === today())        return { count: n, state: 'safe'  };  // checked in today
        if (last === yesterdayStr()) return { count: n, state: 'risk'  };  // alive but not yet today
        if (last === twoDaysAgoStr() && graceAvail()) return { count: n, state: 'grace' }; // one day missed — grace holds it
        return { count: 0, state: 'broken' };                              // gap too long → resets
    }
    // The streak the player REACHES if they check in right now (grace bridges a 1-day gap).
    function nextStreak() {
        var last = ls('pp_ht_streak_day'), n = intLs('pp_ht_streak');
        if (last === today()) return n;
        if (last === yesterdayStr()) return n + 1;
        if (last === twoDaysAgoStr() && graceAvail()) return n + 1;
        return 1;
    }
    function checkinBase(s) { if (s >= 14) return 45; if (s >= 7) return 35; if (s >= 3) return 25; return 20; }
    function streakBonus(s) { return ({ 3: 10, 7: 30, 14: 60, 30: 120, 60: 200, 100: 300 })[s] || 0; }
    function checkinAmount() { var s = nextStreak(); return checkinBase(s) + streakBonus(s); }
    function checkinClaimed() { return ls(CHECKIN_KEY) === today(); }
    function claimCheckin() {
        if (checkinClaimed()) return false;
        var last = ls('pp_ht_streak_day');
        var usedGrace = (last === twoDaysAgoStr() && graceAvail());
        var s = nextStreak();
        if (usedGrace) lsSet('pp_ht_grace', '0');               // a streak save was spent
        lsSet('pp_ht_streak', s);
        lsSet('pp_ht_streak_day', today());
        lsSet(CHECKIN_KEY, today());
        // Earn / refresh the streak save at day 3, then every 7th day.
        if (s === 3 || (s > 0 && s % 7 === 0)) lsSet('pp_ht_grace', '1');
        add(checkinBase(s) + streakBonus(s), 'checkin');
        return true;
    }

    // ── Daily tasks ─────────────────────────────────────────────────────────
    // Each: id, icon, label, amount, progress(g)->{cur,target,done}. All four
    // are completable every day from the free feed/wash/talk loop — never gated
    // behind anything that costs Heart Threads (no circular economy).
    var TASKS = [
        { id: 'care',  icon: '🍞', label: 'Feed your companion',        amount: AMOUNTS.care,
          progress: function (g) { var c = g ? ((g.timesFed||0) - intLs('pp_ht_b_fed')) : 0; return clampProg(c, 1); } },
        { id: 'groom', icon: '💧', label: 'Wash &amp; tend to them',        amount: AMOUNTS.groom,
          progress: function (g) { var c = g ? ((g.timesWashed||0) - intLs('pp_ht_b_wash')) : 0; return clampProg(c, 1); } },
        { id: 'bond',  icon: '💬', label: 'Talk with them 3 times',     amount: AMOUNTS.bond,
          progress: function (g) { var c = g ? Math.floor(((g.talkScore||0) - intLs('pp_ht_b_talk')) / 3) : 0; return clampProg(c, 3); } },
        { id: 'devotion', icon: '❤️', label: '5 loving moments today',  amount: AMOUNTS.devotion,
          progress: function (g) { var c = g ? (totalInteractions(g) - intLs('pp_ht_b_total')) : 0; return clampProg(c, 5); } }
    ];
    function clampProg(cur, target) {
        cur = Math.max(0, cur | 0);
        return { cur: Math.min(cur, target), target: target, done: cur >= target };
    }
    function taskClaimKey(id) { return 'pp_ht_t_' + id + '_' + today(); }
    function taskClaimed(id)  { return ls(taskClaimKey(id)) === '1'; }
    function claimTask(t) {
        if (taskClaimed(t.id)) return false;
        var g = game();
        var done = (g && t.progress(g).done) || taskReady(t.id);
        if (!done) return false;
        lsSet(taskClaimKey(t.id), '1');
        add(t.amount, 'task:' + t.id);
        return true;
    }

    // ── Chapter-completion rewards ───────────────────────────────────────────
    // Watch pp_chapter_done_<id>. On FIRST EVER run, baseline every already-done
    // chapter as 'claimed' (no retro-dump). New completions become claimable.
    function doneChapterIds() {
        var ids = [];
        try {
            for (var i = 0; i < localStorage.length; i++) {
                var k = localStorage.key(i);
                if (k && k.indexOf('pp_chapter_done_') === 0 && localStorage.getItem(k) === '1') {
                    ids.push(k.slice('pp_chapter_done_'.length));
                }
            }
        } catch (_) {}
        return ids;
    }
    function chLatchKey(id) { return 'pp_ht_ch_' + id; }   // ''(new) | 'pending' | 'claimed'
    function pendingChapters() {
        var arr; try { arr = JSON.parse(ls(PEND_CH_KEY) || '[]') || []; } catch (_) { arr = []; }
        // Self-heal: a chapter is only genuinely claimable while its latch reads
        // 'pending'. Drop any stale ids (latch already 'claimed', or never set) so
        // the panel never shows a phantom reward that pays nothing when tapped.
        var clean = arr.filter(function (id) { return ls(chLatchKey(id)) === 'pending'; });
        if (clean.length !== arr.length) { try { lsSet(PEND_CH_KEY, JSON.stringify(clean.slice(0, 50))); } catch (_) {} }
        return clean;
    }
    function setPending(arr)   { lsSet(PEND_CH_KEY, JSON.stringify(arr.slice(0, 50))); }

    function initChapterBaseline() {
        if (ls(INIT_KEY) === '1') return;
        doneChapterIds().forEach(function (id) { lsSet(chLatchKey(id), 'claimed'); });
        lsSet(INIT_KEY, '1');
    }
    function scanChapters() {
        try {
            var pend = pendingChapters(), changed = false;
            doneChapterIds().forEach(function (id) {
                var st = ls(chLatchKey(id));
                if (!st) { // newly completed after init → make it claimable
                    lsSet(chLatchKey(id), 'pending');
                    if (pend.indexOf(id) === -1) { pend.push(id); changed = true; }
                }
            });
            if (changed) { setPending(pend); refreshUI(); }
        } catch (_) {}
    }
    function claimChapter(id) {
        var st = ls(chLatchKey(id));
        if (st !== 'pending') return false;
        lsSet(chLatchKey(id), 'claimed');
        setPending(pendingChapters().filter(function (x) { return x !== id; }));
        add(AMOUNTS.chapter, 'chapter:' + id);
        return true;
    }
    function prettyChapter(id) {
        // ids are integers or short slugs; show a friendly label.
        var n = parseInt(id, 10);
        return isNaN(n) ? ('Chapter · ' + esc(String(id))) : ('Chapter ' + n);
    }

    function activeChar() {
        var g = game();
        return (g && (g.selectedCharacter || g.characterId)) || ls('pp_cc_active_companion') || null;
    }

    // ── Weekly tasks (bigger payouts; reset each ISO-ish week) ────────────────
    function weekKey(dt) {
        try {
            var d = dt ? new Date(dt) : new Date();
            var onejan = new Date(d.getFullYear(), 0, 1);
            var wk = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
            return d.getFullYear() + '-W' + wk;
        } catch (_) { return 'w'; }
    }
    function ensureWeekReset() {
        var w = weekKey();
        if (ls('pp_ht_week') === w) return;
        lsSet('pp_ht_week', w);
        lsDel('pp_ht_wk_base');   // re-baseline interactions for the new week
        lsDel('pp_ht_wk_days');   // reset "days you cleared dailies"
        lsDel('pp_ht_wk_chars');  // reset "companions cared for"
        lsDel('pp_ht_ev_days');   // reset the limited-event "active days this week"
        // weekly + event claim flags are keyed by weekKey() → they lapse naturally
    }
    function ensureWeekBaseline(g) {
        if (!g) return;
        if (ls('pp_ht_wk_base') !== null) return;
        lsSet('pp_ht_wk_base', totalInteractions(g));
    }
    function wkSet(key) { try { return JSON.parse(ls(key) || '[]') || []; } catch (_) { return []; } }
    function wkAdd(key, val) {
        if (val == null) return;
        var a = wkSet(key);
        if (a.indexOf(val) === -1) { a.push(val); lsSet(key, JSON.stringify(a.slice(0, 30))); }
    }
    var _lastTotal = -1;
    function weeklyUpkeep(g) {
        ensureWeekReset();
        if (!g) return;
        ensureWeekBaseline(g);
        // "devoted week": a day counts once all 4 dailies are claimed that day
        if (TASKS.every(function (t) { return taskClaimed(t.id); })) wkAdd('pp_ht_wk_days', today());
        // "across the realm": a companion counts once you've actually cared (interaction delta)
        var tot = totalInteractions(g);
        var caredNow = (_lastTotal >= 0 && tot > _lastTotal);
        if (caredNow) wkAdd('pp_ht_wk_chars', activeChar());
        // limited-event: today is an "active day" if you checked in OR cared today
        if (checkinClaimed() || caredNow) wkAdd('pp_ht_ev_days', today());
        _lastTotal = tot;
    }
    var WEEKLY = [
        { id: 'devoted', icon: '🗓️', label: 'A devoted week, clear your dailies on 3 days', amount: 120,
          progress: function () { return clampProg(wkSet('pp_ht_wk_days').length, 3); } },
        { id: 'tender', icon: '❤️', label: '30 loving moments this week', amount: 100,
          progress: function (g) { var b = ls('pp_ht_wk_base'); var base = (b === null) ? totalInteractions(g) : (parseInt(b, 10) || 0); var c = g ? (totalInteractions(g) - base) : 0; return clampProg(c, 30); } },
        { id: 'realm', icon: '✦', label: 'Spend time with 3 companions', amount: 150,
          progress: function () { return clampProg(wkSet('pp_ht_wk_chars').length, 3); } }
    ];
    function weeklyClaimKey(id) { return 'pp_ht_w_' + id + '_' + weekKey(); }
    function weeklyClaimed(id) { return ls(weeklyClaimKey(id)) === '1'; }
    function claimWeekly(t) {
        if (!t || weeklyClaimed(t.id)) return false;
        var g = game();
        var done = g ? t.progress(g).done
                     : (weeklyReady(t.id) || (function () { try { return t.progress().done; } catch (_) { return false; } })());
        if (!done) return false;
        lsSet(weeklyClaimKey(t.id), '1');
        add(t.amount, 'weekly:' + t.id);
        return true;
    }
    function findWeekly(id) { for (var i = 0; i < WEEKLY.length; i++) if (WEEKLY[i].id === id) return WEEKLY[i]; return null; }

    // ── Limited-time WEEKLY EVENT (FOMO) ──────────────────────────────────
    // One themed event per week, rotated deterministically by weekKey (no
    // backend, no manual scheduling). Be "active" (check in or care) on N days
    // this week before it rolls over to claim an exclusive bonus you LOSE if
    // you miss it. Resets with the weekly reset. Tracker: pp_ht_ev_days.
    var EVENTS = [
        { id: 'rosemoon', icon: '🌹', title: 'Rose Moon Vigil', blurb: 'The red moon wanes. Tend your bonds before it sets.', days: 4, reward: 150 },
        { id: 'longnight', icon: '🕯️', title: 'The Long Night',  blurb: 'Light a candle each night. Do not let the dark win.',  days: 4, reward: 150 },
        { id: 'starfall',  icon: '✦',  title: 'Starfall Week',   blurb: 'Wishes fall all week. Be there to catch one.',         days: 4, reward: 150 },
        { id: 'tide',      icon: '🌊', title: 'Tide Festival',    blurb: 'The sea calls its own. Come to the water daily.',      days: 4, reward: 150 },
        { id: 'ember',     icon: '🔥', title: 'Ember Vigil',      blurb: 'Keep the hearth lit through the week.',                 days: 4, reward: 150 }
    ];
    function eventIndex() { var k = weekKey(), h = 0; for (var i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0; return h % EVENTS.length; }
    function activeEvent() { return EVENTS[eventIndex()]; }
    function eventProgress() { return wkSet('pp_ht_ev_days').length; }
    function eventClaimed() { return ls('pp_ht_ev_claimed') === weekKey(); }
    function claimEvent() {
        var ev = activeEvent();
        if (eventClaimed() || eventProgress() < ev.days) return false;
        lsSet('pp_ht_ev_claimed', weekKey());
        add(ev.reward, 'event:' + ev.id);
        return true;
    }
    // ms until the weekKey rolls over (event end) — found by scanning forward.
    function eventEndsInMs() {
        try {
            var now = Date.now(), wk = weekKey();
            for (var dd = 1; dd <= 8; dd++) {
                if (weekKey(now + dd * 86400000) !== wk) {
                    var n = new Date();
                    var nextMidnight = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 0).getTime();
                    return (nextMidnight - now) + (dd - 1) * 86400000;
                }
            }
        } catch (_) {}
        return 0;
    }
    function eventCountdown() {
        var ms = eventEndsInMs(); if (ms <= 0) return 'ending soon';
        var totalH = Math.floor(ms / 3600000), d = Math.floor(totalH / 24), h = totalH % 24;
        return d >= 1 ? ('Ends in ' + d + 'd ' + h + 'h') : ('Ends in ' + Math.max(1, h) + 'h');
    }

    // ── Memory Album spend (reveal CARE-earnable cards with Heart Threads) ────
    // Only interactions/affection/bond/train cards — NEVER scene (story-gated)
    // or premium (real money) or auto/streak. A catch-up sink for collectors.
    var ALBUM_BUYABLE = { interactions: 1, affection: 1, bond: 1, train: 1 };
    var RARITY_COST = { common: 20, uncommon: 35, rare: 60, legendary: 100 };
    function allCards() { try { return (typeof GALLERY_CARDS !== 'undefined' && GALLERY_CARDS) ? GALLERY_CARDS : []; } catch (_) { return []; } }
    function gallery() { var g = game(); return (g && g.gallery) || null; }
    function albumInfo() {
        var gal = gallery(); if (!gal) return null;
        var cards = allCards(); if (!cards.length) return null;
        var char = activeChar(); if (!char) return null;
        var mine = cards.filter(function (c) { try { return gal.cardCharacter(c) === char; } catch (_) { return false; } });
        if (!mine.length) return null;
        var has = function (id) { return gal.unlockedCards && gal.unlockedCards.has(id); };
        var got = mine.filter(function (c) { return has(c.id); }).length;
        var buyable = mine.filter(function (c) { return c.unlock && ALBUM_BUYABLE[c.unlock.type] && !has(c.id); })
            .map(function (c) { return { id: c.id, title: c.title || 'A memory', cost: RARITY_COST[c.rarity] || 35 }; })
            .sort(function (a, b) { return a.cost - b.cost; });
        return { char: char, total: mine.length, got: got, buyable: buyable };
    }
    function buyAlbumCard(id, cost) {
        var gal = gallery(); if (!gal || !id) return false;
        if (gal.unlockedCards && gal.unlockedCards.has(id)) return false;
        if (!canAfford(cost) || !spend(cost)) return false;
        // close the panel first so the card-reveal animates on a clean care screen
        closePanel();
        setTimeout(function () { try { gal.unlockById(id); } catch (_) {} }, 380);
        return true;
    }

    // ── Readiness latches ────────────────────────────────────────────────────
    // A task/weekly completes on the CARE screen (where window._game exists).
    // We latch "ready" there so the DAILY tab (select screen, no live game) can
    // still show + claim it. Set in the upkeep tick; read by state + claim.
    function taskReadyKey(id)   { return 'pp_ht_rdy_t_' + id + '_' + today(); }
    function taskReady(id)      { return ls(taskReadyKey(id)) === '1'; }
    function weeklyReadyKey(id) { return 'pp_ht_rdy_w_' + id + '_' + weekKey(); }
    function weeklyReady(id)    { return ls(weeklyReadyKey(id)) === '1'; }
    function latchReadiness() {
        var g = game(); if (!g) return;   // only the live game can confirm completion
        try {
            TASKS.forEach(function (t) { if (!taskClaimed(t.id) && t.progress(g).done) lsSet(taskReadyKey(t.id), '1'); });
            WEEKLY.forEach(function (t) { if (!weeklyClaimed(t.id) && t.progress(g).done) lsSet(weeklyReadyKey(t.id), '1'); });
        } catch (_) {}
    }

    // ── "Anything to claim?" (drives the counter's attention dot) ─────────────
    function anyClaimable() {
        try {
            ensureDayReset(); ensureWeekReset();
            if (!checkinClaimed()) return true;
            var g = game();
            for (var i = 0; i < TASKS.length; i++) {
                if (taskClaimed(TASKS[i].id)) continue;
                if ((g && TASKS[i].progress(g).done) || taskReady(TASKS[i].id)) return true;
            }
            for (var w = 0; w < WEEKLY.length; w++) {
                if (weeklyClaimed(WEEKLY[w].id)) continue;
                if ((g && WEEKLY[w].progress(g).done) || weeklyReady(WEEKLY[w].id)) return true;
            }
            if (!eventClaimed() && eventProgress() >= activeEvent().days) return true;
            if (pendingChapters().length) return true;
        } catch (_) {}
        return false;
    }

    // ── Styles ────────────────────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        var s = document.createElement('style');
        s.id = STYLE_ID;
        s.textContent = [
            // counter — lives in the top bar, only on the care screen
            '#' + COUNTER_ID + '{display:none;align-items:center;gap:5px;cursor:default;',
            '  font-family:Quicksand,Inter,sans-serif;font-weight:700;font-size:13px;color:#F4E4B8;',
            '  padding:3px 9px 3px 7px;border-radius:999px;position:relative;',
            '  background:linear-gradient(180deg,rgba(60,30,20,0.55),rgba(40,18,12,0.55));',
            '  border:1px solid rgba(212,168,91,0.45);-webkit-tap-highlight-color:transparent;}',
            'body.pp-screen-care #' + COUNTER_ID + '{display:inline-flex;}',
            // When the hamburger expands the top bar (icons shown), hide the
            // wallet so the bar doesn’t crowd (owner request).
            '#affection-display:not(.topbar-collapsed) #' + COUNTER_ID + '{display:none !important;}',
            '#' + COUNTER_ID + ' .ht-ico{font-size:13px;line-height:1;filter:drop-shadow(0 0 4px rgba(232,120,140,0.5));}',
            '.cur-ico{display:inline-block;width:24px;height:24px;object-fit:contain;vertical-align:middle;margin-top:-2px;}',
            '#pp-ht-reward-burst .cur-ico{width:104px;height:104px;}',   // owner: rose is the hero of this card
            '#' + COUNTER_ID + ' .ht-amt{min-width:8px;text-align:right;letter-spacing:0.02em;}',
            '#' + COUNTER_ID + '.ht-bump{animation:ht-bump 0.4s cubic-bezier(0.22,1,0.36,1);}',
            '@keyframes ht-bump{0%{transform:scale(1);}40%{transform:scale(1.18);}100%{transform:scale(1);}}',
            // +N float
            '.ht-float{position:fixed;z-index:14000;pointer-events:none;font-family:Quicksand,Inter,sans-serif;',
            '  font-weight:800;font-size:15px;color:#F2D690;text-shadow:0 1px 4px rgba(0,0,0,0.7),0 0 10px rgba(232,168,91,0.6);',
            '  opacity:0;transform:translateY(0);}',
            '.ht-float.go{animation:ht-float 1.1s ease-out forwards;}',
            '@keyframes ht-float{0%{opacity:0;transform:translateY(4px) scale(0.9);}20%{opacity:1;transform:translateY(-6px) scale(1);}100%{opacity:0;transform:translateY(-30px) scale(1);}}',
            // overlay + panel
            '#' + OVERLAY_ID + '{position:fixed;inset:0;z-index:13200;display:flex;align-items:center;justify-content:center;padding:20px;',
            '  background:radial-gradient(ellipse at center,rgba(11,4,16,0.90),rgba(11,4,16,0.97) 82%);opacity:0;',
            '  transition:opacity 300ms cubic-bezier(0.22,1,0.36,1);-webkit-tap-highlight-color:transparent;}',
            '#' + OVERLAY_ID + '.show{opacity:1;}',
            '#' + OVERLAY_ID + '.hidden{display:none;}',
            // Hide the native scrollbar (owner hates the chunky desktop track) —
            // scroll still works on touch + wheel. App-wide convention.
            '.ht-panel{position:relative;width:100%;max-width:380px;max-height:90vh;overflow-y:auto;scrollbar-width:none;-ms-overflow-style:none;',
            '  background:linear-gradient(180deg,rgba(43,17,51,0.98),rgba(21,8,26,0.98));',
            '  border:1px solid rgba(212,168,91,0.5);border-radius:18px;padding:22px 18px 16px;',
            '  box-shadow:inset 0 1px 0 rgba(212,168,91,0.25),0 28px 64px -18px rgba(0,0,0,0.88),0 0 70px rgba(232,168,91,0.22);',
            '  transform:translateY(14px) scale(0.96);transition:transform 360ms cubic-bezier(0.22,1,0.36,1);}',
            '.ht-panel::-webkit-scrollbar{width:0;height:0;display:none;}',  // WebKit/Chromium — the visible bar
            '#' + OVERLAY_ID + '.show .ht-panel{transform:translateY(0) scale(1);}',
            '.ht-close{position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:50%;',
            '  border:1px solid rgba(247,236,209,0.45);background:rgba(30,18,10,0.55);color:#f7ecd1;font-size:16px;',
            '  display:flex;align-items:center;justify-content:center;cursor:pointer;}',
            '.ht-eyebrow{font-family:Quicksand,Inter,sans-serif;font-size:9.5px;letter-spacing:0.24em;font-weight:600;',
            '  text-transform:uppercase;color:rgba(232,168,91,0.92);text-align:center;margin:0 0 3px;}',
            '.ht-title{font-family:"Cormorant Garamond",serif;font-style:italic;font-size:23px;color:#f4ebdc;text-align:center;margin:0 0 10px;}',
            '.ht-wallet{display:flex;align-items:center;justify-content:center;gap:7px;margin:0 0 16px;',
            '  font-family:Quicksand,Inter,sans-serif;font-weight:700;font-size:17px;color:#F4E4B8;}',
            '.ht-wallet .ht-ico{font-size:18px;filter:drop-shadow(0 0 6px rgba(232,120,140,0.55));}',
            // ── Streak banner (loss-aversion) ──
            '.ht-streak{display:flex;align-items:center;gap:11px;margin:0 0 14px;padding:11px 14px;border-radius:14px;',
            '  background:linear-gradient(180deg,rgba(60,30,18,0.55),rgba(40,18,12,0.55));border:1px solid rgba(232,140,90,0.4);}',
            '.ht-streak-flame{font-size:26px;line-height:1;filter:drop-shadow(0 0 8px rgba(255,140,60,0.6));}',
            '.ht-streak-num{font-family:"Cormorant Garamond",serif;font-style:italic;font-weight:700;font-size:30px;color:#F7D08A;min-width:22px;text-align:center;}',
            '.ht-streak-txt{display:flex;flex-direction:column;line-height:1.25;font-family:Quicksand,Inter,sans-serif;}',
            '.ht-streak-txt b{font-size:12px;color:#f4ebdc;letter-spacing:0.04em;}',
            '.ht-streak-txt span{font-size:10.5px;color:rgba(232,200,220,0.7);}',
            '.ht-streak-risk{border-color:rgba(255,150,90,0.75);animation:ht-streak-pulse 2s ease-in-out infinite;}',
            '.ht-streak-risk .ht-streak-txt span{color:#ffc08a;}',
            '.ht-streak-grace{border-color:rgba(232,200,138,0.7);box-shadow:0 0 18px -4px rgba(232,200,138,0.4);}', // a streak SAVED — warm gold
            '.ht-streak-grace .ht-streak-txt span{color:#f0d8a0;}',
            '@keyframes ht-streak-pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,150,90,0);}50%{box-shadow:0 0 0 4px rgba(255,150,90,0.18);}}',
            '.ht-streak-broken{opacity:0.9;border-color:rgba(212,168,91,0.25);}',
            '.ht-streak-broken .ht-streak-flame{filter:grayscale(0.7);opacity:0.55;}',
            // ── Limited-time event banner (FOMO) ──
            '.ht-event{margin:0 0 14px;padding:12px 14px;border-radius:14px;',
            '  background:linear-gradient(180deg,rgba(70,24,60,0.6),rgba(40,14,40,0.6));border:1px solid rgba(232,140,200,0.5);box-shadow:inset 0 0 24px rgba(200,90,170,0.14);}',
            '.ht-event-top{display:flex;align-items:center;gap:8px;}',
            '.ht-event-ico{font-size:18px;line-height:1;filter:drop-shadow(0 0 7px rgba(232,120,200,0.6));}',
            '.ht-event-title{font-family:"Cormorant Garamond",serif;font-style:italic;font-size:17px;color:#f6e3f0;flex:1;}',
            '.ht-event-timer{font-family:Quicksand,Inter,sans-serif;font-weight:700;font-size:10px;color:#ffaad6;letter-spacing:0.03em;white-space:nowrap;}',
            '.ht-event-blurb{font-family:Quicksand,Inter,sans-serif;font-size:10.5px;color:rgba(240,210,230,0.78);margin:5px 0 9px;line-height:1.35;}',
            '.ht-event-row{display:flex;align-items:center;gap:11px;}',
            '.ht-event-prog{flex:1;min-width:0;}',
            '.ht-event-sub{font-family:Quicksand,Inter,sans-serif;font-size:10px;color:rgba(240,210,230,0.72);margin-bottom:4px;}',
            '.ht-event .ht-bar-fill{background:linear-gradient(90deg,#C85AAA,#F2A0D6);}',
            '.ht-sec{font-family:Quicksand,Inter,sans-serif;font-size:9.5px;letter-spacing:0.2em;font-weight:600;text-transform:uppercase;',
            '  color:rgba(232,200,220,0.62);margin:14px 4px 7px;}',
            '.ht-row{display:flex;align-items:center;gap:11px;padding:10px 12px;margin:6px 0;border-radius:13px;',
            '  background:rgba(15,8,26,0.5);border:1px solid rgba(212,168,91,0.16);}',
            '.ht-row.done{border-color:rgba(212,168,91,0.4);}',
            '.ht-row.claimed{opacity:0.5;}',
            '.ht-row-ico{font-size:20px;width:24px;text-align:center;flex:0 0 auto;}',
            '.ht-row-mid{flex:1 1 auto;min-width:0;}',
            '.ht-row-label{font-family:Quicksand,Inter,sans-serif;font-size:12.5px;color:#f4ebdc;font-weight:600;}',
            '.ht-row-sub{font-family:Quicksand,Inter,sans-serif;font-size:10.5px;color:rgba(232,200,220,0.6);margin-top:2px;}',
            '.ht-bar{height:5px;border-radius:999px;background:rgba(15,8,26,0.85);border:1px solid rgba(212,168,91,0.18);overflow:hidden;margin-top:5px;}',
            '.ht-bar-fill{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#B8923E,#F2D690);transition:width 500ms cubic-bezier(0.22,1,0.36,1);}',
            '.ht-claim{flex:0 0 auto;font-family:Quicksand,Inter,sans-serif;font-weight:700;font-size:11.5px;color:#1a0e06;',
            '  background:linear-gradient(180deg,#F2D690,#C9A24A);border:none;border-radius:999px;padding:7px 13px;cursor:pointer;',
            '  box-shadow:0 2px 8px rgba(201,162,74,0.4);white-space:nowrap;}',
            '.ht-claim:active{transform:translateY(1px);}',
            '.ht-claim[disabled]{background:rgba(120,110,90,0.3);color:rgba(247,236,209,0.4);box-shadow:none;cursor:default;}',
            '.ht-claim.got{background:none;color:rgba(150,220,160,0.8);box-shadow:none;cursor:default;font-size:15px;}',
            '.ht-foot{font-family:Quicksand,Inter,sans-serif;font-size:10px;color:rgba(232,200,220,0.5);text-align:center;margin-top:14px;}',
            // ── gift-panel SPEND UI (increment 2) ─────────────────────────────
            '#gift-grid .gift-cost{display:block;margin-top:4px;font-family:Quicksand,Inter,sans-serif;font-weight:700;font-size:11px;color:#F2D690;letter-spacing:0.02em;}',
            '#gift-grid .gift-item.gift-unaffordable{opacity:0.45;}',
            '#gift-grid .gift-item.gift-unaffordable .gift-cost{color:#ff8f8f;}',
            '.gift-item.ht-shake{animation:ht-shake 0.4s ease;}',
            '@keyframes ht-shake{0%,100%{transform:translateX(0);}20%{transform:translateX(-5px);}60%{transform:translateX(5px);}}',
            '#gift-balance{margin-left:auto;display:inline-flex;align-items:center;gap:4px;cursor:pointer;font-family:Quicksand,Inter,sans-serif;font-weight:700;font-size:12px;color:#F4E4B8;padding:2px 9px;border-radius:999px;background:rgba(60,30,20,0.45);border:1px solid rgba(212,168,91,0.4);}'
        ].join('\n');
        (document.head || document.documentElement).appendChild(s);
    }

    // ── Counter (top bar) ────────────────────────────────────────────────────
    function ensureCounter() {
        var bar = document.getElementById('affection-display');
        if (!bar || document.getElementById(COUNTER_ID)) return;
        var el = document.createElement('div');
        el.id = COUNTER_ID;
        el.title = CUR.name;
        el.innerHTML = '<span class="ht-ico">' + CUR.icon + '</span><span class="ht-amt">0</span>';
        // Jul 2026 playtest fix (supersedes the display-only decision): a new
        // player standing on the care screen had NO path to the earn loop —
        // the Daily hub lives on the Chronicle nav they may not revisit for a
        // while. Tapping the wallet now opens the Daily page (rewards +
        // tasks). No new UI element on the calm care screen; the counter that
        // already exists simply becomes the door.
        el.style.cursor = 'pointer';
        el.addEventListener('click', function () {
            if (window.PPTodayHub && typeof window.PPTodayHub.open === 'function') {
                try { window.PPTodayHub.open(); return; } catch (_) {}
            }
            try { openPanel(); } catch (_) {}
        });
        var menu = document.getElementById('topbar-menu-btn');
        if (menu && menu.parentNode === bar) bar.insertBefore(el, menu); else bar.appendChild(el);
        renderCounter();
        maybeGrantStarter();
    }

    // ── Starter grant (Jul 2026 playtest fix) ────────────────────────────────
    // A brand-new player reached the gift panel with 0 Roses and every gift
    // unaffordable — the first-gift fantasy dead on arrival. Grant a one-time
    // welcome purse (enough for a first real gift) the first time the wallet
    // exists on the care screen, deferred until no tutorial/reveal is on
    // stage so the burst never joins an overlay pile-up.
    var STARTER_KEY = 'pp_ht_starter_granted';
    var STARTER_AMOUNT = 30;
    var _starterTimer = null;
    function maybeGrantStarter() {
        if (ls(STARTER_KEY) === '1' || !enabled()) return;
        if (_starterTimer) return;
        _starterTimer = setInterval(function () {
            if (ls(STARTER_KEY) === '1') { clearInterval(_starterTimer); _starterTimer = null; return; }
            if (!document.body.classList.contains('pp-screen-care')) return;
            if (document.querySelector(
                '#intro-overlay.visible, #pp-aci-backdrop, #pp-onboarding-overlay.show,' +
                '#card-reveal-overlay:not(.hidden), #mscard-root:not(:empty), #pp-today-overlay.show'
            )) return;
            clearInterval(_starterTimer); _starterTimer = null;
            lsSet(STARTER_KEY, '1');
            add(STARTER_AMOUNT, 'starter');
            rewardBurst(STARTER_AMOUNT);
        }, 2500);
    }
    function renderCounter() {
        var el = document.getElementById(COUNTER_ID); if (!el) return;
        var amt = el.querySelector('.ht-amt'); if (amt) tweenCount(amt, get());
    }

    // Juice: animate a number element from its current value (or an explicit
    // `fromOverride`) up/down to `to` so balances TICK instead of snapping.
    // rAF-driven, cancels any in-flight tween on the same element, and a
    // setTimeout backstop guarantees the final value even if rAF is throttled
    // (e.g. a backgrounded tab). No-ops when the value is unchanged.
    function tweenCount(el, to, fromOverride) {
        try {
            if (!el) return;
            to = Math.round(to) || 0;
            var from = (fromOverride !== undefined && fromOverride !== null)
                ? Math.round(fromOverride)
                : parseInt((el.textContent || '0').replace(/[^\d-]/g, ''), 10);
            if (isNaN(from)) from = to;
            if (el._countRaf)  { cancelAnimationFrame(el._countRaf); el._countRaf = null; }
            if (el._countTimer) { clearTimeout(el._countTimer); el._countTimer = null; }
            if (from === to) { el.textContent = to; return; }
            var dur = Math.min(700, 220 + Math.abs(to - from) * 10);
            var startTs = null;
            var ease = function (t) { return 1 - Math.pow(1 - t, 3); }; // easeOutCubic
            var step = function (ts) {
                if (startTs === null) startTs = ts;
                var p = Math.min(1, (ts - startTs) / dur);
                el.textContent = Math.round(from + (to - from) * ease(p));
                if (p < 1) { el._countRaf = requestAnimationFrame(step); }
                else { el.textContent = to; el._countRaf = null; }
            };
            el._countRaf = requestAnimationFrame(step);
            el._countTimer = setTimeout(function () {
                if (el._countRaf) { cancelAnimationFrame(el._countRaf); el._countRaf = null; }
                el.textContent = to;
            }, dur + 150);
        } catch (_) { try { el.textContent = Math.round(to); } catch (e) {} }
    }
    function floatGain(n) {
        try {
            var anchor = document.getElementById(COUNTER_ID);
            // The little float anchors to the top-bar counter. If that counter
            // isn't actually on screen (an overlay like the Daily page is up and
            // the top bar is hidden), this float would land in a dead top-left
            // corner — barely visible (owner report). Skip it there; the claim
            // path shows the prominent centered reward burst instead.
            if (!anchor || anchor.offsetParent === null) return;
            var f = document.createElement('div');
            f.className = 'ht-float';
            f.innerHTML = '+' + n + ' ' + CUR.icon;  // icon is an <img> string — must be innerHTML
            document.body.appendChild(f);
            var r = anchor.getBoundingClientRect();
            f.style.left = Math.round(r.left) + 'px';
            f.style.top  = Math.round(r.bottom + 4) + 'px';
            requestAnimationFrame(function () { f.classList.add('go'); });
            setTimeout(function () { try { f.remove(); } catch (_) {} }, 1200);
            anchor.classList.remove('ht-bump'); void anchor.offsetWidth; anchor.classList.add('ht-bump');
        } catch (_) {}
    }

    // ── Prominent reward "received it!" celebration ───────────────────────────
    // Shown when the player CLAIMS a reward (check-in, daily/weekly task, chapter,
    // event). The old feedback was the tiny corner float above — invisible on the
    // Daily page where the top-bar counter is hidden. This is a centered, premium
    // burst (glowing thread + the amount + sparkles) so receiving threads reads
    // clearly. Tap to continue; a long fallback clears it if ignored (never just
    // flashes past — see the owner's tap-to-dismiss rule).
    function rewardBurst(n) {
        try {
            n = Math.round(n) || 0; if (n <= 0) return;
            if (!document.getElementById('pp-ht-burst-styles')) {
                var st = document.createElement('style');
                st.id = 'pp-ht-burst-styles';
                st.textContent = [
                    '#pp-ht-reward-burst{position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;',
                    'background:radial-gradient(ellipse at 50% 45%,rgba(20,10,6,0.34),rgba(8,4,2,0.62));opacity:0;transition:opacity .3s ease;}',
                    '#pp-ht-reward-burst.show{opacity:1;}',
                    '#pp-ht-reward-burst.out{opacity:0;}',
                    '#pp-ht-reward-burst .ht-rb-card{position:relative;display:flex;flex-direction:column;align-items:center;gap:1px;',
                    'padding:14px 20px 11px;border-radius:18px;',   // owner: tighter frame (2nd pass)
                    'background:linear-gradient(180deg,rgba(48,30,20,0.97),rgba(26,15,10,0.98));',
                    'border:1px solid rgba(232,180,110,0.55);',
                    'box-shadow:0 22px 64px -14px rgba(0,0,0,0.78),inset 0 1px 0 rgba(255,235,200,0.14);',
                    'transform:scale(0.55);opacity:0;transition:transform .46s cubic-bezier(.16,1,.3,1),opacity .3s ease;}',
                    '#pp-ht-reward-burst.show .ht-rb-card{transform:scale(1);opacity:1;}',
                    '#pp-ht-reward-burst.out .ht-rb-card{transform:scale(0.92);opacity:0;transition:transform .3s ease,opacity .3s ease;}',
                    '#pp-ht-reward-burst .ht-rb-glow{position:absolute;width:210px;height:210px;border-radius:50%;z-index:0;',
                    'background:radial-gradient(circle,rgba(232,150,120,0.34),transparent 68%);filter:blur(7px);animation:ht-rb-pulse 1.7s ease-in-out infinite;}',
                    '#pp-ht-reward-burst .ht-rb-ico{font-size:48px;line-height:1;z-index:1;filter:drop-shadow(0 0 18px rgba(232,140,150,0.72));animation:ht-rb-bob 1.9s ease-in-out infinite;}',
                    '#pp-ht-reward-burst .ht-rb-amt{z-index:1;font-family:"Cinzel","Marcellus",serif;font-weight:600;font-size:32px;line-height:1.05;margin-top:4px;',
                    'background:linear-gradient(180deg,#FBE8B8,#D4A85B);-webkit-background-clip:text;background-clip:text;color:transparent;}',
                    '#pp-ht-reward-burst .ht-rb-label{z-index:1;font-family:"Quicksand","Inter",sans-serif;font-weight:600;font-size:11.5px;letter-spacing:.2em;text-transform:uppercase;color:rgba(247,236,209,0.74);margin-top:3px;}',
                    '#pp-ht-reward-burst .ht-rb-tip{z-index:1;font-family:"Quicksand","Inter",sans-serif;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:rgba(247,236,209,0.42);margin-top:9px;}',
                    '#pp-ht-reward-burst .ht-rb-spark{position:absolute;left:50%;top:40%;z-index:0;color:#FBE0A0;font-size:14px;opacity:0;pointer-events:none;',
                    'text-shadow:0 0 6px rgba(251,224,160,0.8);animation:ht-rb-spark 1s ease-out forwards;}',
                    '@keyframes ht-rb-pulse{0%,100%{transform:scale(0.9);opacity:.55;}50%{transform:scale(1.12);opacity:1;}}',
                    '@keyframes ht-rb-bob{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}',
                    '@keyframes ht-rb-spark{0%{opacity:0;transform:translate(-50%,-50%) scale(0.4);}25%{opacity:1;}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1.15);}}'
                ].join('');
                document.head.appendChild(st);
            }
            var ov = document.createElement('div');
            ov.id = 'pp-ht-reward-burst';
            ov.innerHTML = '<div class="ht-rb-card">' +
                '<div class="ht-rb-glow"></div>' +
                '<div class="ht-rb-ico">' + CUR.icon + '</div>' +
                '<div class="ht-rb-amt">+' + n + '</div>' +
                '<div class="ht-rb-label">' + CUR.name + '</div>' +
                '<div class="ht-rb-tip">tap to continue</div>' +
                '</div>';
            document.body.appendChild(ov);
            // Sparkle ring radiating from the icon.
            var card = ov.querySelector('.ht-rb-card');
            for (var i = 0; i < 10; i++) {
                var s = document.createElement('span');
                s.className = 'ht-rb-spark';
                var a = (Math.PI * 2 * i) / 10;
                var d = 60 + (i % 3) * 16;
                s.style.setProperty('--dx', Math.round(Math.cos(a) * d) + 'px');
                s.style.setProperty('--dy', Math.round(Math.sin(a) * d) + 'px');
                s.style.animationDelay = (i * 0.03) + 's';
                s.textContent = '✦';
                card.appendChild(s);
            }
            requestAnimationFrame(function () { ov.classList.add('show'); });
            try {
                if (typeof sounds !== 'undefined' && sounds.enabled) {
                    if (sounds.rarityChime) sounds.rarityChime('rare');
                    else if (sounds.chime) sounds.chime();
                }
            } catch (_) {}
            var done = false;
            var close = function () {
                if (done) return; done = true;
                ov.classList.remove('show'); ov.classList.add('out');
                setTimeout(function () { try { ov.remove(); } catch (_) {} }, 340);
            };
            ov.addEventListener('click', close);
            setTimeout(close, 6000); // safety fallback only — the player taps to continue
        } catch (_) {}
    }

    // ── Panel ─────────────────────────────────────────────────────────────
    function buildPanel() {
        var ov = document.getElementById(OVERLAY_ID);
        if (ov) return ov;
        ov = document.createElement('div');
        ov.id = OVERLAY_ID;
        ov.className = 'hidden';
        ov.innerHTML = '<div class="ht-panel" role="dialog" aria-label="Bonds and Rewards">' +
            '<button class="ht-close" aria-label="Close">✕</button>' +
            '<div class="ht-eyebrow">Bonds &amp; Rewards</div>' +
            '<div class="ht-title">Roses of the Heart</div>' +
            '<div class="ht-wallet"><span class="ht-ico">' + CUR.icon + '</span><span class="ht-wallet-amt">0</span><span>' + CUR.name + '</span></div>' +
            '<div class="ht-body"></div>' +
            '<div class="ht-foot"></div>' +
            '</div>';
        document.body.appendChild(ov);
        ov.querySelector('.ht-close').addEventListener('click', function (e) { e.stopPropagation(); closePanel(); });
        ov.addEventListener('click', function (e) { if (e.target === ov) closePanel(); });
        return ov;
    }
    function rowHTML(opts) {
        // opts: ico,label,sub,amount,state('claim'|'progress'|'claimed'),cur,target,key
        var right;
        if (opts.state === 'claimed') {
            right = '<span class="ht-claim got">✓</span>';
        } else if (opts.state === 'claim') {
            right = '<button class="ht-claim" data-claim="' + opts.key + '">+' + opts.amount + ' ' + CUR.icon + '</button>';
        } else {
            right = '<button class="ht-claim" disabled>+' + opts.amount + ' ' + CUR.icon + '</button>';
        }
        var bar = '';
        if (opts.target && opts.state !== 'claimed') {
            var pct = Math.round(100 * Math.min(1, (opts.cur || 0) / opts.target));
            bar = '<div class="ht-bar"><span class="ht-bar-fill" style="width:' + pct + '%"></span></div>';
        }
        var sub = opts.sub ? '<div class="ht-row-sub">' + opts.sub + '</div>' : '';
        return '<div class="ht-row ' + (opts.state === 'claimed' ? 'claimed' : (opts.state === 'claim' ? 'done' : '')) + '">' +
            '<div class="ht-row-ico">' + opts.ico + '</div>' +
            '<div class="ht-row-mid"><div class="ht-row-label">' + opts.label + '</div>' + sub + bar + '</div>' +
            right + '</div>';
    }
    // Per-row display state. On the CARE screen (live game) we show the real
    // progress bar; on the DAILY tab (select screen, window._game === null) we
    // fall back to the readiness latch set during care, so it still shows +
    // claims correctly.
    function taskState(t) {
        if (taskClaimed(t.id)) return { state: 'claimed', sub: 'Claimed today' };
        var g = game();
        if (g) { var p = t.progress(g); return { state: p.done ? 'claim' : 'progress', sub: p.cur + ' / ' + p.target, cur: p.cur, target: p.target, bar: true }; }
        if (taskReady(t.id)) return { state: 'claim', sub: 'Ready to claim' };
        return { state: 'progress', sub: 'Care for them to complete' };
    }
    function weeklyState(t) {
        if (weeklyClaimed(t.id)) return { state: 'claimed', sub: 'Claimed this week' };
        var g = game();
        if (g) { var p = t.progress(g); return { state: p.done ? 'claim' : 'progress', sub: p.cur + ' / ' + p.target, cur: p.cur, target: p.target, bar: true }; }
        // no game: devoted/realm progress is localStorage-based (works); tender needs the latch
        var lp; try { lp = t.progress(); } catch (_) { lp = { cur: 0, target: 1, done: false }; }
        if (weeklyReady(t.id) || lp.done) return { state: 'claim', sub: 'Ready to claim' };
        if (t.id === 'tender') return { state: 'progress', sub: 'Care for them to complete' };
        return { state: 'progress', sub: lp.cur + ' / ' + lp.target, cur: lp.cur, target: lp.target, bar: true };
    }

    // Build the full sections HTML (used by both the standalone panel + the
    // Daily-tab embed). Pure string build — no DOM writes here.
    function buildSectionsHTML() {
        ensureDayReset(); ensureBaseline(game());
        ensureWeekReset(); ensureWeekBaseline(game());
        var html = '';
        // ── Limited-time event banner (FOMO) ──
        var ev = activeEvent(), evP = eventProgress(), evDone = evP >= ev.days, evClaimed = eventClaimed();
        var evPct = Math.round(100 * Math.min(1, evP / ev.days));
        var evRight = evClaimed ? '<span class="ht-claim got">✓</span>'
                    : evDone ? '<button class="ht-claim" data-claim="event:' + ev.id + '">+' + ev.reward + ' ' + CUR.icon + '</button>'
                    : '<button class="ht-claim" disabled>+' + ev.reward + ' ' + CUR.icon + '</button>';
        html += '<div class="ht-event">' +
                  '<div class="ht-event-top"><span class="ht-event-ico">' + ev.icon + '</span>' +
                    '<span class="ht-event-title">' + esc(ev.title) + '</span>' +
                    '<span class="ht-event-timer">⏳ ' + eventCountdown() + '</span></div>' +
                  '<div class="ht-event-blurb">' + esc(ev.blurb) + '</div>' +
                  '<div class="ht-event-row"><div class="ht-event-prog">' +
                    '<div class="ht-event-sub">' + (evClaimed ? 'Claimed, back next week' : evP + ' / ' + ev.days + ' active days') + '</div>' +
                    '<div class="ht-bar"><span class="ht-bar-fill" style="width:' + evPct + '%"></span></div></div>' + evRight + '</div>' +
                '</div>';
        // ── Streak banner (loss-aversion) ──
        var sk = streakInfo();
        var skSub = sk.state === 'safe'  ? 'Tended today. They notice when you return.'
                  : sk.state === 'risk'  ? 'Check in today. They’re hoping you will.'
                  : sk.state === 'grace' ? 'You missed a day, but your streak held. They waited.'
                  : 'Begin again. They’ll be glad you came back.';
        html += '<div class="ht-streak ht-streak-' + sk.state + '">' +
                  '<span class="ht-streak-flame">🔥</span>' +
                  '<span class="ht-streak-num">' + sk.count + '</span>' +
                  '<span class="ht-streak-txt"><b>Day streak</b><span>' + skSub + '</span></span>' +
                '</div>';
        html += '<div class="ht-sec">Daily check-in</div>';
        html += rowHTML({ ico: '🗓️', label: 'Welcome back', sub: checkinClaimed() ? 'Come again tomorrow' : 'A rose for returning today', amount: checkinAmount(), key: 'checkin', target: 0, state: checkinClaimed() ? 'claimed' : 'claim' });
        html += '<div class="ht-sec">Today’s devotions</div>';
        TASKS.forEach(function (t) { var s = taskState(t); html += rowHTML({ ico: t.icon, label: t.label, sub: s.sub, amount: t.amount, key: 'task:' + t.id, state: s.state, cur: s.cur, target: (s.bar ? s.target : 0) }); });
        html += '<div class="ht-sec">This week</div>';
        WEEKLY.forEach(function (t) { var s = weeklyState(t); html += rowHTML({ ico: t.icon, label: t.label, sub: s.sub, amount: t.amount, key: 'weekly:' + t.id, state: s.state, cur: s.cur, target: (s.bar ? s.target : 0) }); });
        var pend = pendingChapters();
        if (pend.length) {
            html += '<div class="ht-sec">Story rewards</div>';
            pend.forEach(function (id) { html += rowHTML({ ico: '📖', label: prettyChapter(id) + ' complete', sub: 'A chapter of your story', amount: AMOUNTS.chapter, key: 'ch:' + id, target: 0, state: 'claim' }); });
        }
        // Memory Album spend — only when the gallery exists (care screen)
        var alb = albumInfo();
        if (alb) {
            var who = esc(alb.char.charAt(0).toUpperCase() + alb.char.slice(1));
            var next = alb.buyable[0];
            var pct = alb.total ? Math.round(100 * alb.got / alb.total) : 0;
            var right = next ? '<button class="ht-claim" data-claim="album:' + next.id + ':' + next.cost + '">Reveal ' + CUR.icon + ' ' + next.cost + '</button>' : '<span class="ht-claim got">✓</span>';
            html += '<div class="ht-sec">Memory Album · ' + who + '</div>';
            html += '<div class="ht-row ' + (next ? '' : 'claimed') + '"><div class="ht-row-ico">🖼️</div><div class="ht-row-mid"><div class="ht-row-label">Collected memories</div><div class="ht-row-sub">' + alb.got + ' / ' + alb.total + (next ? ' · reveal “' + esc(next.title) + '”' : ' · all care memories collected') + '</div><div class="ht-bar"><span class="ht-bar-fill" style="width:' + pct + '%"></span></div></div>' + right + '</div>';
        }
        return html;
    }

    function wireClaims(scopeEl) {
        if (!scopeEl) return;
        scopeEl.querySelectorAll('.ht-claim[data-claim]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var key = btn.getAttribute('data-claim'), ok = false;
                var before = get(); // balance before the claim, for the count-up tween
                // The gain shown on the button ("+100 🧵"), captured BEFORE the row
                // re-renders, so the celebration shows the exact amount received.
                var gain = parseInt((btn.textContent.match(/\d+/) || [])[0], 10) || 0;
                var isAlbum = key.indexOf('album:') === 0; // a SPEND (card reveal), not a gain — no burst
                // Jul 2026 playtest fix — the Reveal button is a SPEND sitting
                // in a column of claim-gains; one stray tap cost 20. Arm on
                // first tap ("tap again to spend"), execute on the second.
                // Disarms after 4s or when the pointer leaves the row.
                if (isAlbum && !btn._ppArmed) {
                    btn._ppArmed = true;
                    btn._ppOldHTML = btn.innerHTML;
                    btn.innerHTML = 'Spend ' + CUR.icon + ' ' + (key.split(':')[2] || '') + '?';
                    btn.style.background = 'linear-gradient(180deg,#C46A8D,#7A2B4D)';
                    btn.style.color = '#FFF6FA';
                    setTimeout(function () {
                        if (!btn._ppArmed) return;
                        btn._ppArmed = false;
                        try { btn.innerHTML = btn._ppOldHTML; btn.style.background = ''; btn.style.color = ''; } catch (_) {}
                    }, 4000);
                    return;
                }
                if (key === 'checkin') ok = claimCheckin();
                else if (key.indexOf('task:') === 0) { var t = findTask(key.slice(5)); ok = t ? claimTask(t) : false; }
                else if (key.indexOf('weekly:') === 0) { var wt = findWeekly(key.slice(7)); ok = wt ? claimWeekly(wt) : false; }
                else if (key.indexOf('ch:') === 0) ok = claimChapter(key.slice(3));
                else if (key.indexOf('event:') === 0) ok = claimEvent();
                else if (isAlbum) { var ap = key.split(':'); ok = buyAlbumCard(ap[1], parseInt(ap[2], 10) || 0); }
                if (ok) {
                    if (!isAlbum && gain > 0) rewardBurst(gain);
                    renderInto(scopeEl);
                    // Count the wallet up (claim) or down (album spend) from the
                    // pre-claim balance instead of snapping to the new total.
                    var after = get();
                    try { document.querySelectorAll('.ht-wallet-amt').forEach(function (el) { tweenCount(el, after, before); }); } catch (_) {}
                    renderCounter();
                }
            });
        });
    }

    // Render into an arbitrary container (the Daily-tab embed uses this).
    function renderInto(bodyEl) {
        if (!bodyEl) return;
        bodyEl.innerHTML = buildSectionsHTML();
        wireClaims(bodyEl);
    }

    function renderPanel() {
        var ov = document.getElementById(OVERLAY_ID); if (!ov) return;
        var wamt = ov.querySelector('.ht-wallet-amt'); if (wamt) wamt.textContent = get();
        var body = ov.querySelector('.ht-body'); if (body) renderInto(body);
        var foot = ov.querySelector('.ht-foot'); if (foot) foot.textContent = 'Earn by caring daily · spend on gifts · resets at midnight';
    }
    function findTask(id) { for (var i = 0; i < TASKS.length; i++) if (TASKS[i].id === id) return TASKS[i]; return null; }

    function openPanel() {
        if (!enabled()) return;
        injectStyles();
        var ov = buildPanel();
        ov.classList.remove('hidden');
        renderPanel();
        requestAnimationFrame(function () { ov.classList.add('show'); });
    }
    function closePanel() {
        var ov = document.getElementById(OVERLAY_ID); if (!ov) return;
        ov.classList.remove('show');
        setTimeout(function () { try { ov.classList.add('hidden'); } catch (_) {} }, 300);
        renderCounter();
    }

    function refreshUI() { try { renderCounter(); if (document.getElementById(OVERLAY_ID) && !document.getElementById(OVERLAY_ID).classList.contains('hidden')) renderPanel(); } catch (_) {} }

    // ── Boot ──────────────────────────────────────────────────────────────
    function boot() {
        if (!enabled()) {
            // Re-check later in case the flag flips on within this session.
            setTimeout(function () { if (enabled()) boot(); }, 5000);
            return;
        }
        try { injectStyles(); } catch (_) {}
        try { ensureDayReset(); } catch (_) {}
        try { initChapterBaseline(); } catch (_) {}
        // counter appears once the care top bar exists
        var tries = 0;
        var iv = setInterval(function () {
            ensureCounter();
            if (document.getElementById(COUNTER_ID) || ++tries > 40) clearInterval(iv);
        }, 500);
        // light upkeep: baseline, chapter scan, dot refresh
        setInterval(function () {
            try { ensureDayReset(); ensureBaseline(game()); weeklyUpkeep(game()); latchReadiness(); scanChapters(); renderCounter(); } catch (_) {}
        }, 3000);
        // register our overlay with the shared open-detection (so chips/beats yield)
        try {
            if (window.PPOverlay && window.PPOverlay.selectors &&
                window.PPOverlay.selectors.indexOf('#' + OVERLAY_ID + '.show') === -1) {
                window.PPOverlay.selectors.push('#' + OVERLAY_ID + '.show');
            }
        } catch (_) {}
        document.addEventListener('pp:scene-change', function () { try { ensureCounter(); renderCounter(); } catch (_) {} });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();

    // ── Public API (inc#2 gift costs read these) ─────────────────────────────
    window.PPCurrency = {
        name: CUR.name, icon: CUR.icon,
        get: get, add: add, spend: spend, canAfford: canAfford,
        giftCost: giftCost,
        open: openPanel,
        renderInto: renderInto,   // Daily-tab embed (today-hub.js)
        anyClaimable: anyClaimable,
        _amounts: AMOUNTS
    };
})();
