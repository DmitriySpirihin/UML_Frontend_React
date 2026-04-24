import {Habit} from "../Classes/Habit";
import { THEME } from './Colors';
import { habitReminder } from '../Pages/NotifyPanel';
import {setTheme,setLang ,setSoundAndVibro,setNotify,setShowPopUpPanel,setFontSize} from '../StaticClasses/HabitsBus'
import { NotificationsManager } from "./NotificationsManager";
import { getAchievements } from "../Helpers/Achievements";
import { saveData } from "../StaticClasses/SaveHelper";
import {exercises,programs} from "../Classes/TrainingData";

const DEFAULT_PREFS = [1,0,1,0,0];
const DEFAULT_HABIT_CATEGORIES = [
  { key: 'health', icon: 'heart', label: ['Здоровье', 'Health'], isNegative: false },
  { key: 'growth', icon: 'book', label: ['Развитие', 'Growth'], isNegative: false },
  { key: 'productivity', icon: 'chart', label: ['Продуктивность', 'Productivity'], isNegative: false },
  { key: 'relationships', icon: 'people', label: ['Отношения и отдых', 'Relationships & recreation'], isNegative: false },
  { key: 'bad_habits', icon: 'ban', label: ['Отказ от вредного', 'Bad habits to quit'], isNegative: true }
];

export class AppData{
   static insightData = '';
   // Format: { [category]: { text: "...", date: "2023-10-27" } }
   static insightCache = {};
   static lastSave = new Date().toISOString();
   static isFirstStart = true;
   static prefs = [...DEFAULT_PREFS]; // language, theme, sound, vibro, font size
   static notify = [{enabled:false,cron:'10 12 * * 1,2,3,4,5'},{enabled:false,cron:'10 12 * * 1,2,3,4,5'},{enabled:false,cron:'10 12 * * 1,2,3,4,5'}];
   //  habits
   static habitCustomCategories = []; // [{icon, label:[ru,en]}]
   static habitCategoryOverrides = {};
   static deletedDefaultHabitCategories = [];
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
   static lastBackupDate = '';
   // training log
   static currentProgramId = null;
   static exercises = exercises;
   static programs = programs;
   static trainingLog = {};
   static pData = {filled:false,age:20,gender:0,height:180,wrist:20,goal:1};
   static measurements = [[],[],[],[],[]];// [[{ date: newDateStr, value: val }],[],[],[],[]]
  static ownPlates = [true,true,true,true,true,true,true,true];
  static platesAmount = [10,10,10,10,10,10,10,10];
  static barWeight = 20;
  // practices
  static recoveryProtocols = [[[[false,false,false],[false,false],[false,false],[false,false]],[[false,false],[false,false],[false,false],[false,false,false,false]],[[false,false,false],[false,false],[false,false],[false,false]],[[false,false],[false,false,false],[false,false]]],//breathing
  [[[false,false,false],[false,false]],[[false,false],[false,false]],[[false,false],[false,false]],[[false,false],[false,false]]],
  [[[false,false,false],[false,false,false]],[[false,false,false],[false,false,false]],[[false,false,false],[false,false,false]],[[false,false,false],[false,false,false]]]];
  static breathingLog = {};
  static meditationLog = {};
  static hardeningLog = {};
  //mental
  static mentalLog = {};
  static mentalRecords = [[0,0,0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
  //
  static sleepingLog = {};
  static todoList = [];
  static todoCustomCategories = []; // [{icon, label:[ru,en]}]
  static sectionVisits = { habits: [], todo: [], mental: [], recovery: [], training: [], sleep: [] };
  static menuCardsStates =
{
  "MainCard": {
    "pinned": false,
    "hidden": false
  },
  "HabitsMain": {
    "pinned": false,
    "hidden": false
  },
  "TrainingMain": {
    "pinned": false,
    "hidden": false
  },
  "MentalMain": {
    "pinned": false,
    "hidden": false
  },
  "RecoveryMain": {
    "pinned": false,
    "hidden": false
  },
  "SleepMain": {
    "pinned": false,
    "hidden": false
  },
  "ToDoMain": {
    "pinned": false,
    "hidden": false
  }
};
  static infoMiniPanel = {
  "MainCard": true,
  "HabitsMain": true,
  "TrainingMain": true,
  "MentalMain": true,
  "RecoveryMain": true,
  "SleepMain": true,
  "ToDoMain": true
};
static habitCardWidgets = {
  days: true,
  skips: true,
  streak: true,
  timer: true,
  description: true,
  goals: true,
  achievements: true
};
  // methods
  static init(data) {
    if (!data) return;
    //console.log(JSON.stringify(data));  //log for tests
    this.lastSave = data.lastSave;
    this.isFirstStart = data.isFirstStart;
    if (this.isFirstStart === false) {
      this.prefs = Array.isArray(data.prefs)
        ? DEFAULT_PREFS.map((defaultValue, index) => data.prefs[index] ?? defaultValue)
        : [...DEFAULT_PREFS];
    }
    else this.isFirstStart = false;
    setLang(this.prefs[0] === 0 ? 'ru' : 'en');
    setTheme(this.prefs[1]  === 0 ? THEME.DARK : THEME.LIGHT );
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
    this.pData = data.pData;
    this.lastBackupDate = data.lastBackupDate;
    this.measurements = data.measurements;
    if (data.exercises && typeof data.exercises === 'object' && !Array.isArray(data.exercises)) this.exercises = data.exercises;
    if (data.programs && typeof data.programs === 'object' && !Array.isArray(data.programs)) this.programs = data.programs;
    if(data.ownPlates?.length > 0)this.ownPlates = data.ownPlates;
    if(data.platesAmount?.length > 0)this.platesAmount = data.platesAmount;
    this.barWeight = data.barWeight;
    this.trainingLog = data.trainingLog;
    if(data.recoveryProtocols[0][1].length > 2){
      this.recoveryProtocols = data.recoveryProtocols;
    }
    this.breathingLog = data.breathingLog;
    this.meditationLog = data.meditationLog;
    this.hardeningLog = data.hardeningLog;
    this.mentalLog = data.mentalLog;
    this.mentalRecords = data.mentalRecords;
    this.sleepingLog = data.sleepingLog;
    this.todoList = data.todoList || [];
    this.todoCustomCategories = Array.isArray(data.todoCustomCategories) ? data.todoCustomCategories : [];
    this.habitCustomCategories = Array.isArray(data.habitCustomCategories) ? data.habitCustomCategories : [];
    this.habitCategoryOverrides = data.habitCategoryOverrides && typeof data.habitCategoryOverrides === 'object' ? data.habitCategoryOverrides : {};
    this.deletedDefaultHabitCategories = Array.isArray(data.deletedDefaultHabitCategories) ? data.deletedDefaultHabitCategories : [];
    this.sectionVisits = data.sectionVisits || { habits: [], todo: [], mental: [], recovery: [], training: [], sleep: [] };
    this.todoFieldsVisibility = data.todoFieldsVisibility || { priority: true, difficulty: true, urgency: true };
    this.insightCache = data.insightCache || {};
    this.sectionVisits = data.sectionVisits || { habits: [], todo: [], mental: [], recovery: [], training: [], sleep: [] };
    this.menuCardsStates = data.menuCardsStates ||
{
  "MainCard": {
    "pinned": false,
    "hidden": false
  },
  "HabitsMain": {
    "pinned": false,
    "hidden": false
  },
  "TrainingMain": {
    "pinned": false,
    "hidden": false
  },
  "MentalMain": {
    "pinned": false,
    "hidden": false
  },
  "RecoveryMain": {
    "pinned": false,
    "hidden": false
  },
  "SleepMain": {
    "pinned": false,
    "hidden": false
  },
  "ToDoMain": {
    "pinned": false,
    "hidden": false
  }
};
    this.infoMiniPanel = data.infoMiniPanel || {
      "MainCard": true,
      "HabitsMain": true,
      "TrainingMain": true,
      "MentalMain": true,
      "RecoveryMain": true,
      "SleepMain": true,
      "ToDoMain": true
    };
    const savedHabitCardWidgets = data.habitCardWidgets || {};
    const statsFallback = savedHabitCardWidgets.stats;
    this.habitCardWidgets = {
      days: savedHabitCardWidgets.days ?? statsFallback ?? true,
      skips: savedHabitCardWidgets.skips ?? statsFallback ?? true,
      streak: savedHabitCardWidgets.streak ?? statsFallback ?? true,
      timer: savedHabitCardWidgets.timer ?? statsFallback ?? true,
      description: savedHabitCardWidgets.description ?? true,
      goals: savedHabitCardWidgets.goals ?? true,
      achievements: savedHabitCardWidgets.achievements ?? true
    };
  } 
  static async setPrefs(ind,value){
    this.prefs[ind] = value;
    await saveData();
  }
  static getLastProgramId() {
  const allDates = Object.keys(this.trainingLog).filter(dateKey => this.trainingLog[dateKey]?.length > 0);
  
  if (allDates.length === 0) return 0;

  // Sort descending: most recent first
  allDates.sort((a, b) => b.localeCompare(a));
  const latestDate = allDates[0];
  const sessions = this.trainingLog[latestDate];
  const lastSession = sessions[sessions.length - 1];

  return lastSession.programId ?? 0;
}

static getLastTrainingDayIndex() {
  const allDates = Object.keys(this.trainingLog).filter(dateKey => this.trainingLog[dateKey]?.length > 0);
  
  if (allDates.length === 0) return 0;

  allDates.sort((a, b) => b.localeCompare(a));
  const latestDate = allDates[0];
  const sessions = this.trainingLog[latestDate];
  const lastSession = sessions[sessions.length - 1];

  // Return next day index (so +1), but ensure it's a valid number
  const nextDayIndex = (lastSession.dayIndex ?? -1) + 1;
  return nextDayIndex >= 0 ? nextDayIndex : 0;
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
      this.habitsByDate[current][this.choosenHabits[this.choosenHabits.length - 1]] = getHabitPerformPercent(habitId) < 100 ? 1 : 1; 
     }
     else{
      this.habitsByDate[current][this.choosenHabits[this.choosenHabits.length - 1]] = getHabitPerformPercent(habitId) < 100 ? 1 : 1; 
     }
     currentDate.setDate(currentDate.getDate() + 1);
   }
   if(isNegative){
       if(getHabitPerformPercent(habitId) < 100)this.habitsByDate[endDate.toISOString().split('T')[0]][this.choosenHabits[this.choosenHabits.length - 1]] = isStartDateEarlier ? 1 : -1;
       else this.habitsByDate[endDate.toISOString().split('T')[0]][this.choosenHabits[this.choosenHabits.length - 1]] = 1;
   }
   else this.habitsByDate[endDate.toISOString().split('T')[0]][this.choosenHabits[this.choosenHabits.length - 1]] = getHabitPerformPercent(habitId) < 100 ? 0 : 1;
   await saveData();
  }
  static async addHabitGoal(habitId,goal){
    this.choosenHabitsGoals[habitId].push(goal);
    await saveData();
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
  static async changeStatus(day, habitId, status) {
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
     await saveData();
  }
  static async AddCustomHabit(n, cat, desc, src, id) {
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
     await saveData();
    return newHabit;
    
  }
  static IsCustomHabitExists(habitId){
    return this.CustomHabits.some(habit => habit.id === habitId);
  }
  static IsHabitInChoosenList(habitId){
    return this.choosenHabits.includes(habitId);
  }
  static GetAllHabitCategories(langIndex, includeDeleted = false) {
    const activeDefaults = DEFAULT_HABIT_CATEGORIES
      .filter((category) => !this.deletedDefaultHabitCategories.includes(category.key))
      .map((category) => {
        const override = this.habitCategoryOverrides[category.key] || {};
        return {
          ...category,
          ...override,
          key: category.key,
          label: override.label || category.label,
          isDefault: true,
          isDeleted: false
        };
      });
    const custom = this.habitCustomCategories.map((category, index) => ({ ...category, isDefault: false, customIndex: index, isDeleted: category.isDeleted === true })).filter(cat => includeDeleted || !cat.isDeleted);
    const deletedDefaults = includeDeleted
      ? DEFAULT_HABIT_CATEGORIES
          .filter((category) => this.deletedDefaultHabitCategories.includes(category.key))
          .map((category) => {
            const override = this.habitCategoryOverrides[category.key] || {};
            return {
              ...category,
              ...override,
              key: category.key,
              label: override.label || category.label,
              isDefault: true,
              isDeleted: true
            };
          })
      : [];
    return [...activeDefaults, ...custom, ...deletedDefaults];
  }
  static AddHabitCustomCategory(icon, labelRu, labelEn, isNegative = false) {
    const newCategory = { icon, label: [labelRu, labelEn], isNegative };
    this.habitCustomCategories.push(newCategory);
    saveData();
    return newCategory;
  }
  static RemoveHabitCustomCategory(index) {
    const categories = this.GetAllHabitCategories(0, true);
    const category = categories[index];
    if (!category) return;

    if (category.isDefault) {
      if (!this.deletedDefaultHabitCategories.includes(category.key)) {
        this.deletedDefaultHabitCategories.push(category.key);
      }
      delete this.habitCategoryOverrides[category.key];
      saveData();
      return;
    }

    if (typeof category.customIndex === 'number' && category.customIndex >= 0 && category.customIndex < this.habitCustomCategories.length) {
      this.habitCustomCategories[category.customIndex].isDeleted = true;
      saveData();
    }
  }
  static RestoreCustomHabitCategory(customIndex) {
    if (typeof customIndex === 'number' && customIndex >= 0 && customIndex < this.habitCustomCategories.length) {
      this.habitCustomCategories[customIndex].isDeleted = false;
      saveData();
    }
  }
  static UpdateHabitCustomCategory(index, icon, labelRu, labelEn, isNegative) {
    const categories = this.GetAllHabitCategories(0, true);
    const category = categories[index];
    if (!category) return;

    if (category.isDefault) {
      this.deletedDefaultHabitCategories = this.deletedDefaultHabitCategories.filter((key) => key !== category.key);
      this.habitCategoryOverrides[category.key] = { icon, label: [labelRu, labelEn], isNegative };
      saveData();
      return;
    }

    if (typeof category.customIndex === 'number' && category.customIndex >= 0 && category.customIndex < this.habitCustomCategories.length) {
      this.habitCustomCategories[category.customIndex] = { icon, label: [labelRu, labelEn], isNegative };
      saveData();
    }
  }
  static GetHabitCustomCategory(index) {
    return this.GetAllHabitCategories(0, true)[index] || null;
  }
  static RestoreDefaultHabitCategory(key) {
    this.deletedDefaultHabitCategories = this.deletedDefaultHabitCategories.filter((categoryKey) => categoryKey !== key);
    saveData();
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
            AppData.habitsByDate[current][AppData.choosenHabits[index]] = getHabitPerformPercent(AppData.choosenHabits[index]) < 100 ? isStartDateEarlier ? 1 : -1 : 1; 
          }
        }
        else{
           if(new Date(AppData.choosenHabitsStartDates[index]).getTime() <= new Date(current).getTime()){
           AppData.habitsByDate[current][AppData.choosenHabits[index]] = getHabitPerformPercent(AppData.choosenHabits[index]) < 100 ? -1 : 1; 
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
            AppData.habitsByDate[now][AppData.choosenHabits[index]] = getHabitPerformPercent(AppData.choosenHabits[index]) < 100 ? isStartDateEarlier ? 1 : -1 : 1; 
          }
        }
        else{
           if(new Date(AppData.choosenHabitsStartDates[index]).getTime() <= new Date(now).getTime()){
             AppData.habitsByDate[now][AppData.choosenHabits[index]] = getHabitPerformPercent(AppData.choosenHabits[index]) < 100 ? -1 : 1; 
           }
        }
   }
  }
}


export const logSectionVisit = async (sectionId) => {
  const today = new Date().toISOString().split('T')[0];
  if (!AppData.sectionVisits[sectionId]) {
    AppData.sectionVisits[sectionId] = [];
  }
  if (!AppData.sectionVisits[sectionId].includes(today)) {
    AppData.sectionVisits[sectionId].push(today);
    await saveData();
  }
};

export const getSectionStreak = (sectionId) => {
  // Collect all dates from section visits
  const visitDates = new Set(AppData.sectionVisits[sectionId] || []);

  // Collect dates from activity logs based on section
  switch (sectionId) {
    case 'habits': {
      Object.keys(AppData.habitsByDate).forEach(date => {
        const habitsOnDate = AppData.habitsByDate[date];
        if (habitsOnDate) {
          const hasActivity = Object.values(habitsOnDate).some(status => status > 0);
          if (hasActivity) visitDates.add(date);
        }
      });
      break;
    }
    case 'todo': {
      AppData.todoList.forEach(task => {
        if (task.completedAt) visitDates.add(task.completedAt.split('T')[0]);
      });
      break;
    }
    case 'mental': {
      Object.keys(AppData.mentalLog).forEach(date => visitDates.add(date));
      break;
    }
    case 'recovery': {
      ['breathingLog', 'meditationLog', 'hardeningLog'].forEach(logKey => {
        const log = AppData[logKey];
        if (log) Object.keys(log).forEach(date => visitDates.add(date));
      });
      break;
    }
    case 'training': {
      Object.keys(AppData.trainingLog).forEach(date => visitDates.add(date));
      break;
    }
    case 'sleep': {
      Object.keys(AppData.sleepingLog).forEach(date => visitDates.add(date));
      break;
    }
    default:
      break;
  }

  if (visitDates.size === 0) return 0;

  // Sort dates descending
  const sortedDates = Array.from(visitDates).sort((a, b) => b.localeCompare(a));

  // Calculate streak (consecutive days from today/yesterday)
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i]);
    date.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));

    // Allow gap of 0 (today) or 1 (yesterday) days
    if (i === 0 && diffDays > 1) return 0;
    if (i > 0) {
      const prevDate = new Date(sortedDates[i - 1]);
      prevDate.setHours(0, 0, 0, 0);
      const gap = Math.floor((prevDate - date) / (1000 * 60 * 60 * 24));
      if (gap !== 1) break;
    }
    streak++;
  }

  return streak;
};

export class UserData {
   static id = null;
   static name = 'bro';
   static photo = null;
   static hasPremium = false;
   static premiumEndDate = new Date();
   static isValidation = false;
   static friends = [];

   static Init(id,name,photo){
      this.id = id;
      this.name = name;
      this.photo = photo;
   }
   static SetFriends(friendsArray) {
      this.friends = friendsArray || [];
   }
}

export class Data{
  constructor(){
    this.lastSave = new Date().toISOString();
    this.isFirstStart = AppData.isFirstStart;
    this.prefs = AppData.prefs;
    this.choosenHabits = AppData.choosenHabits;
    this.choosenHabitsTypes = AppData.choosenHabitsTypes;
    this.habitsByDate = AppData.habitsByDate;
    this.choosenHabitsAchievements = AppData.choosenHabitsAchievements;
    this.choosenHabitsLastSkip = AppData.choosenHabitsLastSkip;
    this.choosenHabitsStartDates = AppData.choosenHabitsStartDates;
    this.choosenHabitsNotified = AppData.choosenHabitsNotified;
    this.choosenHabitsGoals = AppData.choosenHabitsGoals;
    this.CustomHabits = AppData.CustomHabits;
    this.habitCustomCategories = AppData.habitCustomCategories;
    this.habitCategoryOverrides = AppData.habitCategoryOverrides;
    this.deletedDefaultHabitCategories = AppData.deletedDefaultHabitCategories;
    this.choosenHabitsDaysToForm = AppData.choosenHabitsDaysToForm;
    this.notify = AppData.notify;
    this.exercises = AppData.exercises;
    this.programs = AppData.programs;
    this.trainingLog = AppData.trainingLog;
    this.pData = AppData.pData;
    this.measurements = AppData.measurements;
    this.ownPlates = AppData.ownPlates;
    this.platesAmount = AppData.platesAmount;
    this.barWeight = AppData.barWeight;
    this.lastBackupDate = AppData.lastBackupDate;
    this.recoveryProtocols = AppData.recoveryProtocols;
    this.breathingLog = AppData.breathingLog;
    this.meditationLog = AppData.meditationLog;
    this.hardeningLog = AppData.hardeningLog;
    this.mentalRecords = AppData.mentalRecords;
    this.sleepingLog = AppData.sleepingLog;
    this.mentalLog = AppData.mentalLog;
    this.todoList = AppData.todoList;
    this.todoCustomCategories = AppData.todoCustomCategories;
    this.sectionVisits = AppData.sectionVisits;
    this.todoFieldsVisibility = AppData.todoFieldsVisibility;
    this.menuCardsStates = AppData.menuCardsStates;
    this.infoMiniPanel = AppData.infoMiniPanel;
    this.insightCache = AppData.insightCache;
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

function formatDateKey(date) {
  const d = new Date(date);
  const y = d.getFullYear(); // LOCAL year
  const m = String(d.getMonth() + 1).padStart(2, '0'); // LOCAL month
  const day = String(d.getDate()).padStart(2, '0'); // LOCAL day
  return `${y}-${m}-${day}`;
}
