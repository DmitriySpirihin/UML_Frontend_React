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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TonConnectUIProvider 
    manifestUrl={manifestUrl}
    // OPTIONAL: Filter out broken wallets to clean up the console
    uiPreferences={{
        borderRadius: 's'
    }}
    walletsListConfiguration={{
        includeWallets: [
            {
                appName: "tonkeeper",
                name: "Tonkeeper",
                imageUrl: "https://tonkeeper.com/assets/tonkeeper.ico",
                aboutUrl: "https://tonkeeper.com",
                universalLink: "https://app.tonkeeper.com/ton-connect",
                bridgeUrl: "https://bridge.tonapi.io/bridge",
                platforms: ["ios", "android", "chrome", "firefox"]
            },
            // Add OpenMask or MyTonWallet if needed
        ]
    }}
>
       <App />
    </TonConnectUIProvider>
  </StrictMode>,
)
