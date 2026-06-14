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
      note.textContent = 'Köszönjük, ' + name + '! Hamarosan jelentkezünk — jellemzően 12 órán belül.';
      note.className = 'form-note ok';
      form.reset();
    });
  }

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
