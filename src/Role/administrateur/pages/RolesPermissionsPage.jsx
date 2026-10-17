// Rôles & Permissions : matrice des permissions par rôle et politiques d'accès.
import React, { useMemo, useState } from "react";
import { Shield, Save, RotateCcw } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import AdminPage from "../components/AdminPage";
import {
  AdminButton,
  AdminLoading,
  AdminToast,
  AdminToggle,
  AdminEmptyState,
} from "../components/AdminUI";
import { useAsyncData } from "../hooks/useAsyncData";
import { adminService } from "../services/adminService";

const RolesPermissionsPage = () => {
  const { data: groupes, loading, recharger } = useAsyncData(() => adminService.listPermissions(), []);
  const { data: rolesInitiaux } = useAsyncData(() => adminService.listRoles(), []);

  const [roles, setRoles] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Synchronise la copie éditable dès que les rôles sont chargés.
  React.useEffect(() => {
    if (rolesInitiaux) setRoles(JSON.parse(JSON.stringify(rolesInitiaux)));
  }, [rolesInitiaux]);

  const modifie = useMemo(() => {
    if (!roles || !rolesInitiaux) return false;
    return JSON.stringify(roles) !== JSON.stringify(rolesInitiaux);
  }, [roles, rolesInitiaux]);

  if (!roles) {
    return (
      <AdminLayout>
        <AdminPage title="Rôles & Permissions" description="Attribuer les rôles et gérer les permissions.">
          <AdminLoading message="Chargement des rôles..." />
        </AdminPage>
      </AdminLayout>
    );
  }

  const basculerPermission = (roleId, permId, actif) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId) return r;
        const permissions = actif
          ? Array.from(new Set([...(r.permissions || []), permId]))
          : (r.permissions || []).filter((p) => p !== permId);
        return { ...r, permissions };
      })
    );
  };

  const sauvegarder = async () => {
    setActionLoading(true);
    try {
      await adminService.saveRoles(roles);
      setToast({ message: "Rôles et permissions enregistrés.", tone: "success" });
      await recharger();
    } catch (err) {
      setToast({ message: err.message || "Erreur lors de l'enregistrement.", tone: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const reinitialiser = () => setRoles(JSON.parse(JSON.stringify(rolesInitiaux)));

  const aUnePermission = (roleId, permId) =>
    roles.find((r) => r.id === roleId)?.permissions?.includes(permId);

  return (
    <AdminLayout>
      <AdminPage
        title="Rôles & Permissions"
        description="Attribuer les rôles (administrateur, décideur, gestionnaire) et gérer les permissions et politiques d'accès."
        actions={
          <>
            <AdminButton variant="secondary" onClick={reinitialiser} disabled={!modifie || actionLoading}>
              <RotateCcw className="h-4 w-4" /> Réinitialiser
            </AdminButton>
            <AdminButton onClick={sauvegarder} disabled={!modifie || actionLoading}>
              <Save className="h-4 w-4" /> {actionLoading ? "..." : "Enregistrer"}
            </AdminButton>
          </>
        }
      >
        {toast && <AdminToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {roles.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-white">{r.nom}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{r.description}</p>
              <p className="mt-2 text-xs font-medium text-emerald-400">
                {r.permissions?.length || 0} permission(s)
              </p>
            </div>
          ))}
        </div>

        {loading ? (
          <AdminLoading />
        ) : !groupes?.length ? (
          <AdminEmptyState title="Aucune permission" description="Aucun groupe de permissions configuré." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-700/60">
            <table className="min-w-full divide-y divide-slate-700/60">
              <thead className="bg-slate-800/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Permission
                  </th>
                  {roles.map((r) => (
                    <th
                      key={r.id}
                      className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400"
                    >
                      {r.nom}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {groupes.map((g) => (
                  <React.Fragment key={g.id}>
                    <tr className="bg-slate-800/30">
                      <td colSpan={roles.length + 1} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                        {g.nom}
                      </td>
                    </tr>
                    {g.permissions.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-200">{p.label}</div>
                          <div className="text-xs text-slate-500">{p.id}</div>
                        </td>
                        {roles.map((r) => (
                          <td key={r.id} className="px-4 py-3 text-center">
                            <div className="flex justify-center">
                              <AdminToggle
                                checked={!!aUnePermission(r.id, p.id)}
                                onChange={(v) => basculerPermission(r.id, p.id, v)}
                                label={`${p.label} — ${r.nom}`}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-3 text-xs text-slate-500">
          Le rôle administrateur détient toutes les permissions. Les modifications sont appliquées
          immédiatement après enregistrement et journalisées.
        </p>
      </AdminPage>
    </AdminLayout>
  );
};

export default RolesPermissionsPage;
