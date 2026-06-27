const BASE_URL = import.meta.env.DEV ? '/api/notifications' : 'https://ultymylife.ru/api/notifications';
const FLUSH_MS = 5000;
const MAX_BATCH = 12;

let queue = [];
let timer = null;
let initialized = false;
let currentPage = 'LoadPanel';
let pageStartedAt = Date.now();

function getTelegramUser() {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;
}

function getUserId() {
  return String(getTelegramUser()?.id || '');
}

function getProfileMeta() {
  const user = getTelegramUser() || {};
  return {
    username: user.username || '',
    firstName: user.first_name || '',
    platform: window.Telegram?.WebApp?.platform || '',
    version: window.Telegram?.WebApp?.version || ''
  };
}

function shortText(value, max = 120) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

async function flush(useKeepalive = false) {
  if (!queue.length) return;
  const events = queue.splice(0, MAX_BATCH);
  const userId = getUserId();
  if (!userId) return;
  try {
    await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      keepalive: useKeepalive,
      body: JSON.stringify({ type: 'analyticsevent', message: '', userId, metadata: { events } })
    });
  } catch {
    queue = events.concat(queue).slice(0, MAX_BATCH * 3);
  }
}

function enqueue(event) {
  const userId = getUserId();
  if (!userId) return;
  queue.push({ ...event, userId, metadata: { ...getProfileMeta(), ...(event.metadata || {}) } });
  if (queue.length >= MAX_BATCH) flush();
  else if (!timer) timer = window.setTimeout(() => { timer = null; flush(); }, FLUSH_MS);
}

export class AnalyticsManager {
  static init() {
    if (initialized || typeof window === 'undefined') return;
    initialized = true;
    enqueue({ type: 'app_open', page: currentPage });
    document.addEventListener('click', (event) => {
      const el = event.target?.closest?.('button,a,[role="button"]');
      if (!el) return;
      const target = shortText(el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || el.tagName);
      enqueue({ type: 'click', page: currentPage, target });
    }, true);
    const close = () => {
      AnalyticsManager.trackPageTime('app_close');
      flush(true);
    };
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') close();
      else {
        pageStartedAt = Date.now();
        enqueue({ type: 'app_open', page: currentPage, metadata: { resume: true } });
      }
    });
    window.addEventListener('pagehide', close);
  }

  static trackPageChange(nextPage) {
    if (!nextPage || nextPage === currentPage) return;
    AnalyticsManager.trackPageTime('page_time');
    enqueue({ type: 'page_open', page: nextPage, target: currentPage });
    currentPage = nextPage;
    pageStartedAt = Date.now();
  }

  static trackPageTime(type = 'page_time') {
    const durationMs = Date.now() - pageStartedAt;
    if (durationMs < 500) return;
    enqueue({ type, page: currentPage, durationMs });
    pageStartedAt = Date.now();
  }
}
