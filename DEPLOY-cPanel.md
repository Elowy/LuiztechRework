# Telepítés RackForest cPanel webtárhelyre (PHP + MySQL)

Ez a verzió **natív PHP + MySQL** — semmilyen Node.js nem kell hozzá, csak
feltöltöd a fájlokat és lefuttatod a telepítőt. Ez a javasolt mód cPanel
webtárhelyen.

> A frontend változatlan: a `setup.php` után minden funkció él (testreszabás,
> webshop, vásárlói fiók, rendelések, képfeltöltés, készlet, hírek).

## Mit kell feltölteni
A domain **dokumentumgyökerébe** (pl. `public_html`, vagy a domainhez tartozó
mappa gyökere) töltsd fel ezeket:

```
index.html   webshop.html   admin.html
assets/
api/            (lib.php, index.php)
uploads/        (a benne lévő .htaccess-szel együtt)
setup.php
.htaccess
```

**Nem kell** feltölteni: `server/`, `app.js`, `package.json`,
`package-lock.json`, `node_modules/`, `data/`, `Dockerfile`, `Procfile`
(ezek a Node.js-verzióhoz tartoznak).

> Fontos: az appnak a **domain gyökerében** kell lennie (az API a `/api/…` és a
> képek a `/uploads/…` abszolút útvonalat használják).

## Lépések

### 1. Adatbázis létrehozása
cPanel → **MySQL® adatbázisok**:
- hozz létre egy **adatbázist** (pl. `luiztecs_shop`)
- hozz létre egy **MySQL felhasználót** (pl. `luiztecs_shop`) erős jelszóval
- **rendeld hozzá** a felhasználót az adatbázishoz **ALL PRIVILEGES** joggal
- jegyezd fel: DB név, DB felhasználó, jelszó (a host általában `localhost`)

### 2. Fájlok feltöltése
FTP-vel vagy a cPanel Fájlkezelővel told fel a fenti fájlokat a domain
dokumentumgyökerébe.

### 3. Jogosultság az uploads mappán
Az `uploads/` mappa legyen **írható** (a Fájlkezelőben Permissions → `755`,
ha nem megy a feltöltés, `775`).

### 4. Telepítő futtatása
Nyisd meg böngészőben: **`https://sajatdomain.hu/setup.php`**
- add meg a DB adatokat (1. lépés) és a kívánt **admin felhasználó + jelszó**-t
- kattints **Telepítés indítása**

A telepítő létrehozza a táblákat, feltölti az alap kínálatot, beállítja az
admint, és kiírja a `config.php`-t.

### 5. Biztonság — töröld a telepítőt
A sikeres telepítés után **töröld a `setup.php` fájlt** a tárhelyről.

### 6. Kész
- Oldal: `https://sajatdomain.hu`
- Admin: `https://sajatdomain.hu/admin.html` (a megadott admin belépéssel)
- Kapcsold be az ingyenes **SSL**-t (cPanel → SSL/TLS Status / AutoSSL).

## Követelmények
- PHP **7.3+** (a `pdo_mysql` kiterjesztéssel — cPanelen alapból megvan)
- MySQL/MariaDB adatbázis
- `mod_rewrite` (a cPanel Apache-on alapból aktív)

## Hibakeresés
- **500-as hiba az egész oldalon:** általában a `.htaccess`. Ha a tárhely nem
  engedi a `Require all denied` sort (régi Apache), töröld azt a blokkot.
- **Az `/api/...` hívások 404-et adnak:** nincs `mod_rewrite`. Ellenőrizd, hogy
  a `.htaccess` feltöltődött (rejtett fájl!), vagy kérd a support segítségét.
- **„A rendszer még nincs telepítve":** még nem futott le a `setup.php`, vagy
  hiányzik a `config.php`.
- **Kép feltöltés nem megy:** az `uploads/` mappa nem írható → állítsd `775`-re.
- **Adatbázis-kapcsolat sikertelen:** rossz DB név/user/jelszó, vagy a user
  nincs az adatbázishoz rendelve.

## Újratelepítés / DB adatok módosítása
Töröld a `config.php`-t (és ha kell, ürítsd az adatbázist), majd futtasd újra a
`setup.php`-t. (Az admin jelszó utólag az admin „Fiók" menüjében is módosítható.)

---

### Alternatíva: Node.js verzió
Ha mégis a Node.js backendet futtatnád (VPS-en vagy cPanel „Setup Node.js App"
funkcióval), a `server/`, `app.js`, `package.json` fájlok ehhez tartoznak — a
részleteket lásd a `README.md`-ben. cPanel webtárhelyen a fenti PHP-verzió az
egyszerűbb és ajánlott.
