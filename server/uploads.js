/* ============================================================
   Image upload handling.
   Accepts a base64 data-URL (via JSON), validates the mime type
   and size, then writes the file to data/uploads/ and returns
   a public URL. No external dependency (no multipart parser).
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

// SVG is intentionally excluded (can carry active content).
const MIME_EXT = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif'
};
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

function ensureDir() { if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true }); }

function saveDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') return { error: 'Hiányzó kép.' };
  const m = /^data:([a-z0-9/+.-]+);base64,(.+)$/i.exec(dataUrl.trim());
  if (!m) return { error: 'Érvénytelen képformátum.' };
  const mime = m[1].toLowerCase();
  const ext = MIME_EXT[mime];
  if (!ext) return { error: 'Nem támogatott formátum (PNG, JPG, WEBP vagy GIF engedélyezett).' };

  let buf;
  try { buf = Buffer.from(m[2], 'base64'); } catch (e) { return { error: 'A kép feldolgozása sikertelen.' }; }
  if (!buf.length) return { error: 'Üres fájl.' };
  if (buf.length > MAX_BYTES) return { error: 'A kép túl nagy (max. 4 MB).' };

  ensureDir();
  const name = crypto.randomBytes(10).toString('hex') + '.' + ext;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
  return { url: '/uploads/' + name, mime: mime, size: buf.length };
}

module.exports = { saveDataUrl, UPLOAD_DIR, MAX_BYTES };
