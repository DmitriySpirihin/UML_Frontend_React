// PaymentPendingScreen.jsx
import {AppData} from '../StaticClasses/AppData';
import React, { useEffect, useState } from 'react';
import {Colors} from '../StaticClasses/Colors';
import { theme$,lang$} from '../StaticClasses/HabitsBus';

export default function PaymentPendingScreen({ onStatusFinalized }) {
  const [status, setStatus] = useState('checking'); // 'checking', 'success', 'failed'
  const [message, setMessage] = useState('Processing your payment...');
  const [theme, setthemeState] = React.useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  useEffect(() => {
          const subscription = theme$.subscribe(setthemeState);  
          const subscription2 = lang$.subscribe((lang) => {
                      setLangIndex(lang === 'ru' ? 0 : 1);
                      setMessage(lang === 'ru' ? 'Проверка платежа...' : 'Processing your payment...');
                  });
          return () => {
            subscription.unsubscribe();
            subscription2.unsubscribe();
          };
      }, []);
  useEffect(() => {
    const pendingId = localStorage.getItem('pendingPaymentId');
    if (!pendingId) {
      onStatusFinalized?.();
      return;
    }

    localStorage.removeItem('pendingPaymentId'); // consume

    let attempts = 0;
    const maxAttempts = 12; // ~60 seconds total
    const interval = 5000;   // check every 5 sec

    const poll = async () => {
      try {
        const res = await fetch(`https://ultymylife.ru/api/payment-status/${pendingId}`);
        const data = await res.json();

        if (data.success && data.payment) {
          if (data.payment.status === 'succeeded') {
            setStatus('success');
            setMessage(langIndex === 0 ? '✅ Платёж успешно подтверждён! Активируем ваш Премиум…' : '✅ Payment successful! Activating your premium...');
            setTimeout(() => onStatusFinalized?.('success'), 1500);
            return;
          }

          if (['canceled', 'failed'].includes(data.payment.status)) {
            setStatus('failed');
            setMessage(langIndex === 0 ? '❌ Платёж не подтверждён.' : '❌ Payment was not completed.');
            setTimeout(() => onStatusFinalized?.('failed'), 2000);
            return;
          }
        }

        // Still pending → retry
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, interval);
        } else {
          setStatus('failed');
          setMessage(langIndex === 0 ? '⚠️ Не удалось подтвердить платёж. Пожалуйста, проверьте свою почту или свяжитесь с поддержкой.' : '⚠️ Could not confirm payment. Please check your email or contact support.');
          setTimeout(() => onStatusFinalized?.('timeout'), 2000);
        }
      } catch (err) {
        console.error('Polling failed:', err);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, interval);
        } else {
          setStatus('failed');
          setMessage(langIndex === 0 ? '⚠️ Ошибка сети. Пожалуйста, проверьте подключение к интернету.' : '⚠️ Network error. Please check your connection.');
          setTimeout(() => onStatusFinalized?.('error'), 2000);
        }
      }
    };

    poll();
  }, [onStatusFinalized]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: Colors.get('background',theme),
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '64px',
        marginBottom: '24px',
        animation: status === 'checking' ? 'pulse 2s infinite' : 'none'
      }}>
        {status === 'checking' ? '⏳' : status === 'success' ? '🎉' : '⚠️'}
      </div>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: Colors.get('mainText',theme), marginBottom: '12px' }}>
        {message}
      </h2>
      <p style={{ color: Colors.get('subText',theme), maxWidth: '400px' }}>
        {status === 'checking'
          ? langIndex === 0 ? 'Подтверждаем платёж с банком. Обычно это занимает меньше минуты.' : 'We’re verifying your payment with the bank. This may take up to a minute.'
          : status === 'success'
            ? langIndex === 0 ? 'Платёж подтверждён! Добро пожаловать в Премиум!' : 'You’ll be redirected shortly.'
            : langIndex === 0 ? 'Платёж не подтверждён. Попробуйте ещё раз или обратитесь в поддержку.' : 'Please try again or contact support if the issue persists.'
        }
      </p>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}