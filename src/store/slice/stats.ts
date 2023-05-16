import { createAction, createReducer } from "@reduxjs/toolkit";
import { Challenge, initialState } from "..";

export type HistoryEntry =
  | {
      gameMode: "daily";
      challenge: Challenge;
      id: number;
      guesses: number | null;
      time: number | null;
    }
  | {
      gameMode: "practice";
      challenge: Challenge;
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
        normalizeHistory(state.stats.history);
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

export function addHistoryEntry(
  history: HistoryEntry[],
  entry: HistoryEntry
): HistoryEntry[] {
  const newHistory = history.filter((x) => {
    return !(
      x.gameMode === "daily" &&
      entry.gameMode === "daily" &&
      x.challenge === entry.challenge &&
      x.id === entry.id
    );
  });
  newHistory.push(entry);
  return normalizeHistory(newHistory);
}

export function normalizeHistory(history: HistoryEntry[]) {
  const newHistory: HistoryEntry[] = [];

  // Deduplicate history
  for (const entry of history) {
    let dup = false;
    for (const newEntry of newHistory) {
      if (
        newEntry.gameMode === "daily" &&
        entry.gameMode === "daily" &&
        newEntry.challenge === entry.challenge &&
        newEntry.id === entry.id
      ) {
        dup = true;
        break;
      }
    }
    if (!dup) {
      newHistory.push(entry);
    }
  }

  // Sort by id then challenge
  const challengeOrder = {
    normal: 0,
    sequence: 1,
    jumble: 2,
    perfect: 3,
  };
  newHistory.sort((a, b) => {
    if (a.gameMode !== "daily" && b.gameMode !== "daily") {
      return challengeOrder[a.challenge] - challengeOrder[b.challenge];
    } else if (a.gameMode !== "daily") {
      return 1;
    } else if (b.gameMode !== "daily") {
      return -1;
    } else if (a.id !== b.id) {
      return a.id - b.id;
    } else {
      return challengeOrder[a.challenge] - challengeOrder[b.challenge];
    }
  });

  // Round times to nearest 0.01
  for (let i = 0; i < newHistory.length; i++) {
    const time = newHistory[i].time;
    if (time !== null) {
      const rounded = Math.round(time * 100) / 100;
      // Have to do this because otherwise might be editing "read only" property
      newHistory[i] = {
        ...newHistory[i],
        time: rounded,
      };
    }
  }
  return newHistory;
}
