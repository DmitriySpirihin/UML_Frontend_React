import { AppData } from "../../StaticClasses/AppData";
import { allHabits } from "../../Classes/Habit";
const API_BASE = 'https://ultymylife.ru/api/insight';

const INSIGHT_SYSTEM_PROMPTS = [
  // 0 — RU
  `Ты — персональный фитнес-аналитик. Проанализируй данные за последние 7 дней и дай краткий, практичный отчёт на русском языке.`,
  // 1 — EN
  `You are a personal fitness analyst. Analyze the data from the last 7 days and provide a short, practical report in English.`
];

const INSIGHT_USER_PROMPT_TEMPLATES = [
  // 0 — RU
  `Требования к ответу:
1) Кратко опиши общий уровень активности и прогресс за неделю.
2) Отметь сильные стороны и позитивные тренды.
3) Укажи проблемные зоны (что чаще всего пропускалось, где нет прогресса).
4) Дай 3–5 конкретных и выполнимых рекомендаций на следующую неделю.
5) Стиль: коротко, по делу, мотивирующе, без "воды". Каждый пункт — с новой строки. Не используй Markdown, списки или жирный шрифт.

Примечание по привычкам:
- Для положительных привычек (например, "Ходьба"): status = -1 → выполнено, status = 0 → пропущено.
- Для отрицательных привычек (например, "Курение"): status = 1 → успех (воздержался), status = 0 → срыв.

Данные для анализа:`,
  // 1 — EN
  `Requirements for your response:
1) Briefly describe the overall activity level and progress over the past week.
2) Highlight strengths and positive trends.
3) Point out problem areas (what is most often skipped or shows no progress).
4) Give 3–5 specific, actionable recommendations for next week.
5) Style: short, to the point, motivating, no fluff. Each point on a new line. Do not use Markdown, bullets, or bold text.

Habit status note:
- For positive habits (e.g., "Walking"): status = -1 → completed, status = 0 → skipped.
- For negative habits (e.g., "Smoking"): status = 1 → success (abstained), status = 0 → relapse.

Data to analyze:`
];

export function getInsightPrompt(langIndex) {
  // Generate list of last 7 calendar days (YYYY-MM-DD)
  const today = new Date();
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().split('T')[0]); // e.g. "2026-01-06"
  }

  const user = AppData.pData || {};
  const habitsByDate = AppData.habitsByDate || {};
  const trainings = AppData.trainingLog || {};
  const breathing = AppData.breathingLog || {};
  const meditation = AppData.meditationLog || {};
  const hardening = AppData.hardeningLog || {};
  const sleeping = AppData.sleepingLog || {};
  const mentalLog = AppData.mentalLog || {};
  const mentalRecords = AppData.mentalRecords || [];
  const programs = AppData.programs || {};
  const exercises = AppData.exercises || {};
  const allhabits = allHabits || {};

  // Helper: format a section or show "No data"
  const formatSection = (title, contentLines) => {
    if (contentLines.length === 0) return `${title} (last 7 days):\n  No data\n`;
    return `${title} (last 7 days):\n${contentLines.join('\n')}\n`;
  };

  // 1. USER BLOCK
  const userBlock = `
USER:
- age: ${user.age || 'unknown'}
- gender: ${user.gender !== undefined ? user.gender : 'unknown'}
- height: ${user.height || 'unknown'} cm
- wrist: ${user.wrist || 'unknown'} cm
- goal: ${user.goal || 'unknown'}
`.trim();

  // 2. HABITS
  const habitLines = [];
  last7Days.forEach(date => {
    const dayData = habitsByDate[date];
    if (!dayData) return;

    const arr = Array.isArray(dayData)
      ? dayData
      : Object.entries(dayData).map(([habitId, status]) => ({
          habitId: Number(habitId),
          status: status
        }));

    const dayHabits = arr.map(item => {
      const h = allhabits[item.habitId];
      const name = h?.name
        ? (h.name[langIndex] || h.name[0] || `Habit #${item.habitId}`)
        : `Habit #${item.habitId}`;
      return {
        habitId: item.habitId,
        status: item.status,
        habitName: name
      };
    });

    if (dayHabits.length > 0) {
      habitLines.push(`  ${date}: ${JSON.stringify(dayHabits)}`);
    }
  });
  const habitsBlock = formatSection(
    langIndex === 0
      ? 'ПРИВЫЧКИ (за последние 7 дней)'
      : 'HABITS_BY_DATE',
    habitLines
  );

  // 3. TRAININGS
  const trainingLines = [];
  last7Days.forEach(date => {
    const sessions = trainings[date];
    if (!sessions || !sessions.length) return;

    trainingLines.push(`  DATE: ${date}`);
    sessions.forEach((s, idx) => {
      const program = programs[s.programId];
      const programName = program?.name
        ? (program.name[langIndex] || program.name[0] || `Program #${s.programId}`)
        : `Program #${s.programId}`;

      trainingLines.push(`    [Session #${idx + 1}] program: ${programName}, dayIndex: ${s.dayIndex}, completed: ${s.completed}, duration(ms): ${s.duration || 0}, tonnage: ${s.tonnage || 0}`);
      trainingLines.push(`      exercises:`);

      const order = s.exerciseOrder || [];
      order.forEach(exId => {
        const exData = s.exercises?.[exId];
        const exMeta = exercises[exId];
        const exName = exMeta?.name
          ? (exMeta.name[langIndex] || exMeta.name[0] || `Exercise #${exId}`)
          : `Exercise #${exId}`;

        if (!exData) return;

        trainingLines.push(`        - ${exName} (mgId: ${exData.mgId || 'N/A'})`);
        trainingLines.push(`          sets:`);
        (exData.sets || []).forEach((set, i) => {
          trainingLines.push(`            * set ${i + 1}: type=${set.type || 'N/A'}, reps=${set.reps || 0}, weight=${set.weight || 0}, time=${set.time || 0}`);
        });
        trainingLines.push(`          totalTonnage: ${exData.totalTonnage || 0}, completed: ${exData.completed || false}`);
      });
    });
  });
  const trainingsBlock = formatSection(langIndex === 0 ? 'ТРЕНИРОВКИ' : 'TRAININGS', trainingLines);

  // 4. Simple logs: breathing, meditation, hardening
  const buildSimpleLog = (logObj, extraFields = []) => {
    const lines = [];
    last7Days.forEach(date => {
      const arr = logObj[date];
      if (!arr || !arr.length) return;
      lines.push(`  ${date}:`);
      arr.forEach((item, i) => {
        const durationMs = (item.endTime || 0) - (item.startTime || 0);
        let line = `    #${i + 1}: duration(ms): ${durationMs}`;
        extraFields.forEach(f => {
          if (item[f] != null) line += `, ${f}: ${item[f]}`;
        });
        lines.push(line);
      });
    });
    return lines;
  };

  const breathingBlock = formatSection(langIndex === 0 ? 'ДЫХАНИЕ' : 'BREATHING', buildSimpleLog(breathing, ['maxHold']));
  const meditationBlock = formatSection(langIndex === 0 ? 'МЕДИТАЦИЯ' : 'MEDITATION', buildSimpleLog(meditation));
  const hardeningBlock = formatSection(langIndex === 0 ? 'ЗАКАЛИВАНИЕ' : 'HARDENING', buildSimpleLog(hardening, ['timeInColdWater']));

  // 5. MENTAL ACTIVITY
  const mentalLines = [];
  let mentalTotalSeconds = 0;
  let mentalDaysCount = 0;
  last7Days.forEach(date => {
    const durSec = mentalLog[date];
    if (durSec == null) return;
    const dur = Number(durSec) || 0;
    mentalTotalSeconds += dur;
    mentalDaysCount++;
    mentalLines.push(`  ${date}: duration(sec): ${dur}, duration(min): ${Math.round((dur / 60) * 10) / 10}`);
  });
  if (mentalLines.length > 0) {
    mentalLines.push(`  total(sec): ${mentalTotalSeconds}, total(min): ${Math.round((mentalTotalSeconds / 60) * 10) / 10}, days: ${mentalDaysCount}`);
  }
  const mentalBlock = formatSection(langIndex === 0 ? 'МЕНТАЛЬНАЯ АКТИВНОСТЬ' : 'MENTAL', mentalLines);

  // 6. MENTAL RECORDS
  const mentalCategoryNames = [
    ['Быстрый счёт', 'Mental math'],
    ['Память в действии', 'Memory'],
    ['Числовая логика', 'Number logic'],
    ['Чистый фокус', 'Pure focus']
  ];
  const mentalRecordLines = [];
  (mentalRecords || []).forEach((arr, idx) => {
    const name = mentalCategoryNames[idx]?.[langIndex] || `Category ${idx}`;
    const scores = (Array.isArray(arr) ? arr : []).map(v => Number(v) || 0);
    const best = scores.length ? Math.max(...scores) : 0;
    const nonZero = scores.filter(v => v > 0);
    const avg = nonZero.length ? Math.round((nonZero.reduce((a, b) => a + b, 0) / nonZero.length) * 10) / 10 : 0;
    mentalRecordLines.push(`  ${name}: best=${best}, avg(nonZero)=${avg}, byDifficulty=${JSON.stringify(scores)}`);
  });
  const mentalRecordsBlock = mentalRecordLines.length
    ? (langIndex === 0
        ? `РЕЗУЛЬТАТЫ МЕНТАЛЬНЫХ ТРЕНИРОВОК (лучшие):\n${mentalRecordLines.join('\n')}\n`
        : `MENTAL_RECORDS (best scores):\n${mentalRecordLines.join('\n')}\n`)
    : (langIndex === 0
        ? `РЕЗУЛЬТАТЫ МЕНТАЛЬНЫХ ТРЕНИРОВОК:\n  Нет данных\n`
        : `MENTAL_RECORDS:\n  No data\n`);

  // 7. MENTAL SCORE HINTS
  function estimateMaxMathSessionScore(difficulty) {
    const baseScores = [100, 200, 300, 400];
    const base = baseScores[difficulty] || 100;
    let total = 0;
    for (let stage = 1; stage <= 20; stage++) {
      const stageMultiplier = Math.min(1 + stage * 0.02, 1.3);
      const timeMultiplier = 1.6;
      const streakLength = stage - 1;
      const streakMultiplier = streakLength >= 5
        ? Math.min(1 + 0.1 * Math.min(streakLength / 10, 4), 1.5)
        : 1;
      total += Math.round(base * stageMultiplier * timeMultiplier * streakMultiplier);
    }
    return total;
  }

  const mathDifficultyNames = [
    ['начальный', 'novice'],
    ['средний', 'intermediate'],
    ['продвинутый', 'advanced'],
    ['безумный', 'insane']
  ];
  const scoreHintLines = mathDifficultyNames.map((labels, d) =>
    `  ${labels[langIndex] || labels[0]}: estimatedMax≈${estimateMaxMathSessionScore(d)}`
  );
  const mentalScoreHintBlock = (langIndex === 0
    ? `ПОДСКАЗКИ ПО МАКС. БАЛЛАМ (масштаб математики, максимум при идеальном решении 20 вопросов):\n${scoreHintLines.join('\n')}\n`
    : `MENTAL_SCORE_HINTS (math scale, estimated max for perfect 20 questions):\n${scoreHintLines.join('\n')}\n`);

  // 8. SLEEP
  const sleepLines = [];
  last7Days.forEach(date => {
    const s = sleeping[date];
    if (!s) return;
    sleepLines.push(`  ${date}: bedtime(ms): ${s.bedtime || 0}, duration(ms): ${s.duration || 0}, mood(1-5): ${s.mood || 'N/A'}, note: "${s.note || ''}"`);
  });
  const sleepBlock = formatSection(langIndex === 0 ? 'СОН' : 'SLEEP', sleepLines);

  // 9. Final prompts
  const systemPrompt = (INSIGHT_SYSTEM_PROMPTS[langIndex] || INSIGHT_SYSTEM_PROMPTS[0]).trim();
  const instructionBlock = (INSIGHT_USER_PROMPT_TEMPLATES[langIndex] || INSIGHT_USER_PROMPT_TEMPLATES[0]).trim();

  const userPrompt = `
${instructionBlock}

${userBlock}

${habitsBlock}
${trainingsBlock}
${breathingBlock}
${meditationBlock}
${hardeningBlock}
${mentalBlock}
${mentalRecordsBlock}
${mentalScoreHintBlock}
${sleepBlock}
`.trim();

  return { systemPrompt, userPrompt };
}

export async function getInsight(langIndex) {
  try {
    const { systemPrompt, userPrompt } = getInsightPrompt(langIndex);

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!res.ok) {
      throw new Error(`Insight API error: ${res.status}`);
    }

    const data = await res.json();
    console.log('Insight API response:', data.message);
    return data.message;
  } catch (error) {
    console.error('Failed to get insight:', error);
    throw error; // or return fallback
  }
}
