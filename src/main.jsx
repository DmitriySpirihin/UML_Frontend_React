import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import WebApp from '@twa-dev/sdk';
import './Analitics';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { applyPerformanceClasses } from './assets/StaticClasses/PerformanceMode';

WebApp?.ready?.();

const manifestUrl = 'https://dmitriyspirihin.github.io/UML_Frontend_React/tonconnect-manifest.json';
const walletsListSource = `${import.meta.env.BASE_URL}wallets.json`;
const cacheRescueVersion = 'section-streak-visit-fallback-20260626-2248';

if (typeof window !== 'undefined') {
  applyPerformanceClasses();

  const reloadFreshApp = (reason) => {
    if (window.__umlReloadingFreshApp) return;
    window.__umlReloadingFreshApp = true;
    const url = new URL(window.location.href);
    url.searchParams.set('v', cacheRescueVersion);
    url.searchParams.set('cache_rescue', reason);
    window.location.replace(url.toString());
  };

  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    reloadFreshApp('vite-preload');
  });

  window.addEventListener('unhandledrejection', (event) => {
    const message = String(event.reason?.message || event.reason || '');
    if (/dynamically imported module|module script failed|Importing a module script failed|Load failed/i.test(message)) {
      event.preventDefault();
      reloadFreshApp('dynamic-import');
    }
  });
}

// ------------------------------------------------------
// 3. INITIALIZE APP
// ------------------------------------------------------
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      walletsListConfiguration={{
        includeWallets: [],
        walletsListSource
      }}
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/UltyMyLife_bot/umlminiapp'
      }}
    >
      <App />
    </TonConnectUIProvider>
  </StrictMode>,
);
