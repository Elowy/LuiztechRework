# Luiz-Tech webshop — project guide

Customizable e-commerce site for a Hungarian sole trader. Static frontend +
small PHP API, deployed automatically via GitHub Actions on push.

## Stack & layout
- **Frontend:** static `*.html` pages, `assets/css/*.css`, `assets/js/*.js`.
  No build step — files are served as-is.
- **Backend:** `api/index.php` (request router) + `api/lib.php` (logic, config,
  DB schema). MySQL.
- **Pages:** `index.html` (landing), `webshop.html` (shop), `admin.html` (admin
  panel), `impresszum.html` / `aszf.html` / `adatkezeles.html` (legal).
- **Deploy:** push to the working branch → `.github/workflows/deploy.yml` runs.
  Only push to the assigned working branch.

## Conventions (read before editing)

### Cache-busting — always bump after asset edits
Every HTML page references CSS/JS with `?v=NN`. After changing **any** file in
`assets/`, bump the version on **all** pages so browsers reload it:
```
bash tools/bump-version.sh
```
All `?v=` references must stay on the same number.

### Linting (also enforced by a PostToolUse hook)
- JS: `node --check assets/js/<file>.js`
- PHP: `php -l api/<file>.php`

Run `/check` (or `python3 tools/i18n-audit.py`) before pushing.

### i18n (Hungarian default, English toggle)
`assets/js/i18n.js` holds `DICT` (HU → EN), plus `REGEX`/`PREFIX` rules. When you
add any user-visible Hungarian text to a page, add a matching English entry to
`DICT`. **Leave untranslated** (do not add entries): proper names, addresses,
statute references, and page `<title>`s — these stay Hungarian by design.
`tools/i18n-audit.py` lists strings that lack a translation.

### Config & secrets (`api/lib.php`)
- `DEFAULT_CONFIG` — all config keys + defaults.
- `ALLOWED_CONFIG` — keys the admin may edit.
- `SECRET_CONFIG` (Stripe / Számlázz keys) — **never** sent to the public
  `/shop` endpoint; only a `<key>Set` boolean is exposed. Don't break this.

Admin settings flow through three places that must stay in sync:
`admin.html` (field) → `assets/js/admin.js` (hydrate + save + dirty-tracking).

### Analytics
GA4 Measurement ID lives in config (`gaMeasurementId`); `assets/js/main.js`
loads `gtag.js` only after the visitor consents to statistics cookies.
