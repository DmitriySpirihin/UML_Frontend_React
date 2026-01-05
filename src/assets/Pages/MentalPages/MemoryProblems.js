import { memorySequenceLevels } from './MentalHelper';

export function getProblem(type, difficulty, stage) {
  if (type !== 1) return ['', '', false];

  const level = memorySequenceLevels[difficulty] || memorySequenceLevels[0];
  const { sequence } = getSequenceProblem(difficulty, stage);
  const problem = formatSequence(sequence);
  const answer = sequence.join('');

  // ✅ Reverse only if:
  // - Level supports reverse (hard/max)
  // - Stage is 11 or higher
  const shouldReverse = !!(level.reverseEnabled && stage >= 11);

  return [problem, answer, shouldReverse];
}

const NUMBER_CHARS = ['1','2','3','4','5','6','7','8','9','0'];

const ARROW_CHARS = ['←','↑','→','↓'];

const ALL_CHARS = [...ARROW_CHARS, ...NUMBER_CHARS]; // or your original CHARS

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const lerp = (a, b, t) => a + (b - a) * t;

export function getRoundConfig(difficulty, stage) {
  // Ensure difficulty is a valid index: 0 to 3
  const validDifficulty = Math.max(0, Math.min(3, difficulty ?? 0));
  const level = memorySequenceLevels[validDifficulty];

  const t = clamp((stage - 1) / 19, 0, 1);

  const minElems = level.elementsRange[0];
  const maxElems = level.elementsRange[1];
  const sequenceLength = Math.round(lerp(minElems, maxElems, t));

  // If using old memorizeTimeSecRange (for legacy), or new timing:
  const charShowMs = level.charShowMs || 600;
  const retentionDelayMs = level.retentionDelayMs || 2000;

  return {
    sequenceLength,
    charShowMs,
    retentionDelayMs,
    // Keep memorizeTimeMs for compatibility if needed
    memorizeTimeMs: Math.max(1000, (level.memorizeTimeSecRange?.[0] || 5) * 1000),
  };
}

function getSequenceProblem(difficulty, stage) {
  const { sequenceLength, charShowMs, retentionDelayMs } = getRoundConfig(difficulty, stage);
  
  // Choose character set
  const charSet = difficulty === 0 ? NUMBER_CHARS : ALL_CHARS;

  const sequence = [];
  for (let i = 0; i < sequenceLength; i++) {
    let char;
    do {
      char = charSet[getRandomInt(0, charSet.length - 1)];
      // Avoid repetition with previous character
    } while (i > 0 && char === sequence[i - 1]);
    
    sequence.push(char);
  }

  return { sequence, charShowMs, retentionDelayMs };
}

export function formatSequence(sequence) {
  return Array.isArray(sequence) ? sequence.join(' ') : '';
}

const getSequencePrecision = (rightAnswer, yourAnswer) => {
  if (!rightAnswer) return 1;
  const right = String(rightAnswer);
  const yours = String(yourAnswer || '');

  const len = right.length;
  let matches = 0;
  for (let i = 0; i < len; i++) {
    if (yours[i] === right[i]) matches += 1;
  }

  return 1 - matches / len;
};


export function getPoints(type, difficulty, stage, time, rightAnswer, yourAnswer, streakLength) {
  if (type !== 1) return 0;

  const baseScores = [140, 200, 260, 330];
  const base = baseScores[difficulty] || 140;

  const precision = getSequencePrecision(rightAnswer, yourAnswer);
  const accuracy = 1 - precision;

  const stageMultiplier = Math.min(1 + stage * 0.02, 1.3);

  const timeNorm = Math.min(time / 6000, 2);
  const timeMultiplier = accuracy === 1 ? Math.max(1.3 - (timeNorm - 1) * 0.3, 1) : 1;

  const streakMultiplier = streakLength >= 5 && accuracy === 1
    ? Math.min(1 + 0.1 * Math.min(streakLength / 10, 4), 1.5)
    : 1;

  return Math.round(base * accuracy * stageMultiplier * timeMultiplier * streakMultiplier);
}

export function hasStreak(type,rightAnswer, yourAnswer) {
  if (type !== 1) return false;
  return String(yourAnswer || '') === String(rightAnswer || '');
}

export function getPrecision(type,rightAnswer, yourAnswer){
  if (type !== 1) return 1;
  return getSequencePrecision(rightAnswer, yourAnswer);
}