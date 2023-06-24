import { createAction, createReducer } from "@reduxjs/toolkit";
import {
  AppState,
  Challenge,
  DailyChallenge,
  getCompletedBoards,
  getDailyId,
  getSequenceVisibleBoard,
  initialState,
  loadSave,
  NUM_BOARDS,
  startGame,
} from "..";

export type UiState = {
  view: UiView;
  modal: ModalState;
  highlightedBoard: number | null;
  sideEffects: SideEffect[];
  sideEffectCount: number;
  welcomeTab: number;
};
export type UiView =
  | "welcome"
  | "game"
  | "stats"
  | "privacy-policy"
  | "how-to-play";
export type Path =
  | {
      view: Exclude<UiView, "game">;
    }
  | {
      view: "game";
      gameMode: "daily";
      challenge: DailyChallenge;
    }
  | {
      view: "game";
      gameMode: "practice";
      challenge: Challenge;
    }
  | {
      view: "game";
      gameMode: "historic";
      id: number;
      challenge: DailyChallenge;
    };
type ModalState = "changelog" | "settings" | null;
type SideEffect = {
  id: number;
} & SideEffectAction;
type SideEffectAction =
  | {
      type: "scroll-board-into-view";
      board: number;
    }
  | {
      type: "navigate-push";
      path: Path;
    }
  | { type: "navigate-back" };

export const uiInitialState: UiState = {
  view: "welcome",
  modal: null,
  highlightedBoard: null,
  sideEffects: [],
  sideEffectCount: 0,
  welcomeTab: 0,
};

export const uiAction = {
  setView: createAction<UiView>("ui/setView"),
  showModal: createAction<ModalState>("ui/showModal"),
  highlightClick: createAction<number>("ui/clickBoard"),
  highlightEsc: createAction("ui/highlightEsc"),
  highlightArrow: createAction<{
    direction: "left" | "right";
  }>("ui/highlightArrow"),
  createSideEffect: createAction<SideEffectAction>("ui/createSideEffect"),
  resolveSideEffect: createAction<number>("ui/resolveSideEffect"),
  navigate: createAction<{
    to: Path;
    timestamp?: number;
    noPush?: boolean;
  }>("ui/navigate"),
  setWelcomeTab: createAction<number>("ui/set-welcome-tab"),
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
      .addCase(uiAction.navigate, (state, action) => {
        const path = action.payload.to;
        if (path.view === "game") {
          const timestamp = action.payload.timestamp;
          if (timestamp === undefined) throw new Error("expected timestamp");
          if (path.gameMode === "daily") {
            if (
              state.storage.daily[path.challenge]?.id === getDailyId(timestamp)
            ) {
              loadSave(state, path.challenge, timestamp);
            } else {
              startGame(state, {
                gameMode: "daily",
                challenge: path.challenge,
                timestamp,
              });
            }
          } else if (path.gameMode === "practice") {
            startGame(state, {
              gameMode: "practice",
              challenge: path.challenge,
              timestamp: Date.now(),
            });
          } else if (path.gameMode === "historic") {
            startGame(state, {
              gameMode: "historic",
              timestamp: Date.now(),
              challenge: path.challenge,
              id: path.id,
            });
          }
        }
        state.ui.view = path.view;
        if (!action.payload.noPush) {
          addSideEffect(state, { type: "navigate-push", path });
        }
      })
      .addCase(uiAction.highlightArrow, (state, action) => {
        if (state.game.challenge === "sequence") {
          return;
        }
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
      .addCase(uiAction.setWelcomeTab, (state, action) => {
        state.ui.welcomeTab = action.payload;
      })
);

function addSideEffect(state: AppState, effect: SideEffectAction) {
  state.ui.sideEffects.push({
    id: state.ui.sideEffectCount,
    ...effect,
  });
  state.ui.sideEffectCount++;
}

export const selectNextSideEffect = (s: AppState) =>
  s.ui.sideEffects.length === 0 ? null : s.ui.sideEffects[0];

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
    if (!completedBoards[idx]) {
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
    if (!completedBoards[idx]) {
      state.ui.highlightedBoard = idx;
      return;
    }
    idx = (idx + NUM_BOARDS - 1) % NUM_BOARDS;
  }
  state.ui.highlightedBoard = null;
}
