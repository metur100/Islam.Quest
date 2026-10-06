/** Small deterministic PRNG (mulberry32) so daily content is the same all day. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Shuffles so the result never equals the original order (when that is possible),
 * otherwise ordering puzzles could start already solved.
 */
export function shuffleNotIdentity<T>(items: readonly T[], random: () => number = Math.random): T[] {
  if (items.length < 2) return [...items];
  for (let attempt = 0; attempt < 10; attempt++) {
    const out = shuffle(items, random);
    if (out.some((item, i) => item !== items[i])) return out;
  }
  const out = [...items];
  [out[0], out[1]] = [out[1], out[0]];
  return out;
}
