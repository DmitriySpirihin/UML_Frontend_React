import { useRef,useEffect,useState } from "react";
import Colors from "../StaticClasses/Colors";

const ITEM_HEIGHT = 40; // Height of each number in the list

const ScrollPicker = ({ items, value, onChange, theme, suffix = '', width = '60px' }) => {
  const scrollRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Scroll to initial value on mount
  useEffect(() => {
    if (scrollRef.current) {
      const selectedIndex = items.findIndex(item => item === value);
      if (selectedIndex !== -1) {
        scrollRef.current.scrollTop = selectedIndex * ITEM_HEIGHT;
      }
    }
  }, []); // Run once on mount

  const handleScroll = (e) => {
    if (isScrolling) return;
    const scrollTop = e.target.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const validIndex = Math.max(0, Math.min(index, items.length - 1));
    
    if (items[validIndex] !== value) {
      onChange(items[validIndex]);
    }
  };

  return (
    <div style={{ position: 'relative', height: ITEM_HEIGHT * 3, width: width, overflow: 'hidden' }}>
      {/* Selection Highlight Bar (Glass effect) */}
      <div style={{
        position: 'absolute',
        top: ITEM_HEIGHT,
        left: 0,
        right: 0,
        height: ITEM_HEIGHT,
        borderRadius: '8px',
        backgroundColor: Colors.get('iconsHighlited', theme),
        opacity: 0.15,
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      {/* Scrollable Container */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          height: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE
          paddingTop: ITEM_HEIGHT, // Spacer for top
          paddingBottom: ITEM_HEIGHT, // Spacer for bottom
          scrollBehavior: 'smooth'
        }}
        className="no-scrollbar" // Add this class to global css: .no-scrollbar::-webkit-scrollbar { display: none; }
      >
        {items.map((item, i) => (
          <div 
            key={i} 
            style={{
              height: ITEM_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              scrollSnapAlign: 'start',
              fontSize: item === value ? '20px' : '16px',
              fontWeight: item === value ? 'bold' : 'normal',
              color: item === value ? Colors.get('mainText', theme) : Colors.get('subText', theme),
              opacity: item === value ? 1 : 0.5,
              transition: 'all 0.2s ease'
            }}
          >
            {i > 0 ? item : ''}{i > 0 ? suffix : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollPicker;