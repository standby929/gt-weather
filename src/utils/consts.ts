import type { Track } from "../types/Track";
import type { WeatherPreset } from "../types/WeatherPreset";

import MONZA from "../assets/tracks/monza.png";
import ALSACE from "../assets/tracks/alsace-village.png";
import DRAGONTRALIL from "../assets/tracks/dragon-trail-gardens.png";
import BARCELONA from "../assets/tracks/barcelona-catalunya-gp.png";
import SPA from "../assets/tracks/spa-francorchamps.png";
import SAINTECROIXB from "../assets/tracks/sainte-croix-b.png";
import FUJI from "../assets/tracks/fuji.png";
import KYOTO from "../assets/tracks/kyoto-yamagiwa-miyabi.png";
import NURBURGRING from "../assets/tracks/nurburgring-gp.png";
import LAGUNASECA from "../assets/tracks/laguna-seca.png";

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
