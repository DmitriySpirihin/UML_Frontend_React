export function shouldUsePerformanceLiteMode() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const platform = window.Telegram?.WebApp?.platform || '';
  const userAgent = navigator.userAgent || '';
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const viewportWidth = window.visualViewport?.width || window.innerWidth || 0;
  const coarsePointer = typeof window.matchMedia === 'function'
    ? window.matchMedia('(pointer: coarse)').matches
    : false;
  const iPadDesktopMode = /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
  const mobileOrTabletUA = /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(userAgent) || iPadDesktopMode;
  const telegramMobile = platform === 'android' || platform === 'ios';
  const constrainedViewport = viewportWidth > 0 && viewportWidth <= 1180;
  const limitedMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;

  return telegramMobile || mobileOrTabletUA || (coarsePointer && constrainedViewport) || limitedMemory;
}
