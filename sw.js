const CACHE_NAME = 'okerun-cache-v3'; // キャッシュのバージョンを更新

// キャッシュするすべてのファイル
const urlsToCache = [
  // --- Core Files ---
  './',
  './index.html',
  './style.css',
  './soundPlayer.js',

  // --- JavaScript Files ---
  './js/config.js',
  './js/input_handler.js',
  './js/main.js',
  './js/player.js',
  './js/scaffold.js',
  './js/score_manager.js',
  './js/stage.js',
  './js/scenes/game_description.js',
  './js/scenes/game_over.js',
  './js/scenes/game.js',
  './js/scenes/instrument_select.js',
  './js/scenes/main.js',
  './js/scenes/ranking.js',
  './js/scenes/volume_settings.js',
  './js/ui/button.js',
  './js/ui/volume_slider.js',

  // --- Image Files ---
  './img/character_jump.png',
  './img/character_wait.png',
  './img/character_woke.png',
  './img/character_woke2.png',
  './img/doramu.png',
  './img/gakufu.png',
  './img/game2.png',
  './img/gameover.png',
  './img/gita.png',
  './img/ground.png',
  './img/ki.png',
  './img/ki2.png',
  './img/ki3.png',
  './img/ki4.png',
  './img/kirikabu.png',
  './img/logo.png',
  './img/mein.png',
  './img/piano.png',
  './img/taiko.png',
  './img/tanbarin.png',
  './img/teki.png',
  './img/title_rank_select.png',
  './img/toraianguru.png',

  // --- Sound Files ---
  // drum
  './sound/drum/track01.wav',
  './sound/drum/track02.wav',
  './sound/drum/track03.wav',
  './sound/drum/track04.wav',
  './sound/drum/track05.wav',
  './sound/drum/track06.wav',
  // game
  './sound/game/game_bgm.wav',
  './sound/game/gameover_bgm.wav',
  './sound/game/home_bgm.wav',
  './sound/game/track01.wav',
  './sound/game/track02.wav',
  './sound/game/track03.wav',
  './sound/game/木が倒れる音.wav',
  // guitar
  './sound/guitar/track01.wav',
  './sound/guitar/track02.wav',
  './sound/guitar/track03.wav',
  './sound/guitar/track04.wav',
  // piano
  './sound/piano/track01.wav',
  './sound/piano/track02.wav',
  './sound/piano/track03.wav',
  './sound/piano/track04.wav',
  './sound/piano/track05.wav',
  './sound/piano/track06.wav',
  './sound/piano/track07.wav',
  // taiko
  './sound/taiko/track01.wav',
  './sound/taiko/track02.wav',
  './sound/taiko/track03.wav',
  // tambourie
  './sound/tambourie/track01.wav',
  './sound/tambourie/track02.wav',
  // triangle
  './sound/triangle/track01.wav'
];

// インストール時にキャッシュを保存する
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching all assets');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache assets:', error);
        // キャッシュに失敗したファイルなどを特定するのに役立つ
        urlsToCache.forEach(url => {
            fetch(url).catch(err => console.error(`Failed to fetch ${url}`, err));
        });
      })
  );
});

// フェッチイベントで、キャッシュがあればキャッシュから返す
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにヒットすれば、それを返す
        if (response) {
          return response;
        }
        // キャッシュになければ、ネットワークからフェッチする
        return fetch(event.request);
      })
  );
});

// 新しいService Workerが有効になったときに古いキャッシュを削除する
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});