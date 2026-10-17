// Interventions déjà réalisées (transparence publique activée).
import React, { useMemo, useState } from "react";
import { ThumbsUp, CalendarCheck, Info } from "lucide-react";
import CitoyenLayout, { PageHeader } from "../components/CitoyenLayout";
import {
  CitoyenBadge,
  CitoyenEmptyState,
  CitoyenLoading,
  inputClass,
} from "../components/CitoyenUI";
import { useAsyncData } from "../hooks/useAsyncData";
import { citoyenService } from "../services/citoyenService";
import { QUARTIERS } from "../constants";
import { formatDate } from "../utils/format";

const LABELS_TYPE = {
  maintenance: "Maintenance",
  inspection: "Inspection",
  travaux: "Travaux",
};

const InterventionsPubliquesPage = () => {
  const [filtreQuartier, setFiltreQuartier] = useState("");

  const { data, loading } = useAsyncData(
    () => citoyenService.getInterventionsPubliques(),
    []
  );

  const liste = useMemo(() => {
    return (data || []).filter((i) => !filtreQuartier || i.quartier === filtreQuartier);
  }, [data, filtreQuartier]);

  return (
    <CitoyenLayout>
      <PageHeader
        title="Interventions réalisées"
        description="Consultez les interventions déjà réalisées dans la ville."
      />

      <div className="mb-5 flex items-center gap-2 rounded-lg border-l-4 border-blue-500 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/60 dark:bg-blue-900/30 dark:text-blue-300">
        <Info className="h-4 w-4 shrink-0" />
        La transparence publique est activée : les interventions terminées sont consultables.
      </div>

      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:max-w-xs">
          Filtrer par quartier
          <select
            value={filtreQuartier}
            onChange={(e) => setFiltreQuartier(e.target.value)}
            className={`mt-1 ${inputClass}`}
          >
            <option value="">Tous les quartiers</option>
            {QUARTIERS.map((q) => (
              <option key={q.value} value={q.value}>
                {q.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <CitoyenLoading />
      ) : liste.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <CitoyenEmptyState
            icon={ThumbsUp}
            title="Aucune intervention"
            description="Aucune intervention réalisée ne correspond à ces critères."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {liste.map((i) => (
            <div
              key={i.id_inter}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{i.titre}</h3>
                <CitoyenBadge tone="green">
                  {LABELS_TYPE[i.type] || i.type}
                </CitoyenBadge>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{i.observations}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <CalendarCheck className="h-3.5 w-3.5" /> Réalisée le {formatDate(i.date_realisation)}
                </span>
                <span>{i.quartier}</span>
                {i.id_infra && <span>Infrastructure : {i.id_infra}</span>}
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {liste.length} intervention(s) réalisée(s).
          </p>
        </div>
      )}
    </CitoyenLayout>
  );
};

export default InterventionsPubliquesPage;
