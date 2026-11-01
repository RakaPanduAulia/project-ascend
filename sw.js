// =====================================================================
//  Service Worker — Ascend (Tahap 21: PWA)
//  Tugasnya: simpan file app di cache browser, biar:
//    1. App bisa dibuka walau OFFLINE (cache dulu, baru jaringan).
//    2. Browser nganggap ini "app beneran" -> muncul opsi "Install".
//  Naikkan VERSI tiap ada update file, biar cache lama dibuang.
// =====================================================================
const VERSI = "ascend-v1";
const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon.svg",
];

// Pasang: isi cache dengan file app.
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(VERSI).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting(); // langsung aktif tanpa nunggu tab lama ditutup
});

// Aktif: buang cache versi lama.
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSI).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Ambil: coba cache dulu (cepat & offline), kalau gak ada baru ke jaringan.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request))
  );
});
