import { batch } from "react-redux";
import { store } from ".";
import { gameAction } from "./slice/game";

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
      store.dispatch(gameAction.restart({ timestamp: Date.now() }));
    };
    window.solveGame = () => {
      batch(() => {
        const state = store.getState();
        const timestamp = Date.now();
        store.dispatch(gameAction.inputEnter({ timestamp }));
        for (let i = 0; i < state.game.targets.length; i++) {
          const target = state.game.targets[i];
          for (const letter of target) {
            store.dispatch(gameAction.inputLetter({ letter }));
          }
          if (i !== state.game.targets.length - 1) {
            store.dispatch(gameAction.inputEnter({ timestamp }));
          }
        }
      });
    };
  }
}
