import { ENEMIES } from "./content";
import type { Synergy } from "./synergy";
import { FIGHTER, hasAdvantage, statsOf } from "./roster";
import type {
  BattleState,
  ChoiceMod,
  Effect,
  Ev,
  SkillDef,
  SkillKind,
  Spawn,
  Status,
  Unit,
} from "./types";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function living(units: Unit[], side: Unit["side"]) {
  return units.filter((unit) => unit.alive && unit.side === side);
}

function weakest(units: Unit[]) {
  return [...units].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
}

function outcome(state: BattleState): "victory" | "defeat" | null {
  if (!state.units.some((unit) => unit.side === "ally" && unit.alive)) return "defeat";
  if (!state.units.some((unit) => unit.side === "enemy" && unit.alive)) return "victory";
  return null;
}

function hurt(unit: Unit, raw: number) {
  let left = Math.max(0, Math.round(raw));
  if (unit.shield > 0) {
    const absorbed = Math.min(unit.shield, left);
    unit.shield -= absorbed;
    left -= absorbed;
  }
  const before = unit.hp;
  unit.hp = Math.max(0, unit.hp - left);
  if (unit.hp <= 0) unit.alive = false;
  return { hpLoss: before - unit.hp };
}

function restore(unit: Unit, raw: number) {
  if (!unit.alive) return 0;
  const before = unit.hp;
  unit.hp = Math.min(unit.maxHp, unit.hp + Math.max(0, Math.round(raw)));
  return unit.hp - before;
}

function putStatus(unit: Unit, actor: Unit, status: Status) {
  unit.statuses = unit.statuses.filter((item) => item.kind !== status.kind);
  unit.statuses.push({ ...status, fresh: unit.iid === actor.iid });
}

function tickDurations(unit: Unit) {
  unit.statuses = unit.statuses.flatMap((status) => {
    if (status.fresh) return [{ ...status, fresh: false }];
    const turns = status.turns - 1;
    return turns > 0 ? [{ ...status, turns, fresh: false }] : [];
  });
}

function foesOf(state: BattleState, actor: Unit) {
  return living(state.units, actor.side === "ally" ? "enemy" : "ally");
}

function friendsOf(state: BattleState, actor: Unit) {
  return living(state.units, actor.side);
}

function targetsFor(state: BattleState, actor: Unit, target: string, focusId: string | null) {
  const foes = foesOf(state, actor);
  const friends = friendsOf(state, actor);
  if (target === "enemy") {
    const aimed = foes.find((unit) => unit.iid === focusId) ?? weakest(foes);
    return aimed ? [aimed] : [];
  }
  if (target === "enemies") return foes;
  if (target === "self") return [actor];
  if (target === "allies") return friends;
  if (target === "low-ally") {
    const ally = weakest(friends);
    return ally ? [ally] : [];
  }
  if (target === "best-ally") {
    const ally = [...friends].sort((a, b) => b.atk - a.atk)[0];
    return ally ? [ally] : [];
  }
  return [];
}

function attackStat(unit: Unit) {
  return unit.statuses.reduce((atk, status) => (status.kind === "atk" ? atk * (1 + status.pct) : atk), unit.atk);
}

function defenseStat(unit: Unit) {
  const def = unit.statuses.reduce((value, status) => (status.kind === "def" ? value * (1 + status.pct) : value), unit.def);
  return Math.max(0, def);
}

function resolveEffect(
  state: BattleState,
  actor: Unit,
  effect: Effect,
  focusId: string | null,
  rng: () => number,
  events: Ev[],
) {
  if (effect.op === "self-hp") {
    const loss = Math.min(Math.round(actor.maxHp * effect.pct), Math.max(0, actor.hp - 1));
    actor.hp -= loss;
    if (loss > 0) {
      events.push({ t: "dmg", id: actor.iid, amount: loss, crit: false, blocked: false });
      events.push({ t: "log", text: `${actor.name} quema ${loss} de vida para cargar el golpe.` });
    }
    return;
  }
  if (effect.op === "cleanse") {
    for (const ally of friendsOf(state, actor)) {
      ally.statuses = ally.statuses.filter((status) => status.kind !== "burn" && status.kind !== "stun");
    }
    events.push({ t: "log", text: "El tiempo suelta las ataduras del pacto." });
    return;
  }
  if (effect.op === "ki") {
    for (const unit of targetsFor(state, actor, effect.target, focusId)) {
      unit.ki = Math.min(100, unit.ki + effect.amount);
      events.push({ t: "log", text: `${unit.name} recupera ${effect.amount} de ki.` });
    }
    return;
  }
  if (effect.op === "heal") {
    for (const unit of targetsFor(state, actor, effect.target, focusId)) {
      const amount = restore(unit, unit.maxHp * effect.pct);
      if (amount > 0) {
        events.push({ t: "heal", id: unit.iid, amount });
        events.push({ t: "log", text: `${unit.name} recupera ${amount}.` });
      }
    }
    return;
  }
  if (effect.op === "shield") {
    for (const unit of targetsFor(state, actor, effect.target, focusId)) {
      const amount = Math.round(unit.maxHp * effect.pct);
      unit.shield = Math.max(unit.shield, amount);
      events.push({ t: "log", text: `${unit.name} alza un escudo de ${amount}.` });
    }
    return;
  }
  if (effect.op === "burn" || effect.op === "stun") {
    for (const unit of targetsFor(state, actor, effect.target, focusId)) {
      if (!unit.alive) continue;
      if (effect.op === "burn") {
        putStatus(unit, actor, { kind: "burn", turns: effect.turns, pct: effect.pct });
        events.push({ t: "log", text: `${unit.name} arde.` });
      } else {
        putStatus(unit, actor, { kind: "stun", turns: 1, pct: 0 });
        events.push({ t: "log", text: `${unit.name} queda fuera de tiempo.` });
      }
    }
    return;
  }
  if (effect.op === "atk" || effect.op === "def") {
    for (const unit of targetsFor(state, actor, effect.target, focusId)) {
      putStatus(unit, actor, { kind: effect.op, turns: effect.turns, pct: effect.pct });
      const up = effect.pct >= 0;
      const label = effect.op === "atk" ? (up ? "sube su ataque" : "pierde fuerza") : up ? "refuerza la guardia" : "queda expuesta";
      events.push({ t: "log", text: `${unit.name} ${label}.` });
    }
    return;
  }
  const hits = effect.hits ?? 1;
  for (const target of targetsFor(state, actor, effect.target, focusId)) {
    const advantage = hasAdvantage(actor.element, target.element);
    for (let hit = 0; hit < hits; hit++) {
      if (!target.alive) break;
      let mult = effect.mult;
      if (effect.bonusIfBurn && target.statuses.some((status) => status.kind === "burn")) mult *= effect.bonusIfBurn;
      const crit = rng() < actor.crit;
      const variance = 0.96 + rng() * 0.08;
      const raw = Math.max(
        1,
        Math.round(attackStat(actor) * mult * (100 / (100 + defenseStat(target))) * (advantage ? 1.25 : 1) * (crit ? 1.5 : 1) * variance),
      );
      const dealt = hurt(target, raw);
      events.push({
        t: "dmg",
        id: target.iid,
        amount: dealt.hpLoss,
        crit,
        blocked: dealt.hpLoss === 0,
      });
      if (crit || dealt.hpLoss > 80) events.push({ t: "shake", power: crit ? 0.45 : 0.28 });
      const tags = [crit ? "crítico" : "", advantage ? "con ventaja" : "", dealt.hpLoss === 0 ? "absorbido" : ""]
        .filter(Boolean)
        .join(", ");
      events.push({
        t: "log",
        text: `${target.name} recibe ${dealt.hpLoss}${tags ? ` (${tags})` : ""}.`,
      });
      if (!target.alive) {
        events.push({ t: "ko", id: target.iid });
        events.push({ t: "log", text: `${target.name} cae.` });
        if (effect.kiOnKill) {
          actor.ki = Math.min(100, actor.ki + effect.kiOnKill);
          events.push({ t: "log", text: `${actor.name} recupera ki del derribo.` });
        }
      } else if (effect.stunIfBelow && target.hp / target.maxHp <= effect.stunIfBelow) {
        putStatus(target, actor, { kind: "stun", turns: 1, pct: 0 });
        events.push({ t: "log", text: `${target.name} queda detenida en el instante.` });
      }
    }
  }
}

export function openUntilReady(state: BattleState): Ev[] {
  const events: Ev[] = [];
  let guard = 0;
  while (guard++ < 80) {
    const end = outcome(state);
    if (end) {
      state.phase = end;
      state.actorId = null;
      events.push({
        t: "log",
        text: end === "victory" ? "El anillo queda en silencio. Victoria." : "La escuadra cae.",
      });
      return events;
    }
    if (state.order.length === 0) {
      const queue = state.units.filter((unit) => unit.alive);
      queue.sort((a, b) => b.spd - a.spd || (a.side === "ally" ? -1 : 1));
      state.order = queue.map((unit) => unit.iid);
      state.round += 1;
      if (state.round > 1) events.push({ t: "log", text: `Ronda ${state.round}.` });
    }
    const iid = state.order[0];
    const actor = state.units.find((unit) => unit.iid === iid);
    if (!actor || !actor.alive) {
      state.order.shift();
      continue;
    }
    for (const status of actor.statuses) {
      if (status.kind === "burn" && actor.alive) {
        const dealt = hurt(actor, Math.max(1, Math.round(actor.maxHp * status.pct)));
        events.push({ t: "dmg", id: actor.iid, amount: dealt.hpLoss, crit: false, blocked: false });
        events.push({ t: "log", text: `${actor.name} sufre ${dealt.hpLoss} por quemadura.` });
        if (!actor.alive) {
          events.push({ t: "ko", id: actor.iid });
          events.push({ t: "log", text: `${actor.name} cae.` });
        }
      }
    }
    if (!actor.alive) {
      state.order.shift();
      continue;
    }
    if (actor.statuses.some((status) => status.kind === "stun")) {
      actor.statuses = actor.statuses.filter((status) => status.kind !== "stun");
      events.push({ t: "log", text: `${actor.name} no puede moverse.` });
      tickDurations(actor);
      state.order.shift();
      continue;
    }
    state.actorId = actor.iid;
    state.phase = "pick";
    return events;
  }
  state.phase = "defeat";
  state.actorId = null;
  return events;
}

function commitLogs(state: BattleState, events: Ev[]) {
  for (const event of events) {
    if (event.t === "log") state.log.push({ id: ++state.seq, text: event.text });
  }
  state.log = state.log.slice(-36);
}

export function startBattle(opts: { allies: Unit[]; enemies: Unit[]; mod: ChoiceMod | null; synergy?: Synergy | null }): BattleState {
  const allies = clone(opts.allies);
  const enemies = clone(opts.enemies);
  const events: Ev[] = [{ t: "log", text: "El anillo se enciende." }];
  if (opts.mod === "ki") {
    for (const unit of allies) unit.ki = Math.min(100, unit.ki + 20);
    events.push({ t: "log", text: "El pacto entra con el ki ya encendido." });
  } else if (opts.mod === "study") {
    for (const unit of enemies) unit.def = Math.round(unit.def * 0.88);
    events.push({ t: "log", text: "Leen al rival. Su guardia cede." });
  } else if (opts.mod === "surge") {
    for (const unit of allies) unit.atk = Math.round(unit.atk * 1.12);
    events.push({ t: "log", text: "Calientan el golpe antes del salto." });
  }
  if (opts.synergy && opts.synergy.atk > 0) {
    for (const unit of allies) unit.atk = Math.round(unit.atk * (1 + opts.synergy.atk));
    events.push({ t: "log", text: "La escuadra comparte elemento. El golpe pesa más." });
  }
  if (opts.synergy && (opts.synergy.ki > 0 || opts.synergy.shield > 0)) {
    for (const unit of allies) {
      if (opts.synergy.ki) unit.ki = Math.min(100, unit.ki + opts.synergy.ki);
      if (opts.synergy.shield) unit.shield = Math.max(unit.shield, Math.round(unit.maxHp * opts.synergy.shield));
    }
    events.push({ t: "log", text: "Asalto, guardiana y soporte. Entran cubiertas y con ki de más." });
  }
  const state: BattleState = {
    units: [...allies, ...enemies],
    order: [],
    round: 0,
    phase: "pick",
    actorId: null,
    log: [],
    seq: 0,
  };
  events.push(...openUntilReady(state));
  commitLogs(state, events);
  return state;
}

export function act(
  state: BattleState,
  kind: SkillKind,
  focusId: string | null,
  rng: () => number = Math.random,
): { state: BattleState; events: Ev[] } {
  if (state.phase !== "pick" || !state.actorId) return { state, events: [] };
  const next = clone(state);
  const actor = next.units.find((unit) => unit.iid === next.actorId);
  const skill: SkillDef | undefined = actor?.skills[kind];
  if (!actor || !actor.alive || !skill || actor.ki < skill.cost) return { state, events: [] };
  const events: Ev[] = [];
  actor.ki -= skill.cost;
  events.push({ t: "log", text: `${actor.name} usa ${skill.name}.` });
  if (skill.kind === "ult") events.push({ t: "shake", power: 0.9 });
  for (const effect of skill.effects) resolveEffect(next, actor, effect, focusId, rng, events);
  if (skill.kiGain) actor.ki = Math.min(100, actor.ki + skill.kiGain);
  tickDurations(actor);
  const index = next.order.indexOf(actor.iid);
  if (index >= 0) next.order.splice(index, 1);
  events.push(...openUntilReady(next));
  commitLogs(next, events);
  return { state: next, events };
}

export function chooseEnemyAction(actor: Unit): SkillKind {
  for (const kind of actor.ai) {
    const skill = actor.skills[kind];
    if (!skill || actor.ki < skill.cost) continue;
    const damaging = skill.effects.some((effect) => effect.op === "damage");
    const shielding = skill.effects.some((effect) => effect.op === "shield");
    const healing = skill.effects.some((effect) => effect.op === "heal");
    if (shielding && !damaging && actor.shield > actor.maxHp * 0.18) continue;
    if (healing && !damaging && actor.hp > actor.maxHp * 0.62) continue;
    return kind;
  }
  return "basic";
}

export function makeAlly(id: string, progress: { level: number; stars: number }): Unit {
  const fighter = FIGHTER[id];
  const stats = statsOf(fighter, progress);
  return {
    iid: `a-${id}`,
    ref: id,
    name: fighter.name,
    side: "ally",
    element: fighter.element,
    portrait: id,
    hp: stats.hp,
    maxHp: stats.hp,
    ki: 30,
    atk: stats.atk,
    def: stats.def,
    spd: stats.spd,
    crit: fighter.crit,
    shield: 0,
    statuses: [],
    alive: true,
    skills: fighter.skills,
    ai: ["ult", "skill", "basic"],
  };
}

export function makeEnemy(spawn: Spawn, index: number): Unit {
  const template = ENEMIES[spawn.ref];
  const maxHp = spawn.hp ?? template.hp;
  return {
    iid: `e-${template.id}-${index}`,
    ref: template.id,
    name: spawn.name ?? template.name,
    side: "enemy",
    element: template.element,
    portrait: spawn.portrait ?? template.portrait,
    hp: maxHp,
    maxHp,
    ki: template.ki,
    atk: spawn.atk ?? template.atk,
    def: spawn.def ?? template.def,
    spd: spawn.spd ?? template.spd,
    crit: template.crit,
    shield: 0,
    statuses: [],
    alive: true,
    skills: template.skills,
    ai: template.ai,
  };
}
