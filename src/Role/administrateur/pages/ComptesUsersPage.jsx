// Comptes utilisateurs : création, modification, désactivation, suppression et attribution de rôles.
import React, { useMemo, useState } from "react";
import { Users, Plus, Search, Pencil, Trash2, Power, PowerOff, ShieldCheck } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import AdminPage from "../components/AdminPage";
import {
  AdminBadge,
  AdminButton,
  AdminConfirmModal,
  AdminEmptyState,
  AdminLoading,
  AdminModal,
  AdminSelectField,
  AdminTable,
  AdminTextField,
  AdminToast,
} from "../components/AdminUI";
import { useAsyncData } from "../hooks/useAsyncData";
import { adminService } from "../services/adminService";
import { formatDate } from "../utils/format";

const ROLE_OPTIONS = [
  { value: "administrateur", label: "Administrateur" },
  { value: "decideur", label: "Décideur" },
  { value: "gestionnaire", label: "Gestionnaire" },
];

const ROLE_TONES = { administrateur: "violet", decideur: "blue", gestionnaire: "green" };

const FORM_VIDE = { nom: "", email: "", telephone: "", role: "gestionnaire" };

const ComptesUsersPage = () => {
  const [recherche, setRecherche] = useState("");
  const [filtreRole, setFiltreRole] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");
  const [modalForm, setModalForm] = useState(false);
  const [edition, setEdition] = useState(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [aSupprimer, setASupprimer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const { data: utilisateurs, loading, recharger } = useAsyncData(
    () => adminService.listUsers({ recherche, role: filtreRole, statut: filtreStatut }),
    [recherche, filtreRole, filtreStatut]
  );

  const liste = useMemo(() => utilisateurs || [], [utilisateurs]);

  const afficherToast = (message, tone = "success") => setToast({ message, tone });
  const fermerToast = () => setToast(null);

  const ouvrirCreation = () => {
    setEdition(null);
    setForm(FORM_VIDE);
    setModalForm(true);
  };

  const ouvrirEdition = (user) => {
    setEdition(user);
    setForm({ nom: user.nom, email: user.email, telephone: user.telephone || "", role: user.role });
    setModalForm(true);
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (edition) {
        await adminService.updateUser(edition.id, form);
        afficherToast(`Compte ${edition.id} mis à jour.`);
      } else {
        const cree = await adminService.createUser(form);
        afficherToast(`Compte ${cree.id} créé.`);
      }
      setModalForm(false);
      setEdition(null);
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur lors de l'enregistrement.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const basculerStatut = async (user) => {
    setActionLoading(true);
    try {
      if (user.statut === "actif") {
        await adminService.disableUser(user.id);
        afficherToast(`Compte ${user.id} désactivé.`);
      } else {
        await adminService.enableUser(user.id);
        afficherToast(`Compte ${user.id} réactivé.`);
      }
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur lors du changement de statut.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const supprimer = async () => {
    if (!aSupprimer) return;
    setActionLoading(true);
    try {
      await adminService.deleteUser(aSupprimer.id);
      afficherToast(`Compte ${aSupprimer.id} supprimé.`);
      setASupprimer(null);
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur lors de la suppression.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <AdminPage
        title="Comptes utilisateurs"
        description="Créer, modifier, désactiver et supprimer des comptes utilisateurs, et leur attribuer un rôle."
        actions={
          <AdminButton onClick={ouvrirCreation}>
            <Plus className="h-4 w-4" /> Nouveau compte
          </AdminButton>
        }
      >
        <AdminToast message={toast?.message} tone={toast?.tone} onClose={fermerToast} />

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher par nom, e-mail ou ID..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
            />
          </div>
          <select
            value={filtreRole}
            onChange={(e) => setFiltreRole(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Tous les rôles</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="desactif">Désactivé</option>
          </select>
        </div>

        {loading ? (
          <AdminLoading message="Chargement des comptes..." />
        ) : liste.length === 0 ? (
          <AdminEmptyState
            icon={Users}
            title="Aucun compte"
            description="Aucun compte ne correspond à vos critères de recherche."
            action={
              <AdminButton onClick={ouvrirCreation}>
                <Plus className="h-4 w-4" /> Créer un compte
              </AdminButton>
            }
          />
        ) : (
          <AdminTable headers={["ID", "Nom", "E-mail", "Rôle", "Statut", "Dernière connexion", "Actions"]}>
            {liste.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{u.id}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{u.nom}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{u.email}</td>
                <td className="px-4 py-3">
                  <AdminBadge tone={ROLE_TONES[u.role] || "slate"}>
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    {ROLE_OPTIONS.find((r) => r.value === u.role)?.label || u.role}
                  </AdminBadge>
                </td>
                <td className="px-4 py-3">
                  <AdminBadge tone={u.statut === "actif" ? "green" : "red"}>
                    {u.statut === "actif" ? "Actif" : "Désactivé"}
                  </AdminBadge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(u.dernier_login)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      title="Modifier"
                      onClick={() => ouvrirEdition(u)}
                      className="rounded-md p-1.5 text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-900/30"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      title={u.statut === "actif" ? "Désactiver" : "Réactiver"}
                      onClick={() => basculerStatut(u)}
                      className="rounded-md p-1.5 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/30"
                    >
                      {u.statut === "actif" ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </button>
                    <button
                      title="Supprimer"
                      onClick={() => setASupprimer(u)}
                      className="rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}

        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{liste.length} compte(s) affiché(s).</p>
      </AdminPage>

      <AdminModal
        isOpen={modalForm}
        onClose={() => {
          setModalForm(false);
          setEdition(null);
        }}
        title={edition ? `Modifier ${edition.id}` : "Nouveau compte utilisateur"}
        footer={
          <>
            <AdminButton
              variant="secondary"
              onClick={() => {
                setModalForm(false);
                setEdition(null);
              }}
            >
              Annuler
            </AdminButton>
            <AdminButton onClick={enregistrer} disabled={actionLoading}>
              {actionLoading ? "..." : edition ? "Enregistrer" : "Créer"}
            </AdminButton>
          </>
        }
      >
        <form onSubmit={enregistrer} className="grid gap-4 sm:grid-cols-2">
          <AdminTextField
            label="Nom complet"
            required
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            placeholder="Ex. Rakoto Andrianina"
          />
          <AdminTextField
            label="E-mail"
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="exemple@exemple.mg"
          />
          <AdminTextField
            label="Téléphone"
            value={form.telephone}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            placeholder="+261 34 00 000 00"
          />
          <AdminSelectField
            label="Rôle"
            required
            value={form.role}
            options={ROLE_OPTIONS}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
        </form>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Le rôle détermine les permissions accordées : administrateur (paramétrage complet), décideur
          (arbitrage et investissements), gestionnaire (terrain et infrastructures).
        </p>
      </AdminModal>

      <AdminConfirmModal
        isOpen={!!aSupprimer}
        onClose={() => setASupprimer(null)}
        onConfirm={supprimer}
        loading={actionLoading}
        title="Supprimer le compte"
        message={`Voulez-vous vraiment supprimer le compte ${aSupprimer?.id} (${aSupprimer?.nom}) ? Cette action est définitive.`}
      />
    </AdminLayout>
  );
};

export default ComptesUsersPage;
