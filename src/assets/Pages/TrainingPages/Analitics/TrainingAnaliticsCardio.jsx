import React, { useState, useEffect, useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../../../StaticClasses/AppData';
import Colors from '../../../StaticClasses/Colors';
import { theme$, lang$, fontSize$ } from '../../../StaticClasses/HabitsBus';
import { 
  FaRunning, 
  FaBicycle, 
  FaSwimmer, 
  FaTachometerAlt, 
  FaClock, 
  FaChartLine,
  FaMountain,
  FaHeartbeat,
  FaShoePrints,
  FaChevronDown,
  FaChevronUp,
  FaCalendarAlt,
  FaStopwatch
} from 'react-icons/fa';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip
} from 'recharts';
import {
  getTrainingAccent,
  getTrainingPageBackground,
  getTrainingPanelBackground,
  getTrainingPanelBorder,
  getTrainingPanelShadow
} from '../TrainingVisuals.js';



// Helper Functions
const formatDuration = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return hrs > 0 
    ? `${hrs}h ${mins.toString().padStart(2, '0')}m`
    : `${mins}m ${secs.toString().padStart(2, '0')}s`;
};

const formatDate = (dateString, langIndex) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(langIndex === 0 ? 'ru-RU' : 'en-US', {
    month: 'short',
    day: 'numeric'
  });
};

// Convert pace string (mm:ss) to decimal minutes for calculations
const paceToDecimal = (paceStr) => {
  if (!paceStr || paceStr === '0:00') return 0;
  const [mins, secs] = paceStr.split(':').map(Number);
  return mins + (secs / 60);
};

// Custom tooltip for chart
const CustomTooltip = ({ active, payload, label, metric, langIndex, theme }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPace = metric === 'pace';
    
    // Get metric label based on language and metric type
    const getMetricLabel = () => {
      switch(metric) {
        case 'distance': return langIndex === 0 ? 'Дистанция' : 'Distance';
        case 'speed': return langIndex === 0 ? 'Скорость' : 'Speed';
        case 'pace': return langIndex === 0 ? 'Темп' : 'Pace';
        case 'elevation': return langIndex === 0 ? 'Набор высоты' : 'Elevation';
        case 'heartRate': return langIndex === 0 ? 'Пульс' : 'Heart Rate';
        default: return '';
      }
    };

    return (
      <div style={{
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 30, 30, 0.95)',
        border: `1px solid ${Colors.get('border', theme)}`,
        borderRadius: '12px',
        padding: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: '14px',
        color: Colors.get('mainText', theme)
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: '6px',
          color: Colors.get('mainText', theme)
        }}>
          {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: data.stroke
          }} />
          <div>
            <span style={{ color: Colors.get('subText', theme) }}>
              {getMetricLabel()}: 
            </span>
            <span style={{ fontWeight: 'bold', marginLeft: '4px' }}>
              {isPace ? data.originalValue : data.value.toFixed(2)} {data.unit}
            </span>
          </div>
        </div>
        {data.elevationGain && (
          <div style={{ marginTop: '4px', fontSize: '13px', color: Colors.get('subText', theme) }}>
            <FaMountain size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            {langIndex === 0 ? `Набор: ${data.elevationGain} м` : `Elevation: ${data.elevationGain} m`}
          </div>
        )}
        {data.avgHeartRate && (
          <div style={{ marginTop: '2px', fontSize: '13px', color: Colors.get('subText', theme) }}>
            <FaHeartbeat size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            {langIndex === 0 ? `Пульс: ${data.avgHeartRate} уд/мин` : `HR: ${data.avgHeartRate} bpm`}
          </div>
        )}
      </div>
    );
  }
  return null;
};

const TrainingAnaliticsCardio = () => {
  // --- STATE ---
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [, setFSize] = useState(AppData.prefs[4]);
  const [tab, setTab] = useState('running');
  const [selectedMetric, setSelectedMetric] = useState('distance');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState(null);
  const [expandedFilter,setExpandedFilter] = useState(false);

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // --- SUBSCRIPTIONS ---
  useEffect(() => {
    const sub1 = theme$.subscribe(setThemeState);
    const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
    const sub3 = fontSize$.subscribe(setFSize);
    
    // Simulate data loading delay
    const timer = setTimeout(() => setIsLoading(false), 500);
    
    return () => {
      clearTimeout(timer);
      sub1.unsubscribe(); sub2.unsubscribe(); sub3.unsubscribe();
    };
  }, []);

  // --- DATA PROCESSING FROM NEW STRUCTURE ---
  const cardioSessions = useMemo(() => {
  const sessions = [];
  const typeMap = {
    'RUNNING': 'running',
    'CYCLING': 'cycling',
    'SWIMMING': 'swimming'
  };

  // Process training log data
  if (AppData.trainingLog && typeof AppData.trainingLog === 'object') {
    Object.entries(AppData.trainingLog).forEach(([date, sessionsArray]) => {
      if (Array.isArray(sessionsArray)) {
        sessionsArray.forEach((session, index) => {
          const typeKey = typeMap[session.type];
          if (typeKey && typeKey !== 'GYM') {
            sessions.push({
              id: `${date}-${index}`,
              type: typeKey,
              distance: session.distance * 1000, // Convert km to meters
              duration: session.duration / 1000, // Convert ms to seconds
              date: date,
              elevationGain: session.elevationGain || 0,
              avgCadence: session.avgCadence || 0,
              avgHeartRate: session.avgHeartRate || 0,
              rpe: session.rpe || 0,
              notes: session.notes || ''
            });
          }
        });
      }
    });
  }

  // Fallback sample data if no training log exists
  return sessions.length > 0 ? sessions : [];
}, []);

  const availableYearsMonths = useMemo(() => {
  if (!cardioSessions || cardioSessions.length === 0) return { years: [], months: [] };
  
  const yearsSet = new Set();
  const monthsSet = new Set();
  
  cardioSessions.forEach(session => {
    const date = new Date(session.date);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    
    yearsSet.add(year);
    
    // Only add months for the selected year (or all if no year selected)
    if (!selectedYear || year === parseInt(selectedYear)) {
      monthsSet.add(month);
    }
  });
  
  const years = Array.from(yearsSet).sort((a, b) => b - a); // Descending
  const months = Array.from(monthsSet).sort((a, b) => a - b); // Ascending
  
  return { years, months };
}, [cardioSessions, selectedYear]);

  // --- CARDIO TYPE MAPPING ---
  const cardioTypes = useMemo(() => ({
    running: { 
      icon: FaRunning, 
      color: '#F43F5E',
      label: langIndex === 0 ? 'Бег' : 'Running',
      gradient: 'linear-gradient(90deg, #F43F5E, #FB7185)'
    },
    cycling: { 
      icon: FaBicycle, 
      color: '#4b943d',
      label: langIndex === 0 ? 'Велосипед' : 'Cycling',
      gradient: 'linear-gradient(90deg, #65cd4e, #1a9320)'
    },
    swimming: { 
      icon: FaSwimmer, 
      color: '#3a8a9c',
      label: langIndex === 0 ? 'Плавание' : 'Swimming',
      gradient: 'linear-gradient(90deg, #45b7d1, #1e88e5)'
    }
  }), [langIndex]);
 // --- FILTER DROPDOWNS ---
const FilterDropdowns = ({expanded,setExpanded}) => {
  const { years, months } = availableYearsMonths;
  
  const monthNames = [
    langIndex === 0 ? 'Январь' : 'January',
    langIndex === 0 ? 'Февраль' : 'February',
    langIndex === 0 ? 'Март' : 'March',
    langIndex === 0 ? 'Апрель' : 'April',
    langIndex === 0 ? 'Май' : 'May',
    langIndex === 0 ? 'Июнь' : 'June',
    langIndex === 0 ? 'Июль' : 'July',
    langIndex === 0 ? 'Август' : 'August',
    langIndex === 0 ? 'Сентябрь' : 'September',
    langIndex === 0 ? 'Октябрь' : 'October',
    langIndex === 0 ? 'Ноябрь' : 'November',
    langIndex === 0 ? 'Декабрь' : 'December'
  ];
  
  const hasFilters = selectedYear || selectedMonth !== null;
  
  return (
    <div style={styles(theme).filterContainer}>
      <div style={styles(theme).filterHeader}>
        <div style={styles(theme).filterTitle} onClick={() => setExpanded(prev => !prev)}>
          <FaCalendarAlt size={15} style={{ marginRight: '6px' }} />
          {langIndex === 0 ? 'Фильтр по дате' : 'Date Filter'}
          {expanded ? <FaChevronUp size={12} style={{ marginLeft: '16px' }} /> : <FaChevronDown size={12} style={{ marginLeft: '16px' }} />}
        </div>
        {hasFilters && expanded && (
          <Motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedYear(null);
              setSelectedMonth(null);
            }}
            style={styles(theme).clearFilterButton}
          >
            {langIndex === 0 ? 'Сбросить' : 'Clear'}
          </Motion.button>
        )}
      </div>
      
      {expanded && <div style={styles(theme).filterDropdowns}>
        {/* Year Dropdown */}
        <div style={styles(theme).filterDropdownWrapper}>
          <div style={styles(theme).filterLabel}>
            {langIndex === 0 ? 'Год' : 'Year'}
          </div>
          <Motion.div
            style={styles(theme).dropdownContainer}
          >
            <select
              value={selectedYear || ''}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedYear(value || null);
                // Reset month when year changes
                if (value && selectedMonth !== null) {
                  setSelectedMonth(null);
                }
              }}
              style={styles(theme).dropdownSelect}
            >
              <option value="">{langIndex === 0 ? 'Все годы' : 'All Years'}</option>
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <FaChevronDown 
              size={12} 
              color={Colors.get('subText', theme)}
              style={styles(theme).dropdownIcon}
            />
          </Motion.div>
        </div>
        
        {/* Month Dropdown - Only show if year is selected */}
        {selectedYear && (
          <div style={styles(theme).filterDropdownWrapper}>
            <div style={styles(theme).filterLabel}>
              {langIndex === 0 ? 'Месяц' : 'Month'}
            </div>
            <Motion.div
              style={styles(theme).dropdownContainer}
            >
              <select
                value={selectedMonth !== null ? selectedMonth : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedMonth(value === '' ? null : parseInt(value));
                }}
                style={styles(theme).dropdownSelect}
              >
                <option value="">{langIndex === 0 ? 'Все месяцы' : 'All Months'}</option>
                {months.map(month => (
                  <option key={month} value={month}>
                    {monthNames[month]}
                  </option>
                ))}
              </select>
              <FaChevronDown 
                size={12} 
                color={Colors.get('subText', theme)}
                style={styles(theme).dropdownIcon}
              />
            </Motion.div>
          </div>
        )}
      </div>}
      
      {hasFilters && expanded && (
        <div style={styles(theme).activeFiltersBadge}>
          {langIndex === 0 ? 'Активные фильтры' : 'Active Filters'}: 
          {selectedYear && ` ${selectedYear}`}
          {selectedMonth !== null && ` - ${monthNames[selectedMonth]}`}
        </div>
      )}
    </div>
  );
};
  

  // Filter sessions by active tab
  // Filter sessions by active tab AND year/month
const filteredSessions = useMemo(() => {
  return cardioSessions?.filter(session => {
    // Filter by type
    if (session.type !== tab) return false;
    
    // Filter by year
    if (selectedYear) {
      const sessionYear = new Date(session.date).getFullYear();
      if (sessionYear !== parseInt(selectedYear)) return false;
    }
    
    // Filter by month
    if (selectedMonth !== null && selectedMonth !== undefined) {
      const sessionMonth = new Date(session.date).getMonth();
      if (sessionMonth !== parseInt(selectedMonth)) return false;
    }
    
    return true;
  });
}, [cardioSessions, tab, selectedYear, selectedMonth]);

  // Process sessions with calculated metrics
  const processedSessions = useMemo(() => {
    if (isLoading) return [];
    
    return filteredSessions?.map(session => {
      const distanceKm = session.distance / 1000;
      const durationHours = session.duration / 3600;
      const durationMins = session.duration / 60;
      
      // Calculate speed (km/h) with safety check
      const speed = durationHours > 0 ? (distanceKm / durationHours) : 0;
      
      // Calculate pace (min/km) - handle edge cases
      let paceStr = '0:00';
      if (distanceKm > 0.1 && durationMins > 0) {
        const paceDecimal = durationMins / distanceKm;
        const paceMins = Math.floor(paceDecimal);
        const paceSecs = Math.round((paceDecimal - paceMins) * 60);
        paceStr = `${paceMins}:${paceSecs.toString().padStart(2, '0')}`;
      }
      
      return {
        ...session,
        distanceKm: distanceKm.toFixed(2),
        speed: speed.toFixed(1),
        pace: paceStr,
        durationFormatted: formatDuration(session.duration),
        dateFormatted: formatDate(session.date, langIndex),
        // Visual indicators - normalized by activity type
        intensity: Math.min(100, Math.max(20, 
          tab === 'running' ? speed * 15 : 
          tab === 'cycling' ? speed * 5 : 
          speed * 8
        ))
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first
  }, [filteredSessions, langIndex, tab, isLoading]);

  // Prepare chart data based on selected metric
  const chartData = useMemo(() => {
    if (isLoading || processedSessions?.length === 0) return [];
    
    const activityColor = cardioTypes[tab]?.color || '#4ECDC4';
    
    return processedSessions?.map(session => {
      let value, unit;
      
      switch(selectedMetric) {
        case 'speed':
          value = parseFloat(session.speed);
          unit = 'km/h';
          break;
        case 'pace':
          value = paceToDecimal(session.pace); // Use decimal for charting
          unit = langIndex === 0 ? 'мин/км' : 'min/km';
          break;
        case 'elevation':
          value = session.elevationGain || 0;
          unit = 'm';
          break;
        case 'heartRate':
          value = session.avgHeartRate || 0;
          unit = 'bpm';
          break;
        default: // distance
          value = parseFloat(session.distanceKm);
          unit = 'km';
      }
      
      return {
        date: new Date(session.date),
        value: value,
        originalValue: session.pace || value.toFixed(2),
        label: session.dateFormatted,
        intensity: session.intensity,
        unit,
        stroke: activityColor,
        elevationGain: session.elevationGain,
        avgHeartRate: session.avgHeartRate
      };
    });
  }, [processedSessions, selectedMetric, langIndex, tab, cardioTypes, isLoading]);

  // --- METRIC CARDS ---
  const MetricCard = ({ icon: Icon, label, value, subValue, color, isLoading = false }) => (
    <Motion.div 
      style={{
        ...styles(theme).metricCard,
        borderLeft: `3px solid ${color}`,
        backgroundColor: theme === 'light' 
          ? 'rgba(255, 255, 255, 0.6)' 
          : 'rgba(30, 30, 30, 0.6)',
        opacity: isLoading ? 0.7 : 1
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '10px',
          backgroundColor: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {React.createElement(Icon, { size: 16, color })}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '11px', 
            color: Colors.get('subText', theme),
            marginBottom: '2px'
          }}>
            {label}
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: Colors.get('mainText', theme),
            display: 'flex', alignItems: 'baseline', gap: '4px'
          }}>
            {isLoading ? (
              <div style={{ 
                height: '18px', 
                width: '50px', 
                backgroundColor: theme === 'light' ? '#f0f0f0' : '#444',
                borderRadius: '4px'
              }} />
            ) : (
              <>
                {value}
                {subValue && (
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: 'normal',
                    color: Colors.get('subText', theme)
                  }}>
                    {subValue}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Motion.div>
  );

  // --- SESSION CARD ---
  const SessionCard = ({ session }) => {
    const activity = cardioTypes[session.type] || cardioTypes.running;
    const isExpanded = expandedSession === session.id;
    
    const toggleExpand = () => {
      setExpandedSession(isExpanded ? null : session.id);
    };

    return (
      <Motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        style={{
          ...styles(theme).sessionCard,
          borderLeft: `3px solid ${activity.color}`,
          backgroundColor: isExpanded 
            ? (theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(40, 40, 40, 0.9)')
            : Colors.get('cardBackground', theme),
          cursor: 'pointer'
        }}
        onClick={toggleExpand}
      >
        {/* Compact View - Always Visible */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isExpanded ? '15px' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              backgroundColor: `${activity.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <activity.icon size={18} color={activity.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: Colors.get('mainText', theme),
                marginBottom: '2px'
              }}>
                {session.dateFormatted}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: Colors.get('subText', theme),
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaStopwatch size={10} />
                  {session.durationFormatted}
                </div>
                <div>•</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaTachometerAlt size={10} />
                  {session.speed} km/h
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: Colors.get('mainText', theme)
              }}>
                {session.distanceKm} <span style={{ fontSize: '12px' }}>km</span>
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: Colors.get('subText', theme),
                marginTop: '2px'
              }}>
                {session.pace} <span style={{ fontSize: '10px' }}>{langIndex === 0 ? 'мин/км' : 'min/km'}</span>
              </div>
            </div>
            <Motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaChevronDown size={16} color={Colors.get('subText', theme)} />
            </Motion.div>
          </div>
        </div>

        {/* Expanded View - Additional Info */}
        <AnimatePresence>
          {isExpanded && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ 
                borderTop: `1px solid ${Colors.get('border', theme)}`,
                paddingTop: '15px',
                marginTop: '10px'
              }}>
                {/* Additional Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '15px' }}>
                  {session.elevationGain > 0 && (
                    <div>
                      <div style={styles(theme).sessionLabelSmall}>
                        <FaMountain size={12} style={{ marginRight: '4px' }} />
                        {langIndex === 0 ? 'Набор высоты' : 'Elevation'}
                      </div>
                      <div style={styles(theme).sessionValueSmall}>
                        {session.elevationGain} <span style={{ fontSize: '12px' }}>m</span>
                      </div>
                    </div>
                  )}
                  {session.avgHeartRate > 0 && (
                    <div>
                      <div style={styles(theme).sessionLabelSmall}>
                        <FaHeartbeat size={12} style={{ marginRight: '4px' }} />
                        {langIndex === 0 ? 'Средний пульс' : 'Avg HR'}
                      </div>
                      <div style={styles(theme).sessionValueSmall}>
                        {session.avgHeartRate} <span style={{ fontSize: '12px' }}>bpm</span>
                      </div>
                    </div>
                  )}
                  {session.rpe > 0 && (
                    <div>
                      <div style={styles(theme).sessionLabelSmall}>
                        <FaShoePrints size={12} style={{ marginRight: '4px' }} />
                        {langIndex === 0 ? 'Уровень нагрузки' : 'RPE'}
                      </div>
                      <div style={styles(theme).sessionValueSmall}>
                        {session.rpe}/10
                      </div>
                    </div>
                  )}
                  {session.avgCadence > 0 && (
                    <div>
                      <div style={styles(theme).sessionLabelSmall}>
                        {langIndex === 0 ? 'Средний темп' : 'Avg Cadence'}
                      </div>
                      <div style={styles(theme).sessionValueSmall}>
                        {session.avgCadence} <span style={{ fontSize: '12px' }}>spm</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes Section */}
                {session.notes && (
                  <div style={{
                    marginTop: '10px',
                    padding: '12px',
                    backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    fontSize: '13px',
                    color: Colors.get('subText', theme),
                    fontStyle: 'italic',
                    lineHeight: 1.5
                  }}>
                    <div style={{ 
                      fontSize: '11px', 
                      fontWeight: 'bold', 
                      color: Colors.get('mainText', theme),
                      marginBottom: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <FaCalendarAlt size={12} />
                      {langIndex === 0 ? 'Заметки тренировки' : 'Training Notes'}
                    </div>
                    {session.notes}
                  </div>
                )}

                {/* Intensity visualizer */}
                <div style={{ marginTop: '15px' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: Colors.get('subText', theme),
                    marginBottom: '6px',
                    fontWeight: 500
                  }}>
                    {langIndex === 0 ? 'Интенсивность тренировки' : 'Training Intensity'}
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', overflow: 'hidden', backgroundColor: theme === 'light' ? '#eee' : '#333' }}>
                    <Motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${session.intensity}%` }}
                      transition={{ duration: 0.5 }}
                      style={{ 
                        height: '100%', 
                        backgroundColor: session.intensity > 80 ? '#FF6B6B' : 
                                       session.intensity > 60 ? '#FFA502' : '#4CAF50'
                      }}
                    />
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: Colors.get('subText', theme),
                    marginTop: '4px',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>{langIndex === 0 ? 'Легкая' : 'Easy'}</span>
                    <span>{langIndex === 0 ? 'Средняя' : 'Moderate'}</span>
                    <span>{langIndex === 0 ? 'Тяжелая' : 'Hard'}</span>
                  </div>
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </Motion.div>
    );
  };

  // --- METRIC SUMMARY CALCULATIONS ---
  const summaryMetrics = useMemo(() => {
    if (processedSessions?.length === 0) {
      return {
        totalSessions: 0,
        avgSpeed: '0.0',
        totalDistance: '0.0',
        bestPace: '0:00',
        avgHeartRate: '0',
        totalElevation: '0'
      };
    }
    
    // Calculate average speed
    const avgSpeed = (processedSessions.reduce((sum, s) => sum + parseFloat(s.speed), 0) / processedSessions.length).toFixed(1);
    
    // Calculate total distance
    const totalDistance = processedSessions.reduce((sum, s) => sum + parseFloat(s.distanceKm), 0).toFixed(1);
    
    // Calculate average heart rate (only if available)
    const heartRateSessions = processedSessions.filter(s => s.avgHeartRate > 0);
    const avgHeartRate = heartRateSessions.length > 0
      ? (heartRateSessions.reduce((sum, s) => sum + s.avgHeartRate, 0) / heartRateSessions.length).toFixed(0)
      : '—';
    
    // Calculate total elevation
    const totalElevation = processedSessions.reduce((sum, s) => sum + (s.elevationGain || 0), 0).toFixed(0);
    
    // Find best pace (lowest decimal value)
    const validPaceSessions = processedSessions.filter(s => {
      const paceVal = paceToDecimal(s.pace);
      return paceVal > 0 && paceVal < 30; // Reasonable pace filter
    });
    
    const bestPaceSession = validPaceSessions.reduce((best, current) => {
      const currentPace = paceToDecimal(current.pace);
      const bestPace = paceToDecimal(best.pace);
      return currentPace < bestPace ? current : best;
    }, validPaceSessions[0] || { pace: '0:00' });
    
    return {
      totalSessions: processedSessions.length,
      avgSpeed,
      totalDistance,
      bestPace: bestPaceSession?.pace || '0:00',
      avgHeartRate,
      totalElevation
    };
  }, [processedSessions]);

  // Get chart color based on active tab
  const chartColor = cardioTypes[tab]?.color || '#4ECDC4';

  return (
    <div style={styles(theme).container}>
      <div style={{ width: '100%', padding: '0 10px 10px', boxSizing: 'border-box' }}>
        {/* Activity Type Switcher */}
        <div style={styles(theme).typeSwitcher}>
          {Object.entries(cardioTypes).map(([key, activity]) => {
            const isActive = tab === key;
            return (
              <Motion.button
                key={key}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setTab(key);
                  setExpandedSession(null); // Collapse all when switching tabs
                }}
                style={{
                  ...styles(theme).typeButton,
                  background: isActive
                    ? `linear-gradient(135deg, ${activity.color}, ${activity.color}bb)`
                    : `${activity.color}12`,
                  color: isActive 
                    ? '#ffffff' 
                    : (theme === 'light' ? '#475569' : '#cbd5e1'),
                  border: `1px solid ${isActive ? `${activity.color}66` : getTrainingPanelBorder(theme, getTrainingAccent())}`,
                  boxShadow: isActive 
                    ? `0 10px 24px ${activity.color}33`
                    : 'none'
                }}
              >
                <activity.icon size={18} style={{ marginRight: '6px' }} />
                {activity.label}
                {isActive && (
                  <Motion.div
                    initial={{ opacity: 0, scaleX: 0.72 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.72 }}
                    transition={{ duration: 0.14, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      bottom: '-3px',
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'white',
                      borderRadius: '2px'
                    }}
                  />
                )}
              </Motion.button>
            );
          })}
        </div>
         <FilterDropdowns expanded={expandedFilter} setExpanded={setExpandedFilter}/>
        {/* Summary Metrics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          marginTop: '15px',
          marginBottom: '20px'
        }}>
          <MetricCard 
            icon={FaChartLine}
            label={langIndex === 0 ? 'Тренировок' : 'Sessions'}
            value={summaryMetrics.totalSessions}
            color="#4ECDC4"
            isLoading={isLoading}
          />
          <MetricCard 
            icon={FaTachometerAlt}
            label={langIndex === 0 ? 'Средняя скорость' : 'Avg Speed'}
            value={summaryMetrics.avgSpeed}
            subValue="km/h"
            color="#FF6B6B"
            isLoading={isLoading}
          />
          <MetricCard 
            icon={FaClock}
            label={langIndex === 0 ? 'Дистанция' : 'Distance'}
            value={summaryMetrics.totalDistance}
            subValue="km"
            color="#45B7D1"
            isLoading={isLoading}
          />
          <MetricCard 
            icon={FaRunning}
            label={langIndex === 0 ? 'Лучший темп' : 'Best Pace'}
            value={summaryMetrics.bestPace}
            color="#9C89B8"
            isLoading={isLoading}
          />
        </div>
        {/* Date Filters */}
       
        {/* Chart Section */}
        <div style={styles(theme).chartCard}>
          <div style={styles(theme).chartHeader}>
            <div>
              <div style={{...styles(theme).chartTitle, background: `linear-gradient(90deg, ${chartColor}, ${Colors.get('mainText', theme)})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                {langIndex === 0 ? 'Прогресс тренировок' : 'Training Progress'}
              </div>
              <div style={styles(theme).chartSubtitle}>
                {langIndex === 0 
                  ? `Анализ ${cardioTypes[tab]?.label.toLowerCase()}` 
                  : `Analysis of ${cardioTypes[tab]?.label.toLowerCase()} sessions`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['distance', 'speed', 'pace', 'elevation', 'heartRate'].map(metric => {
                const isActive = selectedMetric === metric;
                return (
                  <Motion.button
                    key={metric}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMetric(metric)}
                    style={{
                      ...styles(theme).metricButton,
                      backgroundColor: isActive ? `${chartColor}18` : 'transparent',
                      color: isActive 
                        ? chartColor
                        : Colors.get('subText', theme),
                      border: `1px solid ${isActive 
                        ? `${chartColor}66`
                        : Colors.get('border', theme)
                      }`,
                      padding: '6px 12px',
                      fontSize: '12px'
                    }}
                  >
                    {langIndex === 0 
                      ? ({
                          distance: 'Дистанция', 
                          speed: 'Скорость', 
                          pace: 'Темп', 
                          elevation: 'Высота', 
                          heartRate: 'Пульс'
                        })[metric]
                      : metric.replace('heartRate', 'Heart Rate').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    
                    {metric === 'pace' && (
                      <span style={{ 
                        marginLeft: '4px', 
                        fontSize: '9px',
                        backgroundColor: theme === 'light' ? '#fef3c7' : '#92400e',
                        color: theme === 'light' ? '#92400e' : '#fef3c7',
                        padding: '1px 3px',
                        borderRadius: '3px'
                      }}>
                        {langIndex === 0 ? '↓лучше' : '↓better'}
                      </span>
                    )}
                  </Motion.button>
                );
              })}
            </div>
          </div>
          
          <div style={{ height: '200px', marginTop: '15px', position: 'relative' }}>
            {isLoading ? (
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  border: `3px solid ${theme === 'light' ? '#e2e8f0' : '#334155'}`,
                  borderTopColor: theme === 'light' ? '#3b82f6' : '#60a5fa',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
            ) : processedSessions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 15, left: 10, bottom: 0 }}
                >
                 
                  <XAxis 
                    dataKey="label" 
                    stroke={Colors.get('subText', theme)}
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: Colors.get('border', theme) }}
                    padding={{ left: 15, right: 15 }}
                  />
                  <YAxis 
                    stroke={Colors.get('subText', theme)}
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: Colors.get('border', theme) }}
                    width={50}
                    label={{ 
                      value: selectedMetric === 'pace' 
                        ? (langIndex === 0 ? 'мин/км' : 'min/km') 
                        : chartData[0]?.unit || '',
                      angle: -90, 
                      position: 'insideLeft',
                      fill: Colors.get('subText', theme),
                      fontSize: 11,
                      dx: -8
                    }}
                  />
                  <Tooltip 
                    content={<CustomTooltip 
                      metric={selectedMetric} 
                      langIndex={langIndex} 
                      theme={theme} 
                    />} 
                    cursor={{ strokeDasharray: '3 3', stroke: chartColor, strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={chartColor}
                    strokeWidth={2}
                    fill={chartColor}
                    fillOpacity={0.2}
                    dot={{ 
                      fill: theme === 'light' ? '#ffffff' : '#1e293b',
                      stroke: chartColor,
                      strokeWidth: 2,
                      r: 3,
                      activeDot: { r: 5 }
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: Colors.get('subText', theme),
                fontSize: '15px',
                textAlign: 'center',
                padding: '20px'
              }}>
                <div>
                  <FaChartLine size={38} color={chartColor} style={{ marginBottom: '10px', opacity: 0.85 }} />
                  {langIndex === 0 
                    ? `Нет данных для ${cardioTypes[tab]?.label.toLowerCase()}` 
                    : `No ${cardioTypes[tab]?.label.toLowerCase()} sessions`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sessions List */}
        <div style={{ marginTop: '25px' }}>
          <div style={styles(theme).sectionHeader}>
            <div style={styles(theme).sectionTitle}>
              {langIndex === 0 ? 'История тренировок' : 'Training History'}
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: Colors.get('subText', theme),
              fontWeight: 500
            }}>
              {processedSessions.length} {langIndex === 0 ? 'тренировок' : 'sessions'}
            </div>
          </div>
          
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{
                  height: '80px',
                  backgroundColor: theme === 'light' ? '#f8fafc' : '#1e293b',
                  borderRadius: '16px',
                  border: `1px solid ${Colors.get('border', theme)}`,
                  padding: '15px'
                }} />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {processedSessions.length > 0 ? (
                processedSessions.map(session => (
                  <SessionCard key={session.id} session={session} />
                ))
              ) : (
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    textAlign: 'center',
                    padding: '30px 20px',
                    color: Colors.get('subText', theme),
                    fontSize: '15px',
                    border: `1px dashed ${Colors.get('border', theme)}`,
                    borderRadius: '14px',
                    marginTop: '10px',
                    background: theme === 'light' 
                      ? 'rgba(240, 249, 255, 0.3)' 
                      : 'rgba(30, 60, 100, 0.15)'
                  }}
                >
                  {React.createElement(cardioTypes[tab]?.icon || FaRunning, {
                    size: 40,
                    color: cardioTypes[tab]?.color,
                    style: { marginBottom: '12px', opacity: 0.85 }
                  })}
                  {langIndex === 0 
                    ? `Добавьте первую тренировку ${cardioTypes[tab]?.label.toLowerCase()}!` 
                    : `Record your first ${cardioTypes[tab]?.label.toLowerCase()} session!`}
                </Motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
      <div style={{marginBottom:'200px'}}></div>
    </div>
  );
};

// --- ENHANCED STYLES ---
const styles = (theme) => {
  const accent = getTrainingAccent();
  const isLight = theme === 'light' || theme === 'speciallight';

  return {
  container: {
    display: 'flex', 
    width: "100%", 
    maxWidth: '1000px',
    flexDirection: 'column',
    overflowY: 'auto', 
    overflowX: 'hidden', 
    justifyContent: "flex-start", 
    alignItems: 'center',
    background: getTrainingPageBackground(theme, accent),
    minHeight: "100dvh",
    height: "100dvh",
    padding: 'calc(env(safe-area-inset-top, 0px) + 24px) 10px 116px',
    boxSizing: 'border-box'
  },
  typeSwitcher: {
    display: 'flex',
    gap: '8px',
    marginBottom: '15px',
    padding: '4px',
    background: isLight ? 'rgba(255,255,255,0.56)' : 'rgba(255,255,255,0.055)',
    borderRadius: '14px',
    border: `1px solid ${getTrainingPanelBorder(theme, accent)}`
  },
  typeButton: {
    flex: 1,
    padding: '10px 12px',
    borderRadius: '12px',
    border: 'none',
    background: 'transparent',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  },
  chartCard: {
    background: getTrainingPanelBackground(theme, accent),
    borderRadius: '20px',
    width: '100%',
    boxShadow: getTrainingPanelShadow(theme, accent),
    border: `1px solid ${getTrainingPanelBorder(theme, accent)}`,
    overflow: 'hidden',
    backdropFilter: 'blur(10px)'
  },
  chartHeader: {
    padding: '16px 20px',
    borderBottom: `1px solid ${Colors.get('border', theme)}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px'
  },
  chartTitle: {
    fontSize: '18px', 
    fontWeight: '800', 
    background: `linear-gradient(90deg, ${accent.hue}, ${Colors.get('mainText', theme)})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '3px'
  },
  chartSubtitle: {
    fontSize: '13px',
    color: Colors.get('subText', theme),
    fontWeight: 500
  },
  metricButton: {
    borderRadius: '10px',
    background: 'transparent',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
    border: '1px solid'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '15px',
    paddingLeft: '5px'
  },
  sectionTitle: {
    fontSize: '20px', 
    fontWeight: '800', 
    color: Colors.get('mainText', theme),
    background: theme === 'light'
      ? 'linear-gradient(90deg, #0f172a, #1e293b)'
      : 'linear-gradient(90deg, #cbd5e1, #94a3b8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  metricCard: {
    borderRadius: '16px',
    padding: '14px',
    boxShadow: theme === 'light'
      ? '0 4px 12px rgba(0, 0, 0, 0.04)'
      : '0 6px 20px rgba(0, 0, 0, 0.2)',
    border: `1px solid ${Colors.get('border', theme)}`,
    transition: 'all 0.3s ease'
  },
  sessionCard: {
    backgroundColor: Colors.get('cardBackground', theme),
    borderRadius: '16px',
    padding: '14px',
    marginBottom: '10px',
    boxShadow: theme === 'light'
      ? '0 3px 12px rgba(0, 0, 0, 0.03)'
      : '0 5px 18px rgba(0, 0, 0, 0.2)',
    border: `1px solid ${Colors.get('border', theme)}`,
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(8px)'
  },
  sessionLabelSmall: {
    fontSize: '11px',
    color: Colors.get('subText', theme),
    marginBottom: '3px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  sessionValueSmall: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: Colors.get('mainText', theme)
  },
  filterContainer: {
  backgroundColor: Colors.get('cardBackground', theme),
  borderRadius: '16px',
  padding: '16px',
  marginBottom: '15px',
  border: `1px solid ${Colors.get('border', theme)}`,
  boxShadow: theme === 'light'
    ? '0 3px 10px rgba(0, 0, 0, 0.03)'
    : '0 4px 15px rgba(0, 0, 0, 0.2)'
},
filterHeader: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2px'
},
filterTitle: {
  fontSize: '15px',
  fontWeight: '700',
  color: Colors.get('mainText', theme),
  display: 'flex',
  alignItems: 'center'
},
clearFilterButton: {
  padding: '4px 10px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: '600',
  backgroundColor: theme === 'light' ? '#fee2e2' : '#451616',
  color: theme === 'light' ? '#ef4444' : '#fecaca',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
},
filterDropdowns: {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap'
},
filterDropdownWrapper: {
  flex: 1,
  minWidth: '150px'
},
filterLabel: {
  fontSize: '11px',
  color: Colors.get('subText', theme),
  marginBottom: '6px',
  fontWeight: '500'
},
dropdownContainer: {
  position: 'relative',
  backgroundColor: theme === 'light' ? '#ffffff' : '#1e293b',
  borderRadius: '10px',
  border: `1px solid ${Colors.get('border', theme)}`,
  cursor: 'pointer'
},
dropdownSelect: {
  width: '100%',
  padding: '10px 30px 10px 12px',
  fontSize: '14px',
  fontWeight: '500',
  color: Colors.get('mainText', theme),
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '10px',
  appearance: 'none',
  cursor: 'pointer',
  outline: 'none'
},
dropdownIcon: {
  position: 'absolute',
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)'
},
activeFiltersBadge: {
  marginTop: '12px',
  padding: '8px 12px',
  backgroundColor: theme === 'light' ? '#e3f2fd' : '#1e3a8a',
  color: theme === 'light' ? '#1e40af' : '#60a5fa',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: '600'
}
  };
};

// Add keyframes for loading spinner
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default TrainingAnaliticsCardio;
