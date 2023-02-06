import { createAction, createReducer } from "@reduxjs/toolkit";
import {
  AppState,
  getCompletedBoards,
  getSequenceVisibleBoard,
  initialState,
} from "..";

export type UiState = {
  view: UiView;
  modal: ModalState;
  highlightedBoard: number | null;
  sideEffects: SideEffect[];
  sideEffectCount: number;
};
type UiView = "welcome" | "game";
type ModalState = "about" | "settings" | "stats" | null;
type SideEffect = {
  id: number;
} & SideEffectAction;
type SideEffectAction = {
  type: "scroll-board-into-view";
  board: number;
};

export const uiInitialState: UiState = {
  view: "welcome",
  modal: null,
  highlightedBoard: null,
  sideEffects: [],
  sideEffectCount: 0,
};

export const uiAction = {
  setView: createAction<UiView>("ui/setView"),
  showModal: createAction<ModalState>("ui/showModal"),
  highlightClick: createAction<number>("ui/clickBoard"),
  highlightEsc: createAction("ui/highlightEsc"),
  createSideEffect: createAction<SideEffectAction>("ui/createSideEffect"),
  resolveSideEffect: createAction<number>("ui/resolveSideEffect"),
};

export const uiReducer = createReducer(
  () => initialState,
  (builder) =>
    builder
      .addCase(uiAction.setView, (state, action) => {
        state.ui.view = action.payload;
      })
      .addCase(uiAction.showModal, (state, action) => {
        state.ui.modal = action.payload;
      })
      .addCase(uiAction.highlightClick, (state, action) => {
        const completedBoards = getCompletedBoards(
          state.game.targets,
          state.game.guesses
        );
        const sequenceVisibleBoard = getSequenceVisibleBoard(
          state.game.targets,
          state.game.guesses
        );
        if (
          state.game.gameOver ||
          completedBoards[action.payload] !== null ||
          (state.game.challenge === "sequence" &&
            action.payload !== sequenceVisibleBoard) ||
          state.ui.highlightedBoard === action.payload
        ) {
          state.ui.highlightedBoard = null;
        } else {
          state.ui.highlightedBoard = action.payload;
        }
      })
      .addCase(uiAction.highlightEsc, (state, _) => {
        state.ui.highlightedBoard = null;
      })
      .addCase(uiAction.createSideEffect, (state, action) => {
        addSideEffect(state, action.payload);
      })
      .addCase(uiAction.resolveSideEffect, (state, action) => {
        state.ui.sideEffects = state.ui.sideEffects.filter(
          (x) => x.id !== action.payload
        );
      })
);

function addSideEffect(state: AppState, effect: SideEffectAction) {
  state.ui.sideEffects.push({
    id: state.ui.sideEffectCount,
    ...effect,
  });
  state.ui.sideEffectCount++;
}
