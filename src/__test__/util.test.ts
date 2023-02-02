import { describe, expect, it } from "vitest";
import {
  formatTimeElapsed,
  MersenneTwister,
  parseTimeElapsed,
  range,
} from "../util";

describe("MersenneTwister", () => {
  it("should be stable", () => {
    for (let i = 0; i < 100000; i += 123) {
      const rng1 = MersenneTwister(i);
      const rng2 = MersenneTwister(i);
      for (let i = 0; i < 100; i++) {
        expect(rng1.u32()).toEqual(rng2.u32());
      }
    }
  });
});

describe("range", () => {
  it("should work properly", () => {
    expect(range(0)).toEqual([]);
    expect(range(1)).toEqual([0]);
    expect(range(10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

describe("format time", () => {
  it("should format properly", () => {
    expect(formatTimeElapsed(0)).toEqual("00:00.00");
    expect(formatTimeElapsed(1234)).toEqual("00:01.23");
    expect(formatTimeElapsed(754567)).toEqual("12:34.56");
    expect(formatTimeElapsed(1111111111)).toEqual("18518:31.11");
  });
});

describe("parseTimeElapsed", () => {
  it("should parse properly", () => {
    expect(parseTimeElapsed("1:23.45")).toEqual(83450);
    expect(parseTimeElapsed("83.45")).toEqual(83450);
    expect(parseTimeElapsed("01:00")).toEqual(60000);
    expect(parseTimeElapsed("123:00")).toEqual(7380000);
    expect(parseTimeElapsed("")).toEqual(null);
    expect(parseTimeElapsed("blah")).toEqual(null);
  });
});
