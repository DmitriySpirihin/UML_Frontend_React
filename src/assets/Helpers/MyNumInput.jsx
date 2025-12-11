import { AppData } from "../StaticClasses/AppData";
import Colors from "../StaticClasses/Colors";
import { 
  currentString$, 
  keyboardNeeded$, 
  setKeyboardNeeded, 
  setCurrentKeyboardString 
} from '../StaticClasses/HabitsBus';
import { useEffect, useState } from 'react';

const MyNumInput = ({
  theme,
  fSize = 24,
  h = '90%',
  w = '100%',
  value = '',
  onChange = null,
  clear = false,
  afterPointer = '',
  placeholder = ''
}) => {
  const [input, setInput] = useState({ myString: '', cursorPos: 0 });
  const [isActive, setIsActive] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const MAX_VALUE = 999;

  // Format number to valid string (max 999.25, max 2 decimals)
  const formatValue = (numStr) => {
    // Remove invalid chars (keep digits and one dot)
    let clean = numStr.replace(/[^0-9.]/g, '');
    
    // Only one dot allowed
    const parts = clean.split('.');
    if (parts.length > 2) clean = parts[0] + '.' + parts.slice(1).join('');
    
    // No leading zeros (except "0.")
    if (parts[0].length > 1) {
      parts[0] = parts[0].replace(/^0+/, '') || '0';
    }
    
    clean = parts.join('.');
    
    // Validate as number
    const num = parseFloat(clean);
    if (isNaN(num)) return '';
    
    // Clamp to max
    if (num > MAX_VALUE) return MAX_VALUE.toFixed(2);
    
    // Enforce max 2 decimals
    return num.toFixed(2).replace(/\.?0+$/, ''); // remove trailing zeros
  };

  // Sync external value
  useEffect(() => {
    const str = typeof value === 'number' ? value.toString() : String(value);
    const formatted = formatValue(str);
    setInput({ myString: formatted, cursorPos: formatted.length });
  }, [value]);

  // Handle virtual keyboard input
useEffect(() => {
  const subscription = currentString$.subscribe((value) => {
    if (!isActive) return;

    setInput(prev => {
      let newString = prev.myString;
      let newCursor = prev.cursorPos;

      if (value === 'bs') {
        // Backspace
        if (newCursor > 0) {
          newString = newString.slice(0, newCursor - 1) + newString.slice(newCursor);
          newCursor -= 1;
        }
      } else if (/^\d$/.test(value)) {
        // Insert digit
        const candidate = 
          newString.slice(0, newCursor) + 
          value + 
          newString.slice(newCursor);
        const formatted = formatValue(candidate);
        if (formatted !== newString) {
          newString = formatted;
          // Keep cursor at inserted position (not end!)
          newCursor = Math.min(newCursor + 1, newString.length);
        }
      } else if (value === '.' && !newString.includes('.')) {
        // Insert decimal point only if not exists
        const candidate = 
          newString.slice(0, newCursor) + 
          '.' + 
          newString.slice(newCursor);
        const formatted = formatValue(candidate);
        if (formatted !== newString) {
          newString = formatted;
          // Keep cursor right after the dot
          newCursor = Math.min(newCursor + 1, newString.length);
        }
      }

      return { myString: newString, cursorPos: newCursor };
    });
  });

  return () => subscription.unsubscribe();
}, [isActive]);

  // Blinking cursor
  useEffect(() => {
    if (!isActive) {
      setShowCursor(false);
      return;
    }
    setShowCursor(true);
    const timer = setInterval(() => setShowCursor(c => !c), 500);
    return () => clearInterval(timer);
  }, [isActive]);

  // Handle keyboard close
  useEffect(() => {
    const subscription = keyboardNeeded$.subscribe(value => {
      if (value.value === false) {
        setIsActive(false);
        if (clear) setInput({ myString: '', cursorPos: 0 });
      }
    });
    return () => subscription.unsubscribe();
  }, [clear]);

  // Notify parent of changes
  useEffect(() => {
    if (onChange && isActive) {
      const num = parseFloat(input.myString) || 0;
      onChange(num);
    }
  }, [input, onChange, isActive]);

  // Click handler
  const handleClick = () => {
    setCurrentKeyboardString('');
    setIsActive(true);
    setKeyboardNeeded({ type: 2, value: true }); // numeric + dot
    const newString = parseInt(input.myString).toString();
    setInput(prev => ({myString:newString, cursorPos: newString.length }));
  };

  return (
    <div
      style={{
        width: w,
        height: h,
        border: `3px solid rgba(0,0,0,0.2)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'text'
      }}
      onClick={handleClick}
    >
      <div
        style={{
          display: 'flex',
          fontSize: fSize + 'px',
          paddingLeft: '8px',
          textAlign:'left',
          fontFamily: 'Segoe UI',
          color: input.myString.length === 0 
            ? Colors.get('icons', theme) 
            : Colors.get('mainText', theme),
        }}
      >
        {input.myString.length > 0 || isActive ? (
      <>
        {input.myString}
        <span style={{display: 'inline-block', width: '2px', color: showCursor && isActive ? Colors.get('iconsHighlited', theme)  : 'transparent', fontSize: fSize, marginLeft: '2px', verticalAlign: 'middle' }}>{'|'}</span>
        <span style={{ fontSize: fSize, color: Colors.get('mainText', theme), marginLeft: '4px' }}>
          {afterPointer}
        </span>
      </>
    ) : (
      placeholder
    )}
      </div>
    </div>
  );
};

export default MyNumInput;


