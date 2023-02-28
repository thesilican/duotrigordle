import { HistoryEntry } from "../../store";
import { stringifyHistory, parseHistory } from "./Stats";

describe("stats editor", () => {
  test("stringify history", () => {
    const test1: HistoryEntry[] = [
      { id: 1, challenge: "normal", guesses: 32, time: 1000 },
      { id: 2, challenge: "sequence", guesses: 37, time: 60000 },
      { id: 3, challenge: "jumble", guesses: null, time: 12345 },
    ];
    const expect1 = "1 N 32 00:01.00\n2 S 37 01:00.00\n3 J X 00:12.34";
    expect(stringifyHistory(test1)).toEqual(expect1);
  });
  test("parse history", () => {
    const test1 = `
      1 J X 00:01.00
      12 N 33 00:02.00
      123 S 34 -
      1234 N 35 00:12.34
    `;
    const expect1 = [
      {
        challenge: "jumble",
        guesses: null,
        id: 1,
        time: 1000,
      },
      {
        challenge: "normal",
        guesses: 33,
        id: 12,
        time: 2000,
      },
      {
        challenge: "sequence",
        guesses: 34,
        id: 123,
        time: null,
      },
      {
        challenge: "normal",
        guesses: 35,
        id: 1234,
        time: 12340,
      },
    ];
    expect(parseHistory(test1)).toEqual(expect1);

    const test2 = `blah`;
    expect(parseHistory(test2)).toContain("invalid syntax");

    const test3 = `1 X 32 01:00.00`;
    expect(parseHistory(test3)).toContain("invalid challenge");

    const test4 = `0 X 32 01:00.00`;
    expect(parseHistory(test4)).toContain("invalid id");

    const test5 = `100000000000 N 32 01:00.00`;
    expect(parseHistory(test5)).toContain("invalid id");

    const test6 = `1 N 32 01:00.00\n1 N 33 02:00.00`;
    expect(parseHistory(test6)).toContain("duplicate");

    const test7 = `1 N 31 01:00.00`;
    expect(parseHistory(test7)).toContain("invalid guess count");

    const test8 = `1 N 32 0:00`;
    expect(parseHistory(test8)).toContain("non-zero");

    const test9 = `1 N 33 -10:.-`;
    expect(parseHistory(test9)).toContain("invalid time format");
  });
});
