const CACHE_NAME = 'pocket-love-v223';

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
    '/css/style.css',
    '/manifest.json',

    // Core engine
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
    '/js/gallery.js',
    '/js/intro.js',
    '/js/game.js',
    '/js/ui.js',

    // UX layers
    '/js/letter.js',
    '/js/letters-archive.js',
    '/js/ui-feel.js',
    '/js/day-progress.js',
    '/js/action-feedback.js',
    '/js/first-session.js',
    '/js/idle-life.js',
    '/js/greetings.js',
    '/js/touch.js',
    '/js/talk-choices.js',
    '/js/surprises.js',
    '/js/dates.js',
    '/js/crossovers.js',
    '/js/button-locks.js',

    // Main-story route (opt-in; flag: pp_main_story_enabled)
    // The 7 legacy encounter-<char>.js files were removed — bridges
    // in the prologue chain are the meet-cutes now.
    '/js/encounter-elian-rescue.js',
    '/js/crossover-lyra-lucien.js',
    '/js/crossover-noir-elian.js',
    '/js/crossover-noir-lyra.js',
    '/js/crossover-caspian-noir.js',
    '/js/crossover-elian-lyra.js',
    '/js/crossover-lucien-aenor.js',
    '/js/crossover-weavers-court.js',
    '/js/crossover-alistair-caspian.js',
    '/js/crossover-alistair-lucien.js',
    '/js/crossover-caspian-lucien.js',
    '/js/main-story.js',
    '/js/daily-purpose.js',
    '/js/premium-card.js',
    '/js/cards-library.js',
    '/js/adaptive-thoughts.js',
    '/js/endings.js',
    '/js/monetization.js',
    '/js/memory-gallery.js',
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
    '/js/early-whispers.js',
    '/js/affection-drift.js',

    // Ship-readiness pass (April 2026): coordinator + guards + dev panel
    '/js/ambient-coordinator.js',
    '/js/payments-guard.js',
    '/js/storage-guard.js',
    '/js/onboarding-flow.js',
    '/js/aenor-presence.js',
    '/js/care-weaver-thread.js',
    '/js/multi-romance.js',
    '/js/prologue-chain.js',
    '/js/world-arrival.js',
    '/js/bridge-alistair.js',
    '/js/bridge-elian.js',
    '/js/bridge-lyra.js',
    '/js/bridge-caspian.js',
    '/js/bridge-lucien.js',
    '/js/bridge-noir.js',
    '/js/bridge-proto.js',
    '/js/dev-panel.js'
];

// config.json is always fetched network-first so live tuning changes land immediately.
// It is NOT in CORE_ASSETS — the SW should never serve a stale config from cache.
const NETWORK_FIRST_PATHS = ['/config.json'];

// Install — pre-cache core files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
    );
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
