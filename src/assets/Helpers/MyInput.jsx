import { AppData } from "../StaticClasses/AppData";
import Colors from "../StaticClasses/Colors";
import { currentString$, keyboardNeeded$, setKeyboardNeeded, setCurrentKeyboardString } from '../StaticClasses/HabitsBus';
import { useEffect, useState, useRef } from 'react';

const MyInput = ({
  keyType = 0,
  maxL = 500,
  placeHolder,
  theme,
  h = 'auto',
  w = '100%',
  value = '',
  onChange = null,
  clear = false
}) => {
  const [input, setInput] = useState({ myString: '', cursorPos: 0 });
  const [isActive, setIsActive] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  
  // Ref to track the text container for accurate click detection
  const textRef = useRef(null);

  useEffect(() => {
    setInput({ myString: value, cursorPos: value.length });
  }, [value]);

  useEffect(() => {
    const subscription = currentString$.subscribe(value => {
      if (isActive) {
        if (value === 'bs') {
          setInput(prev => {
            if (prev.cursorPos === 0) return prev;
            const chars = Array.from(prev.myString);
            const newChars = [...chars.slice(0, prev.cursorPos - 1), ...chars.slice(prev.cursorPos)];
            return {
              myString: newChars.join(''),
              cursorPos: prev.cursorPos - 1
            };
          });
        } else if (value === 'bsall') {
          setInput({ myString: '', cursorPos: 0 });
        } else if (value.length === 1) {
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
      if (value.value === false) {
        setIsActive(false);
        if (clear) setInput({ myString: '', cursorPos: 0 });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (onChange && isActive) onChange(input.myString);
  }, [input]);

  // --- STYLES ---
  const isDark = theme !== 'light';
  const bg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
  const activeBorder = Colors.get('iconsHighlited', theme);

  const handleContainerClick = (event) => {
    setCurrentKeyboardString('');
    setIsActive(true);
    setKeyboardNeeded({ type: keyType, value: true });

    // New Native Logic
    if (textRef.current) {
        const newIndex = getNativeCursorIndex(event, textRef.current, input.myString);
        setInput(prev => ({ ...prev, cursorPos: newIndex }));
    }
  };

  return (
    <div
      style={{
        width: w,
        minHeight: h === '90%' ? '50px' : h,
        height: 'auto',
        boxSizing: 'border-box',
        backgroundColor: bg,
        borderRadius: '16px',
        padding: '12px 16px',
        border: `2px solid ${isActive ? activeBorder : 'transparent'}`,
        transition: 'all 0.2s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        cursor: 'text',
      }}
      // Attach click handler here
      onClick={handleContainerClick}
    >
      <div 
        ref={textRef} // Attached Ref
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word', // Allows natural wrapping
          overflow: 'hidden',
          fontSize: AppData.prefs[4] === 0 ? '14px' : '16px',
          display: 'block',
          textAlign: 'left',
          lineHeight: '1.4',
          fontFamily: 'Segoe UI, Roboto, Helvetica, sans-serif',
          color: input.myString.length === 0 ? Colors.get('icons', theme) : Colors.get('mainText', theme),
          width: '100%',
          opacity: input.myString.length === 0 ? 0.6 : 1,
          pointerEvents: 'none' // Allows clicks to pass through to container, or we handle it on container
        }}>
        {(input.myString.length > 0 || isActive) ? (
          <>
            {/* Part 1 */}
            <span>{input.myString.slice(0, input.cursorPos)}</span>
            
            {/* Cursor */}
            <span style={{
              display: 'inline-block',
              width: '2px',
              height: '1.2em',
              backgroundColor: showCursor && isActive ? Colors.get('iconsHighlited', theme) : 'transparent',
              borderRadius: '1px',
              verticalAlign: 'text-bottom',
              marginBottom: '-2px',
              marginLeft: '0px', // Removed margins to prevent clicking "gaps"
              marginRight: '0px',
              transition: 'background-color 0.1s'
            }}></span>

            {/* Part 2 */}
            <span>{input.myString.slice(input.cursorPos)}</span>
          </>
        ) : placeHolder}
      </div>
    </div>
  );
};

export default MyInput;

// --- KEY FIX: NATIVE DOM CALCULATION ---
const getNativeCursorIndex = (e, container, fullString) => {
    let x = e.clientX;
    let y = e.clientY;
    let range;
    let textNode;
    let offset;

    // 1. Ask the browser exactly where the user clicked within the text nodes
    if (document.caretRangeFromPoint) { // Standard
        range = document.caretRangeFromPoint(x, y);
        textNode = range.startContainer;
        offset = range.startOffset;
    } else if (document.caretPositionFromPoint) { // Firefox specific
        const pos = document.caretPositionFromPoint(x, y);
        textNode = pos.offsetNode;
        offset = pos.offset;
    } else {
        return fullString.length; // Fallback
    }

    // 2. The click might land on the Container, a Span, or a Text Node.
    // We need to map this DOM position back to the index in "myString".
    
    // Helper to calculate length of text preceding the clicked node
    let totalOffset = 0;
    
    // If we clicked directly on the container (e.g. empty space), find the nearest text
    if (textNode === container) {
       // If clicked past the last element, return end
       return fullString.length;
    }

    // Traverse child nodes of our container to sum up lengths
    const childNodes = container.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
        const node = childNodes[i];
        
        // If we found the node (or the text node inside a span) we clicked on
        if (node === textNode || node.contains(textNode)) {
            return totalOffset + offset;
        }

        // Add length of this node to the running total
        if (node.nodeType === Node.TEXT_NODE) {
            totalOffset += node.textContent.length;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Specifically skip the visual cursor span, it has no text content in the data model
            // But checking .textContent usually works because the cursor span is empty
            totalOffset += node.textContent.length;
        }
    }

    return fullString.length;
};
