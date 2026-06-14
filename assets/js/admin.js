/* ============================================================
   Luiz-Tech Webshop — admin panel
   ============================================================ */
(function () {
  'use strict';
  var S = window.ShopStore;
  if (!S) return;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var cfg = S.getConfig();
  var dirty = false;

  var PALETTES = [
    { a: '#38e1ff', b: '#6c7bff' },
    { a: '#00ffa3', b: '#38e1ff' },
    { a: '#ff7edb', b: '#6c7bff' },
    { a: '#ffb86c', b: '#ff5f57' },
    { a: '#b46bff', b: '#38e1ff' },
    { a: '#28c840', b: '#00ffa3' }
  ];

  /* ============================================================
     LOGIN
     ============================================================ */
  function showApp() {
    $('#login-screen').hidden = true;
    $('#admin-shell').hidden = false;
    hydrateForms();
  }

  if (S.isLoggedIn()) {
    showApp();
  }

  $('#login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var u = $('#login-user').value.trim();
    var p = $('#login-pass').value;
    if (S.login(u, p)) {
      $('#login-error').textContent = '';
      showApp();
    } else {
      $('#login-error').textContent = 'Hibás felhasználónév vagy jelszó.';
      $('#login-pass').value = '';
    }
  });

  $('#logout-btn') && $('#logout-btn').addEventListener('click', function () {
    if (dirty && !confirm('Mentetlen módosításaid vannak. Biztosan kilépsz?')) return;
    S.logout();
    location.reload();
  });

  /* ============================================================
     TABS
     ============================================================ */
  $$('.admin-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var name = tab.getAttribute('data-tab');
      $$('.admin-tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      $$('.admin-panel').forEach(function (p) {
        p.classList.toggle('active', p.getAttribute('data-panel') === name);
      });
    });
  });

  /* ============================================================
     FORM HYDRATION + BINDING
     ============================================================ */
  function hydrateForms() {
    setVal('#f-name', cfg.name);
    setVal('#f-tagline', cfg.tagline);
    setVal('#f-heroTitle', cfg.heroTitle);
    setVal('#f-heroText', cfg.heroText);
    setVal('#f-currency', cfg.currency);
    setVal('#f-freeShippingOver', cfg.freeShippingOver);

    setVal('#f-accent', cfg.accent);
    setVal('#f-accent-hex', cfg.accent);
    setVal('#f-accent2', cfg.accent2);
    setVal('#f-accent2-hex', cfg.accent2);
    setTheme(cfg.theme);

    setVal('#f-acc-user', S.getCredentials().user);

    buildSwatches();
    renderProductList();
    updatePreview();
  }
  function setVal(sel, v) { var el = $(sel); if (el != null) el.value = v == null ? '' : v; }

  function markDirty() {
    dirty = true;
    var st = $('#save-state');
    if (st) { st.textContent = '● mentetlen módosítás'; st.className = 'save-state dirty'; }
  }
  function markClean() {
    dirty = false;
    var st = $('#save-state');
    if (st) { st.textContent = '✓ mentve'; st.className = 'save-state clean'; setTimeout(function () { st.textContent = ''; }, 2500); }
  }

  // bind general/appearance text fields → cfg + preview
  var bindMap = {
    '#f-name': 'name', '#f-tagline': 'tagline', '#f-heroTitle': 'heroTitle',
    '#f-heroText': 'heroText', '#f-currency': 'currency'
  };
  Object.keys(bindMap).forEach(function (sel) {
    var el = $(sel);
    if (!el) return;
    el.addEventListener('input', function () { cfg[bindMap[sel]] = el.value; markDirty(); updatePreview(); });
  });
  $('#f-freeShippingOver').addEventListener('input', function () {
    cfg.freeShippingOver = parseInt(this.value, 10) || 0; markDirty();
  });

  /* ---------- Colors ---------- */
  function bindColor(colorSel, hexSel, key) {
    var color = $(colorSel), hex = $(hexSel);
    color.addEventListener('input', function () { cfg[key] = color.value; hex.value = color.value; markDirty(); applyLivePreview(); });
    hex.addEventListener('input', function () {
      var v = hex.value.trim();
      if (/^#?[0-9a-fA-F]{6}$/.test(v)) {
        if (v[0] !== '#') v = '#' + v;
        cfg[key] = v; color.value = v; markDirty(); applyLivePreview();
      }
    });
  }
  bindColor('#f-accent', '#f-accent-hex', 'accent');
  bindColor('#f-accent2', '#f-accent2-hex', 'accent2');

  function buildSwatches() {
    var wrap = $('#swatches');
    wrap.innerHTML = '';
    PALETTES.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch';
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
    cfg.theme = theme;
    $$('.theme-opt').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-theme') === theme); });
    applyLivePreview();
  }
  $$('.theme-opt').forEach(function (b) {
    b.addEventListener('click', function () { setTheme(b.getAttribute('data-theme')); markDirty(); });
  });

  function applyLivePreview() { S.applyTheme(cfg); updatePreview(); }

  function updatePreview() {
    var pn = $('#preview-name'); if (pn) pn.textContent = cfg.name || 'Bolt';
    var pp = $('#preview-price'); if (pp) pp.textContent = S.formatPrice(249000, cfg);
  }

  /* ============================================================
     PRODUCTS CRUD
     ============================================================ */
  function renderProductList() {
    var wrap = $('#product-admin-list');
    wrap.innerHTML = '';
    if (!cfg.products.length) {
      wrap.innerHTML = '<p class="admin-desc">Még nincs termék. Adj hozzá egyet!</p>';
    }
    cfg.products.forEach(function (p) {
      var row = document.createElement('div');
      row.className = 'product-admin-row';
      row.innerHTML =
        '<span class="pa-emoji">' + (p.emoji || '📦') + '</span>' +
        '<div class="pa-info">' +
          '<span class="pa-name">' + escAttr(p.name) + '</span>' +
          '<span class="pa-meta">' + escAttr(p.category || '—') + ' · ' + S.formatPrice(p.price, cfg) + '</span>' +
        '</div>' +
        '<div class="pa-actions">' +
          '<button class="icon-btn" data-act="edit" title="Szerkesztés">✎</button>' +
          '<button class="icon-btn icon-danger" data-act="del" title="Törlés">🗑</button>' +
        '</div>';
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
    var dl = $('#cat-list');
    if (!dl) return;
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
    $('#modal-err').textContent = '';
    refreshCatList();
    $('#product-modal').hidden = false;
    setTimeout(function () { $('#m-name').focus(); }, 30);
  }
  function closeModal() { $('#product-modal').hidden = true; editingId = null; }

  $('#add-product').addEventListener('click', function () { openModal(null); });
  $('#modal-cancel').addEventListener('click', closeModal);
  $('#product-modal').addEventListener('click', function (e) { if (e.target === this) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#product-modal').hidden) closeModal(); });

  $('#modal-save').addEventListener('click', function () {
    var name = $('#m-name').value.trim();
    var price = parseInt($('#m-price').value, 10);
    if (!name) { $('#modal-err').textContent = 'A megnevezés kötelező.'; return; }
    if (isNaN(price) || price < 0) { $('#modal-err').textContent = 'Adj meg érvényes árat.'; return; }
    var data = {
      name: name,
      desc: $('#m-desc').value.trim(),
      price: price,
      category: $('#m-category').value.trim(),
      emoji: $('#m-emoji').value.trim() || '📦'
    };
    if (editingId) {
      cfg.products = cfg.products.map(function (p) { return p.id === editingId ? Object.assign(p, data) : p; });
    } else {
      data.id = S.uid();
      cfg.products.push(data);
    }
    markDirty(); renderProductList(); closeModal();
  });

  /* ============================================================
     SAVE / ACCOUNT / RESET
     ============================================================ */
  $('#save-btn').addEventListener('click', function () {
    // pull latest simple fields
    cfg.name = $('#f-name').value;
    cfg.tagline = $('#f-tagline').value;
    cfg.heroTitle = $('#f-heroTitle').value;
    cfg.heroText = $('#f-heroText').value;
    cfg.currency = $('#f-currency').value || 'Ft';
    cfg.freeShippingOver = parseInt($('#f-freeShippingOver').value, 10) || 0;
    S.saveConfig(cfg);
    markClean();
  });

  $('#save-account').addEventListener('click', function () {
    var u = $('#f-acc-user').value.trim();
    var p = $('#f-acc-pass').value;
    if (!u) { setNote('#account-note', 'A felhasználónév nem lehet üres.', false); return; }
    var cur = S.getCredentials();
    S.setCredentials(u, p ? p : cur.pass);
    $('#f-acc-pass').value = '';
    setNote('#account-note', 'Belépési adatok mentve. ✓', true);
  });

  $('#reset-btn').addEventListener('click', function () {
    if (!confirm('Biztosan visszaállítasz mindent az alapértelmezettre? Ez nem vonható vissza.')) return;
    cfg = S.resetConfig();
    hydrateForms();
    S.applyTheme(cfg);
    setNote('#reset-note', 'Beállítások visszaállítva. ✓', true);
    markClean();
  });

  function setNote(sel, msg, ok) {
    var el = $(sel);
    if (!el) return;
    el.textContent = msg;
    el.className = 'admin-inline-note ' + (ok ? 'ok' : 'err');
  }

  /* warn before leaving with unsaved changes */
  window.addEventListener('beforeunload', function (e) {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  function escAttr(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // initial theme apply for preview
  S.applyTheme(cfg);
})();
