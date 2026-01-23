import { BehaviorSubject, Subject } from 'rxjs';
import Colors, { THEME } from './Colors';
import { AppData } from './AppData';
export const expandedCard$ = new BehaviorSubject(null);
export const setExpandedCard = (idOrNull) => expandedCard$.next(idOrNull);

export const theme$ = new BehaviorSubject('dark');
export const lang$ = new BehaviorSubject('ru');
export const sound$ = new BehaviorSubject(0);
export const vibro$ = new BehaviorSubject(0);
export const fontSize$ = new BehaviorSubject(0);
export const globalTheme$ = new BehaviorSubject('dark');
export const confirmationPanel$ = new BehaviorSubject(false);
export const header$ = new BehaviorSubject('');
export const showPopUpPanel$ = new BehaviorSubject({show:false,header:'',isPositive:true});
export const addPanel$ = new BehaviorSubject('');
export const setPage$ = new BehaviorSubject('LoadPanel');
export const bottomBtnPanel$ = new BehaviorSubject('');
export const notifyPanel$ = new BehaviorSubject(false);
export const notify$ = new BehaviorSubject([{enabled:false,cron:''},{enabled:false,cron:''},{enabled:false,cron:''}]);
export const habitsChanged$ = new Subject();
export const daysToFormAHabit$ = new BehaviorSubject(66);
export const currentBottomBtn$ = new BehaviorSubject(0);
export const keyboardVisible$ = new BehaviorSubject(false);
export const devMessage$ = new BehaviorSubject('');
export const isPasswordCorrect$ = new BehaviorSubject(false);
export const trainInfo$ = new BehaviorSubject({mode:'new',dayKey:'',dInd:0});
export const currentString$ = new BehaviorSubject('');
export const keyboardNeeded$ = new BehaviorSubject({type:0,value:false});
export const lastPage$ = new BehaviorSubject('MainMenu');
export const premium$ = new BehaviorSubject(false);
export const addNewTrainingDay$ =  new Subject();
export const recoveryType$ = new BehaviorSubject(0);
export const isValidation$ = new BehaviorSubject(false);

export const setValidation = (state) => isValidation$.next(state);

export const setConfirmationPanel = (state) => confirmationPanel$.next(state);
export const setTheme = (theme) => {
  theme$.next(theme);
  Colors.setTheme(theme);
  console.log(theme);
  globalTheme$.next(theme === THEME.DARK ? 'dark' : 'light');
};
export const setLang = (lang) => lang$.next(lang);
export const setFontSize = (fontSize) => fontSize$.next(fontSize);
export const updateConfirmationPanel = (text) => {
  setConfirmationPanel(true);
  header$.next(text);
};
export function setShowPopUpPanel(text,duration,isPositive ) {
  showPopUpPanel$.next({show:true,header:text,isPositive});
  setTimeout(() => showPopUpPanel$.next({show:false,header:'',isPositive}), duration);
}
export const setPage = (page) => {
  lastPage$.next(setPage$.value);
  setPage$.next(page);
  if(page.startsWith('Habit')) bottomBtnPanel$.next('BtnsHabits');
  else if(page.startsWith('Training')) bottomBtnPanel$.next('BtnsTraining');
  else if(page.startsWith('Recovery')) bottomBtnPanel$.next('BtnsRecovery');
  else if(page.startsWith('Mental')) bottomBtnPanel$.next('BtnsMental');
  else if(page.startsWith('Sleep')) bottomBtnPanel$.next('BtnsSleep');
  else if(page.startsWith('ToDo')) bottomBtnPanel$.next('BtnsToDo');
  else if(page.startsWith('Robot')) bottomBtnPanel$.next('BtnsRobot');
  else bottomBtnPanel$.next('');
}
export const setAddPanel = (state) => addPanel$.next(state);
export const emitHabitsChanged = () => habitsChanged$.next(Date.now());
export const setDaysToFormAHabit = (days) => {daysToFormAHabit$.next(days);AppData.daysToFormAHabit = days;};
export const setSoundAndVibro = (s,v) => {sound$.next(s);vibro$.next(v);}
export const setCurrentBottomBtn = (btn) => currentBottomBtn$.next(btn);
export const setKeyboardVisible = (isVisible) => keyboardVisible$.next(isVisible);
export const setDevMessage = (message) => devMessage$.next(message);
export const setIsPasswordCorrect = (state) => isPasswordCorrect$.next(state === "true");
export const setNotifyPanel = (state) => notifyPanel$.next(state);
export const setNotify = (state) => notify$.next(state);
export const setTrainInfo = (state) => trainInfo$.next(state);
export const setKeyboardNeeded = (state) => keyboardNeeded$.next(state);

export const setCurrentKeyboardString = (str) => {
   currentString$.next(str);
}
export const setPremium = (state) => premium$.next(state);
export const setAddNewTrainingDay = () => addNewTrainingDay$.next();
export const setRecoveryType = (state) => recoveryType$.next(state);