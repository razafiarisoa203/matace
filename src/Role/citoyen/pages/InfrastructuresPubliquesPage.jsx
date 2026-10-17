// Informations générales des infrastructures publiques (sans données sensibles).
import React, { useMemo, useState } from "react";
import { Building2, Search } from "lucide-react";
import CitoyenLayout, { PageHeader } from "../components/CitoyenLayout";
import {
  CitoyenBadge,
  CitoyenEmptyState,
  CitoyenLoading,
  inputClass,
} from "../components/CitoyenUI";
import MiniCarte from "../components/MiniCarte";
import { useAsyncData } from "../hooks/useAsyncData";
import { citoyenService } from "../services/citoyenService";
import {
  QUARTIERS,
  ETATS_INFRASTRUCTURE,
  TYPES_INFRASTRUCTURE,
} from "../constants";
import { formatDate } from "../utils/format";

const tonesParEtat = {
  bon: "green",
  moyen: "yellow",
  degrade: "red",
  critique: "red",
};

const InfrastructuresPubliquesPage = () => {
  const [recherche, setRecherche] = useState("");
  const [filtreType, setFiltreType] = useState("");
  const [filtreEtat, setFiltreEtat] = useState("");
  const [filtreQuartier, setFiltreQuartier] = useState("");
  const [selection, setSelection] = useState(null);

  const { data, loading } = useAsyncData(
    () => citoyenService.getInfrastructuresPubliques(),
    []
  );

  const liste = useMemo(() => {
    const q = recherche.toLowerCase();
    return (data || []).filter((i) => {
      const matchRecherche =
        !q ||
        i.nom?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q);
      const matchType = !filtreType || i.type === filtreType;
      const matchEtat = !filtreEtat || i.etat === filtreEtat;
      const matchQuartier = !filtreQuartier || i.quartier === filtreQuartier;
      return matchRecherche && matchType && matchEtat && matchQuartier;
    });
  }, [data, recherche, filtreType, filtreEtat, filtreQuartier]);

  const labelType = (value) =>
    TYPES_INFRASTRUCTURE.find((t) => t.value === value)?.label || value;

  return (
    <CitoyenLayout>
      <PageHeader
        title="Infrastructures publiques"
        description="Consultez les informations générales des infrastructures (état, localisation)."
      />

      <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher..."
            className={`${inputClass} pl-9`}
          />
        </div>
        <select value={filtreType} onChange={(e) => setFiltreType(e.target.value)} className={inputClass}>
          <option value="">Tous les types</option>
          {TYPES_INFRASTRUCTURE.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select value={filtreEtat} onChange={(e) => setFiltreEtat(e.target.value)} className={inputClass}>
          <option value="">Tous les états</option>
          {Object.values(ETATS_INFRASTRUCTURE).map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>
        <select
          value={filtreQuartier}
          onChange={(e) => setFiltreQuartier(e.target.value)}
          className={inputClass}
        >
          <option value="">Tous les quartiers</option>
          {QUARTIERS.map((q) => (
            <option key={q.value} value={q.value}>
              {q.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {loading ? (
            <CitoyenLoading />
          ) : liste.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <CitoyenEmptyState
                icon={Building2}
                title="Aucune infrastructure"
                description="Aucune infrastructure ne correspond à ces critères."
              />
            </div>
          ) : (
            liste.map((i) => (
              <button
                key={i.id_infra}
                onClick={() => setSelection(i)}
                className={`w-full rounded-xl border bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 ${
                  selection?.id_infra === i.id_infra
                    ? "border-green-500 dark:border-green-500"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {i.nom}
                  </h3>
                  <CitoyenBadge tone={tonesParEtat[i.etat] || "gray"}>
                    État : {ETATS_INFRASTRUCTURE[i.etat]?.label || i.etat}
                  </CitoyenBadge>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{i.description}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{labelType(i.type)}</span>
                  <span>{i.commune} — {i.quartier}</span>
                  <span>Dernier contrôle : {formatDate(i.dernier_controle)}</span>
                </div>
              </button>
            ))
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {liste.length} infrastructure(s) affichée(s).
          </p>
        </div>

        {/* Aperçu */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            {selection ? selection.nom : "Aperçu"}
          </h2>
          {selection ? (
            <MiniCarte latitude={selection.latitude} longitude={selection.longitude} />
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Sélectionnez une infrastructure pour afficher sa localisation.
            </p>
          )}
        </div>
      </div>
    </CitoyenLayout>
  );
};

export default InfrastructuresPubliquesPage;
