/* ============================================================
   Luiz-Tech Webshop — shared config layer
   Stores shop customisation + cart in localStorage so the
   storefront (webshop.html) and admin panel (admin.html)
   share the same source of truth.  (Buildless prototype.)
   ============================================================ */
(function (global) {
  'use strict';

  var CONFIG_KEY = 'luiztech_shop_config_v1';
  var CART_KEY = 'luiztech_shop_cart_v1';
  var AUTH_KEY = 'luiztech_admin_session_v1';
  var CRED_KEY = 'luiztech_admin_cred_v1';

  /* ---------- Defaults ---------- */
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

  /* ---------- Helpers ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }

  /* ---------- Config ---------- */
  function getConfig() {
    var saved = readJSON(CONFIG_KEY, null);
    if (!saved) return clone(DEFAULT_CONFIG);
    // merge with defaults so new fields don't break older saves
    var merged = clone(DEFAULT_CONFIG);
    Object.keys(saved).forEach(function (k) { merged[k] = saved[k]; });
    return merged;
  }
  function saveConfig(cfg) { return writeJSON(CONFIG_KEY, cfg); }
  function resetConfig() { localStorage.removeItem(CONFIG_KEY); return clone(DEFAULT_CONFIG); }

  /* ---------- Cart ---------- */
  function getCart() { return readJSON(CART_KEY, {}); } // { productId: qty }
  function saveCart(cart) { return writeJSON(CART_KEY, cart); }
  function cartCount(cart) {
    cart = cart || getCart();
    return Object.keys(cart).reduce(function (n, k) { return n + cart[k]; }, 0);
  }
  function cartTotal(cart, cfg) {
    cart = cart || getCart();
    cfg = cfg || getConfig();
    var byId = {};
    cfg.products.forEach(function (p) { byId[p.id] = p; });
    return Object.keys(cart).reduce(function (sum, id) {
      return sum + (byId[id] ? byId[id].price * cart[id] : 0);
    }, 0);
  }

  /* ---------- Auth (demo / client-side only) ---------- */
  function getCredentials() {
    return readJSON(CRED_KEY, { user: 'admin', pass: 'luiztech' });
  }
  function setCredentials(user, pass) { return writeJSON(CRED_KEY, { user: user, pass: pass }); }
  function login(user, pass) {
    var c = getCredentials();
    if (user === c.user && pass === c.pass) {
      sessionStorage.setItem(AUTH_KEY, '1');
      return true;
    }
    return false;
  }
  function logout() { sessionStorage.removeItem(AUTH_KEY); }
  function isLoggedIn() { return sessionStorage.getItem(AUTH_KEY) === '1'; }

  /* ---------- Formatting ---------- */
  function formatPrice(value, cfg) {
    cfg = cfg || getConfig();
    var n = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return n + ' ' + cfg.currency;
  }

  /* ---------- Apply theme variables to a document ---------- */
  function applyTheme(cfg, root) {
    cfg = cfg || getConfig();
    root = root || document.documentElement;
    root.style.setProperty('--shop-accent', cfg.accent);
    root.style.setProperty('--shop-accent-2', cfg.accent2 || cfg.accent);
    root.setAttribute('data-shop-theme', cfg.theme || 'dark');
  }

  function uid() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  global.ShopStore = {
    DEFAULT_CONFIG: DEFAULT_CONFIG,
    getConfig: getConfig,
    saveConfig: saveConfig,
    resetConfig: resetConfig,
    getCart: getCart,
    saveCart: saveCart,
    cartCount: cartCount,
    cartTotal: cartTotal,
    getCredentials: getCredentials,
    setCredentials: setCredentials,
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    formatPrice: formatPrice,
    applyTheme: applyTheme,
    uid: uid,
    clone: clone
  };
})(window);
