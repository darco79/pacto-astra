import { CHAPTERS } from "./content";
import { FIGHTERS } from "./roster";
import type { Owned } from "./types";

export type AchievementSnap = {
  wins: number;
  pulls: number;
  owned: Record<string, Owned>;
  cleared: string[];
  daily: string;
};

export type Achievement = {
  id: string;
  title: string;
  detail: string;
  reward: number;
  goal: number;
  current: (snap: AchievementSnap) => number;
};

function ownedList(snap: AchievementSnap) {
  return Object.entries(snap.owned).filter(([id]) => FIGHTERS.some((fighter) => fighter.id === id));
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "win-1",
    title: "Primer asalto",
    detail: "Gana 1 combate.",
    reward: 40,
    goal: 1,
    current: (snap) => snap.wins,
  },
  {
    id: "win-5",
    title: "Cinco asaltos",
    detail: "Gana 5 combates.",
    reward: 80,
    goal: 5,
    current: (snap) => snap.wins,
  },
  {
    id: "win-20",
    title: "Anillo conocido",
    detail: "Gana 20 combates.",
    reward: 120,
    goal: 20,
    current: (snap) => snap.wins,
  },
  {
    id: "win-50",
    title: "El anillo no cierra",
    detail: "Gana 50 combates.",
    reward: 200,
    goal: 50,
    current: (snap) => snap.wins,
  },
  {
    id: "own-10",
    title: "Pacto amplio",
    detail: "Ten 10 luchadoras.",
    reward: 80,
    goal: 10,
    current: (snap) => ownedList(snap).length,
  },
  {
    id: "own-all",
    title: "Pacto completo",
    detail: "Ten todas las cartas del cristal.",
    reward: 400,
    goal: FIGHTERS.length,
    current: (snap) => ownedList(snap).length,
  },
  {
    id: "ssr",
    title: "Rareza alta",
    detail: "Consigue una luchadora SSR.",
    reward: 60,
    goal: 1,
    current: (snap) => (ownedList(snap).some(([id]) => FIGHTERS.find((fighter) => fighter.id === id)?.rarity === "SSR") ? 1 : 0),
  },
  {
    id: "ur",
    title: "Rareza máxima",
    detail: "Consigue una luchadora UR.",
    reward: 150,
    goal: 1,
    current: (snap) => (ownedList(snap).some(([id]) => FIGHTERS.find((fighter) => fighter.id === id)?.rarity === "UR") ? 1 : 0),
  },
  {
    id: "stars-5",
    title: "Cinco estrellas",
    detail: "Lleva una luchadora a 5 estrellas.",
    reward: 100,
    goal: 5,
    current: (snap) => ownedList(snap).reduce((max, [, owned]) => Math.max(max, owned.stars), 0),
  },
  {
    id: "level-10",
    title: "Dojo en marcha",
    detail: "Sube una luchadora al nivel 10.",
    reward: 80,
    goal: 10,
    current: (snap) => ownedList(snap).reduce((max, [, owned]) => Math.max(max, owned.level), 0),
  },
  {
    id: "level-25",
    title: "Techo del dojo",
    detail: "Sube una luchadora al nivel 25.",
    reward: 180,
    goal: 25,
    current: (snap) => ownedList(snap).reduce((max, [, owned]) => Math.max(max, owned.level), 0),
  },
  {
    id: "pulls-10",
    title: "El cristal responde",
    detail: "Invoca 10 veces.",
    reward: 40,
    goal: 10,
    current: (snap) => snap.pulls,
  },
  {
    id: "pulls-50",
    title: "Llamado insistente",
    detail: "Invoca 50 veces.",
    reward: 100,
    goal: 50,
    current: (snap) => snap.pulls,
  },
  {
    id: "story",
    title: "Crónica cerrada",
    detail: "Completa toda la crónica.",
    reward: 200,
    goal: CHAPTERS.length,
    current: (snap) => snap.cleared.length,
  },
  {
    id: "daily",
    title: "Llamado de hoy",
    detail: "Usa el llamado diario gratis.",
    reward: 30,
    goal: 1,
    current: (snap) => (snap.daily ? 1 : 0),
  },
];

export function pendingAchievements(snap: AchievementSnap, claimed: string[]) {
  return ACHIEVEMENTS.filter((item) => item.current(snap) >= item.goal && !claimed.includes(item.id));
}
