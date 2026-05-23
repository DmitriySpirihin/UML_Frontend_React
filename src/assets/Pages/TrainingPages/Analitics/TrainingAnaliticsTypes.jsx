import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData, UserData } from '../../../StaticClasses/AppData';
import Colors from '../../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, premium$ ,setPage} from '../../../StaticClasses/HabitsBus';
import { FaRunning, FaCrown } from 'react-icons/fa';
import { MdFitnessCenter } from 'react-icons/md';
import {
  getTrainingAccent,
  getTrainingPageBackground,
  getTrainingPanelBackground,
  getTrainingPanelBorder,
  getTrainingPanelShadow,
  getTrainingGlassSurface,
  getTrainingPressMotion
} from '../TrainingVisuals.js';

// Training type configuration with localized content and icons
const TRAINING_TYPES = [
  {
    id: 'GYM',
    names: { ru: 'ТРЕНАЖЕРНЫЙ ЗАЛ', en: 'GYM' },
    descriptions: { 
      ru: 'Силовые тренировки с отягощениями', 
      en: 'Strength training with weights' 
    }
  },
  {
    id: 'RUNNING',
    names: { ru: 'КАРДИО', en: 'CARDIO' },
    descriptions: { 
      ru: 'Бег, велотренировки и плавание', 
      en: 'Running , cycling and swimming' 
    }
  }
];

const TrainingAnaliticsTypes = () => {
  // --- STATE ---
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [hasPremium, setHasPremium] = useState(UserData.hasPremium);
  const [selectedType, setSelectedType] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // --- SUBSCRIPTIONS ---
  useEffect(() => {
    const sub1 = theme$.subscribe(setThemeState);
    const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
    const sub3 = fontSize$.subscribe(setFSize);
    const sub4 = premium$.subscribe(setHasPremium);
    return () => {
      sub1.unsubscribe(); 
      sub2.unsubscribe(); 
      sub3.unsubscribe(); 
      sub4.unsubscribe();
    };
  }, []);

  // Handle type selection with animation
  const handleTypeSelect = (typeId) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelectedType(prev => prev === typeId ? null : typeId);
    
    // Reset animation flag after transition completes
    setTimeout(() => setIsAnimating(false), 300);
    
    // TODO: Implement navigation to analytics view for selected type
    // Example: navigateToAnalytics(typeId);
  };

  return (
    <div style={styles(theme, fSize).container}>
      {/* PREMIUM OVERLAY - FIXED LOGIC: Show ONLY when user lacks premium */}
      {!hasPremium && (
        <div onClick={(e) => e.stopPropagation()} style={styles(theme, fSize).premiumScreen}>
          <div style={styles(theme, fSize).premiumGlass}>
            <div style={styles(theme, fSize).premiumIcon}>
              <FaCrown size={28} />
            </div>
            <div style={styles(theme, fSize).premiumText}>
              {langIndex === 0 ? 'Откройте полный доступ ко всей аналитике' : 'Unlock full access to all analytics'}
            </div>
            <button onClick={() => setPage('premium')} style={styles(theme, fSize).premiumButton}>
              <FaCrown size={13} />
              {langIndex === 0 ? 'Премиум' : 'Premium'}
            </button>
            <button onClick={() => setPage('MainMenu')} style={styles(theme, fSize).premiumBack}>
              {langIndex === 0 ? 'На главную' : 'Home'}
            </button>
          </div>
        </div>
      )}

      {/* TRAINING TYPE CARDS - Visible only to premium users */}
      
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={styles(theme, fSize).headerSection}
        >
          <div style={styles(theme, fSize).sectionTitle}>
            {langIndex === 0 ? 'ТИПЫ ТРЕНИРОВОК' : 'TRAINING TYPES'}
          </div>
          <div style={styles(theme, fSize).sectionSubtitle}>
            {langIndex === 0 
              ? 'Выберите тип для детальной аналитики' 
              : 'Select type for detailed analytics'}
          </div>
        </motion.div>
      

      
        <div style={styles(theme, fSize).trainingTypeGrid}>
          <AnimatePresence mode="wait">
            {TRAINING_TYPES.map((type,index) => {
              const isSelected = selectedType === type.id;
              const accent = getTrainingAccent();
              return (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: 1, 
                    scale: isSelected ? 1.05 : 1,
                    transition: { duration: 0.16, ease: 'easeOut' }
                  }}
                  {...getTrainingPressMotion(1.018, 0.972)}
                  onClick={() => setPage(type.id === 'GYM' ? 'TrainingAnaliticsMain' :  'TrainingAnaliticsCardio')}
                  style={{
                    ...styles(theme, fSize).trainingTypeCard,
                    ...getTrainingGlassSurface(theme, accent, isSelected),
                    border: isSelected 
                      ? `1px solid ${accent.ring}`
                      : styles(theme, fSize).trainingTypeCard.border,
                    background: isSelected 
                      ? `linear-gradient(145deg, rgba(${accent.rgb}, 0.18), rgba(${accent.rgb}, 0.06)), ${getTrainingPanelBackground(theme)}`
                      : styles(theme, fSize).trainingTypeCard.background,
                    boxShadow: isSelected
                      ? getTrainingPanelShadow(theme, accent, true)
                      : styles(theme, fSize).trainingTypeCard.boxShadow,
                    cursor: isAnimating ? 'wait' : 'pointer'
                  }}
                >
                  <div style={{
                    ...styles(theme, fSize).trainingTypeIcon,
                    background: `linear-gradient(135deg, ${accent.hue}, rgba(${accent.rgb}, ${index === 0 ? 0.72 : 0.58}))`,
                    WebkitMaskImage: 'radial-gradient(circle, white 70%, transparent 75%)',
                    maskImage: 'radial-gradient(circle, white 70%, transparent 75%)'
                  }}>
                    {index === 0 ? (<MdFitnessCenter fontSize={29}/>) : (<FaRunning fontSize={29}/>)}
                  </div>
                  
                  <motion.div 
                    style={styles(theme, fSize).trainingTypeName}
                    animate={{ color: isSelected ? accent.hue : Colors.get('mainText', theme) }}
                  >
                    {type.names[langIndex === 0 ? 'ru' : 'en']}
                  </motion.div>
                  
                  <div style={styles(theme, fSize).trainingTypeDescription}>
                    {type.descriptions[langIndex === 0 ? 'ru' : 'en']}
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={styles(theme, fSize).selectedBadge}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {langIndex === 0 ? 'ВЫБРАНО' : 'SELECTED'}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      
    </div>
  );
};

// --- STYLES (Updated to accept fSize parameter) ---
const styles = (theme, fSize) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  const baseFontSize = fSize === 0 ? 14 : 16;
  const accent = getTrainingAccent();
  
  return {
    container: {
      display: 'flex', 
      width: "100vw", 
      flexDirection: 'column',
      overflowY: 'auto', 
      overflowX: 'hidden', 
      justifyContent: "flex-start", 
      alignItems: 'center',
      background: getTrainingPageBackground(theme, accent),
      minHeight: "100dvh",
      height: "auto",
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 26px)',
      paddingBottom: '116px',
      boxSizing: 'border-box',
      position: 'relative'
    },
    headerSection: {
      width: '100%',
      maxWidth: '800px',
      padding: '0 20px 22px',
      textAlign: 'center',
      marginTop: '0'
    },
    sectionTitle: {
      fontSize: `${baseFontSize + 4}px`,
      fontWeight: '800',
      color: Colors.get('mainText', theme),
      marginBottom: '8px',
      background: `linear-gradient(90deg, ${accent.hue} 0%, ${Colors.get('mainText', theme)} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    sectionSubtitle: {
      fontSize: `${baseFontSize - 1}px`,
      color: Colors.get('subText', theme),
      opacity: 0.85,
      marginTop: '4px'
    },
    trainingTypeGrid: {
      display: 'flex',
      flexDirection:'column',
      gap: '18px',
      padding: '0 20px',
      width: '100%',
      maxWidth: '720px',
      alignItems:'center',
      marginTop: '0'
    },
    trainingTypeCard: {
      background: getTrainingPanelBackground(theme),
      borderRadius: '24px',
      padding: '28px 24px',
      textAlign: 'center',
      boxShadow: getTrainingPanelShadow(theme, accent),
      border: `1px solid ${getTrainingPanelBorder(theme, accent)}`,
      transition: 'all 0.35s cubic-bezier(0.165, 0.84, 0.44, 1)',
      position: 'relative',
      width: '100%',
      maxWidth: '620px',
      overflow: 'hidden',
      backdropFilter: 'blur(22px) saturate(1.16)',
      WebkitBackdropFilter: 'blur(22px) saturate(1.16)',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent'
    },
    trainingTypeIcon: {
      width: '72px',
      height: '72px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 20px',
      color: 'white',
      fontWeight: 'bold',
      boxShadow: `0 10px 28px rgba(${accent.rgb}, 0.26)`,
      position: 'relative',
      zIndex: 2
    },
    trainingTypeName: {
      fontSize: `${baseFontSize + 2}px`,
      fontWeight: '800',
      color: Colors.get('mainText', theme),
      marginBottom: '10px',
      minHeight: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    trainingTypeDescription: {
      fontSize: `${baseFontSize - 1}px`,
      color: Colors.get('subText', theme),
      lineHeight: '1.5',
      opacity: 0.9,
      minHeight: '42px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0 8px'
    },
    selectedBadge: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: accent.soft,
      color: accent.hue,
      fontSize: `${baseFontSize - 3}px`,
      fontWeight: 'bold',
      padding: '4px 10px',
      borderRadius: '20px',
      border: `1px solid ${accent.ring}`,
      boxShadow: `0 4px 14px rgba(${accent.rgb}, 0.18)`
    },
    
    premiumScreen: {
      position: 'fixed',
      inset: 0,
      zIndex: 2555,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'calc(env(safe-area-inset-top, 0px) + 28px) 22px calc(env(safe-area-inset-bottom, 0px) + 28px)',
      textAlign: 'center',
      background: isLight
        ? 'radial-gradient(circle at 50% 14%, rgba(87,155,200,0.22), transparent 38%), rgba(245,249,252,0.86)'
        : 'radial-gradient(circle at 50% 16%, rgba(87,155,200,0.28), transparent 40%), rgba(6,12,18,0.84)',
      backdropFilter: 'blur(24px) saturate(150%)',
      WebkitBackdropFilter: 'blur(24px) saturate(150%)',
      boxSizing: 'border-box',
    },
    premiumGlass: {
      width: 'min(88vw, 360px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '28px 22px',
      borderRadius: '34px',
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.10)' : 'rgba(255,255,255,0.12)'}`,
      background: isLight
        ? 'linear-gradient(145deg, rgba(255,255,255,0.72), rgba(255,255,255,0.36))'
        : 'linear-gradient(145deg, rgba(23,35,46,0.72), rgba(9,14,20,0.54))',
      boxShadow: isLight
        ? '0 26px 70px rgba(38,76,103,0.18), inset 0 1px 0 rgba(255,255,255,0.78)'
        : '0 34px 90px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.10)',
      backdropFilter: 'blur(28px) saturate(160%)',
      WebkitBackdropFilter: 'blur(28px) saturate(160%)',
    },
    // PREMIUM STYLES (FIXED LOGIC)
    premiumOverlay: {
      position: 'absolute', 
      inset: 0, 
      zIndex: 10,
      backgroundColor: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 15, 15, 0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    },
    premiumContent: {
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      textAlign: 'center',
      padding: '40px',
      borderRadius: '32px',
      border: `1px solid ${Colors.get('border', theme)}`,
      background: isLight 
        ? 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(245,247,250,0.9) 100%)'
        : 'linear-gradient(145deg, rgba(30,30,30,0.95) 0%, rgba(20,20,20,0.95) 100%)',
      boxShadow: isLight
        ? '0 15px 50px -5px rgba(0, 0, 0, 0.12)'
        : '0 15px 50px -5px rgba(0, 0, 0, 0.45)',
      maxWidth: '450px',
      width: '100%'
    },
    premiumIcon: {
      width: '76px',
      height: '76px',
      borderRadius: '24px',
      background: isLight
        ? 'linear-gradient(145deg, rgba(87,155,200,0.20), rgba(255,255,255,0.66))'
        : 'linear-gradient(145deg, rgba(87,155,200,0.26), rgba(255,255,255,0.055))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '18px',
      color: '#BFE8FF',
      border: `1px solid ${isLight ? 'rgba(87,155,200,0.26)' : 'rgba(191,232,255,0.20)'}`,
      boxShadow: '0 18px 42px rgba(87,155,200,0.22), inset 0 1px 0 rgba(255,255,255,0.18)'
    },
    premiumTitle: {
      fontSize: `${baseFontSize + 4}px`,
      fontWeight: '800',
      color: isLight ? '#1e293b' : '#f8fafc',
      marginBottom: '12px',
      background: isLight 
        ? 'linear-gradient(90deg, #1e293b 0%, #475569 100%)'
        : 'linear-gradient(90deg, #f8fafc 0%, #cbd5e1 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    premiumText: {
      fontSize: `${baseFontSize + 1}px`,
      color: isLight ? 'rgba(28,42,56,0.72)' : 'rgba(226,238,248,0.76)',
      lineHeight: '1.45',
      marginBottom: '22px',
      maxWidth: '260px',
      fontWeight: 850
    },
    premiumButton: {
      width: '100%',
      maxWidth: '244px',
      minHeight: '50px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '9px',
      background: 'linear-gradient(135deg, #63D8F5 0%, #7D8CF4 100%)',
      color: '#071018',
      border: '1px solid rgba(255,255,255,0.22)',
      borderRadius: '22px',
      padding: '0 22px',
      fontSize: `${baseFontSize + 1}px`,
      fontWeight: '900',
      cursor: 'pointer',
      boxShadow: '0 18px 44px rgba(87,155,200,0.30), inset 0 1px 0 rgba(255,255,255,0.44)',
      transition: 'all 0.3s ease',
      marginTop: '8px'
    },
    premiumBack: {
      marginTop: '14px',
      border: 'none',
      background: 'transparent',
      color: isLight ? 'rgba(28,42,56,0.46)' : 'rgba(226,238,248,0.48)',
      fontSize: `${baseFontSize}px`,
      fontWeight: 850,
      cursor: 'pointer',
      padding: '8px 16px',
    },
  };
};

export default TrainingAnaliticsTypes;
