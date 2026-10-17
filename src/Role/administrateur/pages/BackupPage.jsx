// Sauvegardes, restaurations & mises à jour.
import React, { useState } from "react";
import { HardDrive, Download, RefreshCw, Package, Play } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import AdminPage from "../components/AdminPage";
import {
  AdminBadge,
  AdminButton,
  AdminConfirmModal,
  AdminEmptyState,
  AdminLoading,
  AdminTable,
  AdminToast,
  AdminToggle,
} from "../components/AdminUI";
import { useAsyncData } from "../hooks/useAsyncData";
import { adminService } from "../services/adminService";
import { formatDateTime, formatTaille } from "../utils/format";

const BackupPage = () => {
  const { data: sauvegardes, loading: lS, recharger: rS } = useAsyncData(() => adminService.listBackups(), []);
  const { data: updates, loading: lU, recharger: rU } = useAsyncData(() => adminService.getUpdates(), []);

  const [aRestaurer, setARestaurer] = useState(null);
  const [aAppliquer, setAAppliquer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [auto, setAuto] = useState(true);

  const creerSauvegarde = async () => {
    setActionLoading(true);
    try {
      const s = await adminService.createBackup();
      setToast({ message: `Sauvegarde ${s.id} créée et terminée.`, tone: "success" });
      await rS();
    } finally {
      setActionLoading(false);
    }
  };

  const restaurer = async () => {
    if (!aRestaurer) return;
    setActionLoading(true);
    try {
      await adminService.restoreBackup(aRestaurer.id);
      setToast({ message: `Restauration de ${aRestaurer.id} lancée avec succès.`, tone: "success" });
      setARestaurer(null);
    } finally {
      setActionLoading(false);
    }
  };

  const appliquer = async () => {
    if (!aAppliquer) return;
    setActionLoading(true);
    try {
      await adminService.applyUpdate(aAppliquer.id);
      setToast({ message: `Mise à jour ${aAppliquer.id} appliquée à ${aAppliquer.composant}.`, tone: "success" });
      setAAppliquer(null);
      await rU();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <AdminPage
        title="Sauvegardes, restaurations & mises à jour"
        description="Gérer les sauvegardes, restaurations et mises à jour de la plateforme."
        actions={
          <AdminButton onClick={creerSauvegarde} disabled={actionLoading}>
            <HardDrive className="h-4 w-4" /> {actionLoading ? "..." : "Créer une sauvegarde"}
          </AdminButton>
        }
      >
        {toast && <AdminToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-700/60 bg-slate-800/40 px-4 py-3">
          <div className="text-sm text-slate-300">Sauvegardes automatiques</div>
          <AdminToggle checked={auto} onChange={setAuto} label="Sauvegardes automatiques" />
        </div>

        <h2 className="mb-3 text-lg font-semibold text-white">Sauvegardes</h2>
        {lS ? (
          <AdminLoading message="Chargement des sauvegardes..." />
        ) : !sauvegardes?.length ? (
          <AdminEmptyState
            icon={Package}
            title="Aucune sauvegarde"
            description="Aucune sauvegarde n'a encore été créée."
            action={
              <AdminButton onClick={creerSauvegarde} disabled={actionLoading}>
                Créer la première sauvegarde
              </AdminButton>
            }
          />
        ) : (
          <AdminTable headers={["ID", "Date", "Type", "Taille", "Statut", "Planifiée", "Actions"]}>
            {sauvegardes.map((b) => (
              <tr key={b.id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 text-sm text-slate-400">{b.id}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{formatDateTime(b.date)}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{b.type}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{formatTaille(b.taille_go)}</td>
                <td className="px-4 py-3">
                  <AdminBadge tone={b.statut === "terminee" ? "green" : "red"}>
                    {b.statut === "terminee" ? "Terminée" : "Échouée"}
                  </AdminBadge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">{b.planifiee ? "Oui" : "Non"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <AdminButton
                      variant="secondary"
                      className="!px-2.5 !py-1.5"
                      onClick={() => setARestaurer(b)}
                      disabled={b.statut !== "terminee"}
                    >
                      <RefreshCw className="h-4 w-4" /> Restaurer
                    </AdminButton>
                    <AdminButton variant="secondary" className="!px-2.5 !py-1.5">
                      <Download className="h-4 w-4" /> Télécharger
                    </AdminButton>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}

        <h2 className="mb-3 mt-8 text-lg font-semibold text-white">Mises à jour</h2>
        {lU ? (
          <AdminLoading message="Chargement des mises à jour..." />
        ) : !updates?.length ? (
          <AdminEmptyState icon={HardDrive} title="Aucune mise à jour" description="Tous les composants sont à jour." />
        ) : (
          <AdminTable headers={["ID", "Composant", "Actuelle", "Disponible", "Date de sortie", "Critique", "Statut", "Actions"]}>
            {updates.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 text-sm text-slate-400">{u.id}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{u.composant}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{u.version_actuelle}</td>
                <td className="px-4 py-3 font-mono text-xs text-emerald-400">{u.version_disponible}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{formatDateTime(u.date_sortie)}</td>
                <td className="px-4 py-3">
                  <AdminBadge tone={u.critique ? "red" : "slate"}>{u.critique ? "Oui" : "Non"}</AdminBadge>
                </td>
                <td className="px-4 py-3">
                  <AdminBadge tone={u.applique ? "green" : "blue"}>{u.applique ? "Appliquée" : "Disponible"}</AdminBadge>
                </td>
                <td className="px-4 py-3">
                  {!u.applique && (
                    <AdminButton
                      variant="secondary"
                      className="!px-2.5 !py-1.5"
                      onClick={() => setAAppliquer(u)}
                    >
                      <Play className="h-4 w-4" /> Appliquer
                    </AdminButton>
                  )}
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </AdminPage>

      <AdminConfirmModal
        isOpen={!!aRestaurer}
        onClose={() => setARestaurer(null)}
        onConfirm={restaurer}
        loading={actionLoading}
        title="Restaurer une sauvegarde"
        confirmLabel="Restaurer"
        message={`Voulez-vous restaurer la sauvegarde ${aRestaurer?.id} du ${formatDateTime(aRestaurer?.date)} ? Cette action écrasera l'état actuel (simulée).`}
      />

      <AdminConfirmModal
        isOpen={!!aAppliquer}
        onClose={() => setAAppliquer(null)}
        onConfirm={appliquer}
        loading={actionLoading}
        title="Appliquer une mise à jour"
        confirmLabel="Appliquer"
        message={`Appliquer la mise à jour ${aAppliquer?.id} (${aAppliquer?.composant} v${aAppliquer?.version_disponible}) ? Cela redémarrera le composant concerné (simulé).`}
      />
    </AdminLayout>
  );
};

export default BackupPage;
