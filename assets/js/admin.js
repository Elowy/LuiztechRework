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
  var ticketsLoaded = false;

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
      if (name === 'news' && !newsLoaded) loadNews();
      if (name === 'references' && !refsLoaded) loadReferences();
      if (name === 'faq' && !faqLoaded) loadFaq();
      if (name === 'messages' && !messagesLoaded) loadMessages();
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
        '<span class="pa-meta">' + escAttr(p.category || '—') + ' · ' + S.formatPrice(p.price, cfg) +
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
    $('#m-desc').value = p ? (p.desc || '') : '';
    $('#m-price').value = p ? p.price : '';
    $('#m-category').value = p ? (p.category || '') : '';
    $('#m-stock').value = (p && p.stock != null) ? p.stock : '';
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
    var data = { name: name, desc: $('#m-desc').value.trim(), price: price, category: $('#m-category').value.trim(), stock: stock, emoji: $('#m-emoji').value.trim() || '📦', image: $('#m-image').value || '' };
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
          .catch(function (e) { if (e.status === 401) { S.logout(); location.reload(); } });
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
      if (e.status === 401) { S.logout(); location.reload(); return; }
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
          '<span class="news-admin-title">' + escAttr(r.title) + (r.url ? ' 🔗' : '') + '</span>' +
          '<span class="news-admin-date">' + escAttr(r.tag || '—') + (r.info ? ' · ' + escAttr(r.info) : '') + '</span>' +
        '</div>' +
        '<div class="pa-actions">' +
          '<button class="icon-btn" data-act="edit" title="Szerkesztés">✎</button>' +
          '<button class="icon-btn icon-danger" data-act="del" title="Törlés">🗑</button></div>';
      row.querySelector('[data-act="edit"]').addEventListener('click', function () { openRefModal(r); });
      row.querySelector('[data-act="del"]').addEventListener('click', function () {
        if (!confirm('Biztosan törlöd: "' + r.title + '"?')) return;
        S.deleteReference(r.id).then(function () { refItems = refItems.filter(function (x) { return x.id !== r.id; }); renderReferenceList(); })
          .catch(function (e) { if (e.status === 401) { S.logout(); location.reload(); } });
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
      details: $('#r-details').value.trim(), info: $('#r-info').value.trim(), url: $('#r-url').value.trim()
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
      if (e.status === 401) { S.logout(); location.reload(); return; }
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
          .catch(function (e) { if (e.status === 401) { S.logout(); location.reload(); } });
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
    }).catch(function (e) { btn.disabled = false; if (e.status === 401) { S.logout(); location.reload(); return; } $('#faq-modal-err').textContent = e.message || 'Mentés sikertelen.'; });
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
            .catch(function (e) { if (e.status === 401) { S.logout(); location.reload(); } });
        });
        card.querySelector('[data-del]').addEventListener('click', function () {
          if (!confirm('Törlöd ezt az üzenetet?')) return;
          S.deleteMessage(m.id).then(function () { card.remove(); }).catch(function () {});
        });
        wrap.appendChild(card);
      });
    }).catch(function (e) { if (e.status === 401) { S.logout(); location.reload(); return; } wrap.innerHTML = '<p class="admin-inline-note err">Nem sikerült betölteni.</p>'; });
  }
  $('#refresh-messages').addEventListener('click', loadMessages);

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
    }).catch(function (e) { if (e.status === 401) { S.logout(); location.reload(); return; } wrap.innerHTML = '<p class="admin-inline-note err">Nem sikerült betölteni.</p>'; });
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
          .catch(function (e) { btn.disabled = false; if (e.status === 401) { S.logout(); location.reload(); return; } setNote('#ticket-reply-note', 'Hiba a küldéskor.', false); });
      });
    }).catch(function (e) { if (e.status === 401) { S.logout(); location.reload(); return; } wrap.innerHTML = '<p class="admin-inline-note err">Nem sikerült betölteni.</p>'; });
  }
  $('#refresh-tickets').addEventListener('click', loadTickets);

  /* ============================================================
     ORDERS
     ============================================================ */
  var ORDER_STATUSES = ['Új', 'Feldolgozás alatt', 'Teljesítve', 'Törölve'];
  function statusClass(s) {
    return {
      'Új': 'st-new', 'Feldolgozás alatt': 'st-progress', 'Teljesítve': 'st-done', 'Törölve': 'st-cancelled',
      'Folyamatban': 'st-progress', 'Lezárt': 'st-done',
      'Nyitott': 'st-new', 'Válaszra vár': 'st-progress', 'Megoldva': 'st-done'
    }[s] || 'st-new';
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
