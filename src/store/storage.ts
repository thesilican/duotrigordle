import { Dispatch } from "@reduxjs/toolkit";
import {
  Challenge,
  gameAction,
  GameState,
  getAllGuessColors,
  getDailyId,
  getIsGameOver,
  getTargetWords,
  settingsAction,
  SettingsState,
  statsAction,
  StatsState,
} from ".";

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
  const targets = getTargetWords(serialized.id, serialized.challenge);
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
type StatsSerialized = {
  history: EntrySerialized[];
};
type EntrySerialized = {
  id: number;
  guesses?: number | null;
  time?: number | null;
  challenge?: Challenge;
};
export function assertStatsSerialized(obj: unknown): StatsSerialized | null {
  if (typeof obj !== "object" || obj === null) {
    return null;
  }
  const history: EntrySerialized[] = [];
  if ("history" in obj && Array.isArray(obj.history)) {
    for (const el of obj.history) {
      const entry = assertEntrySerialized(el);
      if (entry) {
        history.push(entry);
      }
    }
  } else {
    return null;
  }
  return {
    history,
  };
}
function assertEntrySerialized(obj: unknown): EntrySerialized | null {
  if (typeof obj !== "object" || obj === null) {
    return null;
  }
  let id: number,
    guesses: number | null,
    time: number | null,
    challenge: Challenge;
  if ("id" in obj && typeof obj.id === "number" && Number.isInteger(obj.id)) {
    id = obj.id;
  } else {
    return null;
  }
  if (!("guesses" in obj) || obj.guesses === null) {
    guesses = null;
  } else if (
    "guesses" in obj &&
    typeof obj.guesses === "number" &&
    Number.isInteger(obj.guesses)
  ) {
    guesses = obj.guesses;
  } else {
    return null;
  }
  if (!("time" in obj) || obj.time === null) {
    time = null;
  } else if (
    "time" in obj &&
    typeof obj.time === "number" &&
    Number.isInteger(obj.time)
  ) {
    time = obj.time;
  } else {
    return null;
  }
  if (!("challenge" in obj)) {
    challenge = "normal";
  } else if (
    "challenge" in obj &&
    (obj.challenge === "normal" ||
      obj.challenge === "sequence" ||
      obj.challenge === "jumble" ||
      obj.challenge === "perfect")
  ) {
    challenge = obj.challenge;
  } else {
    return null;
  }

  return {
    id,
    guesses,
    time,
    challenge,
  };
}
function serializeStats(stats: StatsState): StatsSerialized {
  return stats;
}
function deserializeStats(stats: StatsSerialized): StatsState {
  return {
    history: stats.history.map((ser) => ({
      id: ser.id,
      challenge: ser.challenge ?? "normal",
      guesses: ser.guesses ?? null,
      time: ser.time ?? null,
    })),
  };
}
export function loadStatsFromLocalStorage(dispatch: Dispatch) {
  const text = localStorage.getItem("duotrigordle-stats");
  const stats = assertStatsSerialized(text && JSON.parse(text));
  if (stats) {
    dispatch(statsAction.load(deserializeStats(stats)));
  }
}
export function saveStatsToLocalStorage(state: StatsState) {
  localStorage.setItem(
    "duotrigordle-stats",
    JSON.stringify(serializeStats(state))
  );
}
