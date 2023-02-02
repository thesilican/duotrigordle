import { Dispatch } from "@reduxjs/toolkit";
import { NUM_GUESSES } from "./consts";
import { getTargetWords, getAllWordsGuessed, getTodaysId } from "./funcs";
import { GameState, gameAction } from "./slice/game";
import { settingsAction, SettingsState } from "./slice/settings";
import { statsAction, StatsState } from "./slice/stats";

// Serialization for game
type GameSerialized = {
  id: number;
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
    typeof obj.endTime == "number"
  ) {
    return {
      id: obj.id,
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
    guesses: state.guesses,
    startTime: state.startTime,
    endTime: state.endTime,
  };
}
export function deserializeGame(serialized: GameSerialized): GameState {
  const targets = getTargetWords(serialized.id);
  const gameOver =
    serialized.guesses.length === NUM_GUESSES ||
    getAllWordsGuessed(targets, serialized.guesses);
  return {
    id: serialized.id,
    input: "",
    targets,
    guesses: serialized.guesses,
    gameOver,
    practice: false,
    startTime: serialized.startTime,
    endTime: serialized.endTime,
  };
}
export function loadGameFromLocalStorage(dispatch: Dispatch) {
  const todaysId = getTodaysId();
  const text = localStorage.getItem("duotrigordle-state");
  const serialized = assertGameSerialized(text && JSON.parse(text));
  if (serialized && serialized.id === todaysId) {
    dispatch(gameAction.load({ game: deserializeGame(serialized) }));
  } else {
    dispatch(gameAction.start({ id: todaysId, practice: false }));
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
