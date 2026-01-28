import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData, UserData } from '../StaticClasses/AppData';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { beginCell } from 'ton-core';
import Colors from '../StaticClasses/Colors';
import { lastPage$, setPage, theme$, lang$, premium$, fontSize$, isValidation$, setValidation, setShowPopUpPanel } from '../StaticClasses/HabitsBus';
import { FaBrain, FaChartPie, FaRobot, FaStar, FaCrown, FaTimes, FaInfinity,FaHourglassHalf,FaCheckCircle,FaCalendarAlt } from 'react-icons/fa';
import { MdOutlineDiamond } from "react-icons/md";
import { BiRuble } from "react-icons/bi";
import { initiateSbpPayment, fetchTonInvoice, initiateTgStarsPayment } from '../StaticClasses/PaymentService';
import { isUserHasPremium } from '../StaticClasses/NotificationsManager';

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 365);
const monthNames = [
  ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
];
// --- DATA ---
const tarifs = [
    ['149', '399', '999'], // СБП
    ['89', '229', '699'],  // Stars
    ['0.35', '0.95', '3.2'] // TON
];

const currencies = [
    <BiRuble key="rub" size={18} />,
    <FaStar key="star" size={16} />,
    <MdOutlineDiamond key="ton" size={18} />
];

const paymentInMonth = [
    ['', '133', '83'],
    ['', '76', '58'],
    ['', '0.32', '0.26']
];

const Premium = () => {
    const [theme, setTheme] = useState('dark');
    const [fSize, setFontSize] = useState(fontSize$.value);
    const [hasPremium, setHasPremium] = useState(premium$.value);
    const [langIndex, setLangIndex] = useState(AppData.prefs[0] === 'ru' ? 0 : 1);
    const [chosenCard, setChosenCard] = useState(3);
    const [isValidation, setIsValidation] = useState(false);
    const [needToValidatePayment, setNeedToValidatePayment] = useState(UserData.isValidation);
    const [currentPaymentMethod, setCurrentPaymentMethod] = useState(2);
    const [needAgreement, setNeedAgreement] = useState(false);
    const [showFullPolicy, setShowFullPolicy] = useState(false);
    const [tonConnectUI] = useTonConnectUI();
    const lastValidationTimeRef = useRef(0);
    const isDark = theme === 'dark';

    useEffect(() => {
        const subs = [
            theme$.subscribe(setTheme),
            fontSize$.subscribe(setFontSize),
            premium$.subscribe(setHasPremium),
            isValidation$.subscribe(setIsValidation),
            lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1))
        ];
        return () => subs.forEach(s => s.unsubscribe());
    }, []);

    useEffect(() => {
        if (!needToValidatePayment) return;
        const timer = setTimeout(async () => {
            const now = Date.now();
            if (now - lastValidationTimeRef.current < 50000) return;
            lastValidationTimeRef.current = now;
            try {
                const { hasPremium: isActive, isValidation: validating } = await isUserHasPremium(UserData.id);
                if (isActive || (!isActive && !validating)) {
                    setShowPopUpPanel(langIndex === 0 ? 'Подписка активна!' : 'Subscription active!', 4000, true);
                    setNeedToValidatePayment(false);
                    setValidation(false);
                }
            } catch (error) { console.error(error); }
        }, 30000);
        return () => clearTimeout(timer);
    }, [needToValidatePayment, langIndex]);

    async function getPremium() {
        if (UserData.id === null) return;

        try {
            // 1. SBP Payment
            if (currentPaymentMethod === 1) {
                await initiateSbpPayment(UserData.id, chosenCard);
                setUiForValidation(); // Helper to update UI state
            } 
            // 2. Telegram Stars
            else if (currentPaymentMethod === 2) {
                await initiateTgStarsPayment(UserData.id, chosenCard);
                setUiForValidation();
            } 
            // 3. TON
            else if (currentPaymentMethod === 3) {
                if (!tonConnectUI.connected) {
                    await tonConnectUI.openModal();
                    return; 
                }

                const { address, amount, comment } = await fetchTonInvoice(UserData.id, chosenCard);
                const body = beginCell()
                    .storeUint(0, 32) 
                    .storeStringTail(comment)
                    .endCell();

                // D. Send Transaction
                const transaction = {
                    validUntil: Math.floor(Date.now() / 1000) + 600, 
                    messages: [
                        {
                            address: address,
                            amount: Math.floor(amount * 1e9).toString(), 
                            payload: body.toBoc().toString('base64')
                        }
                    ]
                };

                await tonConnectUI.sendTransaction(transaction);
                setUiForValidation();
            }
        } catch (err) { 
            console.error(err);
            if (!err.message?.includes('User rejected')) {
                setShowPopUpPanel('Error starting payment', 2000, false); 
            }
        }
    }

    const setUiForValidation = () => {
        setNeedToValidatePayment(true);
        setValidation(true);
        setNeedAgreement(false);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: 'tween', ease: "easeOut", duration: 0.5 } }
    };

  function getEndDate(currentEndDate) {
  if (!currentEndDate) {
    return langIndex === 0 ? 'Нет подписки' : 'No subscription';
  }
  const endDateStr = new Date(currentEndDate).toISOString().split('T')[0];
  const year = endDateStr.slice(0, 4);
  const day = parseInt(endDateStr.slice(8), 10);
  const monthIndex = parseInt(endDateStr.slice(5, 7), 10) - 1;
  return `${day} ${monthNames[langIndex][monthIndex]} ${year}`;
}

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles(theme).container}>
            
            {/* 1. Full Policy Modal */}
            <AnimatePresence>
                {showFullPolicy && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        style={styles(theme).fullPolicyOverlay}
                    >
                        <div style={styles(theme).policyHeader}>
                            <h3 style={{margin:0}}>{langIndex === 0 ? 'Политика оплаты' : 'Payment Policy'}</h3>
                            <div onClick={() => setShowFullPolicy(false)} style={styles(theme).iconCircle}><FaTimes size={14}/></div>
                        </div>
                        <div style={styles(theme).policyContent}>
                            {getFullPolicy(langIndex)}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. Close Button */}
            
                <motion.div whileTap={{ scale: 0.9 }} onClick={() => setPage(lastPage$.value)} style={styles(theme).closeBtn}>
                    <div style={styles(theme).iconCircle}><FaTimes size={14} /></div>
                </motion.div>
            

            {/* 3. Main Content Section */}
            {!isValidation && !needAgreement && !hasPremium && (
                <div style={styles(theme).contentWrapper}>
                    <header style={{ textAlign: 'center', marginBottom: '25px', marginTop: '10px' }}>
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={styles(theme).heroIcon}>
                            <FaInfinity size={32} color="white" />
                        </motion.div>
                        <h1 style={styles(theme).title}>UltyMyLife <span style={{ color: '#007AFF' }}>Pro</span></h1>
                        <p style={styles(theme).subtitle}>{langIndex === 0 ? 'Твоя лучшая версия' : 'Your best version'}</p>
                    </header>

                    <div style={styles(theme).segmentedControl}>
                        <SegmentOption id={1} current={currentPaymentMethod} set={setCurrentPaymentMethod} label={langIndex === 0 ? "СБП(только Россия)" : "SBP(Russia only)"} icon={<BiRuble size={14} />} isDark={isDark} />
                        <SegmentOption id={2} current={currentPaymentMethod} set={setCurrentPaymentMethod} label="Telegram Stars" icon={<FaStar size={12} />} isDark={isDark} />
                        <SegmentOption id={3} current={currentPaymentMethod} set={setCurrentPaymentMethod} label="TON / TON Connect" icon={<MdOutlineDiamond size={14} />} isDark={isDark} />
                    </div>

                    <motion.div variants={containerVariants} initial="hidden" animate="show" style={styles(theme).featuresGrid}>
                        <FeatureItem theme={theme} variants={itemVariants} icon={<FaRobot />} title={langIndex === 0 ? "ИИ Анализ" : "AI Analysis"} sub={langIndex === 0 ? "Умные инсайты" : "Smart insights"} />
                        <FeatureItem theme={theme} variants={itemVariants} icon={<FaBrain />} title={langIndex === 0 ? "Нейро-рост" : "Neuro-growth"} sub={langIndex === 0 ? "Развитие" : "Training"} />
                        <FeatureItem theme={theme} variants={itemVariants} icon={<FaChartPie />} title={langIndex === 0 ? "Аналитика" : "Analytics"} sub={langIndex === 0 ? "Вся история" : "History"} />
                    </motion.div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginBottom: '25px' }}>
                        <BigPlanCard 
                            active={chosenCard === 3} onClick={() => setChosenCard(3)} theme={theme}
                            price={tarifs[currentPaymentMethod - 1][2]} label={langIndex === 0 ? '12 месяцев' : '1 Year'}
                            sub={paymentInMonth[currentPaymentMethod - 1][2]} currencyIcon={currencies[currentPaymentMethod - 1]}
                            saveLabel={langIndex === 0 ? 'ВЫГОДНО -35%' : 'SAVE 35%'} langIndex={langIndex}
                        />
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <SmallPlanCard theme={theme} active={chosenCard === 2} onClick={() => setChosenCard(2)} price={tarifs[currentPaymentMethod - 1][1]} label={langIndex === 0 ? '3 месяца' : '3 Months'} currencyIcon={currencies[currentPaymentMethod - 1]} />
                            <SmallPlanCard theme={theme} active={chosenCard === 1} onClick={() => setChosenCard(1)} price={tarifs[currentPaymentMethod - 1][0]} label={langIndex === 0 ? '1 месяц' : '1 Month'} currencyIcon={currencies[currentPaymentMethod - 1]} />
                        </div>
                    </div>

                    <button onClick={setNeedAgreement} style={styles(theme).mainButton}>
                            {langIndex === 0 ? 'Продолжить' : 'Continue'}
                        </button>
                    <p style={styles(theme).footerHint}>{langIndex === 0 ? 'Единоразовый платеж. Без автосписаний.' : 'One-time payment. No auto-renewal.'}</p>
                </div>
            )}
             {hasPremium && (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        style={styles(theme).premiumContainer}
    >
        {/* 1. Header with Glow */}
        <div style={styles(theme).header}>
            <div style={styles(theme).iconGlow}>
                <FaInfinity size={24} color="#fff" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.7 }}>
                    {langIndex === 0 ? 'Статус' : 'Status'}
                </span>
                <span style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Segoe UI' }}>
                    UltyMyLife <span style={{ color: '#007AFF' }}>Pro</span>
                </span>
            </div>
        </div>

        {/* 2. Avatar with Animated Golden Ring */}
        <div style={styles(theme).avatarSection}>
            <div style={styles(theme).avatarWrapper}>
                {/* Spinning Gradient Border */}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    style={styles(theme).gradientRing} 
                />
                
                {/* Image */}
                <img 
                    src={Array.isArray(UserData.photo) ? UserData.photo[0] : UserData.photo} 
                    alt="User"
                    style={styles(theme).avatarImg}
                />
                
                {/* Absolute Crown Badge */}
                <div style={styles(theme).crownBadge}>
                    <FaCrown size={10} color="#000" />
                </div>
            </div>
            
            <h2 style={styles(theme).userName}>{UserData.name}</h2>
            <p style={styles(theme).userQuote}>{langIndex === 0 ? 'Твоя лучшая версия' : 'Your best version'}</p>
        </div>

        {/* 3. Status Info Card */}
        <div style={styles(theme).infoCard}>
            <div style={styles(theme).infoRow}>
                <div style={styles(theme).statusPill}>
                    <FaCheckCircle size={12} />
                    <span>{langIndex === 0 ? 'Активна' : 'Active'}</span>
                </div>
                <div style={styles(theme).dateText}>
                    <FaCalendarAlt size={12} style={{ marginRight: '6px', opacity: 0.6 }} />
                    {langIndex === 0 ? 'до ' : 'until '} 
                    {getEndDate(UserData.premiumEndDate) }
                </div>
            </div>
        </div>

    </motion.div>
)}
            {/* 4. Validation Screen */}
            {isValidation && (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={styles(theme).loadingState}
    >
        {/* Central Animation Container */}
        <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
            
            {/* 1. Outer Glow Blur (Ambient) */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle, rgba(0,122,255,0.4) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(20px)',
                }}
            />

            {/* 2. Outer Ring (Slow Rotate) */}
            <motion.div
                style={{
                    position: 'absolute',
                    width: '100%', height: '100%',
                    borderRadius: '50%',
                    border: `2px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                    borderTop: '2px solid #007AFF',
                    borderLeft: '2px solid transparent',
                    boxShadow: '0 0 15px rgba(0, 122, 255, 0.2)'
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />

            {/* 3. Inner Ring (Fast Rotate Reverse) */}
            <motion.div
                style={{
                    position: 'absolute',
                    width: '70%', height: '70%',
                    borderRadius: '50%',
                    border: `2px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                    borderBottom: '2px solid #FFD700', // Gold accent
                    borderRight: '2px solid transparent',
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />

            {/* 4. Center Icon (Pulse) */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDark ? '#1C1C1E' : '#FFF',
                    borderRadius: '50%',
                    width: '50px', height: '50px',
                    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.1)',
                    zIndex: 2
                }}
            >
                <MdOutlineDiamond size={24} color="#007AFF" />
            </motion.div>
        </div>

        {/* Text Section */}
        <div style={{ textAlign: 'center', zIndex: 2 }}>
            <motion.h3 
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ 
                    margin: '0 0 8px 0', 
                    color: isDark ? 'white' : '#000', 
                    fontSize: '20px', 
                    fontWeight: '700',
                    letterSpacing: '0.5px'
                }}
            >
                {langIndex === 0 ? 'Проверка транзакции' : 'Verifying Transaction'}
            </motion.h3>

            <p style={{ 
                margin: 0, 
                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', 
                fontSize: '13px',
                maxWidth: '250px',
                lineHeight: '1.5' 
            }}>
                {langIndex === 0 
                    ? 'Мы подтверждаем оплату. Не закрывайте приложение.' 
                    : 'Confirming secure payment. Please do not close the app.'}
            </p>
            
            {/* Tiny loading dots for extra activity detail */}
            <motion.div 
                style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '15px' }}
            >
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                        style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#007AFF' }}
                    />
                ))}
            </motion.div>
        </div>
    </motion.div>
)}

            {/* 5. Agreement Bottom Sheet */}
            <AnimatePresence>
                {needAgreement && (
                    <motion.div 
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        style={styles(theme).bottomSheet}
                    >
                        <div style={styles(theme).sheetHandle} />
                        <h3 style={styles(theme).sheetTitle}>{langIndex === 0 ? 'Оплата' : 'Payment'}</h3>
                        
                        <div style={styles(theme).miniPolicyBox}>
                            <div style={{ whiteSpace: 'pre-line', fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', lineHeight: '1.5' }}>
                                {getMiniPolicy(langIndex)}
                            </div>
                            <button onClick={() => setShowFullPolicy(true)} style={styles(theme).textLinkBtn}>
                                {langIndex === 0 ? 'Читать полную политику →' : 'Read full policy →'}
                            </button>
                        </div>

                        <div style={styles(theme).checkoutTotalBox}>
                            <div style={styles(theme).checkoutRow}>
                                <span>{langIndex === 0 ? 'Тариф' : 'Plan'}</span>
                                <span style={{ color: isDark ? 'white' : 'black' }}>{chosenCard === 3 ? '1 Год' : (chosenCard === 2 ? '3 Месяца' : '1 Месяц')}</span>
                            </div>
                            <div style={styles(theme).checkoutRow}>
                                <span>{langIndex === 0 ? 'Метод' : 'Method'}</span>
                                <span style={{ color: isDark ? 'white' : 'black' }}>{currentPaymentMethod === 1 ? 'SBP' : (currentPaymentMethod === 2 ? 'Stars' : 'TON')}</span>
                            </div>
                            <div style={{...styles(theme).checkoutRow, marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`}}>
                                <span style={{fontSize: '16px'}}>{langIndex === 0 ? 'Итого' : 'Total'}</span>
                                <span style={styles(theme).totalPriceDisplay}>
                                    {tarifs[currentPaymentMethod - 1][chosenCard - 1]} {currencies[currentPaymentMethod - 1]}
                                </span>
                            </div>
                        </div>

                        <button onClick={getPremium} style={styles(theme).mainButton}>
                            {currentPaymentMethod === 3 && !tonConnectUI.connected 
                             ? (langIndex === 0 ? 'Подключить кошелек' : 'Connect Wallet') 
                             : (langIndex === 0 ? 'Оплатить' : 'Pay Now')
                             }
                        </button>
                        <button onClick={() => setNeedAgreement(false)} style={styles(theme).cancelBtn}>
                            {langIndex === 0 ? 'Отмена' : 'Cancel'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export function PremiumButton({ 
    langIndex, 
    clickHandler, 
    theme, 
    w = '100%', 
    h = '95px', // Slightly shorter for a sleeker look
    textToShow = ['Получить UltyMyLife Pro', 'Get UltyMyLife Pro']
}) {
    const isDark = theme === 'dark';
    const goldColor = '#FFD700'; // Standard Gold
    const goldGradient = 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)'; // Metallic Gold

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={clickHandler}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                position: 'relative',
                width: w,
                height: h,
                borderRadius: '18px',
                border: isDark ? `1px solid rgba(255, 215, 0, 0.3)` : '1px solid rgba(0,0,0,0.08)',
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '15px',
                padding: '0 20px',
                
                // Background Logic
                background: isDark 
                    ? 'linear-gradient(180deg, #1A1A1A 0%, #0D0D0D 100%)' // Deep Matte Black
                    : '#FFFFFF',
                
                // Glow Shadow
                boxShadow: isDark 
                    ? '0  0 10px 1px rgba(255, 217, 0, 0.32)' // Subtle Gold Glow
                    : '0 8px 20px -6px rgba(0, 0, 0, 0.1)'
            }}
        >
            {/* Inner Content */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                zIndex: 2 
            }}>
                {/* Crown Icon Container */}
                <div style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: isDark ? 'rgba(255, 215, 0, 0.1)' : '#FFF9E6',
                    border: `1px solid ${isDark ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 215, 0, 0.1)'}`,
                }}>
                    <FaCrown size={16} color={ isDark ? '#ffe96c' : '#685900c5'} style={{ filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3))' }} />
                </div>

                {/* Text */}
                <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    color: isDark ? '#ffe96c' : '#826e00be',
                    fontFamily: 'Segoe UI, sans-serif',
                    letterSpacing: '0.4px'
                }}>
                    {textToShow[langIndex]}
                </span>
            </div>

            {/* Subtle Shimmer Overlay */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                opacity: 0.5
            }} />
        </motion.button>
    );
}

const SegmentOption = ({ id, current, set, label, icon, isDark }) => (
    <div onClick={() => set(id)} style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '32px', borderRadius: '7px',
        background: current === id ? (isDark ? '#636366' : '#FFFFFF') : 'transparent', 
        color: current === id ? (isDark ? 'white' : 'black') : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'),
        fontSize: '13px', transition: 'all 0.2s ease', fontWeight: current === id ? '600' : '400',
        boxShadow: (current === id && !isDark) ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
    }}>
        {icon} <span>{label}</span>
    </div>
);

const FeatureItem = ({ icon, title, sub, variants, theme }) => {
    const isDark = theme === 'dark';
    return (
        <motion.div variants={variants} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(0,122,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', color: '#007AFF' }}>
                {icon}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: isDark ? 'white' : '#000' }}>{title}</div>
            <div style={{ fontSize: '10px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>{sub}</div>
        </motion.div>
    );
}

const BigPlanCard = ({ active, onClick, price, label, sub, currencyIcon, saveLabel, langIndex, theme }) => {
    const isDark = theme === 'dark';
    return (
        <motion.div whileTap={{ scale: 0.98 }} onClick={onClick} style={{
            padding: '20px', borderRadius: '22px', position: 'relative', overflow: 'hidden',
            background: active 
                ? 'linear-gradient(145deg, rgba(0, 122, 255, 0.1), transparent)' 
                : (isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF'),
            border: active ? '2px solid #007AFF' : `2px solid ${isDark ? 'transparent' : '#E5E7EB'}`, 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: (!isDark && !active) ? '0 4px 10px rgba(0,0,0,0.03)' : 'none'
        }}>
            {saveLabel && <div style={{ position: 'absolute', top: 0, right: 0, background: '#007AFF', padding: '4px 10px', borderBottomLeftRadius: '14px', fontSize: '10px', fontWeight: '800', color: 'white' }}>{saveLabel}</div>}
            <div>
                <div style={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', marginBottom: '4px' }}>{label}</div>
                <div style={{ color: isDark ? 'white' : 'black', fontSize: '26px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}>{price} <span style={{ color: '#007AFF', fontSize: '18px' }}>{currencyIcon}</span></div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>{langIndex === 0 ? 'всего' : 'only'}</div>
                <div style={{ fontSize: '14px', color: '#007AFF', fontWeight: '600' }}>{sub} {currencyIcon} <span style={{fontWeight:400, fontSize:'11px'}}>/ {langIndex === 0 ? 'мес' : 'mo'}</span></div>
            </div>
        </motion.div>
    );
}

const SmallPlanCard = ({ active, onClick, price, label, currencyIcon, theme }) => {
    const isDark = theme === 'dark';
    return (
        <motion.div whileTap={{ scale: 0.98 }} onClick={onClick} style={{
            flex: 1, padding: '16px', borderRadius: '20px', 
            background: active 
                ? (isDark ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 122, 255, 0.05)') 
                : (isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF'),
            border: active ? '2px solid #007AFF' : `2px solid ${isDark ? 'transparent' : '#E5E7EB'}`, 
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            boxShadow: (!isDark && !active) ? '0 4px 10px rgba(0,0,0,0.03)' : 'none'
        }}>
            <div style={{ fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>{label}</div>
            <div style={{ color: isDark ? 'white' : 'black', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>{price} <span style={{fontSize:'13px', color: active ? '#007AFF' : 'inherit'}}>{currencyIcon}</span></div>
        </motion.div>
    );
}

// --- STYLES ---

const styles = (theme) => {
    const isDark = theme === 'dark';
    return {
        container: { 
            position: 'fixed', inset: 0, 
            backgroundColor: isDark ? '#000' : '#F9FAFB', 
            zIndex: 5000, display: 'flex', flexDirection: 'column', 
            backgroundImage: isDark 
                ? 'radial-gradient(circle at 50% -20%, #1c1c1e 0%, #000 60%)' 
                : 'radial-gradient(circle at 50% -20%, #E0E7FF 0%, #F9FAFB 60%)', 
            fontFamily: 'Segoe UI' 
        },
        contentWrapper: { padding: '20px 24px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto',marginTop:'30%' },
        heroIcon: { width: '68px', height: '68px', borderRadius: '20px', background: 'linear-gradient(180deg, #007AFF 0%, #0055B3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', boxShadow: '0 12px 30px rgba(0, 122, 255, 0.3)' },
        title: { fontSize: '28px', fontWeight: '800', color: isDark ? 'white' : '#111827', margin: 0, textAlign: 'center' },
        subtitle: { fontSize: '15px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', marginTop: '5px', textAlign: 'center' },
        closeBtn: { position: 'absolute', top: '85px', right: '25px', zIndex: 10 },
        iconCircle: { width: '32px', height: '32px', borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' },
        segmentedControl: { background: isDark ? 'rgba(118, 118, 128, 0.24)' : '#E5E7EB', borderRadius: '9px', padding: '2px', display: 'flex', width: '100%', margin: '25px 0' },
        featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', width: '100%', marginBottom: '30px' },
        footerHint: { textAlign: 'center', fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)', marginTop: '15px' },
        bottomSheet: { position: 'absolute', bottom: 0, left: 0, width: '100%', background: isDark ? '#1C1C1E' : '#FFFFFF', borderTopLeftRadius: '28px', borderTopRightRadius: '28px', padding: '20px 24px 40px 24px', boxSizing: 'border-box', zIndex: 6000, boxShadow: isDark ? '0 -20px 40px rgba(0,0,0,0.6)' : '0 -10px 30px rgba(0,0,0,0.1)' },
        sheetHandle: { width: '36px', height: '5px', background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)', borderRadius: '3px', margin: '0 auto 20px auto' },
        sheetTitle: { textAlign: 'center', color: isDark ? 'white' : 'black', fontSize: '20px', fontWeight: 700, margin: '0 0 20px 0' },
        miniPolicyBox: { background: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', borderRadius: '16px', padding: '16px', maxHeight: '160px', overflowY: 'auto', marginBottom: '20px' },
        textLinkBtn: { background: 'none', border: 'none', color: '#007AFF', fontSize: '12px', fontWeight: '600', marginTop: '12px', padding: 0 },
        checkoutTotalBox: { background: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB', borderRadius: '16px', padding: '16px', marginBottom: '20px' },
        checkoutRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '14px' },
        totalPriceDisplay: { color: '#007AFF', fontWeight: '800', fontSize: '22px', display:'flex', alignItems:'center', gap:'5px' },
        mainButton: { width: '100%', padding: '16px', borderRadius: '16px', background: '#007AFF', color: 'white', fontSize: '17px', fontWeight: '700', border: 'none', boxShadow: '0 4px 20px rgba(0, 122, 255, 0.4)' },
        cancelBtn: { background: 'transparent', border: 'none', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', width: '100%', padding: '15px', fontSize: '15px' },
        fullPolicyOverlay: { position: 'fixed', inset: 0, background: isDark ? '#000' : '#FFF', zIndex: 7000, padding: '20px', display: 'flex', flexDirection: 'column' },
        policyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: isDark ? 'white' : 'black', marginBottom: '20px',marginTop:'75px', paddingBottom: '15px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` },
        policyContent: { flex: 1, overflowY: 'auto', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap' },
        loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' },
        avatarSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '25px'
    },
    avatarWrapper: {
        position: 'relative',
        width: '90px',
        height: '90px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '15px'
    },
    gradientRing: {
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: 'conic-gradient(from 0deg, transparent 0deg, #007AFF 180deg, #00C6FF 360deg)',
        padding: '3px', // Width of border
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
    },
    avatarImg: {
        width: '82px',
        height: '82px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: `3px solid ${theme === 'dark' ? '#1c1c1e' : '#fff'}` // Matches background to create gap
    },
    crownBadge: {
        position: 'absolute',
        bottom: '0',
        right: '0',
        backgroundColor: '#FFD700',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `3px solid ${theme === 'dark' ? '#1c1c1e' : '#fff'}`
    },
    userName: {
        margin: '0 0 5px 0',
        fontSize: '22px',
        fontWeight: '700',
        fontFamily: 'Segoe UI',
        color: Colors.get('mainText', theme)
    },
    userQuote: {
        margin: 0,
        fontSize: '13px',
        color: Colors.get('subText', theme),
        fontStyle: 'italic'
    },
    infoCard: {
        width: '100%',
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F5F5F7',
        borderRadius: '18px',
        padding: '12px 16px'
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    statusPill: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'rgba(52, 199, 89, 0.15)', // Green tint
        color: '#34C759',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '700',
        textTransform: 'uppercase'
    },
    dateText: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '13px',
        color: Colors.get('subText', theme),
        fontWeight: '500'
    },
    premiumContainer: {
        width: '85%',
        height:'50%',
        alignSelf:'center',
        marginTop:'50%',
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
        borderRadius: '32px',
        padding: '25px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent:'space-between',
        boxShadow: theme === 'dark' 
            ? '0 20px 40px -10px rgba(0,0,0,0.5)' 
            : '0 20px 40px -10px rgba(0,0,0,0.1)',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px',
        marginBottom: '25px',
        width: '100%'
    },
    iconGlow: {
        width: '55px',
        height: '55px',
        borderRadius: '14px',
        backgroundColor: '#007AFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 20px rgba(0, 122, 255, 0.4)'
    },
    }
};


const getMiniPolicy = (langIndex) => langIndex === 0 ? 
    `• Нет автосписаний и скрытых платежей.
    • Доступ ко всем ИИ-инсайтам и аналитике.
    • Цифровой товар: возврат не предусмотрен.
    • Активация может занять до 5 минут.` : 
    `• No auto-renewals or hidden fees.
    • Full access to AI insights and analytics.
    • Digital product: no refunds available.
    • Activation may take up to 5 minutes.`;

const getFullPolicy = (langIndex) => {
  return langIndex === 0 ? `Политика оплаты UltyMyLife

> *Последнее обновление: 28 января 2026 г.*

1. Общие положения
UltyMyLife — Telegram Mini App для саморазвития с ИИ-аналитикой. Доступ к расширенным функциям (трекинг привычек, ИИ-анализ сна, ментальные практики, персонализированные рекомендации) предоставляется по подписке.

Оплата возможна через:
- **СБП (₽)** — рубли;
- **Telegram Stars (★)** — внутренняя валюта Telegram;
- **TON** — криптовалюта (через TON Connect).

Цены указаны без НДС (для РФ НДС включён автоматически при оплате через СБП).

---

 2. Тарифы

| Период       | СБП     | Stars   | TON     |
|--------------|---------|---------|---------|
| 1 месяц      | 149 ₽   | 89 ★    | 0.35 TON |
| 3 месяца     | 399 ₽   | 229 ★   | 0.95 TON |
| 12 месяцев   | 999 ₽   | 699 ★   | 3.2 TON |

 Подписка даёт полный доступ ко всем функциям. Не продлевается автоматически.

---

3. Возврат средств
Возврат средств **не предусмотрен**, так как:
- Услуга является **цифровой и нематериальной**;
- Цены установлены на уровне **минимальной стоимости поддержания сервиса**;
- Продукт не требует установки и не имеет физической формы.

При технической ошибке (например, оплата прошла, но доступ не активирован) — напишите в [поддержку](https://t.me/diiimaaan777) — мы восстановим доступ вручную.

---

4. Пробный период
Пробный период **отсутствует**. Мы предлагаем **низкие цены** для максимально широкого доступа. Если вы не уверены — начните с **месячной подписки**.

---

5. Приватность данных
Все данные хранятся в защищенной базе данных (PostgreSQL), что позволяет сохранять прогресс при смене устройства. Запросы к ИИ отправляются анонимно.

---

 6. Изменение условий
Мы оставляем за собой право изменять тарифы и условия. Об изменениях уведомим заранее через интерфейс приложения или Telegram-бота.

---

 7. Поддержка
 https://t.me/diiimaaan777
📩 пишите с указанием Telegram ID и даты оплаты.
`
    : 
    `UltyMyLife Payment Policy

> *Last updated: January 28, 2026*

1. General Provisions  
UltyMyLife is a Telegram Mini App for self-improvement powered by AI analytics. Access to advanced features (habit tracking, AI sleep analysis, mental exercises, and personalized recommendations) is available via subscription.

Payment methods supported:  
- **SBP (₽)** — Russian rubles;  
- **Telegram Stars (★)** — Telegram’s in-app currency;  
- **TON** — cryptocurrency (via TON Connect).

Prices are shown excluding VAT. For users in Russia, VAT is automatically included when paying via SBP.

---

2. Pricing Plans

| Duration     | SBP       | Stars    | TON        |
|--------------|-----------|----------|------------|
| 1 month      | 149 ₽     | 89 ★     | 0.35 TON   |
| 3 months     | 399 ₽     | 229 ★    | 0.95 TON   |
| 12 months    | 999 ₽     | 699 ★    | 3.2 TON    |

A subscription grants full access to all features. **Subscriptions do not auto-renew.**

---

3. Refunds  
**Refunds are not available**, because:  
- The service is **digital and intangible**;  
- Pricing reflects the **minimum cost required to maintain the service**;  
- The product requires no installation and has no physical form.

In case of a technical issue (e.g., payment succeeded but access was not activated), please contact [Support](https://t.me/diiimaaan777) — we will manually restore your access.

---

4. Free Trial  
There is **no free trial period**. We offer **low entry prices** to ensure broad accessibility. If you’re unsure, start with the **monthly plan**.

---

5. Data Privacy  
All data is stored in a secure database (PostgreSQL), allowing you to keep your progress across devices. AI requests are sent **anonymously**.

---

6. Changes to Terms  
We reserve the right to update pricing or terms. Users will be notified in advance via the app interface or Telegram bot.

---

7. Support  
https://t.me/diiimaaan777
📩  please include your **Telegram ID** and **payment date** when contacting us.
`
}


export default Premium;


