import { AppData, UserData } from "../../StaticClasses/AppData";
import { allHabits } from "../../Classes/Habit";

// FIXED: Removed trailing space in API URL (critical bug fix)
const API_BASE = 'https://ultymylife.ru/api/insight';

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
4. Завершай сообщение подписью необычным прощанием и используй свое имя : UltyMyBro.

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
4. End with original farewell and your name : UltyMyBro.

Response format:
💡 [Brief core insight]
📈 [Specific data correlation]
✅ [One concrete action step]

NO long paragraphs, NO generic advice.`
];

const INSIGHT_USER_PROMPT_TEMPLATES = {
    [INSIGHT_TYPES.GENERAL]: [
        `Отчёт по общей продуктивности (Синтез всех сфер):\n1) 📊 Анализ: Как сон, дыхательные практики, медитация и закалка повлияли на закрытие задач?\n2) 💪 Главная победа: Лучший результат в спорте или дисциплине.\n3) ⚠️ Узкое горлышко: Что мешает успевать всё?\n4) 🎯 План: 3 микро-шага на неделю.\nПоприветствуй пользователя в начале по имени.`,
        `Overall Productivity Report (Cross-domain synthesis):\n1) 📊 Analysis: How did sleep, breathing practices, meditation, and cold exposure impact task completion?\n2) 💪 Highlight: Best result in fitness or discipline this period.\n3) ⚠️ Bottleneck: What's preventing you from accomplishing everything?\n4) 🎯 Plan: 3 micro-steps for the upcoming week.\nGreet the user by name at the start.`
    ],
    [INSIGHT_TYPES.PROGRESS_ANALYSE]: [
        `Анализ прогресса (Кратко, проанализируй внимательно TRAINING_LOG, если мало данных порекомендуй тренировку на основе данных из USER CONTEXT):\n1) 📈 Тренд: Веса и объём — рост или плато?\n2)`,
        `Progress Analysis (Concise, analyze TRAINING_LOG carefully. If data is insufficient, recommend a workout based on USER CONTEXT):\n1) 📈 Trend: Weights and volume — growth or plateau?\n2)`
    ],
    [INSIGHT_TYPES.RECOVERY_RATE]: [
        `Восстановление (Вердикт используй SLEEP_AND_RECOVERY, BREATHING_EXERCISES, MEDITATION  and HARDENING):\n1) `,
        `Recovery Assessment (Verdict based on SLEEP_AND_RECOVERY, BREATHING_EXERCISES, MEDITATION , and HARDENING):\n1) `
    ],
    [INSIGHT_TYPES.HABITS]: [
        `Дисциплина (Паттерны используй HABITS, если данных нет порекомендуй создать пару конкретных привычек или бросить негативные, в этом приложении откуда идет запрос к тебе очень удобный менеджер привычек):\n1) `,
        `Habit Discipline (Use patterns from HABITS. If no data, recommend creating 2-3 specific positive habits or eliminating negative ones — this app has a powerful habit manager):\n1) `
    ],
    [INSIGHT_TYPES.FOCUS_MINDSET]: [
        `Ментальное состояние (проанализируй BRAIN_TRAINING, если не достаточно данных порекомендуй пройти несколько сессий, там есть тренировка быстрого счета в уме, памяти, реакции и логики, сравни результаты если есть и количество ошибок)`,
        `Mental State (Analyze BRAIN_TRAINING. If insufficient data, recommend completing several sessions — the app includes mental exercises: quick math, memory, reaction, and logic. Compare results and error counts if available)`
    ],
    [INSIGHT_TYPES.TIME_MANAGEMENT]: [
        `Управление временем (используй TO-DO LIST & PRODUCTIVITY, дай небольшую подсказку по задачам если есть, порекомендуй создать если нет записей в логах):\n1) `,
        `Time Management (Use TO-DO LIST & PRODUCTIVITY. Give a small task tip if data exists, recommend creating tasks if logs are empty):\n1) `
    ],
    [INSIGHT_TYPES.RUNNING]: [
        `Анализ беговых тренировок (последние 7 дней, если в USER CONTEXT цель endurance проанализируй данные из TRAINING_LOG особенно тип RUNNING, дай беговые советы, если данных нет порекомендуй с чего начать):\n1) `
        `Running Training Analysis (Last 7 days. If USER CONTEXT goal is endurance, analyze TRAINING_LOG — especially RUNNING type. Give running-specific advice. If no data, recommend how to start):\n1) `
    ],
    [INSIGHT_TYPES.CYCLING]: [
        `Анализ велотренировок (последние 7 дней, если в USER CONTEXT цель endurance проанализируй данные из TRAINING_LOG особенно тип CYCLING, дай вело-советы, если данных нет порекомендуй с чего начать):\n1)  `,
        `Cycling Training Analysis (Last 7 days. If USER CONTEXT goal is endurance, analyze TRAINING_LOG — especially CYCLING type. Give cycling-specific advice. If no data, recommend how to start):\n1)  `
    ],
    [INSIGHT_TYPES.FOOD]: [
        `На основании данных из USER CONTEXT и MEASUREMENTS дай персональные рекомендации по питанию, режим, калораж, примерный рацион. Особенно обрати внимание на телосложение, гендер и цель тренировок.`,
        `Based on USER CONTEXT and MEASUREMENTS data, provide personalized nutrition recommendations: meal timing, calorie target, and sample meal plan. Pay special attention to body type, gender, and training goal.`
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
`.trim();

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