/* HeadSpace · Service Worker
   - hält die App offline verfügbar
   - nimmt geteilte Dateien/Texte an (Android: „Teilen mit … HeadSpace“) */
const CACHE = 'kosmos-v15';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './astro.js', './sky-data.js', './sky.js', './sky-charts.js', './sky-sagas.js', './sky-facts.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('kosmos-notes', 1);
    r.onupgradeneeded = () => { r.result.createObjectStore('kv'); r.result.createObjectStore('shared', { autoIncrement: true }); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
async function saveShared(item) {
  const db = await idb();
  await new Promise((res, rej) => { const tx = db.transaction('shared', 'readwrite'); tx.objectStore('shared').add(item); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
}

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);

  // Share Target
  if (req.method === 'POST' && url.origin === location.origin && url.pathname.endsWith('/share')) {
    e.respondWith((async () => {
      try {
        const fd = await req.formData();
        await saveShared({ title: fd.get('title') || '', text: fd.get('text') || '', url: fd.get('url') || '', files: fd.getAll('files').filter(f => f && f.size) });
      } catch (err) { /* ignorieren */ }
      return Response.redirect(new URL('./?share=1', self.registration.scope).href, 303);
    })());
    return;
  }
  if (req.method !== 'GET') return;
  if (url.hostname === 'api.github.com') return; // Daten nie cachen

  // App selbst: erst Netz, dann Cache (Updates kommen sofort an)
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(r => {
      if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
      return r;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
    return;
  }
  // Schriften & Fotos: Cache zuerst
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname) || /(^|\.)wikimedia\.org$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; })));
  }
});
