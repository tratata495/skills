"use client";

import "leaflet/dist/leaflet.css";

import { useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

const DEFAULT_CENTER: LatLngExpression = [50.4501, 30.5234];

function RecenterOnUser({ center }: { center: LatLngExpression | null }) {
  const map = useMap();

  if (center) {
    map.setView(center, 15, { animate: true });
  }

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

  const routePreview = useMemo(() => {
    if (!currentPosition || !destination) return [];
    return [currentPosition, destination];
  }, [currentPosition, destination]);

  const requestGeo = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPosition([position.coords.latitude, position.coords.longitude]);
      },
      () => undefined,
      {
        enableHighAccuracy: false,
        maximumAge: 30_000,
        timeout: 15_000
      }
    );
  };

  return (
    <main className="map-shell">
      <MapContainer center={DEFAULT_CENTER} zoom={14} zoomControl={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          updateWhenIdle
          keepBuffer={2}
        />
        <TapToSetDestination onSetDestination={setDestination} />
        <RecenterOnUser center={currentPosition} />
        {currentPosition ? <Marker position={currentPosition} /> : null}
        {destination ? <Marker position={destination} /> : null}
        {routePreview.length > 1 ? <Polyline positions={routePreview} pathOptions={{ color: "#7df9ff", weight: 5 }} /> : null}
      </MapContainer>

      <div className="map-overlay-grid" />

      <button
        type="button"
        onClick={requestGeo}
        className="absolute right-4 top-4 z-[1000] h-14 w-14 rounded-full border border-cyan-300/40 bg-slate-900/85 text-2xl text-cyan-200 shadow-lg shadow-cyan-500/20 backdrop-blur active:scale-95"
        aria-label="Use current location"
      >
        ⦿
      </button>

      <section className="absolute bottom-0 left-0 right-0 z-[1000] rounded-t-3xl border-t border-cyan-300/25 bg-slate-950/90 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-cyan-200/50" />
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">БРОДЯГА Navigator</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-slate-200">Tap map to set destination</p>
          <span className="rounded-full border border-cyan-300/30 px-3 py-1 text-xs text-cyan-200">Day 1 MVP</span>
        </div>
      </section>
    </main>
  );
}
