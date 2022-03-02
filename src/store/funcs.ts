import { mulberry32 } from "../util";
import { NUM_BOARDS, WORDS_TARGET } from "./consts";

export type State = {
  // Daily duotrigordle number (seed for target words)
  id: number;
  // Current word input
  input: string[];
  // 32 wordle boards
  boards: Board[];
  // Whether or not the game is finished
  gameOver: boolean;
};
export type Board = {
  // Target word of board
  target: string;
  // Guessed words of board
  guesses: string[];
  // Whether the board is complete (board.won == true or guesses.length == NUM_GUESSES)
  complete: boolean;
  // Whether the target word has been guessed
  won: boolean;
};

// One of the 3 colors that a letter in a guess word can have
export type GuessColor = "B" | "Y" | "G";
// GuessResult should be a 5-letter string, where each character is a GuessColor
export type GuessResult = string;

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

// Given a guess word and target word, returns the color results
export function getGuessResult(guess: string, target: string): GuessResult {
  let guessResult = "BBBBB";
  function replace(str: string, idx: number, letter: string) {
    return str.substring(0, idx) + str[idx] + str.substring(idx + 1);
  }

  // Find green letters
  const unmatched = new Map<string, number>();
  for (let i = 0; i < 5; i++) {
    if (guess[i] === target[i]) {
      guessResult = replace(guessResult, i, "G");
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
      guessResult = replace(guessResult, i, "Y");
      unmatched.set(guess[i], count - 1);
    }
  }
  return guessResult;
}
