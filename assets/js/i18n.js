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
    'Hívás': 'Call',
    'Telefon': 'Phone',
    'Vissza a tetejére': 'Back to top',

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

    // ---- Kiemelt termékek (Népszerű a webshopból) ----
    '// webshop': '// webshop',
    'Népszerű a webshopból': 'Popular from the shop',
    'Válogatott termékeink a boltból — a teljes kínálat a webshopban vár.':
      'A selection of our products — the full range awaits in the webshop.',
    'Termékek betöltése…': 'Loading products…',
    'Megnézem a boltban': 'View in the shop',
    'Tovább a webshopba →': 'Go to the webshop →',

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
    'Egy kis ablak a': 'A little window into',
    '-ra — kattints rá, és megnyílik teljes méretben.': ' — click it to open at full size.',
    'vadmester.hu — élő előnézet': 'vadmester.hu — live preview',
    'Megnyitás új lapon ↗': 'Open in new tab ↗',

    // ---- Hírek ----
    'Aktualitások': 'News',
    'Legfrissebb híreink, projektjeink és bejelentéseink.':
      'Our latest news, projects and announcements.',

    // ---- Rólunk ----
    'Megbízható IT partner, emberi hangon': 'A reliable IT partner, with a human voice',
    'alapító · fejlesztő': 'founder · developer',
    'professzionális informatikai szolgáltatásokkal biztosítja a vállalkozásod zavartalan működését. Tapasztalt csapatunk a rendszerkarbantartástól a hálózatépítésen át a biztonsági megoldásokig magas színvonalú támogatást nyújt.':
      'provides professional IT services to keep your business running smoothly. Our experienced team delivers high-quality support from system maintenance through networking to security solutions.',
    'Hiszünk a gyorsaságban és az átláthatóságban: bármilyen platformról kényelmesen elérsz minket, és':
      'We believe in speed and transparency: you can reach us conveniently from any platform, and',
    '12 órán belül ingyenes árajánlatot': 'we give a free quote within 12 hours',
    'adunk. A munkáinkat a precizitás, a modern technológia és a hosszú távú együttműködés jellemzi.':
      '. Our work is defined by precision, modern technology and long-term cooperation.',
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
    'Maradjak bejelentkezve': 'Keep me signed in',
    'fiók': 'account',

    // ---- Webshop: fiók-fiók / ticketek / űrlapok ----
    'Fiók létrehozása': 'Create account',
    'Fiókom': 'My account',
    'Rendeléseim': 'My orders',
    'Support ticketek': 'Support tickets',
    'Támogatás': 'Support',
    '+ Új': '+ New',
    'Kilépés': 'Sign out',
    'Tárgy': 'Subject',
    'Leírás': 'Description',
    'Ticket létrehozása': 'Create ticket',
    'Válasz küldése': 'Send reply',
    'Új support ticket': 'New support ticket',
    'Termék részletei': 'Product details',
    'termék': 'product',
    'ticket': 'ticket',
    'új support ticket': 'new support ticket',
    'Több': 'More',
    'Kevesebb': 'Fewer',

    // ---- Webshop: hozzájárulás (pénztár) ----
    'Elolvastam és elfogadom az': 'I have read and accept the',
    'ÁSZF-et': 'Terms',
    'és az': 'and the',
    'adatkezelési tájékoztatót': 'Privacy Policy',

    // ---- Webshop: helykitöltők ----
    'te@example.hu': 'you@example.com',
    'pl. anna@example.hu': 'e.g. jane@example.com',
    'Pl. Kovács Anna': 'E.g. Jane Doe',
    'Mesélj a projektedről...': 'Tell us about your project...',
    'Pl. nem működik az e-mail': 'E.g. email is not working',
    'Írd le a problémát részletesen...': 'Describe the problem in detail...',
    'Válasz írása...': 'Write a reply...',
    'Pl. csengő nem működik...': 'E.g. doorbell not working...',

    // ---- Webshop: dinamikus üzenetek (JS) ----
    'Kosárba': 'Add to cart',
    '✓ Hozzáadva': '✓ Added',
    'Összes': 'All',
    'A kosarad még üres.': 'Your cart is empty.',
    'Böngészd a termékeket! 🛍️': 'Browse the products! 🛍️',
    'Kosárba téve': 'Added to cart',
    'Rendelés áttekintése': 'Order summary',
    '← Tovább vásárolok': '← Continue shopping',
    'Eltávolítás': 'Remove',
    'Fizetés a Stripe biztonságos rendszerén keresztül': 'Payment via Stripe’s secure system',

    // ---- Webshop: bizalmi sáv ----
    'Biztonságos fizetés': 'Secure payment',
    'Stripe titkosított rendszer': 'Encrypted Stripe system',
    'Gyors teljesítés': 'Fast delivery',
    'Visszajelzés 12 órán belül': 'Reply within 12 hours',
    '14 napos elállás': '14-day returns',
    'Kockázatmentes rendelés': 'Risk-free ordering',
    'Valódi support': 'Real support',
    'Személyes ügyintézés': 'Personal assistance',
    'Add meg a neved és egy érvényes e-mail címet.': 'Please enter your name and a valid email address.',
    'A rendeléshez fogadd el az ÁSZF-et és az adatkezelési tájékoztatót.': 'To place an order, please accept the Terms and the Privacy Policy.',
    'Rendelés feldolgozása...': 'Processing order...',
    'Hiba történt a rendelés során. Próbáld újra.': 'An error occurred while ordering. Please try again.',
    'Átirányítás a biztonságos fizetéshez…': 'Redirecting to secure payment…',
    'Fizetés ellenőrzése…': 'Verifying payment…',
    'Köszönjük a vásárlást! 🎉': 'Thank you for your purchase! 🎉',
    'A fizetés még feldolgozás alatt.': 'Payment is still processing.',
    'A fizetést nem sikerült megerősíteni.': 'Could not confirm the payment.',
    'A fizetés megszakadt — a rendelésed fizetésre vár.': 'Payment was cancelled — your order is awaiting payment.',
    'Fizetésre vár': 'Awaiting payment',
    'Fizetve': 'Paid',
    'Beváltás': 'Apply',
    'Kuponkód': 'Coupon code',
    'Ellenőrzés…': 'Checking…',
    'Add meg az e-mail címed és a jelszavad.': 'Enter your email and password.',
    'Tölts ki minden mezőt (jelszó min. 6 karakter).': 'Fill in all fields (password min. 6 characters).',
    'Betöltés...': 'Loading...',
    'Még nincs ticketed.': 'You have no tickets yet.',
    'Még nincs rendelésed.': 'You have no orders yet.',
    'Nem sikerült betölteni.': 'Failed to load.',
    'Tárgy és leírás megadása kötelező.': 'Subject and description are required.',
    'Az üzenet nem lehet üres.': 'The message cannot be empty.',
    'Hiba történt.': 'An error occurred.',
    ' (helyi demó)': ' (local demo)',
    '. Hamarosan felvesszük veled a kapcsolatot.': '. We will contact you soon.',

    // ---- Rendelés- és ticket-státuszok ----
    'Új': 'New',
    'Feldolgozás alatt': 'Processing',
    'Teljesítve': 'Completed',
    'Törölve': 'Cancelled',
    'Válaszra vár': 'Awaiting reply',
    'Lezárt': 'Closed',
    'Elfogyott': 'Sold out',

    // ---- Robot szövegbuborék üzenetei ----
    'Kattints rám! ✨': 'Click me! ✨',
    'Beszélj velünk, gyorsan válaszolunk 😉': 'Talk to us, we reply fast 😉',
    'Szép napot ❤️': 'Have a nice day ❤️',
    'Jól nézel ma ki! ❤️': 'You look great today! ❤️',
    'Weboldal gyorsan érdekel? 😉': 'Need a website fast? 😉',
    'Milyen gyorsan kell? Megoldjuk. 😉': 'How fast do you need it? We got you. 😉',
    'Szia! 👋': 'Hi! 👋',
    'Üdv a Luiz-Tech-nél! 🚀': 'Welcome to Luiz-Tech! 🚀',
    'Örülök, hogy itt vagy! 😊': "Glad you're here! 😊",
    'Jó látni téged! 😊': 'Good to see you! 😊',
    'Csodás napot kívánok! ☀️': 'Have a wonderful day! ☀️',
    'Hogy telik a napod? 😊': 'How is your day going? 😊',
    'Üdvözöllek, barátom! 🤝': 'Welcome, my friend! 🤝',
    'Új weboldal? Mi megoldjuk! 💻': 'New website? We can build it! 💻',
    'Webshopot álmodtál? Megépítjük! 🛒': 'Dreaming of a webshop? We build it! 🛒',
    'Lassú a régi oldalad? Felpörgetjük! ⚡': 'Old site slow? We speed it up! ⚡',
    'Mobilon is tökéletes lesz. 📱': "It'll be perfect on mobile too. 📱",
    'Egyedi design, nulláról. 🎨': 'Custom design, from scratch. 🎨',
    'Pár nap és kész is. ⏱️': 'Ready in a few days. ⏱️',
    'Ingyenes árajánlat 12 órán belül! 🎁': 'Free quote within 12 hours! 🎁',
    'Kérdésed van? Itt vagyok! 💬': 'Got a question? I am here! 💬',
    'Segíthetek valamiben? 🙂': 'Can I help with something? 🙂',
    'Beszéljük meg az ötleted! 💡': "Let's discuss your idea! 💡",
    'Van egy jó ötleted? Halljuk! 🎯': 'Got a good idea? Tell us! 🎯',
    'Álmodd meg, mi lekódoljuk. ✨': 'Dream it, we code it. ✨',
    'A kódolás a mi szupererőnk. 🦸': 'Coding is our superpower. 🦸',
    'Bug? Nálunk az ritka vendég. 🐛': 'A bug? A rare guest here. 🐛',
    'Tiszta kód, boldog ügyfél. 😌': 'Clean code, happy client. 😌',
    'Coffee + code = Luiz-Tech ☕': 'Coffee + code = Luiz-Tech ☕',
    'Mi nem alszunk, mi deployolunk. 🚀': "We don't sleep, we deploy. 🚀",
    'Te kérdezel, mi fejlesztünk. 🔧': 'You ask, we build. 🔧',
    'A jövő kódból épül. 🧱': 'The future is built from code. 🧱',
    'Gyors. Biztonságos. Szép. ✅': 'Fast. Secure. Beautiful. ✅',
    'SEO? Bízd ránk! 📈': 'SEO? Leave it to us! 📈',
    'Feltornázzuk a Google-ben. 🔝': "We'll boost you on Google. 🔝",
    'Több látogató, több ügyfél. 📊': 'More visitors, more clients. 📊',
    'Biztonság elsőként. 🔒': 'Security first. 🔒',
    'Adatmentés? Megoldva. 💾': 'Backups? Sorted. 💾',
    'Hálózati gond? Mi rendbe tesszük. 📡': 'Network trouble? We fix it. 📡',
    'Otthonról is jó kezekben vagy. 🏠': "You're in good hands from home too. 🏠",
    'Mosolyogj, szép a kódunk! 😄': 'Smile, our code is pretty! 😄',
    'Te vagy a kedvenc látogatónk! ⭐': "You're our favorite visitor! ⭐",
    'Pszt… van egy titkunk: imádjuk a munkánk. 🤫': "Psst… a secret: we love our work. 🤫",
    'Ne félj, nem harapunk. 🤖': "Don't worry, we don't bite. 🤖",
    'Csak egy kattintásra a jövőd. 🖱️': 'Your future is one click away. 🖱️',
    'Kávézz egyet, mi addig kódolunk. ☕': 'Grab a coffee, we will code. ☕',
    'A pixelek is minket szeretnek. 🎨': 'Even the pixels love us. 🎨',
    'Reszponzív, mint egy macska. 🐱': 'Responsive like a cat. 🐱',
    'Villámgyors betöltés garantálva. ⚡': 'Lightning-fast loading guaranteed. ⚡',
    '100% kézzel készült kód. 👐': '100% handcrafted code. 👐',
    'Nincs sablon, csak egyedi. 🧩': 'No templates, only custom. 🧩',
    'A weboldalad legyen sztár! 🌟': 'Let your website be a star! 🌟',
    'Beszéljünk a projektedről! 🗣️': "Let's talk about your project! 🗣️",
    'Mi a következő nagy ötleted? 💭': "What's your next big idea? 💭",
    'Készen állsz a fejlődésre? 🌱': 'Ready to grow? 🌱',
    'Tedd online a vállalkozásod! 🌐': 'Take your business online! 🌐',
    'Online jelenlét = több bevétel. 💰': 'Online presence = more revenue. 💰',
    'A versenytársaid már online vannak. 👀': 'Your competitors are already online. 👀',
    'Ne maradj le, lépj előre! 🏃': "Don't fall behind, step ahead! 🏃",
    'Egy jó oldal aranyat ér. 🥇': 'A good site is worth gold. 🥇',
    'A részletekben rejlik a szépség. 🔍': 'Beauty is in the details. 🔍',
    'Figyelünk minden pixelre. ✨': 'We mind every pixel. ✨',
    'Te álmodsz, mi valósítunk. 🌈': 'You dream, we make it real. 🌈',
    'Kódból szövünk varázslatot. 🪄': 'We weave magic from code. 🪄',
    'Hibátlan élmény a célunk. 🎯': 'A flawless experience is our goal. 🎯',
    'Letisztult, modern, gyors. 💎': 'Clean, modern, fast. 💎',
    'A te sikered a mi sikerünk. 🏆': 'Your success is our success. 🏆',
    'Mindig naprakész technológia. 🆕': 'Always up-to-date technology. 🆕',
    'A trendek nálunk otthon vannak. 📐': 'Trends are at home with us. 📐',
    'Sötét mód? Persze, van! 🌙': 'Dark mode? Of course! 🌙',
    'Világos mód? Az is megy! ☀️': 'Light mode? That works too! ☀️',
    'Animációk, amik élnek. 🎬': 'Animations that come alive. 🎬',
    'Olyan sima, mint a vaj. 🧈': 'Smooth as butter. 🧈',
    'Gyorsabb, mint gondolnád. 💨': 'Faster than you think. 💨',
    'Egy klikk és elindulunk. 🚦': 'One click and we are off. 🚦',
    'Készíts velünk valami nagyot! 🏗️': 'Build something big with us! 🏗️',
    'A kódunk olyan tiszta, hogy ragyog. ✨': 'Our code is so clean it shines. ✨',
    'Hűséges ügyfeleink imádnak. 💖': 'Our loyal clients love us. 💖',
    'Próbáld ki, nem fogod megbánni. 😉': "Give it a try, you won't regret it. 😉",
    'Velünk könnyű. 😎': "It's easy with us. 😎",
    'Hagyd ránk a technikát! 🛠️': 'Leave the tech to us! 🛠️',
    'Nincs olyan, hogy lehetetlen. 💪': 'Nothing is impossible. 💪',
    'Mi a stresszt is debuggoljuk. 🧘': 'We debug stress too. 🧘',
    'Kreativitás + kód = mágia. 🎩': 'Creativity + code = magic. 🎩',
    'A jövőd egy üzenetre van. ✉️': 'Your future is one message away. ✉️',
    'Szólj, és intézzük! 📞': 'Just say the word, we handle it! 📞',
    'Te is megérdemled a profi oldalt. 👑': 'You deserve a pro website too. 👑',
    'A weboldalad, csúcsformában. 🏋️': 'Your website, in top shape. 🏋️',
    'Minden eszközön gyönyörű. 🖥️': 'Beautiful on every device. 🖥️',
    'Töltsd fel a márkád energiával! ⚡': 'Charge your brand with energy! ⚡',
    'Készen állunk rád! 🙌': 'We are ready for you! 🙌',
    'Egy mosoly, és máris jobb a napod. 😊': 'A smile, and your day is better. 😊',
    'Te vagy a mai fénypontunk! 🌞': "You're our highlight today! 🌞",
    'Kódolunk, hogy te pihenhess. 😴': 'We code so you can rest. 😴',
    'A nehéz részt mi visszük. 🏋️': 'We carry the heavy part. 🏋️',
    'Nyugi, mi megoldjuk. 👍': 'Relax, we got this. 👍',
    'A digitális jövőd itt kezdődik. 🚪': 'Your digital future starts here. 🚪',
    'Lépjünk szintet együtt! 🎮': "Let's level up together! 🎮",
    'Adj egy esélyt a wow-élménynek! 🤩': 'Give the wow factor a chance! 🤩',
    'Tudtad? Imádjuk a kihívásokat. 🧗': 'Did you know? We love challenges. 🧗',
    'Akár ma is elkezdhetjük. 📅': 'We can start as soon as today. 📅',
    'A te oldalad, a mi szívügyünk. ❤️': 'Your site, our passion. ❤️',
    'Pörgessük fel a vállalkozásod! 🌀': "Let's supercharge your business! 🌀",
    'Egy jó kávé és bármi megoldható. ☕': 'A good coffee and anything is possible. ☕',
    'Profi munka, baráti hangulat. 🤗': 'Pro work, friendly vibe. 🤗',
    'Ne csak létezz online — ragyogj! 🌟': "Don't just exist online — shine! 🌟",
    'Indítsuk be a sikered! 🔥': "Let's ignite your success! 🔥",
    'Mindig itt vagyok, ha kellek. 🤖': "I'm always here if you need me. 🤖",

    // ---- Hero terminál kód (ember-nyelvű részek) ----
    '// Luiz-Tech — terméklista React hookkal': '// Luiz-Tech — product list with a React hook',
    '// Luiz-Tech — rendelés összegző szolgáltatás': '// Luiz-Tech — order total service',
    '// Luiz-Tech — biztonságos lekérdezés (PDO)': '// Luiz-Tech — safe query (PDO)',
    '// Luiz-Tech — generikus összegző (C++17)': '// Luiz-Tech — generic sum (C++17)',
    '// Luiz-Tech — API kliens (hibakezeléssel)': '// Luiz-Tech — API client (with error handling)',
    // ---- Hero terminál: deploy / üzemeltetés jelenetek ----
    '# automata kiszállítás éles szerverre': '# automated delivery to production',
    '# CI/CD folyamat minden push után': '# CI/CD pipeline on every push',
    '# élő rendszerfelügyelet': '# live system monitoring',
    '# webshop konténer build': '# webshop container build',
    '# automatikus kiszállítás minden push után': '# automatic delivery on every push',
    '-- Luiz-Tech — webshop séma': '-- Luiz-Tech — webshop schema',
    '# Luiz-Tech — szerver beüzemelés': '# Luiz-Tech — server provisioning',
    '// Luiz-Tech — React komponens': '// Luiz-Tech — React component',
    '// Luiz-Tech — C# szolgáltatás': '// Luiz-Tech — C# service',
    '// Luiz-Tech — PHP backend': '// Luiz-Tech — PHP backend',
    '// Luiz-Tech — C++ program': '// Luiz-Tech — C++ program',
    'Üdv a Luiz-Tech-nél! 🚀': 'Welcome to Luiz-Tech! 🚀',
    '"Üdv a Luiz-Tech-nél! 🚀"': '"Welcome to Luiz-Tech! 🚀"',
    '"Üdv, {$nev}! 🚀"': '"Hi, {$nev}! 🚀"',

    // ---- Süti sáv (ha megjelenik) ----
    'Sütiket használunk': 'We use cookies',
    'Elfogadom': 'Accept',
    'Elutasítom': 'Decline'
  };

  // Dinamikus, értékkel összefűzött szövegek eleje (prefix) → angol
  var PREFIX = [
    ['Készleten:', 'In stock:'],
    ['Utolsó', 'Only'],
    ['Köszönjük a rendelést! Azonosító:', 'Thank you for your order! ID:'],
    ['Üdv,', 'Hi,'],
    ['Fiókom —', 'My account —'],
    ['Fiókom – ', 'My account – ']
  ];

  var lang = 'hu';
  try { lang = localStorage.getItem('lt_lang') === 'en' ? 'en' : 'hu'; } catch (e) { lang = 'hu'; }

  // Mintázatos (számot tartalmazó) szövegek
  var REGEX = [
    [/^Utolsó\s+(\d+)\s+db$/, 'Only $1 left'],
    [/^Készleten:\s*(\d+)\s+db$/, 'In stock: $1 pcs']
  ];

  function translateString(s) {
    // belső szóközök/sortörések normalizálása, hogy a többsoros bekezdések is illeszkedjenek
    var norm = s.replace(/\s+/g, ' ').trim();
    if (!norm) return null;
    var lead = (s.match(/^\s*/) || [''])[0];
    var trail = (s.match(/\s*$/) || [''])[0];
    var rep = DICT[norm];
    if (rep != null) return lead + rep + trail;
    for (var r = 0; r < REGEX.length; r++) {
      if (REGEX[r][0].test(norm)) return lead + norm.replace(REGEX[r][0], REGEX[r][1]) + trail;
    }
    for (var i = 0; i < PREFIX.length; i++) {
      if (norm.indexOf(PREFIX[i][0]) === 0) return lead + norm.replace(PREFIX[i][0], PREFIX[i][1]) + trail;
    }
    return null;
  }
  function translateText(node) {
    if (!node.nodeValue) return;
    var out = translateString(node.nodeValue);
    if (out != null) node.nodeValue = out;
  }

  // Globális segéd más szkripteknek (pl. a robot üzeneteihez):
  // EN módban lefordít, egyébként az eredetit adja vissza.
  window.LT_translate = function (s) {
    if (lang !== 'en') return s;
    var out = translateString(String(s));
    return out == null ? s : out;
  };
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
        var out = translateString(v);
        if (out != null) el.setAttribute(a, out);
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
