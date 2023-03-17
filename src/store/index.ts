import { AnyAction, configureStore, Dispatch } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { gameInitialState, gameReducer, GameState } from "./slice/game";
import {
  storageInitialState,
  storageReducer,
  StorageState,
} from "./slice/storage";
import {
  settingsInitialState,
  settingsReducer,
  SettingsState,
} from "./slice/settings";
import { statsInitialState, statsReducer, StatsState } from "./slice/stats";
import { uiInitialState, uiReducer, UiState } from "./slice/ui";

export type AppState = {
  game: GameState;
  storage: StorageState;
  settings: SettingsState;
  stats: StatsState;
  ui: UiState;
};
export const initialState: AppState = {
  game: gameInitialState,
  storage: storageInitialState,
  settings: settingsInitialState,
  stats: statsInitialState,
  ui: uiInitialState,
};

const reducers = [
  gameReducer,
  storageReducer,
  settingsReducer,
  statsReducer,
  uiReducer,
] as const;

// Root redux reducer
export const reducer = (state: AppState | undefined, action: AnyAction) =>
  reducers.reduce((s, r) => r(s, action), state ?? initialState);

export const store = configureStore<AppState>({ reducer });

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
export const useAppDispatch: () => Dispatch<AnyAction> = useDispatch;

// Reexports
export * from "./consts";
export * from "./funcs";
export * from "./slice/game";
export * from "./slice/storage";
export * from "./slice/settings";
export * from "./slice/stats";
export * from "./slice/ui";
