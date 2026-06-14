/* ============================================================
   Auth helpers — password hashing (scrypt) + signed tokens.
   Uses only Node's built-in crypto (no external dependencies).
   ============================================================ */
'use strict';
const crypto = require('crypto');

const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function hashPassword(password, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, expectedHash) {
  if (!salt || !expectedHash) return false;
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  const a = Buffer.from(hash);
  const b = Buffer.from(expectedHash);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function signToken(payload, secret, ttlMs) {
  const body = Object.assign({}, payload, { exp: Date.now() + (ttlMs || TOKEN_TTL_MS) });
  const data = Buffer.from(JSON.stringify(body)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return data + '.' + sig;
}

function verifyToken(token, secret) {
  if (!token || token.indexOf('.') < 0) return null;
  const parts = token.split('.');
  const data = parts[0], sig = parts[1];
  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const body = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (body.exp && Date.now() > body.exp) return null;
    return body;
  } catch (e) {
    return null;
  }
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken, TOKEN_TTL_MS };
