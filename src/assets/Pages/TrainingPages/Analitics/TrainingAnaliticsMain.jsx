import React,  { useState, useEffect } from 'react';
import { AppData, UserData } from '../../../StaticClasses/AppData';
import Colors from '../../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, premium$, setPage } from '../../../StaticClasses/HabitsBus';
import LoadDonut from './LoadDonut';
import { VolumeTabs } from '../../../Helpers/TrainingAnaliticsTabs';
import TrainingAnaliticsMuscles from './TrainingAnaliticsMuscles';
import TrainingAnaliticsRM from './TrainingAnaliticsRM';
import {FaInfo} from "react-icons/fa"

const TrainingAnaliticsMain = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [tab, setTab] = React.useState('volume');
  const [hasPremium, setHasPremium] = useState(UserData.hasPremium);
  const [date, setDate] = useState(new Date());
  const [targetTonnage, setTargetTonnage] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0); 
  const [donutData, setDonutData] = useState([{ value: 0 }, { value: 0 }, { value: 0 }]);
  const [totalTonnage, setTotalTonnage] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
   const [showInfo,setShowInfo] = useState(false);

  // Subscriptions
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

  useEffect(() => {
  const analysis = getCurrentCycleAnalysis();
  const { currentCycle, targetTonnage, currentTonnage } = analysis;

  // Update donut: categorize current cycle sessions by load
  const loadRange = getLoadRange();
  let light = 0, medium = 0, heavy = 0;

  currentCycle.forEach(session => {
    const load = session.tonnage / (session.duration / 60000);
    if (load < loadRange.min) light++;
    else if (load <= loadRange.max) medium++;
    else heavy++;
  });
  setTargetTonnage(analysis.targetTonnage);
  setProgressPercent(analysis.progressPercent);
  setDonutData([{ value: light }, { value: medium }, { value: heavy }]);
  setTotalTonnage(currentTonnage);
  setSessionCount(currentCycle.length);

  // 💡 Optional: store targetTonnage in state to show in UI
  // setTargetTonnage(targetTonnage);
  // setProgressPercent(analysis.progressPercent);
}, []); 

  return (
    <div style={styles(theme).container}>
      {/* Tabs */}
      <VolumeTabs type={0} theme={theme} langIndex={langIndex} activeTab={tab} onChange={setTab}/>
      {tab === 'volume' && <div style={{width:'100%',display:'flex',height:'90%',alignItems:'center',justifyContent:'space-around',flexDirection:'column'}}>
     <div style={{...styles(theme,fSize).text,marginTop:'20px'}}>{langIndex === 0 ? 'Текущий тренировочный цикл' : 'Current training cycle'}</div>
      {/* Donut Chart */}
      {Object.keys(AppData.trainingLog).length > 1  ? <LoadDonut data={donutData} theme={theme} totalTonnage={totalTonnage} sessionCount={sessionCount} langIndex={langIndex}/>: <div style={styles(theme).panelRow}><div style={styles(theme,fSize).text}>{langIndex === 0 ? 'Нет данных' : 'No data'}</div></div>}
      {/* Needed Tonnage */}
      <Tonnage theme={theme} langIndex={langIndex} totalTonnage={totalTonnage} targetTonnage={targetTonnage} progressPercent={progressPercent}/>
      <InfoText theme={theme} langIndex={langIndex}/>
     </div>}

     {tab === 'muscles' && <div style={{width:'100%',display:'flex',height:'90%',alignItems:'center',justifyContent:'space-around',flexDirection:'column'}}>
     <div style={{...styles(theme,fSize).text,marginTop:'20px'}}>{langIndex === 0 ? 'Загрузка мышечных групп' : 'Muscle load'}
      <FaInfo onClick={() => setShowInfo(true)} style={{...styles(theme,fSize).icon , marginLeft  : '10px'}}/>
     </div>
       <TrainingAnaliticsMuscles/>
     </div>}
     {tab === 'exercises' && <div style={{width:'100%',display:'flex',height:'90%',alignItems:'center',justifyContent:'space-around',flexDirection:'column'}}>
       <TrainingAnaliticsRM/>
     </div>}
      {/* Premium Overlay */}
      {!hasPremium && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: '170vw',
            top: '15.5%',
            borderRadius: '24px',
            backdropFilter: 'blur(12px)',
            zIndex: 2
          }}
        >
          <p style={{ ...styles(theme, fSize).text, textAlign: 'center' }}>
            {langIndex === 0 ? 'Детальная статистика тренировок 📊' : 'Detailed training statistics 📊'}
          </p>
          <p style={{ ...styles(theme, fSize).text, textAlign: 'center' }}>
            {langIndex === 0 ? 'Персональные рекомендации на основании тренировок' : 'Personal recommendations based on your trainings'}
          </p>
          <p style={{ ...styles(theme, fSize).text, textAlign: 'center' }}>
            {langIndex === 0
              ? 'Отслеживайте прогресс в упражнениях, анализируйте недельную нагрузку и достигайте целей быстрее!'
              : 'Track your exercise progress, analyze weekly workload, and hit your goals faster!'}
          </p>
          <p style={{ ...styles(theme, fSize).text, textAlign: 'center' }}>
            {langIndex === 0
              ? '✨ Перейдите на Premium, чтобы получить полный доступ к аналитике!'
              : '✨ Upgrade to Premium for full access to advanced analytics!'}
          </p>
          <p style={{ ...styles(theme, fSize).text }}>
            {langIndex === 0 ? '👑 Только для премиум пользователей 👑' : '👑 Only for premium users 👑'}
          </p>
          <button onClick={() => setPage('premium')} style={{ ...styles(theme, fSize).btn, margin: '10px' }}>
            {langIndex === 0 ? 'Стать премиум' : 'Get premium'}
          </button>
        </div>
      )}
      {showInfo && <div onClick={() => setShowInfo(false)} style={{width:'100vw',top:0,height:'100vh',position:'absolute',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9000,backgroundColor:'rgba(0,0,0,0.6)'}}>
        <div style={{width:'90%',height:'50%',backgroundColor:Colors.get('background', theme),borderRadius:'24px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-around'}}>
          <div style={{...styles(theme,fSize).text,margin:'10px',whiteSpace:'pre-wrap'}}>{infoText(langIndex)}</div>
          <div style={{...styles(theme,fSize).subtext,margin:'10px',textAlign:'center'}}>{langIndex === 0 ? '!нажми чтобы закрыть!' : '!tap to close!'}</div>
        </div>
     </div>}
    </div>
  );
};

export default TrainingAnaliticsMain;


const styles = (theme,fSize) =>
({
    container :
   {
    display:'flex',
    width: "100vw",
    flexDirection:'column',
    overflowY:'scroll',
    overflowX:'hidden',
    justifyContent: "flex-start",
    alignItems:'center',
    backgroundColor:Colors.get('background', theme),
    height: "78vh",
    top:'16vh',
    paddingTop:'10px'
  },
  select :
  {
    width:'65%',
    height:'40px',
    padding:'10px',
    marginTop:'10px',
    alignSelf:'center',
    color:Colors.get('mainText', theme),
    backgroundColor:Colors.get('background', theme),
    fontSize:fSize === 0 ? '13px' : '15px',
    borderTop:'none',
    borderLeft:'none',
    borderRight:'none',
    borderBottom:`1px solid ${Colors.get('icons', theme)}`,
  },
  panelRow:
  {
    display:'flex',
    width:'100%',
    alignItems:'center',
    justifyContent:'center',
    marginTop:'10px',
    gap:'10px',
  },
  text :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '13px' : '15px',
    color: Colors.get('mainText', theme)
  },
  subtext :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '11px' : '13px',
    color: Colors.get('subText', theme)
  },
  icon:
  {
    fontSize: '18px',
    color: Colors.get('icons', theme)
  }
})

function getLoadRange() {
  const sessions = Object.values(AppData.trainingLog)
    .flat() // because trainingLog[date] = [session1, session2, ...]
    .filter(
      session =>
        session?.completed &&
        session.tonnage > 0 &&
        session.duration > 0
    );

  if (sessions.length === 0) return { min: 0, max: 0 };

  // Load = tonnage (kg) per minute
  const loads = sessions.map(session => session.tonnage / (session.duration / 60000));

  const avgLoad = loads.reduce((sum, load) => sum + load, 0) / loads.length;
  const variance = loads.reduce((sum, load) => sum + Math.pow(load - avgLoad, 2), 0) / loads.length;
  const sdLoad = Math.sqrt(variance);

  // Define "medium" intensity as ±0.5 SD around mean
  const min = Math.max(0, avgLoad - 0.5 * sdLoad); // Never negative
  const max = avgLoad + 0.5 * sdLoad;

  return { min, max };
}
function getNeededTonnage() {
  const allSessions = Object.values(AppData.trainingLog)
    .flat()
    .filter(
      session =>
        session?.completed &&
        typeof session.tonnage === 'number' &&
        session.tonnage > 0
    );

  if (allSessions.length === 0) return 0;

  const tonnages = allSessions.map(s => s.tonnage).sort((a, b) => a - b);
  const mid = Math.floor(tonnages.length / 2);
  let medianTonnage;

  if (tonnages.length % 2 === 0) {
    medianTonnage = (tonnages[mid - 1] + tonnages[mid]) / 2;
  } else {
    medianTonnage = tonnages[mid];
  }
  const aimTonnage = medianTonnage * 1.05;

  return aimTonnage;
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getWeeklySessions(targetDate, trainingLog) {
  const targetYear = targetDate.getFullYear();
  const targetWeek = getWeekNumber(targetDate);

  let weeklySessions = [];

  for (const [dateKey, sessions] of Object.entries(trainingLog)) {
    const sessionDate = new Date(dateKey);
    if (
      sessionDate.getFullYear() === targetYear &&
      getWeekNumber(sessionDate) === targetWeek
    ) {
      weeklySessions.push(...(Array.isArray(sessions) ? sessions : []));
    }
  }
  console.log(JSON.stringify(weeklySessions))
  return weeklySessions.filter(
    s => s?.completed && typeof s.tonnage === 'number' && s.tonnage > 0 && s.duration > 0
  );
}
function getAllSessionsChronological() {
  const sessions = [];
  for (const [dateKey, daySessions] of Object.entries(AppData.trainingLog)) {
    const dayList = Array.isArray(daySessions) ? daySessions : Object.values(daySessions);
    for (const session of dayList) {
      if (session?.completed && session.tonnage > 0 && session.duration > 0) {
        sessions.push({
          ...session,
          dateKey,
          date: new Date(dateKey)
        });
      }
    }
  }
  return sessions.sort((a, b) => a.startTime - b.startTime); // oldest → newest
}
function getLastProgramCycle() {
  const allSessions = getAllSessionsChronological();
  if (allSessions.length === 0) return [];

  // Start from the last session
  const lastSession = allSessions[allSessions.length - 1];
  const targetProgramId = lastSession.programId;

  // Walk backward while programId matches and sessions are in reasonable time window
  const cycle = [];
  let i = allSessions.length - 1;

  while (i >= 0) {
    const session = allSessions[i];
    if (session.programId !== targetProgramId) break;

    cycle.unshift(session); // prepend to keep chronological order

    // Optional: stop if gap > 10 days (avoids pulling in old cycles)
    if (i > 0) {
      const prevSession = allSessions[i - 1];
      const dayDiff = (session.date - prevSession.date) / (1000 * 60 * 60 * 24);
      if (dayDiff > 10) break; // likely a new cycle
    }

    i--;
  }

  return cycle;
}
function getLatestProgramSessions() {
  // Get all sessions
  const allSessions = [];
  for (const [dateKey, dayData] of Object.entries(AppData.trainingLog)) {
    const sessions = Array.isArray(dayData) ? dayData : Object.values(dayData);
    for (const s of sessions) {
      if (s?.completed && s.tonnage > 0 && s.duration > 0) {
        allSessions.push({
          ...s,
          dateKey,
          date: new Date(dateKey)
        });
      }
    }
  }

  // Sort by date
  allSessions.sort((a, b) => a.date - b.date);

  if (allSessions.length === 0) return [];

  // Find latest programId
  const latestProgramId = allSessions[allSessions.length - 1].programId;

  // Filter only sessions from that program
  return allSessions.filter(s => s.programId === latestProgramId);
}

function splitIntoCycles(sessions) {
  if (sessions.length === 0) {
    return {
      currentCycle: [],
      lastFullCycle: []
    };
  }

  // Handle single-day programs (all dayIndex the same)
  const allSameDay = sessions.every(s => s.dayIndex === sessions[0].dayIndex);
  
  if (allSameDay) {
    // Each session = one cycle
    if (sessions.length === 1) {
      return {
        currentCycle: [sessions[0]],
        lastFullCycle: []
      };
    } else {
      return {
        currentCycle: [sessions[sessions.length - 1]],
        lastFullCycle: [sessions[sessions.length - 2]]
      };
    }
  }

  // Multi-day program: group by dayIndex reset
  const cycles = [];
  let currentCycle = [];
  let lastDayIndex = -1;

  for (const session of sessions) {
    if (session.dayIndex <= lastDayIndex) {
      // New cycle started
      if (currentCycle.length > 0) {
        cycles.push(currentCycle);
        currentCycle = [];
      }
    }
    currentCycle.push(session);
    lastDayIndex = session.dayIndex;
  }

  if (currentCycle.length > 0) {
    cycles.push(currentCycle);
  }

  // Now determine last full and current
  if (cycles.length === 1) {
    return {
      currentCycle: cycles[0],
      lastFullCycle: []
    };
  } else {
    return {
      currentCycle: cycles[cycles.length - 1],
      lastFullCycle: cycles[cycles.length - 2]
    };
  }
}
function getCurrentCycleAnalysis() {
  const latestSessions = getLatestProgramSessions();
  const { currentCycle, lastFullCycle } = splitIntoCycles(latestSessions);

  const currentTonnage = currentCycle.reduce((sum, s) => sum + s.tonnage, 0);
  const lastFullTonnage = lastFullCycle.reduce((sum, s) => sum + s.tonnage, 0);

  // Target = last full cycle + 5%
  const targetTonnage = lastFullTonnage > 0 ? lastFullTonnage * 1.05 : 0;

  // Progress % (cap at 100% if exceeded)
  const progressPercent = targetTonnage > 0
    ? Math.min(100, (currentTonnage / targetTonnage) * 100)
    : 0;

  return {
    currentCycle,
    lastFullCycle,
    currentTonnage,
    targetTonnage,
    progressPercent
  };
}

function InfoText({ theme, langIndex }) {
  const textContent = langIndex === 0
    ? `Анализ цикла основан на последней программе тренировок.

Цикл определяется автоматически:
— Для программ с одним днём — каждый сеанс считается отдельным циклом.
— Для программ с несколькими днями — цикл завершается, когда день в программе сбрасывается (например, после Дня 2 идёт День 0).

Объём цикла = сумма тоннажа всех сессий в цикле.

Цель = объём предыдущего полного цикла × 1.05 (рост на 5%).

Прогресс = (текущий объём / цель) × 100%, но не более 100%.

Тоннаж одного подхода = вес × повторения.
Общий тоннаж = сумма тоннажа всех подходов.`

    : `Cycle analysis is based on your latest training program.

Cycle detection works as follows:
— For single-day programs: each session is treated as its own cycle.
— For multi-day programs: a cycle ends when the program day resets (e.g., after Day 2 comes Day 0 again).

Cycle volume = total tonnage of all sessions in the current cycle.

Target = volume of the last complete cycle × 1.05 (5% increase).

Progress = (current volume / target) × 100%, capped at 100%.

Set tonnage = weight × reps.
Total tonnage = sum of all set tonnages.`;

  return (
    <div
      style={{
        ...styles(theme).subtext,
        fontSize: '10px',
        textAlign: 'center',
        lineHeight: 1.4,
        maxWidth: '90%',
        marginTop: '8px',
        opacity: 0.85,
      }}
    >
      {textContent}
    </div>
  );
}

const Tonnage = ({theme,langIndex,totalTonnage,targetTonnage,progressPercent}) => {
    return (
        <div style={styles(theme).panelRow}>
   <div
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 8,
  }}
>
  {/* Лейбл над числом */}
  <div
    style={{
      fontSize: 12,
      letterSpacing: 1,
      textTransform: 'uppercase',
      opacity: 0.8,
      color: Colors.get('subText', theme),
    }}
  >
    {langIndex === 0 ? 'Цель цикла' : 'Cycle target'}
  </div>

  {/* Огромное число */}
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: 6,
    }}
  >
    <span
      style={{
        fontSize: 40,
        fontWeight: 700,
        color: Colors.get('iconsHighlited', theme),
        lineHeight: 1,
      }}
    >
      {(targetTonnage / 1000).toFixed(1)}
    </span>
    
    <span
      style={{
        fontSize: 18,
        fontWeight: 500,
        color: Colors.get('mainText', theme),
        opacity: 0.9,
      }}
    >
      т
    </span>
    {progressPercent >= 100 && <span
      style={{
        fontSize: 16,
        position:'relative',
        top:'-15px',
        fontWeight: 500,
        color: Colors.get('light', theme)
      }}
    >
      {'+' + ((totalTonnage-targetTonnage)/1000).toFixed(1)}
    </span>}
  </div>

  {/* Подзаголовок со статусом */}
  {progressPercent > 0 ? (
    <div
      style={{
        fontSize: 13,
        color: Colors.get('subText', theme),
      }}
    >
      {langIndex === 0 ? 'Выполнено' : 'Completed'}{' '}
      <span
        style={{
          color: Colors.get('mainText', theme),
          fontWeight: 600,
        }}
      >
        {Math.round(progressPercent)}%
      </span>
      {progressPercent < 100 && (
        <>
          {' · '}
          <span style={{ opacity: 0.9 }}>
            {langIndex === 0
              ? `осталось ≈ ${(targetTonnage * (1 - progressPercent / 100) / 1000).toFixed(1)} т`
              : `left ≈ ${(targetTonnage * (1 - progressPercent / 100) / 1000).toFixed(1)} t`}
          </span>
        </>
      )}
    </div>
  ) : (
    <div
      style={{
        fontSize: 13,
        color: Colors.get('subText', theme),
      }}
    >
      {langIndex === 0
        ? `Рекомендованный объём: ${(getNeededTonnage() / 1000).toFixed(2)} т`
        : `Suggested load: ${(getNeededTonnage() / 1000).toFixed(2)} t`}
    </div>
  )}

  {/* Бэйдж, если цель добита */}
  {progressPercent >= 100 && (
    <div
      style={{
        marginTop: 4,
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        background:
          'linear-gradient(135deg, rgba(111,191,115,0.18), rgba(231,111,81,0.18))',
        color: Colors.get('iconsHighlited', theme),
      }}
    >
      {langIndex === 0 ? 'Цель достигнута' : 'Target reached'}
    </div>
  )}
</div>

  
</div>
    )
}

const infoText = (langIndex) => {
  if (langIndex === 0) {
    return `Нагрузка на мышцы рассчитывается на основе тоннажа выполненных упражнений за выбранный период. Для каждого упражнения:\n` +
           `— 70% тоннажа распределяется на основную мышечную группу,\n` +
           `— 30% — равномерно между второстепенными группами.\n` +
           `Затем значения нормализуются относительно самой нагруженной мышцы (100%).`;
  } else {
    return `Muscle load is calculated based on the tonnage of completed exercises over the selected period. For each exercise:\n` +
           `— 70% of the tonnage is assigned to the primary muscle group,\n` +
           `— 30% is evenly distributed among secondary muscle groups.\n` +
           `Values are then normalized relative to the most loaded muscle (100%).`;
  }
};