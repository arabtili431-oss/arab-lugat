const CACHE_NAME = 'arab-lugat-v1';
const FAYLLAR = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(FAYLLAR);
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(nomlar){
      return Promise.all(
        nomlar.filter(function(nom){ return nom !== CACHE_NAME; })
              .map(function(nom){ return caches.delete(nom); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event){
  const url = new URL(event.request.url);

  // Faqat o'zimiz bilan bir domendagi fayllarni keshlaymiz
  // (Firebase, MyMemory kabi tashqi so'rovlar internetdan to'g'ridan-to'g'ri o'tadi)
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(keshdagi){
      if (keshdagi) {
        return keshdagi;
      }
      return fetch(event.request).then(function(javob){
        if (javob && javob.status === 200) {
          const nusxa = javob.clone();
          caches.open(CACHE_NAME).then(function(cache){
            cache.put(event.request, nusxa);
          });
        }
        return javob;
      }).catch(function(){
        return caches.match('./index.html');
      });
    })
  );
});