# Automatikus deploy a szerverre

Kétféle mód van. Az **1. (GitHub Actions FTP)** a valódi „push → automatikusan
kikerül" megoldás. A **2. (cPanel Git)** pull-alapú, kattintással (vagy webhookkal).

Mindkettő úgy van beállítva, hogy a szerveren **ne** írja felül/törölje a
`config.php`-t és a feltöltött képeket (`uploads/`).

---

## 1) GitHub Actions → FTP (ajánlott)

Minden push után a `.github/workflows/deploy.yml` workflow FTP-vel feltölti a
fájlokat a tárhelyre.

### Egyszeri beállítás

**a) FTP-fiók a cPanelben**
cPanel → **FTP-fiókok** → hozz létre egy fiókot (vagy használd a meglévőt).
Jegyezd fel: FTP host (pl. `luiz-tech.hu` vagy `ftp.luiz-tech.hu`), felhasználó, jelszó.
Nézd meg az FTP-fiók **könyvtárát** is (ez lesz a kiindulópont).

**b) GitHub titkok (Secrets)**
A GitHub repóban: **Settings → Secrets and variables → Actions → New repository secret**:
| Név | Érték |
|---|---|
| `FTP_HOST` | az FTP szerver, pl. `luiz-tech.hu` |
| `FTP_USERNAME` | az FTP felhasználónév |
| `FTP_PASSWORD` | az FTP jelszó |

**c) GitHub változó (Variable)**
Ugyanitt a **Variables** fülön: **New repository variable**:
| Név | Érték |
|---|---|
| `FTP_SERVER_DIR` | a dokumentumgyökér az FTP-fiókhoz képest, pl. `/luiz-tech.hu/luiztech/` (a végén `/`) |

> A `FTP_SERVER_DIR` pontos értéke attól függ, hová „lát be" az FTP-fiók.
> Ha az FTP a home-ban nyílik: `/luiz-tech.hu/luiztech/`.
> Ha közvetlenül a domain mappájában: `/luiztech/` vagy `/`.

### Használat
- Ezután **minden push** automatikusan deployol.
- Kézzel is indíthatod: GitHub → **Actions → Deploy to cPanel (FTP) → Run workflow**.
- A futás eredményét az **Actions** fülön látod. (Amíg a fenti titkok nincsenek
  beállítva, a futás hibára fut — ez normális, csak állítsd be őket.)

> Ha az `ftps` nem megy (kapcsolódási hiba), a `deploy.yml`-ben írd át a
> `protocol: ftps`-t `protocol: ftp`-re.

---

## 2) cPanel Git™ Version Control (alternatíva)

Pull-alapú: a tárhely klónozza a repót, és a `.cpanel.yml` másolja a fájlokat a
dokumentumgyökérbe.

### Beállítás
1. cPanel → **Git™ Version Control** → **Create**.
2. Add meg a repó **Clone URL**-jét és egy mappát (pl. `/home/luiztecs/repo`).
3. A repó gyökerében lévő **`.cpanel.yml`**-ben állítsd a `DEPLOYPATH`-ot a saját
   dokumentumgyökeredre (alapból `/home/luiztecs/luiz-tech.hu/luiztech`).
4. Frissítés: **Pull or Deploy → Update from Remote**, majd **Deploy HEAD Commit**.

> Teljesen automatikussá (push → deploy) egy webhookkal tehető, de azt a
> RackForest oldalán kell engedélyezni; a legtöbb esetben a GitHub Actions (1. mód)
> egyszerűbb és megbízhatóbb.

---

## Első éles indítás (bármelyik móddal)
1. Fuss le egy deploy (feltölti a fájlokat).
2. Nyisd meg egyszer a `https://luiz-tech.hu/setup.php`-t → telepítés (DB + admin).
3. **Töröld a `setup.php`-t** a szerverről (a deploy nem törli automatikusan).
4. Kész — innentől a tartalmi/kód-frissítések automatikusan kimennek, a `config.php`
   és az `uploads/` érintetlen marad.
