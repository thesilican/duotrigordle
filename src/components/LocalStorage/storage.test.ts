import { parseGameSave, parseStats } from "./storage";

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
});
