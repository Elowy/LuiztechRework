/* ============================================================
   Luiz-Tech Webshop — client data layer
   Talks to the backend API; falls back to localStorage when no
   backend is reachable (so the static demo keeps working).
   Cart stays client-side until checkout.
   ============================================================ */
(function (global) {
  'use strict';

  var CART_KEY = 'luiztech_shop_cart_v1';
  var CONFIG_KEY = 'luiztech_shop_config_v1';   // fallback only
  var CRED_KEY = 'luiztech_admin_cred_v1';      // fallback only
  var AUTH_KEY = 'luiztech_admin_session_v1';   // fallback only

  var DEFAULT_CONFIG = {
    name: 'Luiz-Tech Shop',
    tagline: 'Egyedi webshop, percek alatt testreszabva.',
    accent: '#38e1ff',
    accent2: '#6c7bff',
    theme: 'dark',
    currency: 'Ft',
    heroTitle: 'Technológia, ami magáért beszél',
    heroText: 'Válogass kézzel összeállított kínálatunkból — gyors kiszállítás, megbízható minőség.',
    freeShippingOver: 25000,
    products: [
      { id: 'p1', name: 'Webfejlesztői csomag', desc: 'Egyedi weboldal a koncepciótól az élesítésig.', price: 149000, category: 'Szolgáltatás', emoji: '🌐' },
      { id: 'p2', name: 'Webshop indító csomag', desc: 'Teljes e-commerce megoldás fizetési integrációval.', price: 249000, category: 'Szolgáltatás', emoji: '🛒' },
      { id: 'p3', name: 'Kiberbiztonsági audit', desc: 'Sérülékenység-vizsgálat és biztonsági jelentés.', price: 89000, category: 'Biztonság', emoji: '🛡️' },
      { id: 'p4', name: 'Adatmentési megoldás', desc: 'Automatikus, ütemezett biztonsági mentés beüzemelve.', price: 59000, category: 'Üzemeltetés', emoji: '💾' },
      { id: 'p5', name: 'Hálózat optimalizálás', desc: 'Wi-Fi és vezetékes hálózat felmérése és hangolása.', price: 69000, category: 'Üzemeltetés', emoji: '📡' },
      { id: 'p6', name: 'SEO indító csomag', desc: 'Keresőoptimalizálás, technikai audit és kulcsszókutatás.', price: 79000, category: 'Marketing', emoji: '📈' }
    ]
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function readJSON(k, f) { try { var r = localStorage.getItem(k); return r ? JSON.parse(r) : f; } catch (e) { return f; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }

  /* ---------- API helper ---------- */
  var backendUp = null; // null = unknown, true/false once probed
  function api(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    opts.credentials = 'same-origin';
    if (opts.body && typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
    return fetch(path, opts).then(function (res) {
      backendUp = true;
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) { var err = new Error(data.error || ('HTTP ' + res.status)); err.status = res.status; throw err; }
        return data;
      });
    }).catch(function (e) {
      // network/parse failure → backend considered down (unless it was an HTTP error)
      if (e.status === undefined) backendUp = false;
      throw e;
    });
  }

  /* ============================================================
     LOCAL fallback implementations
     ============================================================ */
  var Local = {
    getConfig: function () {
      var saved = readJSON(CONFIG_KEY, null);
      if (!saved) return clone(DEFAULT_CONFIG);
      var merged = clone(DEFAULT_CONFIG);
      Object.keys(saved).forEach(function (k) { merged[k] = saved[k]; });
      return merged;
    },
    saveConfig: function (cfg) { writeJSON(CONFIG_KEY, cfg); return Local.getConfig(); },
    reset: function () { localStorage.removeItem(CONFIG_KEY); return clone(DEFAULT_CONFIG); },
    cred: function () { return readJSON(CRED_KEY, { user: 'admin', pass: 'luiztech' }); },
    login: function (u, p) { var c = Local.cred(); if (u === c.user && p === c.pass) { sessionStorage.setItem(AUTH_KEY, '1'); return true; } return false; },
    logout: function () { sessionStorage.removeItem(AUTH_KEY); },
    isLoggedIn: function () { return sessionStorage.getItem(AUTH_KEY) === '1'; },
    setCred: function (u, p) { var c = Local.cred(); writeJSON(CRED_KEY, { user: u || c.user, pass: p || c.pass }); return { user: u || c.user }; }
  };

  /* ============================================================
     CART (always client-side)
     ============================================================ */
  function getCart() { return readJSON(CART_KEY, {}); }
  function saveCart(c) { return writeJSON(CART_KEY, c); }
  function cartCount(c) { c = c || getCart(); return Object.keys(c).reduce(function (n, k) { return n + c[k]; }, 0); }
  function cartTotal(c, cfg) {
    c = c || getCart();
    var byId = {};
    (cfg && cfg.products ? cfg.products : []).forEach(function (p) { byId[p.id] = p; });
    return Object.keys(c).reduce(function (s, id) { return s + (byId[id] ? byId[id].price * c[id] : 0); }, 0);
  }

  /* ============================================================
     PUBLIC ASYNC API (with fallback)
     ============================================================ */
  function getShop() {
    return api('/api/shop').catch(function () { return Local.getConfig(); });
  }
  function getConfig() {
    return api('/api/admin/config').catch(function (e) {
      if (e.status === 401) throw e;          // real auth error → propagate
      return Local.getConfig();               // backend down → local
    });
  }
  function saveConfig(cfg) {
    return api('/api/admin/config', { method: 'PUT', body: cfg }).catch(function (e) {
      if (e.status) throw e;
      return Local.saveConfig(cfg);
    });
  }
  function resetConfig() {
    return api('/api/admin/reset', { method: 'POST' }).catch(function (e) {
      if (e.status) throw e;
      return Local.reset();
    });
  }
  function login(user, pass) {
    return api('/api/auth/login', { method: 'POST', body: { user: user, pass: pass } })
      .then(function () { return true; })
      .catch(function (e) {
        if (e.status === 401) return false;     // wrong credentials
        return Local.login(user, pass);         // backend down → local demo
      });
  }
  function logout() {
    Local.logout();
    return api('/api/auth/logout', { method: 'POST' }).catch(function () { return { ok: true }; });
  }
  function me() {
    return api('/api/auth/me')
      .then(function (d) { return !!d.authenticated; })
      .catch(function (e) {
        if (e.status === 401) return false;
        return Local.isLoggedIn();
      });
  }
  function setCredentials(user, pass) {
    return api('/api/admin/account', { method: 'POST', body: { user: user, pass: pass } })
      .catch(function (e) { if (e.status) throw e; return Local.setCred(user, pass); });
  }
  function getOrders() {
    return api('/api/admin/orders').catch(function (e) { if (e.status === 401) throw e; return { statuses: [], orders: [] }; });
  }
  function updateOrderStatus(id, status) {
    return api('/api/admin/orders/' + encodeURIComponent(id), { method: 'PATCH', body: { status: status } });
  }
  function createOrder(payload) {
    return api('/api/orders', { method: 'POST', body: payload })
      .catch(function (e) { if (e.status) throw e; return { ok: true, id: 'DEMO-' + Date.now().toString(36).toUpperCase(), local: true }; });
  }

  /* ---------- Customer accounts (require backend) ---------- */
  function registerCustomer(name, email, pass) {
    return api('/api/account/register', { method: 'POST', body: { name: name, email: email, pass: pass } })
      .then(function (d) { return { user: d.user }; })
      .catch(function (e) {
        if (e.status) return { error: e.message };
        return { error: 'A regisztrációhoz fut a háttérkiszolgáló szükséges (indítsd: npm start).' };
      });
  }
  function loginCustomer(email, pass) {
    return api('/api/account/login', { method: 'POST', body: { email: email, pass: pass } })
      .then(function (d) { return { user: d.user }; })
      .catch(function (e) {
        if (e.status) return { error: e.message };
        return { error: 'A bejelentkezéshez fut a háttérkiszolgáló szükséges (indítsd: npm start).' };
      });
  }
  function logoutCustomer() {
    return api('/api/account/logout', { method: 'POST' }).catch(function () { return { ok: true }; });
  }
  function customerMe() {
    return api('/api/account/me').then(function (d) { return d.authenticated ? d.user : null; }).catch(function () { return null; });
  }
  function myOrders() {
    return api('/api/account/orders').catch(function () { return []; });
  }

  /* ---------- News ---------- */
  function getNews() { return api('/api/news').catch(function () { return []; }); }
  function addNews(n) { return api('/api/admin/news', { method: 'POST', body: n }); }
  function updateNews(id, n) { return api('/api/admin/news/' + encodeURIComponent(id), { method: 'PUT', body: n }); }
  function deleteNews(id) { return api('/api/admin/news/' + encodeURIComponent(id), { method: 'DELETE' }); }

  /* ---------- Image upload (admin) ---------- */
  function uploadImage(dataUrl) {
    return api('/api/admin/upload', { method: 'POST', body: { data: dataUrl } })
      .then(function (d) { return { url: d.url }; })
      .catch(function (e) {
        if (e.status) return { error: e.message };
        return { url: dataUrl, local: true }; // no backend → embed inline (static demo)
      });
  }

  /* ============================================================
     Helpers
     ============================================================ */
  function formatPrice(value, cfg) {
    var cur = (cfg && cfg.currency) || 'Ft';
    var n = Math.round(value || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return n + ' ' + cur;
  }
  function applyTheme(cfg, root) {
    root = root || document.documentElement;
    root.style.setProperty('--shop-accent', cfg.accent || '#38e1ff');
    root.style.setProperty('--shop-accent-2', cfg.accent2 || cfg.accent || '#6c7bff');
    root.setAttribute('data-shop-theme', cfg.theme || 'dark');
  }
  function uid() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  global.ShopStore = {
    DEFAULT_CONFIG: DEFAULT_CONFIG,
    // async
    getShop: getShop,
    getConfig: getConfig,
    saveConfig: saveConfig,
    resetConfig: resetConfig,
    login: login,
    logout: logout,
    me: me,
    setCredentials: setCredentials,
    getOrders: getOrders,
    updateOrderStatus: updateOrderStatus,
    createOrder: createOrder,
    registerCustomer: registerCustomer,
    loginCustomer: loginCustomer,
    logoutCustomer: logoutCustomer,
    customerMe: customerMe,
    myOrders: myOrders,
    getNews: getNews,
    addNews: addNews,
    updateNews: updateNews,
    deleteNews: deleteNews,
    uploadImage: uploadImage,
    // sync helpers
    getCart: getCart,
    saveCart: saveCart,
    cartCount: cartCount,
    cartTotal: cartTotal,
    formatPrice: formatPrice,
    applyTheme: applyTheme,
    uid: uid,
    clone: clone,
    isBackendUp: function () { return backendUp; }
  };
})(window);
