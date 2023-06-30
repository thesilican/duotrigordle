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
  view: UiView;
  modal: ModalState;
  sideEffects: SideEffect[];
  sideEffectCount: number;
  welcomeTab: number;
  snackbar: Snackbar;
};
export type UiView =
  | "welcome"
  | "game"
  | "stats"
  | "privacy-policy"
  | "how-to-play"
  | "account";
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
type Snackbar = {
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
            path: Path;
          }
        | {
            type: "pop";
          };
    }
  | { type: "upload-game-save"; challenge: DailyChallenge; gameSave: GameSave };

export const uiInitialState: UiState = {
  view: "welcome",
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
  setView: createAction<UiView>("ui/setView"),
  showModal: createAction<ModalState>("ui/showModal"),
  createSideEffect: createAction<SideEffectAction>("ui/createSideEffect"),
  resolveSideEffect: createAction<number>("ui/resolveSideEffect"),
  navigate: createAction<{
    to: Path;
    timestamp: number;
    browser?: boolean;
  }>("ui/navigate"),
  setWelcomeTab: createAction<number>("ui/setWelcomeTab"),
  setSnackbar: createAction<Partial<Snackbar>>("ui/setSnackbar"),
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
        const timestamp = action.payload.timestamp;
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
        const prevView = state.ui.view;
        state.ui.view = path.view;
        if (!action.payload.browser) {
          if (prevView === "welcome") {
            if (path.view !== "welcome") {
              addSideEffect(state, {
                type: "update-history",
                action: { type: "push", path },
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
                action: { type: "replace", path },
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
