const CACHE_NAME = "jm-fluxo-operacional-v29-motorista-cache-clean";
const CURRENT_VERSION = "jm-fluxo-operacional-v29-motorista-cache-clean";
const OLD_VERSION_RE = /jm-fluxo-operacional-v2[1-8][^&?#"']*/i;
const ASSETS = [
  "./",
  "./index.html",
  "./jm.html",
  "./formulario.html",
  "./motorista.html",
  "./superadmin.html",
  "./cliente-chamado.html",
  "./relatorio.html",
  "./manifest.json",
  "./version.json",
  "./css/style.css",
  "./js/config.firebase.js",
  "./js/utils.js",
  "./js/firebase.js",
  "./js/tracker.js",
  "./js/google-maps.js",
  "./js/insurance-parser.js",
  "./js/mapa.js",
  "./js/toll-plazas.js",
  "./js/app.js",
  "./js/motorista.js",
  "./js/superadmin.js",
  "./css/final-ux.css",
  "./js/final-ux.js",
  "./js/motorista-final-ux.js",
  "./js/motorista-simple-flow.js",
  "./js/superadmin-public-config.js",
  "./assets/icon.svg"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => null));
});
async function purgeOldVersionEntries() {
  const keys = await caches.keys();
  await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  await Promise.all(requests.map((request) => {
    const url = request && request.url || "";
    if (OLD_VERSION_RE.test(url) && !url.includes(CURRENT_VERSION)) return cache.delete(request);
    return Promise.resolve(false);
  }));
}

function shouldCacheRequest(request) {
  const url = new URL(request.url);
  const version = url.searchParams.get("v") || "";
  if (version && version !== CURRENT_VERSION) return false;
  if (OLD_VERSION_RE.test(url.href) && !url.href.includes(CURRENT_VERSION)) return false;
  return true;
}

self.addEventListener("activate", (event) => {
  event.waitUntil(
    purgeOldVersionEntries().then(() => self.clients.claim())
  );
});

function isHtmlOrCode(request) {
  const url = new URL(request.url);
  return request.mode === "navigate" || /\.(html|js|css|json)$/i.test(url.pathname);
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (isHtmlOrCode(event.request)) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then((response) => {
          const copy = response.clone();
          if (shouldCacheRequest(event.request)) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => null);
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        if (shouldCacheRequest(event.request)) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => null);
        }
        return response;
      });
    })
  );
});


self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data && event.data.type === "PURGE_OLD_CACHES") {
    event.waitUntil(purgeOldVersionEntries());
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification && event.notification.data && event.notification.data.url || "motorista.html";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        const url = new URL(client.url);
        if (url.pathname.endsWith("/motorista.html") || url.pathname.endsWith("motorista.html")) {
          client.focus();
          if (client.navigate) return client.navigate(targetUrl);
          return client;
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
      return null;
    })
  );
});
