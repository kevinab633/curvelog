const CACHE_NAME = 'curvelog-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

const VIDEO_ASSETS = [
  '/glute-bridge.mp4',
  '/step-up.mp4',
  '/cable-kickback.mp4',
  '/side-lying-leg-lift.mp4',
  '/bodyweight-squat.mp4',
  '/stomach-vacuum.mp4',
  '/clamshell.mp4',
  '/seated-hip-abduction.mp4',
  '/bulgarian-split-squat.mp4',
  '/standing-cable-abduction.mp4',
  '/glute-bridge-band.mp4',
  '/hip-thrust.mp4',
  '/leg-press.mp4',
  '/walking-lunge.mp4',
  '/donkey-kick.mp4',
  '/sumo-squat.mp4',
  '/wall-angel.mp4',
  '/pelvic-tilt.mp4',
  '/push-up.mp4',
  '/seated-cable-row.mp4',
  '/face-pull.mp4',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // For API routes, always use network
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For videos, use cache-first strategy
  if (VIDEO_ASSETS.some((v) => url.pathname === v)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // For everything else: network first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
