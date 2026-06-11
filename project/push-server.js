import express from 'express';
import webpush from 'web-push';
import cors from 'cors';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Replit autoscale injects PORT; use that to detect production
const isProd = !!process.env.PORT;

const app  = express();
const PORT = process.env.PORT || process.env.PUSH_PORT || 3001;

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
  console.warn('[push-server] VAPID keys not set — push notifications disabled.');
}

const subscriptions = new Map();

/* ─── Broadcast helper ─── */
async function broadcastToAll(title, message, url = '/', tag = 'broadcast') {
  if (!pushEnabled || subscriptions.size === 0) return { sent: 0, failed: 0, skipped: !pushEnabled };

  const payload = JSON.stringify({ title, message, url, tag, requireInteraction: false });
  const dead = [];

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
  console.log(`[push] Broadcast — sent:${sent} failed:${failed} expired:${dead.length}`);
  return { sent, failed, expired: dead.length };
}

/* ─── Daily notification scheduler ─── */
const DAILY_NOTIFICATIONS = [
  { hour: 10, minute: 0,  title: '☀️ Günaydın!',             message: 'Bugünkü görevlerin seni bekliyor. Puan kazan!',              url: '/missions', tag: 'daily-morning' },
  { hour: 18, minute: 0,  title: '⭐ Günlük hatırlatma',      message: 'Bugün henüz giriş yapmadıysan puanlarını kaybedebilirsin!', url: '/app',      tag: 'daily-evening' },
  { hour: 20, minute: 30, title: '🎁 Akşam özel fırsatı',    message: 'Bu gece sınırlı süreli 2x puan etkinliği aktif!',           url: '/shop',     tag: 'daily-night'   },
];

function msUntil(hour, minute) {
  const now  = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next - now;
}

function scheduleDailyNotification({ hour, minute, title, message, url, tag }) {
  const delay = msUntil(hour, minute);
  const hhmm  = `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;
  console.log(`[push-scheduler] "${title}" scheduled in ${Math.round(delay/60000)} min (fires daily at ${hhmm})`);

  setTimeout(async () => {
    console.log(`[push-scheduler] Firing daily notification: ${title}`);
    await broadcastToAll(title, message, url, tag);
    setInterval(() => broadcastToAll(title, message, url, tag), 24 * 60 * 60 * 1000);
  }, delay);
}

DAILY_NOTIFICATIONS.forEach(n => scheduleDailyNotification(n));

/* ─── Health check (required by Replit autoscale) ─── */
app.get('/health', (_req, res) => res.status(200).send('ok'));

/* ─── API routes ─── */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', subscribers: subscriptions.size, pushEnabled, scheduledNotifications: DAILY_NOTIFICATIONS.length });
});

app.post('/api/subscribe', (req, res) => {
  if (!pushEnabled) return res.status(503).json({ error: 'Push notifications not configured' });
  const sub = req.body;
  if (!sub?.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
  subscriptions.set(sub.endpoint, sub);
  console.log(`[push] Subscribed: ${sub.endpoint.slice(-30)} — total: ${subscriptions.size}`);
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
  const result = await broadcastToAll(title, message, url, tag);
  res.json(result);
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

app.post('/api/trigger-daily', async (req, res) => {
  const { index = 0 } = req.body;
  const n = DAILY_NOTIFICATIONS[index];
  if (!n) return res.status(404).json({ error: 'Notification index not found' });
  const result = await broadcastToAll(n.title, n.message, n.url, n.tag);
  res.json({ triggered: n.title, ...result });
});

/* ─── Serve static frontend in production ─── */
if (isProd) {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[push-server] Running on port ${PORT} — pushEnabled:${pushEnabled} — ${DAILY_NOTIFICATIONS.length} daily notifications scheduled — mode:${isProd ? 'production' : 'development'}`);
});
