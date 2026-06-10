import express from 'express';
import webpush from 'web-push';
import cors from 'cors';

const app  = express();
const PORT = process.env.PUSH_PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

const VAPID_PUBLIC_KEY  = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

const pushEnabled = !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

if (pushEnabled) {
  webpush.setVapidDetails(
    'mailto:admin@loyaltyweb.app',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
  );
  console.log('[push-server] VAPID configured — push notifications enabled.');
} else {
  console.warn('[push-server] VAPID keys not set — push notifications disabled. Set VAPID_PRIVATE_KEY secret to enable.');
}

const subscriptions = new Map();

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', subscribers: subscriptions.size, pushEnabled });
});

app.post('/api/subscribe', (req, res) => {
  if (!pushEnabled) return res.status(503).json({ error: 'Push notifications not configured' });
  const sub = req.body;
  if (!sub?.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
  subscriptions.set(sub.endpoint, sub);
  console.log(`[push] Subscribed: ${sub.endpoint.slice(-30)}`);
  res.status(201).json({ message: 'Subscribed', total: subscriptions.size });
});

app.post('/api/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  if (endpoint) subscriptions.delete(endpoint);
  res.json({ message: 'Unsubscribed', total: subscriptions.size });
});

app.post('/api/broadcast', async (req, res) => {
  if (!pushEnabled) return res.status(503).json({ error: 'Push notifications not configured' });
  const { title = 'NexReward', message = '', url = '/', tag = 'broadcast', requireInteraction = false } = req.body;
  if (!message) return res.status(400).json({ error: 'message is required' });

  const payload = JSON.stringify({ title, message, url, tag, requireInteraction });
  const dead    = [];

  const results = await Promise.allSettled(
    [...subscriptions.entries()].map(async ([endpoint, sub]) => {
      try {
        await webpush.sendNotification(sub, payload);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) dead.push(endpoint);
        throw err;
      }
    })
  );

  dead.forEach(ep => subscriptions.delete(ep));

  const sent   = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  console.log(`[push] Broadcast done — sent:${sent} failed:${failed} expired:${dead.length}`);
  res.json({ sent, failed, expired: dead.length });
});

app.post('/api/send', async (req, res) => {
  if (!pushEnabled) return res.status(503).json({ error: 'Push notifications not configured' });
  const { endpoints, title, message, url = '/' } = req.body;
  if (!Array.isArray(endpoints) || !message) {
    return res.status(400).json({ error: 'endpoints[] and message are required' });
  }
  const payload = JSON.stringify({ title, message, url });
  const results = await Promise.allSettled(
    endpoints.map(ep => {
      const sub = subscriptions.get(ep);
      return sub ? webpush.sendNotification(sub, payload) : Promise.reject(new Error('Not found'));
    })
  );
  const sent = results.filter(r => r.status === 'fulfilled').length;
  res.json({ sent, total: endpoints.length });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[push-server] Running on port ${PORT} — pushEnabled:${pushEnabled}`);
});
