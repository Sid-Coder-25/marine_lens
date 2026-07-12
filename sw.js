const CACHE_NAME = "marine-lens-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "fish-data.js",
  "manifest.json",
  "assets/logo.png",
  "assets/ocean-bg.png",
  "assets/ocean-lines.svg",
  "model/model.json",
  "model/metadata.json",
  "model/weights.bin",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js"
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Precaching app shell & model assets");
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log("[Service Worker] Cleaning old cache:", key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
      .then(() => {
        // Send message to all active clients that caching finished and SW is active
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: "OFFLINE_READY" });
          });
        });
      })
  );
});

// Fetch Event
self.addEventListener("fetch", (event) => {
  // Only handle GET requests with http/https protocols
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (!url.protocol.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // Dynamically cache external fonts when loaded
          if (
            url.host.includes("fonts.googleapis.com") ||
            url.host.includes("fonts.gstatic.com")
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return networkResponse;
        })
        .catch((error) => {
          console.error("[Service Worker] Fetch failed for:", event.request.url, error);
        });
    })
  );
});
