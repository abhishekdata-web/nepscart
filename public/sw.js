const cacheName = 'v3';

const cacheAssets = [
    '/',
    '/offline',
    '/shop/men/all',
    '/shop/women/all',
    '/shop/accessories/all',
    '/user-login',

    '/css/style.css',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css',
    'https://code.jquery.com/jquery-3.4.1.min.js',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js',

    '/img/static/banner-mob.jpg',
    '/img/static/men.jpg',
    '/img/static/women.jpg',
    '/img/static/beauty.jpg',
    '/img/static/jwellery.jpg',
    '/img/register-offer.webp',

    '/img/icon/search-black.svg',
    '/img/heart.svg',
    '/img/icon/profile-nav.svg',
    '/img/logo.svg',
    '/img/icon/arrow-white.svg',
    '/img/loader.svg',
    '/img/loading.svg',
    '/img/icon/filter.svg',
    '/img/icon/shopping-bag.svg',
    '/img/icon/help.svg'
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