const CACHE_NAME = 'forest-shield-v7.1.0';
const MAX_CACHE_ITEMS = 200;
const PRECACHE = [
  './', './index.html', './observer.html', './driver.html', './ops.html',
  './manifest.json', './assets/icon-192.png', './assets/icon-512.png'
];

const RUNTIME = /unpkg\.com|gstatic\.com|openstreetmap\.org|open-meteo\.com|arcgisonline\.com|nominatim\.openstreetmap\.org|jsdelivr\.net/i;

async function trimCache(cache) {
  try {
    const keys = await cache.keys();
    while (keys.length > MAX_CACHE_ITEMS) await cache.delete(keys.shift());
  } catch (e) {}
}

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE).catch(err => console.warn('[SW] Precache partial:', err)))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  if (url.hostname.includes('firestore') ||
      (url.hostname.includes('googleapis.com') && !url.hostname.includes('gstatic'))) return;

  if (url.origin === location.origin || RUNTIME.test(url.hostname)) {
    e.respondWith(
      caches.match(e.request).then(hit => {
        if (hit) return hit;
        return fetch(e.request).then(res => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, copy).then(() => trimCache(c))).catch(() => {});
          }
          return res;
        }).catch(() => {
          if (e.request.mode === 'navigate' || e.request.destination === 'document') {
            const page = (url.pathname.split('/').pop() || 'index.html');
            return caches.match('./' + page).then(c => c || caches.match('./index.html'));
          }
        });
      })
    );
  }
});
