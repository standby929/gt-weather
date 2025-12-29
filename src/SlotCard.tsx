import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { badgeClasses, sampleOne } from "./utils/utils";
import type { WeatherPreset } from "./types/WeatherPreset";
import { RAIN_PRESETS, RANDOM_PRESET } from "./utils/consts";

export default function SlotCard({
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
