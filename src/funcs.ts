import { Dispatch } from "@reduxjs/toolkit";
import { NUM_BOARDS, NUM_GUESSES, START_DATE, WORDS_TARGET } from "./consts";
import {
  GameState,
  loadGame,
  SettingsState,
  startGame,
  updateSettings,
} from "./store";
import { MersenneTwister } from "./util";

// Returns the id for today's duotrigordle
export function getTodaysId(): number {
  const today = new Date();
  const diff = today.getTime() - START_DATE.getTime();
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
export function getGuessColors(guess: string, target: string): string {
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
  for (const target of targets) {
    if (guesses.indexOf(target) === -1) {
      return false;
    }
  }
  return true;
}

// Serialization for local storage
export type GameSerialized = {
  id: number;
  guesses: string[];
};
export function isGameSerialized(obj: any): obj is GameSerialized {
  // Check the shape of the object just in case a previous invalid version of
  // the object was stored in local storage
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  if (typeof obj.id !== "number") {
    return false;
  }
  if (!Array.isArray(obj.guesses)) {
    return false;
  }
  if (obj.guesses.length > NUM_GUESSES) {
    return false;
  }
  for (const guess of obj.guesses) {
    if (typeof guess !== "string") {
      return false;
    }
  }
  return true;
}
export function serializeGame(state: GameState): GameSerialized {
  return {
    id: state.id,
    guesses: state.guesses,
  };
}
export function deserializeGame(serialized: GameSerialized): GameState {
  const targets = getTargetWords(serialized.id);
  const gameOver =
    serialized.guesses.length === NUM_GUESSES ||
    allWordsGuessed(serialized.guesses, targets);
  return {
    id: serialized.id,
    input: "",
    targets,
    guesses: serialized.guesses,
    gameOver,
    practice: false,
  };
}
export function loadGameFromLocalStorage(dispatch: Dispatch) {
  const todaysId = getTodaysId();
  const text = localStorage.getItem("duotrigordle-state");
  const serialized = text && JSON.parse(text);
  if (isGameSerialized(serialized) && serialized.id === todaysId) {
    dispatch(loadGame({ game: deserializeGame(serialized) }));
  } else {
    dispatch(startGame({ id: todaysId, practice: false }));
  }
}
export function saveGameToLocalStorage(state: GameState) {
  localStorage.setItem(
    "duotrigordle-state",
    JSON.stringify(serializeGame(state))
  );
}

// Serialization for settings
export function isSettingsState(obj: any): obj is SettingsState {
  // Check the shape of the object just in case a previous invalid version of
  // the object was stored in local storage
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  return true;
}
export function loadSettingsFromLocalStorage(dispatch: Dispatch) {
  const text = localStorage.getItem("duotrigordle-settings");
  const settings = text && JSON.parse(text);
  if (isSettingsState(settings)) {
    dispatch(updateSettings({ settings }));
  }
}
export function saveSettingsToLocalStorage(state: SettingsState) {
  localStorage.setItem("duotrigordle-settings", JSON.stringify(state));
}
