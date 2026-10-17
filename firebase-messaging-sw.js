importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBIiA-JYDCM8Wum1FymaTjrQYvafg61iTo",
  authDomain: "forest-shield-syria.firebaseapp.com",
  projectId: "forest-shield-syria",
  storageBucket: "forest-shield-syria.firebasestorage.app",
  messagingSenderId: "882990548445",
  appId: "1:882990548445:web:9336952581fd285d82a234"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || '🚨 تنبيه جديد';
  const notificationOptions = {
    body: payload.notification?.body || 'لديك مهمة جديدة',
    icon: './assets/icon-192.png',
    badge: './assets/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'forest-shield-notification'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
