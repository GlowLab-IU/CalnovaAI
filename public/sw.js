const CACHE_NAME = 'huyen-co-cache-v1';
const urlsToCache = [
  '/huyen-co',
  '/manifest.json',
  '/favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  const isApi = url.includes('/ai/') || url.includes('/glowlab/') || url.includes('/api/') || url.includes('api.calnovaai.com');

  if (isApi) {
    // Let API requests bypass PWA cache completely and let errors propagate
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).catch(err => {
          // If fetch fails (offline), return offline fallback for normal pages
          return caches.match('/huyen-co').then(fallback => {
            if (fallback) {
              return fallback;
            }
            throw err; // Throw fetch error so the browser handles it rather than displaying ERR_FAILED
          });
        });
      })
  );
});
