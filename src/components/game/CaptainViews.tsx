import { useState } from "react";
import { WELL } from "@/game/content";
import { FEATURED_ID, MISSIONS, SHOP_PRICE, todayDuty } from "@/game/duty";
import { sfx } from "@/game/audio";
import { FIGHTERS } from "@/game/roster";
import { localDay, useGame } from "@/game/store";
import type { BattleSetup } from "@/game/types";
import { Btn, Portrait } from "./ui";

export function CaptainIntro({ onChoose }: { onChoose: (screen: "story" | "summon" | "squad" | "dojo") => void }) {
  const [step, setStep] = useState<"post" | "oath" | "order">("post");

  if (step === "post") {
    return (
      <div className="space-y-4">
        <p className="font-display text-6xl uppercase leading-none text-gold">Capitán</p>
        <p className="text-sm">
          Eres el capitán de dos luchadoras de ki. Lira Voss guarda el puerto. Mira Sol enciende el dojo. El Sindicato Nulo está bebiendo los pozos. Si se apagan, los Anillos se quedan sin vuelo.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Portrait portrait="lira" name="Lira Voss" rarity="R" element="acero" subtitle="Inventora" ratio="square" />
          <Portrait portrait="mira" name="Mira Sol" rarity="SR" element="fuego" subtitle="Princesa del dojo" ratio="square" />
        </div>
        <p className="text-sm text-muted">Tu primera misión no es el asalto. Es sellar el pacto. Después eliges cómo recuperar los pozos.</p>
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
        <p className="text-sm">El cristal responde solo si el capitán lo acepta. Ellas pegan. Tú marcas el siguiente paso contra el Sindicato Nulo.</p>
        <Btn
          onClick={() => {
            sfx("rare");
            setStep("order");
          }}
        >
          Sellar el pacto
        </Btn>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-widest text-gold">Pacto sellado</p>
      <p className="font-display text-5xl uppercase leading-none">Elige el paso</p>
      <p className="text-sm text-muted">Los pozos siguen abiertos. El Sindicato no se ha ido. Tú decides por dónde empezar.</p>
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
