// Référentiels : types d'infrastructures, états, catégories de signalements, unités, priorités.
import React, { useState } from "react";
import { Database, Plus, Pencil, Trash2 } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import AdminPage from "../components/AdminPage";
import {
  AdminBadge,
  AdminButton,
  AdminCheckbox,
  AdminConfirmModal,
  AdminEmptyState,
  AdminLoading,
  AdminModal,
  AdminTable,
  AdminTabs,
  AdminTextField,
  AdminToast,
} from "../components/AdminUI";
import { useAsyncData } from "../hooks/useAsyncData";
import { adminService } from "../services/adminService";
import { REFERENTIEL_TYPES } from "../data/mockData";

const FORM_VIDE = { code: "", libelle: "", description: "", actif: true };

const ReferentielsPage = () => {
  const [type, setType] = useState(REFERENTIEL_TYPES[0].id);
  const [modalForm, setModalForm] = useState(false);
  const [edition, setEdition] = useState(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [aSupprimer, setASupprimer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const { data: entrees, loading, recharger } = useAsyncData(
    () => adminService.getReferentiels(type),
    [type]
  );

  const ouvrirCreation = () => {
    setEdition(null);
    setForm(FORM_VIDE);
    setModalForm(true);
  };

  const ouvrirEdition = (e) => {
    setEdition(e);
    setForm({ code: e.code, libelle: e.libelle, description: e.description || "", actif: !!e.actif });
    setModalForm(true);
  };

  const enregistrer = async (ev) => {
    ev.preventDefault();
    setActionLoading(true);
    try {
      await adminService.saveReferentiel(type, { ...(edition ? { id: edition.id } : {}), ...form });
      setToast({ message: edition ? "Entrée mise à jour." : "Entrée créée.", tone: "success" });
      setModalForm(false);
      setEdition(null);
      await recharger();
    } catch (err) {
      setToast({ message: err.message || "Erreur lors de l'enregistrement.", tone: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const supprimer = async () => {
    if (!aSupprimer) return;
    setActionLoading(true);
    try {
      await adminService.deleteReferentiel(type, aSupprimer.id);
      setToast({ message: "Entrée supprimée.", tone: "success" });
      setASupprimer(null);
      await recharger();
    } catch (err) {
      setToast({ message: err.message || "Erreur lors de la suppression.", tone: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <AdminPage
        title="Référentiels"
        description="Gérer les référentiels : types d'infrastructures, états, catégories de signalements, unités et priorités."
        actions={
          <AdminButton onClick={ouvrirCreation}>
            <Plus className="h-4 w-4" /> Nouvelle entrée
          </AdminButton>
        }
      >
        {toast && <AdminToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}

        <AdminTabs active={type} onChange={setType} tabs={REFERENTIEL_TYPES} />

        {loading ? (
          <AdminLoading message="Chargement du référentiel..." />
        ) : !entrees?.length ? (
          <AdminEmptyState
            icon={Database}
            title="Référentiel vide"
            description="Aucune entrée dans ce référentiel."
            action={
              <AdminButton onClick={ouvrirCreation}>
                <Plus className="h-4 w-4" /> Ajouter une entrée
              </AdminButton>
            }
          />
        ) : (
          <AdminTable headers={["ID", "Code", "Libellé", "Description", "Statut", "Actions"]}>
            {entrees.map((e) => (
              <tr key={e.id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 text-sm text-slate-400">{e.id}</td>
                <td className="px-4 py-3 font-mono text-sm text-emerald-400">{e.code}</td>
                <td className="px-4 py-3 text-sm font-medium text-white">{e.libelle}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{e.description || "—"}</td>
                <td className="px-4 py-3">
                  <AdminBadge tone={e.actif ? "green" : "slate"}>{e.actif ? "Actif" : "Inactif"}</AdminBadge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      title="Modifier"
                      onClick={() => ouvrirEdition(e)}
                      className="rounded-md p-1.5 text-sky-400 hover:bg-sky-500/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      title="Supprimer"
                      onClick={() => setASupprimer(e)}
                      className="rounded-md p-1.5 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}

        <p className="mt-3 text-xs text-slate-500">{entrees?.length || 0} entrée(s) dans ce référentiel.</p>
      </AdminPage>

      <AdminModal
        isOpen={modalForm}
        onClose={() => {
          setModalForm(false);
          setEdition(null);
        }}
        title={edition ? `Modifier ${edition.libelle}` : "Nouvelle entrée de référentiel"}
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
              {actionLoading ? "..." : "Enregistrer"}
            </AdminButton>
          </>
        }
      >
        <form onSubmit={enregistrer} className="grid gap-4 sm:grid-cols-2">
          <AdminTextField
            label="Code"
            required
            help="Identifiant technique unique (sans espaces)."
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="ex. route"
          />
          <AdminTextField
            label="Libellé"
            required
            value={form.libelle}
            onChange={(e) => setForm({ ...form, libelle: e.target.value })}
            placeholder="ex. Route"
          />
          <div className="sm:col-span-2">
            <AdminTextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description facultative"
            />
          </div>
          <AdminCheckbox
            checked={form.actif}
            onChange={(v) => setForm({ ...form, actif: v })}
            label="Entrée active (utilisable dans les formulaires)"
          />
        </form>
      </AdminModal>

      <AdminConfirmModal
        isOpen={!!aSupprimer}
        onClose={() => setASupprimer(null)}
        onConfirm={supprimer}
        loading={actionLoading}
        title="Supprimer l'entrée"
        message={`Voulez-vous supprimer l'entrée ${aSupprimer?.id} (${aSupprimer?.libelle}) ? Les données existantes qui l'utilisent ne seront pas modifiées.`}
      />
    </AdminLayout>
  );
};

export default ReferentielsPage;
