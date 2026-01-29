import { useRef, useEffect, useState } from "react";
import Colors from "../StaticClasses/Colors";

const ITEM_HEIGHT = 36;  

const ScrollPicker = ({ items, value, onChange, theme, suffix = '', width = '80px',visibleItems = 3 }) => {
  const scrollRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Buffer to allow the first and last items to be selected in the center
  const SPACER_HEIGHT = ((visibleItems - 1) / 2) * ITEM_HEIGHT;

  // 1. INITIAL MOUNT: Scroll to the selected value INSTANTLY
  useEffect(() => {
    if (scrollRef.current) {
      const selectedIndex = items.findIndex(item => item === value);
      if (selectedIndex !== -1) {
        scrollRef.current.scrollTop = selectedIndex * ITEM_HEIGHT;
      }
      // Enable smooth scrolling after the initial jump
      requestAnimationFrame(() => {
        setIsLoaded(true);
      });
    }
  }, []); // Run only on mount

  // 2. Simple Scroll Handler (No looping logic)
  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    
    // Calculate which item is currently in the center
    const rawIndex = Math.round(scrollTop / ITEM_HEIGHT);
    
    // Clamp the index to ensure it stays within bounds
    const index = Math.max(0, Math.min(items.length - 1, rawIndex));
    
    const newItem = items[index];
    if (newItem !== value && newItem !== undefined) {
      onChange(newItem);
    }
  };

  return (
    <div style={{ 
      position: 'relative', 
      height: ITEM_HEIGHT * visibleItems, 
      width: width, 
      borderRadius: '12px',
      overflow: 'hidden',
      userSelect: 'none',
      perspective: '1000px'
    }}>
      {/* Selection Highlight */}
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

      {/* Fade Gradients Overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none',
        zIndex: 2,
       
      }} />
      
      {/* Scrollable Container */}
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
          scrollBehavior: isLoaded ? 'smooth' : 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Top Spacer */}
        <div style={{ height: SPACER_HEIGHT, width: '100%', flexShrink: 0 }} />

        {items.map((item, i) => {
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
                flexShrink: 0, // Prevent items from shrinking
                
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

        {/* Bottom Spacer */}
        <div style={{ height: SPACER_HEIGHT, width: '100%', flexShrink: 0 }} />
      </div>
    </div>
  );
};

export default ScrollPicker;