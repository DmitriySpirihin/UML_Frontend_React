export function getProblem(type,difficulty,stage) {
    

    switch (type) {
      case 0:
        switch (difficulty) {
          case 0:return getEasyProblem(stage);
          case 1:return getMediumProblem(stage);
          case 2:return getHardProblem(stage);
          case 3:return getInsaneProblem(stage);
          case 4:return getProblemEndlessType(stage);
          case 5:return getProblemRelaxMode(stage);
        }
      break;
    }




    return [problem,answer.toString()];
}

//helper 
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getEasyProblem = (stage) => {

  let num1, num2, op, result, attempts = 0;

  if (stage >= 0 && stage <= 5) {
    // Stage 0–5: a + b (small addition, sum ≤ 20)
    do {
      attempts++;
      num1 = getRandomInt(2, 10);
      num2 = getRandomInt(2, 10);
      result = num1 + num2;
    } while (result > 20 && attempts < 20);
    return [`${num1} + ${num2}`, result.toString()];
  }

  if (stage >= 6 && stage <= 10) {
    // Stage 6–10: aa + b (two-digit + one-digit, sum ≤ 100)
    do {
      attempts++;
      num1 = getRandomInt(10, 90); // two-digit
      num2 = getRandomInt(2, 9);   // one-digit
      result = num1 + num2;
    } while (result > 100 && attempts < 20);
    return [`${num1} + ${num2}`, result.toString()];
  }

  if (stage >= 11 && stage <= 15) {
    // Stage 11–15: aa - b (two-digit minus small one-digit, result ≥ 10)
    do {
      attempts++;
      num1 = getRandomInt(20, 99); // ensure room to subtract
      num2 = getRandomInt(2, 9);
      result = num1 - num2;
    } while (result < 10 && attempts < 20);
    return [`${num1} – ${num2}`, result.toString()];
  }

  if (stage >= 16 && stage <= 20) {
    // Stage 16–20: a × b (small multiplication, product ≤ 100)
    do {
      attempts++;
      num1 = getRandomInt(2, 10);
      num2 = getRandomInt(2, 10);
      result = num1 * num2;
    } while (result > 100 && attempts < 20);
    return [`${num1} × ${num2}`, result.toString()];
  }

  // Fallback (should not happen if stage is 0–20)
  return ["2 + 3", "5"];
};

const getMediumProblem = (stage) => {
  // Stage 0–5: aa + bb
  if (stage >= 0 && stage <= 5) {
    let a, b, result;
    let attempts = 0;
    do {
      a = getRandomInt(10, 99);
      b = getRandomInt(10, 99);
      result = a + b;
    } while (result > 200 && ++attempts < 20);
    return [`${a} + ${b}`, result.toString()];
  }

  // Stage 6–10: aa + a – bb
  if (stage >= 6 && stage <= 10) {
    let aa, a, bb, temp, result;
    let attempts = 0;
    do {
      aa = getRandomInt(30, 99);        // ensure room for subtraction
      a = getRandomInt(2, 9);           // one-digit addend
      bb = getRandomInt(10, 80);        // two-digit subtractor
      temp = aa + a;               // always ≥ 32
      result = temp - bb;
    } while ((result < 10 || result > 150) && ++attempts < 30);
    return [`${aa} + ${a} – ${bb}`, result.toString()];
  }

  // Stage 11–15: (aa – b) × c
  if (stage >= 11 && stage <= 15) {
    let aa, b, c, diff, result;
    let attempts = 0;
    do {
      aa = getRandomInt(25, 99);
      b = getRandomInt(2, 9);
      c = getRandomInt(2, 12);
      diff = aa - b;
      if (diff <= 5) continue; // avoid tiny bases
      result = diff * c;
    } while ((result < 30 || result > 1000) && ++attempts < 30);
    return [`(${aa} – ${b}) × ${c}`, result.toString()];
  }

  // Stage 16–20: aa + bb ÷ c  (bb divisible by c)
  if (stage >= 16 && stage <= 20) {
    let aa, bb, c, quotient, result;
    let attempts = 0;
    do {
      c = getRandomInt(2, 9);                     // divisor
      quotient = getRandomInt(3, 12);             // bb / c = quotient → bb = c * quotient
      bb = c * quotient;                     // ensures exact division
      if (bb < 10 || bb > 99) continue;      // bb must be two-digit
      aa = getRandomInt(15, 80);                  // two-digit addend
      result = aa + quotient;
    } while ((result < 20 || result > 120) && ++attempts < 30);
    return [`${aa} + ${bb} ÷ ${c}`, result.toString()];
  }

  // Fallback (should not be reached for stage 0–20)
  return ["50 + 40", "90"];
};

const getHardProblem = (stage) => {

  // Stage 0–5: aa + bb - cc
  if (stage >= 0 && stage <= 5) {
    let aa, bb, cc, result;
    let attempts = 0;
    do {
      aa = getRandomInt(20, 80);
      bb = getRandomInt(20, 80);
      cc = getRandomInt(10, 70);
      result = aa + bb - cc;
    } while ((result < 10 || result > 200) && ++attempts < 30);
    return [`${aa} + ${bb} − ${cc}`, result.toString()];
  }

  // Stage 6–10: aa × b + (cc − dd)
  if (stage >= 6 && stage <= 10) {
    let aa, b, cc, dd, part1, part2, result;
    let attempts = 0;
    do {
      aa = getRandomInt(12, 30);       // two-digit
      b = getRandomInt(3, 8);          // one-digit multiplier
      cc = getRandomInt(40, 85);       // larger two-digit
      dd = getRandomInt(20, cc - 5);   // ensure positive difference
      part1 = aa * b;
      part2 = cc - dd;            // ≥5
      result = part1 + part2;
    } while ((result < 20 || result > 500) && ++attempts < 30);
    return [`${aa} × ${b} + (${cc} − ${dd})`, result.toString()];
  }

  // Stage 11–15: (a² − √b) + cc
  if (stage >= 11 && stage <= 15) {
    let a, aSq, root, b, cc, result;
    let attempts = 0;
    do {
      a = getRandomInt(5, 12);         // a² from 25 to 144
      aSq = a * a;
      root = getRandomInt(6, 14);      // √b from 6 to 14 → b = 36 to 196
      b = root * root;
      cc = getRandomInt(20, 70);       // two-digit addend
      result = (aSq - root) + cc;
    } while ((result < 25 || result > 300) && ++attempts < 30);
    return [`(${a}² − √${b}) + ${cc}`, result.toString()];
  }

  // Stage 16–20: a² + bb ÷ c − d   (written as a² + bb / c + (-d), but simplified)
  if (stage >= 16 && stage <= 20) {
    let a, aSq, c, quotient, bb, d, result;
    let attempts = 0;
    do {
      a = getRandomInt(6, 12);         // a² up to 144
      aSq = a * a;
      c = getRandomInt(2, 9);          // divisor
      quotient = getRandomInt(5, 15);  // bb / c = quotient → bb = c * quotient
      bb = c * quotient;          // ensure exact division, two-digit preferred
      if (bb < 10 || bb > 99) continue;
      d = getRandomInt(3, 12);         // subtract small number
      result = aSq + quotient - d;
    } while ((result < 30 || result > 400) && ++attempts < 30);
    // Format as: a² + bb ÷ c + (−d) → but clearer as: a² + bb ÷ c − d
    return [`${a}² + ${bb} ÷ ${c} − ${d}`, result.toString()];
  }

  // Fallback (should not trigger for stage 0–20)
  return ["12² + 80 ÷ 5 − 7", "153"];
};

const getInsaneProblem = (stage) => {
  // Clamp stage into known ranges
  if (stage < 0) stage = 0;

  // Helper: random integer inclusive
  const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Helper: superscript conversion for powers
  const toSuperscript = (n) => {
    const map = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
    return String(n).split('').map(d => map[d] || d).join('');
  };

  // Precomputed log table: log_base(arg) = result → integer results only
  const LOG_TABLE = {
    2: [[2,1], [4,2], [8,3], [16,4], [32,5], [64,6], [128,7], [256,8], [512,9], [1024,10]],
    3: [[3,1], [9,2], [27,3], [81,4], [243,5], [729,6]],
    5: [[5,1], [25,2], [125,3], [625,4]],
    10: [[10,1], [100,2], [1000,3], [10000,4]]
  };

  // Ensure result is a positive integer < 10000 and expression uses advanced ops
  const isValidProblem = (expr, value) => {
    return Number.isInteger(value) && value > 0 && value < 10000;
  };

  // --- Stage-specific generators ---
  if (stage <= 5) {
    // Format: log_a(b) + c³
    const bases = [2, 3, 5, 10];
    const base = bases[getRandomInt(0, bases.length - 1)];
    const logPair = LOG_TABLE[base][getRandomInt(0, LOG_TABLE[base].length - 1)];
    const [arg, logVal] = logPair;
    const c = getRandomInt(3, 8); // 3³=27 ... 8³=512
    const c3 = c ** 3;
    const value = logVal + c3;
    if (!isValidProblem('', value)) return getInsaneProblem(stage); // retry

    const logExpr = base === 10 
      ? `log₁₀(${arg})` 
      : base === 2 
        ? `log₂(${arg})` 
        : `log${base}(${arg})`;
    const expr = `${logExpr} + ${c}${toSuperscript(3)}`;
    return [expr, value.toString()];
  }

  if (stage <= 10) {
    // Linear equation: aX + b = c  → solve for X
    if (getRandomInt(1,3) === 1) {
      const a = getRandomInt(2, 12); // avoid 1
      const x = getRandomInt(3, 15); // true answer
      const b = getRandomInt(1, 20);
      const c = a * x + b;
      const expr = `${a}X + ${b} = ${c}`;
      return [expr, x.toString()];
    }else if (getRandomInt(0,4) === 2){
      const a = getRandomInt(2, 12); // avoid 1
      const x = getRandomInt(3, 10); // true answer
      const b = getRandomInt(11, 20);
      const d = getRandomInt(11, 20);
      const c = a * x - b + d;
      const expr = `${a}X - ${b} + ${d} = ${c}`;
      return [expr, x.toString()];
    }
    else{
      const a = getRandomInt(12, 52); // avoid 1
      const x = getRandomInt(13, 30); // true answer
      const b = getRandomInt(11, 20);
      const d = getRandomInt(11, 20);
      const c = a + b + d - x;
      const expr = `${a} + ${b} + ${d} - X = ${c}`;
      return [expr, x.toString()];
    }
  }

  if (stage <= 15) {
    // Format: (a³ - b²) + log_c(d)
    const a = getRandomInt(4, 9); // 4³=64 ... 9³=729
    const b = getRandomInt(5, 15); // 5²=25 ... 15²=225
    const a3 = a ** 3;
    const b2 = b ** 2;
    if (a3 <= b2) return getInsaneProblem(stage); // ensure (a³ - b²) > 0 or manageable

    const base = [2, 3, 5][getRandomInt(0, 2)];
    const logPair = LOG_TABLE[base][getRandomInt(0, LOG_TABLE[base].length - 1)];
    const [arg, logVal] = logPair;

    const part1 = a3 - b2;
    const value = part1 + logVal;
    if (!isValidProblem('', value)) return getInsaneProblem(stage);

    const logExpr = base === 2 
      ? `log₂(${arg})` 
      : `log${base}(${arg})`;
    const expr = `(${a}${toSuperscript(3)} − ${b}${toSuperscript(2)}) + ${logExpr}`;
    return [expr, value.toString()];
  }

  if (stage <= 20) {
    // Format: aa + bb - cc + (-dd) + e → always positive
    // Interpretation: "aa" = a*a, but that duplicates power → instead use distinct terms:
    // We'll do: A + B - C - D + E, where each is a 2-digit or 3-digit number
    // But to make it "hard", use squares or small cubes inside
    let A, B, C, D, E, total;
    let attempts = 0;
    do {
      const a = getRandomInt(7, 13); // a² = 49–169
      const b = getRandomInt(8, 14); // b² = 64–196
      const c = getRandomInt(5, 11); // c³ = 125–1331 (but cap)
      const d = getRandomInt(4, 10); // d² = 16–100
      const e = getRandomInt(50, 200);

      A = a ** 2;
      B = b ** 2;
      C = c ** 3;
      D = d ** 2;
      E = e;

      total = A + B - C - D + E;
      attempts++;
      if (attempts > 20) break;
    } while (total <= 0 || total >= 10000);

    if (total <= 0 || total >= 10000) {
      // Fallback guaranteed expression
      return [`12² + 11² − 5³ − 6² + 100`, '210'];
    }

    const expr = `${a}${toSuperscript(2)} + ${b}${toSuperscript(2)} − ${c}${toSuperscript(3)} − ${d}${toSuperscript(2)} + ${E}`;
    return [expr, total.toString()];
  }

  // For stage > 20, fall back to original hardest type or extend
  return [`(√4096 + 6³) ÷ log₂(64)`, '10'];
};

const getProblemEndlessType = (stage) => {
  if (stage < 0) stage = 0;

  if (stage < 20) {
    // Easy: use stage as-is (0–19)
    return getEasyProblem(stage);
  } else if (stage < 40) {
    // Medium: map 20–39 → 0–19
    return getMediumProblem(stage - 20);
  } else if (stage < 60) {
    // Hard: map 40–59 → 0–19
    return getHardProblem(stage - 40);
  } else {
    // Insane: map 60+ → 0–20 (clamped or cyclical)
    // Since you said "each generator needs stage only from 0 to 20",
    // and insane should support "60 to infinity", we'll clamp or cycle.
    // Option 1: clamp at 20
    // const localStage = Math.min(stage - 60, 20);
    // Option 2: cycle every 20 stages (recommended for endless variety)
    const localStage = (stage - 60) % 21; // 0 to 20 inclusive
    return getInsaneProblem(localStage);
  }
};
const getProblemRelaxMode = (stage) => {
  if (stage < 0) stage = 0;

  // Cycle endlessly between easy and medium tiers
  // Each tier gets 20 stages → total cycle length = 40
  const cycleStage = stage % 40;

  if (cycleStage < 20) {
    // Easy: 0–19
    return getEasyProblem(cycleStage);
  } else {
    // Medium: 20–39 → map to 0–19
    return getMediumProblem(cycleStage - 20);
  }
};

export function getPoints(type, difficulty, stage, time, rightAnswer, yourAnswer, streakLength) {
  const baseScores = [100, 200, 300,400, 250,50];
  const base = baseScores[difficulty] || 100;
  
  // Близость
  let diff = 0;
  if (type === 0) {
    const numAnswer = Number(yourAnswer);
    const numRightAnswer = Number(rightAnswer);
    diff = Math.abs(numRightAnswer - numAnswer) / numRightAnswer;
  }
  const closeness = diff === 0 ? 1 : (diff < 0.15 ? 0.5 : 0);
  
  // Стадия
  const stageMultiplier = Math.min(1 + stage * 0.02, 1.3);
  
  // Время
  const timeNorm = Math.min(time / 10000, 2);
  const timeMultiplier = closeness === 1 ?  Math.max(1.3 - (timeNorm - 1) * 0.3, 1) : 1;
  
  // Серия
  const streakMultiplier = streakLength >= 5 && closeness === 1
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
export function getPrecision(type,rightAnswer, yourAnswer){
  if (type === 0) {
    const numAnswer = Number(yourAnswer);
    const numRightAnswer = Number(rightAnswer);
    return Math.abs(numRightAnswer - numAnswer) / numRightAnswer;
  }

  return 0;
}
