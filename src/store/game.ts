import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NUM_BOARDS, NUM_GUESSES, WORDS_VALID, WORDS_TARGET } from "../consts";
import { allWordsGuessed, getTargetWords, range, getNewIdContainingGuess } from "../funcs";
import { GameMode } from "./game-mode";

// Don't forget to update corresponding shape checks in funcs.ts
// if you add/remove fields
export type GameState = {
  // Daily duotrigordle number (seed for target words)
  id: number;
  // Current word input
  input: string;
  // List of guesses
  guesses: string[];
  // 32 wordle targets
  targets: string[];
  // Whether or not the game is finished
  gameOver: boolean;
  // What the current game mode is
  mode: GameMode;
  // Start timestamp (milliseconds from unix epoch)
  startTime: number;
  // End timestamp (milliseconds from unix epoch)
  endTime: number;
};
const initialState: GameState = {
  id: 0,
  input: "",
  guesses: [],
  targets: range(NUM_BOARDS).map((_) => "AAAAA"),
  gameOver: false,
  mode: GameMode.Practice,
  startTime: 0,
  endTime: 0,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    loadGame: (_, action: PayloadAction<{ game: GameState }>) => {
      return action.payload.game;
    },
    startGame: (
      _,
      action: PayloadAction<{ id: number; mode: GameMode }>
    ) => {
      return {
        id: action.payload.id,
        targets: getTargetWords(action.payload.id),
        guesses: [],
        input: "",
        gameOver: false,
        mode: action.payload.mode,
        startTime: 0,
        endTime: 0,
      };
    },
    inputLetter: (state, action: PayloadAction<{ letter: string }>) => {
      if (state.gameOver) return;
      if (state.input.length < 5) {
        state.input += action.payload.letter;
      }
    },
    inputBackspace: (state) => {
      if (state.gameOver) return;
      state.input = state.input.substring(0, state.input.length - 1);
    },
    inputEnter: (state, action: PayloadAction<{ timestamp: number }>) => {
      if (state.gameOver) return;

      const guess = state.input;
      state.input = "";
      if (!WORDS_VALID.has(guess)) {
        return;
      }

      if (state.guesses.length === 0 && state.mode === GameMode.Perfect) {
        if (!WORDS_TARGET.includes(guess)) {
          return;
        }
        state.id = getNewIdContainingGuess(state.id, guess);
        state.targets = getTargetWords(state.id);
      }

      state.guesses.push(guess);
      // Start timer on first guess
      if (state.guesses.length === 1) {
        state.startTime = action.payload.timestamp;
      }

      if (
        state.guesses.length === NUM_GUESSES ||
        allWordsGuessed(state.guesses, state.targets)
      ) {
        state.gameOver = true;
        state.endTime = action.payload.timestamp;
      }
    },
  },
});

export const { inputBackspace, inputEnter, inputLetter, loadGame, startGame } =
  gameSlice.actions;
export const gameReducer = gameSlice.reducer;
