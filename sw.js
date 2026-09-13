/* Offline, for a revision app that is read on a train.

   Everything here is static and already built, so there is no data to
   reconcile and no freshness problem worth solving cleverly - just two rules.

   An asset under /_assets/ carries a content hash in its name, so it can never
   change meaning: cache it for ever, serve it from there, never ask again. A
   page has no hash, so it is fetched first and the cache is the fallback -
   which means an online reader always sees the current build, and an offline
   one sees every page they have already opened.

   Nothing is precached beyond the shell. There are five hundred pages and most
   of a revision session touches a dozen; downloading the course on the chance
   you go offline would cost more than it ever saves. What you have read is
   what you keep. */

const VERSION = 'ce-1';
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;

/* The least that has to be there for an offline start: the home page and the
   thing that explains itself when a page was never visited. */
const SHELL = ['/', '/offline/'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PAGES)
      .then(cache => cache.addAll(SHELL))
      /* a shell that will not fetch must not wedge the install: the rules
         below still work, they just have nothing to fall back on yet */
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => !n.startsWith(VERSION)).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

const isAsset = (url) => url.pathname.startsWith('/_assets/') || url.pathname === '/favicon.svg';
const isPage = (request) => request.mode === 'navigate'
  || (request.headers.get('accept') ?? '').includes('text/html');

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isAsset(url)) {
    event.respondWith(
      caches.match(request).then(hit => hit ?? fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          void caches.open(ASSETS).then(c => c.put(request, copy));
        }
        return response;
      }))
    );
    return;
  }

  if (isPage(request)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(PAGES).then(c => c.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request)
          .then(hit => hit ?? caches.match('/offline/'))
          .then(hit => hit ?? new Response('Offline, and this page was never opened here.',
            { status: 503, headers: { 'content-type': 'text/plain' } })))
    );
    return;
  }

  /* everything else - the search index, mostly. Cached when it arrives, served
     from the cache when there is nothing to arrive. */
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          void caches.open(ASSETS).then(c => c.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then(hit => hit ?? Response.error()))
  );
});
