import { createAction, createReducer } from "@reduxjs/toolkit";
import { initialState, RootState } from "..";
import { NUM_BOARDS } from "../../consts";
import { getCompletedBoards, range } from "../../funcs";

export type UiState = {
  popup: PopupState;
  highlightedBoard: number | null;
  sideEffects: SideEffect[];
  sideEffectCount: number;
};
type PopupState = "about" | "settings" | "stats" | null;
type SideEffect = {
  id: number;
} & SideEffectAction;
type SideEffectAction = {
  type: "scroll-board-into-view";
  board: number;
};

export const uiInitialState: UiState = {
  popup: null,
  highlightedBoard: null,
  sideEffects: [],
  sideEffectCount: 0,
};

export const showPopup = createAction<PopupState>("ui/showPopup");
export const highlightClick = createAction<number>("ui/clickBoard");
export const highlightArrowRight = createAction("ui/highlightArrowRight");
export const highlightArrowLeft = createAction("ui/highlightArrowLeft");
export const highlightArrowDown = createAction("ui/highlightArrowDown");
export const highlightArrowUp = createAction("ui/highlightArrowUp");
export const highlightEsc = createAction("ui/highlightEsc");
export const resolveSideEffect = createAction<number>("ui/resolveSideEffect");

export const uiReducer = createReducer(
  () => initialState,
  (builder) =>
    builder
      .addCase(showPopup, (state, action) => {
        state.ui.popup = action.payload;
      })
      .addCase(highlightClick, (state, action) => {
        if (
          state.game.gameOver ||
          state.ui.highlightedBoard === action.payload
        ) {
          state.ui.highlightedBoard = null;
        } else {
          state.ui.highlightedBoard = action.payload;
        }
      })
      .addCase(highlightArrowRight, (state, _) => {
        performHighlightArrow(state, 1, 1);
      })
      .addCase(highlightArrowLeft, (state, _) => {
        performHighlightArrow(state, -1, 1);
      })
      .addCase(highlightArrowDown, (state, _) => {
        state.settings.wideMode
          ? performHighlightArrow(state, 8, 8)
          : performHighlightArrow(state, 4, 4);
      })
      .addCase(highlightArrowUp, (state, _) => {
        state.settings.wideMode
          ? performHighlightArrow(state, -8, 8)
          : performHighlightArrow(state, -4, 4);
      })
      .addCase(highlightEsc, (state, _) => {
        state.ui.highlightedBoard = null;
      })
      .addCase(resolveSideEffect, (state, action) => {
        state.ui.sideEffects = state.ui.sideEffects.filter(
          (x) => x.id !== action.payload
        );
      })
);

function performHighlightArrow(
  state: RootState,
  amount: number,
  group: number
) {
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

function addSideEffect(state: RootState, effect: SideEffectAction) {
  state.ui.sideEffects.push({
    id: state.ui.sideEffectCount,
    ...effect,
  });
  state.ui.sideEffectCount++;
}
