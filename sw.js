const CACHE_NAME = 'pocket-love-v81';

const CORE_ASSETS = [
    '/index.html',
    '/css/style.css',
    '/js/remote-config.js',
    '/js/analytics.js',
    '/js/bandit.js',
    '/js/game.js',
    '/js/ui.js',
    '/js/dialogue.js',
    '/js/character.js',
    '/js/character-lyra.js',
    '/js/character-caspian.js',
    '/js/character-elian.js',
    '/js/character-lucien.js',
    '/js/character-proto.js',
    '/js/character-noir.js',
    '/js/puzzles.js',
    '/js/payments.js',
    '/js/daily-rewards.js',
    '/js/sounds.js',
    '/js/bgm.js',
    '/js/gallery.js',
    '/js/intro.js',
    '/js/achievements.js',
    '/js/events.js',
    '/manifest.json'
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
