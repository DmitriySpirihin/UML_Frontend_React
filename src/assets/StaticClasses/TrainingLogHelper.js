import { AppData} from '../StaticClasses/AppData';
import {saveData} from '../StaticClasses/SaveHelper';
/* training log structure   store in AppData.trainingLog
{
  "2025-12-08": [{ 
    type:'GYM',
    programId: 0,                                 //when set also i need to update current programm id in AppData
    dayIndex: 1,                                  //on the start if the currentProgrammId is equal this id increment or set 1
    completed: true,                              //check on app start
    startTime: 1702213815432,                     //when start new training  Date.now()
    endTime: 1702213945432,                       //fixed when finish training  Date.now()
    duration: 2700000,                             //in milliseconds  45 min is 2700000 ms  endTime - startTime
    tonnage: 100,                                 //add when finish set , adding per set
    exerciseOrder: [],                            // Store exercise IDs in order
    exercises: {
      '0' : {                                       //  list of the complited exercises , id as a key
        mgId: 0,                                  //to get muscle group id fast
        sets: [
          { type: 0, reps: 15, weight: 40,time:60000 },   //types : o - warm up , 1 - work
          { type: 1, reps: 10, weight: 60,time:60000 },
        ]
        totalTonnage: 100,                         //calculate when finish exercise
        'complited':true                             //if finished
      },                                            // next  exercise
    }
     RPE:1-10 ,
     note:''
   },     //next training
   {
    type: 'RUNNING'  or  'CYCLING' or 'SWIMMING'
    startTime: 1738951200000,
    duration: 2100000,
    distance: 5.2,
    elevationGain: 42,
    avgCadence:170,
    avgHeartRate:142,
    rpe: 7,
    notes: "Холмистый парк, последние 2км тяжело"
   }
     
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
  const program = AppData.programs[programId];
  if (!program || !program.schedule[dayIndex]) {
    console.error('Invalid program or dayIndex');
    return false;
  }
  const exercises = {};
  const exerciseOrder = [];
  program.schedule[dayIndex].exercises.forEach(ex => {
    // ✅ DIRECT ACCESS — NOT .find()
    const exercise = AppData.exercises[ex.exId];
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
    type:'GYM',
    programId,
    dayIndex,
    completed: false,
    startTime: Date.now(),
    endTime: null,
    duration: 0,
    tonnage: 0,
    exercises,
    RPE: null,      // Initialize RPE
    note: '',
    exerciseOrder
  };

  if (!AppData.trainingLog[dateKey]) {
    AppData.trainingLog[dateKey] = [];
  }
  AppData.trainingLog[dateKey].push(newSession);
  await saveData();
}
// In TrainingLogHelper.js
export async function addPreviousSession(date, programId, dayIndex, startTimeMs, endTimeMs) {
  const sessionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const sessionStartTime = sessionDate.getTime() + startTimeMs;
  const sessionEndTime = sessionDate.getTime() + endTimeMs;
  const duration = sessionEndTime - sessionStartTime;
  const exercises = {};
  const exerciseOrder = [];
  const program = AppData.programs[programId];

  // ✅ Guard in case program not found
  if (!program || !program.schedule[dayIndex]) {
    console.error('Invalid program or dayIndex in addPreviousSession');
    return;
  }

  program.schedule[dayIndex].exercises.forEach(ex => {
    const exercise = AppData.exercises[ex.exId];
    if (!exercise) {
      console.warn(`Exercise ${ex.exId} not found in AppData.exercises`);
      return;
    }

    // Initialize exercise entry in session
    exercises[ex.exId] = {
      mgId: exercise.mgId,
      sets: [], // ← You will need to populate this with { reps, weight } before RM update
      totalTonnage: 0,
      completed: true
    };
    exerciseOrder.push(ex.exId);
  });

  const newSession = {
    type:'GYM',
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
export async function finishSession(date, sessionIndex, rpe = null, note = '') {
  const dateKey = formatDateKey(date);
  const session = AppData.trainingLog[dateKey]?.[sessionIndex];
  
  if (!session || session.completed) return [];

  session.endTime = Date.now();
  session.duration = session.endTime - session.startTime;
  session.completed = true;
  if (rpe !== null) {
        session.RPE = rpe;
    }
    session.note = note.trim();

  Object.values(session.exercises).forEach(ex => {
    ex.completed = true;
  });

  session.tonnage = Object.values(session.exercises).reduce(
    (sum, ex) => sum + (ex.totalTonnage || 0),
    0
  );

  const newRmExercises = [];

session.exerciseOrder.forEach(exIdStr => {
  const exerciseData = session.exercises[exIdStr];
  const exIdNum = Number(exIdStr);
  const exerciseDef = AppData.exercises[exIdNum];

  if (!exerciseData || !exerciseDef || !exerciseData.sets?.length) return;

  const bestSet = exerciseData.sets.reduce(
    (best, set) => (set.weight > best.weight ? set : best),
    { weight: 0, reps: 1 }
  );

  const oneRepMax = getMaxOneRep(bestSet.reps, bestSet.weight);
  if (isNaN(oneRepMax) || oneRepMax <= 0) return;

  const previousRm = exerciseDef.rm; // ← store BEFORE update

  if (oneRepMax > previousRm) {
    exerciseDef.rm = oneRepMax;
    exerciseDef.rmDate = dateKey;
    const improvement = oneRepMax - previousRm;
    newRmExercises.push({
      exId: exIdNum,
      newRm: oneRepMax,
      oldRm: previousRm,
      improvement
    });
  }
});
await saveData();
return newRmExercises;
}
export async function addExerciseToSession(date, sessionIndex, exerciseId) {
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
  await saveData();
  return true;
}
export async function removeExerciseFromSession(date, sessionIndex, exerciseId) {
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
  await saveData();
  return true;
}
export async function addSet(date, sessionIndex, exerciseId, reps, weight, time, isWarmUp) {
  const dateKey = formatDateKey(date);
  const session = AppData.trainingLog[dateKey]?.[sessionIndex];
  const exercise = session?.exercises?.[exerciseId];
  
  if (!exercise) return false;

  const type = isWarmUp ? 0 : 1;
  const set = { type, reps, weight, time };
  exercise.sets.push(set);

  // Update tonnage
  const setTonnage = reps * weight;
  exercise.totalTonnage = (exercise.totalTonnage || 0) + setTonnage;
  session.tonnage = (session.tonnage || 0) + setTonnage;

  // 🔁 Only update 1RM if the exercise is marked as completed
  if (
    exercise.completed &&          // ← Only if user marked exercise as done
    !isWarmUp &&                   // Ignore warm-up sets
    reps > 0 && weight > 0        // Valid set
  ) {
    const estimated1RM = getMaxOneRep(reps, weight);
    const currentRM = AppData.exercises[exerciseId]?.rm || 0;
    if (estimated1RM > currentRM) {
      AppData.exercises[exerciseId].rm = estimated1RM;
      AppData.exercises[exerciseId].rmDate = formatDateKey(new Date());
    }
  }
  await saveData();
  return true;
}
export async function redactSet(date, sessionIndex, exerciseId, setIndex, newReps, newWeight,newTime, isWarmUp) {
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
  await saveData();
  return true;
}
export async function removeSet(date, sessionIndex, exerciseId, setIndex) {
  const dateKey = formatDateKey(date);
  const session = AppData.trainingLog[dateKey]?.[sessionIndex];
  const exercise = session?.exercises?.[exerciseId];
  
  if (!exercise || setIndex < 0 || setIndex >= exercise.sets.length) return false;

  const removedSet = exercise.sets.splice(setIndex, 1)[0];
  const setTonnage = removedSet.reps * removedSet.weight;

  // Update tonnage
  exercise.totalTonnage = Math.max(0, (exercise.totalTonnage || 0) - setTonnage);
  session.tonnage = Math.max(0, (session.tonnage || 0) - setTonnage);
  await saveData();
  return true;
}
export async function finishExercise(date, sessionIndex, exerciseId) {
  const dateKey = formatDateKey(date);
  const session = AppData.trainingLog[dateKey]?.[sessionIndex];
  const exercise = session?.exercises?.[exerciseId];
  
  if (!exercise) return false;

  exercise.completed = true;
  await saveData();
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


// new functionality

/**
 * Add a cardio session from the past (fully completed)
 * @param {Date} date - Training date
 * @param {'RUNNING'|'CYCLING'|'SWIMMING'} type - Cardio type
 * @param {number} distance - Distance in km
 * @param {number} durationMinutes - Duration in minutes
 * @param {number} startTimeMs - Start time offset in ms from date start (e.g., 28800000 = 8:00 AM)
 * @param {Object} [params] - Optional parameters
 */
export async function addCardioSession(
  date,
  type,
  distance,
  durationMinutes,
  startTimeMs,
  params = {}
) {
  const durationMs = durationMinutes * 60000;
  const baseDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const startTime = baseDate.getTime() + startTimeMs;
  const endTime = startTime + durationMs;

  const cardioSession = {
    type: type,
    startTime: startTime,
    endTime: endTime,
    duration: durationMs,
    distance: distance,
    elevationGain: params.elevationGain || 0,
    avgCadence: params.avgCadence || null,
    avgHeartRate: params.avgHeartRate || null,
    rpe: params.rpe || 5,
    notes: params.notes || '',
    completed: true
  };

  const dateKey = formatDateKey(date);
  if (!AppData.trainingLog[dateKey]) {
    AppData.trainingLog[dateKey] = [];
  }
  AppData.trainingLog[dateKey].push(cardioSession);
  await saveData();
  return cardioSession;
}

/**
 * Update an existing cardio session in the training log
 * @param {string} sessionId - Format: "YYYY-MM-DD_index" (e.g., "2026-02-05_0")
 * @param {Object} sessionData - Session data to update
 * @returns {boolean} Success status
 */
export async function updateCardioSession(sessionId, sessionData) {
  try {
    // Parse sessionId to extract date key and index
    const [dateKey, indexStr] = sessionId.split('_');
    const index = parseInt(indexStr, 10);
    
    // Validate inputs
    if (!dateKey || isNaN(index) || index < 0) {
      console.error('Invalid sessionId format:', sessionId);
      return false;
    }
    
    // Check if session exists
    if (!AppData.trainingLog[dateKey] || !AppData.trainingLog[dateKey][index]) {
      console.error(`Session not found: ${sessionId}`);
      return false;
    }
    
    const session = AppData.trainingLog[dateKey][index];
    
    // Validate session type
    if (session.type === 'GYM' || !session.type) {
      console.warn('Cannot update GYM session with updateCardioSession');
      return false;
    }
    
    // Validate updates
    const validationErrors = [];
    
    if (sessionData.distance !== undefined) {
      if (typeof sessionData.distance !== 'number' || sessionData.distance < 0) {
        validationErrors.push('Invalid distance');
      }
    }
    
    if (sessionData.duration !== undefined) {
      if (typeof sessionData.duration !== 'number' || sessionData.duration <= 0) {
        validationErrors.push('Invalid duration');
      }
    }
    
    if (sessionData.rpe !== undefined) {
      if (sessionData.rpe < 1 || sessionData.rpe > 10) {
        validationErrors.push('RPE must be between 1 and 10');
      }
    }
    
    if (sessionData.avgHeartRate !== undefined) {
      if (typeof sessionData.avgHeartRate !== 'number' || sessionData.avgHeartRate < 30 || sessionData.avgHeartRate > 250) {
        validationErrors.push('Invalid heart rate');
      }
    }
    
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors.join(', '));
      return false;
    }
    
    // Apply updates - merge with existing session data
    const updatedSession = {
      ...session,
      ...sessionData,
      // Ensure required fields are preserved
      type: sessionData.type || session.type,
      date: sessionData.date || session.date,
      completed: sessionData.completed !== undefined ? sessionData.completed : (session.completed !== false)
    };
    
    // Auto-recalculate duration if start/end times changed
    if ((sessionData.startTime !== undefined || sessionData.endTime !== undefined) && updatedSession.endTime && updatedSession.startTime) {
      updatedSession.duration = (updatedSession.endTime - updatedSession.startTime) / 60000; // Convert to minutes
    }
    
    // Update session in log
    AppData.trainingLog[dateKey][index] = updatedSession;
    
    // Persist to storage
    await saveData();
    
    return true;
  } catch (error) {
    console.error('Error updating cardio session:', error);
    return false;
  }
}

/**
 * Delete a cardio session
 * @param {Date} date - Training date
 * @param {number} sessionIndex - Index of the session
 */
export async function deleteCardioSession(date, sessionIndex) {
  return await deleteSession(date, sessionIndex); // Reuse existing function
}

// ========== UTILITIES FOR CARDIO ==========

/**
 * Calculate pace and speed from distance and duration
 * @param {Object} session - Cardio session object
 * @returns {Object} { pace, paceDisplay, speed, speedDisplay }
 */
export function calculateCardioMetrics(session) {
  if (!session.distance || !session.duration || session.duration <= 0) {
    return {
      pace: null,
      paceDisplay: '--:--',
      speed: null,
      speedDisplay: '--.-- км/ч'
    };
  }

  const hours = session.duration / 3600000;
  const speed = session.distance / hours; // km/h
  const pace = 60 / speed; // min/km

  // Format pace: 6.73 → "06:44"
  const paceMinutes = Math.floor(pace);
  const paceSeconds = Math.round((pace - paceMinutes) * 60);
  const paceDisplay = `${paceMinutes.toString().padStart(2, '0')}:${paceSeconds.toString().padStart(2, '0')}`;

  return {
    pace: pace,                              // 6.73 (min/km)
    paceDisplay: paceDisplay,                // "06:44"
    speed: speed,                            // 8.9 (km/h)
    speedDisplay: `${speed.toFixed(1)} км/ч` // "8.9 км/ч"
  };
}

/**
 * Get all cardio sessions in a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string[]} [types] - Filter by types ['RUNNING', 'CYCLING', 'SWIMMING']
 * @returns {Array} Array of { date, session, sessionIndex }
 */
export function getCardioSessionsInRange(startDate, endDate, types = null) {
  const result = [];
  const startKey = formatDateKey(startDate);
  const endKey = formatDateKey(endDate);

  Object.entries(AppData.trainingLog).forEach(([dateKey, sessions]) => {
    if (dateKey < startKey || dateKey > endKey) return;

    sessions.forEach((session, sessionIndex) => {
      if (session.type === 'GYM') return;
      if (types && !types.includes(session.type)) return;
      
      result.push({
        date: dateKey,
        session: session,
        sessionIndex: sessionIndex
      });
    });
  });

  return result.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime() || 
    a.sessionIndex - b.sessionIndex
  );
}

/**
 * Get cardio statistics for a period
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string[]} [types] - Filter by types
 * @returns {Object} Statistics object
 */
export function getCardioStats(startDate, endDate, types = null) {
  const sessions = getCardioSessionsInRange(startDate, endDate, types);
  
  let totalDistance = 0;
  let totalDuration = 0;
  let totalElevation = 0;
  let totalSessions = sessions.length;
  let avgRpe = 0;
  let sessionCount = 0;

  const typeCounts = {
    RUNNING: 0,
    CYCLING: 0,
    SWIMMING: 0
  };

  sessions.forEach(({ session }) => {
    totalDistance += session.distance || 0;
    totalDuration += session.duration || 0;
    totalElevation += session.elevationGain || 0;
    
    if (session.rpe) {
      avgRpe += session.rpe;
      sessionCount++;
    }
    
    typeCounts[session.type] = (typeCounts[session.type] || 0) + 1;
  });

  avgRpe = sessionCount > 0 ? avgRpe / sessionCount : 0;

  return {
    totalSessions,
    typeCounts,
    totalDistance: parseFloat(totalDistance.toFixed(2)), // km
    totalDuration: parseFloat((totalDuration / 3600000).toFixed(2)), // hours
    totalElevation: totalElevation, // meters
    avgRpe: parseFloat(avgRpe.toFixed(1)),
    avgDistance: totalSessions > 0 ? parseFloat((totalDistance / totalSessions).toFixed(2)) : 0,
    avgDuration: totalSessions > 0 ? parseFloat(((totalDuration / totalSessions) / 60000).toFixed(1)) : 0 // min
  };
}

/**
 * Get best performances for a cardio type
 * @param {'RUNNING'|'CYCLING'|'SWIMMING'} type - Cardio type
 * @param {string} metric - 'speed', 'distance', or 'elevation'
 * @returns {Object} Best session with metadata
 */
export function getBestCardioPerformance(type, metric = 'speed') {
  let bestValue = 0;
  let bestSession = null;
  let bestDate = null;
  let bestIndex = -1;

  Object.entries(AppData.trainingLog).forEach(([dateKey, sessions]) => {
    sessions.forEach((session, index) => {
      if (session.type !== type || !session.completed) return;

      let value = 0;
      if (metric === 'speed' && session.distance && session.duration) {
        value = session.distance / (session.duration / 3600000); // km/h
      } else if (metric === 'distance') {
        value = session.distance || 0;
      } else if (metric === 'elevation') {
        value = session.elevationGain || 0;
      }

      if (value > bestValue) {
        bestValue = value;
        bestSession = session;
        bestDate = dateKey;
        bestIndex = index;
      }
    });
  });

  return {
    value: bestValue,
    session: bestSession,
    date: bestDate,
    sessionIndex: bestIndex
  };
}

/**
 * Get weekly cardio summary (last 7 days)
 * @returns {Object} Weekly summary
 */
export function getWeeklyCardioSummary() {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const stats = getCardioStats(sevenDaysAgo, today);
  
  // Get sessions from last 7 days
  const recentSessions = getCardioSessionsInRange(sevenDaysAgo, today);
  
  // Group by day
  const sessionsByDay = {};
  recentSessions.forEach(({ date, session }) => {
    if (!sessionsByDay[date]) sessionsByDay[date] = [];
    sessionsByDay[date].push(session);
  });

  return {
    ...stats,
    sessionsByDay,
    daysWithTraining: Object.keys(sessionsByDay).length
  };
}

// Add this to TrainingLogHelper.js
export const getCardioSession = (dayKey, index) => {
  try {
    // Validate inputs
    if (!dayKey || typeof dayKey !== 'string' || index === undefined || index < 0) {
      console.warn('Invalid parameters for getCardioSession:', { dayKey, index });
      return null;
    }

    // Check if day exists in training log
    if (!AppData.trainingLog[dayKey]) {
      console.warn(`No training sessions found for date: ${dayKey}`);
      return null;
    }

    // Check if index exists
    const sessions = AppData.trainingLog[dayKey];
    if (!sessions[index]) {
      console.warn(`Session not found at index ${index} for date ${dayKey}`);
      return null;
    }

    const session = sessions[index];
    
    // Return session data with consistent structure
    return {
      id: `${dayKey}_${index}`,
      date: dayKey,
      type: session.type || 'RUNNING',
      distance: session.distance || 0,
      duration: session.duration || 0, // in minutes
      elevationGain: session.elevationGain || 0,
      avgCadence: session.avgCadence || 0,
      avgHeartRate: session.avgHeartRate || 0,
      rpe: session.rpe || 0,
      notes: session.notes || '',
      startTime: session.startTime || (16 * 3600000), // default to 4 PM
      completed: session.completed !== false // cardio sessions are always completed when logged
    };
  } catch (error) {
    console.error('Error retrieving cardio session:', error);
    return null;
  }
};