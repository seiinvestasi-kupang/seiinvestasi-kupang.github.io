/* Service worker sederhana: menyimpan "kerangka" aplikasi supaya bisa dibuka
   walau sinyal lemah. Data monitoring tetap selalu diambil langsung dari server. */
const CACHE = 'ipp-kupang-v1';
const FILES = ['./', './index.html', './manifest.webmanifest',
               './icons/icon-192.png', './icons/icon-512.png',
               './icons/maskable-192.png', './icons/maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* Hanya file aplikasi ini sendiri yang di-cache; halaman Google tidak disentuh. */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { const salin = r.clone(); caches.open(CACHE).then(c => c.put(e.request, salin)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
