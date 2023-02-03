import { createAction, createReducer } from "@reduxjs/toolkit";
import {
  getAllGuessColors,
  getAllWordsGuessed,
  getCompletedBoards,
  getGuessColors,
  getJumbleWords,
  getPracticeId,
  getTargetWords,
  initialState,
  normalizeHistory,
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
  practice: boolean;
  // Current game mode
  gameMode: GameMode;
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
export type GameMode = "normal" | "sequence" | "jumble";

export const gameInitialState: GameState = {
  id: 0,
  input: "",
  gameMode: "normal",
  guesses: [],
  targets: range(NUM_BOARDS).map((_) => "AAAAA"),
  colors: range(NUM_BOARDS).map(() => []),
  gameOver: false,
  practice: true,
  startTime: 0,
  endTime: 0,
};

export const gameAction = {
  load: createAction<{ game: GameState }>("game/loadGame"),
  // Start a Daily game
  start: createAction<{
    id: number;
    gameMode: GameMode;
    timestamp: number;
  }>("game/startGame"),
  // Start a practice game
  startPractice: createAction<{
    gameMode: GameMode;
    timestamp: number;
  }>("game/startPractice"),
  // Start a historic game
  startHistoric: createAction<{
    id: number;
  }>("game/startHistoric"),
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
        const colors = getAllGuessColors(targets, guesses);

        state.game = {
          id: action.payload.id,
          gameMode: action.payload.gameMode,
          targets,
          guesses,
          colors,
          input: "",
          gameOver: false,
          practice: false,
          startTime: 0,
          endTime: 0,
        };
        state.ui.highlightedBoard = null;
      })
      .addCase(gameAction.startPractice, (state, action) => {
        const id = getPracticeId(action.payload.timestamp);
        const targets = getTargetWords(id);
        const guesses =
          action.payload.gameMode === "jumble"
            ? getJumbleWords(targets, action.payload.timestamp)
            : [];
        const colors = getAllGuessColors(targets, guesses);

        state.game = {
          id,
          gameMode: action.payload.gameMode,
          targets,
          guesses,
          colors,
          input: "",
          gameOver: false,
          practice: true,
          startTime: 0,
          endTime: 0,
        };
        state.ui.highlightedBoard = null;
      })
      .addCase(gameAction.startHistoric, (state, action) => {
        const targets = getTargetWords(action.payload.id);
        const guesses: string[] = [];
        const colors = getAllGuessColors(targets, guesses);

        state.game = {
          id: action.payload.id,
          gameMode: "normal",
          targets,
          guesses,
          colors,
          input: "",
          gameOver: false,
          practice: true,
          startTime: 0,
          endTime: 0,
        };
        state.ui.highlightedBoard = null;
      })
      .addCase(gameAction.restart, (state, action) => {
        const id =
          state.game.practice && state.game.id >= PRACTICE_MODE_MIN_ID
            ? getPracticeId(action.payload.timestamp)
            : state.game.id;
        const targets = getTargetWords(id);
        const guesses =
          state.game.gameMode === "jumble"
            ? getJumbleWords(targets, action.payload.timestamp)
            : [];
        const colors = getAllGuessColors(targets, guesses);

        state.game = {
          id,
          gameMode: state.game.gameMode,
          targets,
          guesses,
          colors,
          input: "",
          gameOver: false,
          practice: state.game.practice,
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
        for (let i = 0; i < game.targets.length; i++) {
          const colors = getGuessColors(game.targets[i], guess);
          game.colors[i].push(colors);
        }
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
