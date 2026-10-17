// Aperçu en lecture seule d'une localisation sur une carte.
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MiniCarte = ({ latitude, longitude, height = "h-56" }) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current == null) return undefined;
    if (latitude == null || longitude == null) return undefined;
    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([latitude, longitude], 16);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
      L.marker([latitude, longitude]).addTo(map);
      mapRef.current = map;
    } else {
      mapRef.current.setView([latitude, longitude], 16);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude]);

  if (latitude == null || longitude == null) {
    return (
      <div className={`flex ${height} items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-400 dark:border-gray-700`}>
        Localisation non renseignée
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${height} w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700`}
    />
  );
};

export default MiniCarte;
