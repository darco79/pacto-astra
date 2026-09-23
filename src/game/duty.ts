export type Duty = {
  day: string;
  wins: number;
  pulls: number;
  levels: number;
  claimed: string[];
};

export type Mission = {
  id: string;
  title: string;
  detail: string;
  crystals: number;
  orbs: number;
  goal: number;
  key: "wins" | "pulls" | "levels";
};

export const MISSIONS: Mission[] = [
  { id: "win", title: "Un asalto", detail: "Gana un combate.", crystals: 40, orbs: 8, goal: 1, key: "wins" },
  { id: "pull", title: "Un llamado", detail: "Invoca una vez, en el cristal libre o en el banner.", crystals: 30, orbs: 0, goal: 1, key: "pulls" },
  { id: "level", title: "Un grado", detail: "Sube un nivel en el dojo.", crystals: 0, orbs: 12, goal: 1, key: "levels" },
];

export function blankDuty(day = ""): Duty {
  return { day, wins: 0, pulls: 0, levels: 0, claimed: [] };
}

export function todayDuty(duty: Duty, day: string): Duty {
  if (duty.day === day) return duty;
  return blankDuty(day);
}

export const SHOP_PRICE = { R: 200, SR: 480 } as const;

export const FEATURED_ID = "ione";
