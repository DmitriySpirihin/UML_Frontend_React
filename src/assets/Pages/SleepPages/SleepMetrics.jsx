import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import MyBarChart from "../../Helpers/MyBarChart";
import { AppData, UserData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, premium$, setPage } from '../../StaticClasses/HabitsBus';
import {
  MdAdd,
  MdBedtime,
  MdHistory,
  MdInsights,
  MdNightsStay,
  MdOutlineCalendarMonth,
  MdOutlineFlag,
  MdOutlineShowChart,
  MdOutlineStarBorder,
  MdOutlineTrackChanges,
  MdWbSunny
} from 'react-icons/md';
import { FaCrown } from 'react-icons/fa';
import { buildSleepAccent } from './SleepVisuals.js';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const TARGET_SLEEP_MS = 8 * HOUR_MS;
const PERIOD_DAYS = [28, 180, 360];
const PERIOD_LABELS = [
  ['Месяц', 'Month'],
  ['6 мес', '6 mo'],
  ['Год', 'Year']
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const msToMinutes = (ms) => Math.floor((Number(ms) || 0) / 60000);

const formatDuration = (ms, langIndex, empty = '-') => {
  if (!ms || ms <= 0) return empty;
  const totalMin = msToMinutes(ms);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return langIndex === 0 ? `${h} ч ${m} м` : `${h}h ${m}m`;
};

const formatClock = (ms) => {
  if (typeof ms !== 'number' || Number.isNaN(ms)) return '--:--';
  const normalized = ((ms % DAY_MS) + DAY_MS) % DAY_MS;
  const totalMinutes = Math.floor(normalized / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const toDate = (iso) => new Date(`${iso}T12:00:00`);

const formatDate = (iso, langIndex, long = false) => toDate(iso).toLocaleDateString(langIndex === 0 ? 'ru-RU' : 'en-US', {
  day: 'numeric',
  month: long ? 'long' : 'short'
});

const formatChartDate = (iso) => {
  const [year, month, day] = `${iso}`.split('-');
  if (!year || !month || !day) return iso;
  return `${day}.${month}`;
};

const getWakeMs = (entry) => {
  if (typeof entry?.bedtime !== 'number' || typeof entry?.duration !== 'number') return null;
  return (entry.bedtime + entry.duration) % DAY_MS;
};

const averageClockMs = (values) => {
  const clean = values.filter((value) => typeof value === 'number' && !Number.isNaN(value));
  if (!clean.length) return null;
  const vector = clean.reduce((acc, value) => {
    const angle = (value / DAY_MS) * Math.PI * 2;
    return {
      sin: acc.sin + Math.sin(angle),
      cos: acc.cos + Math.cos(angle)
    };
  }, { sin: 0, cos: 0 });
  const angle = Math.atan2(vector.sin / clean.length, vector.cos / clean.length);
  return ((angle < 0 ? angle + Math.PI * 2 : angle) / (Math.PI * 2)) * DAY_MS;
};

const circularDistance = (a, b) => {
  const diff = Math.abs(a - b);
  return Math.min(diff, DAY_MS - diff);
};

const getMoodColor = (theme, mood) => {
  const cols = [
    Colors.get('veryBad', theme),
    Colors.get('bad', theme),
    Colors.get('normal', theme),
    Colors.get('good', theme),
    Colors.get('perfect', theme)
  ];
  return cols[Math.max(0, Math.min(4, Math.round(mood) - 1))] || Colors.get('subText', theme);
};

const getMoodLabel = (mood, langIndex) => {
  if (!mood) return langIndex === 0 ? 'нет оценки' : 'no score';
  if (mood >= 4.5) return langIndex === 0 ? 'отлично' : 'great';
  if (mood >= 3.7) return langIndex === 0 ? 'хорошо' : 'good';
  if (mood >= 2.8) return langIndex === 0 ? 'нормально' : 'okay';
  if (mood >= 1.8) return langIndex === 0 ? 'тяжело' : 'rough';
  return langIndex === 0 ? 'плохо' : 'bad';
};

const getSleepSummary = (entries, previousEntries, periodDays) => {
  if (!entries.length) {
    return {
      avg: 0,
      best: null,
      count: 0,
      moodAvg: 0,
      avgBedtime: null,
      avgWake: null,
      goalPct: 0,
      fillPct: 0,
      consistencyPct: 0,
      score: 0,
      trendMs: 0,
      latest: null
    };
  }

  const durations = entries.map((item) => item.durationMs).filter((value) => value > 0);
  const avg = durations.reduce((sum, value) => sum + value, 0) / durations.length;
  const moodEntries = entries.map((item) => item.mood).filter((value) => value > 0);
  const moodAvg = moodEntries.length ? moodEntries.reduce((sum, value) => sum + value, 0) / moodEntries.length : 0;
  const avgBedtime = averageClockMs(entries.map((item) => item.bedtime));
  const avgWake = averageClockMs(entries.map((item) => item.wakeMs));
  const goalHits = entries.filter((item) => item.durationMs >= 7 * HOUR_MS && item.durationMs <= 9.5 * HOUR_MS).length;
  const fillPct = Math.round((entries.length / periodDays) * 100);
  const consistencyBase = avgWake ?? avgBedtime;
  const consistencyValues = entries
    .map((item) => avgWake !== null ? item.wakeMs : item.bedtime)
    .filter((value) => typeof value === 'number');
  const consistentDays = consistencyBase !== null && consistencyValues.length
    ? consistencyValues.filter((value) => circularDistance(value, consistencyBase) <= 75 * 60000).length
    : 0;
  const consistencyPct = consistencyValues.length ? Math.round((consistentDays / consistencyValues.length) * 100) : 0;
  const previousDurations = previousEntries.map((item) => item.durationMs).filter((value) => value > 0);
  const previousAvg = previousDurations.length
    ? previousDurations.reduce((sum, value) => sum + value, 0) / previousDurations.length
    : 0;
  const durationScore = clamp(100 - Math.abs(avg - TARGET_SLEEP_MS) / HOUR_MS * 13, 0, 100);
  const moodScore = moodAvg ? (moodAvg / 5) * 100 : 55;
  const coverageScore = clamp((entries.length / Math.min(periodDays, 14)) * 100, 0, 100);
  const score = Math.round(durationScore * 0.45 + consistencyPct * 0.25 + moodScore * 0.2 + coverageScore * 0.1);

  return {
    avg,
    best: entries.reduce((best, item) => (!best || item.durationMs > best.durationMs ? item : best), null),
    count: entries.length,
    moodAvg,
    avgBedtime,
    avgWake,
    goalPct: Math.round((goalHits / entries.length) * 100),
    fillPct: Math.min(fillPct, 100),
    consistencyPct,
    score,
    trendMs: previousAvg ? avg - previousAvg : 0,
    latest: entries[entries.length - 1]
  };
};

const PeriodSelector = ({ selectedIndex, setSelectedIndex, theme, langIndex, accent }) => {
  const s = styles(theme, accent);
  return (
    <div style={s.segmentedControl}>
      {PERIOD_LABELS.map((label, index) => {
        const isActive = selectedIndex === index;
        return (
          <motion.button
            type="button"
            key={label[0]}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedIndex(index)}
            style={s.segmentButton(isActive)}
          >
            {isActive && <motion.span layoutId="sleepPeriodActive" style={s.segmentActiveBg} />}
            <span style={s.segmentLabel}>{label[langIndex]}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

const MetricCard = ({ icon, label, value, hint, theme, accent, tone }) => {
  const s = styles(theme, accent);
  return (
    <div style={s.metricCard}>
      <div style={s.metricIcon(tone || accent.hue)}>{icon}</div>
      <div style={s.metricCopy}>
        <div style={s.metricLabel}>{label}</div>
        <div style={s.metricValue}>{value}</div>
        {hint && <div style={s.metricHint}>{hint}</div>}
      </div>
    </div>
  );
};

const EmptyAnalytics = ({ langIndex, theme, accent }) => {
  const s = styles(theme, accent);
  return (
    <div style={s.emptyBox}>
      <div style={s.emptyIcon}><MdBedtime /></div>
      <div style={s.emptyTitle}>{langIndex === 0 ? 'Нет записей сна за период' : 'No sleep records in this period'}</div>
      <div style={s.emptyText}>
        {langIndex === 0
          ? 'Добавьте хотя бы 3-7 ночей: тогда появятся средний сон, режим, самочувствие и тренд.'
          : 'Add at least 3-7 nights to unlock average sleep, rhythm, mood, and trend.'}
      </div>
      <button type="button" onClick={() => setPage('SleepNew')} style={s.emptyButton}>
        <MdAdd />
        <span>{langIndex === 0 ? 'Добавить запись' : 'Add record'}</span>
      </button>
    </div>
  );
};

const SleepRow = ({ item, langIndex, theme, accent }) => {
  const s = styles(theme, accent);
  const moodColor = item.mood ? getMoodColor(theme, item.mood) : Colors.get('subText', theme);
  return (
    <div style={s.historyItem}>
      <div style={s.datePill}>
        <span>{formatDate(item.date, langIndex)}</span>
      </div>
      <div style={s.historyCenter}>
        <div style={s.historyMain}>
          {formatDuration(item.durationMs, langIndex)}
          <span style={s.historyTimes}>{formatClock(item.bedtime)} - {formatClock(item.wakeMs)}</span>
        </div>
        {item.note && <div style={s.historyNote}>{item.note}</div>}
      </div>
      <div style={{ ...s.moodPill, color: moodColor, borderColor: `${moodColor}55`, background: `${moodColor}18` }}>
        <MdOutlineStarBorder />
        <span>{item.mood || '-'}</span>
      </div>
    </div>
  );
};

const SleepMetrics = () => {
  const [theme, setThemeState] = useState(theme$.value);
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [hasPremium, setHasPremium] = useState(UserData.hasPremium);
  const [periodIndex, setPeriodIndex] = useState(0);

  useEffect(() => {
    const themeSub = theme$.subscribe(setThemeState);
    const langSub = lang$.subscribe(value => setLangIndex(value === 'ru' ? 0 : 1));
    const fSizeSub = fontSize$.subscribe(setFSize);
    const premiumSub = premium$.subscribe(setHasPremium);
    return () => {
      themeSub.unsubscribe();
      langSub.unsubscribe();
      fSizeSub.unsubscribe();
      premiumSub.unsubscribe();
    };
  }, []);

  const accent = useMemo(() => buildSleepAccent(AppData.sleepAccentColor || '#6F7DFF'), []);
  const s = styles(theme, accent, fSize);

  const sleepData = useMemo(() => Object.entries(AppData.sleepingLog || {})
    .map(([date, entry]) => ({
      date,
      durationMs: Number(entry?.duration) || 0,
      bedtime: typeof entry?.bedtime === 'number' ? entry.bedtime : null,
      wakeMs: getWakeMs(entry),
      mood: Number(entry?.mood) || 0,
      note: entry?.note || ''
    }))
    .filter((item) => item.durationMs > 0)
    .sort((a, b) => toDate(a.date) - toDate(b.date)), []);

  const { filteredData, previousData } = useMemo(() => {
    const periodDays = PERIOD_DAYS[periodIndex];
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - periodDays + 1);
    const previousCutoff = new Date(cutoff);
    previousCutoff.setDate(previousCutoff.getDate() - periodDays);

    return {
      filteredData: sleepData.filter((item) => toDate(item.date) >= cutoff),
      previousData: sleepData.filter((item) => toDate(item.date) >= previousCutoff && toDate(item.date) < cutoff)
    };
  }, [sleepData, periodIndex]);

  const stats = useMemo(
    () => getSleepSummary(filteredData, previousData, PERIOD_DAYS[periodIndex]),
    [filteredData, previousData, periodIndex]
  );

  const chartData = useMemo(() => filteredData.map((item) => ({
    date: formatChartDate(item.date),
    ms: item.durationMs,
    mood: item.mood || 3
  })), [filteredData]);

  const trendText = stats.trendMs
    ? `${stats.trendMs > 0 ? '+' : ''}${formatDuration(Math.abs(stats.trendMs), langIndex)}`
    : (langIndex === 0 ? 'нет сравнения' : 'no comparison');
  const trendColor = stats.trendMs >= 0 ? Colors.get('perfect', theme) : Colors.get('bad', theme);
  const moodColor = getMoodColor(theme, stats.moodAvg || 3);

  return (
    <div style={s.page}>
      <div style={s.shell}>
        <header style={s.header}>
          <div style={s.titleIcon}><MdInsights /></div>
          <div>
            <div style={s.eyebrow}>{langIndex === 0 ? 'Раздел сна' : 'Sleep section'}</div>
            <h1 style={s.title}>{langIndex === 0 ? 'Аналитика сна' : 'Sleep analytics'}</h1>
          </div>
        </header>

        <PeriodSelector
          selectedIndex={periodIndex}
          setSelectedIndex={setPeriodIndex}
          theme={theme}
          langIndex={langIndex}
          accent={accent}
        />

        <main style={s.content}>
          <section style={s.heroCard(stats.count > 0)}>
            <div style={s.heroGlow} />
            {stats.count > 0 && (
              <div style={s.scoreRing(stats.score)}>
                <div style={s.scoreValue}>{stats.score}</div>
                <div style={s.scoreLabel}>{langIndex === 0 ? 'балл' : 'score'}</div>
              </div>
            )}
            <div style={s.heroCopy}>
              {stats.count === 0 && <div style={s.heroEmptyIcon}><MdBedtime /></div>}
              <div style={s.heroTitle}>
                {stats.count
                  ? (stats.score >= 80
                    ? (langIndex === 0 ? 'Стабильный сон' : 'Stable sleep')
                    : stats.score >= 60
                      ? (langIndex === 0 ? 'Есть база для режима' : 'There is a base')
                      : (langIndex === 0 ? 'Режим нужно собрать' : 'Build the rhythm'))
                  : (langIndex === 0 ? 'Данные еще не собраны' : 'Data is not collected yet')}
              </div>
              <div style={s.heroText}>
                {stats.count
                  ? `${langIndex === 0 ? 'Средний сон' : 'Average'} ${formatDuration(stats.avg, langIndex)}, ${langIndex === 0 ? 'регулярность' : 'consistency'} ${stats.consistencyPct}%, ${langIndex === 0 ? 'цель' : 'goal'} ${stats.goalPct}%.`
                  : (langIndex === 0 ? 'После нескольких записей здесь появится короткая оценка режима.' : 'After a few records, this area will show a compact rhythm score.')}
              </div>
              {stats.count > 0 && (
                <div style={s.heroChips}>
                  <span style={s.heroChip}><MdOutlineCalendarMonth />{stats.count} {langIndex === 0 ? 'записей' : 'records'}</span>
                  <span style={{ ...s.heroChip, color: trendColor, borderColor: `${trendColor}44` }}><MdOutlineShowChart />{trendText}</span>
                </div>
              )}
            </div>
          </section>

          <section style={s.metricGrid}>
            <MetricCard
              icon={<MdNightsStay />}
              label={langIndex === 0 ? 'Средний сон' : 'Average sleep'}
              value={formatDuration(stats.avg, langIndex)}
              hint={`${stats.goalPct}% ${langIndex === 0 ? 'в цели 7-9.5 ч' : 'in 7-9.5h goal'}`}
              theme={theme}
              accent={accent}
            />
            <MetricCard
              icon={<MdOutlineTrackChanges />}
              label={langIndex === 0 ? 'Регулярность' : 'Consistency'}
              value={`${stats.consistencyPct}%`}
              hint={langIndex === 0 ? 'по времени подъема' : 'by wake time'}
              theme={theme}
              accent={accent}
            />
            <MetricCard
              icon={<MdBedtime />}
              label={langIndex === 0 ? 'Отбой' : 'Bedtime'}
              value={formatClock(stats.avgBedtime)}
              hint={langIndex === 0 ? 'среднее время' : 'average time'}
              theme={theme}
              accent={accent}
            />
            <MetricCard
              icon={<MdWbSunny />}
              label={langIndex === 0 ? 'Подъем' : 'Wake'}
              value={formatClock(stats.avgWake)}
              hint={stats.latest ? `${langIndex === 0 ? 'последний' : 'last'} ${formatDate(stats.latest.date, langIndex)}` : ''}
              theme={theme}
              accent={accent}
            />
            <MetricCard
              icon={<MdOutlineStarBorder />}
              label={langIndex === 0 ? 'Самочувствие' : 'Mood'}
              value={stats.moodAvg ? stats.moodAvg.toFixed(1) : '-'}
              hint={getMoodLabel(stats.moodAvg, langIndex)}
              theme={theme}
              accent={accent}
              tone={moodColor}
            />
            <MetricCard
              icon={<MdOutlineFlag />}
              label={langIndex === 0 ? 'Лучший день' : 'Best day'}
              value={stats.best ? formatDuration(stats.best.durationMs, langIndex) : '-'}
              hint={stats.best ? formatDate(stats.best.date, langIndex, true) : ''}
              theme={theme}
              accent={accent}
            />
          </section>

          <section style={s.chartCard}>
            <div style={s.sectionTop}>
              <div>
                <div style={s.sectionTitle}>{langIndex === 0 ? 'Динамика' : 'Dynamics'}</div>
                <div style={s.sectionSubtitle}>{langIndex === 0 ? 'Длительность сна и самочувствие' : 'Sleep duration and mood'}</div>
              </div>
              <div style={s.countBadge}>{stats.fillPct}%</div>
            </div>
            {chartData.length ? (
              <MyBarChart
                data={chartData}
                theme={theme}
                textColor={Colors.get('subText', theme)}
                linesColor={Colors.get('border', theme)}
                backgroundColor="transparent"
                height={220}
              />
            ) : (
              <EmptyAnalytics langIndex={langIndex} theme={theme} accent={accent} />
            )}
          </section>

          <section style={s.historySection}>
            <div style={s.sectionTop}>
              <div style={s.historyTitle}>
                <MdHistory />
                <span>{langIndex === 0 ? 'История' : 'History'}</span>
              </div>
              <span style={s.sectionSubtitle}>{stats.count} {langIndex === 0 ? 'записей' : 'records'}</span>
            </div>
            <div style={s.historyList}>
              {filteredData.length ? (
                filteredData.slice().reverse().slice(0, 12).map((item) => (
                  <SleepRow key={item.date} item={item} langIndex={langIndex} theme={theme} accent={accent} />
                ))
              ) : (
                <div style={s.emptyHistory}>{langIndex === 0 ? 'История появится после первой записи.' : 'History will appear after the first record.'}</div>
              )}
            </div>
          </section>
        </main>
      </div>

      {!hasPremium && (
        <div onClick={(event) => event.stopPropagation()} style={s.premiumOverlay}>
          <div style={s.premiumIcon}><FaCrown size={30} /></div>
          <div style={s.premiumText}>
            {langIndex === 0 ? 'Откройте полный доступ ко всей статистике' : 'Unlock full access to all statistics'}
          </div>
          <button onClick={() => setPage('premium')} style={s.premiumButton}>
            {langIndex === 0 ? 'Купить подписку' : 'Buy subscription'}
          </button>
          <button onClick={() => setPage('MainMenu')} style={s.premiumBack}>
            {langIndex === 0 ? 'На главную' : 'Home'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SleepMetrics;

const styles = (theme, accent, fSize = 0) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  const bg = Colors.get('background', theme);
  const text = Colors.get('mainText', theme);
  const sub = Colors.get('subText', theme);
  const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)';
  const panel = isLight ? 'rgba(255,255,255,0.84)' : 'rgba(255,255,255,0.045)';
  const panelStrong = isLight ? 'rgba(255,255,255,0.94)' : 'rgba(22,25,30,0.9)';

  return {
    page: {
      minHeight: '100dvh',
      width: '100vw',
      display: 'flex',
      justifyContent: 'center',
      background: isLight
        ? `linear-gradient(180deg, ${accent.faint} 0%, ${bg} 40%)`
        : `linear-gradient(180deg, rgba(${accent.rgb.r},${accent.rgb.g},${accent.rgb.b},0.12) 0%, ${bg} 42%)`,
      color: text,
      fontFamily: 'Segoe UI, sans-serif',
      overflow: 'hidden',
      position: 'relative'
    },
    shell: {
      width: '100%',
      maxWidth: 560,
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      overflow: 'hidden'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: 'calc(env(safe-area-inset-top, 0px) + 22px) 20px 14px',
      flexShrink: 0
    },
    titleIcon: {
      width: 48,
      height: 48,
      borderRadius: 17,
      background: accent.soft,
      border: `1px solid ${accent.ring}`,
      color: accent.hue,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 26,
      flexShrink: 0
    },
    eyebrow: {
      color: accent.hue,
      fontSize: 11,
      fontWeight: 950,
      textTransform: 'uppercase',
      marginBottom: 3
    },
    title: {
      margin: 0,
      color: text,
      fontSize: fSize === 0 ? 27 : 30,
      lineHeight: 1.05,
      fontWeight: 950,
      letterSpacing: 0
    },
    segmentedControl: {
      margin: '0 20px 16px',
      padding: 5,
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: 4,
      borderRadius: 18,
      background: panel,
      border: `1px solid ${border}`,
      flexShrink: 0
    },
    segmentButton: (active) => ({
      position: 'relative',
      minWidth: 0,
      height: 44,
      border: 'none',
      borderRadius: 14,
      background: 'transparent',
      color: active ? text : sub,
      fontSize: 13,
      fontWeight: active ? 900 : 760,
      fontFamily: 'inherit',
      cursor: 'pointer',
      overflow: 'hidden'
    }),
    segmentActiveBg: {
      position: 'absolute',
      inset: 0,
      borderRadius: 14,
      background: isLight ? '#fff' : 'rgba(255,255,255,0.08)',
      border: `1px solid ${accent.ring}`,
      boxShadow: `0 12px 30px -24px ${accent.hue}`
    },
    segmentLabel: {
      position: 'relative',
      zIndex: 1
    },
    content: {
      flex: 1,
      overflowY: 'auto',
      padding: '0 20px calc(116px + env(safe-area-inset-bottom, 0px))',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      scrollbarWidth: 'none'
    },
    heroCard: (hasData) => ({
      position: 'relative',
      overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: hasData ? '92px minmax(0, 1fr)' : 'minmax(0, 1fr)',
      gap: hasData ? 15 : 10,
      alignItems: 'center',
      justifyItems: hasData ? 'stretch' : 'center',
      minHeight: hasData ? 124 : 156,
      borderRadius: 26,
      padding: hasData ? 16 : '22px 18px',
      background: `linear-gradient(135deg, ${panelStrong}, ${accent.faint})`,
      border: `1px solid ${accent.ring}`,
      boxShadow: isLight ? `0 24px 56px -44px ${accent.hue}` : '0 24px 62px rgba(0,0,0,0.28)',
      textAlign: hasData ? 'left' : 'center',
      boxSizing: 'border-box'
    }),
    heroGlow: {
      position: 'absolute',
      right: -64,
      top: -72,
      width: 150,
      height: 150,
      borderRadius: '50%',
      background: accent.soft,
      filter: 'blur(14px)',
      opacity: 0.8
    },
    scoreRing: (score) => ({
      position: 'relative',
      zIndex: 1,
      width: 92,
      height: 92,
      borderRadius: '50%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: `conic-gradient(${accent.hue} 0deg, ${accent.hue} ${Math.round(clamp(score || 0, 0, 100) * 3.6)}deg, ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)'} ${Math.round(clamp(score || 0, 0, 100) * 3.6)}deg 360deg)`,
      boxShadow: `0 0 30px ${accent.soft}`
    }),
    scoreValue: {
      width: 72,
      height: 72,
      borderRadius: '50%',
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: text,
      fontSize: 27,
      fontWeight: 950,
      fontVariantNumeric: 'tabular-nums'
    },
    scoreLabel: {
      position: 'absolute',
      bottom: 14,
      color: sub,
      fontSize: 8,
      fontWeight: 900,
      textTransform: 'uppercase'
    },
    heroCopy: {
      position: 'relative',
      zIndex: 1,
      minWidth: 0
    },
    heroEmptyIcon: {
      width: 50,
      height: 50,
      margin: '0 auto 12px',
      borderRadius: 18,
      background: accent.soft,
      border: `1px solid ${accent.ring}`,
      color: accent.hue,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 28
    },
    heroTitle: {
      color: text,
      fontSize: 18,
      lineHeight: 1.16,
      fontWeight: 950,
      marginBottom: 7
    },
    heroText: {
      color: sub,
      fontSize: 12,
      lineHeight: 1.38,
      fontWeight: 720
    },
    heroChips: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 7,
      marginTop: 11
    },
    heroChip: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '6px 9px',
      borderRadius: 999,
      color: accent.hue,
      background: accent.soft,
      border: `1px solid ${accent.ring}`,
      fontSize: 10,
      fontWeight: 900
    },
    metricGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: 10
    },
    metricCard: {
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: 20,
      background: panel,
      border: `1px solid ${border}`
    },
    metricIcon: (color) => ({
      width: 38,
      height: 38,
      borderRadius: 14,
      background: `${color}1F`,
      border: `1px solid ${color}44`,
      color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 21,
      flexShrink: 0
    }),
    metricCopy: {
      minWidth: 0,
      flex: 1
    },
    metricLabel: {
      color: sub,
      fontSize: 9,
      lineHeight: 1.15,
      fontWeight: 950,
      textTransform: 'uppercase'
    },
    metricValue: {
      color: text,
      fontSize: 17,
      lineHeight: 1.12,
      fontWeight: 950,
      marginTop: 4,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap'
    },
    metricHint: {
      color: sub,
      fontSize: 10,
      lineHeight: 1.2,
      marginTop: 4,
      fontWeight: 720,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    chartCard: {
      borderRadius: 24,
      padding: 16,
      background: panel,
      border: `1px solid ${border}`
    },
    sectionTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 12
    },
    sectionTitle: {
      color: text,
      fontSize: 17,
      fontWeight: 950,
      lineHeight: 1.1
    },
    sectionSubtitle: {
      color: sub,
      fontSize: 11,
      fontWeight: 750,
      marginTop: 4
    },
    countBadge: {
      padding: '6px 10px',
      borderRadius: 999,
      background: accent.soft,
      border: `1px solid ${accent.ring}`,
      color: accent.hue,
      fontSize: 11,
      fontWeight: 950,
      flexShrink: 0
    },
    emptyBox: {
      minHeight: 220,
      borderRadius: 20,
      background: isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.03)',
      border: `1px dashed ${accent.ring}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 18
    },
    emptyIcon: {
      width: 54,
      height: 54,
      borderRadius: 18,
      color: accent.hue,
      background: accent.soft,
      border: `1px solid ${accent.ring}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 28,
      marginBottom: 12
    },
    emptyTitle: {
      color: text,
      fontSize: 15,
      fontWeight: 950,
      marginBottom: 6
    },
    emptyText: {
      color: sub,
      fontSize: 12,
      lineHeight: 1.42,
      fontWeight: 700,
      maxWidth: 260
    },
    emptyButton: {
      marginTop: 14,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      border: 'none',
      borderRadius: 14,
      padding: '10px 14px',
      color: '#fff',
      background: accent.hue,
      fontSize: 12,
      fontWeight: 900,
      fontFamily: 'inherit'
    },
    historySection: {
      display: 'flex',
      flexDirection: 'column',
      gap: 9
    },
    historyTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: text,
      fontSize: 15,
      fontWeight: 950
    },
    historyList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 9
    },
    historyItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      borderRadius: 18,
      padding: 10,
      background: isLight ? 'rgba(255,255,255,0.74)' : 'rgba(255,255,255,0.035)',
      border: `1px solid ${border}`
    },
    datePill: {
      width: 54,
      minHeight: 42,
      borderRadius: 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      background: accent.soft,
      border: `1px solid ${accent.ring}`,
      color: accent.hue,
      fontSize: 10,
      fontWeight: 950,
      flexShrink: 0
    },
    historyCenter: {
      minWidth: 0,
      flex: 1
    },
    historyMain: {
      color: text,
      fontSize: 14,
      fontWeight: 950,
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      minWidth: 0,
      flexWrap: 'wrap'
    },
    historyTimes: {
      color: sub,
      fontSize: 11,
      fontWeight: 760
    },
    historyNote: {
      color: sub,
      fontSize: 11,
      lineHeight: 1.25,
      marginTop: 4,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    moodPill: {
      minWidth: 42,
      height: 32,
      borderRadius: 12,
      border: '1px solid',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      fontSize: 13,
      fontWeight: 950,
      flexShrink: 0
    },
    emptyHistory: {
      padding: 18,
      borderRadius: 18,
      color: sub,
      background: panel,
      border: `1px solid ${border}`,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: 760
    },
    premiumOverlay: {
      position: 'absolute',
      inset: 0,
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: isLight ? 'rgba(248,248,250,0.88)' : 'rgba(10,10,14,0.82)',
      backdropFilter: 'blur(20px)',
      textAlign: 'center'
    },
    premiumIcon: {
      width: 72,
      height: 72,
      background: accent.soft,
      borderRadius: 22,
      color: accent.hue,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      border: `1px solid ${accent.ring}`
    },
    premiumText: {
      fontSize: 13,
      lineHeight: 1.6,
      color: sub,
      marginBottom: 24,
      maxWidth: 220,
      fontWeight: 700
    },
    premiumButton: {
      fontSize: 15,
      fontWeight: 900,
      color: '#fff',
      background: accent.hue,
      border: 'none',
      borderRadius: 14,
      padding: '13px 0',
      marginBottom: 10,
      cursor: 'pointer',
      width: 220,
      boxShadow: `0 12px 28px -20px ${accent.hue}`
    },
    premiumBack: {
      fontSize: 13,
      fontWeight: 700,
      color: sub,
      background: 'transparent',
      border: 'none',
      padding: '8px 20px',
      cursor: 'pointer'
    }
  };
};
