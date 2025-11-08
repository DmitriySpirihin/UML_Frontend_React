import {Habit} from "../Classes/Habit";

export class AppData{
   static version = "1.0.0";
   static prefs = [0,0,0,0]; //language, theme, sound, vibro
   static CustomHabits = [];
   static dayTostart = '';

   static choosenHabits = [];
   static habitsByDate = {};

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

export const fillEmptyDays = () => {
   const startDate = new Date(AppData.dayTostart)
   const endDate = new Date();
   let currentDate = new Date(startDate);
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
  
   AppData.habitsByDate[endDate.toISOString().split('T')[0]] = {};
   for (let index = 0; index < AppData.choosenHabits.length; index++) {
     AppData.habitsByDate[endDate.toISOString().split('T')[0]][AppData.choosenHabits[index]] = 0; 
   }
}

class SaveData{
   constructor(){
      this.data = {
         prefs: AppData.prefs,
         choosenHabits: AppData.choosenHabits,
         habitsByDate: AppData.habitsByDate,
         dayTostart: AppData.dayTostart,
         CustomHabits: AppData.CustomHabits
      }
   }
}


// in AppData.js
function serialize() {
  return {
    version: this.version,
    prefs: this.prefs,
    dayTostart: this.dayTostart,
    choosenHabits: this.choosenHabits,
    habitsByDate: this.habitsByDate,
    CustomHabits: this.CustomHabits.map(h => ({
      id: h.Id(),
      isCustom: h.IsCustom(),
      name: h.Name(),
      category: h.Category(),
      description: h.Description(),
      src: h.Src(),
    })),
  };
}

function deserialize(data) {
  if (!data || typeof data !== 'object') return;

  this.version = data.version ?? this.version;
  this.prefs = Array.isArray(data.prefs) ? data.prefs : this.prefs;
  this.dayTostart = data.dayTostart ?? '';
  this.choosenHabits = Array.isArray(data.choosenHabits) ? data.choosenHabits : [];
  this.habitsByDate = data.habitsByDate && typeof data.habitsByDate === 'object' ? data.habitsByDate : {};

  this.CustomHabits = Array.isArray(data.CustomHabits)
    ? data.CustomHabits.map(h =>
        new Habit(h.name, h.category, h.description, h.id, h.isCustom, h.src)
      )
    : [];
}
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAppData(AppData) {
  const db = await openDB();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).put(AppData.serialize(), KEY);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function loadAppData(AppData) {
  const db = await openDB();
  const tx = db.transaction(STORE, 'readonly');
  const req = tx.objectStore(STORE).get(KEY);
  const data = await new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  if (data) AppData.deserialize(data);
}