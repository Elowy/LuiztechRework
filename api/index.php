<?php
/* ============================================================
   Luiz-Tech — REST API router (PHP)
   A .htaccess minden /api/* kérést ide irányít.
   ============================================================ */
require __DIR__ . '/lib.php';
start_app_session();

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pos = strpos($uri, '/api');
$route = $pos !== false ? substr($uri, $pos + 4) : $uri;   // pl. "/shop", "/admin/orders/ORD-1"
$route = '/' . trim($route, '/');
if ($route === '/') { /* gyökér */ }
$method = $_SERVER['REQUEST_METHOD'];

/* ---- segéd: route minta illesztés ---- */
function match_route($pattern, $route, &$params) {
  $regex = '#^' . preg_replace('#\{[^/]+\}#', '([^/]+)', $pattern) . '$#';
  if (preg_match($regex, $route, $m)) { $params = array_slice($m, 1); return true; }
  return false;
}

$pdo = db();
$params = [];

/* ============================================================
   PUBLIKUS
   ============================================================ */
if ($method === 'GET' && $route === '/shop') {
  $c = get_config_with_products($pdo);
  unset($c['notifyEmail']); // privát: ne szivárogjon ki a publikus API-n
  json_out($c);
}
if ($method === 'GET' && $route === '/news') {
  json_out(get_news($pdo));
}
if ($method === 'GET' && $route === '/references') {
  json_out(get_references($pdo));
}
if ($method === 'GET' && $route === '/faq') {
  json_out(get_faq($pdo));
}
if ($method === 'POST' && $route === '/messages') {
  $r = create_message($pdo, body());
  if (isset($r['error'])) json_error($r['error'], 400);
  json_out(['ok' => true, 'id' => $r['id']], 201);
}
if ($method === 'POST' && $route === '/orders') {
  $cust = current_customer($pdo);
  $r = create_order($pdo, body(), $cust);
  if (isset($r['error'])) json_error($r['error'], 400);
  json_out([
    'ok' => true,
    'id' => $r['order']['id'],
    'total' => $r['order']['total'],
    'status' => $r['order']['status'],
    'checkoutUrl' => $r['order']['checkoutUrl'] ?? '',
  ], 201);
}
// Stripe fizetés megerősítése a sikeres visszatérés után (a session a fizetés bizonyítéka)
if ($method === 'POST' && $route === '/checkout/confirm') {
  $b = body();
  $res = stripe_confirm($pdo, (string)($b['order'] ?? ''), (string)($b['session'] ?? ''));
  if (isset($res['error'])) json_error($res['error'], 400);
  json_out($res);
}

/* ============================================================
   ADMIN (védett) — admin = az ADMIN_EMAIL fiókkal bejelentkezett user
   ============================================================ */
if ($method === 'GET' && $route === '/admin/config') {
  require_admin($pdo);
  json_out(get_config_with_products($pdo));
}
if ($method === 'PUT' && $route === '/admin/config') {
  require_admin($pdo);
  json_out(save_config($pdo, body()));
}
if ($method === 'POST' && $route === '/admin/reset') {
  require_admin($pdo);
  json_out(reset_all($pdo));
}
if ($method === 'GET' && $route === '/admin/orders') {
  require_admin($pdo);
  $rows = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC")->fetchAll();
  $orders = array_map(function ($r) use ($pdo) { return map_order($pdo, $r); }, $rows);
  json_out(['statuses' => ORDER_STATUSES, 'orders' => $orders]);
}
if ($method === 'PATCH' && match_route('/admin/orders/{id}', $route, $params)) {
  require_admin($pdo);
  $status = (string)(body()['status'] ?? '');
  if (!in_array($status, ORDER_STATUSES, true)) json_error('Érvénytelen státusz.', 400);
  $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
  $stmt->execute([$status, $params[0]]);
  if ($stmt->rowCount() === 0) {
    $chk = $pdo->prepare("SELECT id FROM orders WHERE id = ?"); $chk->execute([$params[0]]);
    if (!$chk->fetch()) json_error('A rendelés nem található.', 404);
  }
  $row = $pdo->prepare("SELECT * FROM orders WHERE id = ?"); $row->execute([$params[0]]);
  json_out(['ok' => true, 'order' => map_order($pdo, $row->fetch())]);
}

/* ---- vásárlók ---- */
if ($method === 'GET' && $route === '/admin/customers') {
  require_admin($pdo);
  json_out(['customers' => list_customers($pdo)]);
}

/* ---- kuponok ---- */
if ($method === 'GET' && $route === '/admin/coupons') {
  require_admin($pdo);
  json_out(['coupons' => list_coupons($pdo)]);
}
if ($method === 'POST' && $route === '/admin/coupons') {
  require_admin($pdo);
  $res = save_coupon($pdo, body());
  if (isset($res['error'])) json_error($res['error'], 400);
  json_out($res);
}
if ($method === 'DELETE' && match_route('/admin/coupons/{code}', $route, $params)) {
  require_admin($pdo);
  json_out(delete_coupon($pdo, $params[0]));
}
// publikus: kupon ellenőrzése a pénztárban (a backend a hiteles forrás a rendeléskor is)
if ($method === 'POST' && $route === '/coupon/validate') {
  $b = body();
  $res = validate_coupon($pdo, (string)($b['code'] ?? ''), (int)round((float)($b['subtotal'] ?? 0)));
  if (isset($res['error'])) json_error($res['error'], 400);
  json_out($res);
}

/* ---- hírek ---- */
if ($method === 'POST' && $route === '/admin/news') {
  require_admin($pdo);
  $b = body();
  $title = trim((string)($b['title'] ?? ''));
  if ($title === '') json_error('A cím megadása kötelező.', 400);
  $id = 'n' . uniqid();
  $stmt = $pdo->prepare("INSERT INTO news (id,title,body,`date`,created_at) VALUES (?,?,?,?,?)");
  $stmt->execute([
    $id, mb_substr($title, 0, 200), mb_substr((string)($b['body'] ?? ''), 0, 4000),
    mb_substr((string)($b['date'] ?? date('Y-m-d')), 0, 30), date('Y-m-d H:i:s'),
  ]);
  $row = $pdo->prepare("SELECT * FROM news WHERE id = ?"); $row->execute([$id]);
  json_out(map_news($row->fetch()), 201);
}
if ($method === 'PUT' && match_route('/admin/news/{id}', $route, $params)) {
  require_admin($pdo);
  $b = body();
  $title = trim((string)($b['title'] ?? ''));
  if ($title === '') json_error('A cím megadása kötelező.', 400);
  $chk = $pdo->prepare("SELECT id FROM news WHERE id = ?"); $chk->execute([$params[0]]);
  if (!$chk->fetch()) json_error('A hír nem található.', 404);
  $stmt = $pdo->prepare("UPDATE news SET title = ?, body = ?, `date` = ? WHERE id = ?");
  $stmt->execute([mb_substr($title, 0, 200), mb_substr((string)($b['body'] ?? ''), 0, 4000), mb_substr((string)($b['date'] ?? date('Y-m-d')), 0, 30), $params[0]]);
  $row = $pdo->prepare("SELECT * FROM news WHERE id = ?"); $row->execute([$params[0]]);
  json_out(map_news($row->fetch()));
}
if ($method === 'DELETE' && match_route('/admin/news/{id}', $route, $params)) {
  require_admin($pdo);
  $stmt = $pdo->prepare("DELETE FROM news WHERE id = ?"); $stmt->execute([$params[0]]);
  json_out(['ok' => $stmt->rowCount() > 0]);
}

/* ---- referenciák ---- */
if ($method === 'POST' && $route === '/admin/references') {
  require_admin($pdo);
  $b = body();
  if (trim((string)($b['title'] ?? '')) === '') json_error('A cím megadása kötelező.', 400);
  $id = insert_reference($pdo, $b, (int)$pdo->query("SELECT COUNT(*) c FROM refs")->fetch()['c']);
  $row = $pdo->prepare("SELECT * FROM refs WHERE id = ?"); $row->execute([$id]);
  json_out(map_reference($row->fetch()), 201);
}
if ($method === 'PUT' && match_route('/admin/references/{id}', $route, $params)) {
  require_admin($pdo);
  $b = body();
  if (trim((string)($b['title'] ?? '')) === '') json_error('A cím megadása kötelező.', 400);
  $chk = $pdo->prepare("SELECT id FROM refs WHERE id = ?"); $chk->execute([$params[0]]);
  if (!$chk->fetch()) json_error('A referencia nem található.', 404);
  $stmt = $pdo->prepare("UPDATE refs SET tag=?, title=?, description=?, details=?, info=?, url=?, gold=?, is_new=? WHERE id=?");
  $stmt->execute([
    mb_substr((string)($b['tag'] ?? ''), 0, 60),
    mb_substr((string)($b['title'] ?? ''), 0, 160),
    mb_substr((string)($b['description'] ?? ''), 0, 600),
    mb_substr((string)($b['details'] ?? ''), 0, 2000),
    mb_substr((string)($b['info'] ?? ''), 0, 160),
    clean_url($b['url'] ?? ''),
    !empty($b['gold']) ? 1 : 0,
    !empty($b['new']) ? 1 : 0,
    $params[0],
  ]);
  $row = $pdo->prepare("SELECT * FROM refs WHERE id = ?"); $row->execute([$params[0]]);
  json_out(map_reference($row->fetch()));
}
if ($method === 'DELETE' && match_route('/admin/references/{id}', $route, $params)) {
  require_admin($pdo);
  $stmt = $pdo->prepare("DELETE FROM refs WHERE id = ?"); $stmt->execute([$params[0]]);
  json_out(['ok' => $stmt->rowCount() > 0]);
}

/* ---- üzenetek / leadek ---- */
if ($method === 'GET' && $route === '/admin/messages') {
  require_admin($pdo);
  json_out(['statuses' => MESSAGE_STATUSES, 'messages' => get_messages($pdo)]);
}
if ($method === 'PATCH' && match_route('/admin/messages/{id}', $route, $params)) {
  require_admin($pdo);
  $status = (string)(body()['status'] ?? '');
  if (!in_array($status, MESSAGE_STATUSES, true)) json_error('Érvénytelen státusz.', 400);
  $stmt = $pdo->prepare("UPDATE messages SET status = ? WHERE id = ?"); $stmt->execute([$status, $params[0]]);
  json_out(['ok' => true]);
}
if ($method === 'DELETE' && match_route('/admin/messages/{id}', $route, $params)) {
  require_admin($pdo);
  $stmt = $pdo->prepare("DELETE FROM messages WHERE id = ?"); $stmt->execute([$params[0]]);
  json_out(['ok' => $stmt->rowCount() > 0]);
}

/* ---- GYIK ---- */
if ($method === 'POST' && $route === '/admin/faq') {
  require_admin($pdo);
  $b = body();
  if (trim((string)($b['question'] ?? '')) === '') json_error('A kérdés megadása kötelező.', 400);
  $id = insert_faq($pdo, $b, (int)$pdo->query("SELECT COUNT(*) c FROM faq")->fetch()['c']);
  $row = $pdo->prepare("SELECT * FROM faq WHERE id = ?"); $row->execute([$id]);
  json_out(map_faq($row->fetch()), 201);
}
if ($method === 'PUT' && match_route('/admin/faq/{id}', $route, $params)) {
  require_admin($pdo);
  $b = body();
  if (trim((string)($b['question'] ?? '')) === '') json_error('A kérdés megadása kötelező.', 400);
  $chk = $pdo->prepare("SELECT id FROM faq WHERE id = ?"); $chk->execute([$params[0]]);
  if (!$chk->fetch()) json_error('A kérdés nem található.', 404);
  $stmt = $pdo->prepare("UPDATE faq SET question = ?, answer = ? WHERE id = ?");
  $stmt->execute([mb_substr((string)$b['question'], 0, 300), mb_substr((string)($b['answer'] ?? ''), 0, 4000), $params[0]]);
  $row = $pdo->prepare("SELECT * FROM faq WHERE id = ?"); $row->execute([$params[0]]);
  json_out(map_faq($row->fetch()));
}
if ($method === 'DELETE' && match_route('/admin/faq/{id}', $route, $params)) {
  require_admin($pdo);
  $stmt = $pdo->prepare("DELETE FROM faq WHERE id = ?"); $stmt->execute([$params[0]]);
  json_out(['ok' => $stmt->rowCount() > 0]);
}

/* ---- support ticketek (admin) ---- */
if ($method === 'GET' && $route === '/admin/tickets') {
  require_admin($pdo);
  $rows = $pdo->query("SELECT * FROM tickets ORDER BY updated_at DESC")->fetchAll();
  json_out(['statuses' => TICKET_STATUSES, 'tickets' => array_map('map_ticket', $rows)]);
}
if ($method === 'GET' && match_route('/admin/tickets/{id}', $route, $params)) {
  require_admin($pdo);
  $row = $pdo->prepare("SELECT * FROM tickets WHERE id = ?"); $row->execute([$params[0]]);
  $t = $row->fetch();
  if (!$t) json_error('A ticket nem található.', 404);
  $out = map_ticket($t); $out['messages'] = ticket_messages($pdo, $t['id']);
  json_out($out);
}
if ($method === 'POST' && match_route('/admin/tickets/{id}/reply', $route, $params)) {
  require_admin($pdo);
  $b = body();
  $chk = $pdo->prepare("SELECT id FROM tickets WHERE id = ?"); $chk->execute([$params[0]]);
  if (!$chk->fetch()) json_error('A ticket nem található.', 404);
  $r = add_ticket_message($pdo, $params[0], 'admin', $b['body'] ?? '', $b['status'] ?? null);
  if (isset($r['error'])) json_error($r['error'], 400);
  json_out(['ok' => true]);
}
if ($method === 'PATCH' && match_route('/admin/tickets/{id}', $route, $params)) {
  require_admin($pdo);
  $status = (string)(body()['status'] ?? '');
  if (!in_array($status, TICKET_STATUSES, true)) json_error('Érvénytelen státusz.', 400);
  $stmt = $pdo->prepare("UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?");
  $stmt->execute([$status, date('Y-m-d H:i:s'), $params[0]]);
  json_out(['ok' => true]);
}

/* ---- képfeltöltés ---- */
if ($method === 'POST' && $route === '/admin/upload') {
  require_admin($pdo);
  $r = save_data_url(body()['data'] ?? null);
  if (isset($r['error'])) json_error($r['error'], 400);
  json_out(['ok' => true, 'url' => $r['url']], 201);
}

/* ============================================================
   VÁSÁRLÓI FIÓK
   ============================================================ */
if ($method === 'POST' && $route === '/account/register') {
  $b = body();
  $name = trim((string)($b['name'] ?? ''));
  $email = trim((string)($b['email'] ?? ''));
  $pass = (string)($b['pass'] ?? '');
  if ($name === '') json_error('A név megadása kötelező.', 400);
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Érvénytelen e-mail cím.', 400);
  if (strlen($pass) < 6) json_error('A jelszó legalább 6 karakter legyen.', 400);
  $chk = $pdo->prepare("SELECT id FROM users WHERE email = ?"); $chk->execute([mb_strtolower($email)]);
  if ($chk->fetch()) json_error('Ezzel az e-mail címmel már van fiók.', 400);
  $id = 'u' . uniqid();
  $stmt = $pdo->prepare("INSERT INTO users (id,name,email,hash,created_at) VALUES (?,?,?,?,?)");
  $stmt->execute([$id, mb_substr($name, 0, 120), mb_strtolower(mb_substr($email, 0, 190)), password_hash($pass, PASSWORD_DEFAULT), date('Y-m-d H:i:s')]);
  session_regenerate_id(true); // session fixation védelem
  $_SESSION['uid'] = $id;
  $lemail = mb_strtolower($email);
  json_out(['ok' => true, 'user' => ['id' => $id, 'name' => $name, 'email' => $lemail, 'isAdmin' => is_admin_email($lemail)]], 201);
}
if ($method === 'POST' && $route === '/account/login') {
  $b = body();
  $email = mb_strtolower(trim((string)($b['email'] ?? '')));
  $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?"); $stmt->execute([$email]);
  $u = $stmt->fetch();
  if (!$u || !password_verify((string)($b['pass'] ?? ''), $u['hash'])) json_error('Hibás e-mail cím vagy jelszó.', 401);
  session_regenerate_id(true); // session fixation védelem
  $_SESSION['uid'] = $u['id'];
  set_remember(!empty($b['remember']));   // "Maradjak bejelentkezve"
  json_out(['ok' => true, 'user' => ['id' => $u['id'], 'name' => $u['name'], 'email' => $u['email'], 'isAdmin' => is_admin_email($u['email'])]]);
}
if ($method === 'POST' && $route === '/account/logout') {
  unset($_SESSION['uid']);
  set_remember(false);
  json_out(['ok' => true]);
}
if ($method === 'GET' && $route === '/account/me') {
  $u = current_customer($pdo);
  if (!$u) json_out(['authenticated' => false], 401);
  json_out(['authenticated' => true, 'user' => $u]);
}
if ($method === 'GET' && $route === '/account/orders') {
  $u = current_customer($pdo);
  if (!$u) json_error('Bejelentkezés szükséges.', 401);
  $stmt = $pdo->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
  $stmt->execute([$u['id']]);
  json_out(array_map(function ($r) use ($pdo) { return map_order($pdo, $r); }, $stmt->fetchAll()));
}

/* ---- support ticketek (vásárló) ---- */
if ($method === 'GET' && $route === '/account/tickets') {
  $u = current_customer($pdo);
  if (!$u) json_error('Bejelentkezés szükséges.', 401);
  $stmt = $pdo->prepare("SELECT * FROM tickets WHERE user_id = ? ORDER BY updated_at DESC");
  $stmt->execute([$u['id']]);
  json_out(['statuses' => TICKET_STATUSES, 'tickets' => array_map('map_ticket', $stmt->fetchAll())]);
}
if ($method === 'POST' && $route === '/account/tickets') {
  $u = current_customer($pdo);
  if (!$u) json_error('Bejelentkezés szükséges.', 401);
  $b = body();
  $r = create_ticket($pdo, $u['id'], $b['subject'] ?? '', $b['body'] ?? '');
  if (isset($r['error'])) json_error($r['error'], 400);
  json_out(['ok' => true, 'id' => $r['id']], 201);
}
if ($method === 'GET' && match_route('/account/tickets/{id}', $route, $params)) {
  $u = current_customer($pdo);
  if (!$u) json_error('Bejelentkezés szükséges.', 401);
  $row = $pdo->prepare("SELECT * FROM tickets WHERE id = ? AND user_id = ?"); $row->execute([$params[0], $u['id']]);
  $t = $row->fetch();
  if (!$t) json_error('A ticket nem található.', 404);
  $out = map_ticket($t); $out['messages'] = ticket_messages($pdo, $t['id']);
  json_out($out);
}
if ($method === 'POST' && match_route('/account/tickets/{id}/reply', $route, $params)) {
  $u = current_customer($pdo);
  if (!$u) json_error('Bejelentkezés szükséges.', 401);
  $row = $pdo->prepare("SELECT id FROM tickets WHERE id = ? AND user_id = ?"); $row->execute([$params[0], $u['id']]);
  if (!$row->fetch()) json_error('A ticket nem található.', 404);
  $r = add_ticket_message($pdo, $params[0], 'customer', body()['body'] ?? '');
  if (isset($r['error'])) json_error($r['error'], 400);
  json_out(['ok' => true]);
}

/* ---- nincs ilyen útvonal ---- */
json_error('Ismeretlen API végpont: ' . $route, 404);
