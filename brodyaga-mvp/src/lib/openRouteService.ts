export type Coordinates = [number, number];

export interface RouteFeature {
  coordinates: Coordinates[];
  distanceMeters: number;
  durationSeconds: number;
}

const ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions/foot-walking";

export async function fetchRoutePreview(start: Coordinates, end: Coordinates): Promise<RouteFeature> {
  const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;

  if (!apiKey) {
    return {
      coordinates: [start, end],
      distanceMeters: 0,
      durationSeconds: 0
    };
  }

  const response = await fetch(ORS_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      coordinates: [
        [start[1], start[0]],
        [end[1], end[0]]
      ]
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
