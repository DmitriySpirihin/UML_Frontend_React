import { useEffect, useState, useRef } from 'react'
import {AppData} from '../StaticClasses/AppData'
import Colors from "../StaticClasses/Colors"
import {theme$,lang$,keyboardNeeded$,setCurrentKeyboardString,setKeyboardNeeded} from '../StaticClasses/HabitsBus';
import { MdBackspace} from "react-icons/md"
import { IoLanguage } from "react-icons/io5"
import { FaArrowUp ,FaSmileWink,FaArrowDown} from "react-icons/fa"
import { FiCornerDownLeft } from "react-icons/fi"
import {useLongPress} from '../Helpers/LongPress'
const tap= new Audio('Audio/Tap.wav');

const keys = {
    0: [
       ['й','ц','у','к','е','н','г','ш','щ','з','х','ъ'],
       ['ф','ы','в','а','п','р','о','л','д','ж','э'],
       ['я','ч','с','м','и','т','ь','б','ю'],
    ],
    1: [
       ['q','w','e','r','t','y','u','i','o','p'],
       ['a','s','d','f','g','h','j','k','l'],
       ['z','x','c','v','b','n','m'],
    ],
    2: [
       ['1','2','3','4','5','6','7','8','9','0'],
       ['!','?','/','|','#','@','%',':','+','-'],
       ['<','>','=','*','&','^','~',':',';']
    ]
};
const emojis = [
  "😂", "😍", "🥰", "🤣", "😊", "🙏", "💕", "😭", "😘", "🥲",
  "😅", "👍", "😁", "😎", "🥳", "🤔", "🤗", "😏", "😇", "🙌",
  "😉", "😋", "😜", "🤩", "😢", "😆", "🎉", "😡", "😱", "😴",
  "❤️", "🤤", "🥺", "😬", "🤪", "😳", "😤", "💔", "😐", "😑",
  "😒", "🙄", "😔", "😛", "🤨", "🤭", "😚", "🤫", "😝", "🤤",
  "😥", "💖", "🥵", "🥶", "😓", "🌚", "😈", "👀", "🫠", "🥴",
  "😯", "😮‍💨", "🥹", "😵‍💫", "😲", "😕", "💪", "😃", "😄", "🤦‍♂️",
  "🤦‍♀️", "🙃", "🤝", "🎶", "💃", "😹", "😺", "👋", "👻", "💩",
  "🤡", "🙈", "✨", "🔥", "🎂", "🎁", "🌸", "🌹", "🥗", "🍕",
  "🍔", "🍣", "🥟", "🍰", "🧁", "🍉", "🍦", "☕", "🍺", "🍻",
  "🏆", "⚽", "🏀", "🎮", "💯", "🥇", "🧠", "🫶", "👑", "😇",
  "😷", "🤒", "🤕", "🥴", "🤧", "🤑", "🤠", "🤓", "🧐", "🙃",
  "🥳", "🤓", "😈", "😸", "😺", "😻", "😼", "😹", "😽", "🙀",
  "😿", "😾", "👾", "🦄", "🐶", "🐱", "🐭", "🐹", "🐰", "🦊",
  "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "👍",
  "👎", "👏", "👐", "🤲", "🙏", "🤝", "✌️", "🤟", "🤘", "👌",
  "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋",
  "🤙", "💪", "🦾", "🦵", "🦶", "👂", "👃", "🧠", "🦷", "👀"
];


const KeyBoard = () => {
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [needKeyBoard,setNeedKeyBoard] = useState(false);
    const [isShift,setIsShift] = useState(false);
    const [currentKeys,setCurrentKeys] = useState(langIndex);
    const [currentKey,setCurrentKey] = useState('000');
    const [currentLang,setCurrentLang] = useState(langIndex);
    const [needEmoji,setNeedEmoji] = useState(false);
    const keyboardRef = useRef();
    const [clipboardStatus, setClipboardStatus] = useState('unknown');
     
    useEffect(() => {
    function handleTap(event) {
    if (
      keyboardRef.current &&  !keyboardRef.current.contains(event.target)) {
      setKeyboardNeeded(false);
      }
    }
     window.addEventListener('mousedown', handleTap);
     window.addEventListener('touchstart', handleTap);
     return () => {
     window.removeEventListener('mousedown', handleTap);
     window.removeEventListener('touchstart', handleTap);
    };
    }, []);
    useEffect(() => {
       const timeout = setTimeout(() => setCurrentKey('000'), 100);
       return () => clearTimeout(timeout);
    }, [currentKey]);
    useEffect(() => {
        const subscriptionT = theme$.subscribe(setthemeState);
        const subscription = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
        });
        const subscriptionK = keyboardNeeded$.subscribe(setNeedKeyBoard);
        return () => {
            subscription.unsubscribe();
            subscriptionT.unsubscribe();
            subscriptionK.unsubscribe();
        }
    }, []);
    function click(key){
      setCurrentKeyboardString(isShift && currentKeys < 2 && key.length === 1 && key !== ' ' ? key.toUpperCase() : key);
      setCurrentKey(key);
      setIsShift(false);
      playEffects(tap);
    }
    const bindKey = useLongPress(() => click('bsall'));
    async function handlePaste() {
  try {
    if (!window.Telegram?.WebApp?.readTextFromClipboard) {
      setClipboardStatus('empty');
      return;
    }

    const text = await window.Telegram.WebApp.readTextFromClipboard();
    
    if (text && text.trim()) {
      setCurrentKeyboardString('paste'+text);
      setClipboardStatus('hasContent');
      playEffects(tap);
    } else {
      setClipboardStatus('empty');
      // Optional: show brief message
      if (window.Telegram?.WebApp?.showPopup) {
        window.Telegram.WebApp.showPopup({
          title: "Clipboard",
          message: "No text in clipboard",
          buttons: [{ type: "close" }]
        });
      }
    }
  } catch (err) {
    console.error('Clipboard read failed:', err);
    setClipboardStatus('empty');
  }
    }
    return (
      
       <div style={styles(theme,needKeyBoard).container } ref={keyboardRef}>
        {!needEmoji && <div style={styles(theme,needKeyBoard).container }>
         <div style={styles(theme).rowPanel}>
            {keys[currentKeys][0].map((key) => (
              <div  key={key} style={keyStyle(theme,keys[currentKeys][0].length,currentKey,key)}>
                <p onClick={() => click(key)} key={key} style={styles(theme).text}>{isShift ? key.toUpperCase() : key}</p>
              </div>
            ))}
         </div>
         {/*second line*/}
         <div style={styles(theme).rowPanel}>
            {keys[currentKeys][1].map((key) => (
              <div  key={key} style={keyStyle(theme,keys[currentKeys][1].length,currentKey,key)}>
                <p onClick={() => click(key)} key={key} style={styles(theme).text}>{isShift ? key.toUpperCase() : key}</p>
              </div>
            ))}
            {clipboardStatus !== 'empty' && (<div onClick={handlePaste} style={{...keyStyle(theme, 1, currentKey, 'paste'),width: '8%',backgroundColor: Colors.get('currentDateBorder2', theme),opacity: clipboardStatus === 'unknown' ? 0.7 : 1,}}>
              <p style={styles(theme).text}>📋</p>
          </div>)}
         </div>
         {/*third line*/}
         <div style={styles(theme).rowPanel}>
             <div onClick={() => {setIsShift(!isShift);setCurrentKey('shift')}} style={{...keyStyle(theme,keys[currentKeys][2].length + 2,currentKey,'shift'),backgroundColor:Colors.get('currentDateBorder2', theme)}}>
                <FaArrowUp style={{...styles(theme).text,color:isShift ? Colors.get('iconsHighlited', theme) : Colors.get('icons', theme)}}/>
              </div>
            {keys[currentKeys][2].map((key) => (
              <div  key={key} style={keyStyle(theme,keys[currentKeys][2].length + 2,currentKey,key)}>
                <p onClick={() => click(key)} key={key} style={styles(theme).text}>{isShift ? key.toUpperCase() : key}</p>
              </div>
            ))}
            <div {...bindKey} onClick={() => click('bs')} style={{...keyStyle(theme,keys[currentKeys][2].length + 2,currentKey,'bs'),backgroundColor:Colors.get('currentDateBorder2', theme)}}>
                <MdBackspace style={styles(theme).text}/>
              </div>
         </div>
         {/*last line*/}
         <div style={styles(theme).rowPanel}>
              <div onClick={() => {setCurrentKeys(prev => prev === 2 ? currentLang : 2);setCurrentKey('num')}} style={{...keyStyle(theme,1,currentKey,'num'),width:'10%',backgroundColor:Colors.get('currentDateBorder2', theme)}}>
                <p style={styles(theme).text}>{currentKeys < 2 ? '?12' : 'AB'}</p>
              </div>
              <div onClick={() => {setNeedEmoji(true);setCurrentKey('em')}} style={{...keyStyle(theme,1,currentKey,'em'),width:'6%',backgroundColor:Colors.get('currentDateBorder2', theme)}}>
                <FaSmileWink style={styles(theme).text}/>
              </div>
              <div onClick={() => click(',')} style={{...keyStyle(theme,1,currentKey,','),width:'9%'}}>
                <p style={styles(theme).text}>{','}</p>
              </div>
              <div onClick={() => {setCurrentKeys(prev => prev === 0 ? 1 : 0);setCurrentLang(prev => prev === 0 ? 1 : 0),setCurrentKey('lang')}} style={{...keyStyle(theme,1,currentKey,'lang'),width:'8%',backgroundColor:Colors.get('currentDateBorder2', theme)}}>
                <IoLanguage style={styles(theme).text}/>
              </div>
              <div onClick={() => click(' ')} style={{...keyStyle(theme,1,currentKey,' '),width:'41%'}}>
                <p style={{...styles(theme).text,fontSize:'12px'}}>{'UltyMyLife'}</p>
              </div>
              <div onClick={() => click('.')} style={{...keyStyle(theme,1,currentKey,'.'),width:'9%'}}>
                <p style={styles(theme).text}>{'.'}</p>
              </div>
              <div onClick={() => click('\n')} style={{...keyStyle(theme,1,currentKey,'\n'),width:'12%',backgroundColor:Colors.get('currentDateBorder2', theme)}}>
                <FiCornerDownLeft style={styles(theme).text}/>
              </div>
         </div>
         </div>}
         {needEmoji && <div style={styles(theme,needKeyBoard).container }>
            <FaArrowDown onClick={() => setNeedEmoji(false)} style={styles(theme).text}/>
            <div style={styles(theme).selectPanel}>
                {emojis.map((emoji,index) => (
                    <div key={index} onClick={() => click(emoji)} style={{width:'12%',height:'17%',display:'inline-flex',alignItems:'center',justifyContent:'center'}}>
                      <p style={{fontSize:'24px'}}>{emoji}</p>
                    </div>
                ))}
            </div>
         </div>}
       </div>

    )
}

export default KeyBoard

const keyStyle = (theme,length,key,ownKey) => ({
     display:'inline-flex',
     alignItems:'center',
     justifyContent:'center',
     width: (90 / length) + '%',
     padding:'2px',
     height:'90%',
     backgroundColor: key === ownKey ? Colors.get('currentDateBorder2', theme) : Colors.get('bottomPanel', theme),
     borderRadius:'10px',
    
  })
const styles = (theme,needKeyBoard) =>
({
    container :
   {
     backgroundColor:Colors.get('background', theme),
     display: "flex",
     position:'fixed',
     flexDirection: "column",
     alignItems: "center",
     height: "30vh",
     transform: needKeyBoard ? 'translateY(0)' : 'translateY(100%)',
     bottom: '0',
     transition: "transform 0.2s ease-in-out",
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
    justifyContent:'space-around',
    padding:'2px',
    width: '95%',
    height:'20%',
    marginBottom:'3px',
    marginTop:'3px',
    alignItems: "center",
  },
  text:
  {
    fontSize: "21px",
    fontWeight:'bold',
    color: Colors.get('icons', theme),
  },
  selectPanel:
    {
      backgroundColor: Colors.get('bottomPanel', theme),
      borderRadius: '12px',
      display: 'flex',
      flexWrap: 'wrap',
      width: '90%',
      maxHeight: '80%',
      overflowY: 'auto',
      padding: '12px',
      gap: '6px',
      justifyContent: 'center',
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