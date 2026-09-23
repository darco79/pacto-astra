import type { Element, Role } from "./types";

export type Synergy = {
  atk: number;
  ki: number;
  shield: number;
  notes: string[];
};

export type LeaderAura = {
  atk: number;
  ki: number;
  shield: number;
  note: string;
};

export function squadSynergy(fighters: { element: Element; role: Role }[]): Synergy {
  const notes: string[] = [];
  let atk = 0;
  let ki = 0;
  let shield = 0;
  const elements = fighters.map((fighter) => fighter.element);
  const paired = elements.some((element, index) => elements.indexOf(element) !== index);
  if (paired) {
    atk = 0.08;
    notes.push("Dos del mismo elemento: +8% de ataque.");
  }
  const roles = new Set(fighters.map((fighter) => fighter.role));
  if (roles.has("asalto") && roles.has("guardiana") && roles.has("soporte")) {
    ki = 15;
    shield = 0.08;
    notes.push("Asalto, guardiana y soporte: +15 de ki y un escudo leve.");
  }
  return { atk, ki, shield, notes };
}

/** Pasiva del puesto 1. Se suma a la sinergia de escuadra, no la sustituye. */
export function leaderAura(role: Role): LeaderAura {
  switch (role) {
    case "soporte":
      return { atk: 0, ki: 15, shield: 0, note: "Líder soporte: +15 de ki inicial a la escuadra." };
    case "asalto":
      return { atk: 0.08, ki: 0, shield: 0, note: "Líder asalto: +8% de ataque a la escuadra." };
    case "guardiana":
      return { atk: 0, ki: 0, shield: 0.08, note: "Líder guardiana: un escudo del 8% al entrar." };
    case "luchadora":
      return { atk: 0, ki: 10, shield: 0, note: "Líder luchadora: +10 de ki inicial a la escuadra." };
    case "asesina":
      return { atk: 0.06, ki: 0, shield: 0, note: "Líder asesina: +6% de ataque a la escuadra." };
    case "control":
      return { atk: 0, ki: 15, shield: 0, note: "Líder control: +15 de ki inicial a la escuadra." };
    case "berserker":
      return { atk: 0.1, ki: 0, shield: 0, note: "Líder berserker: +10% de ataque a la escuadra." };
  }
}
