import { useEffect, useState} from 'react'
import {AppData} from '../../StaticClasses/AppData'
import Colors from "../../StaticClasses/Colors"
import {theme$} from '../../StaticClasses/HabitsBus';
import { FaEraser,FaCheck } from 'react-icons/fa';
const tap= new Audio('Audio/Tap.wav');

const keys = {
    0:[
       ['1','2','3'],
       ['4','5','6'],
       ['7','8','9'],
       ['0']
    ],
    1:[
       ['←','1','2','3'],
       ['→','4','5','6'],
       ['↓','7','8','9'],
       ['↑','0']
    ],
    2:[
       ['1','2','3'],
       ['4','5','6'],
       ['7','8','9'],
       ['0']
    ],
   3:[
       [''],
       ['true'],
       ['false'],
       [''],
    ],
};


const MentalInput = ({setInput,type}) => {
    const [theme, setthemeState] = useState('dark');
    const [currentKey,setCurrentKey] = useState('000');
   
    useEffect(() => {
       const timeout = setTimeout(() => setCurrentKey('000'), 100);
       return () => clearTimeout(timeout);
    }, [currentKey]);
    useEffect(() => {
        const subscription = theme$.subscribe(setthemeState);
       
        return () => {
            subscription.unsubscribe();
        }
    }, []);
    function click(key){
      setInput(key);
      setCurrentKey(key);
      playEffects(tap);
    }
    
    return (
      
       <div style={styles(theme).container } >
        <div style={styles(theme).container }>
         <div style={styles(theme).rowPanel}>
            {keys[type][0].map((key) => (
              <div onClick={() => click(key)} key={key} style={keyStyle(theme,key,currentKey)}>
                <p  key={key} style={styles(theme).text}>{key}</p>
              </div>
            ))}
         </div>
         {/*second line*/}
         <div style={styles(theme).rowPanel}>
            {keys[type][1].map((key) => (
              <div onClick={() => click(key)} key={key} style={keyStyle(theme,key,currentKey)}>
                <p  key={key} style={styles(theme).text}>{key}</p>
              </div>
            ))}
         </div>
         {/*third line*/}
         <div style={styles(theme).rowPanel}>
             
            {keys[type][2].map((key) => (
              <div onClick={() => click(key)} key={key} style={keyStyle(theme,key,currentKey)}>
                <p  key={key} style={styles(theme).text}>{key}</p>
              </div>
            ))}
         </div>
         {/*last line*/}
         <div style={styles(theme).rowPanel}>
              <div onClick={() => {click('CC')}} style={{...keyStyle(theme,'CC',currentKey),backgroundColor:Colors.get('difficulty3', theme)}}>
                <FaEraser style={styles(theme).text}/>
              </div>
              {keys[type][3].map((key) => (
              <div onClick={() => click(key)} key={key} style={keyStyle(theme,key,currentKey)}>
                <p  key={key} style={styles(theme).text}>{key}</p>
              </div>
            ))}
              <div onClick={() => {click('>>>')}} style={{...keyStyle(theme,'>>>',currentKey),backgroundColor:Colors.get('difficulty', theme)}}>
                <FaCheck style={styles(theme).text}/>
              </div>
         </div>
         </div>
       </div>

    )
}

export default MentalInput

const keyStyle = (theme,key = 0,ownKey = 1) => ({
     display:'inline-flex',
     alignItems:'center',
     justifyContent:'center',
     width:' 30%',
     margin:'5px',
     height:'90%',
     backgroundColor: Colors.get('mathInput', theme),
     boxShadow : ownKey === key ? '0px 0px 9px 9px' +  Colors.get('difficulty', theme) : 'none',
     borderRadius:'24px',
    
  })
const styles = (theme) =>
({
    container :
   {
     backgroundColor:Colors.get('background', theme),
     display: "flex",
     position:'fixed',
     flexDirection: "column",
     alignItems: "center",
     height: "35vh",
     bottom: '0',
     width: "100vw",
     fontFamily: "Segoe UI",
     borderTop:`2px solid ${Colors.get('border', theme)}`,
     borderTopLeftRadius:'12px',
     borderTopRightRadius:'12px',
     zIndex:5000
  },
  rowPanel :
  {
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    padding:'2px',
    width: '90%',
    height:'22%',
    marginBottom:'3px',
    marginTop:'3px',
    alignItems: "center",
  },
  text:
  {
    fontSize: "30px",
    fontWeight:'bold',
    color: Colors.get('mainText', theme),
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