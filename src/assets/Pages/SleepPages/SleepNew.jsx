import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Slider from '@mui/material/Slider';
import {
  MdCheck,
  MdClose,
  MdNightsStay,
  MdSentimentDissatisfied,
  MdSentimentNeutral,
  MdSentimentSatisfied,
  MdSentimentVeryDissatisfied,
  MdSentimentVerySatisfied
} from 'react-icons/md';
import { FaBed, FaChevronLeft, FaPen, FaRegClock, FaSun } from 'react-icons/fa';

import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { playEffects } from '../../StaticClasses/Effects.js';
import { saveData } from '../../StaticClasses/SaveHelper.js';
import { fontSize$, lang$, lastPage$, selectedSleepDate$, setPage, theme$ } from '../../StaticClasses/HabitsBus';
import { addDayToSleepingLog } from './SleepHelper.js';
import { buildSleepAccent } from './SleepVisuals.js';

const clickSound = new Audio('Audio/Click.wav');
const STEP_MINUTES = 10;
const STEP_MS = STEP_MINUTES * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const MOODS = [
  { Icon: MdSentimentVeryDissatisfied, label: ['Плохо', 'Bad'] },
  { Icon: MdSentimentDissatisfied, label: ['Тяжело', 'Rough'] },
  { Icon: MdSentimentNeutral, label: ['Нормально', 'Okay'] },
  { Icon: MdSentimentSatisfied, label: ['Хорошо', 'Good'] },
  { Icon: MdSentimentVerySatisfied, label: ['Отлично', 'Great'] }
];

const formatMsToHhMm = (ms) => {
  const totalMinutes = Math.floor((ms % DAY_MS) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const formatDuration = (ms, langIndex) => {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return langIndex === 0 ? `${hours} ч ${minutes} м` : `${hours}h ${minutes}m`;
};

const getDurationFromTimes = (bedTime, wakeTime) => {
  const delta = wakeTime - bedTime;
  return delta > 0 ? delta : delta + DAY_MS;
};

const formatDateLabel = (dateString, langIndex) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(langIndex === 0 ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const getMoodColor = (theme, index) => [
  Colors.get('veryBad', theme),
  Colors.get('bad', theme),
  Colors.get('normal', theme),
  Colors.get('good', theme),
  Colors.get('perfect', theme)
][index] || Colors.get('normal', theme);

function isNotFutureDate(dateString) {
  const givenDate = new Date(dateString);
  const today = new Date();
  givenDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return givenDate <= today;
}

const SleepNew = () => {
  const fallbackDate = new Date().toISOString().split('T')[0];
  const dateString = selectedSleepDate$.value || fallbackDate;
  const [theme, setTheme] = useState(theme$.value);
  const [fSize, setFontSize] = useState(fontSize$.value);
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [mood, setMood] = useState(4);
  const [bedTime, setBedTime] = useState(23 * HOUR_MS);
  const [wakeTime, setWakeTime] = useState(7 * HOUR_MS);
  const [note, setNote] = useState('');

  const accent = useMemo(() => buildSleepAccent(AppData.sleepAccentColor || '#6F8BD6'), []);
  const duration = getDurationFromTimes(bedTime, wakeTime);
  const s = styles(theme, accent, fSize);

  useEffect(() => {
    const sub1 = theme$.subscribe(setTheme);
    const sub2 = fontSize$.subscribe(setFontSize);
    const sub3 = lang$.subscribe(value => setLangIndex(value === 'ru' ? 0 : 1));
    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
      sub3.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isNotFutureDate(dateString)) setPage(lastPage$.value || 'SleepMain');
  }, [dateString]);

  const closePanel = () => setPage(lastPage$.value || 'SleepMain');

  const handleSave = async () => {
    playEffects(clickSound);
    addDayToSleepingLog(dateString, duration, bedTime, mood, note.trim());
    await saveData();
    closePanel();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={s.page}
    >
      <div style={s.sheet}>
        <header style={s.header}>
          <motion.button type="button" whileTap={{ scale: 0.94 }} onClick={closePanel} style={s.backButton}>
            <FaChevronLeft />
          </motion.button>
          <div style={s.headerCenter}>
            <div style={s.iconBadge}><MdNightsStay /></div>
            <div>
              <h1 style={s.title}>{langIndex === 0 ? 'Запись сна' : 'Sleep log'}</h1>
              <div style={s.dateText}>{formatDateLabel(dateString, langIndex)}</div>
            </div>
          </div>
          <div style={s.headerSpacer} />
        </header>

        <main style={s.body}>
          <section style={s.summaryCard}>
            <div style={s.summaryTop}>
              <TimeStat icon={<FaBed />} label={langIndex === 0 ? 'Отбой' : 'Bedtime'} value={formatMsToHhMm(bedTime)} theme={theme} accent={accent} />
              <TimeStat icon={<FaSun />} label={langIndex === 0 ? 'Подъем' : 'Wake'} value={formatMsToHhMm(wakeTime)} theme={theme} accent={accent} />
              <TimeStat icon={<FaRegClock />} label={langIndex === 0 ? 'Итого' : 'Total'} value={formatDuration(duration, langIndex)} theme={theme} accent={accent} wide />
            </div>
            <div style={s.timeline}>
              <span style={s.timelineDot} />
              <span style={s.timelineLine} />
              <span style={s.timelineDot} />
            </div>
          </section>

          <TimeControl
            icon={<FaBed />}
            title={langIndex === 0 ? 'Время отбоя' : 'Bedtime'}
            value={formatMsToHhMm(bedTime)}
            hint={langIndex === 0 ? 'Когда лег спать' : 'When sleep started'}
            sliderValue={bedTime}
            onChange={setBedTime}
            min={0}
            max={DAY_MS - STEP_MS}
            theme={theme}
            accent={accent}
          />

          <TimeControl
            icon={<FaSun />}
            title={langIndex === 0 ? 'Время подъема' : 'Wake time'}
            value={formatMsToHhMm(wakeTime)}
            hint={langIndex === 0 ? 'Когда проснулся' : 'When you woke up'}
            sliderValue={wakeTime}
            onChange={setWakeTime}
            min={0}
            max={DAY_MS - STEP_MS}
            theme={theme}
            accent={accent}
          />

          <section style={s.card}>
            <div style={s.moodHeader}>
              <div style={s.cardTitle}>{langIndex === 0 ? 'Самочувствие' : 'Mood'}</div>
              <div style={s.moodCurrent}>{MOODS[mood - 1].label[langIndex]}</div>
            </div>
            <div style={s.moodGrid}>
              {MOODS.map(({ Icon, label }, index) => {
                const moodValue = index + 1;
                const selected = mood === moodValue;
                const color = getMoodColor(theme, index);
                return (
                  <motion.button
                    type="button"
                    key={label[0]}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      playEffects(clickSound);
                      setMood(moodValue);
                    }}
                    style={s.moodButton(selected, color)}
                  >
                    <Icon size={30} />
                    <span>{label[langIndex]}</span>
                  </motion.button>
                );
              })}
            </div>
          </section>

          <section style={s.noteCard}>
            <div style={s.cardHeader}>
              <div style={s.noteTitleRow}>
                <FaPen />
                <span>{langIndex === 0 ? 'Заметка' : 'Note'}</span>
              </div>
            </div>
            <textarea
              placeholder={langIndex === 0 ? 'Что повлияло на сон?' : 'What affected your sleep?'}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              style={s.textarea}
            />
          </section>

          <footer style={s.footer}>
            <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={closePanel} style={s.cancelButton}>
              <MdClose size={22} />
            </motion.button>
            <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={handleSave} style={s.saveButton}>
              <MdCheck size={22} />
              <span>{langIndex === 0 ? 'Сохранить сон' : 'Save sleep'}</span>
            </motion.button>
          </footer>
        </main>
      </div>
    </motion.div>
  );
};

const TimeStat = ({ icon, label, value, theme, accent, wide = false }) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  return (
    <div style={{
      minWidth: 0,
      gridColumn: wide ? 'span 1' : 'auto',
      padding: '12px 10px',
      borderRadius: 17,
      background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)',
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.055)' : 'rgba(255,255,255,0.06)'}`
    }}>
      <div style={{ color: accent.hue, fontSize: 13, display: 'flex', marginBottom: 7 }}>{icon}</div>
      <div style={{ color: Colors.get('subText', theme), fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ color: Colors.get('mainText', theme), fontSize: 16, fontWeight: 950, marginTop: 3, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
};

const TimeControl = ({ icon, title, value, hint, sliderValue, onChange, min, max, theme, accent }) => {
  const s = styles(theme, accent, 0);
  return (
    <section style={s.card}>
      <div style={s.controlHeader}>
        <div style={s.controlIcon}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={s.cardTitle}>{title}</div>
          <div style={s.cardHint}>{hint}</div>
        </div>
        <div style={s.controlValue}>{value}</div>
      </div>
      <Slider
        value={sliderValue}
        onChange={(_, next) => onChange(next)}
        min={min}
        max={max}
        step={STEP_MS}
        sx={{
          color: accent.hue,
          height: 5,
          mt: 1.2,
          '& .MuiSlider-thumb': {
            width: 22,
            height: 22,
            backgroundColor: Colors.get('background', theme),
            border: `3px solid ${accent.hue}`,
            boxShadow: `0 0 0 7px ${accent.soft}`,
            '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
              boxShadow: `0 0 0 10px ${accent.ring}`
            }
          },
          '& .MuiSlider-track': { border: 'none' },
          '& .MuiSlider-rail': {
            opacity: 1,
            backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)'
          }
        }}
      />
    </section>
  );
};

export default SleepNew;

const styles = (theme, accent, fSize = 0) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  const bg = Colors.get('background', theme);
  const text = Colors.get('mainText', theme);
  const sub = Colors.get('subText', theme);
  const panel = isLight ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.045)';
  const panelStrong = isLight ? '#fff' : 'rgba(24,27,32,0.92)';
  const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)';

  return {
    page: {
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      background: isLight
        ? `linear-gradient(180deg, ${accent.faint} 0%, ${bg} 44%)`
        : `linear-gradient(180deg, rgba(${accent.rgb.r},${accent.rgb.g},${accent.rgb.b},0.13) 0%, ${bg} 46%)`,
      color: text,
      overflow: 'hidden',
      fontFamily: 'Segoe UI, sans-serif'
    },
    sheet: {
      width: '100%',
      maxWidth: 560,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'transparent',
      overflow: 'hidden'
    },
    header: {
      display: 'grid',
      gridTemplateColumns: '52px minmax(0, 1fr) 52px',
      alignItems: 'center',
      gap: 12,
      padding: 'calc(env(safe-area-inset-top, 0px) + 18px) 18px 14px',
      flexShrink: 0
    },
    backButton: {
      width: 46,
      height: 46,
      borderRadius: 16,
      border: `1px solid ${border}`,
      background: panel,
      color: text,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 17
    },
    headerCenter: {
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12
    },
    iconBadge: {
      width: 50,
      height: 50,
      borderRadius: 17,
      background: accent.hue,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 26,
      boxShadow: `0 16px 34px -20px ${accent.hue}`
    },
    title: {
      margin: 0,
      color: text,
      fontSize: fSize === 0 ? 23 : 26,
      fontWeight: 950,
      lineHeight: 1.05
    },
    dateText: {
      marginTop: 4,
      color: sub,
      fontSize: 12,
      fontWeight: 800,
      whiteSpace: 'nowrap'
    },
    headerSpacer: { width: 52, height: 46 },
    body: {
      flex: 1,
      overflowY: 'auto',
      padding: '4px 18px calc(env(safe-area-inset-bottom, 0px) + 18px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      boxSizing: 'border-box'
    },
    summaryCard: {
      borderRadius: 24,
      padding: 14,
      background: `linear-gradient(135deg, ${panelStrong}, ${accent.faint})`,
      border: `1px solid ${accent.ring}`,
      boxShadow: isLight ? `0 20px 50px -38px ${accent.hue}` : '0 20px 60px rgba(0,0,0,0.24)'
    },
    summaryTop: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: 8
    },
    timeline: {
      display: 'grid',
      gridTemplateColumns: '10px 1fr 10px',
      alignItems: 'center',
      gap: 8,
      margin: '12px 4px 2px'
    },
    timelineDot: { width: 10, height: 10, borderRadius: 999, background: accent.hue, boxShadow: `0 0 18px ${accent.hue}66` },
    timelineLine: { height: 3, borderRadius: 999, background: `linear-gradient(90deg, ${accent.hue}, ${accent.soft})` },
    card: {
      borderRadius: 22,
      padding: 15,
      background: panel,
      border: `1px solid ${border}`,
      boxSizing: 'border-box'
    },
    controlHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 11
    },
    controlIcon: {
      width: 38,
      height: 38,
      borderRadius: 14,
      background: accent.soft,
      border: `1px solid ${accent.ring}`,
      color: accent.hue,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    controlValue: {
      color: text,
      fontSize: 24,
      fontWeight: 950,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 12
    },
    cardTitle: { color: text, fontSize: 14, fontWeight: 950 },
    cardHint: { color: sub, fontSize: 11, fontWeight: 750, marginTop: 3 },
    moodHeader: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 12
    },
    moodCurrent: {
      color: accent.hue,
      fontSize: 12,
      fontWeight: 900,
      whiteSpace: 'nowrap'
    },
    moodGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
      gap: 7
    },
    moodButton: (selected, color) => ({
      minWidth: 0,
      minHeight: 72,
      borderRadius: 17,
      border: selected ? `1px solid ${color}` : `1px solid ${border}`,
      background: selected ? `${color}1F` : isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.035)',
      color: selected ? color : sub,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      fontSize: 9,
      lineHeight: 1,
      textAlign: 'center',
      fontWeight: 900,
      fontFamily: 'inherit',
      padding: '7px 4px',
      boxShadow: selected ? `0 14px 28px -22px ${color}` : 'none'
    }),
    noteCard: {
      borderRadius: 22,
      padding: 15,
      minHeight: 148,
      background: panel,
      border: `1px solid ${border}`,
      boxSizing: 'border-box'
    },
    noteTitleRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: text,
      fontSize: 14,
      fontWeight: 950
    },
    textarea: {
      width: '100%',
      minHeight: 92,
      resize: 'none',
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: text,
      fontSize: 15,
      fontWeight: 650,
      lineHeight: 1.45,
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    },
    footer: {
      width: '100%',
      display: 'flex',
      gap: 11,
      padding: 12,
      boxSizing: 'border-box',
      borderRadius: 24,
      background: isLight ? 'rgba(255,255,255,0.58)' : 'rgba(255,255,255,0.055)',
      backdropFilter: 'blur(22px)',
      WebkitBackdropFilter: 'blur(22px)',
      border: `1px solid ${isLight ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.105)'}`,
      boxShadow: isLight ? '0 18px 46px rgba(15,23,42,0.11)' : '0 18px 50px rgba(0,0,0,0.28)'
    },
    cancelButton: {
      width: 56,
      height: 56,
      borderRadius: 18,
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)'}`,
      background: isLight ? 'rgba(255,255,255,0.64)' : 'rgba(255,255,255,0.055)',
      color: sub,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    saveButton: {
      flex: 1,
      height: 56,
      borderRadius: 18,
      border: `1px solid rgba(${accent.rgb.r},${accent.rgb.g},${accent.rgb.b},0.46)`,
      background: `linear-gradient(135deg, rgba(${accent.rgb.r},${accent.rgb.g},${accent.rgb.b},0.82), rgba(${accent.rgb.r},${accent.rgb.g},${accent.rgb.b},0.58))`,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontSize: 15,
      fontWeight: 950,
      fontFamily: 'inherit',
      boxShadow: `0 18px 38px -24px ${accent.hue}`,
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)'
    }
  };
};
