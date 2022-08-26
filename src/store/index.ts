import { configureStore, Reducer } from "@reduxjs/toolkit";
import {
  TypedUseSelectorHook,
  useSelector as useSelectorOriginal,
} from "react-redux";
import { gameInitialState, gameReducer, GameState } from "./slice/game";
import { PopupsState, popupsInitialState, popupsReducer } from "./slice/popups";
import {
  SettingsState,
  settingsInitialState,
  settingsReducer,
} from "./slice/settings";
import { StatsState, statsInitialState, statsReducer } from "./slice/stats";

export type RootState = {
  game: GameState;
  settings: SettingsState;
  popups: PopupsState;
  stats: StatsState;
};
export const initialState: RootState = {
  game: gameInitialState,
  settings: settingsInitialState,
  popups: popupsInitialState,
  stats: statsInitialState,
};

// Create root reducer by reducing reducers
// (I don't really want to use https://github.com/redux-utilities/reduce-reducers)
const reducers: Reducer[] = [
  gameReducer,
  settingsReducer,
  popupsReducer,
  statsReducer,
];

export const store = configureStore({
  reducer: (state, action) => reducers.reduce((s, r) => r(s, action), state),
});

// Partially monomorphise useSelector with State
export const useSelector: TypedUseSelectorHook<RootState> = useSelectorOriginal;

// Reexports
export * from "./slice/game";
export * from "./slice/popups";
export * from "./slice/settings";
export * from "./slice/stats";
