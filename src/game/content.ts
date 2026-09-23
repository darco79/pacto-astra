import { KIT } from "./roster";
import type { BattleSetup, ChoiceMod, Element, Kit, SkillKind } from "./types";

export type EnemyTemplate = {
  id: string;
  name: string;
  title: string;
  portrait: string;
  element: Element;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number;
  ki: number;
  skills: Kit;
  ai: SkillKind[];
};

const shot = (name: string, mult = 1): Kit["basic"] => ({
  kind: "basic",
  name,
  blurb: "Ataque básico.",
  cost: 0,
  kiGain: 20,
  effects: [{ op: "damage", target: "enemy", mult }],
});

export const ENEMIES: Record<string, EnemyTemplate> = {
  soldado: {
    id: "soldado",
    name: "Soldado Nulo",
    title: "Tropa de drenaje",
    portrait: "soldado",
    element: "acero",
    hp: 540,
    atk: 64,
    def: 28,
    spd: 88,
    crit: 0.06,
    ki: 36,
    ai: ["skill", "basic"],
    skills: {
      basic: shot("Disparo nulo"),
      skill: {
        kind: "skill",
        name: "Drenar",
        blurb: "Roba un poco de aliento.",
        cost: 40,
        kiGain: 0,
        effects: [
          { op: "damage", target: "enemy", mult: 0.95 },
          { op: "heal", target: "self", pct: 0.08 },
        ],
      },
    },
  },
  acechador: {
    id: "acechador",
    name: "Acechador",
    title: "Corte rápido",
    portrait: "soldado",
    element: "salvaje",
    hp: 620,
    atk: 98,
    def: 24,
    spd: 124,
    crit: 0.12,
    ki: 30,
    ai: ["skill", "basic"],
    skills: {
      basic: shot("Cuchilla"),
      skill: {
        kind: "skill",
        name: "Corte umbral",
        blurb: "Un tajo veloz.",
        cost: 40,
        kiGain: 0,
        effects: [{ op: "damage", target: "enemy", mult: 1.75 }],
      },
    },
  },
  centinela: {
    id: "centinela",
    name: "Centinela",
    title: "Placa viva",
    portrait: "soldado",
    element: "acero",
    hp: 1500,
    atk: 70,
    def: 72,
    spd: 74,
    crit: 0.05,
    ki: 40,
    ai: ["skill", "basic"],
    skills: {
      basic: shot("Plancha"),
      skill: {
        kind: "skill",
        name: "Placa",
        blurb: "Se cubre.",
        cost: 30,
        kiGain: 0,
        effects: [{ op: "shield", target: "self", pct: 0.2 }],
      },
    },
  },
  vark: {
    id: "vark",
    name: "General Vark",
    title: "Eclipse nulo",
    portrait: "vark",
    element: "gravedad",
    hp: 2800,
    atk: 128,
    def: 54,
    spd: 102,
    crit: 0.1,
    ki: 50,
    ai: ["ult", "skill", "basic"],
    skills: {
      basic: shot("Mandoble", 1.12),
      skill: {
        kind: "skill",
        name: "Drenaje de pozo",
        blurb: "Bebe ki y afloja el golpe rival.",
        cost: 40,
        kiGain: 0,
        effects: [
          { op: "damage", target: "enemy", mult: 1.3 },
          { op: "atk", target: "enemy", pct: -0.16, turns: 2 },
        ],
      },
      ult: {
        kind: "ult",
        name: "Eclipse nulo",
        blurb: "Onda a toda la escuadra y quemadura.",
        cost: 100,
        kiGain: 0,
        effects: [
          { op: "damage", target: "enemies", mult: 1.02 },
          { op: "burn", target: "enemies", turns: 2, pct: 0.04 },
        ],
      },
    },
  },
  "veya-rival": {
    id: "veya-rival",
    name: "Veya Rinn",
    title: "Exhibición",
    portrait: "veya",
    element: "gravedad",
    hp: 980,
    atk: 108,
    def: 42,
    spd: 116,
    crit: 0.1,
    ki: 40,
    ai: ["skill", "basic"],
    skills: { basic: KIT.veya.basic, skill: KIT.veya.skill },
  },
  "sera-rival": {
    id: "sera-rival",
    name: "Sera Vale",
    title: "Desafío",
    portrait: "sera",
    element: "salvaje",
    hp: 920,
    atk: 132,
    def: 32,
    spd: 128,
    crit: 0.16,
    ki: 34,
    ai: ["skill", "basic"],
    skills: { basic: KIT.sera.basic, skill: KIT.sera.skill },
  },
};

export type Chapter = {
  id: string;
  title: string;
  place: string;
  summary: string;
  lines: { speaker: string; text: string }[];
  choices: { id: ChoiceMod; label: string; detail: string }[];
  spawns: { ref: string; name?: string; hp?: number; atk?: number; def?: number; spd?: number }[];
  rewards: { crystals: number; orbs: number; grant?: string };
  replay: { crystals: number; orbs: number };
};

const choices: Chapter["choices"] = [
  { id: "ki", label: "Cargar el ki", detail: "La escuadra entra con +20 de ki." },
  { id: "study", label: "Leer al rival", detail: "Los enemigos pierden un poco de defensa." },
  { id: "surge", label: "Calentar el golpe", detail: "La escuadra pega un 12% más fuerte." },
];

export const CHAPTERS: Chapter[] = [
  {
    id: "puerto",
    title: "Pozo del puerto",
    place: "Puerto Ámbar",
    summary: "El primer pozo parpadea. Dos soldados del Sindicato ya tienen las mangueras puestas.",
    lines: [
      { speaker: "Lira Voss", text: "Invocador. Si este pozo se apaga, los muelles se quedan sin luz y sin vuelo." },
      { speaker: "Mira Sol", text: "Hay drenadores en el dique. No hablan. Beben." },
      { speaker: "Narración", text: "El cristal de tu mano responde. El pacto da un paso al frente." },
      { speaker: "Lira Voss", text: "Tú marcas el ritmo. Nosotras pegamos." },
    ],
    choices,
    spawns: [
      { ref: "soldado" },
      { ref: "soldado", name: "Soldado Nulo" },
    ],
    rewards: { crystals: 180, orbs: 40 },
    replay: { crystals: 50, orbs: 16 },
  },
  {
    id: "anillo",
    title: "Exhibición",
    place: "Anillo Libre",
    summary: "Veya no firma pactos de palabra. Hay que aguantar su exhibición, y al drenador de la grada.",
    lines: [
      { speaker: "Veya Rinn", text: "Si quieres mi vuelo en tu escuadra, gánalo en el ring." },
      { speaker: "Veya Rinn", text: "El Sindicato está en la grada, apostando a que caes. No les des el gusto." },
      { speaker: "Mira Sol", text: "Campeona y drenador. No bajes la guardia después del primer golpe." },
      { speaker: "Narración", text: "Las luces del anillo bajan. Veya saluda, y luego ya no es un saludo." },
    ],
    choices,
    spawns: [{ ref: "veya-rival" }, { ref: "soldado", hp: 480 }],
    rewards: { crystals: 220, orbs: 48, grant: "veya" },
    replay: { crystals: 60, orbs: 18 },
  },
  {
    id: "hangar",
    title: "Hangar Siete",
    place: "Dársena norte",
    summary: "Vark quiere el reactor de Kora como batería. Un centinela custodia la compuerta.",
    lines: [
      { speaker: "Lira Voss", text: "El núcleo está vivo ahí dentro. Si lo arrancan, no queda androide: queda bomba." },
      { speaker: "Narración", text: "La compuerta tiembla. Algo cuenta hasta tres con voz de metal." },
      { speaker: "Kora Siete", text: "Unidad Siete en línea. Protejan el reactor. Yo protejo el pacto." },
    ],
    choices,
    spawns: [
      { ref: "centinela", hp: 1280 },
      { ref: "soldado" },
    ],
    rewards: { crystals: 260, orbs: 56, grant: "kora" },
    replay: { crystals: 70, orbs: 20 },
  },
  {
    id: "canon",
    title: "Cañón esmeralda",
    place: "Acantilados",
    summary: "Sera reta al pacto. Detrás de ella, dicen, duerme una guerrera que enciende el cielo.",
    lines: [
      { speaker: "Sera Vale", text: "¿Este es el pacto del puerto? Peleen. Si aguantan, les enseño el sendero." },
      { speaker: "Narración", text: "En los acantilados duerme Orra Thorn. Hoy no sale. Hoy sale Sera, y un acechador que la seguía." },
      { speaker: "Sera Vale", text: "Tres golpes. A ver si el eco vuelve." },
    ],
    choices,
    spawns: [{ ref: "sera-rival" }, { ref: "acechador", hp: 560 }],
    rewards: { crystals: 300, orbs: 64, grant: "sera" },
    replay: { crystals: 80, orbs: 22 },
  },
  {
    id: "reloj",
    title: "Reloj roto",
    place: "Puente de Vark",
    summary: "El general bebe el último pozo. Si el eclipse cierra, los Anillos se apagan.",
    lines: [
      { speaker: "Aera Lun", text: "Llego cuando el reloj se rompe, no antes. Vark está en el puente." },
      { speaker: "Lira Voss", text: "Si cae ese pozo, no hay puerto, ni anillo, ni hangar. Se acaba la luz." },
      { speaker: "Aera Lun", text: "No dejen que termine el eclipse. Yo les devuelvo los segundos que hagan falta." },
      { speaker: "Narración", text: "Vark no huye. Un centinela le hace de muro. El ki del cielo ya es violeta." },
    ],
    choices,
    spawns: [
      { ref: "vark" },
      { ref: "centinela", hp: 1100, atk: 64 },
    ],
    rewards: { crystals: 520, orbs: 90, grant: "aera" },
    replay: { crystals: 100, orbs: 28 },
  },
  {
    id: "taller",
    title: "Taller de cápsulas",
    place: "Callejón Ámbar",
    summary: "Neri abre un taller que el Sindicato ya marcó. Tessa cierra el muelle. Dara no deja pasar la chapa.",
    lines: [
      { speaker: "Neri Quill", text: "Capitán. Si se llevan estas cápsulas, el puerto se queda sin escudos de repuesto." },
      { speaker: "Tessa Brin", text: "Hay drenadores en el callejón. Yo pego. Tú dices cuándo." },
      { speaker: "Dara Venn", text: "La chapa aguanta un asalto. No dos, si no entramos ya." },
      { speaker: "Narración", text: "El pacto baja al callejón. El primer pozo no estaba solo." },
    ],
    choices,
    spawns: [
      { ref: "acechador", hp: 760, atk: 86 },
      { ref: "soldado", name: "Cargador Nulo", hp: 620 },
    ],
    rewards: { crystals: 280, orbs: 60, grant: "dara" },
    replay: { crystals: 70, orbs: 20 },
  },
  {
    id: "circuito",
    title: "Circuito exterior",
    place: "Anillos de vuelo",
    summary: "Luma perdió la pista. Hana trae el aviso tarde. Rin quiere quemar la meta antes de que la beban.",
    lines: [
      { speaker: "Luma Crest", text: "Usaron mi circuito para mover tropas. Eso no se corre. Se cierra." },
      { speaker: "Hana Vesk", text: "El sobre llegó tarde. El Sindicato ya está en la curva." },
      { speaker: "Rin Kael", text: "Si el horno del dojo sirve para algo, es para esto." },
      { speaker: "Brisa Quen", text: "Yo sigo el rastro verde. No lo perdáis cuando empiece el polvo." },
    ],
    choices,
    spawns: [
      { ref: "centinela", hp: 1360, atk: 78 },
      { ref: "acechador", hp: 820, atk: 96 },
    ],
    rewards: { crystals: 340, orbs: 70, grant: "luma" },
    replay: { crystals: 80, orbs: 22 },
  },
  {
    id: "veredicto",
    title: "Veredicto del pozo",
    place: "Falla central",
    summary: "Maera dicta sobre la falla. Selka tiene el hilo. Sable entra por el ángulo que el foco no cubre.",
    lines: [
      { speaker: "Maera Kest", text: "Capitán. El pozo central no pide opinión. Pide sentencia." },
      { speaker: "Selka Dorn", text: "El hilo de gravedad está torcido. Si lo soltamos, la ciudad deja de volar." },
      { speaker: "Calla Orth", text: "Reglamento simple: el que bebe un pozo, sale del anillo." },
      { speaker: "Sable Orrin", text: "Yo cubro el ángulo ciego. Eira nos devuelve el segundo si la sentencia falla." },
      { speaker: "Eira Morn", text: "No reescribo el pozo. Os devuelvo el minuto. Usadlo." },
    ],
    choices,
    spawns: [
      { ref: "vark", name: "Juez Nulo", hp: 2600, atk: 136, def: 58 },
      { ref: "centinela", hp: 1200, atk: 74 },
    ],
    rewards: { crystals: 460, orbs: 84, grant: "sable" },
    replay: { crystals: 90, orbs: 24 },
  },
];

export function fightXp(rewards: { crystals: number; orbs: number }, first: boolean) {
  const base = Math.round(rewards.crystals * 0.5 + rewards.orbs * 4);
  return Math.max(8, first ? base : Math.round(base * 0.5));
}

export function nextChapterBattle(chapterId: string | null): BattleSetup | null {
  if (!chapterId) return null;
  const index = CHAPTERS.findIndex((chapter) => chapter.id === chapterId);
  const next = index >= 0 ? CHAPTERS[index + 1] : undefined;
  if (!next) return null;
  const choice = next.choices[0];
  return {
    chapterId: next.id,
    title: next.title,
    place: next.place,
    mod: choice?.id ?? null,
    modLabel: choice?.label ?? "",
    spawns: next.spawns,
    rewards: next.rewards,
    replay: next.replay,
  };
}

export const WELL = {
  title: "Jefe del pozo",
  place: "Pozo central",
  spawns: [
    { ref: "vark", name: "Guardián del pozo", hp: 3400, atk: 148, def: 62 },
    { ref: "centinela", name: "Muro Nulo", hp: 1500, atk: 84 },
    { ref: "acechador", name: "Acechador de falla", hp: 980, atk: 108 },
  ],
  rewards: { crystals: 120, orbs: 40 },
};

export const PRACTICE = {
  title: "Asalto de dojo",
  place: "Dojo del pacto",
  spawns: [
    { ref: "acechador", hp: 700, atk: 90 },
    { ref: "soldado", hp: 640, atk: 72 },
  ],
  rewards: { crystals: 32, orbs: 18 },
};
