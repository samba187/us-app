const SW_VERSION = 'v3-' + (self.crypto && crypto.randomUUID ? crypto.randomUUID().slice(0,8) : Date.now());
const CACHE_RUNTIME = 'runtime-cache';
const CACHE_STATIC = 'static-cache-v3';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      return cache.addAll(CORE_ASSETS).catch(err => {
        console.log('[SW] Precache error', err);
      });
    })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter(n => ![CACHE_STATIC, CACHE_RUNTIME].includes(n)).map(n => caches.delete(n)));
      clients.claim();
    })()
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  // Network-first for HTML (avoid serving stale blank)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_STATIC).then(c => c.put('/', copy));
        return resp;
      }).catch(() => caches.match(req).then(r => r || caches.match('/index.html')))
    );
    return;
  }

  // Cache-first for static hashed assets
  if (url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(resp => {
        if (resp && resp.status === 200) {
          const copy = resp.clone();
            caches.open(CACHE_RUNTIME).then(c => c.put(req, copy));
        }
        return resp;
      }).catch(() => cached))
    );
    return;
  }

  // Default: try cache then network
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      if (resp && resp.status === 200 && resp.type === 'basic') {
        const copy = resp.clone();
        caches.open(CACHE_RUNTIME).then(c => c.put(req, copy));
      }
      return resp;
    }))
  );
});

// Gestion des notifications push
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

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const data = event.notification.data || {};
  let target = '/';
  if (data.type === 'reminder_created') target = '/reminders';
  if (data.url) target = data.url;
  if (event.action === 'close') return;
  event.waitUntil(clients.openWindow(target));
});
