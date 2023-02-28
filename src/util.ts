// Generate integers 0 <= i < max
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

// Simple seeded RNG
// https://gist.github.com/miyaokamarina/0a8660363095bb5b5d5d7677ed5be9b0
export function MersenneTwister(seed: number) {
  const next = (mt: Uint32Array, i: number, j: number, k: number) => {
    j = (mt[i] & 0x80000000) | (mt[j] & 0x7fffffff);
    mt[i] = mt[k] ^ (j >>> 1) ^ (-(j & 0x1) & 0x9908b0df);
  };
  const twist = (mt: Uint32Array) => {
    let i = 0;
    while (i < 227) next(mt, i++, i, i + 396);
    while (i < 623) next(mt, i++, i, i - 228);
    next(mt, 623, 0, 396);
  };
  let i = 1;
  const mt = new Uint32Array(624);
  mt[0] = seed;
  while (i < 624) {
    seed = mt[i - 1] ^ (mt[i - 1] >>> 30);
    mt[i] =
      (((seed >>> 16) * 1812433253) << 16) + (seed & 0xffff) * 1812433253 + i++;
  }
  const u32 = () => {
    if (i >= 624) {
      twist(mt);
      i = 0;
    }
    let y = mt[i++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  };
  const f32_ii = () => u32() / 0x0_ffff_ffff;
  const f32_ix = () => u32() / 0x1_0000_0000;
  const f32_xx = () => (u32() + 0.5) / 0x1_0000_0000;
  const u53 = () => (u32() >>> 5) * 67108864 + (u32() >>> 6);
  const f64_ix = () => u53() / 0x20_0000_0000_0000;
  const save = () => {
    const dump = new Uint32Array(625);
    dump[0] = i;
    dump.set(mt, 1);
    return dump;
  };
  return { u32, f32_ii, f32_ix, f32_xx, u53, f64_ix, save };
}

const rng = MersenneTwister(Date.now());
export function randU32() {
  return rng.u32();
}

// Format time elapsed in 00:00.00 format
export function formatTimeElapsed(miliseconds: number) {
  miliseconds = Math.max(miliseconds, 0);
  const minutes = Math.floor(miliseconds / 1000 / 60);
  const seconds = Math.floor(miliseconds / 1000) % 60;
  const hundreds = Math.floor(miliseconds / 10) % 100;
  return (
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0") +
    "." +
    hundreds.toString().padStart(2, "0")
  );
}

// Parse time elapsed in 00:00.00 format
export function parseTimeElapsed(text: string): number | null {
  const match = text.match(/^(?:(\d+):)?(\d+(?:\.\d+)?)$/);
  if (!match) {
    return null;
  }
  const min = parseFloat(match[1] ?? 0);
  const sec = parseFloat(match[2]);
  const time = (min * 60 + sec) * 1000;
  if (isNaN(time)) {
    return null;
  }
  return time;
}
