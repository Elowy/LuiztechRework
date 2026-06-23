---
description: Lint PHP + JS and run the i18n translation audit (pre-push gate)
---
Run the project's pre-push checks and report a concise pass/fail for each:

1. **PHP lint:** `php -l api/lib.php && php -l api/index.php`
2. **JS syntax:** run `node --check` on every file under `assets/js/`
3. **i18n audit:** `python3 tools/i18n-audit.py`

For the i18n audit, only flag genuinely missing translations. Ignore entries
that are intentionally Hungarian — proper names (e.g. "Tóth Levente István
e.v."), addresses, statute references (e.g. "45/2014. (II. 26.) Korm.
rendelet"), and page `<title>` text. Report the final result clearly.
