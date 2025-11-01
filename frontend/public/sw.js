const SW_VERSION = 'v4-' + (self.crypto && crypto.randomUUID ? crypto.randomUUID().slice(0,8) : Date.now());
const CACHE_RUNTIME = 'runtime-cache-v4';
const CACHE_STATIC = 'static-cache-v4';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => cache.addAll(CORE_ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => ![CACHE_STATIC, CACHE_RUNTIME].includes(n)).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

// Network strategies
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // HTML: network-first
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_STATIC).then(c => c.put('/', copy)).catch(()=>{});
        return resp;
      }).catch(() => caches.match(req).then(r => r || caches.match('/index.html')))
    );
    return;
  }

  // Static hashed assets: cache-first
  if (url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(resp => {
        if (resp && resp.status === 200) {
          const copy = resp.clone();
          caches.open(CACHE_RUNTIME).then(c => c.put(req, copy)).catch(()=>{});
        }
        return resp;
      }).catch(() => cached))
    );
    return;
  }

  // Default: cache falling back to network
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      if (resp && resp.status === 200 && resp.type === 'basic') {
        const copy = resp.clone();
        caches.open(CACHE_RUNTIME).then(c => c.put(req, copy)).catch(()=>{});
      }
      return resp;
    }).catch(() => cached))
  );
});

// Push notifications
self.addEventListener('push', event => {
  let data = {};
  try { if (event.data) data = JSON.parse(event.data.text()); } catch(e) { data = { title: 'Notification', body: event.data && event.data.text() }; }
  let title = data.title || 'US';
  if (data.type === 'reminder_created' && !data.title) title = 'Nouveau rappel';
  if (data.type === 'wishlist_created') title = 'Nouvel item wishlist';
  const options = {
    body: data.body || (data.type === 'wishlist_created' ? 'Nouvel item ajouté' : 'Nouvelle activité'),
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data,
    vibrate: [80,40,80],
    actions: [
      { action: 'open', title: 'Ouvrir', icon: '/favicon.ico' },
      { action: 'close', title: 'Fermer', icon: '/favicon.ico' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification && event.notification.data && event.notification.data.url) || '/';
  if (event.action === 'close') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        const clientUrl = new URL(client.url);
        if (clientUrl.pathname === url || url === '/') {
          client.focus();
          return;
        }
      }
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event?.data?.type === 'SKIP_WAITING') self.skipWaiting();
});


