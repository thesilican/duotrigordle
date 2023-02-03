import { MersenneTwister } from "../util";
import {
  NUM_BOARDS,
  PRACTICE_MODE_MIN_ID,
  START_DATE,
  WORDS_TARGET,
} from "./consts";

// Returns the id for today's duotrigordle
export function getTodaysId(): number {
  const diff = Date.now() - START_DATE;
  return Math.ceil(diff / 1000 / 60 / 60 / 24);
}

// Given a duotrigordle id, return the corresponding 32 target wordles
export function getTargetWords(id: number): string[] {
  const targetWords: string[] = [];
  const rng = MersenneTwister(id);
  while (targetWords.length < NUM_BOARDS) {
    const idx = rng.u32() % WORDS_TARGET.length;
    const word = WORDS_TARGET[idx];
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
  const guessResult: string[] = ["B", "B", "B", "B", "B"];

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

export function getAllGuessColors(
  targets: string[],
  guesses: string[]
): string[][] {
  return targets.map((target) =>
    guesses.map((guess) => getGuessColors(target, guess))
  );
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

// Generate 3 random words
export function getJumbleWords(targets: string[], seed: number): string[] {
  const rng = MersenneTwister(seed);
  const words: string[] = [];
  for (let i = 0; i < 100; i++) {
    words.splice(0, words.length);
    const letterPool = new Set<string>();
    for (let i = 0; i < 3; i++) {
      let word;
      do {
        const idx = rng.u32() % WORDS_TARGET.length;
        word = WORDS_TARGET[idx];
      } while (targets.includes(word));
      words.push(word);
      for (const letter of word) {
        letterPool.add(letter);
      }
    }
    if (letterPool.size >= 10) {
      break;
    }
  }
  return words;
}

// Retuns a random practice mode id
export function getPracticeId(seed: number) {
  const rng = MersenneTwister(seed);
  while (true) {
    const num = rng.u32();
    if (num >= PRACTICE_MODE_MIN_ID) {
      return num;
    }
  }
}
