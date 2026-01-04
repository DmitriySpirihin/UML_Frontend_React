import { AppData } from "../../StaticClasses/AppData";
import { allHabits } from "../../Classes/Habit";

const INSIGHT_SYSTEM_PROMPTS = [
  // 0 — RU
  `Ты — персональный фитнес‑аналитик. 
Генерируй короткие, практичные инсайты по тренировкам, дыханию, медитации, закаливанию и сну за последние 7 дней.
Отвечай на русском, структурированно и мотивирующе. Расставь переносы строки для вставки в скрипт: \n`,
  // 1 — EN
  `You are a personal fitness analyst.
Generate short, actionable insights about workouts, breathing, meditation, cold exposure and sleep for the last 7 days.
Answer in English, structured and motivating. Add \n for script`
];

export function getInsightPrompt(langIndex) {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const user = AppData.pData || {};
  const habitsByDate = AppData.habitsByDate || {};
  const trainings = AppData.trainingLog || {};
  const breathing = AppData.breathingLog || {};
  const meditation = AppData.meditationLog || {};
  const hardening = AppData.hardeningLog || {};
  const sleeping = AppData.sleepingLog || {};
  const programs = AppData.programs || {};
  const exercises = AppData.exercises || {};

  function isInLast7Days(dateStr) {
    const t = new Date(dateStr).getTime();
    return !Number.isNaN(t) && t >= sevenDaysAgo && t <= now;
  }

  // 1. Пользователь
  const userBlock = `
USER:
- age: ${user.age}
- gender: ${user.gender}
- height: ${user.height}
- wrist: ${user.wrist}
- goal: ${user.goal}
`;

  // 2. Привычки
const allhabits = allHabits;   // массив или объект Habit
const names = new Set();         // чтобы без дублей

let habitsBlock = 'HABITS_BY_DATE (last 7 days):\n';

Object.entries(habitsByDate || {}).forEach(([date, obj]) => {
  if (!isInLast7Days(date)) return;

  const arr = Array.isArray(obj)
    ? obj
    : Object.entries(obj).map(([habitId, status]) => ({
        habitId: Number(habitId),
        status
      }));

  const dayHabits = arr.map((item) => {
    const h = allhabits[item.habitId];
    const habitName = h && h.name
      ? (h.name[langIndex] || h.name[0])
      : `Habit #${item.habitId}`;

    names.add(habitName);

    return {
      ...item,
      habitName
    };
  });

  habitsBlock += `  ${date}: ${JSON.stringify(dayHabits)}\n`;
});

  // 3. Тренировки с названиями программ и упражнений
  let trainingsBlock = 'TRAININGS (last 7 days):\n';
  Object.entries(trainings).forEach(([date, sessions]) => {
    if (!isInLast7Days(date)) return;
    trainingsBlock += `  DATE: ${date}\n`;
    (sessions || []).forEach((s, idx) => {
      const program = programs[s.programId];
      const programName = program
        ? (program.name && (program.name[langIndex] || program.name[0]))
        : `Program #${s.programId}`;

      trainingsBlock += `    [Session #${idx + 1}] program: ${programName}, dayIndex: ${s.dayIndex}, completed: ${s.complited}, duration(ms): ${s.duration}, tonnage: ${s.tonnage}\n`;

      trainingsBlock += `      exercises:\n`;
      const order = s.exerciseOrder || [];
      order.forEach((exId) => {
        const exData = s.exercises && s.exercises[exId];
        const exMeta = exercises[exId];
        const exName = exMeta
          ? (exMeta.name && (exMeta.name[langIndex] || exMeta.name[0]))
          : `Exercise #${exId}`;
        if (!exData) return;

        trainingsBlock += `        - ${exName} (mgId: ${exData.mgId})\n`;
        trainingsBlock += `          sets:\n`;
        (exData.sets || []).forEach((set, i) => {
          trainingsBlock += `            * set ${i + 1}: type=${set.type}, reps=${set.reps}, weight=${set.weight}, time=${set.time}\n`;
        });
        trainingsBlock += `          totalTonnage: ${exData.totalTonnage}, completed: ${exData.complited}\n`;
      });
    });
  });

  // 4. Универсальный блок для дыхания/медитации/закалки
  function buildSimpleLogBlock(title, logObj, extraFields) {
    let block = `${title} (last 7 days):\n`;
    Object.entries(logObj || {}).forEach(([date, arr]) => {
      if (!isInLast7Days(date)) return;
      block += `  ${date}:\n`;
      (arr || []).forEach((item, i) => {
        block += `    #${i + 1}: duration(ms): ${item.endTime - item.startTime}`;
        (extraFields || []).forEach((f) => {
          if (item[f] != null) block += `, ${f}: ${item[f]}`;
        });
        block += '\n';
      });
    });
    return block;
  }

  const breathingBlock = buildSimpleLogBlock('BREATHING', breathing, ['maxHold']);
  const meditationBlock = buildSimpleLogBlock('MEDITATION', meditation, []);
  const hardeningBlock = buildSimpleLogBlock('HARDENING', hardening, ['timeInColdWater']);

  // 5. Сон
  let sleepBlock = 'SLEEP (last 7 days):\n';
  Object.entries(sleeping || {}).forEach(([date, s]) => {
    if (!isInLast7Days(date)) return;
    sleepBlock += `  ${date}: bedtime(ms): ${s.bedtime}, duration(ms): ${s.duration}, mood(1-5): ${s.mood}, note: "${s.note || ''}"\n`;
  });

  const systemPrompt = INSIGHT_SYSTEM_PROMPTS[langIndex] || INSIGHT_SYSTEM_PROMPTS[0];

  const userPrompt = `
Analyze the data below for the LAST 7 DAYS and:

1) Briefly describe the overall activity level and progress.
2) Highlight strengths and positive trends.
3) Point out problem areas (what is most often skipped, where there is no progress).
4) Give 3–5 specific recommendations for the next week (maximally practical).
5) Style of the answer: short, to the point, motivating, without fluff.

DATA:
${userBlock}

${habitsBlock}

${trainingsBlock}

${breathingBlock}

${meditationBlock}

${hardeningBlock}

${sleepBlock}
`;

  console.log(systemPrompt + ';' + userPrompt);
  return { systemPrompt, userPrompt };
}

// пример обёртки вызова Qwen
export async function getInsight(langIndex) {
  const { systemPrompt, userPrompt } = getInsightPrompt(langIndex);

  const res = await fetch('/api/qwen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  const data = await res.json();
  return data;
}
