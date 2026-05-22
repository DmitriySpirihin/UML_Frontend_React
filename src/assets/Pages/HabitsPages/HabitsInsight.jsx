import React, { useEffect, useState } from 'react';
import Colors from '../../StaticClasses/Colors';
import { theme$ } from '../../StaticClasses/HabitsBus';
import { AppData } from '../../StaticClasses/AppData';
import Insight from '../SleepPages/Insight';
import { INSIGHT_TYPES } from '../SleepPages/InsightHelper';
import { buildHabitsAccent, DEFAULT_HABITS_ACCENT_COLOR } from './HabitVisuals.jsx';

const HabitsInsight = () => {
  const [theme, setTheme] = useState(theme$.value);
  const accent = buildHabitsAccent(AppData.habitAccentColor || DEFAULT_HABITS_ACCENT_COLOR);
  const isLight = theme === 'light' || theme === 'speciallight';

  useEffect(() => {
    const sub = theme$.subscribe(setTheme);
    return () => sub.unsubscribe();
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      boxSizing: 'border-box',
      padding: 0,
      background: isLight
        ? `radial-gradient(640px 420px at 86% -8%, rgba(${accent.rgb},0.16), transparent 62%), radial-gradient(520px 380px at 6% 86%, rgba(${accent.rgb},0.1), transparent 66%), #F4F5F7`
        : `radial-gradient(640px 420px at 86% -8%, rgba(${accent.rgb},0.15), transparent 62%), radial-gradient(520px 420px at 8% 86%, rgba(${accent.rgb},0.1), transparent 68%), linear-gradient(180deg, #18232A 0%, ${Colors.get('background', theme)} 46%, #10161A 100%)`
    }}>
      <Insight initialType={INSIGHT_TYPES.HABITS} accentOverride={accent} />
    </div>
  );
};

export default HabitsInsight;
