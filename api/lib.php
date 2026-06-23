<?php
/* ============================================================
   Luiz-Tech — PHP backend (cPanel + MySQL)
   Közös réteg: adatbázis, séma, alapértékek, segédfüggvények.
   ============================================================ */

date_default_timezone_set('Europe/Budapest');

const ORDER_STATUSES = ['Új', 'Fizetésre vár', 'Fizetve', 'Feldolgozás alatt', 'Teljesítve', 'Törölve'];
const MESSAGE_STATUSES = ['Új', 'Folyamatban', 'Lezárt'];
const TICKET_STATUSES = ['Nyitott', 'Válaszra vár', 'Megoldva', 'Lezárt'];
const SCHEMA_VERSION = 10;

// Az a fiók, amelyik ezzel az e-mail címmel lép be, admin jogot kap.
// Mindenki más vásárló. (Egységes bejelentkezés.)
const ADMIN_EMAIL = 'lollipopp23@gmail.com';

const DEFAULT_FAQ = [
  ['id'=>'f1','question'=>'Mennyi idő alatt készül el egy weboldal?','answer'=>'Egyszerűbb oldalakat akár 8–24 óra alatt élesítünk; összetettebb projekteknél a pontos időt az ingyenes árajánlatban adjuk meg.'],
  ['id'=>'f2','question'=>'Mennyibe kerül egy projekt?','answer'=>'Minden megoldás egyedi. Írd le pár mondatban az igényed, és 12 órán belül küldünk egy átlátható, kötelezettségmentes árajánlatot.'],
  ['id'=>'f3','question'=>'Vállaltok üzemeltetést és karbantartást is?','answer'=>'Igen. Hálózat, szerver, mentés, biztonsági frissítések és folyamatos támogatás — igény szerint havidíjas konstrukcióban is.'],
  ['id'=>'f4','question'=>'Hogyan kezelitek az adatok biztonságát?','answer'=>'Titkosított jelszótárolás, rendszeres mentés, biztonsági szkennelés és felhasználói képzés. A kiberbiztonság minden megoldásunk alapja.'],
];

const DEFAULT_CONFIG = [
  'name' => 'Luiz-Tech Shop',
  'tagline' => 'Egyedi webshop, percek alatt testreszabva.',
  'accent' => '#38e1ff',
  'accent2' => '#6c7bff',
  'theme' => 'dark',
  'currency' => 'Ft',
  'heroTitle' => 'Technológia, ami magáért beszél',
  'heroText' => 'Válogass kézzel összeállított kínálatunkból — azonnali hozzáférés, megbízható minőség.',
  'freeShippingOver' => 25000,
  'notifyEmail' => 'info@luiz-tech.hu',
  'contactPhone' => '+36 30 195 4944',
  'contactViber' => '36301954944',
  'contactWhatsapp' => '',
  'contactMessenger' => '',
  'contactEmail' => 'info@luiz-tech.hu',
  'backToTop' => '1',
  'metaTitle' => '',
  'metaDescription' => '',
  'gaMeasurementId' => '',
  'szamlazzAgentKey' => '',
  'stripeSecretKey' => '',
];

const DEFAULT_PRODUCTS = [
  ['id'=>'p1','name'=>'Webfejlesztői csomag','desc'=>'Egyedi weboldal a koncepciótól az élesítésig.','price'=>149000,'category'=>'Szolgáltatás','emoji'=>'🌐','image'=>'','stock'=>null],
  ['id'=>'p2','name'=>'Webshop indító csomag','desc'=>'Teljes e-commerce megoldás fizetési integrációval.','price'=>249000,'category'=>'Szolgáltatás','emoji'=>'🛒','image'=>'','stock'=>null],
  ['id'=>'p3','name'=>'Kiberbiztonsági audit','desc'=>'Sérülékenység-vizsgálat és biztonsági jelentés.','price'=>89000,'category'=>'Biztonság','emoji'=>'🛡️','image'=>'','stock'=>null],
  ['id'=>'p4','name'=>'Adatmentési megoldás','desc'=>'Automatikus, ütemezett biztonsági mentés beüzemelve.','price'=>59000,'category'=>'Üzemeltetés','emoji'=>'💾','image'=>'','stock'=>null],
  ['id'=>'p5','name'=>'Hálózat optimalizálás','desc'=>'Wi-Fi és vezetékes hálózat felmérése és hangolása.','price'=>69000,'category'=>'Üzemeltetés','emoji'=>'📡','image'=>'','stock'=>null],
  ['id'=>'p6','name'=>'SEO indító csomag','desc'=>'Keresőoptimalizálás, technikai audit és kulcsszókutatás.','price'=>79000,'category'=>'Marketing','emoji'=>'📈','image'=>'','stock'=>null,'salePrice'=>59000],
];

// Hosszú leírások termék-név szerint (alapértelmezett termékekhez + meglévők backfilljéhez)
const DEFAULT_LONG_DESCR = [
  'Webfejlesztői csomag' => 'Modern, reszponzív weboldal a koncepciótól az élesítésig. Egyedi dizájn, mobilbarát megjelenés, villámgyors betöltés és SEO-barát felépítés. A csomag tartalmazza a tervezést, a fejlesztést, a tartalomfeltöltést és az éles indítást — átlátható folyamattal és gyors átfutással. Az eredmény egy weboldal, amely magáért beszél, és valódi érdeklődőket hoz.',
  'Webshop indító csomag' => 'Teljes e-commerce megoldás kulcsrakészen: termékkatalógus, kosár, biztonságos online bankkártyás fizetés (Stripe), rendeléskezelés és automatikus számlázás. Reszponzív, gyors és könnyen bővíthető webshop, amely az első naptól értékesítésre kész. Beüzemeljük, betanítjuk a kezelését, és melletted állunk az induláskor is.',
  'Kiberbiztonsági audit' => 'Átfogó sérülékenység-vizsgálat a rendszereiden: hálózat, weboldal és infrastruktúra ellenőrzése valós támadói szemmel. Részletes, érthető biztonsági jelentést kapsz a feltárt kockázatokról és a javasolt lépésekről, fontossági sorrendben — hogy a támadók előtt te lépj. Kérésre a javításban is segítünk.',
  'Adatmentési megoldás' => 'Automatikus, ütemezett biztonsági mentés beüzemelve, hogy az adataid soha ne vesszenek el. Titkosított tárolás, rendszeres ellenőrzés és gyors, tesztelt helyreállítás. Beállítjuk, leteszteljük és átadjuk — neked már csak annyi a dolgod, hogy nyugodt legyél. Egy váratlan hiba vagy zsarolóvírus többé nem viheti el a munkádat.',
  'Hálózat optimalizálás' => 'Wi-Fi és vezetékes hálózat teljes felmérése és hangolása: lefedettség, sebesség és stabilitás javítása. Megszüntetjük a holttereket és a szakadozást, optimalizáljuk az eszközöket és a beállításokat — gyorsabb, megbízhatóbb hálózat az egész irodában vagy otthonban. A végén átlátható dokumentációt és javaslatokat is kapsz.',
  'SEO indító csomag' => 'Keresőoptimalizálás, amely valódi forgalmat hoz: technikai audit, kulcsszókutatás és on-page optimalizálás egy csomagban. Feltárjuk a növekedési lehetőségeket, kijavítjuk a technikai hibákat, és konkrét, mérhető lépéseket teszünk a jobb Google-helyezésekért. Átlátható riportot adunk arról, hol tartasz és merre érdemes tovább haladni.',
];

const DEFAULT_REFERENCES = [
  ['id'=>'r1','tag'=>'Weboldal','title'=>'Műanyagnyílászárók','description'=>'Új, modern weboldal a teljes termékkínálat bemutatásához — villámgyors átfutással.','details'=>'A megkeresést követően 24 órán belül átadtuk a kész, reszponzív weboldalt. A termékkínálat áttekinthető bemutatása, gyors betöltés és SEO-barát felépítés volt a fókuszban.','info'=>'2024 · ⚡ 24 óra alatt kész','url'=>''],
  ['id'=>'r2','tag'=>'Weboldal','title'=>'Napháló','description'=>'Egyedi weboldal a csapat számára, letisztult megjelenéssel és gyors betöltéssel.','details'=>'A Napháló csapata egyedi, letisztult weboldalt kapott, amelyet mindössze 8 óra alatt készítettünk el és élesítettünk.','info'=>'2024. május · ⚡ 8 óra alatt kész','url'=>''],
  ['id'=>'r3','tag'=>'Webshop','title'=>'Net-Trade Hungary','description'=>'Egyedi webshop fejlesztése a koncepciótól az élesítésig, teljesen testreszabva.','details'=>'Teljesen egyedi webshopot építettünk: a koncepciótól a tervezésen át az élesítésig. Az áruház 2023. április 17-én indult, testreszabott funkciókkal.','info'=>'Indulás: 2023.04.17. · 🛒 E-commerce','url'=>''],
  ['id'=>'r4','tag'=>'Platform','title'=>'Home and Confidence','description'=>'Komplex ingatlanhirdetési platform egy ingatlaniroda számára, egyedi funkciókkal.','details'=>'Egy ingatlaniroda számára komplex hirdetési platformot fejlesztettünk: ingatlanok feltöltése és kezelése, keresés és szűrés, egyedi funkciókkal.','info'=>'2023 · 🏠 Ingatlan platform','url'=>''],
  ['id'=>'r5','tag'=>'Weboldal','title'=>'Vendégház bemutatkozó oldal','description'=>'Hangulatos, foglalásra ösztönző weboldal egy vendégház számára.','details'=>'Hangulatos bemutatkozó weboldal egy vendégház számára, amely a foglalásra ösztönöz: szép képi világ, áttekinthető információk és gyors elérhetőség.','info'=>'2023. november · 🏡 Turizmus','url'=>''],
  ['id'=>'bgyarmatpaint','tag'=>'Weboldal','title'=>'BGyarmat Paint','description'=>'Festékek és szakáru bemutatása letisztult, könnyen kezelhető weboldalon.','details'=>'Modern, reszponzív weboldal a BGyarmat Paint számára: áttekinthető termék- és szolgáltatásbemutatás, gyors betöltés és SEO-barát felépítés.','info'=>'2024 · 🎨 Festék & szakáru','url'=>'https://bgyarmatpaint.hu'],
];

const ALLOWED_CONFIG = ['name','tagline','accent','accent2','theme','currency','heroTitle','heroText','freeShippingOver','notifyEmail','contactPhone','contactViber','contactWhatsapp','contactMessenger','contactEmail','backToTop','metaTitle','metaDescription','gaMeasurementId','szamlazzAgentKey','stripeSecretKey'];
// Titkos kulcsok: soha nem kerülnek be a config kimenetébe (sem publikus, sem admin),
// és üres értékkel nem írjuk felül a meglévőt.
const SECRET_CONFIG = ['szamlazzAgentKey','stripeSecretKey'];

/* ---------- Útvonalak ---------- */
function config_path() { return __DIR__ . '/../config.php'; }
function uploads_dir() { return __DIR__ . '/../uploads'; }
function is_installed() { return file_exists(config_path()); }

/* ---------- JSON ki/be ---------- */
function json_out($data, $code = 200) {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}
function json_error($msg, $code = 400) { json_out(['error' => $msg], $code); }
function body() {
  static $b = null;
  if ($b === null) {
    $raw = file_get_contents('php://input');
    $b = json_decode($raw, true);
    if (!is_array($b)) $b = [];
  }
  return $b;
}

/* ---------- Adatbázis ---------- */
function db() {
  static $pdo = null;
  if ($pdo) return $pdo;
  if (!is_installed()) json_error('A rendszer még nincs telepítve. Nyisd meg a setup.php-t.', 503);
  $cfg = require config_path();
  $dsn = "mysql:host={$cfg['host']};dbname={$cfg['name']};charset=utf8mb4";
  try {
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES => false,
    ]);
  } catch (Throwable $e) {
    json_error('Adatbázis-kapcsolat sikertelen.', 500);
  }
  migrate($pdo);
  return $pdo;
}

/* Verziózott migráció: új táblákat hoz létre egy korábbi telepítéshez,
   és egyszer feltölti az új tartalom-táblák alapjait. Sémabumpkor fut le. */
function migrate(PDO $pdo) {
  try {
    $row = $pdo->query("SELECT v FROM settings WHERE k = 'schema_version'")->fetch();
    $ver = $row ? (int)$row['v'] : 0;
  } catch (Throwable $e) {
    return; // settings sincs → nincs rendesen telepítve
  }
  if ($ver >= SCHEMA_VERSION) return;
  try {
    create_schema($pdo);
    // v3: akciós ár oszlop a meglévő products táblához (ha még nincs)
    try { $pdo->exec("ALTER TABLE products ADD COLUMN sale_price INT NULL AFTER stock"); }
    catch (Throwable $e) { /* már létezik → tovább */ }
    // v4: bgyarmatpaint referencia pótlása (csak ha még nincs — törölt elemeket nem hoz vissza)
    $chk = $pdo->prepare("SELECT id FROM refs WHERE id = ?");
    $chk->execute(['bgyarmatpaint']);
    if (!$chk->fetch()) {
      $sort = (int)$pdo->query("SELECT COALESCE(MAX(sort),0)+1 s FROM refs")->fetch()['s'];
      foreach (DEFAULT_REFERENCES as $r) {
        if ($r['id'] === 'bgyarmatpaint') { insert_reference($pdo, $r, $sort); break; }
      }
    }
    // v5: arany szegély oszlop a referenciákhoz (ha még nincs)
    try { $pdo->exec("ALTER TABLE refs ADD COLUMN gold TINYINT NOT NULL DEFAULT 0"); }
    catch (Throwable $e) { /* már létezik → tovább */ }
    // v9: „új" jelölő oszlop a referenciákhoz (zöld keret + pecsét)
    try { $pdo->exec("ALTER TABLE refs ADD COLUMN is_new TINYINT NOT NULL DEFAULT 0"); }
    catch (Throwable $e) { /* már létezik → tovább */ }
    // v10: hosszú leírás oszlop a termékekhez + backfill a meglévő (alapértelmezett nevű) termékekhez
    try { $pdo->exec("ALTER TABLE products ADD COLUMN long_descr TEXT NULL AFTER descr"); }
    catch (Throwable $e) { /* már létezik → tovább */ }
    backfill_long_descr($pdo);
    // v6: számlaszám oszlop a rendelésekhez (Számlázz.hu)
    try { $pdo->exec("ALTER TABLE orders ADD COLUMN invoice_no VARCHAR(40) DEFAULT '' AFTER status"); }
    catch (Throwable $e) { /* már létezik → tovább */ }
    // v7: Stripe checkout session azonosító a rendelésekhez
    try { $pdo->exec("ALTER TABLE orders ADD COLUMN stripe_session VARCHAR(80) DEFAULT '' AFTER invoice_no"); }
    catch (Throwable $e) { /* már létezik → tovább */ }
    // v8: kupon oszlopok a rendelésekhez (a coupons táblát a create_schema hozza létre)
    try { $pdo->exec("ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(40) DEFAULT '' AFTER stripe_session"); }
    catch (Throwable $e) { /* már létezik → tovább */ }
    try { $pdo->exec("ALTER TABLE orders ADD COLUMN discount INT NOT NULL DEFAULT 0 AFTER coupon_code"); }
    catch (Throwable $e) { /* már létezik → tovább */ }
    if ((int)$pdo->query("SELECT COUNT(*) c FROM refs")->fetch()['c'] === 0) {
      $i = 0; foreach (DEFAULT_REFERENCES as $r) insert_reference($pdo, $r, $i++);
    }
    if ((int)$pdo->query("SELECT COUNT(*) c FROM faq")->fetch()['c'] === 0) {
      $i = 0; foreach (DEFAULT_FAQ as $f) insert_faq($pdo, $f, $i++);
    }
    $pdo->prepare("INSERT INTO settings (k, v) VALUES ('schema_version', ?) ON DUPLICATE KEY UPDATE v = VALUES(v)")
        ->execute([(string)SCHEMA_VERSION]);
  } catch (Throwable $e2) { /* csendben tovább */ }
}

/* PDO felépítése megadott adatokból (setup-hoz, kivétellel) */
function db_connect($host, $name, $user, $pass) {
  $dsn = "mysql:host={$host};dbname={$name};charset=utf8mb4";
  return new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
  ]);
}

/* ---------- Séma ---------- */
function create_schema(PDO $pdo) {
  $pdo->exec("CREATE TABLE IF NOT EXISTS settings (
    k VARCHAR(60) PRIMARY KEY, v TEXT
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $pdo->exec("CREATE TABLE IF NOT EXISTS admin (
    id INT PRIMARY KEY, username VARCHAR(60) NOT NULL, hash VARCHAR(255) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $pdo->exec("CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    descr VARCHAR(600) DEFAULT '',
    long_descr TEXT NULL,
    price INT NOT NULL DEFAULT 0,
    category VARCHAR(60) DEFAULT '',
    emoji VARCHAR(16) DEFAULT '📦',
    image VARCHAR(300) DEFAULT '',
    stock INT NULL,
    sale_price INT NULL,
    sort INT NOT NULL DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $pdo->exec("CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(40) PRIMARY KEY,
    user_id VARCHAR(40) NULL,
    cust_name VARCHAR(120) DEFAULT '',
    cust_email VARCHAR(190) DEFAULT '',
    cust_phone VARCHAR(40) DEFAULT '',
    cust_address VARCHAR(300) DEFAULT '',
    cust_note VARCHAR(500) DEFAULT '',
    total INT NOT NULL DEFAULT 0,
    status VARCHAR(40) NOT NULL DEFAULT 'Új',
    invoice_no VARCHAR(40) DEFAULT '',
    stripe_session VARCHAR(80) DEFAULT '',
    coupon_code VARCHAR(40) DEFAULT '',
    discount INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    KEY user_id_idx (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $pdo->exec("CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(40) NOT NULL,
    product_id VARCHAR(40) DEFAULT '',
    name VARCHAR(160) DEFAULT '',
    price INT NOT NULL DEFAULT 0,
    qty INT NOT NULL DEFAULT 1,
    KEY order_id_idx (order_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $pdo->exec("CREATE TABLE IF NOT EXISTS coupons (
    code VARCHAR(40) PRIMARY KEY,
    type VARCHAR(10) NOT NULL DEFAULT 'percent',
    value INT NOT NULL DEFAULT 0,
    min_total INT NOT NULL DEFAULT 0,
    expires_at DATE NULL,
    max_uses INT NOT NULL DEFAULT 0,
    used INT NOT NULL DEFAULT 0,
    active TINYINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $pdo->exec("CREATE TABLE IF NOT EXISTS news (
    id VARCHAR(40) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    date VARCHAR(30) DEFAULT '',
    created_at DATETIME NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $pdo->exec("CREATE TABLE IF NOT EXISTS refs (
    id VARCHAR(40) PRIMARY KEY,
    tag VARCHAR(60) DEFAULT '',
    title VARCHAR(160) NOT NULL,
    description VARCHAR(600) DEFAULT '',
    details VARCHAR(2000) DEFAULT '',
    info VARCHAR(160) DEFAULT '',
    url VARCHAR(300) DEFAULT '',
    gold TINYINT NOT NULL DEFAULT 0,
    is_new TINYINT NOT NULL DEFAULT 0,
    sort INT NOT NULL DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $pdo->exec("CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    topic VARCHAR(60) DEFAULT '',
    message TEXT,
    status VARCHAR(40) NOT NULL DEFAULT 'Új',
    created_at DATETIME NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $pdo->exec("CREATE TABLE IF NOT EXISTS faq (
    id VARCHAR(40) PRIMARY KEY,
    question VARCHAR(300) NOT NULL,
    answer TEXT,
    sort INT NOT NULL DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $pdo->exec("CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(40) PRIMARY KEY,
    user_id VARCHAR(40) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'Nyitott',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    KEY user_idx (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $pdo->exec("CREATE TABLE IF NOT EXISTS ticket_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id VARCHAR(40) NOT NULL,
    author VARCHAR(20) NOT NULL DEFAULT 'customer',
    body TEXT,
    created_at DATETIME NOT NULL,
    KEY ticket_idx (ticket_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $pdo->exec("CREATE TABLE IF NOT EXISTS rate_limits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rk VARCHAR(190) NOT NULL,
    ts INT NOT NULL,
    KEY rk_ts (rk, ts)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

function seed_defaults(PDO $pdo) {
  // config
  $cnt = (int)$pdo->query("SELECT COUNT(*) c FROM settings")->fetch()['c'];
  if ($cnt === 0) {
    $stmt = $pdo->prepare("INSERT INTO settings (k, v) VALUES (?, ?)");
    foreach (DEFAULT_CONFIG as $k => $v) $stmt->execute([$k, (string)$v]);
  }
  // products
  $cnt = (int)$pdo->query("SELECT COUNT(*) c FROM products")->fetch()['c'];
  if ($cnt === 0) {
    $i = 0;
    foreach (DEFAULT_PRODUCTS as $p) {
      insert_product($pdo, $p, $i++);
    }
    backfill_long_descr($pdo);
  }
  // references
  $cnt = (int)$pdo->query("SELECT COUNT(*) c FROM refs")->fetch()['c'];
  if ($cnt === 0) {
    $i = 0;
    foreach (DEFAULT_REFERENCES as $r) insert_reference($pdo, $r, $i++);
  }
  // faq
  $cnt = (int)$pdo->query("SELECT COUNT(*) c FROM faq")->fetch()['c'];
  if ($cnt === 0) {
    $i = 0;
    foreach (DEFAULT_FAQ as $f) insert_faq($pdo, $f, $i++);
  }
  // séma-verzió
  $pdo->prepare("INSERT INTO settings (k, v) VALUES ('schema_version', ?) ON DUPLICATE KEY UPDATE v = VALUES(v)")
      ->execute([(string)SCHEMA_VERSION]);
}

/* ---------- Config ---------- */
function get_config(PDO $pdo, $includeSecrets = false) {
  $rows = $pdo->query("SELECT k, v FROM settings")->fetchAll();
  $map = [];
  foreach ($rows as $r) $map[$r['k']] = $r['v'];
  $out = [];
  foreach (DEFAULT_CONFIG as $k => $dv) $out[$k] = array_key_exists($k, $map) ? $map[$k] : $dv;
  $out['freeShippingOver'] = (int)$out['freeShippingOver'];
  $out['theme'] = ($out['theme'] === 'light') ? 'light' : 'dark';
  $out['backToTop'] = !in_array((string)$out['backToTop'], ['0', '', 'false'], true);
  if (!$includeSecrets) {
    // titkos kulcsokat soha nem küldünk ki — csak azt jelezzük, be van-e állítva
    foreach (SECRET_CONFIG as $sk) {
      $out[$sk . 'Set'] = isset($out[$sk]) && trim((string)$out[$sk]) !== '';
      unset($out[$sk]);
    }
  }
  return $out;
}

function save_config(PDO $pdo, array $in) {
  $up = $pdo->prepare("INSERT INTO settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)");
  foreach (ALLOWED_CONFIG as $k) {
    if (array_key_exists($k, $in) && $in[$k] !== null) {
      $v = $in[$k];
      if (in_array($k, SECRET_CONFIG, true)) {
        $v = trim((string)$v);
        if ($v === '') continue;                 // üres → megtartjuk a meglévő titkot
        $up->execute([$k, mb_substr($v, 0, 255)]);
        continue;
      }
      if ($k === 'freeShippingOver') $v = max(0, (int)$v);
      if ($k === 'theme') $v = ($v === 'light') ? 'light' : 'dark';
      if ($k === 'currency') $v = mb_substr((string)$v, 0, 6);
      if ($k === 'notifyEmail' && !filter_var($v, FILTER_VALIDATE_EMAIL)) continue;
      if ($k === 'backToTop') $v = (!$v || $v === '0' || $v === 'false') ? '0' : '1';
      if (in_array($k, ['contactPhone','contactViber','contactWhatsapp','contactMessenger','contactEmail'], true)) {
        $v = mb_substr(trim((string)$v), 0, 120);
        if ($k === 'contactEmail' && $v !== '' && !filter_var($v, FILTER_VALIDATE_EMAIL)) continue;
      }
      $up->execute([$k, (string)$v]);
    }
  }
  if (isset($in['products']) && is_array($in['products'])) {
    $pdo->exec("DELETE FROM products");
    $i = 0;
    foreach ($in['products'] as $p) {
      if (!is_array($p) || trim((string)($p['name'] ?? '')) === '') continue;
      insert_product($pdo, $p, $i++);
    }
  }
  return get_config_with_products($pdo);
}

function reset_all(PDO $pdo) {
  $pdo->exec("DELETE FROM settings");
  $pdo->exec("DELETE FROM products");
  $stmt = $pdo->prepare("INSERT INTO settings (k, v) VALUES (?, ?)");
  foreach (DEFAULT_CONFIG as $k => $v) $stmt->execute([$k, (string)$v]);
  $i = 0;
  foreach (DEFAULT_PRODUCTS as $p) insert_product($pdo, $p, $i++);
  backfill_long_descr($pdo);
  return get_config_with_products($pdo);
}

/* ---------- Termékek ---------- */
function parse_stock($v) {
  if ($v === '' || $v === null) return null;
  if (!is_numeric($v)) return null;
  return max(0, (int)round((float)$v));
}
/* akciós ár: null, ha nincs / érvénytelen / nem kisebb a normál árnál */
function parse_sale($v, $price) {
  if ($v === '' || $v === null || !is_numeric($v)) return null;
  $s = max(0, (int)round((float)$v));
  if ($s <= 0 || $s >= (int)$price) return null;
  return $s;
}
/* a ténylegesen fizetendő ár (akciós, ha érvényes) */
function effective_price($row) {
  $price = (int)$row['price'];
  $sale = isset($row['sale_price']) && $row['sale_price'] !== null ? (int)$row['sale_price'] : null;
  return ($sale !== null && $sale > 0 && $sale < $price) ? $sale : $price;
}
function clean_image($img) {
  $img = mb_substr((string)$img, 0, 300);
  if ($img !== '' && !preg_match('#^(/uploads/|https?://)#', $img)) return '';
  return $img;
}
// Hosszú leírás kitöltése a meglévő, alapértelmezett nevű termékekhez (csak ha még üres)
function backfill_long_descr(PDO $pdo) {
  try {
    $bf = $pdo->prepare("UPDATE products SET long_descr = ? WHERE name = ? AND (long_descr IS NULL OR long_descr = '')");
    foreach (DEFAULT_LONG_DESCR as $pname => $ldesc) $bf->execute([$ldesc, $pname]);
  } catch (Throwable $e) { /* nem blokkoló */ }
}
function insert_product(PDO $pdo, array $p, $sort = 0) {
  $id = (string)($p['id'] ?? '');
  if ($id === '') $id = 'p' . uniqid();
  $price = max(0, (int)($p['price'] ?? 0));
  $stmt = $pdo->prepare("INSERT INTO products (id,name,descr,long_descr,price,category,emoji,image,stock,sale_price,sort)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)");
  $stmt->execute([
    $id,
    mb_substr((string)($p['name'] ?? ''), 0, 160),
    mb_substr((string)($p['desc'] ?? ''), 0, 600),
    mb_substr((string)($p['longDesc'] ?? ''), 0, 4000),
    $price,
    mb_substr((string)($p['category'] ?? ''), 0, 60),
    mb_substr((string)($p['emoji'] ?? '📦'), 0, 16),
    clean_image($p['image'] ?? ''),
    parse_stock($p['stock'] ?? null),
    parse_sale($p['salePrice'] ?? null, $price),
    (int)$sort,
  ]);
}
function map_product($r) {
  return [
    'id' => $r['id'],
    'name' => $r['name'],
    'desc' => $r['descr'],
    'longDesc' => $r['long_descr'] ?? '',
    'price' => (int)$r['price'],
    'category' => $r['category'],
    'emoji' => $r['emoji'],
    'image' => $r['image'],
    'stock' => is_null($r['stock']) ? null : (int)$r['stock'],
    'salePrice' => (!isset($r['sale_price']) || is_null($r['sale_price'])) ? null : (int)$r['sale_price'],
  ];
}
function get_products(PDO $pdo) {
  $rows = $pdo->query("SELECT * FROM products ORDER BY sort ASC, name ASC")->fetchAll();
  return array_map('map_product', $rows);
}
function get_config_with_products(PDO $pdo) {
  $c = get_config($pdo);
  $c['products'] = get_products($pdo);
  return $c;
}

/* ---------- Munkamenet / auth ---------- */
function start_app_session() {
  if (session_status() === PHP_SESSION_ACTIVE) return;
  $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
  // 30 napos tartós session csak akkor, ha a felhasználó a "Maradjak bejelentkezve"-t kérte
  $lifetime = isset($_COOKIE['lt_remember']) ? 60 * 60 * 24 * 30 : 0;
  @ini_set('session.gc_maxlifetime', (string)(60 * 60 * 24 * 30));
  session_set_cookie_params([
    'lifetime' => $lifetime, 'path' => '/', 'httponly' => true,
    'samesite' => 'Lax', 'secure' => $secure,
  ]);
  session_start();
  // CSRF-token: a session-ben tároljuk, és JS által olvasható sütiben is kiküldjük,
  // hogy a kliens vissza tudja küldeni X-CSRF-Token fejlécben (double-submit).
  if (empty($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
  }
  if (($_COOKIE['lt_csrf'] ?? '') !== $_SESSION['csrf']) {
    setcookie('lt_csrf', $_SESSION['csrf'], [
      'expires' => $lifetime ? time() + $lifetime : 0,
      'path' => '/', 'httponly' => false, 'samesite' => 'Lax', 'secure' => $secure,
    ]);
  }
}
// Állapotváltó kéréseknél kötelező, érvényes CSRF-fejléc ellenőrzése.
function require_csrf() {
  $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
  $sess = $_SESSION['csrf'] ?? '';
  if ($sess === '' || !is_string($sent) || !hash_equals($sess, $sent)) {
    json_error('Érvénytelen vagy hiányzó biztonsági token. Töltsd újra az oldalt.', 403);
  }
}
/* ---------- Egyszerű IP-alapú rate limit ---------- */
function client_ip() {
  $xff = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
  if ($xff !== '') { $p = explode(',', $xff); return trim($p[0]); }
  return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}
// Túllépés esetén 429-cel megszakítja a kérést.
function rate_limit(PDO $pdo, $action, $maxAttempts, $windowSec) {
  $rk = $action . ':' . client_ip();
  $now = time();
  try {
    $pdo->prepare("DELETE FROM rate_limits WHERE rk = ? AND ts < ?")
        ->execute([$rk, $now - $windowSec]);
    $c = $pdo->prepare("SELECT COUNT(*) FROM rate_limits WHERE rk = ? AND ts > ?");
    $c->execute([$rk, $now - $windowSec]);
    if ((int)$c->fetchColumn() >= $maxAttempts) {
      json_error('Túl sok próbálkozás. Kérlek, próbáld újra később.', 429);
    }
    $pdo->prepare("INSERT INTO rate_limits (rk, ts) VALUES (?, ?)")->execute([$rk, $now]);
  } catch (PDOException $e) {
    // ha a tábla bármiért nem elérhető, ne blokkoljuk a szolgáltatást
    error_log('rate_limit: ' . $e->getMessage());
  }
}
// "Maradjak bejelentkezve" beállítása: tartóssá teszi (vagy törli) a session-sütit.
function set_remember($on) {
  $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
  if ($on) {
    $exp = time() + 60 * 60 * 24 * 30;
    $opt = ['expires' => $exp, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax', 'secure' => $secure];
    setcookie('lt_remember', '1', $opt);
    setcookie(session_name(), session_id(), $opt);   // a session-süti is tartós lesz
  } else {
    setcookie('lt_remember', '', ['expires' => time() - 3600, 'path' => '/']);
  }
}
function is_admin_email($email) {
  return is_string($email) && mb_strtolower(trim($email)) === ADMIN_EMAIL;
}
function require_admin(PDO $pdo) {
  $u = current_customer($pdo);
  if (!$u) json_error('Bejelentkezés szükséges.', 401);
  if (empty($u['isAdmin'])) json_error('Nincs admin jogosultság ehhez a fiókhoz.', 403);
}
function current_customer(PDO $pdo) {
  if (empty($_SESSION['uid'])) return null;
  $stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE id = ?");
  $stmt->execute([$_SESSION['uid']]);
  $u = $stmt->fetch();
  if (!$u) return null;
  $u['isAdmin'] = is_admin_email($u['email']);
  return $u;
}

/* ---------- Rendelések ---------- */
function map_order(PDO $pdo, $row) {
  $stmt = $pdo->prepare("SELECT product_id AS id, name, price, qty FROM order_items WHERE order_id = ?");
  $stmt->execute([$row['id']]);
  $items = array_map(function ($it) {
    return ['id' => $it['id'], 'name' => $it['name'], 'price' => (int)$it['price'], 'qty' => (int)$it['qty']];
  }, $stmt->fetchAll());
  return [
    'id' => $row['id'],
    'items' => $items,
    'total' => (int)$row['total'],
    'userId' => $row['user_id'],
    'customer' => [
      'name' => $row['cust_name'], 'email' => $row['cust_email'],
      'phone' => $row['cust_phone'], 'address' => $row['cust_address'], 'note' => $row['cust_note'],
    ],
    'status' => $row['status'],
    'invoiceNo' => $row['invoice_no'] ?? '',
    'couponCode' => $row['coupon_code'] ?? '',
    'discount' => (int)($row['discount'] ?? 0),
    'createdAt' => str_replace(' ', 'T', $row['created_at']),
  ];
}

function create_order(PDO $pdo, array $payload, $user) {
  $reqItems = isset($payload['items']) && is_array($payload['items']) ? $payload['items'] : [];
  if (!count($reqItems)) return ['error' => 'A kosár üres vagy érvénytelen.'];

  // termékek betöltése
  $ids = array_values(array_filter(array_map(function ($it) { return (string)($it['id'] ?? ''); }, $reqItems)));
  if (!count($ids)) return ['error' => 'A kosár üres vagy érvénytelen.'];
  $place = implode(',', array_fill(0, count($ids), '?'));
  $stmt = $pdo->prepare("SELECT * FROM products WHERE id IN ($place)");
  $stmt->execute($ids);
  $byId = [];
  foreach ($stmt->fetchAll() as $p) $byId[$p['id']] = $p;

  $items = [];
  foreach ($reqItems as $it) {
    $pid = (string)($it['id'] ?? '');
    if (!isset($byId[$pid])) continue;
    $qty = max(1, (int)round((float)($it['qty'] ?? 1)));
    $items[] = ['id' => $pid, 'name' => $byId[$pid]['name'], 'price' => effective_price($byId[$pid]), 'qty' => $qty];
  }
  if (!count($items)) return ['error' => 'A kosár üres vagy érvénytelen.'];

  // készlet-ellenőrzés
  $short = [];
  foreach ($items as $it) {
    $p = $byId[$it['id']];
    if ($p['stock'] !== null && $it['qty'] > (int)$p['stock']) $short[] = $it['name'];
  }
  if (count($short)) return ['error' => 'Nincs elég készlet: ' . implode(', ', $short) . '.'];

  // vevő
  $c = isset($payload['customer']) && is_array($payload['customer']) ? $payload['customer'] : [];
  $name = mb_substr((string)($user['name'] ?? $c['name'] ?? ''), 0, 120);
  $email = mb_substr((string)($user['email'] ?? $c['email'] ?? ''), 0, 190);
  if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    return ['error' => 'Név és érvényes e-mail cím megadása kötelező.'];
  }

  $subtotal = 0;
  foreach ($items as $it) $subtotal += $it['price'] * $it['qty'];

  // Kupon érvényesítése (a backend a hiteles forrás)
  $couponCode = ''; $discount = 0;
  $reqCoupon = trim((string)($payload['coupon'] ?? ''));
  if ($reqCoupon !== '') {
    $cv = validate_coupon($pdo, $reqCoupon, $subtotal);
    if (!empty($cv['ok'])) { $couponCode = $cv['code']; $discount = (int)$cv['discount']; }
    // érvénytelen kupon esetén csendben elhagyjuk (a kosár UI már jelezte)
  }
  $total = max(0, $subtotal - $discount);
  $oid = 'ORD-' . strtoupper(substr(uniqid(), -8));
  $now = date('Y-m-d H:i:s');

  $pdo->beginTransaction();
  try {
    $stmt = $pdo->prepare("INSERT INTO orders (id,user_id,cust_name,cust_email,cust_phone,cust_address,cust_note,total,status,coupon_code,discount,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)");
    $stmt->execute([
      $oid, $user['id'] ?? null, $name, $email,
      mb_substr((string)($c['phone'] ?? ''), 0, 40),
      mb_substr((string)($c['address'] ?? ''), 0, 300),
      mb_substr((string)($c['note'] ?? ''), 0, 500),
      $total, 'Új', $couponCode, $discount, $now,
    ]);
    $ins = $pdo->prepare("INSERT INTO order_items (order_id,product_id,name,price,qty) VALUES (?,?,?,?,?)");
    $dec = $pdo->prepare("UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ? AND stock IS NOT NULL");
    foreach ($items as $it) {
      $ins->execute([$oid, $it['id'], $it['name'], $it['price'], $it['qty']]);
      $dec->execute([$it['qty'], $it['id']]);
    }
    $pdo->commit();
  } catch (Throwable $e) {
    $pdo->rollBack();
    return ['error' => 'A rendelés mentése sikertelen.'];
  }
  // kupon felhasználás-számláló növelése (nem blokkoló)
  if ($couponCode !== '') {
    try { $pdo->prepare("UPDATE coupons SET used = used + 1 WHERE code = ?")->execute([$couponCode]); }
    catch (Throwable $e) { /* nem blokkoló */ }
  }
  // Stripe: ha be van állítva a titkos kulcs, online bankkártyás fizetési munkamenetet hozunk létre.
  $status = 'Új';
  $checkoutUrl = '';
  $cfgFull = get_config($pdo, true);
  $stripeOn = trim((string)($cfgFull['stripeSecretKey'] ?? '')) !== '';
  if ($stripeOn) {
    $sess = stripe_create_checkout_session($cfgFull, $oid, $items, $email, site_origin(), $discount);
    if (!empty($sess['ok'])) {
      $status = 'Fizetésre vár';
      $checkoutUrl = (string)$sess['url'];
      try { $pdo->prepare("UPDATE orders SET status=?, stripe_session=? WHERE id=?")->execute([$status, $sess['id'], $oid]); }
      catch (Throwable $e) { /* nem blokkoló */ }
    } else {
      error_log('Stripe: ' . ($sess['error'] ?? '?'));   // hiba → visszaesünk manuális rendelésre
    }
  }

  // Számla + admin-értesítés azonnal, KIVÉVE ha kártyás fizetésre vár — akkor a sikeres
  // fizetés megerősítésekor állítjuk ki a számlát (lásd stripe_confirm()).
  $invoiceNo = '';
  if ($status !== 'Fizetésre vár') {
    $invoiceNo = maybe_issue_invoice($pdo, $cfgFull, $oid, $name, $email, (string)($c['address'] ?? ''), $items);
    notify_admin($pdo, 'Új rendelés – ' . $oid, order_notify_body($oid, $total, $name, $email, $c, $invoiceNo, $items));
  } else {
    notify_admin($pdo, 'Új rendelés (fizetésre vár) – ' . $oid, order_notify_body($oid, $total, $name, $email, $c, '', $items));
  }

  return ['order' => ['id' => $oid, 'total' => $total, 'status' => $status, 'invoiceNo' => $invoiceNo, 'checkoutUrl' => $checkoutUrl]];
}

/* ---------- Számla + értesítés segédek ---------- */
function maybe_issue_invoice(PDO $pdo, array $cfg, $oid, $name, $email, $address, array $items) {
  $invoiceNo = '';
  try {
    if (trim((string)($cfg['szamlazzAgentKey'] ?? '')) !== '') {
      $res = szamlazz_create_invoice($cfg, ['id' => $oid, 'name' => $name, 'email' => $email, 'address' => $address], $items);
      if (!empty($res['ok'])) {
        $invoiceNo = (string)$res['invoice'];
        $pdo->prepare("UPDATE orders SET invoice_no = ? WHERE id = ?")->execute([$invoiceNo, $oid]);
      } elseif (!empty($res['error'])) {
        error_log('Szamlazz.hu: ' . $res['error']);
      }
    }
  } catch (Throwable $e) {
    error_log('Szamlazz.hu kivétel: ' . $e->getMessage());
  }
  return $invoiceNo;
}
function order_notify_body($oid, $total, $name, $email, $c, $invoiceNo, $items) {
  return "Új rendelés érkezett a webshopban.\n\nAzonosító: $oid\nÖsszeg: $total\n" .
    "Vevő: {$name} <{$email}>\n" .
    (!empty($c['phone']) ? "Telefon: {$c['phone']}\n" : '') .
    (!empty($c['address']) ? "Cím: {$c['address']}\n" : '') .
    ($invoiceNo !== '' ? "Számla: {$invoiceNo}\n" : '') .
    "\nTételek:\n" . implode("\n", array_map(function ($it) { return "- {$it['name']} x{$it['qty']}"; }, $items)) . "\n";
}

/* ============================================================
   Stripe — online bankkártyás fizetés (Checkout, hosztolt oldal)
   ============================================================ */
function site_origin() {
  $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
  $host = $_SERVER['HTTP_HOST'] ?? 'luiz-tech.hu';
  return ($https ? 'https' : 'http') . '://' . $host;
}
function stripe_currency(array $cfg) {
  $c = strtolower(trim((string)($cfg['currency'] ?? 'Ft')));
  if (strpos($c, 'eur') !== false || strpos($c, '€') !== false) return 'eur';
  if (strpos($c, 'usd') !== false || strpos($c, '$') !== false) return 'usd';
  return 'huf'; // alap: forint (Ft/HUF)
}
function stripe_create_checkout_session(array $cfg, $oid, array $items, $email, $origin, $discount = 0) {
  $key = trim((string)($cfg['stripeSecretKey'] ?? ''));
  if ($key === '') return ['error' => 'Stripe nincs beállítva.'];
  if (!function_exists('curl_init')) return ['error' => 'cURL nem elérhető.'];
  $cur = stripe_currency($cfg);
  $fields = [
    'mode' => 'payment',
    'locale' => 'hu',
    'client_reference_id' => (string)$oid,
    'success_url' => $origin . '/webshop.html?paid=' . rawurlencode($oid) . '&session={CHECKOUT_SESSION_ID}',
    'cancel_url'  => $origin . '/webshop.html?canceled=' . rawurlencode($oid),
  ];
  if ($email) $fields['customer_email'] = $email;
  $i = 0;
  foreach ($items as $it) {
    $fields["line_items[$i][price_data][currency]"] = $cur;
    $fields["line_items[$i][price_data][product_data][name]"] = mb_substr((string)$it['name'], 0, 250);
    $fields["line_items[$i][price_data][unit_amount]"] = (string)((int)round((float)$it['price']) * 100);
    $fields["line_items[$i][quantity]"] = (string)max(1, (int)$it['qty']);
    $i++;
  }
  // Kupon: egyszer használatos Stripe-kupon a kedvezmény összegével
  $discount = (int)$discount;
  if ($discount > 0) {
    $coupon = stripe_create_once_coupon($key, $cur, $discount);
    if ($coupon !== '') $fields['discounts[0][coupon]'] = $coupon;
  }
  $ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query($fields),
    CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $key],
    CURLOPT_TIMEOUT => 20,
    CURLOPT_CONNECTTIMEOUT => 10,
  ]);
  $resp = curl_exec($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $cerr = curl_error($ch);
  curl_close($ch);
  if ($resp === false) return ['error' => 'Stripe kapcsolódási hiba: ' . $cerr];
  $data = json_decode($resp, true);
  if ($code >= 200 && $code < 300 && !empty($data['url'])) {
    return ['ok' => true, 'url' => $data['url'], 'id' => $data['id'] ?? ''];
  }
  return ['error' => 'Stripe hiba: ' . (isset($data['error']['message']) ? $data['error']['message'] : ('HTTP ' . $code))];
}
// Egyszer használatos Stripe-kupon (fix összegű kedvezmény). Visszaadja a coupon id-t, vagy ''-t.
function stripe_create_once_coupon($key, $currency, $amount) {
  $ch = curl_init('https://api.stripe.com/v1/coupons');
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query([
      'amount_off' => (string)((int)$amount * 100),
      'currency' => $currency,
      'duration' => 'once',
      'max_redemptions' => '1',
      'name' => 'Kupon',
    ]),
    CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $key],
    CURLOPT_TIMEOUT => 15,
    CURLOPT_CONNECTTIMEOUT => 10,
  ]);
  $resp = curl_exec($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($resp === false) return '';
  $d = json_decode($resp, true);
  return ($code >= 200 && $code < 300 && !empty($d['id'])) ? (string)$d['id'] : '';
}
// Sikeres fizetés megerősítése: lekérjük a Checkout Session-t, és ha kifizetett,
// kifizetettre állítjuk a rendelést + kiállítjuk a számlát.
function stripe_confirm(PDO $pdo, $oid, $sessionId) {
  $oid = (string)$oid; $sessionId = (string)$sessionId;
  if ($oid === '' || $sessionId === '') return ['error' => 'Hiányzó azonosító.'];
  $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ? LIMIT 1");
  $stmt->execute([$oid]);
  $order = $stmt->fetch();
  if (!$order) return ['error' => 'Ismeretlen rendelés.'];
  // ha már kifizetett, ne csináljunk semmit (idempotens)
  if (in_array($order['status'], ['Fizetve', 'Teljesítve'], true)) {
    return ['ok' => true, 'status' => $order['status'], 'id' => $oid];
  }
  $cfg = get_config($pdo, true);
  $key = trim((string)($cfg['stripeSecretKey'] ?? ''));
  if ($key === '') return ['error' => 'Stripe nincs beállítva.'];
  $ch = curl_init('https://api.stripe.com/v1/checkout/sessions/' . rawurlencode($sessionId));
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $key],
    CURLOPT_TIMEOUT => 20,
    CURLOPT_CONNECTTIMEOUT => 10,
  ]);
  $resp = curl_exec($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($resp === false) return ['error' => 'Stripe kapcsolódási hiba.'];
  $s = json_decode($resp, true);
  if ($code < 200 || $code >= 300 || !is_array($s)) return ['error' => 'Stripe hiba.'];
  // a session a rendeléshez tartozzon, és kifizetett legyen
  if ((string)($s['client_reference_id'] ?? '') !== $oid) return ['error' => 'A fizetés nem ehhez a rendeléshez tartozik.'];
  if (($s['payment_status'] ?? '') !== 'paid') return ['ok' => false, 'status' => $order['status'], 'pending' => true];
  // kifizetve → státusz + számla
  try { $pdo->prepare("UPDATE orders SET status = 'Fizetve' WHERE id = ?")->execute([$oid]); } catch (Throwable $e) {}
  $items = [];
  $it = $pdo->prepare("SELECT name, price, qty FROM order_items WHERE order_id = ?");
  $it->execute([$oid]);
  foreach ($it->fetchAll() as $r) $items[] = ['name' => $r['name'], 'price' => (float)$r['price'], 'qty' => (int)$r['qty']];
  $invoiceNo = maybe_issue_invoice($pdo, $cfg, $oid, (string)$order['cust_name'], (string)$order['cust_email'], (string)$order['cust_address'], $items);
  notify_admin($pdo, 'Fizetés beérkezett – ' . $oid,
    "Sikeres bankkártyás fizetés.\n\nAzonosító: $oid\nÖsszeg: {$order['total']}\n" .
    "Vevő: {$order['cust_name']} <{$order['cust_email']}>\n" .
    ($invoiceNo !== '' ? "Számla: {$invoiceNo}\n" : ''));
  return ['ok' => true, 'status' => 'Fizetve', 'id' => $oid, 'invoiceNo' => $invoiceNo];
}

/* ============================================================
   Vásárlók (regisztrált fiókok + rendelési statisztika)
   ============================================================ */
function list_customers(PDO $pdo) {
  $rows = $pdo->query("
    SELECT u.id, u.name, u.email, u.created_at,
           COUNT(o.id) AS orders_count,
           COALESCE(SUM(CASE WHEN o.status IN ('Teljesítve','Fizetve') THEN o.total ELSE 0 END), 0) AS spent,
           MAX(o.created_at) AS last_order
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    GROUP BY u.id, u.name, u.email, u.created_at
    ORDER BY u.created_at DESC
  ")->fetchAll();
  return array_map(function ($r) {
    return [
      'id' => $r['id'], 'name' => $r['name'], 'email' => $r['email'],
      'createdAt' => str_replace(' ', 'T', $r['created_at']),
      'orders' => (int)$r['orders_count'],
      'spent' => (int)$r['spent'],
      'lastOrder' => $r['last_order'] ? str_replace(' ', 'T', $r['last_order']) : '',
    ];
  }, $rows);
}

/* ============================================================
   Kuponok / kedvezménykódok
   ============================================================ */
function map_coupon($r) {
  return [
    'code' => $r['code'],
    'type' => $r['type'],
    'value' => (int)$r['value'],
    'minTotal' => (int)$r['min_total'],
    'expiresAt' => $r['expires_at'] ?: '',
    'maxUses' => (int)$r['max_uses'],
    'used' => (int)$r['used'],
    'active' => (int)$r['active'] === 1,
  ];
}
function list_coupons(PDO $pdo) {
  $rows = $pdo->query("SELECT * FROM coupons ORDER BY created_at DESC")->fetchAll();
  return array_map('map_coupon', $rows);
}
function save_coupon(PDO $pdo, array $b) {
  $code = strtoupper(preg_replace('/[^A-Za-z0-9_-]/', '', (string)($b['code'] ?? '')));
  if ($code === '') return ['error' => 'A kuponkód megadása kötelező (csak betű, szám, - és _).'];
  $type = ($b['type'] ?? 'percent') === 'fixed' ? 'fixed' : 'percent';
  $value = max(0, (int)round((float)($b['value'] ?? 0)));
  if ($type === 'percent' && $value > 100) $value = 100;
  if ($value <= 0) return ['error' => 'A kedvezmény értéke legyen nullánál nagyobb.'];
  $minTotal = max(0, (int)round((float)($b['minTotal'] ?? 0)));
  $maxUses = max(0, (int)round((float)($b['maxUses'] ?? 0)));
  $active = !empty($b['active']) ? 1 : 0;
  $expires = trim((string)($b['expiresAt'] ?? ''));
  $expires = preg_match('/^\d{4}-\d{2}-\d{2}$/', $expires) ? $expires : null;
  $exists = $pdo->prepare("SELECT used FROM coupons WHERE code = ?");
  $exists->execute([$code]);
  $row = $exists->fetch();
  if ($row) {
    $pdo->prepare("UPDATE coupons SET type=?, value=?, min_total=?, expires_at=?, max_uses=?, active=? WHERE code=?")
        ->execute([$type, $value, $minTotal, $expires, $maxUses, $active, $code]);
  } else {
    $pdo->prepare("INSERT INTO coupons (code,type,value,min_total,expires_at,max_uses,used,active,created_at) VALUES (?,?,?,?,?,?,0,?,?)")
        ->execute([$code, $type, $value, $minTotal, $expires, $maxUses, $active, date('Y-m-d H:i:s')]);
  }
  $g = $pdo->prepare("SELECT * FROM coupons WHERE code = ?");
  $g->execute([$code]);
  return ['ok' => true, 'coupon' => map_coupon($g->fetch())];
}
function delete_coupon(PDO $pdo, $code) {
  $pdo->prepare("DELETE FROM coupons WHERE code = ?")->execute([strtoupper((string)$code)]);
  return ['ok' => true];
}
// Kupon ellenőrzése egy adott részösszegre. Visszaadja a kedvezmény összegét (Ft).
function validate_coupon(PDO $pdo, $code, $subtotal) {
  $code = strtoupper(preg_replace('/[^A-Za-z0-9_-]/', '', (string)$code));
  if ($code === '') return ['error' => 'Add meg a kuponkódot.'];
  $stmt = $pdo->prepare("SELECT * FROM coupons WHERE code = ? LIMIT 1");
  $stmt->execute([$code]);
  $c = $stmt->fetch();
  if (!$c) return ['error' => 'Ismeretlen kuponkód.'];
  if ((int)$c['active'] !== 1) return ['error' => 'Ez a kupon nem aktív.'];
  if ($c['expires_at'] && $c['expires_at'] < date('Y-m-d')) return ['error' => 'Ez a kupon lejárt.'];
  if ((int)$c['max_uses'] > 0 && (int)$c['used'] >= (int)$c['max_uses']) return ['error' => 'Ezt a kupont már elhasználták.'];
  if ((int)$c['min_total'] > 0 && $subtotal < (int)$c['min_total']) {
    return ['error' => 'A kupon ' . (int)$c['min_total'] . ' Ft feletti rendeléshez érvényes.'];
  }
  $discount = $c['type'] === 'fixed'
    ? min((int)$c['value'], (int)$subtotal)
    : (int)floor($subtotal * (int)$c['value'] / 100);
  if ($discount <= 0) return ['error' => 'Ez a kupon nem alkalmazható erre a kosárra.'];
  return ['ok' => true, 'code' => $code, 'discount' => $discount, 'type' => $c['type'], 'value' => (int)$c['value']];
}

/* ---------- Számlázz.hu (Számla Agent) ---------- */
function szamlazz_create_invoice(array $cfg, array $order, array $items) {
  $key = trim((string)($cfg['szamlazzAgentKey'] ?? ''));
  if ($key === '') return ['skipped' => true];
  if (!function_exists('curl_init')) return ['error' => 'cURL nem elérhető a szerveren.'];

  $esc = function ($s) { return htmlspecialchars((string)$s, ENT_XML1 | ENT_QUOTES, 'UTF-8'); };
  $today = date('Y-m-d');
  $due = date('Y-m-d', strtotime('+8 days'));

  $tetelek = '';
  foreach ($items as $it) {
    $net = (int)$it['price'] * (int)$it['qty'];
    $tetelek .=
      '<tetel>' .
        '<megnevezes>' . $esc($it['name']) . '</megnevezes>' .
        '<mennyiseg>' . (int)$it['qty'] . '</mennyiseg>' .
        '<mennyisegiEgyseg>db</mennyisegiEgyseg>' .
        '<nettoEgysegar>' . (int)$it['price'] . '</nettoEgysegar>' .
        '<afakulcs>AAM</afakulcs>' .
        '<nettoErtek>' . $net . '</nettoErtek>' .
        '<afaErtek>0</afaErtek>' .
        '<bruttoErtek>' . $net . '</bruttoErtek>' .
      '</tetel>';
  }

  $xml =
    '<?xml version="1.0" encoding="UTF-8"?>' .
    '<xmlszamla xmlns="http://www.szamlazz.hu/xmlszamla" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' .
    'xsi:schemaLocation="http://www.szamlazz.hu/xmlszamla https://www.szamlazz.hu/szamla/docs/xsds/agent/xmlszamla.xsd">' .
      '<beallitasok>' .
        '<szamlaagentkulcs>' . $esc($key) . '</szamlaagentkulcs>' .
        '<eszamla>true</eszamla>' .
        '<szamlaLetoltes>false</szamlaLetoltes>' .
      '</beallitasok>' .
      '<fejlec>' .
        '<keltDatum>' . $today . '</keltDatum>' .
        '<teljesitesDatum>' . $today . '</teljesitesDatum>' .
        '<fizetesiHataridoDatum>' . $due . '</fizetesiHataridoDatum>' .
        '<fizmod>bankkártya</fizmod>' .
        '<penznem>HUF</penznem>' .
        '<szamlaNyelve>hu</szamlaNyelve>' .
        '<megjegyzes>' . $esc('Webshop rendelés: ' . $order['id']) . '</megjegyzes>' .
        '<rendelesSzam>' . $esc($order['id']) . '</rendelesSzam>' .
      '</fejlec>' .
      '<elado></elado>' .
      '<vevo>' .
        '<nev>' . $esc($order['name']) . '</nev>' .
        '<cim>' . $esc(trim((string)$order['address']) !== '' ? $order['address'] : '-') . '</cim>' .
        '<email>' . $esc($order['email']) . '</email>' .
        '<sendEmail>true</sendEmail>' .
      '</vevo>' .
      '<tetelek>' . $tetelek . '</tetelek>' .
    '</xmlszamla>';

  $tmp = tempnam(sys_get_temp_dir(), 'szla');
  if ($tmp === false) return ['error' => 'Ideiglenes fájl hiba.'];
  file_put_contents($tmp, $xml);

  $ch = curl_init('https://www.szamlazz.hu/szamla/');
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => ['action-xmlagentxmlfile' => new CURLFile($tmp, 'text/xml', 'szamla.xml')],
    CURLOPT_TIMEOUT => 25,
    CURLOPT_CONNECTTIMEOUT => 10,
  ]);
  $resp = curl_exec($ch);
  $hsize = (int)curl_getinfo($ch, CURLINFO_HEADER_SIZE);
  $cerr = curl_error($ch);
  curl_close($ch);
  @unlink($tmp);

  if ($resp === false) return ['error' => 'Kapcsolódási hiba: ' . $cerr];

  $headers = substr($resp, 0, $hsize);
  $invoice = ''; $errcode = ''; $errmsg = '';
  foreach (preg_split('/\r?\n/', $headers) as $line) {
    if (stripos($line, 'szlahu_szamlaszam:') === 0) $invoice = trim(substr($line, 18));
    elseif (stripos($line, 'szlahu_error_code:') === 0) $errcode = trim(substr($line, 18));
    elseif (stripos($line, 'szlahu_error:') === 0) $errmsg = trim(substr($line, 13));
  }
  if ($errcode !== '' && $errcode !== '0') return ['error' => "Számlázz.hu hiba ($errcode): " . urldecode($errmsg)];
  if ($invoice === '') return ['error' => 'Nem érkezett számlaszám a Számlázz.hu-tól.'];
  return ['ok' => true, 'invoice' => $invoice];
}

/* ---------- Hírek ---------- */
function map_news($r) {
  return ['id' => $r['id'], 'title' => $r['title'], 'body' => $r['body'], 'date' => $r['date'], 'createdAt' => str_replace(' ', 'T', $r['created_at'])];
}
function get_news(PDO $pdo) {
  return array_map('map_news', $pdo->query("SELECT * FROM news ORDER BY `date` DESC, created_at DESC")->fetchAll());
}

/* ---------- References ---------- */
function clean_url($u) {
  $u = mb_substr((string)$u, 0, 300);
  if ($u !== '' && !preg_match('#^https?://#i', $u)) $u = 'https://' . $u;
  return $u;
}
function insert_reference(PDO $pdo, array $r, $sort = 0) {
  $id = (string)($r['id'] ?? '');
  if ($id === '') $id = 'r' . uniqid();
  $stmt = $pdo->prepare("INSERT INTO refs (id,tag,title,description,details,info,url,gold,is_new,sort) VALUES (?,?,?,?,?,?,?,?,?,?)");
  $stmt->execute([
    $id,
    mb_substr((string)($r['tag'] ?? ''), 0, 60),
    mb_substr((string)($r['title'] ?? ''), 0, 160),
    mb_substr((string)($r['description'] ?? ''), 0, 600),
    mb_substr((string)($r['details'] ?? ''), 0, 2000),
    mb_substr((string)($r['info'] ?? ''), 0, 160),
    clean_url($r['url'] ?? ''),
    !empty($r['gold']) ? 1 : 0,
    !empty($r['new']) ? 1 : 0,
    (int)$sort,
  ]);
  return $id;
}
function map_reference($r) {
  return [
    'id' => $r['id'], 'tag' => $r['tag'], 'title' => $r['title'],
    'description' => $r['description'], 'details' => $r['details'],
    'info' => $r['info'], 'url' => $r['url'],
    'gold' => !empty($r['gold']),
    'new' => !empty($r['is_new']),
  ];
}
function get_references(PDO $pdo) {
  return array_map('map_reference', $pdo->query("SELECT * FROM refs ORDER BY sort ASC, title ASC")->fetchAll());
}

/* ---------- FAQ ---------- */
function insert_faq(PDO $pdo, array $f, $sort = 0) {
  $id = (string)($f['id'] ?? '');
  if ($id === '') $id = 'f' . uniqid();
  $stmt = $pdo->prepare("INSERT INTO faq (id,question,answer,sort) VALUES (?,?,?,?)");
  $stmt->execute([$id, mb_substr((string)($f['question'] ?? ''), 0, 300), mb_substr((string)($f['answer'] ?? ''), 0, 4000), (int)$sort]);
  return $id;
}
function map_faq($r) { return ['id'=>$r['id'], 'question'=>$r['question'], 'answer'=>$r['answer']]; }
function get_faq(PDO $pdo) { return array_map('map_faq', $pdo->query("SELECT * FROM faq ORDER BY sort ASC")->fetchAll()); }

/* ---------- E-mail értesítés (PHP mail) ---------- */
function notify_admin(PDO $pdo, $subject, $bodyText) {
  $cfg = get_config($pdo);
  $to = filter_var($cfg['notifyEmail'] ?? '', FILTER_VALIDATE_EMAIL);
  if ($to) send_mail($to, $subject, $bodyText);
}
function send_mail($to, $subject, $bodyText) {
  if (!is_string($to) || !filter_var($to, FILTER_VALIDATE_EMAIL)) return false;
  if (!function_exists('mail')) return false;
  $domain = substr(strrchr($to, '@'), 1) ?: 'localhost';
  $from = 'no-reply@' . $domain;
  $headers = "From: Luiz-Tech <{$from}>\r\n";
  $headers .= "MIME-Version: 1.0\r\n";
  $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
  $headers .= "Content-Transfer-Encoding: 8bit\r\n";
  $subjEnc = '=?UTF-8?B?' . base64_encode($subject) . '?=';
  return @mail($to, $subjEnc, $bodyText, $headers);
}

/* ---------- Messages (leadek a kapcsolati űrlapról) ---------- */
function create_message(PDO $pdo, array $b) {
  $name = mb_substr(trim((string)($b['name'] ?? '')), 0, 120);
  $email = mb_substr(trim((string)($b['email'] ?? '')), 0, 190);
  $msg = mb_substr(trim((string)($b['message'] ?? '')), 0, 4000);
  if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) return ['error' => 'Név és érvényes e-mail cím megadása kötelező.'];
  if ($msg === '') return ['error' => 'Az üzenet nem lehet üres.'];
  $id = 'MSG-' . strtoupper(substr(uniqid(), -8));
  $stmt = $pdo->prepare("INSERT INTO messages (id,name,email,topic,message,status,created_at) VALUES (?,?,?,?,?,?,?)");
  $stmt->execute([$id, $name, $email, mb_substr((string)($b['topic'] ?? ''), 0, 60), $msg, 'Új', date('Y-m-d H:i:s')]);
  notify_admin($pdo, 'Új üzenet a weboldalról – ' . $name,
    "Új megkeresés érkezett a kapcsolati űrlapról.\n\n" .
    "Név: $name\nE-mail: $email\nTéma: " . (string)($b['topic'] ?? '-') . "\n\nÜzenet:\n$msg\n");
  return ['id' => $id];
}
function map_message($r) {
  return ['id'=>$r['id'],'name'=>$r['name'],'email'=>$r['email'],'topic'=>$r['topic'],'message'=>$r['message'],'status'=>$r['status'],'createdAt'=>str_replace(' ','T',$r['created_at'])];
}
function get_messages(PDO $pdo) { return array_map('map_message', $pdo->query("SELECT * FROM messages ORDER BY created_at DESC")->fetchAll()); }

/* ---------- Support ticketek ---------- */
function map_ticket($r) {
  return ['id'=>$r['id'],'userId'=>$r['user_id'],'subject'=>$r['subject'],'status'=>$r['status'],
    'createdAt'=>str_replace(' ','T',$r['created_at']),'updatedAt'=>str_replace(' ','T',$r['updated_at'])];
}
function ticket_messages(PDO $pdo, $tid) {
  $stmt = $pdo->prepare("SELECT author, body, created_at FROM ticket_messages WHERE ticket_id = ? ORDER BY id ASC");
  $stmt->execute([$tid]);
  return array_map(function ($m) { return ['author'=>$m['author'],'body'=>$m['body'],'createdAt'=>str_replace(' ','T',$m['created_at'])]; }, $stmt->fetchAll());
}
function create_ticket(PDO $pdo, $userId, $subject, $body) {
  $subject = mb_substr(trim((string)$subject), 0, 200);
  $body = mb_substr(trim((string)$body), 0, 4000);
  if ($subject === '' || $body === '') return ['error' => 'Tárgy és üzenet megadása kötelező.'];
  $id = 'TIC-' . strtoupper(substr(uniqid(), -8));
  $now = date('Y-m-d H:i:s');
  $pdo->prepare("INSERT INTO tickets (id,user_id,subject,status,created_at,updated_at) VALUES (?,?,?,?,?,?)")
      ->execute([$id, $userId, $subject, 'Nyitott', $now, $now]);
  $pdo->prepare("INSERT INTO ticket_messages (ticket_id,author,body,created_at) VALUES (?,?,?,?)")
      ->execute([$id, 'customer', $body, $now]);
  notify_admin($pdo, 'Új support ticket – ' . $subject,
    "Új ticket érkezett.\n\nAzonosító: $id\nTárgy: $subject\n\nÜzenet:\n$body\n");
  return ['id' => $id];
}
function add_ticket_message(PDO $pdo, $tid, $author, $body, $newStatus = null) {
  $body = mb_substr(trim((string)$body), 0, 4000);
  if ($body === '') return ['error' => 'Az üzenet nem lehet üres.'];
  $now = date('Y-m-d H:i:s');
  $pdo->prepare("INSERT INTO ticket_messages (ticket_id,author,body,created_at) VALUES (?,?,?,?)")
      ->execute([$tid, $author, $body, $now]);
  $status = $newStatus && in_array($newStatus, TICKET_STATUSES, true) ? $newStatus
            : ($author === 'admin' ? 'Válaszra vár' : 'Nyitott');
  $pdo->prepare("UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?")->execute([$status, $now, $tid]);
  // értesítés a másik félnek
  $tr = $pdo->prepare("SELECT t.subject, u.email FROM tickets t LEFT JOIN users u ON u.id = t.user_id WHERE t.id = ?");
  $tr->execute([$tid]);
  $info = $tr->fetch();
  if ($info) {
    if ($author === 'admin') {
      // ügyfél értesítése
      send_mail($info['email'], 'Válasz a support ticketedre – ' . $info['subject'],
        "Válasz érkezett a ticketedre ($tid).\n\n$body\n\nVálaszolni a fiókodban tudsz a weboldalon.\n");
    } else {
      // admin értesítése
      notify_admin($pdo, 'Ügyfél-válasz a ticketben – ' . $info['subject'],
        "Az ügyfél válaszolt a(z) $tid ticketben.\n\n$body\n");
    }
  }
  return ['ok' => true];
}

/* ---------- Képfeltöltés ---------- */
function save_data_url($dataUrl) {
  if (!is_string($dataUrl)) return ['error' => 'Hiányzó kép.'];
  if (!preg_match('#^data:([a-z0-9/+.\-]+);base64,(.+)$#i', trim($dataUrl), $m)) return ['error' => 'Érvénytelen képformátum.'];
  $mimes = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp', 'image/gif' => 'gif'];
  $mime = strtolower($m[1]);
  if (!isset($mimes[$mime])) return ['error' => 'Nem támogatott formátum (PNG, JPG, WEBP vagy GIF).'];
  $data = base64_decode($m[2], true);
  if ($data === false || strlen($data) === 0) return ['error' => 'A kép feldolgozása sikertelen.'];
  if (strlen($data) > 4 * 1024 * 1024) return ['error' => 'A kép túl nagy (max. 4 MB).'];
  // a TÉNYLEGES tartalom is legyen valódi, engedélyezett kép (nem csak a deklarált mime)
  $allowedTypes = [IMAGETYPE_PNG, IMAGETYPE_JPEG, IMAGETYPE_WEBP, IMAGETYPE_GIF];
  $info = @getimagesizefromstring($data);
  if ($info === false || !in_array($info[2], $allowedTypes, true)) {
    return ['error' => 'A fájl nem érvényes kép.'];
  }
  $dir = uploads_dir();
  if (!is_dir($dir)) @mkdir($dir, 0755, true);
  $name = bin2hex(random_bytes(10)) . '.' . $mimes[$mime];
  if (@file_put_contents($dir . '/' . $name, $data) === false) return ['error' => 'A kép mentése sikertelen (írási jog?).'];
  return ['url' => '/uploads/' . $name];
}
