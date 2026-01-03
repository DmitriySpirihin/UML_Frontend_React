import { skip } from "rxjs";

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
    mainText: { light: "#151414ff", dark: "#dfd5d5ff", speciallight: "#2c1919ff", specialdark: "#d9d2caff" },
    subText: { light: "#161515ff", dark: "#9d9393ff", speciallight: "#482d2dff", specialdark: "#bfb4a7ff" },
    prevTrainingText: { light: "#302d2dff", dark: "#302d2dff", speciallight: "#654343ff", specialdark: "#797167ff" },
    simplePanel: { light: "#c2cbd4ff", dark: "#24282dff", speciallight: "#cdb0a6ff", specialdark: "#242a24ff" },
    metricsPanel: { light: "#a9c6e1ff", dark: "#101114ff", speciallight: "#af7979ff", specialdark: "#181414ff" },
    highlitedPanel: { light: "#b4cee6ff", dark: "#282e30ff", speciallight: "#b88787ff", specialdark: "#445344ff" },
    panelGradient: { light: "linear-gradient(135deg, #f3f5f8ff 0%, #b8d0e6ff 100%)", dark: "linear-gradient(135deg, #292932ff 0%, #0e0e10ff 100%)", speciallight: "linear-gradient(135deg, #e6d2cfff 0%, #d6806bff 100%)", specialdark: "linear-gradient(135deg, #454e49ff 0%, #142018ff 100%)",},
    border: { light: "#576c7eff", dark: "#3c3e3eff", speciallight: "#5d4747ff", specialdark: "#d3e3d3ff" },

    categoryPositive: { light: "#577e6eff", dark: "#243b32ff", speciallight: "#297b2e67", specialdark: "#a1e093ff" },
    categoryNegative: { light: "#7e5776ff", dark: "#4b3232ff", speciallight: "#9220205f", specialdark: "#dc8778ff" },

    shadow: { light: "#353940ff", dark: "#000000ff", speciallight: "#522323ff", specialdark: "#111512ff" },
    bottomPanel: { light: "#e7f8feff", dark: "#101316ff", speciallight: "#d5b1a9ff", specialdark: "#1f1d1dff" },
    bottomPanelShadow: { light: "#8b9cc69a", dark: "#383a3aff", speciallight: "#fffdfcff", specialdark: "#38483dff" },
    habitCard: { light: "#eef1f5ff", dark: "#1c1b1dff", speciallight: "#d7a1a1ff", specialdark: "#161917ff" },

    habitCardDone: { light: "rgba(173, 223, 192, 0.5)", dark: "rgba(41, 61, 40, 0.5)", speciallight: "rgba(94, 161, 61, 0.28)", specialdark: "rgba(64, 96, 54, 0.5)" },
    habitCardSkipped: { light: "rgba(231, 163, 196, 0.5)", dark: "rgba(92, 46, 46, 0.5)", speciallight: "rgba(224, 147, 147, 0.5)", specialdark: "rgba(120, 25, 10, 0.39)" },
     
    done: { light: "#75c5b3ff", dark: "#316444ff", speciallight: "#85d27fff", specialdark: "#2b4b30ff" },
    skipped: { light: "#bd75c5ff", dark: "#643131ff", speciallight: "#d27fa2ff", specialdark: "#4b2b2fff" },

    habitCardEnded: { light: "#f2ec9cff", dark: "#3a371cff", speciallight: "#ebc880ff", specialdark: "#4b4911ff" },
    habitDoneBorder: { light: "#767e57ff", dark: "#c6c688ff", speciallight: "#e8e5d9ff", specialdark: "#d2d8a1ff" },
    inputField:{ light: "#9eaebcff", dark: "#2e2d2fff", speciallight: "#af9d89ff", specialdark: "#2f3431ff" },
    inputSelected:{ light: "#b4cde3ff", dark: "#423f45ff", speciallight: "#d1bba2ff", specialdark: "#3d4b43ff" },
    headGradient: { light: "linear-gradient( #b9d2eeff 30%, #e9f3f7ff 100%)", dark: "linear-gradient( #0c0e10ff 40%, #131619ff 100%)", speciallight: "linear-gradient( #e68383ff 30%, #ecd1cbff 80%)", specialdark: "linear-gradient( #171313ff 40%, #232020ff 100%)",},
    currentDateBorder: { light: "#6796c0ff", dark: "#62aca4ff", speciallight: "#fe4b90ff", specialdark: "#689168ff" },
    currentDateBorder2: { light: "#b3d2edff", dark: "#131d1dff", speciallight: "#d5a5b7ff", specialdark: "#232823ff" },
    progressBar:{ light: "#46555bff", dark: "#0d0f12ff", speciallight: "#6b5150ff", specialdark: "#171313ff" },

    icons:{ light: "#1b1c1cff", dark: "#616568ff", speciallight: "#6e4343ff", specialdark: "#546654ff" },
    iconsDisabled:{ light: "#8cabc4ff", dark: "#383f44ff", speciallight: "#e2b0b0ff", specialdark: "#2e3a2eff" },
    iconsHighlited:{ light: "#658eb2ff", dark: "#596e6eff", speciallight: "#b85b5bff", specialdark: "#679667ff" },
    iconsShadow:{ light: "#ffffffff", dark: "#5a8181ff", speciallight: "#df2c2cff", specialdark: "#679667ff" },

    habitIcon:{ light: "#4f8ac2ff", dark: "#4b6060ff", speciallight: "#773838ff", specialdark: "#407f40ff" },

    trainingGroup:{ light: "#c7dee6ff", dark: "#101215ff", speciallight: "#e6c2baff", specialdark: "#171515ff" },
    trainingGroupSelected:{ light: "#b8e6f9ff", dark: "#171b1aff", speciallight: "#ecbbbbff", specialdark: "#282e27ff" },

    trainingBaseFont: { light: "#ff3b3bff", dark: "#794040ff", speciallight: "#de0d0dff", specialdark: "#903d3dff" },
    trainingIsolatedFont: { light: "#ffe449ff", dark: "#77713dff", speciallight: "#d4cb22ff", specialdark: "#797b3aff" },
    
    // metrics
    barsColorWeight:{ light: "#99723bff", dark: "#c8803cff", speciallight: "#885c42ff", specialdark: "#a88b22ff" },
    barsColorTonnage:{ light: "#852082ff", dark: "#b24e4eff", speciallight: "#6e7238ff", specialdark: "#a3a318ff" },
    barsColorMeasures:{ light: "#648f3eff", dark: "#5cb57dff", speciallight: "#4a6a34ff", specialdark: "#248a1eff" },
    choosenColor:{ light: "#4fc5daff", dark: "#4f94b6ff", speciallight: "#269cd2ff", specialdark: "#548a35ff" },
    maxValColor:{ light: "#067b4c7e", dark: "#67ac45ff", speciallight: "#094b2374", specialdark: "#33b74dff" },
    minValColor:{ light: "#9a377ca6", dark: "#c45757ff", speciallight: "rgba(145, 41, 98, 1)", specialdark: "#970e0a8a" },
    linesColor:{ light: "#6f828cff", dark: "#2d3032ff", speciallight: "#9f979aff", specialdark: "#293d2fff" },

    medium:{ light: "#abb127ff", dark: "#FFB74D", speciallight: "#a77526ff", specialdark: "#a47336ff" },
    heavy:{ light: "#662142ff", dark: "#E76F51", speciallight: "rgba(145, 41, 98, 1)", specialdark: "#ab2e2aff" },
    light:{ light: "#2e933dda", dark: "#81C784", speciallight: "#2d6442ff", specialdark: "#33b74dff" },
    radar:{ light: "#4C8DFF", dark: "#702b2bff", speciallight: "#B65C5C", specialdark: "#6366F1" },
    radarBorder:{ light: "#10242fff", dark: "#e96d67ff", speciallight: "#494a4aff", specialdark: "#7185e9ff" },

    areaChart:{ light: "#5b98d1ff", dark: "#6eb5cfff", speciallight: "#61a3a1ff", specialdark: "#25da8bff" },
    regress:{ light: "#9b44d8ff", dark: "#c25aa4ff", speciallight: "#894c88ff", specialdark: "#914dc8ff" },
    
    difficulty5:{ light: "#3dff7451", dark: "#2a6f4dff", speciallight: "#1c9e5d57", specialdark: "#2a884fff" },
    difficulty0:{ light: "#68ff5a51", dark: "#334436ff", speciallight: "#21763c57", specialdark: "#2e472aff" },
    difficulty1:{ light: "#ecff5a4f", dark: "#534f35ff", speciallight: "#75851a71", specialdark: "#45472aff" },
    difficulty2:{ light: "#ffad5a55", dark: "#493023ff", speciallight: "#83382276", specialdark: "#47332aff" },
    difficulty3:{ light: "#ff605a61", dark: "#4f2828ff", speciallight: "#8d1b1b80", specialdark: "#472a2aff" },
    difficulty:{ light: "#5ab2ff4e", dark: "#314358ff", speciallight: "#16506272", specialdark: "#2a4447ff" },
    difficultyAdd:{ light: "#7283914e", dark: "#45484aff", speciallight: "#86868672", specialdark: "#404344ff" },

    in:{ light: "#235179ff", dark: "#43ad9bff", speciallight: "#3a91abff", specialdark: "#5098cfff" },
    out:{ light: "#665f25ff", dark: "#a4a15bff", speciallight: "#817b24ff", specialdark: "#c09848ff" },
    hold:{ light: "#69231aff", dark: "#a7645eff", speciallight: "#782886ff", specialdark: "#c54a75ff" },
    rest:{ light: "#5c5a5aff", dark: "#c6cccdff", speciallight: "#565b5dff", specialdark: "#aebcbcff" },
    hot:{ light: "#fb4949b6", dark: "#7b2222ff", speciallight: "#e14e4e8e", specialdark: "#782d2dff" },
    cold:{ light: "#5ecaccb9", dark: "#4d9aa8ff", speciallight: "#54b7dea2", specialdark: "#226d6dff" },
    meditate:{ light: "#58fb70c7", dark: "#428548ff", speciallight: "#5df784bf", specialdark: "#2d8145ff" },

    play: { light: "#21e56997", dark: "#487b5bff",speciallight: "#1d964b8b", specialdark: "#42ac6dac"},
    pause: { light: "#e3b529a2", dark: "#b09837ff", speciallight: "#a467219a", specialdark: "#af5b2a8d",},
    reload: { light: "#3a7eeb99", dark: "#49678bff", speciallight: "#19388d8a", specialdark: "#36b2b995",},
    close: {light: "#ed363693", dark: "#9c4e4eff",speciallight: "#8213138f", specialdark: "#ae3535aa",},
    
    svgColor: {light: 'rgba(39, 39, 39, 0.1)', dark: 'rgba(211, 211, 211, 0.04)',specialdark: 'rgba(143, 143, 143, 0.06)', speciallight: 'rgba(27, 27, 27, 0.11)',},
    mathInput: { light: "#5ed4ff4f", dark: "#303439ff", speciallight: "#d5b1a9ff", specialdark: "#272d28ff" },
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

