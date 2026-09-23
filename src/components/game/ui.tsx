import { Flame, Hourglass, Leaf, Orbit, Shield, Star, Zap } from "lucide-react";
import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ELEMENT_LABEL, ROLE_LABEL } from "@/game/roster";
import type { Element, Rarity, Status } from "@/game/types";

const ICONS: Record<Element, typeof Flame> = {
  fuego: Flame,
  acero: Shield,
  rayo: Zap,
  salvaje: Leaf,
  gravedad: Orbit,
  tiempo: Hourglass,
};

export function ElementGlyph({ element, className }: { element: Element; className?: string }) {
  const Icon = ICONS[element];
  return <Icon className={className ?? "size-4"} aria-hidden="true" />;
}

export function rarityTone(rarity: Rarity) {
  if (rarity === "UR") return "border-ember text-ember";
  if (rarity === "SSR") return "border-gold text-gold";
  if (rarity === "SR") return "border-gold-2 text-gold-2";
  return "border-line text-muted";
}

export function Stars({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${count} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn("size-3", index < count ? "fill-gold text-gold" : "text-line")}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function Btn({
  tone = "gold",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "gold" | "ghost" | "ember" }) {
  const tones = {
    gold: "bg-gold text-ink",
    ghost: "border border-line bg-surface text-fg",
    ember: "bg-ember text-ink",
  };
  return (
    <button
      type="button"
      className={cn(
        "min-h-12 rounded-xl px-4 font-display text-2xl uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-40",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

const STATUS_LABEL: Record<Status["kind"], string> = {
  burn: "Quemadura",
  stun: "Freno",
  atk: "Ataque",
  def: "Defensa",
};

export type Floater = { key: number; iid: string; text: string; tone: "dmg" | "heal" };

export function Portrait({
  portrait,
  name,
  rarity,
  element,
  subtitle,
  level,
  stars,
  hp,
  maxHp,
  ki,
  shield,
  statuses,
  active,
  dead,
  dim,
  selected,
  flashed,
  floats,
  imageFilter,
  ratio = "tall",
  mirror = false,
  onClick,
}: {
  portrait: string;
  name: string;
  rarity?: Rarity;
  element?: Element;
  subtitle?: string;
  level?: number;
  stars?: number;
  hp?: number;
  maxHp?: number;
  ki?: number;
  shield?: number;
  statuses?: Status[];
  active?: boolean;
  dead?: boolean;
  dim?: boolean;
  selected?: boolean;
  flashed?: boolean;
  floats?: Floater[];
  imageFilter?: string;
  ratio?: "tall" | "square";
  mirror?: boolean;
  onClick?: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const Tag = onClick ? "button" : "div";
  const hpPct = maxHp ? Math.max(0, Math.min(100, ((hp ?? 0) / maxHp) * 100)) : 0;
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-card border bg-surface text-left",
        rarity ? rarityTone(rarity) : "border-line",
        active && "live",
        selected && "ring-2 ring-gold",
        dead && "opacity-50 grayscale",
        dim && "opacity-70",
        flashed && "flash",
      )}
    >
      <div className={cn("relative bg-surface-2", ratio === "square" ? "aspect-square" : "aspect-[3/4]")}>
        {!failed ? (
          <img
            src={`/cards/${portrait}.jpg`}
            alt=""
            className={cn("h-full w-full object-cover object-top", mirror && "-scale-x-100", imageFilter)}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="grid h-full place-items-center">
            <span className="font-display text-5xl text-gold">{name.slice(0, 1)}</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg to-transparent" />
        {rarity ? (
          <span className={cn("absolute left-1.5 top-1.5 rounded bg-bg/80 px-1.5 py-0.5 font-display text-lg leading-none", rarityTone(rarity))}>
            {rarity}
          </span>
        ) : null}
        {element ? (
          <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded bg-bg/80 px-1.5 py-0.5 text-fg">
            <ElementGlyph element={element} className="size-3.5" />
          </span>
        ) : null}
        {(floats ?? []).map((floater, index) => (
          <span
            key={floater.key}
            className={cn(
              "floater pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 font-display text-4xl leading-none",
              floater.tone === "heal" ? "text-gold-2" : "text-ember",
            )}
            style={{ top: 28 + index * 18 }}
          >
            {floater.text}
          </span>
        ))}
      </div>
      <div className="space-y-1 px-2 py-2">
        <p className="truncate font-display text-2xl uppercase leading-none tracking-wide">{name}</p>
        {subtitle ? <p className="truncate text-xs text-muted">{subtitle}</p> : null}
        {typeof level === "number" ? (
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs tabular-nums text-muted">Nv. {level}</span>
            {typeof stars === "number" ? <Stars count={stars} /> : null}
          </div>
        ) : null}
        {typeof maxHp === "number" ? (
          <div className="space-y-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-line">
              <div className={cn("h-full", hpPct < 30 ? "bg-ember" : "bg-gold")} style={{ width: `${hpPct}%` }} />
            </div>
            <div className="flex justify-between text-xs tabular-nums text-muted">
              <span>
                {hp}/{maxHp}
              </span>
              {typeof ki === "number" ? <span>Ki {ki}</span> : null}
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-line">
              <div className="h-full bg-gold-2" style={{ width: `${ki ?? 0}%` }} />
            </div>
            {shield ? <p className="micro text-gold-2">Escudo {shield}</p> : null}
          </div>
        ) : null}
        {statuses && statuses.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {statuses.map((status) => (
              <span key={status.kind} className="micro rounded bg-surface-2 px-1 text-muted">
                {status.kind === "atk" && status.pct < 0 ? "Ataque-" : status.kind === "def" && status.pct < 0 ? "Defensa-" : STATUS_LABEL[status.kind]}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Tag>
  );
}

export function Meter({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <span className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line bg-surface px-2.5 text-sm tabular-nums sm:gap-1.5 sm:px-3">
      {icon}
      <span className="hidden text-muted sm:inline">{label}</span>
      <span className="font-semibold text-fg">{value}</span>
    </span>
  );
}

export function roleLine(role: keyof typeof ROLE_LABEL, element: Element) {
  return `${ROLE_LABEL[role]} · ${ELEMENT_LABEL[element]}`;
}
