import {Habit} from "../Classes/Habit";
import { THEME } from './Colors';
import {setTheme,setLang ,setSoundAndVibro,setNotify} from '../StaticClasses/HabitsBus'

export class AppData{
   static lastSave = new Date().toISOString();
   static isFirstStart = true;
   static version = "1.0.0";
   static prefs = [0,0,0,0]; //language, theme, sound, vibro
   static CustomHabits = [];
   static choosenHabitsStartDates = [];
   static choosenHabits = [];
   static habitsByDate = {};
   static daysToFormAHabit = 66;
   static notify = [{enabled:false,cron:'10 12 * * 1,2,3,4,5'},{enabled:false,cron:'10 12 * * 1,2,3,4,5'},{enabled:false,cron:'10 12 * * 1,2,3,4,5'}];

   // training log
   static currentProgram = null;
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
    this.daysToFormAHabit = data.daysToFormAHabit;
    this.CustomHabits = data.CustomHabits;
    this.habitsByDate = data.habitsByDate;
    this.notify = data.notify;
    setNotify(this.notify);
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
  static addHabit(habitId,dateString){
    if(!this.choosenHabits.includes(habitId)) {
       this.choosenHabits.push(habitId);
       this.choosenHabitsStartDates.push(dateString);
    }
  const dayTostart = dateString;
  const startDate = new Date(dayTostart);
  const endDate = new Date();
  let currentDate = startDate;
   while (currentDate < endDate) {
    const current = currentDate.toISOString().split('T')[0];
    if(!(current in AppData.habitsByDate)) {
      AppData.habitsByDate[current] = {};
      AppData.habitsByDate[current][AppData.choosenHabits[AppData.choosenHabits.length - 1]] = 1; 
    }
    else{
      AppData.habitsByDate[current][AppData.choosenHabits[AppData.choosenHabits.length - 1]] = 1; 
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  AppData.habitsByDate[endDate.toISOString().split('T')[0]][AppData.choosenHabits[AppData.choosenHabits.length - 1]] = 0;
}

  static removeHabit(habitId){
    if(this.choosenHabits.includes(habitId)){
    const index = this.choosenHabits.indexOf(habitId);
    this.choosenHabits.splice(index,1);
    this.choosenHabitsStartDates.splice(index,1);
    Array.from(Object.values(this.habitsByDate)).forEach(habit => {
      if(habitId in habit){
        delete habit[habitId];
      }
      if(this.choosenHabits.length === 0){
        this.habitsByDate = {};
      }
    });
  }
}
  static changeStatus(day, habitId, status) {
    // Create day entry if it doesn't exist
    if (!(day in this.habitsByDate)) {
      this.habitsByDate[day] = {};
    }
    // Update the status for the habit
    this.habitsByDate[day][habitId] = status;
    console.log('Updated habitsByDate:', JSON.stringify(this.habitsByDate));
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
        AppData.habitsByDate[current][AppData.choosenHabits[index]] = -1; 
      }
    }else{
      for (let index = 0; index < AppData.choosenHabits.length; index++) {
        if(new Date(AppData.choosenHabitsStartDates[index]).getTime() <= new Date(current).getTime())
        if(AppData.habitsByDate[current][AppData.choosenHabits[index]] < 1)AppData.habitsByDate[current][AppData.choosenHabits[index]] = -1; 
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
   }
   }
   
   if(!(today.toISOString().split('T')[0] in AppData.habitsByDate)){
   AppData.habitsByDate[today.toISOString().split('T')[0]] = {};
   for (let index = 0; index < AppData.choosenHabits.length; index++) {
     AppData.habitsByDate[today.toISOString().split('T')[0]][AppData.choosenHabits[index]] = 0; 
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
    this.CustomHabits = AppData.CustomHabits,
    this.daysToFormAHabit = AppData.daysToFormAHabit,
    this.notify = AppData.notify
  }
}