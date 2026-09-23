import { useEffect, useRef, useState } from "react";
import { WELL } from "@/game/content";
import { FEATURED_ID, MISSIONS, SHOP_PRICE, todayDuty } from "@/game/duty";
import { sfx } from "@/game/audio";
import { FIGHTER, FIGHTERS } from "@/game/roster";
import { RITE_IDS, localDay, useGame, type PullCard } from "@/game/store";
import type { BattleSetup, Rarity } from "@/game/types";
import { CrystalBreak } from "./CrystalBreak";
import { Btn, Portrait } from "./ui";

const RITE_PLAN: { title: string; rarity: Rarity; body: string; hint: string }[] = [
  {
    title: "Primer cristal",
    rarity: "R",
    body: "Lira Voss está dentro. Esta invocación no es un azar: el pacto te la debe.",
    hint: "Rareza R. El cristal se parte en polvo claro.",
  },
  {
    title: "Segundo cristal",
    rarity: "SR",
    body: "Mira Sol enciende el dojo. También está garantizada.",
    hint: "Rareza SR. Más brillo y más fragmentos.",
  },
  {
    title: "Tercer cristal",
    rarity: "SSR",
    body: "Sable Orrin dejó el anillo para responder aquí. Es SSR, y tampoco sale al azar.",
    hint: "Rareza SSR. El golpe es oro y brasa.",
  },
];

export function CaptainIntro({
  onChoose,
  startAt = "post",
}: {
  onChoose: (screen: "story" | "summon" | "squad" | "dojo") => void;
  startAt?: "post" | "rite";
}) {
  const [step, setStep] = useState<"post" | "oath" | "rite" | "lesson" | "order">(startAt);

  if (step === "post") {
    return (
      <div className="space-y-4">
        <p className="font-display text-6xl uppercase leading-none text-gold">Capitán</p>
        <p className="text-sm">
          Aún no tienes escuadra. Tu primera misión es romper tres cristales y sellar el pacto con Lira Voss, Mira Sol y Sable Orrin. Después tú eliges cómo recuperar los pozos y frenar al Sindicato Nulo.
        </p>
        <div className="grid grid-cols-3 gap-2">
          <Portrait portrait="lira" name="Lira Voss" rarity="R" element="acero" subtitle="Garantizada" ratio="square" />
          <Portrait portrait="mira" name="Mira Sol" rarity="SR" element="fuego" subtitle="Garantizada" ratio="square" />
          <Portrait portrait="sable" name="Sable Orrin" rarity="SSR" element="gravedad" subtitle="Garantizada" ratio="square" />
        </div>
        <Btn
          onClick={() => {
            sfx("click");
            setStep("oath");
          }}
        >
          Primera misión
        </Btn>
      </div>
    );
  }

  if (step === "oath") {
    return (
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-gold">Misión 1</p>
        <p className="font-display text-6xl uppercase leading-none text-gold">El pacto</p>
        <p className="text-sm">El cristal responde solo si el capitán lo rompe. Ellas pegan. Tú marcas el siguiente paso. Las tres primeras no dependen de la suerte.</p>
        <Btn
          onClick={() => {
            sfx("click");
            setStep("rite");
          }}
        >
          Abrir el primer cristal
        </Btn>
      </div>
    );
  }

  if (step === "rite") {
    return <RiteStep onDone={() => setStep("lesson")} />;
  }

  if (step === "lesson") {
    return <DuplicateLesson onDone={() => setStep("order")} />;
  }

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-widest text-gold">Pacto sellado</p>
      <p className="font-display text-5xl uppercase leading-none">Elige el paso</p>
      <p className="text-sm text-muted">Lira, Mira y Sable ya están en la escuadra. Los pozos siguen abiertos. Tú decides por dónde empezar.</p>
      <div className="grid gap-2">
        <Btn onClick={() => onChoose("story")}>Recuperar el pozo del puerto</Btn>
        <Btn tone="ghost" onClick={() => onChoose("summon")}>
          Invocar más luchadoras
        </Btn>
        <Btn tone="ghost" onClick={() => onChoose("squad")}>
          Ordenar la escuadra
        </Btn>
        <Btn tone="ghost" onClick={() => onChoose("dojo")}>
          Entrar al dojo
        </Btn>
      </div>
    </div>
  );
}

function RiteStep({ onDone }: { onDone: () => void }) {
  const rite = useGame((state) => state.rite);
  const breakRite = useGame((state) => state.breakRite);
  const [card, setCard] = useState<PullCard | null>(null);
  const [open, setOpen] = useState(false);
  const owned = useGame((state) => state.owned);
  const plan = RITE_PLAN[Math.min(rite, RITE_IDS.length - 1)] ?? RITE_PLAN[0];
  const advanced = useRef(false);

  useEffect(() => {
    if (advanced.current || card || open || rite < RITE_IDS.length) return;
    advanced.current = true;
    onDone();
  }, [rite, card, open, onDone]);

  if (rite >= RITE_IDS.length && !card && !open) return null;

  if (open && !card && plan) {
    return (
      <CrystalBreak
        rarity={plan.rarity}
        title={plan.title}
        hint={plan.hint}
        onDone={() => {
          setCard(breakRite());
          setOpen(false);
        }}
      />
    );
  }

  if (card) {
    const fighter = FIGHTER[card.id];
    const dup = !card.isNew;
    return (
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-gold">Guía · cristal {Math.min(rite, 3)} de 3</p>
        <Portrait portrait={card.id} name={fighter.name} rarity={fighter.rarity} element={fighter.element} stars={owned[card.id]?.stars} />
        <p className="text-sm">
          {dup
            ? card.starUp
              ? `${fighter.name} ya estaba en el pacto. Un duplicado sube una estrella y da ${card.orbs} orbes de ki.`
              : `${fighter.name} ya tiene 5 estrellas. El duplicado solo da orbes: ${card.orbs}.`
            : `${fighter.name} entra al pacto. Rareza ${fighter.rarity}.`}
        </p>
        <Btn
          onClick={() => {
            sfx("click");
            setCard(null);
            if (rite >= RITE_IDS.length) onDone();
          }}
        >
          {rite >= RITE_IDS.length ? "Qué es un duplicado" : "Siguiente cristal"}
        </Btn>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-widest text-gold">Guía · cristal {rite + 1} de 3</p>
      <p className="font-display text-5xl uppercase leading-none">{plan.title}</p>
      <p className="text-sm">{plan.body}</p>
      <Btn
        onClick={() => {
          sfx("click");
          setOpen(true);
        }}
      >
        Romper el cristal
      </Btn>
    </div>
  );
}

function DuplicateLesson({ onDone }: { onDone: () => void }) {
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-widest text-gold">Guía · duplicados</p>
      <p className="font-display text-5xl uppercase leading-none">Si se repite</p>
      <p className="text-sm">El cristal a veces devuelve a quien ya está en el pacto. No se descarta. Un duplicado sube una estrella, hasta 5, y da orbes de ki.</p>
      <ul className="space-y-2 text-sm text-muted">
        <li>Orbes por duplicado: R 22, SR 48, SSR 110, UR 240.</li>
        <li>A 5 estrellas ya no sube más. Solo orbes, y un poco más: R 33, SR 72, SSR 165, UR 360.</li>
        <li>Cada estrella suma cerca de un 8% de vida, ataque y defensa, y 1 de velocidad.</li>
        <li>El dojo gasta orbes para subir el nivel, no las estrellas. El nivel llega a 25.</li>
      </ul>
      <Btn
        onClick={() => {
          sfx("click");
          onDone();
        }}
      >
        Entendido
      </Btn>
    </div>
  );
}

export function OrdenView({ onStart, onBack }: { onStart: (setup: BattleSetup) => void; onBack: () => void }) {
  const duty = useGame((state) => state.duty);
  const bossDay = useGame((state) => state.bossDay);
  const team = useGame((state) => state.team);
  const claimMission = useGame((state) => state.claimMission);
  const today = todayDuty(duty, localDay());
  const bossDone = bossDay === localDay();
  const [warn, setWarn] = useState("");

  function startBoss() {
    if (bossDone) return;
    if (!team.some(Boolean)) {
      setWarn("Asigna al menos una luchadora en Escuadra.");
      sfx("deny");
      return;
    }
    setWarn("");
    sfx("click");
    onStart({
      chapterId: "pozo",
      title: WELL.title,
      place: WELL.place,
      mod: null,
      modLabel: "",
      spawns: WELL.spawns,
      rewards: WELL.rewards,
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-gold">Orden del día</p>
        <h1 className="font-display text-5xl uppercase leading-none">Misiones</h1>
        <p className="mt-1 text-sm text-muted">Se renuevan al cambiar el día. Cada una se cobra una vez.</p>
      </div>
      <ul className="space-y-2">
        {MISSIONS.map((mission) => {
          const current = Math.min(mission.goal, today[mission.key]);
          const ready = current >= mission.goal;
          const claimed = today.claimed.includes(mission.id);
          const pay = [mission.crystals ? `${mission.crystals} cristales` : "", mission.orbs ? `${mission.orbs} orbes` : ""].filter(Boolean).join(" · ");
          return (
            <li key={mission.id} className="rounded-card border border-line bg-surface px-3 py-3">
              <p className="font-display text-2xl uppercase leading-none">{mission.title}</p>
              <p className="mt-1 text-sm text-muted">{mission.detail}</p>
              <p className="mt-1 text-xs tabular-nums text-muted">
                {current}/{mission.goal} · {pay}
              </p>
              <div className="mt-2">
                <Btn
                  tone={claimed ? "ghost" : "gold"}
                  disabled={!ready || claimed}
                  onClick={() => {
                    if (claimMission(mission.id)) sfx("win");
                    else sfx("deny");
                  }}
                >
                  {claimed ? "Cobrada" : ready ? "Cobrar" : "Pendiente"}
                </Btn>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="rounded-card border border-line bg-surface px-3 py-3">
        <p className="text-xs uppercase tracking-widest text-gold">Una vez al día</p>
        <p className="font-display text-3xl uppercase leading-none">Jefe del pozo</p>
        <p className="mt-1 text-sm text-muted">Más duro que un capítulo, y paga mejor que un asalto de práctica. Si pierdes, el intento sigue disponible.</p>
        <p className="mt-1 text-xs text-muted">Recompensa: {WELL.rewards.crystals} cristales · {WELL.rewards.orbs} orbes.</p>
        {warn ? <p className="mt-2 text-sm text-ember">{warn}</p> : null}
        <div className="mt-2">
          <Btn disabled={bossDone} onClick={startBoss}>
            {bossDone ? "Pozo cerrado hoy" : "Entrar al pozo"}
          </Btn>
        </div>
      </div>
      <Btn tone="ghost" onClick={onBack}>
        Volver al pacto
      </Btn>
    </div>
  );
}

export function ShopView({ onBack }: { onBack: () => void }) {
  const crystals = useGame((state) => state.crystals);
  const owned = useGame((state) => state.owned);
  const buyCard = useGame((state) => state.buyCard);
  const [note, setNote] = useState("");
  const stock = FIGHTERS.filter((fighter) => fighter.rarity === "R" || fighter.rarity === "SR");

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-gold">Tienda del pacto</p>
        <h1 className="font-display text-5xl uppercase leading-none">Carta concreta</h1>
        <p className="mt-1 text-sm text-muted">
          Solo R y SR. Si ya la tienes, el duplicado sube una estrella. Tienes <span className="tabular-nums text-fg">{crystals}</span> cristales.
        </p>
      </div>
      {note ? <p className="text-sm text-gold">{note}</p> : null}
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stock.map((fighter) => {
          const price = fighter.rarity === "SR" ? SHOP_PRICE.SR : SHOP_PRICE.R;
          const have = owned[fighter.id];
          return (
            <li key={fighter.id} className="space-y-2">
              <Portrait
                portrait={fighter.id}
                name={fighter.name}
                rarity={fighter.rarity}
                element={fighter.element}
                subtitle={have ? `Ya en el pacto · ${price}` : `${price} cristales`}
                level={have?.level}
                stars={have?.stars}
              />
              <Btn
                tone="ghost"
                disabled={crystals < price}
                onClick={() => {
                  const card = buyCard(fighter.id);
                  if (!card) {
                    sfx("deny");
                    return;
                  }
                  sfx(card.isNew ? "rare" : "pull");
                  setNote(card.isNew ? `${fighter.name} entra al pacto.` : card.starUp ? `${fighter.name} sube una estrella.` : `${fighter.name} deja ${card.orbs} orbes.`);
                }}
              >
                {price}
              </Btn>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-muted">Las SSR y las UR no se compran. {FIGHTERS.find((fighter) => fighter.id === FEATURED_ID)?.name ?? "La destacada"} sale en el banner.</p>
      <Btn tone="ghost" onClick={onBack}>
        Volver al pacto
      </Btn>
    </div>
  );
}
