'use strict';

// Offline-Speicher für die installierte App: online immer die neueste Version holen,
// ohne Netz (oder wenn es zu lange dauert) aus dem Speicher spielen.
const CACHE = 'nolimit-v2';
const NETWORK_TIMEOUT_MS = 3000;
const FILES = [
  './',
  './index.html',
  './style.css',
  './logos.js',
  './game.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const fresh = fetch(request, { cache: 'no-cache' }).then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    });
    fresh.catch(() => {});
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), NETWORK_TIMEOUT_MS));
    try {
      return await Promise.race([fresh, timeout]);
    } catch {
      const cached = await cache.match(request, { ignoreSearch: true });
      return cached || fresh;
    }
  }));
});
