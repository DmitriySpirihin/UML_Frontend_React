export const THEME = {
  LIGHT: "light",
  DARK: "dark",
  SPECIALLIGHT: "speciallight",
  SPECIALDARK: "specialdark",
};

export class Colors {
  static theme = THEME.DARK;

  static palette = {
    background: { light: "#d4eaf1ff", dark: "#131619ff", speciallight: "#e1dbafff", specialdark: "#232020ff" },
    mainText: { light: "#151414ff", dark: "#dfd5d5ff", speciallight: "#653737ff", specialdark: "#c6b1b1ff" },
    subText: { light: "#1b1a1aff", dark: "#756e6eff", speciallight: "#34211bff", specialdark: "#8c7e7eff" },
    simplePanel: { light: "#adc0d2ff", dark: "#1c1b1dff", speciallight: "#cdb0a6ff", specialdark: "#232b23ff" },
    highlitedPanel: { light: "#698198ff", dark: "#332b3bff", speciallight: "#995e4bff", specialdark: "#427042ff" },
    panelGradient: { light: "linear-gradient(135deg, #c9def6ff 0%, #8daec9ff 100%)", dark: "linear-gradient(135deg, #292932ff 0%, #0e0e10ff 100%)", speciallight: "linear-gradient(135deg, #d6b9afff 0%, #96552cff 100%)", specialdark: "linear-gradient(135deg, #454e49ff 0%, #142018ff 100%)",},
    border: { light: "#1f2c37ff", dark: "#88a0c6ff", speciallight: "#ffffffff", specialdark: "#d3e3d3ff" },
    shadow: { light: "#3b414fff", dark: "#000000ff", speciallight: "#522323ff", specialdark: "#505635ff" },
    bottomPanel: { light: "#adc0d2ff", dark: "#1c1b1dff", speciallight: "#e8b7aeff", specialdark: "#222b22ff" },
    bottomPanelShadow: { light: "#3b414fff", dark: "#868787ff", speciallight: "#fffdfcff", specialdark: "#81bcaaff" },
    habitCard: { light: "#adc0d2ff", dark: "#1c1b1dff", speciallight: "#d7bea1ff", specialdark: "#161917ff" },
    habitCardDone: { light: "#3af2cdff", dark: "#2e5a2fff", speciallight: "#42d486ff", specialdark: "#26944dff" },
    habitCardSkipped: { light: "#fe67c4ff", dark: "#5c2e2eff", speciallight: "#e76142ff", specialdark: "#863122ff" },
    inputField:{ light: "#9eaebcff", dark: "#2e2d2fff", speciallight: "#af9d89ff", specialdark: "#2f3431ff" },
    inputSelected:{ light: "#b4cde3ff", dark: "#423f45ff", speciallight: "#d1bba2ff", specialdark: "#3d4b43ff" },
    headGradient: { light: "linear-gradient( #a0c8d4ff 40%, #d4eaf1ff 100%)", dark: "linear-gradient( #0c0e10ff 40%, #131619ff 100%)", speciallight: "linear-gradient( #c6bd76ff 40%, #e1dbafff 100%)", specialdark: "linear-gradient( #171313ff 40%, #232020ff 100%)",},
    currentDateBorder: { light: "#4a8ac2ff", dark: "#62aca4ff", speciallight: "#f08686ff", specialdark: "#689168ff" },
    progressBar:{ light: "#355b68ff", dark: "#0d0f12ff", speciallight: "#341c1bff", specialdark: "#083023ff" },
  };

  static setTheme(theme) {
    if (theme === THEME.LIGHT || theme === THEME.DARK || theme === THEME.SPECIALLIGHT || theme === THEME.SPECIALDARK) {
      Colors.theme = theme;
    }
  }

  static get(name, theme) {
    const t = theme ?? Colors.theme;
    const entry = Colors.palette?.[name];
    if (!entry) return undefined;
    if (t === THEME.DARK) return entry.dark;
    if (t === THEME.SPECIALLIGHT) return entry.speciallight;
    if (t === THEME.SPECIALDARK) return entry.specialdark;
    return entry.light;
  }

  static pair(name) {
    return Colors.palette?.[name];
  }

  static all(theme) {
    const t = theme ?? Colors.theme;
    return Object.fromEntries(
      Object.entries(Colors.palette).map(([k, v]) => {
        if (t === THEME.DARK) return [k, v.dark];
        if (t === THEME.SPECIALLIGHT) return [k, v.speciallight];
        if (t === THEME.SPECIALDARK) return [k, v.specialdark];
        return [k, v.light];
      })
    );
  }
}

export default Colors;

