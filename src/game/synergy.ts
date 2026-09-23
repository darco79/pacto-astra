import type { Element, Role } from "./types";

export type Synergy = {
  atk: number;
  ki: number;
  shield: number;
  notes: string[];
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
