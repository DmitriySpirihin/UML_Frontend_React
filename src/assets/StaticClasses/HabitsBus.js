import { BehaviorSubject, Subject } from 'rxjs';
import Colors, { THEME } from './Colors';

export const expandedCard$ = new BehaviorSubject(null);
export const setExpandedCard = (idOrNull) => expandedCard$.next(idOrNull);

export const theme$ = new BehaviorSubject(THEME.DARK);
export const lang$ = new BehaviorSubject('ru');
export const sound$ = new BehaviorSubject(0);
export const vibro$ = new BehaviorSubject(0);
export const globalTheme$ = new BehaviorSubject('dark');
export const confirmationPanel$ = new BehaviorSubject(false);
export const header$ = new BehaviorSubject('');
export const showPopUpPanel$ = new BehaviorSubject({show:false,header:''});
export const addPanel$ = new BehaviorSubject('');
export const setPage$ = new BehaviorSubject('LoadPanel');
export const bottomBtnPanel$ = new BehaviorSubject('');
export const habitsChanged$ = new Subject();
export const daysToFormAHabit$ = new BehaviorSubject(66);
export const currentBottomBtn$ = new BehaviorSubject(0);
export const keyboardVisible$ = new BehaviorSubject(false);

export const setConfirmationPanel = (state) => confirmationPanel$.next(state);
export const setTheme = (theme) => {
  theme$.next(theme);
  Colors.setTheme(theme);
  globalTheme$.next(theme === THEME.DARK || theme === THEME.SPECIALDARK ? 'dark' : 'light');
};
export const setLang = (lang) => lang$.next(lang);
export const updateConfirmationPanel = (text) => {
  setConfirmationPanel(true);
  header$.next(text);
};
export function setShowPopUpPanel(text,duration ) {
  showPopUpPanel$.next({show:true,header:text});
  setTimeout(() => showPopUpPanel$.next({show:false,header:''}), duration);
}
export const setPage = (page) => {
  setPage$.next(page);
  if(page.startsWith('Habit')) bottomBtnPanel$.next('BtnsHabits');
  else if(page === 'TrainingMain') bottomBtnPanel$.next('BtnsTraining');
  else bottomBtnPanel$.next('');
}
export const setAddPanel = (state) => addPanel$.next(state);
export const emitHabitsChanged = () => habitsChanged$.next(Date.now());
export const setDaysToFormAHabit = (days) => {daysToFormAHabit$.next(days);AppData.daysToFormAHabit = days;};
export const setSoundAndVibro = (s,v) => {sound$.next(s);vibro$.next(v);}
export const setCurrentBottomBtn = (btn) => currentBottomBtn$.next(btn);
export const setKeyboardVisible = (isVisible) => keyboardVisible$.next(isVisible);