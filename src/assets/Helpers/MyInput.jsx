import { AppData } from "../StaticClasses/AppData";
import Colors from "../StaticClasses/Colors"
import {currentString$,keyboardNeeded$,setKeyboardNeeded,setCurrentKeyboardString} from '../StaticClasses/HabitsBus'
import {useEffect, useState } from 'react';

const MyInput = ({
  maxL = 500,
  placeHolder,
  theme,
  h = '90%',
  w = 'vh',
  value = '',
  onChange = null,
  clear = false
}) => {
  const [input, setInput] = useState({myString:'',cursorPos:0});
  const [isActive, setIsActive] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  let spaceAmount = 1;
  
  useEffect(() => {
    setInput({myString:value,cursorPos:0});
  }, [value]);
  useEffect(() => {
  const subscription = currentString$.subscribe(value => {
    const isEmoji = (v) => {
      if (v === 'bs' || v === 'bsall' || v === '\n') return false;
      return Array.from(v).length === 1 && v.length > 1;
    };

    if (isActive) {
      if (value === ' ') spaceAmount++;
      else spaceAmount = 1;

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
      } else if (value === '\n') {
        setInput(prev => {
          if (prev.myString.length >= maxL) return prev;
          const chars = Array.from(prev.myString);
          const before = chars.slice(0, prev.cursorPos).join('');
          const after = chars.slice(prev.cursorPos).join('');
          return {
            myString: before + '\n' + after,
            cursorPos: prev.cursorPos + 1
          };
        });
      } else if (value.length === 1 || isEmoji(value)) {
        setInput(prev => {
          const chars = Array.from(prev.myString);
          const safeCursor = Math.max(0, Math.min(prev.cursorPos, chars.length));
          const addable = value.repeat(spaceAmount).slice(0, Math.max(0, maxL - chars.length));
          const before = chars.slice(0, safeCursor).join('');
          const after = chars.slice(safeCursor).join('');
          const newString = before + addable + after;
          const newCursor = Math.min(safeCursor + Array.from(addable).length, maxL);
          return {
            myString: newString,
            cursorPos: newCursor
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
      if(value === false){
        setIsActive(false);
        if(clear)setInput({myString:'',cursorPos:0});
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if(onChange && isActive) onChange(input.myString);
  }, [input]);
  return (
    <div
      style={{
        width: w,
        height: h,
        borderBottom: `1px solid ${Colors.get('border', theme)}`,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-start'
      }}
      onClick={(event) => {
        setCurrentKeyboardString('');
        setIsActive(true);
        setKeyboardNeeded(true);
        setInput(prev => ({myString:prev.myString,cursorPos:getCursorIndex(event, prev.myString)}));
      }}
    >
      <div style={{ 
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflow: 'hidden', 
          fontSize: AppData.prefs[4] === 0 ? '13px' : '15px',
          display: 'block',            
          paddingLeft: '8px',
          textAlign: 'left',
          paddingBottom: '2px',
          lineHeight:'18px',
          fontFamily: 'Segoe UI',
          color: input.myString.length === 0 ? Colors.get('icons', theme) : Colors.get('mainText', theme),
        }}>
      {(input.myString.length > 0 || isActive) ? (
        <>
          {input.myString.slice(0, input.cursorPos)}
          {showCursor && (
            <span style={{ color: Colors.get('iconsHighlited', theme), fontSize: AppData.prefs[4] === 0 ? '13px' : '15px', fontWeight: 'bold' }}>|</span>
          )}
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

