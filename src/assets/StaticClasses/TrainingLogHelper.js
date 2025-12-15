import { AppData} from '../StaticClasses/AppData';
import {saveData} from '../StaticClasses/SaveHelper';
/* training log structure   store in AppData.trainingLog
{
  "2025-12-08": [{ 
    programId: 0,                                 //when set also i need to update current programm id in AppData
    dayIndex: 1,                                  //on the start if the currentProgrammId is equal this id increment or set 1
    complited: true,                              //check on app start
    startTime: 1702213815432,                     //when start new training  Date.now()
    endTime: 1702213945432,                       //fixed when finish training  Date.now()
    duration: 2700000,                             //in milliseconds  45 min is 2700000 ms  endTime - startTime
    tonnage: 100,                                 //add when finish set , adding per set
    exerciseOrder: [],                            // Store exercise IDs in order
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
export async function addNewSession(date, programId, dayIndex) {
  const program = AppData.programs.find(p => p.id === programId);
  if (!program || !program.schedule[dayIndex]) {
    console.error('Invalid program or dayIndex');
    return false;
  }
  const exercises = {};
  const exerciseOrder = [];
  program.schedule[dayIndex].exercises.forEach(ex => {
    const exercise = AppData.exercises.find(e => e.id === ex.exId);
    if (!exercise) {
      console.warn(`Exercise ${ex.exId} not found in AppData.exercises`);
      return;
    }
    exercises[ex.exId] = {
      mgId: exercise.mgId,
      sets: [],
      totalTonnage: 0,
      completed: false
    };
    exerciseOrder.push(ex.exId);
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
    exercises,
    exerciseOrder // ✅ Add this new field
  };

  if (!AppData.trainingLog[dateKey]) {
    AppData.trainingLog[dateKey] = [];
  }
  AppData.trainingLog[dateKey].push(newSession);
  await saveData();
}
// In TrainingLogHelper.js
export async function addPreviousSession(date, programId, dayIndex, startTimeMs, endTimeMs) {
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
  const exerciseOrder = [];
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
    exerciseOrder.push(ex.exId);
  });
  const newSession = {
    programId,
    dayIndex,
    completed: true,
    startTime: sessionStartTime,
    endTime: sessionEndTime,
    duration,
    tonnage: 0,
    exercises,
    exerciseOrder
  };

  // ✅ USE LOCAL-DATE KEY (matches your calendar)
  const dateKey = formatDateKey(date); 
  if (!AppData.trainingLog[dateKey]) {
    AppData.trainingLog[dateKey] = [];
  }
  AppData.trainingLog[dateKey].push(newSession);
  await saveData();
}
export async function deleteSession(date, sessionIndex) {
  const dateKey = formatDateKey(date);
  const sessions = AppData.trainingLog[dateKey];
  
  if (!sessions || sessionIndex < 0 || sessionIndex >= sessions.length) {
    return false;
  }

  sessions.splice(sessionIndex, 1);
  if (sessions.length === 0) {
    delete AppData.trainingLog[dateKey];
  }
  await saveData();
}
export function finishSession(date, sessionIndex) {
  const dateKey = formatDateKey(date);
  const session = AppData.trainingLog[dateKey]?.[sessionIndex];
  
  if (!session || session.completed) return false;

  session.endTime = Date.now();
  session.duration = session.endTime - session.startTime;
  session.completed = true;
  Object.values(session.exercises).map(ex => {
    ex.completed = true;
  });
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
  session.exerciseOrder.push(exerciseId);
  return true;
}
export function removeExerciseFromSession(date, sessionIndex, exerciseId) {
  const dateKey = formatDateKey(date);
  const session = AppData.trainingLog[dateKey]?.[sessionIndex];
  
  if (!session || !session.exercises[exerciseId]) return false;

  // 1. Subtract tonnage
  const exercise = session.exercises[exerciseId];
  session.tonnage = Math.max(0, session.tonnage - (exercise.totalTonnage || 0));

  // 2. Remove from exercises object
  delete session.exercises[exerciseId];

  // 3. Remove from exerciseOrder array (if exists)
  if (session.exerciseOrder) {
    session.exerciseOrder = session.exerciseOrder.filter(id => id !== exerciseId);
  }

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

export function getTonnage(date,sessionIndex){
  const dateKey = formatDateKey(date);
  const session = AppData.trainingLog[dateKey]?.[sessionIndex];
  return session?.tonnage || 0;
}
export function getAllReps(date, sessionIndex) {
  const dateKey = formatDateKey(date);
  const session = AppData.trainingLog[dateKey]?.[sessionIndex];
  
  if (!session) return 0;
  
  let totalReps = 0;
  for (const exercise of Object.values(session.exercises)) {
    for (const set of exercise.sets) {
      totalReps += set.reps;
    }
  }
  return totalReps;
}
export function getAllSets(date, sessionIndex) {
  const dateKey = formatDateKey(date);
  const session = AppData.trainingLog[dateKey]?.[sessionIndex];
  
  if (!session) return 0;
  
  let totalSets = 0;
  for (const exercise of Object.values(session.exercises)) {
    totalSets += exercise.sets.length;
  }
  return totalSets;
}
export function getMaxOneRep(reps, weight) {
  if (!reps || !weight || reps < 1 || weight <= 0) return 0;
  if (reps === 1) return weight; // If 1 rep, max = weight
  // 1. Brzycki Formula (most accurate for 1-10 reps)
  const brzycki = weight * (36 / (37 - reps));
  // 2. Epley Formula (best for higher reps)
  const epley = weight * (1 + 0.0333 * reps);
  // 3. Lombardi Formula (good for all rep ranges)
  const lombardi = weight * Math.pow(reps, 0.1);
  const median = brzycki + epley + lombardi ;
  
  // Round to nearest 0.5 kg/lbs for practicality
  return Math.round(median / 3);
}

// for metrics
export function getValidExerciseIds() {
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  twoMonthsAgo.setHours(0, 0, 0, 0);
  
  const validExerciseIds = new Set();
  
  // Iterate through all dates in trainingLog
  Object.entries(AppData.trainingLog).forEach(([dateKey, sessions]) => {
    const sessionDate = new Date(dateKey);
    
    // Only consider sessions from last two months
    if (sessionDate >= twoMonthsAgo) {
      sessions.forEach(session => {
        if (session.completed) {
          // Check each exercise in the session
          Object.entries(session.exercises).forEach(([exId, exercise]) => {
            // Only include exercises that have sets (were actually performed)
            if (Array.isArray(exercise.sets) && exercise.sets.length > 0) {
              validExerciseIds.add(exId);
            }
          });
        }
      });
    }
  });
  console.log(Array.from(validExerciseIds));
  return Array.from(validExerciseIds);
}

export function getChartData(exId, needTonnage = false) {
  try {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    twoMonthsAgo.setHours(0, 0, 0, 0);
    
    const chartDataMap = new Map();
    
    // Iterate through all dates in trainingLog
    Object.entries(AppData.trainingLog).forEach(([dateKey, sessions]) => {
      const sessionDate = new Date(dateKey);
      
      // Only consider sessions from last two months
      if (sessionDate >= twoMonthsAgo) {
        let dailyBestWeight = 0;
        let dailyTotalTonnage = 0;
        let hasExercise = false;
        
        // Process all sessions for this date
        sessions.forEach(session => {
          if (session.completed && session.exercises?.[exId]) {
            const exercise = session.exercises[exId];
            
            if (Array.isArray(exercise.sets) && exercise.sets.length > 0) {
              hasExercise = true;
              
              if (needTonnage) {
                // Sum tonnage across all sessions on the same day
                dailyTotalTonnage += exercise.totalTonnage || 0;
              } else {
                // Find best weight across all sessions on the same day
                const sessionBestWeight = Math.max(
                  ...exercise.sets.map(set => set.weight || 0)
                );
                if (sessionBestWeight > dailyBestWeight) {
                  dailyBestWeight = sessionBestWeight;
                }
              }
            }
          }
        });
        
        if (hasExercise) {
          const value = needTonnage ? dailyTotalTonnage*0.001 : dailyBestWeight;
          chartDataMap.set(dateKey, value);
        }
      }
    });
    
    // Convert to array and sort by date
    return Array.from(chartDataMap.entries())
      .map(([date, value]) => ({
        date: date,
        value: value
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
      
  } catch (error) {
    console.error('Error in getChartData:', error);
    return [];
  }
}

export function getBestSet(exId) {
  let best = 0;
  for (const date in AppData.trainingLog) {
    const sessions = AppData.trainingLog[date];
    for (const session of sessions) {
      const exercise = session.exercises?.[exId];
      if (!exercise?.sets) continue;
      for (const set of exercise.sets) {
        const est = getMaxOneRep(set.reps, set.weight);
        if (est > best) best = est;
      }
    }
  }
  return best; // 0 if no valid sets found
}

// Returns the best 1RM estimate from the most recent completed session that includes exId (number)
export function lastBestSet(exId) {
  const dates = Object.keys(AppData.trainingLog)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  for (const date of dates) {
    const sessions = AppData.trainingLog[date];
    for (const session of sessions) {
      const exercise = session.exercises?.[exId];
      if (!exercise?.sets) continue;

      let sessionBest = 0;
      for (const set of exercise.sets) {
          const est = getMaxOneRep(set.reps, set.weight);
          if (est > sessionBest) sessionBest = est;
      }

      if (sessionBest > 0) {
        return sessionBest;
      }
    }
  }
  return 0; // never trained or no working sets
}

export const getWeeklyTrainingAmount = () => {
  try {
    const trainingLog = AppData?.trainingLog || {};
    const today = new Date();
    let completedSessions = 0;

    // Generate dates for the last 7 days (today + 6 past days)
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
      last7Days.push(dateStr);
    }

    // Check each date in the last 7 days
    for (const dateStr of last7Days) {
      const dayEntries = trainingLog[dateStr];
      if (Array.isArray(dayEntries)) {
        // Count how many entries on this day are completed
        const completedOnDay = dayEntries.filter(entry => entry.completed === true).length;
        completedSessions += completedOnDay;
      }
    }

    return Math.min(completedSessions, 7); // Cap at 7 for safety
  } catch (error) {
    console.warn('Error calculating weekly training amount:', error);
    return 0;
  }
};