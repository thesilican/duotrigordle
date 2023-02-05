import { createAction, createReducer } from "@reduxjs/toolkit";
import { AppState, getCompletedBoards, initialState } from "..";
import { range } from "../../util";
import { NUM_BOARDS } from "../consts";

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
  highlightArrowRight: createAction("ui/highlightArrowRight"),
  highlightArrowLeft: createAction("ui/highlightArrowLeft"),
  highlightArrowDown: createAction("ui/highlightArrowDown"),
  highlightArrowUp: createAction("ui/highlightArrowUp"),
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
        if (
          state.game.gameOver ||
          state.ui.highlightedBoard === action.payload
        ) {
          state.ui.highlightedBoard = null;
        } else {
          state.ui.highlightedBoard = action.payload;
        }
      })
      .addCase(uiAction.highlightArrowRight, (state, _) => {
        performHighlightArrow(state, 1, 1);
      })
      .addCase(uiAction.highlightArrowLeft, (state, _) => {
        performHighlightArrow(state, -1, 1);
      })
      .addCase(uiAction.highlightArrowDown, (state, _) => {
        state.settings.wideMode
          ? performHighlightArrow(state, 8, 8)
          : performHighlightArrow(state, 4, 4);
      })
      .addCase(uiAction.highlightArrowUp, (state, _) => {
        state.settings.wideMode
          ? performHighlightArrow(state, -8, 8)
          : performHighlightArrow(state, -4, 4);
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

function performHighlightArrow(state: AppState, amount: number, group: number) {
  if (state.game.gameOver) {
    state.ui.highlightedBoard = null;
    return;
  }

  let boards: number[];
  if (state.settings.hideCompletedBoards) {
    const completedBoards = getCompletedBoards(
      state.game.targets,
      state.game.guesses
    );
    boards = range(NUM_BOARDS).filter((i) => !completedBoards[i]);
  } else {
    boards = range(NUM_BOARDS);
  }
  if (boards.length === 0) {
    state.ui.highlightedBoard = null;
    return;
  }

  if (state.ui.highlightedBoard === null) {
    state.ui.highlightedBoard = boards[0];
    addSideEffect(state, {
      type: "scroll-board-into-view",
      board: boards[0],
    });
    return;
  }
  const prev = boards.indexOf(state.ui.highlightedBoard);
  if (prev === -1) {
    state.ui.highlightedBoard = boards[0];
    addSideEffect(state, {
      type: "scroll-board-into-view",
      board: boards[0],
    });
    return;
  }

  const remain = boards.length % group;
  const empty = (group - remain) % group;
  let curr = prev + amount;
  if (curr < 0) {
    curr = curr + boards.length + empty;
    if (curr >= boards.length) {
      curr = boards.length - 1;
    }
  } else if (curr >= boards.length) {
    curr = curr - (boards.length + empty);
    if (curr < 0) {
      curr = boards.length - 1;
    }
  }
  const prevHighlightedBoard = state.ui.highlightedBoard;
  state.ui.highlightedBoard = boards[curr];
  if (state.ui.highlightedBoard !== prevHighlightedBoard) {
    addSideEffect(state, {
      type: "scroll-board-into-view",
      board: boards[curr],
    });
  }
}

function addSideEffect(state: AppState, effect: SideEffectAction) {
  state.ui.sideEffects.push({
    id: state.ui.sideEffectCount,
    ...effect,
  });
  state.ui.sideEffectCount++;
}
