import { UserData } from './AppData';
const API_BASE = 'https://ultymylife.ru';
const now = new Date();

// Create invoice + redirect
export async function initiateSbpPayment(userId, plan) {
  try {
    const invoice = await createSbpInvoice(userId, plan);

    if (!invoice.success || !invoice.confirmation?.confirmation_url) {
      throw new Error('Invalid payment response');
    }

    // Save paymentId for status check after return
    localStorage.setItem('pendingPaymentId', invoice.paymentId);

    // REDIRECT to YooKassa payment page
    window.location.href = invoice.confirmation.confirmation_url;
  } catch (error) {
    console.error('Failed to start payment:', error);
    throw error;
  }
}

// Original invoice creation 
async function createSbpInvoice(userId, plan) {
  const res = await fetch(`${API_BASE}/api/sbp-invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, plan }),
  });

  if (!res.ok) throw new Error('Failed to create invoice');
  return res.json(); // { success, paymentId, confirmation, ... }
}


// payment status check + local premium update
export async function getPaymentStatus(paymentId) {
  const res = await fetch(`${API_BASE}/api/payment-status/${paymentId}`);
  if (!res.ok) throw new Error('Failed to fetch payment status');

  const data = await res.json(); // { success, payment: {...} }

  if (data.success && data.payment) {
    const { status, plan, uid } = data.payment;

    if (status === 'succeeded') {
      UserData.hasPremium = true;
      let daysToAdd;
      switch (plan) {
        case 1: daysToAdd = 30; break;
        case 2: daysToAdd = 90; break;
        case 3: daysToAdd = 365; break;
        default: daysToAdd = 30;
      }

      let baseDate = now;
      if (UserData.premiumEndDate) {
        const currentEnd = new Date(UserData.premiumEndDate);
        if (!isNaN(currentEnd) && currentEnd > now) {
          baseDate = currentEnd;
        }
      }

      UserData.premiumEndDate = new Date(
        baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000
      );

    }
  }

  return data;
}

// Auto-check on app startup
export function checkPendingPaymentOnStartup() {
  const pendingId = localStorage.getItem('pendingPaymentId');
  if (!pendingId) return;

  localStorage.removeItem('pendingPaymentId');

  const pollStatus = async (attempts = 0) => {
    if (attempts > 10) return; // Stop after 10 tries (~30 sec)
    try {
      const result = await getPaymentStatus(pendingId);
      if (result.success && result.payment) {
        const { status } = result.payment;
        if (status === 'succeeded') {
          console.log('✅ Premium activated!');
          return;
        }
        if (['canceled', 'failed'].includes(status)) {
          console.log('❌ Payment was not completed.');
          return;
        }
      }
    } catch (err) {
      console.warn('Polling error (retrying):', err.message);
    }
    setTimeout(() => pollStatus(attempts + 1), 3000);
  };

  pollStatus();
}

// check after invoice creation
export async function fetchUserPremiumStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/user/premium/${UserData.uid}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      return {
        hasPremium: data.hasPremium,
        premiumEndDate: data.premiumEndDate 
          ? new Date(data.premiumEndDate) 
          : null
      };
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.warn('Failed to fetch premium status:', error);
    // Return safe defaults
    return { hasPremium: false, premiumEndDate: null };
  }
}