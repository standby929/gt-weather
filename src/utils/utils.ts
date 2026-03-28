import type { WeatherPreset } from "../types/WeatherPreset";
import { DRY_PRESETS, RAIN_PRESETS, RANDOM_PRESET, SLOTS } from "./consts";

export type WeatherGenerationMode = 1 | 2;

export type GenerationResult = {
  rainPercent: number;
  rainSlots: number;
  rainIndices: number[];
  slots: WeatherPreset[];
};

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

export function buildContiguousRainIndices(count: number, total: number) {
  if (count <= 0) return [];
  if (count >= total) return Array.from({ length: total }, (_, i) => i);

  /**
   * mode=2 esetben a kezdőpozíció úgy van sorsolva,
   * hogy az utolsó kocka is lehessen esős.
   *
   * Példa:
   * - 4 esős kocka esetén a lehetséges blokkok: 1-2-3-4 ... 6-7-8-9
   * - 3 esős kocka esetén a lehetséges blokkok: 1-2-3 ... 7-8-9
   */
  const maxStartIndex = Math.max(0, total - count);
  const startIndex = randInt(0, maxStartIndex);

  return Array.from({ length: count }, (_, i) => startIndex + i);
}

export function buildRainPercentFromSlotCount(rainSlots: number) {
  return rainSlots === 0
    ? 0
    : clamp(rainSlots * 10 - 5 + randInt(0, 9), 0, 100);
}

function generateWeatherByPercent(
  minPct: number,
  maxPct: number,
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
    () => RANDOM_PRESET,
  );

  for (let i = 0; i < SLOTS; i++) {
    if (rainIndices.includes(i)) {
      slots[i] = sampleOne(RAIN_PRESETS);
    } else {
      slots[i] = Math.random() < 0.7 ? sampleOne(DRY_PRESETS) : RANDOM_PRESET;
    }
  }

  return { rainPercent, rainSlots, rainIndices, slots };
}

function generateWeatherByRainSlotCount(
  minRainSlots: number,
  maxRainSlots: number,
): GenerationResult {
  const min = clamp(minRainSlots, 1, SLOTS);
  const max = clamp(maxRainSlots, 1, SLOTS);
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);

  const rainSlots = randInt(lo, hi);
  const rainIndices = buildContiguousRainIndices(rainSlots, SLOTS);

  const slots: WeatherPreset[] = Array.from({ length: SLOTS }, (_, index) => {
    return rainIndices.includes(index)
      ? sampleOne(RAIN_PRESETS)
      : sampleOne(DRY_PRESETS);
  });

  return {
    rainPercent: buildRainPercentFromSlotCount(rainSlots),
    rainSlots,
    rainIndices,
    slots,
  };
}

export function generateWeather(
  minValue: number,
  maxValue: number,
  mode: WeatherGenerationMode = 1,
): GenerationResult {
  if (mode === 2) {
    return generateWeatherByRainSlotCount(minValue, maxValue);
  }

  return generateWeatherByPercent(minValue, maxValue);
}

export function badgeClasses(kind: WeatherPreset["kind"]) {
  if (kind === "rain")
    return "bg-blue-500/15 text-blue-200 ring-1 ring-blue-500/30";
  if (kind === "random")
    return "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30";
  return "bg-slate-500/15 text-slate-200 ring-1 ring-slate-500/30";
}

function getPresetCode(p: WeatherPreset): string | undefined {
  return (p as any).id;
}

function buildPresetLookup(): Map<string, WeatherPreset> {
  const all = [...DRY_PRESETS, ...RAIN_PRESETS, RANDOM_PRESET];
  const map = new Map<string, WeatherPreset>();

  for (const p of all) {
    const code = getPresetCode(p);
    if (!code) continue;
    map.set(code.toUpperCase(), p);
  }

  return map;
}

const PRESET_BY_CODE = buildPresetLookup();

export function buildResultFromSlots(slots: WeatherPreset[]): GenerationResult {
  const rainIndices: number[] = [];
  for (let i = 0; i < slots.length; i++) {
    if (slots[i].kind === "rain") rainIndices.push(i);
  }

  const rainSlots = rainIndices.length;

  return {
    rainPercent: buildRainPercentFromSlotCount(rainSlots),
    rainSlots,
    rainIndices,
    slots,
  };
}

export function parseFixedPattern(
  fpParam: string | null,
): GenerationResult | null {
  if (!fpParam) return null;

  const rawParts = fpParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (rawParts.length !== SLOTS) return null;

  const slots: WeatherPreset[] = [];
  for (const part of rawParts) {
    const key = part.toUpperCase();
    const preset = PRESET_BY_CODE.get(key);
    if (!preset) return null; // ismeretlen kód → eldob
    slots.push(preset);
  }

  return buildResultFromSlots(slots);
}
