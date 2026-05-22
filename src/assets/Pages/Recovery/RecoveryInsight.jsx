import React, { useEffect, useState } from 'react';
import Colors from '../../StaticClasses/Colors';
import { theme$ } from '../../StaticClasses/HabitsBus';
import { AppData } from '../../StaticClasses/AppData';
import Insight from '../SleepPages/Insight';
import { INSIGHT_TYPES } from '../SleepPages/InsightHelper';
import { buildSectionAccent } from '../SectionAccentSettings.jsx';

const RecoveryInsight = () => {
  const [theme, setTheme] = useState(theme$.value);
  const accent = buildSectionAccent(AppData.recoveryAccentColor || '#2FD6BD', '#2FD6BD');
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
        : `linear-gradient(180deg, rgba(${accent.rgb},0.12) 0%, ${Colors.get('background', theme)} 44%)`
    }}>
      <Insight initialType={INSIGHT_TYPES.RECOVERY_RATE} accentOverride={accent} />
    </div>
  );
};

export default RecoveryInsight;
