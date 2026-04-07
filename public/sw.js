// Service Worker untuk SIMPEKA SD PWA
const CACHE_NAME = 'simpeka-sd-v1';
const OFFLINE_URL = '/';

// Asset yang selalu di-cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Hanya handle GET request
  if (event.request.method !== 'GET') return;
  // Jangan cache Firebase / API calls
  const url = new URL(event.request.url);
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache response yang berhasil
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // Offline: kembalikan cache atau halaman utama
        return caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL));
      })
  );
});
