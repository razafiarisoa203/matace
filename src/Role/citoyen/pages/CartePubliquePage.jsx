// Carte publique des problèmes signalés dans la ville + filtres.
import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Filter, Map as MapIcon, MapPin } from "lucide-react";
import CitoyenLayout, { PageHeader } from "../components/CitoyenLayout";
import { CitoyenBadge, inputClass } from "../components/CitoyenUI";
import { useAsyncData } from "../hooks/useAsyncData";
import { citoyenService } from "../services/citoyenService";
import {
  CATEGORIES_SIGNALEMENT,
  STATUTS_SIGNALEMENT,
  QUARTIERS,
  getConstant,
} from "../constants";
import { formatDate } from "../utils/format";

const COULEURS_STATUT = {
  nouveau: "#2563eb",
  pris_en_charge: "#7c3aed",
  en_cours: "#eab308",
  resolu: "#16a34a",
  rejete: "#dc2626",
};

const CENTRE = [-18.9137, 47.525];

const CartePubliquePage = () => {
  const mapRef = useRef(null);
  const coucheRef = useRef(null);
  const [categorie, setCategorie] = useState("");
  const [statut, setStatut] = useState("");
  const [quartier, setQuartier] = useState("");
  const [du, setDu] = useState("");
  const [au, setAu] = useState("");

  const { data } = useAsyncData(() => citoyenService.getSignalementsPublics(), []);

  const liste = useMemo(() => {
    return (data || []).filter((s) => {
      const d = new Date(s.date_signalement);
      if (categorie && s.categorie !== categorie) return false;
      if (statut && s.statut !== statut) return false;
      if (quartier && s.quartier !== quartier) return false;
      if (du && d < new Date(du)) return false;
      if (au && d > new Date(au)) return false;
      return true;
    });
  }, [data, categorie, statut, quartier, du, au]);

  // Initialisation carte
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map("citoyen-map").setView(CENTRE, 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Marqueurs
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (coucheRef.current) map.removeLayer(coucheRef.current);

    const groupe = L.layerGroup();
    liste.forEach((s) => {
      if (s.latitude == null || s.longitude == null) return;
      const couleur = COULEURS_STATUT[s.statut] || "#6b7280";
      const marker = L.circleMarker([s.latitude, s.longitude], {
        radius: 8,
        color: "#ffffff",
        weight: 2,
        fillColor: couleur,
        fillOpacity: 0.9,
      });
      marker.bindPopup(
        `<div style="font-family:inherit;min-width:200px">
          <strong>${s.titre}</strong><br/>
          <span style="color:#6b7280">${getConstant(CATEGORIES_SIGNALEMENT, s.categorie).label}</span><br/>
          Statut : ${getConstant(STATUTS_SIGNALEMENT, s.statut).label}<br/>
          Quartier : ${s.quartier} · ${formatDate(s.date_signalement)}<br/>
          👍 ${s.confirmations || 0} confirmation(s)
        </div>`
      );
      groupe.addLayer(marker);
    });
    groupe.addTo(map);
    coucheRef.current = groupe;
  }, [liste]);

  const reinitialiser = () => {
    setCategorie("");
    setStatut("");
    setQuartier("");
    setDu("");
    setAu("");
  };

  return (
    <CitoyenLayout>
      <PageHeader
        title="Carte publique"
        description="Consultez les problèmes signalés dans la ville et filtrez-les."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Filtres */}
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Filtres</h2>
          </div>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Catégorie
            <select value={categorie} onChange={(e) => setCategorie(e.target.value)} className={`mt-1 ${inputClass}`}>
              <option value="">Toutes</option>
              {Object.values(CATEGORIES_SIGNALEMENT).map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Statut
            <select value={statut} onChange={(e) => setStatut(e.target.value)} className={`mt-1 ${inputClass}`}>
              <option value="">Tous</option>
              {Object.values(STATUTS_SIGNALEMENT).map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Quartier
            <select value={quartier} onChange={(e) => setQuartier(e.target.value)} className={`mt-1 ${inputClass}`}>
              <option value="">Tous</option>
              {QUARTIERS.map((q) => (
                <option key={q.value} value={q.value}>
                  {q.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Du
              <input type="date" value={du} onChange={(e) => setDu(e.target.value)} className={`mt-1 ${inputClass}`} />
            </label>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Au
              <input type="date" value={au} onChange={(e) => setAu(e.target.value)} className={`mt-1 ${inputClass}`} />
            </label>
          </div>

          <button
            onClick={reinitialiser}
            className="text-sm text-green-600 hover:underline dark:text-green-400"
          >
            Réinitialiser les filtres
          </button>

          {/* Légende */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Légende</p>
            <ul className="space-y-1.5">
              {Object.values(STATUTS_SIGNALEMENT).map((s) => (
                <li key={s.value} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: COULEURS_STATUT[s.value] }}
                  />
                  {s.label}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            {liste.length} signalement(s) affiché(s).
          </p>
        </div>

        {/* Carte */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-3">
          <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-700">
            <MapIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Problèmes signalés
            </span>
            {statut && (
              <CitoyenBadge tone="slate">
                {getConstant(STATUTS_SIGNALEMENT, statut).label}
              </CitoyenBadge>
            )}
          </div>
          <div id="citoyen-map" className="h-[600px] w-full" />
        </div>
      </div>

      <p className="mt-4 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
        <MapPin className="h-3.5 w-3.5" />
        Cliquez sur un point pour afficher les détails du signalement public.
      </p>
    </CitoyenLayout>
  );
};

export default CartePubliquePage;
