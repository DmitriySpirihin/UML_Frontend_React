// math
export const quickMathCategories = [
  // Обычные уровни
  {
    level: ['начальный', 'novice'],
    difficulty: ['легко', 'easy'],
    description: [
      'Базовые примеры на сложение и вычитание для разогрева.',
      'Basic addition and subtraction tasks to warm up.',
    ],
    timeLimitSec: 30,
    operations: 'A+B, A-B',
  },
  {
    level: ['средний', 'intermediate'],
    difficulty: ['нормально', 'medium'],
    description: [
      'Смешанные примеры с умножением и делением.',
      'Mixed multiplication and division problems.',
    ],
    timeLimitSec: 25,
    operations: 'A+B, A-B, A×B, A/B',
  },
  {
    level: ['продвинутый', 'advanced'],
    difficulty: ['сложно', 'hard'],
    description: [
      'Сложные выражения с приоритетами операций.',
      'Challenging expressions with operator precedence.',
    ],
    timeLimitSec: 25,
    operations: 'A+B, A-B, A×B, A/B, √A, A^',
  },
  {
    level: ['безумный', 'insane'],
    difficulty: ['максимум', 'max'],
    description: [
      'Максимальная скорость и самые сложные примеры.',
      'Maximum speed and the toughest problems.',
    ],
    timeLimitSec: 30,
    operations: 'A+B, A-B, A×B, A/B, √A, LOG, A^, X',
  },
  // Endless
  {
    level: ['без конца', 'endless'],
    difficulty: ['челлендж', 'challenge'],
    description: [
      'Игра до первой ошибки или окончания времени.',
      'Play until first mistake or time runs out.',
    ],
    timeLimitSec: null,           // или глобальный лимит
    operations: 'A+B, A-B, A×B, A/B, √A, LOG, A^ , X',
  },

  // Relax
  {
    level: ['без таймера', 'relax'],
    difficulty: ['спокойно', 'relaxed'],
    description: [
      'Тренировка без таймера и штрафа за ошибки.',
      'Practice without timer and penalty for mistakes.',
    ],
    timeLimitSec: null,
    operations: 'A+B, A-B, A×B, A/B, √A, LOG, A^',
  },
];

export const mentalRecords = [[500,0,0,0,3000,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]
