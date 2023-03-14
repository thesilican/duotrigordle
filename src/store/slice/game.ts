import { createAction, createReducer } from "@reduxjs/toolkit";
import {
  addHistoryEntry,
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
export type Challenge = "normal" | "sequence" | "jumble" | "perfect";
export type GameStartOptions =
  | {
      gameMode: "daily";
      challenge: Challenge;
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
      challenge: Challenge;
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
  loadSave: createAction<{
    timestamp: number;
    challenge: "normal" | "sequence" | "jumble";
  }>("game/loadSave"),
  // Start a Daily game
  start: createAction<GameStartOptions>("game/startGame"),
  // Restart the current game
  restart: createAction<{ timestamp: number }>("game/restart"),
  inputLetter: createAction<{ letter: string }>("game/inputLetter"),
  inputBackspace: createAction("game/inputBackspace"),
  inputEnter: createAction<{ timestamp: number }>("game/inputEnter"),
};

export const gameReducer = createReducer(
  () => initialState,
  (builder) =>
    builder
      .addCase(gameAction.loadSave, (state, action) => {
        const gameSave = state.saves.daily[action.payload.challenge];
        if (!gameSave) {
          return;
        }
        if (getDailyId(action.payload.timestamp) !== gameSave.id) {
          return;
        }
        const id = gameSave.id;
        const challenge = action.payload.challenge;
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
      })
      .addCase(gameAction.start, (state, action) => {
        state.game = startGame(action.payload);
        state.ui.highlightedBoard = null;
      })
      .addCase(gameAction.restart, (state, action) => {
        const options =
          state.game.gameMode === "daily" || state.game.gameMode === "practice"
            ? {
                gameMode: state.game.gameMode,
                challenge: state.game.challenge,
                timestamp: action.payload.timestamp,
              }
            : {
                gameMode: state.game.gameMode,
                id: state.game.id,
                challenge: state.game.challenge,
                timestamp: action.payload.timestamp,
              };
        state.game = startGame(options);
        state.ui.highlightedBoard = null;
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

        const guess = game.input;
        game.input = "";
        if (!WORDS_VALID.has(guess)) {
          return;
        }
        game.guesses.push(guess);

        // Fudge the guess if in perfect mode
        if (game.guesses.length === 1 && game.challenge === "perfect") {
          const idx = game.targets.indexOf(guess);
          if (idx !== -1) {
            game.targets[idx] = game.targets[0];
          }
          game.targets[0] = guess;
        }

        for (let i = 0; i < game.targets.length; i++) {
          const colors = getGuessColors(game.targets[i], guess);
          game.colors[i].push(colors);
        }
        // Start timer on first guess
        if (game.guesses.length === 1) {
          game.startTime = action.payload.timestamp;
        }

        // Check if game over
        if (getIsGameOver(game.targets, game.guesses, game.challenge)) {
          game.gameOver = true;
          game.endTime = action.payload.timestamp;

          // Add stat to game history
          if (game.gameMode === "daily") {
            const entry = {
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
          state.saves.daily[game.challenge] = {
            id: game.id,
            guesses: game.guesses,
            startTime: game.startTime,
            endTime: game.endTime,
          };
        }
      })
);

// Extract logic to its own function, since this is used in
// start and restart
function startGame(options: GameStartOptions): GameState {
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

  return {
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
}
