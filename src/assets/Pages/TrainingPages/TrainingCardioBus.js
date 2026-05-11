import { BehaviorSubject } from 'rxjs';

export const cardioType$ = new BehaviorSubject('RUNNING');
export const trainInfo$ = new BehaviorSubject({ mode: 'new', dayKey: '', dInd: null });
