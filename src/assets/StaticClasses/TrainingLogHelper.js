import { AppData} from '../StaticClasses/AppData';
/* training log structure   store in AppData.trainingLog
{
  "2025-12-08": [{ 
    programId: 0,                                 //when set also i need to update current programm id in AppData
    dayIndex: 1,                                  //on the start if the currentProgrammId is equal this id increment or set 1
    complited: true,                              //check on app start
    startTime: 1702213815432,                     //when start new training  Date.now()
    endTime: 1702213945432,                       //fixed when finish training  Date.now()
    duration: 2700000,                            //in milliseconds  45 min is 2700000 ms  endTime - startTime
    tonnage: 100,                                 //add when finish set , adding per set
    exercises: {
      '0' {                                       //  list of the complited exercises , id as a key
        mgId: 0,                                  //to get muscle group id fast
        sets: [
          { type: 0, reps: 15, weight: 40,time:60000 },   //types : o - warm up , 1 - work
          { type: 1, reps: 10, weight: 60,time:60000 },
        ]
        totalTonnage: 100,                         //calculate when finish exercise
        'complited':true                             //if finished
      },                                            // next  exercise
    }
   },     //next training
  ],       //next day
}
*/
export function formatDateKey(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // "2025-12-08"
}

// helpers
export function getTrainingSummary(session, langIndex) {
  if (!session?.exercises) {
    return (langIndex === 0 ? '0 упр./ 0 подх.' : '0 ex./ 0 sets');
  }

  let exerciseCount = 0;
  let setCount = 0;

  for (const exercise of Object.values(session.exercises)) {
    if (exercise.completed) {
      exerciseCount++;
      if (Array.isArray(exercise.sets)) {
        setCount += exercise.sets.length;
      }
    }
  }

  if (langIndex === 0) {
    return ` / ${exerciseCount} упр. / ${setCount} подх.`;
  } else {
    return ` / ${exerciseCount} ex. / ${setCount} sets`;
  }
}

export function findPreviousSimilarExercise(exId, setIndex, beforeDate, trainingLog) {
  if (!trainingLog || typeof exId !== 'string' || typeof setIndex !== 'number') {
    return null;
  }

  const beforeTimestamp = beforeDate.getTime();
  let bestMatch = null;
  let bestTime = -Infinity; // track most recent match

  for (const [dateKey, sessions] of Object.entries(trainingLog)) {
    const sessionDate = new Date(dateKey);
    const sessionTime = sessionDate.getTime();

    // Skip today and future dates
    if (sessionTime >= beforeTimestamp) continue;

    // Check each session on this day
    for (const session of sessions) {
      // Only consider completed sessions
      if (!session.completed) continue;

      // Check if this session has the exercise
      const exercise = session.exercises?.[exId];
      if (!exercise || !Array.isArray(exercise.sets)) continue;

      // Check if setIndex exists in this exercise
      const set = exercise.sets[setIndex];
      if (!set || typeof set.reps !== 'number' || typeof set.weight !== 'number') continue;

      // Found a candidate — keep the MOST RECENT one
      if (sessionTime > bestTime) {
        bestTime = sessionTime;
        bestMatch = {
          type: set.type,
          reps: set.reps,
          weight: set.weight,
          time: set.time
        };
      }
    }
  }

  return bestMatch; // null if none found
}
export function addNewSession(date, programId, dayIndex) {
  
  const program = AppData.programs.find(p => p.id === programId);
  if (!program || !program.schedule[dayIndex]) {
    console.error('Invalid program or dayIndex');
    return false;
  }

  // Initialize exercises from program day with empty sets
  const exercises = {};
  program.schedule[dayIndex].exercises.forEach(ex => {
    const exercise = AppData.exercises.find(e => e.id === ex.exId);
    if (!exercise) {
      console.warn(`Exercise ${ex.exId} not found in AppData.exercises`);
      return;
    }

    exercises[ex.exId] = {
      mgId: exercise.mgId, // ✅ From Exercise class
      sets: [], // ✅ Empty sets array
      totalTonnage: 0,
      completed: false
    };
  });

  const dateKey = formatDateKey(date);
  const newSession = {
    programId,
    dayIndex,
    completed: false,
    startTime: Date.now(),
    endTime: null,
    duration: 0,
    tonnage: 0,
    exercises // ✅ Pre-filled with program exercises
  };
  if (!AppData.trainingLog[dateKey]) {
    AppData.trainingLog[dateKey] = [];
  }
  AppData.trainingLog[dateKey].push(newSession);
  return true;
}
// In TrainingLogHelper.js
export function addPreviousSession(date, programId, dayIndex, startTimeMs, endTimeMs) {
  // ✅ CREATE DATE IN LOCAL TIME (critical fix)
  const sessionDate = new Date(
    date.getFullYear(), 
    date.getMonth(), 
    date.getDate()
  );
  
  const sessionStartTime = sessionDate.getTime() + startTimeMs;
  const sessionEndTime = sessionDate.getTime() + endTimeMs;
  const duration = sessionEndTime - sessionStartTime;
  const exercises = {};
  const program = AppData.programs.find(p => p.id === programId);
  program.schedule[dayIndex].exercises.forEach(ex => {
    const exercise = AppData.exercises.find(e => e.id === ex.exId);
    if (!exercise) {
      console.warn(`Exercise ${ex.exId} not found in AppData.exercises`);
      return;
    }

    exercises[ex.exId] = {
      mgId: exercise.mgId, // ✅ From Exercise class
      sets: [], // ✅ Empty sets array
      totalTonnage: 0,
      completed: false
    };
  });
  const newSession = {
    programId,
    dayIndex,
    completed: true,
    startTime: sessionStartTime,
    endTime: sessionEndTime,
    duration,
    tonnage: 0,
    exercises
  };

  // ✅ USE LOCAL-DATE KEY (matches your calendar)
  const dateKey = formatDateKey(date); 
  if (!AppData.trainingLog[dateKey]) {
    AppData.trainingLog[dateKey] = [];
  }
  AppData.trainingLog[dateKey].push(newSession);
  return true;
}
export function deleteSession(date, sessionIndex) {
  const dateKey = formatDateKey(date);
  const sessions = AppData.trainingLog[dateKey];
  
  if (!sessions || sessionIndex < 0 || sessionIndex >= sessions.length) {
    return false;
  }

  sessions.splice(sessionIndex, 1);
  if (sessions.length === 0) {
    delete AppData.trainingLog[dateKey];
  }
  return true;
}
export function finishSession(date, sessionIndex) {
  const dateKey = formatDateKey(date);
  const session = AppData.trainingLog[dateKey]?.[sessionIndex];
  
  if (!session || session.completed) return false;

  session.endTime = Date.now();
  session.duration = session.endTime - session.startTime;
  session.completed = true;

  // Recalculate total tonnage from exercises
  session.tonnage = Object.values(session.exercises).reduce(
    (sum, ex) => sum + (ex.totalTonnage || 0),
    0
  );

  return true;
}
export function addExerciseToSession(date, sessionIndex, exerciseId) {
  const dateKey = formatDateKey(date);
  const session = AppData.trainingLog[dateKey]?.[sessionIndex];
  
  if (!session || session.exercises[exerciseId]) return false;

  session.exercises[exerciseId] = {
    mgId: AppData.exercises[exerciseId]?.mgId || 0,
    sets: [],
    totalTonnage: 0,
    completed: false
  };
  return true;
}
export function removeExerciseFromSession(date, sessionIndex, exerciseId) {
  const dateKey = formatDateKey(date);
  const session = AppData.trainingLog[dateKey]?.[sessionIndex];
  
  if (!session || !session.exercises[exerciseId]) return false;

  // Subtract exercise tonnage from session
  const exercise = session.exercises[exerciseId];
  session.tonnage = Math.max(0, session.tonnage - (exercise.totalTonnage || 0));

  delete session.exercises[exerciseId];
  return true;
}
export function addSet(date, sessionIndex, exerciseId, reps, weight,time, isWarmUp) {
  const dateKey = formatDateKey(date);
  const session = AppData.trainingLog[dateKey]?.[sessionIndex];
  const exercise = session?.exercises?.[exerciseId];
  
  if (!exercise) return false;

  const type = isWarmUp ? 0 : 1;
  const set = { type, reps, weight ,time};
  exercise.sets.push(set);

  // Update tonnage
  const setTonnage = reps * weight;
  exercise.totalTonnage = (exercise.totalTonnage || 0) + setTonnage;
  session.tonnage = (session.tonnage || 0) + setTonnage;

  return true;
}
export function redactSet(date, sessionIndex, exerciseId, setIndex, newReps, newWeight,newTime, isWarmUp) {
  const dateKey = formatDateKey(date);
  const session = AppData.trainingLog[dateKey]?.[sessionIndex];
  const exercise = session?.exercises?.[exerciseId];
  
  if (!exercise || setIndex < 0 || setIndex >= exercise.sets.length) {
    return false;
  }

  const oldSet = exercise.sets[setIndex];
  const newType = isWarmUp ? 0 : 1;

  // Skip if no change
  if (
    oldSet.reps === newReps &&
    oldSet.weight === newWeight &&
    newTime === oldSet.time &&
    oldSet.type === newType
  ) {
    return true;
  }

  // 1. Remove old tonnage
  const oldTonnage = oldSet.reps * oldSet.weight;
  exercise.totalTonnage = Math.max(0, (exercise.totalTonnage || 0) - oldTonnage);
  session.tonnage = Math.max(0, (session.tonnage || 0) - oldTonnage);

  // 2. Apply new values
  oldSet.reps = newReps;
  oldSet.weight = newWeight;
  oldSet.type = newType;

  // 3. Add new tonnage
  const newTonnage = newReps * newWeight;
  exercise.totalTonnage = (exercise.totalTonnage || 0) + newTonnage;
  session.tonnage = (session.tonnage || 0) + newTonnage;

  return true;
}
export function removeSet(date, sessionIndex, exerciseId, setIndex) {
  const dateKey = formatDateKey(date);
  const session = AppData.trainingLog[dateKey]?.[sessionIndex];
  const exercise = session?.exercises?.[exerciseId];
  
  if (!exercise || setIndex < 0 || setIndex >= exercise.sets.length) return false;

  const removedSet = exercise.sets.splice(setIndex, 1)[0];
  const setTonnage = removedSet.reps * removedSet.weight;

  // Update tonnage
  exercise.totalTonnage = Math.max(0, (exercise.totalTonnage || 0) - setTonnage);
  session.tonnage = Math.max(0, (session.tonnage || 0) - setTonnage);

  return true;
}
export function finishExercise(date, sessionIndex, exerciseId) {
  const dateKey = formatDateKey(date);
  const session = AppData.trainingLog[dateKey]?.[sessionIndex];
  const exercise = session?.exercises?.[exerciseId];
  
  if (!exercise) return false;

  exercise.completed = true;
  return true;
}