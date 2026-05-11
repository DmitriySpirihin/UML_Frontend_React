import {Habit} from "../Classes/Habit";
import { THEME } from './Colors';
import { habitReminder } from '../Pages/NotifyPanel';
import {setTheme,setLang ,setSoundAndVibro,setNotify,setShowPopUpPanel,setFontSize,setHabitAccent} from '../StaticClasses/HabitsBus'
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
const DEFAULT_HABITS_ACCENT_COLOR = '#149DFF';
const PREVIOUS_DEFAULT_HABITS_ACCENT_COLOR = '#22C55E';
const LEGACY_HABITS_ACCENT_COLORS = ['#8FAE9B', '#9A92C8', '#8FA6C8', '#7FC8B8', '#68C08F', '#B48BC8', '#D48AB6', '#DC8FA6', '#E4A7C3', '#D8DEE7', '#D6E2F2', '#CFE6FF', '#50D4E5', '#8A7CD6', '#7D92D6', '#39D982'];
const DEFAULT_SLEEP_ACCENT_COLOR = '#7C6CFF';
const LEGACY_SLEEP_ACCENT_COLORS = ['#7A86D9', '#6772A6', '#6F8BD6', '#7FC8B8', '#56C7B5', '#6F7DFF'];
const DEFAULT_TODO_ACCENT_COLOR = '#149DFF';
const LEGACY_TODO_ACCENT_COLORS = ['#8FA6C8', '#C65F9D', '#7FC8B8', '#C29AD6', '#DE8F9A', '#EAA6B4', '#C8D2DE', '#AFC7E8', '#9FCBFF', '#5DADEC', '#5F8DFF'];
const DEFAULT_MENTAL_ACCENT_COLOR = '#A66BFF';
const LEGACY_MENTAL_ACCENT_COLORS = ['#9A84C8', '#8A7CD6', '#B66DFF'];
const DEFAULT_RECOVERY_ACCENT_COLOR = '#2FD6BD';
const LEGACY_RECOVERY_ACCENT_COLORS = ['#74B8AF', '#68C08F', '#78B879', '#5ED28F'];
const DEFAULT_TRAINING_ACCENT_COLOR = '#35C2FF';
const LEGACY_TRAINING_ACCENT_COLORS = ['#FC5200', '#FF7A1A', '#9A8580', '#B87963', '#D8785E', '#7D92D6', '#8F7CFF'];
const DEFAULT_SECTION_VISITS = { habits: [], todo: [], mental: [], recovery: [], training: [], sleep: [] };
const DEFAULT_SECTION_LAST_OPENED_AT = { habits: 0, todo: 0, mental: 0, recovery: 0, training: 0, sleep: 0 };
const COFFEE_SECTION_ACCENT_COLORS = ['#B86A37', '#B87963', '#D8785E', '#D49A5C', '#C8A46F', '#A57926', '#A46C3B', '#A6846B', '#8F6A4A', '#9A8580'];

const normalizeAccentHex = (color, fallback = DEFAULT_HABITS_ACCENT_COLOR) => {
  if (typeof color !== 'string') return fallback;
  const trimmed = color.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed.slice(1).split('').map(char => char + char).join('')}`.toUpperCase();
  }
  return fallback;
};

const isCoffeeSectionAccent = (color) => {
  const normalized = normalizeAccentHex(color, '');
  if (!normalized) return false;
  if (COFFEE_SECTION_ACCENT_COLORS.includes(normalized)) return true;
  const int = Number.parseInt(normalized.slice(1), 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  return r > g && g > b && r >= 120 && g >= 70 && b <= 120 && saturation > 0.22;
};

const normalizeSectionAccentColor = (color, fallback) => {
  const normalized = normalizeAccentHex(color, fallback);
  return isCoffeeSectionAccent(normalized) ? fallback : normalized;
};

const normalizeAccentPresetList = (presets = []) => {
  if (!Array.isArray(presets)) return [];
  return presets
    .map(color => normalizeAccentHex(color, ''))
    .filter(Boolean)
    .filter(color => !isCoffeeSectionAccent(color))
    .filter((color, index, list) => list.indexOf(color) === index)
    .slice(-12);
};

const isLegacyTrainingAccentColor = (color) => {
  const normalized = normalizeAccentHex(color, '');
  if (!normalized) return true;
  if (LEGACY_TRAINING_ACCENT_COLORS.includes(normalized) || isCoffeeSectionAccent(normalized)) return true;
  const int = Number.parseInt(normalized.slice(1), 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return r > 150 && g >= 45 && g < 145 && b < 120;
};

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
  static habitAccentColor = DEFAULT_HABITS_ACCENT_COLOR;
  static habitAccentPresets = [];
  static CustomHabits = [];
   static choosenHabitsGoals = {};//{id:[{text:'',isDone:false}]}
   static choosenHabitsStartDates = [];
   static choosenHabitsLastSkip = {};
   static choosenHabitsAutoComplete = {};
   static habitEventTimes = {};
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
  static trainingAccentColor = DEFAULT_TRAINING_ACCENT_COLOR;
  static trainingAccentPresets = [];
  static trainingLog = {};
   static pData = {filled:false,age:20,gender:0,height:180,weight:70,goal:1,activityLevel:1};
   static profileOnboardingShown = false;
   static profileNicknameMode = 'telegram';
   static profileCustomNickname = '';
   static profileDiscoverySource = '';
   static profilePreferredSections = [];
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
  static recoveryAccentColor = DEFAULT_RECOVERY_ACCENT_COLOR;
  static recoveryAccentPresets = [];
  //mental
  static mentalLog = {};
  static mentalRecords = [[0,0,0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
  static mentalAccentColor = DEFAULT_MENTAL_ACCENT_COLOR;
  static mentalAccentPresets = [];
  //
	  static sleepingLog = {};
	  static sleepAccentColor = DEFAULT_SLEEP_ACCENT_COLOR;
	  static sleepAccentPresets = [];
  static sleepIntegrations = {
    appleHealth: { connected: false, autoSync: false, lastSync: '', error: '' },
    whoop: { connected: false, autoSync: false, lastSync: '', error: '' },
    oura: { connected: false, autoSync: false, lastSync: '', error: '' }
  };
	  static todoList = [];
	  static todoAccentColor = DEFAULT_TODO_ACCENT_COLOR;
	  static todoAccentPresets = [];
	  static todoCustomCategories = []; // [{icon, label:[ru,en]}]
  static sectionVisits = { ...DEFAULT_SECTION_VISITS };
  static sectionLastOpenedAt = { ...DEFAULT_SECTION_LAST_OPENED_AT };
  static profileFriendsExpanded = true;
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
static mainHeroWidgets = ["HabitsMain", "TrainingMain", "MentalMain"];
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
    setTheme(this.prefs[1] === 1 ? THEME.LIGHT : this.prefs[1] === 2 ? THEME.COFFEE : THEME.DARK);
    setSoundAndVibro(this.prefs[2],this.prefs[3]);
    setFontSize(this.prefs[4]);
    this.choosenHabitsStartDates = [...data.choosenHabitsStartDates];
    this.choosenHabitsLastSkip = data.choosenHabitsLastSkip;
    this.choosenHabitsAchievements = data.choosenHabitsAchievements;
    this.choosenHabits = [...data.choosenHabits];
    this.choosenHabitsTypes = [...data.choosenHabitsTypes];
    this.choosenHabitsGoals = data.choosenHabitsGoals;
    this.choosenHabitsAutoComplete = data.choosenHabitsAutoComplete || {};
    this.habitEventTimes = data.habitEventTimes || {};
    this.choosenHabitsNotified = data.choosenHabitsNotified;
    this.choosenHabitsDaysToForm = data.choosenHabitsDaysToForm;
    this.CustomHabits = data.CustomHabits;
    this.habitsByDate = data.habitsByDate;
    this.notify = data.notify;
    setNotify(this.notify);
    this.pData = data.pData || {filled:false,age:20,gender:0,height:180,weight:70,goal:1,activityLevel:1};
    this.profileOnboardingShown = data.profileOnboardingShown ?? this.pData.filled === true;
    this.profileNicknameMode = data.profileNicknameMode || 'telegram';
    this.profileCustomNickname = data.profileCustomNickname || '';
    this.profileDiscoverySource = data.profileDiscoverySource || '';
    this.profilePreferredSections = Array.isArray(data.profilePreferredSections) ? data.profilePreferredSections : [];
    this.lastBackupDate = data.lastBackupDate;
    this.measurements = data.measurements;
    if (data.exercises && typeof data.exercises === 'object' && !Array.isArray(data.exercises)) this.exercises = data.exercises;
    if (data.programs && typeof data.programs === 'object' && !Array.isArray(data.programs)) this.programs = data.programs;
    this.trainingAccentColor = typeof data.trainingAccentColor === 'string' && !isLegacyTrainingAccentColor(data.trainingAccentColor)
      ? normalizeSectionAccentColor(data.trainingAccentColor, DEFAULT_TRAINING_ACCENT_COLOR)
      : DEFAULT_TRAINING_ACCENT_COLOR;
    this.trainingAccentPresets = normalizeAccentPresetList(data.trainingAccentPresets);
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
    this.recoveryAccentColor = typeof data.recoveryAccentColor === 'string' && !LEGACY_RECOVERY_ACCENT_COLORS.includes(data.recoveryAccentColor.toUpperCase()) && !isCoffeeSectionAccent(data.recoveryAccentColor)
      ? normalizeSectionAccentColor(data.recoveryAccentColor, DEFAULT_RECOVERY_ACCENT_COLOR)
      : DEFAULT_RECOVERY_ACCENT_COLOR;
    this.recoveryAccentPresets = normalizeAccentPresetList(data.recoveryAccentPresets);
    this.mentalLog = data.mentalLog;
    this.mentalRecords = data.mentalRecords;
    this.mentalAccentColor = typeof data.mentalAccentColor === 'string' && !LEGACY_MENTAL_ACCENT_COLORS.includes(data.mentalAccentColor.toUpperCase()) && !isCoffeeSectionAccent(data.mentalAccentColor)
      ? normalizeSectionAccentColor(data.mentalAccentColor, DEFAULT_MENTAL_ACCENT_COLOR)
      : DEFAULT_MENTAL_ACCENT_COLOR;
    this.mentalAccentPresets = normalizeAccentPresetList(data.mentalAccentPresets);
	    this.sleepingLog = data.sleepingLog || {};
	    this.sleepAccentColor = typeof data.sleepAccentColor === 'string' && !LEGACY_SLEEP_ACCENT_COLORS.includes(data.sleepAccentColor.toUpperCase()) && !isCoffeeSectionAccent(data.sleepAccentColor)
        ? normalizeSectionAccentColor(data.sleepAccentColor, DEFAULT_SLEEP_ACCENT_COLOR)
        : DEFAULT_SLEEP_ACCENT_COLOR;
	    this.sleepAccentPresets = normalizeAccentPresetList(data.sleepAccentPresets);
    this.sleepIntegrations = {
      appleHealth: { connected: false, autoSync: false, lastSync: '', error: '', ...(data.sleepIntegrations?.appleHealth || {}) },
      whoop: { connected: false, autoSync: false, lastSync: '', error: '', ...(data.sleepIntegrations?.whoop || {}) },
      oura: { connected: false, autoSync: false, lastSync: '', error: '', ...(data.sleepIntegrations?.oura || {}) }
	    };
	    this.todoList = data.todoList || [];
	    this.todoAccentColor = typeof data.todoAccentColor === 'string' && !LEGACY_TODO_ACCENT_COLORS.includes(data.todoAccentColor.toUpperCase()) && !isCoffeeSectionAccent(data.todoAccentColor)
        ? normalizeSectionAccentColor(data.todoAccentColor, DEFAULT_TODO_ACCENT_COLOR)
        : DEFAULT_TODO_ACCENT_COLOR;
	    this.todoAccentPresets = normalizeAccentPresetList(data.todoAccentPresets);
	    this.todoCustomCategories = Array.isArray(data.todoCustomCategories) ? data.todoCustomCategories : [];
    this.habitCustomCategories = Array.isArray(data.habitCustomCategories) ? data.habitCustomCategories : [];
    this.habitCategoryOverrides = data.habitCategoryOverrides && typeof data.habitCategoryOverrides === 'object' ? data.habitCategoryOverrides : {};
    this.deletedDefaultHabitCategories = Array.isArray(data.deletedDefaultHabitCategories) ? data.deletedDefaultHabitCategories : [];
    this.habitAccentColor = setHabitAccent(typeof data.habitAccentColor === 'string' && !isCoffeeSectionAccent(data.habitAccentColor) && normalizeAccentHex(data.habitAccentColor, DEFAULT_HABITS_ACCENT_COLOR) !== PREVIOUS_DEFAULT_HABITS_ACCENT_COLOR
      ? normalizeAccentHex(data.habitAccentColor, DEFAULT_HABITS_ACCENT_COLOR)
      : DEFAULT_HABITS_ACCENT_COLOR).hue;
    this.habitAccentPresets = normalizeAccentPresetList(data.habitAccentPresets);
    this.sectionVisits = data.sectionVisits || { ...DEFAULT_SECTION_VISITS };
    this.sectionLastOpenedAt = data.sectionLastOpenedAt && typeof data.sectionLastOpenedAt === 'object'
      ? { ...DEFAULT_SECTION_LAST_OPENED_AT, ...data.sectionLastOpenedAt }
      : { ...DEFAULT_SECTION_LAST_OPENED_AT };
    this.profileFriendsExpanded = data.profileFriendsExpanded ?? true;
    this.todoFieldsVisibility = data.todoFieldsVisibility || { priority: true, difficulty: true, urgency: true };
    this.insightCache = data.insightCache || {};
    this.sectionVisits = data.sectionVisits || { ...DEFAULT_SECTION_VISITS };
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
    this.mainHeroWidgets = Array.isArray(data.mainHeroWidgets) && data.mainHeroWidgets.length > 0
      ? data.mainHeroWidgets.slice(0, 3)
      : ["HabitsMain", "TrainingMain", "MentalMain"];
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
    if (ind === 2 || ind === 3) setSoundAndVibro(this.prefs[2], this.prefs[3]);
    if (ind === 4) setFontSize(value);
    await saveData();
  }
  static async setHabitAccentColor(color) {
    this.habitAccentColor = setHabitAccent(color).hue;
    await saveData();
  }
  static async addAccentPreset(section, color, defaultPresets = []) {
    const fieldBySection = {
      habits: 'habitAccentPresets',
      todo: 'todoAccentPresets',
      sleep: 'sleepAccentPresets',
      mental: 'mentalAccentPresets',
      recovery: 'recoveryAccentPresets',
      training: 'trainingAccentPresets'
    };
    const field = fieldBySection[section];
    if (!field) return [];

    const nextColor = normalizeAccentHex(color, '');
    if (!nextColor) return this[field] || [];

    const defaults = normalizeAccentPresetList(defaultPresets);
    const current = normalizeAccentPresetList(this[field]);
    if (!defaults.includes(nextColor) && !current.includes(nextColor)) {
      this[field] = [...current, nextColor].slice(-12);
      await saveData();
    } else {
      this[field] = current;
    }
    return this[field];
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
  static isHabitAutoComplete(habitId) {
    return this.choosenHabitsAutoComplete?.[habitId] === true;
  }
  static getHabitEventTimestamp(day, habitId) {
    return this.habitEventTimes?.[habitId]?.[day] || null;
  }
  static normalizeHabitEventTimestamp(day, eventTimestamp = null) {
    if (Number.isFinite(eventTimestamp)) return eventTimestamp;
    if (day === new Date().toISOString().split('T')[0]) return Date.now();
    const [year, month, date] = day.split('-').map(Number);
    return new Date(year, month - 1, date, 23, 59, 0, 0).getTime();
  }
  static setHabitEventTimestamp(day, habitId, status, eventTimestamp = null) {
    const habitIndex = this.choosenHabits.indexOf(Number(habitId));
    const isNegative = habitIndex !== -1 && this.choosenHabitsTypes[habitIndex];
    if (status === -1 && isNegative) {
      if (!this.habitEventTimes[habitId]) this.habitEventTimes[habitId] = {};
      this.habitEventTimes[habitId][day] = this.normalizeHabitEventTimestamp(day, eventTimestamp);
      return;
    }
    if (this.habitEventTimes[habitId]) {
      delete this.habitEventTimes[habitId][day];
      if (Object.keys(this.habitEventTimes[habitId]).length === 0) delete this.habitEventTimes[habitId];
    }
  }
  static syncLastSkip(habitId) {
    const habitIndex = this.choosenHabits.indexOf(Number(habitId));
    if (habitIndex === -1 || !this.choosenHabitsTypes[habitIndex]) return;
    let latestSkip = null;
    Object.entries(this.habitsByDate).forEach(([day, habits]) => {
      if (habits?.[habitId] < 1) {
        const timestamp = this.getHabitEventTimestamp(day, habitId) || this.normalizeHabitEventTimestamp(day);
        if (!latestSkip || timestamp > latestSkip) latestSkip = timestamp;
      }
    });
    this.choosenHabitsLastSkip[habitId] = latestSkip || new Date(this.choosenHabitsStartDates[habitIndex]).getTime();
  }
  static async addHabit(habitId,dateString,goals,isNegative,daysToForm,autoComplete = false){
    const isStartDateEarlier = Date.now() - new Date(dateString).getTime() > 86400000;
    const todayKey = new Date().toISOString().split('T')[0];
    if (!this.habitsByDate || typeof this.habitsByDate !== 'object') this.habitsByDate = {};
    if(!this.choosenHabits.includes(habitId)) {
       this.choosenHabits.push(habitId);
       this.choosenHabitsAchievements[habitId] = getAchievements(isNegative);
       this.choosenHabitsGoals[habitId] = goals || [];
       this.choosenHabitsStartDates.push(dateString);
       this.choosenHabitsNotified[habitId] = [false,false,false];
       this.choosenHabitsDaysToForm.push(daysToForm);
       this.choosenHabitsLastSkip[habitId] = isStartDateEarlier ? new Date(dateString).getTime()  : Date.now();
       this.choosenHabitsTypes.push(isNegative);
       if (!isNegative) this.choosenHabitsAutoComplete[habitId] = autoComplete === true;
       else delete this.choosenHabitsAutoComplete[habitId];
       habitReminder(this.prefs[0],this.notify[0].cron,0,0,false);
    }
    const startDate = new Date(dateString);
    const endDate = new Date();
    let currentDate = startDate;
    while (currentDate < endDate) {
    const current = currentDate.toISOString().split('T')[0];
    if(!(current in this.habitsByDate)) {
      this.habitsByDate[current] = {};
      this.habitsByDate[current][habitId] = getHabitPerformPercent(habitId) < 100 ? 1 : 1; 
     }
     else{
      this.habitsByDate[current][habitId] = getHabitPerformPercent(habitId) < 100 ? 1 : 1; 
     }
     currentDate.setDate(currentDate.getDate() + 1);
   }
   if (!this.habitsByDate[todayKey]) this.habitsByDate[todayKey] = {};
   if(isNegative){
       if(getHabitPerformPercent(habitId) < 100)this.habitsByDate[todayKey][habitId] = isStartDateEarlier ? 1 : -1;
       else this.habitsByDate[todayKey][habitId] = 1;
   }
   else this.habitsByDate[todayKey][habitId] = this.isHabitAutoComplete(habitId) || getHabitPerformPercent(habitId) >= 100 ? 1 : 0;
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
    delete this.choosenHabitsAutoComplete[habitId];
    delete this.habitEventTimes[habitId];
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
  static async changeStatus(day, habitId, status, eventTimestamp = null) {
    if (!this.habitsByDate[day]) this.habitsByDate[day] = {};
    this.habitsByDate[day][habitId] = status;
    this.setHabitEventTimestamp(day, habitId, status, eventTimestamp);
    this.syncLastSkip(habitId);
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
           const habitId = AppData.choosenHabits[index];
           AppData.habitsByDate[current][habitId] = AppData.isHabitAutoComplete(habitId) || getHabitPerformPercent(habitId) >= 100 ? 1 : -1;
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
             const habitId = AppData.choosenHabits[index];
             AppData.habitsByDate[now][habitId] = AppData.isHabitAutoComplete(habitId) || getHabitPerformPercent(habitId) >= 100 ? 1 : -1;
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
  if (!AppData.sectionLastOpenedAt) {
    AppData.sectionLastOpenedAt = { ...DEFAULT_SECTION_LAST_OPENED_AT };
  }
  AppData.sectionLastOpenedAt[sectionId] = Date.now();
  if (!AppData.sectionVisits[sectionId].includes(today)) {
    AppData.sectionVisits[sectionId].push(today);
  }
  await saveData();
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
    this.choosenHabitsAutoComplete = AppData.choosenHabitsAutoComplete;
    this.habitEventTimes = AppData.habitEventTimes;
    this.choosenHabitsAchievements = AppData.choosenHabitsAchievements;
    this.choosenHabitsLastSkip = AppData.choosenHabitsLastSkip;
    this.choosenHabitsStartDates = AppData.choosenHabitsStartDates;
    this.choosenHabitsNotified = AppData.choosenHabitsNotified;
    this.choosenHabitsGoals = AppData.choosenHabitsGoals;
    this.CustomHabits = AppData.CustomHabits;
    this.habitCustomCategories = AppData.habitCustomCategories;
    this.habitCategoryOverrides = AppData.habitCategoryOverrides;
    this.deletedDefaultHabitCategories = AppData.deletedDefaultHabitCategories;
    this.habitAccentColor = AppData.habitAccentColor;
    this.habitAccentPresets = AppData.habitAccentPresets;
    this.choosenHabitsDaysToForm = AppData.choosenHabitsDaysToForm;
    this.notify = AppData.notify;
    this.exercises = AppData.exercises;
    this.programs = AppData.programs;
    this.trainingAccentColor = AppData.trainingAccentColor;
    this.trainingAccentPresets = AppData.trainingAccentPresets;
    this.trainingLog = AppData.trainingLog;
    this.pData = AppData.pData;
    this.profileOnboardingShown = AppData.profileOnboardingShown;
    this.profileNicknameMode = AppData.profileNicknameMode;
    this.profileCustomNickname = AppData.profileCustomNickname;
    this.profileDiscoverySource = AppData.profileDiscoverySource;
    this.profilePreferredSections = AppData.profilePreferredSections;
    this.measurements = AppData.measurements;
    this.ownPlates = AppData.ownPlates;
    this.platesAmount = AppData.platesAmount;
    this.barWeight = AppData.barWeight;
    this.lastBackupDate = AppData.lastBackupDate;
    this.recoveryProtocols = AppData.recoveryProtocols;
    this.breathingLog = AppData.breathingLog;
    this.meditationLog = AppData.meditationLog;
    this.hardeningLog = AppData.hardeningLog;
    this.recoveryAccentColor = AppData.recoveryAccentColor;
    this.recoveryAccentPresets = AppData.recoveryAccentPresets;
    this.mentalRecords = AppData.mentalRecords;
    this.mentalAccentColor = AppData.mentalAccentColor;
    this.mentalAccentPresets = AppData.mentalAccentPresets;
    this.sleepingLog = AppData.sleepingLog;
    this.sleepAccentColor = AppData.sleepAccentColor;
    this.sleepAccentPresets = AppData.sleepAccentPresets;
    this.sleepIntegrations = AppData.sleepIntegrations;
    this.mentalLog = AppData.mentalLog;
	    this.todoList = AppData.todoList;
	    this.todoAccentColor = AppData.todoAccentColor;
	    this.todoAccentPresets = AppData.todoAccentPresets;
	    this.todoCustomCategories = AppData.todoCustomCategories;
    this.sectionVisits = AppData.sectionVisits;
    this.sectionLastOpenedAt = AppData.sectionLastOpenedAt;
    this.profileFriendsExpanded = AppData.profileFriendsExpanded;
    this.todoFieldsVisibility = AppData.todoFieldsVisibility;
    this.menuCardsStates = AppData.menuCardsStates;
    this.infoMiniPanel = AppData.infoMiniPanel;
    this.mainHeroWidgets = AppData.mainHeroWidgets;
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
