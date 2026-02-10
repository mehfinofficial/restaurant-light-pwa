const CACHE_NAME = "restaurant-pwa-v2";

// Core files that must always be cached
const CORE_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./menu.json",        // fresh rule applied below
    "./css/stylesheet.css",
    "./js/script.js"
];

// Auto-cache these folders (dynamic)
const FOLDER_PATTERNS = [
    "/images/",
    "/icon/",
    "/js/",
    "/css/"
];

// INSTALL — Cache essential files
self.addEventListener("install", (event) => {
    self.skipWaiting(); // Force new SW instantly
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CORE_FILES);
        })
    );
});

// ACTIVATE — Clear old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        })
    );
    self.clients.claim();
});

// FETCH — All fetch handling
self.addEventListener("fetch", (event) => {
    const url = event.request.url;

    // 1️⃣ SPECIAL RULE: menu.json must ALWAYS be fresh (fix wrong price/menu issue)
    if (url.includes("menu.json")) {
        event.respondWith(
            fetch(event.request)
                .then(networkRes => {
                    // update cache
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkRes.clone());
                    });
                    return networkRes;
                })
                .catch(() => caches.match(event.request)) // fallback offline
        );
        return;
    }

    // 2️⃣ FOLDER LEVEL CACHING (dynamic images, js, css, icons)
    const shouldCache = FOLDER_PATTERNS.some(folder => url.includes(folder));
    if (shouldCache) {
        event.respondWith(
            caches.match(event.request).then(cachedRes => {
                return (
                    cachedRes ||
                    fetch(event.request).then(networkRes => {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, networkRes.clone());
                        });
                        return networkRes;
                    })
                );
            })
        );
        return;
    }

    // 3️⃣ DEFAULT STRATEGY — Network-first, fallback to cache
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
