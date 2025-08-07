const CACHE_NAME = "cache-v1";
const urlsToCache = [
  "/POC/MAZE-WORLD/",
  "/POC/MAZE-WORLD/index.html",
  "/POC/MAZE-WORLD/css/index.css",
  "/POC/MAZE-WORLD/js/start.js",
  "/POC/MAZE-WORLD/images/player/down.png",
];

self.addEventListener("install", (e) => {
  const event = /** @type {ExtendableEvent} */ (e);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (e) => {
  const event = /** @type {FetchEvent} */ (e);
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

///////////////

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/POC/MAZE-WORLD/service-worker.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}
