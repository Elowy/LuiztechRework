#!/usr/bin/env python3
"""i18n audit — list user-visible Hungarian strings on the public pages that
have no English translation in assets/js/i18n.js (DICT / REGEX / PREFIX).

Usage:
    python3 tools/i18n-audit.py [file.html ...]

With no arguments it scans the standard public pages. Strings that are
intentionally left in Hungarian (proper names, addresses, statute references,
page <title>s) will still show up here — use human judgement; the script does
not fail the build.
"""
import re
import sys
import os
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_FILES = ['index.html', 'webshop.html', 'impresszum.html',
                 'aszf.html', 'adatkezeles.html']

js = open(os.path.join(ROOT, 'assets/js/i18n.js'), encoding='utf-8').read()

# --- DICT keys (HU side) ---
mblock = re.search(r'var DICT = \{(.*?)\n  \};', js, re.S)
dictblock = mblock.group(1) if mblock else js
keys = set()
for m in re.finditer(r"'((?:[^'\\]|\\.)*)'\s*:", dictblock):
    k = m.group(1).replace("\\'", "'").replace('\\\\', '\\')
    keys.add(re.sub(r'\s+', ' ', k).strip())

# --- REGEX rules ---
regexes = []
mre = re.search(r'var REGEX = \[(.*?)\];', js, re.S)
if mre:
    for m in re.finditer(r'\[/(.*?)/,', mre.group(1)):
        try:
            regexes.append(re.compile(m.group(1)))
        except re.error:
            pass

# --- PREFIX rules ---
prefixes = []
mpf = re.search(r'var PREFIX = \[(.*?)\];', js, re.S)
if mpf:
    for m in re.finditer(r"\['((?:[^'\\]|\\.)*)'", mpf.group(1)):
        prefixes.append(re.sub(r'\s+', ' ', m.group(1)).strip())


def covered(s):
    n = re.sub(r'\s+', ' ', s).strip()
    if not n:
        return True
    if n in keys:
        return True
    if any(r.search(n) for r in regexes):
        return True
    if any(n.startswith(p) for p in prefixes):
        return True
    return False


HU = re.compile(r'[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]')
HUWORDS = re.compile(r'\b(és|vagy|nem|igen|már|még|ingyen|rendelés|kosár|'
                     r'termék|kérj|hogy|amely|minden|elérhető|kész|napos|'
                     r'gyors|valódi|fizetés)\b', re.I)


class P(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip = 0
        self.out = []

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.skip += 1
        for a, v in attrs:
            if a in ('placeholder', 'aria-label', 'title', 'data-more') and v:
                t = v.strip()
                if t and (HU.search(t) or HUWORDS.search(t)) and not covered(t):
                    self.out.append(('@' + a, re.sub(r'\s+', ' ', t)))

    def handle_endtag(self, tag):
        if tag in ('script', 'style') and self.skip > 0:
            self.skip -= 1

    def handle_data(self, data):
        if self.skip:
            return
        t = data.strip()
        if t and (HU.search(t) or HUWORDS.search(t)) and not covered(t):
            self.out.append(('text', re.sub(r'\s+', ' ', t)))


def main():
    files = sys.argv[1:] or DEFAULT_FILES
    total = 0
    for f in files:
        path = f if os.path.isabs(f) else os.path.join(ROOT, f)
        p = P()
        try:
            p.feed(open(path, encoding='utf-8').read())
        except OSError as e:
            print('ERR %s: %s' % (f, e))
            continue
        seen = set()
        rows = []
        for kind, t in p.out:
            if (kind, t) in seen:
                continue
            seen.add((kind, t))
            rows.append((kind, t))
        if rows:
            print('\n=== %s ===' % f)
            for kind, t in rows:
                print('  [%s] %s' % (kind, t[:140]))
            total += len(rows)
    print('\n[DICT keys: %d, REGEX: %d, PREFIX: %d | untranslated found: %d]'
          % (len(keys), len(regexes), len(prefixes), total))


if __name__ == '__main__':
    main()
