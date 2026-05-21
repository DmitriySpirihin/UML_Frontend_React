import { UserData } from "./AppData";

const now = new Date();

// Create invoice + redirect
const API_BASE = 'https://ultymylife.ru'; // ✅ CLEAN

const { WebApp } = window.Telegram;

export async function initiateSbpPayment(userId, plan) {
  try {
    const invoice = await createSbpInvoice(userId, plan);
    
    if (!invoice.success || !invoice.confirmation?.confirmation_url || !invoice.paymentId) {
      throw new Error('Invalid payment response: missing paymentId or URL');
    }

    localStorage.setItem('pendingPaymentId', invoice.paymentId);

    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(invoice.confirmation.confirmation_url);
    } else {
      window.open(invoice.confirmation.confirmation_url, '_blank');
    }
  } catch (error) {
    console.error('Failed to start payment:', error);
    throw error;
  }
}

async function createSbpInvoice(userId, plan) {
  try {
    // ✅ Uses API_BASE
    const res = await fetch(`${API_BASE}/api/sbp-invoice`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Network error in createSbpInvoice:', err);
    throw new Error('Network error: could not reach payment server');
  }
}

// ---------------------------------------------------------
// 2. Telegram Stars Payment (FIXED)
// ---------------------------------------------------------
export async function initiateTgStarsPayment(userId, plan) {
  if (!window.Telegram?.WebApp) {
    alert('Telegram Stars payments are only available inside Telegram.');
    return;
  }

  try {
    // 🔴 OLD ERROR: fetch('/api/tg-stars-invoice') -> Tried to fetch from GitHub Pages
    // 🟢 FIXED: Added ${API_BASE}
    const res = await fetch(`${API_BASE}/api/tg-stars-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan }),
    });

    // Check for HTTP errors (like 404 or 500) before parsing JSON
    if (!res.ok) {
        const text = await res.text(); // Get raw text to debug
        console.error('Stars API Error Body:', text);
        throw new Error(`Server returned status: ${res.status}`);
    }

    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to create Stars invoice');

    window.Telegram.WebApp.openTelegramLink(data.invoice_link);
  } catch (err) {
    console.error('Stars payment error:', err);
    alert('Не удалось создать счёт Telegram Stars. Попробуйте позже.');
    throw err;
  }
}

// ---------------------------------------------------------
// 3. TON Payment (FIXED)
// ---------------------------------------------------------
export async function fetchTonInvoice(userId, plan) {

 // console.log("🚀 SENDING TO BACKEND:", { telegramId: userId, tarifId: plan });
  try {
    const res = await fetch(`${API_BASE}/api/ton-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to create TON invoice');

    // Just return the data (address, amount, comment)
    // The React Component will use this to call tonConnectUI.sendTransaction()
    return data; 

  } catch (err) {
    console.error('TON fetch error:', err);
    throw err;
  }
}

// frontend/utils/referrals.js
//t.me/UltyMyLife_bot/umlminiapp
export async function sendReferalLink() {
  if (!window.Telegram?.WebApp) {
    alert('Available only in Telegram');
    return;
  }
  const uid = UserData.id;
  if (!uid) {
    alert('User ID not found');
    return;
  }

  const BOT_USERNAME = 'UltyMyLife_bot'; 
  //const APP_NAME = 'umlminiapp'; 
  const referalLink = `https://t.me/${BOT_USERNAME}?start=${uid}`;
  const messageText = 'Привет! Присоединяйся к UltyMyLife и получим оба по месяцу Premium бесплатно! 🎁';

  window.Telegram.WebApp.openTelegramLink(
    `https://t.me/share/url?url=${encodeURIComponent(referalLink)}&text=${encodeURIComponent(messageText)}`
  );
}

