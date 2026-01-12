
import { useState, useEffect} from 'react';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { addPanel$ ,theme$,lang$,fontSize$,setAddPanel} from '../../StaticClasses/HabitsBus';
import { getInsight } from './InsightHelper.js';
import { MdClose } from 'react-icons/md';

const click = new Audio('Audio/Click.wav');




const SleepInsight = () => {
    // Theme and language state
    const [theme, setTheme] = useState(theme$.value);
    const [fSize,setFontSize] = useState(fontSize$.value);
    const [langIndex,setLangIndex] = useState(AppData.prefs[0]);
    const [addPanelState,setAddPanelState] = useState(addPanel$.value);
    const [opacity, setOpacity] = useState(0);

    const [insight,setInsight] = useState('');
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
  const fetchInsight = async () => {
    try {
      const result = await getInsight(langIndex); // ← pass langIndex!
      setInsight(result); // ✅ extract the string
    } catch (err) {
      // Fallback message
      const fallback = langIndex === 0 
        ? 'Не удалось загрузить инсайт. Попробуйте позже.' 
        : 'Failed to load insight. Please try again.';
      setInsight(fallback);
    } finally {
      setLoading(false);
    }
  };

  fetchInsight();
}, [langIndex]);


    useEffect(() => {
    const subscription = theme$.subscribe(setTheme);
    const fontSizeSubscription = fontSize$.subscribe(setFontSize);
    return () => {
      subscription.unsubscribe();
      fontSizeSubscription.unsubscribe();
    };
    }, []);
    useEffect(() => {
            const themeSubscription = theme$.subscribe(setTheme);
            const langSubscription = lang$.subscribe((lang) => {
                setLangIndex(lang === 'ru' ? 0 : 1);
            });
            return () => {
                themeSubscription.unsubscribe();
                langSubscription.unsubscribe();
            };
        }, []);
    useEffect(() => {
      const subscription = addPanel$.subscribe(setAddPanelState);
      if(addPanelState === 'SleepInsight')setTimeout(() => setOpacity(1),400);
      else setOpacity(0);
      return () => {
        subscription.unsubscribe();
      };
    }, [addPanelState]);
    
    return (
        <div style={{...styles(theme).container,
          transform: addPanelState === 'SleepInsight' ? 'translateX(0)' : 'translateX(-100%)',
          backgroundColor: opacity === 1 ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
          transition: 'transform 0.3s ease-in-out, background-color 0.1s ease-in-out',
        }}>
         <div  style={styles(theme).panel}>
           
           <div style={{fontSize:fSize === 0 ? '15px' : '18px',color:Colors.get('mainText', theme),fontWeight:'bold'}}>{langIndex === 0 ? 'ИИ анализ🤖✨' : 'AI analysis🤖✨'}</div>
           <div style={{width:'90%',height:'80%',overflowY:'scroll',borderTop:`1px solid ${Colors.get('border', theme)}`,
           borderBottom:`1px solid ${Colors.get('border', theme)}`,padding:'16px', fontSize:fSize === 0 ? '14px' : '16px',color:Colors.get('mainText', theme),textAlign:'left'}}>
           {
  loading ? (
    langIndex === 0 
      ? 'Формирую инсайт... 🤖' 
      : 'Forming insight... 🤖'
  ) : (
    <div>
      {insight.split('\n').map((line, i) => (
        <p key={i} style={{ margin: '0.5em 0' }}>{line}</p>
      ))}
    </div>
  )
}
           </div>
          <div>
          <MdClose onClick={() => {setAddPanel('')}} style={{fontSize:'42px',color:Colors.get('icons', theme)}}/>
          <div style={{fontSize:'9px',color:Colors.get('subText', theme)}}>{langIndex === 0 ? 'закрыть' : 'close'}</div>
          </div>
         </div> 
        </div>
    )
}
export default SleepInsight;

const styles = (theme, fSize) => ({
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
    alignItems:'center',
    justifyContent:'space-around',
    borderRadius:"24px",
    border: `1px solid ${Colors.get('border', theme)}`,
    margin: "5px",
    backgroundColor:Colors.get('background', theme),
    boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
    marginTop:'10vh',
    width:"95vw",
    height: "79vh",
    padding:'5px',
    marginBottom:'16%'
  },
  text :
  {
    textAlign: "center",
    fontSize:fSize ? "13px" : "15px",
    color: Colors.get('mainText', theme),
    marginBottom:'12px'
  }
  
})


