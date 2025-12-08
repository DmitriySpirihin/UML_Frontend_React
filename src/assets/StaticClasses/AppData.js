import {Habit} from "../Classes/Habit";
import { THEME } from './Colors';
import { habitReminder } from '../Pages/NotifyPanel';
import {setTheme,setLang ,setSoundAndVibro,setNotify,setShowPopUpPanel,setFontSize} from '../StaticClasses/HabitsBus'
import { NotificationsManager } from "./NotificationsManager";
import { getAchievements } from "../Helpers/Achievements";
import { saveData } from "../StaticClasses/SaveHelper";
import {exercises,programs} from "../Classes/TrainingData";

export class AppData{
   static lastSave = new Date().toISOString();
   static isFirstStart = true;
   static prefs = [0,0,0,0,0]; //language, theme, sound, vibro,font size main 16,14 sub 14,12
   static notify = [{enabled:false,cron:'10 12 * * 1,2,3,4,5'},{enabled:false,cron:'10 12 * * 1,2,3,4,5'},{enabled:false,cron:'10 12 * * 1,2,3,4,5'}];
   //  habits 
   static CustomHabits = [];
   static choosenHabitsGoals = {};//{id:[{text:'',isDone:false}]}
   static choosenHabitsStartDates = [];
   static choosenHabitsLastSkip = {};
   static choosenHabits = []; // id array
   static choosenHabitsAchievements = {};
   static choosenHabitsNotified = {};
   static habitsByDate = {};// {'date':[habitId:status(integer)]}
   static choosenHabitsDaysToForm = [];
   static choosenHabitsTypes = [];
   

   // training log
   static currentProgramId = null;
   static exercises = exercises;
   static programs = programs;
   static trainingLog = [];
  // methods
  static init(data) {
    if (!data) return;
    this.lastSave = data.lastSave;
    this.isFirstStart = data.isFirstStart;
    if(this.isFirstStart === false)this.prefs = data.prefs;
    else this.isFirstStart = false;
    setLang(this.prefs[0] === 0 ? 'ru' : 'en');
    setTheme(this.prefs[1] < 2 ? this.prefs[1] === 0 ? THEME.DARK : THEME.SPECIALDARK : this.prefs[1] === 2 ? THEME.LIGHT : THEME.SPECIALLIGHT);
    setSoundAndVibro(this.prefs[2],this.prefs[3]);
    setFontSize(this.prefs[4]);
    this.choosenHabitsStartDates = [...data.choosenHabitsStartDates];
    this.choosenHabitsLastSkip = data.choosenHabitsLastSkip;
    this.choosenHabitsAchievements = data.choosenHabitsAchievements;
    this.choosenHabits = [...data.choosenHabits];
    this.choosenHabitsTypes = [...data.choosenHabitsTypes];
    this.choosenHabitsGoals = data.choosenHabitsGoals;
    this.choosenHabitsNotified = data.choosenHabitsNotified;
    this.choosenHabitsDaysToForm = data.choosenHabitsDaysToForm;
    this.CustomHabits = data.CustomHabits;
    this.habitsByDate = data.habitsByDate;
    this.notify = data.notify;
    setNotify(this.notify);

    this.currentProgramId = data.currentProgramId;
    if(data.exercises?.length > 0)this.exercises = data.exercises;
    if(data.programs?.length > 0)this.programs = data.programs;
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
  static async addHabit(habitId,dateString,goals,isNegative,daysToForm){
    const now = new Date();
    const habitDate = new Date(dateString);
    const isStartDateEarlier = Date.now() - new Date(dateString).getTime() > 86400000;
    if(!this.choosenHabits.includes(habitId)) {
       this.choosenHabits.push(habitId);
       this.choosenHabitsAchievements[habitId] = getAchievements(isNegative);
       this.choosenHabitsGoals[habitId] = goals || [];
       this.choosenHabitsStartDates.push(dateString);
       this.choosenHabitsNotified[habitId] = [false,false,false];
       this.choosenHabitsDaysToForm.push(daysToForm);
       this.choosenHabitsLastSkip[habitId] = isStartDateEarlier ? new Date(dateString).getTime()  : Date.now();
       this.choosenHabitsTypes.push(isNegative);
       habitReminder(this.prefs[0],this.notify[0].cron,0,0,false);
    }
    const startDate = new Date(dateString);
    const endDate = new Date();
    let currentDate = startDate;
    while (currentDate < endDate) {
    const current = currentDate.toISOString().split('T')[0];
    if(!(current in this.habitsByDate)) {
      this.habitsByDate[current] = {};
      this.habitsByDate[current][this.choosenHabits[this.choosenHabits.length - 1]] = getHabitPerformPercent(habitId) < 100 ? 1 : 2; 
     }
     else{
      this.habitsByDate[current][this.choosenHabits[this.choosenHabits.length - 1]] = getHabitPerformPercent(habitId) < 100 ? 1 : 2; 
     }
     currentDate.setDate(currentDate.getDate() + 1);
   }
   if(isNegative){
       if(getHabitPerformPercent(habitId) < 100)this.habitsByDate[endDate.toISOString().split('T')[0]][this.choosenHabits[this.choosenHabits.length - 1]] = isStartDateEarlier ? 1 : -1;
       else this.habitsByDate[endDate.toISOString().split('T')[0]][this.choosenHabits[this.choosenHabits.length - 1]] = 2;
   }
   else this.habitsByDate[endDate.toISOString().split('T')[0]][this.choosenHabits[this.choosenHabits.length - 1]] = getHabitPerformPercent(habitId) < 100 ? 0 : 2;
   await saveData();
  }
  static addHabitGoal(habitId,goal){
    this.choosenHabitsGoals[habitId].push(goal);
  }
  static async removeHabit(habitId){
    if(this.choosenHabits.includes(habitId)){
    const index = this.choosenHabits.indexOf(habitId);
    this.choosenHabits.splice(index,1);
    delete this.choosenHabitsAchievements[habitId];
    this.choosenHabitsDaysToForm.splice(index,1);
    delete this.choosenHabitsLastSkip[habitId];
    this.choosenHabitsTypes.splice(index,1);
    delete this.choosenHabitsGoals[habitId];
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
  await saveData();
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
      cat,
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
        const isNegative = AppData.choosenHabitsTypes[index]; 
        if(isNegative){
            if(new Date(AppData.choosenHabitsStartDates[index]).getTime() <= new Date(current).getTime()){
            const isStartDateEarlier = Date.now() - AppData.choosenHabitsLastSkip[AppData.choosenHabits[index]] > 86400000;
            AppData.habitsByDate[current][AppData.choosenHabits[index]] = getHabitPerformPercent(AppData.choosenHabits[index]) < 100 ? isStartDateEarlier ? 1 : -1 : 2; 
          }
        }
        else{
           if(new Date(AppData.choosenHabitsStartDates[index]).getTime() <= new Date(current).getTime()){
           AppData.habitsByDate[current][AppData.choosenHabits[index]] = getHabitPerformPercent(AppData.choosenHabits[index]) < 100 ? 1 : 2; 
           }
        }
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
   }
   
  }
   
 }
 const now = new Date().toISOString().split('T')[0];
 if(!(now in AppData.habitsByDate)){
   AppData.habitsByDate[now] = {};
   for (let index = 0; index < AppData.choosenHabits.length; index++) {
    const isNegative = AppData.choosenHabitsTypes[index]; 
     if(isNegative){
            if(new Date(AppData.choosenHabitsStartDates[index]).getTime() <= new Date(now).getTime()){
            const isStartDateEarlier = Date.now() - AppData.choosenHabitsLastSkip[AppData.choosenHabits[index]] > 86400000;
            AppData.habitsByDate[now][AppData.choosenHabits[index]] = getHabitPerformPercent(AppData.choosenHabits[index]) < 100 ? isStartDateEarlier ? 1 : -1 : 2; 
          }
        }
        else{
           if(new Date(AppData.choosenHabitsStartDates[index]).getTime() <= new Date(now).getTime()){
             AppData.habitsByDate[now][AppData.choosenHabits[index]] = getHabitPerformPercent(AppData.choosenHabits[index]) < 100 ? 0 : 2; 
           }
        }
   }
  }
}


export class UserData {
   static id = null;
   static name = 'guest';
   static photo = null;
   static hasPremium = false;
   static premiumEndDate = new Date();


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
    this.prefs = AppData.prefs,
    this.choosenHabits = AppData.choosenHabits,
    this.choosenHabitsTypes = AppData.choosenHabitsTypes,
    this.habitsByDate = AppData.habitsByDate,
    this.choosenHabitsAchievements = AppData.choosenHabitsAchievements,
    this.choosenHabitsLastSkip = AppData.choosenHabitsLastSkip,
    this.choosenHabitsStartDates = AppData.choosenHabitsStartDates,
    this.choosenHabitsNotified = AppData.choosenHabitsNotified,
    this.choosenHabitsGoals = AppData.choosenHabitsGoals,
    this.CustomHabits = AppData.CustomHabits,
    this.choosenHabitsDaysToForm = AppData.choosenHabitsDaysToForm,
    this.notify = AppData.notify,
    this.currentProgramId = AppData.currentProgramId,
    this.exercises = AppData.exercises,
    this.programs = AppData.programs,
    this.trainingLog = AppData.trainingLog
  }
}

export function getHabitPerformPercent(habitId){
  const habits = Array.from(Object.values(AppData.habitsByDate));
  const today = new Date().toISOString().split('T')[0];
  const isNegative = AppData.choosenHabitsTypes[AppData.choosenHabits.indexOf(habitId)];
  let currentStreak = 0;
  for(let i = habits.length - 2; i >= 0; i--){
      if(habitId in habits[i]){
        if(habits[i][habitId] > 0)currentStreak ++;
          else break;
    }
  }
  if(today in AppData.habitsByDate){
     if(AppData.habitsByDate[today][habitId] > 0)currentStreak ++;
     if(isNegative && AppData.habitsByDate[today][habitId] < 0) currentStreak = 0;
  }
  
  return Math.ceil(currentStreak / AppData.choosenHabitsDaysToForm[AppData.choosenHabits.indexOf(habitId)] * 100) ;
}