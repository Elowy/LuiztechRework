/* ============================================================
   Luiz-Tech — web server
   Serves the static site + the webshop/admin REST API.
   Run: npm start   (Node >= 18)
   ============================================================ */
'use strict';
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const db = require('./db');
const auth = require('./auth');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');
const COOKIE = 'lt_session';
const SECRET = process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === 'production'
    ? crypto.randomBytes(32).toString('hex') // ephemeral if not set (sessions reset on restart)
    : 'luiz-tech-dev-secret');

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  console.warn('[warn] SESSION_SECRET nincs beállítva — minden újraindításkor kiléptet. Állíts be egy állandó értéket!');
}

db.load();

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));

/* ---------- tiny cookie parser ---------- */
function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie;
  if (!raw) return out;
  raw.split(';').forEach((pair) => {
    const i = pair.indexOf('=');
    if (i > -1) out[pair.slice(0, i).trim()] = decodeURIComponent(pair.slice(i + 1).trim());
  });
  return out;
}

function isSecure(req) {
  return req.secure || (req.headers['x-forwarded-proto'] || '').split(',')[0] === 'https';
}

function setSession(req, res, token) {
  const parts = [
    COOKIE + '=' + token,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    'Max-Age=' + Math.floor(auth.TOKEN_TTL_MS / 1000)
  ];
  if (isSecure(req)) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}
function clearSession(req, res) {
  const parts = [COOKIE + '=', 'HttpOnly', 'Path=/', 'SameSite=Lax', 'Max-Age=0'];
  if (isSecure(req)) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

/* ---------- auth middleware ---------- */
function requireAuth(req, res, next) {
  const token = parseCookies(req)[COOKIE];
  const payload = auth.verifyToken(token, SECRET);
  if (!payload) return res.status(401).json({ error: 'Bejelentkezés szükséges.' });
  req.user = payload.user;
  next();
}

/* ============================================================
   PUBLIC API
   ============================================================ */
app.get('/api/shop', (req, res) => {
  res.json(db.getPublicShop());
});

app.post('/api/orders', (req, res) => {
  const order = db.createOrder(req.body || {});
  if (!order) return res.status(400).json({ error: 'A kosár üres vagy érvénytelen.' });
  res.status(201).json({ ok: true, id: order.id, total: order.total });
});

/* ============================================================
   AUTH
   ============================================================ */
app.post('/api/auth/login', (req, res) => {
  const { user, pass } = req.body || {};
  if (!db.checkLogin(String(user || ''), String(pass || ''))) {
    return res.status(401).json({ error: 'Hibás felhasználónév vagy jelszó.' });
  }
  const token = auth.signToken({ user: db.getAdminUser() }, SECRET);
  setSession(req, res, token);
  res.json({ ok: true, user: db.getAdminUser() });
});

app.post('/api/auth/logout', (req, res) => {
  clearSession(req, res);
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const token = parseCookies(req)[COOKIE];
  const payload = auth.verifyToken(token, SECRET);
  if (!payload) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true, user: payload.user });
});

/* ============================================================
   ADMIN API (protected)
   ============================================================ */
app.get('/api/admin/config', requireAuth, (req, res) => {
  res.json(db.getConfig());
});

app.put('/api/admin/config', requireAuth, (req, res) => {
  res.json(db.saveConfig(req.body || {}));
});

app.post('/api/admin/reset', requireAuth, (req, res) => {
  res.json(db.resetAll());
});

app.post('/api/admin/account', requireAuth, (req, res) => {
  const { user, pass } = req.body || {};
  if (!user || !String(user).trim()) return res.status(400).json({ error: 'A felhasználónév kötelező.' });
  const result = db.setCredentials(user, pass);
  // re-issue token in case the username changed
  const token = auth.signToken({ user: result.user }, SECRET);
  setSession(req, res, token);
  res.json({ ok: true, user: result.user });
});

app.get('/api/admin/orders', requireAuth, (req, res) => {
  res.json(db.getOrders());
});

/* ============================================================
   STATIC SITE
   ============================================================ */
app.use(express.static(ROOT, { extensions: ['html'] }));

app.get('/', (req, res) => res.sendFile(path.join(ROOT, 'index.html')));

// health check for hosting platforms
app.get('/healthz', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log('Luiz-Tech szerver fut:  http://localhost:' + PORT);
  console.log('  Bolt:   /webshop.html');
  console.log('  Admin:  /admin.html  (alapértelmezett: admin / luiztech)');
});
