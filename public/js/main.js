// Make sure service worker are supported
if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
        navigator.serviceWorker
        .register('/sw.js')
        .then(reg => console.log('Service Worker: Registered'))
        .catch(err => console.log(`Service Worker: Error: ${err}`))
    })
}