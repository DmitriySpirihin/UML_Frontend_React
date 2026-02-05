import React from 'react';
import { Colors } from './Colors';

class Icons {
  static ic = {
    // ===== Default & General =====
    'default': '🙂',
    'star': '⭐',
    'clock': '⏰',
    'calendar': '📅',
    'search': '🔍',
    'settings': '⚙️',
    'gift': '🎁',
    
    // ===== Health & Fitness =====
    'health': '💪',
    'meditation': '🧘',
    'workout': '🏋️',
    'running': '🏃',
    'exercise': '🏃‍♂️',
    'yoga': '🧘‍♂️',
    'walking': '🚶',
    'pulse': '💓',
    'pill': '💊',
    'sleep': '😴',
    'bedtime': '🌙',
    'wakeup': '🌅',
    'zzz': '💤',
    
    // ===== Nutrition =====
    'food': '🍎',
    'meal': '🍲',
    'cooking': '🍳',
    'water': '💧',
    'coffee': '☕',
    'tea': '🍵',
    
    // ===== Personal Development =====
    'reading': '📖',
    'learning': '🧠',
    'journaling': '📓',
    'planning': '🗓️',
    'goals': '🎯',
    'idea': '💡',
    'success': '🏆',
    
    // ===== Work & Study =====
    'work': '💼',
    'study': '📚',
    'school': '🏫',
    'onlineCourse': '🖥️',
    'research': '🔬',
    
    // ===== Hobbies & Entertainment =====
    'hobby': '🎨',
    'music': '🎵',
    'movies': '🎬',
    'games': '🎮',
    'art': '🎨',
    'writing': '✍️',
    'photography': '📸',
    
    // ===== Social & Relationships =====
    'family': '👨‍👩‍👧‍👦',
    'friends': '👥',
    'social': '📱',
    'date': '❤️',
    'love': '💖',
    'gratitude': '🙏',
    
    // ===== Finance =====
    'money': '💰',
    'budget': '📉',
    'investment': '💹',
    'dollar': '💵',
    'creditCard': '💳',
    'wallet': '👛',
    
    // ===== Home & Chores =====
    'home': '🏠',
    'cleaning': '🧽',
    'laundry': '👕',
    'grocery': '🛒',
    'garden': '🌱',
    'cooking': '🍳',
    
    // ===== Languages =====
    'english': '🇬🇧',
    'russian': '🇷🇺',
    'spanish': '🇪🇸',
    'french': '🇫🇷',
    'german': '🇩🇪',
    'italian': '🇮🇹',
    'portuguese': '🇵🇹',
    'chinese': '🇨🇳',
    'japanese': '🇯🇵',
    'korean': '🇰🇷',
    'arabic': '🇸🇦',
    'hindi': '🇮🇳',
    'turkish': '🇹🇷',
    'polish': '🇵🇱',
    'dutch': '🇳🇱',
    'swedish': '🇸🇪',
    'norwegian': '🇳🇴',
    'danish': '🇩🇰',
    'finnish': '🇫🇮',
    'czech': '🇨🇿',
    'greek': '🇬🇷',
    'hebrew': '🇮🇱',
    'thai': '🇹🇭',
    'vietnamese': '🇻🇳',
    'indonesian': '🇮🇩',
    
    // ===== Negative / Prohibition =====
    'forbidden': '🚫',
    'noSmoking': '🚭',
    'noAlcohol': '🚯',
    'noMobile': '📵',
    'warning': '⚠️',
    'fail': '❌',
    
    // ===== Transportation =====
    'bike': '🚲',
    'car': '🚗',
    'bus': '🚌',
    'train': '🚂',
    'plane': '✈️',
    'ship': '🚢',
    
    // ===== Sports =====
    'basketball': '🏀',
    'soccer': '⚽',
    'tennis': '🎾',
    'golf': '⛳',
    'swimming': '🏊',
    'boxing': '🥊',
    'cycling': '🚴',
    'skiing': '⛷️',
    
    // ===== Creative =====
    'musicNote': '🎵',
    'headphones': '🎧',
    'piano': '🎹',
    'guitar': '🎸',
    'dance': '💃',
    
    // ===== Technology =====
    'app': '📱',
    'computer': '💻',
    'internet': '🌐',
    'code': '💻',
    
    // ===== Mental Health =====
    'therapy': '💬',
    'breathing': '🌬️',
    'calm': '☮️',
    'peace': '🕊️',
    'mindfulness': '🌸',
  };

  static getHabitIcon(habitName, props) {
    const iconMap = {
      // Health & Fitness
      "Пить воду": "water",
      "Хороший сон": "sleep",
      "Двигаться каждый день": "exercise",
      "Здоровое питание": "food",
      "Силовая тренировка": "workout",
      "Бег": "running",
      "Ходьба": "walking",
      "Растяжка или йога": "yoga",
      "Медитация": "meditation",
      
      // Learning & Development
      "Чтение": "reading",
      "Обучение навыкам": "learning",
      "Ведение дневника": "journaling",
      "Рефлексия": "planning",
      
      // Productivity
      "Планирование дня": "planning",
      "Главная задача дня": "goals",
      "Работа по таймеру": "clock",
      
      // Languages
      "Изучение английского": "english",
      "Изучение русского": "russian",
      "Изучение испанского": "spanish",
      "Изучение французского": "french",
      "Изучение немецкого": "german",
      "Изучение итальянского": "italian",
      "Изучение португальского": "portuguese",
      "Изучение китайского": "chinese",
      "Изучение японского": "japanese",
      "Изучение корейского": "korean",
      "Изучение арабского": "arabic",
      "Изучение хинди": "hindi",
      "Изучение турецкого": "turkish",
      "Изучение польского": "polish",
      "Изучение голландского": "dutch",
      "Изучение шведского": "swedish",
      "Изучение норвежского": "norwegian",
      "Изучение датского": "danish",
      "Изучение финского": "finnish",
      "Изучение чешского": "czech",
      "Изучение греческого": "greek",
      "Изучение иврита": "hebrew",
      "Изучение тайского": "thai",
      "Изучение вьетнамского": "vietnamese",
      "Изучение индонезийского": "indonesian",
      
      // Relationships & Recreation
      "Контакт с близкими": "family",
      "Качественное общение": "friends",
      "Благодарность": "gratitude",
      "Хобби": "hobby",
      "Сознательный отдых": "meditation",
      "Творчество": "art",
      "Музыка": "music",
      "Фильмы": "movies",
      
      // Bad habits to quit
      "Курение": "noSmoking",
      "Алкоголь": "noAlcohol",
      "Лишние гаджеты": "noMobile",
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

