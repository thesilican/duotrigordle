import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SettingsState = {
  colorBlindMode: boolean;
  showTimer: boolean;
  speedrunMode: boolean;
  wideMode: boolean;
  hideCompletedBoards: boolean;
  animateHiding: boolean;
  hideKeyboard: boolean;
};
const initialState: SettingsState = {
  colorBlindMode: false,
  showTimer: false,
  speedrunMode: false,
  wideMode: false,
  hideCompletedBoards: false,
  animateHiding: true,
  hideKeyboard: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const { updateSettings } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
