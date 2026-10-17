// Seuils d'alerte & règles de notification.
import React, { useState } from "react";
import { Bell, Plus, Pencil, Trash2 } from "lucide-react";
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
  AdminSelectField,
  AdminTable,
  AdminTextField,
  AdminTextareaField,
  AdminToast,
  AdminToggle,
} from "../components/AdminUI";
import { useAsyncData } from "../hooks/useAsyncData";
import { adminService } from "../services/adminService";
import { CANAUX_NOTIFICATION, OPERATEURS_ALERTE } from "../data/mockData";
import { formatDate } from "../utils/format";

const DESTINATAIRES = [
  { id: "administrateurs", label: "Administrateurs" },
  { id: "decideurs", label: "Décideurs" },
  { id: "gestionnaires", label: "Gestionnaires" },
];

const FORM_VIDE = {
  nom: "",
  indicateur: "etat_infrastructure",
  operateur: ">=",
  seuil: "",
  canaux: ["email"],
  destinataires: ["gestionnaires"],
  actif: true,
};

const AlertesConfigPage = () => {
  const { data: regles, loading, recharger } = useAsyncData(() => adminService.getAlertRules(), []);
  const { data: config, recharger: rechargerConfig } = useAsyncData(
    () => adminService.getNotificationConfig(),
    []
  );

  const [modalForm, setModalForm] = useState(false);
  const [edition, setEdition] = useState(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [aSupprimer, setASupprimer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [configBrouillon, setConfigBrouillon] = useState(null);

  const cfg = configBrouillon || config;

  const ouvrirCreation = () => {
    setEdition(null);
    setForm(FORM_VIDE);
    setModalForm(true);
  };

  const ouvrirEdition = (r) => {
    setEdition(r);
    setForm({
      nom: r.nom,
      indicateur: r.indicateur,
      operateur: r.operateur,
      seuil: String(r.seuil),
      canaux: [...r.canaux],
      destinataires: [...r.destinataires],
      actif: r.actif,
    });
    setModalForm(true);
  };

  const basculerListe = (champ, valeur) => {
    setForm((f) => ({
      ...f,
      [champ]: f[champ].includes(valeur) ? f[champ].filter((v) => v !== valeur) : [...f[champ], valeur],
    }));
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminService.saveAlertRule({
        ...(edition ? { id: edition.id } : {}),
        ...form,
        seuil: form.seuil,
      });
      setToast({ message: edition ? "Règle mise à jour." : "Règle créée.", tone: "success" });
      setModalForm(false);
      setEdition(null);
      await recharger();
    } catch (err) {
      setToast({ message: err.message || "Erreur lors de l'enregistrement.", tone: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const basculerRegle = async (r) => {
    await adminService.toggleAlertRule(r.id, !r.actif);
    await recharger();
  };

  const supprimer = async () => {
    if (!aSupprimer) return;
    setActionLoading(true);
    try {
      await adminService.deleteAlertRule(aSupprimer.id);
      setToast({ message: "Règle supprimée.", tone: "success" });
      setASupprimer(null);
      await recharger();
    } finally {
      setActionLoading(false);
    }
  };

  const enregistrerConfig = async () => {
    setActionLoading(true);
    try {
      await adminService.saveNotificationConfig(configBrouillon);
      setToast({ message: "Configuration des notifications enregistrée.", tone: "success" });
      setConfigBrouillon(null);
      await rechargerConfig();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <AdminPage
        title="Seuils d'alerte & règles de notification"
        description="Configurer les seuils d'alerte et les règles de notification de la plateforme."
        actions={
          <AdminButton onClick={ouvrirCreation}>
            <Plus className="h-4 w-4" /> Nouvelle règle
          </AdminButton>
        }
      >
        {toast && <AdminToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}

        {loading ? (
          <AdminLoading message="Chargement des règles..." />
        ) : !regles?.length ? (
          <AdminEmptyState
            icon={Bell}
            title="Aucune règle"
            description="Aucune règle d'alerte configurée."
            action={
              <AdminButton onClick={ouvrirCreation}>
                <Plus className="h-4 w-4" /> Créer une règle
              </AdminButton>
            }
          />
        ) : (
          <AdminTable headers={["Règle", "Indicateur", "Condition", "Canaux", "Destinataires", "Statut", "Actions"]}>
            {regles.map((r) => (
              <tr key={r.id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-white">{r.nom}</div>
                  <div className="text-xs text-slate-500">
                    {r.id} · modifiée le {formatDate(r.updated_at)}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-emerald-400">{r.indicateur}</td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {OPERATEURS_ALERTE.find((o) => o.id === r.operateur)?.label || r.operateur} {r.seuil}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.canaux.map((c) => (
                      <AdminBadge key={c} tone="blue">
                        {CANAUX_NOTIFICATION.find((x) => x.id === c)?.label || c}
                      </AdminBadge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">
                  {r.destinataires.map((d) => DESTINATAIRES.find((x) => x.id === d)?.label || d).join(", ")}
                </td>
                <td className="px-4 py-3">
                  <AdminBadge tone={r.actif ? "green" : "slate"}>{r.actif ? "Active" : "Inactive"}</AdminBadge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <AdminToggle checked={r.actif} onChange={() => basculerRegle(r)} label={`Activer ${r.nom}`} />
                    <button
                      title="Modifier"
                      onClick={() => ouvrirEdition(r)}
                      className="rounded-md p-1.5 text-sky-400 hover:bg-sky-500/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      title="Supprimer"
                      onClick={() => setASupprimer(r)}
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

        {/* Configuration générale des notifications */}
        <div className="mt-8 rounded-lg border border-slate-700/60 bg-slate-800/40 p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Configuration générale des notifications</h2>
          {!cfg ? (
            <AdminLoading />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminSelectField
                label="Canal par défaut"
                value={cfg.canal_defaut}
                options={CANAUX_NOTIFICATION.map((c) => ({ value: c.id, label: c.label }))}
                onChange={(e) => setConfigBrouillon({ ...cfg, canal_defaut: e.target.value })}
              />
              <AdminSelectField
                label="Fréquence du digest"
                value={cfg.frequence_digest}
                options={[
                  { value: "immédiat", label: "Immédiat" },
                  { value: "quotidien", label: "Quotidien" },
                  { value: "hebdomadaire", label: "Hebdomadaire" },
                ]}
                onChange={(e) => setConfigBrouillon({ ...cfg, frequence_digest: e.target.value })}
              />
              <AdminTextField
                label="Heure du digest"
                type="time"
                value={cfg.heure_digest}
                onChange={(e) => setConfigBrouillon({ ...cfg, heure_digest: e.target.value })}
              />
              <div className="space-y-3 sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-4">
                <AdminCheckbox
                  checked={cfg.activer_email}
                  onChange={(v) => setConfigBrouillon({ ...cfg, activer_email: v })}
                  label="Activer les notifications par e-mail"
                />
                <AdminCheckbox
                  checked={cfg.activer_sms}
                  onChange={(v) => setConfigBrouillon({ ...cfg, activer_sms: v })}
                  label="Activer les notifications par SMS"
                />
                <AdminCheckbox
                  checked={cfg.activer_push}
                  onChange={(v) => setConfigBrouillon({ ...cfg, activer_push: v })}
                  label="Activer les notifications push (in-app)"
                />
                <AdminCheckbox
                  checked={cfg.activer_webhook}
                  onChange={(v) => setConfigBrouillon({ ...cfg, activer_webhook: v })}
                  label="Activer les webhooks sortants"
                />
              </div>
              <div className="sm:col-span-2">
                <AdminButton onClick={enregistrerConfig} disabled={!configBrouillon || actionLoading}>
                  Enregistrer la configuration
                </AdminButton>
              </div>
            </div>
          )}
        </div>
      </AdminPage>

      <AdminModal
        isOpen={modalForm}
        onClose={() => {
          setModalForm(false);
          setEdition(null);
        }}
        title={edition ? `Modifier la règle ${edition.id}` : "Nouvelle règle d'alerte"}
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
        <form onSubmit={enregistrer} className="space-y-4">
          <AdminTextField
            label="Nom de la règle"
            required
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            placeholder="ex. Infrastructure en état critique"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminTextField
              label="Indicateur"
              required
              help="Identifiant technique de l'indicateur surveillé."
              value={form.indicateur}
              onChange={(e) => setForm({ ...form, indicateur: e.target.value })}
            />
            <AdminSelectField
              label="Opérateur"
              value={form.operateur}
              options={OPERATEURS_ALERTE.map((o) => ({ value: o.id, label: o.label }))}
              onChange={(e) => setForm({ ...form, operateur: e.target.value })}
            />
            <AdminTextField
              label="Seuil"
              required
              value={form.seuil}
              onChange={(e) => setForm({ ...form, seuil: e.target.value })}
              placeholder="ex. 20"
            />
          </div>
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-300">Canaux de notification</span>
            <div className="flex flex-wrap gap-4">
              {CANAUX_NOTIFICATION.map((c) => (
                <AdminCheckbox
                  key={c.id}
                  checked={form.canaux.includes(c.id)}
                  onChange={() => basculerListe("canaux", c.id)}
                  label={c.label}
                />
              ))}
            </div>
          </div>
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-300">Destinataires</span>
            <div className="flex flex-wrap gap-4">
              {DESTINATAIRES.map((d) => (
                <AdminCheckbox
                  key={d.id}
                  checked={form.destinataires.includes(d.id)}
                  onChange={() => basculerListe("destinataires", d.id)}
                  label={d.label}
                />
              ))}
            </div>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmModal
        isOpen={!!aSupprimer}
        onClose={() => setASupprimer(null)}
        onConfirm={supprimer}
        loading={actionLoading}
        title="Supprimer la règle"
        message={`Voulez-vous supprimer la règle « ${aSupprimer?.nom} » ? Les alertes déjà émises restent consultables.`}
      />
    </AdminLayout>
  );
};

export default AlertesConfigPage;
