import {Habit} from "../Classes/Habit";
import { THEME } from './Colors';
import { habitReminder } from '../Pages/NotifyPanel';
import {setTheme,setLang ,setSoundAndVibro,setNotify,setShowPopUpPanel} from '../StaticClasses/HabitsBus'
import { NotificationsManager } from "./NotificationsManager";

export class AppData{
   static lastSave = new Date().toISOString();
   static isFirstStart = true;
   static version = "1.0.0";
   static prefs = [0,0,0,0]; //language, theme, sound, vibro
   static CustomHabits = [];
   static ChoosenHabitsGoals = {};//{id:[{text:'',isDone:false}]}
   static choosenHabitsStartDates = [];
   static choosenHabits = [];
   static choosenHabitsNotified = {};
   static habitsByDate = {};
   static daysToFormAHabit = 66;
   static notify = [{enabled:false,cron:'10 12 * * 1,2,3,4,5'},{enabled:false,cron:'10 12 * * 1,2,3,4,5'},{enabled:false,cron:'10 12 * * 1,2,3,4,5'}];

   // training log
   static currentProgramId = null;
   static exercises = [];
   static programs = [];
   static trainingLog = [];
  // methods
  static init(data) {
    if (!data) return;
    this.lastSave = data.lastSave;
    this.isFirstStart = data.isFirstStart;
    this.version = data.version;
    if(this.isFirstStart === false)this.prefs = data.prefs;
    else this.isFirstStart = false;
    setLang(this.prefs[0] === 0 ? 'ru' : 'en');
    setTheme(this.prefs[1] < 2 ? this.prefs[1] === 0 ? THEME.DARK : THEME.SPECIALDARK : this.prefs[1] === 2 ? THEME.LIGHT : THEME.SPECIALLIGHT);
    setSoundAndVibro(this.prefs[2],this.prefs[3]);
    this.choosenHabitsStartDates = [...data.choosenHabitsStartDates];
    this.choosenHabits = [...data.choosenHabits];
    this.ChoosenHabitsGoals = data.ChoosenHabitsGoals;
    this.choosenHabitsNotified = data.choosenHabitsNotified;
    this.daysToFormAHabit = data.daysToFormAHabit;
    this.CustomHabits = data.CustomHabits;
    this.habitsByDate = data.habitsByDate;
    this.notify = data.notify;
    setNotify(this.notify);

    this.currentProgramId = data.currentProgramId;
    this.exercises = data.exercises;
    this.programs = data.programs;
    this.trainingLog = data.trainingLog;
  }
  static setPrefs(ind,value){
    this.prefs[ind] = value;
  }
  static hasKey(key) {
    return Object.prototype.hasOwnProperty.call(this.habitsByDate, key);
  }
  static isDayContainsHabit(day,habitId) {
     if(day in this.habitsByDate){
        return habitId in this.habitsByDate[day];
     }
     return false;
  } 
  static addHabit(habitId,dateString,goals){
    if(!this.choosenHabits.includes(habitId)) {
       this.choosenHabits.push(habitId);
       this.ChoosenHabitsGoals[habitId] = goals;
       this.choosenHabitsStartDates.push(dateString);
       this.choosenHabitsNotified[habitId] = [false,false,false];
       habitReminder(this.prefs[0],this.notify[0].cron,0,0,false);
    }
  const startDate = new Date(dateString);
  const endDate = new Date();
  let currentDate = startDate;
   while (currentDate < endDate) {
    const current = currentDate.toISOString().split('T')[0];
    if(!(current in AppData.habitsByDate)) {
      AppData.habitsByDate[current] = {};
      AppData.habitsByDate[current][AppData.choosenHabits[AppData.choosenHabits.length - 1]] = getHabitPerformPercent(habitId) < 100 ? 1 : 2; 
    }
    else{
      AppData.habitsByDate[current][AppData.choosenHabits[AppData.choosenHabits.length - 1]] = getHabitPerformPercent(habitId) < 100 ? 1 : 2; 
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  AppData.habitsByDate[endDate.toISOString().split('T')[0]][AppData.choosenHabits[AppData.choosenHabits.length - 1]] = getHabitPerformPercent(habitId) < 100 ? 0 : 2;
  }
  static addHabitGoal(habitId,goal){
    this.ChoosenHabitsGoals[habitId].push(goal);
  }
  static removeHabit(habitId){
    if(this.choosenHabits.includes(habitId)){
    const index = this.choosenHabits.indexOf(habitId);
    this.choosenHabits.splice(index,1);
    delete this.ChoosenHabitsGoals[habitId];
    this.choosenHabitsStartDates.splice(index,1);
    delete this.choosenHabitsNotified[habitId];
    Object.entries(this.habitsByDate).forEach(([date, habit]) => {
    if (habitId in habit) {
      delete habit[habitId];
      if (Object.keys(habit).length === 0) {
        delete this.habitsByDate[date];
      }
    }
   });
  }
  if(this.choosenHabits.length === 0){
    this.habitsByDate = {};
    NotificationsManager.sendMessage("habitoff", UserData.id);
  }else  habitReminder(this.prefs[0],this.notify[0].cron,0,0,false);
  }
  static changeStatus(day, habitId, status) {
    this.habitsByDate[day][habitId] = status;
    const percent = getHabitPerformPercent(habitId);
    if (percent > 99 && !this.choosenHabitsNotified[habitId][0]) {
     setShowPopUpPanel(this.prefs[0] === 0
      ? "🎉 Отлично! Новая привычка создана — ваш путь к успешным изменениям начинается! 🚀"
      : "🎉 Awesome! Your new habit is set — your journey to positive change begins now! 🚀",3000,true);
    this.choosenHabitsNotified[habitId][0] = true;
    } else if (percent > 27 && percent < 33 && !this.choosenHabitsNotified[habitId][1]) {
     setShowPopUpPanel(this.prefs[0] === 0
      ? "✨ Первый шаг сделан! Продолжайте, вы на верном пути! 💪"
      : "✨ First step done! Keep going, you’re on the right track! 💪",2500,true);
    this.choosenHabitsNotified[habitId][1] = true;
    } else if (percent > 47 && percent < 53 && !this.choosenHabitsNotified[habitId][2]) {
     setShowPopUpPanel(this.prefs[0] === 0
      ? "🌱 Полпути пройдено — не сдавайтесь, привычка становится частью вас! 🤩"
      : "🌱 Halfway there — don’t give up, your habit is taking root! 🤩",2500,true);
    this.choosenHabitsNotified[habitId][2] = true;
    }
  }
  static AddCustomHabit(n, cat, desc, src, id) {
    const description = desc === "" ? ["Своя привычка", "My custom habit"] : [desc, desc];
    const iconName = src === '' ? 'default' : src;
    const newHabit = new Habit(
      [n, n],
      [cat, cat],
      description,
      id,
      true,
      iconName
    );
    this.CustomHabits.push(newHabit);
    return newHabit;
  }
  static IsCustomHabitExists(habitId){
    return this.CustomHabits.some(habit => habit.id === habitId);
  }
  static IsHabitInChoosenList(habitId){
    return this.choosenHabits.includes(habitId);
  }
}

export const fillEmptyDays = () => {
  const today = new Date();
  const dayTostart = AppData.choosenHabitsStartDates.length === 0 ? '' : new Date(Math.min(...AppData.choosenHabitsStartDates.map(date => new Date(date).getTime()))).toISOString().split('T')[0];
  if(dayTostart !== '' && dayTostart !== today.toISOString().split('T')[0]){
   if(dayTostart !== today.toISOString().split('T')[0]){
   const startDate = new Date(dayTostart);
   const endDate = today.setDate(today.getDate() - 1);
   let currentDate = startDate;
   while (currentDate < endDate) {
    const current = currentDate.toISOString().split('T')[0];
    if(!(current in AppData.habitsByDate)) {
      AppData.habitsByDate[current] = {};
      for (let index = 0; index < AppData.choosenHabits.length; index++) {
        if(new Date(AppData.choosenHabitsStartDates[index]).getTime() <= new Date(current).getTime())
        AppData.habitsByDate[current][AppData.choosenHabits[index]] = getHabitPerformPercent(AppData.choosenHabits[index]) < 100 ? -1 : 2; 
      }
    }else{
      for (let index = 0; index < AppData.choosenHabits.length; index++) {
        if(new Date(AppData.choosenHabitsStartDates[index]).getTime() <= new Date(current).getTime())
        if(AppData.habitsByDate[current][AppData.choosenHabits[index]] < 1)AppData.habitsByDate[current][AppData.choosenHabits[index]] = getHabitPerformPercent(AppData.choosenHabits[index]) < 100 ? -1 : 2; 
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
   }
   }
   
   if(!(today.toISOString().split('T')[0] in AppData.habitsByDate)){
   AppData.habitsByDate[today.toISOString().split('T')[0]] = {};
   for (let index = 0; index < AppData.choosenHabits.length; index++) {
     AppData.habitsByDate[today.toISOString().split('T')[0]][AppData.choosenHabits[index]] = getHabitPerformPercent(AppData.choosenHabits[index]) < 100 ? 0 : 2; 
   }
  }
 }
}


export class UserData {
   static id = null;
   static name = 'guest';
   static photo = null;

   static Init(id,name,photo){
      this.id = id;
      this.name = name;
      this.photo = photo;
   }
}

export class Data{
  constructor(){
    this.lastSave = new Date().toISOString();
    this.isFirstStart = AppData.isFirstStart,
    this.version = AppData.version,
    this.prefs = AppData.prefs,
    this.choosenHabits = AppData.choosenHabits,
    this.habitsByDate = AppData.habitsByDate,
    this.choosenHabitsStartDates = AppData.choosenHabitsStartDates,
    this.choosenHabitsNotified = AppData.choosenHabitsNotified,
    this.ChoosenHabitsGoals = AppData.ChoosenHabitsGoals,
    this.CustomHabits = AppData.CustomHabits,
    this.daysToFormAHabit = AppData.daysToFormAHabit,
    this.notify = AppData.notify,
    this.currentProgramId = AppData.currentProgramId,
    this.exercises = AppData.exercises,
    this.programs = AppData.programs,
    this.trainingLog = AppData.trainingLog
  }
}

export function getHabitPerformPercent(habitId){
  const habits = Array.from(Object.values(AppData.habitsByDate));
  let currentStreak = 0;
  for(let i = habits.length - 2; i >= 0; i--){
      if(habitId in habits[i]){
        if(habits[i][habitId] > 0)currentStreak ++;
          else break;
    }
  }
  if(habitId in habits[habits.length - 1]){
    if(habits[habits.length - 1][habitId] > 0)currentStreak ++;
  }
  return Math.ceil(currentStreak / AppData.daysToFormAHabit * 100) ;
}