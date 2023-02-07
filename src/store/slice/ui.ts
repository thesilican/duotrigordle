import { createAction, createReducer } from "@reduxjs/toolkit";
import {
  AppState,
  getCompletedBoards,
  getSequenceVisibleBoard,
  initialState,
  NUM_BOARDS,
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
  highlightArrow: createAction<{ direction: "left" | "right" }>(
    "ui/highlightArrow"
  ),
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
          state.ui.view !== "game" ||
          state.game.gameOver ||
          completedBoards[action.payload] ||
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
      .addCase(uiAction.highlightArrow, (state, action) => {
        if (action.payload.direction === "left") {
          highlightPreviousBoard(state);
        } else {
          highlightNextBoard(state);
        }
        if (state.ui.highlightedBoard !== null) {
          addSideEffect(state, {
            type: "scroll-board-into-view",
            board: state.ui.highlightedBoard,
          });
        }
      })
);

function addSideEffect(state: AppState, effect: SideEffectAction) {
  state.ui.sideEffects.push({
    id: state.ui.sideEffectCount,
    ...effect,
  });
  state.ui.sideEffectCount++;
}

export function highlightNextBoard(state: AppState) {
  if (state.game.gameOver) {
    state.ui.highlightedBoard = null;
    return;
  }

  let idx = state.ui.highlightedBoard;
  if (idx === null) {
    idx = 0;
  } else {
    idx = (idx + 1) % NUM_BOARDS;
  }
  const completedBoards = getCompletedBoards(
    state.game.targets,
    state.game.guesses
  );
  for (let i = 0; i < NUM_BOARDS; i++) {
    if (completedBoards[idx] !== null) {
      state.ui.highlightedBoard = idx;
      return;
    }
    idx = (idx + 1) % NUM_BOARDS;
  }
  state.ui.highlightedBoard = null;
}

export function highlightPreviousBoard(state: AppState) {
  if (state.game.gameOver) {
    state.ui.highlightedBoard = null;
    return;
  }

  let idx = state.ui.highlightedBoard;
  if (idx === null) {
    idx = NUM_BOARDS - 1;
  } else {
    idx = (idx + NUM_BOARDS - 1) % NUM_BOARDS;
  }
  const completedBoards = getCompletedBoards(
    state.game.targets,
    state.game.guesses
  );
  for (let i = 0; i < NUM_BOARDS; i++) {
    if (completedBoards[idx] !== null) {
      state.ui.highlightedBoard = idx;
      return;
    }
    idx = (idx + NUM_BOARDS - 1) % NUM_BOARDS;
  }
  state.ui.highlightedBoard = null;
}
