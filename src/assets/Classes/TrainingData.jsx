
import {AppData} from "../StaticClasses/AppData";
import { useState } from "react";
import { saveData } from "../StaticClasses/SaveHelper";
import {setShowPopUpPanel} from "../StaticClasses/HabitsBus";
import Colors from "../StaticClasses/Colors";
import Full_0 from '/src/assets/Svg/Full_0.jsx';
import Full_1 from '/src/assets/Svg/Full_1.jsx';
import Full_2 from '/src/assets/Svg/Full_2.jsx';
import Full_3 from '/src/assets/Svg/Full_3.jsx';
import Full_4 from '/src/assets/Svg/Full_4.jsx';
import Full_5 from '/src/assets/Svg/Full_5.jsx';
import Full_6 from '/src/assets/Svg/Full_6.jsx';
import Full_7 from '/src/assets/Svg/Full_7.jsx';
import Full_8 from '/src/assets/Svg/Full_8.jsx';
import Full_9 from '/src/assets/Svg/Full_9.jsx';
import Full_10 from '/src/assets/Svg/Full_10.jsx';
import Full_11 from '/src/assets/Svg/Full_11.jsx';
import Full_12 from '/src/assets/Svg/Full_12.jsx';

import Full_0f from '/src/assets/Svg/Full_0f.jsx';
import Full_1f from '/src/assets/Svg/Full_1f.jsx';
import Full_2f from '/src/assets/Svg/Full_2f.jsx';
import Full_3f from '/src/assets/Svg/Full_3f.jsx';
import Full_4f from '/src/assets/Svg/Full_4f.jsx';
import Full_5f from '/src/assets/Svg/Full_5f.jsx';
import Full_6f from '/src/assets/Svg/Full_6f.jsx';
import Full_7f from '/src/assets/Svg/Full_7f.jsx';
import Full_8f from '/src/assets/Svg/Full_8f.jsx';
import Full_9f from '/src/assets/Svg/Full_9f.jsx';
import Full_10f from '/src/assets/Svg/Full_10f.jsx';
import Full_11f from '/src/assets/Svg/Full_11f.jsx';
import Full_12f from '/src/assets/Svg/Full_12f.jsx';

export const muscleIconComponents = [
  // male
  [Full_0, Full_1, Full_2, Full_3, Full_4, Full_5, Full_6, Full_7, Full_8, Full_9, Full_10, Full_11, Full_12],
  // female
  [Full_0f, Full_1f, Full_2f, Full_3f, Full_4f, Full_5f, Full_6f, Full_7f, Full_8f, Full_9f, Full_10f, Full_11f, Full_12f]
];

export class MuscleIcon {
    static muscleIconsSrc = [{
        0: 'images/BodyIcons/0.png',
        1: 'images/BodyIcons/1.png',
        2: 'images/BodyIcons/2.png',
        3: 'images/BodyIcons/3.png',
        4: 'images/BodyIcons/4.png',
        5: 'images/BodyIcons/5.png',
        6: 'images/BodyIcons/6.png',
        7: 'images/BodyIcons/7.png',
        8: 'images/BodyIcons/8.png',
        9: 'images/BodyIcons/9.png',
        10: 'images/BodyIcons/10.png',
        11: 'images/BodyIcons/11.png',
        12: 'images/BodyIcons/12.png',
        13: 'images/BodyIcons/13.png',
        14: 'images/BodyIcons/14.png'
    },
    {
        0: 'images/BodyIcons/0f.png',
        1: 'images/BodyIcons/1f.png',
        2: 'images/BodyIcons/2f.png',
        3: 'images/BodyIcons/3f.png',
        4: 'images/BodyIcons/4f.png',
        5: 'images/BodyIcons/5f.png',
        6: 'images/BodyIcons/6f.png',
        7: 'images/BodyIcons/7f.png',
        8: 'images/BodyIcons/8f.png',
        9: 'images/BodyIcons/9f.png',
        10: 'images/BodyIcons/10f.png',
        11: 'images/BodyIcons/11f.png',
        12: 'images/BodyIcons/12f.png',
        13: 'images/BodyIcons/13f.png',
        14: 'images/BodyIcons/14.png'
    }]

    static names = [
        ['Грудь', 'Плечи', 'Широчайшие', 'Бицепс', 'Трицепс', 'Трапеции', 'Нижняя спина', 'Пресс', 'Предплечья', 'Квадрицепс', 'Бицепс бедра', 'Ягодицы', 'Икры', 'Шея', 'Кардио'],
        ['Chest', 'Shoulders', 'Lats', 'Biceps', 'Triceps', 'Traps', 'LowerBack', 'Abs', 'Forearms', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Neck', 'Cardio']
    ];

    static get(mgId, lang, theme, needAmount = true, _width = '85%') {
        let amount = 0;
        if (needAmount) {
            amount = Object.values(AppData.exercises).filter(ex => ex.mgId === mgId).length;
        }

        const isDark = theme !== 'light';
        const cardBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
        const iconContainerBg = isDark ? 'rgba(255,255,255,0.1)' : '#ffffff';

        return (
            <div style={{
                display: 'flex',
                width: _width,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 10px'
            }}>
                <p style={{
                    color: Colors.get('mainText', theme),
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: 0,
                    letterSpacing: '0.3px'
                }}>
                    {this.names[lang][mgId]}
                </p>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    {needAmount && (
                        <div style={{
                            backgroundColor: cardBg,
                            padding: '4px 8px',
                            borderRadius: '8px',
                            marginRight: '12px'
                        }}>
                            <p style={{ color: Colors.get('subText', theme), fontSize: '11px', fontWeight: 'bold', margin: 0 }}>
                                {amount} {lang === 0 ? 'упр' : 'ex'}
                            </p>
                        </div>
                    )}
                    <div style={{
                        width: '40px', height: '40px',
                        backgroundColor: iconContainerBg,marginRight:'20px',
                        borderRadius: '12px', // Modern Squircle
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: isDark ? 'none' : '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <img
                            src={this.muscleIconsSrc[AppData.pData.gender][mgId]}
                            style={{ width: '42px', height: '42px', objectFit: 'contain' }}
                            alt=""
                        />
                    </div>
                </div>
            </div>
        );
    }

    static getForList(mgId, lang, theme) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'
            }}>
                <div style={{
                    width: '50px', height: '50px',
                    backgroundColor: theme !== 'light' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <img
                        src={this.muscleIconsSrc[AppData.pData.gender][mgId]}
                        style={{ width: '40px', objectFit: 'contain' }}
                        alt=""
                    />
                </div>
                <span style={{ fontSize: '11px', color: Colors.get('subText', theme), fontWeight: '500' }}>
                    {this.names[lang][mgId]}
                </span>
            </div>
        );
    }
}

export const MuscleView = ({ programmId, theme, langIndex, programs }) => {
  const genderIndex = AppData.pData.gender; // 0 = male, 1 = female
  const baseSrc = genderIndex === 0 
    ? 'images/BodyIcons/Full.png' 
    : 'images/BodyIcons/Fullf.png';

  const programKey = String(programmId);
  const program = programs[programKey];

  if (!program) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35vw', height: '35vw' }}>
        <div style={{ color: Colors.get('subText', theme), fontSize: '6px', textAlign: 'center' }}>
          {langIndex === 0 
            ? `Программа не найдена (ID: ${programmId})` 
            : `Program not found (ID: ${programmId})`}
        </div>
      </div>
    );
  }

  const primaryMuscles = new Set();
  const secondaryMuscles = new Set();

  program.schedule.forEach(day => {
    if (!Array.isArray(day.exercises)) return;
    day.exercises.forEach(({ exId }) => {
      const exercise = AppData.exercises[exId];
      if (!exercise) return;

      if (exercise.mgId != null) {
        primaryMuscles.add(exercise.mgId);
      }
      if (Array.isArray(exercise.addMgIds)) {
        exercise.addMgIds.forEach(id => {
          if (id != null) secondaryMuscles.add(id);
        });
      }
    });
  });

  // Remove any muscle that is both primary and secondary → keep only as primary
  secondaryMuscles.forEach(id => {
    if (primaryMuscles.has(id)) {
      secondaryMuscles.delete(id);
    }
  });

  const primaryArray = Array.from(primaryMuscles);
  const secondaryArray = Array.from(secondaryMuscles);

  // ✅ TRUE COLORS (matches LoadView)
  const getMuscleColor = (isPrimary) => {
    return isPrimary ? '#ff5252' : '#ff9800'; // red for primary, amber for secondary
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '35vw',
        height: '35vw',
        margin: '2%',
      }}
    >
      <div style={{ fontSize: '6px', marginBottom: '2px', color: Colors.get('subText', theme) }}>
        {langIndex === 0 ? 'Анализ мышц' : 'Muscle analysis'}
      </div>

      <div style={{ position: 'relative', width: '95%', height: '95%' }}>
        {/* Base body — keep as PNG */}
        <img
          src={baseSrc}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt="Body base"
        />

        {/* Secondary muscles — rendered first (lower z-index visually) */}
        {secondaryArray.map((mgId) => {
          const IconComponent = muscleIconComponents[genderIndex]?.[mgId];
          if (!IconComponent || typeof IconComponent !== 'function') return null;

          return (
            <IconComponent
              key={`sec-${mgId}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                color: getMuscleColor(false), // amber
                pointerEvents: 'none',
              }}
            />
          );
        })}

        {/* Primary muscles — rendered last (on top) */}
        {primaryArray.map((mgId) => {
          const IconComponent = muscleIconComponents[genderIndex]?.[mgId];
          if (!IconComponent || typeof IconComponent !== 'function') return null;

          return (
            <IconComponent
              key={`prim-${mgId}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                color: getMuscleColor(true), // red
                pointerEvents: 'none',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

// Helper to get next available ID (assuming IDs are numeric and sequential)
function getNextExerciseId() {
  const ids = Object.keys(AppData.exercises).map(Number);
  return ids.length === 0 ? 0 : Math.max(...ids) + 1;
}
function getNextProgramId() {
  const ids = Object.keys(AppData.programs).map(Number);
  return ids.length === 0 ? 0 : Math.max(...ids) + 1;
}

export async function addExercise(mgId,addMgIds, name, description, isBase) {
  const newId = getNextExerciseId();
  const validAddMgIds = Array.isArray(addMgIds)
  ? addMgIds.filter(id => Number.isInteger(id) && id >= 0 && id <= 13)
  : [];
  AppData.exercises[newId] = {
    mgId,
    addMgIds: validAddMgIds,
    name,
    description,
    isBase,
    pr: 0,
    prDate: '',
    show:true
  };
  setShowPopUpPanel(
    AppData.prefs[0] === 0
      ? `Новое упражнение: ${name[0]} успешно добавлено`
      : `New exercise: ${name[1]} successfully added`,
    2000,
    true
  );
  await saveData();
}

export async function updateExercise(id, mgId,addMgIds, name, description, isBase) {
  if (AppData.exercises[id] == null) {
    console.warn(`Exercise with id ${id} does not exist.`);
    return;
  }
  const validAddMgIds = Array.isArray(addMgIds)
  ? addMgIds.filter(id => Number.isInteger(id) && id >= 0 && id <= 13)
  : [];
  // Preserve existing `pr` and `prDate` unless you intend to reset them
  AppData.exercises[id] = {
    mgId,
    validAddMgIds,
    name,
    description,
    isBase,
    pr: AppData.exercises[id].pr,      // keep current PR
    prDate: AppData.exercises[id].prDate // keep current PR date
  };

  setShowPopUpPanel(
    AppData.prefs[0] === 0
      ? 'Изменения успешно сохранены'
      : 'Changes successfully saved',
    2000,
    true
  );
  await saveData();
}

export async function removeExercise(id) {
  const ex = AppData.exercises[id];

  if (ex == null) {
    console.warn(`Exercise with id ${id} does not exist.`);
    return;
  }

  // soft delete: просто скрываем
  ex.show = false;

  setShowPopUpPanel(
    AppData.prefs[0] === 0
      ? 'Упражнение успешно удалено'
      : 'Exercise successfully removed',
    2000,
    true
  );

  await saveData();
}

export async function addProgram(name, description) {
  const newId = getNextProgramId();
  const finalDesc = description?.length === 2 && description[0]?.length > 3
    ? description
    : AppData.pData.gender === 0 // or use lang from prefs
      ? ['Новая программа', 'New program']
      : ['Новая программа', 'New program'];

  AppData.programs[newId] = {
    name,        // must be [ru, en]
    description: finalDesc,
    schedule: [],
    show: true
  };

  setShowPopUpPanel(
    AppData.prefs[0] === 0
      ? `Новая программа: ${name[0]} успешно добавлена`
      : `New program: ${name[1]} successfully added`,
    2000,
    true
  );
  await saveData();
}
export async function redactProgram(id, name, description) {
  if (!AppData.programs[id]) {
    console.warn(`Program with id ${id} does not exist.`);
    return;
  }
  const safeName = Array.isArray(name) ? name : [name, name];
  const safeDesc = Array.isArray(description) ? description : [description, description];
  AppData.programs[id].name = safeName;
  AppData.programs[id].description = safeDesc;
  await saveData();
}
export async function removeProgram(id) {
  if (!AppData.programs[id]) {
    console.warn(`Program with id ${id} does not exist.`);
    return;
  }
  AppData.programs[id].show = false;
  setShowPopUpPanel(
    AppData.prefs[0] === 0
      ? 'Программа успешно удалена'
      : 'Program successfully removed',
    2000,
    true
  );
  await saveData();
}
export async function addDayToProgram(pId, dayName) {
  const program = AppData.programs[pId];
  if (!program || !program.show) {
    console.warn(`Program ${pId} not found or deleted.`);
    return;
  }
  const normalizeBilingual = (input, fallback) => {
  if (Array.isArray(input) && input.length === 2) return input;
  const str = typeof input === 'string' ? input : fallback;
  return [str, str];
};

// Then:

  program.schedule.push({
    name: normalizeBilingual(dayName, 'Day'),
    exercises: []
  });
  await saveData();
}
export async function redactDayInProgram(pId, dayIndex, dayName) {
  const program = AppData.programs[pId];
  if (!program || dayIndex < 0 || dayIndex >= program.schedule.length) return;
  program.schedule[dayIndex].name = typeof dayName === 'string' 
    ? [dayName, dayName] 
    : dayName;
  await saveData();
}
export async function removeDayFromProgram(pId, dayIndex) {
  const program = AppData.programs[pId];
  if (!program) {
    throw new Error(`Program with id ${pId} not found.`);
  }
  if (dayIndex < 0 || dayIndex >= program.schedule.length) {
    throw new Error(`Invalid day index ${dayIndex}.`);
  }
  program.schedule.splice(dayIndex, 1);
  await saveData();
}

export async function switchPosition(pId, type, switchType, index, exIndex = null) {
  const program = AppData.programs[pId];
  if (!program) return;

  if (type === 0) {
    // Switch days
    const schedule = program.schedule;
    const len = schedule.length;
    if (index < 0 || index >= len) return;

    if (switchType === 0 && index + 1 < len) {
      [schedule[index], schedule[index + 1]] = [schedule[index + 1], schedule[index]];
    } else if (switchType === 1 && index - 1 >= 0) {
      [schedule[index], schedule[index - 1]] = [schedule[index - 1], schedule[index]];
    }
  } else if (type === 1) {
    // Switch exercises within a day
    const day = program.schedule[index];
    if (!day) return;
    const exercises = day.exercises;
    const len = exercises.length;
    if (exIndex < 0 || exIndex >= len) return;

    if (switchType === 0 && exIndex + 1 < len) {
      [exercises[exIndex], exercises[exIndex + 1]] = [exercises[exIndex + 1], exercises[exIndex]];
    } else if (switchType === 1 && exIndex - 1 >= 0) {
      [exercises[exIndex], exercises[exIndex - 1]] = [exercises[exIndex - 1], exercises[exIndex]];
    }
  }
  await saveData();
}

export async function addExerciseToSchedule(pId, dayIndex, exerciseId, strategy = '3x10-12') {
  const program = AppData.programs[pId];
  if (!program || dayIndex < 0 || dayIndex >= program.schedule.length) return;

  const day = program.schedule[dayIndex];
  const existing = day.exercises.find(ex => ex.exId === exerciseId);
  if (existing) {
    // Optionally update strategy instead of skipping
    // existing.sets = strategy;
    return; // or skip to avoid duplicates
  }

  day.exercises.push({ exId: exerciseId, sets: strategy });
  await saveData();
}
export async function removeExerciseFromSchedule(pId, dayIndex, exerciseId) {
  const program = AppData.programs[pId];
  const exercises = program.schedule[dayIndex].exercises;
  const index = exercises.findIndex(ex => ex.exId === exerciseId);
  if (index !== -1) {
    exercises.splice(index, 1);
  }
  await saveData();
}
const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const programs = {
  // === IMPROVED: 3-Day Full Body (Beginner/Intermediate) ===
  0: {
    name: ['Трёхдневная классическая программа', '3-Day Full Body Classic'],
    description: [
      'Сбалансированная программа на 3 дня в неделю. Каждая тренировка включает базовые упражнения для крупных мышечных групп и изоляцию для детализации. Подходит для набора силы и массы.',
      'Balanced 3-day/week program. Each session covers compound lifts for major muscle groups plus isolation work. Ideal for strength and hypertrophy.'
    ],
    schedule: [
      {
        name: ['День 1: Ноги + Плечи', 'Day 1: Legs & Shoulders'],
        exercises: [
          { exId: 33, sets: '4x8-10' }, // Barbell Squat
          { exId: 35, sets: '3x10-12' }, // Leg Press
          { exId: 7, sets: '4x10' },     // Seated Dumbbell Shoulder Press
          { exId: 9, sets: '3x12-15' },  // Lateral Raise
          { exId: 26, sets: '3x15' }     // Barbell Shrugs (traps)
        ]
      },
      {
        name: ['День 2: Грудь + Трицепс', 'Day 2: Chest & Triceps'],
        exercises: [
          { exId: 0, sets: '4x8-10' },   // Barbell Bench Press
          { exId: 2, sets: '3x10-12' },  // Dumbbell Bench Press
          { exId: 4, sets: '3x12-15' },  // Dumbbell Flyes
          { exId: 21, sets: '3x10' },    // Close-Grip Bench Press
          { exId: 23, sets: '3x12-15' }  // Triceps Pushdown
        ]
      },
      {
        name: ['День 3: Спина + Бицепс', 'Day 3: Back & Biceps'],
        exercises: [
          { exId: 30, sets: '4x6-8' },   // Deadlift (full posterior chain)
          { exId: 12, sets: '3x8-10' },  // Wide-Grip Pull-Up
          { exId: 15, sets: '3x10' },    // Bent-Over Barbell Row
          { exId: 16, sets: '3x10-12' }, // Barbell Curl
          { exId: 20, sets: '3x12' }     // Hammer Curl (biceps + forearm balance)
        ]
      }
    ],
    show: true
  },

  // === NEW: 4-Day Upper/Lower Split (Intermediate) ===
  1: {
    name: ['Четырёхдневный сплит: Верх/Низ', '4-Day Upper/Lower Split'],
    description: [
      'Программа с разделением на верх и низ тела, выполняемая 4 раза в неделю. Обеспечивает хорошую нагрузку и восстановление. Подходит для прогрессирующих атлетов.',
      'Upper/lower split trained 4x/week. Optimizes frequency, volume, and recovery. Great for intermediate lifters.'
    ],
    schedule: [
      {
        name: ['День 1: Нижняя часть тела', 'Day 1: Lower Body'],
        exercises: [
          { exId: 33, sets: '4x6-8' },   // Barbell Squat
          { exId: 39, sets: '3x10' },    // Stiff-Legged Deadlift
          { exId: 40, sets: '3x12' },    // Hip Thrust
          { exId: 43, sets: '4x15-20' }  // Standing Calf Raise
        ]
      },
      {
        name: ['День 2: Верхняя часть тела — Тяга', 'Day 2: Upper Body — Pull'],
        exercises: [
          { exId: 12, sets: '4xMax' },   // Pull-Ups (use assisted if needed)
          { exId: 13, sets: '3x10' },    // Lat Pulldown
          { exId: 15, sets: '3x8-10' },  // Bent-Over Row
          { exId: 17, sets: '3x10-12' }, // Alternating Dumbbell Curl
          { exId: 11, sets: '3x12' }     // Rear Delt Raise
        ]
      },
      {
        name: ['День 3: Нижняя часть тела — Объём', 'Day 3: Lower Body — Volume'],
        exercises: [
          { exId: 34, sets: '3x10' },    // Front Squat
          { exId: 36, sets: '3x10/leg' },// Lunges
          { exId: 38, sets: '4x12' },    // Lying Leg Curl
          { exId: 44, sets: '3x15/leg' } // Single-Leg Calf Raise
        ]
      },
      {
        name: ['День 4: Верхняя часть тела — Жим', 'Day 4: Upper Body — Push'],
        exercises: [
          { exId: 1, sets: '4x8-10' },   // Incline Barbell Press
          { exId: 6, sets: '3x10-12' },  // Machine Chest Press
          { exId: 8, sets: '4x8-10' },   // Standing Military Press
          { exId: 24, sets: '3xMax' },   // Dips
          { exId: 25, sets: '3x12' }     // Overhead Triceps Extension
        ]
      }
    ],
    show: true
  },

  // === NEW: 5-Day Bro Split (Advanced) ===
  2: {
    name: ['Пятидневный сплит по группам мышц', '5-Day Body Part Split'],
    description: [
      'Классический “бодибилдерский” сплит: каждый день — отдельная мышечная группа. Подходит для продвинутых, фокусирующихся на гипертрофии.',
      'Classic bodybuilding split: one muscle group per day. Best for advanced users focused on hypertrophy.'
    ],
    schedule: [
      {
        name: ['День 1: Грудь', 'Day 1: Chest'],
        exercises: [
          { exId: 0, sets: '4x6-8' },
          { exId: 1, sets: '3x8-10' },
          { exId: 3, sets: '3x10-12' },
          { exId: 4, sets: '3x15' },
          { exId: 5, sets: '3x12' }
        ]
      },
      {
        name: ['День 2: Спина', 'Day 2: Back'],
        exercises: [
          { exId: 30, sets: '1x5' },     // Heavy Deadlift
          { exId: 12, sets: '4x8-10' },
          { exId: 13, sets: '3x10-12' },
          { exId: 14, sets: '3x10/arm' },
          { exId: 15, sets: '3x10' }
        ]
      },
      {
        name: ['Дение 3: Ноги', 'Day 3: Legs'],
        exercises: [
          { exId: 33, sets: '4x6-8' },
          { exId: 35, sets: '3x10-12' },
          { exId: 39, sets: '3x10' },
          { exId: 38, sets: '4x12' },
          { exId: 43, sets: '4x20' }
        ]
      },
      {
        name: ['День 4: Плечи', 'Day 4: Shoulders'],
        exercises: [
          { exId: 8, sets: '4x6-8' },
          { exId: 7, sets: '3x10' },
          { exId: 9, sets: '4x12-15' },
          { exId: 11, sets: '4x15' },
          { exId: 10, sets: '3x12' }     // Upright Row (traps + delts)
        ]
      },
      {
        name: ['День 5: Руки', 'Day 5: Arms'],
        exercises: [
          { exId: 16, sets: '3x10' },
          { exId: 18, sets: '3x12/arm' },
          { exId: 20, sets: '3x12' },
          { exId: 21, sets: '3x8-10' },
          { exId: 22, sets: '3x12' },
          { exId: 23, sets: '3x15' }
        ]
      }
    ],
    show: true
  },

  // === NEW: 3-Day Strength Focus (Low Reps, High Intensity) ===
  3: {
    name: ['Силовая трёхдневка', '3-Day Strength Program'],
    description: [
      'Программа на развитие максимальной силы. Основана на низких повторениях (3–6) и базовых упражнениях. Отдых между подходами — 2–3 минуты.',
      'Strength-focused program using low reps (3–6) and compound lifts. Rest 2–3 min between sets.'
    ],
    schedule: [
      {
        name: ['День 1: Жим', 'Day 1: Press'],
        exercises: [
          { exId: 0, sets: '5x5' },      // Bench Press
          { exId: 8, sets: '5x5' },      // Standing Press
          { exId: 24, sets: '4x6' },     // Dips
          { exId: 9, sets: '3x10' }      // Lateral Raise (light pump)
        ]
      },
      {
        name: ['День 2: Тяга', 'Day 2: Pull'],
        exercises: [
          { exId: 30, sets: '1x5, 3x3' },// Deadlift (heavy)
          { exId: 15, sets: '5x5' },     // Bent-Over Row
          { exId: 12, sets: '4x5' },     // Pull-Ups (add weight if possible)
          { exId: 26, sets: '4x8' }      // Shrugs
        ]
      },
      {
        name: ['День 3: Ноги', 'Day 3: Legs'],
        exercises: [
          { exId: 33, sets: '5x5' },     // Back Squat
          { exId: 39, sets: '4x6' },     // Stiff-Leg Deadlift
          { exId: 40, sets: '4x8' },     // Hip Thrust
          { exId: 43, sets: '4x12' }     // Calf Raise (moderate)
        ]
      }
    ],
    show: true
  }
};

// mgIds = [chest, shoulders, lats, biceps, triceps, traps, lower back, abs, forearms, quads, hamstrings, glutes, calves, neck]
export const exercises = {
  // === Chest (0) ===
  0: {
    mgId: 0,
    addMgIds: [4],
    name: ['Жим штанги лежа', 'Barbell Bench Press'],
    description: [
      'Упражнение для развития грудных мышц. Лягте на скамью, возьмитесь за штангу хватом чуть шире плеч, плавно опустите её к груди и выжмите вверх.',
      'A chest muscle exercise. Lie on the bench, grip the barbell slightly wider than shoulders, smoothly lower it to your chest and press up.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  1: {
    mgId: 0,
    addMgIds: [4],
    name: ['Жим штанги лежа на наклонной скамье (угол 45°)', 'Incline Barbell Bench Press (45-degree angle)'],
    description: [
      'Упражнение для верхней части грудных мышц. Лягте на наклонную скамью под углом 45°, возьмитесь за штангу хватом чуть шире плеч. Медленно опустите её к верхней части груди и мощным движением выжмите вверх.',
      'An exercise for the upper chest muscles. Lie on a bench set at a 45-degree incline, grip the barbell slightly wider than shoulder width. Slowly lower the bar to the upper chest and press it up powerfully.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  2: {
    mgId: 0,
    addMgIds: [4],
    name: ['Жим гантелей лежа', 'Dumbbell Bench Press'],
    description: [
      'Упражнение для грудных мышц. Лягте на горизонтальную скамью, возьмите гантели, опустите их к груди и выжмите вверх, сводя руки вместе.',
      'Chest exercise. Lie on a flat bench, hold dumbbells, lower them to your chest, then press up, bringing your arms together.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  3: {
    mgId: 0,
    addMgIds: [4],
    name: ['Жим гантелей на наклонной скамье (угол 45°)', 'Incline Dumbbell Bench Press (45-degree angle)'],
    description: [
      'Упражнение для верхней части грудных мышц. Лягте на наклонную скамью под углом 45°, возьмите гантели, опустите их к верхней части груди и выжмите вверх.',
      'An exercise for the upper chest muscles. Lie on a bench set at a 45-degree incline, hold dumbbells at shoulder width. Slowly lower them to the upper chest and press up powerfully.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  4: {
    mgId: 0,
    addMgIds: [],
    name: ['Разведения гантелей лежа', 'Dumbbell Flyes'],
    description: [
      'Изолирующее упражнение для грудных мышц. Лягте на горизонтальную скамью, держите гантели над грудью и мягко разводите руки в стороны до растяжения мышц, затем сводите обратно.',
      'Isolating chest exercise. Lie on a flat bench, hold dumbbells over your chest, slowly open your arms to the sides to stretch the muscles, then bring them back together.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },
  5: {
    mgId: 0,
    addMgIds: [2],
    name: ['Пуловер', 'Dumbbell Pullover'],
    description: [
      'Упражнение для грудных и широчайших мышц. Лягте поперек скамьи, возьмите гантель двумя руками, вытяните ее за головой, почувствуйте растяжение, затем плавно верните в исходное положение.',
      'Exercise for chest and lat muscles. Lie across a bench, hold a dumbbell with both hands, extend it over your head, feel the stretch, then slowly return to the starting position.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },
  6: {
    mgId: 0,
    addMgIds: [4],
    name: ['Жим в тренажёре', 'Machine Chest Press'],
    description: [
      'Упражнение для грудных мышц с контролем движения. Сядьте в тренажёр, возьмитесь за рукояти, плавно жмите их вперёд до полного выпрямления рук и возвращайте в исходное положение.',
      'Chest exercise with guided motion. Sit in the machine, grip the handles, press them forward until your arms are fully extended, then return to the starting position.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },

  // === Shoulders (1) ===
  7: {
    mgId: 1,
    addMgIds: [4, 0],
    name: ['Жим гантелей сидя', 'Seated Dumbbell Shoulder Press'],
    description: [
      'Базовое упражнение для дельтовидных мышц. Сядьте на скамью, держите гантели на уровне плеч, выжмите их вверх до полного разгибания рук, затем плавно опустите обратно.',
      'Basic deltoid exercise. Sit on a bench, hold dumbbells at shoulder level, press them up until arms are fully extended, then slowly lower back down.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  8: {
    mgId: 1,
    addMgIds: [4, 0, 5],
    name: ['Армейский жим штанги стоя', 'Standing Barbell Military Press'],
    description: [
      'Базовое упражнение для плеч. Встаньте, держите штангу на уровне плеч, выжмите вверх над головой и плавно опустите обратно.',
      'Basic shoulder exercise. Stand, hold the barbell at shoulder level, press it overhead, and slowly lower back down.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  9: {
    mgId: 1,
    addMgIds: [],
    name: ['Подъем гантелей в стороны', 'Dumbbell Lateral Raise'],
    description: [
      'Изолирующее упражнение для средней части плеч. Встаньте, держите гантели, поднимайте руки в стороны до уровня плеч, затем плавно опускайте.',
      'Isolating exercise for the middle deltoids. Stand, hold dumbbells, raise your arms sideways to shoulder level, then slowly lower.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },
  10: {
    mgId: 1,
    addMgIds: [5],
    name: ['Тяга штанги к подбородку', 'Barbell Upright Row'],
    description: [
      'Базовое упражнение для плеч и трапеций. Встаньте, возьмите штангу узким хватом, подтяните её вертикально к подбородку, локти выше рук, затем опустите обратно.',
      'Basic exercise for shoulders and traps. Stand, grip the barbell narrowly, pull it vertically to your chin with elbows leading, then lower back down.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },
  11: {
    mgId: 1,
    addMgIds: [],
    name: ['Разведение гантелей в наклоне', 'Bent-Over Dumbbell Raise'],
    description: [
      'Изолирующее упражнение для задних дельт. Наклонитесь вперёд, держите гантели, разводите руки в стороны, концентрируясь на работе задней части плеч.',
      'Isolating exercise for rear delts. Bend forward, hold dumbbells, raise arms sideways, focusing on rear shoulder activation.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },

  // === Lats (2) ===
  12: {
    mgId: 2,
    addMgIds: [3, 5],
    name: ['Подтягивания широким хватом', 'Wide-Grip Pull-Up'],
    description: [
      'Базовое упражнение для широчайших мышц спины. Возьмитесь за перекладину широким хватом, подтянитесь вверх, сводя лопатки, затем плавно опуститесь в исходное положение.',
      'Basic lat exercise. Grab the bar with a wide grip, pull yourself up while squeezing shoulder blades together, then slowly lower to the start.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  13: {
    mgId: 2,
    addMgIds: [3, 5],
    name: ['Тяга верхнего блока к груди', 'Lat Pulldown'],
    description: [
      'Упражнение для широчайших мышц. Сядьте в тренажёр, возьмитесь за рукоятку широкой хваткой, подтяните её к верхней части груди, затем плавно верните обратно.',
      'Lat muscle exercise. Sit in the machine, use a wide grip, pull the bar to your upper chest, then slowly release back.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  14: {
    mgId: 2,
    addMgIds: [3, 6],
    name: ['Тяга гантели одной рукой', 'One-Arm Dumbbell Row'],
    description: [
      'Изолирующее упражнение для широчайших. Упритесь одной рукой и коленом на скамью, второй рукой подтяните гантель к поясу, затем опустите.',
      'Isolating lat exercise. Place one hand and knee on the bench, pull the dumbbell to your waist with the other hand, then lower.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },
  15: {
    mgId: 2,
    addMgIds: [5, 6],
    name: ['Тяга штанги в наклоне', 'Bent-Over Barbell Row'],
    description: [
      'Базовое упражнение для спины. Наклонитесь вперёд со штангой в руках, подтяните её к поясу, сводя лопатки, затем плавно опустите.',
      'Basic back exercise. Bend forward with barbell in hands, row it to your waist while pinching shoulder blades, then lower slowly.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },

  // === Biceps (3) ===
  16: {
    mgId: 3,
    addMgIds: [8],
    name: ['Сгибание рук со штангой стоя', 'Barbell Curl'],
    description: [
      'Классическое упражнение для бицепса. Встаньте, возьмите штангу хватом снизу на ширине плеч, на вдохе согните руки в локтях, поднимая штангу к плечам, затем плавно опустите.',
      'Classic biceps exercise. Stand and hold a barbell with an underhand grip at shoulder width, curl it up to your shoulders, then slowly lower.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },
  17: {
    mgId: 3,
    addMgIds: [8],
    name: ['Сгибание рук с гантелями поочередно', 'Alternating Dumbbell Curl'],
    description: [
      'Упражнение для бицепса. Стоя или сидя, поочередно сгибайте руки с гантелями, поднимая их к плечам, затем плавно опускайте.',
      'Biceps exercise. Stand or sit, alternately curl dumbbells up to your shoulders, then slowly lower back.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },
  18: {
    mgId: 3,
    addMgIds: [],
    name: ['Концентрированный подъем гантели', 'Concentration Curl'],
    description: [
      'Изолирующее упражнение для бицепса. Сидя, облокотите локоть на внутреннюю часть бедра, медленно поднимайте гантель до максимального сокращения, затем опускайте.',
      'Isolating biceps exercise. Sit and rest your elbow on your inner thigh, slowly curl the dumbbell up, fully contract, then lower.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },
  19: {
    mgId: 3,
    addMgIds: [8],
    name: ['Сгибание рук на скамье Скотта', 'Preacher Curl'],
    description: [
      'Упражнение для изоляции бицепса. Сядьте на скамью Скотта, возьмите гриф хватом снизу, медленно поднимайте к плечам и опускайте вниз.',
      'Isolating biceps exercise. Sit on the preacher bench, hold the barbell with an underhand grip, curl up to your shoulders, then lower.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },
  20: {
    mgId: 3,
    addMgIds: [8, 4],
    name: ['Молотковый подъем гантелей', 'Hammer Curl'],
    description: [
      'Упражнение для бицепса и предплечья. Держите гантели нейтральным хватом (ладони к телу), поднимайте их к плечам, затем опускайте.',
      'Biceps and forearm exercise. Hold dumbbells with a neutral grip (palms facing body), curl up to your shoulders, then lower.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },

  // === Triceps (4) ===
  21: {
    mgId: 4,
    addMgIds: [0],
    name: ['Жим штанги узким хватом', 'Close-Grip Barbell Bench Press'],
    description: [
      'Базовое упражнение для трицепса. Лягте на горизонтальную скамью, возьмите штангу узким хватом, опустите её к груди и выжмите вверх, чувствуя работу трицепса.',
      'Basic triceps exercise. Lie on a flat bench, grip the barbell with a narrow grip, lower it to your chest and press up, focusing on triceps activation.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  22: {
    mgId: 4,
    addMgIds: [],
    name: ['Французский жим лежа', 'Lying French Press (Skullcrusher)'],
    description: [
      'Упражнение для трицепса. Лягте на скамью, возьмите EZ-гриф или штангу узким хватом, опустите к лбу, затем выжмите вверх, сохраняя локти неподвижными.',
      'Triceps exercise. Lie on a bench, hold an EZ-bar or barbell with a narrow grip, lower it to your forehead, then press up, keeping elbows stationary.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },
  23: {
    mgId: 4,
    addMgIds: [],
    name: ['Разгибание рук на блоке', 'Triceps Pushdown'],
    description: [
      'Изолирующее упражнение для трицепса. Встаньте, возьмитесь за рукоятку верхнего блока, на выдохе разогните руки вниз, полностью сокращая трицепс, затем плавно верните.',
      'Isolating triceps exercise. Stand, grip the cable attachment, extend your arms down fully to contract triceps, then slowly return.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },
  24: {
    mgId: 4,
    addMgIds: [0],
    name: ['Отжимания на брусьях', 'Dips'],
    description: [
      'Базовое упражнение для трицепса и груди. Удерживайтесь на брусьях, опуститесь до угла 90° в локтях, затем мощно выжмите себя вверх.',
      'Basic triceps and chest exercise. Support yourself on parallel bars, lower down until elbows are at 90°, then push yourself powerfully back up.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  25: {
    mgId: 4,
    addMgIds: [],
    name: ['Разгибание руки с гантелей в наклоне', 'Seated Overhead Dumbbell Extension'],
    description: [
      'Изолирующее упражнение для длинной головки трицепса. Сядьте, держите гантель двумя руками над головой, опустите её за голову, затем разогните вверх.',
      'Isolating long head triceps exercise. Sit, hold the dumbbell overhead with both hands, lower it behind your head, then extend arms upward.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },

  // === Traps (5) ===
  26: {
    mgId: 5,
    addMgIds: [],
    name: ['Шраги со штангой', 'Barbell Shrugs'],
    description: [
      'Базовое упражнение для верхней части трапеций. Встаньте, возьмите штангу прямыми руками, поднимайте плечи вверх максимально высоко, затем опускайте вниз.',
      'Basic upper traps exercise. Stand and hold a barbell with arms straight, shrug your shoulders up as high as possible, then lower back down.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  27: {
    mgId: 5,
    addMgIds: [],
    name: ['Шраги с гантелями', 'Dumbbell Shrugs'],
    description: [
      'Аналогичное упражнение для трапеций с гантелями. Держите гантели по бокам, поднимайте плечи вверх максимально, затем опускайте вниз.',
      'Similar traps exercise using dumbbells. Hold dumbbells at your sides, shrug shoulders up as high as you can, then lower.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  28: {
    mgId: 5,
    addMgIds: [1],
    name: ['Тяга штанги к подбородку', 'Barbell Upright Row'],
    description: [
      'Упражнение для трапеций и средней части плеч. Встаньте, возьмите штангу узким хватом, подтяните её вертикально к подбородку, локти выше кистей, затем опустите обратно.',
      'Exercise for traps and middle delts. Stand, grip the barbell narrowly, pull it vertically to your chin with elbows higher than wrists, then lower.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },

  // === Lower Back (6) ===
  29: {
    mgId: 6,
    addMgIds: [5, 11],
    name: ['Гиперэкстензия', 'Back Extension (Hyperextension)'],
    description: [
      'Базовое упражнение для укрепления поясницы. Лягте на гиперэкстензионную скамью, зафиксируйте ноги, опуститесь вниз с ровной спиной, затем поднимитесь до линии корпуса.',
      'Basic lower back exercise. Lie on a hyperextension bench, fix your legs, lower your torso with a straight back, then rise up to align with your body.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  30: {
    mgId: 6,
    addMgIds: [10, 11, 5],
    name: ['Становая тяга', 'Deadlift'],
    description: [
      'Многосуставное базовое упражнение для всей задней цепи, включая поясницу. Возьмите штангу, спина прямая, поднимайте штангу до полного выпрямления корпуса и плавно опускайте.',
      'Compound basic exercise for the entire posterior chain, including the lower back. Grab the barbell, keep your back flat, lift it up until fully upright, then lower smoothly.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },

  // === Abs (7) ===
  47: {
    mgId: 7,
    addMgIds: [6],
    name: ['Подъем ног в висе', 'Hanging Leg Raise'],
    description: [
      'Эффективное упражнение для развития мышц пресса. Повисните на турнике, держась руками, на выдохе поднимайте прямые ноги вверх, почувствуйте сокращение пресса, затем плавно опускайте ноги.',
      'Effective abs exercise. Hang from a pull-up bar with arms extended, raise straight legs up while exhaling to contract the abs, then slowly lower your legs back down.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },

  // === Forearms (8) ===
  31: {
    mgId: 8,
    addMgIds: [],
    name: ['Сгибание запястий со штангой', 'Barbell Wrist Curl'],
    description: [
      'Изолирующее упражнение для мышц предплечья. Сядьте, возьмите штангу снизу, положите предплечья на колени или скамью, выполняйте сгибание запястий вверх, затем опускайте вниз.',
      'Isolating forearm exercise. Sit, hold the barbell with an underhand grip, rest your forearms on knees or bench, curl wrists upward, then lower down.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },
  32: {
    mgId: 8,
    addMgIds: [],
    name: ['Разгибание запястий со штангой', 'Barbell Reverse Wrist Curl'],
    description: [
      'Упражнение для тыльной стороны предплечий. Сядьте, держите штангу сверху, предплечья на коленях или скамье, разгибайте запястья вверх и затем опускайте вниз.',
      'Forearm exercise for the extensor muscles. Sit, hold the barbell with an overhand grip, forearms rested, raise wrists upward and lower down.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },

  // === Quads (9) ===
  33: {
    mgId: 9,
    addMgIds: [11, 10],
    name: ['Приседания со штангой', 'Barbell Squat'],
    description: [
      'Базовое упражнение для квадрицепсов и всей нижней части тела. Встаньте, положите штангу на плечи, присядьте до параллели бедер с полом, затем вернитесь в исходное положение.',
      'Basic quad and lower body exercise. Stand, rest the barbell on your shoulders, squat down until your thighs are parallel to the floor, then return to standing.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  34: {
    mgId: 9,
    addMgIds: [11, 10, 6],
    name: ['Приседания со штангой на груди', 'Barbell Front Squat'],
    description: [
      'Вариант базового упражнения для квадрицепсов и корпуса. Встаньте, держите штангу на передней части плеч, локти высоко, присядьте до параллели бедер с полом, затем поднимитесь.',
      'Variation of basic quad and core exercise. Stand, hold the barbell on the front of your shoulders, keep elbows high, squat down until thighs are parallel to the floor, then rise back up.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  35: {
    mgId: 9,
    addMgIds: [11, 10],
    name: ['Жим ногами в тренажере', 'Leg Press'],
    description: [
      'Упражнение для квадрицепсов и ягодиц. Сядьте в тренажёр, поставьте ноги на платформу на ширине плеч, выжмите платформу вверх, затем плавно опустите.',
      'Exercise for quads and glutes. Sit in the leg press machine, place feet shoulder-width on platform, press it upwards, then slowly lower.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  36: {
    mgId: 9,
    addMgIds: [11, 10],
    name: ['Выпады', 'Lunges'],
    description: [
      'Комплексное упражнение для квадрицепсов и ягодиц. Сделайте шаг вперед, опуститесь на одно колено, удерживая спину прямой, затем вернитесь в исходное положение.',
      'Compound exercise for quads and glutes. Step forward, lower into a lunge with rear knee almost touching the floor, keep your back straight, then return.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  37: {
    mgId: 9,
    addMgIds: [11, 6],
    name: ['Приседание на одной ноге с гантелей', 'Single-Leg Dumbbell Squat'],
    description: [
      'Упражнение для квадрицепсов, ягодиц и стабилизаторов. Встаньте на одну ногу, держите гантель в руках перед собой или в стороне, выполните приседание, сохраняя равновесие и опускаясь как можно ниже, затем вернитесь в исходное положение.',
      'Quad, glute, and stabilizer exercise. Stand on one leg, hold a dumbbell in front or at your side, squat down as low as you can while balancing, then return to the starting position.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },

  // === Hamstrings (10) ===
  38: {
    mgId: 10,
    addMgIds: [],
    name: ['Сгибание ног лежа в тренажере', 'Lying Leg Curl'],
    description: [
      'Изолирующее упражнение для бицепса бедра. Лягте лицом вниз в тренажёр, зафиксируйте голени под валиком, сгибайте ноги, максимально сокращая мышцы, затем плавно опускайте.',
      'Isolating hamstring exercise. Lie face down in the machine, hook ankles under the pad, curl your legs up and fully contract the muscles, then slowly lower.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },
  39: {
    mgId: 10,
    addMgIds: [6, 11],
    name: ['Становая тяга на прямых ногах', 'Stiff-Legged Deadlift'],
    description: [
      'Базовое упражнение для задней группы бедра и поясницы. Встаньте, ноги чуть согнуты, держите штангу в руках, наклоняйтесь вперёд с ровной спиной, почувствуйте растяжение мышц, затем вернитесь.',
      'Basic hamstring and lower back exercise. Stand with knees slightly bent, hold barbell in hands, lean forward with flat back, feel the stretch in hamstrings, then return upright.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },

  // === Glutes (11) ===
  40: {
    mgId: 11,
    addMgIds: [10, 6],
    name: ['Ягодичный мостик', 'Hip Thrust'],
    description: [
      'Базовое упражнение для развития ягодичных мышц. Сядьте перед скамьёй, прижмитесь верхней частью спины, ноги согнуты, поставьте штангу на бедра, поднимайте таз вверх, затем плавно опускайте.',
      'Basic glute exercise. Sit in front of a bench, press your upper back against it, bend your knees, place a barbell on hips, thrust your hips up, then lower slowly.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  41: {
    mgId: 11,
    addMgIds: [9, 10],
    name: ['Выпады назад', 'Reverse Lunges'],
    description: [
      'Упражнение для ягодиц и ног. Стоя, сделайте широкий шаг назад, опуститесь до угла в колене, вернитесь в исходное положение.',
      'Glute and leg exercise. Stand, step backward wide, lower until knee bends, return to starting posture.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  42: {
    mgId: 11,
    addMgIds: [9, 10],
    name: ['Приседания сумо', 'Sumo Squat'],
    description: [
      'Упражнение для ягодиц и внутренней поверхности бедра. Встаньте широко, носки направлены наружу, держите гантель или штангу, присядьте, чувствуя работу ягодиц, затем вернитесь.',
      'Exercise for glutes and inner thigh. Stand wide, toes out, hold dumbbell or barbell, squat down feeling glutes, then return.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },

  // === Calves (12) ===
  43: {
    mgId: 12,
    addMgIds: [],
    name: ['Подъемы на носки стоя со штангой', 'Standing Barbell Calf Raise'],
    description: [
      'Базовое упражнение для икр. Встаньте прямо, положите штангу на плечи, поднимайтесь на носки максимально вверх, затем плавно опускайтесь вниз.',
      'Basic calf exercise. Stand upright with a barbell resting on your shoulders, rise up onto your toes as high as possible, then slowly lower back down.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  44: {
    mgId: 12,
    addMgIds: [],
    name: ['Подъем на носок одной ноги с гантелей', 'Single-Leg Dumbbell Calf Raise'],
    description: [
      'Упражнение для икр каждой ноги по отдельности. Встаньте на одну ногу на платформу, удерживайте гантель в руке, свободной рукой держитесь за опору, поднимайтесь на носок, затем опускайтесь вниз.',
      'Isolating calf exercise for each leg. Stand on one foot on a platform, hold a dumbbell in one hand, support yourself with the other hand, rise onto your toe, then lower down.'
    ],
    isBase: true,
    rm: 0,
    rmDate: '',
    show: true
  },
  45: {
    mgId: 12,
    addMgIds: [],
    name: ['Подъемы на носки сидя', 'Seated Calf Raise'],
    description: [
      'Упражнение для камбаловидной мышцы голени. Сядьте, поставьте стопы на платформу, разместите вес на коленях, поднимайте пятки вверх, затем опускайте.',
      'Exercise for the soleus muscle of the calf. Sit, place feet on a platform, rest weight on your knees, lift your heels up, then lower down.'
    ],
    isBase: false,
    rm: 0,
    rmDate: '',
    show: true
  },
  // === Neck (13) ===
48: {
  mgId: 13,
  addMgIds: [5, 6],
  name: ['Изометрические упражнения для шеи', 'Neck Isometrics'],
  description: [
    'Упражнение для укрепления мышц шеи без движения. Надавите ладонью на лоб/затылок/висок, сопротивляясь движению головы в течение 5–10 секунд в каждом направлении.',
    'Static neck strengthening exercise. Press your palm against your forehead, back of head, or temple while resisting head movement for 5–10 seconds per direction.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
49: {
  mgId: 13,
  addMgIds: [5],
  name: ['Подъемы головы лежа', 'Prone Neck Extensions'],
  description: [
    'Упражнение для задней части шеи. Лягте на живот, руки вдоль тела, медленно поднимайте голову вверх, удерживая 1–2 секунды, затем опускайте.',
    'Exercise for posterior neck muscles. Lie face down, arms at sides, slowly lift your head upward, hold 1–2 seconds, then lower.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},

// === Chest (0) – Additional ===
50: {
  mgId: 0,
  addMgIds: [4],
  name: ['Жим штанги лежа обратным хватом', 'Reverse-Grip Bench Press'],
  description: [
    'Упражнение для верхней части груди и трицепсов. Лягте на скамью, возьмите штангу обратным хватом (ладони к лицу), опустите к верхней части груди и выжмите вверх.',
    'Targets upper chest and triceps. Lie on a bench, grip the barbell with an underhand (supinated) grip, lower to upper chest, and press up.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},

// === Shoulders (1) – Additional ===
51: {
  mgId: 1,
  addMgIds: [4],
  name: ['Жим Арнольда', 'Arnold Press'],
  description: [
    'Комплексное упражнение для всех пучков дельт. Сядьте, начните с гантелей у плеч ладонями к себе, при подъеме поворачивайте ладони вперед, в верхней точке — ладони от себя.',
    'Complete deltoid exercise. Sit, start with dumbbells at shoulder height palms facing you; rotate palms forward as you press up, finishing with palms facing away.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},

// === Lats (2) – Additional ===
52: {
  mgId: 2,
  addMgIds: [3, 5, 6],
  name: ['Тяга горизонтального блока к поясу', 'Seated Cable Row'],
  description: [
    'Базовое упражнение для спины. Сядьте, упритесь ногами, возьмитесь за рукоять, подтяните её к поясу, сводя лопатки, затем плавно верните в исходное положение.',
    'Basic back exercise. Sit with legs braced, grip the handle, row it to your waist while squeezing shoulder blades, then slowly return.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},

// === Biceps (3) – Additional ===
53: {
  mgId: 3,
  addMgIds: [8],
  name: ['Сгибание рук на нижнем блоке', 'Cable Curl'],
  description: [
    'Изолирующее упражнение с постоянным напряжением. Встаньте у нижнего блока, возьмитесь за рукоять хватом снизу, сгибайте руки, поднимая рукоять к плечам.',
    'Isolation with constant tension. Stand at low pulley, use underhand grip, curl handle up toward shoulders.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},

// === Triceps (4) – Additional ===
54: {
  mgId: 4,
  addMgIds: [],
  name: ['Разгибание рук с верхнего блока обратным хватом', 'Reverse-Grip Triceps Pushdown'],
  description: [
    'Упражнение для медиальной головки трицепса. Возьмитесь за рукоять верхнего блока обратным хватом, разгибайте руки вниз, сохраняя локти близко к телу.',
    'Targets medial triceps head. Use an underhand grip on the high pulley, extend arms downward with elbows close to body.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},

// === Abs (7) – Additional ===
55: {
  mgId: 7,
  addMgIds: [6],
  name: ['Скручивания на наклонной скамье', 'Incline Bench Crunches'],
  description: [
    'Упражнение для верхней части пресса. Лягте на наклонную скамью ногами вниз, заведите руки за голову, поднимайте верхнюю часть корпуса, сокращая пресс.',
    'Targets upper abs. Lie on an incline bench with feet secured, hands behind head, lift upper torso while contracting abs.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
56: {
  mgId: 7,
  addMgIds: [6, 9],
  name: ['Планка', 'Plank'],
  description: [
    'Изометрическое упражнение для глубоких мышц кора. Упритесь локтями и носками в пол, держите тело в прямой линии, напрягая пресс и ягодицы.',
    'Isometric core exercise. Rest on elbows and toes, keep body straight, engage abs and glutes.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},

// === Quads (9) – Additional ===
57: {
  mgitud: 9,
  addMgIds: [11, 10],
  name: ['Болгарские сплит-приседания', 'Bulgarian Split Squat'],
  description: [
    'Упражнение для квадрицепсов и стабилизаторов. Поставьте одну ногу на скамью сзади, приседайте на передней ноге до угла 90°, затем поднимайтесь.',
    'Quad and stability exercise. Place one foot on a bench behind you, squat down on the front leg to 90°, then rise.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},

// === Hamstrings (10) – Additional ===
58: {
  mgId: 10,
  addMgIds: [6, 11],
  name: ['Румынская становая тяга', 'Romanian Deadlift (RDL)'],
  description: [
    'Упражнение для бицепсов бедра и ягодиц. Возьмите штангу, слегка согните колени, наклоняйтесь вперед с прямой спиной, опуская штангу вдоль ног, затем вернитесь.',
    'Targets hamstrings and glutes. Hold barbell, slight knee bend, hinge at hips with flat back, lower bar along legs, then return.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},

// === Glutes (11) – Additional ===
59: {
  mgId: 11,
  addMgIds: [10, 9],
  name: ['Махи ногой назад в тренажере', 'Cable Kickbacks'],
  description: [
    'Изолирующее упражнение для ягодиц. Прикрепите манжету к лодыжке, сделайте мах ногой назад, максимально сократив ягодицу, затем вернитесь.',
    'Glute isolation. Attach ankle strap to cable, kick leg backward while fully contracting glutes, then return.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},

// === Calves (12) – Additional ===
60: {
  mgId: 12,
  addMgIds: [],
  name: ['Подъемы на носки в тренажере для икр', 'Standing Calf Raise Machine'],
  description: [
    'Базовое упражнение для икр с фиксированной траекторией. Станьте в тренажёр, поднимайтесь на носки максимально вверх, затем опускайтесь вниз с паузой в растяжении.',
    'Guided calf exercise. Step into machine, rise onto toes fully, then lower with a stretch pause at the bottom.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
// === Chest (0) – Additional (61–66) ===
61: {
  mgId: 0,
  addMgIds: [4, 1],
  name: ['Жим штанги лежа на скамье с наклоном вниз', 'Decline Barbell Bench Press'],
  description: [
    'Упражнение для нижней части грудных мышц. Лягте на скамью с наклоном вниз, возьмитесь за штангу хватом чуть шире плеч, опустите к нижней части груди и выжмите вверх.',
    'Targets lower chest. Lie on a decline bench, grip barbell slightly wider than shoulders, lower to lower chest, then press up.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
62: {
  mgId: 0,
  addMgIds: [4],
  name: ['Сведение рук в кроссовере', 'Cable Crossover'],
  description: [
    'Изолирующее упражнение для груди с постоянным напряжением. Стоя между блоками, сведите руки перед собой, максимально сократив грудные мышцы, затем медленно верните.',
    'Isolation with constant tension. Stand between cables, bring hands together in front to fully contract chest, then slowly return.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
63: {
  mgId: 0,
  addMgIds: [4, 1],
  name: ['Отжимания с узкой постановкой рук', 'Close-Grip Push-Ups'],
  description: [
    'Упражнение для груди и трицепсов. Примите упор лежа, руки близко друг к другу, опускайтесь, касаясь грудью пола, затем отожмитесь.',
    'Chest and triceps bodyweight exercise. Hands close together in plank, lower chest to floor, then push back up.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
64: {
  mgId: 0,
  addMgIds: [4],
  name: ['Жим гантелей лежа на фитболе', 'Dumbbell Press on Stability Ball'],
  description: [
    'Функциональное упражнение для груди и кора. Лягте спиной на фитбол, держите гантели, выжимайте вверх, сохраняя равновесие.',
    'Functional chest and core exercise. Lie back on stability ball, press dumbbells up while balancing.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
65: {
  mgId: 0,
  addMgIds: [4],
  name: ['Пуловер с EZ-грифом', 'EZ-Bar Pullover'],
  description: [
    'Вариант пуловера с меньшей нагрузкой на запястья. Лягте поперек скамьи, держите EZ-гриф, опустите за голову, затем верните над грудью.',
    'Wrist-friendly pullover variation. Lie across bench, hold EZ-bar, lower behind head, return over chest.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
66: {
  mgId: 0,
  addMgIds: [4, 1],
  name: ['Изометрический жим в дверном проеме', 'Doorway Chest Press (Isometric)'],
  description: [
    'Реабилитационное/активационное упражнение. Упритесь ладонями в косяк двери на уровне груди, напрягайте грудь 10–15 секунд.',
    'Rehab/activation drill. Press palms into door frame at chest height, hold contraction for 10–15 seconds.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},

// === Shoulders (1) – Additional (67–73) ===
67: {
  mgId: 1,
  addMgIds: [4, 0],
  name: ['Жим штанги сидя', 'Seated Barbell Shoulder Press'],
  description: [
    'Базовое упражнение для дельт с опорой спины. Сядьте на скамью со спинкой, выжмите штангу от плеч вверх до полного разгибания.',
    'Basic delt exercise with back support. Sit on upright bench, press barbell from shoulders to full arm extension overhead.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
68: {
  mgId: 1,
  addMgIds: [],
  name: ['Подъем гантелей перед собой', 'Front Dumbbell Raise'],
  description: [
    'Изолирующее упражнение для передних дельт. Стоя, поднимайте одну или две гантели перед собой до уровня плеч, затем опускайте.',
    'Isolation for anterior delts. Raise dumbbell(s) in front to shoulder height, then lower.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
69: {
  mgId: 1,
  addMgIds: [5],
  name: ['Тяга штанги к подбородку узким хватом', 'Narrow-Grip Upright Row'],
  description: [
    'Акцент на передние дельты и трапеции. Возьмите штангу очень узким хватом, подтягивайте к подбородку, ведя локти вверх и в стороны.',
    'Emphasizes front delts and traps. Use very narrow grip, pull bar to chin with elbows high and flared.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
70: {
  mgId: 1,
  addMgIds: [4],
  name: ['Разведение гантелей сидя', 'Seated Dumbbell Lateral Raise'],
  description: [
    'Изолирующее упражнение без участия ног. Сидя, поднимайте гантели в стороны до уровня плеч, контролируя движение.',
    'Isolation without leg drive. Seated lateral raises with strict form.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
71: {
  mgId: 1,
  addMgIds: [5],
  name: ['Шраги в тренажере Смита', 'Smith Machine Shrugs'],
  description: [
    'Упражнение для трапеций с фиксированной траекторией. Возьмитесь за гриф в тренажере Смита, поднимайте плечи вверх.',
    'Traps exercise with guided bar path. Grip Smith machine bar, shrug shoulders upward.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
72: {
  mgId: 1,
  addMgIds: [0, 4],
  name: ['Обратные отжимания от стены', 'Wall Push-Backs'],
  description: [
    'Активация задних дельт. Встаньте спиной к стене, упритесь ладонями, отталкивайтесь назад, сводя лопатки.',
    'Rear delt activation. Back to wall, press hands into wall, push torso away while retracting scapulae.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
73: {
  mgId: 1,
  addMgIds: [4],
  name: ['Жим гантелей стоя с чередованием', 'Standing Alternating Dumbbell Press'],
  description: [
    'Функциональное упражнение с вовлечением кора. Стоя, поочередно выжимайте гантели вверх, сохраняя равновесие.',
    'Functional core-engaging press. Standing, alternate pressing dumbbells overhead while stabilizing.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},

// === Lats (2) – Additional (74–80) ===
74: {
  mgId: 2,
  addMgIds: [3, 5, 6],
  name: ['Тяга штанги в наклоне обратным хватом', 'Reverse-Grip Bent-Over Row'],
  description: [
    'Упражнение с акцентом на нижнюю часть широчайших. Наклонитесь, возьмите штангу хватом снизу, подтяните к поясу.',
    'Emphasizes lower lats. Bent-over row with underhand grip, pull bar to lower abdomen.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
75: {
  mgId: 2,
  addMgIds: [3, 5],
  name: ['Подтягивания обратным хватом', 'Chin-Ups'],
  description: [
    'Упражнение для широчайших и бицепсов. Возьмитесь за перекладину хватом снизу, подтянитесь до подбородка над перекладиной.',
    'Lats and biceps exercise. Underhand grip on bar, pull until chin clears the bar.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
76: {
  mgId: 2,
  addMgIds: [3, 6],
  name: ['Тяга Т-грифа', 'T-Bar Row'],
  description: [
    'Мощное упражнение для спины. Упритесь грудью в подушку, возьмитесь за рукоять Т-грифа, подтяните к поясу.',
    'Powerful back builder. Chest supported on pad, row T-bar handle to waist.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
77: {
  mgId: 2,
  addMgIds: [5],
  name: ['Тяга верхнего блока за голову', 'Behind-the-Neck Lat Pulldown'],
  description: [
    'Упражнение для верхней части широчайших (требует мобильности плеч). Тяните рукоять за голову, не сутулясь.',
    'Upper lats exercise (requires shoulder mobility). Pull bar behind neck without rounding shoulders.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
78: {
  mgId: 2,
  addMgIds: [3, 5, 6],
  name: ['Австралийские подтягивания', 'Inverted Rows'],
  description: [
    'Упражнение для спины с собственным весом. Лягте под грифом на уровне груди, подтянитесь к нему, сводя лопатки.',
    'Bodyweight back exercise. Lie under bar at chest height, pull chest to bar while retracting scapulae.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
79: {
  mgId: 2,
  addMgIds: [3],
  name: ['Тяга гантелей в наклоне', 'Bent-Over Dumbbell Row'],
  description: [
    'Альтернатива штанге для симметричной нагрузки. Наклонитесь, держа гантели, подтяните к поясу, контролируя движение.',
    'Unilateral alternative to barbell row. Bent-over, row dumbbells to hips with strict form.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
80: {
  mgId: 2,
  addMgIds: [6, 11],
  name: ['Тяга канатной рукояти сидя', 'Seated Rope Row'],
  description: [
    'Упражнение с акцентом на сведение лопаток. Сядьте, возьмитесь за канат, подтяните к животу, разводя руки в стороны.',
    'Scapular retraction focus. Seated rope row, pull to abdomen while flaring elbows.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},

// === Biceps (3) – Additional (81–86) ===
81: {
  mgId: 3,
  addMgIds: [8],
  name: ['Сгибание рук с EZ-грифом', 'EZ-Bar Curl'],
  description: [
    'Щадящий для локтей вариант сгибаний. Возьмите EZ-гриф хватом снизу, поднимайте к плечам, не раскачиваясь.',
    'Elbow-friendly curl. Underhand grip on EZ-bar, curl to shoulders without swinging.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
82: {
  mgId: 3,
  addMgIds: [8],
  name: ['Сгибание рук на наклонной скамье', 'Incline Dumbbell Curl'],
  description: [
    'Упражнение с глубоким растяжением бицепса. Сядьте на наклонную скамью, опустите гантели вниз, затем поднимайте.',
    'Deep stretch for biceps. Seated on incline bench, let dumbbells hang back, then curl up.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
83: {
  mgId: 3,
  addMgIds: [8],
  name: ['Сгибание с супинацией', 'Dumbbell Curl with Supination'],
  description: [
    'Акцент на длинную головку бицепса. Поднимайте гантель, поворачивая ладонь вверх в верхней точке.',
    'Targets long head. Curl dumbbell while rotating palm upward at the top.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
84: {
  mgId: 3,
  addMgIds: [8],
  name: ['Сгибание на нижнем блоке с канатом', 'Rope Cable Curl'],
  description: [
    'Изоляция с возможностью разведения рук. Возьмитесь за канат, сгибайте руки, разводя концы каната в стороны вверху.',
    'Isolation with hand separation. Rope attachment, curl while flaring hands apart at top.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
85: {
  mgId: 3,
  addMgIds: [8, 0],
  name: ['Сгибание Зоттмана', 'Zottman Curl'],
  description: [
    'Комбинированное упражнение для бицепса и предплечий. Поднимайте гантели с супинацией, опускайте с пронацией.',
    'Combines biceps and forearm work. Curl with palms up, lower with palms down.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
86: {
  mgId: 3,
  addMgIds: [8],
  name: ['Изометрическое сгибание с эспандером', 'Resistance Band Isometric Hold'],
  description: [
    'Активация без движения. Натяните эспандер, зафиксируйте руки под углом 90°, удерживайте 10–20 секунд.',
    'Static activation. Hold resistance band at 90° elbow angle for 10–20 seconds.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},

// === Triceps (4) – Additional (87–92) ===
87: {
  mgId: 4,
  addMgIds: [0],
  name: ['Отжимания с хлопком', 'Plyometric Push-Ups'],
  description: [
    'Взрывное упражнение для трицепсов и груди. Отожмитесь с силой, чтобы оторваться от пола и хлопнуть в ладоши.',
    'Explosive triceps and chest move. Push off floor hard enough to clap mid-air.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
88: {
  mgId: 4,
  addMgIds: [],
  name: ['Разгибание с EZ-грифом лежа', 'EZ-Bar Skullcrusher'],
  description: [
    'Более комфортный вариант французского жима. Лягте, держите EZ-гриф, опустите к лбу, затем выжмите вверх.',
    'Wrist-friendly skullcrusher. Lie down, lower EZ-bar to forehead, then extend arms.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
89: {
  mgId: 4,
  addMgIds: [],
  name: ['Разгибание на нижнем блоке', 'Low Cable Triceps Extension'],
  description: [
    'Изолирующее упражнение в нижней позиции. Встаньте, возьмитесь за канат снизу, разгибайте руки назад.',
    'Isolation from low position. Stand, grip rope attachment from low pulley, extend arms backward.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
90: {
  mgId: 4,
  addMgIds: [0],
  name: ['Жим в тренажере для груди узким хватом', 'Narrow-Grip Chest Press Machine'],
  description: [
    'Контролируемая нагрузка на трицепс. Используйте узкую постановку рук в тренажере для груди.',
    'Controlled triceps emphasis. Use narrow hand placement on chest press machine.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
91: {
  mgId: 4,
  addMgIds: [],
  name: ['Обратные отжимания от скамьи', 'Bench Dips'],
  description: [
    'Упражнение для трицепсов с собственным весом. Упритесь руками на скамью позади, опускайтесь, сгибая локти, затем поднимайтесь.',
    'Bodyweight triceps exercise. Hands on bench behind, lower body by bending elbows, then push up.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
92: {
  mgId: 4,
  addMgIds: [0],
  name: ['Изометрическое удержание в жиме', 'Isometric Bench Press Hold'],
  description: [
    'Статическое удержание штанги на уровне груди. Удерживайте вес 5–10 секунд в нижней точке жима.',
    'Static hold at chest level. Hold barbell 5–10 seconds at bottom of bench press.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},

// === Traps (5) – Additional (93–97) ===
93: {
  mgId: 5,
  addMgIds: [1, 6],
  name: ['Тяга штанги в наклоне к подбородку', 'Incline Upright Row'],
  description: [
    'Модификация для снижения риска травмы плеч. Наклонитесь на 45°, подтяните штангу к подбородку.',
    'Shoulder-friendly upright row variation. Lean forward 45°, pull bar to chin.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
94: {
  mgId: 5,
  addMgIds: [6],
  name: ['Шраги на тренажере для икр', 'Calf Raise Machine Shrugs'],
  description: [
    'Изолированное сокращение трапеций. Станьте в тренажер для икр, удерживайте платформу плечами, выполняйте шраги.',
    'Isolated trap contraction. Stand in calf raise machine, rest shoulders on pads, perform shrugs.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
95: {
  mgId: 5,
  addMgIds: [1],
  name: ['Тяга гантелей к подбородку', 'Dumbbell Upright Row'],
  description: [
    'Альтернатива штанге с меньшей нагрузкой на суставы. Подтягивайте гантели к подбородку, ведя локти вверх.',
    'Joint-friendly upright row. Pull dumbbells to chin with elbows leading.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
96: {
  mgId: 5,
  addMgIds: [6],
  name: ['Становая тяга со шрагами', 'Deadlift with Shrug Finish'],
  description: [
    'Комбинированное упражнение для спины и трапеций. После полной становой тяги добавьте мощный шраг в верхней точке.',
    'Combined back and trap builder. After full deadlift lockout, add a strong shrug at the top.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
97: {
  mgId: 5,
  addMgIds: [13],
  name: ['Изометрическое сопротивление шеи с эспандером', 'Banded Neck Resistance'],
  description: [
    'Укрепление трапеций и шеи. Оберните эспандер вокруг головы, сопротивляйтесь движению в разных направлениях.',
    'Neck and trap strengthening. Loop band around head, resist movement in all directions.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},

// === Lower Back (6) – Additional (98–102) ===
98: {
  mgId: 6,
  addMgIds: [5, 11, 10],
  name: ['Становая тяга сумо', 'Sumo Deadlift'],
  description: [
    'Вариант становой тяги с акцентом на внутреннюю поверхность бедра и поясницу. Широкая постановка ног, носки врозь.',
    'Deadlift variation emphasizing adductors and lower back. Wide stance, toes pointed out.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
99: {
  mgId: 6,
  addMgIds: [11, 5],
  name: ['Гиперэкстензия с весом', 'Weighted Hyperextension'],
  description: [
    'Усложненный вариант гиперэкстензии. Держите гантель или блин за головой при выполнении подъемов.',
    'Weighted back extension. Hold dumbbell or plate behind head during movement.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
100: {
  mgId: 6,
  addMgIds: [11, 10],
  name: ['Мостик с подъемом одной ноги', 'Single-Leg Glute Bridge'],
  description: [
    'Упражнение для поясницы и ягодиц. Лягте на спину, поднимите таз, оторвав одну ногу от пола.',
    'Lower back and glute exercise. Lie on back, lift hips while one leg is extended upward.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
101: {
  mgId: 6,
  addMgIds: [11, 5],
  name: ['Птица-собака', 'Bird-Dog'],
  description: [
    'Стабилизирующее упражнение для поясницы. Стоя на четвереньках, одновременно вытяните противоположные руку и ногу, удерживайте баланс.',
    'Stability exercise for lower back. On hands and knees, extend opposite arm and leg, hold balance.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
102: {
  mgId: 6,
  addMgIds: [10, 11],
  name: ['Тяга на тренажере для поясницы', 'Back Extension Machine'],
  description: [
    'Упражнение с фиксированной траекторией. Используйте тренажер для гиперэкстензии с регулируемым весом.',
    'Guided-motion lower back exercise. Use hyperextension machine with added resistance.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},

// === Abs (7) – Additional (103–109) ===
103: {
  mgId: 7,
  addMgIds: [6, 9],
  name: ['Скручивания на римском стуле', 'Roman Chair Sit-Ups'],
  description: [
    'Упражнение для верхнего пресса. Зафиксируйте ноги, поднимайте корпус, сокращая пресс.',
    'Upper abs exercise. Feet secured, lift torso by contracting abs.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
104: {
  mgId: 7,
  addMgIds: [6],
  name: ['Велосипед', 'Bicycle Crunches'],
  description: [
    'Динамическое упражнение для прямых и косых мышц живота. Лежа, выполняйте движения как при езде на велосипеде.',
    'Dynamic rectus and oblique exercise. Lie down, perform pedaling motion with torso rotation.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
105: {
  mgId: 7,
  addMgIds: [6, 9],
  name: ['Подъемы ног лежа', 'Lying Leg Raises'],
  description: [
    'Упражнение для нижнего пресса. Лягте на пол, поднимайте прямые ноги до 90°, затем медленно опускайте.',
    'Lower abs exercise. Lie flat, raise straight legs to 90°, then slowly lower.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
106: {
  mgId: 7,
  addMgIds: [6],
  name: ['Боковая планка', 'Side Plank'],
  description: [
    'Изометрия для косых мышц живота. Лягте на бок, упритесь в локоть и стопу, поднимите бедра, удерживайте линию тела.',
    'Oblique isometric hold. Lie on side, prop on elbow and foot, lift hips, maintain straight line.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
107: {
  mgId: 7,
  addMgIds: [6, 9],
  name: ['Дровосек', 'Woodchoppers (Cable)'],
  description: [
    'Функциональное упражнение для косых мышц. Возьмитесь за рукоять верхнего блока, тяните по диагонали вниз к противоположной ноге.',
    'Functional oblique exercise. High-to-low diagonal cable pull across body.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
108: {
  mgId: 7,
  addMgIds: [6],
  name: ['Скручивания с гантелью', 'Weighted Crunches'],
  description: [
    'Усложненные скручивания. Держите гантель на груди или за головой, выполняйте подъемы корпуса.',
    'Weighted crunch variation. Hold dumbbell on chest or behind head during crunches.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
109: {
  mgId: 7,
  addMgIds: [6, 11],
  name: ['Русские скручивания', 'Russian Twists'],
  description: [
    'Упражнение для косых мышц с вращением. Сидя с поднятыми ногами, поворачивайте корпус в стороны, держа вес.',
    'Rotational oblique exercise. Seated with legs elevated, twist torso side to side while holding weight.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},

// === Forearms (8) – Additional (110–114) ===
110: {
  mgId: 8,
  addMgIds: [],
  name: ['Сжимание эспандера', 'Hand Gripper Squeeze'],
  description: [
    'Изолирующее упражнение для сгибателей кисти. Сжимайте ручной эспандер максимально сильно, удерживайте 1–2 секунды.',
    'Isolation for wrist flexors. Squeeze hand gripper fully, hold for 1–2 seconds.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
111: {
  mgId: 8,
  addMgIds: [],
  name: ['Подъемы по лестнице с гантелями', 'Towel Pull-Ups'],
  description: [
    'Функциональное упражнение для хвата и предплечий. Используйте полотенца, перекинутые через турник, подтягивайтесь, удерживая их.',
    'Grip and forearm functional exercise. Use towels over pull-up bar, perform pull-ups while gripping towels.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
112: {
  mgId: 8,
  addMgIds: [],
  name: ['Удержание штанги фермера', 'Farmer’s Carry Hold'],
  description: [
    'Статическое упражнение для хвата. Держите тяжелые гантели или гриф по бокам, стойте неподвижно 20–60 секунд.',
    'Static grip hold. Hold heavy dumbbells or barbell at sides, stand still for 20–60 seconds.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
113: {
  mgId: 8,
  addMgIds: [],
  name: ['Вращения запястьями с гантелями', 'Dumbbell Wrist Rotations'],
  description: [
    'Мобильность и активация предплечий. Держите гантель вертикально, вращайте запястьем по и против часовой стрелки.',
    'Forearm mobility drill. Hold dumbbell vertically, rotate wrist clockwise and counterclockwise.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
114: {
  mgId: 8,
  addMgIds: [],
  name: ['Удержание на весу с разгибанием', 'Reverse Barbell Hold'],
  description: [
    'Активация разгибателей. Держите штангу хватом сверху, удерживайте на весу 30 секунд, не сгибая запястья.',
    'Extensor activation. Hold barbell with overhand grip, maintain for 30 seconds without wrist flexion.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},

// === Quads (9) – Additional (115–121) ===
115: {
  mgId: 9,
  addMgIds: [11, 10],
  name: ['Приседания пистолетиком', 'Pistol Squats'],
  description: [
    'Продвинутое упражнение на одной ноге. Приседайте на одной ноге, вытянув другую вперед, сохраняя баланс.',
    'Advanced single-leg squat. Squat on one leg while extending the other forward, maintaining balance.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
116: {
  mgId: 9,
  addMgIds: [11, 6],
  name: ['Приседания в тренажере Смита', 'Smith Machine Squat'],
  description: [
    'Контролируемый вариант приседаний. Используйте тренажер Смита для стабильной траектории движения.',
    'Guided squat variation. Use Smith machine for fixed bar path.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
117: {
  mgId: 9,
  addMgIds: [11],
  name: ['Приседания с гантелями у плеч', 'Goblet Squat'],
  description: [
    'Функциональное упражнение для квадрицепсов и кора. Держите гантель или гирю у груди, приседайте глубоко.',
    'Functional quad and core exercise. Hold dumbbell/kettlebell at chest, squat deep.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
118: {
  mgId: 9,
  addMgIds: [11, 10],
  name: ['Приседания с прыжком', 'Jump Squats'],
  description: [
    'Плиометрическое упражнение для взрывной силы. Из положения приседа выполните прыжок вверх, затем приземлитесь мягко.',
    'Plyometric power exercise. From squat position, explode upward into jump, land softly.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
119: {
  mgId: 9,
  addMgIds: [11],
  name: ['Приседания у стены', 'Wall Sit'],
  description: [
    'Изометрическое упражнение для квадрицепсов. Спина у стены, бедра параллельны полу, удерживайте позу.',
    'Quad isometric hold. Back against wall, thighs parallel to floor, hold position.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
120: {
  mgId: 9,
  addMgIds: [11, 6],
  name: ['Приседания с шагом в сторону', 'Lateral Lunges'],
  description: [
    'Упражнение для внутренней поверхности бедра и квадрицепсов. Сделайте широкий шаг в сторону, приседайте на одну ногу.',
    'Adductor and quad exercise. Step wide to the side, squat on one leg while keeping the other straight.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
121: {
  mgId: 9,
  addMgIds: [11],
  name: ['Приседания с паузой внизу', 'Pause Squat'],
  description: [
    'Упражнение для силы в нижней точке. Приседайте до параллели, зафиксируйте положение на 2–3 секунды, затем поднимайтесь.',
    'Strength focus at bottom position. Squat to parallel, hold for 2–3 seconds, then drive up.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},

// === Hamstrings (10) – Additional (122–127) ===
122: {
  mgId: 10,
  addMgIds: [6, 11],
  name: ['Сгибание ног стоя', 'Standing Leg Curl'],
  description: [
    'Изолирующее упражнение для бицепса бедра. Используйте тренажер для сгибания ног в положении стоя.',
    'Hamstring isolation. Use standing leg curl machine.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
123: {
  mgId: 10,
  addMgIds: [6, 11],
  name: ['Мостик с подъемом на одну ногу', 'Single-Leg Hip Thrust'],
  description: [
    'Активация задней цепи. Выполняйте ягодичный мостик, опираясь на одну ногу.',
    'Posterior chain activation. Perform hip thrust on one leg.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
124: {
  mgId: 10,
  addMgIds: [6, 11],
  name: ['Скольжения лежа', 'Sliding Leg Curls'],
  description: [
    'Упражнение с собственным весом. Лягте на спину, поставьте стопы на скользящие диски, сгибайте ноги, подтягивая пятки к ягодицам.',
    'Bodyweight hamstring curl. Lie on back, feet on sliders, curl heels toward glutes.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
125: {
  mgId: 10,
  addMgIds: [6, 11],
  name: ['Тяга на прямых ногах в тренажере Смита', 'Smith Machine Stiff-Leg Deadlift'],
  description: [
    'Контролируемая растяжка бицепса бедра. Используйте тренажер Смита для стабильной тяги на прямых ногах.',
    'Controlled hamstring stretch. Use Smith machine for stable stiff-leg deadlift.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
126: {
  mgId: 10,
  addMgIds: [6],
  name: ['Наклоны вперед с гантелью', 'Good Morning with Dumbbell'],
  description: [
    'Упражнение для поясницы и бицепсов бедра. Держите гантель за головой, наклоняйтесь вперед с прямой спиной.',
    'Lower back and hamstring exercise. Hold dumbbell behind neck, hinge forward with flat back.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
127: {
  mgId: 10,
  addMgIds: [11, 6],
  name: ['Глубокие выпады', 'Walking Lunges'],
  description: [
    'Динамическое упражнение для ног. Выполняйте выпады, шагая вперед, чередуя ноги.',
    'Dynamic leg exercise. Step forward into lunge, alternate legs continuously.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},

// === Glutes (11) – Additional (128–134) ===
128: {
  mgId: 11,
  addMgIds: [10, 9],
  name: ['Махи ногой в сторону лежа', 'Side-Lying Leg Lifts'],
  description: [
    'Изолирующее упражнение для средней ягодичной мышцы. Лягте на бок, поднимайте верхнюю ногу вверх.',
    'Gluteus medius isolation. Lie on side, lift top leg upward.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
129: {
  mgId: 11,
  addMgIds: [10, 6],
  name: ['Ягодичный мостик с паузой', 'Paused Hip Thrust'],
  description: [
    'Акцент на пиковое сокращение. В верхней точке мостика задержитесь на 1–2 секунды.',
    'Peak contraction focus. Hold at top of hip thrust for 1–2 seconds.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
130: {
  mgId: 11,
  addMgIds: [10, 9],
  name: ['Приседания в ящик', 'Box Squat'],
  description: [
    'Упражнение с акцентом на ягодицы. Приседайте до касания ящика, затем мощно отталкивайтесь.',
    'Glute-focused squat. Sit back onto box, then drive up explosively.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
131: {
  mgId: 11,
  addMgIds: [10],
  name: ['Обратная гиперэкстензия на фитболе', 'Reverse Hyper on Stability Ball'],
  description: [
    'Изолирующее упражнение для ягодиц. Лягте животом на фитбол, поднимайте ноги вверх, сокращая ягодицы.',
    'Glute isolation. Lie prone on ball, lift legs upward by contracting glutes.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
132: {
  mgId: 11,
  addMgIds: [10, 9],
  name: ['Выпады в сторону с гантелью', 'Lateral Lunges with Dumbbell'],
  description: [
    'Упражнение для внутренней поверхности бедра и ягодиц. Держите гантель двумя руками, выполняйте выпады в стороны.',
    'Adductor and glute exercise. Hold dumbbell with both hands, lunge laterally.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
133: {
  mgId: 11,
  addMgIds: [10, 6],
  name: ['Мостик на одной ноге с весом', 'Weighted Single-Leg Glute Bridge'],
  description: [
    'Продвинутая активация ягодиц. На одной ноге, с гантелью на бедрах, поднимайте таз вверх.',
    'Advanced glute activation. Single-leg bridge with dumbbell on hips.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
134: {
  mgId: 11,
  addMgIds: [9, 10],
  name: ['Сумо становая тяга', 'Sumo Deadlift'],
  description: [
    'Мощное упражнение для ягодиц и внутренней поверхности бедра. Широкая стойка, носки врозь, тяга вверх.',
    'Powerful glute and adductor exercise. Wide stance, toes out, deadlift upward.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},

// === Calves (12) – Additional (135–138) ===
135: {
  mgId: 12,
  addMgIds: [],
  name: ['Подъемы на носки в тренажере сидя', 'Donkey Calf Raise'],
  description: [
    'Традиционное упражнение для камбаловидной мышцы. Наклонитесь вперед, положите вес на поясницу, поднимайтесь на носки.',
    'Classic soleus exercise. Bend forward, load weight on lower back, rise onto toes.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
136: {
  mgId: 12,
  addMgIds: [],
  name: ['Прыжки на носках', 'Calf Jumps'],
  description: [
    'Плиометрическое упражнение для икр. Выполняйте прыжки, отталкиваясь только носками.',
    'Plyometric calf exercise. Jump continuously using only toes for propulsion.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
137: {
  mgId: 12,
  addMgIds: [],
  name: ['Подъемы на носки с эспандером', 'Banded Calf Raise'],
  description: [
    'Упражнение с переменным сопротивлением. Наденьте эспандер на плечи, выполняйте подъемы на носки.',
    'Variable resistance calf raise. Loop resistance band over shoulders, perform raises.'
  ],
  isBase: true,
  rm: 0,
  rmDate: '',
  show: true
},
138: {
  mgId: 12,
  addMgIds: [],
  name: ['Ходьба на носках', 'Toe Walks'],
  description: [
    'Функциональное укрепление икр. Пройдите 20–30 метров, держась на носках.',
    'Functional calf strengthening. Walk 20–30 meters on toes only.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},

// === Neck (13) – Additional (139–140) ===
139: {
  mgId: 13,
  addMgIds: [5, 6],
  name: ['Подъемы головы лежа на боку', 'Side Neck Bridges'],
  description: [
    'Упражнение для боковых мышц шеи. Лягте на бок, поднимайте голову вверх, удерживая 2–3 секунды.',
    'Lateral neck strengthening. Lie on side, lift head upward, hold for 2–3 seconds.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
140: {
  mgId: 13,
  addMgIds: [5],
  name: ['Использование тренажера для шеи', 'Neck Machine Exercises'],
  description: [
    'Изолированная проработка всех отделов шеи. Используйте специальный тренажер для шеи в 4 направлениях.',
    'Complete neck isolation. Use dedicated neck machine for flexion, extension, and lateral movements.'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
141: {
  mgId: 14, 
  addMgIds: [],  
  name: ['Беговая дорожка', 'Treadmill'],
  description: [
    'Кардиотренировка на беговой дорожке для улучшения выносливости, сжигания калорий и укрепления сердечно-сосудистой системы...',
    'Cardio workout on a treadmill to improve endurance, burn calories, and strengthen the cardiovascular system...'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
142: {
  mgId: 14,
  addMgIds: [],
  name: ['Эллиптический тренажёр', 'Elliptical'],
  description: [
    'Низкоударная кардиотренировка, задействующая ноги и руки для улучшения выносливости и сжигания калорий без нагрузки на суставы...',
    'Low-impact cardio workout engaging both legs and arms to boost endurance and burn calories without joint strain...'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
143: {
  mgId: 14,
  addMgIds: [],
  name: ['Велотренажёр', 'Exercise Bike'],
  description: [
    'Эффективная кардионагрузка для укрепления ног и сердечно-сосудистой системы в комфортном темпе...',
    'Effective cardio workout to strengthen legs and improve cardiovascular health at a comfortable pace...'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
144: {
  mgId: 14,
  addMgIds: [],
  name: ['Гребной тренажёр', 'Rowing Machine'],
  description: [
    'Полноценная тренировка всего тела с акцентом на кардио, развивает выносливость и координацию...',
    'Full-body cardio-focused workout that builds endurance, power, and coordination...'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
145: {
  mgId: 14,
  addMgIds: [],
  name: ['Скакалка', 'Jump Rope'],
  description: [
    'Интенсивная высокоударная кардиотренировка для сжигания калорий и улучшения координации...',
    'High-intensity, high-impact cardio session to torch calories and sharpen coordination...'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
},
146: {
  mgId: 14,
  addMgIds: [],
  name: ['Бег на улице', 'Outdoor Running'],
  description: [
    'Естественная кардиотренировка на свежем воздухе для укрепления сердца и улучшения настроения...',
    'Natural outdoor cardio to strengthen your heart and boost your mood...'
  ],
  isBase: false,
  rm: 0,
  rmDate: '',
  show: true
}
};