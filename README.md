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

## Szerkezet

```
index.html              # a teljes oldal
assets/
  css/style.css         # stílusok, animációk
  js/main.js            # interakciók, terminál + canvas animáció
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
