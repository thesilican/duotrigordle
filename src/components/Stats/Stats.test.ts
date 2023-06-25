import { HistoryEntry } from "../../store";
import { stringifyHistory } from "./Stats";

describe("stats editor", () => {
  test("stringify history", () => {
    const test1: HistoryEntry[] = [
      {
        gameMode: "daily",
        id: 1,
        challenge: "normal",
        guesses: 32,
        time: 1000,
      },
      {
        gameMode: "daily",
        id: 2,
        challenge: "sequence",
        guesses: 37,
        time: 60000,
      },
      {
        gameMode: "daily",
        id: 3,
        challenge: "jumble",
        guesses: null,
        time: null,
      },
      {
        gameMode: "practice",
        id: 12345,
        challenge: "normal",
        guesses: 32,
        time: null,
      },
      {
        gameMode: "practice",
        id: 34567,
        challenge: "sequence",
        guesses: 32,
        time: null,
      },
      {
        gameMode: "practice",
        id: 12345,
        challenge: "jumble",
        guesses: 32,
        time: null,
      },
      {
        gameMode: "practice",
        id: 23456,
        challenge: "perfect",
        guesses: 32,
        time: null,
      },
    ];
    const expect1 =
      "1 N 32 00:01.00\n2 S 37 01:00.00\n3 J X -\nP N 32 -\nP S 32 -\nP J 32 -\nP P 32 -";
    expect(stringifyHistory(test1)).toEqual(expect1);
  });
});
