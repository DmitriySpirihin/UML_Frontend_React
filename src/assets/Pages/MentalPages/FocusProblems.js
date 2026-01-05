import { focusTrainingLevels } from "./MentalHelper";

/**
 * Generates a problem (sequence of symbols) for focus training.
 * @param {number} type - Task type (3 = focus/attention counting)
 * @param {number} difficulty - 0=easy, 1=medium, 2=hard, 3=max
 * @param {number} stage - Progression stage (currently unused in generation)
 * @returns {[string[], string]} - [symbols array, correct count as string]
 */
const DISTRACTOR_POOL = ['●', '▲', '■', '◆', '⬟', '✚', '⬢', '⬟', '✦', '✳', '❄', '⬟'];
export function getProblem(type, difficulty, stage) {
  if (type !== 3) {
    return [[], '']; // unsupported type
  }

  const levelIndex = Math.max(0, Math.min(difficulty, focusTrainingLevels.length - 1));
  const levelConfig = focusTrainingLevels[levelIndex];

  // Use targetSymbol from config (default to '★' if missing)
  const targetSymbol = levelConfig.targetSymbol || '★';

  let problem;
  switch (levelIndex) {
    case 0: problem = getEasyProblem(levelConfig); break;
    case 1: problem = getMediumProblem(levelConfig); break;
    case 2: problem = getHardProblem(levelConfig); break;
    case 3: problem = getMaxProblem(levelConfig); break;
    default: problem = getEasyProblem(levelConfig);
  }

  const answer = problem.filter(char => char === targetSymbol).length;
  return [problem, answer.toString()];
}


const getEasyProblem = (config) => generateSequence(config, 0);
const getMediumProblem = (config) => generateSequence(config, 1);
const getHardProblem = (config) => generateSequence(config, 2);
const getMaxProblem = (config) => generateSequence(config, 3);


/**
 * Generates a random sequence of symbols.
 * @param {Object} config - Level config from focusTrainingLevels
 * @param {number} difficulty - Used to pick distractor variant
 * @returns {string[]}
 */
function generateSequence(config, difficulty) {
  const totalItems = randomInRange(...config.totalItemsRange);
  let targetCount = randomInRange(...config.targetsPerRoundRange);
  targetCount = Math.min(targetCount, totalItems); // 🔒 safety

  const targetSymbol = config.targetSymbol || '★';

  // 🔥 Generate array of random distractors (one per slot)
  const sequence = Array.from({ length: totalItems }, () =>
    DISTRACTOR_POOL[Math.floor(Math.random() * DISTRACTOR_POOL.length)]
  );

  // Place targets at random unique indices
  const indices = new Set();
  while (indices.size < targetCount) {
    indices.add(Math.floor(Math.random() * totalItems));
  }

  indices.forEach(i => {
    sequence[i] = targetSymbol;
  });

  // Optional: shuffle final array (not strictly needed, but adds variance)
  return sequence.sort(() => Math.random() - 0.5);
}

function randomInRange(min, max) {
  if (min == null || max == null || isNaN(min) || isNaN(max)) {
    console.error('[randomInRange] Invalid range:', { min, max });
    return 4; // fallback
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// === Scoring & Validation (unchanged, but keep for completeness) ===

export function getPoints(type, difficulty, stage, time, rightAnswer, yourAnswer, streakLength) {
  if (type !== 3) return 0;

  const baseScores = [100, 200, 300, 400];
  const base = baseScores[difficulty] || 100;

  const numAnswer = Number(yourAnswer);
  const numRightAnswer = Number(rightAnswer);
  const diffRatio = numRightAnswer !== 0 ? Math.abs(numRightAnswer - numAnswer) / numRightAnswer : 1;
  const closeness = diffRatio === 0 ? 1 : (diffRatio < 0.15 ? 0.5 : 0);

  const stageMultiplier = Math.min(1 + stage * 0.02, 1.3);

  const timeSec = time / 1000;
  const expectedTime = focusTrainingLevels[difficulty]?.timeLimitSec || 20;
  const timeNorm = timeSec / expectedTime;
  const timeMultiplier = closeness === 1
    ? Math.max(1.0, 1.3 - (timeNorm - 1) * 0.6)
    : 1.0;

  const streakMultiplier = (streakLength >= 5 && closeness === 1)
    ? Math.min(1 + 0.1 * Math.min(streakLength / 10, 4), 1.5)
    : 1;

  return Math.round(base * closeness * stageMultiplier * timeMultiplier * streakMultiplier);
}

export function hasStreak(type, rightAnswer, yourAnswer) {
  if (type !== 3) return false;
  return Number(yourAnswer) === Number(rightAnswer);
}

export function getPrecision(type, rightAnswer, yourAnswer) {
  if (type !== 3) return 0;
  const numAnswer = Number(yourAnswer);
  const numRightAnswer = Number(rightAnswer);
  return numRightAnswer !== 0 ? Math.abs(numRightAnswer - numAnswer) / numRightAnswer : 1;
}