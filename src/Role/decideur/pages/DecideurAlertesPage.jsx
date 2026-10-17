// Alertes de décision : infrastructures critiques, signalements urgents, plans urgents.
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BellRing, AlertTriangle, Check } from "lucide-react";
import DecideurLayout, { PageHeader } from "../components/DecideurLayout";
import Badge from "../../gestionnaire/components/Badge";
import Button from "../../gestionnaire/components/Buttons";
import EmptyState from "../../gestionnaire/components/EmptyState";
import { useAsyncData } from "../../gestionnaire/hooks/useAsyncData";
import { decideurService } from "../services/decideurService";
import { NIVEAUX_ALERTE, getConstant } from "../constants";
import { formatDateTime } from "../../gestionnaire/utils/format";

const DecideurAlertesPage = () => {
  const [filtreNiveau, setFiltreNiveau] = useState("");
  const [lues, setLues] = useState([]);

  const { data, loading } = useAsyncData(() => decideurService.getAlertes(), []);

  const alertes = useMemo(() => {
    const liste = [...(data || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return filtreNiveau ? liste.filter((a) => a.niveau === filtreNiveau) : liste;
  }, [data, filtreNiveau]);

  const marquerLue = (id) => setLues((prev) => [...prev, id]);
  const nonLues = alertes.filter((a) => !lues.includes(a.id_alerte)).length;

  const compteParNiveau = (niv) => (data || []).filter((a) => a.niveau === niv).length;

  return (
    <DecideurLayout>
      <PageHeader
        title="Alertes"
        description="Alertes nécessitant une décision ou une attention particulière."
        actions={
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            {nonLues} non lue(s)
          </span>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Object.values(NIVEAUX_ALERTE).map((n) => (
          <button
            key={n.value}
            onClick={() => setFiltreNiveau(filtreNiveau === n.value ? "" : n.value)}
            className={`flex items-center justify-between rounded-xl border bg-white p-4 text-left shadow-sm transition-all dark:bg-gray-800 ${
              filtreNiveau === n.value
                ? "border-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-900/40"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{n.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {compteParNiveau(n.value)}
              </p>
            </div>
            <AlertTriangle
              className={`h-8 w-8 ${
                n.value === "critique"
                  ? "text-red-500"
                  : n.value === "haute"
                    ? "text-orange-500"
                    : "text-blue-500"
              }`}
            />
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Chargement des alertes...</p>
      ) : alertes.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="Aucune alerte"
          description="Aucune alerte ne correspond à ce filtre."
        />
      ) : (
        <ul className="space-y-3">
          {alertes.map((a) => {
            const estLue = lues.includes(a.id_alerte);
            return (
              <li
                key={a.id_alerte}
                className={`flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm transition-colors dark:bg-gray-800 sm:flex-row sm:items-center ${
                  estLue
                    ? "border-gray-200 opacity-60 dark:border-gray-700"
                    : a.niveau === "critique"
                      ? "border-l-4 border-l-red-500 border-gray-200 dark:border-gray-700"
                      : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge config={getConstant(NIVEAUX_ALERTE, a.niveau)} />
                    <h3 className="font-medium text-gray-900 dark:text-white">{a.titre}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{a.message}</p>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {formatDateTime(a.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                  {a.id_infra && (
                    <Link
                      to="/decideur/priorites"
                      className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      Voir le classement
                    </Link>
                  )}
                  {a.id_signal && (
                    <Link
                      to="/decideur/signalements"
                      className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      Voir le signalement
                    </Link>
                  )}
                  {a.id_plan && (
                    <Link
                      to="/decideur/plans"
                      className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      Décider du plan
                    </Link>
                  )}
                  {!estLue && (
                    <Button variant="ghost" onClick={() => marquerLue(a.id_alerte)}>
                      <Check className="h-4 w-4" /> Marquer lue
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DecideurLayout>
  );
};

export default DecideurAlertesPage;
