import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Colors from "../StaticClasses/Colors";
import { theme$, lang$, fontSize$ ,activeTab$} from "../StaticClasses/HabitsBus";
import { AppData } from "../StaticClasses/AppData";
import {
  FaRunning,
  FaBrain,
  FaBed,
  FaListUl,
  FaMedal,
  FaInfoCircle,
} from "react-icons/fa";
import { MdOutlineSelfImprovement } from "react-icons/md";


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
      { id: "MainCard", icon: <FaInfoCircle />, title: lang === 0 ? "Общее" : "General", color: "#404040" },
      { id: "HabitsMain", icon: <FaMedal />, title: lang === 0 ? "Привычки" : "Habits", color: "#FFD700" },
      { id: "TrainingMain", icon: <FaRunning />, title: lang === 0 ? "Тренировки" : "Workout", color: "#FF4D4D" },
      { id: "MentalMain", icon: <FaBrain />, title: lang === 0 ? "Мозг" : "Brain", color: "#4DA6FF" },
      { id: "RecoveryMain", icon: <MdOutlineSelfImprovement />, title: lang === 0 ? "Восстановление" : "Recovery", color: "#4DFF88" },
      { id: "SleepMain", icon: <FaBed />, title: lang === 0 ? "Сон" : "Sleep", color: "#A64DFF" },
      { id: "ToDoMain", icon: <FaListUl />, title: lang === 0 ? "Задачи" : "To-Do", color: "#FFA64D" },
    ],
    [lang]
  );

  useEffect(() => {
    const s1 = theme$.subscribe(setThemeState);
    const s2 = lang$.subscribe((l) => setLang(l === "ru" ? 0 : 1));
    const s3 = fontSize$.subscribe(setFontSize);
    return () => {
      s1.unsubscribe();
      s2.unsubscribe();
      s3.unsubscribe();
    };
  }, []);

  const s = getStyles(theme, fSize);

  const accent = useMemo(() => {
    const found = menuItems.find((x) => x.id === activeTab);
    return found?.color || "#6E6E6E";
  }, [menuItems, activeTab]);

const guideByTab = useMemo(
  () => ({
    MainCard: 'images/bro.png',
    HabitsMain: 'images/bro_habits.png',
    TrainingMain: 'images/bro_training.png',
    MentalMain: 'images/bro_mind.png',
    RecoveryMain: 'images/bro_meditating.png',
    SleepMain: 'images/bro_sleeping.png',
    ToDoMain: 'images/bro_task.png',
  }),
  []
);



  const currentGuideImg = guideByTab[activeTab] || guideMain;

  const poseStyle =
    activeTab === "HabitsMain"
      ? { transform: "scale(1.15) translateY(6px)" }
      : { transform: "scale(1.05) translateY(2px)" };

  const htmlContent = useMemo(() => {
    const css = getHtmlCss(theme);
    const body = getInstructions(lang, activeTab, accent);
    return `<style>${css}</style>${body}`;
  }, [theme, lang, activeTab, accent]);

  return (
    <div style={s.container}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.topBar}>
          <span style={s.headerTitle}>{lang === 0 ? "Инструкция" : "User Guide"}</span>
          <div style={{ width: 40 }} />
        </div>

        <div style={s.tabsContainer} className="no-scrollbar">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <motion.div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={s.tabItem(isActive, item.color)}
                whileTap={{ scale: 0.95 }}
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
      <div style={s.scrollView} className="no-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            style={s.contentContainer}
          >
            {/* GUIDE ROW */}
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
          </motion.div>
        </AnimatePresence>

        <div style={{ height: "110px" }} />
      </div>
    </div>
  );
};

export default InfoPanel;

/* ---------------- STYLES ---------------- */

function getStyles(theme, fontSize) {
  const bg = Colors.get("background", theme);
  const text = Colors.get("mainText", theme);
  const sub = Colors.get("subText", theme);
  const panel = Colors.get("simplePanel", theme);
  const border = Colors.get("border", theme);

  return {
    container: {
      backgroundColor: bg,
      display: "flex",
      flexDirection: "column",
      height: "90vh",
      marginTop: "100px",
      width: "100vw",
      fontFamily: "Segoe UI, system-ui, -apple-system, sans-serif",
      overflow: "hidden",
    },
    header: {
      width: "100%",
      backgroundColor: bg,
      paddingTop: "40px",
      borderBottom: `1px solid ${border}`,
      zIndex: 10,
    },
    topBar: {
      display: "flex",
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 20px 15px 20px",
      boxSizing: "border-box",
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
      padding: "0 20px 15px 20px",
      overflowX: "auto",
      width: "100%",
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

    scrollView: {
      flex: 1,
      width: "100%",
      overflowY: "auto",
      padding: "18px 18px",
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
      marginBottom: "14px",
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
      lineHeight: 1.35,
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

    htmlContent: {
      width: "100%",
      backgroundColor: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
      border: `1px solid ${border}55`,
      borderRadius: "22px",
      padding: "16px 16px",
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

/* ---------------- TEXT HELPERS ---------------- */

function getCoachText(langIndex, sectionId) {
  const isRu = langIndex === 0;

  const RU = {
    MainCard: "Сверху вкладки — это телепорт по разделам",
    HabitsMain: "Привычки — это автопилот",
TrainingMain: "Тренировки — это доказательства, а не ощущения",
MentalMain: "Мозг — это мини-игры: выбери режим, уровень и жми «Начать» ",


RecoveryMain: "Восстановление — это быстрый сброс стресса",

SleepMain: "Сон — это чит-код жизни ",
ToDoMain: "Задачи — это порядок в голове",

  };

  const EN = {
MainCard: "At the top of the tab is a teleport across sections",
    HabitsMain: "Habits are an autopilot",
TrainingMain: "Workouts are proofs, not sensations",
MentalMain: "The brain is a mini-game: select the mode, level and click 'Start'", 


RecoveryMain: "Recovery is a quick stress relief",

SleepMain: "Sleep is the cheat code of life",
ToDoMain: "Tasks are an order in the head",

  };

  const dict = isRu ? RU : EN;
  return dict[sectionId] || (isRu ? "Инструкция в разработке…" : "Guide coming soon…");
}

function getInstructions(langIndex, sectionId, accent) {
  const isRu = langIndex === 0;

  const wrap = (title, subtitle, badgeLeft, badgeRight, stepsHtml, tipHtml, miniHtml = "") => `
    <div class="ux" style="--accent:${accent}">
      <div class="uxHeader">
        <div class="uxTitle">${title}</div>
        <div class="uxSubtitle">${subtitle}</div>
      </div>

      <div class="uxHero">
        <div class="uxHeroGlow"></div>

        <div class="uxHeroTop">
          <div class="uxBadge">${badgeLeft}</div>
          <div class="uxMeta">${badgeRight}</div>
        </div>

        <div class="uxSteps">
          ${stepsHtml}
        </div>

        <div class="uxDivider"></div>

        <div class="uxTip">
          ${tipHtml}
        </div>
      </div>

      ${miniHtml}
    </div>
  `;

  const step = (n, t, d) => `
    <div class="uxStep">
      <div class="uxNum">${n}</div>
      <div class="uxStepBody">
        <div class="uxStepTitle">${t}</div>
        <div class="uxStepText">${d}</div>
      </div>
    </div>
  `;

  // ОБЩЕЕ
  const MainRu = wrap(
    "Инструкция",
    "Коротко, красиво и по делу — как пользоваться UltyMyLife",
    "Quick Start",
    "1 минута",
    [
      step("1", "Навигация", "Все разделы доступны из главного меню — вкладки сверху.Можешь скрыть или закрепить свайпом. "),
      
      step("2", "Авто-сохранение", "Данные сохраняются сразу. Никаких “ой, не сохранилось”."),
      step(
        "3",
        "Управление",
        `Создавай через <span class="uxChip uxChipPlus">＋</span> и завершай через <span class="uxChip uxChipOk">✓</span>.`
      ),
    ].join(""),
    `<div class="uxTipIcon">●</div><div class="uxTipText">Старт: выбери <b>один</b> раздел и веди его 7 дней — так формируется привычка.</div>`,
    `
      <div class="uxMini">
        <div class="uxMiniCard">
          <div class="uxMiniTitle">Ритм</div>
          <div class="uxMiniText">Лучше 5 минут ежедневно, чем 1 час раз в неделю.</div>
        </div>
        <div class="uxMiniCard">
          <div class="uxMiniTitle">Фокус</div>
          <div class="uxMiniText">Не начинай с 5 разделов — мозг устроит митинг протеста.</div>
        </div>
      </div>
    `
  );

  const MainEn = wrap(
    "User Guide",
    "Clean and quick — how to use UltyMyLife",
    "Quick Start",
    "1 minute",
    [
      step("1", "Navigation", "Use top tabs to switch sections.Can hide or pin with swipe."),
      step("2", "Auto-save", "Data saves instantly."),
      step(
        "3",
        "Controls",
        `Add with <span class="uxChip uxChipPlus">＋</span> and complete with <span class="uxChip uxChipOk">✓</span>.`
      ),
    ].join(""),
    `<div class="uxTipIcon">●</div><div class="uxTipText">Starter tip: pick <b>one</b> section and stick to it for 7 days.</div>`
  );

  // ПРИВЫЧКИ (то, что тебе сейчас нужно)
// ПРИВЫЧКИ — улучшенная инструкция (под вашу реальную логику свайпов/таймера)
const HabitsRu = wrap(
  "Привычки",
  "Быстро разобраться: как добавлять, отмечать и видеть прогресс",
  "HABITS",
  "1–3 мин",
  [
    step(
      "1",
      "Добавь привычку",
      `Нажми <span class="uxChip uxChipPlus">＋</span> → выбери из списка <b>или</b> создай свою. Дальше: дата старта + этапы (цели).`
    ),
    step(
      "2",
      "Отмечай день свайпом",
      `<b>Обычная привычка:</b> свайп <b>вправо</b> — ✅ сделал, свайп <b>влево</b> — ❌ пропуск. Ошибся? свайпни ещё раз и вернись в нейтральное состояние.`
    ),
    step(
      "3",
      "Если это “Отказ от вредного” — там другой смысл",
      `Тут приложение считает <b>время без срыва</b>. День “победы” проставляется сам. Если сорвался — сделай <b>свайп влево</b>: это отметит срыв и <b>сбросит таймер</b>.`
    ),
    step(
      "4",
      "Понимай прогресс правильно",
      `Серия (<b>streak</b>) растёт только от ✅ дней. В метриках прогресс идёт к “автоматизму” — обычно это <b>66 дней</b> (а для отказа ставится больше).`
    ),
  ].join(""),
  `<div class="uxTipIcon">🔥</div><div class="uxTipText">
    Быстрый старт: <b>1 привычка</b> → <b>одно время</b> → <b>7 дней</b>. Твоя цель сейчас — не “идеально”, а “стабильно”.
  </div>`,
  `
    <div class="uxMini">
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Формула</div>
        <div class="uxMiniText">Сделай действие “на минимум” (2 минуты) — так привычка приживается быстрее.</div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Этапы</div>
        <div class="uxMiniText">Добавляй 3–5 целей-ступеней: мозг любит понятные “уровни”.</div>
      </div>
    </div>
  `
);

const HabitsEn = wrap(
  "Habits",
  "Quick clarity: add, mark days, and understand progress",
  "HABITS",
  "1–3 min",
  [
    step(
      "1",
      "Add a habit",
      `Tap <span class="uxChip uxChipPlus">＋</span> → pick from the list <b>or</b> create your own. Set start date + milestone goals.`
    ),
    step(
      "2",
      "Mark the day with a swipe",
      `<b>Regular habit:</b> swipe <b>right</b> — ✅ done, swipe <b>left</b> — ❌ missed. If you mis-tapped, swipe again to return to neutral.`
    ),
    step(
      "3",
      "“Quit a bad habit” works differently",
      `Here the app tracks <b>time without relapse</b>. A “win day” is set automatically. Relapse? <b>Swipe left</b> to mark it and <b>reset the timer</b>.`
    ),
    step(
      "4",
      "Read progress correctly",
      `Your <b>streak</b> grows only from ✅ days. Metrics show progress toward “automaticity” — usually <b>66 days</b> (more for quitting).`
    ),
  ].join(""),
  `<div class="uxTipIcon">🔥</div><div class="uxTipText">
    Starter mode: <b>1 habit</b> → <b>one time</b> → <b>7 days</b>. Aim for consistency, not perfection.
  </div>`,
  `
    <div class="uxMini">
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Minimum</div>
        <div class="uxMiniText">Do the 2-minute version — consistency becomes effortless.</div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Milestones</div>
        <div class="uxMiniText">Add 3–5 steps. Clear levels = better motivation.</div>
      </div>
    </div>
  `
);

  // ТРЕНИРОВКИ
  const TrainingRu = wrap(
  "Тренировки",
  "Логика: Программа → День → Сессия → Упражнения → Подходы",
  "WORKOUT",
  "2–8 минут",
  [
    step(
      "0",
      "Один раз настрой программу",
      "Зайди в «Программы»: создай программу, добавь хотя бы 1 день и упражнения. " +
        "Если программа пустая — сессия не стартует."
    ),
    step(
      "1",
      "Выбери день",
      "Нажми дату в календаре — увидишь тренировки на этот день (⏳ черновик / ✅ выполнено)."
    ),
    step(
      "2",
      "Стартуй сессию",
      "Нажми 📖, чтобы создать новую тренировку. " +
        "Чтобы продолжить/поправить старую — открой карточку тренировки."
    ),
    step(
      "3",
      "Добавь упражнения",
      "Жми ➕ и выбирай упражнения из программы. Можно добавлять свои упражнения/варианты."
    ),
    step(
      "4",
      "Заполни подходы",
      "Вводи повторения и вес. Тоннаж считается автоматически: вес × повторения. " +
        "✏️ — редактировать упражнение или подход."
    ),
    step(
      "5",
      "Заверши и сохрани",
      "Нажми 🏁 — тренировка сохранится. Данные пишутся сразу, ничего вручную «сохранять» не надо."
    ),
    step(
      "6",
      "Смысл в данных",
      "Смотри аналитику: тоннаж, прогресс по 1RM, загрузку мышц — это превращает тренировки в систему, а не в «ощущения»."
    ),
  ].join(""),
  `<div class="uxTipIcon">🏋️</div>
   <div class="uxTipText">
     Минимальный рабочий сценарий: <b>3 упражнения</b> × <b>2–3 подхода</b>. 
     Главное — записать хоть что-то, чтобы завтра было с чем сравнивать.
   </div>`,
  `
    <div class="uxMini">
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Как расти</div>
        <div class="uxMiniText">Прибавляй <b>+1 повтор</b> или <b>+1–2.5 кг</b> к прошлой сессии — этого достаточно.</div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Тоннаж</div>
        <div class="uxMiniText">Тоннаж = <b>вес × повторы</b>. Он помогает видеть объём и перегрузку.</div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">1RM (оценка)</div>
        <div class="uxMiniText">Примерная сила считается автоматически по подходам (формула типа Epley).</div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Не идеально — нормально</div>
        <div class="uxMiniText">Устал? Уменьши объём, но не пропадай. Регулярность важнее геройства.</div>
      </div>
    </div>
  `
);


const TrainingEn = wrap(
  "Workout",
  "Logic: Program → Day → Session → Exercises → Sets",
  "WORKOUT",
  "2–8 min",
  [
    step("0", "Set up a program once", "Create a program, add at least 1 day and exercises. Empty program = no session start."),
    step("1", "Pick a day", "Tap a date in the calendar to view sessions (draft ⏳ / done ✅)."),
    step("2", "Start a session", "Tap 📖 to create a new workout. Tap a session card to continue/edit it."),
    step("3", "Add exercises", "Use ➕ to add exercises from your program (custom exercises are ok)."),
    step("4", "Log sets", "Enter reps & weight. Tonnage is calculated automatically (weight × reps). ✏️ edits."),
    step("5", "Finish & save", "Tap 🏁 — workout is saved instantly."),
    step("6", "Use analytics", "Track tonnage, estimated 1RM, muscle load — progress becomes measurable."),
  ].join(""),
  `<div class="uxTipIcon">🏋️</div><div class="uxTipText"><b>3 exercises</b> × <b>2–3 sets</b> is enough to start. Consistency wins.</div>`
);

  // МОЗГ
  // МОЗГ (обновлённая, “объясняет логику”)
const MindRu = wrap(
  "Мозг",
  "Мини-тренировки: режим → уровень → раунды → очки → рекорд",
  "BRAIN",
  "3–8 минут",
  [
    step("1", "Выбери режим", `
      Тут 4 типа тренировок:
      <b>🎯 Фокус</b> — найди и посчитай цель (★) среди помех;
      <b>🧠 Память</b> — запомни последовательность и введи её;
      <b>🧮 Счёт</b> — быстрые примеры на время;
      <b>🧩 Логика</b> — найди “лишнее” по правилу.
    `),
    step("2", "Выбери уровень сложности", `
      Уровень меняет нагрузку: количество элементов/скорость/время.
      В некоторых режимах часть уровней может быть закрыта (Premium).
    `),
    step("3", "Жми «Начать» и играй раундами", `
      Каждый раунд даёт очки. В конце сессии результат сравнивается с твоим рекордом и сохраняется автоматически.
    `),
  ].join(""),
  `<div class="uxTipIcon">🎯</div><div class="uxTipText">
     Идеальный старт: <b>1 режим</b> + <b>1 уровень</b> + <b>7 дней</b>. Мозг любит повторение, а не героизм.
   </div>`,
  `
    <div class="uxMini">
      <div class="uxMiniCard">
        <div class="uxMiniTitle">🎯 Фокус</div>
        <div class="uxMiniText">
          Задача: найти ★ среди символов и дать правильный счёт за лимит времени.
          Чем выше уровень — тем больше элементов и сложнее отвлекалки.
        </div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">🧠 Память</div>
        <div class="uxMiniText">
          Сначала смотришь последовательность, потом вводишь ответ.
          На продвинутых стадиях может включиться <b>обратный режим</b> (ввод наоборот).
        </div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">🧮 Счёт</div>
        <div class="uxMiniText">
          Уровни отличаются наборами операций и таймером.
          Есть режим “до первой ошибки” (Endless) и “без таймера” (Relax).
        </div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">🧩 Логика</div>
        <div class="uxMiniText">
          Найди один неверный элемент в ряду.
          На сложных уровнях правила могут меняться — это нормально: цель в том, чтобы заметить закономерность.
        </div>
      </div>
    </div>
  `
);

const MindEn = wrap(
  "Brain",
  "Mini training: mode → level → rounds → score → record",
  "BRAIN",
  "3–8 min",
  [
    step("1", "Pick a mode", `
      4 training types:
      <b>🎯 Focus</b> — count the target (★) among distractors;
      <b>🧠 Memory</b> — memorize a sequence and enter it;
      <b>🧮 Math</b> — fast calculations with a timer;
      <b>🧩 Logic</b> — find the odd one out by rule.
    `),
    step("2", "Pick difficulty", `
      Difficulty changes load (amount/speed/time).
      Some levels may be locked (Premium).
    `),
    step("3", "Press Start and play rounds", `
      Each round gives points. At the end your result updates your personal record automatically.
    `),
  ].join(""),
  `<div class="uxTipIcon">🎯</div><div class="uxTipText">
     Best start: <b>one</b> mode + <b>one</b> level for <b>7 days</b>. Repetition beats intensity.
   </div>`
);

  // ВОССТАНОВЛЕНИЕ
const RecoveryRu = wrap(
  "Восстановление",
  "Дыхание, медитация и закалка — чтобы быстро прийти в норму",
  "RECOVERY",
  "3–10 минут",
  [
    step("1", "Выбери режим", "Внутри раздела есть 3 направления: дыхание / медитация / закалка. Каждый — со своими протоколами."),
    step("2", "Выбери протокол", "Открой карточку протокола и запусти сессию. Некоторые протоколы могут быть закрыты без Premium."),
    step("3", "Пройди сессию", "Во время таймера можно поставить паузу и продолжить. Когда закончил — жми «Финиш», чтобы сессия сохранилась."),
    step("4", "Повтори коротко, но регулярно", "Смысл восстановления — в частоте. Лучше 3–5 минут каждый день, чем редко и героически."),
  ].join(""),
  `<div class="uxTipIcon">🧘</div><div class="uxTipText"><b>Быстрый старт:</b> начни с дыхания 3–5 минут. Если нужно успокоиться — медитация. Если бодрость — закалка (осторожно, без фанатизма).</div>`,
  `
    <div class="uxMini">
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Пауза</div>
        <div class="uxMiniText">Пауза → «Продолжить» или «Финиш». «Финиш» фиксирует сессию в логах.</div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Зачем “Финиш”</div>
        <div class="uxMiniText">Пока не нажал “Финиш”, прогресс может не сохраниться. Жми — и всё запишется.</div>
      </div>
    </div>
  `
);

const RecoveryEn = wrap(
  "Recovery",
  "Breathing, meditation and hardening — to reset fast",
  "RECOVERY",
  "3–10 min",
  [
    step("1", "Pick a mode", "Inside Recovery: breathing / meditation / hardening. Each has its own protocols."),
    step("2", "Pick a protocol", "Open a protocol card and start a session. Some items may require Premium."),
    step("3", "Run the session", "You can pause and resume. When done, press “Finish” to save the session."),
    step("4", "Repeat consistently", "Recovery works best with frequency: 3–5 minutes daily beats rare long sessions."),
  ].join(""),
  `<div class="uxTipIcon">🧘</div><div class="uxTipText"><b>Quick start:</b> breathing 3–5 min. Calm down — meditation. Energy — hardening (carefully).</div>`
);

  // СОН
const SleepRu = wrap(
  "Сон",
  "Заполняешь 3 поля — и видишь, что реально влияет на твою энергию",
  "SLEEP LOG",
  "30 секунд",
  [
    step("1", "Выбери день в календаре", "Тап по дате. Подсказка: высота заливки — длительность, цвет — самочувствие."),
    step("2", "Добавь запись сна", "Открой добавление сна и выставь: Время отбоя + Длительность (3–14 часов) + Самочувствие (1–5)."),
    step("3", "Добавь заметку (по желанию)", "Коротко: кофеин/тренировка/стресс/экран/алкоголь/просыпания. Это потом даёт инсайты."),
    step("4", "Сохрани и посмотри карточку дня", "После сохранения на выбранной дате увидишь: отбой, длительность, настроение звёздами и заметку."),
  ].join(""),
  `<div class="uxTipIcon">🌙</div><div class="uxTipText"><b>Важное правило:</b> нельзя заполнять сон на будущие даты. Заполняй сегодня/вчера — и всё ок.</div>`,
  `
    <div class="uxMini">
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Минимум</div>
        <div class="uxMiniText">Если лень: поставь только длительность + самочувствие. Уже достаточно для статистики.</div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Эксперимент</div>
        <div class="uxMiniText">Меняй по 1 фактору на 3 дня (например, без кофе после 16:00) — так видно причину.</div>
      </div>
    </div>
  `
);

const SleepEn = wrap(
  "Sleep",
  "Track 3 fields and discover what truly impacts your energy",
  "SLEEP LOG",
  "30 sec",
  [
    step("1", "Pick a day on the calendar", "Tap a date. Fill height = duration, color = mood."),
    step("2", "Add a sleep entry", "Set Bedtime + Duration (3–14h) + Mood (1–5)."),
    step("3", "Add a note (optional)", "Caffeine/workout/stress/screens/alcohol/awakenings — helps insights later."),
    step("4", "Save and view the day card", "You’ll see bedtime, duration, mood stars, and the note."),
  ].join(""),
  `<div class="uxTipIcon">🌙</div><div class="uxTipText"><b>Rule:</b> you can’t log sleep for future dates.</div>`
);

  const ToDoRu = wrap(
    "Задачи",
    "Порядок в голове — скорость в жизни",
    "TO-DO",
    "каждый день",
    [
      step("1", "Добавь задачи", `Нажми <span class="uxChip uxChipPlus">＋</span> и запиши всё, что давит на мозг.`),
      step("2", "Выбери приоритеты", "Оставь 1–3 главных на сегодня. Остальное — вторично."),
      step("3", "Дроби и закрывай", "Разбей большую задачу на маленькие шаги и закрывай по одному."),
    ].join(""),
    `<div class="uxTipIcon">✅</div><div class="uxTipText">Формула дня: <b>1 важное</b> + <b>1 полезное</b> + <b>1 быстрое</b>.</div>`,
    `
      <div class="uxMini">
        <div class="uxMiniCard">
          <div class="uxMiniTitle">Антипрокраст</div>
          <div class="uxMiniText">Начни с “самого лёгкого шага” на 2 минуты.</div>
        </div>
        <div class="uxMiniCard">
          <div class="uxMiniTitle">Чистота</div>
          <div class="uxMiniText">Если задача висит 7+ дней — либо разбить, либо удалить.</div>
        </div>
      </div>
    `
  );

  const ToDoEn = wrap(
    "To-Do",
    "A clean mind moves faster",
    "TO-DO",
    "daily",
    [
      step("1", "Add tasks", `Tap <span class="uxChip uxChipPlus">＋</span> and dump what’s on your mind.`),
      step("2", "Pick priorities", "Keep 1–3 main tasks for today."),
      step("3", "Break & finish", "Split big tasks into small steps and close them one by one."),
    ].join(""),
    `<div class="uxTipIcon">✅</div><div class="uxTipText">Daily formula: <b>1 important</b> + <b>1 useful</b> + <b>1 quick win</b>.</div>`
  );

  // Заглушки для остальных (позже сделаем так же красиво)
  const ComingRu = wrap(
    "Скоро",
    "Инструкция для этого раздела сейчас допиливается",
    "IN PROGRESS",
    "",
    step("1", "Чуть-чуть терпения", "Сейчас доделаем “Привычки”, потом пойдём по вкладкам дальше."),
    `<div class="uxTipIcon">●</div><div class="uxTipText">Пока ориентир простой: вкладки сверху → читаешь → делаешь.</div>`
  );

  const ComingEn = wrap(
    "Coming Soon",
    "Guide for this section is being polished",
    "IN PROGRESS",
    "",
    step("1", "A bit of patience", "We’ll finish Habits first, then continue tab by tab."),
    `<div class="uxTipIcon">●</div><div class="uxTipText">For now: top tabs → read → do.</div>`
  );

  switch (sectionId) {
    case "MainCard":
      return isRu ? MainRu : MainEn;
    case "HabitsMain":
      return isRu ? HabitsRu : HabitsEn;
    case "TrainingMain":
      return isRu ? TrainingRu : TrainingEn;
    case "MentalMain":
      return isRu ? MindRu : MindEn;
    default:
      return isRu ? ComingRu : ComingEn;
          case "RecoveryMain":
      return isRu ? RecoveryRu : RecoveryEn;
    case "SleepMain":
      return isRu ? SleepRu : SleepEn;
    case "ToDoMain":
      return isRu ? ToDoRu : ToDoEn;

  }

}

function getHtmlCss(theme) {
  const isDark = theme === "dark";

  const text = isDark ? "rgba(255,255,255,0.92)" : "rgba(10,10,10,0.92)";
  const sub = isDark ? "rgba(255,255,255,0.58)" : "rgba(10,10,10,0.55)";
  const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";

  const bg1 = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.75)";
  const bg2 = isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.55)";

  return `
    .ux{ width:100%; }

    .uxHeader{ text-align:center; margin-bottom: 14px; }
    .uxTitle{ font-size: 26px; font-weight: 950; letter-spacing: .2px; color: ${text}; margin-bottom: 6px; }
    .uxSubtitle{ font-size: 14px; color: ${sub}; line-height: 1.35; font-style: italic; max-width: 520px; margin: 0 auto; }

    .uxHero{
      position: relative;
      overflow: hidden;
      border-radius: 24px;
      border: 1px solid ${border};
      background: linear-gradient(180deg, ${bg1}, ${bg2});
      box-shadow: ${isDark ? "0 28px 70px rgba(0,0,0,0.60)" : "0 20px 50px rgba(0,0,0,0.12)"};
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding: 16px;
    }

    .uxHeroGlow{
      position:absolute;
      inset:-140px -120px auto -120px;
      height: 280px;
      background: radial-gradient(circle at 45% 45%,
        color-mix(in srgb, var(--accent) 40%, transparent),
        transparent 60%);
      pointer-events:none;
      filter: blur(2px);
      opacity: ${isDark ? "0.75" : "0.55"};
    }

    .uxHeroTop{ position: relative; display:flex; justify-content: space-between; align-items:center; margin-bottom: 12px; }

    .uxBadge{
      font-size: 12px;
      font-weight: 900;
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid ${border};
      background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.60)"};
      color: ${text};
      letter-spacing: .3px;
      text-transform: uppercase;
    }

    .uxMeta{ font-size: 12px; color: ${sub}; font-weight: 800; }

    .uxSteps{ position: relative; display:flex; flex-direction: column; gap: 10px; margin-top: 6px; }

    .uxStep{
      display:flex;
      gap: 12px;
      padding: 12px 12px;
      border-radius: 18px;
      border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"};
      background: ${isDark ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.55)"};
    }

    .uxNum{
      width: 30px;
      height: 30px;
      border-radius: 12px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight: 950;
      color: ${text};
      border: 1px solid ${border};
      background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.70)"};
      box-shadow: ${isDark ? "0 10px 18px rgba(0,0,0,0.45)" : "0 10px 18px rgba(0,0,0,0.10)"};
      flex-shrink: 0;
    }

    .uxStepBody{ flex: 1; }
    .uxStepTitle{ font-size: 15px; font-weight: 950; color: ${text}; margin-bottom: 4px; letter-spacing: .1px; }
    .uxStepText{ font-size: 14px; font-weight: 700; color: ${text}; line-height: 1.4; }

    .uxChip{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      min-width: 30px;
      height: 24px;
      padding: 0 8px;
      margin: 0 6px;
      border-radius: 10px;
      border: 1px solid ${border};
      font-weight: 950;
      font-size: 14px;
      transform: translateY(-1px);
      user-select:none;
    }

    .uxChipPlus{
      background: color-mix(in srgb, var(--accent) 22%, transparent);
    }

    .uxChipOk{
      background: ${isDark ? "rgba(90,255,170,0.14)" : "rgba(90,255,170,0.10)"};
    }

    .uxDivider{
      height: 1px;
      background: ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"};
      margin: 14px 0 12px 0;
    }

    .uxTip{
      display:flex;
      gap: 12px;
      align-items:flex-start;
      padding: 12px 12px;
      border-radius: 18px;
      border: 1px dashed ${border};
      background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.60)"};
    }

    .uxTipIcon{
      width: 28px;
      height: 28px;
      border-radius: 12px;
      display:flex;
      align-items:center;
      justify-content:center;
      border: 1px solid ${border};
      color: ${isDark ? "rgba(255,255,255,0.80)" : "rgba(0,0,0,0.55)"};
      background: color-mix(in srgb, var(--accent) 16%, ${isDark ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.85)"});
      flex-shrink: 0;
    }

    .uxTipText{
      color:${text};
      font-weight: 850;
      font-size: 14px;
      line-height: 1.35;
    }

    .uxMini{
      display:grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 12px;
    }

    .uxMiniCard{
      border-radius: 18px;
      border: 1px solid ${border};
      background: ${isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.65)"};
      padding: 12px 12px;
      box-shadow: ${isDark ? "0 16px 40px rgba(0,0,0,0.40)" : "0 12px 30px rgba(0,0,0,0.08)"};
    }

    .uxMiniTitle{
      color:${text};
      font-weight: 950;
      font-size: 13px;
      margin-bottom: 6px;
      letter-spacing: .2px;
      text-transform: uppercase;
      opacity: .9;
    }

    .uxMiniText{
      color:${sub};
      font-weight: 800;
      font-size: 13px;
      line-height: 1.35;
    }
  `;
}
