// math
import { saveData } from "../../StaticClasses/SaveHelper";
import { AppData } from "../../StaticClasses/AppData";
import { NotificationsManager } from "../../StaticClasses/NotificationsManager";

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
    elementsRange: [3, 4],           // Short sequences
    charShowMs: 1100,                 // Each char shown for 800ms
    retentionDelayMs: 500,          // 1s to recall after
    description: [
      'Короткие последовательности с медленным показом и короткой паузой.',
      'Short sequences, slow character display, short memory gap.'
    ],
    reverse: false,
  },
  {
    id: 'medium',
    level: ['средний', 'medium'],
    title: ['удерживаю и обновляю', 'hold and update'],
    elementsRange: [4, 6],
    charShowMs: 900,
    retentionDelayMs: 1500,
    description: [
      'Средние цепочки, умеренная скорость и пауза для тренировки рабочей памяти.',
      'Medium-length chains, moderate speed and delay to train working memory.'
    ],
    reverse: false,
  },
  {
    id: 'hard',
    level: ['сложно', 'hard'],
    title: ['сложные цепочки', 'complex chains'],
    elementsRange: [6, 12],
    charShowMs: 800,                 // Faster flashes
    retentionDelayMs: 3000,          // Longer retention challenge
    description: [
      'Длинные последовательности с быстрым показом и длительной паузой.',
      'Long sequences, fast character flashes, and a long retention gap.'
    ],
    reverse: true,
  },
  {
    id: 'max',
    level: ['про-режим', 'max pro'],
    title: ['PRO-режим', 'pro mode'],
    elementsRange: [8, 14],
    charShowMs: 700,                 // Very fast — almost subliminal
    retentionDelayMs: 4000,          // Max retention demand
    description: [
      'Максимальная нагрузка: молниеносный показ и долгая пауза без подсказок.',
      'Maximum load: rapid character flashes and extended silent retention.'
    ],
    reverse: true,
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
      'Цвет и число связаны правилом: чётность, чередование, шаг. Найди нарушителя.',
  'Color and number follow a joint rule: parity, alternation, or step. Find the outlier.'
    ],
    timeLimitSec: 25,
    description: [
  'Цвет и число связаны правилом: чётность, чередование, шаг. Найди нарушителя.',
  'Color and number follow a joint rule: parity, alternation, or step. Find the outlier.'
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
    targetSymbol: '★',
    targetsPerRoundRange: [2, 4],          // ↑ more targets
    totalItemsRange: [8, 12],              // ↑↑↑ was [4,6]
    timeLimitSec: 25,
    roundTimeSec: 10,
    presentation: 'static',
    distractorMotion: false,
    ruleShiftInterval: 0,
    description: [
      'Найди все ★ среди большого количества символов.',
      'Find all ★ among many symbols.'
    ],
  },
  {
    id: 'medium',
    level: ['средний', 'medium'],
    title: ['борьба с помехами', 'fight distractions'],
    targetSymbol: '★',
    targetsPerRoundRange: [3, 5],
    totalItemsRange: [14, 18],             // ↑↑↑ was [6,9]
    timeLimitSec: 30,
    roundTimeSec: 9,
    presentation: 'sequential',
    distractorMotion: false,
    ruleShiftInterval: 0,
    description: [
      'Еще больше символов. Сосредоточься, не теряй ★ из виду.',
      'Even more symbols. Stay focused—don’t lose track of ★.'
    ],
  },
  {
    id: 'hard',
    level: ['сложно', 'hard'],
    title: ['устойчивый фокус', 'sustained focus'],
    targetSymbol: '★',
    targetsPerRoundRange: [4, 7],
    totalItemsRange: [22, 28],             // ↑↑↑ was [8,12] → now very dense
    timeLimitSec: 35,
    roundTimeSec: 8,
    presentation: 'static',
    distractorMotion: true,
    ruleShiftInterval: 0,
    description: [
      'Высокая плотность символов. Только ★ статичны.',
      'High symbol density. Only ★ stay still.'
    ],
  },
  {
    id: 'max',
    level: ['про-режим', 'max pro'],
    title: ['фокус под давлением', 'focus under pressure'],
    targetSymbol: '★',
    targetsPerRoundRange: [5, 9],          // up to 9 targets!
    totalItemsRange: [26, 36],             // ↑↑↑ was [10,14] → now 32 max!
    timeLimitSec: 40,
    roundTimeSec: 7,
    presentation: 'sequential',
    distractorMotion: true,
    ruleShiftInterval: 3,
    description: [
      'Экстремальная нагрузка: до 32 символов! Цель может смениться.',
      'Extreme load: up to 32 symbols! Target may change mid-session.'
    ],
  },
];

export async function saveSessionDuration(duration,hasRecord,cat,ind,record) {
  if (hasRecord) {
    AppData.mentalRecords[cat][ind] = record;
    NotificationsManager.sendMessage('setmentalrecords',JSON.stringify(AppData.mentalRecords))
  }
  const today = new Date().toISOString().split('T')[0];
  
  if (AppData.mentalLog[today]) {
    AppData.mentalLog[today] += duration;
  } else {
    AppData.mentalLog[today] = duration;
  }
   await saveData();
}