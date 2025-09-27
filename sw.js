const CACHE_NAME = 'okerun-cache-v2'; // Cache version updated
// All assets to be cached for full offline functionality
const urlsToCache = [
  // Core files
  './',
  './index.html',
  './style.css',
  './soundPlayer.js',

  // JavaScript files
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

  // Image files
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

  // Sound files
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

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event to serve from cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
