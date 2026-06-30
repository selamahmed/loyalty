import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'http://localhost:5173';
const vus = Number(__ENV.VUS || 100);
const duration = __ENV.DURATION || '2m';

export const options = {
  scenarios: {
    public_pages: {
      executor: 'constant-vus',
      vus,
      duration,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<800'],
  },
};

const pages = [
  '/',
  '/#/login',
  '/#/register',
  '/#/home',
  '/#/shop',
  '/#/leaderboard',
  '/#/games',
  '/#/inventory',
];

export default function () {
  const page = pages[Math.floor(Math.random() * pages.length)];
  const res = http.get(`${baseUrl}${page}`, {
    tags: { page },
  });

  check(res, {
    'status is 200': r => r.status === 200,
    'html returned': r => String(r.body || '').includes('<!doctype html>') || String(r.body || '').includes('<div id="root">'),
  });

  sleep(Math.random() * 2 + 0.5);
}
