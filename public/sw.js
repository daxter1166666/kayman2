// Clean, non-blocking service worker that unregisters itself and passes all requests to network
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
  );
});

// Pass all network requests straight through, never intercept or delay
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

