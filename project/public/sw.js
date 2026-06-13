/* NexReward service worker — push notifications */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload = { title: 'NexReward', body: 'Yeni bildirim' };
  try {
    payload = event.data.json();
  } catch {
    payload.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/assets/icons/logo.png',
      badge: '/assets/icons/logo.png',
      data: payload.data ?? {},
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('/#/notifications');
    }),
  );
});
