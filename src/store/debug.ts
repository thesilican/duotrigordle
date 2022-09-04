import { batch } from "react-redux";
import { inputEnter, inputLetter, startGame, store } from ".";
import { getTodaysId, randU32 } from "../funcs";

// Debugging purposes
declare global {
  interface Window {
    solveGame: () => void;
    resetGame: () => void;
  }
}
export function addDebugHooks() {
  if (process.env.NODE_ENV === "development") {
    window.resetGame = () => {
      const state = store.getState();
      const practice = state.game.practice;
      const id = practice ? randU32() : getTodaysId();
      store.dispatch(startGame({ id, practice }));
    };
    window.solveGame = () => {
      batch(() => {
        const state = store.getState();
        if (state.game.guesses.length !== 0) {
          console.warn("You must have an empty game board to solve the game");
          return;
        }
        const timestamp = Date.now();
        store.dispatch(inputEnter({ timestamp }));
        for (let i = 0; i < state.game.targets.length; i++) {
          const target = state.game.targets[i];
          for (const letter of target) {
            store.dispatch(inputLetter({ letter }));
          }
          if (i !== state.game.targets.length - 1) {
            store.dispatch(inputEnter({ timestamp }));
          }
        }
      });
    };
  }
}
