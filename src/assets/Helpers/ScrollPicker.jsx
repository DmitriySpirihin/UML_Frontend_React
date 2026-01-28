import { useRef, useEffect, useState, useMemo } from "react";
import Colors from "../StaticClasses/Colors";

const ITEM_HEIGHT = 36; 
const VISIBLE_ITEMS = 3; 

const ScrollPicker = ({ items, value, onChange, theme, suffix = '', width = '80px' }) => {
  const scrollRef = useRef(null);
  // State to control smooth scrolling. false = instant, true = smooth
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. TRIPLE THE LIST: [Previous Set, Current Set, Next Set]
  const infiniteItems = useMemo(() => {
    return [...items, ...items, ...items];
  }, [items]);

  const SPACER_HEIGHT = ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT;

  // 2. INITIAL MOUNT: Scroll to the "Middle" Set INSTANTLY
  useEffect(() => {
    if (scrollRef.current) {
      const selectedIndex = items.findIndex(item => item === value);
      const middleSetIndex = (selectedIndex === -1 ? 0 : selectedIndex) + items.length;
      scrollRef.current.scrollTop = middleSetIndex * ITEM_HEIGHT;
      requestAnimationFrame(() => {
        setIsLoaded(true);
      });
    }
  }, []);

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const singleSetHeight = items.length * ITEM_HEIGHT;
    if (scrollTop < singleSetHeight / 2) {
      e.target.scrollTop = scrollTop + singleSetHeight;
    } 
    else if (scrollTop >= singleSetHeight * 2.5) {
      e.target.scrollTop = scrollTop - singleSetHeight;
    }
    const rawIndex = Math.round(scrollTop / ITEM_HEIGHT);
    const actualIndex = rawIndex % items.length;
    
    const newItem = items[actualIndex];
    if (newItem !== value && newItem !== undefined) {
      onChange(newItem);
    }
  };

  return (
    <div style={{ 
      position: 'relative', 
      height: ITEM_HEIGHT * VISIBLE_ITEMS, 
      width: width, 
      borderRadius: '12px',
      overflow: 'hidden',
      userSelect: 'none',
      perspective: '1000px'
    }}>
      {/* 1. Selection Highlight */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        height: ITEM_HEIGHT - 4,
        borderTop: `1px solid ${Colors.get('border', theme)}`,
        borderBottom: `1px solid ${Colors.get('border', theme)}`,
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* 2. Fade Gradients */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none',
        zIndex: 2,
        
      }} />
      
      {/* 3. Scrollable Container */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar"
        style={{
          height: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          // KEY FIX: Use 'auto' initially for instant jump, then 'smooth'
          scrollBehavior: isLoaded ? 'smooth' : 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div style={{ height: SPACER_HEIGHT, width: '100%' }} />

        {infiniteItems.map((item, i) => {
          const isSelected = item === value;
          
          return (
            <div 
              key={i} 
              style={{
                height: ITEM_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                scrollSnapAlign: 'center',
                
                // Styles
                fontSize: isSelected ? '18px' : '15px',
                fontWeight: isSelected ? '700' : '500',
                color: isSelected ? Colors.get('scrollFont', theme) : Colors.get('subText', theme),
                opacity: isSelected ? 1 : 0.4, 
                transition: 'all 0.2s cubic-bezier(0.23, 1, 0.32, 1)',
                transform: `scale(${isSelected ? 1.1 : 0.9})`,
                fontFamily: 'sans-serif'
              }}
            >
              {item}<span style={{ fontSize: '12px', marginLeft: '2px', opacity: 0.7 }}>{suffix}</span>
            </div>
          );
        })}

        <div style={{ height: SPACER_HEIGHT, width: '100%' }} />
      </div>
    </div>
  );
};

export default ScrollPicker;