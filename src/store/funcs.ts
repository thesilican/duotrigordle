import { MersenneTwister, range } from "../util";
import {
  NUM_BOARDS,
  NUM_GUESSES,
  PRACTICE_MODE_MIN_ID,
  START_DATE,
  WORDS_TARGET,
} from "./consts";
import { Challenge } from "./slice/game";

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

// Returns a list of all colors for every board
export function getAllGuessColors(
  targets: string[],
  guesses: string[]
): string[][] {
  return targets.map((target) =>
    guesses.map((guess) => getGuessColors(target, guess))
  );
}

// Returns whether each board is completed
export function getCompletedBoards(
  targets: string[],
  guesses: string[]
): boolean[] {
  return targets.map((target) => guesses.includes(target));
}

// Returns the number of boards that are completed
export function getCompletedBoardsCount(
  targets: string[],
  guesses: string[]
): number {
  return targets.reduce(
    (a, target) => a + (guesses.includes(target) ? 1 : 0),
    0
  );
}

// Check if every target word has been guessed
export function getAllWordsGuessed(targets: string[], guesses: string[]) {
  return getCompletedBoards(targets, guesses).indexOf(false) === -1;
}

// Generate 3 random words
// it is guarenteed that at least 12 different letters are used among the 3 words
export function getJumbleWords(targets: string[], seed: number): string[] {
  const rng = MersenneTwister(seed);
  const words: string[] = [];
  for (let i = 0; i < 1000; i++) {
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
    if (letterPool.size >= 12) {
      break;
    }
  }
  return words;
}

// Returns the id for today's duotrigordle
export function getDailyId(timestamp: number): number {
  const diff = timestamp - START_DATE;
  return Math.ceil(diff / 1000 / 60 / 60 / 24);
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

// Returns the current visible board for the sequence challenge
export function getSequenceVisibleBoard(targets: string[], guesses: string[]) {
  for (let i = 0; i < targets.length; i++) {
    if (!guesses.includes(targets[i])) {
      return i;
    }
  }
  return targets.length;
}

// Given a list of guesses and their colors, returns an array with 5 elements where
// the ith element is the green letter in that column, or "" if it is not yet known
export function getGhostLetters(guesses: string[], colors: string[]): string[] {
  const ghostLetters: string[] = range(5).map(() => "");
  for (let i = 0; i < 5; i++) {
    for (let row = 0; row < guesses.length; row++) {
      if (colors[row][i] === "G") {
        ghostLetters[i] = guesses[row][i];
        break;
      }
    }
  }
  return ghostLetters;
}

// Given an input, a list of guesses, and their corresponding colors,
// returns a hint for whether the
export function getWarnHint(
  input: string,
  guesses: string[],
  colors: string[]
) {
  const include = new Set<string>();
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < guesses.length; row++) {
      if (colors[row][col] === "Y" || colors[row][col] === "G") {
        include.add(guesses[row][col]);
      }
    }
  }
  const exclude = new Set<string>();
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < guesses.length; row++) {
      if (colors[row][col] === "B" && !include.has(guesses[row][col])) {
        exclude.add(guesses[row][col]);
      }
    }
  }
  for (const letter of exclude) {
    if (input.includes(letter)) {
      return true;
    }
  }
  for (const letter of include) {
    if (input.length === 5 && !input.includes(letter)) {
      return true;
    }
  }

  for (let col = 0; col < input.length; col++) {
    for (let row = 0; row < guesses.length; row++) {
      if (colors[row][col] === "G" && input[col] !== guesses[row][col]) {
        return true;
      }
      if (colors[row][col] === "Y" && input[col] === guesses[row][col]) {
        return true;
      }
    }
  }
  return false;
}

// Returns whether or not the current game is over
export function getIsGameOver(
  targets: string[],
  guesses: string[],
  challenge: Challenge
) {
  const maxGuesses = challenge === "perfect" ? NUM_BOARDS : NUM_GUESSES;
  return getAllWordsGuessed(targets, guesses) || guesses.length >= maxGuesses;
}
