import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type GameHistory = {
  id: number;
  guesses: number | null;
  time: number;
};
export type StatsState = {
  history: GameHistory[];
};
const initialState: StatsState = {
  history: [],
};

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {
    loadStats: (_, action: PayloadAction<StatsState>) => {
      // Ensure that history is sorted and unique
      const history = action.payload.history
        .filter((h, i, a) => a.findIndex((v) => v.id === h.id) === i)
        .sort((a, b) => a.id - b.id);
      return { history };
    },
    addHistory: (state, action: PayloadAction<GameHistory>) => {
      const idx = state.history.findIndex((v) => v.id === action.payload.id);
      if (idx !== -1) {
        state.history.splice(idx, 1);
      }
      state.history.push(action.payload);
      state.history.sort((a, b) => a.id - b.id);
    },
    removeHistory: (state, action: PayloadAction<{ id: number }>) => {
      state.history = state.history.filter((x) => x.id !== action.payload.id);
    },
  },
});

export const { addHistory, removeHistory, loadStats } = statsSlice.actions;
export const statsReducer = statsSlice.reducer;
