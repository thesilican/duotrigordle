import { SyncedStatsEntry } from "../../store";
import { stringifyHistory } from "./Stats";

describe("stats editor", () => {
  test("stringify history", () => {
    const test1: SyncedStatsEntry[] = [
      {
        gameMode: "daily",
        id: 1,
        challenge: "normal",
        guesses: 32,
        time: 1000,
        synced: false,
      },
      {
        gameMode: "daily",
        id: 2,
        challenge: "sequence",
        guesses: 37,
        time: 60000,
        synced: false,
      },
      {
        gameMode: "daily",
        id: 3,
        challenge: "jumble",
        guesses: null,
        time: null,
        synced: false,
      },
      {
        gameMode: "practice",
        id: 12345,
        challenge: "normal",
        guesses: 32,
        time: null,
        synced: false,
      },
      {
        gameMode: "practice",
        id: 34567,
        challenge: "sequence",
        guesses: 32,
        time: null,
        synced: false,
      },
      {
        gameMode: "practice",
        id: 12345,
        challenge: "jumble",
        guesses: 32,
        time: null,
        synced: false,
      },
      {
        gameMode: "practice",
        id: 23456,
        challenge: "perfect",
        guesses: 32,
        time: null,
        synced: false,
      },
    ];
    const expect1 =
      "Game Mode,Challenge,Id,Guesses,Time (ms)\n" +
      "daily,normal,1,32,1000\n" +
      "daily,sequence,2,37,60000\n" +
      "daily,jumble,3,,\n" +
      "practice,normal,12345,32,\n" +
      "practice,sequence,34567,32,\n" +
      "practice,jumble,12345,32,\n" +
      "practice,perfect,23456,32,";
    expect(stringifyHistory(test1)).toEqual(expect1);
  });
});
