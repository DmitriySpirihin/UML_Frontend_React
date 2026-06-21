export function getDevicePerformanceProfile() {
  const fallbackProfile = {
    performanceLite: false,
    androidLite: false,
    tabletLite: false,
  };

  if (typeof window === 'undefined' || typeof navigator === 'undefined') return fallbackProfile;

  const platform = window.Telegram?.WebApp?.platform || '';
  const userAgent = navigator.userAgent || '';
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const viewportWidth = window.visualViewport?.width || window.innerWidth || 0;
  const viewportHeight = window.visualViewport?.height || window.innerHeight || 0;
  const coarsePointer = typeof window.matchMedia === 'function'
    ? window.matchMedia('(pointer: coarse)').matches
    : false;

  const android = platform === 'android' || /Android/i.test(userAgent);
  const iphone = /iPhone|iPod/i.test(userAgent);
  const iPadDesktopMode = /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
  const ipad = /iPad/i.test(userAgent) || iPadDesktopMode;
  const tabletUA = /Tablet/i.test(userAgent) || (android && !/Mobile/i.test(userAgent));
  const shortSide = Math.min(viewportWidth || 0, viewportHeight || 0);
  const longSide = Math.max(viewportWidth || 0, viewportHeight || 0);
  const touchTablet = coarsePointer && shortSide >= 600 && longSide >= 900;
  const tablet = ipad || tabletUA || touchTablet;
  const limitedMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
  const androidLite = android || (limitedMemory && !iphone);
  const tabletLite = tablet && !iphone;
  const performanceLite = androidLite || tabletLite;

  return {
    performanceLite,
    androidLite,
    tabletLite,
  };
}

export function shouldUsePerformanceLiteMode() {
  return getDevicePerformanceProfile().performanceLite;
}

export function applyPerformanceClasses(root) {
  const profile = getDevicePerformanceProfile();
  const target = root || (typeof document !== 'undefined' ? document.documentElement : null);
  if (!target) return profile;

  target.classList.toggle('uml-performance-lite', profile.performanceLite);
  target.classList.toggle('uml-android-lite', profile.androidLite);
  target.classList.toggle('uml-tablet-lite', profile.tabletLite);

  return profile;
}
