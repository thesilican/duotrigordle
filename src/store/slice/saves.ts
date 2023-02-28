import { createAction, createReducer } from "@reduxjs/toolkit";
import { getDailyId, initialState } from "..";

export type SavesState = {
  daily: {
    normal: GameSave | null;
    sequence: GameSave | null;
    jumble: GameSave | null;
  };
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
};

export const savesAction = {
  load: createAction<SavesState>("saves/load"),
  prune: createAction<{ timestamp: number }>("saves/prune"),
};

export const savesReducer = createReducer(
  () => initialState,
  (builder) =>
    builder
      .addCase(savesAction.load, (state, action) => {
        state.saves = action.payload;
      })
      .addCase(savesAction.prune, (state, action) => {
        const dailyId = getDailyId(action.payload.timestamp);
        const challenges = ["normal", "sequence", "jumble"] as const;
        for (const challenge of challenges) {
          if (state.saves.daily[challenge]?.id !== dailyId) {
            state.saves.daily[challenge] = null;
          }
        }
      })
);
