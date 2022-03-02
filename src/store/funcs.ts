import { START_DATE } from ".";
import { mulberry32 } from "../util";
import { NUM_BOARDS, WORDS_TARGET } from "./consts";

// Returns the id for today's duotrigordle
export function getTodaysId(): number {
  const today = new Date();
  const diff = today.getTime() - START_DATE.getTime();
  return Math.ceil(diff / 1000 / 60 / 60 / 24);
}

// Given a duotrigordle id, return the corresponding 32 target wordles
export function getTargetWords(id: number): string[] {
  const targetWords: string[] = [];
  const randInt = mulberry32(id);
  while (targetWords.length < NUM_BOARDS) {
    const idx = randInt() % WORDS_TARGET.length;
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
export function getGuessResult(guess: string, target: string): string {
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

// Check if every target word has been guessed
export function allWordsGuessed(guesses: string[], targets: string[]) {
  if (guesses.length < targets.length) {
    return false;
  }
  for (const guess of guesses) {
    if (targets.indexOf(guess) === -1) {
      return false;
    }
  }
  return true;
}
