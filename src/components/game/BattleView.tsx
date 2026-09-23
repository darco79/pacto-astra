import { useEffect, useRef, useState } from "react";
import { act, chooseEnemyAction, makeAlly, makeEnemy, startBattle } from "@/game/combat";
import { sfx } from "@/game/audio";
import { FIGHTER } from "@/game/roster";
import { squadSynergy } from "@/game/synergy";
import { useGame } from "@/game/store";
import type { BattleSetup, BattleState, Ev, SkillKind, Unit } from "@/game/types";
import { Btn, Portrait, type Floater } from "./ui";

function createBattle(setup: BattleSetup) {
  const { team, owned } = useGame.getState();
  const ids = team.filter((id): id is string => !!id && !!owned[id]);
  const allies = ids.map((id) => makeAlly(id, owned[id]));
  const enemies = setup.spawns.map((spawn, index) => makeEnemy(spawn, index));
  return startBattle({ allies, enemies, mod: setup.mod, synergy: squadSynergy(ids.map((id) => FIGHTER[id])) });
}

export function BattleView({ setup, onExit }: { setup: BattleSetup; onExit: () => void }) {
  const [battle, setBattle] = useState<BattleState>(() => createBattle(setup));
  const [busy, setBusy] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const [floats, setFloats] = useState<Floater[]>([]);
  const [flash, setFlash] = useState<Set<string>>(new Set());
  const [shaking, setShaking] = useState(false);
  const [askQuit, setAskQuit] = useState(false);
  const claimed = useRef(false);
  const cheered = useRef(false);
  const floatSeq = useRef(1);
  const timers = useRef<number[]>([]);

  const speed = useGame((state) => state.speed);
  const shakeOn = useGame((state) => state.shake);

  useEffect(() => {
    return () => {
      for (const timer of timers.current) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (battle.phase === "victory" && !cheered.current) {
      cheered.current = true;
      sfx("win");
    }
  }, [battle.phase]);

  const actor = battle.units.find((unit) => unit.iid === battle.actorId) ?? null;
  const enemies = battle.units.filter((unit) => unit.side === "enemy");
  const allies = battle.units.filter((unit) => unit.side === "ally");
  const livingEnemies = enemies.filter((unit) => unit.alive);
  const focusId = livingEnemies.some((unit) => unit.iid === focus) ? focus : (livingEnemies[0]?.iid ?? null);

  function later(fn: () => void, ms: number) {
    const timer = window.setTimeout(fn, ms);
    timers.current.push(timer);
  }

  function present(events: Ev[]) {
    const batch = events.filter((event) => event.t === "dmg" || event.t === "heal");
    if (batch.length > 0) {
      const nextFloats = batch.map((event) => {
        const key = floatSeq.current++;
        if (event.t === "heal") return { key, iid: event.id, text: `+${event.amount}`, tone: "heal" as const };
        if (event.blocked) return { key, iid: event.id, text: "Escudo", tone: "dmg" as const };
        return { key, iid: event.id, text: `${event.crit ? "!" : ""}${event.amount}`, tone: "dmg" as const };
      });
      setFloats((current) => [...current, ...nextFloats].slice(-12));
      setFlash(new Set(batch.map((event) => event.id)));
      const keys = nextFloats.map((item) => item.key);
      later(() => {
        setFloats((current) => current.filter((item) => !keys.includes(item.key)));
        setFlash(new Set());
      }, 680);
    }
    const power = events.reduce((max, event) => (event.t === "shake" ? Math.max(max, event.power) : max), 0);
    if (power > 0 && shakeOn) {
      setShaking(true);
      later(() => setShaking(false), 280);
    }
    if (events.some((event) => event.t === "ko")) sfx("ko");
    else if (events.some((event) => event.t === "shake" && event.power > 0.7)) sfx("ult");
    else if (events.some((event) => event.t === "heal")) sfx("heal");
    else if (events.some((event) => event.t === "dmg")) sfx("hit");
  }

  function commit(result: { state: BattleState; events: Ev[] }) {
    if (result.events.length === 0 && result.state === battle) return;
    setBattle(result.state);
    setBusy(true);
    present(result.events);
    later(() => setBusy(false), speed === 2 ? 220 : 480);
  }

  useEffect(() => {
    if (busy || battle.phase !== "pick" || !battle.actorId) return;
    const current = battle.units.find((unit) => unit.iid === battle.actorId);
    if (!current || current.side !== "enemy") return;
    const timer = window.setTimeout(() => {
      const kind = chooseEnemyAction(current);
      commit(act(battle, kind, null));
    }, speed === 2 ? 280 : 640);
    return () => window.clearTimeout(timer);
    // commit closes over latest battle because the effect restarts when battle changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battle, busy, speed]);

  function playerAct(kind: SkillKind) {
    if (busy || !actor || actor.side !== "ally" || battle.phase !== "pick") return;
    const skill = actor.skills[kind];
    if (!skill || actor.ki < skill.cost) {
      sfx("deny");
      return;
    }
    sfx("click");
    commit(act(battle, kind, focusId));
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "1") playerAct("basic");
      if (event.key === "2") playerAct("skill");
      if (event.key === "3" && actor?.skills.ult) playerAct("ult");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function finish(retry = false) {
    if (retry) {
      claimed.current = false;
      cheered.current = false;
      setBattle(createBattle(setup));
      setBusy(false);
      setFloats([]);
      setAskQuit(false);
      return;
    }
    if (battle.phase === "victory" && !claimed.current) {
      claimed.current = true;
      useGame.getState().grantVictory({
        chapterId: setup.chapterId,
        crystals: setup.rewards.crystals,
        orbs: setup.rewards.orbs,
        grant: setup.rewards.grant,
      });
    }
    onExit();
  }

  const synergy = squadSynergy(
    useGame.getState().team.filter((id): id is string => !!id).map((id) => FIGHTER[id]),
  );
  const skill = actor?.skills.skill;
  const ult = actor?.skills.ult;
  const yourTurn = !busy && actor?.side === "ally" && battle.phase === "pick";

  return (
    <div className={shaking ? "shake" : undefined}>
      <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-3 py-3">
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold">{setup.place}</p>
            <h1 className="font-display text-4xl uppercase leading-none">{setup.title}</h1>
            <p className="text-sm text-muted">
              Ronda {Math.max(1, battle.round)}
              {setup.modLabel ? ` · ${setup.modLabel}` : ""}
              {synergy.notes.length ? ` · ${synergy.notes.join(" ")}` : ""}
            </p>
          </div>
          {battle.phase === "pick" ? (
            <Btn tone="ghost" className="text-xl" onClick={() => setAskQuit(true)}>
              Retirada
            </Btn>
          ) : null}
        </header>

        <UnitRow
          units={enemies}
          floats={floats}
          flash={flash}
          activeId={actor?.iid}
          focusId={focusId}
          onPick={(id) => {
            setFocus(id);
            sfx("click");
          }}
        />

        <p className="py-3 text-center font-display text-2xl uppercase tracking-wide text-gold">
          {battle.phase === "victory"
            ? "Victoria"
            : battle.phase === "defeat"
              ? "Derrota"
              : actor
                ? actor.side === "ally"
                  ? `Turno de ${actor.name}`
                  : `${actor.name} actúa`
                : "…"}
        </p>

        <UnitRow units={allies} floats={floats} flash={flash} activeId={actor?.iid} />

        <div className="mt-3 min-h-16 rounded-xl border border-line bg-surface/80 px-3 py-2" aria-live="polite">
          {battle.log.slice(-3).map((line) => (
            <p key={line.id} className="text-sm text-muted">
              {line.text}
            </p>
          ))}
        </div>

        {battle.phase === "pick" ? (
          <div className="mt-3 grid grid-cols-3 gap-2 pb-2">
            <Btn tone="ghost" className="px-2 text-lg leading-none" disabled={!yourTurn} onClick={() => playerAct("basic")}>
              Ataque
              <span className="mt-1 block font-sans text-xs normal-case tracking-normal text-muted">+22 ki</span>
            </Btn>
            <Btn
              tone="ghost"
              className="px-2 text-lg leading-none"
              disabled={!yourTurn || !skill || (actor?.ki ?? 0) < (skill?.cost ?? 99)}
              onClick={() => playerAct("skill")}
            >
              Habilidad
              <span className="mt-1 block font-sans text-xs normal-case tracking-normal text-muted">{skill ? `${skill.cost} ki` : ""}</span>
            </Btn>
            <Btn
              className="px-2 text-lg leading-none"
              disabled={!yourTurn || !ult || (actor?.ki ?? 0) < (ult?.cost ?? 99)}
              onClick={() => playerAct("ult")}
            >
              Definitiva
              <span className="mt-1 block font-sans text-xs normal-case tracking-normal text-ink/80">{ult ? `${ult.cost} ki` : ""}</span>
            </Btn>
          </div>
        ) : null}
        {yourTurn ? (
          <p className="pb-4 text-center text-sm text-muted">
            {actor?.skills.skill.name}: {actor?.skills.skill.blurb}
            {ult ? ` · ${ult.name}: ${ult.blurb}` : ""}
          </p>
        ) : (
          <div className="pb-4" />
        )}
      </div>

      {battle.phase !== "pick" ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-bg/80 px-4">
          <div className="w-full max-w-md rounded-card border border-line bg-surface p-5">
            <h2 className="font-display text-5xl uppercase text-gold">{battle.phase === "victory" ? "Victoria" : "El ki se rompe"}</h2>
            {battle.phase === "victory" ? (
              <ul className="mt-3 space-y-1 text-sm">
                <li className="tabular-nums">+{setup.rewards.crystals} cristales</li>
                <li className="tabular-nums">+{setup.rewards.orbs} orbes de ki</li>
                {setup.rewards.grant ? <li>Una luchadora se une al pacto, o deja orbes si ya estaba.</li> : null}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">La escuadra sigue en pie fuera del anillo. Puedes reintentar o entrenar en el dojo.</p>
            )}
            <div className="mt-5 grid gap-2">
              {battle.phase === "victory" ? (
                <Btn onClick={() => finish(false)}>Continuar</Btn>
              ) : (
                <>
                  <Btn onClick={() => finish(true)}>Reintentar</Btn>
                  <Btn tone="ghost" onClick={() => finish(false)}>
                    Volver
                  </Btn>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {askQuit ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-bg/80 px-4">
          <div className="w-full max-w-md rounded-card border border-line bg-surface p-5">
            <h2 className="font-display text-4xl uppercase">¿Dejar el anillo?</h2>
            <p className="mt-2 text-sm text-muted">No hay recompensa si te retiras.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Btn tone="ghost" onClick={() => setAskQuit(false)}>
                Seguir
              </Btn>
              <Btn tone="ember" onClick={onExit}>
                Retirarse
              </Btn>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function UnitRow({
  units,
  floats,
  flash,
  activeId,
  focusId,
  onPick,
}: {
  units: Unit[];
  floats: Floater[];
  flash: Set<string>;
  activeId?: string;
  focusId?: string | null;
  onPick?: (id: string) => void;
}) {
  return (
    <div className={units.length <= 1 ? "mx-auto grid max-w-44 grid-cols-1 gap-2" : units.length === 2 ? "grid grid-cols-2 gap-2" : "grid grid-cols-3 gap-2"}>
      {units.map((unit) => (
        <Portrait
          key={unit.iid}
          portrait={unit.portrait}
          name={unit.name}
          element={unit.element}
          hp={unit.hp}
          maxHp={unit.maxHp}
          ki={unit.ki}
          shield={unit.shield}
          statuses={unit.statuses}
          active={unit.iid === activeId}
          dead={!unit.alive}
          selected={unit.iid === focusId}
          flashed={flash.has(unit.iid)}
          floats={floats.filter((item) => item.iid === unit.iid)}
          imageFilter={unit.ref === "acechador" ? "hue-rotate-90 saturate-150" : unit.ref === "centinela" ? "brightness-75" : undefined}
          onClick={onPick && unit.alive ? () => onPick(unit.iid) : undefined}
        />
      ))}
    </div>
  );
}
