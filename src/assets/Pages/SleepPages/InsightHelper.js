import { AppData, UserData } from "../../StaticClasses/AppData";
import { allHabits } from "../../Classes/Habit";

// FIXED: Removed trailing space in API URL (critical bug fix)
const API_BASE = 'https://ultymylife.ru/api/insight';

export const INSIGHT_TYPES = {
    GENERAL: 'general',
    PROGRESS_ANALYSE: 'progress',
    RECOVERY_RATE: 'recovery_rate',
    HABITS: 'habits',
    FOCUS_MINDSET: 'focus',    
    TIME_MANAGEMENT: 'efficiency'  
};

const INSIGHT_SYSTEM_PROMPTS = [
    // 0 — RU
    `Ты — элитный спортивный физиолог, аналитик данных и стратег по продуктивности.Тебя зовут UltyMyBro. Твоя цель — найти скрытые взаимосвязи между сном, ментальным состоянием, физической нагрузкой и выполнением задач (To-Do), чтобы оптимизировать жизнь пользователя. Всегда обращайся к пользователю по имени, попрощайся в конце от своего имени.`,
    
    // 1 — EN
    `You are an elite sports physiologist, data scientist, and productivity strategist.You are called UltyMyBro. Your goal is to find hidden correlations between sleep, mental state, physical performance, and task execution (To-Do) to optimize the user's life. Always address the user by their name, say goodbye at the end on your behalf.`
];

const INSIGHT_USER_PROMPT_TEMPLATES = {
    [INSIGHT_TYPES.GENERAL]: [
        `Отчёт по общей продуктивности (Синтез всех сфер):\n1) 📊 Анализ: Как сон, дыхательные практики, медитация и закалка повлияли на закрытие задач?\n2) 💪 Главная победа: Лучший результат в спорте или дисциплине.\n3) ⚠️ Узкое горлышко: Что мешает успевать всё?\n4) 🎯 План: 3 микро-шага на неделю.Поприветствуй пользователя в начале по имени`,
        `General Productivity Report (Life Synthesis):\n1) 📊 Analysis: How did sleep, breathing exercises, meditation, and hardening impact task completion?\n2) 💪 Key Win: Top achievement in sports or discipline.\n3) ⚠️ Bottleneck: What is hindering your overall progress?\n4) 🎯 Action Plan: 3 micro-steps for next week.Greet the user by name at the start`
    ],
    [INSIGHT_TYPES.PROGRESS_ANALYSE]: [
        `Анализ прогресса (Кратко):\n1) 📈 Тренд: Веса и объём — рост или плато?\n2) 🔥 Пик: Самый эффективный день.\n3) 🎯 Коррекция: Одно правка в интенсивность.`,
        `Progress Analysis (Brief):\n1) 📈 Trend: Weights & Volume — growth or plateau?\n2) 🔥 Peak: Most effective day.\n3) 🎯 Correction: One adjustment to intensity.`
    ],
    [INSIGHT_TYPES.RECOVERY_RATE]: [
        `Восстановление (Вердикт):\n1) 🛌 Ресурс: Хватает ли сна и практик восстановления (дыхание/медитация/закалка) для твоих нагрузок?\n2) ⚠️ Риск: Признаки переутомления.\n3) 🎯 Режим: Конкретный совет по отдыху сегодня.`,
        `Recovery (Verdict):\n1) 🛌 Resource: Are sleep and recovery practices (breathing/meditation/hardening) sufficient for your load?\n2) ⚠️ Risk: Signs of overtraining.\n3) 🎯 Protocol: Specific rest advice for today.`
    ],
    [INSIGHT_TYPES.HABITS]: [
        `Дисциплина (Паттерны):\n1) 🧱 Якорь: Твоя самая стабильная привычка.\n2) ⚠️ Сбой: Когда и почему происходят срывы?\n3) 🎯 Укрепление: Как закрыть слабое звено.`,
        `Discipline (Patterns):\n1) 🧱 Anchor: Your most stable habit.\n2) ⚠️ Leak: When and why do failures occur?\n3) 🎯 Fix: How to strengthen the weak link.`
    ],
    [INSIGHT_TYPES.FOCUS_MINDSET]: [
        `Ментальный фокус:\n1) 🧠 Состояние: Уровень ментальной выносливости и риск выгорания.\n2) ⚡️ Совет: Один психологический прием для фокуса сегодня.`,
        `Focus & Mindset:\n1) 🧠 State: Mental stamina level and burnout risk.\n2) ⚡️ Tip: One psychological tactic for focus today.`
    ],
    [INSIGHT_TYPES.TIME_MANAGEMENT]: [
        `Управление временем:\n1) 🕒 Golden Hour: Твое самое продуктивное время на основе логов.\n2) 📉 Dead Zone: Когда эффективность падает и как это исправить.`,
        `Time Management:\n1) 🕒 Golden Hour: Your most productive window based on logs.\n2) 📉 Dead Zone: When efficiency drops and how to fix it.`
    ]
};

export function getInsightPrompt(langIndex, type = INSIGHT_TYPES.GENERAL) {
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

    // EXTRACT USER NAME FROM PROFILE (critical addition)
    const user = AppData.pData || {};
    const userName = UserData.name?.trim() || (langIndex === 0 ? 'Пользователь' : 'User');
    
    // Existing data sources + NEW wellness logs
    const habitsByDate = AppData.habitsByDate || {};
    const trainings = AppData.trainingLog || {};
    const breathing = AppData.breathingLog || {};      // ACTIVELY PROCESSED
    const meditation = AppData.meditationLog || {};    // ACTIVELY PROCESSED
    const hardening = AppData.hardeningLog || {};      // ACTIVELY PROCESSED
    const sleeping = AppData.sleepingLog || {};
    const mentalLog = AppData.mentalLog || {};
    const todoList = AppData.todoList || [];
    const programs = AppData.programs || {};
    const exercises = AppData.exercises || {};
    const allhabits = allHabits || {};

    const formatSection = (title, contentLines) => {
        if (contentLines.length === 0) return `${title} (last 7 days):\n  No data found\n`;
        return `${title} (last 7 days):\n${contentLines.join('\n')}\n`;
    };

    // 1. USER CONTEXT (ENHANCED WITH NAME)
    const userBlock = `
USER CONTEXT:
- Name: ${userName}
- Profile: ${user.age || '?'} y.o, ${user.gender === 0 ? 'Male' : 'Female'}, Goal: ${user.goal !== undefined ? ['Mass', 'Strength', 'Cut', 'Health'][user.goal] : 'General'}
`.trim();

    // 2. TODO LIST (UNCHANGED)
    const todoLines = todoList.map(task => {
        const subtasks = task.goals || [];
        const completedSub = subtasks.filter(g => g.isDone).length;
        const subProgress = subtasks.length > 0 ? `(${completedSub}/${subtasks.length} goals)` : "";
        const status = task.isDone ? "✅ DONE" : "⏳ IN PROGRESS";
        return `  - [${task.category}] ${task.name}: ${status} ${subProgress} | Priority: ${task.priority}/5, Urgency: ${task.urgency}/5, Difficulty: ${task.difficulty}/5 | Deadline: ${task.deadLine}`;
    });
    const todoBlock = formatSection('TO-DO LIST & PRODUCTIVITY', todoLines);

    // 3. SLEEP (UNCHANGED)
    const sleepLines = [];
    last7Days.forEach(date => {
        const s = sleeping[date];
        if (!s) return;
        const durHrs = Math.round((s.duration || 0) / 360000) / 10;
        sleepLines.push(`  ${date}: Sleep=${durHrs}h, Mood=${s.mood}/5, Note="${s.note || ''}"`);
    });
    const sleepBlock = formatSection('SLEEP_AND_RECOVERY', sleepLines);

    // 4. BREATHING EXERCISES (NEW)
    const breathingLines = [];
    last7Days.forEach(date => {
        const sessions = Array.isArray(breathing[date]) ? breathing[date] : [];
        sessions.forEach((session, idx) => {
            if (!session?.startTime || !session?.endTime) return;
            const durMin = Math.round((session.endTime - session.startTime) / 60000);
            const holdSec = session.maxHold ? Math.round(session.maxHold / 1000) : 0;
            breathingLines.push(`  ${date} [Session ${idx + 1}]: Duration=${durMin} min, Max Breath Hold=${holdSec} sec`);
        });
    });
    const breathingBlock = formatSection('BREATHING_EXERCISES', breathingLines);

    // 5. MEDITATION (NEW)
    const meditationLines = [];
    last7Days.forEach(date => {
        const sessions = Array.isArray(meditation[date]) ? meditation[date] : [];
        sessions.forEach((session, idx) => {
            if (!session?.startTime || !session?.endTime) return;
            const durMin = Math.round((session.endTime - session.startTime) / 60000);
            meditationLines.push(`  ${date} [Session ${idx + 1}]: Duration=${durMin} min`);
        });
    });
    const meditationBlock = formatSection('MEDITATION', meditationLines);

    // 6. HARDENING (NEW)
    const hardeningLines = [];
    last7Days.forEach(date => {
        const sessions = Array.isArray(hardening[date]) ? hardening[date] : [];
        sessions.forEach((session, idx) => {
            if (!session?.startTime || !session?.endTime) return;
            const totalMin = Math.round((session.endTime - session.startTime) / 60000);
            const coldMin = session.timeInColdWater ? Math.round(session.timeInColdWater / 60000) : 0;
            hardeningLines.push(`  ${date} [Session ${idx + 1}]: Total=${totalMin} min, Cold Exposure=${coldMin} min`);
        });
    });
    const hardeningBlock = formatSection('HARDENING', hardeningLines);

    // 7. HABITS (UNCHANGED)
    const habitLines = [];
    last7Days.forEach(date => {
        const dayData = habitsByDate[date];
        if (!dayData) return;
        const arr = Array.isArray(dayData) ? dayData : Object.entries(dayData).map(([habitId, status]) => ({ habitId: Number(habitId), status }));
        const dayHabits = arr.map(item => {
            const h = allhabits[item.habitId];
            const name = h?.name ? (h.name[1] || h.name[0]) : `Habit #${item.habitId}`; 
            let statusStr = "Skipped";
            if (item.status === -2) statusStr = "Done";
            if (item.status === 1) statusStr = "Abstained (Success)";
            if (item.status === 0) statusStr = "Failed/Skipped";
            return `${name}: ${statusStr}`;
        });
        if (dayHabits.length > 0) habitLines.push(`  ${date}: ${dayHabits.join(', ')}`);
    });
    const habitsBlock = formatSection('HABITS', habitLines);

    // 8. TRAININGS (UNCHANGED)
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
                let maxWeight = 0;
                let totalReps = 0;
                (exData.sets || []).forEach(set => {
                   if(set.weight > maxWeight) maxWeight = set.weight;
                   totalReps += (set.reps || 0);
                });
                trainingLines.push(`    - ${exName}: MaxWeight=${maxWeight}kg, TotalReps=${totalReps}, Vol=${exData.totalTonnage || 0}`);
            });
        });
    });
    const trainingsBlock = formatSection('GYM_PERFORMANCE', trainingLines);

    // 9. MENTAL TRAINING (UNCHANGED)
    const mentalLines = [];
    last7Days.forEach(date => {
        const dur = mentalLog[date];
        if (dur) mentalLines.push(`  ${date}: MentalTraining=${Math.round(dur/60)} min`);
    });
    const mentalBlock = formatSection('BRAIN_TRAINING', mentalLines);

    // COMPILE PROMPT WITH OPTIMIZED SECTION ORDER & PERSONALIZATION
    const systemPrompt = (INSIGHT_SYSTEM_PROMPTS[langIndex] || INSIGHT_SYSTEM_PROMPTS[0]).trim();
    const instructionBlock = (INSIGHT_USER_PROMPT_TEMPLATES[type][langIndex] || INSIGHT_USER_PROMPT_TEMPLATES[type][0]).trim();

    // CRITICAL: Inject name into analysis guidance + expanded correlation logic
    const analysisGuidance = `
(Task for AI:
1. ALWAYS address the user as "${userName}" in your response.
2. Cross-reference To-Do completion rates with ALL recovery metrics: Sleep quality, Breathing frequency/duration, Meditation duration, Hardening exposure.
3. Analyze correlations between high-difficulty tasks (Priority/Urgency/Difficulty ≥4) and wellness metrics.
4. Assess if consistent wellness practices correlate with improved sleep scores, gym performance, or task completion.
5. Flag recovery deficits when high-stress tasks coincide with low wellness activity or poor sleep metrics.)
`.trim();

    const userPrompt = `
${instructionBlock}

${userBlock}

${todoBlock}
${sleepBlock}
${breathingBlock}
${meditationBlock}
${hardeningBlock}
${habitsBlock}
${trainingsBlock}
${mentalBlock}
${analysisGuidance}
`.trim();

    return { systemPrompt, userPrompt };
}

export async function getInsight(langIndex, type = INSIGHT_TYPES.GENERAL) {
    try {
        const { systemPrompt, userPrompt } = getInsightPrompt(langIndex, type);

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

        if (!res.ok) throw new Error(`Insight API error: ${res.status} ${res.statusText}`);
        const data = await res.json();
        return data.insight;
    } catch (error) {
        console.error('Failed to get insight:', error);
        // Return user-friendly error message in correct language
        const errorMsg = langIndex === 0 
            ? `Не удалось получить аналитику: ${error.message}. Проверьте подключение к интернету.` 
            : `Failed to generate insight: ${error.message}. Please check your connection.`;
        throw new Error(errorMsg);
    }
}