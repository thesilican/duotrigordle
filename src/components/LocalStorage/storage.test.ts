import { PRACTICE_MODE_MAX_ID, PRACTICE_MODE_MIN_ID } from "../../store";
import { STATS_PARSER, STORAGE_PARSER } from "./storage";

describe("serialization", () => {
  test("game serialization", () => {
    // Normal
    expect(
      STORAGE_PARSER.parseGameSave({
        id: 123,
        guesses: ["HAPPY", "FLAME"],
        startTime: 123,
        endTime: null,
        pauseTime: 789,
        extraField: 123,
      })
    ).toEqual({
      id: 123,
      guesses: ["HAPPY", "FLAME"],
      startTime: 123,
      endTime: null,
      pauseTime: 789,
    });
    // Empty
    expect(STORAGE_PARSER.parseGameSave(null)).toBeNull();
    expect(STORAGE_PARSER.parseGameSave({ id: 1 })).toBeNull();
  });
  test("stats serialization", () => {
    // Empty
    expect(STATS_PARSER.parseEntry({})).toEqual(null);
    // Normal
    expect(
      STATS_PARSER.parseEntry({
        gameMode: "daily",
        challenge: "normal",
        id: 1,
        guesses: 32,
        time: 1234,
      })
    ).toEqual({
      gameMode: "daily",
      challenge: "normal",
      id: 1,
      guesses: 32,
      time: 1234,
      synced: false,
    });
    // Missing gamemode and challenge
    expect(
      STATS_PARSER.parseEntry({
        id: 1,
        guesses: 32,
        time: 1234,
      })
    ).toEqual({
      gameMode: "daily",
      challenge: "normal",
      id: 1,
      guesses: 32,
      time: 1234,
      synced: false,
    });
    // Missing practice id
    for (let i = 0; i < 1000; i++) {
      const id = STATS_PARSER.parseEntry({
        gameMode: "practice",
        challenge: "normal",
        guesses: null,
        time: null,
      })?.id;
      expect(id).toBeLessThan(PRACTICE_MODE_MAX_ID);
      expect(id).toBeGreaterThanOrEqual(PRACTICE_MODE_MIN_ID);
    }
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
      account: null,
      prevUserId: null,
    };
    expect(STORAGE_PARSER.parse(test1)).toEqual(expect1);
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
      account: null,
      prevUserId: null,
    };
    expect(STORAGE_PARSER.parse(test2)).toEqual(expect2);
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
          pauseTime: null,
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
          pauseTime: null,
        },
      },
      lastUpdated: "2023-03-03",
      account: null,
      prevUserId: null,
    };
    expect(STORAGE_PARSER.parse(test3)).toEqual(expect3);
  });
});
