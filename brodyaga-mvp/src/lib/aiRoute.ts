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
  const isNight = normalized.includes("night");
  const water = normalized.includes("water");
  const industrial = normalized.includes("industrial");
  const parks = normalized.includes("park");
  const stalker = normalized.includes("stalker") || normalized.includes("vibe");

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
    summary:
      "Low-light reconnaissance loop through textured city pockets with tactical visibility and urban contrast.",
    challenge: "Stay off major roads for 20 minutes and document three unexpected landmarks."
  };
};
