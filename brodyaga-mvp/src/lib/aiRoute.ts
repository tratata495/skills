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
  const isNight = normalized.includes("night") || normalized.includes("ноч");
  const water = normalized.includes("water") || normalized.includes("вод");
  const industrial = normalized.includes("industrial") || normalized.includes("пром");
  const parks = normalized.includes("park") || normalized.includes("парк");
  const stalker = normalized.includes("stalker") || normalized.includes("vibe") || normalized.includes("сталкер");

  return {
    preferences: {
      mood: stalker ? "stalker" : industrial ? "industrial" : water ? "waterfront" : "exploration",
      transport: "cycling",
      avoidHighways: normalized.includes("minimal highways") || normalized.includes("avoid highways"),
      maximizeParks: parks,
      preferWaterfront: water,
      industrialBias: industrial ? 0.8 : 0.2,
      stalkerVibe: stalker ? 0.9 : 0.3,
      radiusKm: 8,
      timeOfDay: isNight ? "night" : "any"
    },
    summary: "Сумеречная петля через тихие кварталы: больше фактуры, меньше шума и трасс.",
    challenge: "20 минут держись вне магистралей и отметь три неожиданные точки."
  };
};
