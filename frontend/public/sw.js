const CACHE_PREFIX = 'sponsor-crm-pwa-';
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/images/sponsor-login-hero-art.png',
];

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(APP_SHELL);

  const response = await fetch('/', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Unable to precache the app shell (${response.status})`);
  }

  const html = await response.text();
  const assetUrls = Array.from(
    html.matchAll(/(?:src|href)=["']([^"']+)["']/g),
    (match) => new URL(match[1], self.location.origin)
  )
    .filter(
      (url) =>
        url.origin === self.location.origin &&
        url.pathname.startsWith('/assets/')
    )
    .map((url) => url.href);

  if (assetUrls.length) {
    await cache.addAll([...new Set(assetUrls)]);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheAppShell());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname === '/api' ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    );
    return;
  }

  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(request).then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(request, responseToCache)
            );
          }

          return response;
        });
      })
    );
  }
});
