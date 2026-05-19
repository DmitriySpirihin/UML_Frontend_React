import { addSleepSessionToLog } from '../../StaticClasses/SleepLogHelper';
/*
 sleepingLog = {
    '2026-01-02':{
        bedtime:ms,
        duration:ms,
        mood:5,  // 1-5
        note:''
    }
}
*/

export const addDayToSleepingLog = (dateString, duration, bedTime, mood, note, sleepType = 'night') => {
  addSleepSessionToLog(dateString, {
    bedtime: bedTime,
    duration: duration,
    mood: mood,
    note: note ?? '',
    type: sleepType === 'day' ? 'day' : 'night'
  });
};
