import { useGame, type SaveData } from "./store";

const KEY = "pacto-astra-slots";
export const SLOT_COUNT = 3;

export type SlotFile = {
  savedAt: string;
  data: SaveData;
};

function pack(): SaveData {
  const state = useGame.getState();
  return {
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
    rite: state.rite,
    xp: state.xp ?? 0,
  };
}

function readAll(): (SlotFile | null)[] {
  const empty = Array.from({ length: SLOT_COUNT }, () => null as SlotFile | null);
  if (typeof window === "undefined") return empty;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return empty;
    return empty.map((slot, index) => {
      const item = parsed[index] as SlotFile | null | undefined;
      if (!item || typeof item.savedAt !== "string" || !item.data || typeof item.data !== "object") return slot;
      return item;
    });
  } catch {
    return empty;
  }
}

export function listSlots() {
  return readAll();
}

export function saveSlot(index: number) {
  if (index < 0 || index >= SLOT_COUNT) return false;
  const slots = readAll();
  slots[index] = { savedAt: new Date().toISOString(), data: pack() };
  window.localStorage.setItem(KEY, JSON.stringify(slots));
  return true;
}

export function loadSlot(index: number) {
  const slot = readAll()[index];
  if (!slot) return false;
  const data = slot.data;
  if (!data.owned || !Array.isArray(data.team) || data.team.length !== 3) return false;
  useGame.getState().replaceSave({
    ...data,
    xp: data.xp ?? 0,
    rite: data.rite ?? 3,
    duty: data.duty,
    claimed: data.claimed ?? [],
    wins: data.wins ?? 0,
    bossDay: data.bossDay ?? "",
  });
  return true;
}
