import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { pendingAchievements, type Achievement } from "./achievements";
import { MISSIONS, SHOP_PRICE, blankDuty, todayDuty, type Duty } from "./duty";
import { pullMany } from "./gacha";
import { DUP_ORBS, LEVEL_CAP, levelCost } from "./roster";
import { FIGHTER } from "./roster";
import type { Owned, Rarity } from "./types";

export type Team = [string | null, string | null, string | null];

export type PullCard = {
  id: string;
  rarity: Rarity;
  isNew: boolean;
  starUp: boolean;
  orbs: number;
};

export type SaveData = {
  crystals: number;
  orbs: number;
  owned: Record<string, Owned>;
  team: Team;
  cleared: string[];
  pity: number;
  pulls: number;
  daily: string;
  introSeen: boolean;
  sfx: boolean;
  shake: boolean;
  speed: 1 | 2;
  wins: number;
  claimed: string[];
  duty: Duty;
  bossDay: string;
};

type Actions = {
  summon: (count: 1 | 10, banner?: boolean) => PullCard[] | null;
  freeDaily: () => PullCard[] | null;
  buyCard: (id: string) => PullCard | null;
  claimMission: (id: string) => boolean;
  setSlot: (index: number, id: string | null) => void;
  levelUp: (id: string) => boolean;
  grantVictory: (payload: { chapterId: string | null; crystals: number; orbs: number; grant?: string }) => void;
  seeIntro: () => void;
  toggleSfx: () => void;
  toggleShake: () => void;
  setSpeed: (speed: 1 | 2) => void;
  syncAchievements: () => Achievement[];
  reset: () => void;
};

export type GameStore = SaveData & Actions;

export function localDay(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function fresh(): SaveData {
  return {
    crystals: 1500,
    orbs: 24,
    owned: {
      lira: { level: 1, stars: 1 },
      mira: { level: 1, stars: 1 },
    },
    team: ["lira", "mira", null],
    cleared: [],
    pity: 0,
    pulls: 0,
    daily: "",
    introSeen: false,
    sfx: true,
    shake: true,
    speed: 1,
    wins: 0,
    claimed: [],
    duty: blankDuty(),
    bossDay: "",
  };
}

function withAchievements(save: SaveData): { save: SaveData; earned: Achievement[] } {
  const earned = pendingAchievements(save, save.claimed);
  if (!earned.length) return { save, earned };
  return {
    earned,
    save: {
      ...save,
      claimed: [...save.claimed, ...earned.map((item) => item.id)],
      crystals: save.crystals + earned.reduce((sum, item) => sum + item.reward, 0),
    },
  };
}
function place(team: Team, id: string): Team {
  if (team.includes(id)) return team;
  const index = team.findIndex((slot) => !slot);
  if (index < 0) return team;
  const next = [...team] as Team;
  next[index] = id;
  return next;
}

function applyPulls(state: SaveData, ids: string[], pity: number, spent: number, countPulls = true): { save: SaveData; cards: PullCard[] } {
  let owned = { ...state.owned };
  let team = state.team;
  let orbs = state.orbs;
  const cards: PullCard[] = [];
  for (const id of ids) {
    const fighter = FIGHTER[id];
    const have = owned[id];
    if (!have) {
      owned = { ...owned, [id]: { level: 1, stars: 1 } };
      team = place(team, id);
      cards.push({ id, rarity: fighter.rarity, isNew: true, starUp: false, orbs: 0 });
      continue;
    }
    const starUp = have.stars < 5;
    const gain = Math.round(DUP_ORBS[fighter.rarity] * (starUp ? 1 : 1.5));
    owned = { ...owned, [id]: { level: have.level, stars: starUp ? have.stars + 1 : 5 } };
    orbs += gain;
    cards.push({ id, rarity: fighter.rarity, isNew: false, starUp, orbs: gain });
  }
  return {
    cards,
    save: {
      ...state,
      crystals: state.crystals - spent,
      orbs,
      owned,
      team,
      pity,
      pulls: state.pulls + (countPulls ? ids.length : 0),
    },
  };
}

const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      ...fresh(),
      summon: (count, banner = false) => {
        const spent = count === 10 ? 900 : 100;
        const state = get();
        if (state.crystals < spent) return null;
        const rolled = pullMany(count, state.pity, Math.random, banner);
        const applied = applyPulls(state, rolled.ids, rolled.pity, spent);
        set({ ...applied.save, duty: { ...todayDuty(applied.save.duty, localDay()), pulls: todayDuty(applied.save.duty, localDay()).pulls + 1 } });
        return applied.cards;
      },
      freeDaily: () => {
        const state = get();
        const today = localDay();
        if (state.daily === today) return null;
        const rolled = pullMany(1, state.pity);
        const applied = applyPulls({ ...state, daily: today }, rolled.ids, rolled.pity, 0);
        const duty = todayDuty(applied.save.duty, today);
        set({ ...applied.save, daily: today, duty: { ...duty, pulls: duty.pulls + 1 } });
        return applied.cards;
      },
      buyCard: (id) => {
        const fighter = FIGHTER[id];
        if (!fighter || (fighter.rarity !== "R" && fighter.rarity !== "SR")) return null;
        const price = SHOP_PRICE[fighter.rarity];
        const state = get();
        if (state.crystals < price) return null;
        const applied = applyPulls(state, [id], state.pity, price, false);
        set(applied.save);
        return applied.cards[0] ?? null;
      },
      claimMission: (id) => {
        const mission = MISSIONS.find((item) => item.id === id);
        if (!mission) return false;
        const state = get();
        const duty = todayDuty(state.duty, localDay());
        if (duty.claimed.includes(id) || duty[mission.key] < mission.goal) return false;
        set({
          duty: { ...duty, claimed: [...duty.claimed, id] },
          crystals: state.crystals + mission.crystals,
          orbs: state.orbs + mission.orbs,
        });
        return true;
      },
      setSlot: (index, id) =>
        set((state) => {
          if (id && !state.owned[id]) return {};
          const team = [...state.team] as Team;
          if (id) {
            const other = team.findIndex((slot) => slot === id);
            if (other >= 0 && other !== index) team[other] = team[index];
          }
          team[index] = id;
          return { team };
        }),
      levelUp: (id) => {
        const state = get();
        const owned = state.owned[id];
        if (!owned || owned.level >= LEVEL_CAP) return false;
        const cost = levelCost(owned.level);
        if (state.orbs < cost) return false;
        const duty = todayDuty(state.duty, localDay());
        set({
          orbs: state.orbs - cost,
          owned: { ...state.owned, [id]: { ...owned, level: owned.level + 1 } },
          duty: { ...duty, levels: duty.levels + 1 },
        });
        return true;
      },
      grantVictory: (payload) =>
        set((state) => {
          let owned = state.owned;
          let team = state.team;
          let orbs = state.orbs + payload.orbs;
          if (payload.grant && !owned[payload.grant]) {
            owned = { ...owned, [payload.grant]: { level: 1, stars: 1 } };
            team = place(team, payload.grant);
          } else if (payload.grant) {
            orbs += 40;
          }
          const storyId = payload.chapterId && payload.chapterId !== "pozo" ? payload.chapterId : null;
          const cleared = storyId && !state.cleared.includes(storyId) ? [...state.cleared, storyId] : state.cleared;
          const duty = todayDuty(state.duty, localDay());
          return {
            crystals: state.crystals + payload.crystals,
            orbs,
            owned,
            team,
            cleared,
            wins: state.wins + 1,
            duty: { ...duty, wins: duty.wins + 1 },
            bossDay: payload.chapterId === "pozo" ? localDay() : state.bossDay,
          };
        }),
      seeIntro: () => set({ introSeen: true }),
      toggleSfx: () => set((state) => ({ sfx: !state.sfx })),
      toggleShake: () => set((state) => ({ shake: !state.shake })),
      setSpeed: (speed) => set({ speed }),
      syncAchievements: () => {
        const state = get();
        const next = withAchievements({
          crystals: state.crystals,
          orbs: state.orbs,
          owned: state.owned,
          team: state.team,
          cleared: state.cleared,
          pity: state.pity,
          pulls: state.pulls,
          daily: state.daily,
          introSeen: state.introSeen,
          sfx: state.sfx,
          shake: state.shake,
          speed: state.speed,
          wins: state.wins,
          claimed: state.claimed,
          duty: state.duty,
          bossDay: state.bossDay,
        });
        if (!next.earned.length) return [];
        set({ claimed: next.save.claimed, crystals: next.save.crystals });
        return next.earned;
      },
      reset: () => set(fresh()),
    }),
    {
      name: "pacto-astra-v1",
      version: 3,
      skipHydration: true,
      storage: createJSONStorage(() => (typeof window === "undefined" ? memoryStorage : localStorage)),
      migrate: (persisted, version) => {
        const data = persisted as SaveData;
        const withWins = version < 2 ? { ...data, wins: data.wins ?? data.cleared?.length ?? 0, claimed: data.claimed ?? [] } : data;
        if (version < 3) {
          return { ...withWins, duty: withWins.duty ?? blankDuty(), bossDay: withWins.bossDay ?? "", introSeen: false };
        }
        return withWins;
      },
      partialize: (state) => ({
        crystals: state.crystals,
        orbs: state.orbs,
        owned: state.owned,
        team: state.team,
        cleared: state.cleared,
        pity: state.pity,
        pulls: state.pulls,
        daily: state.daily,
        introSeen: state.introSeen,
        sfx: state.sfx,
        shake: state.shake,
        speed: state.speed,
        wins: state.wins,
        claimed: state.claimed,
        duty: state.duty,
        bossDay: state.bossDay,
      }),
      onRehydrateStorage: () => () => {
        const state = useGame.getState();
        const team = ([0, 1, 2] as const).map((index) => {
          const id = state.team[index];
          return id && state.owned[id] ? id : null;
        }) as Team;
        useGame.setState({ team });
      },
    },
  ),
);
