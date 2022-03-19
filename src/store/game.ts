import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NUM_BOARDS, NUM_GUESSES, WORDS_VALID } from "../consts";
import { allWordsGuessed, getTargetWords } from "../funcs";
import { range } from "../util";

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
  // Whether or not the game is in practice mode
  practice: boolean;
};
const initialState: GameState = {
  id: 0,
  input: "",
  guesses: [],
  targets: range(NUM_BOARDS).map((_) => "AAAAA"),
  gameOver: false,
  practice: true,
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
      action: PayloadAction<{ id: number; practice: boolean }>
    ) => {
      return {
        id: action.payload.id,
        targets: getTargetWords(action.payload.id),
        guesses: [],
        input: "",
        gameOver: false,
        practice: action.payload.practice,
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
    inputEnter: (state) => {
      if (state.gameOver) return;

      const guess = state.input;
      state.input = "";
      if (!WORDS_VALID.has(guess)) {
        return;
      }
      state.guesses.push(guess);

      if (
        state.guesses.length === NUM_GUESSES ||
        allWordsGuessed(state.guesses, state.targets)
      ) {
        state.gameOver = true;
      }
    },
  },
});

export const { inputBackspace, inputEnter, inputLetter, loadGame, startGame } =
  gameSlice.actions;
export const gameReducer = gameSlice.reducer;
