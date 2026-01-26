import { AppData } from "../../StaticClasses/AppData";
import { allHabits } from "../../Classes/Habit";

const API_BASE = 'https://ultymylife.ru/api/insight';

const INSIGHT_SYSTEM_PROMPTS = [
  // 0 — RU (Expert Persona)
  `Ты — элитный спортивный физиолог и аналитик данных. Твоя цель — найти скрытые взаимосвязи между сном, ментальным состоянием и физическими показателями пользователя, чтобы оптимизировать его производительность.`,
  
  // 1 — EN (Expert Persona)
  `You are an elite sports physiologist and data scientist. Your goal is to find hidden correlations between sleep, mental state, and physical performance to optimize the user's productivity.`
];

const INSIGHT_USER_PROMPT_TEMPLATES = [
  // 0 — RU (Detailed & Correlative)
  `Требования к отчёту (строго следуй формату):

1) 📊 **Синтез данных:** Не просто перечисли факты, а свяжи их. Как качество сна (или его отсутствие) повлияло на силовые показатели или ментальные тесты? Есть ли "провальные" дни недели?
2) 💪 **Ключевые победы:** Назови КОНКРЕТНЫЕ упражнения с прогрессом (тоннаж/вес) или привычки с идеальной дисциплиной. Выдели лучшее достижение недели.
3) ⚠️ **Диагностика проблем:** Почему были пропуски? (Усталость? Лень? Нехватка времени?). Определи паттерн срывов (например, "пропуски всегда в выходные").
4) 🎯 **План действий (3 пункта):** Дай микро-задачи на следующую неделю.
   - Не пиши "улучши сон", пиши "сдвинь отбой на 20 минут раньше".
   - Не пиши "тренируйся жестче", пиши "добавь 1 подход в отстающем упражнении".
5) Стиль: Тренерский, жесткий, но мотивирующий. Без воды.

Форматирование:
- Каждый пункт с новой строки.
- Используй эмодзи для структуры.
- НЕ используй Markdown (жирный шрифт, списки), только простой текст.

Данные для анализа:`,

  // 1 — EN (Detailed & Correlative)
  `Report Requirements (Follow strictly):

1) 📊 **Data Synthesis:** Don't just list facts; connect them. How did sleep quality impact gym performance or mental focus scores? Are there specific "failure days" in the week?
2) 💪 **Key Wins:** Mention SPECIFIC exercises with progress (tonnage/weight) or habits with perfect streaks. Highlight the #1 achievement of the week.
3) ⚠️ **Problem Diagnosis:** Why did skips happen? (Fatigue? Poor scheduling?). Identify the failure pattern (e.g., "always skipping habits on weekends").
4) 🎯 **Action Plan (3 items):** Give micro-tasks for next week.
   - Don't say "sleep better", say "shift bedtime 20 mins earlier".
   - Don't say "train harder", say "add 1 set to your weakest lift".
5) Tone: Coach-like, direct, motivating. No fluff.

Formatting:
- Each point on a new line.
- Use emojis for structure.
- DO NOT use Markdown (bold, lists), use plain text only.

Data to analyze:`
];

export function getInsightPrompt(langIndex) {
  // ✅ DATE FIX: Generate Local YYYY-MM-DD to match database keys
  const getLocalISODate = (dateObj) => {
    const offset = dateObj.getTimezoneOffset() * 60000;
    const localDate = new Date(dateObj.getTime() - offset);
    return localDate.toISOString().split('T')[0];
  };

  const today = new Date();
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last7Days.push(getLocalISODate(d));
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

  // Helper: format a section
  const formatSection = (title, contentLines) => {
    if (contentLines.length === 0) return `${title} (last 7 days):\n  No data (User was inactive here)\n`;
    return `${title} (last 7 days):\n${contentLines.join('\n')}\n`;
  };

  // 1. USER BLOCK (Added Context)
  const userBlock = `
USER CONTEXT:
- Profile: ${user.age || '?'} y.o, ${user.gender === 0 ? 'Male' : 'Female'}, Goal: ${user.goal !== undefined ? ['Mass', 'Strength', 'Cut', 'Health'][user.goal] : 'General'}
`.trim();

  // 2. HABITS
  const habitLines = [];
  last7Days.forEach(date => {
    const dayData = habitsByDate[date];
    if (!dayData) return;

    const arr = Array.isArray(dayData)
      ? dayData
      : Object.entries(dayData).map(([habitId, status]) => ({ habitId: Number(habitId), status }));

    const dayHabits = arr.map(item => {
      const h = allhabits[item.habitId];
      // Get English name fallback if specific lang missing
      const name = h?.name ? (h.name[1] || h.name[0]) : `Habit #${item.habitId}`; 
      
      // STATUS DECODER for AI
      let statusStr = "Skipped";
      if (item.status === -2) statusStr = "Done";
      if (item.status === 1) statusStr = "Abstained (Success)"; // For negative habits
      if (item.status === 0) statusStr = "Failed/Skipped";

      return `${name}: ${statusStr}`;
    });

    if (dayHabits.length > 0) {
      habitLines.push(`  ${date}: ${dayHabits.join(', ')}`);
    }
  });
  const habitsBlock = formatSection('HABITS', habitLines);

  // 3. TRAININGS (Enhanced for PR detection)
  const trainingLines = [];
  last7Days.forEach(date => {
    const sessions = trainings[date];
    if (!sessions || !sessions.length) return;

    sessions.forEach((s) => {
      const program = programs[s.programId];
      const programName = program?.name ? (program.name[1] || `Prog #${s.programId}`) : `Prog #${s.programId}`;
      
      trainingLines.push(`  DATE: ${date} | Program: ${programName} | Duration: ${Math.round((s.duration || 0)/60000)} min`);
      
      const order = s.exerciseOrder || [];
      order.forEach(exId => {
        const exData = s.exercises?.[exId];
        if (!exData) return;
        
        const exMeta = exercises[exId];
        const exName = exMeta?.name ? (exMeta.name[1] || `Ex #${exId}`) : `Ex #${exId}`;
        
        // Find max weight for this session to highlight strength
        let maxWeight = 0;
        let totalReps = 0;
        (exData.sets || []).forEach(set => {
           if(set.weight > maxWeight) maxWeight = set.weight;
           totalReps += (set.reps || 0);
        });

        trainingLines.push(`    - ${exName}: MaxWeight=${maxWeight}kg, TotalReps=${totalReps}, Vol=${exData.totalTonnage}`);
      });
    });
  });
  const trainingsBlock = formatSection('GYM_PERFORMANCE', trainingLines);

  // 4. MENTAL & SLEEP (Crucial for correlation)
  const sleepLines = [];
  last7Days.forEach(date => {
    const s = sleeping[date];
    if (!s) return;
    const durHrs = Math.round((s.duration || 0) / 360000) / 10; // Hours
    sleepLines.push(`  ${date}: Sleep=${durHrs}h, Mood=${s.mood}/5, Note="${s.note || ''}"`);
  });
  const sleepBlock = formatSection('SLEEP_AND_RECOVERY', sleepLines);

  const mentalLines = [];
  last7Days.forEach(date => {
    const dur = mentalLog[date];
    if (dur) mentalLines.push(`  ${date}: MentalTraining=${Math.round(dur/60)} min`);
  });
  const mentalBlock = formatSection('BRAIN_TRAINING', mentalLines);

  // 5. COMPILE PROMPT
  const systemPrompt = (INSIGHT_SYSTEM_PROMPTS[langIndex] || INSIGHT_SYSTEM_PROMPTS[0]).trim();
  const instructionBlock = (INSIGHT_USER_PROMPT_TEMPLATES[langIndex] || INSIGHT_USER_PROMPT_TEMPLATES[0]).trim();

  const userPrompt = `
${instructionBlock}

${userBlock}

${sleepBlock}
${habitsBlock}
${trainingsBlock}
${mentalBlock}

(Analyze the data above looking for patterns between Sleep -> Gym or Habits -> Mood)
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

    if (!res.ok) throw new Error(`Insight API error: ${res.status}`);
    
    const data = await res.json();
    return data.insight;
  } catch (error) {
    console.error('Failed to get insight:', error);
    throw error;
  }
}