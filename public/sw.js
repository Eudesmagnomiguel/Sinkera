const CACHE = 'sinkera-v1';
const OFFLINE_URL = '/';

// Cache shell on install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll([OFFLINE_URL, '/produtos', '/manifest.json'])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for API/Supabase, cache-first for assets
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Skip non-GET and Supabase API calls
  if (e.request.method !== 'GET' || url.hostname.includes('supabase')) return;

  // Cache-first for static assets
  if (url.pathname.match(/\.(js|css|png|jpg|webp|ico|woff2|svg)$/)) {
    e.respondWith(
      caches.match(e.request).then((cached) =>
        cached || fetch(e.request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Network-first for pages
  e.respondWith(
    fetch(e.request).catch(() => caches.match(OFFLINE_URL))
  );
});
