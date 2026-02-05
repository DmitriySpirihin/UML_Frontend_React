import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Compact Glassmorphism Tooltip
const CustomTooltip = ({ active, payload, label, backgroundColor, textColor, fillColor, metricType }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    let formattedValue = value.toFixed(1);
    let unit = '';
    
    switch(metricType) {
      case 'distance':
        unit = 'km';
        formattedValue = value.toFixed(2);
        break;
      case 'speed':
        unit = 'km/h';
        formattedValue = value.toFixed(1);
        break;
      case 'heartRate':
        unit = 'BPM';
        formattedValue = Math.round(value);
        break;
      case 'cadence':
        unit = 'RPM';
        formattedValue = Math.round(value);
        break;
      case 'elevation':
        unit = 'm';
        formattedValue = Math.round(value);
        break;
      case 'rpe':
        unit = '';
        formattedValue = value.toFixed(1);
        break;
      case 'duration':
        unit = 'min';
        formattedValue = (value / 60000).toFixed(0); // Convert ms to minutes
        break;
      default:
        break;
    }

    return (
      <div style={{
        backgroundColor: backgroundColor,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: `1px solid ${fillColor}30`,
        borderRadius: '10px',
        padding: '6px 10px',
        boxShadow: `0 4px 15px ${fillColor}20`,
        textAlign: 'center',
        fontSize: '12px',
        minWidth: '80px'
      }}>
        <p style={{ 
          margin: 0, 
          fontSize: '10px', 
          color: textColor, 
          opacity: 0.7, 
          marginBottom: '2px',
          fontWeight: '500'
        }}>
          {label}
        </p>
        <p style={{ 
          margin: 0, 
          fontSize: '14px', 
          fontWeight: '700', 
          color: fillColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px'
        }}>
          {formattedValue}
          {unit && <span style={{ fontSize: '10px', opacity: 0.7, marginLeft: '2px' }}>{unit}</span>}
        </p>
      </div>
    );
  }
  return null;
};

// Format date for compact display
const formatDate = (timestamp, compact = false) => {
  const date = new Date(timestamp);
  if (compact) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric' 
  });
};

// Calculate speed from distance (km) and duration (ms)
const calculateSpeed = (distance, duration) => {
  if (!distance || !duration) return 0;
  const hours = duration / (1000 * 60 * 60);
  return distance / hours;
};

// Get metric configuration
const getMetricConfig = (metricType, theme = 'dark') => {
  const isLight = theme === 'light';
  
  const configs = {
    distance: {
      dataKey: 'distance',
      label: 'Distance',
      unit: 'km',
      color: isLight ? '#3B82F6' : '#60A5FA',
      stroke: isLight ? '#2563EB' : '#3B82F6',
      format: (value) => `${value.toFixed(2)} km`
    },
    speed: {
      dataKey: 'speed',
      label: 'Speed',
      unit: 'km/h',
      color: isLight ? '#10B981' : '#34D399',
      stroke: isLight ? '#059669' : '#10B981',
      format: (value) => `${value.toFixed(1)} km/h`
    },
    heartRate: {
      dataKey: 'avgHeartRate',
      label: 'Heart Rate',
      unit: 'BPM',
      color: isLight ? '#EF4444' : '#F87171',
      stroke: isLight ? '#DC2626' : '#EF4444',
      format: (value) => `${Math.round(value)} BPM`
    },
    cadence: {
      dataKey: 'avgCadence',
      label: 'Cadence',
      unit: 'RPM',
      color: isLight ? '#8B5CF6' : '#A78BFA',
      stroke: isLight ? '#7C3AED' : '#8B5CF6',
      format: (value) => `${Math.round(value)} RPM`
    },
    elevation: {
      dataKey: 'elevationGain',
      label: 'Elevation',
      unit: 'm',
      color: isLight ? '#F59E0B' : '#FBBF24',
      stroke: isLight ? '#D97706' : '#F59E0B',
      format: (value) => `${Math.round(value)} m`
    },
    rpe: {
      dataKey: 'rpe',
      label: 'RPE',
      unit: '',
      color: isLight ? '#EC4899' : '#F472B6',
      stroke: isLight ? '#DB2777' : '#EC4899',
      format: (value) => `RPE ${value.toFixed(1)}`
    },
    duration: {
      dataKey: 'duration',
      label: 'Duration',
      unit: 'min',
      color: isLight ? '#6366F1' : '#818CF8',
      stroke: isLight ? '#4F46E5' : '#6366F1',
      format: (value) => `${Math.round(value / 60000)} min`
    }
  };

  return configs[metricType] || configs.distance;
};

export function CardioAreaChart({ 
  data, 
  metricType = 'distance', 
  theme = 'dark', 
  compact = true,
  height = 120,
  showXAxis = true,
  showYAxis = true,
  animation = true
}) {
  if (!data?.length) {
    return (
      <div style={{
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme === 'light' ? '#94a3b8' : '#64748b',
        fontSize: '12px'
      }}>
        No data available
      </div>
    );
  }

  // Get metric configuration
  const config = getMetricConfig(metricType, theme);
  const isLight = theme === 'light';
  
  // Prepare chart data with derived metrics
  const chartData = data.map(entry => {
    const baseData = {
      date: formatDate(entry.startTime, compact),
      timestamp: entry.startTime,
      ...entry
    };
    
    // Add calculated speed if needed
    if (metricType === 'speed') {
      baseData.speed = calculateSpeed(entry.distance, entry.duration);
    }
    
    return baseData;
  });

  // Calculate Y-axis domain with padding
  const values = chartData.map(d => d[config.dataKey] || 0);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const padding = maxValue * 0.1;
  
  // Determine axis visibility based on compact mode
  const xAxisHeight = compact ? 25 : 40;
  const yAxisWidth = compact ? 35 : 50;

  return (
    <ResponsiveContainer width="100%" height={height} className="cardio-chart">
      <AreaChart 
        data={chartData} 
        margin={{ 
          top: compact ? 10 : 20, 
          right: compact ? 5 : 15, 
          bottom: compact ? 5 : 15, 
          left: compact ? 5 : 15 
        }}
      >
        <defs>
          {/* Gradient Fill */}
          <linearGradient id={`gradient-${metricType}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={config.color} stopOpacity={0.7} />
            <stop offset="95%" stopColor={config.color} stopOpacity={0.05} />
          </linearGradient>
          
          {/* Subtle glow effect */}
          <filter id={`glow-${metricType}`} height="150%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feOffset in="blur" dx="0" dy="2" result="offsetBlur" />
            <feFlood floodColor={config.color} floodOpacity="0.2" result="offsetColor" />
            <feComposite in="offsetColor" in2="offsetBlur" operator="in" result="offsetBlur" />
            <feMerge>
              <feMergeNode in="offsetBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={isLight ? '#e2e8f0' : '#334155'}
          vertical={false} 
          strokeOpacity={0.2} 
        />
        
        {showXAxis && (
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={{ stroke: isLight ? '#cbd5e1' : '#475569', strokeWidth: 0.5 }}
            tick={{ 
              fontSize: compact ? 9 : 11, 
              fill: isLight ? '#64748b' : '#94a3b8', 
              opacity: 0.8 
            }}
            dy={compact ? 5 : 10}
            height={xAxisHeight}
            interval={compact ? 'equidistantPreserveStart' : 0}
            minTickGap={20}
          />
        )}
        
        {showYAxis && (
          <YAxis
            tickLine={false}
            axisLine={{ stroke: isLight ? '#cbd5e1' : '#475569', strokeWidth: 0.5 }}
            tick={{ 
              fontSize: compact ? 9 : 11, 
              fill: isLight ? '#64748b' : '#94a3b8', 
              opacity: 0.8 
            }}
            width={yAxisWidth}
            domain={[Math.max(0, minValue - padding), maxValue + padding]}
            dx={compact ? -5 : -10}
            tickFormatter={(value) => {
              if (metricType === 'duration') {
                return `${Math.round(value / 60000)}`;
              }
              if (metricType === 'rpe') {
                return value.toFixed(0);
              }
              return value.toFixed(maxValue > 10 ? 0 : 1);
            }}
          />
        )}
        
        <Tooltip
          content={
            <CustomTooltip 
              backgroundColor={isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 30, 30, 0.95)'}
              textColor={isLight ? '#1e293b' : '#f8fafc'}
              fillColor={config.color}
              metricType={metricType}
            />
          }
          cursor={{ 
            stroke: isLight ? '#94a3b8' : '#64748b', 
            strokeWidth: 1, 
            strokeDasharray: "3 3",
            opacity: 0.3
          }}
          wrapperStyle={{ outline: 'none' }}
        />

        <Area
          type="monotone"
          dataKey={config.dataKey}
          stroke={config.stroke}
          strokeWidth={compact ? 2 : 3}
          fill={`url(#gradient-${metricType})`}
          filter={`url(#glow-${metricType})`}
          dot={false}
          activeDot={{ 
            r: compact ? 4 : 6, 
            fill: isLight ? '#ffffff' : '#1e1e1e', 
            stroke: config.stroke, 
            strokeWidth: 2
          }}
          animationBegin={animation ? 0 : 0}
          animationDuration={animation ? 800 : 0}
          animationEasing="ease-out"
          isAnimationActive={animation}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Compact Metric Card Component
export function CardioMetricCard({ 
  data, 
  metricType, 
  title, 
  theme = 'dark', 
  compact = true,
  onClick 
}) {
  const config = getMetricConfig(metricType, theme);
  const isLight = theme === 'light';
  
  // Get latest value and calculate trend
  const values = data.map(d => d[config.dataKey] || 0);
  const latestValue = values[values.length - 1] || 0;
  const avgValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  
  // Calculate trend (compare last 3 vs previous 3)
  let trend = 0;
  if (values.length >= 6) {
    const recentAvg = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const previousAvg = values.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    trend = ((recentAvg - previousAvg) / previousAvg) * 100;
  }

  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: isLight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(30, 30, 30, 0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: compact ? '12px' : '16px',
        border: `1px solid ${isLight ? '#e2e8f0' : '#334155'}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        boxShadow: isLight 
          ? '0 2px 8px rgba(0,0,0,0.05)'
          : '0 2px 12px rgba(0,0,0,0.2)'
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: compact ? '8px' : '12px'
      }}>
        <span style={{ 
          fontSize: compact ? '11px' : '13px', 
          fontWeight: '600', 
          color: isLight ? '#64748b' : '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {title || config.label}
        </span>
        
        {trend !== 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '10px',
            color: trend > 0 ? '#10B981' : '#EF4444',
            fontWeight: '600'
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d={trend > 0 ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
            {Math.abs(trend).toFixed(0)}%
          </div>
        )}
      </div>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'baseline', 
        marginBottom: compact ? '8px' : '12px'
      }}>
        <span style={{ 
          fontSize: compact ? '20px' : '24px', 
          fontWeight: '800', 
          color: isLight ? '#1e293b' : '#f8fafc',
          lineHeight: 1
        }}>
          {metricType === 'duration' 
            ? `${Math.round(latestValue / 60000)}` 
            : metricType === 'rpe'
              ? latestValue.toFixed(1)
              : latestValue.toFixed(maxValue > 10 ? 0 : 1)}
        </span>
        <span style={{ 
          fontSize: compact ? '10px' : '12px', 
          color: isLight ? '#64748b' : '#94a3b8',
          marginLeft: '4px'
        }}>
          {metricType === 'duration' ? 'min' : 
           metricType === 'heartRate' ? 'BPM' : 
           metricType === 'cadence' ? 'RPM' : 
           metricType === 'elevation' ? 'm' : 
           metricType === 'rpe' ? '' : 'km'}
        </span>
      </div>
      
      <div style={{
        fontSize: compact ? '9px' : '11px',
        color: isLight ? '#94a3b8' : '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <span>Avg:</span>
        <span style={{ fontWeight: '600' }}>
          {metricType === 'duration' 
            ? `${Math.round(avgValue / 60000)} min` 
            : metricType === 'rpe'
              ? avgValue.toFixed(1)
              : avgValue.toFixed(maxValue > 10 ? 0 : 1)}
        </span>
        {metricType !== 'duration' && metricType !== 'rpe' && metricType !== 'heartRate' && metricType !== 'cadence' && (
          <span style={{ opacity: 0.7 }}>{metricType === 'elevation' ? 'm' : 'km'}</span>
        )}
      </div>
      
      <div style={{ marginTop: compact ? '8px' : '12px', height: compact ? 80 : 100 }}>
        <CardioAreaChart
          data={data}
          metricType={metricType}
          theme={theme}
          compact={compact}
          height={compact ? 80 : 100}
          showXAxis={false}
          showYAxis={false}
          animation={false}
        />
      </div>
    </div>
  );
}

export default CardioAreaChart;