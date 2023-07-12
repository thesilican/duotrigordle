import { createAction, createReducer } from "@reduxjs/toolkit";
import {
  AppState,
  Challenge,
  DailyChallenge,
  GameSave,
  getDailyId,
  initialState,
  loadSave,
  pauseGame,
  startGame,
  unpauseGame,
} from "..";

export type UiState = {
  path: UiPath;
  modal: ModalState;
  sideEffects: SideEffect[];
  sideEffectCount: number;
  welcomeTab: number;
  snackbar: SnackbarState;
};
export type UiPath =
  | {
      view: "welcome" | "privacy-policy" | "how-to-play" | "account";
    }
  | { view: "game"; gameMode: "daily"; challenge: DailyChallenge }
  | { view: "game"; gameMode: "practice"; challenge: Challenge }
  | {
      view: "game";
      gameMode: "historic";
      id: number;
      challenge: DailyChallenge;
    }
  | { view: "stats"; gameMode: "daily" | "practice"; challenge: Challenge };
type ModalState = "changelog" | "settings" | null;
type SnackbarState = {
  status: "success" | "error" | null;
  text: string;
};
type SideEffect = {
  id: number;
} & SideEffectAction;
type SideEffectAction =
  | { type: "scroll-board-into-view"; board: number }
  | {
      type: "update-history";
      action:
        | {
            type: "push" | "replace";
            path: UiPath;
          }
        | {
            type: "pop";
          };
    }
  | { type: "upload-game-save"; challenge: DailyChallenge; gameSave: GameSave };

export const uiInitialState: UiState = {
  path: { view: "welcome" },
  modal: null,
  sideEffects: [],
  sideEffectCount: 0,
  welcomeTab: 0,
  snackbar: {
    status: null,
    text: "",
  },
};

export const uiAction = {
  showModal: createAction<ModalState>("ui/showModal"),
  createSideEffect: createAction<SideEffectAction>("ui/createSideEffect"),
  resolveSideEffect: createAction<number>("ui/resolveSideEffect"),
  navigate: createAction<{
    to: UiPath;
    timestamp: number;
    browser?: boolean;
  }>("ui/navigate"),
  setWelcomeTab: createAction<number>("ui/setWelcomeTab"),
  setSnackbar: createAction<Partial<SnackbarState>>("ui/setSnackbar"),
};

export const uiReducer = createReducer(
  () => initialState,
  (builder) =>
    builder
      .addCase(uiAction.showModal, (state, action) => {
        state.ui.modal = action.payload;
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
        const oldPath = state.ui.path;
        const path = action.payload.to;
        const timestamp = action.payload.timestamp;
        if (pathsEqual(oldPath, path)) {
          return;
        }

        state.ui.path = path;
        if (path.view === "game") {
          if (path.gameMode === "daily") {
            if (
              state.storage.daily[path.challenge]?.id === getDailyId(timestamp)
            ) {
              loadSave(state, path.challenge, timestamp);
              unpauseGame(state, timestamp);
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
        } else {
          pauseGame(state, timestamp);
        }

        if (!action.payload.browser) {
          if (oldPath.view === "welcome") {
            if (path.view !== "welcome") {
              addSideEffect(state, {
                type: "update-history",
                action: { type: "push", path: path },
              });
            }
          } else {
            if (path.view === "welcome") {
              addSideEffect(state, {
                type: "update-history",
                action: { type: "pop" },
              });
            } else {
              addSideEffect(state, {
                type: "update-history",
                action: { type: "replace", path: path },
              });
            }
          }
        }
      })
      .addCase(uiAction.setWelcomeTab, (state, action) => {
        state.ui.welcomeTab = action.payload;
      })
      .addCase(uiAction.setSnackbar, (state, action) => {
        state.ui.snackbar = { ...state.ui.snackbar, ...action.payload };
      })
);

export function addSideEffect(state: AppState, effect: SideEffectAction) {
  state.ui.sideEffects.push({
    id: state.ui.sideEffectCount,
    ...effect,
  });
  state.ui.sideEffectCount++;
}

export const selectNextSideEffect = (s: AppState) =>
  s.ui.sideEffects.length === 0 ? null : s.ui.sideEffects[0];

export function pathsEqual(a: UiPath, b: UiPath) {
  if (a.view !== b.view) {
    return false;
  }
  if (a.view === "game" && b.view === "game") {
    if (a.gameMode !== b.gameMode) {
      return false;
    }
    if (a.gameMode === "daily" && b.gameMode === "daily") {
      if (a.challenge !== b.challenge) {
        return false;
      }
    } else if (a.gameMode === "practice" && b.gameMode === "practice") {
      if (a.challenge !== b.challenge) {
        return false;
      }
    } else if (a.gameMode === "historic" && b.gameMode === "historic") {
      if (a.challenge !== b.challenge) {
        return false;
      } else if (a.id !== b.id) {
        return false;
      }
    }
  }
  if (a.view === "stats" && b.view === "stats") {
    if (a.gameMode !== b.gameMode) {
      return false;
    } else if (a.challenge !== b.challenge) {
      return false;
    }
  }
  return true;
}
