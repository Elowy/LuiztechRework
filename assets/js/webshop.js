/* ============================================================
   Luiz-Tech Webshop — storefront
   ============================================================ */
(function () {
  'use strict';
  var S = window.ShopStore;
  if (!S) return;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var cfg = S.getConfig();
  var cart = S.getCart();
  var activeCat = 'all';
  var query = '';

  /* ---------- Apply branding ---------- */
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
  function setText(sel, val) { var el = $(sel); if (el != null && val != null) el.textContent = val; }

  /* ---------- Filters ---------- */
  function buildFilters() {
    var cats = ['all'];
    cfg.products.forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
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
    return cfg.products.filter(function (p) {
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
      card.innerHTML =
        '<div class="shop-product-media">' +
          '<span class="shop-product-emoji">' + (p.emoji || '📦') + '</span>' +
          (p.category ? '<span class="shop-product-cat">' + esc(p.category) + '</span>' : '') +
        '</div>' +
        '<div class="shop-product-body">' +
          '<h3>' + esc(p.name) + '</h3>' +
          '<p>' + esc(p.desc || '') + '</p>' +
          '<div class="shop-product-foot">' +
            '<span class="shop-product-price">' + S.formatPrice(p.price, cfg) + '</span>' +
            '<button class="btn btn-primary btn-sm add-to-cart" data-id="' + p.id + '">Kosárba</button>' +
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

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Cart ---------- */
  function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    S.saveCart(cart);
    updateCartUI();
    openCart();
  }
  function setQty(id, qty) {
    if (qty <= 0) delete cart[id]; else cart[id] = qty;
    S.saveCart(cart);
    updateCartUI();
  }

  function updateCartUI() {
    var count = S.cartCount(cart);
    setText('#cart-count', count);
    var cc = $('#cart-count');
    if (cc) cc.classList.toggle('has', count > 0);
    setText('#cart-total', S.formatPrice(S.cartTotal(cart, cfg), cfg));

    var byId = {};
    cfg.products.forEach(function (p) { byId[p.id] = p; });
    var wrap = $('#cart-items');
    wrap.innerHTML = '';
    var ids = Object.keys(cart);
    if (!ids.length) {
      wrap.innerHTML = '<p class="cart-empty">A kosarad még üres.<br>Böngészd a termékeket! 🛍️</p>';
      $('#cart-checkout').disabled = true;
      return;
    }
    $('#cart-checkout').disabled = false;
    ids.forEach(function (id) {
      var p = byId[id];
      if (!p) { delete cart[id]; return; }
      var row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML =
        '<span class="cart-row-emoji">' + (p.emoji || '📦') + '</span>' +
        '<div class="cart-row-info">' +
          '<span class="cart-row-name">' + esc(p.name) + '</span>' +
          '<span class="cart-row-price">' + S.formatPrice(p.price, cfg) + '</span>' +
        '</div>' +
        '<div class="cart-qty">' +
          '<button class="qty-btn" data-act="dec" data-id="' + id + '" aria-label="Kevesebb">−</button>' +
          '<span>' + cart[id] + '</span>' +
          '<button class="qty-btn" data-act="inc" data-id="' + id + '" aria-label="Több">+</button>' +
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

  /* ---------- Cart drawer ---------- */
  function openCart() {
    $('#cart-drawer').classList.add('open');
    $('#cart-drawer').setAttribute('aria-hidden', 'false');
    $('#cart-overlay').hidden = false;
  }
  function closeCart() {
    $('#cart-drawer').classList.remove('open');
    $('#cart-drawer').setAttribute('aria-hidden', 'true');
    $('#cart-overlay').hidden = true;
  }

  /* ---------- Init ---------- */
  applyBranding();
  buildFilters();
  renderProducts();
  updateCartUI();

  $('#cart-btn').addEventListener('click', openCart);
  $('#cart-close').addEventListener('click', closeCart);
  $('#cart-overlay').addEventListener('click', closeCart);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); });

  var search = $('#shop-search');
  if (search) {
    search.addEventListener('input', function () { query = search.value; renderProducts(); });
  }

  $('#cart-checkout').addEventListener('click', function () {
    var note = $('#cart-note');
    note.textContent = 'Köszönjük a rendelést! (Demó — éles fizetés nincs bekötve.) Összeg: ' +
      S.formatPrice(S.cartTotal(cart, cfg), cfg);
    note.className = 'cart-note ok';
    cart = {}; S.saveCart(cart); updateCartUI();
    $('#cart-note').className = 'cart-note ok';
    $('#cart-note').textContent = note.textContent;
  });

  /* React to changes made in the admin panel (another tab) */
  window.addEventListener('storage', function (e) {
    if (e.key && e.key.indexOf('luiztech_shop_config') === 0) {
      cfg = S.getConfig();
      applyBranding(); buildFilters(); renderProducts(); updateCartUI();
    }
  });
})();
