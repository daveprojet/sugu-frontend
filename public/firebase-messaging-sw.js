// Firebase Messaging Service Worker
// Ce fichier utilise les CDN Firebase (pas de Vite/env vars dans un SW)

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Configuration Firebase (hardcodée car le SW n'a pas accès aux vars d'env Vite)
const firebaseConfig = {
  apiKey: "AIzaSyCIwzz-DKjwmrjpF_5HzPKp9udSnn5EEMI",
  authDomain: "bricolibe-77357.firebaseapp.com",
  projectId: "bricolibe-77357",
  storageBucket: "bricolibe-77357.firebasestorage.app",
  messagingSenderId: "516563757333",
  appId: "1:516563757333:web:e3bc2b6973808ba16a211c",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Notifications reçues en arrière-plan (app fermée ou onglet inactif)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Notification reçue en arrière-plan:', payload);

  const title = payload.data?.title || payload.notification?.title || 'Bricolibe';
  const options = {
    body: payload.data?.body || payload.notification?.body || '',
    icon: '/images/logo.png',
    badge: '/images/logo.png',
    data: payload.data || {},
    tag: payload.data?.tag || 'bricolibe-default',
  };

  self.registration.showNotification(title, options);
});

// Clic sur une notification → ouvrir/focus l'app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
