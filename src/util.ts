export function range(min: number, max?: number): number[] {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  const array = [];
  for (let i = min; i < max; i++) {
    array.push(i);
  }
  return array;
}

// Simple seeded RNG, adapted from https://stackoverflow.com/a/4guess7593316/7937009
export function mulberry32(seed: number) {
  let t = Math.abs(Math.floor(seed)) + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  };
}
