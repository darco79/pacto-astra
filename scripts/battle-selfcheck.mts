import { act, chooseEnemyAction, makeAlly, makeEnemy, startBattle } from "../src/game/combat.ts";
import { CHAPTERS } from "../src/game/content.ts";
import { pullMany } from "../src/game/gacha.ts";
import { FIGHTER } from "../src/game/roster.ts";
import type { SkillKind, Spawn } from "../src/game/types.ts";

function allyBrain(ki: number, hasUlt: boolean): SkillKind {
  if (hasUlt && ki >= 100) return "ult";
  if (ki >= 45) return "skill";
  return "basic";
}

function fight(ids: string[], level: number, spawns: Spawn[]) {
  let state = startBattle({
    allies: ids.map((id) => makeAlly(id, { level, stars: 1 })),
    enemies: spawns.map((spawn, index) => makeEnemy(spawn, index)),
    mod: "ki",
  });
  let guard = 0;
  while (state.phase === "pick" && guard++ < 250) {
    const actor = state.units.find((unit) => unit.iid === state.actorId);
    if (!actor) throw new Error("sin actor");
    const kind = actor.side === "enemy" ? chooseEnemyAction(actor) : allyBrain(actor.ki, !!actor.skills.ult);
    const next = act(state, kind, null);
    if (next.events.length === 0) throw new Error(`atascado ${actor.name} ${kind} ki ${actor.ki}`);
    state = next.state;
    for (const unit of state.units) {
      if (!Number.isFinite(unit.hp) || unit.hp < 0 || unit.ki < 0 || unit.ki > 100) {
        throw new Error(`stats rotas ${unit.name}`);
      }
    }
  }
  if (state.phase === "pick") throw new Error("combate eterno");
  return state.phase;
}

function rate(label: string, ids: string[], level: number, spawns: Spawn[], n = 30) {
  let wins = 0;
  for (let i = 0; i < n; i++) if (fight(ids, level, spawns) === "victory") wins++;
  console.log(`${label}: ${wins}/${n}`);
}

rate("c1 lira+mira", ["lira", "mira"], 1, CHAPTERS[0].spawns);
rate("c2", ["lira", "mira"], 3, CHAPTERS[1].spawns);
rate("c5", ["mira", "kora", "sera"], 10, CHAPTERS[4].spawns, 15);

const ten = pullMany(10, 0);
if (ten.ids.length !== 10) throw new Error("x10 corto");
const forced = pullMany(1, 39);
const rarity = FIGHTER[forced.ids[0]].rarity;
if (rarity !== "SSR" && rarity !== "UR") throw new Error(`pity fallo ${rarity}`);
console.log("pity", rarity, "ok");
console.log("selfcheck ok");
