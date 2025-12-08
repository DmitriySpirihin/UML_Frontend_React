









/* training log structure
{
  "2025-12-08": { 
    programId: 0,                                 when set also i need to update current programm id in AppData
    dayIndex: 1,                                  on the start if the currentProgrammId is equal this id increment or set 1
    status: "completed" or 'inProcess'            check on app start
    startTime: "2025-12-08T18:22:15.432Z",        when start new training
    endTime: "2025-12-08T19:08:47.109Z",          fixed when finish training
    duration: 2700000,                            in milliseconds  45 min is 2700000 ms
    tonnage: 2840,                                add when finish set , per set
    exercises: {
      '34' {                                        list of the complited exercises , id as a key
        mgId: 0,                                  to get muscle group id fast
        sets: [
          { type: 0, reps: 15, weight: 40 },   types : o - warm up , 1 - work
          { type: 1, reps: 10, weight: 60 },
        ]
        totalTonnage: 100,                         calculate when finish exercise
        'complited':true                             if finished
      },                                             next  exercise
    }
  }
}
*/