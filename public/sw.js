const CACHE_NAME = 'huyen-co-cache-v2';
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

  // Network-First for navigation (HTML) to ensure users always get the latest version
  if (event.request.mode === 'navigate' || event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request).then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      }).catch(err => {
        return caches.match(event.request).then(fallback => {
          return fallback || caches.match('/huyen-co');
        });
      })
    );
    return;
  }

  // Cache-First for static assets (JS chunks, images, etc.)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(err => {
          throw err;
        });
      })
  );
});
