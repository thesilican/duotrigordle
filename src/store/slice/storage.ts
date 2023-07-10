import { createAction, createReducer } from "@reduxjs/toolkit";
import { DailyChallenge, getDailyId, initialState } from "..";

export type StorageState = {
  daily: DailySaves;
  lastUpdated: string;
  account: UserAccount | null;
  prevUserId: string | null;
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
  endTime: number | null;
  pauseTime: number | null;
};
export type UserAccount = {
  userId: string;
  accountKey: string;
  username: string;
  email: string | null;
};

export const storageInitialState: StorageState = {
  daily: {
    normal: null,
    sequence: null,
    jumble: null,
  },
  account: null,
  prevUserId: null,
  lastUpdated: "1970-01-01",
};

export const storageAction = {
  load: createAction<StorageState>("storage/load"),
  setDaily: createAction<{ challenge: DailyChallenge; gameSave: GameSave }>(
    "storage/setDaily"
  ),
  pruneSaves: createAction<{ timestamp: number }>("storage/pruneSaves"),
  setLastUpdated: createAction<string>("storage/setLastUpdated"),
  login: createAction<UserAccount>("storage/login"),
  logout: createAction("storage/logout"),
  updateAccount: createAction<Partial<UserAccount>>("storage/setAccount"),
};

export const storageReducer = createReducer(
  () => initialState,
  (builder) =>
    builder
      .addCase(storageAction.load, (state, action) => {
        state.storage = action.payload;
      })
      .addCase(storageAction.setDaily, (state, action) => {
        state.storage.daily[action.payload.challenge] = action.payload.gameSave;
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
      .addCase(storageAction.login, (state, action) => {
        state.storage.account = action.payload;
        state.storage.prevUserId = action.payload.userId;
      })
      .addCase(storageAction.logout, (state, _) => {
        state.storage.account = null;
        for (const entry of state.stats.history) {
          entry.synced = false;
        }
      })
      .addCase(storageAction.updateAccount, (state, action) => {
        if (!state.storage.account) {
          return;
        }
        state.storage.account = { ...state.storage.account, ...action.payload };
      })
);
