import { BehaviorSubject, Subject } from 'rxjs';
import { THEME } from './Colors';

export const expandedCard$ = new BehaviorSubject(null);
export const setExpandedCard = (idOrNull) => expandedCard$.next(idOrNull);

export const theme$ = new BehaviorSubject(THEME.DARK);
export const lang$ = new BehaviorSubject('ru');
export const globalTheme$ = new BehaviorSubject('dark');
export const confirmationPanel$ = new BehaviorSubject(false);
export const header$ = new BehaviorSubject('');
export const showPopUpPanel$ = new BehaviorSubject({show:false,header:''});
export const addHabitPanel$ = new BehaviorSubject(false);
export const setPage$ = new BehaviorSubject('MainMenu');
export const habitsChanged$ = new Subject();

export const setConfirmationPanel = (state) => confirmationPanel$.next(state);
export const setTheme = (theme) => {
  theme$.next(theme);
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
export const setPage = (page) => setPage$.next(page);
export const setAddHabitPanel = (state) => addHabitPanel$.next(state);
export const emitHabitsChanged = () => habitsChanged$.next(Date.now());

  