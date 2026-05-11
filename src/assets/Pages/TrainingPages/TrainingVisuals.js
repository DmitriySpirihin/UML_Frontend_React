import Colors from '../../StaticClasses/Colors.js';
import { AppData } from '../../StaticClasses/AppData.js';
import { buildSectionAccent } from '../SectionAccentSettings.jsx';

export const DEFAULT_TRAINING_ACCENT_COLOR = '#35C2FF';

export const getTrainingAccent = () => (
  buildSectionAccent(AppData.trainingAccentColor || DEFAULT_TRAINING_ACCENT_COLOR, DEFAULT_TRAINING_ACCENT_COLOR)
);

export const getTrainingPageBackground = (theme, accent = getTrainingAccent()) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  return isLight
    ? `linear-gradient(180deg, rgba(${accent.rgb}, 0.12) 0%, ${Colors.get('background', theme)} 44%)`
    : `linear-gradient(180deg, rgba(${accent.rgb}, 0.055) 0%, ${Colors.get('background', theme)} 48%)`;
};

export const getTrainingPanelBackground = (theme, accent = getTrainingAccent()) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  return isLight
    ? `linear-gradient(145deg, rgba(${accent.rgb}, 0.07), rgba(255,255,255,0.9) 44%, rgba(246,247,248,0.8))`
    : 'linear-gradient(145deg, rgba(28,31,35,0.96), rgba(17,20,24,0.94))';
};

export const getTrainingPanelBorder = (theme, accent = getTrainingAccent(), active = false) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  if (active) return accent.ring;
  return isLight ? `rgba(${accent.rgb}, 0.16)` : `rgba(${accent.rgb}, 0.14)`;
};

export const getTrainingPanelShadow = (theme, accent = getTrainingAccent(), active = false) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  if (active) return `0 18px 42px rgba(${accent.rgb}, ${isLight ? 0.18 : 0.20})`;
  return isLight
    ? `0 14px 34px rgba(${accent.rgb}, 0.08)`
    : `0 18px 46px rgba(0,0,0,0.28), 0 0 28px rgba(${accent.rgb}, 0.06)`;
};
