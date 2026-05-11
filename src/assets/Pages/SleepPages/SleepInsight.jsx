import React, { useEffect, useState } from 'react';
import Colors from '../../StaticClasses/Colors';
import { theme$ } from '../../StaticClasses/HabitsBus';
import { buildSleepAccent } from './SleepVisuals';
import { AppData } from '../../StaticClasses/AppData';
import Insight from './Insight';
import { INSIGHT_TYPES } from './InsightHelper';

const SleepInsight = () => {
  const [theme, setTheme] = useState(theme$.value);
  const accent = buildSleepAccent(AppData.sleepAccentColor || '#6F7DFF');
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
      padding: 'calc(env(safe-area-inset-top, 0px) + 18px) 12px 104px',
      background: isLight
        ? `linear-gradient(180deg, ${accent.faint} 0%, ${Colors.get('background', theme)} 42%)`
        : `linear-gradient(180deg, rgba(${accent.rgb.r},${accent.rgb.g},${accent.rgb.b},0.12) 0%, ${Colors.get('background', theme)} 44%)`
    }}>
      <Insight
        initialType={INSIGHT_TYPES.SLEEP}
        accentOverride={accent}
      />
    </div>
  );
};

export default SleepInsight;
