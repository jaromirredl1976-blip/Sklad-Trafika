const CACHE_NAME = "sklad-v2";

const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json"
];

// 🔥 INSTALL
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// 🔥 ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// 🔥 FETCH (offline fallback)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(res => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, res.clone());
          return res;
        });
      })
      .catch(() => caches.match(event.request))
  );
});
