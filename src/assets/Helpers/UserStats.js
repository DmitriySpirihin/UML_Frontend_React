import { AppData } from '../StaticClasses/AppData.js';

export const XP_RULES = [
    { key: 'training', label: ['Тренировка', 'Training'], description: ['за каждый день с тренировкой', 'for each day with a workout'], xp: 50, color: '#FF4D4D' },
    { key: 'mental', label: ['Ментальная игра', 'Mental game'], description: ['за каждый день с ментальной практикой', 'for each day with mental practice'], xp: 30, color: '#4DA6FF' },
    { key: 'sleep', label: ['Сон', 'Sleep'], description: ['за каждый день с записью сна', 'for each day with a sleep log'], xp: 20, color: '#A64DFF' },
    { key: 'recovery', label: ['Восстановление', 'Recovery'], description: ['за медитацию, дыхание или закаливание', 'for meditation, breathing, or hardening'], xp: 20, color: '#4DFF88' },
    { key: 'habits', label: ['Привычка', 'Habit'], description: ['за каждую выбранную привычку', 'for each selected habit'], xp: 10, color: '#FFD700' }
];

export const LEVEL_RANKS = [
    { minLevel: 1, title: ['Новичок', 'Novice'], color: '#4f4f4f' },
    { minLevel: 5, title: ['Искатель', 'Seeker'], color: '#4CAF50' },
    { minLevel: 10, title: ['Достигатор', 'Achiever'], color: '#2196F3' },
    { minLevel: 20, title: ['Элита', 'Elite'], color: '#9C27B0' },
    { minLevel: 50, title: ['Легенда', 'Legend'], color: '#FFD700' }
];

export const calculateStats = () => {
    const habitsCount = AppData.choosenHabits?.length || 0;
    const trainingCount = Object.keys(AppData.trainingLog || {}).length;
    const mentalCount = Object.keys(AppData.mentalLog || {}).length;
    const sleepCount = Object.keys(AppData.sleepingLog || {}).length;
    const recoveryCount =
        Object.keys(AppData.meditationLog || {}).length +
        Object.keys(AppData.breathingLog || {}).length +
        Object.keys(AppData.hardeningLog || {}).length;

    const counts = { habits: habitsCount, training: trainingCount, mental: mentalCount, sleep: sleepCount, recovery: recoveryCount };
    const totalXP = XP_RULES.reduce((sum, rule) => sum + ((counts[rule.key] || 0) * rule.xp), 0);

    let level = 1;
    let xpThreshold = 500;
    let prevThreshold = 0;
    while (totalXP >= xpThreshold) {
        prevThreshold = xpThreshold;
        level++;
        xpThreshold += (level * 500);
    }

    return {
        counts,
        level: {
            current: level,
            xp: totalXP - prevThreshold,
            needed: xpThreshold - prevThreshold,
            totalXp: totalXP,
            percent: Math.min(100, Math.max(0, ((totalXP - prevThreshold) / (xpThreshold - prevThreshold)) * 100))
        }
    };
};
