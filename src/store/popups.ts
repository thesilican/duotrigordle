import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type PopupsState = {
  about: boolean;
  settings: boolean;
};
const initialState: PopupsState = {
  about: false,
  settings: false,
};

const popupsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    showAboutPopup: (state) => {
      state.about = true;
      state.settings = false;
    },
    showSettingsPopup: (state) => {
      state.settings = true;
      state.about = false;
    },
    hidePopups: (state) => {
      state.settings = false;
      state.about = false;
    },
  },
});

export const { showAboutPopup, showSettingsPopup, hidePopups } =
  popupsSlice.actions;
export const popupsReducer = popupsSlice.reducer;
