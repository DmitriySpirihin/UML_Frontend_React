import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import WebApp from '@twa-dev/sdk';
import './Analitics';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

WebApp.ready();

const manifestUrl = 'https://dmitriyspirihin.github.io/UML_Frontend_React/tonconnect-manifest.json';

// ------------------------------------------------------
// 1. DEFINE THE BROKEN WALLETS TO EXCLUDE
// ------------------------------------------------------
const BROKEN_WALLETS = [
    'tokenpocket',          // Caused ERR_CERT_DATE_INVALID
    'binance-web3-wallet',  // Caused CORS errors
    'dewallet',             // Caused Timeout errors
    'bitgetWalletLite'      // Often buggy on mobile
];

// ------------------------------------------------------
// 2. FETCH & FILTER FUNCTION
// ------------------------------------------------------
async function getCleanWalletsSource() {
    try {
        // Fetch the official, up-to-date list from TON
        const response = await fetch('https://raw.githubusercontent.com/ton-connect/wallets-list/main/wallets.json');
        const wallets = await response.json();

        // Filter out the broken ones
        const cleanWallets = wallets.filter(wallet => !BROKEN_WALLETS.includes(wallet.app_name));
        
        console.log(`✅ Loaded ${cleanWallets.length} wallets (Excluded: ${BROKEN_WALLETS.join(', ')})`);

        // Convert to Data URI so the SDK treats it as a file
        return 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cleanWallets));
    } catch (e) {
        console.error('Failed to fetch official list, using fallback:', e);
        // Fallback: If GitHub is down, use a minimal safe list
        const safeFallback = [
            { app_name: "telegram-wallet", name: "Wallet", bridge: [{type:"sse", url:"https://bridge.tonapi.io/bridge"}], platforms: ["ios","android","macos","windows","linux"] },
            { app_name: "tonkeeper", name: "Tonkeeper", bridge: [{type:"js", key:"tonkeeper"}], platforms: ["ios","android","chrome","firefox"] }
        ];
        return 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(safeFallback));
    }
}

// ------------------------------------------------------
// 3. INITIALIZE APP
// ------------------------------------------------------
// We wrap the render in an async function to wait for the list
getCleanWalletsSource().then((cleanSource) => {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <TonConnectUIProvider 
            manifestUrl={manifestUrl}
            walletsListConfiguration={{
                includeWallets: [], // Use strictly our filtered source
                walletsListSource: cleanSource 
            }}
            actionsConfiguration={{
                twaReturnUrl: 'https://t.me/UltyMyLife_bot/umlminiapp'
            }}
        >
           <App />
        </TonConnectUIProvider>
      </StrictMode>,
    )
});