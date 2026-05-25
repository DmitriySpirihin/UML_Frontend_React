import { AppData, formatLocalDateKey, UserData } from './AppData';
import { saveData } from './SaveHelper';

const DEMO_SEED_KEY = 'umlDemoSeed:main-sections:v1';

const dateKey = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return formatLocalDateKey(date);
};

const dayStart = (key, hour = 9, minute = 0) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0).getTime();
};

const makeGymSession = (key, dayIndex, tonnage, durationMinutes, note) => {
  const startTime = dayStart(key, 18, 30);
  const exercises = {
    0: {
      mgId: 0,
      completed: true,
      totalTonnage: Math.round(tonnage * 0.42),
      sets: [
        { type: 0, reps: 12, weight: 40, time: 60000 },
        { type: 1, reps: 8, weight: 70, time: 90000 },
        { type: 1, reps: 8, weight: 72.5, time: 90000 }
      ]
    },
    1: {
      mgId: 1,
      completed: true,
      totalTonnage: Math.round(tonnage * 0.34),
      sets: [
        { type: 0, reps: 10, weight: 30, time: 60000 },
        { type: 1, reps: 10, weight: 52.5, time: 90000 },
        { type: 1, reps: 9, weight: 55, time: 90000 }
      ]
    },
    2: {
      mgId: 9,
      completed: true,
      totalTonnage: Math.round(tonnage * 0.24),
      sets: [
        { type: 0, reps: 12, weight: 50, time: 60000 },
        { type: 1, reps: 10, weight: 85, time: 90000 },
        { type: 1, reps: 8, weight: 90, time: 90000 }
      ]
    }
  };

  return {
    type: 'GYM',
    programId: 0,
    dayIndex,
    completed: true,
    startTime,
    endTime: startTime + durationMinutes * 60000,
    duration: durationMinutes * 60000,
    tonnage,
    exercises,
    exerciseOrder: ['0', '1', '2'],
    RPE: 7,
    note
  };
};

const makeCardioSession = (key, type, distance, durationMinutes, hour, notes) => {
  const startTime = dayStart(key, hour, 10);
  return {
    type,
    completed: true,
    startTime,
    endTime: startTime + durationMinutes * 60000,
    duration: durationMinutes * 60000,
    distance,
    elevationGain: type === 'RUNNING' ? 42 : 120,
    avgCadence: type === 'RUNNING' ? 168 : 84,
    avgHeartRate: type === 'RUNNING' ? 142 : 136,
    rpe: 6,
    notes
  };
};

const mentalSession = (type, difficulty, duration, scores, rightAnswers, maxPosibleScores) => ({
  type,
  difficulty,
  duration,
  scores,
  rightAnswers,
  maxPosibleScores
});

export async function maybeSeedDemoData() {
  if (!import.meta.env.DEV || typeof window === 'undefined') return false;
  if (!['localhost', '127.0.0.1'].includes(window.location.hostname)) return false;
  if (new URLSearchParams(window.location.search).get('noDemoSeed') === '1') return false;
  if (window.localStorage.getItem(DEMO_SEED_KEY)) return false;

  const today = dateKey(0);
  const yesterday = dateKey(-1);
  const twoDaysAgo = dateKey(-2);
  const threeDaysAgo = dateKey(-3);
  const fourDaysAgo = dateKey(-4);
  const fiveDaysAgo = dateKey(-5);
  const sixDaysAgo = dateKey(-6);
  const sevenDaysAgo = dateKey(-7);
  const eightDaysAgo = dateKey(-8);
  const nineDaysAgo = dateKey(-9);

  UserData.name = UserData.name && UserData.name !== 'гость' ? UserData.name : 'Демо пользователь';
  AppData.isFirstStart = false;
  AppData.profileOnboardingShown = true;
  AppData.profileNicknameMode = 'custom';
  AppData.profileCustomNickname = UserData.name;
  AppData.pData = {
    filled: true,
    age: 29,
    gender: 0,
    height: 180,
    weight: 78,
    wrist: 17,
    goal: 1,
    activityLevel: 2,
    trainingExperience: 18
  };
  AppData.profilePreferredSections = ['habits', 'training', 'mental', 'recovery', 'sleep', 'todo'];

  const selectedHabits = [0, 10, 15, 33];
  AppData.choosenHabits = selectedHabits;
  AppData.choosenHabitsTypes = [false, false, false, true];
  AppData.choosenHabitsStartDates = selectedHabits.map(() => dateKey(-12));
  AppData.choosenHabitsDaysToForm = [7, 14, 21, 30];
  AppData.choosenHabitsAutoComplete = { 15: true };
  AppData.choosenHabitsLastSkip = {
    0: dayStart(dateKey(-12), 8),
    10: dayStart(dateKey(-12), 20),
    15: dayStart(dateKey(-12), 9),
    33: dayStart(dateKey(-12), 21)
  };
  AppData.choosenHabitsNotified = {
    0: [true, false, false],
    10: [false, false, false],
    15: [false, false, false],
    33: [false, false, false]
  };
  AppData.choosenHabitsAchievements = { 0: [], 10: [], 15: [], 33: [] };
  AppData.choosenHabitsGoals = {
    0: [
      { text: 'Стакан воды утром', isDone: true },
      { text: '1.5 л воды за день', isDone: true },
      { text: 'Вода перед тренировкой', isDone: false }
    ],
    10: [
      { text: '15 минут чтения', isDone: true },
      { text: 'Заметка по главной мысли', isDone: false }
    ],
    15: [
      { text: 'Собрать топ-3 задачи', isDone: true },
      { text: 'Заблокировать фокус-окно', isDone: true }
    ],
    33: [
      { text: 'Не открывать ленту утром', isDone: true },
      { text: 'Оставить телефон вне спальни', isDone: false }
    ]
  };
  AppData.habitEventTimes = {};
  AppData.habitsByDate = {};
  for (let offset = -12; offset <= 0; offset += 1) {
    const key = dateKey(offset);
    AppData.habitsByDate[key] = {
      0: offset === -5 ? 0 : 1,
      10: [-9, -3].includes(offset) ? 0 : 1,
      15: 1,
      33: [-8, -1].includes(offset) ? -1 : 1
    };
  }

  AppData.todoList = [
    {
      id: 100001,
      name: 'Собрать демо-сценарий главного меню',
      description: 'Проверить карточки, прогресс и переходы по разделам',
      difficulty: 3,
      priority: 5,
      urgency: 5,
      category: 'Продукт',
      icon: 'target',
      isDone: false,
      startDate: threeDaysAgo,
      deadLine: dateKey(2),
      completedAt: null,
      goals: [
        { text: 'Пройти главное меню', aim: 'Навигация', result: '', isDone: true },
        { text: 'Открыть каждый раздел', aim: 'QA', result: '', isDone: false },
        { text: 'Проверить пустые состояния', aim: 'Регрессия', result: '', isDone: false }
      ],
      result: '',
      isPinned: true,
      isHidden: false,
      isPending: false
    },
    {
      id: 100002,
      name: 'Подготовить тренировку недели',
      description: 'Сверить объём, RPE и восстановление',
      difficulty: 4,
      priority: 4,
      urgency: 3,
      category: 'Здоровье',
      icon: 'fitness',
      isDone: false,
      startDate: sixDaysAgo,
      deadLine: dateKey(4),
      completedAt: null,
      goals: [
        { text: 'Выбрать 3 силовые сессии', aim: '', result: '', isDone: true },
        { text: 'Добавить лёгкое кардио', aim: '', result: '', isDone: false }
      ],
      result: '',
      isPinned: false,
      isHidden: false,
      isPending: false
    },
    {
      id: 100003,
      name: 'Закрыть вечерний обзор',
      description: 'Записать итоги дня и план на завтра',
      difficulty: 2,
      priority: 3,
      urgency: 4,
      category: 'Личное',
      icon: 'note',
      isDone: true,
      startDate: yesterday,
      deadLine: today,
      completedAt: new Date().toISOString(),
      goals: [
        { text: 'Отметить привычки', aim: '', result: 'Готово', isDone: true },
        { text: 'Записать одну победу дня', aim: '', result: 'Готово', isDone: true }
      ],
      result: 'День закрыт, план на завтра готов.',
      isPinned: false,
      isHidden: false,
      isPending: false
    }
  ];

  AppData.trainingLog = {
    [nineDaysAgo]: [makeGymSession(nineDaysAgo, 0, 14800, 58, 'Грудь и ноги, базовый объём')],
    [sevenDaysAgo]: [makeGymSession(sevenDaysAgo, 1, 13200, 52, 'Спина и плечи')],
    [fiveDaysAgo]: [makeGymSession(fiveDaysAgo, 2, 12600, 49, 'Лёгкая техника и добивка')],
    [threeDaysAgo]: [makeGymSession(threeDaysAgo, 0, 15400, 56, 'Новый цикл: чуть выше объём')],
    [yesterday]: [makeCardioSession(yesterday, 'RUNNING', 5.4, 34, 8, 'Ровный темп в парке')],
    [today]: [makeGymSession(today, 1, 13900, 54, 'Текущий день: спина, плечи, техника')]
  };
  AppData.currentProgramId = 0;
  AppData.measurements = [
    [
      { date: dateKey(-30), value: 80.2 },
      { date: dateKey(-14), value: 79.1 },
      { date: today, value: 78.0 }
    ],
    [
      { date: dateKey(-30), value: 96 },
      { date: today, value: 94 }
    ],
    [
      { date: dateKey(-30), value: 84 },
      { date: today, value: 82 }
    ],
    [
      { date: dateKey(-30), value: 58 },
      { date: today, value: 59 }
    ],
    [
      { date: dateKey(-30), value: 35 },
      { date: today, value: 36 }
    ]
  ];

  AppData.mentalRecords = [
    [520, 820, 1120, 0, 1480, 430],
    [610, 980, 1210, 1430],
    [700, 960, 1190, 1380],
    [580, 880, 1170, 1320]
  ];
  AppData.mentalLog = {
    [fourDaysAgo]: [
      mentalSession('MATH', 'NOVICE', 92, 520, '16/20', 3650),
      mentalSession('MEMORY', 'MIDDLE', 118, 980, '15/20', 4200)
    ],
    [twoDaysAgo]: [
      mentalSession('LOGIC', 'MIDDLE', 126, 960, '14/20', 3900),
      mentalSession('FOCUS', 'NOVICE', 84, 580, '17/20', 4100)
    ],
    [today]: [
      mentalSession('MATH', 'MIDDLE', 98, 820, '18/20', 3900),
      mentalSession('MEMORY', 'PRO', 132, 1210, '16/20', 4500),
      mentalSession('FOCUS', 'MIDDLE', 104, 880, '17/20', 4200)
    ]
  };

  AppData.breathingLog = {
    [threeDaysAgo]: [{ startTime: dayStart(threeDaysAgo, 7, 30), endTime: dayStart(threeDaysAgo, 7, 42), maxHold: 48000 }],
    [today]: [{ startTime: dayStart(today, 7, 20), endTime: dayStart(today, 7, 32), maxHold: 54000 }]
  };
  AppData.meditationLog = {
    [sixDaysAgo]: [{ startTime: dayStart(sixDaysAgo, 22, 0), endTime: dayStart(sixDaysAgo, 22, 15) }],
    [today]: [{ startTime: dayStart(today, 12, 10), endTime: dayStart(today, 12, 22) }]
  };
  AppData.hardeningLog = {
    [twoDaysAgo]: [{ startTime: dayStart(twoDaysAgo, 8, 0), endTime: dayStart(twoDaysAgo, 8, 8), timeInColdWater: 120000 }],
    [today]: [{ startTime: dayStart(today, 8, 5), endTime: dayStart(today, 8, 12), timeInColdWater: 150000 }]
  };

  AppData.sleepingLog = {};
  for (let offset = -10; offset <= 0; offset += 1) {
    const key = dateKey(offset);
    const durationHours = [7.1, 7.8, 6.6, 8.0, 7.4, 7.2, 6.9, 7.7, 8.1, 7.5, 7.6][offset + 10];
    AppData.sleepingLog[key] = {
      bedtime: dayStart(dateKey(offset - 1), 23, offset % 2 === 0 ? 20 : 45),
      duration: Math.round(durationHours * 60 * 60 * 1000),
      mood: durationHours >= 7.5 ? 5 : durationHours >= 7 ? 4 : 3,
      note: offset === 0 ? 'Демо: хороший сон перед тестированием интерфейса' : 'Демо-запись сна'
    };
  }

  AppData.sectionVisits = {
    habits: [sevenDaysAgo, fiveDaysAgo, threeDaysAgo, today],
    todo: [sixDaysAgo, yesterday, today],
    mental: [fourDaysAgo, twoDaysAgo, today],
    recovery: [threeDaysAgo, twoDaysAgo, today],
    training: [nineDaysAgo, sevenDaysAgo, fiveDaysAgo, threeDaysAgo, today],
    sleep: [sixDaysAgo, fiveDaysAgo, fourDaysAgo, threeDaysAgo, twoDaysAgo, yesterday, today]
  };
  AppData.sectionLastOpenedAt = {
    habits: Date.now() - 1000 * 60 * 20,
    todo: Date.now() - 1000 * 60 * 35,
    mental: Date.now() - 1000 * 60 * 55,
    recovery: Date.now() - 1000 * 60 * 75,
    training: Date.now() - 1000 * 60 * 95,
    sleep: Date.now() - 1000 * 60 * 120
  };

  AppData.mainHeroWidgets = ['HabitsMain', 'TrainingMain', 'MentalMain'];
  AppData.menuCardsStates = {
    MainCard: { pinned: false, hidden: false },
    HabitsMain: { pinned: true, hidden: false },
    TrainingMain: { pinned: false, hidden: false },
    MentalMain: { pinned: false, hidden: false },
    RecoveryMain: { pinned: false, hidden: false },
    SleepMain: { pinned: false, hidden: false },
    ToDoMain: { pinned: false, hidden: false }
  };
  AppData.infoMiniPanel = {
    MainCard: true,
    HabitsMain: true,
    TrainingMain: true,
    MentalMain: true,
    RecoveryMain: true,
    SleepMain: true,
    ToDoMain: true
  };
  AppData.insightCache = {};

  await saveData();
  window.localStorage.setItem(DEMO_SEED_KEY, new Date().toISOString());
  window.dispatchEvent(new CustomEvent('uml-demo-seeded'));
  return true;
}
