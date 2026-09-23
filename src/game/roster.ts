import type { Element, Fighter, Rarity, Role, SkillDef } from "./types";
import { MORE_FIGHTERS } from "./more-fighters";

export const ROLE_LABEL: Record<Role, string> = {
  soporte: "Soporte",
  asalto: "Asalto",
  luchadora: "Luchadora",
  guardiana: "Guardiana",
  asesina: "Asesina",
  control: "Control",
  berserker: "Berserker",
};

export const ELEMENT_LABEL: Record<Element, string> = {
  fuego: "Fuego",
  acero: "Acero",
  rayo: "Rayo",
  salvaje: "Salvaje",
  gravedad: "Gravedad",
  tiempo: "Tiempo",
};

const BEATS: Partial<Record<Element, Element>> = {
  fuego: "acero",
  acero: "rayo",
  rayo: "salvaje",
  salvaje: "gravedad",
  gravedad: "fuego",
};

export function hasAdvantage(attacker: Element, defender: Element) {
  return BEATS[attacker] === defender;
}

export const RANK: Record<Rarity, number> = { R: 0, SR: 1, SSR: 2, UR: 3 };

export const PITY_MAX = 40;
export const COST_ONE = 100;
export const COST_TEN = 900;
export const LEVEL_CAP = 25;

export function levelCost(level: number) {
  return 10 + level * 8;
}

export function statsOf(f: Pick<Fighter, "hp" | "atk" | "def" | "spd">, p: { level: number; stars: number }) {
  const growth = 1 + (p.level - 1) * 0.075;
  const stars = 1 + (p.stars - 1) * 0.08;
  return {
    hp: Math.round(f.hp * growth * stars),
    atk: Math.round(f.atk * growth * stars),
    def: Math.round(f.def * growth * stars),
    spd: Math.round(f.spd + (p.level - 1) * 0.45 + (p.stars - 1)),
  };
}

function skill(
  kind: SkillDef["kind"],
  name: string,
  blurb: string,
  cost: number,
  effects: SkillDef["effects"],
  kiGain = 0,
): SkillDef {
  return { kind, name, blurb, cost, kiGain, effects };
}

const liraBasic = skill("basic", "Disparo cápsula", "Un pulso medido. Recupera ki.", 0, [
  { op: "damage", target: "enemy", mult: 1 },
], 22);
const liraSkill = skill(
  "skill",
  "Muro de cápsulas",
  "Escudo para toda la escuadra.",
  35,
  [{ op: "shield", target: "allies", pct: 0.18 }],
);
const liraUlt = skill(
  "ult",
  "Radar de pulso",
  "Cura al pacto y debilita el ataque rival.",
  100,
  [
    { op: "heal", target: "allies", pct: 0.16 },
    { op: "atk", target: "enemies", pct: -0.2, turns: 2 },
  ],
);

const miraBasic = skill("basic", "Palma de dojo", "Golpe seco de arte marcial.", 0, [
  { op: "damage", target: "enemy", mult: 1 },
], 22);
const miraSkill = skill(
  "skill",
  "Ráfaga solar",
  "Fuego de ki. Quema durante dos turnos.",
  40,
  [
    { op: "damage", target: "enemy", mult: 1.7 },
    { op: "burn", target: "enemy", turns: 2, pct: 0.05 },
  ],
);
const miraUlt = skill(
  "ult",
  "Puño del hogar",
  "Gran impacto. Más fuerte si el blanco ya arde.",
  100,
  [{ op: "damage", target: "enemy", mult: 2.55, bonusIfBurn: 1.3 }],
);

const veyaBasic = skill("basic", "Patada alta", "El ring es suyo.", 0, [
  { op: "damage", target: "enemy", mult: 1 },
], 22);
const veyaSkill = skill(
  "skill",
  "Justicia aérea",
  "Golpe en vuelo y sube su ataque.",
  40,
  [
    { op: "damage", target: "enemy", mult: 1.6 },
    { op: "atk", target: "self", pct: 0.2, turns: 2 },
  ],
);
const veyaUlt = skill(
  "ult",
  "Sentencia del anillo",
  "Una patada que alcanza a todo el frente enemigo.",
  100,
  [{ op: "damage", target: "enemies", mult: 1.28 }],
);

const koraBasic = skill("basic", "Impacto cinético", "El núcleo empuja, no grita.", 0, [
  { op: "damage", target: "enemy", mult: 1 },
], 22);
const koraSkill = skill(
  "skill",
  "Barrera infinita",
  "Un escudo hexagonal sobre sí misma.",
  35,
  [{ op: "shield", target: "self", pct: 0.34 }],
);
const koraUlt = skill(
  "ult",
  "Cañón de núcleo",
  "Rayo pesado. Aturde si deja al blanco muy herido.",
  100,
  [{ op: "damage", target: "enemy", mult: 2.3, stunIfBelow: 0.42 }],
);

const seraBasic = skill("basic", "Zarpazo", "Entra sin pedir permiso.", 0, [
  { op: "damage", target: "enemy", mult: 1 },
], 22);
const seraSkill = skill(
  "skill",
  "Ráfaga salvaje",
  "Tres golpes seguidos.",
  45,
  [{ op: "damage", target: "enemy", mult: 0.62, hits: 3 }],
);
const seraUlt = skill(
  "ult",
  "Colmillo esmeralda",
  "Impacto brutal. Si derriba, recupera ki.",
  100,
  [{ op: "damage", target: "enemy", mult: 2.85, kiOnKill: 30 }],
);

const nyxBasic = skill("basic", "Aguja del rift", "Un pinchazo que abre un segundo de más.", 0, [
  { op: "damage", target: "enemy", mult: 1 },
], 22);
const nyxSkill = skill(
  "skill",
  "Trampa de reloj",
  "Daño leve y aturdimiento.",
  45,
  [
    { op: "damage", target: "enemy", mult: 0.75 },
    { op: "stun", target: "enemy" },
  ],
);
const nyxUlt = skill(
  "ult",
  "Colapso de laboratorio",
  "Golpea a todos y baja su defensa.",
  100,
  [
    { op: "damage", target: "enemies", mult: 1.12 },
    { op: "def", target: "enemies", pct: -0.25, turns: 3 },
  ],
);

const orraBasic = skill("basic", "Paso pesado", "Camina, y el suelo lo nota.", 0, [
  { op: "damage", target: "enemy", mult: 1.12 },
], 22);
const orraSkill = skill(
  "skill",
  "Ira contenida",
  "Pierde un poco de vida y dispara su ataque.",
  30,
  [
    { op: "self-hp", pct: 0.06 },
    { op: "atk", target: "self", pct: 0.45, turns: 3 },
  ],
);
const orraUlt = skill(
  "ult",
  "Erupción legendaria",
  "El cielo se pone de oro. Luego se cura un poco.",
  100,
  [
    { op: "damage", target: "enemy", mult: 3.05 },
    { op: "heal", target: "self", pct: 0.12 },
  ],
);

const aeraBasic = skill("basic", "Toque de arena", "Un segundo prestado, devuelto en golpe.", 0, [
  { op: "damage", target: "enemy", mult: 0.92 },
], 22);
const aeraSkill = skill(
  "skill",
  "Rebobinar",
  "Cura a quien esté peor.",
  40,
  [{ op: "heal", target: "low-ally", pct: 0.32 }],
);
const aeraUlt = skill(
  "ult",
  "Segundo cero",
  "Cura al pacto, limpia quemaduras y aturdimientos, y regala ki.",
  100,
  [
    { op: "heal", target: "allies", pct: 0.2 },
    { op: "cleanse" },
    { op: "ki", target: "best-ally", amount: 25 },
  ],
);

export const KIT = {
  lira: { basic: liraBasic, skill: liraSkill, ult: liraUlt },
  mira: { basic: miraBasic, skill: miraSkill, ult: miraUlt },
  veya: { basic: veyaBasic, skill: veyaSkill, ult: veyaUlt },
  kora: { basic: koraBasic, skill: koraSkill, ult: koraUlt },
  sera: { basic: seraBasic, skill: seraSkill, ult: seraUlt },
  nyx: { basic: nyxBasic, skill: nyxSkill, ult: nyxUlt },
  orra: { basic: orraBasic, skill: orraSkill, ult: orraUlt },
  aera: { basic: aeraBasic, skill: aeraSkill, ult: aeraUlt },
};

export const FIGHTERS: Fighter[] = [
  {
    id: "lira",
    name: "Lira Voss",
    title: "Inventora de cápsulas",
    lore: "Del puerto Ámbar. Sus cápsulas no guardan vehículos: comprimen barreras, radares y pulsos de ki. Entró al pacto el día que el Sindicato robó el primer pozo.",
    rarity: "R",
    element: "acero",
    role: "soporte",
    weight: 60,
    hp: 920,
    atk: 78,
    def: 58,
    spd: 108,
    crit: 0.08,
    skills: KIT.lira,
  },
  {
    id: "mira",
    name: "Mira Sol",
    title: "Princesa del dojo",
    lore: "Heredera de un dojo que entrena el puño como quien enciende un horno. Disciplina feroz y cero paciencia con quien apaga una ciudad.",
    rarity: "SR",
    element: "fuego",
    role: "asalto",
    weight: 40,
    hp: 860,
    atk: 142,
    def: 40,
    spd: 118,
    crit: 0.16,
    skills: KIT.mira,
  },
  {
    id: "veya",
    name: "Veya Rinn",
    title: "Campeona del anillo",
    lore: "Reina del Anillo Libre. Vuela bajo, pega justo y solo firma un pacto con quien pelea limpio.",
    rarity: "SR",
    element: "gravedad",
    role: "luchadora",
    weight: 40,
    hp: 1040,
    atk: 126,
    def: 52,
    spd: 120,
    crit: 0.12,
    skills: KIT.veya,
  },
  {
    id: "kora",
    name: "Kora Siete",
    title: "Núcleo androide",
    lore: "Despertó en un hangar sellado cuando quisieron usar su reactor como batería. Protege a la escuadra con la calma de una máquina que ya eligió bando.",
    rarity: "SSR",
    element: "rayo",
    role: "guardiana",
    weight: 26,
    hp: 1320,
    atk: 116,
    def: 74,
    spd: 96,
    crit: 0.1,
    skills: KIT.kora,
  },
  {
    id: "sera",
    name: "Sera Vale",
    title: "Orgullo esmeralda",
    lore: "Luchadora del cañón. Sonríe, golpea tres veces y espera a que el eco vuelva. Busca rivales que no se rompan al primer asalto.",
    rarity: "SSR",
    element: "salvaje",
    role: "asesina",
    weight: 26,
    hp: 800,
    atk: 158,
    def: 34,
    spd: 132,
    crit: 0.2,
    skills: KIT.sera,
  },
  {
    id: "nyx",
    name: "Nyx Calder",
    title: "Científica del rift",
    lore: "Abrió un reloj que no debía abrirse y la echaron del observatorio. Sus trampas no hieren de más: detienen el instante justo para ganar el intercambio.",
    rarity: "SSR",
    element: "gravedad",
    role: "control",
    weight: 26,
    hp: 900,
    atk: 112,
    def: 48,
    spd: 110,
    crit: 0.1,
    skills: KIT.nyx,
  },
  {
    id: "orra",
    name: "Orra Thorn",
    title: "Forma legendaria",
    lore: "Guerrera callada de los acantilados. Cuando el ki la desborda, el cielo se vuelve oro. Teme esa fuerza, y por eso la mide.",
    rarity: "UR",
    element: "salvaje",
    role: "berserker",
    weight: 10,
    hp: 1380,
    atk: 172,
    def: 50,
    spd: 92,
    crit: 0.14,
    skills: KIT.orra,
  },
  {
    id: "aera",
    name: "Aera Lun",
    title: "Guardiana de la hora",
    lore: "No reescribe el destino. Devuelve unos segundos cuando una compañera está a punto de caer. Llega tarde a propósito, y siempre a tiempo.",
    rarity: "UR",
    element: "tiempo",
    role: "soporte",
    weight: 10,
    hp: 1120,
    atk: 92,
    def: 62,
    spd: 104,
    crit: 0.08,
    skills: KIT.aera,
  },
  ...MORE_FIGHTERS,
];

export const FIGHTER: Record<string, Fighter> = Object.fromEntries(FIGHTERS.map((f) => [f.id, f]));

export const DUP_ORBS: Record<Rarity, number> = { R: 22, SR: 48, SSR: 110, UR: 240 };
