import { createAction, createReducer } from "@reduxjs/toolkit";
import { Challenge, initialState } from "..";

export type HistoryEntry = {
  gameMode: "daily" | "practice";
  challenge: Challenge;
  id: number;
  guesses: number | null;
  time: number | null;
};
export type StatsState = {
  history: HistoryEntry[];
};
export const statsInitialState: StatsState = {
  history: [],
};

export const statsAction = {
  load: createAction<StatsState>("stats/loadStats"),
  addEntry: createAction<HistoryEntry>("stats/addEntry"),
  setHistory: createAction<HistoryEntry[]>("stats/setHistory"),
};

export const statsReducer = createReducer(
  () => initialState,
  (builder) =>
    builder
      .addCase(statsAction.load, (state, action) => {
        state.stats = action.payload;
        state.stats.history = normalizeHistory(state.stats.history);
      })
      .addCase(statsAction.addEntry, (state, action) => {
        state.stats.history = addHistoryEntry(
          state.stats.history,
          action.payload
        );
      })
      .addCase(statsAction.setHistory, (state, action) => {
        state.stats.history = normalizeHistory(action.payload);
      })
);

function entryKeysEqual(a: HistoryEntry, b: HistoryEntry) {
  return (
    a.gameMode === b.gameMode && a.challenge === b.challenge && a.id === b.id
  );
}

export function addHistoryEntry(
  history: HistoryEntry[],
  entry: HistoryEntry
): HistoryEntry[] {
  const newHistory = history.filter((x) => !entryKeysEqual(x, entry));
  newHistory.push(entry);
  return normalizeHistory(newHistory);
}

export function normalizeHistory(history: HistoryEntry[]) {
  const newHistory: HistoryEntry[] = [];

  // Deduplicate history
  for (const entry of history) {
    let dup = false;
    for (const newEntry of newHistory) {
      if (entryKeysEqual(entry, newEntry)) {
        dup = true;
        break;
      }
    }
    if (!dup) {
      newHistory.push(entry);
    }
  }

  // Sort by id then challenge
  const gameModeOrder = {
    daily: 0,
    practice: 1,
  };
  const challengeOrder = {
    normal: 0,
    sequence: 1,
    jumble: 2,
    perfect: 3,
  };
  newHistory.sort((a, b) => {
    if (a.gameMode !== b.gameMode) {
      return gameModeOrder[a.gameMode] - gameModeOrder[b.gameMode];
    } else if (a.gameMode === "daily") {
      if (a.id !== b.id) {
        return a.id - b.id;
      } else {
        return challengeOrder[a.challenge] - challengeOrder[b.challenge];
      }
    } else {
      if (a.challenge !== b.challenge) {
        return challengeOrder[a.challenge] - challengeOrder[b.challenge];
      } else {
        return a.id - b.id;
      }
    }
  });

  return newHistory;
}
