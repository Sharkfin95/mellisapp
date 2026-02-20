/* Enkel offline-cache för MellisApp */
const CACHE_NAME = 'mellisapp-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
  // Lägg till './assets/icon-192.png', './assets/icon-512.png' när de finns
];

// Installera och cacha basfiler
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Aktivera & rensa gamla cachar om versionsnamnet ändrats
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())))
    )
  );
  self.clients.claim();
});

// Network-first för navigering, annars cache-first för statiska filer
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // För sidnavigering: försök nätverk först, fallback cache
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // För övriga: cache först, annars nät
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});