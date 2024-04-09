const pwaCache = 'meo_1';
const urlcache = [
    '/',
    'index.html',
    'script.js',
    'markdown.js',
    'styles.css',
    'fonts.css'
  ];
  
  self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(pwaCache)
        .then(cache => {
          console.log('Cache opened');
          return cache.addAll(urlcache);
        })
    );
  });

  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request);
        })
    );
  });
  