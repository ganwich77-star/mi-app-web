importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBsiG9CByzLlrvGgjctJshIrc2k-Ck1DMM",
    authDomain: "asistente-digital-comuniones.firebaseapp.com",
    projectId: "asistente-digital-comuniones",
    storageBucket: "asistente-digital-comuniones.firebasestorage.app",
    messagingSenderId: "318953930173",
    appId: "1:318953930173:web:25bbcbbca953e978ffa6d4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Mensaje en segundo plano recibido:', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
// Escucha de Notificaciones Estándar (web-push library)
self.addEventListener('push', (event) => {
    if (event.data) {
        const payload = event.data.json();
        const options = {
            body: payload.body,
            icon: '/logo.png',
            badge: '/logo.png',
            data: { url: payload.url || '/' }
        };
        event.waitUntil(self.registration.showNotification(payload.title, options));
    }
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(clients.openWindow(event.notification.data.url));
    }
});
