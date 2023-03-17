import { createAction, createReducer } from "@reduxjs/toolkit";
import { getDailyId, initialState } from "..";

export type StorageState = {
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

export const storageInitialState: StorageState = {
  daily: {
    normal: null,
    sequence: null,
    jumble: null,
  },
  lastUpdated: "1970-01-01",
};

export const storageAction = {
  load: createAction<StorageState>("storage/load"),
  setLastUpdated: createAction<string>("storage/setLastUpdated"),
  pruneSaves: createAction<{ timestamp: number }>("storage/pruneSaves"),
};

export const storageReducer = createReducer(
  () => initialState,
  (builder) =>
    builder
      .addCase(storageAction.load, (state, action) => {
        state.storage = action.payload;
      })
      .addCase(storageAction.setLastUpdated, (state, action) => {
        state.storage.lastUpdated = action.payload;
      })
      .addCase(storageAction.pruneSaves, (state, action) => {
        const dailyId = getDailyId(action.payload.timestamp);
        const challenges = ["normal", "sequence", "jumble"] as const;
        for (const challenge of challenges) {
          if (state.storage.daily[challenge]?.id !== dailyId) {
            state.storage.daily[challenge] = null;
          }
        }
      })
);
