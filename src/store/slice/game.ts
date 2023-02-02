import { createAction, createReducer } from "@reduxjs/toolkit";
import {
  getAllWordsGuessed,
  getCompletedBoards,
  getJumbleWords,
  getTargetWords,
  initialState,
  normalizeHistory,
} from "..";
import { NUM_BOARDS, NUM_GUESSES, WORDS_VALID } from "../consts";
import { range } from "../../util";

export type GameState = {
  // Daily Duotrigordle number (seed for target words)
  id: number;
  // Whether or not the game is in practice mode
  practice: boolean;
  // Current game mode
  gameMode: GameMode;
  // Current word input
  input: string;
  // List of guesses
  guesses: string[];
  // 32 wordle targets
  targets: string[];
  // Whether or not the game is finished
  gameOver: boolean;
  // Start timestamp (milliseconds from unix epoch)
  startTime: number;
  // End timestamp (milliseconds from unix epoch)
  endTime: number;
};
export type GameMode = "normal" | "sequence" | "jumble";

export const gameInitialState: GameState = {
  id: 0,
  input: "",
  gameMode: "normal",
  guesses: [],
  targets: range(NUM_BOARDS).map((_) => "AAAAA"),
  gameOver: false,
  practice: true,
  startTime: 0,
  endTime: 0,
};

export const gameAction = {
  load: createAction<{ game: GameState }>("game/loadGame"),
  start: createAction<{
    id: number;
    practice: boolean;
    gameMode: GameMode;
    timestamp: number;
  }>("game/startGame"),
  inputLetter: createAction<{ letter: string }>("game/inputLetter"),
  inputBackspace: createAction("game/inputBackspace"),
  inputEnter: createAction<{ timestamp: number }>("game/inputEnter"),
};

export const gameReducer = createReducer(
  () => initialState,
  (builder) =>
    builder
      .addCase(gameAction.load, (state, action) => {
        state.game = action.payload.game;
        state.ui.highlightedBoard = null;
      })
      .addCase(gameAction.start, (state, action) => {
        const targets = getTargetWords(action.payload.id);
        const guesses =
          action.payload.gameMode === "jumble"
            ? getJumbleWords(targets, action.payload.timestamp)
            : [];

        state.game = {
          id: action.payload.id,
          gameMode: action.payload.gameMode,
          targets,
          guesses,
          input: "",
          gameOver: false,
          practice: action.payload.practice,
          startTime: 0,
          endTime: 0,
        };
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
        // Start timer on first guess
        if (game.guesses.length === 1) {
          game.startTime = action.payload.timestamp;
        }

        // Check if game over
        if (
          game.guesses.length === NUM_GUESSES ||
          getAllWordsGuessed(game.targets, game.guesses)
        ) {
          game.gameOver = true;
          game.endTime = action.payload.timestamp;

          // Add stat to game history
          if (!game.practice) {
            const entry = {
              id: game.id,
              guesses: getAllWordsGuessed(game.targets, game.guesses)
                ? game.guesses.length
                : null,
              time: game.endTime - game.startTime,
            };
            const newHistory = state.stats.history.filter(
              (x) => x.id !== entry.id
            );
            newHistory.push(entry);
            state.stats.history = normalizeHistory(newHistory);
          }

          // Clear board highlights
          state.ui.highlightedBoard = null;
        } else {
          // Check if highlighted board is invalid, then shift right until it isn't
          if (state.ui.highlightedBoard === null) return;
          const completedBoards = getCompletedBoards(
            game.targets,
            game.guesses
          );
          let i = state.ui.highlightedBoard;
          const start = i;
          while (completedBoards[i]) {
            i = (i + 1) % completedBoards.length;
            if (i === start) {
              break;
            }
          }
          state.ui.highlightedBoard = i;
        }
      })
);
