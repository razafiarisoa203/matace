// Traitement des signalements citoyens : rattachement, statut, priorité.
import React, { useMemo, useState } from "react";
import {
  MessageSquareWarning,
  Plus,
  Search,
  Link2,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Flag,
} from "lucide-react";
import GestionnaireLayout, { PageHeader } from "../components/GestionnaireLayout";
import Badge from "../components/Badge";
import Button from "../components/Buttons";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import SignalementForm from "../components/SignalementForm";
import { useAsyncData } from "../hooks/useAsyncData";
import { gestionnaireService } from "../services/gestionnaireService";
import {
  STATUTS_SIGNALEMENT,
  PRIORITES,
  getConstant,
} from "../constants";
import { formatDate } from "../utils/format";

const SignalementsPage = () => {
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");
  const [modalCreation, setModalCreation] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [signalSelectionne, setSignalSelectionne] = useState(null);
  const [modalRattacher, setModalRattacher] = useState(null);
  const [infraCible, setInfraCible] = useState("");
  const [modalRejet, setModalRejet] = useState(null);
  const [motifRejet, setMotifRejet] = useState("");
  const [modalPriorite, setModalPriorite] = useState(null);
  const [prioriteProposee, setPrioriteProposee] = useState("moyenne");

  const { data: signalements, loading, recharger } = useAsyncData(
    () => gestionnaireService.getSignalements(),
    []
  );
  const { data: infrastructures } = useAsyncData(
    () => gestionnaireService.getInfrastructures(),
    []
  );

  const liste = useMemo(() => signalements || [], [signalements]);
  const infras = infrastructures || [];

  const filtres = useMemo(() => {
    const q = recherche.toLowerCase();
    return liste.filter((s) => {
      const matchRecherche =
        !q ||
        s.titre?.toLowerCase().includes(q) ||
        s.id_signal?.toLowerCase().includes(q) ||
        s.declarant?.toLowerCase().includes(q);
      const matchStatut = !filtreStatut || s.statut === filtreStatut;
      return matchRecherche && matchStatut;
    });
  }, [liste, recherche, filtreStatut]);

  const afficherToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const creer = async (donnees) => {
    setActionLoading(true);
    try {
      await gestionnaireService.createSignalement(donnees);
      afficherToast("Signalement créé.");
      setModalCreation(false);
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur.");
    } finally {
      setActionLoading(false);
    }
  };

  const changerStatut = async (id, statut, motif = "") => {
    setActionLoading(true);
    try {
      await gestionnaireService.updateStatutSignalement(id, statut, motif);
      afficherToast(`Statut mis à jour : ${statut}.`);
      setModalRejet(null);
      setMotifRejet("");
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur.");
    } finally {
      setActionLoading(false);
    }
  };

  const rattacher = async () => {
    if (!modalRattacher || !infraCible) return;
    setActionLoading(true);
    try {
      await gestionnaireService.rattacherSignalement(modalRattacher.id_signal, infraCible);
      afficherToast("Signalement rattaché à l'infrastructure.");
      setModalRattacher(null);
      setInfraCible("");
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur.");
    } finally {
      setActionLoading(false);
    }
  };

  const proposerPriorite = async () => {
    if (!modalPriorite) return;
    setActionLoading(true);
    try {
      await gestionnaireService.proposerPriorite(modalPriorite.id_signal, prioriteProposee);
      afficherToast("Priorité proposée (en attente de validation du décideur).");
      setModalPriorite(null);
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <GestionnaireLayout>
      <PageHeader
        title="Signalements citoyens"
        description="Traiter les signalements, les rattacher à une infrastructure et suivre leur statut."
        actions={
          <Button onClick={() => setModalCreation(true)}>
            <Plus className="h-4 w-4" /> Nouveau signalement
          </Button>
        }
      />

      {toast && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border-l-4 border-green-500 bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher par titre, ID ou déclarant..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          <option value="">Tous les statuts</option>
          {Object.values(STATUTS_SIGNALEMENT).map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Chargement...
          </div>
        ) : filtres.length === 0 ? (
          <EmptyState
            icon={MessageSquareWarning}
            title="Aucun signalement"
            description="Aucun signalement ne correspond à vos critères."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  {["ID", "Titre", "Déclarant", "Priorité", "Infrastructure", "Statut", "Date", "Actions"].map(
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
                {filtres.map((s) => (
                  <tr key={s.id_signal} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {s.id_signal}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <button
                        onClick={() => setSignalSelectionne(s)}
                        className="max-w-xs truncate text-left hover:text-green-600 hover:underline dark:hover:text-green-400"
                      >
                        {s.titre}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {s.declarant || "—"}
                      <span className="ml-1 text-xs text-gray-400">({s.source})</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge config={getConstant(PRIORITES, s.priorite_proposee)} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {s.id_infra || <span className="text-gray-400">non rattaché</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge config={getConstant(STATUTS_SIGNALEMENT, s.statut)} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(s.date_signalement)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          title="Rattacher à une infrastructure"
                          onClick={() => setModalRattacher(s)}
                          className="rounded-md p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                        >
                          <Link2 className="h-4 w-4" />
                        </button>
                        <button
                          title="Proposer une priorité"
                          onClick={() => {
                            setModalPriorite(s);
                            setPrioriteProposee(s.priorite_proposee || "moyenne");
                          }}
                          className="rounded-md p-1.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                        >
                          <Flag className="h-4 w-4" />
                        </button>
                        {s.statut !== "en_cours" && (
                          <button
                            title="Marquer en cours"
                            onClick={() => changerStatut(s.id_signal, "en_cours")}
                            className="rounded-md p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
                          >
                            <PlayCircle className="h-4 w-4" />
                          </button>
                        )}
                        {s.statut !== "resolu" && (
                          <button
                            title="Marquer résolu"
                            onClick={() => changerStatut(s.id_signal, "resolu")}
                            className="rounded-md p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        {s.statut !== "rejete" && (
                          <button
                            title="Rejeter"
                            onClick={() => setModalRejet(s)}
                            className="rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
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
        Statuts possibles : nouveau, en cours, résolu, rejeté. {filtres.length} signalement(s).
      </p>

      {/* Création */}
      <Modal
        isOpen={modalCreation}
        onClose={() => setModalCreation(false)}
        title="Nouveau signalement"
        size="lg"
      >
        <SignalementForm
          infrastructures={infras}
          onSubmit={creer}
          onCancel={() => setModalCreation(false)}
          loading={actionLoading}
        />
      </Modal>

      {/* Détail */}
      <Modal
        isOpen={!!signalSelectionne}
        onClose={() => setSignalSelectionne(null)}
        title={signalSelectionne?.titre}
        size="md"
      >
        {signalSelectionne && (
          <div className="space-y-3 text-sm">
            <div className="flex gap-2">
              <Badge config={getConstant(STATUTS_SIGNALEMENT, signalSelectionne.statut)} />
              <Badge config={getConstant(PRIORITES, signalSelectionne.priorite_proposee)} />
              {signalSelectionne.priorite_validee && (
                <Badge config={getConstant(PRIORITES, signalSelectionne.priorite_validee)} />
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-300">{signalSelectionne.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Déclarant : {signalSelectionne.declarant || "—"}</span>
              <span>Contact : {signalSelectionne.contact || "—"}</span>
              <span>Source : {signalSelectionne.source}</span>
              <span>Infrastructure : {signalSelectionne.id_infra || "non rattaché"}</span>
              <span>Date : {formatDate(signalSelectionne.date_signalement)}</span>
            </div>
            {signalSelectionne.motif_rejet && (
              <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
                Motif de rejet : {signalSelectionne.motif_rejet}
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Rattacher */}
      <Modal
        isOpen={!!modalRattacher}
        onClose={() => setModalRattacher(null)}
        title="Rattacher à une infrastructure"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalRattacher(null)}>
              Annuler
            </Button>
            <Button onClick={rattacher} disabled={actionLoading || !infraCible}>
              {actionLoading ? "..." : "Rattacher"}
            </Button>
          </>
        }
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Infrastructure
          <select
            value={infraCible}
            onChange={(e) => setInfraCible(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">— Sélectionner —</option>
            {infras.map((i) => (
              <option key={i.id_infra} value={i.id_infra}>
                {i.id_infra} — {i.nom}
              </option>
            ))}
          </select>
        </label>
      </Modal>

      {/* Proposer priorité */}
      <Modal
        isOpen={!!modalPriorite}
        onClose={() => setModalPriorite(null)}
        title="Proposer une priorité"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalPriorite(null)}>
              Annuler
            </Button>
            <Button onClick={proposerPriorite} disabled={actionLoading}>
              {actionLoading ? "..." : "Proposer"}
            </Button>
          </>
        }
      >
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          La priorité proposée devra être validée par le décideur.
        </p>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Priorité
          <select
            value={prioriteProposee}
            onChange={(e) => setPrioriteProposee(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            {Object.values(PRIORITES).map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </Modal>

      {/* Rejet */}
      <Modal
        isOpen={!!modalRejet}
        onClose={() => setModalRejet(null)}
        title="Rejeter le signalement"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalRejet(null)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={() => modalRejet && changerStatut(modalRejet.id_signal, "rejete", motifRejet)}
              disabled={actionLoading}
            >
              {actionLoading ? "..." : "Rejeter"}
            </Button>
          </>
        }
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Motif du rejet
          <textarea
            value={motifRejet}
            onChange={(e) => setMotifRejet(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </label>
      </Modal>
    </GestionnaireLayout>
  );
};

export default SignalementsPage;
