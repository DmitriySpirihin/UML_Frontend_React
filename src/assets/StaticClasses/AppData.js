import {Habit} from "../Classes/Habit";

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
    this.isFirstStart = data.isFirstStart || true;
    this.version = data.version || "1.0.0";
    if(!this.isFirstStart)this.prefs = data.prefs || [0, 0, 0, 0];
    else this.isFirstStart = false;
    this.dayTostart = data.dayTostart || '';
    this.choosenHabits = Array.isArray(data.choosenHabits) ? [...data.choosenHabits] : [];
    this.daysToFormAHabit = data.daysToFormAHabit || 66;
    
    // Recreate Habit instances from the serialized data
    this.CustomHabits = data.CustomHabits || [];
    /*
    if (Array.isArray(data.CustomHabits)) {
      data.CustomHabits.forEach(habitData => {
        if (habitData) {
          this.CustomHabits.push(new Habit(
            habitData.name || ["", ""],
            habitData.category || ["", ""],
            habitData.description || ["", ""],
            habitData.id || 0,
            habitData.isCustom !== undefined ? habitData.isCustom : true,
            habitData.src || ''
          ));
        }
      });
    }*/
    
    // Reconstruct the habitsByDate object
    this.habitsByDate = data.habitsByDate || {};
    /*
    if (Array.isArray(data.habitsByDate)) {
      data.habitsByDate.forEach(([date, habits]) => {
        if (date && habits && typeof habits === 'object') {
          this.habitsByDate[date] = { ...habits };
        }
      });
    } else if (data.habitsByDate && typeof data.habitsByDate === 'object') {
      Object.entries(data.habitsByDate).forEach(([date, habits]) => {
        if (habits && typeof habits === 'object') {
          this.habitsByDate[date] = { ...habits };
        }
      });
    }
    */
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
   static name = 'guest';
   static photo = null;

   static Init(name,photo){
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