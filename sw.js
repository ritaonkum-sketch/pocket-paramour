// Shell cache. Bump on every deploy (see the UPKEEP RULE below). The name
// MUST keep the 'pocket-love-v' prefix — activate uses it to tell shell
// caches apart from the persistent media cache.
const CACHE_NAME = 'pocket-love-v1144';

// -----------------------------------------------------------------------------
// CORE_ASSETS — the manifest. Must match the <script> tags in index.html so
// offline PWA play works. This list is kept intentionally explicit (rather
// than generated) so you can see at a glance what ships.
//
// UPKEEP RULE: whenever you add a new <script src="js/*.js"> to index.html,
// add the same path here AND bump CACHE_NAME (v160, v161, ...).
// -----------------------------------------------------------------------------
const CORE_ASSETS = [
    '/index.html',
    '/css/tokens.css',
    '/css/style.css',
    '/css/visual-system.css',
    '/css/screens/title.css',
    '/css/screens/select.css',
    '/css/screens/world-intro.css',
    '/assets/title-seal.png',
    '/assets/title-wordmark.png',
    '/assets/title-silver-thread.png',
    '/assets/title-bg.png',
    '/assets/ui/rose-coin.png',
    '/assets/ui/tour-seal.png',
    '/assets/ui/tour-bg.jpg',
    '/assets/ui/chronicle/active-card-bg.jpg',
    '/assets/prologue/beat-2-kingdom.png',
    '/assets/prologue/beat-3-4-ritual.png',
    '/assets/prologue/beat-6-portal.png',
    '/assets/prologue/beat-8-magic-forest.png',
    '/assets/prologue/beat-9-cathedral.png',
    '/assets/petals/petal-1.png',
    '/assets/petals/petal-2.png',
    '/assets/petals/petal-3.png',
    '/assets/audio/heartbeat.mp3',
    '/assets/audio/bgm-night.mp3',
    '/assets/audio/fireplace-crackle.mp3',
    '/manifest.json',

    // Core engine
    '/js/error-guard.js',
    '/js/selftest.js',
    '/js/pp-overlay.js',
    '/js/remote-config.js',
    '/js/analytics.js',
    '/js/bandit.js',
    '/js/achievements.js',
    '/js/events.js',
    '/js/dialogue.js',
    '/js/character.js',
    '/js/character-lyra.js',
    '/js/character-caspian.js',
    '/js/character-elian.js',
    '/js/character-lucien.js',
    '/js/character-proto.js',
    '/js/character-noir.js',
    '/js/puzzles.js',
    '/js/sounds.js',
    '/js/bgm.js',
    '/js/payments.js',
    '/js/daily-rewards.js',
    '/js/stories.js',
    '/js/gallery.js',
    '/js/intro.js',
    '/js/scene-state.js',
    '/js/game.js',
    '/js/ui.js',

    // UX layers
    '/js/letter.js',
    '/js/letter-arrival.js',
    '/js/letters-archive.js',
    '/js/ui-feel.js',
    '/js/day-progress.js',
    '/js/action-feedback.js',
    '/js/first-session.js',
    '/js/day-one-overlay.js',
    '/js/idle-life.js',
    '/js/living-pools.js',
    '/js/living-state.js',
    '/js/care-blink.js',
    '/js/care-ambiance.js',
    '/js/greetings.js',
    '/js/touch.js',
    '/js/talk-choices.js',
    '/js/surprises.js',
    '/js/dates.js',
    '/js/button-locks.js',

    // Main-story route (opt-in; flag: pp_main_story_enabled)
    // Crossovers, bridges, and all encounter-*.js files deleted June 2026
    // (owner cleanup ahead of new main-story content). chapters.js now
    // contains only Prologue + id:1 (Chapter 3 "Gauntlet Off") — new
    // story will be appended to its CHAPTERS array.
    '/js/main-story.js',
    '/js/daily-purpose.js',
    '/js/premium-card.js',
    '/js/cards-library.js',
    '/js/care-thoughts.js',
    '/js/endings.js',
    '/js/monetization.js',
    '/js/sound-design.js',
    '/js/revenuecat-bridge.js',
    '/js/main-story-toggle.js',
    '/js/main-story-integration.js',
    '/js/chapters.js',
    '/js/affection-scenes.js',
    '/js/production-polish.js',
    '/js/cross-char.js',
    '/js/epilogues.js',
    '/js/turning-points.js',
    '/js/alistair-arc.js',
    '/js/early-whispers.js',
    '/js/affection-drift.js',
    '/js/small-moments.js',
    '/js/scheduled-moments.js',
    '/js/fight-makeup.js',

    // Ship-readiness pass (April 2026): coordinator + guards + dev panel
    '/js/ambient-coordinator.js',
    '/js/payments-guard.js',
    '/js/storage-guard.js',
    '/js/onboarding-flow.js',
    '/js/aenor-presence.js',
    '/js/care-weaver-thread.js',
    '/js/multi-romance.js',
    // prologue-chain.js + world-arrival.js removed June 2026 (owner clean
    // slate) — they orchestrated meet-cutes that no longer exist. When the
    // new main story is written, a fresh orchestrator can be added back.
    '/js/today-hub.js',
    '/js/economy.js',
    '/js/main-story-gate.js',
    '/js/route-gates.js',
    '/js/first-care-hint.js',
    '/js/care-target-chip.js',
    '/js/memory-album.js',
    '/js/alistair-care-intro.js',
    '/js/ch6-unlock-celebration.js',
    '/js/daily-thread.js',
    '/js/presence.js'
];

// config.json is always fetched network-first so live tuning changes land immediately.
// It is NOT in CORE_ASSETS — the SW should never serve a stale config from cache.
const NETWORK_FIRST_PATHS = ['/config.json'];

// -----------------------------------------------------------------------------
// BOOT_ASSETS — minimal set of images + audio pre-cached on install so a
// first-cold-launch player on weak/no signal still gets:
//   - the title-screen world background
//   - all 7 character select-portrait silhouettes (so the grid is not empty)
//   - the 5 mood BGM tracks (calm, night, romantic, tense, corrupted) — small
//     enough to ship in cache, eliminates the "2-minute silence" gap
//   - the most-used UI SFX (chime, blip, fanfare, achievement, gift-chime,
//     pop, swoosh, card-flip) so action feedback is never silent
//
// These are added to the install cacheAddAll AFTER CORE_ASSETS resolves; if any
// fail (slow network) we still have CORE_ASSETS cached and the missing items
// fall through to the fetch handler's network-first → cache fallback.
// -----------------------------------------------------------------------------
const BOOT_ASSETS = [
    '/assets/bg-world.png',
    '/assets/alistair/select-portrait.png',
    '/assets/elian/select-portrait.png',
    '/assets/lyra/select-portrait.png',
    '/assets/caspian/select-portrait.png',
    '/assets/lucien/select-portrait.png',
    '/assets/noir/select-portrait.png',
    '/assets/proto/select-portrait.png',
    // BGM
    '/assets/audio/bgm-calm.mp3',
    '/assets/audio/bgm-night.mp3',
    '/assets/audio/bgm-romantic.mp3',
    '/assets/audio/bgm-tense.mp3',
    '/assets/audio/bgm-corrupted.mp3',
    // Core SFX
    '/assets/audio/chime.mp3',
    '/assets/audio/blip.mp3',
    '/assets/audio/fanfare.mp3',
    '/assets/audio/achievement.mp3',
    '/assets/audio/gift-chime.mp3',
    '/assets/audio/card-flip.mp3',
    '/assets/audio/card-sparkle.mp3',
    '/assets/audio/clash.mp3',
    '/assets/audio/crystal-resonance.mp3'  // Sprint 3: Ch1 lift moment cue
];

// -----------------------------------------------------------------------------
// TWO CACHES, ON PURPOSE (Aug 2026)
//
// Everything used to live in the single versioned CACHE_NAME bucket, and
// activate deleted every cache that was not the current version. That meant
// each CACHE_NAME bump threw away every cached image and sound along with the
// stale code — so the first load after a deploy had NO art in cache, and if
// the network was unavailable at that exact moment the game rendered with the
// backgrounds and portraits missing. (Seen live: the dev server went down
// right after a version bump and the Main Story screen lost its background
// and every chapter thumbnail.)
//
// The two buckets have genuinely different needs:
//   CACHE_NAME  — code + markup + CSS. MUST be thrown away on every bump,
//                 otherwise players run stale JS. Versioned.
//   MEDIA_CACHE — images and audio. These are content-addressed by path and
//                 have nothing to do with the code version, so a code deploy
//                 is no reason to evict them. NOT versioned; survives bumps.
//
// Media stays network-first (see the fetch handler), so a re-exported PNG
// still wins the moment the player is online — the cache is purely an
// offline/'server unreachable' safety net, never a source of stale art.
// -----------------------------------------------------------------------------
const MEDIA_CACHE  = 'pocket-love-media';
const SHELL_PREFIX = 'pocket-love-v';

// The media cache is now permanent, so it needs a ceiling — an unbounded
// cache can push the origin over its storage quota, and quota eviction can
// take the whole origin with it (including the player's save). 620 asset
// files ship with the game; holding the most recent ~350 keeps a comfortable
// working set without ever approaching that. BOOT_ASSETS are exempt from the
// trim so a cold launch is never left without its essentials.
const MEDIA_MAX_ENTRIES = 350;

async function trimMediaCache() {
    try {
        const cache = await caches.open(MEDIA_CACHE);
        const keys = await cache.keys();
        if (keys.length <= MEDIA_MAX_ENTRIES) return;
        const boot = new Set(BOOT_ASSETS);
        // Cache.keys() returns insertion order, so the front is the oldest.
        let excess = keys.length - MEDIA_MAX_ENTRIES;
        for (const req of keys) {
            if (excess <= 0) break;
            if (boot.has(new URL(req.url).pathname)) continue;
            await cache.delete(req);
            excess--;
        }
    } catch (_) { /* trimming is housekeeping — never let it fail activate */ }
}

// One-time rescue on upgrade: a player arriving from an older SW has all
// their art sitting in the outgoing versioned cache. Move the non-code
// entries across before that cache is deleted, so upgrading does not cost
// them a full re-download (or a bare screen if they happen to be offline).
async function adoptMediaFrom(oldCacheName) {
    try {
        const [oldCache, media] = await Promise.all([
            caches.open(oldCacheName), caches.open(MEDIA_CACHE)
        ]);
        const core = new Set(CORE_ASSETS);
        for (const req of await oldCache.keys()) {
            const path = new URL(req.url).pathname;
            if (core.has(path)) continue;             // code — let it die with the version
            if (await media.match(req)) continue;     // already have a newer copy
            const resp = await oldCache.match(req);
            if (resp) await media.put(req, resp);
        }
    } catch (_) { /* best effort — the fetch handler will re-fill on demand */ }
}

// Install — pre-cache core files, then boot assets (best-effort).
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        // CORE_ASSETS is required — fail install if any of these don't fetch.
        await cache.addAll(CORE_ASSETS);
        // BOOT_ASSETS go to the persistent media cache, best-effort, with
        // individual put() instead of addAll() so a single 404/network-blip
        // on (say) bgm-tense.mp3 doesn't fail the entire SW install. Anything
        // already held is skipped, so a redeploy no longer re-downloads five
        // megabytes of BGM the player has had since their first launch.
        const media = await caches.open(MEDIA_CACHE);
        await Promise.all(BOOT_ASSETS.map(async (path) => {
            try {
                if (await media.match(path)) return;
                const resp = await fetch(path, { cache: 'reload' });
                if (resp && resp.ok) await media.put(path, resp);
            } catch (_) { /* swallow — fetch handler will retry on demand */ }
        }));
    })());
    self.skipWaiting();
});

// Activate — retire old SHELL caches only. MEDIA_CACHE is deliberately left
// alone; that is the whole point of splitting them. The filter is anchored on
// SHELL_PREFIX rather than "everything that isn't current" so any future
// sibling cache is safe from this sweep too.
self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        const stale = keys.filter(k => k.startsWith(SHELL_PREFIX) && k !== CACHE_NAME);
        for (const k of stale) {
            await adoptMediaFrom(k);
            await caches.delete(k);
        }
        await trimMediaCache();
        await self.clients.claim();
    })());
});

// Fetch strategy:
//   config.json              → network-only (live tuning must always be fresh)
//   Core assets (JS/CSS/HTML)→ cache-first from the versioned shell cache
//   Images/audio             → network-first, fall back to the media cache
self.addEventListener('fetch', event => {
    const req = event.request;

    // Only GETs are cacheable — cache.put() throws on anything else.
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    // Leave cross-origin traffic (payments, analytics) entirely alone. It also
    // keeps opaque no-cors responses, which report as zero-length but occupy
    // real space, out of a cache that now persists indefinitely.
    if (url.origin !== self.location.origin) return;

    if (NETWORK_FIRST_PATHS.some(path => url.pathname === path)) {
        // Pure network — skip cache entirely so tuning changes land immediately
        event.respondWith(
            fetch(req).catch(() => new Response('{}', { headers: { 'Content-Type': 'application/json' } }))
        );
        return;
    }

    if (CORE_ASSETS.some(path => url.pathname === path)) {
        // Cache-first: serve instantly from the shell cache, update behind it.
        event.respondWith((async () => {
            const cache  = await caches.open(CACHE_NAME);
            const cached = await cache.match(req);
            const fromNetwork = fetch(req).then(resp => {
                if (resp && resp.ok) cache.put(req, resp.clone());
                return resp;
            });
            if (cached) {
                fromNetwork.catch(() => {});   // background refresh may fail; that's fine
                return cached;
            }
            return fromNetwork;
        })());
        return;
    }

    // Media: network-first so fresh art always wins online, media cache behind
    // it so a dead server or a tunnel doesn't blank the screen.
    event.respondWith((async () => {
        try {
            const resp = await fetch(req);
            if (resp && resp.ok) {
                const clone = resp.clone();
                caches.open(MEDIA_CACHE).then(c => c.put(req, clone)).catch(() => {});
            }
            return resp;
        } catch (err) {
            const hit = await caches.match(req);   // media first, then any bucket
            if (hit) return hit;
            throw err;                             // genuinely unavailable
        }
    })());
});
