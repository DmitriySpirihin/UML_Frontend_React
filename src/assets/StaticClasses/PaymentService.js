import { UserData } from './AppData';
const now = new Date();

// Create invoice + redirect
const API_BASE = 'https://ultymylife.ru'; // ✅ CLEAN

export async function initiateSbpPayment(userId, plan) {
  try {
    const invoice = await createSbpInvoice(userId, plan);
    if (!invoice.success || !invoice.confirmation?.confirmation_url) {
      throw new Error('Invalid payment response');
    }
    window.open(invoice.confirmation.confirmation_url, '_blank');
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

export async function getPaymentStatus(paymentId) {
  // ✅ FIXED: include paymentId in URL
  const res = await fetch(`${API_BASE}/api/payment-status/${paymentId}`);
  if (!res.ok) throw new Error('Failed to fetch payment status');

  const data = await res.json();
  if (data.success && data.payment) {
    const { status, plan, uid } = data.payment;

    if (status === 'succeeded') {
      UserData.hasPremium = true;

      // ✅ Validate plan
      if (![1, 2, 3].includes(plan)) {
        console.error('Unknown plan in payment:', plan);
        return data;
      }

      const daysToAdd = plan === 1 ? 365 : plan === 2 ? 90 : 30;
      const now = new Date();
      let baseDate = now;

      if (UserData.premiumEndDate) {
        const currentEnd = new Date(UserData.premiumEndDate);
        if (!isNaN(currentEnd.getTime()) && currentEnd > now) {
          baseDate = currentEnd;
        }
      }

      const newEndDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
      UserData.premiumEndDate = newEndDate;
      await saveData?.(); // optional chaining in case saveData is undefined
    }
  }
  return data;
}

export function checkPendingPaymentOnStartup() {
  const pendingId = localStorage.getItem('pendingPaymentId');
  if (!pendingId) return;

  localStorage.removeItem('pendingPaymentId');

  const pollStatus = async (attempts = 0) => {
    if (attempts > 10) return;
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

export async function fetchUserPremiumStatus() {
  const userId = UserData.id;
  if (!userId) return { hasPremium: false, premiumEndDate: null };

  try {
    const response = await fetch(`${API_BASE}/api/user/premium/${userId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (data.success) {
      return {
        hasPremium: data.hasPremium,
        premiumEndDate: data.premiumEndDate ? new Date(data.premiumEndDate) : null
      };
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.warn('Failed to fetch premium status:', error);
    return { hasPremium: false, premiumEndDate: null };
  }
}