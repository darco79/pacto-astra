import { FIGHTER, FIGHTERS, PITY_MAX, RANK } from "./roster";
import { FEATURED_ID } from "./duty";
import type { Rarity } from "./types";

export type Roll = { id: string; pity: number };

function weighted(pool: typeof FIGHTERS, rng: () => number) {
  const total = pool.reduce((sum, fighter) => sum + fighter.weight, 0);
  let cursor = rng() * total;
  for (const fighter of pool) {
    cursor -= fighter.weight;
    if (cursor <= 0) return fighter;
  }
  return pool[pool.length - 1] ?? FIGHTERS[0];
}

export function rollOnce(pity: number, rng: () => number, min: Rarity | null): Roll {
  const forceHigh = pity + 1 >= PITY_MAX;
  let pool = FIGHTERS;
  if (forceHigh) pool = FIGHTERS.filter((f) => f.rarity === "SSR" || f.rarity === "UR");
  else if (min) pool = FIGHTERS.filter((f) => RANK[f.rarity] >= RANK[min]);
  const fighter = weighted(pool, rng);
  const high = fighter.rarity === "SSR" || fighter.rarity === "UR";
  return { id: fighter.id, pity: high ? 0 : pity + 1 };
}

export function pullMany(count: number, pityIn: number, rng: () => number = Math.random, banner = false) {
  let pity = pityIn;
  const ids: string[] = [];
  const before: number[] = [];
  for (let i = 0; i < count; i++) {
    before.push(pity);
    const rolled = feature(rollOnce(pity, rng, null), rng, banner);
    ids.push(rolled.id);
    pity = rolled.pity;
  }
  if (count === 10 && !ids.some((id) => RANK[FIGHTER[id].rarity] >= RANK.SR)) {
    const rolled = feature(rollOnce(before[9] ?? pityIn, rng, "SR"), rng, banner);
    ids[9] = rolled.id;
    pity = rolled.pity;
  }
  return { ids, pity };
}

function feature(rolled: Roll, rng: () => number, banner: boolean): Roll {
  if (!banner) return rolled;
  const fighter = FIGHTER[rolled.id];
  if (fighter.rarity === "SSR" && fighter.id !== FEATURED_ID && rng() < 0.5) return { id: FEATURED_ID, pity: 0 };
  return rolled;
}

export function rateRows() {
  const total = FIGHTERS.reduce((sum, fighter) => sum + fighter.weight, 0);
  const bucket: Record<Rarity, number> = { R: 0, SR: 0, SSR: 0, UR: 0 };
  for (const fighter of FIGHTERS) bucket[fighter.rarity] += fighter.weight;
  return (["R", "SR", "SSR", "UR"] as Rarity[]).map((rarity) => ({
    rarity,
    pct: (bucket[rarity] / total) * 100,
  }));
}
