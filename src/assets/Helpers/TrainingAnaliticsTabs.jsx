import React from 'react';
import { motion } from 'framer-motion';
import Colors from '../StaticClasses/Colors';

export const VolumeTabs = ({ type, theme, langIndex, activeTab, onChange }) => {
  
  // Define tab data based on type
  const tabs = [
    { 
      key: 'volume', 
      label: type === 0 
        ? (langIndex === 0 ? 'Объём' : 'Load') 
        : (langIndex === 0 ? 'Замеры' : 'Measurings') 
    },
    { 
      key: 'muscles', 
      label: type === 0 
        ? (langIndex === 0 ? 'Мышцы' : 'Muscles') 
        : (langIndex === 0 ? 'Обзор' : 'Overview') 
    },
    { 
      key: 'exercises', 
      label: type === 0 
        ? (langIndex === 0 ? 'Упражнения' : 'Exercises') 
        : (langIndex === 0 ? 'Аналитика' : 'Analytics') // Fixed typo 'analitic' -> 'Analytics'
    }
  ];

  const isLight = theme === 'light';

  return (
    <div
      style={{
        display: 'flex',
        width: '94%',
        maxWidth: '400px', // Prevent it from getting too wide on tablets
        marginTop: 20,
        marginBottom: 10,
        padding: '4px',
        borderRadius: '16px', // Modern "Squircle" look
        backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)', // Subtle track
        position: 'relative',
        zIndex: 1
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <div
            key={tab.key}
            onClick={() => onChange(tab.key)}
            style={{
              flex: 1,
              position: 'relative',
              padding: '10px 0',
              textAlign: 'center',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: isActive ? '600' : '500',
              color: isActive 
                ? (!isLight ? '#000000' : '#FFF') 
                : Colors.get('subText', theme),
              transition: 'color 0.2s ease',
              userSelect: 'none',
              zIndex: 2,
              // Fix for tap highlight on mobile
              WebkitTapHighlightColor: 'transparent' 
            }}
          >
            {/* The Floating Active Background */}
            {isActive && (
              <motion.div
                layoutId="activeTabBackground"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: Colors.get('iconsHighlited', theme), // Or use card background color for standard segmented look
                  borderRadius: '12px',
                  zIndex: -1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              />
            )}
            
            {/* Label */}
            <span style={{ 
                position: 'relative', 
                zIndex: 2,
                textTransform: 'capitalize', // Enforce consistent capitalization
                color: isActive ? Colors.get('bgMain', theme) : 'inherit'
            }}>
                {tab.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
