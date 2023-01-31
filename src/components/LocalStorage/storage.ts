import { Dispatch } from "@reduxjs/toolkit";
import { NUM_GUESSES } from "../../store/consts";
import {
  gameAction,
  GameState,
  getAllWordsGuessed,
  getTargetWords,
  getTodaysId,
  settingsAction,
  SettingsState,
  statsAction,
  StatsState,
} from "../../store";

// Serialization for game
type GameSerialized = {
  id: number;
  guesses: string[];
  startTime: number;
  endTime: number;
};
export function isGameSerialized(obj: any): obj is GameSerialized {
  // Check the shape of the object just in case a previous invalid version of
  // the object was stored in local storage
  try {
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
    if (typeof obj.startTime !== "number") {
      return false;
    }
    if (typeof obj.endTime !== "number") {
      return false;
    }
    return true;
  } catch {
    return false;
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
  const serialized = text && JSON.parse(text);
  if (isGameSerialized(serialized) && serialized.id === todaysId) {
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
