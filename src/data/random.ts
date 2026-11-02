/** Small seeded PRNG (mulberry32) so a puzzle code always rebuilds the same puzzle. */
export type Rng = {
  next: () => number
  int: (min: number, max: number) => number
  pick: <T>(items: readonly T[]) => T
  weighted: <T>(items: readonly (readonly [T, number])[]) => T
  chance: (p: number) => boolean
}

export function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function createRng(seed: number | string): Rng {
  let a = (typeof seed === 'string' ? hashString(seed) : seed) >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1))
  return {
    next,
    int,
    pick: (items) => items[Math.floor(next() * items.length)],
    weighted: (items) => {
      const total = items.reduce((s, [, w]) => s + w, 0)
      let r = next() * total
      for (const [v, w] of items) {
        r -= w
        if (r < 0) return v
      }
      return items[items.length - 1][0]
    },
    chance: (p) => next() < p,
  }
}

/** 6-digit puzzle seed for puzzle k of a round. */
export function puzzleSeed(roundSeed: number, k: number): number {
  return 100000 + (hashString(`${roundSeed}:${k}`) % 900000)
}

export function randomRoundSeed(): number {
  return Math.floor(Math.random() * 2 ** 31)
}
