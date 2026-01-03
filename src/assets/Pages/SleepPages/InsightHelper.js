import { AppData } from "../../StaticClasses/AppData";
export const getInsight = (dateString, langIndex) => {
  const t = (ru, en) => (langIndex === 0 ? ru : en);

  // Helper: format duration in minutes
  const formatDuration = (ms) => Math.round(ms / 60000);

  const messages = [];
  const recommendations = [];

  // === Breathing ===
  const breathingSessions = AppData.breathingLog[dateString] || [];
  if (breathingSessions.length > 0) {
    const total = breathingSessions.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
    const maxHoldSec = Math.max(...breathingSessions.map(s => s.maxHold || 0)) / 1000;
    messages.push(t(
      `Вы потратили ${formatDuration(total)} мин на дыхательные практики. Максимальная задержка: ${maxHoldSec} сек.`,
      `You spent ${formatDuration(total)} min on breathing exercises. Max breath hold: ${maxHoldSec} sec.`
    ));
  } else {
    recommendations.push(t(
      'Попробуйте добавить дыхательную практику — даже 5 минут улучшат концентрацию и снизят стресс.',
      'Try adding a breathing session—even 5 minutes can improve focus and reduce stress.'
    ));
  }

  // === Meditation ===
  const meditationSessions = AppData.meditationLog[dateString] || [];
  if (meditationSessions.length > 0) {
    const total = meditationSessions.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
    messages.push(t(
      `Вы медитировали ${formatDuration(total)} мин — отличный способ восстановить нервную систему!`,
      `You meditated for ${formatDuration(total)} min — a great way to restore your nervous system!`
    ));
  } else {
    recommendations.push(t(
      'Не забывайте про медитацию: она помогает снизить тревожность и улучшить сон.',
      'Don’t skip meditation—it reduces anxiety and improves sleep quality.'
    ));
  }

  // === Hardening (Cold Exposure) ===
  const hardeningSessions = AppData.hardeningLog[dateString] || [];
  if (hardeningSessions.length > 0) {
    const timeInCold = hardeningSessions.reduce((sum, s) => sum + (s.timeInColdWater || 0), 0);
    messages.push(t(
      `Вы провели ${Math.round(timeInCold / 1000)} сек в холодной воде — закалка укрепляет иммунитет!`,
      `You spent ${Math.round(timeInCold / 1000)} sec in cold water — hardening boosts immunity!`
    ));
  } else {
    recommendations.push(t(
      'Хотите укрепить иммунитет? Попробуйте контрастный душ или кратковременное погружение в прохладную воду.',
      'Want to boost immunity? Try a contrast shower or brief cold-water exposure.'
    ));
  }

  // === Sleep ===
  const sleep = AppData.sleepingLog[dateString];
  if (sleep) {
    const hours = (sleep.duration / (1000 * 60 * 60)).toFixed(1);
    const moodText = t(
      ['ужасно', 'плохо', 'нормально', 'хорошо', 'отлично'][sleep.mood - 1] || 'нормально',
      ['terrible', 'bad', 'okay', 'good', 'great'][sleep.mood - 1] || 'okay'
    );
    messages.push(t(
      `Сон: ${hours} ч. Настроение после сна: ${moodText}.`,
      `Sleep: ${hours} hrs. Mood after waking: ${moodText}.`
    ));

    // Sleep-based recommendations
    const sleepHours = parseFloat(hours);
    if (sleepHours < 6.5) {
      recommendations.push(t(
        'Ваш сон короче рекомендуемой нормы (7–9 ч). Постарайтесь лечь пораньше или улучшить гигиену сна.',
        'Your sleep is below the recommended 7–9 hours. Try going to bed earlier or improving sleep hygiene.'
      ));
    } else if (sleep.mood <= 2) {
      recommendations.push(t(
        'Несмотря на достаточную продолжительность сна, настроение низкое. Возможно, стоит проверить качество сна или уровень стресса.',
        'Despite enough sleep duration, your mood is low. Consider checking sleep quality or stress levels.'
      ));
    }
  } else {
    recommendations.push(t(
      'Не забудьте записать данные сна! Качественный отдых — основа физического и ментального здоровья.',
      'Don’t forget to log your sleep! Quality rest is the foundation of physical and mental health.'
    ));
  }

  // === Workouts ===
  const workouts = AppData.trainingLog?.[dateString] || [];
  if (workouts.length > 0) {
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalTonnage = workouts.reduce((sum, w) => sum + (w.tonnage || 0), 0);
    const completedExercises = workouts.reduce((count, w) =>
      count + Object.values(w.exercises || {}).filter(e => e.complited).length, 0
    );
    messages.push(t(
      `Тренировка: ${formatDuration(totalDuration)} мин, тоннаж: ${totalTonnage} кг, упражнений выполнено: ${completedExercises}.`,
      `Workout: ${formatDuration(totalDuration)} min, tonnage: ${totalTonnage} kg, ${completedExercises} exercises completed.`
    ));

    // Check for short duration
    if (totalDuration < 10 * 60000) { // < 10 min
      recommendations.push(t(
        'Тренировка была очень короткой. Даже 20-минутная сессия принесёт больше пользы.',
        'Your workout was very short. Even a 20-minute session would be more beneficial.'
      ));
    }
  } else {
    recommendations.push(t(
      'Сегодня не было тренировки. Даже лёгкая разминка поддержит тонус и настроение!',
      'No workout today. Even light movement can boost energy and mood!'
    ));
  }

  // === Habits ===
  const habits = AppData.habitsByDate?.[dateString] || [];
  if (habits.length > 0) {
    const completed = habits.filter(h => h.status === 1).length;
    const total = habits.length;
    const completionRate = completed / total;
    messages.push(t(
      `Привычки: ${completed} из ${total} выполнено сегодня.`,
      `Habits: ${completed} out of ${total} completed today.`
    ));

    if (completionRate < 0.5) {
      recommendations.push(t(
        'Меньше половины привычек выполнено. Выберите 1–2 ключевые и сосредоточьтесь на них завтра.',
        'Less than half of your habits were completed. Pick 1–2 key ones and focus on them tomorrow.'
      ));
    }
  } else {
    recommendations.push(t(
      'У вас нет запланированных привычек на сегодня. Создайте пару простых — например, “выпить воду утром” или “сделать 5 минут растяжки”.',
      'You have no habits logged for today. Set up a couple of simple ones—e.g., “drink water in the morning” or “5 min of stretching”.'
    ));
  }

  // === Assemble final insight ===
  let fullMessage = '';

  if (messages.length > 0) {
    fullMessage += messages.join(' ') + ' ';
  }

  if (recommendations.length > 0) {
    const intro = t('Рекомендации: ', 'Recommendations: ');
    fullMessage += intro + recommendations.slice(0, 2).join(' ') + // limit to 2 to avoid overload
      (recommendations.length > 2 ? t(' и другие.', ' and others.') : '');
  }

  if (fullMessage === '') {
    fullMessage = t(
      'Сегодня пока нет данных о вашей активности. Начните с одной полезной привычки!',
      'No activity data recorded for today. Start with one healthy habit!'
    );
  }

  return fullMessage.trim();
};