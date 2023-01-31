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
  hideAds: boolean;
  kofiEmail: string | null;
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
  hideAds: false,
  kofiEmail: null,
};

export const settingsAction = {
  update: createAction<Partial<SettingsState>>("settings/updateSettings"),
};

export const settingsReducer = createReducer(
  () => initialState,
  (builder) => {
    builder.addCase(settingsAction.update, (state, action) => {
      state.settings = {
        ...state.settings,
        ...action.payload,
      };
    });
  }
);
