import { CACHE_NAME } from './js/config.js';
import { assetsToCache } from './js/asset_list.js';

// インストール時にキャッシュを保存する
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching all assets');
        return cache.addAll(assetsToCache);
      })
      .catch(error => {
        console.error('Failed to cache assets:', error);
      })
  );
});

// フェッチイベントで、キャッシュがあればキャッシュから返す
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// 新しいService Workerが有効になったときに古いキャッシュを削除する
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
