<?php
/* ============================================================
   Luiz-Tech — Telepítő varázsló
   Létrehozza az adatbázis-táblákat, beállítja a kapcsolatot és
   az admin fiókot. Telepítés után TÖRÖLD ezt a fájlt!
   ============================================================ */
require __DIR__ . '/api/lib.php';

$done = false;
$error = '';
$already = is_installed();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$already) {
  $host = trim($_POST['host'] ?? 'localhost');
  $name = trim($_POST['dbname'] ?? '');
  $user = trim($_POST['dbuser'] ?? '');
  $pass = (string)($_POST['dbpass'] ?? '');
  $auser = trim($_POST['adminuser'] ?? 'admin');
  $apass = (string)($_POST['adminpass'] ?? '');

  if ($name === '' || $user === '') {
    $error = 'Az adatbázis neve és felhasználója kötelező.';
  } elseif (strlen($apass) < 6) {
    $error = 'Az admin jelszó legalább 6 karakter legyen.';
  } else {
    try {
      $pdo = db_connect($host, $name, $user, $pass);
      create_schema($pdo);
      seed_defaults($pdo);

      // admin fiók
      $stmt = $pdo->prepare("INSERT INTO admin (id, username, hash) VALUES (1, ?, ?)
        ON DUPLICATE KEY UPDATE username = VALUES(username), hash = VALUES(hash)");
      $stmt->execute([mb_substr($auser, 0, 60), password_hash($apass, PASSWORD_DEFAULT)]);

      // uploads mappa
      if (!is_dir(uploads_dir())) @mkdir(uploads_dir(), 0755, true);

      // config.php kiírása
      $php = "<?php\nreturn " . var_export([
        'host' => $host, 'name' => $name, 'user' => $user, 'pass' => $pass,
      ], true) . ";\n";
      if (@file_put_contents(config_path(), $php) === false) {
        $error = 'Nem sikerült a config.php létrehozása (írási jog a gyökérben?). Hozd létre kézzel az alábbi tartalommal:';
        $manual = $php;
      } else {
        $done = true;
      }
    } catch (Throwable $e) {
      $error = 'Adatbázis-hiba: ' . $e->getMessage();
    }
  }
}
?>
<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Luiz-Tech — Telepítés</title>
<style>
  body { margin:0; font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif; background:#0a0e17; color:#e6edf3; display:grid; place-items:center; min-height:100vh; padding:24px; }
  .card { width:100%; max-width:480px; background:#0d1320; border:1px solid rgba(255,255,255,.12); border-radius:16px; padding:30px; box-shadow:0 20px 60px -20px rgba(0,0,0,.6); }
  h1 { font-size:1.4rem; margin:0 0 6px; }
  p.sub { color:#9aa7b8; margin:0 0 22px; font-size:.95rem; }
  label { display:block; font-size:.85rem; color:#9aa7b8; margin:14px 0 6px; }
  input { width:100%; box-sizing:border-box; padding:11px 13px; background:#111827; border:1px solid rgba(255,255,255,.12); border-radius:10px; color:#e6edf3; font-size:.95rem; }
  input:focus { outline:none; border-color:#38e1ff; box-shadow:0 0 0 3px rgba(56,225,255,.15); }
  button { margin-top:22px; width:100%; padding:13px; border:0; border-radius:999px; background:linear-gradient(135deg,#38e1ff,#6c7bff); color:#04121a; font-weight:700; font-size:1rem; cursor:pointer; }
  .msg { padding:12px 14px; border-radius:10px; font-size:.9rem; margin-bottom:16px; }
  .err { background:rgba(255,122,122,.12); color:#ff9d9d; border:1px solid rgba(255,122,122,.3); }
  .ok { background:rgba(0,255,163,.12); color:#7CFFD0; border:1px solid rgba(0,255,163,.3); }
  .hint { font-size:.8rem; color:#6b7889; margin-top:8px; }
  code, pre { font-family:ui-monospace,Menlo,monospace; background:#111827; padding:2px 6px; border-radius:6px; color:#38e1ff; }
  pre { padding:12px; overflow:auto; white-space:pre-wrap; }
  a { color:#38e1ff; }
  .row { display:flex; gap:12px; } .row > div { flex:1; }
</style>
</head>
<body>
  <div class="card">
    <h1>&lt;Luiz-Tech/&gt; telepítés</h1>
    <p class="sub">Add meg az adatbázis és az admin adatait. Egyszer kell lefuttatni.</p>

    <?php if ($already): ?>
      <div class="msg ok">✓ A rendszer már telepítve van.</div>
      <p>Nyisd meg az oldalt: <a href="index.html">Főoldal</a> · <a href="admin.html">Admin</a></p>
      <p class="hint">Biztonsági okból <strong>töröld ezt a <code>setup.php</code> fájlt</strong>. Újratelepítéshez előbb töröld a <code>config.php</code>-t.</p>
    <?php elseif ($done): ?>
      <div class="msg ok">✓ Sikeres telepítés! Az adatbázis és az admin fiók létrejött.</div>
      <p>Nyisd meg: <a href="index.html">Főoldal</a> · <a href="admin.html">Admin</a></p>
      <p class="hint">⚠️ Most <strong>töröld a <code>setup.php</code> fájlt</strong> a tárhelyről (biztonság)!</p>
    <?php else: ?>
      <?php if ($error): ?><div class="msg err"><?= htmlspecialchars($error) ?></div><?php endif; ?>
      <?php if (!empty($manual)): ?><pre><?= htmlspecialchars($manual) ?></pre><?php endif; ?>
      <form method="post">
        <label>Adatbázis host</label>
        <input name="host" value="<?= htmlspecialchars($_POST['host'] ?? 'localhost') ?>" />
        <label>Adatbázis neve</label>
        <input name="dbname" value="<?= htmlspecialchars($_POST['dbname'] ?? '') ?>" placeholder="pl. luiztecs_shop" />
        <div class="row">
          <div>
            <label>DB felhasználó</label>
            <input name="dbuser" value="<?= htmlspecialchars($_POST['dbuser'] ?? '') ?>" />
          </div>
          <div>
            <label>DB jelszó</label>
            <input name="dbpass" type="password" />
          </div>
        </div>
        <hr style="border:0;border-top:1px solid rgba(255,255,255,.1);margin:22px 0 0">
        <div class="row">
          <div>
            <label>Admin felhasználónév</label>
            <input name="adminuser" value="<?= htmlspecialchars($_POST['adminuser'] ?? 'admin') ?>" />
          </div>
          <div>
            <label>Admin jelszó</label>
            <input name="adminpass" type="password" placeholder="min. 6 karakter" />
          </div>
        </div>
        <button type="submit">Telepítés indítása</button>
        <p class="hint">A DB adatokat a cPanel → MySQL® adatbázisok résznél hozod létre (adatbázis + felhasználó + hozzárendelés).</p>
      </form>
    <?php endif; ?>
  </div>
</body>
</html>
