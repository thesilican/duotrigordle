import { createAction, createReducer } from "@reduxjs/toolkit";
import { initialState } from "..";

export type SettingsState = {
  colorBlindMode: boolean;
  showTimer: boolean;
  useFloatingInput: boolean;
  wideMode: boolean;
  hideCompletedBoards: boolean;
  animateHiding: boolean;
  hideKeyboard: boolean;
  hideEmptyRows: boolean;
};
export const settingsInitialState: SettingsState = {
  colorBlindMode: false,
  showTimer: false,
  useFloatingInput: false,
  wideMode: false,
  hideCompletedBoards: false,
  animateHiding: true,
  hideKeyboard: false,
  hideEmptyRows: false,
};

export const updateSettings = createAction<Partial<SettingsState>>(
  "settings/updateSettings"
);

export const settingsReducer = createReducer(
  () => initialState,
  (builder) => {
    builder.addCase(updateSettings, (state, action) => {
      state.settings = {
        ...state.settings,
        ...action.payload,
      };
    });
  }
);
