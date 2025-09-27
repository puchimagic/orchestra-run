import { CACHE_NAME } from './js/config.js';
import { assetsToCache } from './js/asset_list.js';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache. Caching assets individually.');
      // cache.addAll is all-or-nothing. We add individually for robustness.
      const promises = assetsToCache.map((url) => {
        return cache.add(url).catch(err => {
          // Log failed caches but don't fail the entire install
          console.error(`Failed to cache ${url}:`, err);
        });
      });
      return Promise.all(promises);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache-first strategy
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});