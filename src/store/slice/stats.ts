import { createAction, createReducer } from "@reduxjs/toolkit";
import { initialState } from "..";
import { PRACTICE_MODE_MIN_ID } from "../../consts";

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
        normalizeHistory(state.stats.history);
      })
      .addCase(addHistory, (state, action) => {
        insertHistory(state.stats.history, action.payload);
      })
      .addCase(removeHistory, (state, action) => {
        const history = state.stats.history;
        for (let i = 0; i < history.length; i++) {
          if (history[i].id === action.payload.id) {
            history.splice(i, 1);
          }
        }
        normalizeHistory(state.stats.history);
      })
);

export function insertHistory(history: GameHistory[], game: GameHistory) {
  const idx = history.findIndex((v) => v.id === game.id);
  if (idx !== -1) {
    history.splice(idx, 1);
  }
  history.push(game);
  normalizeHistory(history);
}

export function normalizeHistory(history: GameHistory[]) {
  // Remove practice mode games (in case they were added by accident)
  for (let i = 0; i < history.length; i++) {
    if (history[i].id >= PRACTICE_MODE_MIN_ID) {
      history.splice(i, 1);
      i--;
    }
  }
  // Remove duplicate ids
  const visited = new Set();
  for (let i = 0; i < history.length; i++) {
    if (visited.has(history[i])) {
      history.splice(i, 1);
      i--;
    } else {
      visited.add(history[i]);
    }
  }
  // Sort ids
  history.sort((a, b) => a.id - b.id);
}
