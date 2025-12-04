const CACHE_NAME = 'luarmor-key-tracker';
const BASE_URL = self.location.origin;

const APP_SHELL = [
  `${BASE_URL}/`,
  `${BASE_URL}/index.html`,
  `${BASE_URL}/style.css`,
  `${BASE_URL}/app.js`,
  `${BASE_URL}/manifest.json`,
  `${BASE_URL}/icons/icon-192.png`,
  `${BASE_URL}/icons/icon-512.png`
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  const url = req.url;

  // Firebase selalu lewat jaringan
  if (url.includes('firebase') || url.includes('gstatic')) {
    event.respondWith(fetch(req));
    return;
  }

  // Navigation → network first
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(`${BASE_URL}/index.html`))
    );
    return;
  }

  // Static files → cache first
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req).then(res => {
        if (!res || res.status !== 200) return res;

        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));

        return res;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// Auto update SW
self.addEventListener("message", event => {
  if (event.data === "skipWaiting") self.skipWaiting();
});
