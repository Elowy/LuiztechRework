# Telepítés RackForest cPanel webtárhelyre

A projekt **két szinten** tölthető fel cPanelre. Először döntsd el, melyik kell:

| | Statikus feltöltés | Teljes app (Node.js) |
|---|---|---|
| Megjelenés, animációk | ✅ | ✅ |
| Webshop böngészés, kosár | ✅ (kliensoldal) | ✅ |
| Bolt testreszabás (admin) | ✅ csak az adott böngészőben | ✅ központilag, mindenkinek |
| Vásárlói regisztráció/login | ❌ | ✅ |
| Rendelések tárolása | ❌ | ✅ |
| Termékkép-feltöltés | ❌ (csak helyi előnézet) | ✅ |
| Készlet, hírek (szerveroldalon) | ❌ | ✅ |
| **Feltétel** | bármelyik cPanel csomag | cPanel **„Setup Node.js App"** szükséges |

---

## A) Statikus feltöltés (bármelyik cPanel csomagon működik)

A teljes „kirakat" megy, a bolt/admin a böngésző `localStorage`-ában tárol
(eszközönként külön, nincs valódi szerveroldali fiók/rendelés).

1. **cPanel → Fájlkezelő** (vagy FTP, pl. FileZilla).
2. Lépj be a `public_html` mappába.
3. Töltsd fel ezeket (a `server/`, `node_modules/`, `data/` **nem** kell):
   - `index.html`, `webshop.html`, `admin.html`
   - `assets/` mappa (css, js, img)
4. Kész: `https://sajatdomain.hu` betölti az oldalt.

> Admin demó belépés statikus módban: `admin` / `luiztech` (csak az adott
> böngészőben érvényes). A „Hírek" szekció és a szerveroldali funkciók ilyenkor
> nem jelennek meg — ez normális.

---

## B) Teljes app a cPanel „Setup Node.js App" funkcióval

Ehhez a csomagnak támogatnia kell a Node.js-t (Phusion Passenger). Ha a cPanel
főoldalán látsz **„Setup Node.js App"** ikont, akkor megy. Ha nem, kérd a
RackForest ügyfélszolgálatától, vagy válts VPS-re.

### 1. Fájlok feltöltése
- Hozz létre egy mappát az app-nak, pl. `~/luiztech` (NE a `public_html`-be).
- Töltsd fel a **teljes projektet** ebbe (HTML-ek, `assets/`, `server/`,
  `app.js`, `package.json`, `package-lock.json`).
- A `node_modules/` és `data/` feltöltése **nem** szükséges.

### 2. Node.js alkalmazás létrehozása
cPanel → **Setup Node.js App** → **Create Application**:
- **Node.js version:** 18 vagy újabb
- **Application mode:** Production
- **Application root:** `luiztech` (ahová feltöltötted)
- **Application URL:** a domain/aldomain, ahol látszódjon
- **Application startup file:** `app.js`

### 3. Környezeti változók
Az app oldalán (Environment variables) add hozzá:
- `SESSION_SECRET` = egy hosszú véletlen érték
  (generáld pl.: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `ADMIN_USER` = a kívánt admin felhasználónév (opcionális)
- `ADMIN_PASS` = az első admin jelszó (csak az első indításkor érvényes; utána az
  adminban a „Fiók" menüben módosítható)
- `NODE_ENV` = `production`

> A `PORT`-ot **ne** állítsd be — a Passenger kezeli.

### 4. Függőségek + indítás
- Kattints a **„Run NPM Install"** gombra (vagy a megadott parancssorban
  `source .../activate && npm install`).
- **Restart** az alkalmazásnál.
- Nyisd meg a megadott URL-t — innen az Express szolgálja ki a HTML-eket és az
  API-t is.

### 5. Adatok és mentés
- Az adatok a `data/db.json` fájlba kerülnek (a feltöltött mappán belül),
  a feltöltött képek a `data/uploads/`-ba. Ezek a tárhelyeden maradnak.
- Mentéshez elég ezt a mappát időnként letölteni.

---

## Tippek / hibakeresés
- **502 / „We're sorry"**: nézd meg a Node app logját (cPanel adja), általában
  hiányzó `npm install` vagy rossz startup file.
- **Nem frissül a kód:** minden módosítás után **Restart** az app-nál.
- **HTTPS:** a cPanelben (AutoSSL / Let's Encrypt) kapcsold be az ingyenes SSL-t.
- **Verziókövetés:** ha Git-tel dolgozol, a `data/` és `node_modules/` a
  `.gitignore`-ban van — éles gépen az `npm install` és a futás hozza létre őket.
