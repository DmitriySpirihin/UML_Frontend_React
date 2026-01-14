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

    // ✅ CRITICAL: Save paymentId for later verification
    localStorage.setItem('pendingPaymentId', invoice.paymentId);

    // Open in Telegram Mini App browser
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(invoice.confirmation.confirmation_url);
    } else {
      // Fallback for dev/testing
      window.open(invoice.confirmation.confirmation_url, '_blank');
    }
  } catch (error) {
    console.error('Failed to start payment:', error);
    throw error;
  }
}

async function createSbpInvoice(userId, plan) {
  try {
    const res = await fetch(`${API_BASE}/api/sbp-invoice`, { // ✅ NO TRAILING SPACE
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

export async function initiateTgStarsPayment(userId, plan) {
  if (!window.Telegram?.WebApp) {
    alert('Telegram Stars payments are only available inside Telegram.');
    return;
  }

  try {
    const res = await fetch('/api/tg-stars-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to create Stars invoice');

    // Use Telegram WebApp to open the invoice (better UX)
    window.Telegram.WebApp.openTelegramLink(data.invoice_link);
  } catch (err) {
    console.error('Stars payment error:', err);
    alert('Не удалось создать счёт Telegram Stars. Попробуйте позже.');
    throw err;
  }
}

export async function initiateTONPayment(userId, plan) {
  try {
    const res = await fetch('/api/ton-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to create TON invoice');

    const { address, amount, comment } = data;

    // Build ton:// URL (amount in nanotons)
    const amountInNano = Math.round(amount * 1e9);
    const encodedComment = encodeURIComponent(comment);
    const tonUrl = `ton://transfer/${address}?amount=${amountInNano}&text=${encodedComment}`;

    // Open directly in Telegram Wallet (mobile-friendly!)
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(tonUrl);
    } else {
      // Fallback: open in browser (will prompt Tonkeeper or Telegram)
      window.open(tonUrl, '_blank');
    }
  } catch (err) {
    console.error('TON payment error:', err);
    alert('Не удалось открыть платеж TON. Попробуйте позже.');
    throw err;
  }
}

// frontend/utils/referrals.js
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

  const referalLink = `${window.location.origin}/?ref=${uid}`;

  // Open Telegram share sheet (best UX)
  window.Telegram.WebApp.openTelegramLink(
    `https://t.me/share/url?url=${encodeURIComponent(referalLink)}&text=${encodeURIComponent(
      'Привет! Присоединяйся к UltyMyLife и получим оба по месяцу Premium бесплатно! 🎁'
    )}`
  );
}

