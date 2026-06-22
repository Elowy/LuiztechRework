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

  /* ---------- Véletlen kiemelő szín munkamenetenként ----------
     Minden új böngésző-munkamenetben más színsémát kap az élő oldal
     (a választás a sessionön belül stabil). Az admin felületet nem érinti. */
  function hexToRgba(hex, a) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
    if (!m) return 'rgba(56,225,255,' + a + ')';
    const n = parseInt(m[1], 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  const SITE_PALETTES = [
    { a: '#38e1ff', b: '#6c7bff' }, { a: '#00ffa3', b: '#38e1ff' },
    { a: '#ff7edb', b: '#6c7bff' }, { a: '#ffb86c', b: '#ff5f57' },
    { a: '#b46bff', b: '#38e1ff' }, { a: '#28c840', b: '#00ffa3' }
  ];
  function sessionPalette() {
    let i;
    try { i = Number(sessionStorage.getItem('lt_palette')); } catch (e) { i = NaN; }
    if (!(i >= 0 && i < SITE_PALETTES.length)) {
      i = Math.floor(Math.random() * SITE_PALETTES.length);
      try { sessionStorage.setItem('lt_palette', String(i)); } catch (e) { /* ignore */ }
    }
    return SITE_PALETTES[i];
  }
  if (!document.body.classList.contains('admin-body')) {
    const pal = sessionPalette();
    const a = pal.a, b = pal.b, s = document.documentElement.style;
    s.setProperty('--accent', a);
    s.setProperty('--accent-2', b);
    s.setProperty('--accent-glow', hexToRgba(a, 0.35));
    s.setProperty('--grad', 'linear-gradient(135deg, ' + a + ' 0%, ' + b + ' 55%, ' + b + ' 100%)');
    s.setProperty('--grad-soft', 'linear-gradient(135deg, ' + hexToRgba(a, 0.14) + ', ' + hexToRgba(b, 0.14) + ')');
    s.setProperty('--shop-accent', a);
    s.setProperty('--shop-accent-2', b);
  }

  /* ---------- Kiemelt termékek a webshopból (mindig véletlen) ---------- */
  (function featuredProducts() {
    const grid = document.getElementById('featured-products');
    if (!grid || typeof fetch !== 'function') return;
    const esc = (x) => String(x == null ? '' : x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fmt = (v, cur) => Number(v).toLocaleString('hu-HU') + ' ' + cur;
    const T = (s) => (window.LT_translate ? window.LT_translate(s) : s);
    fetch('/api/shop', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg) => {
        const prods = cfg && Array.isArray(cfg.products) ? cfg.products.slice() : [];
        if (!prods.length) { grid.innerHTML = '<p class="shop-empty" style="grid-column:1/-1"><a href="webshop.html">' + T('Tovább a webshopba →') + '</a></p>'; return; }
        for (let i = prods.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = prods[i]; prods[i] = prods[j]; prods[j] = t; }
        const cur = (cfg.currency || 'Ft');
        grid.innerHTML = prods.slice(0, 3).map((p) => {
          const onSale = p.salePrice != null && p.salePrice > 0 && p.salePrice < p.price;
          const eff = onSale ? p.salePrice : p.price;
          const priceHtml = onSale
            ? '<span class="price-old">' + fmt(p.price, cur) + '</span> ' + fmt(eff, cur)
            : fmt(eff, cur);
          const media = p.image
            ? '<div class="feat-img" style="background-image:url(\'' + esc(p.image) + '\')"></div>'
            : '<div class="feat-emoji">' + esc(p.emoji || '📦') + '</div>';
          return '<article class="price-card reveal in">' +
            media +
            '<h3>' + esc(p.name) + '</h3>' +
            (p.desc ? '<p class="price-sub">' + esc(p.desc) + '</p>' : '') +
            '<div class="price">' + priceHtml + '</div>' +
            '<a href="webshop.html" class="btn btn-primary btn-block">' + T('Megnézem a boltban') + '</a>' +
          '</article>';
        }).join('');
      })
      .catch(() => { grid.innerHTML = '<p class="shop-empty" style="grid-column:1/-1"><a href="webshop.html">' + T('Tovább a webshopba →') + '</a></p>'; });
  })();

  /* ---------- Tóth Levente kép — glitch easter-egg ---------- */
  (function ownerGlitch() {
    const img = document.querySelector('.owner-photo');
    if (!img) return;
    const orig = img.getAttribute('src');
    const alt = 'assets/img/owner-alt.png?v=31';
    let ready = false, showingAlt = false, busy = false, autoDone = false, timer = null;
    const pre = new Image();
    pre.onload = function () { ready = true; img.style.cursor = 'pointer'; img.setAttribute('title', '👁'); armAuto(); };
    pre.src = alt;   // csak akkor aktív az easter-egg, ha a kép létezik

    function runGlitch() {
      if (!ready || busy) return;
      busy = true;
      img.classList.add('glitching');
      const card = img.closest('.owner-card');
      const ov = document.createElement('div');
      ov.className = 'glitch-code';
      const chars = '01<>/{}=;()[]#$%&|!?+*ABCDEF0x9af3λΣ¤';
      let s = ''; for (let i = 0; i < 280; i++) s += chars[Math.floor(Math.random() * chars.length)];
      ov.textContent = s;
      if (card) card.appendChild(ov);
      setTimeout(function () { showingAlt = !showingAlt; img.src = showingAlt ? alt : orig; }, 280);
      setTimeout(function () { img.classList.remove('glitching'); if (ov.parentNode) ov.remove(); busy = false; }, 680);
    }
    img.addEventListener('click', runGlitch);

    // Automatikus váltás: ha a fotó látszik, 10 mp után egyszer átvált.
    function armAuto() {
      if (autoDone || prefersReduced || !('IntersectionObserver' in window)) return;
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            if (timer) return;
            timer = setTimeout(function () {
              timer = null;
              if (!autoDone && !showingAlt) { autoDone = true; runGlitch(); io.disconnect(); }
            }, 10000);
          } else if (timer) {
            clearTimeout(timer); timer = null;   // elgörgetett → újraindul, ha visszajön
          }
        });
      }, { threshold: 0.5 });
      io.observe(img);
    }
  })();

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

  /* ---------- Robot logó a fejlécben + véletlen trükkök ---------- */
  buildLogoRobot();
  function buildLogoRobot() {
    const brand = document.querySelector('.site-header .brand');
    if (!brand || brand.querySelector('.logo-robot')) return;
    const span = document.createElement('span');
    span.className = 'logo-robot';
    span.setAttribute('aria-hidden', 'true');
    span.innerHTML = robotSVG();
    brand.insertBefore(span, brand.firstChild);
    if (prefersReduced) return;

    // wink gyakoribb, a látványos trükkök ritkábbak
    const TRICKS = ['wink', 'wink', 'wink', 'flip', 'jump', 'wormhole'];
    const DUR = { wink: 700, flip: 1300, jump: 1100, wormhole: 1900 };
    let busy = false;
    const play = (trick) => {
      if (busy) return;
      busy = true;
      span.classList.add(trick);
      setTimeout(() => { span.classList.remove(trick); busy = false; }, DUR[trick] || 1200);
    };
    setInterval(() => play(TRICKS[Math.floor(Math.random() * TRICKS.length)]), 5500);
    brand.addEventListener('mouseenter', () => play('jump'));   // hover → trambulin (a logó linkje így is működik)
  }

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

    // Robot easter-egg: kattintásra szétrobban, majd lassan újraépül
    let robotSay = null;   // a buborék-megjelenítőt a buborék-blokk állítja be
    const robot = $('.chat-robot', wrap);
    if (robot && !prefersReduced) {
      let busy = false;
      robot.addEventListener('click', (e) => {
        e.stopPropagation();
        if (busy || wrap.classList.contains('open')) return;
        busy = true;
        $$('.rpiece', robot).forEach((p) => {
          const ang = Math.random() * Math.PI * 2;
          const dist = 24 + Math.random() * 30;
          p.style.setProperty('--tx', (Math.cos(ang) * dist).toFixed(1) + 'px');
          p.style.setProperty('--ty', (Math.sin(ang) * dist).toFixed(1) + 'px');
          p.style.setProperty('--rot', Math.round((Math.random() * 2 - 1) * 260) + 'deg');
        });
        robot.classList.remove('reassembling');
        robot.classList.add('exploding');
        setTimeout(() => {
          robot.classList.remove('exploding');
          robot.classList.add('reassembling');
          setTimeout(() => {
            robot.classList.remove('reassembling');
            busy = false;
            if (robotSay) setTimeout(robotSay, 500);   // újraépülés után írjon új üzenetet
          }, 1900);
        }, 520);
      });
    }

    // Üdvözlő szövegbuborék a robottól — betöltéskor, kb. 10 mp-ig (véletlen üzenetek)
    const BUBBLE_MSGS = [
      'Beszélj velünk, gyorsan válaszolunk 😉', 'Szép napot ❤️', 'Jól nézel ma ki! ❤️',
      'Weboldal gyorsan érdekel? 😉', 'Milyen gyorsan kell? Megoldjuk. 😉',
      'Szia! 👋', 'Üdv a Luiz-Tech-nél! 🚀', 'Örülök, hogy itt vagy! 😊', 'Jó látni téged! 😊',
      'Csodás napot kívánok! ☀️', 'Hogy telik a napod? 😊', 'Üdvözöllek, barátom! 🤝',
      'Új weboldal? Mi megoldjuk! 💻', 'Webshopot álmodtál? Megépítjük! 🛒',
      'Lassú a régi oldalad? Felpörgetjük! ⚡', 'Mobilon is tökéletes lesz. 📱',
      'Egyedi design, nulláról. 🎨', 'Pár nap és kész is. ⏱️', 'Ingyenes árajánlat 12 órán belül! 🎁',
      'Kérdésed van? Itt vagyok! 💬', 'Segíthetek valamiben? 🙂', 'Beszéljük meg az ötleted! 💡',
      'Van egy jó ötleted? Halljuk! 🎯', 'Álmodd meg, mi lekódoljuk. ✨',
      'A kódolás a mi szupererőnk. 🦸', 'Bug? Nálunk az ritka vendég. 🐛', 'Tiszta kód, boldog ügyfél. 😌',
      'Coffee + code = Luiz-Tech ☕', 'Mi nem alszunk, mi deployolunk. 🚀',
      'Te kérdezel, mi fejlesztünk. 🔧', 'A jövő kódból épül. 🧱', 'Gyors. Biztonságos. Szép. ✅',
      'SEO? Bízd ránk! 📈', 'Feltornázzuk a Google-ben. 🔝', 'Több látogató, több ügyfél. 📊',
      'Biztonság elsőként. 🔒', 'Adatmentés? Megoldva. 💾', 'Hálózati gond? Mi rendbe tesszük. 📡',
      'Otthonról is jó kezekben vagy. 🏠', 'Mosolyogj, szép a kódunk! 😄', 'Te vagy a kedvenc látogatónk! ⭐',
      'Pszt… van egy titkunk: imádjuk a munkánk. 🤫', 'Ne félj, nem harapunk. 🤖',
      'Csak egy kattintásra a jövőd. 🖱️', 'Kávézz egyet, mi addig kódolunk. ☕',
      'A pixelek is minket szeretnek. 🎨', 'Reszponzív, mint egy macska. 🐱',
      'Villámgyors betöltés garantálva. ⚡', '100% kézzel készült kód. 👐',
      'Nincs sablon, csak egyedi. 🧩', 'A weboldalad legyen sztár! 🌟', 'Beszéljünk a projektedről! 🗣️',
      'Mi a következő nagy ötleted? 💭', 'Készen állsz a fejlődésre? 🌱', 'Tedd online a vállalkozásod! 🌐',
      'Online jelenlét = több bevétel. 💰', 'A versenytársaid már online vannak. 👀',
      'Ne maradj le, lépj előre! 🏃', 'Egy jó oldal aranyat ér. 🥇', 'A részletekben rejlik a szépség. 🔍',
      'Figyelünk minden pixelre. ✨', 'Te álmodsz, mi valósítunk. 🌈', 'Kódból szövünk varázslatot. 🪄',
      'Hibátlan élmény a célunk. 🎯', 'Letisztult, modern, gyors. 💎', 'A te sikered a mi sikerünk. 🏆',
      'Mindig naprakész technológia. 🆕', 'A trendek nálunk otthon vannak. 📐',
      'Sötét mód? Persze, van! 🌙', 'Világos mód? Az is megy! ☀️', 'Animációk, amik élnek. 🎬',
      'Olyan sima, mint a vaj. 🧈', 'Gyorsabb, mint gondolnád. 💨', 'Egy klikk és elindulunk. 🚦',
      'Készíts velünk valami nagyot! 🏗️', 'A kódunk olyan tiszta, hogy ragyog. ✨',
      'Hűséges ügyfeleink imádnak. 💖', 'Próbáld ki, nem fogod megbánni. 😉', 'Velünk könnyű. 😎',
      'Hagyd ránk a technikát! 🛠️', 'Nincs olyan, hogy lehetetlen. 💪', 'Mi a stresszt is debuggoljuk. 🧘',
      'Kreativitás + kód = mágia. 🎩', 'A jövőd egy üzenetre van. ✉️', 'Szólj, és intézzük! 📞',
      'Te is megérdemled a profi oldalt. 👑', 'A weboldalad, csúcsformában. 🏋️',
      'Minden eszközön gyönyörű. 🖥️', 'Töltsd fel a márkád energiával! ⚡', 'Készen állunk rád! 🙌',
      'Egy mosoly, és máris jobb a napod. 😊', 'Te vagy a mai fénypontunk! 🌞',
      'Kódolunk, hogy te pihenhess. 😴', 'A nehéz részt mi visszük. 🏋️', 'Nyugi, mi megoldjuk. 👍',
      'A digitális jövőd itt kezdődik. 🚪', 'Lépjünk szintet együtt! 🎮', 'Adj egy esélyt a wow-élménynek! 🤩',
      'Tudtad? Imádjuk a kihívásokat. 🧗', 'Akár ma is elkezdhetjük. 📅', 'A te oldalad, a mi szívügyünk. ❤️',
      'Pörgessük fel a vállalkozásod! 🌀', 'Egy jó kávé és bármi megoldható. ☕',
      'Profi munka, baráti hangulat. 🤗', 'Ne csak létezz online — ragyogj! 🌟',
      'Indítsuk be a sikered! 🔥', 'Mindig itt vagyok, ha kellek. 🤖'
    ];
    const GOLD_MSG = 'Kattints rám! ✨';

    // A robot fölötti buborék: betöltés után, majd kb. PERCENKÉNT újra felbukkan.
    // Egy megjelenés = egy fix véletlen üzenet, ~10 mp-ig (futás közben nem változik).
    const robotEl = $('.chat-robot', wrap);
    if (robotEl) {
      const bubble = document.createElement('div');
      bubble.className = 'robot-bubble';
      bubble.setAttribute('role', 'status');
      bubble.innerHTML = '<span class="rb-text"></span><button type="button" class="rb-close" aria-label="Bezárás">✕</button>';
      robotEl.appendChild(bubble);     // a robot gyermeke → fölötte jelenik meg, vele mozog
      const bubbleText = bubble.querySelector('.rb-text');

      let hideT = null, bIv = null, closed = false;
      try { closed = sessionStorage.getItem('lt_bubble_off') === '1'; } catch (e) { /* ignore */ }
      const hideBubble = () => {
        if (hideT) { clearTimeout(hideT); hideT = null; }
        bubble.classList.remove('show');
      };
      const showBubble = () => {
        if (closed || wrap.classList.contains('open')) return;
        const gold = Math.random() < 0.07;             // ritkán az arany "Kattints rám!"
        var raw = gold ? GOLD_MSG : BUBBLE_MSGS[Math.floor(Math.random() * BUBBLE_MSGS.length)];
        bubbleText.textContent = (window.LT_translate ? window.LT_translate(raw) : raw);
        bubble.classList.toggle('gold', gold);
        bubble.classList.add('show');
        if (hideT) clearTimeout(hideT);
        hideT = setTimeout(() => bubble.classList.remove('show'), 10000);  // ~10 mp-ig látható
      };
      robotSay = showBubble;              // a robbanás utáni új üzenethez

      // X → bezárás, és a munkamenetben többé nem jelenik meg
      bubble.querySelector('.rb-close').addEventListener('click', (e) => {
        e.stopPropagation();
        closed = true;
        try { sessionStorage.setItem('lt_bubble_off', '1'); } catch (er) { /* ignore */ }
        hideBubble();
        if (bIv) { clearInterval(bIv); bIv = null; }
      });

      if (!closed) {
        setTimeout(showBubble, 800);          // első megjelenés betöltés után
        bIv = setInterval(showBubble, 60000); // utána percenként
      }
      fab.addEventListener('click', hideBubble);
      robotEl.addEventListener('click', hideBubble);
    }
  }

  function robotSVG() {
    return '' +
      '<svg viewBox="0 0 64 64" width="56" height="56" class="robot-svg" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><linearGradient id="rgrad" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#38e1ff"/><stop offset="1" stop-color="#6c7bff"/>' +
        '</linearGradient></defs>' +
        '<line class="rpiece" x1="32" y1="7" x2="32" y2="15" stroke="#6c7bff" stroke-width="2"/>' +
        '<circle class="rpiece" cx="32" cy="6" r="3" fill="#00ffa3"/>' +
        '<rect class="rpiece" x="16" y="14" width="32" height="24" rx="9" fill="url(#rgrad)"/>' +
        '<circle class="rpiece r-eye r-eye-l" cx="25" cy="26" r="3.4" fill="#04121a"/><circle class="rpiece r-eye r-eye-r" cx="39" cy="26" r="3.4" fill="#04121a"/>' +
        '<circle class="rpiece" cx="26.2" cy="24.8" r="1" fill="#fff"/><circle class="rpiece" cx="40.2" cy="24.8" r="1" fill="#fff"/>' +
        '<rect class="rpiece" x="27" y="31.5" width="10" height="2.6" rx="1.3" fill="#04121a" opacity=".55"/>' +
        '<rect class="rpiece" x="20" y="40" width="24" height="16" rx="6" fill="#0d1320" stroke="url(#rgrad)" stroke-width="2"/>' +
        '<circle class="rpiece" cx="32" cy="48" r="2.6" fill="#00ffa3"/>' +
        '<rect class="rpiece" x="9" y="42" width="8" height="3" rx="1.5" fill="#6c7bff"/>' +
        '<g class="robot-arm rpiece"><rect x="47" y="42" width="8" height="3" rx="1.5" fill="#6c7bff"/></g>' +
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
  const heroTermTitle = $('#hero-terminal-title');
  if (codeEl) {
    // Több jelenet — kód, deploy-napló, szerver-státusz, CI/SQL/Bash/Docker — véletlenszerű sorrendben.
    var K = 't-key', STR = 't-str', FN = 't-fn', O = 't-out', CM = 't-comment';
    var PR = 't-prompt', CMD = 't-cmd', OK = 't-ok', WARN = 't-warn', DIM = 't-dim';
    const SNIPPETS = [
      { title: 'Products.jsx', lines: [
        { t: '// Luiz-Tech — terméklista React hookkal', cls: CM, nl: true },
        { t: 'import ', cls: K }, { t: '{ useEffect, useState }', cls: O }, { t: ' from ', cls: K }, { t: "'react'", cls: STR }, { t: ';', cls: O, nl: true },
        { t: '', nl: true },
        { t: 'export default function ', cls: K }, { t: 'Products', cls: FN }, { t: '() {', cls: O, nl: true },
        { t: '  const ', cls: K }, { t: '[items, setItems] = ', cls: O }, { t: 'useState', cls: FN }, { t: '([]);', cls: O, nl: true },
        { t: '', nl: true },
        { t: '  ', cls: O }, { t: 'useEffect', cls: FN }, { t: '(() => {', cls: O, nl: true },
        { t: '    ', cls: O }, { t: 'fetch', cls: FN }, { t: '(', cls: O }, { t: "'/api/shop'", cls: STR }, { t: ')', cls: O, nl: true },
        { t: '      .then((r) => r.', cls: O }, { t: 'json', cls: FN }, { t: '())', cls: O, nl: true },
        { t: '      .then((d) => ', cls: O }, { t: 'setItems', cls: FN }, { t: '(d.products));', cls: O, nl: true },
        { t: '  }, []);', cls: O, nl: true },
        { t: '', nl: true },
        { t: '  return ', cls: K }, { t: 'items.', cls: O }, { t: 'map', cls: FN }, { t: '((p) => (', cls: O, nl: true },
        { t: '    <', cls: O }, { t: 'Card', cls: FN }, { t: ' key={p.id} product={p} />', cls: O, nl: true },
        { t: '  ));', cls: O, nl: true },
        { t: '}', cls: O, nl: true }
      ] },
      { title: 'OrderService.cs', lines: [
        { t: '// Luiz-Tech — rendelés összegző szolgáltatás', cls: CM, nl: true },
        { t: 'public class ', cls: K }, { t: 'OrderService', cls: FN, nl: true },
        { t: '{', cls: O, nl: true },
        { t: '    private readonly ', cls: K }, { t: 'IOrderRepository', cls: FN }, { t: ' _repo;', cls: O, nl: true },
        { t: '', nl: true },
        { t: '    public ', cls: K }, { t: 'OrderService', cls: FN }, { t: '(', cls: O }, { t: 'IOrderRepository', cls: FN }, { t: ' repo)', cls: O, nl: true },
        { t: '        => _repo = repo;', cls: O, nl: true },
        { t: '', nl: true },
        { t: '    public async ', cls: K }, { t: 'Task', cls: FN }, { t: '<', cls: O }, { t: 'decimal', cls: K }, { t: '> ', cls: O }, { t: 'TotalAsync', cls: FN }, { t: '(', cls: O }, { t: 'int', cls: K }, { t: ' id)', cls: O, nl: true },
        { t: '    {', cls: O, nl: true },
        { t: '        var items = await _repo.', cls: O }, { t: 'GetItemsAsync', cls: FN }, { t: '(id);', cls: O, nl: true },
        { t: '        return items.', cls: O }, { t: 'Sum', cls: FN }, { t: '(i => i.Price * i.Qty);', cls: O, nl: true },
        { t: '    }', cls: O, nl: true },
        { t: '}', cls: O, nl: true }
      ] },
      { title: 'UserRepository.php', lines: [
        { t: '<?php', cls: K, nl: true },
        { t: '// Luiz-Tech — biztonságos lekérdezés (PDO)', cls: CM, nl: true },
        { t: 'declare', cls: FN }, { t: '(strict_types=', cls: O }, { t: '1', cls: STR }, { t: ');', cls: O, nl: true },
        { t: '', nl: true },
        { t: 'function ', cls: K }, { t: 'findUser', cls: FN }, { t: '(', cls: O }, { t: 'PDO', cls: FN }, { t: ' $pdo, ', cls: O }, { t: 'string', cls: K }, { t: ' $email): ?', cls: O }, { t: 'array', cls: K, nl: true },
        { t: '{', cls: O, nl: true },
        { t: '    $stmt = $pdo->', cls: O }, { t: 'prepare', cls: FN }, { t: '(', cls: O, nl: true },
        { t: '        ', cls: O }, { t: "'SELECT id FROM users WHERE email = ?'", cls: STR, nl: true },
        { t: '    );', cls: O, nl: true },
        { t: '    $stmt->', cls: O }, { t: 'execute', cls: FN }, { t: '([$email]);', cls: O, nl: true },
        { t: '    return ', cls: K }, { t: '$stmt->', cls: O }, { t: 'fetch', cls: FN }, { t: '() ?: ', cls: O }, { t: 'null', cls: K }, { t: ';', cls: O, nl: true },
        { t: '}', cls: O, nl: true }
      ] },
      { title: 'sum.cpp', lines: [
        { t: '// Luiz-Tech — generikus összegző (C++17)', cls: CM, nl: true },
        { t: '#include ', cls: K }, { t: '<vector>', cls: STR, nl: true },
        { t: '#include ', cls: K }, { t: '<numeric>', cls: STR, nl: true },
        { t: '', nl: true },
        { t: 'template ', cls: K }, { t: '<typename ', cls: O }, { t: 'T', cls: FN }, { t: '>', cls: O, nl: true },
        { t: 'T', cls: FN }, { t: ' ', cls: O }, { t: 'sum', cls: FN }, { t: '(const std::', cls: O }, { t: 'vector', cls: FN }, { t: '<', cls: O }, { t: 'T', cls: FN }, { t: '>& xs) {', cls: O, nl: true },
        { t: '    return std::', cls: O }, { t: 'accumulate', cls: FN }, { t: '(', cls: O, nl: true },
        { t: '        xs.', cls: O }, { t: 'begin', cls: FN }, { t: '(), xs.', cls: O }, { t: 'end', cls: FN }, { t: '(), ', cls: O }, { t: 'T', cls: FN }, { t: '{});', cls: O, nl: true },
        { t: '}', cls: O, nl: true },
        { t: '', nl: true },
        { t: 'int', cls: K }, { t: ' ', cls: O }, { t: 'main', cls: FN }, { t: '() {', cls: O, nl: true },
        { t: '    std::', cls: O }, { t: 'vector', cls: FN }, { t: '<', cls: O }, { t: 'int', cls: K }, { t: '> p{', cls: O }, { t: '149000, 89000', cls: STR }, { t: '};', cls: O, nl: true },
        { t: '    return ', cls: K }, { t: 'sum', cls: FN }, { t: '(p) > ', cls: O }, { t: '0', cls: STR }, { t: ' ? ', cls: O }, { t: '0', cls: STR }, { t: ' : ', cls: O }, { t: '1', cls: STR }, { t: ';', cls: O, nl: true },
        { t: '}', cls: O, nl: true }
      ] },
      { title: 'api.js', lines: [
        { t: '// Luiz-Tech — API kliens (hibakezeléssel)', cls: CM, nl: true },
        { t: 'export async function ', cls: K }, { t: 'getJSON', cls: FN }, { t: '(url) {', cls: O, nl: true },
        { t: '  const res = await ', cls: O }, { t: 'fetch', cls: FN }, { t: '(url, {', cls: O, nl: true },
        { t: '    credentials: ', cls: O }, { t: "'same-origin'", cls: STR }, { t: ',', cls: O, nl: true },
        { t: '  });', cls: O, nl: true },
        { t: '  if ', cls: K }, { t: '(!res.ok) {', cls: O, nl: true },
        { t: '    throw new ', cls: K }, { t: 'Error', cls: FN }, { t: '(`HTTP ${res.status}`);', cls: STR, nl: true },
        { t: '  }', cls: O, nl: true },
        { t: '  return ', cls: K }, { t: 'res.', cls: O }, { t: 'json', cls: FN }, { t: '();', cls: O, nl: true },
        { t: '}', cls: O, nl: true },
        { t: '', nl: true },
        { t: 'const shop = await ', cls: O }, { t: 'getJSON', cls: FN }, { t: '(', cls: O }, { t: "'/api/shop'", cls: STR }, { t: ');', cls: O, nl: true }
      ] },
      { title: 'deploy.sh', lines: [
        { t: '# automata kiszállítás éles szerverre', cls: CM, nl: true },
        { t: 'luiz-tech@prod ~ $ ', cls: PR }, { t: './deploy.sh client-webshop', cls: CMD, nl: true },
        { t: '  → build ............... ', cls: O }, { t: '✓', cls: OK }, { t: '  4.1s', cls: DIM, nl: true },
        { t: '  → optimizing assets ... ', cls: O }, { t: '✓', cls: OK, nl: true },
        { t: '  → upload to Hetzner ... ', cls: O }, { t: '✓', cls: OK, nl: true },
        { t: '  → purge CDN cache ..... ', cls: O }, { t: '✓', cls: OK, nl: true },
        { t: '', nl: true },
        { t: '✓ ', cls: OK }, { t: 'client-webshop.hu', cls: FN }, { t: '  LIVE', cls: OK }, { t: ' · 99.99% uptime', cls: DIM, nl: true }
      ] },
      { title: 'pipeline', lines: [
        { t: '# CI/CD folyamat minden push után', cls: CM, nl: true },
        { t: 'luiz-tech@ci ~ $ ', cls: PR }, { t: 'git push origin main', cls: CMD, nl: true },
        { t: '  → CI pipeline triggered ... ', cls: O }, { t: '✓', cls: OK, nl: true },
        { t: '$ ', cls: PR }, { t: 'npm run build', cls: CMD, nl: true },
        { t: '  vite v5  ', cls: O }, { t: '✓ built in 3.2s', cls: OK, nl: true },
        { t: '$ ', cls: PR }, { t: 'docker compose up -d', cls: CMD, nl: true },
        { t: '  shop-web  ', cls: O }, { t: 'Started ✓', cls: OK, nl: true },
        { t: '  shop-db   ', cls: O }, { t: 'Healthy ✓', cls: OK, nl: true },
        { t: '', nl: true },
        { t: '✓ deployed · 0 errors · 1.8s', cls: OK, nl: true }
      ] },
      { title: 'status', lines: [
        { t: '# élő rendszerfelügyelet', cls: CM, nl: true },
        { t: '● ', cls: OK }, { t: 'service          status     time', cls: O, nl: true },
        { t: '──────────────────────────────────────', cls: DIM, nl: true },
        { t: '● ', cls: OK }, { t: 'web-01          ', cls: O }, { t: 'ONLINE', cls: OK }, { t: '    118ms', cls: DIM, nl: true },
        { t: '● ', cls: OK }, { t: 'webshop-api     ', cls: O }, { t: 'ONLINE', cls: OK }, { t: '     43ms', cls: DIM, nl: true },
        { t: '● ', cls: OK }, { t: 'mysql-primary   ', cls: O }, { t: 'healthy', cls: OK }, { t: '    12ms', cls: DIM, nl: true },
        { t: '● ', cls: OK }, { t: 'ssl-cert        ', cls: O }, { t: 'VALID', cls: OK }, { t: '    89 days', cls: DIM, nl: true },
        { t: '● ', cls: OK }, { t: 'daily backup    ', cls: O }, { t: 'OK', cls: OK }, { t: '       02:00 ✓', cls: DIM, nl: true },
        { t: '──────────────────────────────────────', cls: DIM, nl: true },
        { t: '  uptime: 99.99% · 0 incidents', cls: DIM, nl: true }
      ] },
      { title: 'docker', lines: [
        { t: '# webshop konténer build', cls: CM, nl: true },
        { t: 'luiz-tech@dev ~ $ ', cls: PR }, { t: 'docker build -t shop:latest .', cls: CMD, nl: true },
        { t: '  → [1/4] FROM node:20-alpine   ', cls: O }, { t: '✓', cls: OK, nl: true },
        { t: '  → [2/4] COPY . /app           ', cls: O }, { t: '✓', cls: OK, nl: true },
        { t: '  → [3/4] RUN npm ci --omit=dev ', cls: O }, { t: '✓', cls: OK }, { t: '  6.2s', cls: DIM, nl: true },
        { t: '  → [4/4] RUN npm run build     ', cls: O }, { t: '✓', cls: OK }, { t: '  3.1s', cls: DIM, nl: true },
        { t: '', nl: true },
        { t: '✓ ', cls: OK }, { t: 'shop:latest', cls: FN }, { t: '  (image 142MB)', cls: DIM, nl: true }
      ] },
      { title: 'deploy.yml', lines: [
        { t: '# .github/workflows/deploy.yml', cls: CM, nl: true },
        { t: '# automatikus kiszállítás minden push után', cls: CM, nl: true },
        { t: 'name', cls: K }, { t: ': Deploy', cls: O, nl: true },
        { t: 'on', cls: K }, { t: ': [push]', cls: O, nl: true },
        { t: 'jobs', cls: K }, { t: ':', cls: O, nl: true },
        { t: '  deploy', cls: K }, { t: ':', cls: O, nl: true },
        { t: '    runs-on', cls: K }, { t: ': ', cls: O }, { t: 'ubuntu-latest', cls: STR, nl: true },
        { t: '    steps', cls: K }, { t: ':', cls: O, nl: true },
        { t: '      - ', cls: O }, { t: 'uses', cls: K }, { t: ': ', cls: O }, { t: 'actions/checkout@v4', cls: STR, nl: true },
        { t: '      - ', cls: O }, { t: 'run', cls: K }, { t: ': ', cls: O }, { t: 'npm ci && npm run build', cls: STR, nl: true },
        { t: '      - ', cls: O }, { t: 'name', cls: K }, { t: ': ', cls: O }, { t: 'Deploy via FTP', cls: STR, nl: true }
      ] },
      { title: 'schema.sql', lines: [
        { t: '-- Luiz-Tech — webshop séma', cls: CM, nl: true },
        { t: 'CREATE TABLE ', cls: K }, { t: 'products', cls: FN }, { t: ' (', cls: O, nl: true },
        { t: '  id      ', cls: O }, { t: 'INT', cls: K }, { t: ' PRIMARY KEY AUTO_INCREMENT,', cls: O, nl: true },
        { t: '  name    ', cls: O }, { t: 'VARCHAR', cls: K }, { t: '(160) ', cls: O }, { t: 'NOT NULL', cls: K }, { t: ',', cls: O, nl: true },
        { t: '  price   ', cls: O }, { t: 'INT', cls: K }, { t: ' NOT NULL,', cls: O, nl: true },
        { t: '  active  ', cls: O }, { t: 'TINYINT', cls: K }, { t: ' DEFAULT ', cls: O }, { t: '1', cls: STR }, { t: ');', cls: O, nl: true },
        { t: '', nl: true },
        { t: 'SELECT ', cls: K }, { t: 'name, price ', cls: O }, { t: 'FROM ', cls: K }, { t: 'products', cls: FN, nl: true },
        { t: 'WHERE ', cls: K }, { t: 'active = ', cls: O }, { t: '1 ', cls: STR }, { t: 'ORDER BY ', cls: K }, { t: 'price;', cls: O, nl: true }
      ] },
      { title: 'provision.sh', lines: [
        { t: '#!/usr/bin/env bash', cls: CM, nl: true },
        { t: '# Luiz-Tech — szerver beüzemelés', cls: CM, nl: true },
        { t: 'set', cls: FN }, { t: ' -euo pipefail', cls: O, nl: true },
        { t: '', nl: true },
        { t: 'apt-get', cls: FN }, { t: ' update -qq', cls: O, nl: true },
        { t: 'ufw', cls: FN }, { t: ' allow 443/tcp', cls: O }, { t: '          # HTTPS', cls: CM, nl: true },
        { t: 'certbot', cls: FN }, { t: ' --nginx -d luiz-tech.hu', cls: O, nl: true },
        { t: 'systemctl', cls: FN }, { t: ' reload nginx', cls: O, nl: true },
        { t: 'echo', cls: FN }, { t: ' ', cls: O }, { t: '"✓ done"', cls: STR, nl: true }
      ] }
    ];

    // Az induló nyelv véletlen, majd lefutás után automatikusan a következőre vált (körbe).
    let snipIdx = Math.floor(Math.random() * SNIPPETS.length);
    const loadSnippet = (idx) => {
      const pick = SNIPPETS[idx];
      const lines = pick.lines.map(function (seg) {
        return { t: window.LT_translate ? window.LT_translate(seg.t) : seg.t, cls: seg.cls, nl: seg.nl, wait: seg.wait };
      });
      if (heroTermTitle) heroTermTitle.textContent = 'luiz-tech ~ ' + pick.title;
      return lines;
    };
    let lines = loadSnippet(snipIdx);

    // Fix magasság: lefoglaljuk a legmagasabb jelenethez szükséges helyet, hogy
    // a kódablak ne "rángassa" az oldalt gépelés vagy jelenetváltás közben.
    try {
      const body = codeEl.parentElement; // <pre class="terminal-body">
      let maxLines = 0;
      SNIPPETS.forEach(function (s) {
        let n = 0;
        s.lines.forEach(function (l) { if (l.nl) n++; });
        if (n > maxLines) maxLines = n;
      });
      const lh = parseFloat(getComputedStyle(codeEl).lineHeight) || 26;
      const bs = getComputedStyle(body);
      const pad = (parseFloat(bs.paddingTop) || 0) + (parseFloat(bs.paddingBottom) || 0);
      // +1 sor a kurzornak
      body.style.minHeight = Math.ceil((maxLines + 1) * lh + pad) + 'px';
    } catch (e) { /* marad a CSS min-height */ }

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
          // szünet után véletlenszerűen egy másik jelenetre váltunk (nem ugyanarra)
          setTimeout(() => {
            let nxt = snipIdx;
            while (SNIPPETS.length > 1 && nxt === snipIdx) nxt = Math.floor(Math.random() * SNIPPETS.length);
            snipIdx = nxt;
            lines = loadSnippet(snipIdx);
            codeEl.innerHTML = ''; li = 0; ci = 0; current = null; type();
          }, 4200);
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

    // Sötét "kódköd" overlay — amíg a banner aktív (matrix-szerű kódeső)
    const fog = document.createElement('canvas');
    fog.className = 'cookie-fog';
    fog.setAttribute('aria-hidden', 'true');
    const FCH = '01<>/{}=;()[]#$%&|!?+*абвГΣλ░▒▓01ABCDEF';
    let fctx = null, fcols = [], fsize = 16, fw = 0, fh = 0, fraf = null, fresize = null;
    const fogStep = () => {
      fctx.fillStyle = 'rgba(5,8,12,0.20)';
      fctx.fillRect(0, 0, fw, fh);
      fctx.font = fsize + 'px JetBrains Mono, monospace';
      for (let i = 0; i < fcols.length; i++) {
        const x = i * fsize, y = fcols[i] * fsize;
        fctx.fillStyle = Math.random() > 0.96 ? 'rgba(0,255,163,0.9)' : 'rgba(56,225,255,0.85)';
        fctx.fillText(FCH[Math.floor(Math.random() * FCH.length)], x, y);
        if (y > fh && Math.random() > 0.975) fcols[i] = 0;
        fcols[i]++;
      }
      fraf = requestAnimationFrame(fogStep);
    };
    const startFog = () => {
      if (fog.parentNode) return;
      document.body.appendChild(fog);
      fctx = fog.getContext('2d');
      fresize = () => {
        fw = fog.width = window.innerWidth; fh = fog.height = window.innerHeight;
        fcols = Array.from({ length: Math.ceil(fw / fsize) }, () => Math.random() * fh / fsize);
        fctx.fillStyle = '#05080c'; fctx.fillRect(0, 0, fw, fh);
      };
      fresize();
      window.addEventListener('resize', fresize);
      requestAnimationFrame(() => fog.classList.add('show'));
      if (!prefersReduced) fraf = requestAnimationFrame(fogStep);   // reduced motion → statikus sötét
    };
    const stopFog = () => {
      if (fraf) { cancelAnimationFrame(fraf); fraf = null; }
      if (fresize) { window.removeEventListener('resize', fresize); fresize = null; }
      fog.classList.remove('show');
      setTimeout(() => { if (fog.parentNode) fog.remove(); }, 450);
    };

    const showBanner = () => { startFog(); requestAnimationFrame(() => banner.classList.add('show')); };
    const hideBanner = () => { banner.classList.remove('show'); stopFog(); };
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
