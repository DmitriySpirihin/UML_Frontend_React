import { useRef, useEffect, useMemo } from "react";
import Colors from "../StaticClasses/Colors";

const ITEM_HEIGHT = 44; 
const VISIBLE_ITEMS = 3; // Kept to 3 as requested

const ScrollPicker = ({ items, value, onChange, theme, suffix = '', width = '80px' }) => {
  const scrollRef = useRef(null);

  // 1. TRIPLE THE LIST: [Previous Set, Current Set, Next Set]
  // This provides the buffer needed to scroll infinitely in both directions.
  const infiniteItems = useMemo(() => {
    return [...items, ...items, ...items];
  }, [items]);

  // Calculate spacer height to ensure centering alignment matches your old style
  const SPACER_HEIGHT = ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT;

  // 2. INITIAL MOUNT: Scroll to the "Middle" Set
  useEffect(() => {
    if (scrollRef.current) {
      const selectedIndex = items.findIndex(item => item === value);
      // If not found, default to 0. 
      // We add `items.length` to jump to the middle set (Index + Length)
      const middleSetIndex = (selectedIndex === -1 ? 0 : selectedIndex) + items.length;
      
      scrollRef.current.scrollTop = middleSetIndex * ITEM_HEIGHT;
    }
  }, []); // Run once on mount

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const singleSetHeight = items.length * ITEM_HEIGHT;
    
    // --- INFINITE LOOP LOGIC ---
    // If user scrolls to the top (1st set), jump silently to Middle (2nd set)
    if (scrollTop < singleSetHeight / 2) {
      e.target.scrollTop = scrollTop + singleSetHeight;
    } 
    // If user scrolls to the bottom (3rd set), jump silently to Middle (2nd set)
    else if (scrollTop >= singleSetHeight * 2.5) {
      e.target.scrollTop = scrollTop - singleSetHeight;
    }

    // --- SELECTION LOGIC ---
    // 1. Calculate the raw index based on scroll position
    const rawIndex = Math.round(scrollTop / ITEM_HEIGHT);
    
    // 2. Modulo (%) operator to get the actual item index (0 to items.length-1)
    const actualIndex = rawIndex % items.length;
    
    // 3. Update if changed
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
      {/* 1. Selection Highlight (Your Original Style) */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        height: ITEM_HEIGHT - 4,
        borderRadius: '12px',
        backgroundColor: Colors.get('iconsHighlited', theme),
        opacity: 0.1,
        border: `1px solid ${Colors.get('mainText', theme)}20`,
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* 2. Fade Gradients (Your Original Style) */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none',
        zIndex: 2,
        background: `linear-gradient(to bottom, 
          ${Colors.get('background', theme)} 0%, 
          transparent 20%, 
          transparent 80%, 
          ${Colors.get('background', theme)} 100%)`
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
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Top Spacer */}
        <div style={{ height: SPACER_HEIGHT, width: '100%' }} />

        {infiniteItems.map((item, i) => {
          // Check if this specific DOM element represents the selected value
          // We assume the middle set is the "active" visual one usually, 
          // but visually they all look the same based on the `value` prop.
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
                
                // Original Font Styles
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

        {/* Bottom Spacer */}
        <div style={{ height: SPACER_HEIGHT, width: '100%' }} />
      </div>
    </div>
  );
};

export default ScrollPicker;