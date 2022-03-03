// Similar to python range()
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

// https://gist.github.com/miyaokamarina/0a8660363095bb5b5d5d7677ed5be9b0
const next = (mt: Uint32Array, i: number, j: number, k: number) => {
  j = (mt[i]! & 0x80000000) | (mt[j]! & 0x7fffffff);
  mt[i] = mt[k]! ^ (j >>> 1) ^ (-(j & 0x1) & 0x9908b0df);
};
const twist = (mt: Uint32Array) => {
  let i = 0;
  while (i < 227) next(mt, i++, i, i + 396);
  while (i < 623) next(mt, i++, i, i - 228);
  next(mt, 623, 0, 396);
};
export const MersenneTwister = (seed = Date.now() as number | Uint32Array) => {
  let i = 1;
  let mt = new Uint32Array(624);
  const u32 = () => {
    if (i >= 624) {
      twist(mt);
      i = 0;
    }
    let y = mt[i++]!;
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
    let dump = new Uint32Array(625);
    dump[0] = i;
    dump.set(mt, 1);
    return dump;
  };
  if (typeof seed === "number") {
    mt[0] = seed;
    while (i < 624) {
      seed = mt[i - 1]! ^ (mt[i - 1]! >>> 30);
      mt[i] =
        (((seed >>> 16) * 1812433253) << 16) +
        (seed & 0xffff) * 1812433253 +
        i++;
    }
  } else {
    i = seed[0]!;
    mt.set(seed.slice(1));
  }
  return { u32, f32_ii, f32_ix, f32_xx, u53, f64_ix, save };
};
