import { createAction, createReducer } from "@reduxjs/toolkit";
import { Challenge, initialState } from "..";

export type HistoryEntry = {
  id: number;
  guesses: number | null;
  time: number | null;
  challenge: Challenge;
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
  const newHistory = history.filter(
    (x) => !(x.id === entry.id && x.challenge === entry.challenge)
  );
  newHistory.push(entry);
  return normalizeHistory(newHistory);
}

export function normalizeHistory(history: HistoryEntry[]) {
  const newHistory: HistoryEntry[] = [];
  for (const entry of history) {
    if (
      !newHistory.find(
        (x) => x.challenge === entry.challenge && x.id === entry.id
      )
    ) {
      newHistory.push({
        id: entry.id,
        challenge: entry.challenge,
        guesses: entry.guesses,
        time: entry.time,
      });
    }
  }
  // Sort by id then challenge
  const challengeOrder = {
    normal: 0,
    sequence: 1,
    jumble: 2,
    perfect: 3,
  };
  newHistory
    .sort((a, b) => challengeOrder[a.challenge] - challengeOrder[b.challenge])
    .sort((a, b) => a.id - b.id);
  // Round times to nearest 0.01
  for (let i = 0; i < newHistory.length; i++) {
    const time = newHistory[i].time;
    if (time !== null) {
      const rounded = Math.round(time * 100) / 100;
      newHistory[i].time = rounded;
    }
  }
  return newHistory;
}
