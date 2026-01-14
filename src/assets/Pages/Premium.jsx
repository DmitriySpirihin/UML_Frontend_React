import { useState, useEffect, useRef} from 'react';
import { AppData , UserData} from '../StaticClasses/AppData.js';
import Colors from '../StaticClasses/Colors';
import { lastPage$, setPage,theme$,lang$,premium$,fontSize$,isValidation$,setValidation, setShowPopUpPanel} from '../StaticClasses/HabitsBus';
import {FaBrain,FaChartBar,FaRobot,FaFlask} from 'react-icons/fa'
import {initiateSbpPayment,initiateTONPayment,initiateTgStarsPayment} from '../StaticClasses/PaymentService';
import { isUserHasPremium } from '../StaticClasses/NotificationsManager.js';
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 365);
const monthNames = [
  ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
];
const tarifs = [
  ['149₽','399₽','999₽'],
  ['89⭐','229⭐','699⭐'],
  ['0.35💎','0.95💎','3.2💎']
]
const paymentInMonth = [
  ['','139 / ','89 / '],
  ['','76 / ','58 / '],
  ['','0.32 / ','0.26 / ']
]
const Premium = () => {
    // Theme and language state
    const [theme, setTheme] = useState(theme$.value);
    const [fSize,setFontSize] = useState(fontSize$.value);
    const [hasPremium,setHasPremium] = useState(premium$.value);
    const [langIndex,setLangIndex] = useState(AppData.prefs[0]);
    const [chosenCard,setChosenCard] = useState(3);
    const [currentEndDate,setCurrentEndDate] = useState(UserData.premiumEndDate);
    const [isValidation,setIsValidation] = useState(false);
    const [needToValidatePayment,setNeedToValidatePayment] = useState(UserData.isValidation);

    const [currentPaymentMethod,setCurrentPaymentMethod] = useState(2);
    const [needAgreement,setNeedAgreement] = useState(false);
    const [needToShowPaymentPolicy,setNeedToShowPaymentPolicy] = useState(false);

    const getInitialEndDate = () => {
  const days = chosenCard === 3 ? 30 : chosenCard === 2 ? 90 : 365;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
const [endDate, setEndDate] = useState(getInitialEndDate());
    useEffect(() => {
        const daysAmount = chosenCard === 3 ? 30 : chosenCard === 2 ? 90 : 365;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAmount);
        setEndDate(futureDate);
    },[chosenCard])

    useEffect(() => {
            const themeSubscription = theme$.subscribe(setTheme);
            const fontSizeSubscription = fontSize$.subscribe(setFontSize);
            const langSubscription = lang$.subscribe((lang) => {
                setLangIndex(lang === 'ru' ? 0 : 1);
            });
            const premiumSubscription = premium$.subscribe(setHasPremium);
            const validationSubscription = isValidation$.subscribe(setIsValidation);
            return () => {
                themeSubscription.unsubscribe();
                langSubscription.unsubscribe();
                fontSizeSubscription.unsubscribe();
                premiumSubscription.unsubscribe();
                validationSubscription.unsubscribe();
            };
        }, []);
  useEffect(() => {
  setCurrentEndDate(UserData.premiumEndDate);
}, [UserData.premiumEndDate]);


   function getEndDate() {
  if (!currentEndDate) {
    return langIndex === 0 ? 'Нет подписки' : 'No subscription';
  }
  const endDateStr = new Date(currentEndDate).toISOString().split('T')[0];
  const year = endDateStr.slice(0, 4);
  const day = parseInt(endDateStr.slice(8), 10);
  const monthIndex = parseInt(endDateStr.slice(5, 7), 10) - 1;
  return `${day} ${monthNames[langIndex][monthIndex]} ${year}`;
}
  async function getPremium() {
  if (UserData.id === null) {
    setShowPopUpPanel(langIndex === 0 ? 'Пользовательский ID не найден...' : 'User ID not found...', 2000, false);
    return;
  }
  try {
    if (currentPaymentMethod === 1) await initiateSbpPayment(UserData.id, chosenCard);
    else if (currentPaymentMethod === 2) await initiateTgStarsPayment(UserData.id, chosenCard);
    else if (currentPaymentMethod === 3) await initiateTONPayment(UserData.id, chosenCard);
    
    setNeedToValidatePayment(true);
    setValidation(true);
  } catch (err) {
    setShowPopUpPanel(langIndex === 0 ? 'Не возможно запустить оплату...' : 'Could not start payment...', 2000, false);
  }
}
const lastValidationTimeRef = useRef(0);

useEffect(() => {
  if (!needToValidatePayment) return;

  // Schedule validation after 50 seconds
  const timer = setTimeout(async () => {
    const now = Date.now();
    // Double-check cooldown (in case state changed during wait)
    if (now - lastValidationTimeRef.current < 50000) {
      return;
    }

    lastValidationTimeRef.current = now;

    try {
      const { hasPremium, premiumEndDate, isValidation } = await isUserHasPremium(UserData.id);
      if (hasPremium || (!hasPremium && !isValidation)) {
        setShowPopUpPanel(
          langIndex === 0 
            ? 'Поздравляем! Подписка активирована!' 
            : 'Congratulations! Subscription activated!',
          4000,
          true
        );
        setNeedToValidatePayment(false);
        setValidation(false);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  }, 50000); // Wait 50 seconds before validating

  // Cleanup timeout if dependency changes or component unmounts
  return () => clearTimeout(timer);
}, [needToValidatePayment, langIndex, UserData.id]);
    
    
    return (
        <div style={{...styles(theme).container}}>
          {
            needAgreement && <div style={{...styles(theme).confirmContainer}}>
              <div style={{...styles(theme).cP,borderRadius:'24px',width:'90%'}}>
                <div style={{display:'flex',flexDirection:'column',width:'100%',alignItems:'center',justifyContent:'start'}}>
              <div style={{...styles(theme).text , whiteSpace:'pre-line',textAlign:'left',paddingLeft:'10px'}}>
               {
                 getMiniPolicy(langIndex)
               }
               </div>
                 <div style={{...styles(theme).text,alignSelf:'start',fontStyle:'italic',textDecoration:'underline',paddingLeft:'10px'}} onClick={() => setNeedToShowPaymentPolicy(true)}>{langIndex === 0 ? 'Читать весь текст' : 'Read all text'}</div>
               </div>
               <div>
               < PremiumButton clickHandler={() => getPremium()} langIndex={langIndex}  theme={theme} textToShow = {[ 'Оплатить' + ' ' + tarifs[currentPaymentMethod - 1][chosenCard - 1] , 'Pay'+ ' ' + tarifs[currentPaymentMethod - 1][chosenCard - 1]]}  needSparcle={false}/>
               
               <button style={{...styles(theme).button,height:'40px',marginTop:'30px',borderRadius:'20px',border:`2px solid ${Colors.get('border', theme)}`}} onClick={() => setNeedAgreement(false)}>{langIndex === 0 ? 'Назад' : 'Back'}</button>    
             </div>
             <div style={{...styles(theme).subtext,display: 'flex',alignItems: 'center',gap: '4px',marginBottom: '1px',}}>
              <span>{PAYMENT_METHOD_DESCRIPTIONS[langIndex][currentPaymentMethod - 1]}</span>
             </div>
             </div>
             </div>
          }
          {
            needToShowPaymentPolicy && <div style={{...styles(theme).confirmContainer}}>
              <div style={{...styles(theme).cP,width:'100vw',height:'100vh',overflow:'scroll'}}>
              <div style={{...styles(theme).subtext , whiteSpace:'pre-line',textAlign:'left',marginLeft:'10px'}}>
               {
                 getFullPolicy(langIndex)
               }
               </div>
               <a style={{marginBottom : '25px', ...styles(theme).subtext,alignSelf:'start',marginLeft:'10px',color:Colors.get('currentDateBorder', theme)}} href="https://t.me/diiimaaan777" target="_blank">{langIndex === 0 ? 'Свяжитесь со мной в Telegram' : 'Contact me on Telegram'}</a>
                <button style={{...styles(theme).button,height:'40px',borderRadius:'20px',border:`2px solid ${Colors.get('border', theme)}`,marginBottom:'50px'}} onClick={() => setNeedToShowPaymentPolicy(false)}>{langIndex === 0 ? 'Назад' : 'Back'}</button> 
             </div>
             </div>
          }
           {!hasPremium && !isValidation && <div style={{...styles(theme).panel}}>
            <img src={theme === 'dark' || theme === "specialdark" ? 'images/Ui/Main_Dark.png' : 'images/Ui/Main_Light.png'} style={{width:'50%'}} />
            <div style={{...styles(theme).subtext,fontSize:'22px'}}>{'premium'}</div>
             <div style={{display:'flex',flexDirection:'column',width:'90vw',height:'22%',alignItems:'center',justifyContent:'center'}}>
              <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyItems:'center',height:'35px'}}>
               <FaRobot style={{...styles(theme).miniIcon}}/>
               <div style={styles(theme).text}>{langIndex === 0 ? 'Персональные ИИ инсайты' : 'Personal AI insights'}</div>
             </div>
             <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyItems:'center',height:'35px'}}>
               <FaBrain style={{...styles(theme).miniIcon}}/>
               <div style={styles(theme).text}>{langIndex === 0 ? 'Расширенные функции' : 'Premium features'}</div>
             </div>
             <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyItems:'center',height:'35px'}}>
               <FaChartBar style={{...styles(theme).miniIcon}}/>
               <div style={styles(theme).text}>{langIndex === 0 ? 'Детальная статистика' : 'Detailed statistics'}</div>
             </div>
             <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyItems:'center',height:'35px'}}>
               <FaFlask style={{...styles(theme).miniIcon}}/>
               <div style={styles(theme).text}>{langIndex === 0 ? 'Тестирование новых функций' : 'Testing new features'}</div>
             </div>
             
             </div>
              <div style={{position: 'relative',display: 'flex',margin: '5px',width: '70vw',height: '65px',borderRadius: '12px',}}>
              {/* Animated Gradient Border */}
              <div className="premium-border" />
                <div onClick={() => {setChosenCard(3);}}
                id={3} style={{position: 'relative',display: 'flex',flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',backgroundColor:chosenCard === 3 ? '#6197cdff' : Colors.get('simplePanel', theme),borderRadius: '12px',width: '100%',height: '100%',paddingLeft: '12px',paddingRight: '12px',zIndex: 2,}}>
                <div style={{ ...styles(theme).text, fontSize: '28px' }}>{langIndex === 0 ? '1 год' : '1 year'}</div>
                <div style={{display: 'flex',flexDirection: 'column',alignItems: 'flex-end',}}>
                 <div style={{ ...styles(theme).text, fontSize: '24px' }}>{tarifs[currentPaymentMethod - 1][2]}</div>
                 <div style={{ ...styles(theme).text, fontSize: '14px' }}>{paymentInMonth[currentPaymentMethod - 1][2] + (langIndex === 0 ? 'мес' : 'mon')}</div>
               </div>
              </div>
             {/* Centered "HIT" badge */}
             <div style={{position: 'absolute',top: '-8px',left: '50%',transform: 'translateX(-50%)',background: 'linear-gradient(90deg, #00B4FF, #FF00C8)',color: 'white',fontSize: '12px',fontWeight: 'bold',padding: '2px 10px',borderRadius: '12px',boxShadow: '0 2px 4px rgba(0,0,0,0.2)',zIndex: 3,whiteSpace: 'nowrap',}}>{langIndex === 0 ? 'ХИТ' : 'HIT'}</div>
             </div>
             <div onClick={() => {setChosenCard(2);}}
              id={2} style={{display:'flex',margin:'5px',flexDirection:'row',borderRadius:'12px',alignItems:'center',backgroundColor:chosenCard === 2 ? '#6197cdff' : Colors.get('simplePanel', theme),justifyContent:'space-between',width:'70vw',height:'65px'}}>
                <div style={{...styles(theme).text,marginLeft:'12px',fontSize:'28px'}}>{langIndex === 0 ? '3 месяца' : '3 month'}</div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyItems:'center'}}>
                  <div style={{...styles(theme).text,marginRight:'12px',fontSize:'24px'}}>{tarifs[currentPaymentMethod - 1][1]}</div>
                  <div style={{...styles(theme).text,marginRight:'12px',fontSize:'14px'}}>{paymentInMonth[currentPaymentMethod - 1][1] + (langIndex === 0 ? 'мес' : 'mon')}</div>
                </div>
             </div>
             <div onClick={() => {setChosenCard(1);}}
              id={1} style={{display:'flex',margin:'5px',flexDirection:'row',borderRadius:'12px',alignItems:'center',backgroundColor:chosenCard === 1 ? '#6197cdff' : Colors.get('simplePanel', theme),justifyContent:'space-between',width:'70vw',height:'65px'}}>
                <div style={{...styles(theme).text,marginLeft:'12px',fontSize:'28px'}}>{langIndex === 0 ? '1 месяц' : '1 month'}</div>
                  <div style={{...styles(theme).text,marginRight:'12px',fontSize:'24px'}}>{tarifs[currentPaymentMethod - 1][0]}</div>
             </div>
              <div style={{...styles(theme).text,marginTop:'16px'}}>{langIndex === 0 ? 'Выберите способ оплаты' : 'Choose payment method'}</div>
              <div style={{display: 'flex',flexDirection: 'row',marginBottom: '16px',justifyContent: 'center',alignItems: 'space-around',gap: '12px',marginTop: '16px',padding: '0 10px',}}>
              
              <div onClick={() => setCurrentPaymentMethod(1)} style={{...styles(theme).text,fontSize: currentPaymentMethod === 1 ? '17px' : '14px',borderBottom: currentPaymentMethod === 1 ? `2px solid ${Colors.get('difficulty', theme)} `: 'none' ,display: 'flex',alignItems: 'center',gap: '4px',}}>📱<span>{langIndex === 0 ? 'СБП' : 'SBP'}</span></div>
              <div onClick={() => setCurrentPaymentMethod(2)} style={{...styles(theme).text,fontSize: currentPaymentMethod === 2 ? '17px' : '14px',borderBottom: currentPaymentMethod === 2 ? `2px solid ${Colors.get('difficulty', theme)} `: 'none',display: 'flex',alignItems: 'center',gap: '4px',}}>⭐<span>{langIndex === 0 ? 'TG звезды' : 'TG starts'}</span></div>
              <div onClick={() => setCurrentPaymentMethod(3)} style={{...styles(theme).text,fontSize: currentPaymentMethod === 3 ? '17px' : '14px',borderBottom: currentPaymentMethod === 3 ? `2px solid ${Colors.get('difficulty', theme)} `: 'none',display: 'flex',alignItems: 'center',gap: '4px',}}>💎<span>TON</span></div>
              
              </div>

             < PremiumButton langIndex={langIndex} clickHandler={() => setNeedAgreement(true)}  theme={theme} needSparcle={true}/>
             <button style={{...styles(theme).button,height:'40px',borderRadius:'20px',border:`2px solid ${Colors.get('border', theme)}`}} onClick={() => setPage(lastPage$.value)}>{langIndex === 0 ? 'Оформлю позднее' : 'I will do it later'}</button>    

             <div style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',gap: '12px',marginTop: '16px',padding: '0 10px',}}>
             {/* Карта */}
             <div style={{...styles(theme).subtext,display: 'flex',alignItems: 'center',gap: '4px',marginBottom: '16px',}}>
              <span>{PAYMENT_METHOD_DESCRIPTIONS[langIndex][currentPaymentMethod - 1]}</span>
             </div>
             
            </div>
          </div>}
          {hasPremium && !isValidation && <div style={{...styles(theme).panel}}>
              <img src={theme === 'dark' || theme === "specialdark" ? 'images/Ui/Main_Dark.png' : 'images/Ui/Main_Light.png'} style={{width:'50%'}} />
              <div style={{position: 'relative',width: '60px',height: '60px',margin: '10px',borderRadius: '50%',overflow: 'hidden',border: UserData.hasPremium ? 'none' : `3px solid ${Colors.get('border', theme)}`,boxSizing: 'border-box',}}>
                {/* User Photo */}
                <img style={{position: 'absolute',top: 2.5,left: 3, width: '90%',height: '90%',objectFit: 'cover',borderRadius: '50%',zIndex: 1,}}src={Array.isArray(UserData.photo) ? UserData.photo[0] : UserData.photo} alt="images/Ui/Guest.jpg"/>
                <img style={{position: 'absolute',top: 0,left: 0,width: '100%',height: '100%',objectFit: 'contain',zIndex: 2,}}src={'images/Ui/premiumborder.png'}/>
              </div>
              <div style={{color: Colors.get('subText', theme),fontSize: "18px",fontFamily: "Segoe UI"}}>{UserData.name}</div>
        
              <p style={styles(theme).text}>{langIndex === 0 ? '👑 премиум подписка активна 👑' : '👑 premium subscription active 👑'}</p>
              <div style={styles(theme).text}>{langIndex === 0 ? 'действует до ' + getEndDate() : 'active until ' + getEndDate()}</div>

              
          </div>}
          {isValidation && <div style={{...styles(theme).panel,justifyContent: 'space-around',height: '50vh'}}>
              <div style={{display:'flex',flexDirection:'column'}}>
               <span style={{fontSize:'55px'}}>⏳</span>
    <span style={styles(theme).text}>
      {langIndex === 0
        ? 'Проверяем оплату... Это может занять несколько минут.'
        : 'Verifying payment... This may take several minutes.'}
    </span>
    </div>
              <button style={{...styles(theme).button,height:'40px',borderRadius:'20px',border:`2px solid ${Colors.get('border', theme)}`}} onClick={() => setPage(lastPage$.value)}>{langIndex === 0 ? 'Выйти' : 'Exit'}</button>    
          </div>}
        </div>
    )
}
export default Premium;



const styles = (theme, keyboardVisible,fSize) => ({
  // Container styles
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2900,
    width:'100vw'
  },
  panel :
  {
    display:'flex',
    flexDirection:'column',
    alignItems: "center",
    borderRadius:"24px",
    border: `1px solid ${Colors.get('border', theme)}`,
    margin: "5px",
    backgroundColor:Colors.get('background', theme),
    width:"95vw",
    height: "90vh"
  },
  text :
  {
    textAlign: "center",
    fontSize:fSize ? "13px" : "15px",
    color: Colors.get('mainText', theme)
  },
  subtext:
  {
    textAlign: "center",
    fontSize:fSize ? "11px" : "13px",
    color: Colors.get('subText', theme)
  },
  button:
  {
    width:'85vw',
    height:'80px',
    marginTop:'5px',
    color: Colors.get('mainText', theme),
    backgroundColor:Colors.get('background', theme),
    borderRadius:"30px",
    marginBottom:'5px',
    fontSize:fSize ? "13px" : "15px",
  },
  miniIcon: {
    fontSize: "22px",
    marginRight:'12px',
    marginBottom:'8px',
    color: Colors.get('icons', theme)
  },
    cP :
      {
        display:'flex',
        flexDirection:'column',
        alignItems: "center",
        justifyContent: "space-around",
        border: `1px solid ${Colors.get('border', theme)}`,
        backgroundColor:Colors.get('background', theme),
        height:"85vh"
      },
      confirmContainer: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2900,
    },
})
function playEffects(sound){
  if(AppData.prefs[2] == 0 && sound !== null){
    if(!sound.paused){
        sound.pause();
        sound.currentTime = 0;
    }
    sound.volume = 0.5;
    sound.play();
  }
  if(AppData.prefs[3] == 0 && Telegram.WebApp.HapticFeedback)Telegram.WebApp.HapticFeedback.impactOccurred('light');
}

export function PremiumButton({ langIndex, clickHandler, theme,w = '90%',h='87px',fSize='20px',br="30px", textToShow = [ 'Получить премиум' , 'Get Premium'] , needSparcle}) {
  return (
    <button
     onClick ={clickHandler}
      style={{
        ...styles(theme).button,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px 32px',
        fontSize: '17px',
        fontWeight: '700',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        overflow: 'hidden',
        width:w,
        height:h,
         marginTop:'5px',
        color: Colors.get('mainText', theme),
        borderRadius:br,
        marginBottom:'5px',
        zIndex: 1,
        boxShadow: '0 6px 20px rgba(21, 79, 236, 0.4)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, filter 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(21, 79, 236, 0.6)';
        e.currentTarget.style.filter = 'brightness(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(21, 79, 236, 0.4)';
        e.currentTarget.style.filter = 'brightness(1)';
      }}
    >
      {/* Animated Gradient Layer */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'linear-gradient(45deg, #154fec, #4e73f2, #154fec, #6a82fb, #154fec)',
          backgroundSize: '300% 300%',
          animation: 'premiumGradient 4s ease infinite',
          zIndex: -1,
        }}
      />

      {/* Inner Fill (for crisp edge) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 15, 40, 0.4)',
          borderRadius: '30px',
          zIndex: -1,
        }}
      />

      {/* Content */}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
       <span style={{ marginRight: '8px',marginLeft: '8px',marginBottom:'8px', fontSize: '1.2em' }}>{needSparcle ? '👑' : ''}</span>
        {textToShow[langIndex]}
        <span style={{ marginRight: '8px',marginLeft: '8px',marginBottom:'8px', fontSize: '1.2em' }}>{needSparcle ? '👑' : ''}</span>
      </span>

      {/* Glow Effect */}
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          right: '2px',
          bottom: '2px',
          borderRadius: '26px',
          boxShadow: 'inset 0 0 12px rgba(255, 255, 255, 0.2)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Animation Style Tag */}
      <style>{`
        @keyframes premiumGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        button {
          will-change: transform, filter;
        }
      `}</style>
    </button>
  );
}
const PAYMENT_METHOD_DESCRIPTIONS = [
  [
    'Быстрая и безопасная оплата через СБП 📱',
    'Мгновенная покупка за Telegram Stars ⭐',
    'Анонимная оплата в TON-криптовалюте 💎'
  ],
  [
    'Fast and secure payment via SBP 📱',
    'Instant purchase with Telegram Stars ⭐',
    'Anonymous payment in TON cryptocurrency 💎'
  ]
];
const getMiniPolicy = (langIndex) => {
  return langIndex === 0 ? `📌 Условия оплаты UltyMyLife

• Нет пробного периода — стартуйте с минимального тарифа.
• Возврат невозможен — услуга цифровая, цены минимальны.
• Данные — локально, без облака, анонимные LLM-запросы.
• Подписка не продлевается автоматически.
• Поддержка: @diiimaaan777

• Подписка станет доступна сразу после проверки оплаты ✅
• Проверка может занять до 5 минут ⏳

👉 Оплачивая, вы соглашаетесь с этими условиями.`
    : 
    `📌 Summary: UltyMyLife Payment Terms

• No trial — start with the lowest plan
• No refunds — digital service at minimal cost
• Your data stays local, AI queries are anonymous
• No auto-renewal 
• Support: [@diiimaaan777](https://t.me/diiimaaan777)

• Your subscription will be activated right after payment verification ✅
• Verification may take up to 5 minutes ⏳

👉 By making a payment, you agree to these terms.`
}
const getFullPolicy = (langIndex) => {
  return langIndex === 0 ? `Политика оплаты UltyMyLife

> *Последнее обновление: 13 января 2026 г.*

1. Общие положения
UltyMyLife — Telegram Mini App для саморазвития с ИИ-аналитикой. Доступ к расширенным функциям (трекинг привычек, ИИ-анализ сна, ментальные практики, персонализированные рекомендации) предоставляется по подписке.

Оплата возможна через:
- **СБП (₽)** — рубли;
- **Telegram Stars (★)** — внутренняя валюта Telegram;
- **TON** — криптовалюта, поддерживаемая кошельками Telegram.

Цены указаны без НДС (для РФ НДС включён автоматически при оплате через СБП).

---

 2. Тарифы

| Период       | СБП     | Stars   | TON     |
|--------------|---------|---------|---------|
| 1 месяц      | 149 ₽   | 89 ★    | 0.35 TON |
| 3 месяца     | 399 ₽   | 229 ★   | 0.95 TON |
| 12 месяцев  | 999 ₽   | 699 ★   | 3.2 TON |

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
Все данные хранятся локально (SQLite), не передаются третьим лицам. Запросы к ИИ отправляются анонимно, без привязки к вашему аккаунту.

---

 6. Изменение условий
Мы оставляем за собой право изменять тарифы и условия. Об изменениях уведомим заранее через интерфейс приложения или Telegram-бота.

---

 7. Поддержка
📩 пишите с указанием Telegram ID и даты оплаты.


`
    : 
    `UltyMyLife Payment Policy

> *Last updated: January 13, 2026*

1. General Provisions  
UltyMyLife is a Telegram Mini App for self-improvement powered by AI analytics. Access to advanced features (habit tracking, AI sleep analysis, mental exercises, and personalized recommendations) is available via subscription.

Payment methods supported:  
- **SBP (₽)** — Russian rubles;  
- **Telegram Stars (★)** — Telegram’s in-app currency;  
- **TON** — cryptocurrency supported by Telegram Wallet.

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
All data is stored **locally** (SQLite) and **never shared with third parties**. AI requests are sent **anonymously**, with no linkage to your Telegram account.

---

6. Changes to Terms  
We reserve the right to update pricing or terms. Users will be notified in advance via the app interface or Telegram bot.

---

7. Support  
📩  please include your **Telegram ID** and **payment date** when contacting us.


`
}



