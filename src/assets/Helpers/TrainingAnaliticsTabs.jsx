import React from 'react';
import { motion as Motion } from 'framer-motion';
import Colors from '../StaticClasses/Colors';
import { AppData } from '../StaticClasses/AppData';
import { buildSectionAccent } from '../Pages/SectionAccentSettings.jsx';

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

  const isLight = theme === 'light' || theme === 'speciallight';
  const accent = buildSectionAccent(AppData.trainingAccentColor || '#35C2FF', '#35C2FF');

  return (
    <div
      style={{
        display: 'flex',
        width: '94%',
        maxWidth: '420px',
        marginTop: 0,
        marginBottom: 16,
        padding: '4px',
        borderRadius: '18px',
        background: isLight ? 'rgba(255,255,255,0.56)' : 'rgba(255,255,255,0.055)',
        border: `1px solid ${isLight ? 'rgba(18,24,31,0.08)' : 'rgba(255,255,255,0.10)'}`,
        boxShadow: isLight ? '0 12px 28px rgba(20,24,28,0.08)' : '0 16px 36px rgba(0,0,0,0.24)',
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
              color: isActive ? accent.hue : Colors.get('subText', theme),
              transition: 'color 0.2s ease',
              userSelect: 'none',
              zIndex: 2,
              // Fix for tap highlight on mobile
              WebkitTapHighlightColor: 'transparent' 
            }}
          >
            {/* The Floating Active Background */}
            {isActive && (
              <Motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${accent.soft}, rgba(${accent.rgb}, 0.20))`,
                  border: `1px solid ${accent.ring}`,
                  borderRadius: '14px',
                  zIndex: -1,
                  boxShadow: `0 8px 20px rgba(${accent.rgb}, 0.18)`
                }}
              />
            )}
            
            {/* Label */}
            <span style={{ 
                position: 'relative', 
                zIndex: 2,
                textTransform: 'capitalize', // Enforce consistent capitalization
                color: isActive ? accent.hue : 'inherit'
            }}>
                {tab.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
