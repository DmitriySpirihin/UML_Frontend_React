import {Habit} from "../Classes/Habit";
import { THEME } from './Colors';
import {setTheme,setLang ,setSoundAndVibro} from '../StaticClasses/HabitsBus'

export class AppData{
   static isFirstStart = true;
   static version = "1.0.0";
   static prefs = [0,0,0,0]; //language, theme, sound, vibro
   static CustomHabits = [];
   static dayTostart = '';

   static choosenHabits = [];
   static habitsByDate = {};
   static daysToFormAHabit = 66;
  // methods
  static init(data) {
    if (!data) return;
    this.isFirstStart = data.isFirstStart;
    this.version = data.version;
    if(this.isFirstStart === false)this.prefs = data.prefs;
    else this.isFirstStart = false;
    setLang(this.prefs[0] === 0 ? 'ru' : 'en');
    setTheme(this.prefs[1] < 2 ? this.prefs[1] === 0 ? THEME.DARK : THEME.SPECIALDARK : this.prefs[1] === 2 ? THEME.LIGHT : THEME.SPECIALLIGHT);
    setSoundAndVibro(this.prefs[2],this.prefs[3]);
    this.dayTostart = data.dayTostart;
    this.choosenHabits = [...data.choosenHabits];
    this.daysToFormAHabit = data.daysToFormAHabit;
    this.CustomHabits = data.CustomHabits;
    this.habitsByDate = data.habitsByDate;
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
  static addHabit(day,habitId){
    if(!this.choosenHabits.includes(habitId)) this.choosenHabits.push(habitId);
    if(!(day in this.habitsByDate)){
      this.habitsByDate[day] = {};
    }
    if(!(habitId in this.habitsByDate[day])){
      this.habitsByDate[day][habitId] = 0;
    }
    if(this.dayTostart === '') this.dayTostart = day;
    console.log(JSON.stringify(this.habitsByDate));
  }
  static removeHabit(day,habitId){
    this.choosenHabits.includes(habitId) ? this.choosenHabits.splice(this.choosenHabits.indexOf(habitId),1) : null;
    Array.from(Object.values(this.habitsByDate)).forEach(habit => {
      if(habitId in habit){
        delete habit[habitId];
      }
      if(this.choosenHabits.length === 0){
        this.habitsByDate = {};
        this.dayTostart = '';
      }
    });
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
    const newHabit = new Habit(
      [n, n],
      [cat, cat],
      description,
      id,
      true,
      src === '' ? '../../Art/HabitsIcons/Default.png' : src
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
  if(AppData.dayTostart !== ''){
   if(AppData.dayTostart !== today.toISOString().split('T')[0]){
   const startDate = new Date(AppData.dayTostart);
   const endDate = today.setDate(today.getDate() - 1);
   let currentDate = startDate;
   while (currentDate < endDate) {
    if(!(currentDate.toISOString().split('T')[0] in AppData.habitsByDate)) {
      AppData.habitsByDate[currentDate.toISOString().split('T')[0]] = {};
      for (let index = 0; index < AppData.choosenHabits.length; index++) {
        AppData.habitsByDate[currentDate.toISOString().split('T')[0]][AppData.choosenHabits[index]] = -1; 
      }
    }else{
      for (let index = 0; index < AppData.choosenHabits.length; index++) {
        if(AppData.habitsByDate[currentDate.toISOString().split('T')[0]][AppData.choosenHabits[index]] < 1)AppData.habitsByDate[currentDate.toISOString().split('T')[0]][AppData.choosenHabits[index]] = -1; 
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
   }
   }

   if(!AppData.hasKey(today.toISOString().split('T')[0])){
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
    this.isFirstStart = AppData.isFirstStart,
    this.version = AppData.version,
    this.prefs = AppData.prefs,
    this.choosenHabits = AppData.choosenHabits,
    this.habitsByDate = AppData.habitsByDate,
    this.dayTostart = AppData.dayTostart,
    this.CustomHabits = AppData.CustomHabits,
    this.daysToFormAHabit = AppData.daysToFormAHabit
  }
}