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
      'Игра до первой ошибки.',
      'Play until first mistake.',
    ],
    timeLimitSec: 30,           // или глобальный лимит
    operations: 'A+B, A-B, A×B, A/B, √A',
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
    operations: 'A+B, A-B, A×B, A/B, √A',
  },
];

export const memorySequenceLevels = [
  {
    id: 'easy',
    level: ['легко', 'easy'],
    title: ['разогрев памяти', 'memory warm-up'],
    elementsRange: [3, 4],
    memorizeTimeSecRange: [10, 4],
    description: [
      'Короткие последовательности для лёгкого разогрева.',
      'Short sequences to gently warm up your memory.',
    ],
  },
  {
    id: 'medium',
    level: ['средний', 'medium'],
    title: ['удерживаю и обновляю', 'hold and update'],
    elementsRange: [5, 8],
    memorizeTimeSecRange: [12, 8],
    description: [
      'Более длинные цепочки и несколько повторов для тренировки удержания.',
      'Longer chains and multiple repeats to train holding information.',
    ],
  },
  {
    id: 'hard',
    level: ['сложно', 'hard'],
    title: ['сложные цепочки', 'complex chains'],
    elementsRange: [6, 12],
    memorizeTimeSecRange: [8, 6],
    description: [
      'Длинные последовательности с помехами и усложнённым повтором.',
      'Long sequences with interference and more demanding repetition.',
    ],
  },
  {
    id: 'max',
    level: ['про-режим', 'max pro'],
    title: ['PRO-режим', 'pro mode'],
    elementsRange: [8, 16],
    memorizeTimeSecRange: [5, 3],
    description: [
      'Максимальная нагрузка: длинные цепочки, реверс и помехи.',
      'Maximum load: long chains, reverse input and interference.',
    ],
  },
];
export const logicOddOneOutLevels = [
  {
    id: 'easy',
    level: ['легко', 'easy'],
    title: ['найди лишний', 'find the odd one'],
    itemsCountRange: [4, 5], // сколько элементов в ряду
    rules: [
      'Все элементы одного типа, кроме одного (форма/цвет/число).',
      'All items share one feature except a single odd one.',
    ],
    timeLimitSec: 20,
    description: [
      'Простые ряды: один элемент отличается цветом, формой или числом.',
      'Simple rows: one item differs by color, shape or number.',
    ],
  },
  {
    id: 'medium',
    level: ['средний', 'medium'],
    title: ['ловлю закономерность', 'spot the pattern'],
    itemsCountRange: [5, 6],
    rules: [
      'Последовательность по правилу (рост/убывание, +2, ×3), один элемент нарушает правило.',
      'Sequence follows a rule (+2, ×3, ascending/descending), one item breaks it.',
    ],
    timeLimitSec: 25,
    description: [
      'Числовые и визуальные последовательности с одним нарушителем правила.',
      'Number and visual patterns with one rule-breaking element.',
    ],
  },
  {
    id: 'hard',
    level: ['сложно', 'hard'],
    title: ['сложные закономерности', 'complex patterns'],
    itemsCountRange: [6, 7],
    rules: [
      'Комбинированные правила (цвет + позиция, чётность + интервал), один элемент не вписывается.',
      'Combined rules (color + position, parity + step), one item does not fit.',
    ],
    timeLimitSec: 25,
    description: [
      'Многоуровневые последовательности, где нужно удержать сразу несколько признаков.',
      'Multi-layer patterns where several features must be tracked at once.',
    ],
  },
  {
    id: 'max',
    level: ['про-режим', 'max pro'],
    title: ['логический вызов', 'logic challenge'],
    itemsCountRange: [7, 9],
    rules: [
      'Скрытые или меняющиеся правила, возможен реверс или смена паттерна посередине.',
      'Hidden or shifting rules; pattern may reverse or change midway.',
    ],
    timeLimitSec: 30,
    description: [
      'Самые сложные ряды с меняющимися правилами и одним неверным элементом.',
      'The toughest rows with changing rules and a single incorrect item.',
    ],
  },
];
export const focusTrainingLevels = [
  {
    id: 'easy',
    level: ['легко', 'easy'],
    title: ['фокус на цели', 'target focus'],
    targetsPerRoundRange: [1, 2],      // сколько целевых стимулов
    itemsOnScreenRange: [4, 6],        // всего стимулов
    timeLimitSec: 20,
    description: [
      'Найди один-два целевых символа среди небольшого числа отвлекающих.',
      'Find one or two target symbols among a few distractors.',
    ],
  },
  {
    id: 'medium',
    level: ['средний', 'medium'],
    title: ['борьба с помехами', 'fight distractions'],
    targetsPerRoundRange: [1, 3],
    itemsOnScreenRange: [6, 9],
    timeLimitSec: 20,
    description: [
      'Больше отвлекающих элементов, выше скорость появления стимулов.',
      'More distractors and higher stimulus appearance speed.',
    ],
  },
  {
    id: 'hard',
    level: ['сложно', 'hard'],
    title: ['устойчивый фокус', 'sustained focus'],
    targetsPerRoundRange: [2, 4],
    itemsOnScreenRange: [8, 12],
    timeLimitSec: 15,
    description: [
      'Быстрые сменяющиеся стимулы, нужно удерживать внимание и не кликать по лишним.',
      'Rapidly changing stimuli; keep attention and avoid clicking wrong ones.',
    ],
  },
  {
    id: 'max',
    level: ['про-режим', 'max pro'],
    title: ['фокус под давлением', 'focus under pressure'],
    targetsPerRoundRange: [3, 5],
    itemsOnScreenRange: [10, 14],
    timeLimitSec: 15,
    description: [
      'Максимум помех, перемена правил и высокая скорость появления целей.',
      'Maximum interference, rule shifts and very fast target appearance.',
    ],
  },
];
