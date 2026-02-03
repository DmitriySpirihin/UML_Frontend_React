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
  'tools': '🛠️',
  'gift': '🎁',
  'shopping': '🛍️',
  'store': '🏪',
  'box': '📦',
  'boxes': '🗃️',
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

  // ===== Health & Fitness =====
  'health': '💪',
  'meditation': '🧘',
  'workout': '🏋️',
  'running': '🏃',
  'exercise': '🏃‍♂️',
  'stretching': '🧘‍♀️',
  'walking': '🚶',
  'yoga': '🧘‍♂️',
  'pulse': '💓',
  'hospital': '🏥',
  'pill': '💊',
  'syringe': '💉',
  'bandage': '🩹',
  'thermometer': '🌡️',
  'stethoscope': '🩺',
  'mask': '😷',
  'tooth': '🦷',
  'eye': '👁️',
  'ear': '👂',
  'brain': '🧠',
  'bone': '🦴',
  'dna': '🧬',
  'microbe': '🦠',

  // ===== Nutrition =====
  'food': '🍎',
  'fruit': '🍇',
  'vegetable': '🥕',
  'meal': '🍲',
  'cooking': '🍳',
  'water': '💧',
  'coffee': '☕',
  'tea': '🍵',
  'juice': '🧃',
  'beer': '🍺',
  'cocktail': '🍸',
  'cake': '🎂',
  'bread': '🍞',
  'cheese': '🧀',
  'egg': '🥚',
  'butter': '🧈',
  'pizza': '🍕',
  'hamburger': '🍔',
  'fries': '🍟',
  'sushi': '🍣',
  'iceCream': '🍦',
  'cookie': '🍪',
  'candy': '🍬',
  'chocolate': '🍫',
  'popcorn': '🍿',
  'bento': '🍱',
  'dumpling': '🥟',
  'salad': '🥗',
  'bowl': '🥣',

  // ===== Personal Development =====
  'reading': '📖',
  'learning': '🧠',
  'journaling': '📓',
  'planning': '🗓️',
  'goals': '🎯',
  'idea': '💡',
  'inspiration': '✨',
  'success': '🏆',
  'trophy': '🏆',
  'medal': '🏅',
  'certificate': '🎖️',
  'lightbulb': '💡',

  // ===== Sleep & Routine =====
  'sleep': '😴',
  'wakeup': '🌅',
  'bedtime': '🌙',
  'alarm': '⏰',
  'morning': '☀️',
  'night': '🌙',
  'dream': '💭',
  'zzz': '💤',
  'moonCrescent': '🌙',
  'moonFull': '🌕',

  // ===== Work & Study =====
  'work': '💼',

  // ===== Hobbies & Activities =====
  'pet': '🐕',
  'cat': '🐈',
  'bird': '🐦',
  'fish': '🐠',
  'rabbit': '🐇',
  'octopus': '🐙',
  'butterfly': '🦋',
  'bee': '🐝',
  'ant': '🐜',
  'spider': '🕷️',
  'scorpion': '🦂',
  'snail': '🐌',
  'crab': '🦀',
  'lobster': '🦞',
  'shrimp': '🦐',
  'squid': '🦑',
  'dinosaur': '🦖',
  'dragon': '🐉',
  'unicorn': '🦄',
  'phoenix': '🐦‍🔥',
  'fairy': '🧚',
  'mermaid': '🧜‍♀️',
  'alien': '👽',
  'basketball': '🏀',
  'soccer': '⚽',
  'baseball': '⚾',
  'golf': '⛳',
  'ski': '🎿',
  'snowboard': '🏂',
  'skateboard': '🛹',
  'surf': '🏄',
  'kayak': '🛶',
  'parachute': '🪂',
  'hotAirBalloon': '🎈',
  'rocket': '🚀',
  'satellite': '🛰️',
  'ufo': '🛸',

  // ===== Productivity =====
  'task': '📅',
  'reminder': '🔔',
  'tracker': '📊',
  'priorityLow': '🔽',

  // ===== Social & Relationships =====
  'family': '👨‍👩‍👧‍👦',
  'social': '📲',
  'date': '❤️',
  'couple': '💑',
  'love': '💖',
  'kiss': '💏',
  'wedding': '💒',
  'baby': '👶',
  'pregnant': '🤰',
  'elderly': '🧓',
  'child': '🧒',

  // ===== Finance =====
  'budget': '📉',
  'investment': '💹',
  'dollar': '💵',
  'euro': '💶',
  'pound': '💷',
  'yen': '💴',
  'creditCard': '💳',
  'coin': '🪙',
  'piggyBank': '🐖',
  'bank': '🏦',
  'wallet': '👛',
  'receipt': '🧾',

  // ===== Home & Chores =====
  'cleaning': '🧽',
  'laundry': '👚',
  'grocery': '🛒',
  'garden': '🌿',
  'bed': '🛏️',
  'couch': '🛋️',
  'door': '🚪',
  'stairs': '🪜',
  'elevator': '🛗',
  'garage': '🧱',
  'mailbox': '📬',
  'doorbell': '🔔',
  'vacuum': '🧹',
  'dishwasher': '🍽️',
  'oven': '🔥',
  'microwave': '🍲',
  'fridge': '🧊',
  'washingMachine': '🧺',

  // ===== Mental Health =====
  'gratitude': '🙏',
  'therapy': '💬',
  'breathing': '🌬️',
  'journal': '📓',
  'calm': '☮️',
  'peace': '🕊️',
  'hope': '🌈',
  'comfort': '🫂',

  // ===== Education =====
  'school': '🏫',
  'onlineCourse': '🖥️',
  'research': '🔍',
  'microscope': '🔬',
  'testTube': '🧪',
  'atom': '⚛️',
  'bookStack': '📚',
  'gradCap': '🎓',

  // ===== Technology =====
  'app': '📱',
  'photo': '📸',
  'printer': '🖨️',
  'router': '📡',
  'hardDrive': '💾',

  // ===== Creative =====
  'art': '🎨',
  'write': '✍️',
  'dance': '💃',
  'craft': '✂️',
  'sculpture': '🗿',
  'film': '📽️',
  'musicNote': '🎵',
  'headphones': '🎧',
  'microphone': '🎤',
  'piano': '🎹',
  'violin': '🎻',
  'drum': '🥁',
  'saxophone': '🎷',
  'trumpet': '🎺',
  'flute': '🎶',

  // ===== Spiritual =====
  'prayer': '🙏',
  'yoga': '🧘',
  'meditation': '🕉️',
  'reflection': '🌙',
  'angel': '😇',
  'halo': '👼',
  'cross': '✝️',
  'starOfDavid': '✡️',
  'om': '🕉️',
  'yinYang': '☯️',


  // ===== Household =====
  'bath': '🛁',
  'shower': '🚿',
  'toilet': '🚽',
  'toilet_paper': '🧻',
  'soap': '🧼',
  'hands_wash': '🧽',
  'mirror': '🪞',
  'comb': '🪮',
  'razor': '🪒',
  'toothbrush': '🪥',
  'scale': '⚖️',
  'partyFace': '🥳',
  'alienFace': '👾',
  'robotFace': '🤖',
  'ghost': '👻',
  'skullCrossbones': '☠️',
    // ===== Negative / Warning / Prohibition =====
  'forbidden': '🚫',
  'noSmoking': '🚭',
  'noAlcohol': '🚯', // Note: 🚯 is "litter in bin", but commonly used; true "no alcohol" is 🍷❌ – but emoji doesn't exist. Alternative below.
  'noDrinking': '🚱', // Non-potable water (often repurposed)
  'noEntry': '⛔',
  'noBicycle': '🚳',
  'noPedestrians': '🚷',
  'noMobile': '📵',
  'porn':'🔞',
  'bomb': '💣',
  'fire': '🔥', // Can be negative (danger) or positive (trending) — context-dependent
  'hazard': '⚠️',
  'fail': '❎',
  'xMark': '❌',
  'negative': '➖',
  'downwardTrend': '📉',
  'wastebasket': '🗑️',
  'litter': '🚯',
  'sick': '🤒',
  'virus': '🦠',
  'nauseatedFace': '🤢',
  'faceVomiting': '🤮',
  'dizzyFace': '😵',
  'deadFace': '😵‍💫',
  'angryFace': '😠',
  'poutingFace': '😡',
  'cryingFace': '😢',
  'loudlyCryingFace': '😭',
  'fearfulFace': '😨',
  'anxiousFace': '😰',
  'coldSweat': '😓',
  'disappointedFace': '😞',
  'confoundedFace': '😖',
  'perseveringFace': '😣',
  'wearyFace': '😩',
  'cracked': '💔',
  'unhealthy': '🤢',
  'cigarette': '🚬',
  'alcohol': '🍷', // Neutral, but can imply negative in habit trackers
  'drugs': '💊', // Ambiguous — use carefully
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
      "Лишний экран": "noMobile",
      "Нездоровые перекусы": "food",
      "Игры слишком много": "game",
      "Порно": "porn",
      "Курение": "noSmoking",
      "Алкоголь": "noAlcohol",
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

