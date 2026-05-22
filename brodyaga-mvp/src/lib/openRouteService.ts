export type Coordinates = [number, number];

export interface RouteFeature {
  coordinates: Coordinates[];
  distanceMeters: number;
  durationSeconds: number;
}

export type RouteMode = "walking" | "cycling";

export interface RouteProfilePreferences {
  avoidHighways?: boolean;
  maximizeParks?: boolean;
  preferWaterfront?: boolean;
}

function getProfileForMode(mode: RouteMode) {
  return mode === "cycling" ? "cycling-regular" : "foot-walking";
}

function buildRouteOptions(mode: RouteMode, preferences?: RouteProfilePreferences) {
  const avoidFeatures = new Set<string>();

  if (mode === "cycling") {
    avoidFeatures.add("steps");
    avoidFeatures.add("ferries");
    if (preferences?.avoidHighways) {
      avoidFeatures.add("highways");
    }

    return {
      avoid_features: [...avoidFeatures],
      profile_params: {
        weightings: {
          green: { factor: preferences?.maximizeParks ? 1 : 0.5 },
          quiet: { factor: 1 },
          shortest: { factor: 0.2 }
        }
      }
    };
  }

  if (preferences?.avoidHighways) {
    avoidFeatures.add("highways");
  }

  return {
    avoid_features: [...avoidFeatures],
    profile_params: {
      weightings: {
        green: { factor: preferences?.maximizeParks ? 1 : 0.6 },
        quiet: { factor: preferences?.preferWaterfront ? 0.8 : 0.5 },
        shortest: { factor: 0.4 }
      }
    }
  };
}

export async function fetchRoutePreview(
  start: Coordinates,
  end: Coordinates,
  mode: RouteMode = "walking",
  preferences?: RouteProfilePreferences
): Promise<RouteFeature> {
  const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;

  if (!apiKey) {
    return {
      coordinates: [start, end],
      distanceMeters: 0,
      durationSeconds: 0
    };
  }

  const response = await fetch(`https://api.openrouteservice.org/v2/directions/${getProfileForMode(mode)}`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      coordinates: [
        [start[1], start[0]],
        [end[1], end[0]]
      ],
      options: buildRouteOptions(mode, preferences)
    })
  });

  if (!response.ok) {
    throw new Error(`ORS request failed: ${response.status}`);
  }

  const data = await response.json();
  const segment = data?.features?.[0];

  return {
    coordinates:
      segment?.geometry?.coordinates?.map(([lng, lat]: [number, number]) => [lat, lng] as Coordinates) ?? [
        start,
        end
      ],
    distanceMeters: segment?.properties?.summary?.distance ?? 0,
    durationSeconds: segment?.properties?.summary?.duration ?? 0
  };
}
