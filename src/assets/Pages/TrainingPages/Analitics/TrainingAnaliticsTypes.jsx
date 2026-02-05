import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData, UserData } from '../../../StaticClasses/AppData';
import Colors from '../../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, premium$ ,setPage} from '../../../StaticClasses/HabitsBus';
import { FaRunning,FaBicycle,FaSwimmer } from 'react-icons/fa';
import { MdFitnessCenter } from 'react-icons/md';

// Training type configuration with localized content and icons
const TRAINING_TYPES = [
  {
    id: 'GYM',
    names: { ru: 'ТРЕНАЖЕРНЫЙ ЗАЛ', en: 'GYM' },
    descriptions: { 
      ru: 'Силовые тренировки с отягощениями', 
      en: 'Strength training with weights' 
    },
    gradient: 'linear-gradient(135deg, #f65c5c 0%, #b40f0f 100%)'
  },
  {
    id: 'RUNNING',
    names: { ru: 'КАРДИО', en: 'CARDIO' },
    descriptions: { 
      ru: 'Бег, велотренировки и плавание', 
      en: 'Running , cycling and swimming' 
    },
    gradient: 'linear-gradient(135deg, #efb344 0%, #aa7518 100%)'
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
        <div 
                            onClick={(e) => e.stopPropagation()} 
                            style={{
                                position: 'absolute', inset: 0, zIndex: 25,
                                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                backgroundColor: theme$.value === 'dark' ? 'rgba(10, 10, 10, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ color: theme$.value === 'dark' ? '#FFD700' : '#D97706', fontSize: '11px', fontWeight: 'bold', fontFamily: 'Segoe UI' }}>
                                {langIndex === 0 ? 'ТОЛЬКО ДЛЯ ПРЕМИУМ' : 'PREMIUM USERS ONLY'}
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
              return (
                <motion.div
                  key={type.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: 1, 
                    scale: isSelected ? 1.05 : 1,
                    transition: { type: "spring", damping: 15, stiffness: 300 }
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setPage(type.id === 'GYM' ? 'TrainingAnaliticsMain' :  'TrainingAnaliticsCardio')}
                  style={{
                    ...styles(theme, fSize).trainingTypeCard,
                    border: isSelected 
                      ? `2px solid ${type.gradient.split(' ')[0].replace('linear-gradient(135deg,', '').trim()}`
                      : `1px solid ${Colors.get('border', theme)}`,
                    background: isSelected 
                      ? `linear-gradient(145deg, ${Colors.get('cardBackground', theme)} 0%, ${Colors.get('background', theme)} 100%)`
                      : `linear-gradient(145deg, ${Colors.get('cardBackground', theme)} 0%, ${Colors.get('background', theme)} 100%)`,
                    boxShadow: isSelected
                      ? `0 8px 25px ${type.gradient.split(' ')[0].replace('linear-gradient(135deg,', '').trim()}40`
                      : styles(theme, fSize).trainingTypeCard.boxShadow,
                    cursor: isAnimating ? 'wait' : 'pointer'
                  }}
                >
                  <div style={{
                    ...styles(theme, fSize).trainingTypeIcon,
                    background: type.gradient,
                    WebkitMaskImage: 'radial-gradient(circle, white 70%, transparent 75%)',
                    maskImage: 'radial-gradient(circle, white 70%, transparent 75%)'
                  }}>
                    {index === 0 ? (<MdFitnessCenter fontSize={29}/>) : (<FaRunning fontSize={29}/>)}
                  </div>
                  
                  <motion.div 
                    style={styles(theme, fSize).trainingTypeName}
                    animate={{ color: isSelected ? type.gradient.split(' ')[0].replace('linear-gradient(135deg,', '').trim() : Colors.get('mainText', theme) }}
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
  const isLight = theme === 'light';
  const baseFontSize = fSize === 0 ? 14 : 16;
  
  return {
    container: {
      display: 'flex', 
      width: "100vw", 
      flexDirection: 'column',
      overflowY: 'auto', 
      overflowX: 'hidden', 
      justifyContent: "flex-start", 
      alignItems: 'center',
      backgroundColor: Colors.get('background', theme), 
      height: "90vh",
      marginTop: '80px',
      paddingTop: '10px',
      paddingBottom: '30px',
      boxSizing: 'border-box',
      position: 'relative'
    },
    headerSection: {
      width: '100%',
      maxWidth: '800px',
      padding: '0 20px 25px',
      textAlign: 'center',
      marginTop:'50px'
    },
    sectionTitle: {
      fontSize: `${baseFontSize + 4}px`,
      fontWeight: '800',
      color: Colors.get('mainText', theme),
      marginBottom: '8px',
      background: isLight 
        ? 'linear-gradient(90deg, #1e293b 0%, #475569 100%)'
        : 'linear-gradient(90deg, #f8fafc 0%, #cbd5e1 100%)',
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
      gap: '24px',
      padding: '0 20px',
      width: '100%',
      maxWidth: '1000px',
      alignItems:'center',
      marginTop: '10px'
    },
    trainingTypeCard: {
      backgroundColor: Colors.get('cardBackground', theme),
      borderRadius: '28px',
      padding: '28px 24px',
      textAlign: 'center',
      boxShadow: isLight 
        ? '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 5px 15px -5px rgba(0, 0, 0, 0.05)'
        : '0 10px 35px -5px rgba(0, 0, 0, 0.35), 0 5px 15px -5px rgba(0, 0, 0, 0.25)',
      border: `1px solid ${Colors.get('border', theme)}`,
      transition: 'all 0.35s cubic-bezier(0.165, 0.84, 0.44, 1)',
      position: 'relative',
      width:'80vw',
      overflow: 'hidden'
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
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
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
      backgroundColor: isLight ? 'rgba(74, 222, 128, 0.15)' : 'rgba(74, 222, 128, 0.25)',
      color: '#4ADE80',
      fontSize: `${baseFontSize - 3}px`,
      fontWeight: 'bold',
      padding: '4px 10px',
      borderRadius: '20px',
      border: `1px solid ${isLight ? 'rgba(74, 222, 128, 0.3)' : 'rgba(74, 222, 128, 0.4)'}`,
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)'
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
      width: '80px',
      height: '80px',
      borderRadius: '24px',
      background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '24px',
      color: 'white',
      boxShadow: '0 10px 30px rgba(239, 68, 68, 0.35)'
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
      fontSize: `${baseFontSize}px`,
      color: Colors.get('subText', theme),
      lineHeight: '1.6',
      marginBottom: '28px',
      maxWidth: '380px'
    },
    premiumButton: {
      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '18px',
      padding: '14px 42px',
      fontSize: `${baseFontSize}px`,
      fontWeight: '700',
      cursor: 'pointer',
      boxShadow: '0 8px 25px rgba(147, 51, 234, 0.45)',
      transition: 'all 0.3s ease',
      marginTop: '8px'
    }
  };
};

export default TrainingAnaliticsTypes;