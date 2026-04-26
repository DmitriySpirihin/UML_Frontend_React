import { UserData } from './AppData';
import { setIsServerAvailable, setPremium, setValidation } from './HabitsBus';

const TEST_PREMIUM_STORAGE_KEY = 'uml_test_premium';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

function isLocalRuntime() {
  if (typeof window === 'undefined') return false;
  return LOCAL_HOSTS.has(window.location.hostname) || window.location.protocol === 'file:';
}

export function isLocalTestPremiumEnabled() {
  return getLocalTestPremiumOverride() === true;
}

export function getLocalTestPremiumOverride() {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const requestedMode = params.get('testPremium');

  if (isLocalRuntime() && (requestedMode === '1' || requestedMode === '0')) {
    window.localStorage.setItem(TEST_PREMIUM_STORAGE_KEY, requestedMode);
    return requestedMode === '1';
  }

  const savedLocalFlag = window.localStorage.getItem(TEST_PREMIUM_STORAGE_KEY);
  if (isLocalRuntime() && savedLocalFlag === '1') return true;
  if (isLocalRuntime() && savedLocalFlag === '0') return false;

  return null;
}

export function applyLocalTestPremium() {
  if (!isLocalTestPremiumEnabled()) return false;

  const premiumEndDate = new Date();
  premiumEndDate.setFullYear(premiumEndDate.getFullYear() + 1);

  UserData.hasPremium = true;
  UserData.premiumEndDate = premiumEndDate;
  UserData.isValidation = false;

  setPremium(true);
  setValidation(false);
  setIsServerAvailable(false);

  return true;
}

export function applyLocalNoPremium() {
  if (getLocalTestPremiumOverride() !== false) return false;

  UserData.hasPremium = false;
  UserData.premiumEndDate = null;
  UserData.isValidation = false;

  setPremium(false);
  setValidation(false);
  setIsServerAvailable(false);

  return true;
}
