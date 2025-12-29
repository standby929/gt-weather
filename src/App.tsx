import { useMemo, useRef, useState } from "react";
import SlotCard from "./SlotCard";
import { generateWeather, randInt } from "./utils/utils";

import { SLOTS, TRACKS } from "./utils/consts";

import LOGO from "./assets/logo-phoenix-league-nobg.png";

const GAP = 1;

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [minPct, setMinPct] = useState(40);
  const [maxPct, setMaxPct] = useState(70);
  const [result, setResult] = useState(() => generateWeather(minPct, maxPct));
  const [isRunning, setIsRunning] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);

  const [selectedTrackId, setSelectedTrackId] = useState<string>(TRACKS[0].id);
  const selectedTrack = useMemo(() => {
    return TRACKS.find((t) => t.id === selectedTrackId) ?? TRACKS[0];
  }, [selectedTrackId]);
  const runIdRef = useRef(0);

  const start = () => {
    const runId = ++runIdRef.current;
    const next = generateWeather(minPct, maxPct);
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
                  <div className="text-slate-300 text-sm">Minimum eső %</div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, maxPct - GAP)} // <- ne mehessen a max fölé
                    value={minPct}
                    onChange={(e) => {
                      const nextMin = parseInt(e.target.value, 10);
                      // biztosítjuk: min <= max - GAP
                      setMinPct(Math.min(nextMin, maxPct - GAP));
                    }}
                    className="w-full mt-2"
                    disabled={isRunning}
                  />
                  <div className="mt-2 text-white font-semibold">{minPct}%</div>
                </div>

                {/* MAX */}
                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                  <div className="text-slate-300 text-sm">Maximum eső %</div>
                  <input
                    type="range"
                    min={Math.min(100, minPct + GAP)} // <- ne mehessen a min alá
                    max={100}
                    value={maxPct}
                    onChange={(e) => {
                      const nextMax = parseInt(e.target.value, 10);
                      // biztosítjuk: max >= min + GAP
                      setMaxPct(Math.max(nextMax, minPct + GAP));
                    }}
                    className="w-full mt-2"
                    disabled={isRunning}
                  />
                  <div className="mt-2 text-white font-semibold">{maxPct}%</div>
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
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
