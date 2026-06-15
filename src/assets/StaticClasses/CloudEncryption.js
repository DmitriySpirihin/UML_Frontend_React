const ENCRYPTED_BACKUP_PREFIX = 'UMLENC1.';
const KDF_ITERATIONS = 210000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(String(base64).replace(/\s/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function assertWebCrypto() {
  if (!globalThis.crypto?.subtle || typeof globalThis.crypto.getRandomValues !== 'function') {
    throw new Error('Secure browser crypto is unavailable');
  }
}

async function deriveAesKey(passphrase, salt) {
  assertWebCrypto();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: KDF_ITERATIONS,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export function isEncryptedCloudBackup(value) {
  return typeof value === 'string' && value.startsWith(ENCRYPTED_BACKUP_PREFIX);
}

export async function encryptCloudBackup(plainText, passphrase) {
  if (!passphrase || passphrase.length < 12) {
    throw new Error('Encryption password must be at least 12 characters');
  }

  assertWebCrypto();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveAesKey(passphrase, salt);
  const cipherBytes = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plainText)
  ));

  const envelope = {
    v: 1,
    alg: 'AES-GCM',
    kdf: 'PBKDF2-SHA256',
    iterations: KDF_ITERATIONS,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bytesToBase64(cipherBytes)
  };

  return ENCRYPTED_BACKUP_PREFIX + bytesToBase64(encoder.encode(JSON.stringify(envelope)));
}

export async function decryptCloudBackup(encryptedBackup, passphrase) {
  if (!isEncryptedCloudBackup(encryptedBackup)) {
    throw new Error('Backup is not encrypted');
  }
  if (!passphrase) {
    throw new Error('Encryption password is required');
  }

  const encodedEnvelope = encryptedBackup.slice(ENCRYPTED_BACKUP_PREFIX.length);
  const envelope = JSON.parse(decoder.decode(base64ToBytes(encodedEnvelope)));
  const salt = base64ToBytes(envelope.salt);
  const iv = base64ToBytes(envelope.iv);
  const cipherBytes = base64ToBytes(envelope.data);
  const key = await deriveAesKey(passphrase, salt);
  const plainBytes = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipherBytes
  );

  return decoder.decode(plainBytes);
}
