import type { Rarity } from "./types";

let ctx: AudioContext | null = null;
let enabled = true;

const MUSIC = {
  menu: "/music/menu.mp3",
  battle: "/music/battle.mp3",
  boss: "/music/boss.mp3",
} as const;

export type MusicId = keyof typeof MUSIC;

let music: HTMLAudioElement | null = null;
let current: MusicId | null = null;
let wanted: MusicId = "menu";

export function setSfxEnabled(value: boolean) {
  enabled = value;
}

export function setMusicEnabled(value: boolean) {
  enabled = value;
  if (!value) {
    music?.pause();
    return;
  }
  playMusic(wanted);
}

export function playMusic(id: MusicId) {
  wanted = id;
  if (!enabled || typeof window === "undefined") return;
  if (!music) {
    music = new Audio();
    music.loop = true;
    music.preload = "auto";
  }
  if (current !== id) {
    music.src = MUSIC[id];
    current = id;
  }
  music.volume = id === "menu" ? 0.42 : 0.5;
  if (!music.paused) return;
  void music.play().catch(() => {});
}

export function unlockAudio() {
  if (typeof window === "undefined") return;
  const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  if (!ctx) ctx = new Ctx();
  if (ctx.state === "suspended") void ctx.resume();
  if (enabled && music?.paused) void music.play().catch(() => {});
}

function blip(freq: number, dur: number, type: OscillatorType, vol: number, slide = 0) {
  if (!ctx || !enabled || ctx.state !== "running") return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(48, freq + slide), now + dur);
  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

export function sfxCrystal(rarity: Rarity) {
  if (!enabled) return;
  unlockAudio();
  const rank = rarity === "UR" ? 3 : rarity === "SSR" ? 2 : rarity === "SR" ? 1 : 0;
  crack(rank);
  blip(90 + rank * 24, 0.16, "square", 0.04, -70);
  const notes = rarity === "R" ? [494] : rarity === "SR" ? [523, 659] : rarity === "SSR" ? [523, 659, 784, 1046] : [523, 659, 784, 1046, 1318];
  notes.forEach((freq, index) => {
    setTimeout(() => blip(freq, 0.12 + rank * 0.02, "triangle", 0.05), 80 + index * 90);
  });
}

function crack(rank: number) {
  if (!ctx || !enabled || ctx.state !== "running") return;
  const length = Math.floor(ctx.sampleRate * (0.12 + rank * 0.04));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = 900 + rank * 280;
  gain.gain.value = 0.08 + rank * 0.03;
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
}

export function sfx(kind: "click" | "hit" | "ult" | "heal" | "ko" | "pull" | "rare" | "win" | "deny") {
  if (!enabled) return;
  unlockAudio();
  if (kind === "click") blip(640, 0.04, "sine", 0.04);
  if (kind === "deny") blip(140, 0.08, "square", 0.03);
  if (kind === "hit") {
    blip(220, 0.07, "square", 0.045, -120);
    blip(520, 0.04, "triangle", 0.03);
  }
  if (kind === "ult") {
    blip(90, 0.22, "sawtooth", 0.05, -40);
    blip(480, 0.16, "square", 0.04, 80);
  }
  if (kind === "heal") {
    blip(520, 0.08, "sine", 0.04);
    blip(700, 0.1, "sine", 0.035);
  }
  if (kind === "ko") blip(180, 0.18, "triangle", 0.05, -130);
  if (kind === "pull") blip(420, 0.06, "triangle", 0.04);
  if (kind === "rare") {
    blip(523, 0.08, "triangle", 0.05);
    setTimeout(() => blip(659, 0.08, "triangle", 0.05), 70);
    setTimeout(() => blip(784, 0.14, "triangle", 0.05), 140);
  }
  if (kind === "win") {
    [523, 659, 784, 1046].forEach((freq, index) => {
      setTimeout(() => blip(freq, 0.12, "triangle", 0.05), index * 90);
    });
  }
}
