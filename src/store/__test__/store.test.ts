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
    // Test deduplication
    const test1: HistoryEntry[] = [
      {
        gameMode: "daily",
        challenge: "normal",
        id: 1,
        guesses: 32,
        time: null,
      },
      {
        gameMode: "daily",
        challenge: "normal",
        id: 1,
        guesses: 33,
        time: null,
      },
      {
        gameMode: "practice",
        challenge: "perfect",
        id: 1,
        guesses: 32,
        time: null,
      },
      {
        gameMode: "practice",
        challenge: "perfect",
        id: 1,
        guesses: 33,
        time: null,
      },
    ];
    const expect1 = [
      {
        gameMode: "daily",
        challenge: "normal",
        id: 1,
        guesses: 32,
        time: null,
      },
      {
        gameMode: "practice",
        challenge: "perfect",
        id: 1,
        guesses: 32,
        time: null,
      },
    ];
    expect(normalizeHistory(test1)).toEqual(expect1);

    // Test sorting
    const test2: HistoryEntry[] = [
      {
        gameMode: "daily",
        challenge: "normal",
        id: 1,
        guesses: null,
        time: null,
      },
      {
        gameMode: "daily",
        challenge: "sequence",
        id: 1,
        guesses: null,
        time: null,
      },
      {
        gameMode: "daily",
        challenge: "jumble",
        id: 1,
        guesses: null,
        time: null,
      },
      {
        gameMode: "daily",
        challenge: "normal",
        id: 2,
        guesses: null,
        time: null,
      },
      {
        gameMode: "daily",
        challenge: "sequence",
        id: 2,
        guesses: null,
        time: null,
      },
      {
        gameMode: "daily",
        challenge: "jumble",
        id: 2,
        guesses: null,
        time: null,
      },
      {
        gameMode: "practice",
        challenge: "normal",
        id: 12345,
        guesses: null,
        time: null,
      },
      {
        gameMode: "practice",
        challenge: "normal",
        id: 67890,
        guesses: null,
        time: null,
      },
      {
        gameMode: "practice",
        challenge: "sequence",
        id: 33333,
        guesses: null,
        time: null,
      },
      {
        gameMode: "practice",
        challenge: "jumble",
        id: 22222,
        guesses: null,
        time: null,
      },
      {
        gameMode: "practice",
        challenge: "perfect",
        id: 11111,
        guesses: null,
        time: null,
      },
    ];
    const expect2 = [...test2];
    // Shuffle the list
    for (let i = 0; i < 1000; i++) {
      const a = Math.floor(Math.random() * test2.length);
      const b = Math.floor(Math.random() * test2.length);
      const tmp = test2[a];
      test2[a] = test2[b];
      test2[b] = tmp;
    }
    expect(normalizeHistory(test2)).toEqual(expect2);
  });
  test("addHistoryEntry", () => {
    const history1: HistoryEntry[] = [
      {
        gameMode: "daily",
        id: 1,
        challenge: "normal",
        guesses: null,
        time: null,
      },
    ];
    const entry1: HistoryEntry = {
      gameMode: "daily",
      id: 2,
      challenge: "normal",
      guesses: null,
      time: null,
    };
    const expect1: HistoryEntry[] = [
      {
        gameMode: "daily",
        id: 1,
        challenge: "normal",
        guesses: null,
        time: null,
      },
      {
        gameMode: "daily",
        id: 2,
        challenge: "normal",
        guesses: null,
        time: null,
      },
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
    expect(store.getState().storage).toEqual({
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
      lastUpdated: "1970-01-01",
    });
  });
});
