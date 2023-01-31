import { NUM_BOARDS, START_DATE, WORDS_TARGET } from "./consts";

// Generate integers 0 <= i < max
export function range(max: number): number[] {
  const array = [];
  for (let i = 0; i < max; i++) {
    array.push(i);
  }
  return array;
}

// Simple seeded RNG
// https://gist.github.com/miyaokamarina/0a8660363095bb5b5d5d7677ed5be9b0
function MersenneTwister(seed: number | Uint32Array) {
  const next = (mt: Uint32Array, i: number, j: number, k: number) => {
    j = (mt[i]! & 0x80000000) | (mt[j]! & 0x7fffffff);
    mt[i] = mt[k]! ^ (j >>> 1) ^ (-(j & 0x1) & 0x9908b0df);
  };
  const twist = (mt: Uint32Array) => {
    let i = 0;
    while (i < 227) next(mt, i++, i, i + 396);
    while (i < 623) next(mt, i++, i, i - 228);
    next(mt, 623, 0, 396);
  };
  let i = 1;
  let mt = new Uint32Array(624);
  const u32 = () => {
    if (i >= 624) {
      twist(mt);
      i = 0;
    }
    let y = mt[i++]!;
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  };
  const f32_ii = () => u32() / 0x0_ffff_ffff;
  const f32_ix = () => u32() / 0x1_0000_0000;
  const f32_xx = () => (u32() + 0.5) / 0x1_0000_0000;
  const u53 = () => (u32() >>> 5) * 67108864 + (u32() >>> 6);
  const f64_ix = () => u53() / 0x20_0000_0000_0000;
  const save = () => {
    let dump = new Uint32Array(625);
    dump[0] = i;
    dump.set(mt, 1);
    return dump;
  };
  if (typeof seed === "number") {
    mt[0] = seed;
    while (i < 624) {
      seed = mt[i - 1]! ^ (mt[i - 1]! >>> 30);
      mt[i] =
        (((seed >>> 16) * 1812433253) << 16) +
        (seed & 0xffff) * 1812433253 +
        i++;
    }
  } else {
    i = seed[0]!;
    mt.set(seed.slice(1));
  }
  return { u32, f32_ii, f32_ix, f32_xx, u53, f64_ix, save };
}

const rng = MersenneTwister(Date.now());
export function randU32() {
  return rng.u32();
}

// Format time elapsed in 00:00.00 format
export function formatTimeElapsed(miliseconds: number) {
  miliseconds = Math.max(miliseconds, 0);
  const minutes = Math.floor(miliseconds / 1000 / 60);
  const seconds = Math.floor(miliseconds / 1000) % 60;
  const hundreds = Math.floor(miliseconds / 10) % 100;
  return (
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0") +
    "." +
    hundreds.toString().padStart(2, "0")
  );
}

// Parse time elapsed in 00:00.00 format
export function parseTimeElapsed(text: string): number | null {
  const match = text.match(/(?:(\d+):)?(\d+(?:\.\d+)?)/);
  if (!match) {
    return null;
  }
  const min = parseFloat(match[1] ?? 0);
  const sec = parseFloat(match[2]);
  const time = (min * 60 + sec) * 1000;
  if (isNaN(time)) {
    return null;
  }
  return time;
}

// Returns the id for today's duotrigordle
export function getTodaysId(): number {
  const diff = Date.now() - START_DATE;
  return Math.ceil(diff / 1000 / 60 / 60 / 24);
}

// Given a duotrigordle id, return the corresponding 32 target wordles
export function getTargetWords(id: number): string[] {
  // Temporary, for migration of GIPSY/GYPSY
  // WORDS_TARGET will be updated after daily duotrigordle 188
  const targetPool = [...WORDS_TARGET];
  if (id > 187) {
    for (const word of ["GIPSY", "GYPSY"]) {
      const idx = targetPool.indexOf(word);
      if (idx !== -1) targetPool.splice(idx, 1);
    }
  }
  const targetWords: string[] = [];
  const rng = MersenneTwister(id);
  while (targetWords.length < NUM_BOARDS) {
    const idx = rng.u32() % targetPool.length;
    const word = targetPool[idx];
    if (!targetWords.includes(word)) {
      targetWords.push(word);
    }
  }
  return targetWords;
}

// Given a guess word and target word, returns a 5-letter string
// consisting of either "B", "Y", or "G" representing a
// black, yellow, or green letter guess
// e.g. getGuessResult("XYCEZ", "ABCDE") returns "BBGYB"
export function getGuessColors(target: string, guess: string): string {
  let guessResult: string[] = ["B", "B", "B", "B", "B"];

  // Find green letters
  const unmatched = new Map<string, number>();
  for (let i = 0; i < 5; i++) {
    if (guess[i] === target[i]) {
      guessResult[i] = "G";
    } else {
      const count = unmatched.get(target[i]) ?? 0;
      unmatched.set(target[i], count + 1);
    }
  }

  // Find yellow letters
  for (let i = 0; i < 5; i++) {
    if (guessResult[i] === "G") {
      continue;
    }
    const count = unmatched.get(guess[i]);
    if (count !== undefined && count > 0) {
      guessResult[i] = "Y";
      unmatched.set(guess[i], count - 1);
    }
  }
  return guessResult.join("");
}

// Return all boards that are completed
export function getCompletedBoards(
  targets: string[],
  guesses: string[]
): boolean[] {
  return targets.map((target) => guesses.includes(target));
}

// Check if every target word has been guessed
export function getAllWordsGuessed(targets: string[], guesses: string[]) {
  return getCompletedBoards(targets, guesses).indexOf(false) === -1;
}
