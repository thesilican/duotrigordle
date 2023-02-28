import { configureStore } from "@reduxjs/toolkit";
import { getGuessColors, getJumbleWords, getTargetWords } from "../funcs";
import {
  addHistoryEntry,
  gameAction,
  HistoryEntry,
  normalizeHistory,
  reducer,
} from "../index";

describe("funcs", () => {
  test("getJumbleWords", () => {
    const targets = getTargetWords(12, "normal");
    const jumble = getJumbleWords(targets, 1);
    expect(jumble).toEqual(["CAPUT", "DILLY", "FROST"]);

    for (let i = 0; i < 100; i++) {
      const jumble = getJumbleWords(targets, i);
      const letters = new Set(jumble.flatMap((x) => x.split("")));
      expect(letters.size).toBeGreaterThanOrEqual(10);
      for (const word of jumble) {
        expect(targets).not.toContain(word);
      }
    }
  });
  test("guessColors", () => {
    expect(getGuessColors("AAABC", "CXAAA")).toEqual("YBGYY");
  });
});

describe("stats", () => {
  test("normalizeHistory", () => {
    const test1: HistoryEntry[] = [
      { id: 1, challenge: "normal", guesses: null, time: 1234 },
      { id: 10, challenge: "normal", guesses: 32, time: 1234 },
      { id: 12, challenge: "normal", guesses: 33, time: 1234.567 },
      { id: 1, challenge: "normal", guesses: 34, time: 1234 },
      { id: 1, challenge: "sequence", guesses: null, time: 1234 },
      { id: 2, challenge: "sequence", guesses: null, time: 1234 },
      { id: 2, challenge: "normal", guesses: null, time: 1234 },
      { id: 2, challenge: "perfect", guesses: null, time: 1234 },
      { id: 2, challenge: "jumble", guesses: null, time: 1234 },
    ];
    const expect1: HistoryEntry[] = [
      { id: 1, challenge: "normal", guesses: null, time: 1234 },
      { id: 1, challenge: "sequence", guesses: null, time: 1234 },
      { id: 2, challenge: "normal", guesses: null, time: 1234 },
      { id: 2, challenge: "sequence", guesses: null, time: 1234 },
      { id: 2, challenge: "jumble", guesses: null, time: 1234 },
      { id: 2, challenge: "perfect", guesses: null, time: 1234 },
      { id: 10, challenge: "normal", guesses: 32, time: 1234 },
      { id: 12, challenge: "normal", guesses: 33, time: 1234.57 },
    ];
    expect(normalizeHistory(test1)).toEqual(expect1);
  });
  test("addHistoryEntry", () => {
    const history1: HistoryEntry[] = [
      { id: 1, challenge: "normal", guesses: null, time: 1234 },
      { id: 1, challenge: "sequence", guesses: null, time: 1234 },
      { id: 2, challenge: "normal", guesses: null, time: 1234 },
      { id: 2, challenge: "sequence", guesses: null, time: 1234 },
      { id: 2, challenge: "jumble", guesses: null, time: 1234 },
      { id: 2, challenge: "perfect", guesses: null, time: 1234 },
      { id: 10, challenge: "normal", guesses: 32, time: 1234 },
      { id: 12, challenge: "normal", guesses: 33, time: 1234.57 },
    ];
    const entry1: HistoryEntry = {
      id: 2,
      challenge: "normal",
      guesses: 37,
      time: 1000.001,
    };
    const expect1 = [
      { id: 1, challenge: "normal", guesses: null, time: 1234 },
      { id: 1, challenge: "sequence", guesses: null, time: 1234 },
      { id: 2, challenge: "normal", guesses: 37, time: 1000 },
      { id: 2, challenge: "sequence", guesses: null, time: 1234 },
      { id: 2, challenge: "jumble", guesses: null, time: 1234 },
      { id: 2, challenge: "perfect", guesses: null, time: 1234 },
      { id: 10, challenge: "normal", guesses: 32, time: 1234 },
      { id: 12, challenge: "normal", guesses: 33, time: 1234.57 },
    ];
    expect(addHistoryEntry(history1, entry1)).toEqual(expect1);
  });
});

describe("game", () => {
  it("should save", () => {
    const store = configureStore({ reducer });
    store.dispatch(
      gameAction.start({
        gameMode: "daily",
        challenge: "normal",
        timestamp: 1677609625570,
      })
    );
    store.dispatch(gameAction.inputLetter({ letter: "H" }));
    store.dispatch(gameAction.inputLetter({ letter: "E" }));
    store.dispatch(gameAction.inputLetter({ letter: "L" }));
    store.dispatch(gameAction.inputLetter({ letter: "L" }));
    store.dispatch(gameAction.inputLetter({ letter: "O" }));
    store.dispatch(gameAction.inputEnter({ timestamp: 1677609625570 }));
    expect(store.getState().saves).toEqual({
      daily: {
        normal: {
          id: 363,
          guesses: ["HELLO"],
          startTime: 1677609625570,
          endTime: 0,
        },
        sequence: null,
        jumble: null,
      },
    });
  });
});
