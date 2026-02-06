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
    TIME_MANAGEMENT: 'efficiency',
    RUNNING:'running',   // NEW: Dedicated running analysis
    CYCLING: 'cycling'  
};

const INSIGHT_SYSTEM_PROMPTS = [
    // 0 — RU
    `Ты — элитный спортивный физиолог и аналитик данных по имени UltyMyBro. Анализируй данные о сне 😴, тренировках 💪, ментальном состоянии 🧠 и задачах ✅. 

ОСНОВНЫЕ ПРАВИЛА:
1. Инсайт должен быть КРАТКИМ — 2-4 предложения, максимум 120 слов
2. Используй эмодзи как визуальные маркеры:
   • 😴 — сон и восстановление
   • ⚡ — энергия и выносливость
   • 💡 — ключевой вывод
   • 📈 — тренды и корреляции
   • ✅ — рекомендация к действию
3. Всегда обращайся к пользователю по имени
4. Завершай сообщение подписью «— UltyMyBro»

Формат ответа:
💡 [Краткий вывод о главной взаимосвязи]
📈 [Конкретная корреляция из данных]
✅ [Одна конкретная рекомендация]

НЕ пиши длинные абзацы, избегай общих фраз.`,

    // 1 — EN
    `You are an elite sports physiologist and data scientist named UltyMyBro. Analyze sleep 😴, workouts 💪, mental state 🧠, and tasks ✅ data.

CORE RULES:
1. Insight MUST be CONCISE — 2-4 sentences, max 120 words
2. Use emojis as visual markers:
   • 😴 — sleep & recovery
   • ⚡ — energy & endurance
   • 💡 — key insight
   • 📈 — trends & correlations
   • ✅ — actionable recommendation
3. Always address the user by name
4. End with signature "— UltyMyBro"

Response format:
💡 [Brief core insight]
📈 [Specific data correlation]
✅ [One concrete action step]

NO long paragraphs, NO generic advice.`
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
    ],
    [INSIGHT_TYPES.RUNNING]: [
        `Анализ беговых тренировок (последние 7 дней):\n1) 📈 Динамика: Изменение дистанции, темпа (мин/км) и ЧСС за неделю.\n2) 🥇 Пиковая сессия: Лучший результат по дистанции/темпу с анализом условий.\n3) ⚠️ Риски: Признаки переутомления (ухудшение темпа при той же дистанции, аномальная ЧСС).\n4) 🎯 Тактика: Конкретная рекомендация по улучшению выносливости или скорости на следующую неделю. Упомяни погодные условия если есть в заметках.`,
        `Running Analysis (Last 7 Days):\n1) 📈 Trend: Distance, pace (min/km), and heart rate progression.\n2) 🥇 Peak Session: Best distance/pace performance with context analysis.\n3) ⚠️ Risks: Overtraining signs (worsening pace at same distance, abnormal HR).\n4) 🎯 Strategy: Specific recommendation to improve endurance/speed next week. Mention weather conditions if noted in logs.`
    ],
    [INSIGHT_TYPES.CYCLING]: [
        `Анализ велотренировок (последние 7 дней):\n1) 📈 Динамика: Скорость (км/ч), набор высоты (м) и каденс (об/мин) за неделю.\n2) 🥇 Пиковая сессия: Лучший результат по дистанции/средней скорости с анализом профиля маршрута (равнина/холмы).\n3) ⚠️ Риски: Признаки перетренированности (падение каденса при той же мощности, аномальная ЧСС).\n4) 🎯 Тактика: Рекомендация по интервальной тренировке или работе над техникой педалирования на следующую неделю. Упомяни влияние рельефа из заметок.`,
        `Cycling Analysis (Last 7 Days):\n1) 📈 Trend: Speed (km/h), elevation gain (m), and cadence (rpm) progression.\n2) 🥇 Peak Session: Best distance/average speed performance with terrain analysis (flat/hilly).\n3) ⚠️ Risks: Overtraining signs (declining cadence at same power output, abnormal HR response).\n4) 🎯 Strategy: Specific interval training or pedaling technique recommendation for next week. Reference terrain impact from session notes.`
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

    // 8. TRAININGS (UPDATED FOR CARDIO + GYM)
const trainingLines = [];
last7Days.forEach(date => {
    const sessions = trainings[date];
    if (!sessions || !sessions.length) return;
    
    sessions.forEach((s) => {
        // ОПРЕДЕЛЕНИЕ ТИПА ТРЕНИРОВКИ
        const isCardio = s.type && ['RUNNING', 'CYCLING', 'SWIMMING'].includes(s.type);
        const isGym = !isCardio || s.type === 'GYM' || !s.type;
        
        if (isCardio) {
            // === КАРДИО СЕССИЯ ===
            // Форматирование дистанции (плавание в метрах, остальное в км)
            let distanceStr;
            if (s.type === 'SWIMMING') {
                distanceStr = `${Math.round(s.distance * 1000)} m`;
            } else {
                distanceStr = `${s.distance.toFixed(1)} km`;
            }
            
            // Длительность: для кардио хранится в минутах, для силовых в мс
            const durationMinutes = Math.round(s.duration || 0);
            
            // Расчёт темпа (бег) или скорости (велосипед)
            let paceSpeedStr = '';
            if (s.type === 'RUNNING' && s.distance > 0 && durationMinutes > 0) {
                const pace = durationMinutes / s.distance; // мин/км
                const min = Math.floor(pace);
                const sec = Math.round((pace - min) * 60);
                paceSpeedStr = ` | Pace: ${min}:${sec.toString().padStart(2, '0')} min/km`;
            } else if (s.type === 'CYCLING' && s.distance > 0 && durationMinutes > 0) {
                const hours = durationMinutes / 60;
                const speed = s.distance / hours;
                paceSpeedStr = ` | Speed: ${speed.toFixed(1)} km/h`;
            }
            
            // Сборка строки с метриками
            const metrics = [
                `Type: ${s.type}`,
                `Distance: ${distanceStr}`,
                `Duration: ${durationMinutes} min${paceSpeedStr}`
            ];
            
            if (s.elevationGain > 0) metrics.push(`Elevation: ${s.elevationGain} m`);
            if (s.avgHeartRate > 0) metrics.push(`HR: ${s.avgHeartRate} bpm`);
            if (s.avgCadence > 0) {
                const unit = s.type === 'CYCLING' ? 'rpm' : 'spm';
                metrics.push(`Cadence: ${s.avgCadence} ${unit}`);
            }
            if (s.rpe > 0) metrics.push(`RPE: ${s.rpe}/10`);
            if (s.notes?.trim()) {
                const note = s.notes.trim().length > 40 
                    ? s.notes.trim().substring(0, 40) + '...' 
                    : s.notes.trim();
                metrics.push(`Notes: "${note}"`);
            }
            
            trainingLines.push(`  DATE: ${date} | ${metrics.join(' | ')}`);
            
        } else if (isGym) {
            // === СИЛОВАЯ ТРЕНИРОВКА ===
            const program = programs[s.programId];
            const programName = program?.name 
                ? (Array.isArray(program.name) ? program.name[1] || `Prog #${s.programId}` : program.name)
                : `Prog #${s.programId}`;
            
            // Длительность в минутах (силовые хранятся в миллисекундах)
            const durationMinutes = Math.round((s.duration || 0) / 60000);
            
            trainingLines.push(`  DATE: ${date} | Program: ${programName} | Duration: ${durationMinutes} min`);
            
            // Упражнения
            const order = s.exerciseOrder || [];
            order.forEach(exId => {
                const exData = s.exercises?.[exId];
                if (!exData) return;
                
                const exMeta = exercises[exId];
                const exName = exMeta?.name 
                    ? (Array.isArray(exMeta.name) ? exMeta.name[1] || `Ex #${exId}` : exMeta.name)
                    : `Ex #${exId}`;
                
                let maxWeight = 0;
                let totalReps = 0;
                (exData.sets || []).forEach(set => {
                    if (set.weight > maxWeight) maxWeight = set.weight;
                    totalReps += (set.reps || 0);
                });
                
                const volume = exData.totalTonnage || 0;
                trainingLines.push(`    - ${exName}: Max=${maxWeight}kg, Reps=${totalReps}, Vol=${volume.toFixed(1)}kg`);
            });
        }
    });
});
const trainingsBlock = formatSection('TRAINING_LOG', trainingLines);

    // 9. MENTAL TRAINING (UNCHANGED)
    const mentalLines = [];

last7Days.forEach(date => {
    const sessions = AppData.mentalLog[date];
    
    if (!Array.isArray(sessions) || sessions.length === 0) {
        mentalLines.push(`  ${date}: []`);
        return;
    }
    
    mentalLines.push(`  ${date}: [`);
    sessions.forEach((session, idx) => {
        // Output raw session object exactly as stored (type/difficulty already strings per your structure)
        const sessionStr = `{type:'${session.type}',difficulty:'${session.difficulty}',duration:${session.duration},scores:${session.scores},rightAnswers:'${session.rightAnswers}',maxPosibleScores:${session.maxPosibleScores}}`;
        mentalLines.push(`    ${sessionStr}${idx < sessions.length - 1 ? ',' : ''}`);
    });
    mentalLines.push(`  ]`);
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