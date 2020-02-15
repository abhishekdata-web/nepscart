const cacheName = 'v10';

const cacheAssets = [
    '/',
    '/offline',
    '/shop',

    '/css/style.css',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css'
]

// Call install event
self.addEventListener('install', e => {
    console.log('Service Worker: Installed');

    e.waitUntil(
        caches
            .open(cacheName)
            .then(cache => {
                console.log('Service Worker: Caching Files');
                cache.addAll(cacheAssets);
            })
            .then(() => self.skipWaiting())
    )
})

// Activate event
self.addEventListener('activate', e => {
    console.log('Service Worker: Activated');

    //Remove unwanted caches
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if(cache !== cacheName){
                        console.log('Service Worker: Clearing Old Cache');
                        return caches.delete(cache)
                    }
                })
            )
        })
    )
})

//Call fetch event
self.addEventListener('fetch', e => {
    console.log('Service Worker: Fetching');

    e.respondWith(
        caches.match(e.request).then(cacheRes => {
            return cacheRes || fetch(e.request)
        }).catch(() => caches.match('/offline'))
    )
})