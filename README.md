# Luiz-Tech — weboldal redesign

Modern, sötét, „fejlesztői” hangulatú egyoldalas (one-page) weboldal a
**Luiz-Tech** informatikai szolgáltatásaihoz, kód-animációkkal.

A tartalom a jelenlegi [luiz-tech.hu](https://luiz-tech.hu) oldal kínálatára épül:
webfejlesztés, webshop, asztali alkalmazások, kiberbiztonság, hálózati támogatás
és üzemeltetés.

## Jellemzők

- ⚡ **Statikus oldal** — nincs build lépés, bárhol futtatható (GitHub Pages, bármilyen webszerver).
- ⌨️ **Animált terminál** a hero szekcióban, gépelés-effektussal.
- 🌌 **Részecske-háló háttér** (canvas), egér-interakcióval.
- 🎞️ **Scroll-reveal animációk** (IntersectionObserver), staggerrel.
- 🔢 **Animált számlálók** a statisztikákhoz.
- 📊 **Scroll progress bar**, ragadós (sticky) fejléc, mobil menü.
- 🎨 Reszponzív, akadálymentes (`prefers-reduced-motion` támogatással).

## Webshop + admin (testreszabás)

Az oldalhoz tartozik egy működő **webshop demó** és egy **admin felület**,
ahol a bolt valós időben testreszabható. A beállítások a böngésző
`localStorage`-ában tárolódnak (build és backend nélküli prototípus).

- **`webshop.html`** — kirakat: termékek, kategória-szűrő, keresés, kosár
  (mennyiség, összesítés, rendelés-demó). A bolt nevét, szövegeit, színeit és
  kínálatát az admin beállításaiból olvassa.
- **`admin.html`** — belépés után testreszabható:
  - **Általános:** bolt neve, szlogen, kezdőoldal szövegei, pénznem, ingyenes szállítás határa
  - **Megjelenés:** elsődleges/másodlagos szín, kész színsémák, sötét/világos téma, élő előnézet
  - **Termékek:** felvétel / szerkesztés / törlés (ikon, név, leírás, ár, kategória)
  - **Fiók:** admin belépési adatok módosítása
  - **Visszaállítás:** alapértelmezett beállítások visszatöltése

> **Demó belépés:** felhasználó `admin`, jelszó `luiztech`.
> Az authentikáció és a tárolás kizárólag kliensoldali — éles használathoz
> backend (pl. felhasználókezelés + adatbázis) és valódi fizetési integráció kell.

## Szerkezet

```
index.html              # főoldal (one-page)
webshop.html            # webshop kirakat
admin.html              # belépés + testreszabó felület
assets/
  css/style.css         # alap stílusok, animációk
  css/webshop.css       # webshop kirakat + témák
  css/admin.css         # admin + belépés
  js/main.js            # interakciók, terminál + canvas animáció
  js/shop-config.js     # közös konfig/kosár/auth réteg (localStorage)
  js/webshop.js         # kirakat logika
  js/admin.js           # admin panel logika
  img/favicon.svg
```

## Helyi futtatás

Nyisd meg az `index.html`-t böngészőben, vagy indíts egy egyszerű szervert:

```bash
python3 -m http.server 8000
# majd: http://localhost:8000
```

## Testreszabás

- **Színek:** az `assets/css/style.css` tetején lévő `:root` CSS-változók.
- **Tartalom / szövegek:** közvetlenül az `index.html`-ben.
- **Terminál sorai:** az `assets/js/main.js` `lines` tömbjében.
- **Kapcsolati adatok:** keresd az `info@luiz-tech.hu` előfordulásait.

> Megjegyzés: a kapcsolati űrlap jelenleg kliensoldali demó (nem küld e-mailt).
> Élesben kösd be egy backend végpontra vagy egy form-szolgáltatásra (pl. Formspree).
