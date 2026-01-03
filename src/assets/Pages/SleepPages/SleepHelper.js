import { AppData } from "../../StaticClasses/AppData";
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

export const addDayToSleepingLog = (dateString, duration, bedTime, mood, note) => {
  const entry = {
    bedtime: bedTime,
    duration: duration,
    mood: mood,
    note: note ?? ''
  };

  // This will add a new entry or replace an existing one for the same dateString
  AppData.sleepingLog = {
    ...AppData.sleepingLog,
    [dateString]: entry
  };
};