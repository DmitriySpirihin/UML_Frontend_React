import React from 'react';
import { Colors } from './Colors';

class Icons {
  static ic = {
    // Default and general
    'default': '🙂',
    'star': '⭐',
    'clock': '⏰',
    'calendar': '📅',
    'search': '🔍',
    'settings': '⚙️',
    'tools': '🛠️',
    'gift': '🎁',
    'shopping': '🛍️',
    'store': '🏪',
    'box': '📦',
    'boxes': '🗃️',
    'package': '📦',
    'transport': '🚚',
    'travel': '✈️',
    'bike': '🚲',
    'car': '🚗',
    'bus': '🚌',
    'train': '🚆',
    'subway': '🚇',
    'ship': '🚢',
    'taxi': '🚕',
    'motorcycle': '🏍️',
    'hiking': '🥾',
    'swimming': '🏊',
    'mountain': '⛰️',
    'beach': '🏖️',
    'puzzle': '🧩',
    'game': '🎮',
    'camera': '📷',
    'video': '🎥',
    'palette': '🎨',
    'design': '🖌️',
    'music': '🎵',
    'guitar': '🎸',
    'language': '🌐',
    'graduation': '🎓',
    'code': '💻',
    'mobile': '📱',
    'laptop': '💻',
    'book': '📚',
    'bookOpen': '📖',
    'users': '👥',
    'friends': '👫',
    'share': '📤',
    'phone': '📞',
    'comment': '💬',
    'heart': '❤️',
    'money': '💰',
    'savings': '🪙',
    'chart': '📈',
    'pieChart': '📊',
    'shoppingCart': '🛒',
    'basket': '🧺',
    'clean': '🧹',
    'clothes': '👕',
    'utensils': '🍴',
    'spoon': '🥄',
    'seedling': '🌱',
    'helping': '🤝',
    'wine': '🍷',

    // Health & Fitness
    'health': '💪',
    'heart': '❤️',
    'meditation': '🧘',
    'workout': '🏋️',
    'running': '🏃',
    'exercise': '🏃‍♂️',
    'stretching': '🧘‍♀️',
    'walking': '🚶',

    // Nutrition
    'food': '🍎',
    'fruit': '🍇',
    'meal': '🍲',
    'cooking': '🍳',
    'water': '💧',
    'coffee': '☕',

    // Personal Development
    'reading': '📖',
    'learning': '🧠',
    'journaling': '📓',
    'planning': '🗓️',
    'goals': '🎯',
    'idea': '💡',

    // Sleep & Routine
    'sleep': '😴',
    'wakeup': '🌅',
    'bedtime': '🌙',
    'alarm': '⏰',
    'morning': '☀️',
    'night': '🌙',

    // Work & Study
    'work': '💼',
    'study': '📚',
    'coding': '💻',
    'meeting': '📅',

    // Hobbies & Activities
    'pet': '🐕',
    'creativity': '✨',
    'hobby': '🎨',
    'sport': '⚽',

    // Productivity
    'habit': '✅',
    'task': '📅',
    'checklist': '📋',
    'reminder': '🔔',
    'tracker': '📊',

    // Social & Relationships
    'family': '👨‍👩‍👧‍👦',
    'social': '📲',
    'date': '❤️',

    // Finance
    'budget': '📉',
    'investment': '💹',

    // Home & Chores
    'cleaning': '🧽',
    'laundry': '👚',
    'grocery': '🛒',
    'garden': '🌿',
    'bed': '🛏️',

    // Mental Health
    'mindfulness': '🧠',
    'gratitude': '🙏',
    'therapy': '💬',
    'breathing': '🌬️',
    'journal': '📓',

    // Education
    'school': '🏫',
    'onlineCourse': '🖥️',
    'research': '🔍',

    // Technology
    'app': '📱',
    'photo': '📸',

    // Creative
    'art': '🎨',
    'write': '✍️',
    'dance': '💃',
    'craft': '✂️',

    // Spiritual
    'prayer': '🙏',
    'yoga': '🧘',
    'meditation': '🕉️',
    'reflection': '🌙',

    // Productivity (additional)
    'focus': '🎯',
    'time': '⏳',
    'routine': '📋',
    'plan': '📝',

    // Weather
    'weather_sunny': '☀️',
    'weather_cloudy': '☁️',
    'weather_rain': '🌧️',
    'weather_storm': '⛈️',
    'weather_snow': '❄️',
    'weather_windy': '💨',
    'weather_fog': '🌫️',
    'temperature': '🌡️',

    // Household
    'bath': '🛁',
    'shower': '🚿',
    'toilet': '🚽',
    'toilet_paper': '🧻',
    'soap': '🧼',
    'hands_wash': '🧽',

    // Hand Gestures
    'thumbs_up': '👍',
    'thumbs_down': '👎',
    'hand_peace': '✌️',
    'hand_point_up': '👆',
    'hand_point_right': '👉',
    'hand_point_left': '👈',
    'hand_point_down': '👇',
    'skull': '💀',
  };

  static getHabitIcon(habitName, props) {
     const iconMap = {
      // Health & Fitness
      "Пить воду": "water",
      "Хороший сон": "sleep",
      "Двигаться каждый день": "exercise",
      "Здоровое питание": "food",
      "Уход за телом": "health",
      "Силовая тренировка": "workout",
      "Бег": "running",
      "Ходьба": "walking",
      "Растяжка или йога": "yoga",
      "Медитация и дыхание": "meditation",

      // Growth / Развитие
      "Чтение": "book",
      "Обучение навыкам": "learning",
      "Иностранный язык": "language",
      "Ведение дневника": "journaling",
      "Рефлексия": "reflection",

      // Productivity / Продуктивность
      "Планирование дня": "planning",
      "Главная задача дня": "goal",
      "Работа по таймеру": "focus",
      "Разбор входящих": "inbox",
      "Вечерний обзор": "planning",

      // Relationships & Recreation / Отношения и отдых
      "Контакт с близкими": "phone",
      "Качественное общение": "friends",
      "Поддержка": "helping",
      "Активное слушание": "friends",
      "Благодарность": "gratitude",
      "Хобби": "hobby",
      "Прогулка": "walking",
      "Сознательный отдых": "meditation",
      "Творчество": "creativity",
      "Цифровой детокс": "focus",

      // Bad habits to quit / Вредные привычки
      "Сладкое и фастфуд": "food",
      "Поздний отход ко сну": "bedtime",
      "Прокрастинация": "focus",
      "Лишний экран": "mobile",
      "Нездоровые перекусы": "food",
      "Игры слишком много": "game",
      "Порно": "skull",
      "Курение": "skull",
      "Алкоголь": "wine",
    };


    const iconName = iconMap[habitName] || 'default';
    return this.getIcon(iconName, props);
  }

  /**
   * Get an emoji icon by name
   * @param {string} name - The name of the icon
   * @param {Object} props - Additional props like style
   * @returns {React.Element} A React span element with emoji
   */
  static getIcon(name, props = {}) {
    const emoji = this.ic[name] || this.ic.default;
    const { style = {}, ...otherProps } = props;

    return React.createElement(
      'span',
      {
        style: {
          fontSize: '1.5rem',
          lineHeight: 1,
          display: 'inline-block',
          filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5))',
          color: style.color || 'currentColor',
          ...style,
        },
        ...otherProps,
      },
      emoji
    );
  }
}

export default Icons;

