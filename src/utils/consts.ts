import type { Track } from "../types/Track";
import type { WeatherPreset } from "../types/WeatherPreset";

import SUZUKA from "../assets/tracks/suzuka.png";
import AUTOPOLIS from "../assets/tracks/autopolis.png";
import LEMANS from "../assets/tracks/24-heures-du-mans.png";
import REDBULL from "../assets/tracks/red-bull-ring.png";

import R5 from "../assets/weather/rain-r5.png";
import R6 from "../assets/weather/rain-r6.png";
import R7 from "../assets/weather/rain-r7.png";
import R8 from "../assets/weather/rain-r8.png";
import C4 from "../assets/weather/cloudy-c4.png";
import C5 from "../assets/weather/cloudy-c5.png";
import C6 from "../assets/weather/cloudy-c6.png";
import S5 from "../assets/weather/sunny-s5.png";
import RANDOM from "../assets/weather/random.png";

export const SLOTS = 9;

export const TRACKS: Track[] = [
  {
    id: "suzuka",
    name: "Suzuka",
    image: SUZUKA,
  },
  {
    id: "autopolis",
    name: "Autopolis",
    image: AUTOPOLIS,
  },
  {
    id: "lemans",
    name: "24 Heures du Mans",
    image: LEMANS,
  },
  {
    id: "redbull",
    name: "Red Bull Ring",
    image: REDBULL,
  },
];

export const RAIN_PRESETS: WeatherPreset[] = [
  { id: "R5", label: "Rain R5", kind: "rain", icon: R5 },
  { id: "R6", label: "Rain R6", kind: "rain", icon: R6 },
  { id: "R7", label: "Rain R7", kind: "rain", icon: R7 },
  { id: "R8", label: "Rain R8", kind: "rain", icon: R8 },
];

export const DRY_PRESETS: WeatherPreset[] = [
  { id: "S05", label: "Sunny (S05)", kind: "dry", icon: S5 },
  { id: "C04", label: "Cloudy (C04)", kind: "dry", icon: C4 },
  { id: "C05", label: "Cloudy (C05)", kind: "dry", icon: C5 },
  { id: "C06", label: "Cloudy (C06)", kind: "dry", icon: C6 },
];

export const RANDOM_PRESET: WeatherPreset = {
  id: "RAND",
  label: "Random",
  kind: "random",
  icon: RANDOM,
};
