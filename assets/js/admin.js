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
  var newsLoaded = false;
  var newsItems = [];
  var refsLoaded = false;
  var refItems = [];
  var faqLoaded = false;
  var faqItems = [];
  var messagesLoaded = false;
  var reviewsLoaded = false;
  var ticketsLoaded = false;
  var customersLoaded = false;
  var customersData = [];
  var couponsLoaded = false;
  var ordersData = [];

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
    return loadConfig().then(function () { loadDashboard(); });
  }

  // Egységes belépés: ugyanaz a fiók-rendszer, mint a webshopon.
  // Admin jogot az ADMIN_EMAIL fiók kap (a backend isAdmin jelzéssel).
  S.customerMe().then(function (u) { if (u && u.isAdmin) showApp(); });

  $('#login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('#login-email').value.trim();
    var p = $('#login-pass').value;
    var remember = !!($('#login-remember') && $('#login-remember').checked);
    var btn = $('#login-form button[type="submit"]');
    btn.disabled = true;
    $('#login-error').textContent = '';
    S.loginCustomer(email, p, remember).then(function (res) {
      btn.disabled = false;
      if (res.error) { $('#login-error').textContent = res.error; $('#login-pass').value = ''; return; }
      if (!res.user || !res.user.isAdmin) {
        $('#login-error').textContent = 'Ez a fiók nem rendelkezik admin jogosultsággal.';
        $('#login-pass').value = '';
        S.logoutCustomer();
        return;
      }
      showApp();
    }).catch(function () {
      btn.disabled = false;
      $('#login-error').textContent = 'Nem sikerült bejelentkezni. Próbáld újra.';
    });
  });

  $('#logout-btn').addEventListener('click', function () {
    if (dirty && !confirm('Mentetlen módosításaid vannak. Biztosan kilépsz?')) return;
    dirty = false;
    S.logoutCustomer().then(function () { location.reload(); });
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
      if (name === 'dashboard') loadDashboard();
      if (name === 'orders' && !ordersLoaded) loadOrders();
      if (name === 'customers' && !customersLoaded) loadCustomers();
      if (name === 'coupons' && !couponsLoaded) loadCoupons();
      if (name === 'news' && !newsLoaded) loadNews();
      if (name === 'references' && !refsLoaded) loadReferences();
      if (name === 'faq' && !faqLoaded) loadFaq();
      if (name === 'messages' && !messagesLoaded) loadMessages();
      if (name === 'reviews' && !reviewsLoaded) loadReviews();
      if (name === 'support' && !ticketsLoaded) loadTickets();
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
      if (e.status === 401) { S.logoutCustomer(); location.reload(); }
    });
  }

  function hydrateForms() {
    setVal('#f-name', cfg.name); setVal('#f-tagline', cfg.tagline);
    setVal('#f-heroTitle', cfg.heroTitle); setVal('#f-heroText', cfg.heroText);
    setVal('#f-currency', cfg.currency);
    setVal('#f-metaTitle', cfg.metaTitle);
    setVal('#f-metaDescription', cfg.metaDescription);
    setVal('#f-gaId', cfg.gaMeasurementId);
    setVal('#f-notifyEmail', cfg.notifyEmail);
    setVal('#f-contactPhone', cfg.contactPhone);
    setVal('#f-contactViber', cfg.contactViber);
    setVal('#f-contactWhatsapp', cfg.contactWhatsapp);
    setVal('#f-contactMessenger', cfg.contactMessenger);
    setVal('#f-contactEmail', cfg.contactEmail);
    var btt = $('#f-backToTop'); if (btt) btt.checked = cfg.backToTop !== false;
    setVal('#f-accent', cfg.accent); setVal('#f-accent-hex', cfg.accent);
    setVal('#f-accent2', cfg.accent2); setVal('#f-accent2-hex', cfg.accent2);
    setTheme(cfg.theme);
    setVal('#f-szamlazz', '');          // titkos kulcsot soha nem töltünk vissza
    setVal('#f-stripe', '');
    updateSzamlazzNote();
    updateStripeNote();
    buildSwatches();
    renderProductList();
    updatePreview();
    S.applyTheme(cfg);
  }

  function updateSzamlazzNote() {
    var note = $('#szamlazz-note'); if (!note) return;
    var set = !!cfg.szamlazzAgentKeySet;
    note.textContent = set ? '✓ Be van állítva' : 'Nincs beállítva';
    note.className = 'admin-inline-note ' + (set ? 'ok' : '');
  }
  function updateStripeNote() {
    var note = $('#stripe-note'); if (!note) return;
    var set = !!cfg.stripeSecretKeySet;
    note.textContent = set ? '✓ Be van állítva — kártyás fizetés aktív' : 'Nincs beállítva';
    note.className = 'admin-inline-note ' + (set ? 'ok' : '');
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
  // Mentendő-jelzés a kapcsolati / értesítési mezőkre is (mentéskor a DOM-ból olvassuk ki)
  ['#f-notifyEmail', '#f-metaTitle', '#f-metaDescription', '#f-gaId', '#f-contactPhone', '#f-contactViber', '#f-contactWhatsapp', '#f-contactMessenger', '#f-contactEmail', '#f-szamlazz', '#f-stripe'].forEach(function (sel) {
    var el = $(sel); if (el) el.addEventListener('input', markDirty);
  });
  var bttEl = $('#f-backToTop'); if (bttEl) bttEl.addEventListener('change', markDirty);

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
        '<span class="pa-emoji">' + (p.image ? '<img src="' + escAttr(p.image) + '" alt="">' : escAttr(p.emoji || '📦')) + '</span>' +
        '<div class="pa-info"><span class="pa-name">' + escAttr(p.name) + '</span>' +
        '<span class="pa-meta">' + escAttr(p.category || '—') + ' · ' +
          (S.isOnSale(p)
            ? '<span class="price-old">' + S.formatPrice(p.price, cfg) + '</span> ' + S.formatPrice(p.salePrice, cfg) + ' 🏷-' + S.discountPct(p) + '%'
            : S.formatPrice(p.price, cfg)) +
          ' · ' + (p.stock == null ? 'korlátlan' : (p.stock === 0 ? '⚠ elfogyott' : p.stock + ' db')) + '</span></div>' +
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
    $('#m-name-en').value = p ? (p.nameEn || '') : '';
    $('#m-desc').value = p ? (p.desc || '') : '';
    $('#m-desc-en').value = p ? (p.descEn || '') : '';
    $('#m-longdesc').value = p ? (p.longDesc || '') : '';
    $('#m-longdesc-en').value = p ? (p.longDescEn || '') : '';
    $('#m-price').value = p ? p.price : '';
    $('#m-category').value = p ? (p.category || '') : '';
    $('#m-stock').value = (p && p.stock != null) ? p.stock : '';
    $('#m-saleprice').value = (p && p.salePrice != null) ? p.salePrice : '';
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
    var stockRaw = $('#m-stock').value.trim();
    var stock = stockRaw === '' ? null : Math.max(0, parseInt(stockRaw, 10) || 0);
    var saleRaw = $('#m-saleprice').value.trim();
    var salePrice = saleRaw === '' ? null : Math.max(0, parseInt(saleRaw, 10) || 0);
    if (salePrice != null && salePrice >= price) { $('#modal-err').textContent = 'Az akciós árnak kisebbnek kell lennie a normál árnál.'; return; }
    var data = { name: name, desc: $('#m-desc').value.trim(), longDesc: $('#m-longdesc').value.trim(), nameEn: $('#m-name-en').value.trim(), descEn: $('#m-desc-en').value.trim(), longDescEn: $('#m-longdesc-en').value.trim(), price: price, category: $('#m-category').value.trim(), stock: stock, salePrice: salePrice, emoji: $('#m-emoji').value.trim() || '📦', image: $('#m-image').value || '' };
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
    cfg.metaTitle = $('#f-metaTitle').value.trim();
    cfg.metaDescription = $('#f-metaDescription').value.trim();
    cfg.gaMeasurementId = $('#f-gaId').value.trim();
    cfg.notifyEmail = $('#f-notifyEmail').value.trim();
    cfg.contactPhone = $('#f-contactPhone').value.trim();
    cfg.contactViber = $('#f-contactViber').value.trim();
    cfg.contactWhatsapp = $('#f-contactWhatsapp').value.trim();
    cfg.contactMessenger = $('#f-contactMessenger').value.trim();
    cfg.contactEmail = $('#f-contactEmail').value.trim();
    cfg.backToTop = !($('#f-backToTop') && !$('#f-backToTop').checked);
    var szk = $('#f-szamlazz').value.trim();
    if (szk) cfg.szamlazzAgentKey = szk; else delete cfg.szamlazzAgentKey;  // üres → ne írjuk felül
    var stk = $('#f-stripe').value.trim();
    if (stk) cfg.stripeSecretKey = stk; else delete cfg.stripeSecretKey;    // üres → ne írjuk felül
    var btn = $('#save-btn'); btn.disabled = true;
    S.saveConfig(cfg).then(function (saved) {
      if (saved) { cfg = Object.assign(S.clone(S.DEFAULT_CONFIG), saved); if (!Array.isArray(cfg.products)) cfg.products = []; }
      setVal('#f-szamlazz', ''); setVal('#f-stripe', ''); updateSzamlazzNote(); updateStripeNote();
      markClean();
    }).catch(function (e) {
      if (e.status === 401) { S.logoutCustomer(); location.reload(); return; }
      setNote('#save-state', 'Mentés sikertelen.', false);
    }).then(function () { btn.disabled = false; });
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
     NEWS
     ============================================================ */
  function loadNews() {
    var wrap = $('#news-admin-list');
    wrap.innerHTML = '<p class="admin-desc">Betöltés...</p>';
    S.getNews().then(function (items) {
      newsLoaded = true;
      newsItems = items || [];
      renderNewsList();
    }).catch(function () { wrap.innerHTML = '<p class="admin-inline-note err">Nem sikerült betölteni a híreket.</p>'; });
  }
  function renderNewsList() {
    var wrap = $('#news-admin-list');
    wrap.innerHTML = '';
    if (!newsItems.length) { wrap.innerHTML = '<p class="admin-desc">Még nincs hír. Adj hozzá egyet!</p>'; return; }
    newsItems.forEach(function (n) {
      var row = document.createElement('div');
      row.className = 'news-admin-row';
      row.innerHTML =
        '<div class="news-admin-info">' +
          '<span class="news-admin-title">' + escAttr(n.title) + '</span>' +
          '<span class="news-admin-date">' + escAttr(n.date || '') + '</span>' +
        '</div>' +
        '<div class="pa-actions">' +
          '<button class="icon-btn" data-act="edit" title="Szerkesztés">✎</button>' +
          '<button class="icon-btn icon-danger" data-act="del" title="Törlés">🗑</button></div>';
      row.querySelector('[data-act="edit"]').addEventListener('click', function () { openNewsModal(n); });
      row.querySelector('[data-act="del"]').addEventListener('click', function () {
        if (!confirm('Biztosan törlöd: "' + n.title + '"?')) return;
        S.deleteNews(n.id).then(function () { newsItems = newsItems.filter(function (x) { return x.id !== n.id; }); renderNewsList(); })
          .catch(function (e) { if (e.status === 401) { S.logoutCustomer(); location.reload(); } });
      });
      wrap.appendChild(row);
    });
  }
  function openNewsModal(n) {
    $('#news-modal-title').textContent = n ? 'hír szerkesztése' : 'új hír';
    $('#n-id').value = n ? n.id : '';
    $('#n-title').value = n ? n.title : '';
    $('#n-date').value = n ? (n.date || '').slice(0, 10) : new Date().toISOString().slice(0, 10);
    $('#n-body').value = n ? (n.body || '') : '';
    $('#news-modal-err').textContent = '';
    $('#news-modal').hidden = false;
    setTimeout(function () { $('#n-title').focus(); }, 30);
  }
  function closeNewsModal() { $('#news-modal').hidden = true; }
  $('#add-news').addEventListener('click', function () { openNewsModal(null); });
  $('#news-modal-cancel').addEventListener('click', closeNewsModal);
  $('#news-modal').addEventListener('click', function (e) { if (e.target === this) closeNewsModal(); });
  $('#news-modal-save').addEventListener('click', function () {
    var title = $('#n-title').value.trim();
    if (!title) { $('#news-modal-err').textContent = 'A cím kötelező.'; return; }
    var payload = { title: title, date: $('#n-date').value, body: $('#n-body').value.trim() };
    var id = $('#n-id').value;
    var btn = $('#news-modal-save'); btn.disabled = true;
    var p = id ? S.updateNews(id, payload) : S.addNews(payload);
    p.then(function (item) {
      btn.disabled = false;
      if (id) newsItems = newsItems.map(function (x) { return x.id === id ? item : x; });
      else newsItems.unshift(item);
      renderNewsList(); closeNewsModal();
    }).catch(function (e) {
      btn.disabled = false;
      if (e.status === 401) { S.logoutCustomer(); location.reload(); return; }
      $('#news-modal-err').textContent = e.message || 'Mentés sikertelen.';
    });
  });

  /* ============================================================
     REFERENCES
     ============================================================ */
  function loadReferences() {
    var wrap = $('#reference-admin-list');
    wrap.innerHTML = '<p class="admin-desc">Betöltés...</p>';
    S.getReferences().then(function (items) {
      refsLoaded = true;
      refItems = items || [];
      renderReferenceList();
    }).catch(function () { wrap.innerHTML = '<p class="admin-inline-note err">Nem sikerült betölteni a referenciákat.</p>'; });
  }
  function renderReferenceList() {
    var wrap = $('#reference-admin-list');
    wrap.innerHTML = '';
    if (!refItems.length) { wrap.innerHTML = '<p class="admin-desc">Még nincs referencia. Adj hozzá egyet!</p>'; return; }
    refItems.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'news-admin-row';
      row.innerHTML =
        '<div class="news-admin-info">' +
          '<span class="news-admin-title">' + (r.new ? '🆕 ' : '') + (r.gold ? '✨ ' : '') + escAttr(r.title) + (r.url ? ' 🔗' : '') + '</span>' +
          '<span class="news-admin-date">' + escAttr(r.tag || '—') + (r.info ? ' · ' + escAttr(r.info) : '') + '</span>' +
        '</div>' +
        '<div class="pa-actions">' +
          '<button class="icon-btn" data-act="edit" title="Szerkesztés">✎</button>' +
          '<button class="icon-btn icon-danger" data-act="del" title="Törlés">🗑</button></div>';
      row.querySelector('[data-act="edit"]').addEventListener('click', function () { openRefModal(r); });
      row.querySelector('[data-act="del"]').addEventListener('click', function () {
        if (!confirm('Biztosan törlöd: "' + r.title + '"?')) return;
        S.deleteReference(r.id).then(function () { refItems = refItems.filter(function (x) { return x.id !== r.id; }); renderReferenceList(); })
          .catch(function (e) { if (e.status === 401) { S.logoutCustomer(); location.reload(); } });
      });
      wrap.appendChild(row);
    });
  }
  function openRefModal(r) {
    $('#reference-modal-title').textContent = r ? 'referencia szerkesztése' : 'új referencia';
    $('#r-id').value = r ? r.id : '';
    $('#r-title').value = r ? r.title : '';
    $('#r-tag').value = r ? (r.tag || '') : '';
    $('#r-description').value = r ? (r.description || '') : '';
    $('#r-details').value = r ? (r.details || '') : '';
    $('#r-info').value = r ? (r.info || '') : '';
    $('#r-url').value = r ? (r.url || '') : '';
    $('#r-gold').checked = r ? !!r.gold : false;
    $('#r-new').checked = r ? !!r.new : false;
    $('#reference-modal-err').textContent = '';
    $('#reference-modal').hidden = false;
    setTimeout(function () { $('#r-title').focus(); }, 30);
  }
  function closeRefModal() { $('#reference-modal').hidden = true; }
  $('#add-reference').addEventListener('click', function () { openRefModal(null); });
  $('#reference-modal-cancel').addEventListener('click', closeRefModal);
  $('#reference-modal').addEventListener('click', function (e) { if (e.target === this) closeRefModal(); });
  $('#reference-modal-save').addEventListener('click', function () {
    var title = $('#r-title').value.trim();
    if (!title) { $('#reference-modal-err').textContent = 'A cím kötelező.'; return; }
    var payload = {
      title: title, tag: $('#r-tag').value.trim(), description: $('#r-description').value.trim(),
      details: $('#r-details').value.trim(), info: $('#r-info').value.trim(), url: $('#r-url').value.trim(),
      gold: $('#r-gold').checked, new: $('#r-new').checked
    };
    var id = $('#r-id').value;
    var btn = $('#reference-modal-save'); btn.disabled = true;
    var p = id ? S.updateReference(id, payload) : S.addReference(payload);
    p.then(function (item) {
      btn.disabled = false;
      if (id) refItems = refItems.map(function (x) { return x.id === id ? item : x; });
      else refItems.push(item);
      renderReferenceList(); closeRefModal();
    }).catch(function (e) {
      btn.disabled = false;
      if (e.status === 401) { S.logoutCustomer(); location.reload(); return; }
      $('#reference-modal-err').textContent = e.message || 'Mentés sikertelen.';
    });
  });

  /* ============================================================
     FAQ
     ============================================================ */
  function loadFaq() {
    var wrap = $('#faq-admin-list');
    wrap.innerHTML = '<p class="admin-desc">Betöltés...</p>';
    S.getFaq().then(function (items) {
      faqLoaded = true; faqItems = items || []; renderFaqList();
    }).catch(function () { wrap.innerHTML = '<p class="admin-inline-note err">Nem sikerült betölteni.</p>'; });
  }
  function renderFaqList() {
    var wrap = $('#faq-admin-list'); wrap.innerHTML = '';
    if (!faqItems.length) { wrap.innerHTML = '<p class="admin-desc">Még nincs kérdés. Adj hozzá egyet!</p>'; return; }
    faqItems.forEach(function (f) {
      var row = document.createElement('div');
      row.className = 'news-admin-row';
      row.innerHTML = '<div class="news-admin-info"><span class="news-admin-title">' + escAttr(f.question) + '</span></div>' +
        '<div class="pa-actions"><button class="icon-btn" data-act="edit" title="Szerkesztés">✎</button>' +
        '<button class="icon-btn icon-danger" data-act="del" title="Törlés">🗑</button></div>';
      row.querySelector('[data-act="edit"]').addEventListener('click', function () { openFaqModal(f); });
      row.querySelector('[data-act="del"]').addEventListener('click', function () {
        if (!confirm('Biztosan törlöd?')) return;
        S.deleteFaq(f.id).then(function () { faqItems = faqItems.filter(function (x) { return x.id !== f.id; }); renderFaqList(); })
          .catch(function (e) { if (e.status === 401) { S.logoutCustomer(); location.reload(); } });
      });
      wrap.appendChild(row);
    });
  }
  function openFaqModal(f) {
    $('#faq-modal-title').textContent = f ? 'kérdés szerkesztése' : 'új kérdés';
    $('#fq-id').value = f ? f.id : '';
    $('#fq-question').value = f ? f.question : '';
    $('#fq-answer').value = f ? (f.answer || '') : '';
    $('#faq-modal-err').textContent = '';
    $('#faq-modal').hidden = false;
    setTimeout(function () { $('#fq-question').focus(); }, 30);
  }
  $('#add-faq').addEventListener('click', function () { openFaqModal(null); });
  $('#faq-modal-cancel').addEventListener('click', function () { $('#faq-modal').hidden = true; });
  $('#faq-modal').addEventListener('click', function (e) { if (e.target === this) this.hidden = true; });
  $('#faq-modal-save').addEventListener('click', function () {
    var q = $('#fq-question').value.trim();
    if (!q) { $('#faq-modal-err').textContent = 'A kérdés kötelező.'; return; }
    var payload = { question: q, answer: $('#fq-answer').value.trim() };
    var id = $('#fq-id').value;
    var btn = $('#faq-modal-save'); btn.disabled = true;
    var p = id ? S.updateFaq(id, payload) : S.addFaq(payload);
    p.then(function (item) {
      btn.disabled = false;
      if (id) faqItems = faqItems.map(function (x) { return x.id === id ? item : x; });
      else faqItems.push(item);
      renderFaqList(); $('#faq-modal').hidden = true;
    }).catch(function (e) { btn.disabled = false; if (e.status === 401) { S.logoutCustomer(); location.reload(); return; } $('#faq-modal-err').textContent = e.message || 'Mentés sikertelen.'; });
  });

  /* ============================================================
     MESSAGES / LEADS
     ============================================================ */
  var MESSAGE_STATUSES = ['Új', 'Folyamatban', 'Lezárt'];
  function loadMessages() {
    var wrap = $('#messages-list');
    wrap.innerHTML = '<p class="admin-desc">Betöltés...</p>';
    S.getMessages().then(function (data) {
      messagesLoaded = true;
      if (data.statuses && data.statuses.length) MESSAGE_STATUSES = data.statuses;
      var list = data.messages || [];
      if (!list.length) { wrap.innerHTML = '<p class="admin-desc">Még nincs üzenet.</p>'; return; }
      wrap.innerHTML = '';
      list.forEach(function (m) {
        var when = ''; try { when = new Date(m.createdAt).toLocaleString('hu-HU'); } catch (e) { when = m.createdAt || ''; }
        var opts = MESSAGE_STATUSES.map(function (s) { return '<option value="' + escAttr(s) + '"' + (s === m.status ? ' selected' : '') + '>' + escAttr(s) + '</option>'; }).join('');
        var card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML =
          '<div class="order-head"><span class="status-badge ' + statusClass(m.status) + '" data-badge>' + escAttr(m.status) + '</span>' +
            '<span class="order-meta" style="margin-left:auto">' + when + '</span></div>' +
          '<div class="order-contact">👤 ' + escAttr(m.name) + ' · <a href="mailto:' + escAttr(m.email) + '">' + escAttr(m.email) + '</a>' + (m.topic ? ' · ' + escAttr(m.topic) : '') + '</div>' +
          '<div class="order-items" style="white-space:pre-wrap">' + escAttr(m.message) + '</div>' +
          '<div class="order-status-row"><label>Státusz:</label><select class="order-status-select">' + opts + '</select>' +
            '<button class="icon-btn icon-danger" data-del title="Törlés">🗑</button></div>';
        var sel = card.querySelector('.order-status-select');
        var badge = card.querySelector('[data-badge]');
        sel.addEventListener('change', function () {
          S.updateMessageStatus(m.id, sel.value).then(function () { badge.textContent = sel.value; badge.className = 'status-badge ' + statusClass(sel.value); })
            .catch(function (e) { if (e.status === 401) { S.logoutCustomer(); location.reload(); } });
        });
        card.querySelector('[data-del]').addEventListener('click', function () {
          if (!confirm('Törlöd ezt az üzenetet?')) return;
          S.deleteMessage(m.id).then(function () { card.remove(); }).catch(function () {});
        });
        wrap.appendChild(card);
      });
    }).catch(function (e) { if (e.status === 401) { S.logoutCustomer(); location.reload(); return; } wrap.innerHTML = '<p class="admin-inline-note err">Nem sikerült betölteni.</p>'; });
  }
  $('#refresh-messages').addEventListener('click', loadMessages);

  /* ============================================================
     TERMÉKVÉLEMÉNYEK (moderálás)
     ============================================================ */
  var REVIEW_STATUS_HU = { pending: 'Moderálásra vár', approved: 'Jóváhagyva', rejected: 'Elutasítva' };
  function loadReviews() {
    var wrap = $('#reviews-list');
    wrap.innerHTML = '<p class="admin-desc">Betöltés...</p>';
    S.getAdminReviews().then(function (data) {
      reviewsLoaded = true;
      var list = (data && data.reviews) || [];
      if (!list.length) { wrap.innerHTML = '<p class="admin-desc">Még nincs vélemény.</p>'; return; }
      wrap.innerHTML = '';
      list.forEach(function (r) {
        var when = ''; try { when = new Date(r.createdAt).toLocaleString('hu-HU'); } catch (e) { when = r.createdAt || ''; }
        var stars = ''; for (var i = 1; i <= 5; i++) stars += (i <= r.rating ? '★' : '☆');
        var card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML =
          '<div class="order-head"><span class="status-badge ' + statusClass(r.status) + '" data-badge>' + escAttr(REVIEW_STATUS_HU[r.status] || r.status) + '</span>' +
            '<span class="order-meta" style="margin-left:auto">' + when + '</span></div>' +
          '<div class="order-contact"><span class="rev-stars">' + stars + '</span> · 👤 ' + escAttr(r.author) + ' · 📦 ' + escAttr(r.productName || r.productId) + '</div>' +
          (r.body ? '<div class="order-items" style="white-space:pre-wrap">' + escAttr(r.body) + '</div>' : '') +
          '<div class="order-status-row">' +
            '<button class="btn btn-primary btn-sm" data-approve>Jóváhagyás</button>' +
            '<button class="btn btn-ghost btn-sm" data-reject>Elutasítás</button>' +
            '<button class="icon-btn icon-danger" data-del title="Törlés">🗑</button></div>';
        var badge = card.querySelector('[data-badge]');
        function setStatus(st) {
          S.setReviewStatus(r.id, st).then(function () {
            badge.textContent = REVIEW_STATUS_HU[st] || st; badge.className = 'status-badge ' + statusClass(st);
          }).catch(function (e) { if (e.status === 401) { S.logoutCustomer(); location.reload(); } });
        }
        card.querySelector('[data-approve]').addEventListener('click', function () { setStatus('approved'); });
        card.querySelector('[data-reject]').addEventListener('click', function () { setStatus('rejected'); });
        card.querySelector('[data-del]').addEventListener('click', function () {
          if (!confirm('Törlöd ezt a véleményt?')) return;
          S.deleteReview(r.id).then(function () { card.remove(); }).catch(function () {});
        });
        wrap.appendChild(card);
      });
    }).catch(function (e) { if (e.status === 401) { S.logoutCustomer(); location.reload(); return; } wrap.innerHTML = '<p class="admin-inline-note err">Nem sikerült betölteni.</p>'; });
  }
  $('#refresh-reviews').addEventListener('click', loadReviews);

  /* ============================================================
     SUPPORT TICKETS
     ============================================================ */
  var TICKET_STATUSES = ['Nyitott', 'Válaszra vár', 'Megoldva', 'Lezárt'];
  function loadTickets() {
    var wrap = $('#tickets-list');
    wrap.innerHTML = '<p class="admin-desc">Betöltés...</p>';
    S.getTickets().then(function (data) {
      ticketsLoaded = true;
      if (data.statuses && data.statuses.length) TICKET_STATUSES = data.statuses;
      var list = data.tickets || [];
      if (!list.length) { wrap.innerHTML = '<p class="admin-desc">Még nincs ticket.</p>'; return; }
      wrap.innerHTML = '';
      list.forEach(function (t) {
        var b = document.createElement('button');
        b.className = 'ticket-list-item';
        b.innerHTML = '<span class="ticket-subj">' + escAttr(t.subject) + '</span>' +
          '<span class="status-badge ' + statusClass(t.status) + '">' + escAttr(t.status) + '</span>';
        b.addEventListener('click', function () {
          $$('.ticket-list-item').forEach(function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          openTicket(t.id);
        });
        wrap.appendChild(b);
      });
    }).catch(function (e) { if (e.status === 401) { S.logoutCustomer(); location.reload(); return; } wrap.innerHTML = '<p class="admin-inline-note err">Nem sikerült betölteni.</p>'; });
  }
  function openTicket(id) {
    var wrap = $('#ticket-detail');
    wrap.innerHTML = '<p class="admin-desc">Betöltés...</p>';
    S.getTicket(id).then(function (t) {
      var msgs = (t.messages || []).map(function (m) {
        var when = ''; try { when = new Date(m.createdAt).toLocaleString('hu-HU'); } catch (e) {}
        return '<div class="tmsg ' + (m.author === 'admin' ? 'tmsg-admin' : 'tmsg-cust') + '">' +
          '<div class="tmsg-meta">' + (m.author === 'admin' ? 'Te (admin)' : 'Ügyfél') + ' · ' + when + '</div>' +
          '<div class="tmsg-body">' + escAttr(m.body) + '</div></div>';
      }).join('');
      var opts = TICKET_STATUSES.map(function (s) { return '<option value="' + escAttr(s) + '"' + (s === t.status ? ' selected' : '') + '>' + escAttr(s) + '</option>'; }).join('');
      wrap.innerHTML =
        '<div class="ticket-detail-head"><strong>' + escAttr(t.subject) + '</strong>' +
          '<select class="order-status-select" id="ticket-status">' + opts + '</select></div>' +
        '<div class="ticket-thread">' + msgs + '</div>' +
        '<div class="ticket-reply"><textarea id="ticket-reply-body" rows="3" placeholder="Válasz írása..."></textarea>' +
          '<button class="btn btn-primary btn-sm" id="ticket-reply-send">Válasz küldése</button>' +
          '<p class="admin-inline-note" id="ticket-reply-note"></p></div>';
      $('#ticket-status').addEventListener('change', function () {
        S.updateTicketStatus(id, this.value).then(function () { loadTickets(); }).catch(function () {});
      });
      $('#ticket-reply-send').addEventListener('click', function () {
        var body = $('#ticket-reply-body').value.trim();
        if (!body) { setNote('#ticket-reply-note', 'Az üzenet nem lehet üres.', false); return; }
        var btn = this; btn.disabled = true;
        S.replyTicket(id, body, $('#ticket-status').value).then(function () { btn.disabled = false; openTicket(id); loadTickets(); })
          .catch(function (e) { btn.disabled = false; if (e.status === 401) { S.logoutCustomer(); location.reload(); return; } setNote('#ticket-reply-note', 'Hiba a küldéskor.', false); });
      });
    }).catch(function (e) { if (e.status === 401) { S.logoutCustomer(); location.reload(); return; } wrap.innerHTML = '<p class="admin-inline-note err">Nem sikerült betölteni.</p>'; });
  }
  $('#refresh-tickets').addEventListener('click', loadTickets);

  /* ============================================================
     ORDERS
     ============================================================ */
  var ORDER_STATUSES = ['Új', 'Fizetésre vár', 'Fizetve', 'Feldolgozás alatt', 'Teljesítve', 'Törölve'];
  function statusClass(s) {
    return {
      'Új': 'st-new', 'Feldolgozás alatt': 'st-progress', 'Teljesítve': 'st-done', 'Törölve': 'st-cancelled',
      'Fizetésre vár': 'st-progress', 'Fizetve': 'st-done',
      'Folyamatban': 'st-progress', 'Lezárt': 'st-done',
      'Nyitott': 'st-new', 'Válaszra vár': 'st-progress', 'Megoldva': 'st-done'
    }[s] || 'st-new';
  }

  /* ============================================================
     DASHBOARD
     ============================================================ */
  function gotoTab(name) {
    var tab = $('.admin-tab[data-tab="' + name + '"]');
    if (tab) tab.click();
  }
  function loadDashboard() {
    var grid = $('#kpi-grid');
    var recent = $('#dash-recent');
    if (!grid) return;
    grid.innerHTML = '<p class="admin-desc">Betöltés...</p>';
    recent.innerHTML = '';
    Promise.all([
      S.getOrders().catch(function () { return { orders: [] }; }),
      S.getMessages().catch(function () { return { messages: [] }; }),
      S.getTickets().catch(function () { return { tickets: [] }; })
    ]).then(function (res) {
      var orders = (res[0] && res[0].orders) || [];
      var messages = (res[1] && res[1].messages) || [];
      var tickets = (res[2] && res[2].tickets) || [];

      var revenue = 0, newOrders = 0;
      orders.forEach(function (o) {
        if (o.status === 'Teljesítve') revenue += (o.total || 0);
        if (o.status === 'Új') newOrders++;
      });
      var newMsgs = messages.filter(function (m) { return m.status === 'Új'; }).length;
      var openTickets = tickets.filter(function (t) { return t.status === 'Nyitott' || t.status === 'Válaszra vár'; }).length;

      var cards = [
        { label: 'Rendelés összesen', value: orders.length, sub: newOrders + ' új', icon: '📥', tab: 'orders' },
        { label: 'Teljesített bevétel', value: S.formatPrice(revenue, cfg), sub: '', icon: '💰', tab: 'orders' },
        { label: 'Új üzenet', value: newMsgs, sub: messages.length + ' összesen', icon: '📨', tab: 'messages' },
        { label: 'Nyitott ticket', value: openTickets, sub: tickets.length + ' összesen', icon: '🎫', tab: 'support' },
        { label: 'Termék', value: (cfg.products || []).length, sub: '', icon: '📦', tab: 'products' }
      ];
      grid.innerHTML = '';
      cards.forEach(function (c) {
        var el = document.createElement('button');
        el.className = 'kpi-card';
        el.innerHTML = '<span class="kpi-icon">' + c.icon + '</span>' +
          '<span class="kpi-value">' + escAttr(String(c.value)) + '</span>' +
          '<span class="kpi-label">' + escAttr(c.label) + '</span>' +
          (c.sub ? '<span class="kpi-sub">' + escAttr(c.sub) + '</span>' : '');
        el.addEventListener('click', function () { gotoTab(c.tab); });
        grid.appendChild(el);
      });

      if (!orders.length) { recent.innerHTML = '<p class="admin-desc">Még nincs rendelés.</p>'; return; }
      recent.innerHTML = '';
      orders.slice(0, 5).forEach(function (o) {
        var when = ''; try { when = new Date(o.createdAt).toLocaleDateString('hu-HU'); } catch (e) {}
        var c = o.customer || {};
        var row = document.createElement('div');
        row.className = 'dash-order';
        row.innerHTML = '<span class="dash-order-id">' + escAttr(o.id) + '</span>' +
          '<span class="dash-order-cust">' + escAttr(c.name || '—') + '</span>' +
          '<span class="status-badge ' + statusClass(o.status || 'Új') + '">' + escAttr(o.status || 'Új') + '</span>' +
          '<span class="dash-order-total">' + S.formatPrice(o.total || 0, cfg) + '</span>' +
          '<span class="dash-order-when">' + when + '</span>';
        recent.appendChild(row);
      });
    });
  }
  $('#refresh-dashboard').addEventListener('click', loadDashboard);

  function loadOrders() {
    var wrap = $('#orders-list');
    wrap.innerHTML = '<p class="admin-desc">Betöltés...</p>';
    S.getOrders().then(function (data) {
      ordersLoaded = true;
      ordersData = data.orders || [];
      if (data.statuses && data.statuses.length) ORDER_STATUSES = data.statuses;
      // státusz-szűrő feltöltése
      var fsel = $('#orders-filter-status');
      if (fsel && fsel.options.length <= 1) {
        ORDER_STATUSES.forEach(function (s) {
          var o = document.createElement('option'); o.value = s; o.textContent = s; fsel.appendChild(o);
        });
      }
      renderOrders();
    }).catch(function (e) {
      if (e.status === 401) { S.logoutCustomer(); location.reload(); return; }
      wrap.innerHTML = '<p class="admin-inline-note err">Nem sikerült betölteni a rendeléseket.</p>';
    });
  }
  function filteredOrders() {
    var fstat = ($('#orders-filter-status') || {}).value || '';
    var q = (($('#orders-search') || {}).value || '').trim().toLowerCase();
    return ordersData.filter(function (o) {
      if (fstat && (o.status || 'Új') !== fstat) return false;
      if (q) {
        var c = o.customer || {};
        var hay = [o.id, c.name, c.email, c.phone].filter(Boolean).join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }
  function renderOrders() {
    var wrap = $('#orders-list');
    var orders = filteredOrders();
    if (!ordersData.length) { wrap.innerHTML = '<p class="admin-desc">Még nincs beérkezett rendelés.</p>'; return; }
    if (!orders.length) { wrap.innerHTML = '<p class="admin-desc">Nincs a szűrésnek megfelelő rendelés.</p>'; return; }
    wrap.innerHTML = '';
    orders.forEach(function (o) {
      var when = '';
      try { when = new Date(o.createdAt).toLocaleString('hu-HU'); } catch (e) { when = o.createdAt || ''; }
      var c = o.customer || {};
      var contact = [c.name, c.email, c.phone].filter(Boolean).map(escAttr).join(' · ');
      var status = o.status || 'Új';
      var opts = ORDER_STATUSES.map(function (s) {
        return '<option value="' + escAttr(s) + '"' + (s === status ? ' selected' : '') + '>' + escAttr(s) + '</option>';
      }).join('');
      // részletes tétel-bontás árakkal
      var rows = (o.items || []).map(function (it) {
        return '<div class="order-line"><span>' + escAttr(it.name) + ' × ' + it.qty + '</span>' +
          '<span>' + S.formatPrice((it.price || 0) * (it.qty || 1), cfg) + '</span></div>';
      }).join('');
      var discountRow = (o.discount && o.discount > 0)
        ? '<div class="order-line order-line-discount"><span>🎟️ Kupon' + (o.couponCode ? ' (' + escAttr(o.couponCode) + ')' : '') + '</span><span>−' + S.formatPrice(o.discount, cfg) + '</span></div>'
        : '';

      var card = document.createElement('div');
      card.className = 'order-card';
      card.innerHTML =
        '<div class="order-head">' +
          '<span class="order-id">' + escAttr(o.id) + '</span>' +
          '<span class="status-badge ' + statusClass(status) + '" data-badge>' + escAttr(status) + '</span>' +
          '<strong class="order-total">' + S.formatPrice(o.total, cfg) + '</strong>' +
        '</div>' +
        '<div class="order-lines">' + rows + discountRow + '</div>' +
        (contact ? '<div class="order-contact">👤 ' + contact + '</div>' : '') +
        (c.address ? '<div class="order-contact">📍 ' + escAttr(c.address) + '</div>' : '') +
        (o.invoiceNo ? '<div class="order-contact">🧾 Számla: ' + escAttr(o.invoiceNo) + '</div>' : '') +
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
          o.status = next;
          badge.textContent = next;
          badge.className = 'status-badge ' + statusClass(next);
          sel.disabled = false;
        }).catch(function (e) {
          sel.disabled = false;
          if (e.status === 401) { S.logoutCustomer(); location.reload(); return; }
          sel.value = status;
          alert('Nem sikerült frissíteni a státuszt.');
        });
      });
      wrap.appendChild(card);
    });
  }
  function exportOrdersCsv() {
    var orders = filteredOrders();
    if (!orders.length) { alert('Nincs exportálható rendelés.'); return; }
    var head = ['Azonosító', 'Dátum', 'Státusz', 'Név', 'E-mail', 'Telefon', 'Cím', 'Tételek', 'Kupon', 'Kedvezmény', 'Végösszeg', 'Számla'];
    function cell(v) { v = (v == null ? '' : String(v)).replace(/"/g, '""'); return '"' + v + '"'; }
    var lines = [head.map(cell).join(',')];
    orders.forEach(function (o) {
      var c = o.customer || {};
      var items = (o.items || []).map(function (it) { return it.name + ' x' + it.qty; }).join('; ');
      var when = ''; try { when = new Date(o.createdAt).toLocaleString('hu-HU'); } catch (e) { when = o.createdAt || ''; }
      lines.push([o.id, when, o.status || '', c.name || '', c.email || '', c.phone || '', c.address || '',
        items, o.couponCode || '', o.discount || 0, o.total || 0, o.invoiceNo || ''].map(cell).join(','));
    });
    var csv = '﻿' + lines.join('\r\n'); // BOM az Excel ékezetekhez
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'rendelesek-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 100);
  }
  $('#refresh-orders').addEventListener('click', loadOrders);
  $('#export-orders').addEventListener('click', exportOrdersCsv);
  var ofs = $('#orders-filter-status'); if (ofs) ofs.addEventListener('change', renderOrders);
  var osr = $('#orders-search'); if (osr) osr.addEventListener('input', renderOrders);

  /* ============================================================
     VÁSÁRLÓK
     ============================================================ */
  function loadCustomers() {
    var wrap = $('#customers-list');
    wrap.innerHTML = '<p class="admin-desc">Betöltés...</p>';
    S.getCustomers().then(function (data) {
      customersLoaded = true;
      customersData = (data && data.customers) || [];
      renderCustomers();
    }).catch(function (e) {
      if (e.status === 401) { S.logoutCustomer(); location.reload(); return; }
      wrap.innerHTML = '<p class="admin-inline-note err">Nem sikerült betölteni a vásárlókat.</p>';
    });
  }
  function renderCustomers() {
    var wrap = $('#customers-list');
    var q = (($('#customers-search') || {}).value || '').trim().toLowerCase();
    var list = customersData.filter(function (u) {
      if (!q) return true;
      return (u.name + ' ' + u.email).toLowerCase().indexOf(q) !== -1;
    });
    if (!customersData.length) { wrap.innerHTML = '<p class="admin-desc">Még nincs regisztrált vásárló.</p>'; return; }
    if (!list.length) { wrap.innerHTML = '<p class="admin-desc">Nincs a keresésnek megfelelő vásárló.</p>'; return; }
    wrap.innerHTML = '';
    list.forEach(function (u) {
      var reg = ''; try { reg = new Date(u.createdAt).toLocaleDateString('hu-HU'); } catch (e) { reg = ''; }
      var last = ''; if (u.lastOrder) { try { last = new Date(u.lastOrder).toLocaleDateString('hu-HU'); } catch (e) {} }
      var card = document.createElement('div');
      card.className = 'customer-card';
      card.innerHTML =
        '<div class="customer-main">' +
          '<strong class="customer-name">' + escAttr(u.name) + '</strong>' +
          '<a class="customer-email" href="mailto:' + escAttr(u.email) + '">' + escAttr(u.email) + '</a>' +
        '</div>' +
        '<div class="customer-stats">' +
          '<span class="customer-stat"><b>' + u.orders + '</b> rendelés</span>' +
          '<span class="customer-stat"><b>' + S.formatPrice(u.spent, cfg) + '</b> költés</span>' +
          '<span class="customer-stat">Reg.: ' + reg + '</span>' +
          (last ? '<span class="customer-stat">Utolsó: ' + last + '</span>' : '') +
        '</div>';
      wrap.appendChild(card);
    });
  }
  var rc = $('#refresh-customers'); if (rc) rc.addEventListener('click', loadCustomers);
  var cs = $('#customers-search'); if (cs) cs.addEventListener('input', renderCustomers);

  /* ============================================================
     KUPONOK
     ============================================================ */
  var couponsData = [];
  function loadCoupons() {
    var wrap = $('#coupons-list');
    wrap.innerHTML = '<p class="admin-desc">Betöltés...</p>';
    S.getCoupons().then(function (data) {
      couponsLoaded = true;
      couponsData = (data && data.coupons) || [];
      renderCoupons();
    }).catch(function (e) {
      if (e.status === 401) { S.logoutCustomer(); location.reload(); return; }
      wrap.innerHTML = '<p class="admin-inline-note err">Nem sikerült betölteni a kuponokat.</p>';
    });
  }
  function couponValueLabel(c) {
    return c.type === 'fixed' ? S.formatPrice(c.value, cfg) : (c.value + '%');
  }
  function renderCoupons() {
    var wrap = $('#coupons-list');
    if (!couponsData.length) { wrap.innerHTML = '<p class="admin-desc">Még nincs kupon. Hozz létre egyet a „+ Új kupon" gombbal.</p>'; return; }
    wrap.innerHTML = '';
    couponsData.forEach(function (c) {
      var meta = [];
      meta.push(couponValueLabel(c) + ' kedvezmény');
      if (c.minTotal > 0) meta.push('min. ' + S.formatPrice(c.minTotal, cfg));
      if (c.expiresAt) meta.push('lejár: ' + c.expiresAt);
      meta.push('felhasználva: ' + c.used + (c.maxUses > 0 ? ' / ' + c.maxUses : ''));
      var card = document.createElement('div');
      card.className = 'coupon-card' + (c.active ? '' : ' coupon-inactive');
      card.innerHTML =
        '<div class="coupon-main">' +
          '<span class="coupon-code">' + escAttr(c.code) + '</span>' +
          '<span class="status-badge ' + (c.active ? 'st-done' : 'st-cancelled') + '">' + (c.active ? 'Aktív' : 'Inaktív') + '</span>' +
        '</div>' +
        '<div class="coupon-meta">' + meta.map(escAttr).join(' · ') + '</div>' +
        '<div class="coupon-actions">' +
          '<button class="btn btn-ghost btn-sm" data-edit>Szerkesztés</button>' +
          '<button class="btn btn-ghost btn-sm coupon-del" data-del>Törlés</button>' +
        '</div>';
      card.querySelector('[data-edit]').addEventListener('click', function () { openCouponForm(c); });
      card.querySelector('[data-del]').addEventListener('click', function () {
        if (!confirm('Biztosan törlöd a(z) "' + c.code + '" kupont?')) return;
        S.deleteCoupon(c.code).then(loadCoupons).catch(function () { alert('Nem sikerült törölni.'); });
      });
      wrap.appendChild(card);
    });
  }
  function openCouponForm(c) {
    var form = $('#coupon-form');
    form.hidden = false;
    setVal('#cp-code', c ? c.code : '');
    setVal('#cp-type', c ? c.type : 'percent');
    setVal('#cp-value', c ? c.value : '');
    setVal('#cp-min', c ? c.minTotal : 0);
    setVal('#cp-max', c ? c.maxUses : 0);
    setVal('#cp-expires', c ? c.expiresAt : '');
    $('#cp-active').checked = c ? !!c.active : true;
    $('#cp-code').readOnly = !!c;   // meglévő kód nem szerkeszthető (kulcs)
    $('#coupon-form-note').textContent = '';
    $('#cp-code').focus();
  }
  var cnew = $('#coupon-new'); if (cnew) cnew.addEventListener('click', function () { openCouponForm(null); });
  var ccancel = $('#coupon-cancel'); if (ccancel) ccancel.addEventListener('click', function () { $('#coupon-form').hidden = true; });
  var cform = $('#coupon-form');
  if (cform) cform.addEventListener('submit', function (e) {
    e.preventDefault();
    var note = $('#coupon-form-note');
    var payload = {
      code: $('#cp-code').value.trim(),
      type: $('#cp-type').value,
      value: $('#cp-value').value,
      minTotal: $('#cp-min').value || 0,
      maxUses: $('#cp-max').value || 0,
      expiresAt: $('#cp-expires').value || '',
      active: $('#cp-active').checked,
    };
    S.saveCoupon(payload).then(function () {
      $('#coupon-form').hidden = true;
      loadCoupons();
    }).catch(function (err) {
      note.textContent = (err && err.message) || 'Nem sikerült menteni a kupont.';
      note.className = 'admin-inline-note err';
    });
  });

  /* warn before leaving with unsaved changes */
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  S.applyTheme(cfg);
})();
