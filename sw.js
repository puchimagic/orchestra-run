import { CACHE_NAME } from './js/config.js';
import { assetsToCache } from './js/asset_list.js';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('キャッシュを開きました。アセットを個別にキャッシュしています。');
      // cache.addAll はすべて成功かすべて失敗かです。堅牢性のために個別にキャッシュします。
      const promises = assetsToCache.map((url) => {
        return cache.add(url).catch(err => {
          // キャッシュ失敗をログに記録しますが、インストール全体を失敗させません
          console.error(`${url} のキャッシュに失敗しました:`, err);
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
        // キャッシュファースト戦略
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