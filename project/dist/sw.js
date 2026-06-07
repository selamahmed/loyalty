// Service Worker for push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.message || '',
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      tag: data.tag || 'notification',
      requireInteraction: data.requireInteraction || false,
      data: {
        url: data.url || '/',
        notificationId: data.notificationId,
      },
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Notification', options)
    );
  } catch (error) {
    console.error('Push notification error:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window with the target URL
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if no matching window is open
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});

// Keep service worker alive
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
});
