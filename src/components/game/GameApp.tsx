import { Dumbbell, Gem, Library, ScrollText, Settings, Sparkles, Users, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { playMusic, setMusicEnabled, setSfxEnabled, sfx, unlockAudio } from "@/game/audio";
import { useGame } from "@/game/store";
import type { BattleSetup } from "@/game/types";
import { cn } from "@/lib/cn";
import { BattleView } from "./BattleView";
import { CaptainIntro, OrdenView, ShopView } from "./CaptainViews";
import { CodexView, DojoView, HubView, LogrosView, SquadView, StoryView, SummonView } from "./MetaViews";
import { Btn, Meter } from "./ui";

type Screen = "hub" | "story" | "summon" | "squad" | "codex" | "dojo" | "logros" | "orden" | "tienda";

const NAV: { id: Screen; label: string; icon: typeof Users }[] = [
  { id: "story", label: "Crónica", icon: ScrollText },
  { id: "summon", label: "Invocar", icon: Sparkles },
  { id: "hub", label: "Pacto", icon: Gem },
  { id: "squad", label: "Escuadra", icon: Users },
  { id: "codex", label: "Códice", icon: Library },
];

export function GameApp() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void Promise.resolve(useGame.persist.rehydrate()).finally(() => setReady(true));
  }, []);
  if (!ready) return <Boot />;
  return <Play />;
}

function Boot() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
      <div>
        <p className="font-display text-6xl uppercase tracking-wide text-gold">Pacto Astra</p>
        <p className="mt-2 text-muted">El anillo está despertando…</p>
      </div>
    </main>
  );
}

function Play() {
  const introSeen = useGame((state) => state.introSeen);
  const seeIntro = useGame((state) => state.seeIntro);
  const sfxOn = useGame((state) => state.sfx);
  const [screen, setScreen] = useState<Screen>("hub");
  const [setup, setSetup] = useState<BattleSetup | null>(null);
  const [settings, setSettings] = useState(false);
  const [toast, setToast] = useState<string[] | null>(null);

  useEffect(() => {
    setSfxEnabled(sfxOn);
    setMusicEnabled(sfxOn);
  }, [sfxOn]);

  useEffect(() => {
    const boss = setup?.chapterId === "pozo" || setup?.chapterId === "reloj" || setup?.chapterId === "veredicto";
    playMusic(setup ? (boss ? "boss" : "battle") : "menu");
  }, [setup]);

  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock);
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  useEffect(() => {
    const check = () => {
      const earned = useGame.getState().syncAchievements();
      if (!earned.length) return;
      setToast(earned.map((item) => `${item.title} · +${item.reward} cristales`));
      sfx("win");
    };
    check();
    return useGame.subscribe(check);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!introSeen) {
    return (
      <main className="relative min-h-dvh">
        <Backdrop />
        <div className="relative mx-auto flex min-h-dvh max-w-xl flex-col justify-end gap-4 px-5 py-8">
          <CaptainIntro
            onChoose={(next) => {
              unlockAudio();
              seeIntro();
              setScreen(next);
            }}
          />
        </div>
        <AwardToast lines={toast} />
      </main>
    );
  }

  if (setup) {
    return (
      <main className="relative min-h-dvh">
        <Backdrop />
        <div className="relative">
          <BattleView setup={setup} onExit={() => setSetup(null)} />
        </div>
        <AwardToast lines={toast} />
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh">
      <Backdrop />
      <div className="relative mx-auto flex min-h-dvh max-w-3xl flex-col">
        <TopBar onSettings={() => setSettings(true)} />
        <div className="flex-1 px-4 pb-32 pt-2">
          {screen === "hub" ? <HubView onNavigate={setScreen} /> : null}
          {screen === "story" ? <StoryView onStart={setSetup} /> : null}
          {screen === "summon" ? <SummonView /> : null}
          {screen === "squad" ? <SquadView /> : null}
          {screen === "codex" ? <CodexView /> : null}
          {screen === "dojo" ? <DojoView onPractice={setSetup} /> : null}
          {screen === "logros" ? <LogrosView onBack={() => setScreen("hub")} /> : null}
          {screen === "orden" ? <OrdenView onStart={setSetup} onBack={() => setScreen("hub")} /> : null}
          {screen === "tienda" ? <ShopView onBack={() => setScreen("hub")} /> : null}
        </div>
        <nav className="dock fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95">
          <div className="mx-auto flex max-w-3xl">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = screen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    sfx("click");
                    setScreen(item.id);
                  }}
                  className={cn("flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs", active ? "text-gold" : "text-muted")}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                sfx("click");
                setScreen("dojo");
              }}
              className={cn("flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs", screen === "dojo" ? "text-gold" : "text-muted")}
            >
              <Dumbbell className="size-5" aria-hidden="true" />
              Dojo
            </button>
          </div>
        </nav>
      </div>
      {settings ? <SettingsSheet onClose={() => setSettings(false)} /> : null}
      <AwardToast lines={toast} />
    </main>
  );
}

function AwardToast({ lines }: { lines: string[] | null }) {
  if (!lines) return null;
  return (
    <div className="fixed inset-x-4 top-4 z-[70] mx-auto max-w-md rounded-card border border-gold bg-surface px-4 py-3">
      <p className="text-xs uppercase tracking-widest text-gold">Logro</p>
      {lines.map((line) => (
        <p key={line} className="font-display text-2xl uppercase leading-none">
          {line}
        </p>
      ))}
    </div>
  );
}

function Backdrop() {
  return (
    <>
      <img src="/cards/arena.jpg" alt="" className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-40" />
      <div className="scrim pointer-events-none fixed inset-0" />
    </>
  );
}

function TopBar({ onSettings }: { onSettings: () => void }) {
  const crystals = useGame((state) => state.crystals);
  const orbs = useGame((state) => state.orbs);
  return (
    <header className="flex items-center justify-between gap-2 px-4 py-3">
      <div className="min-w-0 text-left">
        <span className="block truncate font-display text-3xl uppercase leading-none text-gold sm:text-4xl">Pacto Astra</span>
        <span className="text-xs text-muted">Crónicas de ki</span>
      </div>
      <div className="flex items-center gap-2">
        <Meter label="cristales" value={crystals} icon={<Gem className="size-4 text-gold" aria-hidden="true" />} />
        <Meter label="orbes" value={orbs} icon={<Sparkles className="size-4 text-gold-2" aria-hidden="true" />} />
        <button type="button" onClick={onSettings} className="grid size-11 place-items-center rounded-full border border-line bg-surface" aria-label="Abrir ajustes">
          <Settings className="size-5" />
        </button>
      </div>
    </header>
  );
}

function SettingsSheet({ onClose }: { onClose: () => void }) {
  const sfxOn = useGame((state) => state.sfx);
  const shake = useGame((state) => state.shake);
  const speed = useGame((state) => state.speed);
  const toggleSfx = useGame((state) => state.toggleSfx);
  const toggleShake = useGame((state) => state.toggleShake);
  const setSpeed = useGame((state) => state.setSpeed);
  const reset = useGame((state) => state.reset);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="fixed inset-0 z-40 grid items-end bg-bg/70 sm:place-items-center">
      <div className="w-full space-y-3 rounded-t-card border border-line bg-surface p-5 sm:max-w-md sm:rounded-card">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-4xl uppercase">Ajustes</h2>
          <button type="button" className="min-h-11 px-2 text-sm text-gold" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <button type="button" className="flex min-h-12 w-full items-center justify-between rounded-xl border border-line px-3" onClick={toggleSfx}>
          <span>Sonido y música</span>
          {sfxOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5 text-muted" />}
        </button>
        <button type="button" className="flex min-h-12 w-full items-center justify-between rounded-xl border border-line px-3" onClick={toggleShake}>
          <span>Sacudida</span>
          <span className="text-sm text-gold">{shake ? "Sí" : "No"}</span>
        </button>
        <div className="grid grid-cols-2 gap-2">
          <Btn tone={speed === 1 ? "gold" : "ghost"} onClick={() => setSpeed(1)}>
            Combate 1×
          </Btn>
          <Btn tone={speed === 2 ? "gold" : "ghost"} onClick={() => setSpeed(2)}>
            Combate 2×
          </Btn>
        </div>
        {confirm ? (
          <Btn
            tone="ember"
            onClick={() => {
              reset();
              setConfirm(false);
              onClose();
            }}
          >
            Confirmar borrado
          </Btn>
        ) : (
          <Btn tone="ghost" onClick={() => setConfirm(true)}>
            Borrar progreso
          </Btn>
        )}
      </div>
    </div>
  );
}
