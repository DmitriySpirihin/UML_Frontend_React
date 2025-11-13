export const THEME = {
  LIGHT: "light",
  DARK: "dark",
  SPECIALLIGHT: "speciallight",
  SPECIALDARK: "specialdark",
};

export class Colors {
  static theme = THEME.DARK;

  static palette = {
    background: { light: "#e9f3f7ff", dark: "#131619ff", speciallight: "#ecd1cbff", specialdark: "#232020ff" },
    mainText: { light: "#151414ff", dark: "#dfd5d5ff", speciallight: "#653737ff", specialdark: "#c6b1b1ff" },
    subText: { light: "#1b1a1aff", dark: "#756e6eff", speciallight: "#34211bff", specialdark: "#8c7e7eff" },
    simplePanel: { light: "#c2cbd4ff", dark: "#1c1b1dff", speciallight: "#cdb0a6ff", specialdark: "#242a24ff" },
    metricsPanel: { light: "#a9c6e1ff", dark: "#101114ff", speciallight: "#af7979ff", specialdark: "#181414ff" },
    highlitedPanel: { light: "#b4cee6ff", dark: "#282e30ff", speciallight: "#b88787ff", specialdark: "#445344ff" },
    panelGradient: { light: "linear-gradient(135deg, #f3f5f8ff 0%, #b8d0e6ff 100%)", dark: "linear-gradient(135deg, #292932ff 0%, #0e0e10ff 100%)", speciallight: "linear-gradient(135deg, #e6d2cfff 0%, #d6806bff 100%)", specialdark: "linear-gradient(135deg, #454e49ff 0%, #142018ff 100%)",},
    border: { light: "#576c7eff", dark: "#88bdc6ff", speciallight: "#e8d9d9ff", specialdark: "#d3e3d3ff" },
    shadow: { light: "#353940ff", dark: "#000000ff", speciallight: "#522323ff", specialdark: "#111512ff" },
    bottomPanel: { light: "#c8d7deff", dark: "#101316ff", speciallight: "#d5b1a9ff", specialdark: "#1f1d1dff" },
    bottomPanelShadow: { light: "#8b9cc6ff", dark: "#64797aff", speciallight: "#fffdfcff", specialdark: "#38483dff" },
    habitCard: { light: "#eef1f5ff", dark: "#1c1b1dff", speciallight: "#d7a1a1ff", specialdark: "#161917ff" },
    habitCardDone: { light: "#7be7d1ff", dark: "#2e5a2fff", speciallight: "#42d486ff", specialdark: "#26944dff" },
    habitCardSkipped: { light: "#f88787ff", dark: "#5c2e2eff", speciallight: "#ba4a4aff", specialdark: "#863122ff" },
    inputField:{ light: "#9eaebcff", dark: "#2e2d2fff", speciallight: "#af9d89ff", specialdark: "#2f3431ff" },
    inputSelected:{ light: "#b4cde3ff", dark: "#423f45ff", speciallight: "#d1bba2ff", specialdark: "#3d4b43ff" },
    headGradient: { light: "linear-gradient( #b9d2eeff 30%, #e9f3f7ff 100%)", dark: "linear-gradient( #0c0e10ff 40%, #131619ff 100%)", speciallight: "linear-gradient( #e68383ff 30%, #ecd1cbff 80%)", specialdark: "linear-gradient( #171313ff 40%, #232020ff 100%)",},
    currentDateBorder: { light: "#4a8ac2ff", dark: "#62aca4ff", speciallight: "#fe4b90ff", specialdark: "#689168ff" },
    progressBar:{ light: "#46555bff", dark: "#0d0f12ff", speciallight: "#6b5150ff", specialdark: "#171313ff" },

    icons:{ light: "#bed8f0ff", dark: "#616568ff", speciallight: "#d78282ff", specialdark: "#546654ff" },
    iconsDisabled:{ light: "#8cabc4ff", dark: "#383f44ff", speciallight: "#e2b0b0ff", specialdark: "#2e3a2eff" },
    iconsHighlited:{ light: "#658eb2ff", dark: "#5a8181ff", speciallight: "#b85b5bff", specialdark: "#679667ff" },
    iconsShadow:{ light: "#ffffffff", dark: "#5a8181ff", speciallight: "#df2c2cff", specialdark: "#679667ff" },
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

