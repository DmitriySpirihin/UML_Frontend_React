import { skip } from "rxjs";

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark'
};

export class Colors {
  static theme =  THEME.DARK;

  static palette = {
    // Core Backgrounds - Deep Obsidian
    background: { light: "#F8FAFC", dark: "#15181c" }, 
    mainText: { light: "#0F172A", dark: "#F1F5F9" },
    subText: { light: "#64748B", dark: "#8E96A3" }, 
    
    // Panels - Layered Charcoal
    simplePanel: { light: "#FFFFFF", dark: "#16181D" }, // Slightly lighter than background
    metricsPanel: { light: "#F1F5F9", dark: "#101013" },
    highlitedPanel: { light: "#E2E8F0", dark: "#21252B" },
    
    // Gradients
    panelGradient: { 
      light: "linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)", 
      dark: "linear-gradient(135deg, #1C1F26 0%, #121417 100%)" 
    },
    headGradient: { 
      light: "linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)", 
      dark: "linear-gradient(180deg, #0f0f11 0%, #111316 100%)" 
    },

    // Borders & Lines
    border: { light: "#E2E8F0", dark: "#242830" }, 
    currentDateBorder: { light: "#0763f7d4", dark: "#2362ce" }, 
    linesColor: { light: "#CBD5E1", dark: "#1A1D23" },

    // Status Colors
    categoryPositive: { light: "#DCFCE7", dark: "#064E3B" },
    categoryNegative: { light: "#FEE2E2", dark: "#450A0A" },
    done: { light: "#10B981", dark: "#10B981" }, 
    skipped: { light: "#EF4444", dark: "#EF4444" },
    scrollFont: { light: "#101377ab", dark: "#5d8bff" }, 

    maxValColor: { light: "#44ef63", dark: "#44ef5b8b"},
    minValColor: { light: "#ef4444", dark: "#ef4444a1"  },
    
    // Cards
    habitCard: { light: "#FFFFFF", dark: "#111317" },
    habitCardDone: { light: "rgba(16, 185, 129, 0.1)", dark: "rgba(16, 185, 129, 0.12)" },
    habitCardSkipped: { light: "rgba(239, 68, 68, 0.1)", dark: "rgba(239, 68, 68, 0.12)" },
    progressBar: { light: "#E2E8F0", dark: "#1A1D23" },

    // Icons
    icons: { light: "#475569", dark: "#717B8A" },
    iconsDisabled: { light: "#CBD5E1", dark: "#333942" },
    iconsHighlited: { light: "#0F172A", dark: "#FFFFFF" },
    
    // Inputs
    inputField: { light: "#F1F5F9", dark: "#050506" },
    inputSelected: { light: "#FFFFFF", dark: "#1C1F26" },
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

    shadow: { light: "rgba(0,0,0,0.06)", dark: "rgba(0,0,0,0.6)" },
    bottomPanel: { light: "#FFFFFF", dark: "#15181c" },
    svgColor: { light: "rgba(0,0,0,0.03)", dark: "rgba(255,255,255,0.02)" },
    
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

  static setTheme(theme) {
    if (theme === THEME.LIGHT || theme === THEME.DARK) {
      Colors.theme = theme;
    }
  }

  static get(name, theme) {
    const t = theme ?? Colors.theme;
    const entry = Colors.palette?.[name];
    if (!entry) return undefined;
    return t === THEME.DARK ? entry.dark : entry.light;
  }

  static all(theme) {
    const t = theme ?? Colors.theme;
    return Object.fromEntries(
      Object.entries(Colors.palette).map(([k, v]) => [
        k, 
        t === THEME.DARK ? v.dark : v.light
      ])
    );
  }
}
export default Colors;

