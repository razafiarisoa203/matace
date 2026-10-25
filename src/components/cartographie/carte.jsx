import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation } from "lucide-react";

// WFS
import { fetchFokontanyByName } from "../../services/layer/wfs";
import { useFokontany } from "../../hooks/useFokontany";
import { getBoundsFromGeoJSON } from "../../utils/mapUtils";

// MODAL
import ZoneInfoModal from "../cartographie/zoningInfo";

export default function Carte() {
  const mapRef = useRef(null);
  const fokontanyLayerRef = useRef(null);

  const [selectedFokontany, setSelectedFokontany] = useState("");
  const [isZooming, setIsZooming] = useState(false);

  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const { fokontanyNames, isLoading } = useFokontany();

  /* ===============================
     INITIALISATION MAP
  ================================ */
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("mapid").setView([-23.35, 43.67], 13);

    L.tileLayer("https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
      attribution: "© Google",
    }).addTo(map);

    map.on("click", (e) => {
      setSelectedPoint({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
      setModalOpen(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /* ===============================
     ZOOM FOKONTANY
  ================================ */
  const handleFokontanySelect = async (nom) => {
    if (!nom || !mapRef.current) return;

    setIsZooming(true);
    setSelectedFokontany(nom);

    try {
      // Supprimer l'ancienne couche colorée
      if (fokontanyLayerRef.current) {
        mapRef.current.removeLayer(fokontanyLayerRef.current);
        fokontanyLayerRef.current = null;
      }

      const feature = await fetchFokontanyByName(nom);
      const bounds = getBoundsFromGeoJSON(feature);

      if (bounds) {
        mapRef.current.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 18,
        });
      }

      // Ajouter la couche colorée
      if (feature) {
        fokontanyLayerRef.current = L.geoJSON(feature, {
          style: {
            fillColor: '#fbbf24',
            fillOpacity: 0.4,
            color: '#f59e0b',
            weight: 3
          }
        }).addTo(mapRef.current);
      }
    } catch (err) {
      console.error("Erreur Fokontany:", err);
    } finally {
      setTimeout(() => setIsZooming(false), 500);
    }
  };

  /* ===============================
     RECHERCHE PAR COORD
  ================================ */
  const handleCoordSubmit = (e) => {
    e.preventDefault();
    if (!lat || !lon || !mapRef.current) return;

    const point = {
      lat: parseFloat(lat),
      lng: parseFloat(lon),
    };

    mapRef.current.setView(point, 18);
    setSelectedPoint(point);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* ================= CONTROLES ================= */}
      <div className="p-4 bg-white shadow-md">
        <div className="flex flex-wrap items-end gap-4">

          {/* Fokontany */}
          <div className="flex-1 min-w-[220px] space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin size={18} className="text-blue-600" />
              Fokontany
            </label>
            <select
              className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleFokontanySelect(e.target.value)}
              value={selectedFokontany}
              disabled={isZooming || isLoading}
            >
              <option value="">-- Choisir --</option>
              {fokontanyNames.map((f, i) => (
                <option key={i} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Latitude */}
          <div className="flex-1 min-w-[180px] space-y-2">
            <label className="text-sm font-medium text-gray-700">Latitude</label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="-23.35"
              className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Longitude */}
          <div className="flex-1 min-w-[180px] space-y-2">
            <label className="text-sm font-medium text-gray-700">Longitude</label>
            <input
              type="number"
              step="any"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              placeholder="43.67"
              className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Bouton */}
          <button
            onClick={handleCoordSubmit}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
          >
            <Navigation size={18} />
            Rechercher
          </button>
        </div>
      </div>

      {/* ================= CARTE ================= */}
      <div className="flex-1">
        <div id="mapid" className="h-full w-full" />
      </div>

      {/* ================= MODAL ================= */}
      <ZoneInfoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        lng={selectedPoint?.lng}
        lat={selectedPoint?.lat}
      />
    </div>
  );
}