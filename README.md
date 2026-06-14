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

> **Demó belépés:** felhasználó `admin`, jelszó `luiztech`
> (éles deploynál az `ADMIN_USER` / `ADMIN_PASS` env változókkal módosítható,
> illetve később az admin „Fiók" menüjében).

## Backend (csak deployolni kell)

Az oldalhoz tartozik egy **Node.js + Express** szerver, ami egyben kiszolgálja
a statikus oldalt **és** a webshop/admin REST API-t — egy app, egy port.

- **Adattár:** fájl-alapú JSON (`data/db.json`), nincs külső adatbázis-függőség.
- **Auth:** valódi jelszó-hashelés (`scrypt`) + HMAC-aláírt session token httpOnly cookie-ban.
- **Függőség:** mindössze az `express` — minden más Node beépített modul.
- **Fallback:** ha nincs elérhető backend, a frontend `localStorage`-ra vált,
  így a tiszta statikus hosting (pl. GitHub Pages) is működik.

### Helyi futtatás

```bash
npm install
npm start          # http://localhost:3000
# fejlesztéshez: npm run dev   (újraindít változáskor)
```

### Környezeti változók

Lásd `.env.example`. Élesben **mindenképp** állítsd be:

| változó           | leírás                                                        |
|-------------------|--------------------------------------------------------------|
| `PORT`            | a szerver portja (a host gyakran maga adja)                  |
| `SESSION_SECRET`  | állandó titok a tokenek aláírásához (különben restartkor kiléptet) |
| `ADMIN_USER`/`ADMIN_PASS` | kezdeti admin belépés (csak az első indításkor)      |
| `DATA_DIR`        | az adatfájl mappája (alapértelmezett: `./data`)              |

`SESSION_SECRET` generálása:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Deploy lehetőségek

- **Docker** (bármilyen konténer-host):
  ```bash
  docker build -t luiz-tech .
  docker run -p 3000:3000 -e SESSION_SECRET=... -v luiz_data:/app/data luiz-tech
  ```
  > A `-v luiz_data:/app/data` kötet biztosítja, hogy az adatok megmaradjanak.
- **Render / Railway / Fly.io / Heroku:** Node app, `npm start` (van `Procfile` is).
  Állíts be perzisztens lemezt/kötetet a `data/` mappához és a fenti env változókat.

### REST API (röviden)

| metódus + útvonal            | védett | leírás                          |
|------------------------------|:------:|---------------------------------|
| `GET /api/shop`              |   –    | publikus bolt-adat + termékek   |
| `POST /api/orders`           |   –    | rendelés leadása                |
| `POST /api/auth/login`       |   –    | bejelentkezés (cookie)          |
| `POST /api/auth/logout`      |   –    | kijelentkezés                   |
| `GET /api/auth/me`           |   –    | session ellenőrzés              |
| `GET /api/admin/config`      |   ✓    | teljes konfiguráció             |
| `PUT /api/admin/config`      |   ✓    | konfiguráció + termékek mentése |
| `POST /api/admin/account`    |   ✓    | belépési adatok módosítása      |
| `POST /api/admin/reset`      |   ✓    | alapértelmezettre állítás       |
| `GET /api/admin/orders`      |   ✓    | beérkezett rendelések           |

> A fizetési integráció szándékosan nincs bekötve (a rendelés rögzítése demó).
> Élesben ide egy fizetési szolgáltató (pl. Stripe/Barion/SimplePay) köthető be.

## Szerkezet

```
index.html              # főoldal (one-page)
webshop.html            # webshop kirakat
admin.html              # belépés + testreszabó felület
server/
  server.js             # Express app: statikus kiszolgálás + REST API
  db.js                 # fájl-alapú JSON adattár + alapértelmezések
  auth.js               # jelszó-hash (scrypt) + token aláírás (HMAC)
assets/
  css/style.css         # alap stílusok, animációk
  css/webshop.css       # webshop kirakat + témák
  css/admin.css         # admin + belépés
  js/main.js            # interakciók, terminál + canvas animáció
  js/shop-config.js     # kliens adat-réteg (API + localStorage fallback)
  js/webshop.js         # kirakat logika
  js/admin.js           # admin panel logika
  img/favicon.svg
package.json            # függőség (express) + start scriptek
Dockerfile · Procfile · .env.example   # deploy
data/db.json            # futásidőben jön létre (git-ignorált)
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
