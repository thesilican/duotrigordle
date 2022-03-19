import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SettingsState = {
  hideKeyboard: boolean;
};
const initialState: SettingsState = {
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
