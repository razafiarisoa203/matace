// Supervision des microservices : état, santé, redémarrage.
import React, { useState } from "react";
import { Server, RefreshCw, RotateCcw, Activity, Wifi, WifiOff } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import AdminPage from "../components/AdminPage";
import {
  AdminBadge,
  AdminButton,
  AdminEmptyState,
  AdminLoading,
  AdminTable,
  AdminToast,
} from "../components/AdminUI";
import { useAsyncData } from "../hooks/useAsyncData";
import { adminService } from "../services/adminService";
import { formatDateTime, formatDuree } from "../utils/format";

const STATUT_TONE = { up: "green", degraded: "yellow", down: "red" };
const STATUT_LABEL = { up: "Opérationnel", degraded: "Dégradé", down: "Indisponible" };

const SupervisionPage = () => {
  const { data: services, loading, recharger } = useAsyncData(() => adminService.getServicesStatus(), []);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const rafraichir = async (id) => {
    setActionLoading(id);
    try {
      await adminService.refreshService(id);
      setToast({ message: `État du service ${id} actualisé.`, tone: "success" });
      await recharger();
    } finally {
      setActionLoading(null);
    }
  };

  const relancer = async (id) => {
    setActionLoading(id);
    try {
      await adminService.restartService(id);
      setToast({ message: `Redémarrage du service ${id} lancé avec succès.`, tone: "success" });
      await recharger();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <AdminPage
        title="Supervision des microservices"
        description="Superviser l'état des microservices (auth, citoyen, notification, territoire, infrastructure, geospatial, analytics)."
        actions={
          <AdminButton variant="secondary" onClick={recharger}>
            <RefreshCw className="h-4 w-4" /> Actualiser tout
          </AdminButton>
        }
      >
        {toast && <AdminToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}

        {loading ? (
          <AdminLoading message="Chargement de l'état des microservices..." />
        ) : !services?.length ? (
          <AdminEmptyState icon={Server} title="Aucun service" description="Aucun microservice supervisé." />
        ) : (
          <AdminTable
            headers={["Microservice", "Statut", "Version", "Latence", "Disponibilité", "Dernier check", "Actions"]}
          >
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {s.statut === "up" ? (
                      <Wifi className="h-4 w-4 text-emerald-400" />
                    ) : s.statut === "degraded" ? (
                      <Activity className="h-4 w-4 text-amber-400" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-400" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-white">{s.nom}</div>
                      <div className="text-xs text-slate-500">{s.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <AdminBadge tone={STATUT_TONE[s.statut] || "slate"}>
                    {STATUT_LABEL[s.statut] || s.statut}
                  </AdminBadge>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-300">{s.version}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{formatDuree(s.latence_ms)}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{s.uptime_pct}%</td>
                <td className="px-4 py-3 text-sm text-slate-400">{formatDateTime(s.dernier_check)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <AdminButton
                      variant="secondary"
                      className="!px-2.5 !py-1.5"
                      onClick={() => rafraichir(s.id)}
                      disabled={actionLoading === s.id}
                    >
                      <RefreshCw className="h-4 w-4" /> Rafraîchir
                    </AdminButton>
                    <AdminButton
                      variant="secondary"
                      className="!px-2.5 !py-1.5"
                      onClick={() => relancer(s.id)}
                      disabled={actionLoading === s.id}
                    >
                      <RotateCcw className="h-4 w-4" /> Redémarrer
                    </AdminButton>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}

        <p className="mt-3 text-xs text-slate-500">
          Les redémarrages sont simulés. Un redémarrage force le service vers l'état « Opérationnel ».
        </p>
      </AdminPage>
    </AdminLayout>
  );
};

export default SupervisionPage;
