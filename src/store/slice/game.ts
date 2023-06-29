import { createAction, createReducer } from "@reduxjs/toolkit";
import {
  addHistoryEntry,
  addSideEffect,
  AppState,
  getAllGuessColors,
  getAllWordsGuessed,
  getCompletedBoards,
  getDailyId,
  getGuessColors,
  getJumbleWords,
  getPracticeId,
  getSequenceVisibleBoard,
  getTargetWords,
  initialState,
} from "..";
import { range } from "../../util";
import {
  NUM_BOARDS,
  NUM_GUESSES,
  PRACTICE_MODE_MIN_ID,
  WORDS_VALID,
} from "../consts";

export type GameState = {
  // Daily Duotrigordle number (seed for target words)
  id: number;
  // Whether or not the game is in practice mode
  gameMode: GameMode;
  // Current game challenge mode
  challenge: Challenge;
  // Current word input
  input: string;
  // List of guesses
  guesses: string[];
  // 32 wordle targets
  targets: string[];
  // Word colors e.g. "BBYGG" (indexed by board, row)
  colors: string[][];
  // Start timestamp (unix timestamp), null if game not started
  startTime: number | null;
  // End timestamp (unix timestamp), null if game not ended
  endTime: number | null;
  // Pause timestamp (unix timestamp)
  pauseTime: number | null;
  // Which board is currently highlighted
  highlightedBoard: number | null;
};
export type GameMode = "daily" | "practice" | "historic";
export type DailyChallenge = "normal" | "sequence" | "jumble";
export type Challenge = DailyChallenge | "perfect";
export type GameStartOptions =
  | {
      gameMode: "daily";
      challenge: DailyChallenge;
      timestamp: number;
    }
  | {
      gameMode: "practice";
      challenge: Challenge;
      timestamp: number;
    }
  | {
      gameMode: "historic";
      id: number;
      challenge: DailyChallenge;
      timestamp: number;
    };

export const gameInitialState: GameState = {
  id: 0,
  input: "",
  gameMode: "daily",
  challenge: "normal",
  guesses: [],
  targets: range(NUM_BOARDS).map((_) => "AAAAA"),
  colors: range(NUM_BOARDS).map(() => []),
  startTime: null,
  endTime: null,
  pauseTime: null,
  highlightedBoard: null,
};

export const gameAction = {
  start: createAction<GameStartOptions>("game/startGame"),
  restart: createAction<{ timestamp: number }>("game/restart"),
  pause: createAction<{ timestamp: number }>("game/pause"),
  unpause: createAction<{ timestamp: number }>("game/unpause"),
  inputLetter: createAction<{ letter: string }>("game/inputLetter"),
  inputBackspace: createAction("game/inputBackspace"),
  inputEnter: createAction<{ timestamp: number }>("game/inputEnter"),
  highlightClick: createAction<number>("game/highlightClick"),
  highlightEsc: createAction("game/highlightEsc"),
  highlightArrow: createAction<{
    direction: "left" | "right";
  }>("game/highlightArrow"),
};

export const gameReducer = createReducer(
  () => initialState,
  (builder) =>
    builder
      .addCase(gameAction.start, (state, action) => {
        startGame(state, action.payload);
      })
      .addCase(gameAction.restart, (state, action) => {
        if (state.game.gameMode === "daily") {
          // Do nothing, you can't restart a daily game
        } else if (state.game.gameMode === "practice") {
          startGame(state, {
            gameMode: "practice",
            challenge: state.game.challenge,
            timestamp: action.payload.timestamp,
          });
        } else if (state.game.gameMode === "historic") {
          if (state.game.challenge === "perfect") return;
          startGame(state, {
            gameMode: "historic",
            id: state.game.id,
            challenge: state.game.challenge,
            timestamp: action.payload.timestamp,
          });
        }
      })
      .addCase(gameAction.inputLetter, (state, action) => {
        const game = state.game;
        if (game.endTime !== null) return;
        if (game.input.length < 5) {
          game.input += action.payload.letter;
        }
      })
      .addCase(gameAction.inputBackspace, (state, _) => {
        const game = state.game;
        if (game.endTime !== null) return;
        game.input = game.input.substring(0, game.input.length - 1);
      })
      .addCase(gameAction.inputEnter, (state, action) => {
        const game = state.game;
        if (game.endTime !== null) return;

        // Input guess and update colors
        const guess = game.input;
        game.input = "";
        if (!WORDS_VALID.has(guess)) {
          return;
        }
        game.guesses.push(guess);
        for (let i = 0; i < game.targets.length; i++) {
          const colors = getGuessColors(game.targets[i], guess);
          game.colors[i].push(colors);
        }

        // Start timer on first guess
        if (game.startTime === null) {
          game.startTime = action.payload.timestamp;
        }

        // Fudge the guess if in perfect mode
        if (game.guesses.length === 1 && game.challenge === "perfect") {
          const idx = game.targets.indexOf(guess);
          if (idx !== -1) {
            game.targets[idx] = game.targets[0];
          }
          game.targets[0] = guess;
        }

        // Check if game over
        const allWordsGuessed = getAllWordsGuessed(game.targets, game.guesses);
        const maxGuesses = game.guesses.length >= NUM_GUESSES[game.challenge];
        if (allWordsGuessed || maxGuesses) {
          game.endTime = action.payload.timestamp;

          // Add stat to game history
          const gameMode = game.gameMode;
          if (gameMode === "daily" || gameMode === "practice") {
            const entry = {
              gameMode,
              id: game.id,
              guesses: getAllWordsGuessed(game.targets, game.guesses)
                ? game.guesses.length
                : null,
              time: game.endTime - game.startTime,
              challenge: game.challenge,
            };
            state.stats.history = addHistoryEntry(state.stats.history, entry);
          }

          // Clear board highlights
          state.game.highlightedBoard = null;
        } else {
          // Check if highlighted board is invalid, then shift right until it isn't
          const completedBoards = getCompletedBoards(
            game.targets,
            game.guesses
          );
          if (
            state.game.highlightedBoard !== null &&
            completedBoards[state.game.highlightedBoard]
          ) {
            highlightNextBoard(state);
          }
        }

        // Save game state
        saveGame(state);
      })
      .addCase(gameAction.pause, (state, action) => {
        pauseGame(state, action.payload.timestamp);
      })
      .addCase(gameAction.unpause, (state, action) => {
        unpauseGame(state, action.payload.timestamp);
      })
      .addCase(gameAction.highlightClick, (state, action) => {
        const completedBoards = getCompletedBoards(
          state.game.targets,
          state.game.guesses
        );
        const sequenceVisibleBoard = getSequenceVisibleBoard(
          state.game.targets,
          state.game.guesses
        );
        if (
          state.ui.view === "game" &&
          state.game.endTime === null &&
          !completedBoards[action.payload] &&
          (state.game.challenge !== "sequence" ||
            action.payload === sequenceVisibleBoard) &&
          state.game.highlightedBoard !== action.payload
        ) {
          state.game.highlightedBoard = action.payload;
        } else {
          state.game.highlightedBoard = null;
        }
      })
      .addCase(gameAction.highlightEsc, (state, _) => {
        state.game.highlightedBoard = null;
      })
      .addCase(gameAction.highlightArrow, (state, action) => {
        if (state.game.challenge === "sequence") {
          return;
        }
        if (action.payload.direction === "left") {
          highlightPreviousBoard(state);
        } else {
          highlightNextBoard(state);
        }
        if (state.game.highlightedBoard !== null) {
          addSideEffect(state, {
            type: "scroll-board-into-view",
            board: state.game.highlightedBoard,
          });
        }
      })
);

export function startGame(state: AppState, options: GameStartOptions) {
  const id =
    options.gameMode === "daily"
      ? getDailyId(options.timestamp)
      : options.gameMode === "practice"
      ? getPracticeId(options.timestamp)
      : options.id;
  const targets = getTargetWords(id, options.challenge);
  const guesses =
    options.challenge === "jumble"
      ? getJumbleWords(targets, id + PRACTICE_MODE_MIN_ID)
      : [];
  const colors = getAllGuessColors(targets, guesses);

  state.game = {
    id,
    gameMode: options.gameMode,
    challenge: options.challenge,
    targets,
    guesses,
    colors,
    input: "",
    startTime: null,
    endTime: null,
    pauseTime: null,
    highlightedBoard: null,
  };
}

export function loadSave(
  state: AppState,
  challenge: DailyChallenge,
  timestamp: number
) {
  const gameSave = state.storage.daily[challenge];
  if (!gameSave) {
    return;
  }
  if (getDailyId(timestamp) !== gameSave.id) {
    return;
  }
  const id = gameSave.id;
  const targets = getTargetWords(id, challenge);
  const guesses = gameSave.guesses;

  state.game = {
    id,
    gameMode: "daily",
    challenge,
    targets,
    guesses,
    colors: getAllGuessColors(targets, guesses),
    startTime: gameSave.startTime,
    endTime: gameSave.endTime,
    pauseTime: gameSave.pauseTime,
    input: "",
    highlightedBoard: null,
  };
  state.game.highlightedBoard = null;
}

export function saveGame(state: AppState) {
  const game = state.game;
  if (game.gameMode === "daily" && game.challenge !== "perfect") {
    state.storage.daily[game.challenge] = {
      id: game.id,
      guesses: game.guesses,
      startTime: game.startTime,
      endTime: game.endTime,
      pauseTime: game.pauseTime,
    };
  }
}

export function pauseGame(state: AppState, timestamp: number) {
  const game = state.game;
  if (
    game.pauseTime === null &&
    game.startTime !== null &&
    game.endTime === null
  ) {
    game.pauseTime = timestamp;
    saveGame(state);
  }
}

export function unpauseGame(state: AppState, timestamp: number) {
  const game = state.game;
  if (
    game.startTime !== null &&
    game.pauseTime !== null &&
    game.endTime === null
  ) {
    if (game.pauseTime < timestamp) {
      game.startTime += timestamp - game.pauseTime;
    }
    game.pauseTime = null;
    saveGame(state);
  }
}

export function highlightNextBoard(state: AppState) {
  if (state.game.endTime !== null) {
    state.game.highlightedBoard = null;
    return;
  }

  let idx = state.game.highlightedBoard;
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
      state.game.highlightedBoard = idx;
      return;
    }
    idx = (idx + 1) % NUM_BOARDS;
  }
  state.game.highlightedBoard = null;
}

export function highlightPreviousBoard(state: AppState) {
  if (state.game.endTime !== null) {
    state.game.highlightedBoard = null;
    return;
  }

  let idx = state.game.highlightedBoard;
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
      state.game.highlightedBoard = idx;
      return;
    }
    idx = (idx + NUM_BOARDS - 1) % NUM_BOARDS;
  }
  state.game.highlightedBoard = null;
}
