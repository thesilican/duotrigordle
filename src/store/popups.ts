import { createSlice } from "@reduxjs/toolkit";

export type PopupsState = {
  about: boolean;
  settings: boolean;
  stats: boolean;
};
const initialState: PopupsState = {
  about: false,
  settings: false,
  stats: false,
};

const popupsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    showAboutPopup: (state) => {
      state.about = true;
      state.settings = false;
      state.stats = false;
    },
    showSettingsPopup: (state) => {
      state.settings = true;
      state.about = false;
      state.stats = false;
    },
    showStatsPopup: (state) => {
      state.settings = false;
      state.about = false;
      state.stats = true;
    },
    hidePopups: (state) => {
      state.settings = false;
      state.about = false;
      state.stats = false;
    },
  },
});

export const { showAboutPopup, showSettingsPopup, showStatsPopup, hidePopups } =
  popupsSlice.actions;
export const popupsReducer = popupsSlice.reducer;
