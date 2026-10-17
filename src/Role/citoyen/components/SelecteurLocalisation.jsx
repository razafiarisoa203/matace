// Sélecteur de localisation : GPS automatique + repositionnement manuel sur la carte.
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, MapPin, Loader2 } from "lucide-react";
import { CitoyenButton, inputClass } from "./CitoyenUI";

const CENTRE_DEFAUT = [-18.9137, 47.525];

const SelecteurLocalisation = ({ latitude, longitude, onChange }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const containerRef = useRef(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");

  // Initialisation de la carte
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const centre =
      latitude != null && longitude != null ? [latitude, longitude] : CENTRE_DEFAUT;
    const map = L.map(containerRef.current).setView(centre, 15);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    map.on("click", (e) => {
      onChange(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Synchronisation du marqueur (position GPS ou déplacement manuel)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (latitude == null || longitude == null) return;
    const position = [latitude, longitude];

    if (!markerRef.current) {
      const marker = L.marker(position, { draggable: true }).addTo(map);
      marker.on("dragend", () => {
        const p = marker.getLatLng();
        onChange(p.lat, p.lng);
      });
      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng(position);
    }
    map.setView(position, Math.max(map.getZoom(), 15));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  // Nettoyage
  useEffect(
    () => () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    },
    []
  );

  // Géolocalisation automatique via le GPS du navigateur.
  const localiser = () => {
    if (!navigator.geolocation) {
      setGpsError("La géolocalisation n'est pas prise en charge par votre navigateur.");
      return;
    }
    setGpsLoading(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setGpsLoading(false);
      },
      () => {
        setGpsError("Localisation impossible. Déplacez le point manuellement sur la carte.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Latitude
          </span>
          <input
            type="number"
            step="any"
            value={latitude ?? ""}
            onChange={(e) =>
              onChange(e.target.value === "" ? null : Number(e.target.value), longitude)
            }
            placeholder="-18.9137"
            className={inputClass}
          />
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Longitude
          </span>
          <input
            type="number"
            step="any"
            value={longitude ?? ""}
            onChange={(e) =>
              onChange(latitude, e.target.value === "" ? null : Number(e.target.value))
            }
            placeholder="47.5250"
            className={inputClass}
          />
        </label>
        <CitoyenButton type="button" variant="secondary" onClick={localiser} disabled={gpsLoading}>
          {gpsLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Crosshair className="h-4 w-4" />
          )}
          {gpsLoading ? "Localisation..." : "Me localiser (GPS)"}
        </CitoyenButton>
      </div>

      {gpsError && <p className="text-xs text-amber-600 dark:text-amber-400">{gpsError}</p>}

      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <MapPin className="h-3.5 w-3.5" />
        Cliquez sur la carte ou déplacez le marqueur pour ajuster précisément le point.
      </div>

      <div
        ref={containerRef}
        className="h-72 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
      />
    </div>
  );
};

export default SelecteurLocalisation;
