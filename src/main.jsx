import './nuke.js'; // Run the nuke script first
import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import WebApp from '@twa-dev/sdk'
import './Analitics' 
import { TonConnectUIProvider } from '@tonconnect/ui-react';

WebApp.ready();

const manifestUrl = 'https://dmitriyspirihin.github.io/UML_Frontend_React/tonconnect-manifest.json';

// ------------------------------------------------------
// 1. DEFINE THE SAFE LIST DIRECTLY IN CODE
// ------------------------------------------------------
const safeWalletsArray = [
  {
    "app_name": "telegram-wallet",
    "name": "Wallet",
    "image": "https://wallet.tg/images/logo-288.png",
    "about_url": "https://wallet.tg/",
    "universal_url": "https://t.me/wallet/start",
    "bridge": [{"type": "sse","url": "https://bridge.tonapi.io/bridge"}],
    "platforms": ["ios", "android", "macos", "windows", "linux"]
  },
  {
    "app_name": "tonkeeper",
    "name": "Tonkeeper",
    "image": "https://tonkeeper.com/assets/tonkeeper.ico",
    "about_url": "https://tonkeeper.com",
    "tondns": "tonkeeper.ton",
    "universal_url": "https://app.tonkeeper.com/ton-connect",
    "bridge": [{"type": "sse","url": "https://bridge.tonapi.io/bridge"},{"type": "js","key": "tonkeeper"}],
    "platforms": ["ios", "android", "chrome", "firefox", "macos"]
  },
  {
    "app_name": "mytonwallet",
    "name": "MyTonWallet",
    "image": "https://mytonwallet.io/icon-256.png",
    "about_url": "https://mytonwallet.io",
    "universal_url": "https://connect.mytonwallet.org/ton-connect",
    "bridge": [{"type": "js","key": "mytonwallet"},{"type": "sse","url": "https://tonconnect.mytonwallet.org/bridge"}],
    "platforms": ["chrome", "windows", "macos", "linux", "ios", "android"]
  }
];

// 2. CONVERT IT TO A "DATA URL" (Tricks the SDK into loading local data as if it were a file)
const walletsSource = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(safeWalletsArray));


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TonConnectUIProvider 
        manifestUrl={manifestUrl}
        walletsListConfiguration={{
            includeWallets: [],
            walletsListSource: walletsSource // 👈 Using our embedded list
        }}
        actionsConfiguration={{
            twaReturnUrl: 'https://t.me/UltyMyLife_bot/umlminiapp'
        }}
    >
       <App />
    </TonConnectUIProvider>
  </StrictMode>,
)
