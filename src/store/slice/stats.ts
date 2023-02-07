import { createAction, createReducer } from "@reduxjs/toolkit";
import { initialState } from "..";
import { PRACTICE_MODE_MIN_ID } from "../consts";

export type HistoryEntry = {
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
  removeEntry: createAction<{ id: number }>("stats/removeEntry"),
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
        const entry = action.payload;
        const newHistory = state.stats.history.filter((x) => x.id !== entry.id);
        newHistory.push(entry);
        state.stats.history = normalizeHistory(newHistory);
      })
      .addCase(statsAction.removeEntry, (state, action) => {
        const newHistory = state.stats.history.filter(
          (x) => x.id !== action.payload.id
        );
        state.stats.history = normalizeHistory(newHistory);
      })
      .addCase(statsAction.setHistory, (state, action) => {
        state.stats.history = normalizeHistory(action.payload);
      })
);

export function normalizeHistory(history: HistoryEntry[]): HistoryEntry[] {
  const newHistory: HistoryEntry[] = [];
  // Remove invalid ids
  const visited = new Set();
  for (const entry of history) {
    if (
      entry.id > 0 &&
      entry.id < PRACTICE_MODE_MIN_ID &&
      !visited.has(entry.id)
    ) {
      newHistory.push({
        id: entry.id,
        guesses: entry.guesses,
        time: entry.time,
      });
    }
  }
  // Sort ids
  newHistory.sort((a, b) => a.id - b.id);
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
