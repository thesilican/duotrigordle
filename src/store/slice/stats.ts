import { createAction, createReducer } from "@reduxjs/toolkit";
import { initialState } from "..";

export type GameHistory = {
  id: number;
  guesses: number | null;
  time: number;
};
export type StatsState = {
  history: GameHistory[];
};
export const statsInitialState: StatsState = {
  history: [],
};

export const loadStats = createAction<StatsState>("stats/loadStats");
export const addHistory = createAction<GameHistory>("stats/addHistory");
export const removeHistory = createAction<{ id: number }>(
  "stats/removeHistory"
);

export const statsReducer = createReducer(
  () => initialState,
  (builder) =>
    builder
      .addCase(loadStats, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(addHistory, (state, action) => {
        const stats = state.stats;
        const idx = stats.history.findIndex((v) => v.id === action.payload.id);
        if (idx !== -1) {
          stats.history.splice(idx, 1);
        }
        stats.history.push(action.payload);
        stats.history.sort((a, b) => a.id - b.id);
      })
      .addCase(removeHistory, (state, action) => {
        state.stats.history = state.stats.history.filter(
          (x) => x.id !== action.payload.id
        );
      })
);
