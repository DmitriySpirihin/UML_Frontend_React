import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
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
  Tooltip, 
  Legend 
} from 'recharts';

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

// Convert decimal minutes to mm:ss string
const decimalToPace = (decimal) => {
  if (!decimal || decimal <= 0) return '0:00';
  const mins = Math.floor(decimal);
  const secs = Math.round((decimal - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
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
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [tab, setTab] = useState('running');
  const [selectedMetric, setSelectedMetric] = useState('distance');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState(null);

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

  // --- CARDIO TYPE MAPPING ---
  const cardioTypes = useMemo(() => ({
    running: { 
      icon: FaRunning, 
      color: '#a86030',
      label: langIndex === 0 ? 'Бег' : 'Running',
      gradient: 'linear-gradient(90deg, #ff9f6b, #ee5a24)'
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

  // --- DATA PROCESSING FROM NEW STRUCTURE ---
  const cardioSessions = useMemo(() => {
    const sessions = [];
    const typeMap = {
      'RUNNING': 'running',
      'CYCLING': 'cycling',
      'SWIMMING': 'swimming'
    };

    // Process training log data
    if (AppData.trainingLog && typeof AppData.trainingLog === 'object' ) {
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
    return sessions.length > 0 ? sessions : [
      { id: '1', type: 'running', distance: 5200, duration: 1800, date: '2026-01-15', elevationGain: 42, avgHeartRate: 142, rpe: 7, notes: "Холмистый парк, последние 2км тяжело" },
      { id: '2', type: 'cycling', distance: 12500, duration: 2400, date: '2026-01-18', elevationGain: 120, avgHeartRate: 135, rpe: 6, notes: "Длинная поездка по шоссе" },
      { id: '3', type: 'running', distance: 3800, duration: 1320, date: '2026-01-22', elevationGain: 28, avgHeartRate: 148, rpe: 8, notes: "Интервальная тренировка" },
      { id: '4', type: 'swimming', distance: 1200, duration: 1500, date: '2026-01-25', elevationGain: 0, avgHeartRate: 128, rpe: 5, notes: "Спокойное плавание" },
      { id: '5', type: 'running', distance: 8500, duration: 2700, date: '2026-01-28', elevationGain: 65, avgHeartRate: 152, rpe: 9, notes: "Длительный бег в парке" },
      { id: '6', type: 'cycling', distance: 18200, duration: 3600, date: '2026-02-01', elevationGain: 210, avgHeartRate: 140, rpe: 7, notes: "Горный маршрут" },
    ];
  }, []);

  // Filter sessions by active tab
  const filteredSessions = useMemo(() => 
    cardioSessions.filter(session => session.type === tab),
  [cardioSessions, tab]);

  // Process sessions with calculated metrics
  const processedSessions = useMemo(() => {
    if (isLoading) return [];
    
    return filteredSessions.map(session => {
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
    if (isLoading || processedSessions.length === 0) return [];
    
    const activityColor = cardioTypes[tab]?.color || '#4ECDC4';
    
    return processedSessions.map(session => {
      let value, label, unit;
      
      switch(selectedMetric) {
        case 'speed':
          value = parseFloat(session.speed);
          label = langIndex === 0 ? 'Скорость' : 'Speed';
          unit = 'km/h';
          break;
        case 'pace':
          value = paceToDecimal(session.pace); // Use decimal for charting
          label = langIndex === 0 ? 'Темп' : 'Pace';
          unit = langIndex === 0 ? 'мин/км' : 'min/km';
          break;
        case 'elevation':
          value = session.elevationGain || 0;
          label = langIndex === 0 ? 'Набор высоты' : 'Elevation Gain';
          unit = 'm';
          break;
        case 'heartRate':
          value = session.avgHeartRate || 0;
          label = langIndex === 0 ? 'Средний пульс' : 'Avg Heart Rate';
          unit = 'bpm';
          break;
        default: // distance
          value = parseFloat(session.distanceKm);
          label = langIndex === 0 ? 'Дистанция' : 'Distance';
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
    <motion.div 
      whileHover={{ y: -3 }}
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
          <Icon size={16} color={color} />
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
    </motion.div>
  );

  // --- SESSION CARD ---
  const SessionCard = ({ session }) => {
    const activity = cardioTypes[session.type] || cardioTypes.running;
    const isExpanded = expandedSession === session.id;
    
    const toggleExpand = () => {
      setExpandedSession(isExpanded ? null : session.id);
    };

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
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
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaChevronDown size={16} color={Colors.get('subText', theme)} />
            </motion.div>
          </div>
        </div>

        {/* Expanded View - Additional Info */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
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
                    <motion.div 
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // --- METRIC SUMMARY CALCULATIONS ---
  const summaryMetrics = useMemo(() => {
    if (processedSessions.length === 0) {
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
              <motion.button
                key={key}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setTab(key);
                  setExpandedSession(null); // Collapse all when switching tabs
                }}
                style={{
                  ...styles(theme).typeButton,
                  backgroundColor: isActive 
                    ? activity.color
                    : (theme === 'light' ? '#033668a3' : 'rgba(57, 182, 255, 0.08)'),
                  color: isActive 
                    ? '#ffffff' 
                    : (theme === 'light' ? '#475569' : '#cbd5e1'),
                  border: isActive 
                    ? 'none' 
                    : `1px solid ${Colors.get('border', theme)}`,
                  boxShadow: isActive 
                    ? '0 4px 12px rgba(0,0,0,0.15)' 
                    : 'none'
                }}
              >
                <activity.icon size={18} style={{ marginRight: '6px' }} />
                {activity.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTypeIndicator"
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
              </motion.button>
            );
          })}
        </div>

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
          <MetricCard 
            icon={FaMountain}
            label={langIndex === 0 ? 'Набор высоты' : 'Elevation'}
            value={summaryMetrics.totalElevation}
            subValue="m"
            color="#FFA502"
            isLoading={isLoading}
          />
          <MetricCard 
            icon={FaHeartbeat}
            label={langIndex === 0 ? 'Средний пульс' : 'Avg HR'}
            value={summaryMetrics.avgHeartRate}
            subValue="bpm"
            color="#EF5350"
            isLoading={isLoading}
          />
        </div>

        {/* Chart Section */}
        <div style={styles(theme).chartCard}>
          <div style={styles(theme).chartHeader}>
            <div>
              <div style={styles(theme).chartTitle}>
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
                  <motion.button
                    key={metric}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMetric(metric)}
                    style={{
                      ...styles(theme).metricButton,
                      backgroundColor: isActive 
                        ? (theme === 'light' ? '#e3f2fd' : '#1e3a8a')
                        : 'transparent',
                      color: isActive 
                        ? (theme === 'light' ? '#1e40af' : '#60a5fa')
                        : Colors.get('subText', theme),
                      border: `1px solid ${isActive 
                        ? (theme === 'light' ? '#1e40af' : '#3b82f6') 
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
                  </motion.button>
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
                  <div style={{ fontSize: '42px', marginBottom: '8px' }}>📊</div>
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
                <motion.div
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
                  <div style={{ fontSize: '42px', marginBottom: '10px' }}>✨</div>
                  {langIndex === 0 
                    ? `Добавьте первую тренировку ${cardioTypes[tab]?.label.toLowerCase()}!` 
                    : `Record your first ${cardioTypes[tab]?.label.toLowerCase()} session!`}
                </motion.div>
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
const styles = (theme) => ({
  container: {
    display: 'flex', 
    width: "100%", 
    maxWidth: '1000px',
    flexDirection: 'column',
    overflowY: 'auto', 
    overflowX: 'hidden', 
    justifyContent: "flex-start", 
    alignItems: 'center',
    backgroundColor: Colors.get('background', theme), 
    height: "90vh",
    marginTop: '120px',
    paddingTop: '10px',
    paddingBottom: '30px',
    boxSizing: 'border-box'
  },
  typeSwitcher: {
    display: 'flex',
    gap: '8px',
    marginBottom: '15px',
    padding: '4px',
    backgroundColor: theme === 'light' ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    border: `1px solid ${Colors.get('border', theme)}`
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
    backgroundColor: Colors.get('cardBackground', theme),
    borderRadius: '20px',
    width: '100%',
    boxShadow: theme === 'light' 
      ? '0 6px 25px rgba(0, 0, 0, 0.05)'
      : '0 8px 35px rgba(0, 0, 0, 0.3)',
    border: `1px solid ${Colors.get('border', theme)}`,
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
    background: theme === 'light'
      ? 'linear-gradient(90deg, #1e40af, #0c4a6e)'
      : 'linear-gradient(90deg, #60a5fa, #3b82f6)',
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
  }
});

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