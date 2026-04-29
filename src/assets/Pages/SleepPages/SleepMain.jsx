import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaBed,
  FaMoon,
  FaPalette,
  FaRegClock,
  FaStar,
  FaStickyNote,
  FaTimes
} from 'react-icons/fa';
import { AppData, logSectionVisit } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { lang$, selectedSleepDate$, theme$ } from '../../StaticClasses/HabitsBus';
import { saveData } from '../../StaticClasses/SaveHelper';
import { playEffects } from '../../StaticClasses/Effects.js';
import { syncAutoSleepIntegrations } from '../../StaticClasses/SleepIntegrationService.js';
import { buildSleepAccent, SLEEP_ACCENT_PRESETS } from './SleepVisuals.js';

const clickSound = new Audio('Audio/Click.wav');
const MS_PER_HOUR = 60 * 60 * 1000;

const getMondayIndex = (d) => (d.getDay() + 6) % 7;

const formatDateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatMsToHhMm = (ms) => {
  if (typeof ms !== 'number' || ms < 0) return '--:--';
  const totalMinutes = Math.floor(ms / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const formatDuration = (ms, langIndex) => {
  if (!ms) return langIndex === 0 ? '0 ч' : '0h';
  const totalMinutes = Math.floor(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return langIndex === 0 ? `${h} ч ${m} м` : `${h}h ${m}m`;
};

const moodColors = (theme, index) => {
  const cols = [
    Colors.get('veryBad', theme),
    Colors.get('bad', theme),
    Colors.get('normal', theme),
    Colors.get('good', theme),
    Colors.get('perfect', theme)
  ];
  return cols[index] || Colors.get('accent', theme);
};

const getFillPercentFromMs = (durationMs) => {
  if (typeof durationMs !== 'number' || durationMs < 0) return 0;
  const minMs = 4 * MS_PER_HOUR;
  const maxMs = 10 * MS_PER_HOUR;
  if (durationMs <= minMs) return 15;
  if (durationMs >= maxMs) return 100;
  return 15 + Math.round(((durationMs - minMs) / (maxMs - minMs)) * 85);
};

const daysOfWeek = [
  ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
];

const fullNames = [
  ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
];

const SleepMain = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [date, setDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSleepEntry, setSelectedSleepEntry] = useState(null);
  const [accentColor, setAccentColor] = useState(AppData.sleepAccentColor || '#6F8BD6');
  const [showSettings, setShowSettings] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const accent = useMemo(() => buildSleepAccent(accentColor), [accentColor]);
  const s = styles(theme, accent);

  useEffect(() => {
    const sub1 = theme$.subscribe(setThemeState);
    const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
    };
  }, []);

  useEffect(() => { logSectionVisit('sleep'); }, []);

  useEffect(() => {
    let cancelled = false;
    syncAutoSleepIntegrations().then(results => {
      if (cancelled || results.length === 0) return;
      const imported = results.reduce((sum, item) => sum + (item.imported || 0), 0);
      if (imported > 0) {
        setSyncMessage(langIndex === 0 ? `Автоимпорт: ${imported}` : `Auto import: ${imported}`);
        const key = formatDateKey(currentDate);
        setSelectedSleepEntry(AppData.sleepingLog?.[key] || null);
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const key = formatDateKey(currentDate);
    selectedSleepDate$.next(key);
    setSelectedSleepEntry(AppData.sleepingLog?.[key] || null);
  }, [currentDate]);

  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = (monthStart.getDay() + 6) % 7;
  const calendarCells = [...Array(firstDayOfWeek).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const sleepData = useMemo(() => Object.entries(AppData.sleepingLog || {})
    .map(([key, entry]) => ({ key, ...entry }))
    .sort((a, b) => b.key.localeCompare(a.key)), [selectedSleepEntry, syncMessage]);

  const sevenDays = useMemo(() => {
    const limit = new Date();
    limit.setDate(limit.getDate() - 7);
    return sleepData.filter(item => new Date(item.key) >= limit);
  }, [sleepData]);

  const summary = useMemo(() => {
    const source = sevenDays.length ? sevenDays : sleepData.slice(0, 7);
    const avg = source.length ? source.reduce((sum, item) => sum + (item.duration || 0), 0) / source.length : 0;
    const best = source.length ? Math.max(...source.map(item => item.duration || 0)) : 0;
    const mood = source.length ? source.reduce((sum, item) => sum + (item.mood || 0), 0) / source.length : 0;
    return { avg, best, mood, count: source.length };
  }, [sevenDays, sleepData]);

  const prevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1));
    playEffects(clickSound);
  };

  const nextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1));
    playEffects(clickSound);
  };

  const changeAccentColor = async (color) => {
    const next = buildSleepAccent(color).hue;
    AppData.sleepAccentColor = next;
    setAccentColor(next);
    await saveData();
  };

  return (
    <div style={s.container}>
      <AccentSettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        theme={theme}
        langIndex={langIndex}
        accent={accent}
        accentColor={accentColor}
        onAccentChange={changeAccentColor}
      />

      <div style={s.scroll}>
        <div style={s.topBar}>
          <div style={s.topSpacer} />
          <div style={s.brandBlock}>
            <div style={s.brand}>UltyMyLife</div>
          </div>
          <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={() => setShowSettings(true)} style={s.accentButton}>
            <span>{langIndex === 0 ? 'Акцент' : 'Accent'}</span>
            <span style={s.colorDotInline} />
          </motion.button>
        </div>
        {syncMessage && <div style={s.syncPill}>{syncMessage}</div>}

        <div style={s.summaryGrid}>
          <SummaryTile icon={<FaRegClock />} label={langIndex === 0 ? 'Среднее' : 'Average'} value={formatDuration(summary.avg, langIndex)} theme={theme} accent={accent} />
          <SummaryTile icon={<FaBed />} label={langIndex === 0 ? 'Лучшее' : 'Best'} value={formatDuration(summary.best, langIndex)} theme={theme} accent={accent} />
          <SummaryTile icon={<FaStar />} label={langIndex === 0 ? 'Оценка' : 'Mood'} value={summary.mood ? summary.mood.toFixed(1) : '-'} theme={theme} accent={accent} />
        </div>

        <section style={s.panel}>
          <div style={s.monthHeader}>
            <motion.button type="button" aria-label={langIndex === 0 ? 'Предыдущий месяц' : 'Previous month'} whileTap={{ scale: 0.9 }} onClick={prevMonth} style={s.monthButton}>
              ‹
            </motion.button>
            <div style={s.monthTitle}>
              {date.toLocaleString(langIndex === 0 ? 'ru' : 'en', { month: 'long' })}
              <span style={s.yearText}>{date.getFullYear()}</span>
            </div>
            <motion.button type="button" aria-label={langIndex === 0 ? 'Следующий месяц' : 'Next month'} whileTap={{ scale: 0.9 }} onClick={nextMonth} style={s.monthButton}>
              ›
            </motion.button>
          </div>

          <div style={s.weekRow}>
            {daysOfWeek[langIndex].map((day, i) => (
              <div key={day} style={{ ...s.weekDay, color: i > 4 ? Colors.get('skipped', theme) : Colors.get('subText', theme) }}>
                {day}
              </div>
            ))}
          </div>

          <div style={s.daysGrid}>
            {calendarCells.map((day, index) => {
              if (day === null) return <div key={`empty-${index}`} />;
              const cellDate = new Date(date.getFullYear(), date.getMonth(), day);
              const dayKey = formatDateKey(cellDate);
              const entry = AppData.sleepingLog?.[dayKey];
              const isSelected = dayKey === formatDateKey(currentDate);
              const isToday = dayKey === formatDateKey(new Date());
              const moodColor = entry ? moodColors(theme, entry.mood - 1) : accent.hue;
              const fillHeight = entry ? getFillPercentFromMs(entry.duration) : 0;

              return (
                <motion.button
                  key={dayKey}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCurrentDate(cellDate);
                    playEffects(clickSound);
                  }}
                  style={s.dayCell(isSelected, isToday)}
                >
                  {entry && <motion.span initial={{ height: 0 }} animate={{ height: `${fillHeight}%` }} style={{ ...s.dayFill, background: moodColor }} />}
                  <span style={s.dayNumber}>{day}</span>
                  {isSelected && <span style={s.selectedDot} />}
                </motion.button>
              );
            })}
          </div>
        </section>

        <section style={s.details}>
          <div style={s.dateLabel}>
            {currentDate.getDate()} {fullNames[langIndex][getMondayIndex(currentDate)]}
          </div>

          <AnimatePresence mode="wait">
            {selectedSleepEntry ? (
              <motion.div key="entry" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={s.entryCard}>
                <div style={s.entryGlow(moodColors(theme, selectedSleepEntry.mood - 1))} />
                <div style={s.metricsGrid}>
                  <MetricItem icon={<FaMoon />} label={langIndex === 0 ? 'Отбой' : 'Bedtime'} value={formatMsToHhMm(selectedSleepEntry.bedtime)} color={accent.hue} theme={theme} />
                  <MetricItem icon={<FaRegClock />} label={langIndex === 0 ? 'Сон' : 'Duration'} value={formatMsToHhMm(selectedSleepEntry.duration)} color={moodColors(theme, selectedSleepEntry.mood - 1)} theme={theme} />
                  <div style={s.metricBox}>
                    <div style={{ ...s.metricIcon, color: Colors.get('difficulty3', theme) }}><FaStar /></div>
                    <div style={s.metricLabel}>{langIndex === 0 ? 'Оценка' : 'Mood'}</div>
                    <div style={s.starRow}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <FaStar key={star} size={10} color={star <= selectedSleepEntry.mood ? Colors.get('difficulty3', theme) : Colors.get('subText', theme)} style={{ opacity: star <= selectedSleepEntry.mood ? 1 : 0.22 }} />
                      ))}
                    </div>
                  </div>
                </div>
                {selectedSleepEntry.note && (
                  <div style={s.noteBox}>
                    <FaStickyNote size={14} style={{ flexShrink: 0, marginTop: 2, opacity: 0.72 }} />
                    <span>{selectedSleepEntry.note}</span>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.emptyState}>
                <FaBed size={30} style={{ opacity: 0.34 }} />
                <span>{langIndex === 0 ? 'На выбранный день сна нет' : 'No sleep record for this day'}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};

const SummaryTile = ({ icon, label, value, theme, accent }) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  return (
    <div style={{
      minWidth: 0,
      minHeight: 80,
      borderRadius: 18,
      padding: '13px 12px',
      background: isLight ? '#fff' : 'rgba(255,255,255,0.045)',
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)'}`,
      boxSizing: 'border-box'
    }}>
      <div style={{ color: accent.hue, fontSize: 16, marginBottom: 9 }}>{icon}</div>
      <div style={{ color: Colors.get('subText', theme), fontSize: 10, fontWeight: 850, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ color: Colors.get('mainText', theme), fontSize: 15, fontWeight: 950, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
};

const MetricItem = ({ icon, label, value, theme, color }) => {
  const s = styles(theme, buildSleepAccent(AppData.sleepAccentColor || '#6F8BD6'));
  return (
    <div style={s.metricBox}>
      <div style={{ ...s.metricIcon, color }}>{icon}</div>
      <div style={s.metricLabel}>{label}</div>
      <div style={s.metricValue}>{value}</div>
    </div>
  );
};

function AccentSettingsModal({ show, onClose, theme, langIndex, accent, accentColor, onAccentChange }) {
  const isLight = theme === 'light' || theme === 'speciallight';
  const text = Colors.get('mainText', theme);
  const sub = Colors.get('subText', theme);

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{
            position: 'fixed',
            inset: 0,
            zIndex: 5000,
            background: 'rgba(0,0,0,0.58)',
            backdropFilter: 'blur(8px)'
          }} />
          <motion.div initial={{ y: 36, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 36, opacity: 0, scale: 0.98 }} style={{
            position: 'fixed',
            left: '4%',
            right: '4%',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 18px)',
            maxWidth: 560,
            margin: '0 auto',
            zIndex: 5001,
            borderRadius: 26,
            padding: 18,
            boxSizing: 'border-box',
            background: `radial-gradient(260px 180px at 92% 4%, ${accent.soft} 0%, transparent 68%), ${isLight ? 'rgba(255,255,255,0.97)' : 'rgba(18,21,25,0.97)'}`,
            border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : accent.ring}`,
            boxShadow: isLight ? '0 24px 70px rgba(0,0,0,0.18)' : '0 28px 80px rgba(0,0,0,0.72)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent.hue, background: accent.soft, border: `1px solid ${accent.ring}` }}>
                <FaPalette />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: text, fontSize: 18, fontWeight: 900 }}>{langIndex === 0 ? 'Акцент сна' : 'Sleep accent'}</div>
                <div style={{ color: sub, fontSize: 12, fontWeight: 700, marginTop: 3 }}>{langIndex === 0 ? 'Цвет календаря и карточек раздела' : 'Calendar and card accent color'}</div>
              </div>
              <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', color: sub, fontSize: 18, padding: 8 }}>
                <FaTimes />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ color: text, fontSize: 14, fontWeight: 850 }}>{langIndex === 0 ? 'Основной цвет' : 'Main color'}</div>
                <div style={{ color: sub, fontSize: 11, fontWeight: 650, marginTop: 2 }}>{accentColor}</div>
              </div>
              <input type="color" value={accentColor} onChange={(event) => onAccentChange(event.target.value)} style={{ width: 44, height: 44, borderRadius: 14, border: `1px solid ${accent.ring}`, background: 'transparent', padding: 0 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(0, 1fr))', gap: 8 }}>
              {SLEEP_ACCENT_PRESETS.map((color) => {
                const active = accentColor.toUpperCase() === color.toUpperCase();
                return (
                  <motion.button key={color} type="button" whileTap={{ scale: 0.92 }} onClick={() => onAccentChange(color)} aria-label={color} style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    minHeight: 30,
                    borderRadius: 11,
                    border: active ? `2px solid ${text}` : `1px solid ${isLight ? 'rgba(15,23,42,0.1)' : 'rgba(255,255,255,0.1)'}`,
                    background: color,
                    boxShadow: active ? `0 0 18px ${color}55` : 'none'
                  }} />
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default SleepMain;

const styles = (theme, accent) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  const panel = isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.045)';
  const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)';

  return {
    container: {
      width: '100vw',
      height: '100vh',
      background: isLight
        ? `linear-gradient(180deg, ${accent.faint} 0%, ${Colors.get('background', theme)} 38%)`
        : `linear-gradient(180deg, rgba(${accent.rgb.r},${accent.rgb.g},${accent.rgb.b},0.12) 0%, ${Colors.get('background', theme)} 42%)`,
      fontFamily: 'Segoe UI, sans-serif',
      color: Colors.get('mainText', theme),
      overflow: 'hidden'
    },
    scroll: {
      height: '100%',
      overflowY: 'auto',
      padding: 'calc(env(safe-area-inset-top, 0px) + 18px) 18px 150px',
      boxSizing: 'border-box'
    },
    topBar: {
      display: 'grid',
      gridTemplateColumns: '96px minmax(0, 1fr) 96px',
      alignItems: 'center',
      gap: 12,
      marginBottom: 18
    },
    topSpacer: { width: 96, height: 38 },
    brandBlock: { minWidth: 0, textAlign: 'center' },
    brand: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: 24,
      fontWeight: 700,
      color: Colors.get('mainText', theme),
      opacity: 0.86,
      letterSpacing: 0,
      lineHeight: 1.05
    },
    accentButton: {
      height: 38,
      borderRadius: 999,
      border: `1px solid ${accent.ring}`,
      background: accent.soft,
      color: accent.hue,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      fontSize: 12,
      fontWeight: 900,
      fontFamily: 'inherit',
      padding: '0 12px',
      whiteSpace: 'nowrap'
    },
    colorDotInline: {
      width: 9,
      height: 9,
      borderRadius: 999,
      background: accent.hue,
      boxShadow: `0 0 10px ${accent.hue}`,
      flexShrink: 0
    },
    syncPill: {
      width: 'fit-content',
      margin: '0 auto 10px',
      padding: '6px 10px',
      borderRadius: 999,
      background: accent.soft,
      color: accent.hue,
      fontSize: 11,
      fontWeight: 900,
      border: `1px solid ${accent.ring}`
    },
    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginTop: 12 },
    panel: {
      marginTop: 14,
      borderRadius: 24,
      padding: 14,
      background: panel,
      border: `1px solid ${border}`,
      boxSizing: 'border-box'
    },
    monthHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 },
    monthButton: { width: 42, height: 42, borderRadius: 999, border: `1px solid ${accent.ring}`, background: accent.soft, color: accent.hue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900, lineHeight: 1, padding: 0, fontFamily: 'Georgia, "Times New Roman", serif' },
    monthTitle: { color: Colors.get('mainText', theme), fontSize: 18, fontWeight: 950, textTransform: 'capitalize' },
    yearText: { color: Colors.get('subText', theme), marginLeft: 7, fontWeight: 800 },
    weekRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8, textAlign: 'center' },
    weekDay: { fontSize: 10, fontWeight: 900, textTransform: 'uppercase' },
    daysGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 },
    dayCell: (selected, today) => ({
      position: 'relative',
      aspectRatio: '1 / 1',
      borderRadius: 13,
      overflow: 'hidden',
      border: `1px solid ${border}`,
      background: selected ? accent.soft : isLight ? 'rgba(255,255,255,0.74)' : 'rgba(255,255,255,0.025)',
      color: Colors.get('mainText', theme),
      fontSize: 14,
      fontWeight: selected || today ? 950 : 750,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      boxShadow: selected ? `inset 0 0 0 1px ${isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)'}` : 'none'
    }),
    dayFill: { position: 'absolute', left: 0, right: 0, bottom: 0, opacity: isLight ? 0.22 : 0.28 },
    dayNumber: { position: 'relative', zIndex: 1 },
    selectedDot: { position: 'absolute', left: '50%', bottom: 6, width: 5, height: 5, borderRadius: 999, background: accent.hue, transform: 'translateX(-50%)', zIndex: 2 },
    details: { marginTop: 14 },
    dateLabel: { color: Colors.get('subText', theme), fontSize: 13, fontWeight: 900, padding: '0 4px 8px' },
    entryCard: { position: 'relative', overflow: 'hidden', borderRadius: 22, padding: 14, background: panel, border: `1px solid ${border}` },
    entryGlow: (color) => ({ position: 'absolute', right: -70, top: -90, width: 200, height: 200, borderRadius: '50%', background: `${color}25`, filter: 'blur(32px)' }),
    metricsGrid: { position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 9, zIndex: 1 },
    metricBox: { minWidth: 0, minHeight: 78, borderRadius: 16, background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8, boxSizing: 'border-box' },
    metricIcon: { fontSize: 17, marginBottom: 6 },
    metricLabel: { color: Colors.get('subText', theme), fontSize: 9, fontWeight: 900, textTransform: 'uppercase', textAlign: 'center' },
    metricValue: { color: Colors.get('mainText', theme), fontSize: 14, fontWeight: 950, marginTop: 3 },
    starRow: { display: 'flex', gap: 2, marginTop: 5 },
    noteBox: { position: 'relative', zIndex: 1, display: 'flex', gap: 10, marginTop: 10, padding: 12, borderRadius: 14, background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)', color: Colors.get('mainText', theme), fontSize: 13, fontWeight: 700, lineHeight: 1.4 },
    emptyState: { minHeight: 122, borderRadius: 22, border: `1px dashed ${border}`, background: panel, color: Colors.get('subText', theme), display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }
  };
};
