import { getGuessColors, getJumbleWords, getTargetWords } from "../funcs";

describe("funcs", () => {
  test("getJumbleWords", () => {
    const targets = getTargetWords(12);
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
