// Tableau de bord du Gestionnaire : vue d'ensemble opérationnelle.
import React from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  MessageSquareWarning,
  Wrench,
  BellRing,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Coins,
} from "lucide-react";
import GestionnaireLayout, { PageHeader } from "../components/GestionnaireLayout";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge";
import { useAsyncData } from "../hooks/useAsyncData";
import { gestionnaireService } from "../services/gestionnaireService";
import {
  ETATS_INFRASTRUCTURE,
  STATUTS_SIGNALEMENT,
  STATUTS_INTERVENTION,
  getConstant,
} from "../constants";
import { formatDate, formatMontant } from "../utils/format";

const GestionnaireDashboard = () => {
  const { data, loading, error, recharger } = useAsyncData(async () => {
    const [stats, alertes, interventions, signalements] = await Promise.all([
      gestionnaireService.getStatistiques(),
      gestionnaireService.getAlertes({ nonLues: true }),
      gestionnaireService.getInterventions(),
      gestionnaireService.getSignalements(),
    ]);
    return { stats, alertes, interventions, signalements };
  }, []);

  const stats = data?.stats;
  const alertes = data?.alertes || [];
  const interventionsEnCours = (data?.interventions || []).filter(
    (i) => i.statut === "en_cours" || i.statut === "affectee" || i.statut === "planifiee"
  );
  const signalementsRecents = (data?.signalements || []).slice(0, 5);

  return (
    <GestionnaireLayout>
      <PageHeader
        title="Tableau de bord"
        description="Acteur opérationnel : suivi des infrastructures, signalements et interventions de votre périmètre."
        actions={
          <Link
            to="/gestionnaire/infrastructures"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <Building2 className="h-4 w-4" /> Gérer les infrastructures
          </Link>
        }
      />

      {loading && (
        <div className="flex h-48 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-green-500" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
          <button onClick={recharger} className="ml-2 font-medium underline">
            Réessayer
          </button>
        </div>
      )}

      {!loading && stats && (
        <div className="space-y-8">
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Building2}
              label="Infrastructures"
              value={stats.totalInfrastructures}
              tone="green"
            />
            <StatCard
              icon={MessageSquareWarning}
              label="Signalements"
              value={stats.totalSignalements}
              tone="blue"
            />
            <StatCard
              icon={Wrench}
              label="Interventions en cours"
              value={stats.interventionsEnCours}
              tone="yellow"
            />
            <StatCard
              icon={BellRing}
              label="Alertes non lues"
              value={stats.alertesNonLues}
              tone="red"
            />
          </div>

          {/* État du parc */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  État du parc d'infrastructures
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(ETATS_INFRASTRUCTURE).map(([key, cfg]) => (
                  <div
                    key={key}
                    className="rounded-lg border border-gray-100 p-3 text-center dark:border-gray-700"
                  >
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {stats.parEtat[key] || 0}
                    </div>
                    <div className="mt-1">
                      <Badge config={cfg} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Coins className="h-4 w-4" /> Coût total prévu
                  </div>
                  <div className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {formatMontant(stats.coutTotalPrevu)}
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Coins className="h-4 w-4" /> Coût réel engagé
                  </div>
                  <div className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {formatMontant(stats.coutTotalReel)}
                  </div>
                </div>
              </div>
            </div>

            {/* Alertes */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BellRing className="h-5 w-5 text-red-500" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">Alertes</h2>
                </div>
                <Link
                  to="/gestionnaire/alertes"
                  className="text-sm font-medium text-green-600 hover:underline dark:text-green-400"
                >
                  Tout voir
                </Link>
              </div>
              {alertes.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Aucune alerte non lue.</p>
              ) : (
                <ul className="space-y-3">
                  {alertes.slice(0, 4).map((a) => (
                    <li
                      key={a.id_alerte}
                      className="rounded-lg border-l-4 border-red-400 bg-red-50/60 p-3 dark:bg-red-900/20"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {a.titre}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{a.message}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Signalements récents */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Signalements récents
              </h2>
              <Link
                to="/gestionnaire/signalements"
                className="inline-flex items-center text-sm font-medium text-green-600 hover:underline dark:text-green-400"
              >
                Gérer <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {signalementsRecents.length === 0 ? (
              <p className="p-5 text-sm text-gray-500 dark:text-gray-400">Aucun signalement.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {signalementsRecents.map((s) => (
                  <li key={s.id_signal} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {s.titre}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {s.id_signal} · {s.declarant || "—"} · {formatDate(s.date_signalement)}
                      </p>
                    </div>
                    <Badge config={getConstant(STATUTS_SIGNALEMENT, s.statut)} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Interventions actuelles */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Interventions à suivre
              </h2>
              <Link
                to="/gestionnaire/interventions"
                className="inline-flex items-center text-sm font-medium text-green-600 hover:underline dark:text-green-400"
              >
                Gérer <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {interventionsEnCours.length === 0 ? (
              <p className="p-5 text-sm text-gray-500 dark:text-gray-400">Aucune intervention active.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {interventionsEnCours.map((i) => (
                  <li key={i.id_inter} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {i.titre}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {i.id_inter} · {i.id_infra || "sans infrastructure"}
                        </p>
                      </div>
                      <Badge config={getConstant(STATUTS_INTERVENTION, i.statut)} />
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${i.avancement || 0}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Rappel : le gestionnaire propose les priorités, mais la décision finale revient au
            décideur.
          </p>
        </div>
      )}
    </GestionnaireLayout>
  );
};

export default GestionnaireDashboard;
