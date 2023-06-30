import { createAction, createReducer } from "@reduxjs/toolkit";
import { AppState, Challenge, initialState } from "..";

export type StatsState = {
  history: SyncedStatsEntry[];
};
export type SyncedStatsEntry = StatsEntry & {
  synced: boolean;
};
export type StatsEntry = StatsEntryKey & {
  guesses: number | null;
  time: number | null;
};
export type StatsEntryKey = {
  gameMode: "daily" | "practice";
  challenge: Challenge;
  id: number;
};
type UpdateSyncOptions = {
  key: StatsEntryKey;
  synced: boolean;
};

export const statsInitialState: StatsState = {
  history: [],
};

export const statsAction = {
  load: createAction<StatsState>("stats/load"),
  addEntry: createAction<SyncedStatsEntry>("stats/addEntry"),
  setSynced: createAction<UpdateSyncOptions[]>("stats/setSynced"),
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
        addHistoryEntry(state, action.payload);
      })
      .addCase(statsAction.setSynced, (state, action) => {
        for (const options of action.payload) {
          for (const entry of state.stats.history) {
            if (entryKeysEqual(entry, options.key)) {
              entry.synced = options.synced;
            }
          }
        }
      })
);

export function entryKeysEqual(a: StatsEntryKey, b: StatsEntryKey) {
  return (
    a.gameMode === b.gameMode && a.challenge === b.challenge && a.id === b.id
  );
}
export function entryGetKey(entry: StatsEntry): StatsEntryKey {
  return {
    gameMode: entry.gameMode,
    challenge: entry.challenge,
    id: entry.id,
  };
}

export function addHistoryEntry(state: AppState, entry: SyncedStatsEntry) {
  state.stats.history = [
    ...state.stats.history.filter((x) => !entryKeysEqual(x, entry)),
    entry,
  ];
  normalizeHistory(state.stats.history);
}

export function normalizeHistory(stats: StatsEntry[]) {
  // Deduplicate
  const encountered: StatsEntry[] = [];
  for (let i = 0; i < stats.length; i++) {
    const entry = stats[i];
    if (encountered.find((x) => entryKeysEqual(x, entry))) {
      stats.splice(i, 1);
      i--;
    } else {
      encountered.push(entry);
    }
  }

  // Sort
  const gameModeOrder = {
    daily: 0,
    practice: 1,
  };
  const challengeOrder = {
    normal: 0,
    sequence: 1,
    jumble: 2,
    perfect: 3,
  };
  stats.sort((a, b) => {
    if (a.gameMode !== b.gameMode) {
      return gameModeOrder[a.gameMode] - gameModeOrder[b.gameMode];
    } else if (a.gameMode === "daily") {
      if (a.id !== b.id) {
        return a.id - b.id;
      } else {
        return challengeOrder[a.challenge] - challengeOrder[b.challenge];
      }
    } else {
      if (a.challenge !== b.challenge) {
        return challengeOrder[a.challenge] - challengeOrder[b.challenge];
      } else {
        return a.id - b.id;
      }
    }
  });
}
