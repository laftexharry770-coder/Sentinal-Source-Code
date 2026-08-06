/* ==========================================================================
   service-worker.js — keeps the site usable when the network is not.

   Once a customer has opened the site, it stays on their phone: the catalogue
   loads instantly on repeat visits, and it still opens on a bad matatu
   connection or with no data at all. That is what makes the "Install app"
   button and the offline behaviour work.

   Prices and stock (data.js) are always fetched fresh when there is a signal,
   so a customer never sees yesterday's price on a phone that has been here
   before. The cached copy is only used when the network fails.

   Bump CACHE_VERSION whenever you upload changed files — that is what tells
   every phone to fetch the new version instead of serving the old one. Keep
   BUILD in app.js on the same number; the Manage panel shows it, so you can
   see which version a phone is actually running.
   ========================================================================== */

const CACHE_VERSION = 'homcom-v11';
const SHELL = [
  './',
  './index.html',
  './assets/css/styles.css',
  './assets/js/data.js',
  './assets/js/app.js',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      // addAll fails the whole install if one file 404s; add them individually
      // so a missing optional asset can never break the install. `reload` skips
      // the browser's own cache, so a new version never precaches an old file.
      .then((cache) => Promise.all(SHELL.map((url) =>
        cache.add(new Request(url, { cache: 'reload' })).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;   // let maps and fonts go to the network

  // The catalogue itself and the pages that show it: always ask the network
  // first, so a price changed this morning is the price a returning customer
  // sees this afternoon. The cached copy is the fallback, not the default.
  const isCatalogue = /\/data\.js(\?|$)/.test(url.pathname + url.search);
  if (request.mode === 'navigate' || isCatalogue) {
    // For the catalogue, go past the browser's own HTTP cache as well. Without
    // this a phone can sit on a stale — or broken — copy for as long as the
    // cache headers say, no matter how many times the customer pulls to
    // refresh. Navigations can't be re-created this way, so they go as they are.
    const live = isCatalogue ? fetch(request, { cache: 'reload' }) : fetch(request);
    event.respondWith(
      live
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }

  // Everything else: serve from cache immediately, refresh it in the background.
  event.respondWith(
    caches.match(request).then((hit) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => hit);
      return hit || network;
    })
  );
});
