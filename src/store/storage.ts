import { Dispatch } from "@reduxjs/toolkit";
import {
  Challenge,
  gameAction,
  GameState,
  getAllGuessColors,
  getAllWordsGuessed,
  getDailyId,
  getIsGameOver,
  getTargetWords,
  settingsAction,
  SettingsState,
  statsAction,
  StatsState,
} from ".";
import { NUM_GUESSES } from "./consts";

// Serialization for game
type GameSerialized = {
  id: number;
  challenge: Challenge;
  guesses: string[];
  startTime: number;
  endTime: number;
};
export function assertGameSerialized(obj: unknown): GameSerialized | null {
  // Check the shape of the object just in case a previous invalid version of
  // the object was stored in local storage
  if (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    typeof obj.id == "number" &&
    "guesses" in obj &&
    Array.isArray(obj.guesses) &&
    "startTime" in obj &&
    typeof obj.startTime == "number" &&
    "endTime" in obj &&
    typeof obj.endTime == "number" &&
    "challenge" in obj &&
    (obj.challenge === "normal" ||
      obj.challenge === "sequence" ||
      obj.challenge === "jumble")
  ) {
    return {
      id: obj.id,
      challenge: obj.challenge,
      guesses: obj.guesses,
      startTime: obj.startTime,
      endTime: obj.endTime,
    };
  } else {
    return null;
  }
}
export function serializeGame(state: GameState): GameSerialized {
  return {
    id: state.id,
    challenge: state.challenge,
    guesses: state.guesses,
    startTime: state.startTime,
    endTime: state.endTime,
  };
}
export function deserializeGame(serialized: GameSerialized): GameState {
  const targets = getTargetWords(serialized.id);
  const guesses = serialized.guesses;
  const gameOver = getIsGameOver(targets, guesses, serialized.challenge);
  const colors = getAllGuessColors(targets, guesses);
  return {
    id: serialized.id,
    gameMode: "daily",
    challenge: serialized.challenge,
    input: "",
    targets,
    guesses,
    colors,
    gameOver,
    startTime: serialized.startTime,
    endTime: serialized.endTime,
  };
}
export function loadGameFromLocalStorage(dispatch: Dispatch) {
  const todaysId = getDailyId(Date.now());
  const text = localStorage.getItem("duotrigordle-state");
  const serialized = assertGameSerialized(text && JSON.parse(text));
  if (serialized && serialized.id === todaysId) {
    dispatch(gameAction.load({ game: deserializeGame(serialized) }));
  }
}
export function saveGameToLocalStorage(state: GameState) {
  localStorage.setItem(
    "duotrigordle-state",
    JSON.stringify(serializeGame(state))
  );
}

// Serialization for settings
export function loadSettingsFromLocalStorage(dispatch: Dispatch) {
  const text = localStorage.getItem("duotrigordle-settings");
  const settings = text && JSON.parse(text);
  if (settings) {
    dispatch(settingsAction.update(settings));
  }
}
export function saveSettingsToLocalStorage(state: SettingsState) {
  localStorage.setItem("duotrigordle-settings", JSON.stringify(state));
}

// Serialization for stats
export function loadStatsFromLocalStorage(dispatch: Dispatch) {
  const text = localStorage.getItem("duotrigordle-stats");
  const stats = text && JSON.parse(text);
  if (stats) {
    dispatch(statsAction.load(stats));
  }
}
export function saveStatsToLocalStorage(state: StatsState) {
  localStorage.setItem("duotrigordle-stats", JSON.stringify(state));
}
