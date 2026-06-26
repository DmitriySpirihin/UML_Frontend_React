import assert from 'node:assert/strict';
import { mergeAppSnapshots } from '../src/assets/StaticClasses/DataMerge.js';

const local = {
  lastSave: '2026-06-26T10:00:00.000Z',
  choosenHabits: [1],
  choosenHabitsStartDates: ['2026-06-20'],
  choosenHabitsTypes: [false],
  choosenHabitsDaysToForm: [66],
  choosenHabitsSchedule: { 1: { type: 'weekly', days: [1, 3, 5] } },
  choosenHabitsNotified: { 1: [false, true, false] },
  choosenHabitsGoals: { 1: [{ text: 'keep', isDone: false }] },
  sectionVisits: { habits: ['2026-06-24', '2026-06-25'], sleep: ['2026-06-25'] }
};

const newerButSparseRemote = {
  lastSave: '2026-06-26T11:00:00.000Z',
  choosenHabits: [],
  choosenHabitsStartDates: [],
  choosenHabitsTypes: [],
  choosenHabitsDaysToForm: [],
  choosenHabitsSchedule: {},
  choosenHabitsNotified: { 1: [] },
  choosenHabitsGoals: { 1: [] },
  sectionVisits: { habits: [], sleep: ['2026-06-26'] }
};

const mergedSparse = mergeAppSnapshots(local, newerButSparseRemote, {
  touchLastSaveOnChange: false
}).snapshot;

assert.deepEqual(mergedSparse.choosenHabits, [1]);
assert.deepEqual(mergedSparse.choosenHabitsStartDates, ['2026-06-20']);
assert.deepEqual(mergedSparse.choosenHabitsSchedule, { 1: { type: 'weekly', days: [1, 3, 5] } });
assert.deepEqual(mergedSparse.choosenHabitsNotified, { 1: [false, true, false] });
assert.deepEqual(mergedSparse.choosenHabitsGoals, { 1: [{ text: 'keep', isDone: false }] });
assert.deepEqual(mergedSparse.sectionVisits.habits, ['2026-06-24', '2026-06-25']);
assert.deepEqual(mergedSparse.sectionVisits.sleep, ['2026-06-25', '2026-06-26']);

const remoteWithHabits = {
  ...newerButSparseRemote,
  choosenHabits: [1, 2],
  choosenHabitsStartDates: ['2026-06-20', '2026-06-21'],
  choosenHabitsTypes: [false, true],
  choosenHabitsDaysToForm: [66, 120]
};

const mergedComplete = mergeAppSnapshots(local, remoteWithHabits, {
  touchLastSaveOnChange: false
}).snapshot;

assert.deepEqual(mergedComplete.choosenHabits, [1, 2]);
assert.deepEqual(mergedComplete.choosenHabitsTypes, [false, true]);

console.log('data merge self-check ok');
