const CACHE_NAME = 'pocket-love-v936';

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
    '/js/adaptive-thoughts.js',
    '/js/endings.js',
    '/js/monetization.js',
    '/js/sound-design.js',
    '/js/revenuecat-bridge.js',
    '/js/main-story-toggle.js',
    '/js/main-story-integration.js',
    '/js/chapters.js',
    '/js/noir-whispers.js',
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
    '/js/ch6-unlock-celebration.js'
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

// Install — pre-cache core files, then boot assets (best-effort).
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        // CORE_ASSETS is required — fail install if any of these don't fetch.
        await cache.addAll(CORE_ASSETS);
        // BOOT_ASSETS is best-effort. We use individual put() instead of
        // addAll() so a single 404/network-blip on (say) bgm-tense.mp3
        // doesn't fail the entire SW install.
        await Promise.all(BOOT_ASSETS.map(async (path) => {
            try {
                const resp = await fetch(path, { cache: 'reload' });
                if (resp && resp.ok) await cache.put(path, resp);
            } catch (_) { /* swallow — fetch handler will retry on demand */ }
        }));
    })());
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch strategy:
//   config.json             → network-only (live tuning must always be fresh)
//   Core assets (JS/CSS/HTML)→ cache-first (fast, offline-safe)
//   Images/audio            → network-first, fallback to cache
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    const isNetworkFirst = NETWORK_FIRST_PATHS.some(path => url.pathname === path);
    const isCoreAsset    = CORE_ASSETS.some(path => url.pathname === path);

    if (isNetworkFirst) {
        // Pure network — skip cache entirely so tuning changes land immediately
        event.respondWith(
            fetch(event.request).catch(() => new Response('{}', { headers: { 'Content-Type': 'application/json' } }))
        );
        return;
    }

    if (isCoreAsset) {
        // Cache-first: serve instantly from cache, update in background
        event.respondWith(
            caches.match(event.request).then(cached => {
                const networkFetch = fetch(event.request).then(response => {
                    if (response.ok) {
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
                    }
                    return response;
                });
                return cached || networkFetch;
            })
        );
    } else {
        // Network-first: try network, fall back to cache (images, audio, etc.)
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
    }
});
