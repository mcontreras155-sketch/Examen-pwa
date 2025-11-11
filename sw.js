// Service Worker simple para offline + instalación
const CACHE_NAME = 'examen-pwa-v1';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k === CACHE_NAME) ? null : caches.delete(k))))
  );
  self.clients.claim();
});

// Cache-first para mismo origen; network-first para CDNs
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((res) => res || fetch(event.request))
    );
    return;
  }
  event.respondWith((async () => {
    try {
      const net = await fetch(event.request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(event.request, net.clone());
      return net;
    } catch (err) {
      const cached = await caches.match(event.request);
      return cached || Response.error();
    }
  })());
});
