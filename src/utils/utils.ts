import type { WeatherPreset } from "../types/WeatherPreset";
import { RAIN_PRESETS, RANDOM_PRESET, SLOTS } from "./consts";

export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function randInt(min: number, max: number) {
  // inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sampleOne<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

export function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickUniqueIndices(count: number, total: number) {
  const indices = Array.from({ length: total }, (_, i) => i);
  return shuffle(indices)
    .slice(0, count)
    .sort((a, b) => a - b);
}

type GenerationResult = {
  rainPercent: number;
  rainSlots: number;
  rainIndices: number[];
  slots: WeatherPreset[];
};

export function generateWeather(
  minPct: number,
  maxPct: number
): GenerationResult {
  const min = clamp(minPct, 0, 100);
  const max = clamp(maxPct, 0, 100);
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);

  const rainPercent = randInt(lo, hi);
  const rainSlots = clamp(Math.ceil((SLOTS * rainPercent) / 100), 0, SLOTS);

  const rainIndices = pickUniqueIndices(rainSlots, SLOTS);

  const slots: WeatherPreset[] = Array.from(
    { length: SLOTS },
    () => RANDOM_PRESET
  );

  for (let i = 0; i < SLOTS; i++) {
    if (rainIndices.includes(i)) {
      slots[i] = sampleOne(RAIN_PRESETS);
    } else {
      slots[i] = RANDOM_PRESET;
    }
  }

  return { rainPercent, rainSlots, rainIndices, slots };
}

export function badgeClasses(kind: WeatherPreset["kind"]) {
  if (kind === "rain")
    return "bg-blue-500/15 text-blue-200 ring-1 ring-blue-500/30";
  if (kind === "random")
    return "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30";
  return "bg-slate-500/15 text-slate-200 ring-1 ring-slate-500/30";
}
