import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { init , miniApp} from '@telegram-apps/sdk'

const initTelegramSDK = async() => {
    try
    {
      await init();
      if(miniApp.ready.isAvailable())
      {
        await miniApp.ready();
        console.log("ready");
      }
    } catch (error)
    {
      console.error("init error");
    }
}

//initTelegramSDK();
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
