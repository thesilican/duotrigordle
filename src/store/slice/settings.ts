import { createAction, createReducer } from "@reduxjs/toolkit";
import { initialState } from "..";

export type SettingsState = {
  colorBlindMode: boolean;
  showTimer: boolean;
  wideMode: boolean;
  hideCompletedBoards: boolean;
  disableAnimations: boolean;
  hideEmptyRows: boolean;
  stickyInput: boolean;
  showHints: boolean;
  hideAds: boolean;
  kofiEmail: string | null;
};
export const settingsInitialState: SettingsState = {
  colorBlindMode: false,
  showTimer: false,
  wideMode: false,
  hideCompletedBoards: false,
  disableAnimations: false,
  hideEmptyRows: false,
  stickyInput: true,
  showHints: true,
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
