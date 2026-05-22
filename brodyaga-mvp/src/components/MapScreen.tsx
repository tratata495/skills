"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

import { fetchRoutePreview } from "@/lib/openRouteService";
import type { AiRouteResult } from "@/lib/aiRoute";

const MOSCOW_MKAD_CENTER: LatLngExpression = [55.751244, 37.618423];
const MOSCOW: [number, number] = [55.7558, 37.6173];
const TVER: [number, number] = [56.8587, 35.9176];

function RecenterOnUser({ center }: { center: LatLngExpression | null }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 14, { animate: true });
    }
  }, [center, map]);

  return null;
}

function TapToSetDestination({ onSetDestination }: { onSetDestination: (point: [number, number]) => void }) {
  useMapEvents({
    click: (event) => onSetDestination([event.latlng.lat, event.latlng.lng])
  });

  return null;
}

export default function MapScreen() {
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [path, setPath] = useState<[number, number][]>([]);
  const [moscowTverRoute, setMoscowTverRoute] = useState<[number, number][]>([]);
  const [requestText, setRequestText] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiResult, setAiResult] = useState<AiRouteResult | null>(null);
  const [geoStatus, setGeoStatus] = useState("Фокус по умолчанию: Москва");

  useEffect(() => {
    const fetchMoscowTverRoute = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${MOSCOW[1]},${MOSCOW[0]};${TVER[1]},${TVER[0]}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        const coordinates = data?.routes?.[0]?.geometry?.coordinates;
        if (!coordinates) return;

        setMoscowTverRoute(
          coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
        );
      } catch {
        setMoscowTverRoute([MOSCOW, TVER]);
      }
    };

    fetchMoscowTverRoute();
  }, []);

  useEffect(() => {
    if (!currentPosition || !destination) {
      setPath([]);
      return;
    }

    fetchRoutePreview(currentPosition, destination, aiResult?.preferences.transport ?? "walking", {
      avoidHighways: aiResult?.preferences.avoidHighways,
      maximizeParks: aiResult?.preferences.maximizeParks,
      preferWaterfront: aiResult?.preferences.preferWaterfront
    })
      .then((route) => setPath(route.coordinates))
      .catch(() => setPath([currentPosition, destination]));
  }, [currentPosition, destination, aiResult]);

  const routePreview = useMemo(() => {
    if (path.length > 1) return path;
    if (!currentPosition || !destination) return [];
    return [currentPosition, destination];
  }, [path, currentPosition, destination]);

  const requestGeo = () => {
    if (!navigator.geolocation) {
      setGeoStatus("Геолокация недоступна");
      return;
    }

    setGeoStatus("Ищем точку...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPosition([position.coords.latitude, position.coords.longitude]);
        setGeoStatus("Точка зафиксирована");
      },
      () => {
        setGeoStatus("Доступ закрыт, работаем по Москве");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15_000,
        timeout: 12_000
      }
    );
  };

  const runAiRoute = async () => {
    if (!requestText.trim()) return;
    setLoadingAi(true);
    try {
      const response = await fetch("/api/ai-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: requestText })
      });
      const data = (await response.json()) as AiRouteResult;
      setAiResult(data);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <main className="map-shell">
      <MapContainer center={MOSCOW_MKAD_CENTER} zoom={11} zoomControl={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          updateWhenIdle
          keepBuffer={2}
        />
        <TapToSetDestination onSetDestination={setDestination} />
        <RecenterOnUser center={currentPosition} />
        <Marker position={MOSCOW} />
        <Marker position={TVER} />
        {moscowTverRoute.length > 1 ? <Polyline positions={moscowTverRoute} pathOptions={{ color: "#ffd166", weight: 4 }} /> : null}
        {currentPosition ? <Marker position={currentPosition} /> : null}
        {destination ? <Marker position={destination} /> : null}
        {routePreview.length > 1 ? <Polyline positions={routePreview} pathOptions={{ color: "#7df9ff", weight: 5 }} /> : null}
      </MapContainer>

      <div className="map-overlay-grid" />

      <button
        type="button"
        onClick={requestGeo}
        className="absolute right-3 top-3 z-[1000] h-12 w-12 rounded-full border border-cyan-300/40 bg-slate-900/85 text-xl text-cyan-200 shadow-lg shadow-cyan-500/20 backdrop-blur active:scale-95"
        aria-label="Использовать текущую точку"
      >
        ⦿
      </button>

      <section className="ai-panel">
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">БРОДЯГА AI / РЕЙД</p>
        <div className="mt-2 flex gap-2">
          <input
            value={requestText}
            onChange={(event) => setRequestText(event.target.value)}
            placeholder="Ночной маршрут вдоль воды"
            className="flex-1 rounded-xl border border-cyan-300/25 bg-slate-900/80 px-3 py-2 text-sm text-cyan-50 outline-none placeholder:text-slate-400"
          />
          <button onClick={runAiRoute} disabled={loadingAi} className="rounded-xl bg-cyan-300/90 px-3 text-xs font-semibold text-slate-900 disabled:opacity-50">
            {loadingAi ? "..." : "АНАЛИЗ"}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-cyan-100/75">{geoStatus}</p>
      </section>

      <section className="bottom-sheet">
        <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-cyan-200/50" />
        <p className="text-xs text-slate-200">Коснись карты, чтобы отметить цель.</p>
        {aiResult ? (
          <>
            <p className="mt-2 text-sm text-cyan-100">{aiResult.summary}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-cyan-300/90">
              РЕЖИМ: {aiResult.preferences.transport === "cycling" ? "🚲 Велосипед" : "🚶 Пешком"}
            </p>
            <p className="mt-2 text-xs text-cyan-200/90">Задание: {aiResult.challenge}</p>
            <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-slate-900/70 p-2 text-[10px] text-cyan-100">{JSON.stringify(aiResult.preferences, null, 2)}</pre>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button type="button" className="rounded-lg border border-cyan-300/30 bg-slate-900/70 px-3 py-2 text-[11px] font-semibold text-cyan-100">
                ВЫЙТИ НА МАРШРУТ
              </button>
              <button type="button" className="rounded-lg border border-cyan-300/30 bg-slate-900/70 px-3 py-2 text-[11px] font-semibold text-cyan-100">
                СОХРАНИТЬ
              </button>
              <button type="button" className="rounded-lg border border-cyan-300/30 bg-slate-900/70 px-3 py-2 text-[11px] font-semibold text-cyan-100">
                ЭКСПОРТ GPX
              </button>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
