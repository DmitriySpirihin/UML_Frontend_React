import {Habit} from "../Classes/Habit";
const now = new Date();
const dateKey = now.toISOString().split('T')[0];
const esterDay = new Date(now);
esterDay.setDate(now.getDate() - 1);

export class AppData{
   static version = "1.0.0";
   static prefs = [0,0,0,0]; //language, theme, sound, vibro
   static CustomHabits = [];
   static dayTostart = "";

   static choosenHabits = [0,1,4,6,12,16,22];
   static habitsByDate = {
   [esterDay.toISOString().split('T')[0]] : {0:0},
   [dateKey]:{0:0,1:0,4:0,6:-1,12:1,16:1,22:0}
  };

  // methods
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
      this.habitsByDate[day] = {habitId:0};
      console.log(JSON.stringify(this.habitsByDate));
    }
  }
  static removeHabit(day,habitId){
    this.choosenHabits.includes(habitId) ? this.choosenHabits.splice(this.choosenHabits.indexOf(habitId),1) : null;
    if(day in this.habitsByDate){
      delete this.habitsByDate[day][habitId];
      console.log(JSON.stringify(this.habitsByDate));
    }
  }
  static changeStatus(day,habitId,status){
    if(day in this.habitsByDate){
      this.habitsByDate[day][habitId] = status;
    }
  }
  static AddCustomHabit(n,cat,desc,src,id){
    const description = desc === "" ? ["Своя привычка","My custom habit"] : [desc,desc];
    this.CustomHabits.push(new Habit([n,n],[cat,cat],description,id,true,src === '' ? '../../Art/HabitsIcons/Default.png' : src));
  }
  static IsCustomHabitExists(habitId){
    return this.CustomHabits.some(habit => habit.Id() === habitId);
  }
  static IsHabitInChoosenList(habitId){
    return this.choosenHabits.includes(habitId);
  }
}

