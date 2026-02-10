const CACHE_NAME = "restaurant-pwa-v3";
const CACHE_EXPIRY_HOURS = 72; // 3 DAYS

// Core static files
const CORE_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./menu.json",
    "./css/stylesheet.css",
    "./js/script.js"
];

// Folders to auto-cache dynamically
const FOLDER_PATTERNS = [
    "/images/",
    "/icon/",
    "/js/",
    "/css/"
];

// Save timestamp when cache is created
async function saveCacheTimestamp() {
    const timestamp = Date.now();
    const db = await caches.open(CACHE_NAME);
    await db.put("cache-timestamp", new Response(timestamp.toString()));
}

async function getCacheTimestamp() {
    const db = await caches.open(CACHE_NAME);
    const res = await db.match("cache-timestamp");
    if (!res) return null;
    const text = await res.text();
    return parseInt(text);
}

// INSTALL — Cache essential files
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            await cache.addAll(CORE_FILES);
            await saveCacheTimestamp();
        })
    );
    self.skipWaiting();
});

// ACTIVATE — Delete old caches
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

// FETCH
self.addEventListener("fetch", (event) => {
    const url = event.request.url;

    event.respondWith((async () => {
        // Check for expired cache
        const timestamp = await getCacheTimestamp();
        if (timestamp) {
            const ageHours = (Date.now() - timestamp) / (1000 * 60 * 60);
            if (ageHours > CACHE_EXPIRY_HOURS) {
                console.log("Cache expired — clearing...");
                const keys = await caches.keys();
                for (let key of keys) await caches.delete(key);
                // Force network-only after expiry
                return fetch(event.request);
            }
        }

        // Special fresh rule for menu.json
        if (url.includes("menu.json")) {
            try {
                const net = await fetch(event.request);
                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, net.clone());
                return net;
            } catch {
                return caches.match(event.request);
            }
        }

        // Folder-level dynamic caching (images/js/css/icon)
        if (FOLDER_PATTERNS.some(folder => url.includes(folder))) {
            const cached = await caches.match(event.request);
            if (cached) return cached;

            try {
                const net = await fetch(event.request);
                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, net.clone());
                return net;
            } catch {
                return cached || fetch(event.request);
            }
        }

        // Default network-first fallback
        try {
            return await fetch(event.request);
        } catch {
            return caches.match(event.request);
        }
    })());
});
