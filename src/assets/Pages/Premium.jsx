import { useState, useEffect} from 'react';
import { AppData , UserData} from '../StaticClasses/AppData.js';
import Colors from '../StaticClasses/Colors';
import { lastPage$, setPage,theme$,lang$,premium$,fontSize$,setPremium} from '../StaticClasses/HabitsBus';
import {FaBrain,FaChartBar,FaAd,FaBan,FaFlask} from 'react-icons/fa'
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 365);
const monthNames = [
  ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
];
const Premium = () => {
    // Theme and language state
    const [theme, setTheme] = useState(theme$.value);
    const [fSize,setFontSize] = useState(fontSize$.value);
    const [hasPremium,setHasPremium] = useState(premium$.value);
    const [langIndex,setLangIndex] = useState(AppData.prefs[0]);
    const [chosenCard,setChosenCard] = useState(1);
    const [currentEndDate,setCurrentEndDate] = useState(UserData.premiumEndDate);
    const [endDate,setEndDate] = useState(futureDate);

    const [needToChangeSubscription,setNeedToChangeSubscription] = useState(false);

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
            return () => {
                themeSubscription.unsubscribe();
                langSubscription.unsubscribe();
                fontSizeSubscription.unsubscribe();
                premiumSubscription.unsubscribe();
            };
        }, []);

    function getEndDate() {
      const endDate = currentEndDate.toISOString().split('T')[0]
      const year = endDate.slice(0, 4);
      const day = parseInt(endDate.slice(8), 10);
      const monthIndex = parseInt(endDate.slice(5, 7), 10) - 1; // "12" → 11
      return `${day} ${monthNames[langIndex][monthIndex]} ${year} `;
    }
    function getPremium() {
        UserData.hasPremium = true;
        UserData.premiumEndDate = endDate;
        setCurrentEndDate(endDate);
        setPremium(true);
    }
    function extendPremium() {
        const daysAmount = chosenCard === 3 ? 30 : chosenCard === 2 ? 90 : 365;
        const futureDate = currentEndDate;
        futureDate.setDate(futureDate.getDate() + daysAmount);
        UserData.premiumEndDate = futureDate;
        setCurrentEndDate(futureDate);
        setEndDate(futureDate);
        setNeedToChangeSubscription(false);
    }
    
    
    return (
        <div style={{...styles(theme).container}}>
           {!hasPremium && <div style={{...styles(theme).panel}}>
            <img src={theme === 'dark' || theme === "specialdark" ? 'images/Ui/Main_Dark.png' : 'images/Ui/Main_Light.png'} style={{width:'50%'}} />
            <div style={{...styles(theme).subtext}}>{'premium'}</div>
             <div style={{display:'flex',flexDirection:'column',width:'70vw',height:'22%',alignItems:'flex-start',justifyContent:'center'}}>
             <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyItems:'center',height:'35px'}}>
               <FaBrain style={{...styles(theme).miniIcon}}/>
               <div style={styles(theme).text}>{langIndex === 0 ? 'доступ к расширенным функциям' : 'get access to premium features'}</div>
             </div>
             <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyItems:'center',height:'35px'}}>
               <FaChartBar style={{...styles(theme).miniIcon}}/>
               <div style={styles(theme).text}>{langIndex === 0 ? 'детальная статистика' : 'detailed statistics'}</div>
             </div>
             <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyItems:'center',height:'35px'}}>
               <FaFlask style={{...styles(theme).miniIcon}}/>
               <div style={styles(theme).text}>{langIndex === 0 ? 'бета тестирование новых функций' : 'beta testing new features'}</div>
             </div>
             <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyItems:'center',height:'35px'}}>
               <div style={{position: 'relative',marginRight:'12px',display: 'inline-flex',alignItems: 'center',justifyContent: 'center',width:'1.5em',height: '1.5em'}}>
                 <FaAd style={{ ...styles(theme).miniIcon,position: 'absolute',top: 2,left: 2,width: '80%',height: '80%', zIndex: 1 }} />
                 <FaBan style={{ position: 'absolute',top: 0,left: 0,width: '100%',height: '100%',color: 'red',zIndex: 2,opacity: 0.8}} />
               </div>
               <div style={styles(theme).text}>{langIndex === 0 ? 'никакой рекламы' : 'ads free'}</div>
             </div>
             </div>
              <div style={{position: 'relative',display: 'flex',margin: '5px',width: '70vw',height: '65px',borderRadius: '12px',}}>
              {/* Animated Gradient Border */}
              <div className="premium-border" />
                <div onClick={() => {setChosenCard(1);}}
                id={1} style={{position: 'relative',display: 'flex',flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',backgroundColor:chosenCard === 1 ? '#6197cdff' : Colors.get('simplePanel', theme),borderRadius: '12px',width: '100%',height: '100%',paddingLeft: '12px',paddingRight: '12px',zIndex: 2,}}>
                <div style={{ ...styles(theme).text, fontSize: '28px' }}>{langIndex === 0 ? '1 год' : '1 year'}</div>
                <div style={{display: 'flex',flexDirection: 'column',alignItems: 'flex-end',}}>
                 <div style={{ ...styles(theme).text, fontSize: '24px' }}>{'999 ₽'}</div>
                 <div style={{ ...styles(theme).text, fontSize: '14px' }}>{'83₽/' + (langIndex === 0 ? 'мес' : 'mon')}</div>
               </div>
              </div>
             {/* Centered "HIT" badge */}
             <div style={{position: 'absolute',top: '-8px',left: '50%',transform: 'translateX(-50%)',background: 'linear-gradient(90deg, #00B4FF, #FF00C8)',color: 'white',fontSize: '12px',fontWeight: 'bold',padding: '2px 10px',borderRadius: '12px',boxShadow: '0 2px 4px rgba(0,0,0,0.2)',zIndex: 3,whiteSpace: 'nowrap',}}>{langIndex === 0 ? 'ХИТ' : 'HIT'}</div>
             </div>
             <div onClick={() => {setChosenCard(2);}}
              id={2} style={{display:'flex',margin:'5px',flexDirection:'row',borderRadius:'12px',alignItems:'center',backgroundColor:chosenCard === 2 ? '#6197cdff' : Colors.get('simplePanel', theme),justifyContent:'space-between',width:'70vw',height:'65px'}}>
                <div style={{...styles(theme).text,marginLeft:'12px',fontSize:'28px'}}>{langIndex === 0 ? '3 месяца' : '3 month'}</div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyItems:'center'}}>
                  <div style={{...styles(theme).text,marginRight:'12px',fontSize:'24px'}}>{'390 ₽'}</div>
                  <div style={{...styles(theme).text,marginRight:'12px',fontSize:'14px'}}>{'130₽/' + (langIndex === 0 ? 'мес' : 'mon')}</div>
                </div>
             </div>
             <div onClick={() => {setChosenCard(3);}}
              id={3} style={{display:'flex',margin:'5px',flexDirection:'row',borderRadius:'12px',alignItems:'center',backgroundColor:chosenCard === 3 ? '#6197cdff' : Colors.get('simplePanel', theme),justifyContent:'space-between',width:'70vw',height:'65px'}}>
                <div style={{...styles(theme).text,marginLeft:'12px',fontSize:'28px'}}>{langIndex === 0 ? '1 месяц' : '1 month'}</div>
                  <div style={{...styles(theme).text,marginRight:'12px',fontSize:'24px'}}>{'169 ₽'}</div>
             </div>
             <button style={{...styles(theme).button,backgroundColor:'#154fecff'}} onClick={() => {getPremium();}}>{langIndex === 0 ? 'Получить премиум' : 'Get premium'}</button>    
             <button style={{...styles(theme).button,border:`2px solid ${Colors.get('border', theme)}`}} onClick={() => setPage(lastPage$.value)}>{langIndex === 0 ? 'Оформлю позднее' : 'I will do it later'}</button>    

             <div style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',gap: '12px',marginTop: '16px',padding: '0 10px',}}>
             {/* Карта */}
             <div style={{...styles(theme).subtext,display: 'flex',alignItems: 'center',gap: '4px',}}>
              <span>📱</span><span>{langIndex === 0 ? 'Быстрая и безопасная оплата через СБП' : 'Fast and secure payment via SBP'}</span>
             </div>
             
            </div>
          </div>}
          {hasPremium && <div style={{...styles(theme).panel}}>
              <img src={theme === 'dark' || theme === "specialdark" ? 'images/Ui/Main_Dark.png' : 'images/Ui/Main_Light.png'} style={{width:'50%'}} />
              <div style={{position: 'relative',width: '60px',height: '60px',margin: '10px',borderRadius: '50%',overflow: 'hidden',border: UserData.hasPremium ? 'none' : `3px solid ${Colors.get('border', theme)}`,boxSizing: 'border-box',}}>
                {/* User Photo */}
                <img style={{position: 'absolute',top: 2.5,left: 3, width: '90%',height: '90%',objectFit: 'cover',borderRadius: '50%',zIndex: 1,}}src={Array.isArray(UserData.photo) ? UserData.photo[0] : UserData.photo} alt="images/Ui/Guest.jpg"/>
                <img style={{position: 'absolute',top: 0,left: 0,width: '100%',height: '100%',objectFit: 'contain',zIndex: 2,}}src={'images/Ui/premiumborder.png'}/>
              </div>
              <div style={{color: Colors.get('subText', theme),fontSize: "18px",fontFamily: "Segoe UI"}}>{UserData.name}</div>
        
              <p style={styles(theme).text}>{langIndex === 0 ? '👑 премиум подписка активна 👑' : '👑 premium subscription active 👑'}</p>
              <div style={styles(theme).text}>{langIndex === 0 ? 'действует до ' + getEndDate() : 'active until ' + getEndDate()}</div>

              {needToChangeSubscription && <div style={{position: 'relative',display: 'flex',margin: '5px',marginTop:'35px',width: '70vw',height: '65px',borderRadius: '12px',}}>
              {/* Animated Gradient Border */}
              <div className="premium-border" />
                <div onClick={() => {setChosenCard(1);}}
                id={1} style={{position: 'relative',display: 'flex',flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',backgroundColor:chosenCard === 1 ? '#6197cdff' : Colors.get('simplePanel', theme),borderRadius: '12px',width: '100%',height: '100%',paddingLeft: '12px',paddingRight: '12px',zIndex: 2,}}>
                <div style={{ ...styles(theme).text, fontSize: '28px' }}>{langIndex === 0 ? '1 год' : '1 year'}</div>
                <div style={{display: 'flex',flexDirection: 'column',alignItems: 'flex-end',}}>
                 <div style={{ ...styles(theme).text, fontSize: '24px' }}>{'999 ₽'}</div>
                 <div style={{ ...styles(theme).text, fontSize: '14px' }}>{'83₽/' + (langIndex === 0 ? 'мес' : 'mon')}</div>
               </div>
              </div>
             {/* Centered "HIT" badge */}
             <div style={{position: 'absolute',top: '-8px',left: '50%',transform: 'translateX(-50%)',background: 'linear-gradient(90deg, #00B4FF, #FF00C8)',color: 'white',fontSize: '12px',fontWeight: 'bold',padding: '2px 10px',borderRadius: '12px',boxShadow: '0 2px 4px rgba(0,0,0,0.2)',zIndex: 3,whiteSpace: 'nowrap',}}>{langIndex === 0 ? 'ХИТ' : 'HIT'}</div>
             </div>}

              {needToChangeSubscription && <div onClick={() => {setChosenCard(2);}}
              id={2} style={{display:'flex',margin:'5px',flexDirection:'row',borderRadius:'12px',alignItems:'center',backgroundColor:chosenCard === 2 ? '#6197cdff' : Colors.get('simplePanel', theme),justifyContent:'space-between',width:'70vw',height:'65px'}}>
                <div style={{...styles(theme).text,marginLeft:'12px',fontSize:'28px'}}>{langIndex === 0 ? '3 месяца' : '3 month'}</div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyItems:'center'}}>
                  <div style={{...styles(theme).text,marginRight:'12px',fontSize:'24px'}}>{'390 ₽'}</div>
                  <div style={{...styles(theme).text,marginRight:'12px',fontSize:'14px'}}>{'130₽/' + (langIndex === 0 ? 'мес' : 'mon')}</div>
                </div>
             </div>}

              {needToChangeSubscription && <div onClick={() => {setChosenCard(3);}}
              id={3} style={{display:'flex',margin:'5px',flexDirection:'row',borderRadius:'12px',alignItems:'center',backgroundColor:chosenCard === 3 ? '#6197cdff' : Colors.get('simplePanel', theme),justifyContent:'space-between',width:'70vw',height:'65px'}}>
                <div style={{...styles(theme).text,marginLeft:'12px',fontSize:'28px'}}>{langIndex === 0 ? '1 месяц' : '1 month'}</div>
                  <div style={{...styles(theme).text,marginRight:'12px',fontSize:'24px'}}>{'169 ₽'}</div>
             </div>}

             <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',gap:'5px',marginBottom:'12px',marginTop:'auto'}}>
              {needToChangeSubscription && <button style={{...styles(theme).button,backgroundColor:'#154fecff'}} onClick={() => {extendPremium()}}>{langIndex === 0 ? 'Подтвердить' : 'Confirm'}</button> }
              {!needToChangeSubscription  && <button style={{...styles(theme).button,backgroundColor:'#154fecff'}} onClick={() => {setNeedToChangeSubscription(true)}}>{langIndex === 0 ? 'Продлить подписку' : 'Extend subscription'}</button> }
              <button style={{...styles(theme).button,border:`2px solid ${Colors.get('border', theme)}`}} onClick={() => setPage(lastPage$.value)}>{langIndex === 0 ? 'Закрыть' : 'Close'}</button>    
             </div>
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
    height: "85vh"
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
    height:'60px',
    marginTop:'2px',
    color: Colors.get('mainText', theme),
    backgroundColor:Colors.get('background', theme),
    borderRadius:"30px",
    marginBottom:'2px',
    fontSize:fSize ? "13px" : "15px",
  },
  miniIcon: {
    fontSize: "22px",
    marginRight:'12px',
    marginBottom:'8px',
    color: Colors.get('icons', theme)
  }
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

