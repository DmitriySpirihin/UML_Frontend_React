const MANIFEST_KEY = 'umlCloudBackupManifestV1';
const CHUNK_KEY_PREFIX = 'umlCloudBackupChunkV1_';
const LEGACY_CHUNK_KEY_PREFIX = 'umlCloudBackupChunkV1:';
const CHUNK_SIZE = 3000;
const MAX_CHUNKS = 900;
const CLOUD_STORAGE_TIMEOUT_MS = 4500;

function getTelegramCloudStorage() {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp?.CloudStorage : null;
}

function withTimeout(work, fallback) {
  return new Promise((resolve) => {
    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve(fallback);
    }, CLOUD_STORAGE_TIMEOUT_MS);

    work((value) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(value);
    });
  });
}

function getItem(key) {
  const cloudStorage = getTelegramCloudStorage();
  if (!cloudStorage?.getItem) return Promise.resolve('');

  return withTimeout((done) => {
    try {
      cloudStorage.getItem(key, (error, value) => {
        done(error ? '' : (value || ''));
      });
    } catch {
      done('');
    }
  }, '');
}

function setItem(key, value) {
  const cloudStorage = getTelegramCloudStorage();
  if (!cloudStorage?.setItem) return Promise.resolve(false);

  return withTimeout((done) => {
    try {
      cloudStorage.setItem(key, value, (error, success) => {
        done(!error && success !== false);
      });
    } catch {
      done(false);
    }
  }, false);
}

function removeItem(key) {
  const cloudStorage = getTelegramCloudStorage();
  if (!cloudStorage?.removeItem) return Promise.resolve(false);

  return withTimeout((done) => {
    try {
      cloudStorage.removeItem(key, (error, success) => {
        done(!error && success !== false);
      });
    } catch {
      done(false);
    }
  }, false);
}

function parseManifest(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (!parsed || parsed.v !== 1 || !Number.isFinite(Number(parsed.chunkCount))) return null;
    return {
      ...parsed,
      chunkCount: Number(parsed.chunkCount),
      clientUpdatedAt: Number(parsed.clientUpdatedAt) || 0
    };
  } catch {
    return null;
  }
}

function splitChunks(value) {
  const chunks = [];
  for (let index = 0; index < value.length; index += CHUNK_SIZE) {
    chunks.push(value.slice(index, index + CHUNK_SIZE));
  }
  return chunks;
}

export function hasTelegramCloudBackupStorage() {
  const cloudStorage = getTelegramCloudStorage();
  return !!(cloudStorage?.getItem && cloudStorage?.setItem);
}

export async function saveTelegramCloudBackup(content, clientUpdatedAt = Date.now()) {
  if (!hasTelegramCloudBackupStorage() || typeof content !== 'string' || !content) {
    return { saved: false, unavailable: true };
  }

  const oldManifest = parseManifest(await getItem(MANIFEST_KEY));
  const nextClientUpdatedAt = Number(clientUpdatedAt) || Date.now();
  if (oldManifest?.clientUpdatedAt && oldManifest.clientUpdatedAt > nextClientUpdatedAt) {
    return { saved: false, conflict: true };
  }

  const chunks = splitChunks(content);
  if (chunks.length > MAX_CHUNKS) {
    return { saved: false, tooLarge: true };
  }

  for (let index = 0; index < chunks.length; index += 1) {
    const ok = await setItem(`${CHUNK_KEY_PREFIX}${index}`, chunks[index]);
    if (!ok) return { saved: false, writeFailed: true };
  }

  const manifest = {
    v: 1,
    chunkCount: chunks.length,
    clientUpdatedAt: nextClientUpdatedAt,
    updatedAt: Date.now(),
    length: content.length
  };

  const manifestOk = await setItem(MANIFEST_KEY, JSON.stringify(manifest));
  if (!manifestOk) return { saved: false, writeFailed: true };

  const oldCount = oldManifest?.chunkCount || 0;
  for (let index = chunks.length; index < oldCount; index += 1) {
    await removeItem(`${CHUNK_KEY_PREFIX}${index}`);
    await removeItem(`${LEGACY_CHUNK_KEY_PREFIX}${index}`);
  }

  return { saved: true, manifest };
}

export async function loadTelegramCloudBackup() {
  if (!hasTelegramCloudBackupStorage()) return { success: false, unavailable: true };

  const manifest = parseManifest(await getItem(MANIFEST_KEY));
  if (!manifest || manifest.chunkCount < 1 || manifest.chunkCount > MAX_CHUNKS) {
    return { success: false, notFound: true };
  }

  const chunks = [];
  for (let index = 0; index < manifest.chunkCount; index += 1) {
    const chunk = await getItem(`${CHUNK_KEY_PREFIX}${index}`) || await getItem(`${LEGACY_CHUNK_KEY_PREFIX}${index}`);
    if (!chunk) return { success: false, corrupt: true };
    chunks.push(chunk);
  }

  const message = chunks.join('');
  if (manifest.length && message.length !== manifest.length) {
    return { success: false, corrupt: true };
  }

  return { success: true, message, manifest };
}

export async function deleteTelegramCloudBackup() {
  if (!hasTelegramCloudBackupStorage()) return false;

  const manifest = parseManifest(await getItem(MANIFEST_KEY));
  const chunkCount = Math.min(manifest?.chunkCount || 0, MAX_CHUNKS);
  for (let index = 0; index < chunkCount; index += 1) {
    await removeItem(`${CHUNK_KEY_PREFIX}${index}`);
    await removeItem(`${LEGACY_CHUNK_KEY_PREFIX}${index}`);
  }
  await removeItem(MANIFEST_KEY);
  return true;
}
