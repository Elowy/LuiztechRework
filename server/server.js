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
const uploads = require('./uploads');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');
const COOKIE = 'lt_session';        // admin session
const COOKIE_CUST = 'lt_customer';  // customer session
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

function appendCookie(res, value) {
  const prev = res.getHeader('Set-Cookie');
  if (!prev) res.setHeader('Set-Cookie', value);
  else res.setHeader('Set-Cookie', [].concat(prev, value));
}
function setCookie(req, res, name, token) {
  const parts = [
    name + '=' + token,
    'HttpOnly', 'Path=/', 'SameSite=Lax',
    'Max-Age=' + Math.floor(auth.TOKEN_TTL_MS / 1000)
  ];
  if (isSecure(req)) parts.push('Secure');
  appendCookie(res, parts.join('; '));
}
function clearCookie(req, res, name) {
  const parts = [name + '=', 'HttpOnly', 'Path=/', 'SameSite=Lax', 'Max-Age=0'];
  if (isSecure(req)) parts.push('Secure');
  appendCookie(res, parts.join('; '));
}

/* ---------- auth middleware ---------- */
function requireAuth(req, res, next) {
  const token = parseCookies(req)[COOKIE];
  const payload = auth.verifyToken(token, SECRET);
  if (!payload) return res.status(401).json({ error: 'Bejelentkezés szükséges.' });
  req.user = payload.user;
  next();
}

// resolves the logged-in customer (if any) without blocking the request
function currentCustomer(req) {
  const token = parseCookies(req)[COOKIE_CUST];
  const payload = auth.verifyToken(token, SECRET);
  if (!payload || !payload.uid) return null;
  return db.getUserById(payload.uid);
}
function requireCustomer(req, res, next) {
  const u = currentCustomer(req);
  if (!u) return res.status(401).json({ error: 'Bejelentkezés szükséges.' });
  req.customer = u;
  next();
}

/* ============================================================
   PUBLIC API
   ============================================================ */
app.get('/api/shop', (req, res) => {
  res.json(db.getPublicShop());
});

app.post('/api/orders', (req, res) => {
  const customer = currentCustomer(req); // attach account if logged in
  const result = db.createOrder(req.body || {}, customer);
  if (!result) return res.status(400).json({ error: 'A kosár üres vagy érvénytelen.' });
  if (result.error) return res.status(400).json({ error: result.error });
  res.status(201).json({ ok: true, id: result.order.id, total: result.order.total, status: result.order.status });
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
  setCookie(req, res, COOKIE, token);
  res.json({ ok: true, user: db.getAdminUser() });
});

app.post('/api/auth/logout', (req, res) => {
  clearCookie(req, res, COOKIE);
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
  setCookie(req, res, COOKIE, token);
  res.json({ ok: true, user: result.user });
});

app.get('/api/admin/orders', requireAuth, (req, res) => {
  res.json({ statuses: db.ORDER_STATUSES, orders: db.getOrders() });
});

app.patch('/api/admin/orders/:id', requireAuth, (req, res) => {
  const result = db.updateOrderStatus(req.params.id, (req.body || {}).status);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json({ ok: true, order: result.order });
});

// product image upload (own JSON parser with a larger limit)
app.post('/api/admin/upload', requireAuth, express.json({ limit: '6mb' }), (req, res) => {
  const result = uploads.saveDataUrl((req.body || {}).data);
  if (result.error) return res.status(400).json({ error: result.error });
  res.status(201).json({ ok: true, url: result.url });
});

/* ============================================================
   CUSTOMER ACCOUNTS
   ============================================================ */
app.post('/api/account/register', (req, res) => {
  const { name, email, pass } = req.body || {};
  const result = db.registerUser(name, email, pass);
  if (result.error) return res.status(400).json({ error: result.error });
  const token = auth.signToken({ uid: result.user.id, role: 'customer' }, SECRET);
  setCookie(req, res, COOKIE_CUST, token);
  res.status(201).json({ ok: true, user: result.user });
});

app.post('/api/account/login', (req, res) => {
  const { email, pass } = req.body || {};
  const user = db.loginUser(String(email || ''), String(pass || ''));
  if (!user) return res.status(401).json({ error: 'Hibás e-mail cím vagy jelszó.' });
  const token = auth.signToken({ uid: user.id, role: 'customer' }, SECRET);
  setCookie(req, res, COOKIE_CUST, token);
  res.json({ ok: true, user: user });
});

app.post('/api/account/logout', (req, res) => {
  clearCookie(req, res, COOKIE_CUST);
  res.json({ ok: true });
});

app.get('/api/account/me', (req, res) => {
  const u = currentCustomer(req);
  if (!u) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true, user: { id: u.id, name: u.name, email: u.email } });
});

app.get('/api/account/orders', requireCustomer, (req, res) => {
  res.json(db.getOrdersByUser(req.customer.id));
});

/* ============================================================
   UPLOADED IMAGES + STATIC SITE
   ============================================================ */
app.use('/uploads', express.static(uploads.UPLOAD_DIR, {
  setHeaders: function (res) { res.setHeader('X-Content-Type-Options', 'nosniff'); }
}));

app.use(express.static(ROOT, { extensions: ['html'] }));

app.get('/', (req, res) => res.sendFile(path.join(ROOT, 'index.html')));

// health check for hosting platforms
app.get('/healthz', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log('Luiz-Tech szerver fut:  http://localhost:' + PORT);
  console.log('  Bolt:   /webshop.html');
  console.log('  Admin:  /admin.html  (alapértelmezett: admin / luiztech)');
});
