import { createSelector } from "@reduxjs/toolkit";
import { RootState } from ".";
import {
  getAllWordsGuessed,
  getCompletedBoards,
  getGuessColors,
} from "../funcs";

export const selectTargets = (state: RootState) => state.game.targets;
export const selectGuesses = (state: RootState) => state.game.guesses;

export const selectGuessColors = createSelector(
  selectTargets,
  selectGuesses,
  (targets, guesses) =>
    targets.map((target) =>
      guesses.map((guess) => getGuessColors(target, guess))
    )
);

export const selectCompletedBoards = createSelector(
  selectTargets,
  selectGuesses,
  (targets, guesses) => getCompletedBoards(targets, guesses)
);

export const selectAllWordsGuessed = createSelector(
  (state: RootState) => state.game.targets,
  (state: RootState) => state.game.guesses,
  (targets, guesses) => getAllWordsGuessed(targets, guesses)
);
