import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, setPage, setShowPopUpPanel } from '../../StaticClasses/HabitsBus';
import { addCardioSession, updateCardioSession, getCardioSession, deleteCardioSession } from '../../StaticClasses/TrainingLogHelper.js';
import { motion, AnimatePresence } from 'framer-motion';
import { BehaviorSubject } from 'rxjs';
// Modern icons
import { TbRoute, TbClock, TbMountain, TbHeartbeat, TbClockBolt, TbFlame, TbNotes } from "react-icons/tb";
import { IoArrowBack, IoTrash } from "react-icons/io5";
import ScrollPicker from '../../Helpers/ScrollPicker.jsx';

// RX Subjects - ONLY for receiving data FROM TrainingMain
export const cardioType$ = new BehaviorSubject('RUNNING');
export const trainInfo$ = new BehaviorSubject({ mode: 'new', dayKey: '', dInd: null });

// Custom Slider Component (unchanged - kept for metrics)
const CustomSlider = ({ value, onChange, min, max, step = 1, color, marks = [], label }) => {
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const currentValue = useRef(value);

  // Update ref when value changes externally
  useEffect(() => {
    currentValue.current = value;
  }, [value]);

  // Cleanup drag listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove, { passive: false });
      document.removeEventListener('touchend', handleDragEnd);
      document.removeEventListener('touchcancel', handleDragEnd);
    };
  }, []);

  const getNewValueFromPosition = (clientX) => {
    if (!sliderRef.current) return value;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    const rawValue = min + (percentage / 100) * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    
    // Get initial position
    const clientX = e.clientX || (e.touches?.[0]?.clientX);
    dragStartX.current = clientX;
    currentValue.current = getNewValueFromPosition(clientX);
    onChange(currentValue.current);
    
    // Add global listeners
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
    document.addEventListener('touchcancel', handleDragEnd);
  };

  const handleDragMove = (e) => {
    if (!isDragging || !sliderRef.current) return;
    
    e.preventDefault();
    const clientX = e.clientX || (e.touches?.[0]?.clientX);
    const newValue = getNewValueFromPosition(clientX);
    
    if (newValue !== currentValue.current) {
      currentValue.current = newValue;
      onChange(newValue);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Remove all listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
    document.removeEventListener('touchcancel', handleDragEnd);
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ width: '100%', marginTop: '12px' }}>
      <div 
        ref={sliderRef}
        style={{
          position: 'relative',
          height: '8px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
          cursor: isDragging ? 'grabbing' : 'pointer',
          overflow: 'hidden',
          touchAction: 'none' // Critical for touch devices
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        {/* Track fill */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${percentage}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: '4px',
          transition: isDragging ? 'none' : 'width 0.15s cubic-bezier(0.165, 0.84, 0.44, 1)'
        }} />
        
        {/* Thumb */}
        <div style={{
          position: 'absolute',
          left: `${percentage}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: '#fff',
          border: `3px solid ${color}`,
          boxShadow: isDragging 
            ? `0 0 0 8px ${color}30, 0 4px 15px rgba(0,0,0,0.3)`
            : '0 4px 12px rgba(0,0,0,0.25)',
          transition: 'all 0.15s ease',
          pointerEvents: 'none',
          zIndex: 2
        }} />
        
        {/* Marks */}
        {marks.map((mark, i) => {
          const markPos = ((mark.value - min) / (max - min)) * 100;
          return (
            <div 
              key={i} 
              style={{
                position: 'absolute',
                left: `${markPos}%`,
                top: '50%',
                transform: 'translateX(-50%)',
                width: '3px',
                height: '10px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '1px'
              }} 
            />
          );
        })}
      </div>
      
      {/* Value display */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '8px',
        fontSize: '14px',
        color: 'rgba(255,255,255,0.85)',
        userSelect: 'none'
      }}>
        <span>{min}</span>
        <span style={{ 
          fontWeight: '700', 
          color: '#fff',
          background: `${color}20`,
          padding: '2px 8px',
          borderRadius: '12px'
        }}>
          {value}{label}
        </span>
        <span>{max}</span>
      </div>
    </div>
  );
};

const TrainingCardio = () => {
  // States - NO type/date selection states
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  
  // Critical: Type and date are MANAGED EXTERNALLY, not by this component
  const [selectedType, setSelectedType] = useState('RUNNING');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Metrics states only
  const [km, setKm] = useState(5);
  const [meters, setMeters] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [elevation, setElevation] = useState(0);
  const [heartRate, setHeartRate] = useState(140);
  const [cadence, setCadence] = useState(170);
  const [rpe, setRpe] = useState(7);
  const [notes, setNotes] = useState('');
  
  // Edit mode state
  const [mode, setMode] = useState('new'); // 'new' or 'edit'
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Ref to track initial load
  const isInitialLoad = useRef(true);

  // SUBSCRIPTIONS - ONLY listen to external commands
  useEffect(() => {
    const subs = [
      theme$.subscribe(setThemeState),
      lang$.subscribe(lang => setLangIndex(lang === 'ru' ? 0 : 1)),
      fontSize$.subscribe(setFSize),
      
      // CRITICAL: Listen for navigation commands from TrainingMain
      trainInfo$.subscribe((info) => {
        if (info.mode === 'edit' && info.dayKey && info.dInd !== null && info.dInd !== undefined) {
          // EDIT MODE: Load existing session
          setMode('edit');
          loadSessionData(info.dayKey, info.dInd);
        } else if (info.mode === 'new' && info.dayKey) {
          // NEW MODE with specific date from TrainingMain
          setMode('new');
          setSelectedDate(parseLocalDate(info.dayKey));
          resetFormMetrics(); // Reset metrics but keep date/type
        } else {
          // Fallback: reset everything
          setMode('new');
          resetForm();
        }
      }),
      
      // Type is SET BY TRAININGMAIN ONLY
      cardioType$.subscribe((type) => {
        if (isInitialLoad.current) {
          setSelectedType(type);
          isInitialLoad.current = false;
        }
        // Always update type when commanded (even after initial load)
        setSelectedType(type);
      })
    ];
    
    return () => subs.forEach(s => s.unsubscribe());
  }, []);

  const parseLocalDate = (dateString) => {
  // Разбираем строку "YYYY-MM-DD" и создаём дату в ЛОКАЛЬНОМ часовом поясе
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day + 1); // month 0-11 в JS
};

  // Training types configuration (for display/icons only)
  const trainingTypes = useMemo(() => ({
    RUNNING: { label: langIndex === 0 ? 'Бег' : 'Running', color: '#917237', gradient: 'linear-gradient(120deg, #8b5325, #a52c00)' },
    CYCLING: { label: langIndex === 0 ? 'Велосипед' : 'Cycling', color: '#468932', gradient: 'linear-gradient(120deg, #368a36, #00842a)' },
    SWIMMING: { label: langIndex === 0 ? 'Плавание' : 'Swimming', color: '#407a97', gradient: 'linear-gradient(120deg, #2f3d7d, #201c70)' },
    GYM: { label: langIndex === 0 ? 'Силовая' : 'Strength', color: '#9D4EDD', gradient: 'linear-gradient(120deg, #9d4edd, #7209b7)' }
  }), [langIndex]);

  const currentType = trainingTypes[selectedType] || trainingTypes.RUNNING;

  // Ranges for metrics pickers
  const kmRange = useMemo(() => Array.from({length: 51}, (_,i) => i), []);
  const metersRange = useMemo(() => Array.from({length: 10}, (_,i) => i*100), []);
  const hoursRange = useMemo(() => Array.from({length: 6}, (_,i) => i), []);
  const minutesRange = useMemo(() => Array.from({length: 60}, (_,i) => i), []);

  // Load session data for editing
  const loadSessionData = useCallback(async (dayKey, index) => {
    try {
      setLoading(true);
      const session = await getCardioSession(dayKey, index);
      if (session) {
        setSessionId(`${dayKey}_${index}`);
        setSelectedDate(parseLocalDate(dayKey));
        setSelectedType(session.type || 'RUNNING');
        
        // Parse distance
        setKm(Math.floor(session.distance));
        setMeters(Math.round((session.distance % 1) * 1000));
        
        // Parse duration
        setHours(Math.floor(session.duration / 60));
        setMinutes(session.duration % 60);
        
        setElevation(session.elevationGain || 0);
        setHeartRate(session.avgHeartRate || 140);
        setCadence(session.avgCadence || 170);
        setRpe(session.rpe || 7);
        setNotes(session.notes || '');
      }
    } catch (e) {
      console.error('Load error:', e);
      setShowPopUpPanel(langIndex === 0 ? 'Ошибка загрузки' : 'Load error', 2000, false);
    } finally {
      setLoading(false);
    }
  }, [langIndex]);

  // Reset ONLY metrics (preserve type/date set externally)
  const resetFormMetrics = useCallback(() => {
    setKm(5); setMeters(0); setHours(0); setMinutes(30);
    setElevation(0); setHeartRate(140); setCadence(170); setRpe(7); setNotes('');
  }, []);

  // Full reset (used when navigating away)
  const resetForm = useCallback(() => {
    resetFormMetrics();
    setSelectedType('RUNNING');
    setSelectedDate(parseLocalDate(new Date().toISOString().split('T')[0]));
    setSessionId(null);
  }, [resetFormMetrics]);

  // Handle save with proper date handling
  const handleSave = useCallback(() => {
    const totalDist = km + (meters / 1000);
    const totalDur = hours * 60 + minutes;
    
    if (totalDur <= 0 || totalDist <= 0) {
      setShowPopUpPanel(
        langIndex === 0 ? "Дистанция и длительность > 0" : "Distance & duration > 0",
        2000, false
      );
      return;
    }

    const sessionData = {
      type: selectedType,
      distance: totalDist,
      duration: totalDur,
      elevationGain: elevation,
      avgCadence: cadence,
      avgHeartRate: heartRate,
      rpe: rpe,
      notes: notes,
      startTime: 16 * 3600000 // Default to 4 PM
    };

    try {
      if (mode === 'edit' && sessionId) {
        updateCardioSession(sessionId, sessionData);
        setShowPopUpPanel(langIndex === 0 ? "✅ Обновлено!" : "✅ Updated!", 1500, true);
      } else {
        // Use date FROM TRAININGMAIN (set via trainInfo$)
        addCardioSession(selectedDate, selectedType, totalDist, totalDur, sessionData.startTime, sessionData);
        setShowPopUpPanel(langIndex === 0 ? "✅ Добавлено!" : "✅ Added!", 1500, true);
      }
      
      setTimeout(() => {
        resetForm();
        setPage('TrainingMain');
      }, 400);
    } catch (e) {
      console.error('Save error:', e);
      setShowPopUpPanel(langIndex === 0 ? "❌ Ошибка сохранения" : "❌ Save error", 2000, false);
    }
  }, [km, meters, hours, minutes, elevation, heartRate, cadence, rpe, notes, selectedType, selectedDate, mode, sessionId, langIndex, resetForm]);

  // Handle delete with proper confirmation
  const handleDelete = useCallback(() => {
    if (mode !== 'edit' || !sessionId) return;

    if (window.confirm(langIndex === 0 
      ? 'Вы уверены, что хотите удалить эту тренировку?' 
      : 'Are you sure you want to delete this session?')) {
      try {
        deleteCardioSession(sessionId);
        setShowPopUpPanel(langIndex === 0 ? "✅ Удалено!" : "✅ Deleted!", 1500, true);
        setTimeout(() => {
          resetForm();
          setPage('TrainingMain');
        }, 400);
      } catch (e) {
        console.error('Delete error:', e);
        setShowPopUpPanel(langIndex === 0 ? "❌ Ошибка удаления" : "❌ Delete error", 2000, false);
      }
    }
  }, [mode, sessionId, langIndex, resetForm]);

  return (
    <div style={{
      backgroundColor:Colors.get('background', theme),
          display: "flex", flexDirection: "column", alignItems: "center",
          height: "90vh",marginTop:'100px', width: "100vw", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          overflowY:'scroll', paddingTop: '10px',overflowX:'hidden'
    }}>
      {/* Header with type badge and DATE CONTEXT from TrainingMain */}
      <motion.header
        style={{
          background: currentType.gradient,
          width:'100vw',
          height:'100px',
          top: 0,
          zIndex: 100,
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          borderBottomLeftRadius: '32px',
          borderBottomRightRadius: '32px'
        }}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          
       
     
          
          <div style={{ flex: 1, textAlign: 'center' }}>
            
            <div style={{ 
              fontSize: '15px', 
              color: 'rgba(255,255,255,0.85)',
              fontWeight: '500',
              margin: '9px'
            }}>
              {selectedDate.toLocaleDateString(langIndex === 0 ? 'ru-RU' : 'en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <h1 style={{
              fontSize: '18px',
              fontWeight: '800',
              color: '#fff',
              margin: 5,
              textShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}>
              {mode === 'edit' 
                ? (langIndex === 0 ? 'Редактировать тренировку: '+ (currentType.label) : 'Edit Session: '+ (currentType.label))
                : (langIndex === 0 ? 'Новая тренировка: '+ (currentType.label) : 'New Session: ' + (currentType.label))}
            </h1>
          </div>
          
          {mode === 'edit' && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleDelete}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '18px',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)'
              }}
            >
              <IoTrash size={26} color="#ff5252" />
            </motion.button>
          )}
        </div>
      </motion.header>

      {/* Content - ONLY METRICS SECTION (no type/date selectors) */}
      <div style={{ 
        minWidth:'85vw',
        maxWidth: '600px', 
        margin: '24px auto 0', 
        padding: '0 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Metrics Section - First and only section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }} // Adjusted delay since sections removed
        >
          <h2 style={{
            fontSize: '20px',
            fontWeight: '800',
            marginBottom: '24px',
            color: theme === 'dark' ? '#e6e6ff' : '#1a1a2e',
            textAlign: 'center'
          }}>
            {langIndex === 0 ? 'Параметры тренировки' : 'Session Metrics'}
          </h2>
          
          {/* Distance Input */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '12px',
              alignItems: 'center'
            }}>
              <label style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <TbRoute size={18} color={currentType.color} />
                {langIndex === 0 ? 'Дистанция' : 'Distance'}
              </label>
              <span style={{ 
                fontSize: '17px', 
                fontWeight: '700', 
                color: currentType.color
              }}>
                {km} km {meters} m
              </span>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <ScrollPicker 
                  items={kmRange.map(k => k.toString())} 
                  value={km.toString()} 
                  onChange={v => setKm(parseInt(v))} 
                  theme={theme} 
                  width="100%"
                  itemHeight={44}
                />
              </div>
              <div style={{ flex: 1 }}>
                <ScrollPicker 
                  items={metersRange.map(m => m.toString())} 
                  value={meters.toString()} 
                  onChange={v => setMeters(parseInt(v))} 
                  theme={theme} 
                  width="100%"
                  itemHeight={44}
                />
              </div>
            </div>
          </div>
          
          {/* Duration Input */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '12px',
              alignItems: 'center'
            }}>
              <label style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <TbClock size={18} color={currentType.color} />
                {langIndex === 0 ? 'Длительность' : 'Duration'}
              </label>
              <span style={{ 
                fontSize: '17px', 
                fontWeight: '700', 
                color: currentType.color
              }}>
                {hours}h {minutes.toString().padStart(2, '0')}m
              </span>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <ScrollPicker 
                  items={hoursRange.map(h => h.toString())} 
                  value={hours.toString()} 
                  onChange={v => setHours(parseInt(v))} 
                  theme={theme} 
                  width="100%"
                  itemHeight={44}
                />
              </div>
              <div style={{ flex: 1 }}>
                <ScrollPicker 
                  items={minutesRange.map(m => m.toString())} 
                  value={minutes.toString()} 
                  onChange={v => setMinutes(parseInt(v))} 
                  theme={theme} 
                  width="100%"
                  itemHeight={44}
                />
              </div>
            </div>
          </div>
          
          {/* Elevation Slider */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '12px',
              alignItems: 'center'
            }}>
              <label style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <TbMountain size={18} color="#FF9E6D" />
                {langIndex === 0 ? 'Набор высоты' : 'Elevation'}
              </label>
              <span style={{ 
                fontSize: '17px', 
                fontWeight: '700', 
                color: '#FF9E6D'
              }}>
                {elevation} m
              </span>
            </div>
            <CustomSlider 
              value={elevation} 
              onChange={setElevation} 
              min={0} 
              max={500} 
              step={5}
              color="#FF9E6D"
              marks={[{value: 0}, {value: 250}, {value: 500}]}
            />
          </div>
          
          {/* Heart Rate Slider */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '12px',
              alignItems: 'center'
            }}>
              <label style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <TbHeartbeat size={18} color="#FF6B9D" />
                {langIndex === 0 ? 'Пульс' : 'Heart Rate'}
              </label>
              <span style={{ 
                fontSize: '17px', 
                fontWeight: '700', 
                color: '#FF6B9D'
              }}>
                {heartRate} bpm
              </span>
            </div>
            <CustomSlider 
              value={heartRate} 
              onChange={setHeartRate} 
              min={60} 
              max={180} 
              step={1}
              color="#FF6B9D"
              marks={[{value: 60}, {value: 120}, {value: 180}]}
            />
          </div>
          
          {/* Cadence Slider */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '12px',
              alignItems: 'center'
            }}>
              <label style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <TbClockBolt size={18} color="#4CC9F0" />
                {langIndex === 0 ? 'Каденс' : 'Cadence'}
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: '500',
                  color: '#888',
                  background: 'rgba(0,0,0,0.03)',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  marginLeft: '6px'
                }}>
                  {selectedType === 'RUNNING' ? 'spm' : selectedType === 'CYCLING' ? 'rpm' : 'spm'}
                </span>
              </label>
              <span style={{ 
                fontSize: '17px', 
                fontWeight: '700', 
                color: '#4CC9F0'
              }}>
                {cadence}
              </span>
            </div>
            <CustomSlider 
              value={cadence} 
              onChange={setCadence} 
              min={50} 
              max={200} 
              step={1}
              color="#4CC9F0"
              marks={[{value: 50}, {value: 125}, {value: 200}]}
            />
          </div>
          
          {/* RPE Slider */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '12px',
              alignItems: 'center'
            }}>
              <label style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <TbFlame size={18} color="#FFA500" />
                {langIndex === 0 ? 'Воспр. (RPE)' : 'Effort (RPE)'}
              </label>
              <span style={{ 
                fontSize: '20px', 
                fontWeight: '800', 
                color: '#FFA500',
                background: 'rgba(255, 165, 0, 0.15)',
                padding: '3px 12px',
                borderRadius: '16px'
              }}>
                {rpe}/10
              </span>
            </div>
            <CustomSlider 
              value={rpe} 
              onChange={setRpe} 
              min={1} 
              max={10} 
              step={1}
              color="#FFA500"
              marks={[{value: 1}, {value: 5}, {value: 10}]}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '8px',
              fontSize: '13px',
              color: theme === 'dark' ? '#aaa' : '#666'
            }}>
              <span>{langIndex === 0 ? 'Легко' : 'Easy'}</span>
              <span>{langIndex === 0 ? 'Тяжело' : 'Hard'}</span>
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label style={{ 
              fontSize: '16px', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <TbNotes size={18} color="#A0A0A0" />
              {langIndex === 0 ? 'Заметки' : 'Notes'}
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={langIndex === 0 
                ? "Как прошла тренировка? Погода, ощущения..." 
                : "How was your session? Weather, feelings..."}
              style={{
                width: '90%',
                minHeight: '90px',
                padding: '16px',
                borderRadius: '20px',
                border: `2px solid ${theme === 'dark' ? 'rgba(100,100,150,0.4)' : 'rgba(0,0,0,0.08)'}`,
                background: theme === 'dark' ? 'rgba(40,40,70,0.7)' : 'rgba(255,255,255,0.9)',
                color: theme === 'dark' ? '#e6e6ff' : '#1a1a2e',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical',
                transition: 'all 0.25s ease'
              }}
            />
          </div>
        </motion.section>
      </div>

      {/* Save Button */}
      <motion.footer
        style={{
          bottom: 0,
          width: '100%',
          padding: '16px 24px 32px',
          display: 'flex',
          justifyContent: 'center',
          background: 'transparent',
          zIndex: 90
        }}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleSave}
          style={{
            background: currentType.gradient,
            color: '#fff',
            border: 'none',
            borderRadius: '28px',
            width: '90%',
            maxWidth: '560px',
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IoArrowBack size={22} style={{ transform: 'rotate(180deg)' }} />
          </div>
          {mode === 'edit'
            ? (langIndex === 0 ? 'Сохранить изменения' : 'Save Changes')
            : (langIndex === 0 ? 'Добавить тренировку' : 'Add Session')}
        </motion.button>
      </motion.footer>
      <div style={{marginBottom:'150px'}}></div>
      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: theme === 'dark' ? 'rgba(15,15,27,0.95)' : 'rgba(248,249,255,0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              border: `3px solid rgba(255,255,255,0.2)`,
              borderTopColor: currentType.color,
              borderRadius: '50%',
              animation: 'spin 0.9s linear infinite'
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrainingCardio;

// Critical: Add this to your global CSS for the spinner animation
// @keyframes spin { to { transform: rotate(360deg); } }