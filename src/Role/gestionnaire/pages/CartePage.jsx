// Carte des infrastructures avec couches liées au périmètre du gestionnaire.
import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Layers, Map as MapIcon } from "lucide-react";
import GestionnaireLayout, { PageHeader } from "../components/GestionnaireLayout";
import Badge from "../components/Badge";
import { useAsyncData } from "../hooks/useAsyncData";
import { gestionnaireService } from "../services/gestionnaireService";
import {
  ETATS_INFRASTRUCTURE,
  TYPES_INFRASTRUCTURE,
  getConstant,
  labelForType,
} from "../constants";

const COULEURS_ETAT = {
  bon: "#16a34a",
  moyen: "#eab308",
  degrade: "#ea580c",
  critique: "#dc2626",
};

const CENTRE = [-18.9137, 47.525];

const CartePage = () => {
  const mapRef = useRef(null);
  const coucheRef = useRef(null);
  const [filtreEtat, setFiltreEtat] = useState("");
  const [filtreType, setFiltreType] = useState("");
  const [fondSatellite, setFondSatellite] = useState(true);

  const { data: infrastructures } = useAsyncData(
    () => gestionnaireService.getInfrastructures(),
    []
  );

  const liste = useMemo(() => {
    return (infrastructures || []).filter((i) => {
      const okEtat = !filtreEtat || i.etat === filtreEtat;
      const okType = !filtreType || i.type === filtreType;
      return okEtat && okType;
    });
  }, [infrastructures, filtreEtat, filtreType]);

  // Initialisation de la carte
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map("gestionnaire-map").setView(CENTRE, 13);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fonds de carte
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    map.eachLayer((l) => {
      if (l instanceof L.TileLayer) map.removeLayer(l);
    });
    const url = fondSatellite
      ? "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
      : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    L.tileLayer(url, {
      attribution: fondSatellite ? "© Google" : "© OpenStreetMap",
    }).addTo(map);
  }, [fondSatellite]);

  // Marqueurs (couche d'infrastructures)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (coucheRef.current) {
      map.removeLayer(coucheRef.current);
    }
    const groupe = L.layerGroup();

    liste.forEach((i) => {
      if (i.latitude == null || i.longitude == null) return;
      const couleur = COULEURS_ETAT[i.etat] || "#6b7280";
      const marker = L.circleMarker([i.latitude, i.longitude], {
        radius: 8,
        color: "#ffffff",
        weight: 2,
        fillColor: couleur,
        fillOpacity: 0.9,
      });
      marker.bindPopup(
        `<div style="font-family:inherit;min-width:180px">
          <strong>${i.nom}</strong><br/>
          <span style="color:#6b7280">${i.id_infra} · ${labelForType(i.type)}</span><br/>
          État : ${getConstant(ETATS_INFRASTRUCTURE, i.etat)?.label}<br/>
          Commune : ${i.commune || "—"}
        </div>`
      );
      groupe.addLayer(marker);
    });

    groupe.addTo(map);
    coucheRef.current = groupe;
  }, [liste]);

  return (
    <GestionnaireLayout>
      <PageHeader
        title="Carte & couches"
        description="Consulter la carte et les couches liées à votre périmètre d'intervention."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Panneau de couches */}
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Couches</h2>
          </div>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Fond de carte
            <select
              value={fondSatellite ? "satellite" : "plan"}
              onChange={(e) => setFondSatellite(e.target.value === "satellite")}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="satellite">Satellite</option>
              <option value="plan">Plan (OpenStreetMap)</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            État
            <select
              value={filtreEtat}
              onChange={(e) => setFiltreEtat(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Tous</option>
              {Object.values(ETATS_INFRASTRUCTURE).map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Type
            <select
              value={filtreType}
              onChange={(e) => setFiltreType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Tous</option>
              {TYPES_INFRASTRUCTURE.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          {/* Légende */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Légende</p>
            <ul className="space-y-1.5">
              {Object.values(ETATS_INFRASTRUCTURE).map((e) => (
                <li key={e.value} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: COULEURS_ETAT[e.value] }}
                  />
                  {e.label}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            {liste.length} infrastructure(s) localisée(s).
          </p>
        </div>

        {/* Carte */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-3">
          <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-700">
            <MapIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Périmètre des infrastructures
            </span>
            {filtreEtat && (
              <Badge config={getConstant(ETATS_INFRASTRUCTURE, filtreEtat)} />
            )}
          </div>
          <div id="gestionnaire-map" className="h-[600px] w-full" />
        </div>
      </div>
    </GestionnaireLayout>
  );
};

export default CartePage;
