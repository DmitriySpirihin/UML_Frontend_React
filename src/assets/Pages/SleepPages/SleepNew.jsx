import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
import { FaBed, FaPen, FaRegClock, FaSun } from 'react-icons/fa';

import { AppData, formatLocalDateKey } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { playEffects } from '../../StaticClasses/Effects.js';
import { saveData } from '../../StaticClasses/SaveHelper.js';
import { fontSize$, lang$, lastPage$, selectedSleepDate$, setPage, theme$ } from '../../StaticClasses/HabitsBus';
import { addDayToSleepingLog } from './SleepHelper.js';
import { buildSleepAccent } from './SleepVisuals.js';

const STEP_MINUTES = 5;
const STEP_MS = STEP_MINUTES * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MAX_SLEEP_MINUTES = 23 * 60 + 55;

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

const parseHhMmToMs = (value) => {
  const [hoursRaw, minutesRaw] = String(value || '').split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return ((Math.max(0, Math.min(23, hours)) * 60) + Math.max(0, Math.min(59, minutes))) * 60000;
};

const clampDurationMinutes = (value) => Math.max(STEP_MINUTES, Math.min(MAX_SLEEP_MINUTES, Math.round(Number(value) || STEP_MINUTES)));

const addDurationToTime = (timeMs, durationMinutes) => (
  (timeMs + clampDurationMinutes(durationMinutes) * 60000) % DAY_MS
);

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
  const fallbackDate = formatLocalDateKey();
  const dateString = selectedSleepDate$.value || fallbackDate;
  const [theme, setTheme] = useState(theme$.value);
  const [fSize, setFontSize] = useState(fontSize$.value);
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [mood, setMood] = useState(4);
  const [bedTime, setBedTime] = useState(23 * HOUR_MS);
  const [wakeTime, setWakeTime] = useState(7 * HOUR_MS);
  const [sleepType, setSleepType] = useState('night');
  const [note, setNote] = useState('');

  const accent = useMemo(() => buildSleepAccent(AppData.sleepAccentColor || '#7C6CFF'), []);
  const duration = getDurationFromTimes(bedTime, wakeTime);
  const durationMinutes = Math.round(duration / 60000);
  const durationHoursValue = Math.floor(durationMinutes / 60);
  const durationMinutesValue = durationMinutes % 60;
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

  const updateBedTime = (value) => {
    const nextBedTime = parseHhMmToMs(value);
    if (nextBedTime === null) return;
    setBedTime(nextBedTime);
    setWakeTime(addDurationToTime(nextBedTime, durationMinutes));
  };

  const updateWakeTime = (value) => {
    const nextWakeTime = parseHhMmToMs(value);
    if (nextWakeTime === null) return;
    setWakeTime(nextWakeTime);
  };

  const updateDuration = (nextHours, nextMinutes) => {
    const hours = Math.max(0, Math.min(23, Math.floor(Number(nextHours) || 0)));
    const minutes = Math.max(0, Math.min(59, Math.floor(Number(nextMinutes) || 0)));
    const nextDurationMinutes = clampDurationMinutes(hours * 60 + minutes);
    setWakeTime(addDurationToTime(bedTime, nextDurationMinutes));
  };

  const handleSave = async () => {
    playEffects(null);
    addDayToSleepingLog(dateString, duration, bedTime, mood, note.trim(), sleepType);
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
          <div aria-hidden="true" style={{ width: 46, height: 46 }} />
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

          <section style={s.typeSwitch}>
            {[
              { id: 'night', icon: <MdNightsStay />, label: langIndex === 0 ? 'Ночной сон' : 'Night sleep' },
              { id: 'day', icon: <FaSun />, label: langIndex === 0 ? 'Дневной сон' : 'Nap' }
            ].map(option => {
              const active = sleepType === option.id;
              return (
                <motion.button
                  key={option.id}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    playEffects(null);
                    setSleepType(option.id);
                    if (option.id === 'day') {
                      setBedTime(13 * HOUR_MS);
                      setWakeTime(14 * HOUR_MS + 30 * 60 * 1000);
                    } else {
                      setBedTime(23 * HOUR_MS);
                      setWakeTime(7 * HOUR_MS);
                    }
                  }}
                  style={s.typeOption(active)}
                >
                  <span style={s.typeIcon(active)}>{option.icon}</span>
                  <span>{option.label}</span>
                </motion.button>
              );
            })}
          </section>

          <TimeControl
            icon={<FaBed />}
            title={langIndex === 0 ? 'Время отбоя' : 'Bedtime'}
            value={formatMsToHhMm(bedTime)}
            hint={langIndex === 0 ? 'Когда лег спать' : 'When sleep started'}
            inputValue={formatMsToHhMm(bedTime)}
            onChange={updateBedTime}
            theme={theme}
            accent={accent}
          />

          <TimeControl
            icon={<FaSun />}
            title={langIndex === 0 ? 'Время подъема' : 'Wake time'}
            value={formatMsToHhMm(wakeTime)}
            hint={langIndex === 0 ? 'Когда проснулся' : 'When you woke up'}
            inputValue={formatMsToHhMm(wakeTime)}
            onChange={updateWakeTime}
            theme={theme}
            accent={accent}
          />

          <DurationControl
            icon={<FaRegClock />}
            title={langIndex === 0 ? 'Сколько поспал' : 'Sleep duration'}
            hint={langIndex === 0 ? 'Можно ввести точно руками' : 'Enter exact hours and minutes'}
            hours={durationHoursValue}
            minutes={durationMinutesValue}
            onChange={updateDuration}
            theme={theme}
            accent={accent}
            langIndex={langIndex}
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
                      playEffects(null);
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

const TimeControl = ({ icon, title, value, hint, inputValue, onChange, theme, accent }) => {
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
      <input
        type="time"
        value={inputValue}
        step={STEP_MS / 1000}
        onChange={(event) => onChange(event.target.value)}
        style={s.timeInput}
      />
    </section>
  );
};

const DurationControl = ({ icon, title, hint, hours, minutes, onChange, theme, accent, langIndex }) => {
  const s = styles(theme, accent, 0);
  const adjust = (deltaMinutes) => {
    const current = hours * 60 + minutes;
    const next = clampDurationMinutes(current + deltaMinutes);
    onChange(Math.floor(next / 60), next % 60);
  };

  return (
    <section style={s.card}>
      <div style={s.controlHeader}>
        <div style={s.controlIcon}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={s.cardTitle}>{title}</div>
          <div style={s.cardHint}>{hint}</div>
        </div>
        <div style={s.controlValue}>{`${hours}:${minutes.toString().padStart(2, '0')}`}</div>
      </div>
      <div style={s.durationGrid}>
        <NumberField
          label={langIndex === 0 ? 'часы' : 'hours'}
          value={hours}
          min={0}
          max={23}
          onChange={(nextHours) => onChange(nextHours, minutes)}
          styles={s}
        />
        <NumberField
          label={langIndex === 0 ? 'мин' : 'min'}
          value={minutes}
          min={0}
          max={59}
          onChange={(nextMinutes) => onChange(hours, nextMinutes)}
          styles={s}
        />
        <div style={s.stepperRow}>
          <button type="button" onClick={() => adjust(-15)} style={s.stepperButton}>-15</button>
          <button type="button" onClick={() => adjust(15)} style={s.stepperButton}>+15</button>
        </div>
      </div>
    </section>
  );
};

const NumberField = ({ label, value, min, max, onChange, styles: s }) => (
  <label style={s.numberField}>
    <span style={s.numberLabel}>{label}</span>
    <input
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      style={s.numberInput}
    />
  </label>
);

export default SleepNew;

const styles = (theme, accent, fSize = 0) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  const bg = Colors.get('background', theme);
  const text = Colors.get('mainText', theme);
  const sub = Colors.get('subText', theme);
  const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(190,210,230,0.13)';
  const glassPanel = {
    background: isLight
      ? `radial-gradient(220px 120px at 18% 0%, rgba(${accent.rgb.r},${accent.rgb.g},${accent.rgb.b},0.10), transparent 72%), linear-gradient(145deg, rgba(255,255,255,0.74), rgba(255,255,255,0.46))`
      : `radial-gradient(260px 150px at 18% 0%, rgba(${accent.rgb.r},${accent.rgb.g},${accent.rgb.b},0.20), transparent 72%), linear-gradient(145deg, rgba(255,255,255,0.078), rgba(255,255,255,0.030))`,
    border: `1px solid ${border}`,
    boxShadow: isLight
      ? '0 1px 0 rgba(255,255,255,0.78) inset, 0 18px 42px -32px rgba(15,23,42,0.24)'
      : '0 1px 0 rgba(255,255,255,0.10) inset, 0 18px 46px -28px rgba(0,0,0,0.58)',
    backdropFilter: 'blur(28px) saturate(175%)',
    WebkitBackdropFilter: 'blur(28px) saturate(175%)'
  };

  return {
    page: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 'auto',
      zIndex: 1000,
      height: 'var(--app-viewport-height, 100dvh)',
      display: 'flex',
      justifyContent: 'center',
      background: isLight
        ? `linear-gradient(180deg, ${accent.faint} 0%, ${bg} 44%)`
        : `linear-gradient(180deg, rgba(${accent.rgb.r},${accent.rgb.g},${accent.rgb.b},0.13) 0%, ${bg} 46%)`,
      color: text,
      overflow: 'hidden',
      fontFamily: 'inherit'
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
      background: isLight ? 'rgba(255,255,255,0.66)' : 'rgba(255,255,255,0.065)',
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
      ...glassPanel
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
    typeSwitch: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: 9,
      padding: 8,
      borderRadius: 22,
      ...glassPanel
    },
    typeOption: (active) => ({
      minHeight: 46,
      borderRadius: 17,
      border: `1px solid ${active ? accent.ring : 'transparent'}`,
      background: active
        ? `linear-gradient(135deg, rgba(${accent.rgb.r},${accent.rgb.g},${accent.rgb.b},0.24), rgba(${accent.rgb.r},${accent.rgb.g},${accent.rgb.b},0.10))`
        : 'transparent',
      color: active ? text : sub,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontSize: 13,
      fontWeight: 900,
      fontFamily: 'inherit',
      padding: '0 10px',
      boxShadow: active ? `0 12px 26px -22px ${accent.hue}` : 'none'
    }),
    typeIcon: (active) => ({
      color: active ? accent.hue : sub,
      display: 'inline-flex',
      fontSize: 15
    }),
    card: {
      borderRadius: 22,
      padding: 15,
      ...glassPanel,
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
    timeInput: {
      width: '100%',
      marginTop: 13,
      height: 52,
      borderRadius: 17,
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.10)' : 'rgba(255,255,255,0.10)'}`,
      background: isLight ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.055)',
      color: text,
      outline: 'none',
      fontSize: 22,
      fontWeight: 950,
      fontVariantNumeric: 'tabular-nums',
      fontFamily: 'inherit',
      padding: '0 14px',
      boxSizing: 'border-box',
      colorScheme: isLight ? 'light' : 'dark'
    },
    durationGrid: {
      marginTop: 13,
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
      gap: 9
    },
    numberField: {
      minWidth: 0,
      height: 64,
      borderRadius: 17,
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.10)' : 'rgba(255,255,255,0.10)'}`,
      background: isLight ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.055)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 3,
      padding: '7px 12px',
      boxSizing: 'border-box'
    },
    numberLabel: {
      color: sub,
      fontSize: 10,
      fontWeight: 900,
      textTransform: 'uppercase'
    },
    numberInput: {
      width: '100%',
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: text,
      fontSize: 24,
      fontWeight: 950,
      fontVariantNumeric: 'tabular-nums',
      fontFamily: 'inherit',
      padding: 0,
      minWidth: 0
    },
    stepperRow: {
      gridColumn: '1 / -1',
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: 9
    },
    stepperButton: {
      height: 44,
      borderRadius: 15,
      border: `1px solid ${accent.ring}`,
      background: accent.soft,
      color: text,
      fontSize: 14,
      fontWeight: 950,
      fontFamily: 'inherit'
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
      ...glassPanel,
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
      fontSize: 16,
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
      background: isLight
        ? 'linear-gradient(145deg, rgba(255,255,255,0.72), rgba(255,255,255,0.44))'
        : 'linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.034))',
      backdropFilter: 'blur(22px)',
      WebkitBackdropFilter: 'blur(22px)',
      border: `1px solid ${isLight ? 'rgba(255,255,255,0.72)' : 'rgba(190,210,230,0.13)'}`,
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
