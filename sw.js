/* Treino Maria Aline — service worker
   Rede primeiro: sempre busca a versão mais nova do app (ignorando o cache do navegador);
   sem internet, abre a cópia guardada. Para forçar uma nova versão em todos os aparelhos,
   basta trocar o nome em CACHE. */
const CACHE = 'treino-ma-v2';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' }))))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // GitHub API, fontes e vídeos ficam com o navegador
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then(res => {
        if (res && res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then(r =>
          r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)
        )
      )
  );
});
