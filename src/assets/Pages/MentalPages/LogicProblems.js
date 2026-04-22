// ================ LEVEL CONFIG (your structure) ================
export const logicOddOneOutLevels = [
  {
    id: 'easy',
    level: ['легко', 'easy'],
    title: ['найди лишний', 'find the odd one'],
    itemsCountRange: [4, 5],
    rules: ['Все элементы одного типа, кроме одного (форма/цвет/число).', 'All items share one feature except a single odd one.'],
    timeLimitSec: 20,
    description: ['Простые ряды: один элемент отличается цветом, формой или числом.', 'Simple rows: one item differs by color, shape or number.'],
  },
  {
    id: 'medium',
    level: ['средний', 'medium'],
    title: ['ловлю закономерность', 'spot the pattern'],
    itemsCountRange: [5, 6],
    rules: ['Последовательность по правилу (рост/убывание, +2, ×3), один элемент нарушает правило.', 'Sequence follows a rule (+2, ×3, ascending/descending), one item breaks it.'],
    timeLimitSec: 25,
    description: ['Числовые и визуальные последовательности с одним нарушителем правила.', 'Number and visual patterns with one rule-breaking element.'],
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
    rules: ['Скрытые или меняющиеся правила, возможен реверс или смена паттерна посередине.', 'Hidden or shifting rules; pattern may reverse or change midway.'],
    timeLimitSec: 30,
    description: ['Самые сложные ряды с меняющимися правилами и одним неверным элементом.', 'The toughest rows with changing rules and a single incorrect item.'],
  },
];

// ================ HELPERS ================
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const SHAPES = ['circle', 'square', 'triangle', 'hexagon'];
const COLOR_FAMILIES = {
  reds:    ['#e63946', '#d90429', '#f15a5a', '#c1121f'],
  blues:   ['#1d3557', '#3a5ea5', '#4a7bb7', '#6c9bcf'],
  greens:  ['#2a9d8f', '#264653', '#2d6a4f', '#4c956c'],
  purples: ['#7b2cbf', '#5a189a', '#9d4edd', '#c77dff'],
  oranges: ['#e76f51', '#f4a261', '#e9c46a', '#f28482'],
  cyans:   ['#00b4d8', '#0096c7', '#0077b6', '#023e8a'],
};
const getRandomColorFromAnyFamily = () => {
  const families = Object.values(COLOR_FAMILIES);
  const randomFamily = families[randomInt(0, families.length - 1)];
  return randomFamily[randomInt(0, randomFamily.length - 1)];
};
// ================ PROBLEM GENERATORS ================

const getEasyProblem = (stage) => {
  const count = randomInt(...logicOddOneOutLevels[0].itemsCountRange);
  const oddIndex = randomInt(0, count - 1);

  const deviationType = ['color', 'shape', 'value'][randomInt(0, 2)];

  if (deviationType === 'value') {
    const baseValue = randomInt(8 + stage, 18 + stage);
    const delta = randomInt(2, 4) * (Math.random() > 0.5 ? 1 : -1);
    const oddValue = baseValue + delta;
    const items = Array(count).fill().map((_, i) =>
      i === oddIndex ? oddValue : baseValue
    );
    return [items, String(oddIndex + 1)];
  } else if (deviationType === 'shape') {
    const baseShape = SHAPES[randomInt(0, SHAPES.length - 1)];
    const otherShapes = SHAPES.filter(s => s !== baseShape);
    const oddShape = otherShapes[Math.floor(Math.random() * otherShapes.length)];
    const baseColor = getRandomColorFromAnyFamily(); // any color, same for all

    const items = Array(count).fill().map((_, i) => ({
      shape: i === oddIndex ? oddShape : baseShape,
      color: baseColor,
    }));
    return [items, String(oddIndex + 1)];
  } else { // deviationType === 'color'
    // ✅ Pick a random color family
    const families = Object.keys(COLOR_FAMILIES);
    const familyKey = families[randomInt(0, families.length - 1)];
    const family = COLOR_FAMILIES[familyKey];
    
    // Pick two DIFFERENT but SIMILAR colors from the same family
    const color1Index = randomInt(0, family.length - 1);
    let color2Index;
    do {
      color2Index = randomInt(0, family.length - 1);
    } while (color2Index === color1Index && family.length > 1);
    
    const baseColor = family[color1Index];
    const oddColor = family[color2Index];
    const baseShape = SHAPES[randomInt(0, SHAPES.length - 1)];

    const items = Array(count).fill().map((_, i) => ({
      shape: baseShape,
      color: i === oddIndex ? oddColor : baseColor,
    }));
    
    return [items, String(oddIndex + 1)];
  }
};

const getMediumProblem = (stage) => {
  const count = randomInt(...logicOddOneOutLevels[1].itemsCountRange);
  const oddIndex = randomInt(1, count - 2); // avoid ends for fairness

  const ruleType = ['add', 'mult', 'asc'][randomInt(0, 2)];
  let sequence = [];
  let base, step;

  if (ruleType === 'add') {
    base = randomInt(2 + stage, 8 + stage);
    step = randomInt(2, 5);
    sequence = Array(count).fill().map((_, i) => base + i * step);
  } else if (ruleType === 'mult') {
    base = randomInt(2, 4);
    step = randomInt(2, 4);
    sequence = Array(count).fill().map((_, i) => base * Math.pow(step, i));
  } else {
    // ascending distinct
    base = randomInt(1 + stage, 5 + stage);
    sequence = Array(count).fill().map((_, i) => base + i + randomInt(0, 1));
    // Ensure mostly sorted
    sequence.sort((a, b) => a - b);
  }

  // Introduce error
  const correctValue = sequence[oddIndex];
  const error = randomInt(3, 10) * (Math.random() > 0.5 ? 1 : -1);
  sequence[oddIndex] = correctValue + error;

  return [sequence, String(oddIndex + 1)];
};

const getHardProblem = (stage) => {
  const count = randomInt(...logicOddOneOutLevels[2].itemsCountRange);
  const oddIndex = randomInt(1, count - 2); // avoid edges for fairness

  // Pick a rule type
  const ruleType = randomInt(0, 2);

  let items = [];
  let baseValue, step;

  if (ruleType === 0) {
    // Rule: Alternating color (R/B) + arithmetic sequence (+step)
    baseValue = randomInt(5 + stage, 10 + stage);
    step = randomInt(3, 6);
    const colors = ['red', 'blue'];
    
    items = Array(count).fill().map((_, i) => ({
      value: baseValue + i * step,
      color: colors[i % 2]
    }));

    // Break: flip color OR add noise to value
    if (Math.random() > 0.5) {
      items[oddIndex].color = items[oddIndex].color === 'red' ? 'blue' : 'red';
    } else {
      const noise = randomInt(2, 8) * (Math.random() > 0.5 ? 1 : -1);
      items[oddIndex].value += noise;
    }

  } else if (ruleType === 1) {
    // Rule: Red → even numbers, Blue → odd numbers; values increase steadily
    baseValue = randomInt(4 + stage, 8 + stage);
    step = randomInt(2, 4);
    
    items = Array(count).fill().map((_, i) => {
      const rawValue = baseValue + i * step;
      const isEven = rawValue % 2 === 0;
      const color = isEven ? 'red' : 'blue';
      return { value: rawValue, color };
    });

    // Break: flip color (so red=odd or blue=even)
    items[oddIndex].color = items[oddIndex].color === 'red' ? 'blue' : 'red';

  } else {
    // Rule: All numbers even, colors alternate in groups of 2: [R,R,B,B,R,R...]
    baseValue = randomInt(6 + stage, 12 + stage) * 2; // ensure even
    step = randomInt(2, 5) * 2; // even step
    
    items = Array(count).fill().map((_, i) => {
      const value = baseValue + i * step;
      const groupIndex = Math.floor(i / 2) % 2;
      const color = groupIndex === 0 ? 'red' : 'blue';
      return { value, color };
    });

    // Break: flip color OR make number odd
    if (Math.random() > 0.5) {
      items[oddIndex].color = items[oddIndex].color === 'red' ? 'blue' : 'red';
    } else {
      items[oddIndex].value += 1; // make odd
    }
  }

  return [items, String(oddIndex + 1)];
};

const getMaxProblem = (stage) => {
  const count = randomInt(...logicOddOneOutLevels[3].itemsCountRange);
  const oddIndex = randomInt(2, count - 3); // avoid edges

  // First half: +3, second half: ×2
  const mid = Math.floor(count / 2);
  const start = randomInt(2 + stage, 6 + stage);
  const items = [];

  // Build first half
  for (let i = 0; i < mid; i++) {
    items.push(start + i * 3);
  }

  // Build second half from last of first half
  let current = items[items.length - 1] * 2;
  for (let i = mid; i < count; i++) {
    items.push(current);
    current *= 2;
  }

  // Corrupt one item in second half
  if (oddIndex >= mid) {
    const trueVal = items[oddIndex];
    items[oddIndex] = trueVal + randomInt(5, 20) * (Math.random() > 0.5 ? 1 : -1);
  } else {
    // Or corrupt first half
    const trueVal = items[oddIndex];
    items[oddIndex] = trueVal + randomInt(2, 6) * (Math.random() > 0.5 ? 1 : -1);
  }

  return [items, String(oddIndex + 1)];
};

// ================ MAIN ENTRY ================

export function getProblem(type, difficulty, stage) {
  if (type !== 2) return [[], '0']; // ✅ safe default

  switch (difficulty) {
    case 0: return getEasyProblem(stage) || [[], '0'];
    case 1: return getMediumProblem(stage) || [[], '0'];
    case 2: return getHardProblem(stage) || [[], '0'];
    case 3: return getMaxProblem(stage) || [[], '0'];
    default: return [[], '0'];
  }
}

// ================ SCORING (unchanged, but clarified) ================

export function getPoints(type, difficulty, stage, time, rightAnswer, yourAnswer, streakLength) {
  const baseScores = [100, 200, 300, 400];
  const base = baseScores[difficulty] || 100;

  // For "odd one out", only exact match counts
  const closeness = (type === 2 && yourAnswer === rightAnswer) ? 1 : 0;

  const stageMultiplier = Math.min(1 + stage * 0.02, 1.3);
  const timeSec = time / 1000;
  const expectedTime = logicOddOneOutLevels[difficulty]?.timeLimitSec || 20;
  const timeNorm = Math.min(timeSec / expectedTime, 2);
  const timeMultiplier = closeness === 1 ? Math.max(1.3 - (timeNorm - 1) * 0.3, 1) : 1;

  const streakMultiplier = closeness === 1 && streakLength >= 5
    ? Math.min(1 + 0.1 * Math.min(streakLength / 10, 4), 1.5)
    : 1;

  return Math.round(base * closeness * stageMultiplier * timeMultiplier * streakMultiplier);
}

export function hasStreak(type, rightAnswer, yourAnswer) {
  return type === 2 && yourAnswer === rightAnswer;
}

export function getPrecision(type, rightAnswer, yourAnswer) {
  return type === 2 ? (yourAnswer === rightAnswer ? 0 : 1) : 0;
}

const SHAPE_NAMES = {
  ru:  { circle: 'круг', square: 'квадрат', triangle: 'треугольник', hexagon: 'шестиугольник' },
  en:  { circle: 'circle', square: 'square', triangle: 'triangle', hexagon: 'hexagon' },
};

export function getLogicExplanation(items, correctIndex, langIndex) {
  if (!items || items.length === 0 || correctIndex < 1) return '';
  const ru = langIndex === 0;
  const oddIdx = correctIndex - 1;
  const oddItem = items[oddIdx];
  const others = items.filter((_, i) => i !== oddIdx);
  if (!oddItem || others.length === 0) return '';

  // --- Pure numbers ---
  if (typeof oddItem === 'number') {
    const allSame = others.every(v => v === others[0]);
    if (allSame) {
      return ru
        ? `Все остальные числа равны ${others[0]}, а элемент №${correctIndex} = ${oddItem}.`
        : `All others equal ${others[0]}, but item #${correctIndex} = ${oddItem}.`;
    }
    // Detect arithmetic step
    const diffs = [];
    for (let i = 1; i < others.length; i++) diffs.push(others[i] - others[i - 1]);
    const step = diffs[0];
    if (diffs.every(d => d === step)) {
      return ru
        ? `Шаг между остальными числами: ${step > 0 ? '+' : ''}${step}. Число ${oddItem} нарушает правило.`
        : `The step between other numbers is ${step > 0 ? '+' : ''}${step}. ${oddItem} breaks this rule.`;
    }
    return ru
      ? `Число ${oddItem} (элемент №${correctIndex}) не вписывается в числовой ряд.`
      : `Number ${oddItem} (item #${correctIndex}) doesn't fit the sequence.`;
  }

  // --- Objects (shape / color / value) ---
  if (typeof oddItem === 'object') {
    const shapeNames = ru ? SHAPE_NAMES.ru : SHAPE_NAMES.en;
    const reasons = [];

    // Color check
    if (oddItem.color !== undefined) {
      const otherColors = others.map(o => o.color);
      const dominantColor = otherColors[0];
      if (otherColors.every(c => c === dominantColor) && oddItem.color !== dominantColor) {
        reasons.push(ru ? `другой цвет` : `different color`);
      }
    }
    // Shape check
    if (oddItem.shape !== undefined) {
      const otherShapes = others.map(o => o.shape);
      const dominantShape = otherShapes[0];
      if (otherShapes.every(s => s === dominantShape) && oddItem.shape !== dominantShape) {
        const nameCurr = shapeNames[oddItem.shape] || oddItem.shape;
        const nameOther = shapeNames[dominantShape] || dominantShape;
        reasons.push(ru ? `другая форма (${nameCurr} вместо ${nameOther})` : `different shape (${nameCurr} instead of ${nameOther})`);
      }
    }
    // Value check
    if (oddItem.value !== undefined) {
      const otherVals = others.map(o => o.value);
      const allSameVal = otherVals.every(v => v === otherVals[0]);
      if (!allSameVal) {
        const diffs2 = [];
        for (let i = 1; i < otherVals.length; i++) diffs2.push(otherVals[i] - otherVals[i - 1]);
        const step2 = diffs2[0];
        if (diffs2.every(d => d === step2)) {
          reasons.push(ru
            ? `значение ${oddItem.value} нарушает шаг ${step2 > 0 ? '+' : ''}${step2}`
            : `value ${oddItem.value} breaks the step ${step2 > 0 ? '+' : ''}${step2}`);
        } else {
          reasons.push(ru ? `значение ${oddItem.value} не вписывается в ряд` : `value ${oddItem.value} doesn't fit`);
        }
      }
      // Parity check (hard level rule)
      if (oddItem.color !== undefined) {
        const colorParityMismatch = others.some(o => {
          const expectedColor = o.value % 2 === 0 ? 'red' : 'blue';
          return o.color !== expectedColor;
        });
        if (!colorParityMismatch) {
          const expectedColor = oddItem.value % 2 === 0 ? 'red' : 'blue';
          if (oddItem.color !== expectedColor) {
            reasons.push(ru
              ? `цвет не соответствует чётности числа (чётное → красный, нечётное → синий)`
              : `color doesn't match number parity (even → red, odd → blue)`);
          }
        }
      }
    }

    if (reasons.length > 0) {
      return ru
        ? `Элемент №${correctIndex}: ${reasons.join('; ')}.`
        : `Item #${correctIndex}: ${reasons.join('; ')}.`;
    }
    return ru
      ? `Элемент №${correctIndex} нарушает общее правило ряда.`
      : `Item #${correctIndex} breaks the overall rule of the sequence.`;
  }

  return '';
}