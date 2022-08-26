import { createAction, createReducer } from "@reduxjs/toolkit";
import { initialState } from "..";

export type PopupsState = {
  about: boolean;
  settings: boolean;
  stats: boolean;
};
export const popupsInitialState: PopupsState = {
  about: false,
  settings: false,
  stats: false,
};

export const showAboutPopup = createAction("popups/showAboutPopup");
export const showSettingsPopup = createAction("popups/showSettingsPopup");
export const showStatsPopup = createAction("popups/showStatsPopup");
export const hidePopups = createAction("popups/hidePopups");

export const popupsReducer = createReducer(
  () => initialState,
  (builder) =>
    builder
      .addCase(showAboutPopup, (state, _) => {
        state.popups = {
          about: true,
          settings: false,
          stats: false,
        };
      })
      .addCase(showSettingsPopup, (state, _) => {
        state.popups = {
          about: false,
          settings: true,
          stats: false,
        };
      })
      .addCase(showStatsPopup, (state, _) => {
        state.popups = {
          about: false,
          settings: false,
          stats: true,
        };
      })
      .addCase(hidePopups, (state, _) => {
        state.popups = {
          about: false,
          settings: false,
          stats: false,
        };
      })
);
