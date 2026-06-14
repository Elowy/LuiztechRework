/* ============================================================
   Luiz-Tech Webshop — storefront (async / API-backed)
   ============================================================ */
(function () {
  'use strict';
  var S = window.ShopStore;
  if (!S) return;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var cfg = S.clone(S.DEFAULT_CONFIG);
  var cart = S.getCart();
  var activeCat = 'all';
  var query = '';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function setText(sel, val) { var el = $(sel); if (el != null && val != null) el.textContent = val; }
  function statusClass(s) {
    return { 'Új': 'st-new', 'Feldolgozás alatt': 'st-progress', 'Teljesítve': 'st-done', 'Törölve': 'st-cancelled' }[s] || 'st-new';
  }

  /* ---------- Branding ---------- */
  function applyBranding() {
    S.applyTheme(cfg);
    setText('#shop-name-eyebrow', cfg.name);
    setText('#shop-hero-title', cfg.heroTitle);
    setText('#shop-hero-text', cfg.heroText);
    setText('#footer-shop-name', cfg.name);
    document.title = cfg.name + ' — Webshop';
    var ship = $('#shop-shipping-note');
    if (ship) {
      ship.textContent = cfg.freeShippingOver > 0
        ? '🚚 Ingyenes szállítás ' + S.formatPrice(cfg.freeShippingOver, cfg) + ' felett'
        : '';
    }
  }

  /* ---------- Filters ---------- */
  function buildFilters() {
    var cats = ['all'];
    (cfg.products || []).forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
    var wrap = $('#shop-filters');
    wrap.innerHTML = '';
    cats.forEach(function (cat) {
      var btn = document.createElement('button');
      btn.className = 'shop-filter' + (cat === activeCat ? ' active' : '');
      btn.textContent = cat === 'all' ? 'Összes' : cat;
      btn.setAttribute('role', 'tab');
      btn.addEventListener('click', function () {
        activeCat = cat;
        $$('.shop-filter', wrap).forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderProducts();
      });
      wrap.appendChild(btn);
    });
  }

  /* ---------- Products ---------- */
  function visibleProducts() {
    return (cfg.products || []).filter(function (p) {
      var catOk = activeCat === 'all' || p.category === activeCat;
      var q = query.trim().toLowerCase();
      var qOk = !q || (p.name + ' ' + (p.desc || '')).toLowerCase().indexOf(q) > -1;
      return catOk && qOk;
    });
  }

  function renderProducts() {
    var grid = $('#products-grid');
    var list = visibleProducts();
    grid.innerHTML = '';
    $('#shop-empty').hidden = list.length > 0;

    list.forEach(function (p) {
      var card = document.createElement('article');
      card.className = 'shop-product reveal in';
      var media = p.image
        ? '<img class="shop-product-img" src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy">'
        : '<span class="shop-product-emoji">' + (p.emoji || '📦') + '</span>';
      var soldOut = p.stock === 0;
      var lowStock = p.stock != null && p.stock > 0 && p.stock <= 5;
      var stockTag = soldOut ? '<span class="shop-product-stock sold">Elfogyott</span>'
        : (lowStock ? '<span class="shop-product-stock low">Utolsó ' + p.stock + ' db</span>' : '');
      var btn = soldOut
        ? '<button class="btn btn-ghost btn-sm" disabled>Elfogyott</button>'
        : '<button class="btn btn-primary btn-sm add-to-cart" data-id="' + esc(p.id) + '">Kosárba</button>';
      card.innerHTML =
        '<div class="shop-product-media' + (soldOut ? ' is-sold' : '') + '">' +
          media +
          (p.category ? '<span class="shop-product-cat">' + esc(p.category) + '</span>' : '') +
          stockTag +
        '</div>' +
        '<div class="shop-product-body">' +
          '<h3>' + esc(p.name) + '</h3>' +
          '<p>' + esc(p.desc || '') + '</p>' +
          '<div class="shop-product-foot">' +
            '<span class="shop-product-price">' + S.formatPrice(p.price, cfg) + '</span>' +
            btn +
          '</div>' +
        '</div>';
      grid.appendChild(card);
    });

    $$('.add-to-cart', grid).forEach(function (btn) {
      btn.addEventListener('click', function () {
        addToCart(btn.getAttribute('data-id'));
        btn.textContent = '✓ Hozzáadva';
        btn.classList.add('added');
        setTimeout(function () { btn.textContent = 'Kosárba'; btn.classList.remove('added'); }, 1100);
      });
    });
  }

  /* ---------- Cart ---------- */
  function productById(id) {
    var found = null;
    (cfg.products || []).forEach(function (p) { if (p.id === id) found = p; });
    return found;
  }
  function stockLimit(id) {
    var p = productById(id);
    return (p && p.stock != null) ? p.stock : Infinity;
  }
  function addToCart(id) {
    var limit = stockLimit(id);
    if (limit <= 0) return;
    cart[id] = Math.min((cart[id] || 0) + 1, limit);
    S.saveCart(cart); updateCartUI(); openCart();
  }
  function setQty(id, qty) {
    var limit = stockLimit(id);
    if (qty <= 0) delete cart[id]; else cart[id] = Math.min(qty, limit);
    S.saveCart(cart); updateCartUI();
  }

  function updateCartUI() {
    var count = S.cartCount(cart);
    setText('#cart-count', count);
    var cc = $('#cart-count'); if (cc) cc.classList.toggle('has', count > 0);
    setText('#cart-total', S.formatPrice(S.cartTotal(cart, cfg), cfg));

    var byId = {};
    (cfg.products || []).forEach(function (p) { byId[p.id] = p; });
    var wrap = $('#cart-items');
    wrap.innerHTML = '';
    var ids = Object.keys(cart);
    if (!ids.length) {
      wrap.innerHTML = '<p class="cart-empty">A kosarad még üres.<br>Böngészd a termékeket! 🛍️</p>';
      $('#cart-checkout').disabled = true;
      if ($('#cart-drawer').classList.contains('checkout-mode')) exitCheckout();
      return;
    }
    $('#cart-checkout').disabled = false;
    ids.forEach(function (id) {
      var p = byId[id];
      if (!p) { delete cart[id]; return; }
      var row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML =
        '<span class="cart-row-emoji">' + (p.image ? '<img src="' + esc(p.image) + '" alt="">' : (p.emoji || '📦')) + '</span>' +
        '<div class="cart-row-info">' +
          '<span class="cart-row-name">' + esc(p.name) + '</span>' +
          '<span class="cart-row-price">' + S.formatPrice(p.price, cfg) + '</span>' +
        '</div>' +
        '<div class="cart-qty">' +
          '<button class="qty-btn" data-act="dec" data-id="' + esc(id) + '" aria-label="Kevesebb">−</button>' +
          '<span>' + cart[id] + '</span>' +
          '<button class="qty-btn" data-act="inc" data-id="' + esc(id) + '" aria-label="Több">+</button>' +
        '</div>';
      wrap.appendChild(row);
    });
    $$('.qty-btn', wrap).forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-id');
        var delta = b.getAttribute('data-act') === 'inc' ? 1 : -1;
        setQty(id, (cart[id] || 0) + delta);
      });
    });
  }

  function openCart() {
    $('#cart-drawer').classList.add('open');
    $('#cart-drawer').setAttribute('aria-hidden', 'false');
    $('#cart-overlay').hidden = false;
  }
  function closeCart() {
    $('#cart-drawer').classList.remove('open');
    $('#cart-drawer').setAttribute('aria-hidden', 'true');
    $('#cart-overlay').hidden = true;
    exitCheckout();
  }

  /* ---------- Checkout (2 steps) ---------- */
  function enterCheckout() {
    if (!Object.keys(cart).length) return;
    var drawer = $('#cart-drawer');
    drawer.classList.add('checkout-mode');
    $('#cart-checkout').hidden = true;
    $('#checkout-submit').hidden = false;
    $('#checkout-back').hidden = false;
    $('#cart-note').textContent = '';
    if (currentUser) {
      if (!$('#co-name').value) $('#co-name').value = currentUser.name || '';
      if (!$('#co-email').value) $('#co-email').value = currentUser.email || '';
    }
    setTimeout(function () { $('#co-name').focus(); }, 30);
  }
  function exitCheckout() {
    var drawer = $('#cart-drawer');
    drawer.classList.remove('checkout-mode');
    $('#cart-checkout').hidden = false;
    $('#checkout-submit').hidden = true;
    $('#checkout-back').hidden = true;
    $('#cart-note').textContent = '';
  }
  function submitOrder() {
    var note = $('#cart-note');
    var ids = Object.keys(cart);
    if (!ids.length) return;
    var name = $('#co-name').value.trim();
    var email = $('#co-email').value.trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      note.textContent = 'Add meg a neved és egy érvényes e-mail címet.';
      note.className = 'cart-note err';
      return;
    }
    var payload = {
      items: ids.map(function (id) { return { id: id, qty: cart[id] }; }),
      customer: {
        name: name, email: email,
        phone: $('#co-phone').value.trim(),
        address: $('#co-address').value.trim(),
        note: $('#co-note').value.trim()
      }
    };
    var btn = $('#checkout-submit'); btn.disabled = true;
    note.textContent = 'Rendelés feldolgozása...'; note.className = 'cart-note';
    S.createOrder(payload).then(function (resp) {
      btn.disabled = false;
      if (resp && resp.error) { note.textContent = resp.error; note.className = 'cart-note err'; return; }
      note.textContent = 'Köszönjük a rendelést! Azonosító: ' + (resp.id || '—') +
        (resp.local ? ' (helyi demó)' : '') + '. Hamarosan felvesszük veled a kapcsolatot.';
      note.className = 'cart-note ok';
      cart = {}; S.saveCart(cart);
      $('#checkout-form').reset();
      exitCheckout();
      updateCartUI();
      if (currentUser) loadMyOrders();
    }).catch(function () {
      btn.disabled = false;
      note.textContent = 'Hiba történt a rendelés során. Próbáld újra.';
      note.className = 'cart-note err';
    });
  }

  /* ============================================================
     Customer accounts
     ============================================================ */
  var currentUser = null;

  function refreshAuthUI() {
    var label = $('#account-label');
    if (currentUser) {
      var first = (currentUser.name || '').split(' ')[0] || 'Fiók';
      if (label) label.textContent = first;
      $('#account-btn').setAttribute('title', 'Fiókom — ' + currentUser.email);
    } else {
      if (label) label.textContent = 'Belépés';
      $('#account-btn').setAttribute('title', 'Belépés / Regisztráció');
    }
  }

  function openAuth(tab) {
    switchAuthTab(tab || 'login');
    $('#auth-modal').hidden = false;
    setTimeout(function () { var f = $('.auth-form.active input'); if (f) f.focus(); }, 30);
  }
  function closeAuth() { $('#auth-modal').hidden = true; }
  function switchAuthTab(tab) {
    $$('.auth-tab').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-auth-tab') === tab); });
    $$('.auth-form').forEach(function (f) { f.classList.toggle('active', f.getAttribute('data-auth-form') === tab); });
    $('#login-err').textContent = ''; $('#reg-err').textContent = '';
  }

  function onLoggedIn(user) {
    currentUser = user;
    refreshAuthUI();
    closeAuth();
  }

  function handleLogin(e) {
    e.preventDefault();
    var email = $('#login-email').value.trim();
    var pass = $('#login-password').value;
    var err = $('#login-err');
    if (!email || !pass) { err.textContent = 'Add meg az e-mail címed és a jelszavad.'; return; }
    var btn = e.target.querySelector('button[type="submit"]'); btn.disabled = true;
    S.loginCustomer(email, pass).then(function (res) {
      btn.disabled = false;
      if (res.error) { err.textContent = res.error; return; }
      onLoggedIn(res.user);
    });
  }

  function handleRegister(e) {
    e.preventDefault();
    var name = $('#reg-name').value.trim();
    var email = $('#reg-email').value.trim();
    var pass = $('#reg-password').value;
    var err = $('#reg-err');
    if (!name || !email || pass.length < 6) { err.textContent = 'Tölts ki minden mezőt (jelszó min. 6 karakter).'; return; }
    var btn = e.target.querySelector('button[type="submit"]'); btn.disabled = true;
    S.registerCustomer(name, email, pass).then(function (res) {
      btn.disabled = false;
      if (res.error) { err.textContent = res.error; return; }
      onLoggedIn(res.user);
    });
  }

  function openAccount() {
    $('#account-greeting').textContent = 'Üdv, ' + (currentUser ? currentUser.name : '') + '! 👋';
    $('#account-drawer').classList.add('open');
    $('#account-drawer').setAttribute('aria-hidden', 'false');
    $('#account-overlay').hidden = false;
    loadMyOrders();
  }
  function closeAccount() {
    $('#account-drawer').classList.remove('open');
    $('#account-drawer').setAttribute('aria-hidden', 'true');
    $('#account-overlay').hidden = true;
  }
  function loadMyOrders() {
    var wrap = $('#account-orders');
    wrap.innerHTML = '<p class="cart-empty">Betöltés...</p>';
    S.myOrders().then(function (orders) {
      if (!orders || !orders.length) { wrap.innerHTML = '<p class="cart-empty">Még nincs rendelésed.</p>'; return; }
      wrap.innerHTML = '';
      orders.forEach(function (o) {
        var items = (o.items || []).map(function (it) { return esc(it.name) + ' ×' + it.qty; }).join(', ');
        var when = ''; try { when = new Date(o.createdAt).toLocaleDateString('hu-HU'); } catch (e) { when = ''; }
        var d = document.createElement('div');
        d.className = 'account-order';
        d.innerHTML = '<div class="account-order-head"><span>' + esc(o.id) + '</span><strong>' + S.formatPrice(o.total, cfg) + '</strong></div>' +
          '<div class="account-order-items">' + items + '</div>' +
          '<div class="account-order-date">' + when + ' · <span class="status-badge ' + statusClass(o.status) + '">' + esc(o.status || 'Új') + '</span></div>';
        wrap.appendChild(d);
      });
    });
  }
  function logoutCustomer() {
    S.logoutCustomer().then(function () { currentUser = null; refreshAuthUI(); closeAccount(); });
  }

  function initAuth() {
    $('#account-btn').addEventListener('click', function () { if (currentUser) openAccount(); else openAuth('login'); });
    $('#auth-close').addEventListener('click', closeAuth);
    $('#auth-modal').addEventListener('click', function (e) { if (e.target === this) closeAuth(); });
    $$('.auth-tab').forEach(function (b) { b.addEventListener('click', function () { switchAuthTab(b.getAttribute('data-auth-tab')); }); });
    $('[data-auth-form="login"]').addEventListener('submit', handleLogin);
    $('[data-auth-form="register"]').addEventListener('submit', handleRegister);
    $('#account-close').addEventListener('click', closeAccount);
    $('#account-overlay').addEventListener('click', closeAccount);
    $('#account-logout').addEventListener('click', logoutCustomer);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeAuth(); closeAccount(); } });

    S.customerMe().then(function (user) { currentUser = user; refreshAuthUI(); });
  }

  /* ---------- Init ---------- */
  function init() {
    initAuth();
    $('#cart-btn').addEventListener('click', openCart);
    $('#cart-close').addEventListener('click', closeCart);
    $('#cart-overlay').addEventListener('click', closeCart);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); });
    var search = $('#shop-search');
    if (search) search.addEventListener('input', function () { query = search.value; renderProducts(); });
    $('#cart-checkout').addEventListener('click', enterCheckout);
    $('#checkout-back').addEventListener('click', exitCheckout);
    $('#checkout-submit').addEventListener('click', submitOrder);
    $('#checkout-form').addEventListener('submit', function (e) { e.preventDefault(); submitOrder(); });

    S.getShop().then(function (data) {
      cfg = Object.assign(S.clone(S.DEFAULT_CONFIG), data);
      if (!Array.isArray(cfg.products)) cfg.products = [];
      applyBranding(); buildFilters(); renderProducts(); updateCartUI();
    });
  }

  init();
})();
