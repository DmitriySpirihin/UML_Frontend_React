import React, { useEffect, useRef, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Colors from "../StaticClasses/Colors";
import {
  theme$, lang$, fontSize$, activeTab$,
  setPage, lastPage$,
} from "../StaticClasses/HabitsBus";
import { AppData } from "../StaticClasses/AppData";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import {
  FaRunning, FaBrain, FaBed, FaListUl, FaMedal, FaInfoCircle,
} from "react-icons/fa";
import { MdOutlineSelfImprovement } from "react-icons/md";

const HEADER_TOP_PADDING = "calc(env(safe-area-inset-top, 0px) + 14px)";

const InfoPanel = () => {
  const [theme, setThemeState] = useState(() =>
    AppData?.prefs?.[1] === 0 ? "dark" : "light"
  );
  const [lang, setLang] = useState(() => AppData?.prefs?.[0] ?? 0);
  const [fSize, setFontSize] = useState(0);
  const [activeTab, setActiveTab] = useState("MainCard");

  useEffect(() => {
    const s = activeTab$.subscribe(setActiveTab);
    return () => s.unsubscribe();
  }, []);

  const menuItems = useMemo(
    () => [
      { id: "MainCard",     icon: <FaInfoCircle />,             title: lang === 0 ? "Общее"          : "General",  color: "#404040" },
      { id: "ToDoMain",     icon: <FaListUl />,                 title: lang === 0 ? "Задачи"         : "Tasks",    color: "#FFA64D" },
      { id: "HabitsMain",   icon: <FaMedal />,                  title: lang === 0 ? "Привычки"       : "Habits",   color: "#FFD700" },
      { id: "MentalMain",   icon: <FaBrain />,                  title: lang === 0 ? "Тренировка ума" : "Mind Training", color: "#4DA6FF" },
      { id: "TrainingMain", icon: <FaRunning />,                title: lang === 0 ? "Дневник тренировок" : "Training Log", color: "#FF4D4D" },
      { id: "RecoveryMain", icon: <MdOutlineSelfImprovement />, title: lang === 0 ? "Антистресс" : "Stress Reset", color: "#4DFF88" },
      { id: "SleepMain",    icon: <FaBed />,                    title: lang === 0 ? "Качество сна"   : "Sleep Quality", color: "#A64DFF" },
    ],
    [lang]
  );

  useEffect(() => {
    const s1 = theme$.subscribe(setThemeState);
    const s2 = lang$.subscribe((l) => setLang(l === "ru" ? 0 : 1));
    const s3 = fontSize$.subscribe(setFontSize);
    return () => { s1.unsubscribe(); s2.unsubscribe(); s3.unsubscribe(); };
  }, []);

  const s = getStyles(theme, fSize);

  const accent = useMemo(() => {
    const found = menuItems.find((x) => x.id === activeTab);
    return found?.color || "#6E6E6E";
  }, [menuItems, activeTab]);

  const guideByTab = useMemo(() => ({
    MainCard:     "images/bro.png",
    HabitsMain:   "images/bro_habits.png",
    TrainingMain: "images/bro_training.png",
    MentalMain:   "images/bro_mind.png",
    RecoveryMain: "images/bro_meditating.png",
    SleepMain:    "images/bro_sleeping.png",
    ToDoMain:     "images/bro_task.png",
  }), []);

  const currentGuideImg = guideByTab[activeTab] || "images/bro.png";

  const poseStyle =
    activeTab === "HabitsMain"
      ? { transform: "scale(1.15) translateY(6px)" }
      : { transform: "scale(1.05) translateY(2px)" };

  const htmlContent = useMemo(() => {
    const css = getHtmlCss(theme);
    const body = getInstructions(lang, activeTab, accent);
    return `<style>${css}</style>${body}`;
  }, [theme, lang, activeTab, accent]);

  const tabsContainerRef = useRef(null);
  const tabRefs = useRef({});

  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el && tabsContainerRef.current) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeTab]);

  const handleBack = () => setPage(lastPage$.value || "MainMenu");

  return (
    <div style={s.page}>
      {/* STICKY HEADER */}
      <div style={s.header}>
        <div style={s.topBar}>
          <motion.button
            style={s.backBtn}
            onClick={handleBack}
            whileTap={{ scale: 0.88 }}
          >
            <IoIosArrowBack size={22} />
          </motion.button>
          <span style={s.headerTitle}>{lang === 0 ? "Инструкция" : "User Guide"}</span>
          <div style={{ width: 40 }} />
        </div>

        <div ref={tabsContainerRef} style={s.tabsContainer} className="no-scrollbar">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <motion.div
                key={item.id}
                ref={(el) => { tabRefs.current[item.id] = el; }}
                onClick={() => setActiveTab(item.id)}
                style={s.tabItem(isActive, item.color)}
                whileTap={{ scale: 0.92 }}
              >
                <div style={{ fontSize: "18px", display: "flex" }}>{item.icon}</div>
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    style={s.tabText}
                  >
                    {item.title}
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div style={s.contentWrap}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            style={s.contentContainer}
          >
            {/* COACH ROW */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              style={s.coachRow}
            >
              <motion.img
                key={currentGuideImg}
                src={currentGuideImg}
                alt="Guide"
                style={{ ...s.coachImg, ...poseStyle }}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <div style={s.speech}>
                <div style={s.speechTitle}>{lang === 0 ? "UltyMyBro:" : "Guide:"}</div>
                <div style={s.speechText}>{getCoachText(lang, activeTab)}</div>
                <div style={s.speechTail} />
              </div>
            </motion.div>

            {/* HTML INSTRUCTION */}
            <div style={s.htmlContent} dangerouslySetInnerHTML={{ __html: htmlContent }} />

            {/* GO TO SECTION */}
            <motion.button
              style={s.goToBtn(accent)}
              onClick={() => setPage(getGoToPage(activeTab))}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
            >
              <span>{getGoToLabel(lang, activeTab)}</span>
              <IoIosArrowForward size={18} />
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InfoPanel;

/* ─────────────────────── STYLES ─────────────────────── */

function getStyles(theme, fontSize) {
  const bg     = Colors.get("background",  theme);
  const text   = Colors.get("mainText",    theme);
  const sub    = Colors.get("subText",     theme);
  const panel  = Colors.get("simplePanel", theme);
  const border = Colors.get("border",      theme);

  return {
    page: {
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      overflowY: "auto",
      paddingBottom: "100px",
      backgroundColor: bg,
      fontFamily: "Segoe UI, system-ui, -apple-system, sans-serif",
    },

    header: {
      position: "sticky",
      top: 0,
      zIndex: 10,
      backgroundColor: bg,
      borderBottom: `1px solid ${border}`,
    },

    topBar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: `${HEADER_TOP_PADDING} 16px 12px 16px`,
      minHeight: "68px",
    },

    backBtn: {
      width: 40,
      height: 40,
      borderRadius: "50%",
      border: `1px solid ${border}`,
      background: panel,
      color: text,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      flexShrink: 0,
    },

    headerTitle: {
      fontSize: "20px",
      fontWeight: "900",
      color: text,
      letterSpacing: "0.2px",
    },

    tabsContainer: {
      display: "flex",
      gap: "10px",
      padding: "0 16px 14px 16px",
      overflowX: "auto",
      boxSizing: "border-box",
    },

    tabItem: (isActive, color) => ({
      padding: isActive ? "8px 16px" : "8px 12px",
      borderRadius: "999px",
      backgroundColor: isActive ? color : panel,
      color: isActive ? "#FFF" : sub,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      flexShrink: 0,
      transition: "background-color 0.25s ease",
      border: isActive ? "none" : `1px solid ${border}`,
      boxShadow: isActive ? "0 10px 22px rgba(0,0,0,0.18)" : "none",
    }),

    tabText: {
      fontSize: "14px",
      fontWeight: "800",
      whiteSpace: "nowrap",
      overflow: "hidden",
    },

    contentWrap: {
      width: "100%",
      padding: "18px 16px 0",
      boxSizing: "border-box",
    },

    contentContainer: {
      width: "100%",
      maxWidth: "660px",
      margin: "0 auto",
    },

    coachRow: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "14px",
      marginBottom: "16px",
    },

    coachImg: {
      width: "96px",
      height: "96px",
      objectFit: "contain",
      flexShrink: 0,
      filter:
        theme === "dark"
          ? "drop-shadow(0 16px 22px rgba(0,0,0,0.60))"
          : "drop-shadow(0 12px 18px rgba(0,0,0,0.12))",
    },

    speech: {
      position: "relative",
      flex: 1,
      backgroundColor: panel,
      border: `1px solid ${border}55`,
      borderRadius: "18px",
      padding: "12px 14px",
      boxShadow:
        theme === "dark"
          ? "0 14px 34px rgba(0,0,0,0.42)"
          : "0 10px 26px rgba(0,0,0,0.08)",
    },

    speechTitle: {
      fontSize: "12px",
      fontWeight: 900,
      color: sub,
      opacity: 0.75,
      marginBottom: "6px",
    },

    speechText: {
      fontSize: fontSize === 0 ? "14px" : "16px",
      fontWeight: 800,
      color: text,
      lineHeight: 1.4,
    },

    speechTail: {
      position: "absolute",
      left: "-8px",
      bottom: "18px",
      width: "14px",
      height: "14px",
      backgroundColor: panel,
      borderLeft: `1px solid ${border}55`,
      borderBottom: `1px solid ${border}55`,
      transform: "rotate(45deg)",
      borderBottomLeftRadius: "4px",
    },

    goToBtn: (accentColor) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      width: "100%",
      marginTop: "16px",
      padding: "16px 24px",
      borderRadius: "18px",
      backgroundColor: accentColor,
      color: "#fff",
      border: "none",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "900",
      letterSpacing: "0.3px",
      boxShadow: `0 12px 32px ${accentColor}66`,
      flexShrink: 0,
    }),

    htmlContent: {
      width: "100%",
      backgroundColor: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
      border: `1px solid ${border}55`,
      borderRadius: "22px",
      padding: "18px",
      boxShadow:
        theme === "dark"
          ? "0 22px 60px rgba(0,0,0,0.52)"
          : "0 14px 34px rgba(0,0,0,0.10)",
      color: text,
      lineHeight: 1.55,
      fontSize: fontSize === 0 ? "15px" : "17px",
      boxSizing: "border-box",
      overflow: "hidden",
    },
  };
}

/* ─────────────────────── NAVIGATION HELPERS ─────────────────────── */

function getGoToPage(sectionId) {
  const map = {
    MainCard:     "MainMenu",
    HabitsMain:   "HabitsMain",
    TrainingMain: "TrainingMain",
    MentalMain:   "MentalMain",
    RecoveryMain: "RecoveryMain",
    SleepMain:    "SleepMain",
    ToDoMain:     "ToDoMain",
  };
  return map[sectionId] || "MainMenu";
}

function getGoToLabel(lang, sectionId) {
  const isRu = lang === 0;
  const map = {
    MainCard:     isRu ? "Перейти в главное меню"     : "Go to Main Menu",
    HabitsMain:   isRu ? "Открыть Привычки"           : "Open Habits",
    TrainingMain: isRu ? "Открыть Дневник тренировок"   : "Open Training Log",
    MentalMain:   isRu ? "Открыть Тренировку ума"        : "Open Mind Training",
    RecoveryMain: isRu ? "Открыть Антистресс"            : "Open Stress Reset",
    SleepMain:    isRu ? "Открыть Качество сна"          : "Open Sleep Quality",
    ToDoMain:     isRu ? "Открыть Задачи"                : "Open Tasks",
  };
  return map[sectionId] || (isRu ? "Открыть раздел" : "Open Section");
}

/* ─────────────────────── COACH TEXT ─────────────────────── */

function getCoachText(langIndex, sectionId) {
  const isRu = langIndex === 0;
  const RU = {
    MainCard:     "Сверху вкладки — это телепорт по разделам",
    HabitsMain:   "Привычки — это автопилот",
    TrainingMain: "Дневник тренировок — это доказательства, а не ощущения",
    MentalMain:   "Тренировка ума — это мини-игры: выбери режим, уровень и жми «Начать»",
    RecoveryMain: "Антистресс — это быстрый сброс напряжения",
    SleepMain:    "Качество сна — это чит-код жизни",
    ToDoMain:     "Задачи — это порядок в голове",
  };
  const EN = {
    MainCard:     "Top tabs are your teleport between sections",
    HabitsMain:   "Habits are autopilot",
    TrainingMain: "Training Log is proof, not feelings",
    MentalMain:   "Mind Training mini-games: pick mode, level and hit Start",
    RecoveryMain: "Stress Reset is a quick way to downshift",
    SleepMain:    "Sleep Quality is the cheat code of life",
    ToDoMain:     "Tasks are clarity in motion",
  };
  const dict = isRu ? RU : EN;
  return dict[sectionId] || (isRu ? "Инструкция в разработке…" : "Guide coming soon…");
}

/* ─────────────────────── INSTRUCTIONS ─────────────────────── */

function getInstructions(langIndex, sectionId, accent) {
  const isRu = langIndex === 0;

  const wrap = (title, subtitle, badge, time, stepsHtml, tipHtml, miniHtml = "") => `
    <div class="ux" style="--accent:${accent}">
      <div class="uxHeader">
        <div class="uxTitle">${title}</div>
        <div class="uxSubtitle">${subtitle}</div>
      </div>
      <div class="uxHero">
        <div class="uxHeroGlow"></div>
        <div class="uxHeroTop">
          <div class="uxBadge">${badge}</div>
          <div class="uxMeta">${time}</div>
        </div>
        <div class="uxSteps">${stepsHtml}</div>
        <div class="uxDivider"></div>
        <div class="uxTip">${tipHtml}</div>
      </div>
      ${miniHtml}
    </div>
  `;

  const step = (icon, t, d) => `
    <div class="uxStep">
      <div class="uxNum">${icon}</div>
      <div class="uxStepBody">
        <div class="uxStepTitle">${t}</div>
        <div class="uxStepText">${d}</div>
      </div>
    </div>
  `;

  /* ── GENERAL ── */
  const svg = (paths, vb = "0 0 24 24", w = "20", h = "20") =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}" fill="currentColor">${paths}</svg>`;

  const icoVisOff = svg(`<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>`);
  const icoTack   = svg(`<path d="M298.028 214.267L285.793 96H328c13.255 0 24-10.745 24-24V24c0-13.255-10.745-24-24-24H56C42.745 0 32 10.745 32 24v48c0 13.255 10.745 24 24 24h42.207L85.972 214.267C37.465 236.82 0 277.261 0 328c0 13.255 10.745 24 24 24h144v104l32 56 32-56V352h144c13.255 0 24-10.745 24-24 0-50.739-37.465-91.18-85.972-113.733z"/>`, "0 0 384 512", "16", "20");
  const icoBar    = svg(`<path d="M4 9h4v11H4V9zm6-5h4v16h-4V4zm6 8h4v8h-4v-8z"/>`);
  const icoUsers  = svg(`<path d="M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm32 32h-64c-17.6 0-33.5 7.1-45.1 18.6 40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64zm-256 0c61.9 0 112-50.1 112-112S381.9 32 320 32 208 82.1 208 144s50.1 112 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h65.9c6.3-47.4 34.9-87.3 75.2-109.4z"/>`, "0 0 640 512");
  const icoRobot  = svg(`<path d="M32 224H64V416H32A32 32 0 0 1 0 384V256A32 32 0 0 1 32 224zm512-48V448a64 64 0 0 1-64 64H160a64 64 0 0 1-64-64V176a80 80 0 0 1 80-80H288V32a32 32 0 0 1 64 0V96H416a80 80 0 0 1 80 80zM264 256a40 40 0 1 0-40 40 40 40 0 0 0 40-40zm-8 128H192v32h64zm96 0H288v32h64zM456 256a40 40 0 1 0-40 40 40 40 0 0 0 40-40zm-8 128H384v32h64zM640 256V384a32 32 0 0 1-32 32H576V224h32a32 32 0 0 1 32 32z"/>`, "0 0 640 512");

  /* Unified icon set (react-icons / Material style) */
  const icoPlus    = svg(`<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>`);
  const icoTap     = svg(`<path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74c-3.6-.76-3.54-.75-3.67-.75-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"/>`);
  const icoBolt    = svg(`<path d="M7 2v11h3v9l7-12h-4l4-8z"/>`);
  const icoTrend   = svg(`<path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>`);
  const icoFire    = svg(`<path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>`);
  const icoCog     = svg(`<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7 7 0 00-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84a.48.48 0 00-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.67 8.47a.49.49 0 00.12.61l2.03 1.58c-.05.3-.09.63-.09.94 0 .31.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.01-1.58zM12 15.6a3.6 3.6 0 110-7.2 3.6 3.6 0 010 7.2z"/>`);
  const icoCalend  = svg(`<path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>`);
  const icoPlay    = svg(`<path d="M8 5v14l11-7z"/>`);
  const icoDumb    = svg(`<path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>`);
  const icoEdit    = svg(`<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>`);
  const icoFlag    = svg(`<path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>`);
  const icoTarget  = svg(`<path d="M12 8a4 4 0 100 8 4 4 0 000-8zm8.94 3A8.99 8.99 0 0013 3.06V1h-2v2.06A8.99 8.99 0 003.06 11H1v2h2.06A8.99 8.99 0 0011 20.94V23h2v-2.06A8.99 8.99 0 0020.94 13H23v-2h-2.06zM12 19a7 7 0 110-14 7 7 0 010 14z"/>`);
  const icoPad     = svg(`<path d="M21.58 16.09l-1.09-7.66A4 4 0 0016.53 5H7.47C5.48 5 3.79 6.46 3.51 8.43l-1.09 7.66A2.5 2.5 0 004.94 19h.52c.75 0 1.45-.33 1.92-.92L9 16h6l1.62 2.08c.47.59 1.17.92 1.92.92h.52a2.5 2.5 0 002.52-2.91zM11 11H9v2H7v-2H5V9h2V7h2v2h2v2zm4-1a1 1 0 110-2 1 1 0 010 2zm3 3a1 1 0 110-2 1 1 0 010 2z"/>`);
  const icoBrain   = svg(`<path d="M13 3a7 7 0 00-6.98 6.64L4.1 12.2a.5.5 0 00.4.8H6v3a2 2 0 002 2h1v3h7v-4.68A7 7 0 0013 3zm0 9.57a1.43 1.43 0 110-2.86 1.43 1.43 0 010 2.86z"/>`);
  const icoLeaf    = svg(`<path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>`);
  const icoClip    = svg(`<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 0a1 1 0 110 2 1 1 0 010-2zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>`);
  const icoPause   = svg(`<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`);
  const icoSync    = svg(`<path d="M12 4V1L8 5l4 4V6a6 6 0 016 6c0 1-.25 2-.7 2.8l1.46 1.46A8 8 0 0012 4zm0 14a6 6 0 01-6-6c0-1 .25-2 .7-2.8L5.24 7.74A8 8 0 0012 20v3l4-4-4-4v3z"/>`);
  const icoSpa     = svg(`<path d="M12 15.45C9.85 12.17 6.18 10 2 10c0 5.32 3.36 9.82 8.03 11.49.63.23 1.29.4 1.97.51.68-.12 1.33-.29 1.97-.51C18.64 19.82 22 15.32 22 10c-4.18 0-7.85 2.17-10 5.45zm3.49-5.82A10.6 10.6 0 0012 2a10.6 10.6 0 00-3.49 7.63A11.3 11.3 0 0112 12.26a11.3 11.3 0 013.49-2.63z"/>`);
  const icoMoon    = svg(`<path d="M12.34 2.02C6.59 1.82 2 6.42 2 12a10 10 0 0010 10c3.97 0 7.39-2.31 9.01-5.66.4-.82-.33-1.73-1.22-1.57a7 7 0 01-8.22-8.22c.15-.9-.76-1.62-1.57-1.22z"/>`);
  const icoBed     = svg(`<path d="M7 14a3 3 0 100-6 3 3 0 000 6zm13-6h-8v7H4V5H2v15h2v-2h16v2h2V13a5 5 0 00-5-5z"/>`);
  const icoSave    = svg(`<path d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4zm-5 16a3 3 0 110-6 3 3 0 010 6zm3-10H5V5h10v4z"/>`);
  const icoStar    = svg(`<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>`);
  const icoHammer  = svg(`<path d="M17.66 5.41l.92.92-2.69 2.69-.92-.92 2.69-2.69M17.66 3c-.26 0-.51.1-.71.29l-4.1 4.1 4.34 4.34 4.1-4.1a.996.996 0 000-1.41l-2.93-2.93A.99.99 0 0017.66 3zm-5.92 5.58L3.29 17.04a.996.996 0 000 1.41l2.25 2.25c.39.39 1.02.39 1.41 0l8.46-8.46-3.67-3.66z"/>`);
  const icoCheck   = svg(`<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>`);
  const icoSparkle = svg(`<path d="M12 2l1.8 5.7L19 9.5l-5.2 1.8L12 17l-1.8-5.7L5 9.5l5.2-1.8L12 2zm7 11l.9 2.6L22 16.5l-2.1.9L19 20l-.9-2.6L16 16.5l2.1-.9L19 13z"/>`);

  const MainRu = wrap(
    "Главное меню",
    "Всё самое важное — прямо с главного экрана",
    "ГЛАВНАЯ", "1 мин",
    [
      step(icoVisOff, "Скрытие разделов",    "Скрывайте ненужные блоки свайпом влево, чтобы оставить только самое важное."),
      step(icoTack,   "Закрепление",          "Закрепляйте приоритетные разделы свайпом вправо в самом верху списка."),
      step(icoBar,    "Мини-статистика",      "Следите за прогрессом и активностью прямо с главного экрана."),
      step(icoUsers,  "Реферальная система",  "Приглашайте друзей и получайте Premium-подписку бесплатно."),
      step(icoRobot,  "ИИ Ассистент",         "Ваш личный ИИ-помощник всегда готов ответить на вопросы."),
    ].join(""),
    `<div class="uxTipIcon">${icoSparkle}</div><div class="uxTipText">Настрой главный экран под себя — скрой лишнее, закрепи важное.</div>`
  );

  const MainEn = wrap(
    "Main Menu",
    "Everything that matters — right on the main screen",
    "MAIN", "1 min",
    [
      step(icoVisOff, "Hide sections",      "Hide unnecessary blocks by swiping left to keep only what matters."),
      step(icoTack,   "Pin sections",       "Pin priority sections to the top by swiping right."),
      step(icoBar,    "Mini-stats",         "Track progress and activity directly from the main screen."),
      step(icoUsers,  "Referral system",    "Invite friends and get Premium subscription for free."),
      step(icoRobot,  "AI Assistant",       "Your personal AI assistant is always ready to help."),
    ].join(""),
    `<div class="uxTipIcon">${icoSparkle}</div><div class="uxTipText">Customize your main screen — hide the noise, pin what matters.</div>`
  );

  /* ── HABITS ── */
  // Icons: ➕ add, 👆 swipe, ⚡ quit-bad, 📈 streak/progress — tip: 🔥
  const HabitsRu = wrap(
    "Привычки",
    "Добавляй, отмечай свайпом, наблюдай прогресс",
    "ПРИВЫЧКИ", "1–3 мин",
    [
      step(icoPlus,  "Добавь привычку", `Нажми <span class="uxChip uxChipPlus">＋</span> → выбери из списка или создай свою. Укажи дату старта и цели-ступени.`),
      step(icoTap,   "Отмечай свайпом", `<b>Вправо</b> — сделал. <b>Влево</b> — пропуск. Ещё раз — нейтрально.`),
      step(icoBolt,  "«Отказ от вредного»", `Счётчик меряет <b>время без срыва</b>. Сорвался? Свайп влево — таймер сбрасывается.`),
      step(icoTrend, "Серия и прогресс", `Серия растёт только от выполненных дней. Цель — <b>66 дней</b> до автоматизма.`),
    ].join(""),
    `<div class="uxTipIcon">${icoFire}</div><div class="uxTipText">Быстрый старт: <b>1 привычка → 1 время → 7 дней.</b> Не идеально — стабильно.</div>`,
    `<div class="uxMini">
      <div class="uxMiniCard"><div class="uxMiniTitle">Минимум</div><div class="uxMiniText">2-минутная версия — привычка приживается быстрее.</div></div>
      <div class="uxMiniCard"><div class="uxMiniTitle">Этапы</div><div class="uxMiniText">3–5 целей-ступеней: мозг любит чёткие «уровни».</div></div>
    </div>`
  );

  // Icons: ➕ add, 👆 swipe, ⚡ quit-bad, 📈 streak — tip: 🔥
  const HabitsEn = wrap(
    "Habits",
    "Add, mark with a swipe, watch your progress",
    "HABITS", "1–3 min",
    [
      step(icoPlus,  "Add a habit", `Tap <span class="uxChip uxChipPlus">＋</span> → pick from the list or create your own. Set a start date and milestone goals.`),
      step(icoTap,   "Mark the day", `<b>Right</b> — done. <b>Left</b> — missed. Swipe again to go neutral.`),
      step(icoBolt,  "Quit a bad habit", `Tracks <b>time without relapse</b>. Relapsed? Swipe left — resets the timer.`),
      step(icoTrend, "Streak & progress", `Streak grows only from completed days. Goal — <b>66 days</b> to automaticity.`),
    ].join(""),
    `<div class="uxTipIcon">${icoFire}</div><div class="uxTipText">Quick start: <b>1 habit → 1 time → 7 days.</b> Consistency over perfection.</div>`,
    `<div class="uxMini">
      <div class="uxMiniCard"><div class="uxMiniTitle">Minimum</div><div class="uxMiniText">2-minute version — habits stick faster.</div></div>
      <div class="uxMiniCard"><div class="uxMiniTitle">Milestones</div><div class="uxMiniText">3–5 steps. Clear levels = better motivation.</div></div>
    </div>`
  );

  /* ── TRAINING ── */
  // Icons: ⚙️ setup, 📅 pick day, ▶️ start, 💪 exercises, 📝 log sets, 🏁 finish — tip: 🏋️
  const TrainingRu = wrap(
    "Дневник тренировок",
    "Программа → День → Сессия → Упражнения → Подходы",
    "ТРЕНИРОВКА", "2–8 мин",
    [
      step(icoCog,    "Настрой программу", "Создай программу, добавь день и упражнения. Пустая программа — сессия не стартует."),
      step(icoCalend, "Выбери день", "Тап по дате: видишь тренировки (черновик / готово)."),
      step(icoPlay,   "Стартуй сессию", "Новая тренировка или тап по карточке — продолжить / поправить."),
      step(icoDumb,   "Добавь упражнения", "Добавляй из программы. Можно создать свои варианты."),
      step(icoEdit,   "Заполни подходы", "Повторения + вес. Тоннаж считается автоматически: вес × повторы."),
      step(icoFlag,   "Заверши", "Жми «Финиш» — всё сохраняется. Ничего вручную «сохранять» не нужно."),
    ].join(""),
    `<div class="uxTipIcon">${icoDumb}</div><div class="uxTipText">Минимум: <b>3 упражнения × 2–3 подхода</b>. Главное — записать хоть что-то.</div>`,
    `<div class="uxMini">
      <div class="uxMiniCard"><div class="uxMiniTitle">Как расти</div><div class="uxMiniText">+1 повтор или +1–2.5 кг к прошлой сессии — этого достаточно.</div></div>
      <div class="uxMiniCard"><div class="uxMiniTitle">Тоннаж</div><div class="uxMiniText">вес × повторы — показывает объём нагрузки.</div></div>
      <div class="uxMiniCard"><div class="uxMiniTitle">1RM</div><div class="uxMiniText">Примерная сила — считается автоматически (формула Эпли).</div></div>
      <div class="uxMiniCard"><div class="uxMiniTitle">Устал?</div><div class="uxMiniText">Уменьши объём, но не пропадай. Регулярность важнее героизма.</div></div>
    </div>`
  );

  const TrainingEn = wrap(
    "Training Log",
    "Program → Day → Session → Exercises → Sets",
    "WORKOUT", "2–8 min",
    [
      step(icoCog,    "Set up a program", "Create a program, add at least 1 day + exercises. Empty program = no session."),
      step(icoCalend, "Pick a day", "Tap a date to see sessions (draft / done)."),
      step(icoPlay,   "Start a session", "Start a new workout or tap a card to continue / edit."),
      step(icoDumb,   "Add exercises", "Add from your program. Custom exercises are fine."),
      step(icoEdit,   "Log sets", "Reps + weight. Tonnage is auto: weight × reps."),
      step(icoFlag,   "Finish", "Tap Finish — saved instantly."),
    ].join(""),
    `<div class="uxTipIcon">${icoDumb}</div><div class="uxTipText"><b>3 exercises × 2–3 sets</b> is all you need to start. Consistency wins.</div>`
  );

  /* ── BRAIN ── */
  // Icons: 🎯 mode, 🔢 level, 🕹️ play — tip: 🧠 (different from step 1 icon 🎯)
  const MindRu = wrap(
    "Тренировка ума",
    "Режим → Уровень → Раунды → Очки → Рекорд",
    "УМ", "3–8 мин",
    [
      step(icoTarget, "Выбери режим", `<b>Фокус</b> — считай символы среди помех. <b>Память</b> — запомни и введи. <b>Счёт</b> — быстрые примеры. <b>Логика</b> — найди «лишнее».`),
      step(icoBar,    "Выбери уровень", "Чем выше — тем больше элементов и меньше времени. Часть уровней — Премиум."),
      step(icoPad,    "Играй раундами", "Каждый раунд = очки. Итог сравнивается с рекордом и сохраняется автоматически."),
    ].join(""),
    `<div class="uxTipIcon">${icoBrain}</div><div class="uxTipText">Старт: <b>1 режим + 1 уровень + 7 дней</b>. Ум любит повторение.</div>`,
    `<div class="uxMini">
      <div class="uxMiniCard"><div class="uxMiniTitle">Фокус</div><div class="uxMiniText">Найди и посчитай символы за лимит времени.</div></div>
      <div class="uxMiniCard"><div class="uxMiniTitle">Память</div><div class="uxMiniText">Запомни последовательность → введи. На высоких уровнях — обратный режим.</div></div>
      <div class="uxMiniCard"><div class="uxMiniTitle">Счёт</div><div class="uxMiniText">Режим «до первой ошибки» и «без таймера».</div></div>
      <div class="uxMiniCard"><div class="uxMiniTitle">Логика</div><div class="uxMiniText">Найди один неверный элемент в ряду по правилу.</div></div>
    </div>`
  );

  // Icons: 🎯 mode, 🔢 level, 🕹️ play — tip: 🧠
  const MindEn = wrap(
    "Mind Training",
    "Mode → Level → Rounds → Score → Record",
    "MIND", "3–8 min",
    [
      step(icoTarget, "Pick a mode", `<b>Focus</b> — count symbols among distractors. <b>Memory</b> — memorize & enter. <b>Math</b> — fast calculations. <b>Logic</b> — find the odd one out.`),
      step(icoBar,    "Pick difficulty", "Higher = more elements, less time. Some levels are Premium."),
      step(icoPad,    "Play rounds", "Each round gives points. Your record updates automatically."),
    ].join(""),
    `<div class="uxTipIcon">${icoBrain}</div><div class="uxTipText">Best start: <b>one mode + one level + 7 days</b>. Repetition beats intensity.</div>`
  );

  /* ── RECOVERY ── */
  // Icons: 🌿 direction, 📋 protocol, ⏸️ session, 🔄 repeat — tip: 🧘
  const RecoveryRu = wrap(
    "Антистресс",
    "Дыхание, медитация, закалка — быстрый сброс напряжения",
    "ПРАКТИКА", "3–10 мин",
    [
      step(icoLeaf,  "Выбери направление", "Дыхание / Медитация / Закалка — у каждого свои протоколы."),
      step(icoClip,  "Открой протокол", "Тап по карточке → запусти сессию. Часть протоколов — Премиум."),
      step(icoPause, "Пройди сессию", "Можно ставить паузу и продолжать. В конце — нажми «Финиш», чтобы сохранить."),
      step(icoSync,  "Повторяй часто", "3–5 мин ежедневно — лучше, чем редко и долго."),
    ].join(""),
    `<div class="uxTipIcon">${icoSpa}</div><div class="uxTipText">Успокоиться — медитация. Бодрость — закалка. Нейтрально — дыхание 3–5 мин.</div>`,
    `<div class="uxMini">
      <div class="uxMiniCard"><div class="uxMiniTitle">Пауза</div><div class="uxMiniText">Пауза → «Продолжить» или «Финиш». «Финиш» фиксирует сессию.</div></div>
      <div class="uxMiniCard"><div class="uxMiniTitle">Зачем «Финиш»</div><div class="uxMiniText">Пока не нажал — прогресс не сохранится.</div></div>
    </div>`
  );

  const RecoveryEn = wrap(
    "Stress Reset",
    "Breathing, meditation, hardening — reset fast",
    "RESET", "3–10 min",
    [
      step(icoLeaf,  "Pick a direction", "Breathing / Meditation / Hardening — each has its own protocols."),
      step(icoClip,  "Open a protocol", "Tap the card → start session. Some items require Premium."),
      step(icoPause, "Run the session", "Pause and resume anytime. Press Finish to save."),
      step(icoSync,  "Repeat often", "3–5 min daily beats rare long sessions."),
    ].join(""),
    `<div class="uxTipIcon">${icoSpa}</div><div class="uxTipText">Calm — meditation. Energy — hardening. Default — breathing 3–5 min.</div>`
  );

  /* ── SLEEP ── */
  // Icons: 📅 pick day, 🛌 add entry (not 🌙 to avoid dup with tip), 📝 note, 💾 save — tip: 🌙
  const SleepRu = wrap(
    "Качество сна",
    "3 поля — и ты видишь, что реально влияет на энергию",
    "ЖУРНАЛ СНА", "30 сек",
    [
      step(icoCalend, "Выбери день", "Тап по дате. Высота заливки = длительность, цвет = самочувствие."),
      step(icoBed,    "Добавь запись", "Время отбоя + Длительность (3–14 ч) + Самочувствие (1–5)."),
      step(icoEdit,   "Добавь заметку (по желанию)", "Кофеин / тренировка / стресс / экран / алкоголь — потом даст инсайты."),
      step(icoSave,   "Сохрани", "На карточке дня увидишь: отбой, длительность, настроение и заметку."),
    ].join(""),
    `<div class="uxTipIcon">${icoMoon}</div><div class="uxTipText"><b>Правило:</b> нельзя логировать сон на будущие даты. Заполняй сегодня или вчера.</div>`,
    `<div class="uxMini">
      <div class="uxMiniCard"><div class="uxMiniTitle">Минимум</div><div class="uxMiniText">Только длительность + самочувствие — уже достаточно для статистики.</div></div>
      <div class="uxMiniCard"><div class="uxMiniTitle">Эксперимент</div><div class="uxMiniText">Меняй 1 фактор на 3 дня (например, без кофе после 16:00).</div></div>
    </div>`
  );

  // Icons: 📅 pick day, 🛌 add entry, 📝 note, 💾 save — tip: 🌙
  const SleepEn = wrap(
    "Sleep Quality",
    "3 fields — discover what truly impacts your energy",
    "SLEEP LOG", "30 sec",
    [
      step(icoCalend, "Pick a day", "Tap a date. Fill height = duration, color = mood."),
      step(icoBed,    "Add an entry", "Bedtime + Duration (3–14h) + Mood (1–5)."),
      step(icoEdit,   "Add a note (optional)", "Caffeine / workout / stress / screens / alcohol — insights come later."),
      step(icoSave,   "Save", "You'll see bedtime, duration, mood stars and note on the day card."),
    ].join(""),
    `<div class="uxTipIcon">${icoMoon}</div><div class="uxTipText"><b>Rule:</b> you can't log sleep for future dates.</div>`
  );

  /* ── TO-DO ── */
  // Icons: ✏️ add (not ➕ to avoid dup with Habits), ⭐ priority, 🔨 break — tip: ✅
  const ToDoRu = wrap(
    "Задачи",
    "Порядок в голове — скорость в жизни",
    "ЗАДАЧИ", "каждый день",
    [
      step(icoEdit,   "Добавь задачи", `Нажми <span class="uxChip uxChipPlus">＋</span> и вывали всё, что давит на мозг.`),
      step(icoStar,   "Выбери приоритеты", "Оставь 1–3 главных на сегодня. Остальное — вторично."),
      step(icoHammer, "Дроби и закрывай", "Разбей большую задачу на шаги и закрывай по одному."),
    ].join(""),
    `<div class="uxTipIcon">${icoCheck}</div><div class="uxTipText">Формула дня: <b>1 важное + 1 полезное + 1 быстрое.</b></div>`,
    `<div class="uxMini">
      <div class="uxMiniCard"><div class="uxMiniTitle">Антипрокраст</div><div class="uxMiniText">Начни с «самого лёгкого шага» на 2 минуты.</div></div>
      <div class="uxMiniCard"><div class="uxMiniTitle">Чистота</div><div class="uxMiniText">Задача висит 7+ дней — разбей или удали.</div></div>
    </div>`
  );

  const ToDoEn = wrap(
    "Tasks",
    "A clear mind moves faster",
    "TASKS", "daily",
    [
      step(icoEdit,   "Add tasks", `Tap <span class="uxChip uxChipPlus">＋</span> and dump everything on your mind.`),
      step(icoStar,   "Pick priorities", "Keep 1–3 main tasks for today."),
      step(icoHammer, "Break & close", "Split big tasks into steps and close them one by one."),
    ].join(""),
    `<div class="uxTipIcon">${icoCheck}</div><div class="uxTipText">Daily formula: <b>1 important + 1 useful + 1 quick win.</b></div>`
  );

  switch (sectionId) {
    case "MainCard":     return isRu ? MainRu     : MainEn;
    case "HabitsMain":   return isRu ? HabitsRu   : HabitsEn;
    case "TrainingMain": return isRu ? TrainingRu  : TrainingEn;
    case "MentalMain":   return isRu ? MindRu      : MindEn;
    case "RecoveryMain": return isRu ? RecoveryRu  : RecoveryEn;
    case "SleepMain":    return isRu ? SleepRu     : SleepEn;
    case "ToDoMain":     return isRu ? ToDoRu      : ToDoEn;
    default:
      return isRu
        ? wrap("Скоро", "Инструкция для этого раздела допиливается", "В РАБОТЕ", "",
            step(icoSync, "Чуть терпения", "Раздел в разработке."),
            `<div class="uxTipIcon">${icoSparkle}</div><div class="uxTipText">Вкладки сверху → читаешь → делаешь.</div>`)
        : wrap("Coming Soon", "Guide for this section is being polished", "IN PROGRESS", "",
            step(icoSync, "A moment", "This section is in progress."),
            `<div class="uxTipIcon">${icoSparkle}</div><div class="uxTipText">Top tabs → read → do.</div>`);
  }
}

/* ─────────────────────── HTML CSS ─────────────────────── */

function getHtmlCss(theme) {
  const isDark = theme === "dark";
  const text   = isDark ? "rgba(255,255,255,0.92)" : "rgba(10,10,10,0.92)";
  const sub    = isDark ? "rgba(255,255,255,0.58)" : "rgba(10,10,10,0.55)";
  const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const bg1    = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.75)";
  const bg2    = isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.55)";

  /* Icon circle: subtle neutral bg — unified dark-luxury look */
  const numBg  = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const tipBg  = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.035)";
  const iconCol = isDark ? "rgba(255,255,255,0.78)" : "rgba(10,10,10,0.72)";

  return `
    .ux{ width:100%; }

    .uxHeader{ text-align:center; margin-bottom:14px; }
    .uxTitle{ font-size:26px; font-weight:950; letter-spacing:.2px; color:${text}; margin-bottom:6px; }
    .uxSubtitle{ font-size:14px; color:${sub}; line-height:1.45; font-style:italic; max-width:520px; margin:0 auto; }

    .uxHero{
      position:relative; overflow:hidden; border-radius:24px;
      border:1px solid ${border};
      background:linear-gradient(180deg,${bg1},${bg2});
      box-shadow:${isDark ? "0 28px 70px rgba(0,0,0,0.60)" : "0 20px 50px rgba(0,0,0,0.12)"};
      backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
      padding:16px;
    }

    .uxHeroGlow{
      position:absolute; inset:-140px -120px auto -120px; height:280px;
      background:radial-gradient(circle at 45% 45%, color-mix(in srgb, var(--accent) 40%, transparent), transparent 60%);
      pointer-events:none; filter:blur(2px);
      opacity:${isDark ? "0.75" : "0.55"};
    }

    .uxHeroTop{ position:relative; display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }

    .uxBadge{
      font-size:12px; font-weight:900; padding:6px 10px; border-radius:999px;
      border:1px solid ${border};
      background:${isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.60)"};
      color:${text}; letter-spacing:.3px; text-transform:uppercase;
    }
    .uxMeta{ font-size:12px; color:${sub}; font-weight:800; }

    .uxSteps{ position:relative; display:flex; flex-direction:column; gap:12px; margin-top:4px; }

    .uxStep{
      display:flex; gap:16px; align-items:flex-start;
      padding:14px 12px; border-radius:18px;
      border:1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"};
      background:${isDark ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.55)"};
    }

    .uxNum{
      width:38px; height:38px; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-size:19px; line-height:1; flex-shrink:0;
      border:1px solid ${border};
      background:${numBg};
      color:${iconCol};
      box-shadow:none;
    }
    .uxNum svg{ display:block; }

    .uxStepBody{ flex:1; padding-top:3px; }
    .uxStepTitle{ font-size:15px; font-weight:950; color:${text}; margin-bottom:5px; letter-spacing:.1px; }
    .uxStepText{ font-size:14px; font-weight:700; color:${text}; line-height:1.5; }

    .uxChip{
      display:inline-flex; align-items:center; justify-content:center;
      min-width:30px; height:24px; padding:0 8px; margin:0 5px;
      border-radius:10px; border:1px solid ${border};
      font-weight:950; font-size:14px; transform:translateY(-1px); user-select:none;
    }
    .uxChipPlus{ background:color-mix(in srgb, var(--accent) 22%, transparent); }
    .uxChipOk{ background:${isDark ? "rgba(90,255,170,0.14)" : "rgba(90,255,170,0.10)"}; }

    .uxDivider{ height:1px; background:${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}; margin:16px 0 14px 0; }

    .uxTip{
      display:flex; gap:14px; align-items:flex-start;
      padding:14px 12px; border-radius:18px;
      border:1px dashed ${border};
      background:${isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.60)"};
    }
    .uxTipIcon{
      width:32px; height:32px; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-size:17px; line-height:1; flex-shrink:0;
      border:1px solid ${border};
      background:${tipBg};
      color:${iconCol};
      box-shadow:none;
    }
    .uxTipIcon svg{ display:block; }
    .uxTipText{ color:${text}; font-weight:850; font-size:14px; line-height:1.45; }

    .uxMini{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:14px; }
    .uxMiniCard{
      border-radius:18px; border:1px solid ${border};
      background:${isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.65)"};
      padding:14px 12px;
      box-shadow:${isDark ? "0 16px 40px rgba(0,0,0,0.40)" : "0 12px 30px rgba(0,0,0,0.08)"};
    }
    .uxMiniTitle{
      color:${text}; font-weight:950; font-size:13px;
      margin-bottom:6px; letter-spacing:.2px; text-transform:uppercase; opacity:.9;
    }
    .uxMiniText{ color:${sub}; font-weight:800; font-size:13px; line-height:1.45; }
  `;
}
