import { AppData } from "../StaticClasses/AppData";
import Colors from "../StaticClasses/Colors"
import {currentString$,keyboardNeeded$,setKeyboardNeeded,setCurrentKeyboardString} from '../StaticClasses/HabitsBus'
import {useEffect, useState } from 'react';

const MyInput = ({
  keyType = 0,
  maxL = 500,
  placeHolder,
  theme,
  h = 'auto', // Changed default to auto to fit padding better, but you can pass fixed
  w = '100%', // Modern inputs usually take full width of container
  value = '',
  onChange = null,
  clear = false
}) => {
  const [input, setInput] = useState({myString:'',cursorPos:0});
  const [isActive, setIsActive] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  
  useEffect(() => {
    setInput({myString:value,cursorPos:value.length});
  }, [value]);

  useEffect(() => {
  const subscription = currentString$.subscribe(value => {
    if (isActive) {
      if (value === 'bs') {
        setInput(prev => {
          const chars = Array.from(prev.myString);
          if (prev.cursorPos === 0) return prev;
          const newChars = [...chars.slice(0, prev.cursorPos - 1), ...chars.slice(prev.cursorPos)];
          return {
            myString: newChars.join(''),
            cursorPos: prev.cursorPos - 1
          };
        });
      } else if (value === 'bsall') {
        setInput({ myString: '', cursorPos: 0 });
      }
       else if (value.length === 1) {
        setInput(prev => {
          return {
            myString: prev.myString.slice(0, prev.cursorPos) + value + prev.myString.slice(prev.cursorPos),
            cursorPos: prev.cursorPos + 1
          };
        });
      }
    }
  });
  return () => subscription.unsubscribe();
}, [isActive]);

  
  useEffect(() => {
    if (!isActive) {
      setShowCursor(false);
      return;
    }
    setShowCursor(true);
    const timer = setInterval(() => {
      setShowCursor(c => !c);
    }, 500);
    return () => clearInterval(timer);
  }, [isActive]);

  useEffect(() => {
    const subscription = keyboardNeeded$.subscribe(value => {
      if(value.value === false){
        setIsActive(false);
        if(clear)setInput({myString:'',cursorPos:0});
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if(onChange && isActive) onChange(input.myString);
  }, [input]);

  // --- STYLES ---
  const isDark = theme !== 'light';
  // Modern container background based on theme
  const bg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
  const activeBorder = Colors.get('iconsHighlited', theme); // Use your highlight color
  
  return (
    <div
      style={{
        width: w,
        minHeight: h === '90%' ? '50px' : h, // Ensure decent click area
        height: 'auto',
        boxSizing: 'border-box',
        backgroundColor: bg,
        borderRadius: '16px', // Modern rounded corners
        padding: '12px 16px',
        border: `2px solid ${isActive ? activeBorder : 'transparent'}`, // Animate border color
        transition: 'all 0.2s ease-in-out',
        display: 'flex',
        alignItems: 'center', // Center vertically
        justifyContent: 'flex-start',
        cursor: 'text',
        marginTop: '10px'
      }}
      onClick={(event) => {
        setCurrentKeyboardString('');
        setIsActive(true);
        setKeyboardNeeded({type:keyType,value:true});
        // Assuming getCursorIndex is available in your scope as per original logic
        if (typeof getCursorIndex === 'function') {
             setInput(prev => ({myString:prev.myString,cursorPos:getCursorIndex(event, prev.myString)}));
        }
      }}
    >
      <div style={{ 
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflow: 'hidden', 
          fontSize: AppData.prefs[4] === 0 ? '14px' : '16px', // Slightly larger font
          display: 'block',            
          textAlign: 'left',
          lineHeight: '1.4', // Better readability
          fontFamily: 'Segoe UI, Roboto, Helvetica, sans-serif',
          color: input.myString.length === 0 ? Colors.get('icons', theme) : Colors.get('mainText', theme),
          width: '100%',
          opacity: input.myString.length === 0 ? 0.6 : 1
        }}>
      {(input.myString.length > 0 || isActive) ? (
        <>
          {input.myString.slice(0, input.cursorPos)}
          <span style={{
              display: 'inline-block', 
              width: '2px', 
              height: '1.2em', 
              backgroundColor: showCursor && isActive ? Colors.get('iconsHighlited', theme) : 'transparent', 
              borderRadius: '1px',
              verticalAlign: 'text-bottom',
              marginBottom: '-2px',
              marginLeft: '1px',
              marginRight: '1px',
              transition: 'background-color 0.1s'
          }}></span>
          {input.myString.slice(input.cursorPos)}
        </>
      ) : placeHolder}
    </div>
    </div>
  );
};

export default MyInput;

const getCursorIndex = (e, myString) => {
  const paddingLeft = 8; // если есть
  const fontSize = AppData.prefs[4] === 0 ? 13 : 15; // px
  const lineHeight = 18; // px
  const clickX = e.nativeEvent.offsetX - paddingLeft;
  const clickY = e.nativeEvent.offsetY;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontSize}px 'Segoe UI', 'Apple Color Emoji', 'Noto Color Emoji', 'Arial'`;

  const lines = myString.split('\n');
  const lineIdx = Math.floor(clickY / lineHeight);
  const actualLineIdx = Math.min(lineIdx, lines.length - 1);
  const line = lines[actualLineIdx];

  // Корректно разбиваем строку на символы (в том числе эмодзи)
  const chars = Array.from(line);
  let cumWidth = 0;

  for (let i = 0; i < chars.length; i++) {
    const charWidth = ctx.measureText(chars[i]).width;
    cumWidth += charWidth;
    if (clickX < cumWidth) {
      const totalOffset = lines.slice(0, actualLineIdx)
        .reduce((a, l) => a + Array.from(l).length + 1, 0); // +1 — перенос строки
      return totalOffset + i;
    }
  }
  // Клик за концом строки — курсор в конец
  const totalOffset = lines.slice(0, actualLineIdx)
    .reduce((a, l) => a + Array.from(l).length + 1, 0);
  return totalOffset + chars.length;
};

