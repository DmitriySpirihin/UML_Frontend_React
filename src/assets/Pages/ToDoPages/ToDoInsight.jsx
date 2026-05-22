import React, { useEffect, useState } from 'react';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$ } from '../../StaticClasses/HabitsBus';
import Insight from '../SleepPages/Insight';
import { INSIGHT_TYPES } from '../SleepPages/InsightHelper';
import { buildTodoAccent } from './ToDoVisuals.js';

const ToDoInsight = () => {
  const [theme, setTheme] = useState(theme$.value);
  const accent = buildTodoAccent(AppData.todoAccentColor || '#149DFF');
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
        ? `linear-gradient(180deg, ${accent.faint} 0%, ${Colors.get('background', theme)} 42%)`
        : `linear-gradient(180deg, rgba(${accent.rgb.r},${accent.rgb.g},${accent.rgb.b},0.12) 0%, ${Colors.get('background', theme)} 44%)`
    }}>
      <Insight
        initialType={INSIGHT_TYPES.TIME_MANAGEMENT}
        accentOverride={accent}
      />
    </div>
  );
};

export default ToDoInsight;
