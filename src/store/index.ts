import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { gameInitialState, gameReducer, GameState } from "./slice/game";
import {
  settingsInitialState,
  settingsReducer,
  SettingsState,
} from "./slice/settings";
import { statsInitialState, statsReducer, StatsState } from "./slice/stats";
import { uiInitialState, uiReducer, UiState } from "./slice/ui";

export type AppState = {
  game: GameState;
  settings: SettingsState;
  stats: StatsState;
  ui: UiState;
};
export const initialState: AppState = {
  game: gameInitialState,
  settings: settingsInitialState,
  stats: statsInitialState,
  ui: uiInitialState,
};

// Create root reducer by reducing reducers
// (I don't really want to use https://github.com/redux-utilities/reduce-reducers)
const reducers = [
  gameReducer,
  settingsReducer,
  statsReducer,
  uiReducer,
] as const;

export const store = configureStore<AppState>({
  reducer: (state, action) => reducers.reduce((s, r) => r(s, action), state)!,
});

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
export const useAppDispatch: () => typeof store.dispatch = useDispatch;

// Reexports
export * from "./consts";
export * from "./funcs";
export * from "./slice/game";
export * from "./slice/settings";
export * from "./slice/stats";
export * from "./slice/ui";
export * from "./storage";
