import { configureStore, createAction, createReducer } from "@reduxjs/toolkit";
import { range } from "../util";
import { NUM_BOARDS, NUM_GUESSES, WORDS_VALID } from "./consts";
import {
  allWordsGuessed,
  deserialize,
  getTargetWords,
  Serialized,
} from "./funcs";

export type State = {
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

const initialState: State = {
  id: 0,
  input: "",
  guesses: [],
  targets: range(NUM_BOARDS).map((_) => "AAAAA"),
  gameOver: false,
  practice: true,
};

// Actions
export const loadState = createAction<{ serialized: Serialized }>("load-state");
export const startGame =
  createAction<{ id: number; practice: boolean }>("start-game");
export const inputLetter = createAction<{ letter: string }>("input-letter");
export const inputBackspace = createAction("input-backspace");
export const inputEnter = createAction("input-enter");

// Reducer
const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(loadState, (_, action) => {
      return deserialize(action.payload.serialized);
    })
    .addCase(startGame, (_, action) => {
      const newState: State = {
        id: action.payload.id,
        targets: getTargetWords(action.payload.id),
        guesses: [],
        input: "",
        gameOver: false,
        practice: action.payload.practice,
      };
      return newState;
    })
    .addCase(inputLetter, (state, action) => {
      if (state.gameOver) return;
      if (state.input.length < 5) {
        state.input += action.payload.letter;
      }
    })
    .addCase(inputBackspace, (state, _) => {
      if (state.gameOver) return;
      state.input = state.input.substring(0, state.input.length - 1);
    })
    .addCase(inputEnter, (state, _) => {
      allWordsGuessed(state.guesses, state.targets);
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
    });
});

// Store
export const store = configureStore({ reducer });

// Reexports
export * from "./consts";
export * from "./funcs";
export * from "./selector";
