

/* [
{
    id: 1,
    name: 'Life admin cleanup',
    description: 'General digital and life maintenance',
    difficulty: 4,
    priority: 4,
    urgency : 5,
    category: 'Life',
    icon: '🧹',
    isDone: true,
    startDate: '2026-01-15',
    deadLine: '2026-02-01',
    goals: [
      { text: 'Clean up desktop and downloads folder',aim:'',result:'', isDone: false }
    ],
    result:'',
    isPinned:false,
    isHidden:false,
    isPending:false
}
]

       
*/

import { AppData } from "../../StaticClasses/AppData"
import { saveData } from "../../StaticClasses/SaveHelper"
import { BehaviorSubject } from 'rxjs';
export const todoEvents$ = new BehaviorSubject(null);

export async function createGoal(name, description, difficulty, priority, category, icon, startdate, deadLine, goals, urgency,result = '',isPinned = false,isHidden = false,isPending = false) {
  const id = Date.now();
  const today = new Date();
  // Compute safe deadline ONLY if needed (avoids unnecessary computation)
const getDefaultDeadline = () => {
  
  today.setFullYear(d.getFullYear() + 1); // +1 year from today
  return d.toISOString().split('T')[0];
};
AppData.todoList.push({
  id,
  name: ((name ?? '').trim() || 'Untitled'), // ✅ Never empty
  description: (description ?? '').trim(),    // ✅ Null-safe + clean whitespace
  difficulty: Number.isFinite(difficulty) ? difficulty : 0,
  priority: Number.isFinite(priority) ? priority : 0,
  category: ((category ?? '').trim() || 'General'), // ✅ Fallback category
  icon: (icon ?? 'task'),                          // ✅ Valid default icon name
  isDone: false,
  startDate: (startdate && typeof startdate === 'string' && !isNaN(Date.parse(startdate))) ? startdate : today.toISOString().split('T')[0],
  deadLine: (deadLine && typeof deadLine === 'string' && !isNaN(Date.parse(deadLine))) 
    ? deadLine 
    : getDefaultDeadline(), // ✅ Fixed syntax + validation
  goals: Array.isArray(goals) ? [...goals] : [], // ✅ Clone to prevent reference leaks
  urgency: Number.isFinite(urgency) ? urgency : 0,
  result : result,
  isPinned : isPinned,
  isHidden : isHidden,
  isPending : isPending
});

  await saveData();
  // Уведомляем всех подписчиков, что список изменился
  if (todoEvents$) todoEvents$.next({ type: 'UPDATE_LIST' });
}

// new methods i added
export async function setOrRedactSubgoalAim(goalId, index, aimText) {
  const item = AppData.todoList.find(i => i.id === goalId);
  
  if (item && item.goals && item.goals[index]) {
    // Update the sub-goal text
    item.goals[index].aim = aimText;
    
    await saveData();
    if (todoEvents$) todoEvents$.next({ type: 'UPDATE_LIST' });
  }
}

export async function setOrRedactSubgoalResult(goalId, index, resText) {
  const item = AppData.todoList.find(i => i.id === goalId);
  
  if (item && item.goals && item.goals[index]) {
    // Update the sub-goal text
    item.goals[index].result = resText;
    
    await saveData();
    if (todoEvents$) todoEvents$.next({ type: 'UPDATE_LIST' });
  }
}

export async function addOrRedactResult(id,result) {
  const item = AppData.todoList.find(i => i.id === id);
  
  if (item) {
    item.result = result;
    await saveData();
    if (todoEvents$) todoEvents$.next({ type: 'UPDATE_LIST' });
  }
}

export async function togglePinned(id) {
  const item = AppData.todoList.find(i => i.id === id);
  
  if (item) {
    item.isPinned = !item.isPinned;
    await saveData();
    if (todoEvents$) todoEvents$.next({ type: 'UPDATE_LIST' });
  }
}
export async function toggleHidden(id) {
  const item = AppData.todoList.find(i => i.id === id);
  
  if (item) {
    item.isHidden = !item.isHidden;
    await saveData();
    if (todoEvents$) todoEvents$.next({ type: 'UPDATE_LIST' });
  }
}
export async function togglePending(id) {
  const item = AppData.todoList.find(i => i.id === id);
  
  if (item) {
    item.isPending = !item.isPending;
    await saveData();
    if (todoEvents$) todoEvents$.next({ type: 'UPDATE_LIST' });
  }
}
// end of new functionality


export async function redactGoal(id, name, description, difficulty, priority, category, icon, color, startDate, deadLine, note) {
  const item = AppData.todoList.find(i => i.id === id);
  
  if (item) {
    item.name = name;
    item.description = description;
    item.difficulty = difficulty;
    item.priority = priority;
    item.category = category;
    item.icon = icon;
    item.color = color;
    item.startDate = startDate;
    item.deadLine = deadLine;
    item.note = note;
    
    await saveData();
    if (todoEvents$) todoEvents$.next({ type: 'UPDATE_LIST' });
  }
}

export async function deleteGoal(id) {
  AppData.todoList = AppData.todoList.filter(item => item.id !== id);
  
  await saveData();
  if (todoEvents$) todoEvents$.next({ type: 'UPDATE_LIST' });
}

export async function toggleGoal(id) {
  const item = AppData.todoList.find(i => i.id === id);
  
  if (item) {
    item.isDone = !item.isDone;
    await saveData();
    if (todoEvents$) todoEvents$.next({ type: 'UPDATE_LIST' });
  }
}

export async function addSubGoal(id, subGoalText) {
  const item = AppData.todoList.find(i => i.id === id);
  
  if (item) {
    if (!item.goals) item.goals = [];
    item.goals.push({ text: subGoalText, isDone: false });
    
    await saveData();
    if (todoEvents$) todoEvents$.next({ type: 'UPDATE_LIST' });
  }
}
export async function updateSubGoal(goalId, index, newText) {
  const item = AppData.todoList.find(i => i.id === goalId);
  
  if (item && item.goals && item.goals[index]) {
    // Update the sub-goal text
    item.goals[index].text = newText;
    
    await saveData();
    if (todoEvents$) todoEvents$.next({ type: 'UPDATE_LIST' });
  }
}

export async function redactSubGoal(id, subGoalIndex, newText) {
  const item = AppData.todoList.find(i => i.id === id);
  
  if (item && item.goals && item.goals[subGoalIndex]) {
    item.goals[subGoalIndex].text = newText;
    
    await saveData();
    if (todoEvents$) todoEvents$.next({ type: 'UPDATE_LIST' });
  }
}

export async function deleteSubGoal(id, subGoalIndex) {
  const item = AppData.todoList.find(i => i.id === id);
  
  if (item && item.goals) {
    item.goals.splice(subGoalIndex, 1);
    
    await saveData();
    if (todoEvents$) todoEvents$.next({ type: 'UPDATE_LIST' });
  }
}

export async function toggleSubGoal(id, subGoalIndex) {
  const item = AppData.todoList.find(i => i.id === id);
  
  if (item && item.goals && item.goals[subGoalIndex]) {
    item.goals[subGoalIndex].isDone = !item.goals[subGoalIndex].isDone;
    
    await saveData();
    if (todoEvents$) todoEvents$.next({ type: 'UPDATE_LIST' });
  }
}