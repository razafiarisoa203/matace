// Détail d'une infrastructure : caractéristiques, état, signalements et interventions liés.
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Pencil,
  Wrench,
  MessageSquareWarning,
  Send,
  Building2,
} from "lucide-react";
import GestionnaireLayout, { PageHeader } from "../components/GestionnaireLayout";
import Badge from "../components/Badge";
import Button from "../components/Buttons";
import Modal from "../components/Modal";
import InfrastructureForm from "../components/InfrastructureForm";
import { useAsyncData } from "../hooks/useAsyncData";
import { gestionnaireService } from "../services/gestionnaireService";
import {
  ETATS_INFRASTRUCTURE,
  STATUTS_INFRASTRUCTURE,
  STATUTS_SIGNALEMENT,
  STATUTS_INTERVENTION,
  PRIORITES,
  getConstant,
  labelForType,
} from "../constants";
import { formatDate, formatDateTime, formatMontant, formatCoordonnees } from "../utils/format";

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col border-b border-gray-100 py-2 dark:border-gray-700/50 sm:flex-row sm:justify-between">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-sm font-medium text-gray-900 dark:text-white">{value ?? "—"}</span>
  </div>
);

const InfrastructureDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modalEdition, setModalEdition] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalSignal, setModalSignal] = useState(false);
  const [priorite, setPriorite] = useState("haute");
  const [toast, setToast] = useState("");

  const { data, loading, error, recharger } = useAsyncData(async () => {
    const [infra, signalements, interventions] = await Promise.all([
      gestionnaireService.getInfrastructure(id),
      gestionnaireService.getSignalements({ id_infra: id }),
      gestionnaireService.getInterventions({ id_infra: id }),
    ]);
    return { infra, signalements, interventions };
  }, [id]);

  const infra = data?.infra;

  const afficherToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const enregistrer = async (donnees) => {
    setActionLoading(true);
    try {
      await gestionnaireService.updateInfrastructure(id, donnees);
      afficherToast("Infrastructure mise à jour.");
      setModalEdition(false);
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur.");
    } finally {
      setActionLoading(false);
    }
  };

  const changerEtat = async (etat) => {
    setActionLoading(true);
    try {
      await gestionnaireService.updateEtatInfrastructure(id, etat);
      afficherToast(`État mis à jour : ${etat}.`);
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur.");
    } finally {
      setActionLoading(false);
    }
  };

  const transmettre = async () => {
    setActionLoading(true);
    try {
      await gestionnaireService.signalerAuDecideur(id, { priorite });
      afficherToast("Transmis au décideur.");
      setModalSignal(false);
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <GestionnaireLayout>
      <button
        onClick={() => navigate("/gestionnaire/infrastructures")}
        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 dark:text-gray-300"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à la liste
      </button>

      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Chargement...</p>}
      {error && (
        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      {infra && (
        <>
          <PageHeader
            title={infra.nom}
            description={`${infra.id_infra} · ${labelForType(infra.type)}`}
            actions={
              <>
                <Button variant="secondary" onClick={() => setModalSignal(true)}>
                  <Send className="h-4 w-4" /> Signaler au décideur
                </Button>
                <Button onClick={() => setModalEdition(true)}>
                  <Pencil className="h-4 w-4" /> Modifier
                </Button>
              </>
            }
          />

          {toast && (
            <div className="mb-4 rounded-lg border-l-4 border-green-500 bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
              {toast}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Caractéristiques */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Caractéristiques
                </h2>
                <div className="flex gap-2">
                  <Badge config={getConstant(ETATS_INFRASTRUCTURE, infra.etat)} />
                  <Badge config={getConstant(STATUTS_INFRASTRUCTURE, infra.statut)} />
                </div>
              </div>

              <InfoRow label="Type" value={labelForType(infra.type)} />
              <InfoRow label="Priorité proposée" value={getConstant(PRIORITES, infra.priorite)?.label} />
              <InfoRow label="Commune" value={infra.commune} />
              <InfoRow label="Fokontany" value={infra.fokontany} />
              <InfoRow
                label="Coordonnées GPS"
                value={formatCoordonnees(infra.latitude, infra.longitude)}
              />
              <InfoRow label="Année de construction" value={infra.annee_construction} />
              <InfoRow label="Longueur (m)" value={infra.longueur_m} />
              <InfoRow label="Coût estimé" value={formatMontant(infra.cout_estime)} />
              <InfoRow label="Dernier contrôle" value={formatDateTime(infra.dernier_controle)} />
              <InfoRow label="Créée le" value={formatDate(infra.created_at)} />
              <InfoRow label="Description" value={infra.description} />
            </div>

            {/* Mise à jour de l'état */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                État après inspection
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(ETATS_INFRASTRUCTURE).map((e) => (
                  <button
                    key={e.value}
                    disabled={actionLoading}
                    onClick={() => changerEtat(e.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      infra.etat === e.value
                        ? e.color
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Un état « critique » génère automatiquement une alerte.
              </p>
            </div>
          </div>

          {/* Signalements liés */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3 dark:border-gray-700">
                <MessageSquareWarning className="h-5 w-5 text-blue-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Signalements liés ({data.signalements.length})
                </h2>
              </div>
              {data.signalements.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 dark:text-gray-400">Aucun signalement.</p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {data.signalements.map((s) => (
                    <li key={s.id_signal} className="flex items-center justify-between gap-2 px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {s.titre}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {s.id_signal} · {formatDate(s.date_signalement)}
                        </p>
                      </div>
                      <Badge config={getConstant(STATUTS_SIGNALEMENT, s.statut)} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Interventions liées */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3 dark:border-gray-700">
                <Wrench className="h-5 w-5 text-yellow-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Interventions ({data.interventions.length})
                </h2>
              </div>
              {data.interventions.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 dark:text-gray-400">Aucune intervention.</p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {data.interventions.map((i) => (
                    <li key={i.id_inter} className="px-5 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {i.titre}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {i.id_inter} · {formatMontant(i.cout_reel)}
                          </p>
                        </div>
                        <Badge config={getConstant(STATUTS_INTERVENTION, i.statut)} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/gestionnaire/interventions"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <Wrench className="h-4 w-4" /> Planifier une intervention
            </Link>
          </div>

          {/* Modales */}
          <Modal
            isOpen={modalEdition}
            onClose={() => setModalEdition(false)}
            title={`Modifier ${infra.id_infra}`}
            size="lg"
          >
            <InfrastructureForm
              initialValues={infra}
              onSubmit={enregistrer}
              onCancel={() => setModalEdition(false)}
              loading={actionLoading}
            />
          </Modal>

          <Modal
            isOpen={modalSignal}
            onClose={() => setModalSignal(false)}
            title="Signaler au décideur"
            size="sm"
            footer={
              <>
                <Button variant="secondary" onClick={() => setModalSignal(false)}>
                  Annuler
                </Button>
                <Button onClick={transmettre} disabled={actionLoading}>
                  {actionLoading ? "..." : "Transmettre"}
                </Button>
              </>
            }
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Priorité proposée
              <select
                value={priorite}
                onChange={(e) => setPriorite(e.target.value)}
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
        </>
      )}
    </GestionnaireLayout>
  );
};

export default InfrastructureDetailPage;
