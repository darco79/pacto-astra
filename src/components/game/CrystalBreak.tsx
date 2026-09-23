import { useEffect, useMemo, useRef, useState } from "react";
import { sfxCrystal } from "@/game/audio";
import type { Rarity } from "@/game/types";

const BURST: Record<Rarity, { n: number; ms: number; glow: string; shard: string; ring: string }> = {
  R: { n: 14, ms: 900, glow: "#d9cfc2", shard: "#8d8072", ring: "rgba(203,187,166,0.5)" },
  SR: { n: 26, ms: 1100, glow: "#e7f0ff", shard: "#6f97ff", ring: "rgba(122,162,255,0.55)" },
  SSR: { n: 42, ms: 1300, glow: "#ffe08a", shard: "#ff5a36", ring: "rgba(240,180,41,0.72)" },
  UR: { n: 56, ms: 1500, glow: "#f6e7ff", shard: "#c084fc", ring: "rgba(192,132,252,0.78)" },
};

export function CrystalBreak({
  rarity,
  title,
  hint,
  onDone,
}: {
  rarity: Rarity;
  title: string;
  hint: string;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "break">("idle");
  const done = useRef(false);
  const look = BURST[rarity];
  const bits = useMemo(
    () =>
      Array.from({ length: look.n }, (_, index) => {
        const angle = (index / look.n) * Math.PI * 2;
        const reach = 48 + (index % 5) * 22;
        return {
          id: index,
          x: Math.round(Math.cos(angle) * reach),
          y: Math.round(Math.sin(angle) * reach * 0.86),
          delay: (index % 6) * 35,
          size: 6 + (index % 5) * 3,
        };
      }),
    [look.n],
  );

  function finish() {
    if (done.current) return;
    done.current = true;
    onDone();
  }

  function smash() {
    if (phase !== "idle") return;
    sfxCrystal(rarity);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    setPhase("break");
  }

  useEffect(() => {
    if (phase !== "break") return;
    const timer = window.setTimeout(finish, look.ms);
    return () => window.clearTimeout(timer);
  }, [phase, look.ms]);

  return (
    <div className={`crystal-stage rarity-${rarity}`} role="dialog" aria-modal="true" aria-label={`Cristal ${rarity}`}>
      <div className={`crystal-glow ${phase === "break" ? "is-hot" : ""}`} style={{ background: `radial-gradient(circle, ${look.ring}, transparent 68%)` }} />
      <p className="relative font-display text-5xl uppercase leading-none text-gold">{title}</p>
      <p className="relative max-w-sm text-center text-sm text-muted">{hint}</p>
      <div className={`crystal-wrap ${phase === "break" ? "is-break" : ""}`}>
        <div className="crystal" style={{ background: `linear-gradient(160deg, ${look.glow}, ${look.shard} 70%)` }} />
        {phase === "break"
          ? bits.map((bit) => (
              <span
                key={bit.id}
                className="crystal-bit"
                style={{
                  width: bit.size,
                  height: bit.size,
                  background: bit.id % 2 ? look.glow : look.shard,
                  animationDelay: `${bit.delay}ms`,
                  ["--dx" as string]: `${bit.x}px`,
                  ["--dy" as string]: `${bit.y}px`,
                }}
              />
            ))
          : null}
      </div>
      <p className={`relative font-display text-4xl uppercase ${phase === "break" ? "crystal-rarity" : "text-muted"}`}>{rarity}</p>
      <div className="relative">
        {phase === "idle" ? (
          <button type="button" onClick={smash} className="min-h-12 rounded-full bg-gold px-6 font-display text-2xl uppercase tracking-wide text-ink">
            Romper el cristal
          </button>
        ) : (
          <button type="button" onClick={finish} className="min-h-12 rounded-full border border-gold bg-bg/80 px-6 font-display text-2xl uppercase tracking-wide text-gold">
            Saltar
          </button>
        )}
      </div>
    </div>
  );
}
