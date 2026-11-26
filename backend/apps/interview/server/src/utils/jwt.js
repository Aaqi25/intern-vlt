import crypto from 'crypto';

const toBase64Url = (input) =>
  Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const fromBase64Url = (input) => {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  return Buffer.from(padded + '='.repeat(padLen), 'base64').toString('utf-8');
};

/**
 * Sign an HS256 JWT using Node's built-in crypto module.
 */
export const signJwt = (payload, secret, expiresInSeconds = 86400) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const claims = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };
  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(claims));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = toBase64Url(
    crypto.createHmac('sha256', secret).update(signingInput).digest()
  );
  return `${signingInput}.${signature}`;
};

/**
 * Verify an HS256 JWT and return its decoded claims, or null if invalid/expired.
 */
export const verifyJwt = (token, secret) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSig] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSig = toBase64Url(
    crypto.createHmac('sha256', secret).update(signingInput).digest()
  );

  const sigBuf = Buffer.from(encodedSig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const header = JSON.parse(fromBase64Url(encodedHeader));
    if (header.alg !== 'HS256') return null;
    const payload = JSON.parse(fromBase64Url(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === 'number' && payload.exp < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

/**
 * Hash a password with a per-user random salt using scrypt.
 */
export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
};

/**
 * Verify a password against a stored scrypt hash.
 */
export const verifyPassword = (password, storedHash) => {
  if (!password || !storedHash || typeof storedHash !== 'string') return false;
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, hashHex] = parts;
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(hashHex, 'hex');
    return derived.length === storedBuf.length && crypto.timingSafeEqual(derived, storedBuf);
  } catch {
    return false;
  }
};
