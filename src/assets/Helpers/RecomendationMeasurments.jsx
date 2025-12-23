import { useState, useEffect, useMemo } from 'react';
import { AppData } from '../StaticClasses/AppData.js';
import Colors from '../StaticClasses/Colors';
import { theme$, lang$, fontSize$ } from '../StaticClasses/HabitsBus';

// 0 – набор, 1 – похудение, 2 – поддержание (пример, подстрой под свою модель)
const GOALS_CONFIG = {
  gain: {
    id: 0,
    titleRu: 'Набор',
    titleEn: 'Gain',
    kcalMinFactor: 1.1,
    kcalMaxFactor: 1.15,
    macrosRu: '1.8–2.2 г / 1 г / 4–6 г',
    macrosEn: '1.8–2.2 g / 1 g / 4–6 g',
  },
  strength: {
    id: 1,
    titleRu: 'Набор',
    titleEn: 'Gain',
    kcalMinFactor: 1.1,
    kcalMaxFactor: 1.15,
    macrosRu: '1.8–2.2 г / 1 г / 4–6 г',
    macrosEn: '1.8–2.2 g / 1 g / 4–6 g',
  },
  cut: {
    id: 2,
    titleRu: 'Похудение',
    titleEn: 'Weight loss',
    kcalMinFactor: 0.85,
    kcalMaxFactor: 0.9,
    macrosRu: '1.6–2 г / 0.8 г / 2–3 г',
    macrosEn: '1.6–2 g / 0.8 g / 2–3 g',
  },
  maintain: {
    id: 3,
    titleRu: 'Поддержание',
    titleEn: 'Maintenance',
    kcalMinFactor: 1,
    kcalMaxFactor: 1,
    macrosRu: '1.2–1.6 г / 1 г / 4 г',
    macrosEn: '1.2–1.6 g / 1 g / 4 g',
  },
};

const RecomendationMeasurements = ({ bmi, trains }) => {
  const [theme, setTheme] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [goal, setGoal] = useState(AppData.pData.goal); // 0/1/2

  const tdee = useMemo(() => getTDEE(bmi, trains), [bmi, trains]);

  useEffect(() => {
    const s1 = theme$.subscribe(setTheme);
    const s2 = lang$.subscribe(lang => setLangIndex(lang === 'ru' ? 0 : 1));
    const s3 = fontSize$.subscribe(setFSize);
    return () => {
      s1.unsubscribe();
      s2.unsubscribe();
      s3.unsubscribe();
    };
  }, []);

  const currentGoalConfig = useMemo(() => {
    return Object.values(GOALS_CONFIG).find(g => g.id === goal) ?? GOALS_CONFIG.gain;
  }, [goal]);

  const stylesObj = styles(theme, fSize);
  const isRu = langIndex === 0;

  const headerText = isRu
    ? 'Рекомендации для вас с учётом недельной нагрузки'
    : 'Personal recommendations based on weekly workload';

  const kcalMin = Math.round(tdee * currentGoalConfig.kcalMinFactor);
  const kcalMax = Math.round(tdee * currentGoalConfig.kcalMaxFactor);
  const kcalText =
    currentGoalConfig.kcalMinFactor === currentGoalConfig.kcalMaxFactor
      ? `${kcalMin} ${isRu ? 'ккал' : 'kcal'}`
      : `${kcalMin}–${kcalMax} ${isRu ? 'ккал' : 'kcal'}`;

  return (
    <div style={stylesObj.container}>
      <div style={stylesObj.title}>{headerText}</div>

      <div style={stylesObj.tableWrapper}>
        {/* header row */}
        <div style={stylesObj.rowHeader}>
          <div style={stylesObj.colGoal}>{isRu ? 'Цель' : 'Goal'}</div>
          <div style={stylesObj.colCalories}>{isRu ? 'Калории (ккал)' : 'Calories (kcal)'}</div>
          <div style={stylesObj.colMacros}>
            {isRu ? 'БЖУ (на кг веса, г)' : 'PFC (per kg of weight, g)'}
          </div>
        </div>

        {/* active goal row */}
        <div style={{ ...stylesObj.row, border: '1px solid ' + Colors.get('border', theme) }}>
          <div style={stylesObj.colGoalText}>
            {isRu ? currentGoalConfig.titleRu : currentGoalConfig.titleEn}
          </div>
          <div style={stylesObj.colCaloriesText}>{kcalText}</div>
          <div style={stylesObj.colMacrosText}>
            {isRu ? currentGoalConfig.macrosRu : currentGoalConfig.macrosEn}
          </div>
        </div>
      </div>

      <Disclaimer theme={theme} langIndex={langIndex} fSize={fSize} />
    </div>
  );
};

export default RecomendationMeasurements;

const styles = (theme, fSize) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: fSize === 0 ? '13px' : '15px',
    color: Colors.get('mainText', theme),
    marginBottom: '8px',
    textAlign: 'center',
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '95%',
    alignSelf: 'center',
    border: '1px solid ' + Colors.get('maxValColor', theme),
    borderRadius: '10px',
    overflow: 'hidden',
  },
  rowHeader: {
    width: '100%',
    height: '44px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottom: '1px solid ' + Colors.get('border', theme),
    backgroundColor: Colors.get('bgSecondary', theme),
  },
  row: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: '50px',
  },
  colGoal: {
    width: '25%',
    padding: '0 6px',
    fontSize: fSize === 0 ? '11px' : '13px',
    color: Colors.get('subText', theme),
    borderRight: '1px solid ' + Colors.get('border', theme),
    textAlign: 'center',
  },
  colCalories: {
    width: '40%',
    padding: '0 6px',
    fontSize: fSize === 0 ? '11px' : '13px',
    color: Colors.get('subText', theme),
    borderRight: '1px solid ' + Colors.get('border', theme),
    textAlign: 'center',
  },
  colMacros: {
    width: '35%',
    padding: '0 6px',
    fontSize: fSize === 0 ? '11px' : '13px',
    color: Colors.get('subText', theme),
    textAlign: 'center',
  },

  colGoalText: {
    width: '25%',
    padding: '0 6px',
    fontSize: fSize === 0 ? '13px' : '15px',
    color: Colors.get('mainText', theme),
    borderRight: '1px solid ' + Colors.get('border', theme),
    textAlign: 'center',
  },
  colCaloriesText: {
    width: '40%',
    padding: '0 6px',
    fontSize: fSize === 0 ? '13px' : '15px',
    color: Colors.get('mainText', theme),
    borderRight: '1px solid ' + Colors.get('border', theme),
    textAlign: 'center',
  },
  colMacrosText: {
    width: '35%',
    padding: '0 6px',
    fontSize: fSize === 0 ? '11px' : '13px',
    color: Colors.get('mainText', theme),
    textAlign: 'center',
    lineHeight: 1.2,
  },
  subtext: {
    fontSize: fSize === 0 ? '11px' : '13px',
    color: Colors.get('subText', theme),
    marginTop: '6px',
    textAlign: 'center',
    padding: '0 12px',
  },
});

const getTDEE = (bmr, weeklyTrainingDays = 3) => {
  const days = Math.min(7, Math.max(0, weeklyTrainingDays));
  let multiplier;
  if (days === 0) multiplier = 1.2;
  else if (days <= 2) multiplier = 1.375;
  else if (days <= 4) multiplier = 1.55;
  else if (days === 5) multiplier = 1.725;
  else multiplier = 1.9;
  return bmr * multiplier;
};

const Disclaimer = ({ theme, langIndex, fSize }) => {
  const isRu = langIndex === 0;
  const textRu =
    'Информация в этом приложении носит общий ознакомительный характер и не является медицинской рекомендацией. При наличии заболеваний проконсультируйтесь с врачом.';
  const textEn =
    'The information in this app is for general informational purposes only and does not constitute medical advice. If you have any medical conditions, please consult your doctor.';

  return <div style={{ ...styles(theme, fSize).subtext }}>{isRu ? textRu : textEn}</div>;
};
