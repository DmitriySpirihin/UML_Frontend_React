import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData, UserData } from '../StaticClasses/AppData';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { beginCell } from 'ton-core';
import Colors from '../StaticClasses/Colors';
import { lastPage$, setPage, theme$, lang$, premium$, fontSize$, isValidation$, setValidation, setShowPopUpPanel } from '../StaticClasses/HabitsBus';
import { FaBrain, FaChartPie, FaRobot, FaStar, FaCrown, FaTimes, FaInfinity, FaCheckCircle, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MdOutlineDiamond } from "react-icons/md";
import { BiRuble } from "react-icons/bi";
import { initiateSbpPayment, fetchTonInvoice, initiateTgStarsPayment, sendReferalLink } from '../StaticClasses/PaymentService';
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

const PRO_ACCENT = '#8F86FF';
const PRO_ACCENT_STRONG = '#66D9E8';
const PRO_ACCENT_SOFT = '#A7B2FF';
const PRO_ACCENT_TEXT = '#E8F7FF';

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
    const [isWalletReady, setIsWalletReady] = useState(false);
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
    // We try to "ping" the wallet UI state
    if (tonConnectUI) {
        setIsWalletReady(true);
    }
}, [tonConnectUI]);

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
                    <header style={styles(theme).heroHeader}>
                        <div style={styles(theme).heroTextBlock}>
                            <div style={styles(theme).heroKicker}>{langIndex === 0 ? 'Pro-доступ' : 'Pro access'}</div>
                            <h1 style={styles(theme).title}>UltyMyLife <span style={{ color: PRO_ACCENT_TEXT }}>Pro</span></h1>
                        </div>
                    </header>

                    <ValueStrip theme={theme} langIndex={langIndex} />

                    <div style={styles(theme).sectionLabel}>{langIndex === 0 ? 'Что входит' : 'Included'}</div>
                    <BenefitsGrid theme={theme} langIndex={langIndex} />

                    <div style={styles(theme).sectionLabel}>{langIndex === 0 ? 'Тариф' : 'Plan'}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', width: '100%', marginBottom: '16px' }}>
                        <PlanOption
                            active={chosenCard === 3}
                            onClick={() => setChosenCard(3)}
                            theme={theme}
                            price={tarifs[currentPaymentMethod - 1][2]}
                            label={langIndex === 0 ? '12 месяцев' : '12 months'}
                            sub={`${paymentInMonth[currentPaymentMethod - 1][2]} / ${langIndex === 0 ? 'мес' : 'mo'}`}
                            currencyIcon={currencies[currentPaymentMethod - 1]}
                            badge={langIndex === 0 ? 'выгодно' : 'best'}
                        />
                        <PlanOption
                            active={chosenCard === 2}
                            onClick={() => setChosenCard(2)}
                            theme={theme}
                            price={tarifs[currentPaymentMethod - 1][1]}
                            label={langIndex === 0 ? '3 месяца' : '3 months'}
                            currencyIcon={currencies[currentPaymentMethod - 1]}
                        />
                        <PlanOption
                            active={chosenCard === 1}
                            onClick={() => setChosenCard(1)}
                            theme={theme}
                            price={tarifs[currentPaymentMethod - 1][0]}
                            label={langIndex === 0 ? '1 месяц' : '1 month'}
                            currencyIcon={currencies[currentPaymentMethod - 1]}
                        />
                    </div>

                    <div style={styles(theme).sectionLabel}>{langIndex === 0 ? 'Оплата' : 'Payment'}</div>
                    <div style={styles(theme).segmentedControl}>
                        <SegmentOption id={1} current={currentPaymentMethod} set={setCurrentPaymentMethod} label={langIndex === 0 ? "СБП" : "SBP"} icon={<BiRuble size={14} />} isDark={isDark} />
                        <SegmentOption id={2} current={currentPaymentMethod} set={setCurrentPaymentMethod} label="Stars" icon={<FaStar size={12} />} isDark={isDark} />
                        <SegmentOption id={3} current={currentPaymentMethod} set={setCurrentPaymentMethod} label="TON" icon={<MdOutlineDiamond size={14} />} isDark={isDark} />
                    </div>

                    <button onClick={() => {if(currentPaymentMethod !== 1){setNeedAgreement(true)}}} style={{...styles(theme).mainButton, background: currentPaymentMethod !== 1 ? styles(theme).mainButton.background : '#d13636', boxShadow: currentPaymentMethod !== 1 ? styles(theme).mainButton.boxShadow : '0 4px 20px rgba(255, 0, 0, 0.4)'}}>
                            {currentPaymentMethod !== 1 ? langIndex === 0 ? 'Продолжить' : 'Continue' : langIndex === 0 ? 'Скоро появится' : 'Coming soon'}
                        </button>
                    <p style={styles(theme).footerHint}>{getPaymentMethodHint(currentPaymentMethod, langIndex)}</p>
                    <ReferralCard theme={theme} langIndex={langIndex} onClick={sendReferalLink} />
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
                <span style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'inherit' }}>
                    UltyMyLife <span style={{ color: PRO_ACCENT_TEXT }}>Pro</span>
                </span>
            </div>
        </div>

        {/* 2. Avatar with Animated Ring */}
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
                    background: 'radial-gradient(circle, rgba(159,180,196,0.28) 0%, transparent 70%)',
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
                    borderTop: `2px solid ${PRO_ACCENT}`,
                    borderLeft: '2px solid transparent',
                    boxShadow: '0 0 15px rgba(159,180,196,0.18)'
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
                    borderBottom: `2px solid ${PRO_ACCENT}`,
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
                <MdOutlineDiamond size={24} color={PRO_ACCENT} />
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
                        style={{ width: '6px', height: '6px', borderRadius: '50%', background: PRO_ACCENT }}
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
	                        transition={{ duration: 0.18, ease: 'easeOut' }}
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

                        <button onClick={getPremium} disabled={!isWalletReady} style={styles(theme).mainButton}>
                            {!isWalletReady 
        ? <div className="spinner-small" /> // Simple CSS spinner
        : (currentPaymentMethod === 3 && !tonConnectUI.connected 
            ? (langIndex === 0 ? 'Подключить кошелек' : 'Connect Wallet') 
            : (langIndex === 0 ? 'Оплатить' : 'Pay Now')
          )
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

    return (
        <motion.button
	            whileTap={{ scale: 0.97 }}
            onClick={clickHandler}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                position: 'relative',
                width: w,
                height: h,
                borderRadius: '18px',
                border: isDark ? `1px solid rgba(159,180,196,0.24)` : '1px solid rgba(0,0,0,0.08)',
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
                    ? '0  0 12px 1px rgba(159,180,196,0.18)'
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
                    background: isDark ? 'rgba(159,180,196,0.12)' : 'rgba(159,180,196,0.1)',
                    border: `1px solid ${isDark ? 'rgba(159,180,196,0.26)' : 'rgba(159,180,196,0.2)'}`,
                }}>
                    <FaCrown size={16} color={isDark ? PRO_ACCENT_TEXT : '#374151'} />
                </div>

                {/* Text */}
                <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    color: isDark ? PRO_ACCENT_TEXT : '#374151',
                    fontFamily: 'inherit',
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

const SegmentOption = ({ id, current, set, label, icon, isDark }) => {
    const tone = PRO_ACCENT_STRONG;
    const active = current === id;
    return (
    <div onClick={() => set(id)} style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '38px', borderRadius: '14px',
        background: active ? (isDark ? 'rgba(102,217,232,0.16)' : 'rgba(255,255,255,0.9)') : 'transparent',
        border: active ? `1px solid rgba(102,217,232,0.42)` : '1px solid transparent',
        color: active ? (isDark ? '#F8FAFC' : '#111827') : (isDark ? 'rgba(166,173,184,0.74)' : 'rgba(17,24,39,0.55)'),
        fontSize: '13px', transition: 'all 0.2s ease', fontWeight: active ? '900' : '700',
        boxShadow: active ? '0 1px 0 rgba(255,255,255,0.06) inset, 0 14px 28px -24px rgba(102,217,232,0.55)' : 'none',
        cursor: 'pointer'
    }}>
        {icon} <span>{label}</span>
    </div>
    );
};

const FeatureItem = ({ icon, title, sub, variants, theme }) => {
    const isDark = theme === 'dark';
    return (
        <motion.div variants={variants} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: isDark ? 'rgba(159,180,196,0.12)' : 'rgba(159,180,196,0.08)', border: `1px solid ${isDark ? 'rgba(159,180,196,0.26)' : 'rgba(159,180,196,0.18)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', color: PRO_ACCENT }}>
                {icon}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '850', color: isDark ? '#F2F3F5' : '#111827' }}>{title}</div>
            <div style={{ fontSize: '10px', color: isDark ? '#6B7280' : '#596273', marginTop: 2 }}>{sub}</div>
        </motion.div>
    );
}

const ValueStrip = ({ theme, langIndex }) => {
    const isDark = theme === 'dark';
    const items = [
        { value: langIndex === 0 ? '6' : '6', label: langIndex === 0 ? 'Pro-блоков' : 'Pro areas' },
        { value: langIndex === 0 ? '∞' : '∞', label: langIndex === 0 ? 'истории' : 'history' },
        { value: langIndex === 0 ? '0' : '0', label: langIndex === 0 ? 'автосписаний' : 'auto-renewals' }
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 8,
            margin: '0 0 16px'
        }}>
            {items.map(item => (
                <div
                    key={item.label}
                    style={{
                        minHeight: 62,
                        borderRadius: 18,
                        padding: '10px 8px',
                        boxSizing: 'border-box',
                        background: isDark
                            ? 'linear-gradient(145deg, rgba(255,255,255,0.070), rgba(255,255,255,0.032)), radial-gradient(80px 64px at 50% 0%, rgba(102,217,232,0.16), transparent 72%)'
                            : 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.78)), radial-gradient(80px 64px at 50% 0%, rgba(102,217,232,0.14), transparent 72%)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.08)'}`,
                        boxShadow: isDark ? '0 14px 28px -24px rgba(0,0,0,0.8)' : '0 14px 28px -24px rgba(15,23,42,0.24)',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ color: PRO_ACCENT_STRONG, fontSize: 20, fontWeight: 950, lineHeight: 1 }}>{item.value}</div>
                    <div style={{ color: isDark ? '#C8D0DA' : '#4B5563', fontSize: 10, fontWeight: 850, lineHeight: 1.15, marginTop: 6 }}>
                        {item.label}
                    </div>
                </div>
            ))}
        </div>
    );
};

const BenefitsGrid = ({ theme, langIndex }) => {
    const [expanded, setExpanded] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const items = [
        {
            icon: <FaRobot />,
            title: langIndex === 0 ? 'ИИ-анализ' : 'AI analysis',
            sub: langIndex === 0 ? 'Что влияет на прогресс' : 'What drives progress',
            sections: langIndex === 0
                ? [
                    ['Что дает', 'Собирает привычки, сон, тренировки и ум в одну картину.'],
                    ['Как помогает', 'Показывает, что двигает тебя вперед, а что мешает.'],
                    ['Где видно', 'В Pro-аналитике и персональных подсказках.']
                ]
                : [
                    ['What it gives', 'Connects habits, sleep, training, and mind into one picture.'],
                    ['How it helps', 'Shows what moves you forward and what slows you down.'],
                    ['Where to see it', 'In Pro analytics and personal guidance.']
                ],
            color: PRO_ACCENT_STRONG,
            soft: 'rgba(102,217,232,0.13)',
            ring: 'rgba(102,217,232,0.24)',
            glow: 'rgba(102,217,232,0.13)'
        },
        {
            icon: <FaChartPie />,
            title: langIndex === 0 ? 'Полная история' : 'Full history',
            sub: langIndex === 0 ? 'Динамика за все периоды' : 'Trends across all periods',
            sections: langIndex === 0
                ? [
                    ['Что дает', 'Открывает длинную историю по разделам и периодам.'],
                    ['Как помогает', 'Легче увидеть тренд, а не случайный хороший или плохой день.'],
                    ['Где видно', 'В графиках, сравнениях и истории прогресса.']
                ]
                : [
                    ['What it gives', 'Unlocks long history across sections and periods.'],
                    ['How it helps', 'Makes trends clearer than one good or bad day.'],
                    ['Where to see it', 'In charts, comparisons, and progress history.']
                ],
            color: '#8F86FF',
            soft: 'rgba(143,134,255,0.14)',
            ring: 'rgba(143,134,255,0.24)',
            glow: 'rgba(143,134,255,0.12)'
        },
        {
            icon: <FaStar />,
            title: langIndex === 0 ? 'Рекомендации' : 'Guidance',
            sub: langIndex === 0 ? 'Следующий понятный шаг' : 'A clearer next step',
            sections: langIndex === 0
                ? [
                    ['Что дает', 'Подсказки на основе твоей реальной статистики.'],
                    ['Как помогает', 'Не нужно гадать, что улучшать первым.'],
                    ['Где видно', 'В выводах после аналитики и Pro-советах.']
                ]
                : [
                    ['What it gives', 'Guidance based on your actual stats.'],
                    ['How it helps', 'Removes guesswork about what to improve first.'],
                    ['Where to see it', 'In analytics takeaways and Pro tips.']
                ],
            color: '#7DD3FC',
            soft: 'rgba(125,211,252,0.13)',
            ring: 'rgba(125,211,252,0.22)',
            glow: 'rgba(125,211,252,0.11)'
        },
        {
            icon: <FaBrain />,
            title: langIndex === 0 ? 'Pro-режимы' : 'Pro modes',
            sub: langIndex === 0 ? 'Больше уровней и практик' : 'More levels and practice',
            sections: langIndex === 0
                ? [
                    ['Что дает', 'Дополнительные уровни там, где базового режима уже мало.'],
                    ['Как помогает', 'Можно повышать сложность постепенно и без хаоса.'],
                    ['Где видно', 'В тренировках ума, практиках и Pro-разделах.']
                ]
                : [
                    ['What it gives', 'Extra levels when the basic mode is no longer enough.'],
                    ['How it helps', 'Lets you raise difficulty gradually and cleanly.'],
                    ['Where to see it', 'In mind training, practice, and Pro sections.']
                ],
            color: '#A78BFA',
            soft: 'rgba(167,139,250,0.13)',
            ring: 'rgba(167,139,250,0.22)',
            glow: 'rgba(167,139,250,0.11)'
        },
        {
            icon: <FaInfinity />,
            title: langIndex === 0 ? 'Без лимитов' : 'No limits',
            sub: langIndex === 0 ? 'Все Premium-разделы' : 'Every Premium section',
            sections: langIndex === 0
                ? [
                    ['Что дает', 'Один доступ ко всем платным возможностям приложения.'],
                    ['Как помогает', 'Меньше ограничений, больше нормального использования.'],
                    ['Где видно', 'Во всех местах, где отмечен Pro-доступ.']
                ]
                : [
                    ['What it gives', 'One access point for every paid app feature.'],
                    ['How it helps', 'Fewer limits, more normal use.'],
                    ['Where to see it', 'Everywhere Pro access is marked.']
                ],
            color: '#5EEAD4',
            soft: 'rgba(94,234,212,0.12)',
            ring: 'rgba(94,234,212,0.20)',
            glow: 'rgba(94,234,212,0.10)'
        },
        {
            icon: <FaCrown />,
            title: langIndex === 0 ? 'Приоритет' : 'Priority',
            sub: langIndex === 0 ? 'Новые функции раньше' : 'New features earlier',
            sections: langIndex === 0
                ? [
                    ['Что дает', 'Ранний доступ к полезным улучшениям.'],
                    ['Как помогает', 'Можно быстрее пробовать то, что развивается в приложении.'],
                    ['Где видно', 'В новых Pro-функциях и обновлениях разделов.']
                ]
                : [
                    ['What it gives', 'Earlier access to useful improvements.'],
                    ['How it helps', 'Lets you try what is evolving in the app sooner.'],
                    ['Where to see it', 'In new Pro features and section upgrades.']
                ],
            color: '#93C5FD',
            soft: 'rgba(147,197,253,0.12)',
            ring: 'rgba(147,197,253,0.20)',
            glow: 'rgba(147,197,253,0.10)'
        }
    ];
    const isDark = theme === 'dark';
    const selected = selectedIndex === null ? null : items[selectedIndex];
    const showPrev = () => setSelectedIndex((selectedIndex + items.length - 1) % items.length);
    const showNext = () => setSelectedIndex((selectedIndex + 1) % items.length);

    return (
        <div style={{ marginBottom: 16 }}>
	            <motion.div style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 21,
                border: `1px solid ${isDark ? 'rgba(102,217,232,0.16)' : 'rgba(15,23,42,0.08)'}`,
                background: isDark
                    ? 'radial-gradient(220px 130px at 15% 0%, rgba(102,217,232,0.10), transparent 70%), radial-gradient(220px 120px at 100% 20%, rgba(143,134,255,0.10), transparent 68%), linear-gradient(145deg, rgba(24,27,30,0.94), rgba(15,18,22,0.92))'
                    : 'radial-gradient(220px 130px at 15% 0%, rgba(102,217,232,0.10), transparent 70%), radial-gradient(220px 120px at 100% 20%, rgba(143,134,255,0.08), transparent 68%), linear-gradient(145deg, rgba(255,255,255,0.98), rgba(255,255,255,0.88))',
                padding: 12,
                boxShadow: isDark ? '0 1px 0 rgba(255,255,255,0.06) inset, 0 22px 44px -30px rgba(0,0,0,0.86)' : '0 18px 34px -26px rgba(15,23,42,0.18)'
            }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: expanded ? 12 : 0 }}>
                    <div>
                        <div style={{ color: isDark ? '#F2F3F5' : '#111827', fontSize: 14, fontWeight: 950 }}>
                            {langIndex === 0 ? 'Возможности Pro' : 'Pro benefits'}
                        </div>
                        <div style={{ color: isDark ? '#A6ADB8' : '#596273', fontSize: 11, fontWeight: 700, marginTop: 2 }}>
                            {langIndex === 0 ? 'Нажми на пункт, чтобы раскрыть детали' : 'Tap an item to open details'}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setExpanded(prev => !prev)}
                        style={{
                            minWidth: 92,
                            minHeight: 36,
                            borderRadius: 13,
                            border: `1px solid ${isDark ? 'rgba(102,217,232,0.30)' : 'rgba(102,217,232,0.24)'}`,
                            background: isDark ? 'rgba(102,217,232,0.10)' : 'rgba(102,217,232,0.10)',
                            color: isDark ? PRO_ACCENT_TEXT : '#506B80',
                            fontFamily: 'inherit',
                            fontSize: 12,
                            fontWeight: 900,
                            cursor: 'pointer',
                            flexShrink: 0
                        }}
                    >
                        {expanded ? (langIndex === 0 ? 'Свернуть' : 'Collapse') : (langIndex === 0 ? 'Открыть' : 'Open')}
                    </button>
                </div>
                <AnimatePresence initial={false}>
                    {expanded && (
                        <motion.div
                            key="benefits-grid"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, position: 'relative' }}>
                                {items.map((item, index) => (
                        <motion.button
                            type="button"
	                            key={item.title}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setSelectedIndex(index)}
                            style={{
                                minHeight: 126,
                                width: '100%',
                                borderRadius: 18,
                                border: `1px solid ${item.ring}`,
                                background: isDark
                                    ? `radial-gradient(110px 80px at 100% 0%, ${item.glow}, transparent 70%), linear-gradient(145deg, rgba(255,255,255,0.060), rgba(255,255,255,0.028))`
                                    : `radial-gradient(110px 80px at 100% 0%, ${item.glow}, transparent 70%), linear-gradient(145deg, rgba(255,255,255,0.92), rgba(255,255,255,0.72))`,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: 10,
                                padding: '13px',
                                boxSizing: 'border-box',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                textAlign: 'left',
                                boxShadow: isDark ? '0 1px 0 rgba(255,255,255,0.055) inset, 0 12px 24px -24px rgba(102,217,232,0.42)' : '0 10px 22px -20px rgba(15,23,42,0.20)'
                            }}
                        >
                            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 13,
                                    background: item.soft,
                                    color: item.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {React.cloneElement(item.icon, { size: 16 })}
                                </div>
                                <FaChevronRight size={12} color={isDark ? 'rgba(159,180,196,0.65)' : 'rgba(80,107,128,0.55)'} />
                            </div>
                            <div style={{ minWidth: 0, width: '100%' }}>
                                <div style={{ color: isDark ? '#F2F3F5' : '#111827', fontSize: 15, fontWeight: 950, lineHeight: 1.08 }}>
                                    {item.title}
                                </div>
                                <div style={{ color: isDark ? '#A6ADB8' : '#596273', fontSize: 11, fontWeight: 700, marginTop: 6, lineHeight: 1.25 }}>
                                    {item.sub}
                                </div>
                            </div>
                        </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 7600,
                            background: 'rgba(0,0,0,0.62)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'flex-end',
                            padding: '20px',
                            boxSizing: 'border-box'
                        }}
                        onClick={() => setSelectedIndex(null)}
                    >
                        <motion.div
                            initial={{ y: 34, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 34, opacity: 0 }}
	                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            onClick={(event) => event.stopPropagation()}
                            style={{
                                width: '100%',
                                borderRadius: 26,
                                padding: 18,
                                background: isDark ? 'rgba(20,23,25,0.98)' : 'rgba(255,255,255,0.98)',
                                border: `1px solid ${selected.ring}`,
                                color: isDark ? '#F2F3F5' : '#111827',
                                boxShadow: '0 28px 80px rgba(0,0,0,0.5)',
                                boxSizing: 'border-box'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, minWidth: 0 }}>
                                <div style={{
                                    width: 46,
                                    height: 46,
                                    borderRadius: 15,
                                    background: selected.soft,
                                    color: selected.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {React.cloneElement(selected.icon, { size: 20 })}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 19, fontWeight: 950, lineHeight: 1.08 }}>{selected.title}</div>
                                    <div style={{ color: isDark ? '#A6ADB8' : '#596273', fontSize: 12, fontWeight: 750, marginTop: 3 }}>{selected.sub}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                                {selected.sections.map(([label, text]) => (
                                    <div
                                        key={label}
                                        style={{
                                            borderRadius: 15,
                                            background: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(15,23,42,0.035)',
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}`,
                                            padding: '11px 12px'
                                        }}
                                    >
                                        <div style={{ color: isDark ? PRO_ACCENT_TEXT : '#506B80', fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
                                            {label}
                                        </div>
                                        <div style={{ color: isDark ? '#D7DBE2' : '#354052', fontSize: 13, fontWeight: 700, lineHeight: 1.38 }}>
                                            {text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                                <BenefitNavButton onClick={showPrev} icon={<FaChevronLeft />} text={langIndex === 0 ? 'Назад' : 'Prev'} isDark={isDark} />
                                <div style={{ color: isDark ? '#A6ADB8' : '#596273', fontSize: 12, fontWeight: 850 }}>
                                    {selectedIndex + 1} / {items.length}
                                </div>
                                <BenefitNavButton onClick={showNext} icon={<FaChevronRight />} text={langIndex === 0 ? 'Дальше' : 'Next'} isDark={isDark} right />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const BenefitNavButton = ({ onClick, icon, text, isDark, right = false }) => (
    <button
        type="button"
        onClick={onClick}
        style={{
            minHeight: 42,
            minWidth: 104,
            borderRadius: 15,
            border: `1px solid ${isDark ? 'rgba(159,180,196,0.28)' : 'rgba(159,180,196,0.2)'}`,
            background: isDark ? 'rgba(159,180,196,0.1)' : 'rgba(159,180,196,0.08)',
            color: isDark ? PRO_ACCENT_TEXT : '#506B80',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: right ? 'row-reverse' : 'row',
            gap: 7,
            fontFamily: 'inherit',
            fontSize: 13,
            fontWeight: 900,
            cursor: 'pointer'
        }}
    >
        {icon}
        <span>{text}</span>
    </button>
);

const ReferralCard = ({ theme, langIndex, onClick }) => {
    const isDark = theme === 'dark';
    return (
        <motion.button
            type="button"
            whileTap={{ scale: 0.985 }}
            onClick={onClick}
            style={{
                width: '100%',
                minHeight: 58,
                borderRadius: 16,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.075)' : 'rgba(15,23,42,0.08)'}`,
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.78)',
                color: isDark ? '#F2F3F5' : '#111827',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                margin: '14px 0 0',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset'
            }}
        >
            <div style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                background: isDark ? 'rgba(159,180,196,0.12)' : 'rgba(159,180,196,0.08)',
                border: `1px solid ${isDark ? 'rgba(159,180,196,0.26)' : 'rgba(159,180,196,0.18)'}`,
                color: PRO_ACCENT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                <FaStar size={14} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 900 }}>
                    {langIndex === 0 ? 'Пригласи друга' : 'Invite a friend'}
                </div>
                <div style={{ fontSize: 11, fontWeight: 650, color: isDark ? '#A6ADB8' : '#596273', marginTop: 3, lineHeight: 1.35 }}>
                    {langIndex === 0 ? 'Оба получите Premium бесплатно' : 'Both get Premium for free'}
                </div>
            </div>
            <div style={{
                minWidth: 78,
                height: 30,
                borderRadius: 999,
                background: isDark ? 'rgba(159,180,196,0.1)' : 'rgba(159,180,196,0.08)',
                border: `1px solid ${isDark ? 'rgba(159,180,196,0.24)' : 'rgba(159,180,196,0.18)'}`,
                color: isDark ? PRO_ACCENT_TEXT : '#506B80',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 900,
                flexShrink: 0
            }}>
                {langIndex === 0 ? 'Отправить' : 'Send'}
            </div>
        </motion.button>
    );
}

const PlanOption = ({ active, onClick, price, label, sub, currencyIcon, badge, theme }) => {
    const isDark = theme === 'dark';
    const accent = badge ? PRO_ACCENT_SOFT : PRO_ACCENT_STRONG;
    return (
        <motion.button
            type="button"
            whileTap={{ scale: 0.985 }}
            onClick={onClick}
            style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: badge ? 84 : 68,
                width: '100%',
                borderRadius: badge ? 22 : 18,
                border: active ? '1px solid rgba(102,217,232,0.58)' : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
                background: active
                    ? (isDark
                        ? `radial-gradient(210px 110px at 92% 0%, rgba(102,217,232,0.18), transparent 72%), linear-gradient(145deg, rgba(255,255,255,0.105), rgba(255,255,255,0.045) 60%, rgba(143,134,255,0.08))`
                        : `radial-gradient(210px 110px at 92% 0%, ${accent}22, transparent 72%), linear-gradient(145deg, rgba(255,255,255,0.98), rgba(255,255,255,0.82))`)
                    : (isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.88)'),
                color: isDark ? '#F2F3F5' : '#111827',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: active ? '0 1px 0 rgba(255,255,255,0.08) inset, 0 20px 42px -26px rgba(102,217,232,0.62)' : '0 1px 0 rgba(255,255,255,0.04) inset',
                textAlign: 'left',
                boxSizing: 'border-box',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                WebkitTapHighlightColor: 'transparent'
            }}
        >
            <div style={{
                width: 27,
                height: 27,
                borderRadius: 999,
                border: active ? `1px solid ${isDark ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.8)'}` : `1px solid ${isDark ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.14)'}`,
                background: active ? 'linear-gradient(135deg, #2F7F94, #B7F3FF)' : 'transparent',
                color: isDark ? '#0E1013' : '#F2F3F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                {active && <FaCheckCircle size={13} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: badge ? 16 : 15, fontWeight: 950, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                    {badge && (
                        <span style={{
                            fontSize: 9,
                            fontWeight: 900,
                            color: isDark ? '#0E1013' : '#F2F3F5',
                            background: 'linear-gradient(135deg, #2F7F94, #B7F3FF)',
                            borderRadius: 999,
                            padding: '4px 8px',
                            textTransform: 'uppercase',
                            flexShrink: 0
                        }}>
                            {badge}
                        </span>
                    )}
                </div>
                {sub && <div style={{ fontSize: 12, color: isDark ? '#D9E2EA' : '#596273', marginTop: 4, fontWeight: 800 }}>{sub}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: active ? accent : (isDark ? '#F2F3F5' : '#111827'), fontSize: badge ? 24 : 22, fontWeight: 950, flexShrink: 0 }}>
                {price}
                <span style={{ fontSize: 14 }}>{currencyIcon}</span>
            </div>
        </motion.button>
    );
}

const BigPlanCard = ({ active, onClick, price, label, sub, currencyIcon, saveLabel, langIndex, theme }) => {
    const isDark = theme === 'dark';
    return (
        <motion.div whileTap={{ scale: 0.98 }} onClick={onClick} style={{
            padding: '20px', borderRadius: '22px', position: 'relative', overflow: 'hidden',
            background: active
                ? 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))'
                : (isDark ? 'rgba(255,255,255,0.045)' : '#FFFFFF'),
            border: active ? `2px solid ${PRO_ACCENT}` : `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#E5E7EB'}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: active ? '0 18px 38px -28px rgba(0,0,0,0.72)' : ((!isDark && !active) ? '0 4px 10px rgba(0,0,0,0.03)' : 'none'),
            cursor: 'pointer'
        }}>
            {saveLabel && <div style={{ position: 'absolute', top: 0, right: 0, background: isDark ? PRO_ACCENT_STRONG : '#111827', padding: '4px 10px', borderBottomLeftRadius: '14px', fontSize: '10px', fontWeight: '900', color: isDark ? '#0E1013' : '#F2F3F5' }}>{saveLabel}</div>}
            <div>
                <div style={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', marginBottom: '4px' }}>{label}</div>
                <div style={{ color: isDark ? '#F2F3F5' : '#111827', fontSize: '26px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px' }}>{price} <span style={{ color: isDark ? PRO_ACCENT_TEXT : '#374151', fontSize: '18px' }}>{currencyIcon}</span></div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>{langIndex === 0 ? 'всего' : 'only'}</div>
                <div style={{ fontSize: '14px', color: isDark ? PRO_ACCENT_TEXT : '#374151', fontWeight: '800' }}>{sub} {currencyIcon} <span style={{fontWeight:500, fontSize:'11px'}}>/ {langIndex === 0 ? 'мес' : 'mo'}</span></div>
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
                ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.045)')
                : (isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF'),
            border: active ? `2px solid ${PRO_ACCENT}` : `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#E5E7EB'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            boxShadow: (!isDark && !active) ? '0 4px 10px rgba(0,0,0,0.03)' : 'none',
            cursor: 'pointer'
        }}>
            <div style={{ fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>{label}</div>
            <div style={{ color: isDark ? '#F2F3F5' : '#111827', fontSize: '18px', fontWeight: '850', display: 'flex', alignItems: 'center', gap: '3px' }}>{price} <span style={{fontSize:'13px', color: active ? (isDark ? PRO_ACCENT_TEXT : '#374151') : 'inherit'}}>{currencyIcon}</span></div>
        </motion.div>
    );
}

// --- STYLES ---

const styles = (theme) => {
    const isDark = theme === 'dark';
    return {
        container: { 
            position: 'fixed', inset: 0, 
            backgroundColor: isDark ? '#11171C' : '#F4F5F7',
            zIndex: 5000, display: 'flex', flexDirection: 'column', 
            backgroundImage: isDark 
                ? 'radial-gradient(900px 460px at 82% -8%, rgba(85,221,235,0.13), transparent 58%), radial-gradient(760px 420px at -12% 42%, rgba(124,108,255,0.11), transparent 60%), linear-gradient(180deg, #18232B 0%, #11171C 46%, #0F1418 100%)'
                : 'radial-gradient(900px 450px at 80% -10%, rgba(85,221,235,0.08), transparent 58%), radial-gradient(700px 360px at -10% 100%, rgba(124,108,255,0.08), transparent 58%), #F4F5F7',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        },
        contentWrapper: { padding: 'calc(env(safe-area-inset-top, 0px) + 36px) 20px 30px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', boxSizing: 'border-box' },
        heroHeader: {
            minHeight: '62px',
            margin: '0 0 10px',
            padding: '4px 4px 2px',
            borderRadius: 0,
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'visible'
        },
        heroTextBlock: { minWidth: 0, width: '100%', maxWidth: 310, position: 'relative', zIndex: 1, textAlign: 'center' },
        heroKicker: { fontSize: 9, color: isDark ? PRO_ACCENT_SOFT : '#2F7F94', fontWeight: 950, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5, textShadow: isDark ? '0 0 14px rgba(143,134,255,0.42)' : 'none' },
        title: {
            fontSize: '29px',
            fontWeight: '950',
            color: isDark ? '#FFFFFF' : '#111827',
            margin: 0,
            lineHeight: 1.02,
            whiteSpace: 'nowrap',
            textShadow: isDark ? '0 0 22px rgba(102,217,232,0.30), 0 8px 24px rgba(0,0,0,0.45)' : 'none'
        },
        closeBtn: { position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', right: '20px', zIndex: 10 },
        iconCircle: { width: '36px', height: '36px', borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', color: isDark ? '#F2F3F5' : '#111827' },
        segmentedControl: { background: isDark ? 'rgba(255,255,255,0.060)' : 'rgba(0,0,0,0.045)', borderRadius: '18px', padding: '5px', display: 'flex', width: '100%', margin: '0 0 16px', boxSizing: 'border-box', border: `1px solid ${isDark ? 'rgba(255,255,255,0.075)' : 'rgba(15,23,42,0.07)'}` },
        sectionLabel: { fontSize: 11, color: isDark ? '#9AA8B7' : '#657184', fontWeight: 950, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '4px 0 9px' },
        featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: '100%', marginBottom: '18px' },
        footerHint: { textAlign: 'center', fontSize: '11px', color: isDark ? 'rgba(166,173,184,0.55)' : 'rgba(89,98,115,0.72)', marginTop: '13px', lineHeight: 1.4 },
        bottomSheet: { position: 'absolute', bottom: 0, left: 0, width: '100%', background: isDark ? '#1C1C1E' : '#FFFFFF', borderTopLeftRadius: '28px', borderTopRightRadius: '28px', padding: '20px 24px 40px 24px', boxSizing: 'border-box', zIndex: 6000, boxShadow: isDark ? '0 -20px 40px rgba(0,0,0,0.6)' : '0 -10px 30px rgba(0,0,0,0.1)' },
        sheetHandle: { width: '36px', height: '5px', background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)', borderRadius: '3px', margin: '0 auto 20px auto' },
        sheetTitle: { textAlign: 'center', color: isDark ? 'white' : 'black', fontSize: '20px', fontWeight: 700, margin: '0 0 20px 0' },
        miniPolicyBox: { background: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', borderRadius: '16px', padding: '16px', maxHeight: '160px', overflowY: 'auto', marginBottom: '20px' },
        textLinkBtn: { background: 'none', border: 'none', color: isDark ? PRO_ACCENT_TEXT : '#506B80', fontSize: '12px', fontWeight: '600', marginTop: '12px', padding: 0 },
        checkoutTotalBox: { background: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB', borderRadius: '16px', padding: '16px', marginBottom: '20px' },
        checkoutRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '14px' },
        totalPriceDisplay: { color: isDark ? PRO_ACCENT_TEXT : '#506B80', fontWeight: '800', fontSize: '22px', display:'flex', alignItems:'center', gap:'5px' },
        mainButton: { width: '100%', padding: '17px', borderRadius: '20px', background: isDark ? `linear-gradient(135deg, #2F7F94 0%, #B7F3FF 48%, #66D9E8 100%)` : `linear-gradient(135deg, #111827 0%, #393342 52%, #2F7F94 100%)`, color: isDark ? '#10131B' : '#F8FAFC', fontSize: '18px', fontWeight: '950', border: 'none', boxShadow: isDark ? '0 20px 42px rgba(102,217,232,0.24)' : '0 18px 34px rgba(80,107,128,0.24)' },
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
        background: `conic-gradient(from 0deg, transparent 0deg, ${PRO_ACCENT} 180deg, ${PRO_ACCENT_TEXT} 360deg)`,
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
        backgroundColor: theme === 'dark' ? PRO_ACCENT_STRONG : '#506B80',
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
        fontFamily: 'inherit',
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
        backgroundColor: theme === 'dark' ? PRO_ACCENT_STRONG : '#506B80',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: theme === 'dark' ? '0 0 20px rgba(159,180,196,0.22)' : '0 0 20px rgba(80,107,128,0.18)'
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
function getPaymentMethodHint(currentPaymentMethod, langIndex) {
  switch (currentPaymentMethod) {
    case 1:
      return langIndex === 0
        ? 'Безопасный платеж через официальный шлюз ЮKassa (СБП).'
        : 'Secure payment processed via official YooKassa gateway (SBP).';
    case 2:
      return langIndex === 0
        ? 'Оплата цифровых товаров внутренней валютой Telegram Stars.'
        : 'Purchase of digital goods using Telegram Stars currency.';
    case 3:
      return langIndex === 0
        ? 'Децентрализованная транзакция через протокол TonConnect.'
        : 'Decentralized blockchain transaction via TonConnect protocol.';
    default:
      return '';
  }
}


export default Premium;
