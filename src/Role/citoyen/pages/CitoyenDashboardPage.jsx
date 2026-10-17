import React from "react";
import { Link } from "react-router-dom";
import {
  FilePlus,
  List,
  Map,
  Building2,
  ThumbsUp,
  Bell,
  Star,
  Clock,
  CheckCircle2,
} from "lucide-react";
import CitoyenLayout, { PageHeader } from "../components/CitoyenLayout";
import {
  CitoyenStatCard,
  CitoyenLoading,
  CitoyenBadge,
} from "../components/CitoyenUI";
import { useAsyncData } from "../hooks/useAsyncData";
import { citoyenService } from "../services/citoyenService";

const raccourcis = [
  {
    to: "/citoyen/signalements/nouveau",
    icon: FilePlus,
    title: "Nouveau signalement",
    detail: "Signaler un problème urbain",
  },
  {
    to: "/citoyen/signalements",
    icon: List,
    title: "Mes signalements",
    detail: "Suivre leur traitement",
  },
  {
    to: "/citoyen/carte",
    icon: Map,
    title: "Carte publique",
    detail: "Problèmes signalés dans la ville",
  },
  {
    to: "/citoyen/infrastructures",
    icon: Building2,
    title: "Infrastructures publiques",
    detail: "Informations générales",
  },
  {
    to: "/citoyen/interventions",
    icon: ThumbsUp,
    title: "Interventions réalisées",
    detail: "Transparence publique",
  },
  {
    to: "/citoyen/notifications",
    icon: Bell,
    title: "Notifications",
    detail: "Mises à jour de vos signalements",
  },
];

const CitoyenDashboardPage = () => {
  const { data: stats, loading } = useAsyncData(
    () => citoyenService.getStatistiques(),
    []
  );

  return (
    <CitoyenLayout>
      <PageHeader
        title="Tableau de bord — Citoyen"
        description="Signalez un problème urbain, suivez son traitement et consultez les informations publiques."
        actions={
          <Link
            to="/citoyen/signalements/nouveau"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <FilePlus className="h-4 w-4" /> Nouveau signalement
          </Link>
        }
      />

      {loading ? (
        <CitoyenLoading />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CitoyenStatCard
              icon={List}
              label="Mes signalements"
              value={stats?.total ?? 0}
              detail="Total déposés"
            />
            <CitoyenStatCard
              icon={Clock}
              label="En traitement"
              value={stats?.enTraitement ?? 0}
              detail="Pris en charge ou en cours"
              tone="amber"
            />
            <CitoyenStatCard
              icon={CheckCircle2}
              label="Résolus"
              value={stats?.resolus ?? 0}
              detail={`${stats?.rejetes ?? 0} rejeté(s)`}
              tone="green"
            />
            <CitoyenStatCard
              icon={Bell}
              label="Notifications"
              value={stats?.notificationsNonLues ?? 0}
              detail="Non lues"
              tone="violet"
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Satisfaction du service
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.noteMoyenne != null ? `${stats.noteMoyenne.toFixed(1)} / 5` : "—"}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Moyenne des évaluations de vos signalements résolus.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <Map className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Carte publique
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.signalementsPublics ?? 0}
                </span>
                <CitoyenBadge tone="blue">signalements publiés</CitoyenBadge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Problèmes visibles sur la carte de la ville.
              </p>
            </div>
          </div>

          <h2 className="mb-3 mt-8 text-lg font-semibold text-gray-900 dark:text-white">
            Accès rapides
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {raccourcis.map((r) => {
              const Icon = r.icon;
              return (
                <Link
                  key={r.to}
                  to={r.to}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="rounded-lg bg-green-100 p-2.5 text-green-600 dark:bg-green-900/40 dark:text-green-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {r.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {r.detail}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </CitoyenLayout>
  );
};

export default CitoyenDashboardPage;
