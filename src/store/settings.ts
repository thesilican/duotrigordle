import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Don't forget to update corresponding shape checks in funcs.ts
// if you add/remove fields
export type SettingsState = {};
const initialState: SettingsState = {};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateSettings: (
      state,
      action: PayloadAction<{ settings: Partial<SettingsState> }>
    ) => {
      return {
        ...state,
        ...action.payload.settings,
      };
    },
  },
});

export const { updateSettings } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
