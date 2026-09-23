export type Rarity = "R" | "SR" | "SSR" | "UR";
export type Element = "fuego" | "acero" | "rayo" | "salvaje" | "gravedad" | "tiempo";
export type Role =
  | "soporte"
  | "asalto"
  | "luchadora"
  | "guardiana"
  | "asesina"
  | "control"
  | "berserker";

export type SkillKind = "basic" | "skill" | "ult";
export type ChoiceMod = "ki" | "study" | "surge";

export type Effect =
  | {
      op: "damage";
      target: "enemy" | "enemies";
      mult: number;
      hits?: number;
      bonusIfBurn?: number;
      stunIfBelow?: number;
      kiOnKill?: number;
    }
  | { op: "heal"; target: "allies" | "low-ally" | "self"; pct: number }
  | { op: "shield"; target: "allies" | "self"; pct: number }
  | { op: "burn"; target: "enemy" | "enemies"; turns: number; pct: number }
  | { op: "stun"; target: "enemy" | "enemies" }
  | { op: "atk"; target: "self" | "enemies" | "enemy"; pct: number; turns: number }
  | { op: "def"; target: "enemies" | "self"; pct: number; turns: number }
  | { op: "self-hp"; pct: number }
  | { op: "cleanse" }
  | { op: "ki"; target: "self" | "best-ally"; amount: number };

export type SkillDef = {
  kind: SkillKind;
  name: string;
  blurb: string;
  cost: number;
  kiGain: number;
  effects: Effect[];
};

export type Kit = {
  basic: SkillDef;
  skill: SkillDef;
  ult?: SkillDef;
};

export type Fighter = {
  id: string;
  name: string;
  title: string;
  lore: string;
  rarity: Rarity;
  element: Element;
  role: Role;
  weight: number;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number;
  skills: { basic: SkillDef; skill: SkillDef; ult: SkillDef };
};

export type Status = {
  kind: "burn" | "stun" | "atk" | "def";
  turns: number;
  pct: number;
  fresh?: boolean;
};

export type Unit = {
  iid: string;
  ref: string;
  name: string;
  side: "ally" | "enemy";
  element: Element;
  portrait: string;
  hp: number;
  maxHp: number;
  ki: number;
  atk: number;
  def: number;
  spd: number;
  crit: number;
  shield: number;
  statuses: Status[];
  alive: boolean;
  skills: Kit;
  ai: SkillKind[];
};

export type Phase = "pick" | "victory" | "defeat";

export type Ev =
  | { t: "log"; text: string }
  | { t: "dmg"; id: string; amount: number; crit: boolean; blocked: boolean }
  | { t: "heal"; id: string; amount: number }
  | { t: "shake"; power: number }
  | { t: "ko"; id: string };

export type LogLine = { id: number; text: string };

export type BattleState = {
  units: Unit[];
  order: string[];
  round: number;
  phase: Phase;
  actorId: string | null;
  log: LogLine[];
  seq: number;
};

export type Owned = { level: number; stars: number };

export type Spawn = {
  ref: string;
  name?: string;
  portrait?: string;
  hp?: number;
  atk?: number;
  def?: number;
  spd?: number;
};

export type BattleSetup = {
  chapterId: string | null;
  title: string;
  place: string;
  mod: ChoiceMod | null;
  modLabel: string;
  spawns: Spawn[];
  rewards: { crystals: number; orbs: number; grant?: string };
  replay?: { crystals: number; orbs: number };
};
