import { useMemo, useRef, useState } from "react";
import SlotCard from "./SlotCard";
import {
  generateWeather,
  randInt,
  parseFixedPattern,
  type WeatherGenerationMode,
} from "./utils/utils";

import { SLOTS, TRACKS } from "./utils/consts";

import LOGO from "./assets/logo-phoenix-league-nobg.png";

const PERCENT_SLIDER_GAP = 1;
const COUNT_SLIDER_GAP = 0;

export default function App() {
  const mode = useMemo<WeatherGenerationMode>(() => {
    const rawMode = new URLSearchParams(window.location.search).get("mode");
    return rawMode === "2" ? 2 : 1;
  }, []);

  const isMode2 = mode === 2;
  const sliderGap = isMode2 ? COUNT_SLIDER_GAP : PERCENT_SLIDER_GAP;
  const sliderMin = isMode2 ? 1 : 0;
  const sliderMax = isMode2 ? SLOTS : 100;

  const [hasStarted, setHasStarted] = useState(false);
  const [minValue, setMinValue] = useState(isMode2 ? 2 : 25);
  const [maxValue, setMaxValue] = useState(isMode2 ? 4 : 65);

  const fixedFirstResult = useMemo(() => {
    const fp = new URLSearchParams(window.location.search).get("fp");
    return parseFixedPattern(fp); // GenerationResult | null
  }, []);

  const fixedUsedRef = useRef(false);
  const [result, setResult] = useState(() =>
    generateWeather(minValue, maxValue, mode),
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

    const next =
      !fixedUsedRef.current && fixedFirstResult
        ? ((fixedUsedRef.current = true), fixedFirstResult)
        : generateWeather(minValue, maxValue, mode);

    setResult(next);
    setHasStarted(true);

    setIsRunning(true);
    setRevealedCount(0);

    // Balról jobbra, “slot machine” stop
    for (let i = 1; i <= SLOTS; i++) {
      const delayMs = 1000 * i + randInt(1000, 3000); // kis random, hogy organikusabb legyen
      window.setTimeout(() => {
        if (runIdRef.current !== runId) return;
        setRevealedCount(i);
        if (i === SLOTS) setIsRunning(false);
      }, delayMs);
    }
  };

  const rainInfo = `Eső arány: ${
    hasStarted ? result.rainPercent : "??"
  }% → esős kockák: ${hasStarted ? result.rainSlots : "?"}/${SLOTS}`;

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-400 to-slate-900 text-black">
      {/* Tartalom */}
      <div
        className="w-full px-2 md:px-4 lg:px-8 py-4"
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
                Esős indexek:&nbsp;
                {hasStarted && result.rainIndices.length
                  ? result.rainIndices.map((i) => i + 1).join(", ")
                  : "—"}
              </p>
              {isMode2 && (
                <p className="text-black text-sm mt-1">
                  mode=2: az eső összefüggő blokkban érkezik.
                </p>
              )}
            </div>

            <div>
              <button
                onClick={start}
                className="w-full rounded-xl bg-teal-400 text-black px-4 py-2 font-semibold hover:opacity-90 active:opacity-80"
              >
                Esernyőt nyiss!
              </button>
              <div className="mt-2 flex flex-row gap-4">
                {/* MIN */}
                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                  <div className="text-slate-300 text-sm">
                    {isMode2 ? "Minimum esős kocka" : "Minimum eső %"}
                  </div>
                  <input
                    type="range"
                    min={sliderMin}
                    max={Math.max(sliderMin, maxValue - sliderGap)}
                    value={minValue}
                    onChange={(e) => {
                      const nextMin = parseInt(e.target.value, 10);
                      setMinValue(Math.min(nextMin, maxValue - sliderGap));
                    }}
                    className="w-full mt-2"
                    disabled={isRunning}
                  />
                  <div className="mt-2 text-white font-semibold">
                    {minValue}
                    {isMode2 ? " db" : "%"}
                  </div>
                </div>

                {/* MAX */}
                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                  <div className="text-slate-300 text-sm">
                    {isMode2 ? "Maximum esős kocka" : "Maximum eső %"}
                  </div>
                  <input
                    type="range"
                    min={Math.min(sliderMax, minValue + sliderGap)}
                    max={sliderMax}
                    value={maxValue}
                    onChange={(e) => {
                      const nextMax = parseInt(e.target.value, 10);
                      setMaxValue(Math.max(nextMax, minValue + sliderGap));
                    }}
                    className="w-full mt-2"
                    disabled={isRunning}
                  />
                  <div className="mt-2 text-white font-semibold">
                    {maxValue}
                    {isMode2 ? " db" : "%"}
                  </div>
                </div>
              </div>
            </div>
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
                mode={mode}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
