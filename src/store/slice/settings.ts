import { createAction, createReducer } from "@reduxjs/toolkit";
import { initialState } from "..";

export type SettingsState = {
  colorBlindMode: boolean;
  showTimer: boolean;
  wideMode: boolean;
  hideCompletedBoards: boolean;
  animateHiding: boolean;
  stickyInput: boolean;
  disableHints: boolean;
  hideAds: boolean;
  kofiEmail: string | null;
};
export const settingsInitialState: SettingsState = {
  colorBlindMode: false,
  showTimer: false,
  wideMode: false,
  hideCompletedBoards: false,
  animateHiding: true,
  stickyInput: true,
  disableHints: false,
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
