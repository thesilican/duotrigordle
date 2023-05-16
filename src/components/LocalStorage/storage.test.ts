import { HistoryEntry, StatsState } from "../../store";
import { parseGameSave, parseStorage, parseStats } from "./storage";

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
        // Valid
        {
          gameMode: "daily",
          challenge: "normal",
          id: 1,
          guesses: 37,
          time: 1234,
        },
        { gameMode: "practice", challenge: "perfect", guesses: 37, time: 1234 },
        // Implicit
        { id: 2, guesses: 37 },
        { id: 3, guesses: 37, time: null },
        { id: 4, guesses: 37, time: 1234 },
        { challenge: "sequence", id: 5, guesses: 37, time: 1234 },
      ],
    };
    const expect1: StatsState = {
      history: [
        {
          gameMode: "daily",
          challenge: "normal",
          id: 1,
          guesses: 37,
          time: 1234,
        },
        { gameMode: "practice", challenge: "perfect", guesses: 37, time: 1234 },
        {
          gameMode: "daily",
          challenge: "normal",
          id: 2,
          guesses: 37,
          time: null,
        },
        {
          gameMode: "daily",
          challenge: "normal",
          id: 3,
          guesses: 37,
          time: null,
        },
        {
          gameMode: "daily",
          challenge: "normal",
          id: 4,
          guesses: 37,
          time: 1234,
        },
        {
          gameMode: "daily",
          challenge: "sequence",
          id: 5,
          guesses: 37,
          time: 1234,
        },
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
  test("storage serialization", () => {
    const test1 = {};
    const expect1 = {
      daily: {
        normal: null,
        sequence: null,
        jumble: null,
      },
      lastUpdated: "1970-01-01",
    };
    expect(parseStorage(test1)).toEqual(expect1);
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
    expect(parseStorage(test2)).toEqual(expect2);
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
    expect(parseStorage(test3)).toEqual(expect3);
  });
});
