self.addEventListener('install', function(event) {
  console.log('Service Worker o\'rnatildi');
});

self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});