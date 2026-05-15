import Colors from '../../StaticClasses/Colors.js';
import { AppData } from '../../StaticClasses/AppData.js';
import { buildSectionAccent } from '../SectionAccentSettings.jsx';

export const DEFAULT_TRAINING_ACCENT_COLOR = '#579BC8';

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
    ? `linear-gradient(145deg, rgba(255,255,255,0.76), rgba(${accent.rgb}, 0.11) 48%, rgba(246,248,250,0.58))`
    : `linear-gradient(145deg, rgba(${accent.rgb}, 0.13), rgba(27,42,52,0.56) 42%, rgba(9,14,18,0.62))`;
};

export const getTrainingPanelBorder = (theme, accent = getTrainingAccent(), active = false) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  if (active) return accent.ring;
  return isLight ? `rgba(${accent.rgb}, 0.16)` : `rgba(${accent.rgb}, 0.14)`;
};

export const getTrainingPanelShadow = (theme, accent = getTrainingAccent(), active = false) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  if (active) return `0 22px 48px rgba(${accent.rgb}, ${isLight ? 0.18 : 0.22}), 0 1px 0 rgba(255,255,255,0.18) inset`;
  return isLight
    ? `0 16px 34px rgba(20,30,38,0.08), 0 1px 0 rgba(255,255,255,0.72) inset`
    : `0 20px 48px rgba(0,0,0,0.30), 0 0 32px rgba(${accent.rgb}, 0.08), 0 1px 0 rgba(255,255,255,0.08) inset`;
};

export const getTrainingGlassSurface = (theme, accent = getTrainingAccent(), active = false) => ({
  background: getTrainingPanelBackground(theme, accent),
  border: `1px solid ${getTrainingPanelBorder(theme, accent, active)}`,
  boxShadow: getTrainingPanelShadow(theme, accent, active),
  backdropFilter: 'blur(22px) saturate(1.16)',
  WebkitBackdropFilter: 'blur(22px) saturate(1.16)'
});

export const getTrainingInteractiveStyle = (theme, accent = getTrainingAccent(), active = false) => ({
  ...getTrainingGlassSurface(theme, accent, active),
  cursor: 'pointer',
  userSelect: 'none',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
  transition: 'border-color 0.24s ease, box-shadow 0.24s ease, background 0.24s ease, transform 0.24s ease'
});

export const getTrainingPressMotion = (hoverScale = 1.01, tapScale = 0.985) => ({
  whileHover: { y: -2, scale: hoverScale },
  whileTap: { y: 1, scale: tapScale },
  transition: { type: 'spring', stiffness: 420, damping: 32 }
});
