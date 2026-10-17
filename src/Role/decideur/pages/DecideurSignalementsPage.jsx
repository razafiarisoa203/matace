// Suivi des signalements citoyens et de leur évolution (vue Décideur).
import React, { useMemo, useState } from "react";
import { MessageSquareWarning } from "lucide-react";
import DecideurLayout, { PageHeader } from "../components/DecideurLayout";
import Badge from "../../gestionnaire/components/Badge";
import EmptyState from "../../gestionnaire/components/EmptyState";
import { GroupedBarChart } from "../components/Charts";
import { useAsyncData } from "../../gestionnaire/hooks/useAsyncData";
import { decideurService } from "../services/decideurService";
import { TERRITOIRES, getConstant } from "../constants";
import { STATUTS_SIGNALEMENT, PRIORITES } from "../../gestionnaire/constants";
import { formatDate } from "../../gestionnaire/utils/format";

const labelTerritoire = (v) => TERRITOIRES.find((t) => t.value === v)?.label || v;

const DecideurSignalementsPage = () => {
  const [filtreStatut, setFiltreStatut] = useState("");
  const [filtreTerritoire, setFiltreTerritoire] = useState("");

  const { data, loading } = useAsyncData(
    () =>
      decideurService.getSignalements({
        ...(filtreStatut ? { statut: filtreStatut } : {}),
        ...(filtreTerritoire ? { territoire: filtreTerritoire } : {}),
      }),
    [filtreStatut, filtreTerritoire]
  );

  const { data: evolution } = useAsyncData(() => decideurService.getEvolutionSignalements(), []);

  const signalements = useMemo(
    () => [...(data || [])].sort((a, b) => new Date(b.date_signalement) - new Date(a.date_signalement)),
    [data]
  );

  const parStatut = ["nouveau", "en_cours", "resolu", "rejete"].map((st) => ({
    label: getConstant(STATUTS_SIGNALEMENT, st).label,
    value: signalements.filter((s) => s.statut === st).length,
  }));

  return (
    <DecideurLayout>
      <PageHeader
        title="Signalements citoyens"
        description="Suivre les remontées citoyens, leur statut et leur évolution dans le temps."
      />

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">
            Évolution (6 derniers mois)
          </h2>
          <GroupedBarChart
            data={evolution || []}
            series={[
              { key: "recus", label: "Reçus", color: "#0ea5e9" },
              { key: "resolus", label: "Résolus", color: "#16a34a" },
            ]}
            height={180}
          />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">
            Répartition par statut {filtreTerritoire ? `· ${labelTerritoire(filtreTerritoire)}` : ""}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {parStatut.map((s) => (
              <div
                key={s.label}
                className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-900/40"
              >
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Statut
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            className="mt-1 block w-52 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Tous</option>
            {Object.values(STATUTS_SIGNALEMENT).map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Territoire
          <select
            value={filtreTerritoire}
            onChange={(e) => setFiltreTerritoire(e.target.value)}
            className="mt-1 block w-52 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Tous</option>
            {TERRITOIRES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
      ) : signalements.length === 0 ? (
        <EmptyState
          icon={MessageSquareWarning}
          title="Aucun signalement"
          description="Aucun signalement ne correspond aux filtres."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  {["Réf.", "Titre", "Territoire", "Priorité proposée", "Statut", "Date"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {signalements.map((s) => (
                  <tr key={s.id_signal} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {s.id_signal}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{s.titre}</p>
                      <p className="max-w-md truncate text-xs text-gray-500 dark:text-gray-400">
                        {s.description}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {labelTerritoire(s.perimetre)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge config={getConstant(PRIORITES, s.priorite_proposee)} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge config={getConstant(STATUTS_SIGNALEMENT, s.statut)} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(s.date_signalement)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DecideurLayout>
  );
};

export default DecideurSignalementsPage;
