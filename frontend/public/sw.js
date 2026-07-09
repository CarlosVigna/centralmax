const CACHE_NAME = 'maxhub-v1';
const STATIC_ASSETS = [
  '/',
  '/admin',
  '/manifest.json',
  '/icons/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: network only, sem cache
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Navegação SPA: retorna o index.html cacheado ou faz network
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/') || caches.match('/admin'))
    );
    return;
  }

  // Demais assets: network-first, fallback para cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
