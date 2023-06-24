import { createAction, createReducer } from "@reduxjs/toolkit";
import {
  addHistoryEntry,
  AppState,
  getAllGuessColors,
  getAllWordsGuessed,
  getCompletedBoards,
  getDailyId,
  getGuessColors,
  getIsGameOver,
  getJumbleWords,
  getPracticeId,
  getTargetWords,
  highlightNextBoard,
  initialState,
} from "..";
import { range } from "../../util";
import { NUM_BOARDS, PRACTICE_MODE_MIN_ID, WORDS_VALID } from "../consts";

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
  // Whether or not the game is finished
  gameOver: boolean;
  // Start timestamp (milliseconds from unix epoch)
  startTime: number;
  // End timestamp (milliseconds from unix epoch)
  endTime: number;
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
  gameOver: false,
  startTime: 0,
  endTime: 0,
};

export const gameAction = {
  start: createAction<GameStartOptions>("game/startGame"),
  restart: createAction<{ timestamp: number }>("game/restart"),
  inputLetter: createAction<{ letter: string }>("game/inputLetter"),
  inputBackspace: createAction("game/inputBackspace"),
  inputEnter: createAction<{ timestamp: number }>("game/inputEnter"),
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
        if (game.gameOver) return;
        if (game.input.length < 5) {
          game.input += action.payload.letter;
        }
      })
      .addCase(gameAction.inputBackspace, (state, _) => {
        const game = state.game;
        if (game.gameOver) return;
        game.input = game.input.substring(0, game.input.length - 1);
      })
      .addCase(gameAction.inputEnter, (state, action) => {
        const game = state.game;
        if (game.gameOver) return;

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
        if (game.guesses.length === 1) {
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
        if (getIsGameOver(game.targets, game.guesses, game.challenge)) {
          game.gameOver = true;
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
          state.ui.highlightedBoard = null;
        } else {
          // Check if highlighted board is invalid, then shift right until it isn't
          const completedBoards = getCompletedBoards(
            game.targets,
            game.guesses
          );
          if (
            state.ui.highlightedBoard !== null &&
            completedBoards[state.ui.highlightedBoard]
          ) {
            highlightNextBoard(state);
          }
        }

        // Save game state
        if (game.gameMode === "daily" && game.challenge !== "perfect") {
          state.storage.daily[game.challenge] = {
            id: game.id,
            guesses: game.guesses,
            startTime: game.startTime,
            endTime: game.endTime,
          };
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
  const startTime = guesses.length > 0 ? options.timestamp : 0;

  state.game = {
    id,
    gameMode: options.gameMode,
    challenge: options.challenge,
    targets,
    guesses,
    colors,
    input: "",
    gameOver: false,
    startTime,
    endTime: 0,
  };
  state.ui.highlightedBoard = null;
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
    input: "",
    gameOver: getIsGameOver(targets, guesses, challenge),
  };
  state.ui.highlightedBoard = null;
}
