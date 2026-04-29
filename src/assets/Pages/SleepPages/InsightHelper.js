import { AppData, UserData } from "../../StaticClasses/AppData";
import { allHabits } from "../../Classes/Habit";

// FIXED: Removed trailing space in API URL (critical bug fix)
const API_BASE = 'https://ultymylife.ru/api/insight';
const INSIGHT_REASONING_EFFORT = 'high';

const getLatestMeasurements = () => {
    const latestMeasurements = {};
    const measurementNames = [
        ['Вес тела', 'Body weight'],
        ['Обхват талии', 'Waist circumference'],
        ['Обхват бицепса', 'Biceps circumference'],
        ['Обхват груди', 'Chest circumference'],
        ['Обхват бёдер', 'Hips circumference']
    ];
    
    measurementNames.forEach(([nameRu, nameEn], index) => {
        const category = AppData.measurements?.[index] || [];
        if (category.length > 0) {
            // Get latest entry (already sorted by date in onAddDay)
            const latest = category[category.length - 1];
            latestMeasurements[index] = {
                name: [nameRu, nameEn],
                value: latest.value,
                date: latest.date,
                unit: index === 0 ? 'kg' : 'cm' // Weight in kg, circumferences in cm
            };
        }
    });
    
    return latestMeasurements;
};

export const INSIGHT_TYPES = {
    GENERAL: 'general',
    SLEEP: 'sleep',
    PROGRESS_ANALYSE: 'progress',
    RECOVERY_RATE: 'recovery_rate',
    HABITS: 'habits',
    FOCUS_MINDSET: 'focus',    
    TIME_MANAGEMENT: 'efficiency',
    RUNNING:'running',   // NEW: Dedicated running analysis
    CYCLING: 'cycling',
    FOOD:'food'  
};

const INSIGHT_SYSTEM_PROMPTS = [
    // 0 — RU
    `Ты — UltyMyBro: строгий, дружелюбный аналитик здоровья, продуктивности и тренировочного прогресса. Твоя задача — превращать данные приложения в практичный вывод, а не мотивирующий текст.

ОСНОВНЫЕ ПРАВИЛА:
1. Ответ должен быть полезным, конкретным и легко сканируемым — 110-180 слов.
2. Не выдумывай факты. Используй только наборы данных, разрешённые выбранным разделом в пользовательском запросе.
3. Если данных мало, не называй это провалом. Скажи: "данных пока мало", укажи какие именно данные нужны и зачем.
4. Не используй драматичные формулировки, длинные прощания, подписи, общую мотивацию и медицинские обещания.
5. План должен быть реалистичным на ближайшие 7 дней: маленькие действия, которые можно отметить в приложении.
6. В каждом блоке должна быть одна главная мысль. Без длинных абзацев.
7. Перед ответом проведи внутренний анализ: отдели факты от отсутствующих данных, найди причинно-следственные гипотезы, выбери только рекомендации с максимальной практической ценностью. Не показывай ход рассуждений.

Формат ответа строго такой:
Привет, [имя].
📊 Анализ: [что видно по данным + чего не хватает, если данных мало]
💪 Сильная сторона: [лучший сигнал или самый перспективный паттерн]
⚠️ Ограничение: [что мешает сделать точный вывод или прогресс]
🎯 План:
1. [конкретный микро-шаг на 1-2 минуты или 1 запись]
2. [конкретный микро-шаг]
3. [конкретный микро-шаг]

Стиль: уверенный, спокойный, без канцелярита. Пиши как персональный аналитик, который уважает данные.`,

    // 1 — EN
    `You are UltyMyBro: a strict, friendly analyst for health, productivity, and training progress. Your job is to turn app data into practical insight, not motivational copy.

CORE RULES:
1. The answer must be useful, concrete, and easy to scan — 110-180 words.
2. Do not invent facts. Use only the datasets allowed by the selected section in the user prompt.
3. If data is sparse, do not frame it as failure. Say "data is still limited", list exactly what is missing and why it matters.
4. Avoid dramatic wording, long sign-offs, generic motivation, and medical promises.
5. The plan must fit the next 7 days: small actions the user can log in the app.
6. Each block should contain one main idea. No long paragraphs.
7. Before answering, do internal analysis: separate facts from missing data, identify causal hypotheses, and keep only recommendations with the highest practical value. Do not reveal chain-of-thought.

Use this exact response format:
Hi, [name].
📊 Analysis: [what the data shows + what is missing if data is sparse]
💪 Strength: [best signal or most promising pattern]
⚠️ Limitation: [what prevents a precise conclusion or progress]
🎯 Plan:
1. [specific 1-2 minute or one-log micro-step]
2. [specific micro-step]
3. [specific micro-step]

Style: calm, confident, and data-respecting. Write like a personal analyst.`
];

const INSIGHT_USER_PROMPT_TEMPLATES = {
    [INSIGHT_TYPES.GENERAL]: [
        `Сделай общий отчёт по продуктивности. Сопоставь сон, восстановление, дыхание/медитацию/закалку, привычки, задачи, тренировки и тренировки мозга. Найди 1 главный паттерн, 1 сильную сторону и 1 ограничение данных. Если данных мало, объясни, какой минимум записей нужен за 7 дней для точного анализа. Ответ строго в формате system prompt.`,
        `Create an overall productivity report. Compare sleep, recovery, breathing/meditation/cold exposure, habits, tasks, workouts, and brain training. Find 1 main pattern, 1 strength, and 1 data limitation. If data is sparse, explain the minimum logs needed over 7 days for a reliable analysis. Answer strictly in the system prompt format.`
    ],
    [INSIGHT_TYPES.SLEEP]: [
        `РАЗДЕЛ: СОН. Используй только SLEEP_AND_RECOVERY. Не давай советы по привычкам, задачам, тренировкам, питанию, дыханию, медитации или ментальным играм. Анализируй только записи сна: регулярность, длительность, самочувствие, заметки, пропуски и тренд за последние 7 дней. Если данных мало, предложи минимальный способ вести лог сна 7 дней. Ответ строго в формате system prompt.`,
        `SECTION: SLEEP. Use only SLEEP_AND_RECOVERY. Do not give habit, task, workout, nutrition, breathing, meditation, or brain-game advice. Analyze only sleep records: consistency, duration, mood, notes, gaps, and the last-7-day trend. If data is sparse, suggest a minimal 7-day sleep logging routine. Answer strictly in the system prompt format.`
    ],
    [INSIGHT_TYPES.PROGRESS_ANALYSE]: [
        `РАЗДЕЛ: ПРОГРЕСС. Используй только USER CONTEXT, TRAINING_LOG и MEASUREMENTS. Не давай рекомендации по сну, привычкам, задачам или медитации, если они не нужны для объяснения тренировочного прогресса. Проверь частоту, объём, веса, повторы, кардио, последовательность и признаки плато. Если данных мало, предложи минимальный способ начать отслеживание прогресса без перегруза. Ответ строго в формате system prompt.`,
        `SECTION: PROGRESS. Use only USER CONTEXT, TRAINING_LOG, and MEASUREMENTS. Do not give sleep, habit, task, or meditation advice unless it directly explains training progress. Inspect frequency, volume, weights, reps, cardio, consistency, and plateau signs. If data is sparse, suggest a minimal way to start tracking progress without overload. Answer strictly in the system prompt format.`
    ],
    [INSIGHT_TYPES.RECOVERY_RATE]: [
        `РАЗДЕЛ: ВОССТАНОВЛЕНИЕ. Используй только SLEEP_AND_RECOVERY, BREATHING_EXERCISES, MEDITATION, HARDENING и при необходимости кратко TRAINING_LOG как источник нагрузки. Не давай советы по привычкам, задачам, питанию или ментальным играм. Смотри на регулярность, длительность, пробелы и связь с нагрузкой. Не давай медицинских диагнозов. Ответ строго в формате system prompt.`,
        `SECTION: RECOVERY. Use only SLEEP_AND_RECOVERY, BREATHING_EXERCISES, MEDITATION, HARDENING, and briefly TRAINING_LOG only as load context if needed. Do not give habit, task, nutrition, or brain-game advice. Look at consistency, duration, gaps, and relation to training load. Do not give medical diagnoses. Answer strictly in the system prompt format.`
    ],
    [INSIGHT_TYPES.HABITS]: [
        `РАЗДЕЛ: ПРИВЫЧКИ. Используй только HABITS. Запрещено давать общие рекомендации по сну, физическим тренировкам, дыханию, медитации, задачам или логическим играм, если они не оформлены именно как привычки. Анализируй только регулярность привычек, пропуски, категории, автозавершение, streak и процент выполнения. Если данных по привычкам мало или нет, предложи 3 конкретные привычки с формулировками для добавления в менеджер привычек. Каждая рекомендация должна быть действием-привычкой: что делать, когда делать, как часто отмечать. Ответ строго в формате system prompt.`,
        `SECTION: HABITS. Use only HABITS. Do not give general sleep, physical training, breathing, meditation, task, or brain-game advice unless it is phrased strictly as a habit. Analyze only habit consistency, missed days, categories, auto-completion, streak, and completion rate. If habit data is sparse or absent, suggest 3 concrete habits ready to add to the habit manager. Each recommendation must be a habit action: what to do, when to do it, and how often to mark it. Answer strictly in the system prompt format.`
    ],
    [INSIGHT_TYPES.FOCUS_MINDSET]: [
        `РАЗДЕЛ: МЕНТАЛЬНОЕ. Используй только BRAIN_TRAINING. Не давай рекомендации по привычкам, сну, тренировкам, питанию или задачам. Анализируй типы задач, попытки, успешность, ошибки, сложность и динамику. Если попытки были без успеха, формулируй это спокойно как стартовую точку. Ответ строго в формате system prompt.`,
        `SECTION: MENTAL. Use only BRAIN_TRAINING. Do not give habit, sleep, workout, nutrition, or task advice. Analyze task types, attempts, success rate, errors, difficulty, and trend. If attempts had no success yet, frame it calmly as a baseline. Answer strictly in the system prompt format.`
    ],
    [INSIGHT_TYPES.TIME_MANAGEMENT]: [
        `РАЗДЕЛ: ГРАФИК. Используй только TO-DO LIST & PRODUCTIVITY. Не давай советы по привычкам, сну, тренировкам, питанию или ментальным играм. Анализируй созданные задачи, закрытия, переносы, просрочки и категории. Если задач нет, предложи минимальный дневной шаблон из 3 задач. Ответ строго в формате system prompt.`,
        `SECTION: SCHEDULE. Use only TO-DO LIST & PRODUCTIVITY. Do not give habit, sleep, workout, nutrition, or brain-game advice. Analyze created tasks, completed tasks, carry-overs, overdue items, and categories. If there are no tasks, suggest a minimal daily 3-task template. Answer strictly in the system prompt format.`
    ],
    [INSIGHT_TYPES.RUNNING]: [
        `РАЗДЕЛ: БЕГ. Используй только USER CONTEXT и TRAINING_LOG с типом RUNNING. Не давай советы по привычкам, сну, силовым тренировкам, питанию или задачам. Проверь дистанцию, длительность, темп, частоту, пульс если есть, и цель endurance. Если бега нет, предложи безопасный беговой старт без медицинских обещаний. Ответ строго в формате system prompt.`,
        `SECTION: RUNNING. Use only USER CONTEXT and TRAINING_LOG entries with RUNNING type. Do not give habit, sleep, strength training, nutrition, or task advice. Inspect distance, duration, pace, frequency, heart rate if available, and endurance goal. If there is no running data, suggest a safe running start without medical promises. Answer strictly in the system prompt format.`
    ],
    [INSIGHT_TYPES.CYCLING]: [
        `РАЗДЕЛ: ВЕЛО. Используй только USER CONTEXT и TRAINING_LOG с типом CYCLING. Не давай советы по привычкам, сну, силовым тренировкам, питанию или задачам. Проверь дистанцию, длительность, скорость, частоту, пульс если есть, и цель endurance. Если данных нет, предложи стартовый вело-протокол. Ответ строго в формате system prompt.`,
        `SECTION: CYCLING. Use only USER CONTEXT and TRAINING_LOG entries with CYCLING type. Do not give habit, sleep, strength training, nutrition, or task advice. Inspect distance, duration, speed, frequency, heart rate if available, and endurance goal. If there is no data, suggest a starter cycling protocol. Answer strictly in the system prompt format.`
    ],
    [INSIGHT_TYPES.FOOD]: [
        `РАЗДЕЛ: ПИТАНИЕ. Используй только USER CONTEXT, MEASUREMENTS и кратко TRAINING_LOG как контекст активности. Не давай советы по привычкам, задачам, сну, медитации или ментальным играм. Учитывай цель, пол, телосложение, вес, измерения и активность. Не ставь диагнозов. Дай практичный план питания на 7 дней в микро-шагах, без точных медицинских обещаний. Ответ строго в формате system prompt.`,
        `SECTION: FOOD. Use only USER CONTEXT, MEASUREMENTS, and briefly TRAINING_LOG as activity context. Do not give habit, task, sleep, meditation, or brain-game advice. Consider goal, gender, body type, weight, measurements, and activity. Do not diagnose. Give a practical 7-day nutrition plan through micro-steps, without precise medical promises. Answer strictly in the system prompt format.`
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
    const todoList = AppData.todoList || [];
    const programs = AppData.programs || {};
    const exercises = AppData.exercises || {};
    const allhabits = allHabits || {};

    const formatSection = (title, contentLines) => {
        if (contentLines.length === 0) return `${title} (last 7 days):\n  No data found\n`;
        return `${title} (last 7 days):\n${contentLines.join('\n')}\n`;
    };

    // 1. USER CONTEXT (ENHANCED WITH NAME)
    const latestMeasurements = getLatestMeasurements();

const userBlock = `
USER CONTEXT:
- Name: ${userName || 'User'}
- Profile: ${user.age || '?'} y.o, ${user.gender === 0 ? 'Male' : 'Female'}, ${user.height ? `${user.height} cm` : ''}${user.weight ? `, ${user.weight} kg` : ''}${user.height && user.weight ? `, BMI: ${(user.weight / ((user.height/100) ** 2)).toFixed(1)}` : ''}
- Primary Goal: ${user.goal !== undefined ? ['Muscle Gain', 'Strength', 'Fat Loss', 'Maintenance', 'Endurance'][user.goal] || 'General' : 'General'}
- Training Experience: ${user.trainingExperience ? `${user.trainingExperience} months` : 'Beginner'}
- Current Focus: ${user.currentFocus || 'Balanced development'}

MEASUREMENTS (Latest):
${Object.entries(latestMeasurements).length > 0 
    ? Object.values(latestMeasurements).map(m => 
        `- ${m.name[langIndex]}: ${m.value} ${m.unit} (updated ${m.date})`
      ).join('\n')
    : `- No recent measurements recorded. Consider tracking for better progress insights.`
}
`.trim();

const identityBlock = `
USER:
- Name: ${userName || 'User'}
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



    const blocksByType = {
        [INSIGHT_TYPES.GENERAL]: [
            userBlock,
            todoBlock,
            sleepBlock,
            breathingBlock,
            meditationBlock,
            hardeningBlock,
            habitsBlock,
            trainingsBlock,
            mentalBlock
        ],
        [INSIGHT_TYPES.SLEEP]: [identityBlock, sleepBlock],
        [INSIGHT_TYPES.PROGRESS_ANALYSE]: [userBlock, trainingsBlock],
        [INSIGHT_TYPES.RECOVERY_RATE]: [identityBlock, sleepBlock, breathingBlock, meditationBlock, hardeningBlock, trainingsBlock],
        [INSIGHT_TYPES.HABITS]: [identityBlock, habitsBlock],
        [INSIGHT_TYPES.FOCUS_MINDSET]: [identityBlock, mentalBlock],
        [INSIGHT_TYPES.TIME_MANAGEMENT]: [identityBlock, todoBlock],
        [INSIGHT_TYPES.RUNNING]: [userBlock, trainingsBlock],
        [INSIGHT_TYPES.CYCLING]: [userBlock, trainingsBlock],
        [INSIGHT_TYPES.FOOD]: [userBlock, trainingsBlock]
    };

    const selectedBlocks = blocksByType[type] || blocksByType[INSIGHT_TYPES.GENERAL];
    const userPrompt = [instructionBlock, ...selectedBlocks].join('\n\n').trim();

   //console.log(userPrompt);

    return { systemPrompt, userPrompt };
}

export async function getInsight(langIndex, type = INSIGHT_TYPES.GENERAL) {
    try {
        const { systemPrompt, userPrompt } = getInsightPrompt(langIndex, type);

        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reasoningEffort: INSIGHT_REASONING_EFFORT,
                reasoning: { effort: INSIGHT_REASONING_EFFORT },
                metadata: {
                    insightType: type,
                    reasoningEffort: INSIGHT_REASONING_EFFORT
                },
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
