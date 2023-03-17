import { createAction, createReducer } from "@reduxjs/toolkit";
import { getDailyId, initialState } from "..";

export type SavesState = {
  daily: DailySaves;
  lastUpdated: string;
};
export type DailySaves = {
  normal: GameSave | null;
  sequence: GameSave | null;
  jumble: GameSave | null;
};
export type GameSave = {
  id: number;
  guesses: string[];
  startTime: number;
  endTime: number;
};

export const savesInitialState: SavesState = {
  daily: {
    normal: null,
    sequence: null,
    jumble: null,
  },
  lastUpdated: "1970-01-01",
};

export const savesAction = {
  load: createAction<SavesState>("saves/load"),
  setLastUpdated: createAction<string>("saves/setLastUpdated"),
  pruneSaves: createAction<{ timestamp: number }>("saves/prune"),
};

export const savesReducer = createReducer(
  () => initialState,
  (builder) =>
    builder
      .addCase(savesAction.load, (state, action) => {
        state.saves = action.payload;
      })
      .addCase(savesAction.setLastUpdated, (state, action) => {
        state.saves.lastUpdated = action.payload;
      })
      .addCase(savesAction.pruneSaves, (state, action) => {
        const dailyId = getDailyId(action.payload.timestamp);
        const challenges = ["normal", "sequence", "jumble"] as const;
        for (const challenge of challenges) {
          if (state.saves.daily[challenge]?.id !== dailyId) {
            state.saves.daily[challenge] = null;
          }
        }
      })
);
