/* ============================================================
   File-backed JSON datastore.
   Zero external dependencies — perfect for "just deploy".
   For higher load, swap this module for a real database; the
   public interface (getConfig/saveConfig/...) stays the same.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const auth = require('./auth');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_CONFIG = {
  name: 'Luiz-Tech Shop',
  tagline: 'Egyedi webshop, percek alatt testreszabva.',
  accent: '#38e1ff',
  accent2: '#6c7bff',
  theme: 'dark',
  currency: 'Ft',
  heroTitle: 'Technológia, ami magáért beszél',
  heroText: 'Válogass kézzel összeállított kínálatunkból — gyors kiszállítás, megbízható minőség.',
  freeShippingOver: 25000
};

const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'Webfejlesztői csomag', desc: 'Egyedi weboldal a koncepciótól az élesítésig.', price: 149000, category: 'Szolgáltatás', emoji: '🌐' },
  { id: 'p2', name: 'Webshop indító csomag', desc: 'Teljes e-commerce megoldás fizetési integrációval.', price: 249000, category: 'Szolgáltatás', emoji: '🛒' },
  { id: 'p3', name: 'Kiberbiztonsági audit', desc: 'Sérülékenység-vizsgálat és biztonsági jelentés.', price: 89000, category: 'Biztonság', emoji: '🛡️' },
  { id: 'p4', name: 'Adatmentési megoldás', desc: 'Automatikus, ütemezett biztonsági mentés beüzemelve.', price: 59000, category: 'Üzemeltetés', emoji: '💾' },
  { id: 'p5', name: 'Hálózat optimalizálás', desc: 'Wi-Fi és vezetékes hálózat felmérése és hangolása.', price: 69000, category: 'Üzemeltetés', emoji: '📡' },
  { id: 'p6', name: 'SEO indító csomag', desc: 'Keresőoptimalizálás, technikai audit és kulcsszókutatás.', price: 79000, category: 'Marketing', emoji: '📈' }
];

let db = null;

function defaults() {
  const admin = auth.hashPassword(process.env.ADMIN_PASS || 'luiztech');
  return {
    config: Object.assign({}, DEFAULT_CONFIG),
    products: DEFAULT_PRODUCTS.map((p) => Object.assign({}, p)),
    admin: {
      user: process.env.ADMIN_USER || 'admin',
      salt: admin.salt,
      hash: admin.hash
    },
    users: [],
    orders: []
  };
}

function load() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(DB_FILE)) {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      // backfill any new default fields
      db.config = Object.assign({}, DEFAULT_CONFIG, db.config || {});
      db.products = db.products || [];
      db.users = db.users || [];
      db.orders = db.orders || [];
    } else {
      db = defaults();
      persist();
      console.log('[db] Initialised new datastore at', DB_FILE);
    }
  } catch (e) {
    console.error('[db] Failed to load, using defaults:', e.message);
    db = defaults();
  }
  return db;
}

function persist() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE); // atomic replace
}

function ensure() { if (!db) load(); return db; }

/* ---------- Config / products ---------- */
function getPublicShop() {
  ensure();
  return Object.assign({}, db.config, { products: db.products });
}

function getConfig() {
  ensure();
  return Object.assign({}, db.config, { products: db.products });
}

const ALLOWED_CONFIG = ['name', 'tagline', 'accent', 'accent2', 'theme', 'currency', 'heroTitle', 'heroText', 'freeShippingOver'];

function sanitizeProduct(p, fallbackId) {
  let image = String(p.image || '').slice(0, 300);
  // only allow our own uploaded paths or http(s) urls
  if (image && !/^(\/uploads\/|https?:\/\/)/.test(image)) image = '';
  return {
    id: String(p.id || fallbackId || ('p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6))),
    name: String(p.name || '').slice(0, 120),
    desc: String(p.desc || '').slice(0, 600),
    price: Math.max(0, Math.round(Number(p.price) || 0)),
    category: String(p.category || '').slice(0, 60),
    emoji: String(p.emoji || '📦').slice(0, 8),
    image: image
  };
}

function saveConfig(incoming) {
  ensure();
  const next = Object.assign({}, db.config);
  ALLOWED_CONFIG.forEach((k) => {
    if (incoming[k] !== undefined && incoming[k] !== null) next[k] = incoming[k];
  });
  next.freeShippingOver = Math.max(0, Math.round(Number(next.freeShippingOver) || 0));
  next.theme = next.theme === 'light' ? 'light' : 'dark';
  next.currency = String(next.currency || 'Ft').slice(0, 6);
  db.config = next;

  if (Array.isArray(incoming.products)) {
    db.products = incoming.products
      .filter((p) => p && String(p.name || '').trim())
      .map((p) => sanitizeProduct(p));
  }
  persist();
  return getConfig();
}

function resetAll() {
  ensure();
  db.config = Object.assign({}, DEFAULT_CONFIG);
  db.products = DEFAULT_PRODUCTS.map((p) => Object.assign({}, p));
  persist();
  return getConfig();
}

/* ---------- Admin account ---------- */
function getAdminUser() { ensure(); return db.admin.user; }

function checkLogin(user, pass) {
  ensure();
  if (user !== db.admin.user) return false;
  return auth.verifyPassword(pass, db.admin.salt, db.admin.hash);
}

function setCredentials(user, pass) {
  ensure();
  if (user && String(user).trim()) db.admin.user = String(user).trim().slice(0, 60);
  if (pass) {
    const h = auth.hashPassword(pass);
    db.admin.salt = h.salt;
    db.admin.hash = h.hash;
  }
  persist();
  return { user: db.admin.user };
}

/* ---------- Customer accounts ---------- */
function publicUser(u) { return u ? { id: u.id, name: u.name, email: u.email } : null; }

function findUserByEmail(email) {
  ensure();
  const e = String(email || '').trim().toLowerCase();
  return db.users.filter((u) => u.email.toLowerCase() === e)[0] || null;
}

function getUserById(id) {
  ensure();
  return db.users.filter((u) => u.id === id)[0] || null;
}

function registerUser(name, email, pass) {
  ensure();
  email = String(email || '').trim();
  name = String(name || '').trim();
  if (!name) return { error: 'A név megadása kötelező.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Érvénytelen e-mail cím.' };
  if (String(pass || '').length < 6) return { error: 'A jelszó legalább 6 karakter legyen.' };
  if (findUserByEmail(email)) return { error: 'Ezzel az e-mail címmel már van fiók.' };
  const h = auth.hashPassword(pass);
  const user = {
    id: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: name.slice(0, 120),
    email: email.slice(0, 160),
    salt: h.salt,
    hash: h.hash,
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  persist();
  return { user: publicUser(user) };
}

function loginUser(email, pass) {
  const u = findUserByEmail(email);
  if (!u) return null;
  if (!auth.verifyPassword(pass, u.salt, u.hash)) return null;
  return publicUser(u);
}

/* ---------- Orders ---------- */
function createOrder(payload, user) {
  ensure();
  const byId = {};
  db.products.forEach((p) => { byId[p.id] = p; });
  const items = (Array.isArray(payload.items) ? payload.items : [])
    .map((it) => {
      const p = byId[it.id];
      if (!p) return null;
      const qty = Math.max(1, Math.round(Number(it.qty) || 1));
      return { id: p.id, name: p.name, price: p.price, qty: qty };
    })
    .filter(Boolean);
  if (!items.length) return null;
  const total = items.reduce((s, it) => s + it.price * it.qty, 0);
  const order = {
    id: 'ORD-' + Date.now().toString(36).toUpperCase(),
    items: items,
    total: total,
    userId: user ? user.id : null,
    customer: {
      name: String((user && user.name) || (payload.customer && payload.customer.name) || '').slice(0, 120),
      email: String((user && user.email) || (payload.customer && payload.customer.email) || '').slice(0, 160)
    },
    createdAt: new Date().toISOString()
  };
  db.orders.unshift(order);
  if (db.orders.length > 1000) db.orders.length = 1000;
  persist();
  return order;
}

function getOrders() { ensure(); return db.orders; }
function getOrdersByUser(userId) { ensure(); return db.orders.filter((o) => o.userId === userId); }

module.exports = {
  load,
  getPublicShop,
  getConfig,
  saveConfig,
  resetAll,
  getAdminUser,
  checkLogin,
  setCredentials,
  registerUser,
  loginUser,
  getUserById,
  createOrder,
  getOrders,
  getOrdersByUser,
  DEFAULT_CONFIG,
  DEFAULT_PRODUCTS
};
