import { useState, useEffect} from 'react';
import { AppData , UserData} from '../StaticClasses/AppData.js';
import Colors from '../StaticClasses/Colors';
import { lastPage$, setPage,theme$,lang$,fontSize$} from '../StaticClasses/HabitsBus';
import {FaBrain,FaChartBar,FaAd,FaBan,FaFlask} from 'react-icons/fa'

const Premium = () => {
    // Theme and language state
    const [theme, setTheme] = useState(theme$.value);
    const [lang, setLang] = useState(lang$.value);
    const [fSize,setFontSize] = useState(fontSize$.value);
    const [langIndex,setLangIndex] = useState(AppData.prefs[0]);
    const [chosenCard,setChosenCard] = useState(-1);


    useEffect(() => {
            const themeSubscription = theme$.subscribe(setTheme);
            const fontSizeSubscription = fontSize$.subscribe(setFontSize);
            const langSubscription = lang$.subscribe((lang) => {
                setLangIndex(lang === 'ru' ? 0 : 1);
            });
            return () => {
                themeSubscription.unsubscribe();
                langSubscription.unsubscribe();
                fontSizeSubscription.unsubscribe();
            };
        }, []);
    
    return (
        <div style={{...styles(theme).container}}>
           <div style={{...styles(theme).panel}}>
            <img src={theme === 'dark' || theme === "specialdark" ? 'images/Ui/Main_Dark.png' : 'images/Ui/Main_Light.png'} style={{width:'50%'}} />
            <div style={{...styles(theme).text,color:'#eb9a29c4'}}>{'premium'}</div>
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
                <div onClick={() => setChosenCard(1)}
                id={1} style={{position: 'relative',display: 'flex',flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',backgroundColor:chosenCard === 1 ? '#6197cdff' : Colors.get('simplePanel', theme),borderRadius: '12px',width: '100%',height: '100%',paddingLeft: '12px',paddingRight: '12px',zIndex: 2,}}>
                <div style={{ ...styles(theme).text, fontSize: '28px' }}>{langIndex === 0 ? '1 год' : '1 year'}</div>
                <div style={{display: 'flex',flexDirection: 'column',alignItems: 'flex-end',}}>
                 <div style={{ ...styles(theme).text, fontSize: '24px' }}>{'999 ₽'}</div>
                 <div style={{ ...styles(theme).subtext, fontSize: '14px' }}>{'83₽/' + (langIndex === 0 ? 'мес' : 'mon')}</div>
               </div>
              </div>
             {/* Centered "HIT" badge */}
             <div style={{position: 'absolute',top: '-8px',left: '50%',transform: 'translateX(-50%)',background: 'linear-gradient(90deg, #00B4FF, #FF00C8)',color: 'white',fontSize: '12px',fontWeight: 'bold',padding: '2px 10px',borderRadius: '12px',boxShadow: '0 2px 4px rgba(0,0,0,0.2)',zIndex: 3,whiteSpace: 'nowrap',}}>{langIndex === 0 ? 'ХИТ' : 'HIT'}</div>
             </div>
             <div onClick={() => setChosenCard(2)}
              id={2} style={{display:'flex',margin:'5px',flexDirection:'row',borderRadius:'12px',alignItems:'center',backgroundColor:chosenCard === 2 ? '#6197cdff' : Colors.get('simplePanel', theme),justifyContent:'space-between',width:'70vw',height:'65px'}}>
                <div style={{...styles(theme).text,marginLeft:'12px',fontSize:'28px'}}>{langIndex === 0 ? '3 месяца' : '3 month'}</div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyItems:'center'}}>
                  <div style={{...styles(theme).text,marginRight:'12px',fontSize:'24px'}}>{'390 ₽'}</div>
                  <div style={{...styles(theme).subtext,marginRight:'12px',fontSize:'14px'}}>{'130₽/' + (langIndex === 0 ? 'мес' : 'mon')}</div>
                </div>
             </div>
             <div onClick={() => setChosenCard(3)}
              id={3} style={{display:'flex',margin:'5px',flexDirection:'row',borderRadius:'12px',alignItems:'center',backgroundColor:chosenCard === 3 ? '#6197cdff' : Colors.get('simplePanel', theme),justifyContent:'space-between',width:'70vw',height:'65px'}}>
                <div style={{...styles(theme).text,marginLeft:'12px',fontSize:'28px'}}>{langIndex === 0 ? '1 месяц' : '1 month'}</div>
                  <div style={{...styles(theme).text,marginRight:'12px',fontSize:'24px'}}>{'169 ₽'}</div>
             </div>
             <button style={{...styles(theme).button,backgroundColor:'#154fecff'}} onClick={() => {}}>{langIndex === 0 ? 'Получить премиум' : 'Get premium'}</button>    
             <button style={{...styles(theme).button,border:`2px solid ${Colors.get('border', theme)}`}} onClick={() => setPage(lastPage$.value)}>{langIndex === 0 ? 'Оформлю позднее' : 'I will do it later'}</button>    

             <div style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',gap: '12px',marginTop: '16px',padding: '0 10px',}}>
             {/* Карта */}
             <div style={{...styles(theme).subtext,display: 'flex',alignItems: 'center',gap: '4px',}}>
              <span>💳</span><span>{langIndex === 0 ? 'Карта/' : 'Card/'}</span><span>СБП </span><span>| Telegram Stars</span><span>⭐</span>
             </div>
             
            </div>
            <div style={{...styles(theme).subtext,fontSize:'10px',marginBottom:'12px'}}>
              {langIndex === 0 ? 'Безопасная оплата. Отмена в любое время' : 'Safe payment. Cancel at any time'}
             </div>
          </div>
        </div>
    )
}
export default Premium;



const styles = (theme, keyboardVisible,fSize) => ({
  // Container styles
  container: {
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
