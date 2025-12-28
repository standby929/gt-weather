import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LOGO from "./assets/logo-phoenix-league-nobg.png";
import R5 from "./assets/weather/rain-r5.png";
import R6 from "./assets/weather/rain-r6.png";
import R7 from "./assets/weather/rain-r7.png";
import R8 from "./assets/weather/rain-r8.png";
import RANDOM from "./assets/weather/random.png";

import MONZA from "./assets/tracks/monza.png";
import ALSACE from "./assets/tracks/alsace-village.png";
import DRAGONTRALIL from "./assets/tracks/dragon-trail-gardens.png";
import BARCELONA from "./assets/tracks/barcelona-catalunya-gp.png";
import SPA from "./assets/tracks/spa-francorchamps.png";
import SAINTECROIXB from "./assets/tracks/sainte-croix-b.png";
import FUJI from "./assets/tracks/fuji.png";
import KYOTO from "./assets/tracks/kyoto-yamagiwa-miyabi.png";
import NURBURGRING from "./assets/tracks/nurburgring-gp.png";
import LAGUNASECA from "./assets/tracks/laguna-seca.png";

type WeatherPreset = {
  id: string;
  label: string;
  kind: "dry" | "rain" | "random";
  icon: string;
};

const SLOTS = 9;
const MIN_RAIN_PERCENT = 25;
const MAX_RAIN_PERCENT = 60;

const RAIN_PRESETS: WeatherPreset[] = [
  { id: "R5", label: "Rain R5", kind: "rain", icon: R5 },
  { id: "R6", label: "Rain R6", kind: "rain", icon: R6 },
  { id: "R7", label: "Rain R7", kind: "rain", icon: R7 },
  { id: "R8", label: "Rain R8", kind: "rain", icon: R8 },
];

const RANDOM_PRESET: WeatherPreset = {
  id: "RAND",
  label: "Random",
  kind: "random",
  icon: RANDOM,
};

type Track = {
  id: string;
  name: string;
  image: string;
};

const TRACKS: Track[] = [
  { id: "monza", name: "monza", image: MONZA },
  { id: "alsace-village", name: "alsace-village", image: ALSACE },
  {
    id: "dragon-trail-gardens",
    name: "dragon-trail-gardens",
    image: DRAGONTRALIL,
  },
  {
    id: "barcelona-catalunya-gp",
    name: "barcelona-catalunya-gp",
    image: BARCELONA,
  },
  { id: "spa-francorchamps", name: "spa-francorchamps", image: SPA },
  { id: "sainte-croix-b", name: "sainte-croix-b", image: SAINTECROIXB },
  { id: "fuji", name: "fuji", image: FUJI },
  { id: "kyoto-yamagiwa-miyabi", name: "kyoto-yamagiwa-miyabi", image: KYOTO },
  { id: "nurburgring-gp", name: "nurburgring-gp", image: NURBURGRING },
  { id: "laguna-seca", name: "laguna-seca", image: LAGUNASECA },
];

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function randInt(min: number, max: number) {
  // inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sampleOne<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickUniqueIndices(count: number, total: number) {
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

function generateWeather(minPct: number, maxPct: number): GenerationResult {
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
      // Itt dönthetsz: csak Random legyen-e, vagy dry+random keverék
      // Most: 70% dry, 30% random, hogy változatos legyen.
      // slots[i] = Math.random() < 0.7 ? sampleOne(DRY_PRESETS) : RANDOM_PRESET;
      slots[i] = RANDOM_PRESET;
    }
  }

  return { rainPercent, rainSlots, rainIndices, slots };
}

function badgeClasses(kind: WeatherPreset["kind"]) {
  if (kind === "rain")
    return "bg-blue-500/15 text-blue-200 ring-1 ring-blue-500/30";
  if (kind === "random")
    return "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30";
  return "bg-slate-500/15 text-slate-200 ring-1 ring-slate-500/30";
}

function SlotCard({
  index,
  finalPreset,
  isSpinning,
  reveal,
  hasStarted,
}: {
  index: number;
  finalPreset: WeatherPreset;
  isSpinning: boolean;
  reveal: boolean;
  hasStarted: boolean;
}) {
  // Egy “sor” (ikon + szöveg) fix magassága:
  // legyen kicsit nagyobb, mint a 150px ikon, hogy kényelmesen elférjen.
  const ITEM_H = 190;

  const items = useMemo(() => {
    // Pörgésnél ez a “tekercs” fut, a legvégén fixen a finalPreset
    const pool = [RANDOM_PRESET, ...RAIN_PRESETS];
    const long = Array.from({ length: 22 }, () => sampleOne(pool));
    return [...long, finalPreset];
  }, [finalPreset]);

  // Mennyit kell felmozgatni, hogy teljesen “kifusson” a tekercs
  const totalY = items.length * ITEM_H;

  const renderItem = (p: WeatherPreset) => {
    return (
      <div
        className="w-full flex items-center gap-6"
        style={{ height: ITEM_H }}
      >
        {/* ICON */}
        <div className="w-[150px] h-[150px] shrink-0 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center overflow-hidden">
          <img
            src={p.icon}
            alt={p.label}
            className="w-[140px] h-[140px] object-contain"
            draggable={false}
          />
        </div>

        {/* TEXT */}
        <div className="min-w-0">
          <div className="text-2xl md:text-3xl font-bold text-white leading-tight">
            {p.label}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden shadow-lg shadow-black-900">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="text-sm text-black">{index + 1}</div>
        <div
          className={
            "text-xs px-2 py-1 rounded-full " +
            badgeClasses(reveal ? finalPreset.kind : "random")
          }
        >
          {reveal ? finalPreset.kind.toUpperCase() : "SPIN"}
        </div>
      </div>

      {/* FIX viewport: egyszerre 1 elem látszik */}
      <div
        className="relative border-t border-black/10 overflow-hidden"
        style={{ height: ITEM_H }}
      >
        {/* INITIAL STATE – még nem indult el */}
        {!hasStarted && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ height: ITEM_H }}
          >
            <span className="text-4xl font-bold tracking-widest text-black/40">
              ...
            </span>
          </div>
        )}
        {hasStarted && (
          <AnimatePresence mode="wait">
            {isSpinning && !reveal ? (
              <motion.div
                key="spin"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="absolute inset-0 px-4"
                  // lépcsős “slot” mozgás ITEM_H lépésekkel
                  animate={{ y: [0, -totalY] }}
                  transition={{
                    duration: 1.25,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                >
                  {items.map((it, idx) => (
                    <div key={idx}>{renderItem(it)}</div>
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="final"
                className="absolute inset-0 px-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {renderItem(finalPreset)}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [result, setResult] = useState(() =>
    generateWeather(MIN_RAIN_PERCENT, MAX_RAIN_PERCENT)
  );

  const [isRunning, setIsRunning] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [selectedTrackId, setSelectedTrackId] = useState<string>(TRACKS[0].id);
  const selectedTrack = useMemo(() => {
    return TRACKS.find((t) => t.id === selectedTrackId) ?? TRACKS[0];
  }, [selectedTrackId]);
  const runIdRef = useRef(0);

  const start = () => {
    const runId = ++runIdRef.current;
    const next = generateWeather(MIN_RAIN_PERCENT, MAX_RAIN_PERCENT);
    setResult(next);
    setHasStarted(true);

    setIsRunning(true);
    setRevealedCount(0);

    // Balról jobbra, “slot machine” stop
    for (let i = 1; i <= SLOTS; i++) {
      const delayMs = 350 * i + randInt(0, 120); // kis random, hogy organikusabb legyen
      window.setTimeout(() => {
        if (runIdRef.current !== runId) return;
        setRevealedCount(i);
        if (i === SLOTS) setIsRunning(false);
      }, delayMs);
    }
  };

  const rainInfo = `Eső arány: ${result.rainPercent}% → esős kockák: ${result.rainSlots}/9`;

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-400 to-slate-900 text-black">
      {/* Tartalom */}
      <div
        className="w-full px-4 md:px-8 lg:px-12 py-10"
        style={{
          background: `url(${selectedTrack.image}) no-repeat center center / contain`,
        }}
      >
        <div className="flex flex-col gap-6">
          <header className="flex items-start justify-between gap-4">
            <div>
              <img src={LOGO} alt="Phoenix League Logo" className="h-32 mb-2" />

              {/* Pálya select */}
              <div className="mt-2">
                <label className="block text-sm font-semibold text-black mb-1">
                  Pálya
                </label>
                <select
                  value={selectedTrackId}
                  onChange={(e) => {
                    setSelectedTrackId(e.target.value);
                    setHasStarted(false);
                  }}
                  className="w-72 max-w-full rounded-xl bg-white/80 text-black px-3 py-2 ring-1 ring-black/15 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {TRACKS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-black text-3xl">{rainInfo}</h3>
              <p className="text-black text-sm mt-1">
                Esős indexek:{" "}
                {result.rainIndices.length
                  ? result.rainIndices.map((i) => i + 1).join(", ")
                  : "—"}
              </p>
            </div>

            <button
              onClick={start}
              className="shrink-0 rounded-xl bg-teal-400 text-black px-4 py-2 font-semibold hover:opacity-90 active:opacity-80"
            >
              Esernyőt nyiss!
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.slots.map((s, idx) => (
              <SlotCard
                key={idx}
                index={idx}
                finalPreset={s}
                isSpinning={isRunning}
                reveal={idx < revealedCount}
                hasStarted={hasStarted}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
