import { createAction, createReducer } from "@reduxjs/toolkit";
import { initialState } from "..";

export type UiState = {
  popup: PopupState;
};
type PopupState = "about" | "settings" | "stats" | null;

export const uiInitialState: UiState = {
  popup: null,
};

export const showPopup = createAction<PopupState>("ui/showPopup");

export const uiReducer = createReducer(
  () => initialState,
  (builder) =>
    builder.addCase(showPopup, (state, action) => {
      state.ui.popup = action.payload;
    })
);
