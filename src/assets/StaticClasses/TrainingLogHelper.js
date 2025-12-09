







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
          weight: set.weight
        };
      }
    }
  }

  return bestMatch; // null if none found
}

/* training log structure
{
  "2025-12-08": [{ 
    programId: 0,                                 //when set also i need to update current programm id in AppData
    dayIndex: 1,                                  //on the start if the currentProgrammId is equal this id increment or set 1
    complited: true,                              //check on app start
    startTime: "2025-12-08T18:22:15.432Z",        //when start new training
    endTime: "2025-12-08T19:08:47.109Z",          //fixed when finish training
    duration: 2700000,                            //in milliseconds  45 min is 2700000 ms
    tonnage: 100,                                //add when finish set , per set
    exercises: {
      '0' {                                      //  list of the complited exercises , id as a key
        mgId: 0,                                  //to get muscle group id fast
        sets: [
          { type: 0, reps: 15, weight: 40 },   //types : o - warm up , 1 - work
          { type: 1, reps: 10, weight: 60 },
        ]
        totalTonnage: 100,                         //calculate when finish exercise
        'complited':true                             //if finished
      },                                            // next  exercise
    }
   },     next training
  ],       next day
}
*/