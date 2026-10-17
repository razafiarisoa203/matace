// Tableau de bord — Administrateur.
import React from "react";
import { BarChart3, Users, Server, ShieldAlert, Map, HardDrive } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import AdminPage from "../components/AdminPage";
import { AdminStatCard, AdminLoading } from "../components/AdminUI";
import { useAsyncData } from "../hooks/useAsyncData";
import { adminService } from "../services/adminService";
import { formatDateTime } from "../utils/format";

const AdminDashboardPage = () => {
  const { data: synthese, loading } = useAsyncData(() => adminService.getSynthese(), []);

  return (
    <AdminLayout>
      <AdminPage
        title="Tableau de bord — Administrateur"
        description="Accès à toutes les données et à tous les tableaux de bord. Supervision globale de la plateforme."
      >
        {loading ? (
          <AdminLoading message="Chargement des indicateurs..." />
        ) : !synthese ? (
          <p className="text-sm text-slate-400">Impossible de charger la synthèse.</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AdminStatCard
                icon={Users}
                label="Utilisateurs"
                value={synthese.utilisateurs.total}
                detail={`${synthese.utilisateurs.actifs} actifs — ${synthese.utilisateurs.administrateurs} admin`}
                tone="blue"
              />
              <AdminStatCard
                icon={Server}
                label="Microservices"
                value={`${synthese.services.up} / ${synthese.services.total}`}
                detail="Supervision en temps réel"
                tone={synthese.services.up === synthese.services.total ? "emerald" : "red"}
              />
              <AdminStatCard
                icon={ShieldAlert}
                label="Erreurs non résolues"
                value={synthese.erreursOuvertes}
                detail={`${synthese.reglesAlerteActives} règles d'alerte actives`}
                tone={synthese.erreursOuvertes > 0 ? "red" : "emerald"}
              />
              <AdminStatCard icon={Map} label="Jeux de données géospatiaux" value={synthese.jeuxDonnees} />
              <AdminStatCard icon={BarChart3} label="Couches cartographiques" value={synthese.couches} />
              <AdminStatCard
                icon={HardDrive}
                label="Tentatives échouées 24h"
                value={synthese.tentativesEchouees24h}
                tone={synthese.tentativesEchouees24h > 0 ? "amber" : "emerald"}
              />
            </div>

            {synthese.derniereSauvegarde && (
              <div className="mt-6 rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Dernière sauvegarde</div>
                    <div className="text-xs text-slate-400">
                      {synthese.derniereSauvegarde.id} — {formatDateTime(synthese.derniereSauvegarde.date)} —{" "}
                      {synthese.derniereSauvegarde.taille_go} Go — {synthese.derniereSauvegarde.type}
                    </div>
                  </div>
                  <div className="text-xs text-emerald-400">
                    Statut : {synthese.derniereSauvegarde.statut}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </AdminPage>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
