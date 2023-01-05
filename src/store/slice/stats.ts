import { createAction, createReducer } from "@reduxjs/toolkit";
import { initialState } from "..";
import { PRACTICE_MODE_MIN_ID } from "../../consts";

export type GameEntry = {
  id: number;
  guesses: number | null;
  time: number | null;
};
export type StatsState = {
  history: GameEntry[];
};
export const statsInitialState: StatsState = {
  history: [],
};

export const loadStats = createAction<StatsState>("stats/loadStats");
export const addHistory = createAction<GameEntry>("stats/addHistory");
export const removeHistory = createAction<{ id: number }>(
  "stats/removeHistory"
);
export const setHistory = createAction<GameEntry[]>("stats/setHistory");

export const statsReducer = createReducer(
  () => initialState,
  (builder) =>
    builder
      .addCase(loadStats, (state, action) => {
        state.stats = action.payload;
        normalizeHistory(state.stats.history);
      })
      .addCase(addHistory, (state, action) => {
        const entry = action.payload;
        const newHistory = state.stats.history.filter((x) => x.id !== entry.id);
        newHistory.push(entry);
        state.stats.history = normalizeHistory(newHistory);
      })
      .addCase(removeHistory, (state, action) => {
        const newHistory = state.stats.history.filter(
          (x) => x.id !== action.payload.id
        );
        state.stats.history = normalizeHistory(newHistory);
      })
      .addCase(setHistory, (state, action) => {
        state.stats.history = normalizeHistory(action.payload);
      })
);

export function normalizeHistory(history: GameEntry[]): GameEntry[] {
  const newHistory: GameEntry[] = [];
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
