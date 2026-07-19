const CACHE_NAME = 'arab-lugat-v2';
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

  // HTML fayllar uchun: avval tarmoqdan (network-first) urinamiz, shunda
  // yangilanishlar darhol ko'rinadi. Faqat internet yo'q bo'lsa keshdan olamiz.
  if (event.request.mode === 'navigate' || url.pathname.endsWith('index.html') || url.pathname === '/' || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request).then(function(javob){
        if (javob && javob.status === 200) {
          const nusxa = javob.clone();
          caches.open(CACHE_NAME).then(function(cache){
            cache.put(event.request, nusxa);
          });
        }
        return javob;
      }).catch(function(){
        return caches.match(event.request).then(function(keshdagi){
          return keshdagi || caches.match('./index.html');
        });
      })
    );
    return;
  }

  // Boshqa fayllar (ikonka, manifest va h.k.) uchun avvalgidek kesh-birinchi
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