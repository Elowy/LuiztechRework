/* ============================================================
   Luiz-Tech Webshop — admin panel (async / API-backed)
   ============================================================ */
(function () {
  'use strict';
  var S = window.ShopStore;
  if (!S) return;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var cfg = S.clone(S.DEFAULT_CONFIG);
  var dirty = false;
  var ordersLoaded = false;

  var PALETTES = [
    { a: '#38e1ff', b: '#6c7bff' }, { a: '#00ffa3', b: '#38e1ff' },
    { a: '#ff7edb', b: '#6c7bff' }, { a: '#ffb86c', b: '#ff5f57' },
    { a: '#b46bff', b: '#38e1ff' }, { a: '#28c840', b: '#00ffa3' }
  ];

  function escAttr(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function setVal(sel, v) { var el = $(sel); if (el != null) el.value = v == null ? '' : v; }
  function setNote(sel, msg, ok) { var el = $(sel); if (!el) return; el.textContent = msg; el.className = 'admin-inline-note ' + (ok ? 'ok' : 'err'); }

  /* ============================================================
     SESSION / LOGIN
     ============================================================ */
  function showApp() {
    $('#login-screen').hidden = true;
    $('#admin-shell').hidden = false;
    return loadConfig();
  }

  S.me().then(function (ok) { if (ok) showApp(); });

  $('#login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var u = $('#login-user').value.trim();
    var p = $('#login-pass').value;
    var btn = $('#login-form button[type="submit"]');
    btn.disabled = true;
    $('#login-error').textContent = '';
    S.login(u, p).then(function (ok) {
      btn.disabled = false;
      if (ok) { showApp(); }
      else { $('#login-error').textContent = 'Hibás felhasználónév vagy jelszó.'; $('#login-pass').value = ''; }
    }).catch(function () {
      btn.disabled = false;
      $('#login-error').textContent = 'Nem sikerült bejelentkezni. Próbáld újra.';
    });
  });

  $('#logout-btn').addEventListener('click', function () {
    if (dirty && !confirm('Mentetlen módosításaid vannak. Biztosan kilépsz?')) return;
    dirty = false;
    S.logout().then(function () { location.reload(); });
  });

  /* ============================================================
     TABS
     ============================================================ */
  $$('.admin-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var name = tab.getAttribute('data-tab');
      $$('.admin-tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      $$('.admin-panel').forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-panel') === name); });
      if (name === 'orders' && !ordersLoaded) loadOrders();
    });
  });

  /* ============================================================
     LOAD + HYDRATE
     ============================================================ */
  function loadConfig() {
    return S.getConfig().then(function (data) {
      cfg = Object.assign(S.clone(S.DEFAULT_CONFIG), data);
      if (!Array.isArray(cfg.products)) cfg.products = [];
      hydrateForms();
    }).catch(function (e) {
      if (e.status === 401) { S.logout(); location.reload(); }
    });
  }

  function hydrateForms() {
    setVal('#f-name', cfg.name); setVal('#f-tagline', cfg.tagline);
    setVal('#f-heroTitle', cfg.heroTitle); setVal('#f-heroText', cfg.heroText);
    setVal('#f-currency', cfg.currency); setVal('#f-freeShippingOver', cfg.freeShippingOver);
    setVal('#f-accent', cfg.accent); setVal('#f-accent-hex', cfg.accent);
    setVal('#f-accent2', cfg.accent2); setVal('#f-accent2-hex', cfg.accent2);
    setTheme(cfg.theme);
    buildSwatches();
    renderProductList();
    updatePreview();
    S.applyTheme(cfg);
  }

  function markDirty() {
    dirty = true;
    var st = $('#save-state'); if (st) { st.textContent = '● mentetlen módosítás'; st.className = 'save-state dirty'; }
  }
  function markClean() {
    dirty = false;
    var st = $('#save-state'); if (st) { st.textContent = '✓ mentve'; st.className = 'save-state clean'; setTimeout(function () { st.textContent = ''; }, 2500); }
  }

  /* ---------- General fields ---------- */
  var bindMap = { '#f-name': 'name', '#f-tagline': 'tagline', '#f-heroTitle': 'heroTitle', '#f-heroText': 'heroText', '#f-currency': 'currency' };
  Object.keys(bindMap).forEach(function (sel) {
    var el = $(sel); if (!el) return;
    el.addEventListener('input', function () { cfg[bindMap[sel]] = el.value; markDirty(); updatePreview(); });
  });
  $('#f-freeShippingOver').addEventListener('input', function () { cfg.freeShippingOver = parseInt(this.value, 10) || 0; markDirty(); });

  /* ---------- Colors ---------- */
  function bindColor(colorSel, hexSel, key) {
    var color = $(colorSel), hex = $(hexSel);
    color.addEventListener('input', function () { cfg[key] = color.value; hex.value = color.value; markDirty(); applyLivePreview(); });
    hex.addEventListener('input', function () {
      var v = hex.value.trim();
      if (/^#?[0-9a-fA-F]{6}$/.test(v)) { if (v[0] !== '#') v = '#' + v; cfg[key] = v; color.value = v; markDirty(); applyLivePreview(); }
    });
  }
  bindColor('#f-accent', '#f-accent-hex', 'accent');
  bindColor('#f-accent2', '#f-accent2-hex', 'accent2');

  function buildSwatches() {
    var wrap = $('#swatches'); wrap.innerHTML = '';
    PALETTES.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'swatch';
      b.style.background = 'linear-gradient(135deg,' + p.a + ',' + p.b + ')';
      b.title = p.a + ' / ' + p.b;
      b.addEventListener('click', function () {
        cfg.accent = p.a; cfg.accent2 = p.b;
        setVal('#f-accent', p.a); setVal('#f-accent-hex', p.a);
        setVal('#f-accent2', p.b); setVal('#f-accent2-hex', p.b);
        markDirty(); applyLivePreview();
      });
      wrap.appendChild(b);
    });
  }

  function setTheme(theme) {
    cfg.theme = theme === 'light' ? 'light' : 'dark';
    $$('.theme-opt').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-theme') === cfg.theme); });
    applyLivePreview();
  }
  $$('.theme-opt').forEach(function (b) { b.addEventListener('click', function () { setTheme(b.getAttribute('data-theme')); markDirty(); }); });

  function applyLivePreview() { S.applyTheme(cfg); updatePreview(); }
  function updatePreview() {
    var pn = $('#preview-name'); if (pn) pn.textContent = cfg.name || 'Bolt';
    var pp = $('#preview-price'); if (pp) pp.textContent = S.formatPrice(249000, cfg);
  }

  /* ============================================================
     PRODUCTS
     ============================================================ */
  function renderProductList() {
    var wrap = $('#product-admin-list'); wrap.innerHTML = '';
    if (!cfg.products.length) { wrap.innerHTML = '<p class="admin-desc">Még nincs termék. Adj hozzá egyet!</p>'; }
    cfg.products.forEach(function (p) {
      var row = document.createElement('div');
      row.className = 'product-admin-row';
      row.innerHTML =
        '<span class="pa-emoji">' + (p.image ? '<img src="' + escAttr(p.image) + '" alt="">' : (p.emoji || '📦')) + '</span>' +
        '<div class="pa-info"><span class="pa-name">' + escAttr(p.name) + '</span>' +
        '<span class="pa-meta">' + escAttr(p.category || '—') + ' · ' + S.formatPrice(p.price, cfg) + '</span></div>' +
        '<div class="pa-actions">' +
        '<button class="icon-btn" data-act="edit" title="Szerkesztés">✎</button>' +
        '<button class="icon-btn icon-danger" data-act="del" title="Törlés">🗑</button></div>';
      row.querySelector('[data-act="edit"]').addEventListener('click', function () { openModal(p.id); });
      row.querySelector('[data-act="del"]').addEventListener('click', function () {
        if (confirm('Biztosan törlöd: "' + p.name + '"?')) {
          cfg.products = cfg.products.filter(function (x) { return x.id !== p.id; });
          markDirty(); renderProductList();
        }
      });
      wrap.appendChild(row);
    });
    refreshCatList();
  }
  function refreshCatList() {
    var dl = $('#cat-list'); if (!dl) return;
    var cats = [];
    cfg.products.forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
    dl.innerHTML = cats.map(function (c) { return '<option value="' + escAttr(c) + '">'; }).join('');
  }

  /* ---------- Modal ---------- */
  var editingId = null;
  function openModal(id) {
    editingId = id || null;
    var p = id ? cfg.products.filter(function (x) { return x.id === id; })[0] : null;
    $('#modal-title').textContent = p ? 'termék szerkesztése' : 'új termék';
    $('#m-id').value = p ? p.id : '';
    $('#m-emoji').value = p ? (p.emoji || '') : '📦';
    $('#m-name').value = p ? p.name : '';
    $('#m-desc').value = p ? (p.desc || '') : '';
    $('#m-price').value = p ? p.price : '';
    $('#m-category').value = p ? (p.category || '') : '';
    $('#m-image').value = p ? (p.image || '') : '';
    $('#modal-err').textContent = '';
    $('#image-err').textContent = '';
    updateImagePreview();
    refreshCatList();
    $('#product-modal').hidden = false;
    setTimeout(function () { $('#m-name').focus(); }, 30);
  }
  function closeModal() { $('#product-modal').hidden = true; editingId = null; }

  /* ---------- Image upload ---------- */
  function updateImagePreview() {
    var url = $('#m-image').value;
    var prev = $('#image-preview');
    if (url) {
      prev.innerHTML = '<img src="' + escAttr(url) + '" alt="">';
      $('#image-clear').hidden = false;
    } else {
      prev.textContent = $('#m-emoji').value || '📦';
      $('#image-clear').hidden = true;
    }
  }
  $('#m-emoji').addEventListener('input', function () { if (!$('#m-image').value) updateImagePreview(); });
  $('#image-pick').addEventListener('click', function () { $('#image-file').click(); });
  $('#image-clear').addEventListener('click', function () { $('#m-image').value = ''; updateImagePreview(); });
  $('#image-file').addEventListener('change', function () {
    var file = this.files && this.files[0];
    if (!file) return;
    $('#image-err').textContent = '';
    if (file.size > 4 * 1024 * 1024) { $('#image-err').textContent = 'A kép túl nagy (max. 4 MB).'; this.value = ''; return; }
    var reader = new FileReader();
    var pickBtn = $('#image-pick');
    pickBtn.disabled = true; pickBtn.textContent = 'Feltöltés...';
    reader.onload = function () {
      S.uploadImage(reader.result).then(function (res) {
        pickBtn.disabled = false; pickBtn.textContent = 'Kép cseréje';
        if (res.error) { $('#image-err').textContent = res.error; return; }
        $('#m-image').value = res.url;
        updateImagePreview();
        markDirty();
      });
    };
    reader.onerror = function () { pickBtn.disabled = false; pickBtn.textContent = 'Kép feltöltése'; $('#image-err').textContent = 'A fájl beolvasása sikertelen.'; };
    reader.readAsDataURL(file);
    this.value = '';
  });

  $('#add-product').addEventListener('click', function () { openModal(null); });
  $('#modal-cancel').addEventListener('click', closeModal);
  $('#product-modal').addEventListener('click', function (e) { if (e.target === this) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#product-modal').hidden) closeModal(); });

  $('#modal-save').addEventListener('click', function () {
    var name = $('#m-name').value.trim();
    var price = parseInt($('#m-price').value, 10);
    if (!name) { $('#modal-err').textContent = 'A megnevezés kötelező.'; return; }
    if (isNaN(price) || price < 0) { $('#modal-err').textContent = 'Adj meg érvényes árat.'; return; }
    var data = { name: name, desc: $('#m-desc').value.trim(), price: price, category: $('#m-category').value.trim(), emoji: $('#m-emoji').value.trim() || '📦', image: $('#m-image').value || '' };
    if (editingId) {
      cfg.products = cfg.products.map(function (p) { return p.id === editingId ? Object.assign(p, data) : p; });
    } else {
      data.id = S.uid(); cfg.products.push(data);
    }
    markDirty(); renderProductList(); closeModal();
  });

  /* ============================================================
     SAVE / ACCOUNT / RESET
     ============================================================ */
  $('#save-btn').addEventListener('click', function () {
    cfg.name = $('#f-name').value;
    cfg.tagline = $('#f-tagline').value;
    cfg.heroTitle = $('#f-heroTitle').value;
    cfg.heroText = $('#f-heroText').value;
    cfg.currency = $('#f-currency').value || 'Ft';
    cfg.freeShippingOver = parseInt($('#f-freeShippingOver').value, 10) || 0;
    var btn = $('#save-btn'); btn.disabled = true;
    S.saveConfig(cfg).then(function (saved) {
      if (saved) { cfg = Object.assign(S.clone(S.DEFAULT_CONFIG), saved); if (!Array.isArray(cfg.products)) cfg.products = []; }
      markClean();
    }).catch(function (e) {
      if (e.status === 401) { S.logout(); location.reload(); return; }
      setNote('#save-state', 'Mentés sikertelen.', false);
    }).then(function () { btn.disabled = false; });
  });

  $('#save-account').addEventListener('click', function () {
    var u = $('#f-acc-user').value.trim();
    var p = $('#f-acc-pass').value;
    if (!u) { setNote('#account-note', 'A felhasználónév nem lehet üres.', false); return; }
    S.setCredentials(u, p).then(function () {
      $('#f-acc-pass').value = '';
      setNote('#account-note', 'Belépési adatok mentve. ✓', true);
    }).catch(function () { setNote('#account-note', 'Mentés sikertelen.', false); });
  });

  $('#reset-btn').addEventListener('click', function () {
    if (!confirm('Biztosan visszaállítasz mindent az alapértelmezettre? Ez nem vonható vissza.')) return;
    S.resetConfig().then(function (data) {
      cfg = Object.assign(S.clone(S.DEFAULT_CONFIG), data || {});
      if (!Array.isArray(cfg.products)) cfg.products = [];
      hydrateForms();
      setNote('#reset-note', 'Beállítások visszaállítva. ✓', true);
      markClean();
    }).catch(function () { setNote('#reset-note', 'Visszaállítás sikertelen.', false); });
  });

  /* ============================================================
     ORDERS
     ============================================================ */
  var ORDER_STATUSES = ['Új', 'Feldolgozás alatt', 'Teljesítve', 'Törölve'];
  function statusClass(s) {
    return { 'Új': 'st-new', 'Feldolgozás alatt': 'st-progress', 'Teljesítve': 'st-done', 'Törölve': 'st-cancelled' }[s] || 'st-new';
  }

  function loadOrders() {
    var wrap = $('#orders-list');
    wrap.innerHTML = '<p class="admin-desc">Betöltés...</p>';
    S.getOrders().then(function (data) {
      ordersLoaded = true;
      var orders = data.orders || [];
      if (data.statuses && data.statuses.length) ORDER_STATUSES = data.statuses;
      if (!orders.length) { wrap.innerHTML = '<p class="admin-desc">Még nincs beérkezett rendelés.</p>'; return; }
      wrap.innerHTML = '';
      orders.forEach(function (o) {
        var items = (o.items || []).map(function (it) { return escAttr(it.name) + ' ×' + it.qty; }).join(', ');
        var when = '';
        try { when = new Date(o.createdAt).toLocaleString('hu-HU'); } catch (e) { when = o.createdAt || ''; }
        var c = o.customer || {};
        var contact = [c.name, c.email, c.phone].filter(Boolean).map(escAttr).join(' · ');
        var status = o.status || 'Új';
        var opts = ORDER_STATUSES.map(function (s) {
          return '<option value="' + escAttr(s) + '"' + (s === status ? ' selected' : '') + '>' + escAttr(s) + '</option>';
        }).join('');

        var card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML =
          '<div class="order-head">' +
            '<span class="order-id">' + escAttr(o.id) + '</span>' +
            '<span class="status-badge ' + statusClass(status) + '" data-badge>' + escAttr(status) + '</span>' +
            '<strong class="order-total">' + S.formatPrice(o.total, cfg) + '</strong>' +
          '</div>' +
          '<div class="order-items">' + items + '</div>' +
          (contact ? '<div class="order-contact">👤 ' + contact + '</div>' : '') +
          (c.address ? '<div class="order-contact">📍 ' + escAttr(c.address) + '</div>' : '') +
          (c.note ? '<div class="order-contact">📝 ' + escAttr(c.note) + '</div>' : '') +
          '<div class="order-meta">' + when + '</div>' +
          '<div class="order-status-row"><label>Státusz:</label>' +
            '<select class="order-status-select">' + opts + '</select></div>';

        var sel = card.querySelector('.order-status-select');
        var badge = card.querySelector('[data-badge]');
        sel.addEventListener('change', function () {
          var next = sel.value;
          sel.disabled = true;
          S.updateOrderStatus(o.id, next).then(function () {
            badge.textContent = next;
            badge.className = 'status-badge ' + statusClass(next);
            sel.disabled = false;
          }).catch(function (e) {
            sel.disabled = false;
            if (e.status === 401) { S.logout(); location.reload(); return; }
            sel.value = status;
            alert('Nem sikerült frissíteni a státuszt.');
          });
        });
        wrap.appendChild(card);
      });
    }).catch(function (e) {
      if (e.status === 401) { S.logout(); location.reload(); return; }
      wrap.innerHTML = '<p class="admin-inline-note err">Nem sikerült betölteni a rendeléseket.</p>';
    });
  }
  $('#refresh-orders').addEventListener('click', loadOrders);

  /* warn before leaving with unsaved changes */
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  S.applyTheme(cfg);
})();
