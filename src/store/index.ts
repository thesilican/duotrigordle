import { configureStore, createAction, createReducer } from "@reduxjs/toolkit";
import { range } from "../util";
import { NUM_BOARDS, NUM_GUESSES, WORDS_VALID } from "./consts";
import { getGuessResult, getTargetWords, State } from "./funcs";

const initialState: State = {
  id: 0,
  input: [],
  boards: range(NUM_BOARDS).map((_) => ({
    target: "AAAAA",
    guesses: [],
    complete: false,
    won: false,
  })),
  gameOver: true,
};

// Actions
export const loadState = createAction<{ state: State }>("load-state");
export const startGame = createAction<{ id: number }>("start-game");
export const inputLetter = createAction<{ letter: string }>("input-letter");
export const inputBackspace = createAction("input-backspace");
export const inputEnter = createAction("input-enter");

// Reducer
const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(loadState, (_, action) => {
      return action.payload.state;
    })
    .addCase(startGame, (_, action) => {
      const targets = getTargetWords(action.payload.id);
      const newState: State = {
        id: action.payload.id,
        boards: targets.map((target) => ({
          target,
          guesses: [],
          complete: false,
          won: false,
        })),
        input: [],
        gameOver: false,
      };
      return newState;
    })
    .addCase(inputLetter, (state, action) => {
      if (state.gameOver) return;
      if (state.input.length < 5) {
        state.input.push(action.payload.letter);
      }
    })
    .addCase(inputBackspace, (state, _) => {
      if (state.gameOver) return;
      state.input.pop();
    })
    .addCase(inputEnter, (state, _) => {
      if (state.gameOver) return;

      const guess = state.input.join("");
      state.input = [];
      if (!WORDS_VALID.has(guess)) {
        return;
      }

      let allComplete = true;
      for (const board of state.boards) {
        if (board.complete) continue;
        board.guesses.push(guess);
        if (getGuessResult(guess, board.target) === "GGGGG") {
          board.complete = true;
          board.won = true;
        } else if (board.guesses.length === NUM_GUESSES) {
          board.complete = true;
        }
      }

      if (allComplete) {
        state.gameOver = true;
      }
    });
});

// Store
export const store = configureStore({ reducer });

// Reexports
export * from "./selector";
export * from "./funcs";
export * from "./consts";
