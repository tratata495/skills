export interface RoutePreferences {
  mood: string;
  transport: "walking" | "cycling";
  avoidHighways: boolean;
  maximizeParks: boolean;
  preferWaterfront: boolean;
  industrialBias: number;
  stalkerVibe: number;
  radiusKm: number;
  timeOfDay: "day" | "night" | "any";
}

export interface AiRouteResult {
  preferences: RoutePreferences;
  summary: string;
  challenge: string;
}

export const fallbackAiRoute = (request: string): AiRouteResult => {
  const normalized = request.toLowerCase();
  const walkingWords = ["пеш", "walk", "foot", "прогул", "trail", "троп", "лес", "парк"];
  const cyclingWords = ["вело", "bike", "cycling", "bicycle", "gravel", "асфальт"];

  const walkingScore = walkingWords.reduce((acc, token) => acc + (normalized.includes(token) ? 1 : 0), 0);
  const cyclingScore = cyclingWords.reduce((acc, token) => acc + (normalized.includes(token) ? 1 : 0), 0);
  const transport = walkingScore >= cyclingScore ? "walking" : "cycling";

  const isNight = normalized.includes("night") || normalized.includes("ноч");
  const water = normalized.includes("water") || normalized.includes("вод");
  const industrial = normalized.includes("industrial") || normalized.includes("пром");
  const parks = normalized.includes("park") || normalized.includes("парк");
  const stalker = normalized.includes("stalker") || normalized.includes("vibe") || normalized.includes("сталкер");
  const avoidHighways =
    normalized.includes("без трасс") ||
    normalized.includes("avoid highways") ||
    normalized.includes("minimal highways") ||
    normalized.includes("тих") ||
    normalized.includes("low traffic");

  return {
    preferences: {
      mood: stalker ? "stalker" : industrial ? "industrial" : water ? "waterfront" : "exploration",
      transport,
      avoidHighways,
      maximizeParks: parks,
      preferWaterfront: water,
      industrialBias: industrial ? 0.8 : 0.2,
      stalkerVibe: stalker ? 0.9 : 0.3,
      radiusKm: transport === "cycling" ? 14 : 7,
      timeOfDay: isNight ? "night" : "any"
    },
    summary:
      transport === "cycling"
        ? "Велопетля по тихим улицам и набережным: плавный ритм, минимум конфликтов с трафиком."
        : "Пеший маршрут через парки и дворы: медленнее, глубже, с атмосферными срезами между кварталами.",
    challenge:
      transport === "cycling"
        ? "Держись вне магистралей, найди 2 спокойных участка и прокати их без остановок."
        : "Сверни с главных улиц в 3 узких прохода или тропы и отметь самые тихие точки."
  };
};
