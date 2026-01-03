
import { useState, useEffect} from 'react';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { addPanel$ ,theme$,lang$,fontSize$,setAddPanel} from '../../StaticClasses/HabitsBus';
import { getInsight } from './InsightHelper.js';

const click = new Audio('Audio/Click.wav');




const SleepInsight = ({dateString}) => {
    // Theme and language state
    const [theme, setTheme] = useState(theme$.value);
    const [fSize,setFontSize] = useState(fontSize$.value);
    const [langIndex,setLangIndex] = useState(AppData.prefs[0]);
    const [addPanelState,setAddPanelState] = useState(addPanel$.value);
    const [opacity, setOpacity] = useState(0);

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
         <div onClick={() => {setAddPanel('')}} style={styles(theme).panel}>
           
           
           {getInsight()}


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
    alignItems: "center",
    justifyItems: "center",
    borderRadius:"24px",
    border: `1px solid ${Colors.get('border', theme)}`,
    margin: "5px",
    backgroundColor:Colors.get('background', theme),
    boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
    width:"95vw",
    height: "50vh",
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


