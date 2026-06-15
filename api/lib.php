<?php
/* ============================================================
   Luiz-Tech — PHP backend (cPanel + MySQL)
   Közös réteg: adatbázis, séma, alapértékek, segédfüggvények.
   ============================================================ */

date_default_timezone_set('Europe/Budapest');

const ORDER_STATUSES = ['Új', 'Feldolgozás alatt', 'Teljesítve', 'Törölve'];
const MESSAGE_STATUSES = ['Új', 'Folyamatban', 'Lezárt'];
const TICKET_STATUSES = ['Nyitott', 'Válaszra vár', 'Megoldva', 'Lezárt'];
const SCHEMA_VERSION = 5;

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
];

const DEFAULT_PRODUCTS = [
  ['id'=>'p1','name'=>'Webfejlesztői csomag','desc'=>'Egyedi weboldal a koncepciótól az élesítésig.','price'=>149000,'category'=>'Szolgáltatás','emoji'=>'🌐','image'=>'','stock'=>null],
  ['id'=>'p2','name'=>'Webshop indító csomag','desc'=>'Teljes e-commerce megoldás fizetési integrációval.','price'=>249000,'category'=>'Szolgáltatás','emoji'=>'🛒','image'=>'','stock'=>null],
  ['id'=>'p3','name'=>'Kiberbiztonsági audit','desc'=>'Sérülékenység-vizsgálat és biztonsági jelentés.','price'=>89000,'category'=>'Biztonság','emoji'=>'🛡️','image'=>'','stock'=>null],
  ['id'=>'p4','name'=>'Adatmentési megoldás','desc'=>'Automatikus, ütemezett biztonsági mentés beüzemelve.','price'=>59000,'category'=>'Üzemeltetés','emoji'=>'💾','image'=>'','stock'=>null],
  ['id'=>'p5','name'=>'Hálózat optimalizálás','desc'=>'Wi-Fi és vezetékes hálózat felmérése és hangolása.','price'=>69000,'category'=>'Üzemeltetés','emoji'=>'📡','image'=>'','stock'=>null],
  ['id'=>'p6','name'=>'SEO indító csomag','desc'=>'Keresőoptimalizálás, technikai audit és kulcsszókutatás.','price'=>79000,'category'=>'Marketing','emoji'=>'📈','image'=>'','stock'=>null,'salePrice'=>59000],
];

const DEFAULT_REFERENCES = [
  ['id'=>'r1','tag'=>'Weboldal','title'=>'Műanyagnyílászárók','description'=>'Új, modern weboldal a teljes termékkínálat bemutatásához — villámgyors átfutással.','details'=>'A megkeresést követően 24 órán belül átadtuk a kész, reszponzív weboldalt. A termékkínálat áttekinthető bemutatása, gyors betöltés és SEO-barát felépítés volt a fókuszban.','info'=>'2024 · ⚡ 24 óra alatt kész','url'=>''],
  ['id'=>'r2','tag'=>'Weboldal','title'=>'Napháló','description'=>'Egyedi weboldal a csapat számára, letisztult megjelenéssel és gyors betöltéssel.','details'=>'A Napháló csapata egyedi, letisztult weboldalt kapott, amelyet mindössze 8 óra alatt készítettünk el és élesítettünk.','info'=>'2024. május · ⚡ 8 óra alatt kész','url'=>''],
  ['id'=>'r3','tag'=>'Webshop','title'=>'Net-Trade Hungary','description'=>'Egyedi webshop fejlesztése a koncepciótól az élesítésig, teljesen testreszabva.','details'=>'Teljesen egyedi webshopot építettünk: a koncepciótól a tervezésen át az élesítésig. Az áruház 2023. április 17-én indult, testreszabott funkciókkal.','info'=>'Indulás: 2023.04.17. · 🛒 E-commerce','url'=>''],
  ['id'=>'r4','tag'=>'Platform','title'=>'Home and Confidence','description'=>'Komplex ingatlanhirdetési platform egy ingatlaniroda számára, egyedi funkciókkal.','details'=>'Egy ingatlaniroda számára komplex hirdetési platformot fejlesztettünk: ingatlanok feltöltése és kezelése, keresés és szűrés, egyedi funkciókkal.','info'=>'2023 · 🏠 Ingatlan platform','url'=>''],
  ['id'=>'r5','tag'=>'Weboldal','title'=>'Vendégház bemutatkozó oldal','description'=>'Hangulatos, foglalásra ösztönző weboldal egy vendégház számára.','details'=>'Hangulatos bemutatkozó weboldal egy vendégház számára, amely a foglalásra ösztönöz: szép képi világ, áttekinthető információk és gyors elérhetőség.','info'=>'2023. november · 🏡 Turizmus','url'=>''],
  ['id'=>'bgyarmatpaint','tag'=>'Weboldal','title'=>'BGyarmat Paint','description'=>'Festékek és szakáru bemutatása letisztult, könnyen kezelhető weboldalon.','details'=>'Modern, reszponzív weboldal a BGyarmat Paint számára: áttekinthető termék- és szolgáltatásbemutatás, gyors betöltés és SEO-barát felépítés.','info'=>'2024 · 🎨 Festék & szakáru','url'=>'https://bgyarmatpaint.hu'],
];

const ALLOWED_CONFIG = ['name','tagline','accent','accent2','theme','currency','heroTitle','heroText','freeShippingOver','notifyEmail'];

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
function get_config(PDO $pdo) {
  $rows = $pdo->query("SELECT k, v FROM settings")->fetchAll();
  $map = [];
  foreach ($rows as $r) $map[$r['k']] = $r['v'];
  $out = [];
  foreach (DEFAULT_CONFIG as $k => $dv) $out[$k] = array_key_exists($k, $map) ? $map[$k] : $dv;
  $out['freeShippingOver'] = (int)$out['freeShippingOver'];
  $out['theme'] = ($out['theme'] === 'light') ? 'light' : 'dark';
  return $out;
}

function save_config(PDO $pdo, array $in) {
  $up = $pdo->prepare("INSERT INTO settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)");
  foreach (ALLOWED_CONFIG as $k) {
    if (array_key_exists($k, $in) && $in[$k] !== null) {
      $v = $in[$k];
      if ($k === 'freeShippingOver') $v = max(0, (int)$v);
      if ($k === 'theme') $v = ($v === 'light') ? 'light' : 'dark';
      if ($k === 'currency') $v = mb_substr((string)$v, 0, 6);
      if ($k === 'notifyEmail' && !filter_var($v, FILTER_VALIDATE_EMAIL)) continue;
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
function insert_product(PDO $pdo, array $p, $sort = 0) {
  $id = (string)($p['id'] ?? '');
  if ($id === '') $id = 'p' . uniqid();
  $price = max(0, (int)($p['price'] ?? 0));
  $stmt = $pdo->prepare("INSERT INTO products (id,name,descr,price,category,emoji,image,stock,sale_price,sort)
    VALUES (?,?,?,?,?,?,?,?,?,?)");
  $stmt->execute([
    $id,
    mb_substr((string)($p['name'] ?? ''), 0, 160),
    mb_substr((string)($p['desc'] ?? ''), 0, 600),
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
  session_set_cookie_params([
    'lifetime' => 0, 'path' => '/', 'httponly' => true,
    'samesite' => 'Lax', 'secure' => $secure,
  ]);
  session_start();
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

  $total = 0;
  foreach ($items as $it) $total += $it['price'] * $it['qty'];
  $oid = 'ORD-' . strtoupper(substr(uniqid(), -8));
  $now = date('Y-m-d H:i:s');

  $pdo->beginTransaction();
  try {
    $stmt = $pdo->prepare("INSERT INTO orders (id,user_id,cust_name,cust_email,cust_phone,cust_address,cust_note,total,status,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?)");
    $stmt->execute([
      $oid, $user['id'] ?? null, $name, $email,
      mb_substr((string)($c['phone'] ?? ''), 0, 40),
      mb_substr((string)($c['address'] ?? ''), 0, 300),
      mb_substr((string)($c['note'] ?? ''), 0, 500),
      $total, 'Új', $now,
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
  notify_admin($pdo, 'Új rendelés – ' . $oid,
    "Új rendelés érkezett a webshopban.\n\nAzonosító: $oid\nÖsszeg: $total\n" .
    "Vevő: {$customer['name']} <{$customer['email']}>\n" .
    ($customer['phone'] ? "Telefon: {$customer['phone']}\n" : '') .
    ($customer['address'] ? "Cím: {$customer['address']}\n" : '') .
    "\nTételek:\n" . implode("\n", array_map(function ($it) { return "- {$it['name']} x{$it['qty']}"; }, $items)) . "\n");

  return ['order' => ['id' => $oid, 'total' => $total, 'status' => 'Új']];
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
  $stmt = $pdo->prepare("INSERT INTO refs (id,tag,title,description,details,info,url,gold,sort) VALUES (?,?,?,?,?,?,?,?,?)");
  $stmt->execute([
    $id,
    mb_substr((string)($r['tag'] ?? ''), 0, 60),
    mb_substr((string)($r['title'] ?? ''), 0, 160),
    mb_substr((string)($r['description'] ?? ''), 0, 600),
    mb_substr((string)($r['details'] ?? ''), 0, 2000),
    mb_substr((string)($r['info'] ?? ''), 0, 160),
    clean_url($r['url'] ?? ''),
    !empty($r['gold']) ? 1 : 0,
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
