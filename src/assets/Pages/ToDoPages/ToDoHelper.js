

/* [
{
    id: 1,
    name: 'Life admin cleanup',
    description: 'General digital and life maintenance',
    difficulty: 4,
    priority: 4,
    category: 'Life',
    icon: '🧹',
    isDone: true,
    startDate: '2026-01-15',
    deadLine: '2026-02-01',
    goals: [
        { text: 'Clean up desktop and downloads folder', isDone: false },
        { text: 'Unsubscribe from unused services and newsletters', isDone: false },
        { text: 'Organize important documents into folders/cloud', isDone: false }
    ],
    urgency : 5
}
]

       
*/

import { AppData } from "../../StaticClasses/AppData"
import { saveData } from "../../StaticClasses/SaveHelper"
import { BehaviorSubject } from 'rxjs';
export const todoEvents$ = new BehaviorSubject(null);

export async function createGoal(name, description, difficulty, priority, category, icon,  startDate, deadLine, goals, urgency) {
  const id = Date.now();

  AppData.todoList.push({
    id,
    name,
    description,
    difficulty,
    priority,
    category,
    icon,
    isDone: false,
    startDate,
    deadLine,
    goals: goals || [],
    urgency
  });

  await saveData();
  // Уведомляем всех подписчиков, что список изменился
  if (todoEvents$) todoEvents$.next({ type: 'UPDATE_LIST' });
}

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