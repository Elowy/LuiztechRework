/* ============================================================
   Luiz-Tech — egyszerű kétnyelvűség (HU/EN)
   Nem invazív: a magyar szövegeket egy szótár alapján cseréli
   angolra, ha a kiválasztott nyelv "en". Nyelv: localStorage.
   ============================================================ */
(function () {
  'use strict';

  // "Magyar forrásszöveg" : "English"
  var DICT = {
    // ---- Navigáció / fejléc ----
    'Szolgáltatások': 'Services',
    'Megoldások': 'Solutions',
    'Referenciák': 'References',
    'Rólunk': 'About',
    'Webshop': 'Webshop',
    'Belépés': 'Sign in',
    'Árajánlat': 'Get a quote',
    'Főoldal': 'Home',
    'Termékek': 'Products',
    'Impresszum': 'Imprint',
    'Adatkezelés': 'Privacy',
    'ÁSZF': 'Terms',
    'Navigáció': 'Navigation',

    // ---- Hero ----
    'Elérhető új projektekre': 'Available for new projects',
    'Kódoljuk a': 'Coding your',
    'vállalkozásod': "business's",
    'jövőjét.': 'future.',
    'Web- és asztali alkalmazások fejlesztése, webshopok, kiberbiztonság és teljes körű IT-üzemeltetés. Egy csapat, amelyre építhetsz —':
      'Web and desktop application development, webshops, cybersecurity and full-scale IT operations. A team you can rely on —',
    'ingyenes árajánlat 12 órán belül.': 'free quote within 12 hours.',
    'Kérek árajánlatot': 'Request a quote',
    'Referenciák megtekintése': 'View references',
    'Elégedett ügyfél': 'Happy clients',
    'Árajánlat ideje': 'Quote turnaround',
    'Leggyorsabb átfutás': 'Fastest delivery',
    'görgess': 'scroll',

    // ---- Szekció-címkék / általános ----
    '// szolgáltatások': '// services',
    '// IT megoldások': '// IT solutions',
    '// csomagok': '// packages',
    '// folyamat': '// process',
    '// referenciák': '// references',
    '// élő betekintő': '// live preview',
    '// hírek': '// news',
    '// rólunk': '// about',
    '// gyik': '// faq',
    '// kapcsolat': '// contact',

    // ---- Szolgáltatások ----
    'Öt terület, egy partner': 'Five areas, one partner',
    'Kínálatunkat öt részre osztottuk, hogy bármilyen igényt és költségvetést teljes körűen lefedjünk — a koncepciótól az üzemeltetésig.':
      'We split our offering into five areas to fully cover any need and budget — from concept to operations.',
    'Webfejlesztés': 'Web development',
    'Modern, gyors és felhasználóbarát weboldalak, landing oldalak és egyedi webalkalmazások — reszponzív kivitelben.':
      'Modern, fast and user-friendly websites, landing pages and custom web apps — fully responsive.',
    'Egyedi weboldalak & WordPress': 'Custom websites & WordPress',
    'SEO-barát felépítés': 'SEO-friendly structure',
    'Reszponzív, mobilbarát design': 'Responsive, mobile-friendly design',
    'Webshop & e-commerce': 'Webshop & e-commerce',
    'Egyedi webáruházak fejlesztése a koncepciótól az élesítésig, fizetési integrációkkal és könnyű kezelhetőséggel.':
      'Custom online stores from concept to launch, with payment integrations and easy management.',
    'Egyedi webshop megoldások': 'Custom webshop solutions',
    'Fizetési & szállítási integráció': 'Payment & shipping integration',
    'Termékkatalógus & készlet': 'Product catalog & stock',
    'Asztali alkalmazások': 'Desktop applications',
    'Asztali szoftverek fejlesztése, telepítése és karbantartása, valamint adaptálása mobil és webes környezetre.':
      'Development, deployment and maintenance of desktop software, plus adaptation to mobile and web.',
    'Egyedi asztali szoftverek': 'Custom desktop software',
    'Telepítés & karbantartás': 'Deployment & maintenance',
    'Mobil & web adaptáció': 'Mobile & web adaptation',
    'Kiberbiztonság': 'Cybersecurity',
    'Vírus- és malware védelem, biztonsági auditok és felhasználói képzés, hogy adataid mindig biztonságban legyenek.':
      'Virus and malware protection, security audits and user training to keep your data safe.',
    'Vírus- & malware eltávolítás': 'Virus & malware removal',
    'Rendszeres biztonsági szkennelés': 'Regular security scanning',
    'Biztonsági felhasználói képzés': 'Security user training',
    'Hálózat & üzemeltetés': 'Network & operations',
    'Hálózatépítés és -támogatás, szerverek és munkaállomások zökkenőmentes, hatékony és biztonságos működtetése.':
      'Network setup and support, smooth, efficient and secure operation of servers and workstations.',
    'Hálózatépítés & optimalizálás': 'Network setup & optimization',
    'Wi-Fi & csatlakozási támogatás': 'Wi-Fi & connectivity support',
    'Folyamatos üzemeltetés': 'Continuous operations',
    'Tanácsadás & SEO': 'Consulting & SEO',
    'Technológiai tanácsadás, biztonsági kérdések, keresőoptimalizálás és egyedi fejlesztések — szakértő háttérrel.':
      'Technology consulting, security topics, search engine optimization and custom development — with expert backing.',
    'Technológiai tanácsadás': 'Technology consulting',
    'Keresőoptimalizálás (SEO)': 'Search engine optimization (SEO)',
    'Egyedi fejlesztések': 'Custom development',

    // ---- IT megoldások ----
    'IT szolgáltatások, amelyben megbízhat': 'IT services you can rely on',
    'Tapasztalt csapatunk magas színvonalú támogatást nyújt a rendszerkarbantartástól a biztonsági megoldásokig — a vállalkozásod zavartalan működéséért.':
      'Our experienced team provides high-quality support from system maintenance to security — for the smooth running of your business.',
    'Vírus- és malware védelem': 'Virus and malware protection',
    'Kártevők és kémprogramok eltávolítása, rendszeres biztonsági ellenőrzés szkenneléssel.':
      'Removal of malware and spyware, regular security checks with scanning.',
    'Hardver karbantartás és javítás': 'Hardware maintenance and repair',
    'Hogy a számítógépek és perifériák megbízhatóan, hosszú távon működjenek.':
      'So your computers and peripherals work reliably for the long term.',
    'Hálózati támogatás': 'Network support',
    'Munkaállomások, szerverek és eszközök zökkenőmentes, biztonságos működése a hálózaton.':
      'Smooth, secure operation of workstations, servers and devices on the network.',
    'Adatmentés és helyreállítás': 'Backup and recovery',
    'Rendszeres, megbízható biztonsági mentés — adatvesztés esetén gyors visszaállítás.':
      'Regular, reliable backups — fast recovery in case of data loss.',
    'Felhasználói képzés': 'User training',
    'Útmutatók, oktatóanyagok és folyamatos támogatás a biztonságos, hatékony eszközhasználatért.':
      'Guides, tutorials and ongoing support for safe, efficient device use.',
    'Mobil eszközök támogatása': 'Mobile device support',
    'Telefonok és tabletek beállítása, kezelése és integrálása a céges rendszerbe.':
      'Setup, management and integration of phones and tablets into the company system.',
    'Asztali szoftverek': 'Desktop software',
    'Asztali programok telepítése, frissítése és karbantartása a folyamatos működésért.':
      'Installation, updates and maintenance of desktop programs for continuous operation.',
    'Szoftver- & hardverhiba javítás': 'Software & hardware fault repair',
    '100+ ügyfél tapasztalatával gyors és megbízható hibaelhárítás bármilyen problémára.':
      'With 100+ clients of experience, fast and reliable troubleshooting for any issue.',

    // ---- Árazás ----
    'Átlátható árazás': 'Transparent pricing',
    'Válaszd a hozzád illő csomagot — az árak tájékoztató jellegűek, a végleges ajánlatot 12 órán belül küldjük.':
      'Choose the package that fits you — prices are indicative, the final quote arrives within 12 hours.',
    'Induló': 'Starter',
    '-tól': '+',
    'Bemutatkozó weboldalakhoz.': 'For introductory websites.',
    'Egyoldalas / bemutatkozó oldal': 'Single-page / intro site',
    'Alap SEO beállítás': 'Basic SEO setup',
    'Kapcsolati űrlap': 'Contact form',
    'Népszerű': 'Popular',
    'Üzleti': 'Business',
    'Több oldalas weboldal vagy webshop.': 'Multi-page website or webshop.',
    'Több oldalas weboldal / webshop': 'Multi-page website / webshop',
    'Egyedi design + admin felület': 'Custom design + admin panel',
    'SEO & teljesítmény optimalizálás': 'SEO & performance optimization',
    '1 hónap támogatás': '1 month of support',
    'Egyedi / Üzemeltetés': 'Custom / Operations',
    'Egyedi': 'Custom',
    'Komplex rendszerek és folyamatos IT.': 'Complex systems and ongoing IT.',
    'Egyedi web-/asztali alkalmazás': 'Custom web/desktop application',
    'Kiberbiztonsági audit': 'Cybersecurity audit',
    'Hálózat & szerver üzemeltetés': 'Network & server operations',
    'Folyamatos havidíjas támogatás': 'Ongoing monthly support',
    'Beszéljünk': "Let's talk",

    // ---- Folyamat ----
    'Hogyan dolgozunk': 'How we work',
    'Átlátható, gyors és kiszámítható — minden lépésnél tudod, hol tartunk.':
      'Transparent, fast and predictable — you always know where we are.',
    'Egyeztetés': 'Consultation',
    'Megismerjük az igényeidet, a céljaidat és a meglévő rendszereidet.':
      'We get to know your needs, goals and existing systems.',
    'Árajánlat 12 órán belül': 'Quote within 12 hours',
    'Részletes, átlátható ajánlatot küldünk — kötelezettség nélkül.':
      'We send a detailed, transparent quote — with no obligation.',
    'Fejlesztés & megvalósítás': 'Development & delivery',
    'Folyamatos visszajelzés mellett építjük fel a megoldásodat.':
      'We build your solution with continuous feedback.',
    'Átadás & üzemeltetés': 'Handover & operations',
    'Élesítés, betanítás és hosszú távú támogatás, ha kell.':
      'Launch, training and long-term support if needed.',

    // ---- Referenciák ----
    'Projektek, amikre büszkék vagyunk': "Projects we're proud of",
    'Néhány válogatott munka az elmúlt időszakból — gyors átfutással, elégedett ügyfelekkel.':
      'A few selected works from recent times — fast delivery, happy clients.',
    'Weboldal': 'Website',
    'Új, modern weboldal a teljes termékkínálat bemutatásához — villámgyors átfutással.':
      'A new, modern website to present the full product range — with lightning-fast delivery.',
    '⚡ 24 óra alatt kész': '⚡ Done in 24 hours',
    'Egyedi weboldal a csapat számára, letisztult megjelenéssel és gyors betöltéssel.':
      'A custom website for the team, with a clean look and fast loading.',
    '⚡ 8 óra alatt kész': '⚡ Done in 8 hours',
    'Egyedi webshop fejlesztése a koncepciótól az élesítésig, teljesen testreszabva.':
      'Custom webshop development from concept to launch, fully tailored.',
    'Indulás: 2023.04.17.': 'Launch: 2023.04.17.',
    'Komplex ingatlanhirdetési platform egy ingatlaniroda számára, egyedi funkciókkal.':
      'A complex real-estate listing platform for an agency, with custom features.',
    '🏠 Ingatlan platform': '🏠 Real-estate platform',
    'Vendégház bemutatkozó oldal': 'Guesthouse landing page',
    'Hangulatos, foglalásra ösztönző weboldal egy vendégház számára.':
      'A cozy, booking-oriented website for a guesthouse.',
    '🏡 Turizmus': '🏡 Tourism',
    'A te projekted lehet a következő': 'Your project could be next',
    'Beszéljük meg az ötletedet — pár órán belül kapsz tőlünk visszajelzést.':
      "Let's discuss your idea — you'll hear back from us within a few hours.",
    'Beszéljünk róla': "Let's talk about it",
    '— Elégedett ügyfél, weboldal projekt': '— Happy client, website project',

    // ---- Élő betekintő ----
    'Pillants be egy élő projektbe': 'Take a peek at a live project',
    'hunthorde.com — élő előnézet': 'hunthorde.com — live preview',
    'Megnyitás új lapon ↗': 'Open in new tab ↗',

    // ---- Hírek ----
    'Aktualitások': 'News',
    'Legfrissebb híreink, projektjeink és bejelentéseink.':
      'Our latest news, projects and announcements.',

    // ---- Rólunk ----
    'Megbízható IT partner, emberi hangon': 'A reliable IT partner, with a human voice',
    'Gyors, kiszámítható átfutás': 'Fast, predictable delivery',
    'Modern technológiák': 'Modern technologies',
    'Hosszú távú támogatás': 'Long-term support',
    '100+ elégedett ügyfél': '100+ happy clients',

    // ---- GYIK ----
    'Gyakori kérdések': 'Frequently asked questions',
    'A leggyakrabban felmerülő kérdések — ha valami kimaradt, írj bátran!':
      'The most common questions — if something is missing, feel free to write!',
    'Mennyi idő alatt készül el egy weboldal?': 'How long does it take to build a website?',
    'Egyszerűbb oldalakat akár 8–24 óra alatt élesítünk; összetettebb projekteknél a pontos időt az ingyenes árajánlatban adjuk meg.':
      'Simpler sites can go live in 8–24 hours; for complex projects we give the exact timing in the free quote.',
    'Mennyibe kerül egy projekt?': 'How much does a project cost?',
    'Minden megoldás egyedi. Írd le pár mondatban az igényed, és 12 órán belül küldünk egy átlátható, kötelezettségmentes árajánlatot.':
      'Every solution is unique. Describe your needs in a few sentences and within 12 hours we send a transparent, no-obligation quote.',
    'Vállaltok üzemeltetést és karbantartást is?': 'Do you also offer operations and maintenance?',
    'Igen. Hálózat, szerver, mentés, biztonsági frissítések és folyamatos támogatás — igény szerint havidíjas konstrukcióban is.':
      'Yes. Network, server, backups, security updates and ongoing support — available on a monthly basis too.',
    'Hogyan kezelitek az adatok biztonságát?': 'How do you handle data security?',
    'Titkosított jelszótárolás, rendszeres mentés, biztonsági szkennelés és felhasználói képzés. A kiberbiztonság minden megoldásunk alapja.':
      'Encrypted password storage, regular backups, security scanning and user training. Cybersecurity is the foundation of all our solutions.',

    // ---- Kapcsolat ----
    'Kérj ingyenes árajánlatot': 'Request a free quote',
    'E-mail': 'Email',
    'Weboldal': 'Website',
    'Válaszidő': 'Response time',
    'Ingyenes árajánlat 12 órán belül': 'Free quote within 12 hours',
    'Neved': 'Your name',
    'E-mail címed': 'Your email',
    'Miben segíthetünk?': 'How can we help?',
    'Weboldal / webalkalmazás': 'Website / web app',
    'Asztali alkalmazás': 'Desktop application',
    'Egyéb / tanácsadás': 'Other / consulting',
    'Üzenet': 'Message',
    'Árajánlat kérése': 'Send request',

    // ---- Referencia modál ----
    'Projekt': 'Project',
    'Weboldal megtekintése ↗': 'View website ↗',
    'Kérek hasonlót': 'I want something similar',
    'Bezárás': 'Close',

    // ---- Lábléc ----
    'Web- és asztali szolgáltatás fejlesztés és üzemeltetés. Megbízható IT partner a vállalkozásod jövőjéhez.':
      'Web and desktop service development and operations. A reliable IT partner for the future of your business.',
    'Cég': 'Company',
    'Folyamat': 'Process',
    'Kapcsolat': 'Contact',
    'Jogi': 'Legal',
    'Adatkezelési tájékoztató': 'Privacy policy',
    'Süti beállítások': 'Cookie settings',
    'Minden jog fenntartva.': 'All rights reserved.',
    'Készült ❤️-vel és': 'Made with ❤️ and',

    // ---- Webshop ----
    'Technológia, ami magáért beszél': 'Technology that speaks for itself',
    'Válogass kézzel összeállított kínálatunkból.': 'Browse our hand-picked selection.',
    'Válogass kézzel összeállított kínálatunkból — azonnali hozzáférés, megbízható minőség.':
      'Browse our hand-picked selection — instant access, reliable quality.',
    'Keresés': 'Search',
    'Keresés a termékek között...': 'Search products...',
    'Rendezés': 'Sort',
    'Kiemelt': 'Featured',
    'Ár: növekvő': 'Price: low to high',
    'Ár: csökkenő': 'Price: high to low',
    'Név (A–Z)': 'Name (A–Z)',
    'Nincs a keresésnek megfelelő termék.': 'No products match your search.',
    'Kosár': 'Cart',
    'Kosár megnyitása': 'Open cart',
    'Kosár bezárása': 'Close cart',
    'Számlázási adatok': 'Billing details',
    'Név *': 'Name *',
    'E-mail *': 'Email *',
    'Telefonszám': 'Phone number',
    'Számlázási cím': 'Billing address',
    'Megjegyzés': 'Note',
    'Összesen': 'Total',
    'Tovább a pénztárhoz': 'Proceed to checkout',
    'Rendelés leadása': 'Place order',
    '← Vissza a kosárhoz': '← Back to cart',
    'Fiók': 'Account',
    'Bejelentkezés': 'Sign in',
    'Regisztráció': 'Register',
    'E-mail cím': 'Email address',
    'Jelszó': 'Password',
    'Név': 'Name',
    'Teljes neved': 'Your full name',
    'Legalább 6 karakter': 'At least 6 characters',
    'fiók': 'account',

    // ---- Süti sáv (ha megjelenik) ----
    'Sütiket használunk': 'We use cookies',
    'Elfogadom': 'Accept',
    'Elutasítom': 'Decline'
  };

  var lang = 'hu';
  try { lang = localStorage.getItem('lt_lang') === 'en' ? 'en' : 'hu'; } catch (e) { lang = 'hu'; }

  function translateText(node) {
    var t = node.nodeValue;
    if (!t) return;
    var trimmed = t.trim();
    if (!trimmed) return;
    var rep = DICT[trimmed];
    if (rep != null) node.nodeValue = t.replace(trimmed, rep);
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { translateText(root); return; }
    if (root.nodeType !== 1) return;
    var tag = root.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE') return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var batch = [], n;
    while ((n = w.nextNode())) batch.push(n);
    batch.forEach(translateText);
  }
  function translateAttrs(root) {
    var attrs = ['placeholder', 'aria-label', 'title', 'data-more'];
    attrs.forEach(function (a) {
      var els = (root || document).querySelectorAll('[' + a + ']');
      Array.prototype.forEach.call(els, function (el) {
        var v = el.getAttribute(a); if (!v) return;
        var tr = v.trim(); var rep = DICT[tr];
        if (rep != null) el.setAttribute(a, v.replace(tr, rep));
      });
    });
  }

  function applyLang() {
    document.documentElement.setAttribute('lang', lang);
    if (lang === 'en') {
      walk(document.body);
      translateAttrs(document);
      // dinamikusan beszúrt tartalom fordítása
      try {
        var mo = new MutationObserver(function (muts) {
          muts.forEach(function (m) {
            Array.prototype.forEach.call(m.addedNodes, function (nd) { walk(nd); });
          });
        });
        mo.observe(document.body, { childList: true, subtree: true });
      } catch (e) { /* ignore */ }
      // néhány késleltetett újrafuttatás a kezdeti aszinkron renderhez
      setTimeout(function () { walk(document.body); translateAttrs(document); }, 1200);
      setTimeout(function () { walk(document.body); }, 3000);
    }
  }

  function buildToggle() {
    var nav = document.querySelector('.main-nav') || document.querySelector('nav');
    if (!nav) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang-toggle';
    btn.setAttribute('aria-label', lang === 'en' ? 'Váltás magyarra' : 'Switch to English');
    btn.textContent = lang === 'en' ? 'HU' : 'EN';
    btn.addEventListener('click', function () {
      var next = lang === 'en' ? 'hu' : 'en';
      try { localStorage.setItem('lt_lang', next); } catch (e) { /* ignore */ }
      location.reload();
    });
    nav.appendChild(btn);
  }

  function init() {
    buildToggle();
    applyLang();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
