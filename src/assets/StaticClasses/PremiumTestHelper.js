import { UserData } from './AppData';
import { setIsServerAvailable, setPremium, setValidation } from './HabitsBus';

const TEST_PREMIUM_STORAGE_KEY = 'uml_test_premium';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

function isLocalRuntime() {
  if (typeof window === 'undefined') return false;
  return LOCAL_HOSTS.has(window.location.hostname) || window.location.protocol === 'file:';
}

export function isLocalTestPremiumEnabled() {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  const requestedByUrl = params.get('testPremium') === '1';
  const savedLocalFlag = window.localStorage.getItem(TEST_PREMIUM_STORAGE_KEY) === '1';
  const isDevRuntime = Boolean(import.meta.env?.DEV);

  if (requestedByUrl && isLocalRuntime()) {
    window.localStorage.setItem(TEST_PREMIUM_STORAGE_KEY, '1');
  }

  return isDevRuntime || (isLocalRuntime() && (requestedByUrl || savedLocalFlag));
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
