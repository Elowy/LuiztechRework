/* ============================================================
   Luiz-Tech — interactions & code animations
   ============================================================ */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Apply the shop's chosen accent colours site-wide ----------
     A "színválasztó" (admin → Megjelenés) az accent színeket menti; itt
     a főoldal (és minden nem-admin oldal) átveszi ugyanazokat. */
  function hexToRgba(hex, a) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
    if (!m) return 'rgba(56,225,255,' + a + ')';
    const n = parseInt(m[1], 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  if (!document.body.classList.contains('admin-body') && typeof fetch === 'function') {
    fetch('/api/shop', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg) => {
        if (!cfg || !cfg.accent) return;
        const a = cfg.accent, b = cfg.accent2 || cfg.accent;
        const s = document.documentElement.style;
        s.setProperty('--accent', a);
        s.setProperty('--accent-2', b);
        s.setProperty('--accent-glow', hexToRgba(a, 0.35));
        s.setProperty('--grad', 'linear-gradient(135deg, ' + a + ' 0%, ' + b + ' 55%, ' + b + ' 100%)');
        s.setProperty('--grad-soft', 'linear-gradient(135deg, ' + hexToRgba(a, 0.14) + ', ' + hexToRgba(b, 0.14) + ')');
      })
      .catch(() => { /* nincs backend → marad az alap színséma */ });
  }

  /* ---------- Header scroll state + progress bar ---------- */
  const header = $('#site-header');
  const progress = $('#scroll-progress');

  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', y > 24);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const toggle = $('#nav-toggle');
  const nav = $('#main-nav');
  if (toggle && nav) {
    const close = () => {
      nav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Menü megnyitása');
    };
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Menü bezárása' : 'Menü megnyitása');
    });
    nav.addEventListener('click', (e) => { if (e.target.tagName === 'A') close(); });
  }

  /* ---------- Floating chat widget + robot mascot ---------- */
  if (!document.body.classList.contains('admin-body')) buildChatWidget();

  function buildChatWidget() {
    // Kapcsolati csatornák — töltsd ki a sajátoddal. Üres mező = nem jelenik meg.
    const CHAT = {
      whatsapp: '',            // pl. '36301234567' (ország+körzet, + és szóköz nélkül)
      viber: '36301954944',    // +36 30 195 4944
      messenger: '',           // Facebook-oldal felhasználóneve → m.me/<ez>
      phone: '',               // pl. '+36301234567' (SMS)
      email: 'info@luiz-tech.hu'
    };
    const channels = [];
    if (CHAT.whatsapp) channels.push({ label: 'WhatsApp', icon: '🟢', href: 'https://wa.me/' + CHAT.whatsapp, ext: true });
    if (CHAT.messenger) channels.push({ label: 'Messenger', icon: '💬', href: 'https://m.me/' + CHAT.messenger, ext: true });
    if (CHAT.viber) channels.push({ label: 'Viber', icon: '🟣', href: 'viber://chat?number=%2B' + CHAT.viber, ext: false });
    if (CHAT.phone) channels.push({ label: 'SMS küldése', icon: '✉️', href: 'sms:' + CHAT.phone, ext: false });
    if (CHAT.email) channels.push({ label: 'E-mail', icon: '📧', href: 'mailto:' + CHAT.email, ext: false });
    if ($('#contact')) channels.push({ label: 'Írj üzenetet', icon: '📝', href: '#contact', ext: false, form: true });

    const wrap = document.createElement('div');
    wrap.className = 'chat-widget';
    wrap.innerHTML =
      '<div class="chat-robot" aria-hidden="true">' + robotSVG() + '</div>' +
      '<div class="chat-popup" id="chat-popup" role="dialog" aria-label="Kapcsolat" hidden>' +
        '<div class="chat-popup-head">Hogyan segíthetünk? 👋</div>' +
        '<div class="chat-popup-body">' +
          channels.map((c) =>
            '<a class="chat-channel' + (c.form ? ' is-form' : '') + '" href="' + c.href + '"' +
            (c.ext ? ' target="_blank" rel="noopener"' : '') + '>' +
            '<span class="chat-channel-ic">' + c.icon + '</span>' + c.label + '</a>'
          ).join('') +
        '</div>' +
      '</div>' +
      '<button class="chat-fab" id="chat-fab" aria-label="Kapcsolat megnyitása" aria-expanded="false">' +
        '<span class="chat-fab-ic chat-fab-open">💬</span>' +
        '<span class="chat-fab-ic chat-fab-close">✕</span>' +
      '</button>';
    document.body.appendChild(wrap);

    const fab = $('#chat-fab');
    const pop = $('#chat-popup');
    const setOpen = (open) => {
      pop.hidden = !open;
      wrap.classList.toggle('open', open);
      fab.setAttribute('aria-expanded', String(open));
      fab.setAttribute('aria-label', open ? 'Kapcsolat bezárása' : 'Kapcsolat megnyitása');
    };
    fab.addEventListener('click', (e) => { e.stopPropagation(); setOpen(pop.hidden); });
    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    $$('.chat-channel.is-form', wrap).forEach((a) => a.addEventListener('click', () => setOpen(false)));
  }

  function robotSVG() {
    return '' +
      '<svg viewBox="0 0 64 64" width="56" height="56" class="robot-svg" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><linearGradient id="rgrad" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#38e1ff"/><stop offset="1" stop-color="#6c7bff"/>' +
        '</linearGradient></defs>' +
        '<line x1="32" y1="7" x2="32" y2="15" stroke="#6c7bff" stroke-width="2"/>' +
        '<circle cx="32" cy="6" r="3" fill="#00ffa3"/>' +
        '<rect x="16" y="14" width="32" height="24" rx="9" fill="url(#rgrad)"/>' +
        '<circle cx="25" cy="26" r="3.4" fill="#04121a"/><circle cx="39" cy="26" r="3.4" fill="#04121a"/>' +
        '<circle cx="26.2" cy="24.8" r="1" fill="#fff"/><circle cx="40.2" cy="24.8" r="1" fill="#fff"/>' +
        '<rect x="27" y="31.5" width="10" height="2.6" rx="1.3" fill="#04121a" opacity=".55"/>' +
        '<rect x="20" y="40" width="24" height="16" rx="6" fill="#0d1320" stroke="url(#rgrad)" stroke-width="2"/>' +
        '<circle cx="32" cy="48" r="2.6" fill="#00ffa3"/>' +
        '<rect x="9" y="42" width="8" height="3" rx="1.5" fill="#6c7bff"/>' +
        '<g class="robot-arm"><rect x="47" y="42" width="8" height="3" rx="1.5" fill="#6c7bff"/></g>' +
      '</svg>';
  }

  /* ---------- Scroll reveal (with stagger) ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !prefersReduced) {
    // assign stagger delay based on position among siblings
    revealEls.forEach((el) => {
      const siblings = Array.from(el.parentElement ? el.parentElement.children : []);
      const idx = siblings.indexOf(el);
      if (idx > -1) el.style.setProperty('--d', (Math.min(idx, 6) * 0.07) + 's');
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Animated counters ---------- */
  const counters = $$('[data-count]');
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && !prefersReduced) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { runCounter(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach((el) => { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
  }

  /* ---------- Terminal typing animation ---------- */
  const codeEl = $('#terminal-code');
  const caret = $('#terminal-caret');
  if (codeEl) {
    const lines = [
      { t: '$ ', cls: 't-prompt', wait: 0 },
      { t: 'git clone luiz-tech/projekt.git', cls: 't-cmd', nl: true },
      { t: '→ Klónozás... kész ✓', cls: 't-out', nl: true },
      { t: '', nl: true },
      { t: '$ ', cls: 't-prompt' },
      { t: 'npm run build', cls: 't-cmd', nl: true },
      { t: '✓ Webfejlesztés', cls: 't-ok', nl: true },
      { t: '✓ Kiberbiztonság', cls: 't-ok', nl: true },
      { t: '✓ Üzemeltetés', cls: 't-ok', nl: true },
      { t: '', nl: true },
      { t: '$ ', cls: 't-prompt' },
      { t: 'deploy --to production', cls: 't-cmd', nl: true },
      { t: '🚀 Élesítve 12 órán belül!', cls: 't-ok', nl: true },
      { t: '# Beszéljünk a projektedről', cls: 't-comment', nl: true },
    ];

    if (prefersReduced) {
      // render statically
      codeEl.innerHTML = lines.map((l) =>
        `<span class="${l.cls || ''}">${l.t}</span>` + (l.nl ? '\n' : '')
      ).join('');
      if (caret) caret.style.display = 'none';
    } else {
      let li = 0, ci = 0, current = null;
      const speed = 26;

      const type = () => {
        if (li >= lines.length) {
          // restart after a pause
          setTimeout(() => { codeEl.innerHTML = ''; li = 0; ci = 0; current = null; type(); }, 4200);
          return;
        }
        const line = lines[li];
        if (ci === 0) {
          current = document.createElement('span');
          if (line.cls) current.className = line.cls;
          codeEl.appendChild(current);
        }
        if (ci < line.t.length) {
          current.textContent += line.t.charAt(ci);
          ci++;
          setTimeout(type, line.t.charAt(ci - 1) === ' ' ? speed : speed + Math.random() * 34);
        } else {
          if (line.nl) codeEl.appendChild(document.createTextNode('\n'));
          li++; ci = 0;
          setTimeout(type, line.wait != null ? line.wait : 260);
        }
      };
      type();
    }
  }

  /* ---------- Smooth-scroll offset for fixed header ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Contact form (client-side demo handling) ---------- */
  const form = $('#contact-form');
  const note = $('#form-note');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#name').value.trim();
      const email = $('#email').value.trim();
      const valid = name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!valid) {
        note.textContent = 'Kérlek add meg a neved és egy érvényes e-mail címet.';
        note.className = 'form-note err';
        return;
      }
      const payload = {
        name: name, email: email,
        topic: ($('#topic') || {}).value || '',
        message: ($('#message') || {}).value || ''
      };
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      note.textContent = 'Küldés...'; note.className = 'form-note';
      const done = (ok) => {
        if (btn) btn.disabled = false;
        if (ok) {
          note.textContent = 'Köszönjük, ' + name + '! Megkaptuk az üzeneted — jellemzően 12 órán belül válaszolunk.';
          note.className = 'form-note ok';
          form.reset();
        } else {
          note.textContent = 'Hiba történt a küldés során. Próbáld újra, vagy írj az info@luiz-tech.hu címre.';
          note.className = 'form-note err';
        }
      };
      fetch('/api/messages', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then((r) => done(r.ok)).catch(() => done(false));
    });
  }

  /* ============================================================
     Clickable references → detail modal
     ============================================================ */
  const refModal = $('#ref-modal');
  if (refModal) {
    const escH = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const openRef = (card) => {
      const tag = card.querySelector('.work-tag');
      const title = card.querySelector('h3');
      const desc = card.querySelector('p');
      const meta = card.querySelector('.work-meta');
      const url = card.getAttribute('data-url') || '';
      $('#ref-modal-tag').textContent = tag ? tag.textContent : 'Projekt';
      $('#ref-modal-title').textContent = title ? title.textContent : '';
      $('#ref-modal-desc').textContent = desc ? desc.textContent : '';
      $('#ref-modal-more').textContent = card.getAttribute('data-more') || '';
      $('#ref-modal-meta').innerHTML = meta ? meta.innerHTML : '';
      const link = $('#ref-modal-link');
      if (url) { link.href = url; link.hidden = false; } else { link.hidden = true; }
      refModal.hidden = false;
      document.body.style.overflow = 'hidden';
    };
    const closeRef = () => { refModal.hidden = true; document.body.style.overflow = ''; };

    const wireCards = () => {
      $$('.work-card.clickable').forEach((card) => {
        if (card.dataset.wired) return;
        card.dataset.wired = '1';
        card.addEventListener('click', () => openRef(card));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRef(card); }
        });
      });
    };
    wireCards();

    $('#ref-modal-close').addEventListener('click', closeRef);
    refModal.addEventListener('click', (e) => { if (e.target === refModal) closeRef(); });
    $('#ref-modal-cta').addEventListener('click', closeRef);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !refModal.hidden) closeRef(); });

    // Dinamikus referenciák a backendből (ha van) — különben marad a statikus tartalom
    const grid = $('.work-grid');
    if (grid && typeof fetch === 'function') {
      fetch('/api/references', { credentials: 'same-origin' })
        .then((r) => (r.ok ? r.json() : []))
        .then((items) => {
          if (!Array.isArray(items) || !items.length) return;
          const cards = items.map((it) => {
            const more = escH(it.details || it.description || '');
            const urlAttr = it.url ? ' data-url="' + escH(it.url) + '"' : '';
            return '<article class="work-card clickable reveal in' + (it.gold ? ' work-gold' : '') + '" tabindex="0" role="button" data-more="' + more + '"' + urlAttr + '">' +
              (it.tag ? '<div class="work-tag">' + escH(it.tag) + '</div>' : '') +
              '<h3>' + escH(it.title) + '</h3>' +
              '<p>' + escH(it.description || '') + '</p>' +
              (it.info ? '<div class="work-meta"><span>' + escH(it.info) + '</span></div>' : '') +
            '</article>';
          }).join('');
          const cta =
            '<article class="work-card work-cta reveal in">' +
              '<h3>A te projekted lehet a következő</h3>' +
              '<p>Beszéljük meg az ötletedet — pár órán belül kapsz tőlünk visszajelzést.</p>' +
              '<a href="#contact" class="btn btn-primary btn-sm">Beszéljünk róla</a>' +
            '</article>';
          grid.innerHTML = cards + cta;
          wireCards();
        })
        .catch(() => { /* nincs backend → marad a statikus */ });
    }
  }

  /* ============================================================
     News (loaded from backend if available)
     ============================================================ */
  const newsSection = $('#news');
  const newsGrid = $('#news-grid');
  if (newsSection && newsGrid && typeof fetch === 'function') {
    const escHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('hu-HU'); } catch (e) { return d || ''; } };
    fetch('/api/news', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : []))
      .then((items) => {
        if (!Array.isArray(items) || !items.length) return;
        newsGrid.innerHTML = items.slice(0, 6).map((n) =>
          '<article class="news-card reveal in">' +
            '<time class="news-date">' + escHtml(fmtDate(n.date)) + '</time>' +
            '<h3>' + escHtml(n.title) + '</h3>' +
            (n.body ? '<p>' + escHtml(n.body) + '</p>' : '') +
          '</article>'
        ).join('');
        newsSection.hidden = false;
      })
      .catch(() => { /* no backend → keep section hidden */ });
  }

  /* ============================================================
     FAQ (loaded from backend if available)
     ============================================================ */
  const faqList = $('#faq-list');
  if (faqList && typeof fetch === 'function') {
    const escF = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    fetch('/api/faq', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : []))
      .then((items) => {
        if (!Array.isArray(items) || !items.length) return;
        faqList.innerHTML = items.map((it) =>
          '<details class="faq-item"><summary>' + escF(it.question) + '</summary>' +
          '<div class="faq-answer">' + escF(it.answer) + '</div></details>'
        ).join('');
      })
      .catch(() => { /* nincs backend → marad a statikus */ });
  }

  /* ============================================================
     Cookie consent (GDPR)
     ============================================================ */
  (function cookieConsent() {
    if (document.body.classList.contains('admin-body')) return; // admin eszköz: kihagyjuk
    const KEY = 'luiztech_cookie_consent_v1';
    const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } };
    const apply = (c) => {
      // Itt lehet később feltételesen betölteni statisztikai/marketing szkripteket:
      // if (c.analytics) { /* pl. analytics betöltése */ }
    };
    const save = (c) => {
      c.ts = new Date().toISOString();
      try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
      apply(c);
    };

    // DOM felépítése
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Süti tájékoztató');
    banner.innerHTML =
      '<div class="cookie-text">' +
        '<strong>🍪 Sütiket használunk</strong>' +
        '<p>Az oldal a működéshez szükséges sütiket használ (pl. bejelentkezés, kosár). ' +
        'Statisztikai és marketing sütiket csak a hozzájárulásoddal. ' +
        '<a href="#" data-cookie-settings>Beállítások</a></p>' +
      '</div>' +
      '<div class="cookie-actions">' +
        '<button class="btn btn-ghost btn-sm" data-cookie="necessary">Csak a szükségesek</button>' +
        '<button class="btn btn-primary btn-sm" data-cookie="all">Elfogadom</button>' +
      '</div>';

    const modal = document.createElement('div');
    modal.className = 'cookie-modal-overlay';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="cookie-modal" role="dialog" aria-modal="true" aria-label="Süti beállítások">' +
        '<h3>Süti beállítások</h3>' +
        '<p>Kezeld, mely sütiket engedélyezed. A működéshez szükséges sütik mindig aktívak.</p>' +
        '<label class="cookie-cat"><span><strong>Szükséges</strong><br>Bejelentkezés, kosár, alapműködés.</span>' +
          '<input type="checkbox" checked disabled></label>' +
        '<label class="cookie-cat"><span><strong>Statisztika</strong><br>Anonim látogatottsági mérés.</span>' +
          '<input type="checkbox" data-cat="analytics"></label>' +
        '<label class="cookie-cat"><span><strong>Marketing</strong><br>Személyre szabott tartalom/hirdetés.</span>' +
          '<input type="checkbox" data-cat="marketing"></label>' +
        '<div class="cookie-modal-actions">' +
          '<button class="btn btn-ghost btn-sm" data-cookie="necessary">Elutasítom</button>' +
          '<button class="btn btn-primary btn-sm" data-cookie-save>Beállítások mentése</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(banner);
    document.body.appendChild(modal);

    const showBanner = () => { requestAnimationFrame(() => banner.classList.add('show')); };
    const hideBanner = () => banner.classList.remove('show');
    const openModal = () => {
      const c = read() || { analytics: false, marketing: false };
      modal.querySelector('[data-cat="analytics"]').checked = !!c.analytics;
      modal.querySelector('[data-cat="marketing"]').checked = !!c.marketing;
      modal.hidden = false;
    };
    const closeModal = () => { modal.hidden = true; };

    const accept = (mode) => {
      const c = mode === 'all'
        ? { necessary: true, analytics: true, marketing: true }
        : { necessary: true, analytics: false, marketing: false };
      save(c); hideBanner(); closeModal();
    };

    banner.querySelector('[data-cookie="all"]').addEventListener('click', () => accept('all'));
    banner.querySelector('[data-cookie="necessary"]').addEventListener('click', () => accept('necessary'));
    modal.querySelector('[data-cookie="necessary"]').addEventListener('click', () => accept('necessary'));
    modal.querySelector('[data-cookie-save]').addEventListener('click', () => {
      save({
        necessary: true,
        analytics: modal.querySelector('[data-cat="analytics"]').checked,
        marketing: modal.querySelector('[data-cat="marketing"]').checked
      });
      hideBanner(); closeModal();
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

    // "Beállítások" linkek (bannerben + láblécben)
    $$('[data-cookie-settings]').forEach((el) => {
      el.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    });

    const existing = read();
    if (existing) apply(existing); else showBanner();
  })();

  /* ============================================================
     Particle network background canvas
     ============================================================ */
  const canvas = $('#bg-canvas');
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, particles = [];
    const mouse = { x: -9999, y: -9999 };

    const config = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      const count = Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 16000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35 * dpr,
        vy: (Math.random() - 0.5) * 0.35 * dpr,
        r: (Math.random() * 1.6 + 0.6) * dpr,
      }));
    };

    const linkDist = 130;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const ld = linkDist * dpr;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // mouse repulsion
        const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
        const md = Math.hypot(mdx, mdy);
        if (md < 120 * dpr && md > 0) {
          const f = (120 * dpr - md) / (120 * dpr);
          p.x += (mdx / md) * f * 1.4;
          p.y += (mdy / md) * f * 1.4;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(120, 180, 255, 0.6)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < ld) {
            const a = (1 - dist / ld) * 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(90, 160, 255, ${a})`;
            ctx.lineWidth = 0.7 * dpr;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };

    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; }, { passive: true });
    window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
    let resizeT;
    window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(config, 200); });

    config();
    draw();
  }
})();
