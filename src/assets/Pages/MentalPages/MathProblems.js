export function getProblem(type,difficulty,stage) {
    

    switch (type) {
      case 0:
        switch (difficulty) {
          case 0:return getEasyProblem(stage);
          case 1:return getMediumProblem(stage);
          case 2:return getHardProblem(stage);
          case 3:return getInsaneProblem(stage);
          break;
        }
      break;
    }




    return [problem,answer.toString()];
}

//helper 
const getRandomInt = (min,max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getEasyProblem = (stage) => {

  let handledStage = 0 ;
  if (stage > 5 && stage < 10) handledStage = 1;
  if (stage > 10 && stage < 15) handledStage = 2;
  if (stage > 15 && stage < 20) handledStage = 3;
  const ranges = [
    { min1: 5, max1: 15, min2: 5, max2: 15},
    { min1: 10, max1: 29, min2: 5, max2: 19 }, 
    { min1: 15, max1: 39, min2: 10, max2: 29 }, 
    { min1: 20, max1: 59, min2: 15, max2: 39 }   
  ];
  
  const range = ranges[handledStage] || ranges[0];
  
  let num1, num2;
  do {
    num1 = getRandomInt(range.min1, range.max1);
    num2 = getRandomInt(range.min2, range.max2);
  } while (num1 === num2);
  
  const sign = Math.random() < 0.5 ? '+' : '-';
  
  if (sign === '-') {
    if (num1 < num2) [num1, num2] = [num2, num1];
  }
  
  const problem = `${num1} ${sign} ${num2}`;
  const answer = eval(`${num1} ${sign} ${num2}`).toString();
  
  return [problem, answer];
};

const getMediumProblem = (stage) => {
  let handledStage = 0;
  if (stage > 5 && stage < 10) handledStage = 1;
  if (stage > 10 && stage < 15) handledStage = 2;
  if (stage > 15 && stage < 20) handledStage = 3;

  const ranges = [
    { min1: 5, max1: 19, min2: 5, max2: 19 },
    { min1: 8, max1: 29, min2: 5, max2: 24 },
    { min1: 12, max1: 49, min2: 8, max2: 34 },
    { min1: 15, max1: 69, min2: 12, max2: 49 }
  ];

  const range = ranges[handledStage] || ranges[0];

  const operations = ['+', '-', '×', '÷'];
  const op = operations[getRandomInt(0, operations.length - 1)];

  let num1, num2, problem, answer;

  switch (op) {
    case '÷':
      // Generate num2 first, then num1 as a multiple of num2
      num2 = getRandomInt(range.min2, range.max2);
      const multiplier = getRandomInt(2, Math.floor(range.max1 / num2)); // ensure num1 ≤ max1
      num1 = num2 * multiplier;
      // If multiplier is 0 or num1 < min1, adjust
      if (num1 < range.min1) {
        num1 = num2 * Math.ceil(range.min1 / num2);
        if (num1 > range.max1) {
          // Fallback: use smaller num2 or default to safe values
          num2 = getRandomInt(2, 10);
          num1 = num2 * getRandomInt(2, 10);
        }
      }
      problem = `${num1} ÷ ${num2}`;
      answer = (num1 / num2).toString();
      break;

    case '×':
      num1 = getRandomInt(range.min1, range.max1);
      num2 = getRandomInt(range.min2, range.max2);
      problem = `${num1} × ${num2}`;
      answer = (num1 * num2).toString();
      break;

    case '-':
      num1 = getRandomInt(range.min1, range.max1);
      num2 = getRandomInt(range.min2, range.max2);
      if (num1 < num2) [num1, num2] = [num2, num1];
      problem = `${num1} - ${num2}`;
      answer = (num1 - num2).toString();
      break;

    case '+':
    default:
      num1 = getRandomInt(range.min1, range.max1);
      num2 = getRandomInt(range.min2, range.max2);
      problem = `${num1} + ${num2}`;
      answer = (num1 + num2).toString();
      break;
  }

  return [problem, answer];
};

const getHardProblem = (stage) => {
  let handledStage = 0;
  if (stage > 5 && stage < 10) handledStage = 1;
  if (stage > 10 && stage < 15) handledStage = 2;
  if (stage > 15 && stage < 20) handledStage = 3;

  // These ranges now define MAX base and exponent for ^, and max root for √
  const ranges = [
    { maxRoot: 10, maxBase: 5, maxExp: 3 },   // √(≤100), base^exp (≤5^3=125)
    { maxRoot: 15, maxBase: 6, maxExp: 3 },   // √(≤225), 6^3=216
    { maxRoot: 20, maxBase: 7, maxExp: 3 },   // √(≤400), 7^3=343
    { maxRoot: 25, maxBase: 8, maxExp: 3 }    // √(≤625), 8^3=512
  ];

  const range = ranges[handledStage] || ranges[0];

  // Only allow operations that can yield integers
  const operations = ['√', '^']; // Removed 'LOG' — too few integer results
  const op = operations[getRandomInt(0, operations.length - 1)];

  let problem, answer;

  if (op === '√') {
    const root = getRandomInt(2, range.maxRoot); // √4, √9, ..., √625
    const num = root * root;
    problem = `√${num}`;
    answer = root.toString(); // Always integer
  } else if (op === '^') {
    const base = getRandomInt(2, range.maxBase);
    const exp = getRandomInt(2, range.maxExp);
    problem = `${base}^${exp}`;
    answer = Math.pow(base, exp).toString();
  }

  return [problem, answer];
};

const getInsaneProblem = (stage) => {
  let handledStage = 0;
  if (stage > 5 && stage < 10) handledStage = 1;
  if (stage > 10 && stage < 15) handledStage = 2;
  if (stage > 15 && stage < 20) handledStage = 3;

  const ranges = [
    { min1: 5, max1: 30, min2: 2, max2: 12 },
    { min1: 10, max1: 50, min2: 3, max2: 15 },
    { min1: 15, max1: 80, min2: 4, max2: 20 },
    { min1: 20, max1: 120, min2: 5, max2: 25 }
  ];

  const range = ranges[handledStage] || ranges[0];

  const problemTypes = [
    // 1. Basic ops (+, -, ×, ÷) — ensure ÷ yields integer
    () => {
      const ops = ['+', '-', '×', '÷'];
      const op = ops[getRandomInt(0, 3)];
      let num1, num2, problem, answer;

      if (op === '÷') {
        num2 = getRandomInt(range.min2, range.max2);
        const quotient = getRandomInt(2, 12); // Reasonable result
        num1 = num2 * quotient;
        problem = `${num1} ÷ ${num2}`;
        answer = quotient.toString();
      } else if (op === '×') {
        num1 = getRandomInt(range.min1, range.max1);
        num2 = getRandomInt(range.min2, range.max2);
        problem = `${num1} × ${num2}`;
        answer = (num1 * num2).toString();
      } else if (op === '+') {
        num1 = getRandomInt(range.min1, range.max1);
        num2 = getRandomInt(range.min2, range.max2);
        problem = `${num1} + ${num2}`;
        answer = (num1 + num2).toString();
      } else { // '-'
        num1 = getRandomInt(range.min1, range.max1);
        num2 = getRandomInt(range.min2, Math.min(num1 - 1, range.max2)); // Ensure positive result
        problem = `${num1} - ${num2}`;
        answer = (num1 - num2).toString();
      }
      return [problem, answer];
    },

    // 2. Combo with order of operations
    () => {
      // Pattern: A × B + C, A + B × C, (A + B) × C
      // Ensure all results are integers (they will be)
      const a = getRandomInt(range.min1, range.max1);
      const b = getRandomInt(range.min2, range.max2);
      const c = getRandomInt(range.min2, range.max2);

      const patterns = [
        [`${a} × ${b} + ${c}`, a * b + c],
        [`${a} + ${b} × ${c}`, a + b * c],
        [`(${a} + ${b}) × ${c}`, (a + b) * c],
        [`${a} × (${b} + ${c})`, a * (b + c)]
      ];

      const idx = getRandomInt(0, patterns.length - 1);
      const [problem, ans] = patterns[idx];
      return [problem, ans.toString()];
    },

    // 3. Controlled square roots (only perfect squares)
    () => {
      const maxRoot = handledStage === 0 ? 12 : handledStage === 1 ? 15 : handledStage === 2 ? 20 : 25;
      const root = getRandomInt(3, maxRoot);
      const square = root * root;
      const multiplier = getRandomInt(2, handledStage < 2 ? 5 : 8);
      
      // Example: √144 × 3 = 12 × 3 = 36
      const problem = `√${square} × ${multiplier}`;
      const answer = (root * multiplier).toString();
      return [problem, answer];
    },

    // 4. Linear equations (only at higher stages, 50% chance)
    () => {
      if (handledStage < 3 || Math.random() < 0.5) {
        return problemTypes[getRandomInt(0, 2)](); // fallback to simpler type
      }

      const a = getRandomInt(2, 6);   // coefficient
      const x = getRandomInt(3, 15);  // solution
      const b = getRandomInt(2, 10);
      const c = a * x + b;

      const forms = [
        [`${a}x + ${b} = ${c}`, x],
        [`${a}x - ${b} = ${a * x - b}`, x],
        [`(${a})(x + ${b}) = ${a * (x + b)}`, x]
      ];

      const [problem, ans] = forms[getRandomInt(0, forms.length - 1)];
      return [problem, ans.toString()];
    }
  ];

  const typeIndex = getRandomInt(0, problemTypes.length - 1);
  return problemTypes[typeIndex]();
};



export function getPoints(type, difficulty, stage, time, rightAnswer, yourAnswer, streakLength) {
  const baseScores = [100, 200, 300, 400];
  const base = baseScores[difficulty] || 100;
  
  // Близость
  let diff = 0;
  if (type === 0) {
    const numAnswer = Number(yourAnswer);
    const numRightAnswer = Number(rightAnswer);
    diff = Math.abs(numRightAnswer - numAnswer) / numRightAnswer;
  }
  const closeness = diff < 0.8 ? 1 : (diff < 0.9 ? 0.7 : 0.5);
  
  // Стадия
  const stageMultiplier = Math.min(1 + stage * 0.02, 1.3);
  
  // Время
  const timeNorm = Math.min(time / 10000, 2);
  const timeMultiplier = Math.max(1.3 - (timeNorm - 1) * 0.3, 1);
  
  // Серия
  const streakMultiplier = streakLength >= 5 
    ? Math.min(1 + 0.1 * Math.min(streakLength / 10, 4), 1.5) 
    : 1;
  
  return Math.round(base * closeness * stageMultiplier * timeMultiplier * streakMultiplier);
}

export function hasStreak(type,rightAnswer, yourAnswer) {
  let diff = 1;
  if (type === 0) {
    const numAnswer = Number(yourAnswer);
    const numRightAnswer = Number(rightAnswer);
    if (numAnswer === numRightAnswer)return true;
  }
  
  return false;
}


const nums = [5,6,7,8,9,10,11,12,13,14,15,16];