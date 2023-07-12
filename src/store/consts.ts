export const NUM_BOARDS = 32;

export const NUM_GUESSES = {
  normal: 37,
  sequence: 39,
  jumble: 38,
  perfect: 32,
};

export const PRACTICE_MODE_MIN_ID = 100_000;

export const PRACTICE_MODE_MAX_ID = 1_000_000;

export const START_DATE = (() => {
  // Use this method so that the start date is offset by current timezone offset
  // Old method had problems with the start date being before DST
  const utcDate = new Date("2022-03-03T00:00:00Z").getTime();
  const offset = new Date().getTimezoneOffset();
  return utcDate + offset * 60 * 1000;
})();

export const LAST_UPDATED = "2023-07-17";

export const ALPHABET = new Set([
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
]);

export { WORDS_TARGET, WORDS_VALID } from "./wordlist";
