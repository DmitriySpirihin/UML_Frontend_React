import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;
localStorage.removeItem('ton-connect-ui_wallets-list');
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import WebApp from '@twa-dev/sdk'
import './Analitics' 
import { TonConnectUIProvider } from '@tonconnect/ui-react';
WebApp.ready();
const manifestUrl = 'https://dmitriyspirihin.github.io/UML_Frontend_React/tonconnect-manifest.json';
const customWalletsList = 'https://dmitriyspirihin.github.io/UML_Frontend_React/wallets.json';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TonConnectUIProvider 
        manifestUrl={manifestUrl}
        walletsListConfiguration={{
            includeWallets: [],
        }}
        actionsConfiguration={{
            twaReturnUrl: 'https://t.me/UltyMyLife_bot/umlminiapp'
        }}
    >
       <App />
    </TonConnectUIProvider>
  </StrictMode>,
)
