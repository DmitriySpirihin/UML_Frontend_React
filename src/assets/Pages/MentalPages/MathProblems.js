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
  // Determine tier
  let tier;
  if (stage >= 16) tier = 3;      // 3-number only
  else if (stage >= 11) tier = 2; // hard easy
  else if (stage >= 6) tier = 1;  // medium easy
  else tier = 0;                  // beginner

  // Define ranges and behavior per tier
  const config = [
    // Tier 0: Stage 0–5 → very gentle
    { minA: 3, maxA: 10, minB: 2, maxB: 8, minC: 2, maxC: 6, maxResult: 20, avoidTrivial: true, threeNums: false },
    // Tier 1: Stage 6–10 → light challenge
    { minA: 8, maxA: 18, minB: 5, maxB: 14, minC: 4, maxC: 10, maxResult: 35, avoidTrivial: true, threeNums: false },
    // Tier 2: Stage 11–15 → solid easy
    { minA: 14, maxA: 30, minB: 8, maxB: 22, minC: 6, maxC: 15, maxResult: 55, avoidTrivial: false, threeNums: false },
    // Tier 3: Stage 16+ → ONLY 3-number problems
    { minA: 18, maxA: 40, minB: 10, maxB: 30, minC: 8, maxC: 25, maxResult: 100, avoidTrivial: false, threeNums: true }
  ];

  const cfg = config[tier];

  // Helper to format subtraction
  const fmt = (op) => (op === '+' ? '+' : '–');

  // === ALWAYS 3-NUMBER for tier 3 ===
  if (cfg.threeNums) {
    let a, b, c, op1, op2, temp, result;
    let attempts = 0;
    do {
      attempts++;
      a = getRandomInt(cfg.minA, cfg.maxA);
      b = getRandomInt(cfg.minB, cfg.maxB);
      c = getRandomInt(cfg.minC, cfg.maxC);

      op1 = Math.random() < 0.6 ? '+' : '-';
      op2 = Math.random() < 0.6 ? '+' : '-';

      // Compute left-to-right: ((a op1 b) op2 c)
      temp = op1 === '+' ? a + b : a - b;
      if (temp < 0) continue; // no negative intermediates in "easy"

      result = op2 === '+' ? temp + c : temp - c;
      if (result < 0 || result > cfg.maxResult) continue;

      // Avoid trivial values in high tier
      if (tier >= 2 && (b <= 3 || c <= 3)) continue;

      break;
    } while (attempts < 50);

    return [`${a} ${fmt(op1)} ${b} ${fmt(op2)} ${c}`, result.toString()];
  }

  // === TWO-NUMBER for tiers 0–2 ===
  let num1, num2, sign, result;
  let attempts = 0;
  do {
    attempts++;
    num1 = getRandomInt(cfg.minA, cfg.maxA);
    num2 = getRandomInt(cfg.minB, cfg.maxB);

    sign = Math.random() < 0.55 ? '+' : '-';

    if (sign === '-') {
      if (num1 < num2) [num1, num2] = [num2, num1];
      if (num1 === num2) continue; // avoid 0
    }

    result = sign === '+' ? num1 + num2 : num1 - num2;
    if (result < 0 || result > cfg.maxResult) continue;

    // Avoid trivial in early tiers
    if (cfg.avoidTrivial && (num1 <= 4 || num2 <= 4 || result <= 4)) {
      if (attempts < 25) continue;
    }

    break;
  } while (attempts < 40);

  return [`${num1} ${fmt(sign)} ${num2}`, result.toString()];
};

const getMediumProblem = (stage) => {
  const tier = Math.min(4, Math.floor(stage / 5)); // 0:0-4, 1:5-9, 2:10-14, 3:15-19, 4:20+

  const config = [
    // Tier 0: stages 0–4
    { minA: 2, maxA: 15, minB: 2, maxB: 12, minRes: 5, maxRes: 100, allowSimpleAddSub: true },
    // Tier 1: stages 5–9
    { minA: 6, maxA: 30, minB: 3, maxB: 20, minRes: 10, maxRes: 300, allowSimpleAddSub: true },
    // Tier 2+: stages 10+ → NO simple two-operand add/sub
    { minA: 25, maxA: 80, minB: 6, maxB: 40, minRes: 25, maxRes: 1000, allowSimpleAddSub: false },
    { minA: 40, maxA: 130, minB: 8, maxB: 60, minRes: 40, maxRes: 2500, allowSimpleAddSub: false },
    { minA: 60, maxA: 200, minB: 10, maxB: 90, minRes: 60, maxRes: 6000, allowSimpleAddSub: false }
  ][tier];

  const { minA, maxA, minB, maxB, minRes, maxRes, allowSimpleAddSub } = config;

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const getDivisors = (n, minD, maxD) => {
    const divs = [];
    for (let d = minD; d <= maxD && d <= n; d++) {
      if (n % d === 0) divs.push(d);
    }
    return divs;
  };

  let problem, answer;
  const maxAttempts = 100;

  // ===== TWO-OPERATION MODE (dominant from tier 2+) =====
  const useTwoOps = tier >= 3 ? Math.random() < 0.85 :
                    tier >= 2 ? Math.random() < 0.6 : 
                    tier >= 1 ? Math.random() < 0.2 : false;

  if (useTwoOps) {
    let attempts = 0;
    while (attempts++ < maxAttempts) {
      const ops = ['+', '-', '×', '÷'];
      const innerOp = ops[randInt(0, 3)];
      const outerOp = ops[randInt(0, 3)];

      // Generate inner
      let a, b, innerResult;
      let innerTries = 0;
      let innerOK = false;
      while (!innerOK && innerTries++ < 30) {
        a = randInt(tier >= 2 ? 30 : minA, tier >= 4 ? 250 : Math.min(180, maxA * 2));
        b = randInt(tier >= 2 ? 8 : minB, tier >= 3 ? 80 : Math.min(70, maxB * 2));

        if (a < 10 || b < 10) continue; // no one-digit from tier 1+

        if (innerOp === '÷') {
          if (b === 0) continue;
          const mult = randInt(tier >= 2 ? 5 : 2, Math.min(40, Math.floor(maxRes / b)));
          a = b * mult;
          innerResult = a / b;
        } else if (innerOp === '×') {
          innerResult = a * b;
        } else if (innerOp === '+') {
          innerResult = a + b;
        } else if (innerOp === '-') {
          if (a <= b) continue;
          innerResult = a - b;
        }

        if (Number.isInteger(innerResult) && innerResult >= 15 && innerResult <= maxRes * 0.8) {
          innerOK = true;
        }
      }
      if (!innerOK) continue;

      // Generate outer
      let c, finalResult;
      let outerOK = false;

      if (outerOp === '÷') {
        const divs = getDivisors(innerResult, tier >= 2 ? 6 : 2, tier >= 3 ? 90 : maxB);
        if (divs.length === 0) continue;
        c = divs[randInt(0, divs.length - 1)];
        finalResult = innerResult / c;
        outerOK = true;
      } else if (outerOp === '×') {
        c = randInt(tier >= 2 ? 6 : minB, tier >= 3 ? 80 : Math.min(60, maxB * 2));
        finalResult = innerResult * c;
        outerOK = true;
      } else if (outerOp === '+') {
        c = randInt(tier >= 2 ? 25 : minB, tier >= 3 ? 120 : Math.min(100, maxB * 2));
        finalResult = innerResult + c;
        outerOK = true;
      } else if (outerOp === '-') {
        if (innerResult <= minRes) continue;
        const maxC = Math.min(maxB * 2, innerResult - minRes);
        if (maxC < (tier >= 2 ? 20 : minB)) continue;
        c = randInt(tier >= 2 ? 20 : minB, maxC);
        finalResult = innerResult - c;
        outerOK = true;
      }

      if (outerOK && finalResult >= minRes && finalResult <= maxRes && Number.isInteger(finalResult)) {
        problem = `(${a} ${innerOp === '×' ? '×' : innerOp === '÷' ? '÷' : innerOp} ${b}) ${outerOp === '×' ? '×' : outerOp === '÷' ? '÷' : outerOp} ${c}`;
        answer = finalResult.toString();
        break;
      }
    }
  }

  // ===== SINGLE-OPERATION MODE (with 3-number ± if needed) =====
  if (!problem) {
    let attempts = 0;
    while (attempts++ < maxAttempts) {
      let opType;

      if (tier === 0) {
        opType = ['add2', 'sub2', 'mul', 'div'][randInt(0, 3)];
      } else if (tier === 1) {
        opType = ['add2', 'sub2', 'mul', 'div', 'mul'][randInt(0, 4)];
      } else {
        // Tier 2+: no simple 2-operand add/sub
        opType = ['mul', 'div', 'add3', 'sub3', 'mul', 'div'][randInt(0, 5)];
      }

      let tempProblem, tempAnswer;

      if (opType === 'div') {
        const divisor = randInt(tier >= 2 ? 6 : 2, tier >= 3 ? 80 : maxB);
        const quotient = randInt(tier >= 2 ? 6 : 2, Math.min(50, Math.floor(maxRes / divisor)));
        const dividend = divisor * quotient;
        if (dividend > maxRes * 2) continue;
        tempProblem = `${dividend} ÷ ${divisor}`;
        tempAnswer = quotient;
      } else if (opType === 'mul') {
        const x = randInt(tier >= 2 ? 20 : minA, tier >= 4 ? 220 : Math.min(180, maxA * 2));
        const y = randInt(tier >= 2 ? 6 : minB, tier >= 3 ? 85 : Math.min(70, maxB * 2));
        const prod = x * y;
        if (prod > maxRes) continue;
        tempProblem = `${x} × ${y}`;
        tempAnswer = prod;
      } else if (opType === 'add2' && allowSimpleAddSub) {
        const x = randInt(minA, maxA);
        const y = randInt(minB, maxB);
        const s = x + y;
        if (s > maxRes) continue;
        tempProblem = `${x} + ${y}`;
        tempAnswer = s;
      } else if (opType === 'sub2' && allowSimpleAddSub) {
        const x = randInt(Math.max(minA, 20), maxA);
        const y = randInt(minB, Math.min(maxB, x - Math.max(5, minRes / 2)));
        if (x <= y) continue;
        const d = x - y;
        if (d < minRes) continue;
        tempProblem = `${x} - ${y}`;
        tempAnswer = d;
      } else if (opType === 'add3' || opType === 'sub3') {
        // Three-number chain: a + b - c  or  a - b + c  or  a + b + c etc.
        const a = randInt(tier >= 2 ? 60 : 30, tier >= 4 ? 250 : 180);
        const b = randInt(tier >= 2 ? 30 : 20, tier >= 3 ? 120 : 100);
        const c = randInt(tier >= 2 ? 20 : 15, tier >= 3 ? 100 : 80);

        let expr, val;
        if (opType === 'add3') {
          // Mix: mostly a + b + c, sometimes a + b - c (if result stays positive)
          if (Math.random() < 0.7) {
            expr = `${a} + ${b} + ${c}`;
            val = a + b + c;
          } else {
            if (a + b > c && a + b - c >= minRes) {
              expr = `${a} + ${b} - ${c}`;
              val = a + b - c;
            } else continue;
          }
        } else { // sub3
          // Ensure a > b and (a - b) + c or (a - b) - c stays ≥ minRes
          if (a <= b) continue;
          const diff = a - b;
          if (Math.random() < 0.6) {
            // a - b + c
            expr = `${a} - ${b} + ${c}`;
            val = diff + c;
          } else {
            // a - b - c
            if (diff > c && diff - c >= minRes) {
              expr = `${a} - ${b} - ${c}`;
              val = diff - c;
            } else continue;
          }
        }

        if (val >= minRes && val <= maxRes) {
          tempProblem = expr;
          tempAnswer = val;
        } else continue;
      } else {
        continue;
      }

      if (tempAnswer >= minRes && tempAnswer <= maxRes && Number.isInteger(tempAnswer)) {
        problem = tempProblem;
        answer = tempAnswer.toString();
        break;
      }
    }
  }

  // Final fallback
  if (!problem || !answer) {
    const fallbacks = [
      ["12 + 15", "27"],
      ["84 ÷ 7", "12"],
      ["120 + 45 - 28", "137"],
      ["(180 ÷ 6) + 75", "105"],
      ["250 - 90 + 36", "196"]
    ];
    return fallbacks[tier] || fallbacks[2];
  }

  return [problem, answer];
};

const SUPERSCRIPT = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
};
const toSuperscript = n => String(n).split('').map(d => SUPERSCRIPT[d]).join('');

const getHardProblem = (stage) => {
  const tier = Math.min(Math.floor(stage / 5), 3); // 0 to 3

  const tiers = [
    // Tier 0: stages 0–4 → solid foundation, no trivial ops
    { minNum: 6, maxNum: 25, maxRoot: 12, allowPower: true, forceCombo: true },
    // Tier 1: stages 5–9
    { minNum: 8, maxNum: 35, maxRoot: 15, allowPower: true, forceCombo: true },
    // Tier 2: stages 10–14
    { minNum: 10, maxNum: 50, maxRoot: 18, allowPower: true, forceCombo: true },
    // Tier 3: stages 15+
    { minNum: 12, maxNum: 70, maxRoot: 20, allowPower: true, forceCombo: true }
  ];

  const config = tiers[tier];

  // Generate a non-trivial term
  const generateTerm = () => {
    const type = getRandomInt(1, config.allowPower ? 3 : 2);

    if (type === 1) {
      // Number — never too small
      let val = getRandomInt(config.minNum, config.maxNum);
      return { expr: val.toString(), value: val };
    } 
    else if (type === 2) {
      // Square root — always perfect square
      const root = getRandomInt(5, config.maxRoot); // start at √25
      return { expr: `√${root * root}`, value: root };
    } 
    else if (type === 3) {
      // Power: only ² or ³, result ≤ 800
      const base = getRandomInt(3, Math.min(12, config.maxNum));
      const exp = Math.random() < 0.75 ? 2 : 3;
      const val = Math.pow(base, exp);
      if (val > 800 || val < 9) return generateTerm();
      return { expr: `${base}${toSuperscript(exp)}`, value: val };
    }
  };

  // Combine two terms with operation
  const combine = (left, right) => {
    const ops = ['+', '−', '×'];
    
    // Add division only if clean and reasonable
    if (right.value !== 0 && left.value % right.value === 0) {
      const q = left.value / right.value;
      if (Number.isInteger(q) && q >= 2 && q <= 50) {
        ops.push('÷');
      }
    }

    const op = ops[getRandomInt(0, ops.length - 1)];
    let value, expr;

    switch (op) {
      case '+': value = left.value + right.value; break;
      case '−': value = left.value - right.value; break;
      case '×': value = left.value * right.value; break;
      case '÷': value = left.value / right.value; break;
    }

    if (!Number.isInteger(value) || value <= 0 || value >= 10000) return null;

    // Add parentheses to emphasize structure (and create challenge)
    const patterns = [
      `${left.expr} ${op} ${right.expr}`,           // A op B
      `(${left.expr} ${op} ${right.expr})`,         // (A op B) — for nesting later
      `${left.expr} ${op} (${right.expr})`,         // A op (B)
    ];

    // Prefer pattern that creates ambiguity without parens
    if (op === '×' || op === '÷') {
      // Multiplication has higher precedence — so A + B × C is challenging
      // So we often *omit* parens on multiplication side
      expr = `${left.expr} ${op} ${right.expr}`;
    } else {
      // For +/−, if one side is a power or root, no parens needed
      expr = `${left.expr} ${op} ${right.expr}`;
    }

    return { expr, value };
  };

  // Build a 2-part expression (always combo in Hard mode)
  const buildExpr = () => {
    let attempts = 0;
    while (attempts < 15) {
      const left = generateTerm();
      const right = generateTerm();
      const result = combine(left, right);
      if (result) return result;
      attempts++;
    }

    // Fallback: safe combo
    const a = getRandomInt(12, 30);
    const b = getRandomInt(3, 8);
    return { expr: `${a} × ${b} + √100`, value: a * b + 10 };
  };

  // Final validation loop
  for (let i = 0; i < 25; i++) {
    const { expr, value } = buildExpr();

    if (value <= 0 || value >= 10000 || !Number.isInteger(value)) continue;

    // Ensure it's not easy:
    // - Must contain at least one of: √, ², ³, or be a ×/÷ combo with numbers >15
    const hasAdvanced = expr.includes('√') || expr.includes('²') || expr.includes('³');
    const hasLargeProduct = (expr.includes('×') || expr.includes('÷')) &&
                            (expr.match(/\d+/g)?.some(n => parseInt(n) > 20));

    if (hasAdvanced || hasLargeProduct || expr.includes('(')) {
      return [expr, value.toString()];
    }

    // If no advanced feature, require both numbers > 15 and not simple add/sub
    if (!hasAdvanced) {
      const nums = expr.match(/\d+/g)?.map(Number) || [];
      const isSimpleAddSub = /^[0-9]+ [+\−] [0-9]+$/.test(expr);
      if (isSimpleAddSub && nums.every(n => n <= 25)) {
        continue; // too easy
      }
      return [expr, value.toString()];
    }
  }

  return [`8² + √196`, '78'];
};
const MINUS = '−';
// Precomputed logs: { base: [ (arg, result), ... ] }
const LOG_TABLE = {
  2:  [ [4,2], [8,3], [16,4], [32,5], [64,6], [128,7], [256,8], [512,9], [1024,10], [2048,11], [4096,12] ],
  3:  [ [9,2], [27,3], [81,4], [243,5], [729,6], [2187,7], [6561,8] ],
  5:  [ [25,2], [125,3], [625,4], [3125,5] ],
  10: [ [100,2], [1000,3], [10000,4] ]
};

const getInsaneProblem = (stage) => {
  const tier = Math.min(Math.floor(stage / 5), 5); // 0 to 5 (max difficulty at stage 25+)

  // Tier config: grows aggressively
  const config = {
    minVal:   [8, 12, 18, 25, 35, 50][tier],
    maxVal:   [40, 70, 120, 200, 300, 500][tier],
    maxPower: [3, 4, 5, 5, 6, 6][tier],
    maxRoot:  [15, 25, 35, 50, 70, 100][tier],
    allowLog: tier >= 2,
    allowDeepNest: tier >= 3
  };

  // Generate a **complex sub-expression** that evaluates to an integer
  const buildExpr = (depth = 0) => {
    // Base terms: number, power, sqrt, log
    const termType = getRandomInt(1, config.allowLog ? 4 : 3);
    let expr, value;

    if (termType === 1) {
      // Integer (can be negative in intermediates)
      value = getRandomInt(config.minVal, config.maxVal);
      if (depth > 0 && Math.random() < 0.2) value *= -1;
      expr = value.toString();
    } 
    else if (termType === 2) {
      // Power: a^b
      const base = getRandomInt(2, Math.min(15, config.maxVal));
      const exp = getRandomInt(2, config.maxPower);
      value = Math.pow(base, exp);
      if (value >= 10000 || !Number.isInteger(value)) return buildExpr(depth);
      expr = `${base}${toSuperscript(exp)}`;
    } 
    else if (termType === 3) {
      // Square root (perfect square only)
      const root = getRandomInt(5, config.maxRoot);
      value = root;
      expr = `√${root * root}`;
    } 
    else if (termType === 4 && config.allowLog) {
      // Log: choose base and precomputed pair
      const bases = Object.keys(LOG_TABLE).map(Number);
      const base = bases[getRandomInt(0, bases.length - 1)];
      const pairs = LOG_TABLE[base].filter(([arg]) => arg < 10000);
      if (pairs.length === 0) return buildExpr(depth);
      const [arg, result] = pairs[getRandomInt(0, pairs.length - 1)];
      value = result;
      expr = base === 10 ? `log₁₀(${arg})` : `log₂(${arg})`.replace('2', base.toString());
      // Fix base digit (Unicode doesn't have all, so use subscript-like)
      if (base !== 10 && base !== 2) {
        expr = `log${base}(${arg})`; // fallback: log5(125)
      }
    }

    // Decide whether to stop or combine
    if (depth >= (config.allowDeepNest ? 2 : 1) || Math.random() < 0.4) {
      return { expr, value };
    }

    // Combine with another term
    const right = buildExpr(depth + 1);
    const leftVal = value;
    const rightVal = right.value;

    // Choose operation — ensure division is clean
    const ops = ['+', MINUS, '×'];
    if (rightVal !== 0 && leftVal % rightVal === 0) {
      const q = leftVal / rightVal;
      if (Number.isInteger(q) && Math.abs(q) < 10000) ops.push('÷');
    }

    if (ops.length === 0) return { expr, value }; // fallback

    const op = ops[getRandomInt(0, ops.length - 1)];
    let finalVal, finalExpr;

    switch (op) {
      case '+': finalVal = leftVal + rightVal; break;
      case MINUS: finalVal = leftVal - rightVal; break;
      case '×': finalVal = leftVal * rightVal; break;
      case '÷': finalVal = leftVal / rightVal; break;
    }

    if (!Number.isInteger(finalVal) || Math.abs(finalVal) >= 10000) {
      return { expr, value }; // abort combination
    }

    // Use parentheses to enforce clarity
    finalExpr = `(${expr} ${op} ${right.expr})`;
    return { expr: finalExpr, value: finalVal };
  };

  // Keep generating until we get a hard, valid problem
  for (let attempt = 0; attempt < 50; attempt++) {
    const { expr, value } = buildExpr(0);

    if (
      Number.isInteger(value) &&
      value > 0 &&
      value < 10000 &&
      // Reject if too simple (e.g., single term or only small numbers)
      (expr.includes('×') || expr.includes('÷') || expr.includes('√') || expr.includes('log') || expr.includes('²') || expr.includes('³'))
    ) {
      // Remove outermost parentheses if safe
      let cleanExpr = expr;
      if (cleanExpr.startsWith('(') && cleanExpr.endsWith(')')) {
        let depth = 0, safe = true;
        for (let i = 0; i < cleanExpr.length - 1; i++) {
          if (cleanExpr[i] === '(') depth++;
          else if (cleanExpr[i] === ')') depth--;
          if (depth === 0) { safe = false; break; }
        }
        if (safe) cleanExpr = cleanExpr.slice(1, -1);
      }

      // Ensure it's actually hard: at least 2 advanced ops OR large numbers
      const advancedCount =
        (cleanExpr.match(/√/g) || []).length +
        (cleanExpr.match(/log/g) || []).length +
        (cleanExpr.match(/[²³⁴⁵⁶⁷⁸⁹]/g) || []).length;
      const hasCombo = cleanExpr.includes('(') || cleanExpr.includes('×') || cleanExpr.includes('÷');

      if (advancedCount >= 2 || (advancedCount === 1 && hasCombo)) {
        return [cleanExpr, value.toString()];
      }
    }
  }

  // Ultimate fallback: guaranteed hard problem
  return [`(√4096 + 6³) ÷ log₂(64)`, '10'];
};

const getProblemEndlessType = (stage) => {
  // Determine difficulty tier every 10 stages
  const tier = Math.floor(stage / 10); // 0: 0–9, 1: 10–19, 2: 20–29, etc.

  // Cap tier to avoid unbounded growth (optional safety)
  const cappedTier = Math.min(tier, 5); // supports up to stage 59+ with tier 5

  // Use different strategies based on tier
  if (cappedTier === 0) {
    // Stages 0–9: Start with easy, but allow 2–3 number chains by stage 7+
    const effectiveStage = Math.min(stage, 15); // reuse easy logic with slight boost
    return getEasyProblem(effectiveStage);
  } else if (cappedTier === 1) {
    // Stages 10–19: Medium problems, mostly 2-op, introduce parentheses
    const effectiveStage = 5 + (stage - 10); // map 10→5, 19→14
    return getMediumProblem(effectiveStage);
  } else if (cappedTier === 2) {
    // Stages 20–29: Hard mode — powers, roots, 2–3 term combos
    const effectiveStage = 10 + (stage - 20); // map 20→10, 29→19 → use hard
    return getHardProblem(effectiveStage);
  } else {
    // Tier 3+: Endgame — custom escalating logic
    return generateEndgameProblem(cappedTier, stage);
  }
};

// Helper: Endgame problems (tier ≥ 3 → stages 30+)
const generateEndgameProblem = (tier, stage) => {
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const getDivisors = (n, minD, maxD) => {
    const divs = [];
    for (let d = minD; d <= maxD && d <= n; d++) {
      if (n % d === 0) divs.push(d);
    }
    return divs;
  };

  // Increase ranges with tier
  const baseMin = 20 + tier * 15;      // e.g., tier3 → 65
  const baseMax = 100 + tier * 50;     // tier3 → 250
  const maxResult = 5000 + tier * 2000; // tier3 → 11,000

  // Decide structure: 60% two-operation with nesting, 30% three-term chain, 10% advanced (pow/root)
  let problem, answer;
  const attempts = 0;
  const maxAttempts = 80;

  // Try advanced expression first
  while (attempts < maxAttempts) {
    // Mix of: (A op B) op C, A op (B op C), or include √ / power
    const useAdvanced = Math.random() < 0.4;
    const useNested = Math.random() < 0.7;

    let a, b, c, inner, outer, result, expr;

    if (useAdvanced) {
      // Include a power or root
      const hasPower = Math.random() < 0.5;
      const val1 = hasPower
        ? (() => {
            const base = randInt(4, Math.min(15, baseMax / 10));
            const exp = Math.random() < 0.8 ? 2 : 3;
            const v = Math.pow(base, exp);
            return { expr: `${base}${toSuperscript(exp)}`, value: v };
          })()
        : (() => {
            const r = randInt(6, Math.min(25, Math.sqrt(baseMax * 3)));
            return { expr: `√${r * r}`, value: r };
          })();

      const val2 = randInt(baseMin, baseMax);
      const op1 = ['+', '−', '×'][randInt(0, 2)];
      let temp;
      if (op1 === '+') temp = val1.value + val2;
      else if (op1 === '−') temp = val1.value - val2;
      else temp = val1.value * val2;

      if (temp <= 0 || temp > maxResult) continue;

      // Optional third operand
      if (Math.random() < 0.5) {
        const val3 = randInt(10, baseMax / 2);
        const op2 = ['+', '−'][randInt(0, 1)];
        if (op2 === '+') result = temp + val3;
        else {
          if (temp <= val3) continue;
          result = temp - val3;
        }
        if (result <= 0 || result > maxResult) continue;
        expr = `${val1.expr} ${op1} ${val2} ${op2} ${val3}`;
      } else {
        result = temp;
        expr = `${val1.expr} ${op1} ${val2}`;
      }

      if (Number.isInteger(result)) {
        problem = expr;
        answer = result.toString();
        break;
      }
    } else if (useNested) {
      // Nested: (A op B) op C
      a = randInt(baseMin, baseMax);
      b = randInt(10, Math.min(80, a)); // ensure reasonable
      c = randInt(10, Math.min(100, baseMax));

      const innerOp = ['+', '−', '×'][randInt(0, 2)];
      if (innerOp === '−' && a <= b) continue;
      inner = innerOp === '+' ? a + b : innerOp === '−' ? a - b : a * b;

      if (inner <= 0 || inner > maxResult * 0.9) continue;

      // Outer op
      const outerOp = ['+', '−', '×'][randInt(0, 2)];
      if (outerOp === '−' && inner <= c) continue;
      if (outerOp === '×' && inner * c > maxResult) continue;

      result = outerOp === '+' ? inner + c : outerOp === '−' ? inner - c : inner * c;
      if (result <= 0 || result > maxResult) continue;

      expr = `(${a} ${innerOp === '×' ? '×' : innerOp} ${b}) ${outerOp === '×' ? '×' : outerOp} ${c}`;
      problem = expr;
      answer = result.toString();
      break;
    } else {
      // Three-term chain without nesting
      a = randInt(baseMin, baseMax);
      b = randInt(20, baseMax / 2);
      c = randInt(15, baseMax / 3);

      const ops = [
        [a + b + c, `${a} + ${b} + ${c}`],
        [a + b - c, `${a} + ${b} - ${c}`],
        [a - b + c, `${a} - ${b} + ${c}`],
        [a * b + c, `${a} × ${b} + ${c}`],
        [a * b - c, `${a} × ${b} - ${c}`]
      ].filter(([val]) => val > 0 && val <= maxResult && Number.isInteger(val));

      if (ops.length === 0) continue;
      const [val, e] = ops[randInt(0, ops.length - 1)];
      problem = e;
      answer = val.toString();
      break;
    }
  }

  // Fallback: guaranteed valid hard-like problem
  if (!problem || !answer) {
    const fallbacks = [
      ["15² − √225", "210"],
      ["(200 ÷ 8) × 12", "300"],
      ["180 + 7² − 45", "184"],
      ["(√400 + 30) × 4", "200"]
    ];
    return fallbacks[Math.min(tier - 3, fallbacks.length - 1)] || fallbacks[0];
  }

  return [problem, answer];
};
const getProblemRelaxMode = (stage) => {
  // Relax mode: slower progression — every 15 stages = new tier
  const tier = Math.min(Math.floor(stage / 15), 4); // tiers 0–4 → stages 0–74+

  // Config per tier: gentle, clear, and encouraging
  const config = [
    // Tier 0: stages 0–14 → very friendly (like Easy tier 0–1)
    { type: 'easy', stageMap: Math.min(stage, 8) },
    // Tier 1: stages 15–29 → light challenge (Easy tier 2 + simple Medium)
    { type: 'easy', stageMap: 9 + Math.min(stage - 15, 6) }, // maps to stage 9–15 in easy
    // Tier 2: stages 30–44 → medium comfort (Medium tier 1–2)
    { type: 'medium', stageMap: 5 + Math.min(stage - 30, 9) }, // stage 5–14 in medium
    // Tier 3: stages 45–59 → solid medium (Medium tier 3–4)
    { type: 'medium', stageMap: 15 + Math.min(stage - 45, 10) },
    // Tier 4: stages 60+ → relaxed hard (Hard mode, but skip most aggressive combos)
    { type: 'hard-relaxed', stageMap: 12 + Math.min(stage - 60, 12) }
  ][tier];

  if (config.type === 'easy') {
    return getEasyProblem(config.stageMap);
  } else if (config.type === 'medium') {
    return getMediumProblem(config.stageMap);
  } else {
    // 'hard-relaxed': use hard logic but filter out overly complex expressions
    let attempts = 0;
    while (attempts < 20) {
      const [expr, ans] = getHardProblem(config.stageMap);
      const numCount = (expr.match(/\d+/g) || []).length;
      const hasPowerOrRoot = expr.includes('√') || expr.includes('²') || expr.includes('³');

      // In relax mode, allow advanced ops but keep expression readable:
      // - Max 2 operations
      // - Max 3 numbers
      // - Avoid deep nesting like ((A op B) op C) unless very clean
      if (numCount <= 3 && !expr.includes('((') && (hasPowerOrRoot || expr.split(/[+\−×÷]/).length <= 3)) {
        return [expr, ans];
      }
      attempts++;
    }

    // Fallback to clean hard-like problem
    const fallbacks = [
      ["12²", "144"],
      ["√225 + 18", "33"],
      ["(40 + 25) − 10", "55"],
      ["16 × 6 + 4", "100"],
      ["9² − √81", "72"]
    ];
    return fallbacks[Math.min(tier - 3, fallbacks.length - 1)] || fallbacks[0];
  }
};

export function getPoints(type, difficulty, stage, time, rightAnswer, yourAnswer, streakLength) {
  const baseScores = [100, 200, 300, 400,50,5];
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


const nums = [5,6,7,8,9,10,11,12,13,14,15,16];