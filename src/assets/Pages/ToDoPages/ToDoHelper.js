

/* [
{
    id: 1,
    name: 'Life admin cleanup',
    description: 'General digital and life maintenance',
    difficulty: 4,
    priority: 4,
    category: 'Life',
    icon: '🧹',
    color: '#18885263',
    isDone: true,
    startDate: '2026-01-15',
    deadLine: '2026-02-01',
    goals: [
        { text: 'Clean up desktop and downloads folder', isDone: false },
        { text: 'Unsubscribe from unused services and newsletters', isDone: false },
        { text: 'Organize important documents into folders/cloud', isDone: false }
    ],
    note: 'List of apps to delete: [web:32][web:31]'
},
{
    id: 2,
    name: 'Home declutter mini sprint',
    description: 'Quick declutter of key home zones',
    difficulty: 2,
    priority: 2,
    category: 'Home',
    icon: '🏠',
    color: '#88561863',
    isDone: false,
    startDate: '2026-01-16',
    deadLine: '2026-02-05',
    goals: [
        { text: 'Sort clothes and remove things not used for a year', isDone: false },
        { text: 'Throw away or recycle old papers and receipts', isDone: false },
        { text: 'Tidy up workspace and cables around PC', isDone: false }
    ],
    note: 'goal 2: [web:32][web:31]'
},
{
    id: 3,
    name: 'Finance & subscriptions review',
    description: 'Check money leaks and recurring payments',
    difficulty: 3,
    priority: 4,
    category: 'Finance',
    icon: '💳',
    color: '#376e6d63',
    isDone: true,
    startDate: '2026-01-17',
    deadLine: '2026-02-07',
    goals: [
        { text: 'List all active subscriptions and their prices', isDone: false },
        { text: 'Cancel at least one that is not really needed', isDone: false },
        { text: 'Set calendar reminder for next big payments', isDone: false }
    ],
    note: 'Avoid unnecessary subscriptions!'
}
]
*/

import { AppData } from "../../StaticClasses/AppData"
import { saveData } from "../../StaticClasses/SaveHelper"
import { BehaviorSubject } from 'rxjs';
export const todoEvents$ = new BehaviorSubject(null);

export async function createGoal(name, description, difficulty, priority, category, icon, color, startDate, deadLine, goals, note) {
  const id = Date.now();

  AppData.todoList.push({
    id,
    name,
    description,
    difficulty,
    priority,
    category,
    icon,
    color,
    isDone: false,
    startDate,
    deadLine,
    goals: goals || [],
    note
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