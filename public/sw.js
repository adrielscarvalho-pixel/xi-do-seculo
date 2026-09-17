/* Cache offline. A publicação troca __VERSAO__ pelo commit, o que invalida o cache antigo. */
const VERSION = '__VERSAO__';
const CACHE = 'xi-' + VERSION;
const PRECACHE = [
  '/',
  '/js/engine.js?v=' + VERSION,
  '/js/app.js?v=' + VERSION,
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon-32.png',
  '/apple-touch-icon.png',
  '/fonts/archivo-latin.woff2',
  '/fonts/archivo-latin-ext.woff2',
  '/fonts/big-shoulders-latin.woff2',
  '/fonts/big-shoulders-latin-ext.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function put(cacheName, request, response) {
  if (response && (response.ok || response.type === 'opaque')) {
    const copy = response.clone();
    caches.open(cacheName).then(cache => cache.put(request, copy));
  }
  return response;
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Página: rede primeiro, para dados novos aparecerem logo; cache se estiver offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => put(CACHE, '/', res))
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Arquivos do site: cache primeiro e atualiza em segundo plano.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        const network = fetch(request).then(res => put(CACHE, request, res)).catch(() => cached);
        return cached || network;
      })
    );
  }
});
