import { parseGameSave, parseSaves, parseStats } from "./storage";

describe("serialization", () => {
  test("game serialization", () => {
    expect(parseGameSave(null)).toBeNull();
    expect(parseGameSave({ id: 1 })).toBeNull();
    expect(
      parseGameSave({
        id: 123,
        guesses: ["HAPPY", "FLAME"],
        startTime: 123,
        endTime: 456,
        extraField: 123,
      })
    ).toEqual({
      id: 123,
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
    expect(parseStats(test1)).toEqual(expect1);
    const test2 = {
      history: [null, 123, {}],
    };
    const expect2 = {
      history: [],
    };
    expect(parseStats(test2)).toEqual(expect2);
  });
  test("saves serialization", () => {
    const test1 = {};
    const expect1 = {
      daily: {
        normal: null,
        sequence: null,
        jumble: null,
      },
      lastUpdated: "1970-01-01",
    };
    expect(parseSaves(test1)).toEqual(expect1);
    const test2 = {
      daily: {
        normal: null,
        sequence: 2,
      },
      lastUpdated: 0,
    };
    const expect2 = {
      daily: {
        normal: null,
        sequence: null,
        jumble: null,
      },
      lastUpdated: "1970-01-01",
    };
    expect(parseSaves(test2)).toEqual(expect2);
    const test3 = {
      daily: {
        normal: {
          id: 1,
          guesses: [],
        },
        sequence: {
          id: "1",
          guesses: ["HELLO"],
          startTime: 0,
          endTime: 100,
        },
        jumble: {
          id: 2,
          guesses: ["HELLO", "WORLD", "THERE"],
          startTime: 12345,
          endTime: 67890,
        },
      },
      lastUpdated: "2023-03-03",
    };
    const expect3 = {
      daily: {
        normal: null,
        sequence: null,
        jumble: {
          id: 2,
          guesses: ["HELLO", "WORLD", "THERE"],
          startTime: 12345,
          endTime: 67890,
        },
      },
      lastUpdated: "2023-03-03",
    };
    expect(parseSaves(test3)).toEqual(expect3);
  });
});
