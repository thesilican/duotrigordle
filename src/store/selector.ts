import { createSelector } from "@reduxjs/toolkit";
import {
  AppState,
  getAllWordsGuessed,
  getCompletedBoards,
  getGuessColors,
} from ".";

export const selectTargets = (state: AppState) => state.game.targets;
export const selectGuesses = (state: AppState) => state.game.guesses;

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
  (state: AppState) => state.game.targets,
  (state: AppState) => state.game.guesses,
  (targets, guesses) => getAllWordsGuessed(targets, guesses)
);
