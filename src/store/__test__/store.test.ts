import { getGuessColors, getJumbleWords, getTargetWords } from "../funcs";
import "../index";
import {
  addHistoryEntry,
  HistoryEntry,
  normalizeHistory,
} from "../slice/stats";
import { assertGameSerialized, assertStatsSerialized } from "../storage";

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

describe("storage", () => {
  test("game serialization", () => {
    expect(assertGameSerialized(null)).toBeNull();
    expect(
      assertGameSerialized({
        id: 123,
        challenge: "idk",
        guesses: [],
        startTime: 0,
        endTime: 0,
      })
    ).toBeNull();
    expect(
      assertGameSerialized({
        id: 123,
        challenge: "normal",
        guesses: ["HAPPY", "FLAME"],
        startTime: 123,
        endTime: 456,
        extraField: 123,
      })
    ).toEqual({
      id: 123,
      challenge: "normal",
      guesses: ["HAPPY", "FLAME"],
      startTime: 123,
      endTime: 456,
    });
  });
  test("stats serialization", () => {
    const test1 = {
      history: [
        { id: 1, guesses: 32, time: 1234, challenge: "normal" },
        { id: 4, guesses: 33, time: 2345, challenge: "sequence" },
        { id: 4, time: 2345, challenge: "normal" },
        { id: 3, guesses: null, challenge: "sequence" },
        { id: 2, guesses: 34, time: 2345, challenge: "jumble" },
        { id: 2, guesses: 37, time: 2345 },
      ],
    };
    const expect1 = {
      history: [
        { id: 1, guesses: 32, time: 1234, challenge: "normal" },
        { id: 4, guesses: 33, time: 2345, challenge: "sequence" },
        { id: 4, guesses: null, time: 2345, challenge: "normal" },
        { id: 3, guesses: null, time: null, challenge: "sequence" },
        { id: 2, guesses: 34, time: 2345, challenge: "jumble" },
        { id: 2, guesses: 37, time: 2345, challenge: "normal" },
      ],
    };
    expect(assertStatsSerialized(test1)).toEqual(expect1);
    const test2 = {
      history: [null, 123, {}],
    };
    const expect2 = {
      history: [],
    };
    expect(assertStatsSerialized(test2)).toEqual(expect2);
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
