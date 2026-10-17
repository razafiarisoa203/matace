// Logs, erreurs & performances du système.
import React, { useState } from "react";
import { Activity, AlertTriangle, BarChart3, ServerCrash } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import AdminPage from "../components/AdminPage";
import {
  AdminBadge,
  AdminButton,
  AdminEmptyState,
  AdminLoading,
  AdminTable,
  AdminTabs,
  AdminToast,
  AdminStatCard,
} from "../components/AdminUI";
import { useAsyncData } from "../hooks/useAsyncData";
import { adminService } from "../services/adminService";
import { formatDateTime, formatDuree } from "../utils/format";

const LOG_LEVELS = { INFO: "blue", WARN: "yellow", ERROR: "red" };

const LogsErreursPage = () => {
  const [onglet, setOnglet] = useState("logs");
  const [filtreNiveau, setFiltreNiveau] = useState("");
  const [filtreService, setFiltreService] = useState("");
  const [filtreResolue, setFiltreResolue] = useState("");
  const [toast, setToast] = useState(null);

  const { data: logs, loading: lLogs } = useAsyncData(
    () => adminService.getSystemLogs({ niveau: filtreNiveau, service: filtreService }),
    [onglet, filtreNiveau, filtreService]
  );

  const { data: erreurs, loading: lErr, recharger: rErr } = useAsyncData(
    () => adminService.getErrors({
      service: filtreService,
      resolue: filtreResolue ? filtreResolue === "resolue" : undefined,
    }),
    [onglet, filtreService, filtreResolue]
  );

  const { data: metriques } = useAsyncData(() => adminService.getMetrics(), [onglet]);

  const resoudre = async (id) => {
    await adminService.resolveError(id);
    setToast({ message: `Erreur ${id} marquée comme résolue.`, tone: "success" });
    await rErr();
  };

  return (
    <AdminLayout>
      <AdminPage
        title="Logs, erreurs & performances"
        description="Consulter les logs système, les erreurs applicatives et les métriques de performance."
      >
        {toast && <AdminToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}

        {metriques && onglet === "metrics" && (
          <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <AdminStatCard icon={BarChart3} label="CPU" value={`${metriques.cpu_pct}%`} />
            <AdminStatCard icon={BarChart3} label="Mémoire" value={`${metriques.memoire_pct}%`} />
            <AdminStatCard icon={BarChart3} label="Disque" value={`${metriques.disque_pct}%`} />
            <AdminStatCard icon={Activity} label="Temps de réponse" value={formatDuree(metriques.temps_reponse_ms)} />
            <AdminStatCard icon={Activity} label="Requêtes/s" value={metriques.requetes_par_s} />
            <AdminStatCard
              icon={ServerCrash}
              label="Services"
              value={`${metriques.services_up} / ${metriques.services_total}`}
              detail={metriques.services_up === metriques.services_total ? "Tous opérationnels" : "Anomalie détectée"}
              tone={metriques.services_up === metriques.services_total ? "emerald" : "red"}
            />
          </div>
        )}

        <AdminTabs
          active={onglet}
          onChange={setOnglet}
          tabs={[
            { id: "logs", label: "Logs système" },
            { id: "erreurs", label: "Erreurs applicatives" },
            { id: "metrics", label: "Performances" },
          ]}
        />

        {(onglet === "logs" || onglet === "erreurs") && (
          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <select
              value={filtreService}
              onChange={(e) => setFiltreService(e.target.value)}
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">Tous les services</option>
              <option value="auth">Auth</option>
              <option value="citoyen">Citoyen</option>
              <option value="notification">Notification</option>
              <option value="territoire">Territoire</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="geospatial">Geospatial</option>
              <option value="analytics">Analytics</option>
            </select>
            {onglet === "logs" ? (
              <select
                value={filtreNiveau}
                onChange={(e) => setFiltreNiveau(e.target.value)}
                className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
              >
                <option value="">Tous les niveaux</option>
                <option value="INFO">Info</option>
                <option value="WARN">Avertissement</option>
                <option value="ERROR">Erreur</option>
              </select>
            ) : (
              <select
                value={filtreResolue}
                onChange={(e) => setFiltreResolue(e.target.value)}
                className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
              >
                <option value="">Toutes</option>
                <option value="non-resolue">Non résolues</option>
                <option value="resolue">Résolues</option>
              </select>
            )}
          </div>
        )}

        {onglet === "logs" && (
          lLogs ? (
            <AdminLoading message="Chargement des logs..." />
          ) : !logs?.length ? (
            <AdminEmptyState icon={Activity} title="Aucun log" description="Aucun log ne correspond aux filtres." />
          ) : (
            <AdminTable headers={["ID", "Date", "Niveau", "Service", "Message"]}>
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-sm text-slate-400">{l.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{formatDateTime(l.date)}</td>
                  <td className="px-4 py-3">
                    <AdminBadge tone={LOG_LEVELS[l.niveau] || "slate"}>{l.niveau}</AdminBadge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{l.service}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{l.message}</td>
                </tr>
              ))}
            </AdminTable>
          )
        )}

        {onglet === "erreurs" && (
          lErr ? (
            <AdminLoading message="Chargement des erreurs..." />
          ) : !erreurs?.length ? (
            <AdminEmptyState icon={ServerCrash} title="Aucune erreur" description="Aucune erreur ne correspond aux filtres." />
          ) : (
            <AdminTable headers={["ID", "Date", "Service", "Code", "Message", "Occurrences", "Statut", "Actions"]}>
              {erreurs.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-sm text-slate-400">{e.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{formatDateTime(e.date)}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{e.service}</td>
                  <td className="px-4 py-3 font-mono text-xs text-red-400">{e.code}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{e.message}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{e.occurrences}</td>
                  <td className="px-4 py-3">
                    <AdminBadge tone={e.resolue ? "green" : "red"}>{e.resolue ? "Résolue" : "Ouverte"}</AdminBadge>
                  </td>
                  <td className="px-4 py-3">
                    {!e.resolue && (
                      <AdminButton
                        variant="secondary"
                        className="!px-2.5 !py-1.5"
                        onClick={() => resoudre(e.id)}
                      >
                        Marquer résolue
                      </AdminButton>
                    )}
                  </td>
                </tr>
              ))}
            </AdminTable>
          )
        )}

        {onglet === "metrics" && (
          <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-5">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Métriques de performance en temps réel (simulées)</h2>
            </div>
            <p className="text-xs text-slate-400">
              Les métriques sont actualisées à chaque consultation pour simuler l'activité du système.
            </p>
          </div>
        )}
      </AdminPage>
    </AdminLayout>
  );
};

export default LogsErreursPage;
