import { configureStore } from "@reduxjs/toolkit";
import {
    TypedUseSelectorHook,
    useSelector as useSelectorOriginal
} from "react-redux";
import { gameInitialState, gameReducer, GameState } from "./slice/game";
import {
    settingsInitialState,
    settingsReducer,
    SettingsState
} from "./slice/settings";
import { statsInitialState, statsReducer, StatsState } from "./slice/stats";
import { uiInitialState, uiReducer, UiState } from "./slice/ui";

export type RootState = {
  game: GameState;
  settings: SettingsState;
  stats: StatsState;
  ui: UiState;
};
export const initialState: RootState = {
  game: gameInitialState,
  settings: settingsInitialState,
  stats: statsInitialState,
  ui: uiInitialState,
};

// Create root reducer by reducing reducers
// (I don't really want to use https://github.com/redux-utilities/reduce-reducers)
const reducers = [gameReducer, settingsReducer, statsReducer, uiReducer];

export const store = configureStore<RootState>({
  reducer: (state, action) => reducers.reduce((s, r) => r(s, action), state)!,
});

// Partially monomorphise useSelector with State
export const useSelector: TypedUseSelectorHook<RootState> = useSelectorOriginal;

// Reexports
export * from "./debug";
export * from "./selector";
export * from "./slice/game";
export * from "./slice/settings";
export * from "./slice/stats";
export * from "./slice/ui";

