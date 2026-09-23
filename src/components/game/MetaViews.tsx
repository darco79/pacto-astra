import { useEffect, useState } from "react";
import { ACHIEVEMENTS } from "@/game/achievements";
import { CHAPTERS, PRACTICE } from "@/game/content";
import { sfx } from "@/game/audio";
import { rateRows } from "@/game/gacha";
import { leaderAura } from "@/game/synergy";
import { COST_ONE, COST_TEN, ELEMENT_LABEL, FIGHTERS, LEVEL_CAP, PITY_MAX, RANK, ROLE_LABEL, levelCost, rateSquad, statsOf } from "@/game/roster";
import { localDay, useGame, type PullCard } from "@/game/store";
import type { BattleSetup, ChoiceMod, Rarity } from "@/game/types";
import { Btn, Portrait, Stars, rarityTone, roleLine } from "./ui";
import { CrystalBreak } from "./CrystalBreak";

export function HubView({ onNavigate }: { onNavigate: (screen: "story" | "summon" | "squad" | "dojo" | "logros" | "orden" | "tienda") => void }) {
  const team = useGame((state) => state.team);
  const owned = useGame((state) => state.owned);
  const cleared = useGame((state) => state.cleared);
  const xp = useGame((state) => state.xp);
  const next = CHAPTERS.find((chapter) => !cleared.includes(chapter.id)) ?? CHAPTERS[CHAPTERS.length - 1];
  const rating = rateSquad(team, owned);

  return (
    <div className="space-y-5">
      <section>
        <p className="text-xs uppercase tracking-widest text-gold">Escuadra en el anillo</p>
        <h1 className="font-display text-5xl uppercase leading-none">El pacto</h1>
        <p className="mt-1 max-w-prose text-sm text-muted">
          Tres puestos, ki medido y un sindicato que bebe los pozos. Tú eliges el siguiente paso. Poder de escuadra{" "}
          <span className="tabular-nums text-fg">{rating.total}</span>. Experiencia{" "}
          <span className="tabular-nums text-fg">{xp}</span>.
          {rating.leader ? ` ${rating.leader.note}` : ""}
          {rating.synergy.notes.length ? ` ${rating.synergy.notes.join(" ")}` : ""}
        </p>
      </section>
      <div className="grid grid-cols-3 gap-2">
        {team.map((id, index) =>
          id && owned[id] ? (
            <Portrait
              key={id}
              portrait={id}
              name={FIGHTER(id).name}
              rarity={FIGHTER(id).rarity}
              element={FIGHTER(id).element}
              subtitle={ROLE_LABEL[FIGHTER(id).role]}
              level={owned[id].level}
              stars={owned[id].stars}
              ratio="square"
            />
          ) : (
            <button
              key={`empty-${index}`}
              type="button"
              onClick={() => onNavigate("squad")}
              className="grid aspect-square place-items-center rounded-card border border-dashed border-line bg-surface text-sm text-muted"
            >
              Puesto vacío
            </button>
          ),
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Btn onClick={() => onNavigate("story")}>{cleared.length >= CHAPTERS.length ? "Repetir crónica" : `Continuar: ${next.title}`}</Btn>
        <Btn tone="ghost" onClick={() => onNavigate("summon")}>
          Invocar
        </Btn>
        <Btn tone="ghost" onClick={() => onNavigate("orden")}>
          Misiones y jefe
        </Btn>
        <Btn tone="ghost" onClick={() => onNavigate("tienda")}>
          Tienda
        </Btn>
        <Btn tone="ghost" onClick={() => onNavigate("logros")}>
          Logros
        </Btn>
      </div>
      <p className="text-sm text-muted">
        Crónica {Math.min(cleared.length + 1, CHAPTERS.length)} de {CHAPTERS.length}. Los duplicados suben estrellas y dejan orbes para el dojo.
      </p>
    </div>
  );
}

function FIGHTER(id: string) {
  const fighter = FIGHTERS.find((item) => item.id === id);
  if (!fighter) throw new Error(`luchadora desconocida: ${id}`);
  return fighter;
}

export function StoryView({ onStart }: { onStart: (setup: BattleSetup) => void }) {
  const cleared = useGame((state) => state.cleared);
  const team = useGame((state) => state.team);
  const [open, setOpen] = useState<string | null>(null);
  const [line, setLine] = useState(0);
  const [step, setStep] = useState<"talk" | "choice">("talk");
  const [warn, setWarn] = useState("");
  const chapter = CHAPTERS.find((item) => item.id === open) ?? null;

  function begin(id: string) {
    const index = CHAPTERS.findIndex((item) => item.id === id);
    const previous = index > 0 ? CHAPTERS[index - 1] : null;
    if (previous && !cleared.includes(previous.id)) return;
    if (!team.some(Boolean)) {
      setWarn("Asigna al menos una luchadora en Escuadra.");
      return;
    }
    setWarn("");
    setOpen(id);
    setLine(0);
    setStep("talk");
    sfx("click");
  }

  function launch(mod: ChoiceMod) {
    if (!chapter) return;
    const done = cleared.includes(chapter.id);
    const choice = chapter.choices.find((item) => item.id === mod);
    onStart({
      chapterId: chapter.id,
      title: chapter.title,
      place: chapter.place,
      mod,
      modLabel: choice?.label ?? "",
      spawns: chapter.spawns,
      rewards: done ? chapter.replay : chapter.rewards,
      replay: chapter.replay,
    });
  }

  if (!chapter) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold">Crónica</p>
          <h1 className="font-display text-5xl uppercase leading-none">Anillos Astra</h1>
          <p className="mt-1 text-sm text-muted">Ocho pozos. Un eclipse. El pacto entra cuando el capítulo anterior ya está cerrado.</p>
        </div>
        {warn ? <p className="text-sm text-ember">{warn}</p> : null}
        <ul className="space-y-2">
          {CHAPTERS.map((item, index) => {
            const previous = index > 0 ? CHAPTERS[index - 1] : null;
            const locked = Boolean(previous && !cleared.includes(previous.id));
            const done = cleared.includes(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => begin(item.id)}
                  className="w-full rounded-card border border-line bg-surface px-3 py-3 text-left disabled:opacity-40"
                >
                  <span className="text-xs uppercase tracking-widest text-gold">{item.place}</span>
                  <span className="mt-1 block font-display text-3xl uppercase leading-none">{item.title}</span>
                  <span className="mt-1 block text-sm text-muted">{locked ? "Cierra el capítulo anterior." : item.summary}</span>
                  <span className="mt-1 block text-xs text-gold">{done ? "Completado · se puede repetir" : locked ? "Cerrado" : "Disponible"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const spoken = chapter.lines[line];
  if (step === "talk" && spoken) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold">{chapter.place}</p>
          <h1 className="font-display text-5xl uppercase leading-none">{chapter.title}</h1>
        </div>
        <div className="rounded-card border border-line bg-surface p-4">
          <p className="text-xs uppercase tracking-widest text-gold">{spoken.speaker}</p>
          <p className="mt-2 text-sm">{spoken.text}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Btn tone="ghost" onClick={() => setOpen(null)}>
            Volver
          </Btn>
          <Btn
            onClick={() => {
              sfx("click");
              if (line + 1 >= chapter.lines.length) setStep("choice");
              else setLine((value) => value + 1);
            }}
          >
            {line + 1 >= chapter.lines.length ? "Elegir enfoque" : "Seguir"}
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-gold">{chapter.place}</p>
        <h1 className="font-display text-5xl uppercase leading-none">Enfoque</h1>
        <p className="mt-1 text-sm text-muted">Elige cómo entra la escuadra. La pelea empieza al tocar.</p>
      </div>
      <div className="grid gap-2">
        {chapter.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => launch(choice.id)}
            className="rounded-card border border-line bg-surface px-3 py-3 text-left"
          >
            <span className="block font-display text-3xl uppercase leading-none">{choice.label}</span>
            <span className="mt-1 block text-sm text-muted">{choice.detail}</span>
          </button>
        ))}
      </div>
      <Btn tone="ghost" onClick={() => setOpen(null)}>
        Volver
      </Btn>
    </div>
  );
}

export function SummonView() {
  const crystals = useGame((state) => state.crystals);
  const pity = useGame((state) => state.pity);
  const daily = useGame((state) => state.daily);
  const summon = useGame((state) => state.summon);
  const freeDaily = useGame((state) => state.freeDaily);
  const [results, setResults] = useState<PullCard[] | null>(null);
  const [reel, setReel] = useState<PullCard[] | null>(null);
  const [crack, setCrack] = useState<PullCard[] | null>(null);
  const [shown, setShown] = useState(0);
  const [banner, setBanner] = useState(false);
  const todayFree = daily === localDay();
  const rates = rateRows();

  useEffect(() => {
    if (!results || shown >= results.length) return;
    const timer = window.setTimeout(() => {
      const card = results[shown];
      if (card && (card.rarity === "SSR" || card.rarity === "UR")) sfx("rare");
      else sfx("pull");
      setShown((value) => value + 1);
    }, 260);
    return () => window.clearTimeout(timer);
  }, [results, shown]);

  function reveal(cards: PullCard[] | null) {
    if (!cards) {
      sfx("deny");
      return;
    }
    setResults(null);
    setShown(0);
    setReel(null);
    setCrack(cards);
  }

  function finishCrack() {
    const cards = crack;
    if (!cards) return;
    setCrack(null);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setResults(cards);
      setShown(0);
      return;
    }
    setReel(cards);
  }

  function finishReel() {
    setResults(reel);
    setReel(null);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-gold">Invocación</p>
        <h1 className="font-display text-5xl uppercase leading-none">Cristal de pacto</h1>
        <p className="mt-1 text-sm text-muted">
          {banner
            ? "Banner de Ione Marr: la mitad de las SSR de este cristal son ella. La lástima es la misma que en el cristal libre."
            : "Veintiocho luchadoras en el cristal. A las " + PITY_MAX + " invocaciones sin SSR o UR, la siguiente es alta rareza."}
        </p>
      </div>
      <div>
        <div className="mb-1 flex justify-between text-xs text-muted">
          <span>Garantía</span>
          <span className="tabular-nums">
            {pity}/{PITY_MAX}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full bg-gold" style={{ width: `${(pity / PITY_MAX) * 100}%` }} />
        </div>
      </div>
      <ul className="grid grid-cols-4 gap-2 text-center">
        {rates.map((row) => (
          <li key={row.rarity} className={`rounded-xl border px-1 py-2 ${rarityTone(row.rarity)}`}>
            <p className="font-display text-2xl leading-none">{row.rarity}</p>
            <p className="text-xs tabular-nums text-fg">{row.pct.toFixed(1)}%</p>
          </li>
        ))}
      </ul>
      {results ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {results.map((card, index) => {
              const fighter = FIGHTER(card.id);
              const visible = index < shown;
              return (
                <div key={`${card.id}-${index}`} className="flip-scene">
                  <div className={visible ? "flip-inner show" : "flip-inner"}>
                    <div className="flip-face">
                      <Portrait
                        portrait={fighter.id}
                        name={fighter.name}
                        rarity={fighter.rarity}
                        element={fighter.element}
                        subtitle={card.isNew ? "Nueva en el pacto" : card.starUp ? "Estrella +1" : `+${card.orbs} orbes`}
                      />
                    </div>
                    <div className="flip-face flip-back grid place-items-center rounded-card border border-gold bg-surface">
                      <span className="font-display text-4xl text-gold">KI</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Btn tone="ghost" onClick={() => setShown(results.length)}>
              Saltar
            </Btn>
            <Btn onClick={() => setResults(null)}>Listo</Btn>
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Btn tone={banner ? "ghost" : "gold"} onClick={() => setBanner(false)}>
              Cristal libre
            </Btn>
            <Btn tone={banner ? "gold" : "ghost"} onClick={() => setBanner(true)}>
              Banner de Ione
            </Btn>
          </div>
          <Btn disabled={crystals < COST_TEN} onClick={() => reveal(summon(10, banner))}>
            Invocación ×10 · {COST_TEN}
          </Btn>
          <Btn tone="ghost" disabled={crystals < COST_ONE} onClick={() => reveal(summon(1, banner))}>
            Invocación ×1 · {COST_ONE}
          </Btn>
          <Btn tone="ghost" disabled={todayFree} onClick={() => reveal(freeDaily())}>
            {todayFree ? "Llamado de hoy usado" : "Llamado diario gratis"}
          </Btn>
          <p className="text-sm text-muted">
            Cada ×10 garantiza al menos una carta SR o superior. Si repites a alguien, gana una estrella (hasta 5) y orbes de ki. A 5 estrellas solo caen orbes. Tienes{" "}
            <span className="tabular-nums text-fg">{crystals}</span> cristales. El destello se puede saltar.
          </p>
        </div>
      )}
      {crack ? (
        <CrystalBreak
          rarity={peakRarity(crack)}
          title={crack.length > 1 ? `Cristal ×${crack.length}` : "Cristal de pacto"}
          hint={
            crack.length > 1
              ? `La rareza más alta de esta invocación es ${peakRarity(crack)}. El cristal rompe con ese brillo.`
              : `Este cristal es ${peakRarity(crack)}. El brillo y el golpe marcan la rareza.`
          }
          onDone={finishCrack}
        />
      ) : null}
      {reel ? <SummonReel onDone={finishReel} /> : null}
    </div>
  );
}

function peakRarity(cards: PullCard[]) {
  return cards.reduce<Rarity>((best, card) => (RANK[card.rarity] > RANK[best] ? card.rarity : best), "R");
}

function SummonReel({ onDone }: { onDone: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-bg">
      <video src="/summon.mp4" autoPlay muted playsInline className="h-full w-full object-cover" onEnded={onDone} onError={onDone} />
      <div className="absolute inset-x-0 bottom-0 flex justify-center p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button type="button" onClick={onDone} className="min-h-12 rounded-full border border-gold bg-bg/80 px-6 font-display text-2xl uppercase tracking-wide text-gold">
          Saltar
        </button>
      </div>
    </div>
  );
}

function slotPower(id: string, owned: Record<string, { level: number; stars: number }>) {
  const progress = owned[id];
  if (!progress) return 0;
  const stats = statsOf(FIGHTER(id), progress);
  return stats.atk + Math.round(stats.hp / 10);
}

function FighterSheet({ id, slot, onClose }: { id: string; slot: number; onClose: () => void }) {
  const owned = useGame((state) => state.owned);
  const orbs = useGame((state) => state.orbs);
  const team = useGame((state) => state.team);
  const levelUp = useGame((state) => state.levelUp);
  const setSlot = useGame((state) => state.setSlot);
  const fighter = FIGHTER(id);
  const progress = owned[id];

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!progress) return null;
  const stats = statsOf(fighter, progress);
  const cost = levelCost(progress.level);
  const here = team.findIndex((seat) => seat === id);
  const capped = progress.level >= LEVEL_CAP;
  const aura = leaderAura(fighter.role).note;

  function place(index: number) {
    sfx("click");
    if (team[index] === id) setSlot(index, null);
    else setSlot(index, id);
  }

  return (
    <div className="fixed inset-0 z-50 grid items-end bg-bg/75 sm:place-items-center" role="presentation" onClick={onClose}>
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="ficha-title"
        className="max-h-[88dvh] w-full space-y-3 overflow-y-auto rounded-t-card border border-line bg-surface p-4 sm:max-w-md sm:rounded-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold">Ficha rápida</p>
            <h2 id="ficha-title" className="font-display text-4xl uppercase leading-none">
              {fighter.name}
            </h2>
            <p className="text-sm text-gold">{fighter.title}</p>
            <p className="text-xs text-muted">{roleLine(fighter.role, fighter.element)}</p>
          </div>
          <button type="button" className="min-h-11 px-2 text-sm text-gold" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <div className="grid grid-cols-[6.5rem_1fr] gap-3">
          <Portrait portrait={fighter.id} name={fighter.name} rarity={fighter.rarity} element={fighter.element} stars={progress.stars} />
          <div className="space-y-1 text-sm">
            <p>
              Nv. {progress.level} <Stars count={progress.stars} />
            </p>
            <p className="tabular-nums text-muted">
              Vida {stats.hp} · Ataque {stats.atk}
              <br />
              Defensa {stats.def} · Velocidad {stats.spd}
            </p>
            <p className="text-muted">Poder de carta {slotPower(id, owned)}.</p>
            <p className="text-gold">Pasiva si es líder: {aura}</p>
          </div>
        </div>
        <ul className="space-y-2">
          {([fighter.skills.basic, fighter.skills.skill, fighter.skills.ult] as const).map((skill) => (
            <li key={skill.kind} className="rounded-xl border border-line px-3 py-2">
              <p className="font-display text-2xl uppercase leading-none">
                {skill.name}
                <span className="ml-2 text-sm text-muted">
                  {skill.kind === "basic" ? "Ataque" : skill.kind === "skill" ? `Habilidad · ${skill.cost} ki` : "Definitiva · 100 ki"}
                </span>
              </p>
              <p className="text-sm text-muted">{skill.blurb}</p>
            </li>
          ))}
        </ul>
        <Btn
          disabled={capped || orbs < cost}
          onClick={() => {
            if (levelUp(fighter.id)) sfx("heal");
            else sfx("deny");
          }}
        >
          {capped ? "Nivel máximo" : `Subir nivel · ${cost} orbes`}
        </Btn>
        <p className="text-xs text-muted">Tienes {orbs} orbes. El puesto marcado ahora es el {slot + 1}{slot === 0 ? ", el de líder" : ""}.</p>
        <div className="grid gap-2">
          <Btn onClick={() => place(slot)}>
            {here === slot ? `Quitar del puesto ${slot + 1}` : here >= 0 ? `Mover al puesto ${slot + 1}` : `Poner en el puesto ${slot + 1}`}
            {slot === 0 && here !== slot ? " · líder" : ""}
          </Btn>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((index) => (
              <Btn key={index} tone={team[index] === id ? "gold" : "ghost"} className="px-2 text-xl" onClick={() => place(index)}>
                {index === 0 ? "Líder" : `Puesto ${index + 1}`}
              </Btn>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}

export function SquadView() {
  const team = useGame((state) => state.team);
  const owned = useGame((state) => state.owned);
  const [slot, setActive] = useState(0);
  const [sheet, setSheet] = useState<string | null>(null);
  const [reserveOpen, setReserveOpen] = useState(false);
  const rating = rateSquad(team, owned);
  const bench = Object.keys(owned)
    .filter((id) => !team.includes(id))
    .sort((a, b) => RANK[FIGHTER(b).rarity] - RANK[FIGHTER(a).rarity] || FIGHTER(a).name.localeCompare(FIGHTER(b).name, "es"));

  function openSheet(id: string, index?: number) {
    if (typeof index === "number") setActive(index);
    setSheet(id);
    sfx("click");
  }

  return (
    <div className="space-y-4 pb-16">
      <div>
        <p className="text-xs uppercase tracking-widest text-gold">Escuadra</p>
        <h1 className="font-display text-5xl uppercase leading-none">Tres puestos</h1>
        <p className="mt-1 text-sm text-muted">
          Toca una carta para abrir su ficha: nivel, habilidades y puesto. El puesto 1 es la líder y presta su pasiva a toda la escuadra.
        </p>
      </div>
      <section className="rounded-card border border-line bg-surface px-3 py-3">
        <p className="text-xs uppercase tracking-widest text-gold">Poder total</p>
        <p className="font-display text-5xl tabular-nums leading-none">{rating.total}</p>
        <p className="mt-1 text-xs text-muted">Base {rating.base}. Cambia al momento si mueves un puesto, subes de nivel o cambias de líder.</p>
        <p className={`mt-2 text-sm ${rating.leader ? "text-gold" : "text-muted"}`}>
          {rating.leader ? rating.leader.note : "El puesto 1 está vacío. Quien lo ocupe otorga su habilidad de líder."}
        </p>
        {rating.synergy.notes.map((note) => (
          <p key={note} className="mt-1 text-sm text-gold">
            {note}
          </p>
        ))}
      </section>
      <div className="grid grid-cols-3 gap-2">
        {team.map((id, index) =>
          id && owned[id] ? (
            <div key={id} className={`rounded-card ${slot === index ? "ring-2 ring-gold" : ""}`}>
              <button type="button" className="mb-1 w-full text-left" onClick={() => setActive(index)}>
                <span className="text-xs uppercase tracking-widest text-gold">{index === 0 ? "Puesto 1 · Líder" : `Puesto ${index + 1}`}</span>
                <span className="block text-xs tabular-nums text-muted">Poder {slotPower(id, owned)}</span>
              </button>
              <Portrait
                portrait={id}
                name={FIGHTER(id).name}
                rarity={FIGHTER(id).rarity}
                element={FIGHTER(id).element}
                subtitle={ROLE_LABEL[FIGHTER(id).role]}
                level={owned[id].level}
                stars={owned[id].stars}
                ratio="square"
                selected={slot === index}
                onClick={() => openSheet(id, index)}
              />
            </div>
          ) : (
            <button
              key={`empty-${index}`}
              type="button"
              onClick={() => {
                setActive(index);
                setReserveOpen(true);
                sfx("click");
              }}
              className={`grid aspect-square place-items-center rounded-card border border-dashed px-2 text-center text-sm ${slot === index ? "border-gold text-gold" : "border-line text-muted"}`}
            >
              {index === 0 ? "Líder vacío" : `Puesto ${index + 1} vacío`}
              <span className="mt-1 block text-xs">Abre la reserva</span>
            </button>
          ),
        )}
      </div>
      <section className="fixed inset-x-0 bottom-16 z-20 mx-auto max-w-3xl border-t border-line bg-bg/95">
        <button
          type="button"
          className="flex min-h-12 w-full items-center justify-between px-4 text-left"
          aria-expanded={reserveOpen}
          onClick={() => {
            setReserveOpen((open) => !open);
            sfx("click");
          }}
        >
          <span>
            <span className="text-xs uppercase tracking-widest text-gold">Reserva</span>
            <span className="ml-2 text-sm text-muted">{bench.length} fuera de los tres puestos</span>
          </span>
          <span className="text-sm text-gold">{reserveOpen ? "Ocultar" : "Desplegar"}</span>
        </button>
        {reserveOpen ? (
          <div className="max-h-64 overflow-y-auto px-4 pb-3">
            {bench.length === 0 ? (
              <p className="pb-2 text-sm text-muted">No hay suplentes. Invoca o saca a una titular desde su ficha.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {bench.map((id) => (
                  <Portrait
                    key={id}
                    portrait={id}
                    name={FIGHTER(id).name}
                    rarity={FIGHTER(id).rarity}
                    element={FIGHTER(id).element}
                    subtitle={ROLE_LABEL[FIGHTER(id).role]}
                    level={owned[id].level}
                    stars={owned[id].stars}
                    ratio="square"
                    onClick={() => openSheet(id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </section>
      {sheet && owned[sheet] ? <FighterSheet id={sheet} slot={slot} onClose={() => setSheet(null)} /> : null}
    </div>
  );
}

function kiMark(kind: "basic" | "skill" | "ult", cost: number, kiGain: number) {
  if (kind === "basic") return kiGain > 0 ? `Ataque · +${kiGain} ki` : "Ataque · 0 ki";
  if (kind === "skill") return `Habilidad · ${cost} ki`;
  return `Definitiva · ${cost} ki`;
}

function CodexDossier({
  fighter,
  progress,
}: {
  fighter: (typeof FIGHTERS)[number];
  progress?: { level: number; stars: number };
}) {
  const grown = progress ? statsOf(fighter, progress) : null;
  const stats = grown ?? { hp: fighter.hp, atk: fighter.atk, def: fighter.def, spd: fighter.spd };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[6.5rem_1fr] gap-3">
        <Portrait portrait={fighter.id} name={fighter.name} rarity={fighter.rarity} element={fighter.element} stars={progress?.stars} />
        <div>
          <p className="font-display text-3xl uppercase leading-none">{fighter.name}</p>
          <p className="text-sm text-gold">{fighter.title}</p>
          <p className="text-xs text-muted">{roleLine(fighter.role, fighter.element)}</p>
          {progress ? (
            <p className="mt-1 text-sm">
              Nv. {progress.level} <Stars count={progress.stars} />
            </p>
          ) : (
            <p className="mt-1 text-xs uppercase tracking-widest text-muted">Sin pacto</p>
          )}
          <p className="mt-2 text-sm tabular-nums text-muted">
            Vida {stats.hp} · Ataque {stats.atk}
            <br />
            Defensa {stats.def} · Velocidad {stats.spd}
            <br />
            Crítico {Math.round(fighter.crit * 100)}%
          </p>
          <p className="mt-1 text-xs text-muted">
            {progress ? "Stats con su nivel y estrellas." : "Stats de cristal, antes de nivel y estrellas."}
          </p>
        </div>
      </div>
      <p className="text-sm">{progress ? fighter.lore : "Aún no responde al cristal. Su historia se abre al unirse al pacto."}</p>
      <ul className="space-y-2">
        {([fighter.skills.basic, fighter.skills.skill, fighter.skills.ult] as const).map((skill) => (
          <li key={skill.kind} className="rounded-xl border border-line px-3 py-2">
            <div className="flex items-start justify-between gap-3">
              <p className="font-display text-2xl uppercase leading-none">{skill.name}</p>
              <p className="shrink-0 text-right text-xs uppercase tracking-widest text-gold">{kiMark(skill.kind, skill.cost, skill.kiGain)}</p>
            </div>
            <p className="mt-1 text-sm text-muted">{skill.blurb}</p>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">{ELEMENT_LABEL[fighter.element]} tiene ventaja contra el elemento que marca el ciclo del anillo.</p>
    </div>
  );
}

export function CodexView() {
  const owned = useGame((state) => state.owned);
  const [filter, setFilter] = useState<"todas" | Rarity>("todas");
  const [selected, setSelected] = useState(FIGHTERS[0]?.id ?? "lira");
  const [sheet, setSheet] = useState(false);
  const list = FIGHTERS.filter((fighter) => filter === "todas" || fighter.rarity === filter);
  const picked = FIGHTERS.find((item) => item.id === selected) ?? null;
  const shown = (picked && list.some((item) => item.id === picked.id) ? picked : list[0]) ?? null;
  const modalFighter = sheet && picked && list.some((item) => item.id === picked.id) ? picked : null;

  useEffect(() => {
    if (!modalFighter) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSheet(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalFighter]);

  function choose(id: string) {
    setSelected(id);
    setSheet(true);
    sfx("click");
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-gold">Códice</p>
        <h1 className="font-display text-5xl uppercase leading-none">Elenco</h1>
        <p className="mt-1 text-sm text-muted">
          {Object.keys(owned).length} de {FIGHTERS.length} en el pacto. Toca una carta: la ficha se abre al lado, o encima si la pantalla es estrecha.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["todas", "R", "SR", "SSR", "UR"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`min-h-11 rounded-full border px-3 text-sm ${filter === item ? "border-gold text-gold" : "border-line text-muted"}`}
          >
            {item === "todas" ? "Todas" : item}
          </button>
        ))}
      </div>
      <div className="md:grid md:grid-cols-[minmax(0,1fr)_20rem] md:items-start md:gap-4">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-3">
          {list.map((item) => (
            <Portrait
              key={item.id}
              portrait={item.id}
              name={item.name}
              rarity={item.rarity}
              element={item.element}
              subtitle={owned[item.id] ? ROLE_LABEL[item.role] : "Sin pacto"}
              selected={shown?.id === item.id}
              dim={!owned[item.id]}
              onClick={() => choose(item.id)}
            />
          ))}
        </div>
        <aside className="sticky top-2 hidden max-h-[calc(100dvh-8.5rem)] overflow-y-auto rounded-card border border-line bg-surface p-3 md:block">
          {shown ? <CodexDossier fighter={shown} progress={owned[shown.id]} /> : <p className="text-sm text-muted">No hay cartas en este filtro.</p>}
        </aside>
      </div>
      {modalFighter ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-bg/75 p-3 sm:place-items-center md:hidden" role="presentation" onClick={() => setSheet(false)}>
          <article
            role="dialog"
            aria-modal="true"
            aria-labelledby="codex-title"
            className="max-h-[min(88dvh,42rem)] w-full max-w-lg overflow-y-auto rounded-card border border-line bg-surface p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p id="codex-title" className="text-xs uppercase tracking-widest text-gold">
                Ficha del códice
              </p>
              <button type="button" className="min-h-11 px-2 text-sm text-gold" onClick={() => setSheet(false)}>
                Cerrar
              </button>
            </div>
            <CodexDossier fighter={modalFighter} progress={owned[modalFighter.id]} />
          </article>
        </div>
      ) : null}
    </div>
  );
}

export function DojoView({ onPractice }: { onPractice: (setup: BattleSetup) => void }) {
  const owned = useGame((state) => state.owned);
  const orbs = useGame((state) => state.orbs);
  const levelUp = useGame((state) => state.levelUp);
  const ids = Object.keys(owned);
  const [id, setId] = useState(ids[0] ?? "lira");
  const fighter = ids.includes(id) ? FIGHTER(id) : null;
  const progress = fighter ? owned[fighter.id] : undefined;
  const cost = progress ? levelCost(progress.level) : 0;
  const stats = fighter && progress ? statsOf(fighter, progress) : null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-gold">Dojo</p>
        <h1 className="font-display text-5xl uppercase leading-none">Entrenamiento</h1>
        <p className="mt-1 text-sm text-muted">
          Los orbes suben el nivel, hasta {LEVEL_CAP}. Las estrellas llegan con duplicados, no aquí. Tienes <span className="tabular-nums text-fg">{orbs}</span> orbes.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {ids.map((item) => {
          const card = FIGHTER(item);
          return (
            <Portrait
              key={item}
              portrait={item}
              name={card.name}
              rarity={card.rarity}
              element={card.element}
              level={owned[item].level}
              stars={owned[item].stars}
              selected={item === id}
              ratio="square"
              onClick={() => setId(item)}
            />
          );
        })}
      </div>
      {fighter && progress && stats ? (
        <div className="space-y-3 rounded-card border border-line bg-surface p-3">
          <p className="font-display text-3xl uppercase leading-none">{fighter.name}</p>
          <p className="text-sm text-muted">
            Nv. {progress.level} · vida {stats.hp} · ataque {stats.atk} · defensa {stats.def} · velocidad {stats.spd}
          </p>
          <Btn
            disabled={progress.level >= LEVEL_CAP || orbs < cost}
            onClick={() => {
              if (levelUp(fighter.id)) sfx("heal");
              else sfx("deny");
            }}
          >
            {progress.level >= LEVEL_CAP ? "Nivel máximo" : `Subir nivel · ${cost} orbes`}
          </Btn>
        </div>
      ) : null}
      <Btn
        tone="ghost"
        onClick={() =>
          onPractice({
            chapterId: null,
            title: PRACTICE.title,
            place: PRACTICE.place,
            mod: null,
            modLabel: "",
            spawns: PRACTICE.spawns,
            rewards: PRACTICE.rewards,
          })
        }
      >
        Asalto de práctica
      </Btn>
    </div>
  );
}

export function LogrosView({ onBack }: { onBack: () => void }) {
  const wins = useGame((state) => state.wins);
  const pulls = useGame((state) => state.pulls);
  const owned = useGame((state) => state.owned);
  const cleared = useGame((state) => state.cleared);
  const daily = useGame((state) => state.daily);
  const claimed = useGame((state) => state.claimed);
  const done = ACHIEVEMENTS.filter((item) => claimed.includes(item.id)).length;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-gold">El pacto</p>
        <h1 className="font-display text-5xl uppercase leading-none">Logros</h1>
        <p className="mt-1 text-sm text-muted">
          {done} de {ACHIEVEMENTS.length}. Cada logro deja cristales una sola vez.
        </p>
      </div>
      <Btn tone="ghost" onClick={onBack}>
        Volver al pacto
      </Btn>
      <ul className="space-y-2">
        {ACHIEVEMENTS.map((item) => {
          const current = Math.min(item.goal, item.current({ wins, pulls, owned, cleared, daily }));
          const ready = claimed.includes(item.id);
          return (
            <li key={item.id} className={`rounded-card border px-3 py-3 ${ready ? "border-gold bg-surface" : "border-line bg-surface/80"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl uppercase leading-none">{item.title}</p>
                  <p className="mt-1 text-sm text-muted">{item.detail}</p>
                </div>
                <p className="shrink-0 text-sm tabular-nums text-gold">{ready ? "Hecho" : `+${item.reward}`}</p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full bg-gold" style={{ width: `${(current / item.goal) * 100}%` }} />
              </div>
              <p className="mt-1 text-xs tabular-nums text-muted">
                {current}/{item.goal}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
