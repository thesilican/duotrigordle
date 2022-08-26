import { createSelector } from "@reduxjs/toolkit";
import { RootState } from ".";
import { getGuessColors } from "../funcs";

// Memoize color calculations
export const selectGuessColors = createSelector(
  (state: RootState) => state.game.targets,
  (state: RootState) => state.game.guesses,
  (targets, guesses) =>
    targets.map((target) =>
      guesses.map((guess) => getGuessColors(guess, target))
    )
);
