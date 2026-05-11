import { skip } from "rxjs";

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  COFFEE: 'coffee'
};

export class Colors {
  static theme =  THEME.DARK;

  static palette = {
    // Core backgrounds
    background: { light: "#e5e5e5", dark: "#11171C", coffee: "#1A120E" }, 
    mainText: { light: "#0F172A", dark: "#F1F5F9", coffee: "#FFF4E6" },
    subText: { light: "#64748B", dark: "#8E96A3", coffee: "#C9AD96" }, 
    
    // Panels
    simplePanel: { light: "#ffffff", dark: "#172027", coffee: "#241914" },
    metricsPanel: { light: "#F1F5F9", dark: "#141B21", coffee: "#20150F" },
    highlitedPanel: { light: "#E2E8F0", dark: "#1E2A33", coffee: "#332319" },
    
    // Gradients
    panelGradient: { 
      light: "linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)", 
      dark: "linear-gradient(135deg, #1E2A33 0%, #141B21 100%)",
      coffee: "linear-gradient(135deg, #2C1E16 0%, #1B120D 100%)"
    },
    headGradient: { 
      light: "linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)", 
      dark: "linear-gradient(180deg, #19242C 0%, #11171C 100%)",
      coffee: "linear-gradient(180deg, #2A1B13 0%, #1A120E 100%)"
    },

    // Borders & Lines
    border: { light: "#E2E8F0", dark: "#2A3944", coffee: "#493226" }, 
    currentDateBorder: { light: "#0763f7d4", dark: "#2362ce", coffee: "#A46C3B" }, 
    linesColor: { light: "#CBD5E1", dark: "#25333D", coffee: "#3A281D" },

    trainingIsolatedFont: { light: "#7c6b089b", dark: "#ffc85a" },
    trainingBaseFont: { light: "#4b0c0cce", dark: "#ff6b6b" },

    // Status Colors
    categoryPositive: { light: "#DCFCE7", dark: "#064E3B", coffee: "#2B4A2F" },
    categoryNegative: { light: "#FEE2E2", dark: "#450A0A", coffee: "#4A1F16" },
    done: { light: "#10B981", dark: "#10B981" }, 
    skipped: { light: "#EF4444", dark: "#EF4444" },
    scrollFont: { light: "#101377ab", dark: "#5d8bff" }, 

    maxValColor: { light: "#44ef63", dark: "#44ef5b8b"},
    minValColor: { light: "#ef4444", dark: "#ef4444a1"  },
    
    // Cards
    habitCard: { light: "#FFFFFF", dark: "#151D23", coffee: "#211711" },
    habitCardDone: { light: "rgba(16, 185, 129, 0.1)", dark: "rgba(16, 185, 129, 0.12)", coffee: "rgba(46, 180, 112, 0.12)" },
    habitCardSkipped: { light: "rgba(239, 68, 68, 0.1)", dark: "rgba(239, 68, 68, 0.12)", coffee: "rgba(239, 96, 68, 0.13)" },
    progressBar: { light: "#E2E8F0", dark: "#25333D", coffee: "#3A281D" },

    // Icons
    icons: { light: "#475569", dark: "#717B8A", coffee: "#A6846B" },
    iconsDisabled: { light: "#CBD5E1", dark: "#333942", coffee: "#5A4031" },
    iconsHighlited: { light: "#0F172A", dark: "#FFFFFF", coffee: "#FFF4E6" },
    
    // Inputs
    inputField: { light: "#F1F5F9", dark: "#050506", coffee: "#120C09" },
    inputSelected: { light: "#FFFFFF", dark: "#1C1F26", coffee: "#2A1B13" },
    mathInput: { light: "rgba(59, 130, 246, 0.1)", dark: "rgba(255, 255, 255, 0.04)" },

    // Metrics & Charts
    barsColorWeight: { light: "#F59E0B", dark: "#F59E0B" },
    barsColorTonnage: { light: "#8B5CF6", dark: "#8B5CF6" },
    barsColorMeasures: { light: "#10B981", dark: "#10B981" },
    radar: { light: "#3B82F6", dark: "#3B82F6" },
    areaChart: { light: "#6366F1", dark: "#6366F1" },
    
    // Difficulty
    difficulty: { light: "#1086b9ab", dark: "#1094b9c1" },
    difficulty0: { light: "#10b981ae", dark: "#10b981" },
    difficulty1: { light: "#83cc168b", dark: "#83cc16" },
    difficulty2: { light: "#eab208a7", dark: "#EAB308" },
    difficulty3: { light: "#f97416a5", dark: "#f97416" },
    difficulty5: { light: "#ef444494", dark: "#e74343" },

    shadow: { light: "rgba(0,0,0,0.06)", dark: "rgba(0,0,0,0.6)", coffee: "rgba(0,0,0,0.58)" },
    bottomPanel: { light: "#FFFFFF", dark: "#10161B", coffee: "#17100C" },
    svgColor: { light: "rgba(0,0,0,0.03)", dark: "rgba(255,255,255,0.02)", coffee: "rgba(255,224,190,0.025)" },
    
    veryBad: {
    dark: "#f53f3f", // насыщенный красный
    light:  "#ff0000a6", // пастельный красно-розовый
  },
  bad: {
    dark: "#f47938", // тёплый оранжевый
    light:  "#f8911cb3", // мягкий персиковый
  },
  normal: {
   dark: "#f4bb41", // янтарно-жёлтый (норм/предупреждение)
    light:  "#ffcd03a6", // светлый кремовый
  },
  good: {
   dark: "#4ae282", // изумрудный зелёный
    light:  "#06f95bad", // пастельный мятный
  },
  perfect: {
    dark: "#41b9f1", // чистый небесно-синий
    light:  "rgba(0, 157, 241, 0.76)", // нежный голубой пастель
  },
    
  };

  static resolveTheme(theme) {
    const next = theme ?? Colors.theme;
    return Object.values(THEME).includes(next) ? next : THEME.DARK;
  }

  static setTheme(theme) {
    if (Object.values(THEME).includes(theme)) {
      Colors.theme = theme;
    }
  }

  static get(name, theme) {
    const t = Colors.resolveTheme(theme);
    const entry = Colors.palette?.[name];
    if (!entry) return undefined;
    return entry[t] ?? (t === THEME.LIGHT ? entry.light : entry.dark);
  }

  static all(theme) {
    const t = Colors.resolveTheme(theme);
    return Object.fromEntries(
      Object.entries(Colors.palette).map(([k, v]) => [
        k, 
        v[t] ?? (t === THEME.LIGHT ? v.light : v.dark)
      ])
    );
  }
}
export default Colors;
