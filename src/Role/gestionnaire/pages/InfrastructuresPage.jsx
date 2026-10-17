// Gestion des infrastructures : CRUD, filtres, import/export, signalement au décideur.
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Eye,
  Trash2,
  Download,
  Send,
  CheckCircle2,
} from "lucide-react";
import GestionnaireLayout, { PageHeader } from "../components/GestionnaireLayout";
import Badge from "../components/Badge";
import Button from "../components/Buttons";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import InfrastructureForm from "../components/InfrastructureForm";
import { useAsyncData } from "../hooks/useAsyncData";
import { gestionnaireService } from "../services/gestionnaireService";
import {
  ETATS_INFRASTRUCTURE,
  STATUTS_INFRASTRUCTURE,
  PRIORITES,
  TYPES_INFRASTRUCTURE,
  getConstant,
  labelForType,
} from "../constants";
import { formatDate, telechargerContenu } from "../utils/format";

const InfrastructuresPage = () => {
  const navigate = useNavigate();
  const [recherche, setRecherche] = useState("");
  const [filtreEtat, setFiltreEtat] = useState("");
  const [filtreType, setFiltreType] = useState("");
  const [modalForm, setModalForm] = useState(false);
  const [edition, setEdition] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmationSuppression, setConfirmationSuppression] = useState(null);
  const [infraASignaler, setInfraASignaler] = useState(null);
  const [prioriteTransmission, setPrioriteTransmission] = useState("haute");
  const [toast, setToast] = useState("");

  const { data: infrastructures, loading, recharger } = useAsyncData(
    () => gestionnaireService.getInfrastructures(),
    []
  );

  const liste = useMemo(() => infrastructures || [], [infrastructures]);

  const filtres = useMemo(() => {
    const q = recherche.toLowerCase();
    return liste.filter((i) => {
      const matchRecherche =
        !q ||
        i.nom?.toLowerCase().includes(q) ||
        i.id_infra?.toLowerCase().includes(q) ||
        i.commune?.toLowerCase().includes(q);
      const matchEtat = !filtreEtat || i.etat === filtreEtat;
      const matchType = !filtreType || i.type === filtreType;
      return matchRecherche && matchEtat && matchType;
    });
  }, [liste, recherche, filtreEtat, filtreType]);

  const afficherToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const ouvrirCreation = () => {
    setEdition(null);
    setModalForm(true);
  };

  const ouvrirEdition = (infra) => {
    setEdition(infra);
    setModalForm(true);
  };

  const enregistrer = async (donnees) => {
    setActionLoading(true);
    try {
      if (edition) {
        await gestionnaireService.updateInfrastructure(edition.id_infra, donnees);
        afficherToast("Infrastructure mise à jour.");
      } else {
        await gestionnaireService.createInfrastructure(donnees);
        afficherToast("Infrastructure créée.");
      }
      setModalForm(false);
      setEdition(null);
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setActionLoading(false);
    }
  };

  const archiver = async () => {
    if (!confirmationSuppression) return;
    setActionLoading(true);
    try {
      await gestionnaireService.archiverInfrastructure(confirmationSuppression.id_infra);
      afficherToast("Infrastructure archivée (suppression logique).");
      setConfirmationSuppression(null);
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur lors de l'archivage.");
    } finally {
      setActionLoading(false);
    }
  };

  const signalerAuDecideur = async () => {
    if (!infraASignaler) return;
    setActionLoading(true);
    try {
      await gestionnaireService.signalerAuDecideur(infraASignaler.id_infra, {
        priorite: prioriteTransmission,
      });
      afficherToast("Infrastructure signalée au décideur.");
      setInfraASignaler(null);
      setPrioriteTransmission("haute");
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur lors de la transmission.");
    } finally {
      setActionLoading(false);
    }
  };

  const exporter = async () => {
    const res = await gestionnaireService.exporter("infrastructures");
    if (res.nombre === 0) {
      afficherToast("Aucune donnée à exporter.");
      return;
    }
    telechargerContenu(res.contenu, "infrastructures.csv");
    afficherToast(`${res.nombre} ligne(s) exportée(s).`);
  };

  return (
    <GestionnaireLayout>
      <PageHeader
        title="Infrastructures"
        description="Créer, modifier et suivre la localisation, les caractéristiques et l'état des infrastructures."
        actions={
          <>
            <Button variant="secondary" onClick={exporter}>
              <Download className="h-4 w-4" /> Exporter CSV
            </Button>
            <Button onClick={ouvrirCreation}>
              <Plus className="h-4 w-4" /> Nouvelle infrastructure
            </Button>
          </>
        }
      />

      {toast && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border-l-4 border-green-500 bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      {/* Filtres */}
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher par nom, ID ou commune..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <select
          value={filtreType}
          onChange={(e) => setFiltreType(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          <option value="">Tous les types</option>
          {TYPES_INFRASTRUCTURE.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={filtreEtat}
          onChange={(e) => setFiltreEtat(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          <option value="">Tous les états</option>
          {Object.values(ETATS_INFRASTRUCTURE).map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Chargement des infrastructures...
          </div>
        ) : filtres.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Aucune infrastructure"
            description="Aucune infrastructure ne correspond à vos critères."
            action={
              <Button onClick={ouvrirCreation}>
                <Plus className="h-4 w-4" /> Créer une infrastructure
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  {["ID", "Nom", "Type", "État", "Statut", "Localisation", "Contrôle", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filtres.map((i) => (
                  <tr key={i.id_infra} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {i.id_infra}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="max-w-xs truncate">{i.nom}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {labelForType(i.type)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge config={getConstant(ETATS_INFRASTRUCTURE, i.etat)} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge config={getConstant(STATUTS_INFRASTRUCTURE, i.statut)} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="max-w-[180px] truncate">{i.commune || "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(i.dernier_controle)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          title="Voir détails"
                          onClick={() => navigate(`/gestionnaire/infrastructures/${i.id_infra}`)}
                          className="rounded-md p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          title="Modifier"
                          onClick={() => ouvrirEdition(i)}
                          className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          title="Signaler au décideur"
                          onClick={() => setInfraASignaler(i)}
                          className="rounded-md p-1.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button
                          title="Archiver"
                          onClick={() => setConfirmationSuppression(i)}
                          className="rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        {filtres.length} infrastructure(s) affichée(s). La suppression est logique (archivage) :
        aucune donnée sensible n'est effacée sans validation.
      </p>

      {/* Modale formulaire */}
      <Modal
        isOpen={modalForm}
        onClose={() => {
          setModalForm(false);
          setEdition(null);
        }}
        title={edition ? `Modifier ${edition.id_infra}` : "Nouvelle infrastructure"}
        size="lg"
      >
        <InfrastructureForm
          initialValues={edition}
          onSubmit={enregistrer}
          onCancel={() => {
            setModalForm(false);
            setEdition(null);
          }}
          loading={actionLoading}
        />
      </Modal>

      {/* Confirmation archivage */}
      <Modal
        isOpen={!!confirmationSuppression}
        onClose={() => setConfirmationSuppression(null)}
        title="Archiver l'infrastructure"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmationSuppression(null)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={archiver} disabled={actionLoading}>
              {actionLoading ? "..." : "Archiver"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Voulez-vous archiver <strong>{confirmationSuppression?.nom}</strong> (
          {confirmationSuppression?.id_infra}) ? L'infrastructure ne sera plus active mais restera
          consultable.
        </p>
      </Modal>

      {/* Signalement au décideur */}
      <Modal
        isOpen={!!infraASignaler}
        onClose={() => setInfraASignaler(null)}
        title="Signaler une infrastructure critique au décideur"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setInfraASignaler(null)}>
              Annuler
            </Button>
            <Button onClick={signalerAuDecideur} disabled={actionLoading}>
              {actionLoading ? "..." : "Transmettre"}
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
          Transmettez <strong>{infraASignaler?.nom}</strong> ({infraASignaler?.id_infra}) au décideur
          pour validation de la priorité.
        </p>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Priorité proposée
          <select
            value={prioriteTransmission}
            onChange={(e) => setPrioriteTransmission(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            {Object.values(PRIORITES).map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Le gestionnaire propose, le décideur valide la priorité finale.
        </p>
      </Modal>
    </GestionnaireLayout>
  );
};

export default InfrastructuresPage;
