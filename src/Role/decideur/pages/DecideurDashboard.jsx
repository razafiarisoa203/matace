// Tableau de bord global du Décideur : KPI, évolution, zones critiques.
import React from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  AlertTriangle,
  MessageSquareWarning,
  Wrench,
  ClipboardCheck,
  Hammer,
  Wallet,
  ChevronRight,
  Coins,
} from "lucide-react";
import DecideurLayout, { PageHeader } from "../components/DecideurLayout";
import StatCard from "../../gestionnaire/components/StatCard";
import Badge from "../../gestionnaire/components/Badge";
import { BarChart, GroupedBarChart, ProgressBar } from "../components/Charts";
import { useAsyncData } from "../../gestionnaire/hooks/useAsyncData";
import { decideurService } from "../services/decideurService";
import {
  NIVEAUX_PRIORITE,
  getConstant,
} from "../constants";
import { ETATS_INFRASTRUCTURE } from "../../gestionnaire/constants";
import { formatMontant } from "../../gestionnaire/utils/format";

const COULEURS_ETAT = {
  bon: "#16a34a",
  moyen: "#eab308",
  degrade: "#ea580c",
  critique: "#dc2626",
};

const etatLabel = (etat) =>
  ({ bon: "Bon", moyen: "Moyen", degrade: "Dégradé", critique: "Critique" }[etat] || etat);

const DecideurDashboard = () => {
  const { data, loading, error, recharger } = useAsyncData(async () => {
    const [kpi, evolution, zones, infra] = await Promise.all([
      decideurService.getKPI(),
      decideurService.getEvolutionSignalements(),
      decideurService.getZonesCritiques(),
      decideurService.getInfrastructures(),
    ]);
    return { kpi, evolution, zones, infra };
  }, []);

  const kpi = data?.kpi;
  const evolution = data?.evolution || [];
  const zones = data?.zones || [];
  const infra = data?.infra || [];

  const parEtat = ["bon", "moyen", "degrade", "critique"].map((e) => ({
    label: etatLabel(e),
    value: infra.filter((i) => i.etat === e).length,
    color: COULEURS_ETAT[e],
  }));

  return (
    <DecideurLayout>
      <PageHeader
        title="Tableau de bord"
        description="Pilotage global : situation des infrastructures, évolution des signalements et zones prioritaires."
        actions={
          <Link
            to="/decideur/priorites"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <ClipboardCheck className="h-4 w-4" /> Voir les priorités
          </Link>
        }
      />

      {loading && (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-emerald-500" />
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

      {!loading && kpi && (
        <div className="space-y-8">
          {/* KPI principaux */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Building2} label="Infrastructures" value={kpi.totalInfrastructures} tone="green" />
            <StatCard
              icon={AlertTriangle}
              label="État critique"
              value={`${kpi.infrastructuresCritiques} (${kpi.tauxCritique}%)`}
              tone="red"
            />
            <StatCard
              icon={MessageSquareWarning}
              label="Signalements ouverts"
              value={kpi.signalementsOuverts}
              tone="blue"
            />
            <StatCard icon={Wrench} label="Interventions en cours" value={kpi.interventionsEnCours} tone="yellow" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={ClipboardCheck} label="Plans à valider" value={kpi.plansEnAttente} tone="yellow" />
            <StatCard icon={Hammer} label="Projets priorisés" value={kpi.projetsPriorises} tone="blue" />
            <StatCard icon={Coins} label="Coût estimé des plans" value={formatMontant(kpi.coutEstimeTotal)} tone="gray" />
            <StatCard
              icon={Wallet}
              label="Budget engagé"
              value={`${kpi.tauxEngagement}%`}
              tone="green"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* État du parc */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">Répartition par état</h2>
              <BarChart data={parEtat} height={200} />
            </div>

            {/* Évolution signalements */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Évolution des signalements (6 mois)
                </h2>
                <Link
                  to="/decideur/signalements"
                  className="inline-flex items-center text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Détails <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <GroupedBarChart
                data={evolution}
                series={[
                  { key: "recus", label: "Reçus", color: "#0ea5e9" },
                  { key: "resolus", label: "Résolus", color: "#16a34a" },
                ]}
                height={200}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Budget */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Engagement budgétaire</h2>
              </div>
              <ProgressBar value={kpi.tauxEngagement} label="Engagé / enveloppe" color="#16a34a" />
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Enveloppe</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatMontant(kpi.budgetEnveloppe)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Engagé</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatMontant(kpi.budgetEngage)}
                  </span>
                </div>
              </div>
              <Link
                to="/decideur/budget"
                className="mt-4 inline-block text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              >
                Programmation budgétaire →
              </Link>
            </div>

            {/* Zones critiques */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Infrastructures critiques / zones prioritaires
                </h2>
                <Link
                  to="/decideur/priorites"
                  className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Classement
                </Link>
              </div>
              {zones.length === 0 ? (
                <p className="p-5 text-sm text-gray-500 dark:text-gray-400">Aucune zone critique.</p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {zones.slice(0, 6).map((z) => (
                    <li key={z.id_infra} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {z.nom}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {z.id_infra} · {z.commune || "—"} · score {z.score}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge config={getConstant(ETATS_INFRASTRUCTURE, z.etat)} />
                        <Badge config={getConstant(NIVEAUX_PRIORITE, z.niveau)} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Signalements résolus : {kpi.tauxResolution}% · Le décideur arbitre les priorités et valide
            les budgets.
          </p>
        </div>
      )}
    </DecideurLayout>
  );
};

export default DecideurDashboard;
