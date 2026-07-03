const CACHE_NAME = 'insta-clone-v2';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './assets/app-icon.png',
  './assets/avatar-current.png',
  './assets/post-1.png',
  './assets/post-2.png',
  './assets/story-1.png',
  './assets/reel-1.png',
  './js/state.js',
  './js/app.js',
  './js/feed.js',
  './js/stories.js',
  './js/reels.js',
  './js/messages.js',
  './js/create.js',
  './js/profile.js'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch events
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  
  // Skip caching for API endpoints and new uploaded files
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/uploads')) {
    return; // Use default network behavior
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
