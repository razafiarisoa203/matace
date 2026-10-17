// Détail d'un signalement : informations, historique, commentaires et actions.
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ThumbsUp,
  Star,
  MessageSquarePlus,
  Clock,
  MapPin,
} from "lucide-react";
import CitoyenLayout, { PageHeader } from "../components/CitoyenLayout";
import {
  CitoyenBadge,
  CitoyenButton,
  CitoyenToast,
  CitoyenModal,
  CitoyenConfirmModal,
  CitoyenLoading,
  inputClass,
} from "../components/CitoyenUI";
import SignalementForm from "../components/SignalementForm";
import MiniCarte from "../components/MiniCarte";
import { useAsyncData } from "../hooks/useAsyncData";
import { citoyenService } from "../services/citoyenService";
import {
  CATEGORIES_SIGNALEMENT,
  STATUTS_SIGNALEMENT,
  NIVEAUX_URGENCE,
  STATUTS_MODIFIABLES,
  getConstant,
} from "../constants";
import { formatDateTime, formatCoordonnees } from "../utils/format";

const tonesParStatut = {
  nouveau: "blue",
  pris_en_charge: "violet",
  en_cours: "yellow",
  resolu: "green",
  rejete: "red",
};

const SignalementDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: signal, loading, recharger } = useAsyncData(
    () => citoyenService.getSignalement(id),
    [id]
  );

  const [toast, setToast] = useState({ message: "", tone: "success" });
  const [actionLoading, setActionLoading] = useState(false);
  const [modalEdition, setModalEdition] = useState(false);
  const [modalAnnulation, setModalAnnulation] = useState(false);
  const [modalEvaluation, setModalEvaluation] = useState(false);
  const [note, setNote] = useState(5);
  const [commentaireEval, setCommentaireEval] = useState("");
  const [nouveauCommentaire, setNouveauCommentaire] = useState("");

  const afficherToast = (message, tone = "success") => {
    setToast({ message, tone });
    setTimeout(() => setToast({ message: "", tone }), 3000);
  };

  const modifiable = STATUTS_MODIFIABLES.includes(signal?.statut);
  const dejaConfirme = signal?.confirme_par?.length > 0;

  const modifier = async (donnees) => {
    setActionLoading(true);
    try {
      await citoyenService.updateSignalement(id, donnees);
      afficherToast("Signalement modifié.");
      setModalEdition(false);
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const annuler = async () => {
    setActionLoading(true);
    try {
      await citoyenService.annulerSignalement(id);
      navigate("/citoyen/signalements");
    } catch (err) {
      afficherToast(err.message || "Erreur.", "error");
      setModalAnnulation(false);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmer = async () => {
    setActionLoading(true);
    try {
      await citoyenService.confirmerSignalement(id);
      afficherToast("Merci, votre confirmation a été enregistrée.");
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const evaluer = async () => {
    setActionLoading(true);
    try {
      await citoyenService.evaluerSignalement(id, { note, commentaire: commentaireEval });
      afficherToast("Merci pour votre évaluation.");
      setModalEvaluation(false);
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const ajouterCommentaire = async () => {
    if (!nouveauCommentaire.trim()) return;
    setActionLoading(true);
    try {
      await citoyenService.ajouterCommentaire(id, nouveauCommentaire.trim());
      setNouveauCommentaire("");
      afficherToast("Commentaire ajouté.");
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <CitoyenLayout>
        <CitoyenLoading />
      </CitoyenLayout>
    );
  }

  if (!signal) {
    return (
      <CitoyenLayout>
        <PageHeader title="Signalement introuvable" />
        <Link to="/citoyen/signalements">
          <CitoyenButton variant="secondary">
            <ArrowLeft className="h-4 w-4" /> Retour à mes signalements
          </CitoyenButton>
        </Link>
      </CitoyenLayout>
    );
  }

  return (
    <CitoyenLayout>
      <Link
        to="/citoyen/signalements"
        className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 dark:text-gray-400"
      >
        <ArrowLeft className="h-4 w-4" /> Mes signalements
      </Link>

      <PageHeader
        title={signal.titre}
        description={`Identifiant de suivi : ${signal.id_suivi}`}
        actions={
          <>
            {modifiable && (
              <>
                <CitoyenButton variant="secondary" onClick={() => setModalEdition(true)}>
                  <Pencil className="h-4 w-4" /> Modifier
                </CitoyenButton>
                <CitoyenButton variant="danger" onClick={() => setModalAnnulation(true)}>
                  <Trash2 className="h-4 w-4" /> Annuler
                </CitoyenButton>
              </>
            )}
            {!dejaConfirme && (
              <CitoyenButton variant="secondary" onClick={confirmer} disabled={actionLoading}>
                <ThumbsUp className="h-4 w-4" /> Je confirme
              </CitoyenButton>
            )}
            {signal.statut === "resolu" && !signal.evaluation && (
              <CitoyenButton onClick={() => setModalEvaluation(true)}>
                <Star className="h-4 w-4" /> Évaluer
              </CitoyenButton>
            )}
          </>
        }
      />

      {toast.message && (
        <CitoyenToast message={toast.message} tone={toast.tone} onClose={() => setToast({ message: "", tone: "success" })} />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-wrap items-center gap-2">
              <CitoyenBadge tone={tonesParStatut[signal.statut]}>
                {getConstant(STATUTS_SIGNALEMENT, signal.statut).label}
              </CitoyenBadge>
              <CitoyenBadge tone="slate">
                {getConstant(CATEGORIES_SIGNALEMENT, signal.categorie).label}
              </CitoyenBadge>
              <CitoyenBadge
                tone={
                  signal.urgence === "urgente"
                    ? "red"
                    : signal.urgence === "haute"
                    ? "yellow"
                    : "gray"
                }
              >
                Urgence : {getConstant(NIVEAUX_URGENCE, signal.urgence).label}
              </CitoyenBadge>
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <ThumbsUp className="h-3.5 w-3.5" /> {signal.confirmations || 0} confirmation(s)
              </span>
            </div>

            <p className="mt-4 whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
              {signal.description}
            </p>

            {signal.motif_rejet && (
              <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
                Motif du rejet : {signal.motif_rejet}
              </p>
            )}

            {signal.photo && (
              <img
                src={signal.photo}
                alt="Photo du signalement"
                className="mt-4 max-h-96 w-full rounded-lg border border-gray-200 object-cover dark:border-gray-700"
              />
            )}

            <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-gray-500 dark:text-gray-400 sm:grid-cols-2">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {signal.commune} — {signal.quartier}
              </span>
              <span>Coordonnées : {formatCoordonnees(signal.latitude, signal.longitude)}</span>
              <span>Déposé le : {formatDateTime(signal.date_signalement)}</span>
              <span>Mis à jour le : {formatDateTime(signal.updated_at)}</span>
            </div>
          </div>

          {/* Commentaires */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <MessageSquarePlus className="h-4 w-4 text-green-600 dark:text-green-400" />
              Commentaires et informations complémentaires
            </h2>
            <div className="space-y-3">
              {(signal.commentaires || []).length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Aucun commentaire pour le moment.
                </p>
              )}
              {(signal.commentaires || []).map((c) => (
                <div key={c.id} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{c.auteur}</span>
                    <span>{formatDateTime(c.date)}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{c.message}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <textarea
                value={nouveauCommentaire}
                onChange={(e) => setNouveauCommentaire(e.target.value)}
                rows={2}
                placeholder="Ajouter un commentaire ou une précision..."
                className={inputClass}
              />
              <div className="mt-2 flex justify-end">
                <CitoyenButton onClick={ajouterCommentaire} disabled={actionLoading || !nouveauCommentaire.trim()}>
                  <MessageSquarePlus className="h-4 w-4" /> Ajouter
                </CitoyenButton>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
              Historique du traitement
            </h2>
            <ol className="relative space-y-4 border-l border-gray-200 pl-5 dark:border-gray-700">
              {(signal.historique || []).map((h, index) => (
                <li key={index} className="relative">
                  <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full bg-green-500 ring-4 ring-white dark:ring-gray-800" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {getConstant(STATUTS_SIGNALEMENT, h.statut).label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDateTime(h.date)}
                  </div>
                  {h.commentaire && (
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{h.commentaire}</p>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Localisation</h2>
            <MiniCarte latitude={signal.latitude} longitude={signal.longitude} />
          </div>

          {signal.evaluation && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                Votre évaluation
              </h2>
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`h-4 w-4 ${n <= signal.evaluation.note ? "fill-amber-500" : ""}`}
                  />
                ))}
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                  {signal.evaluation.note}/5
                </span>
              </div>
              {signal.evaluation.commentaire && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {signal.evaluation.commentaire}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modale modification */}
      <CitoyenModal
        isOpen={modalEdition}
        onClose={() => setModalEdition(false)}
        title="Modifier le signalement"
        size="lg"
      >
        <SignalementForm
          initial={signal}
          onSubmit={modifier}
          onCancel={() => setModalEdition(false)}
          loading={actionLoading}
          submitLabel="Enregistrer les modifications"
        />
      </CitoyenModal>

      {/* Modale annulation */}
      <CitoyenConfirmModal
        isOpen={modalAnnulation}
        onClose={() => setModalAnnulation(false)}
        onConfirm={annuler}
        title="Annuler le signalement"
        message="Confirmez-vous l'annulation de ce signalement ? Cette action est irréversible."
        confirmLabel="Annuler le signalement"
        loading={actionLoading}
      />

      {/* Modale évaluation */}
      <CitoyenModal
        isOpen={modalEvaluation}
        onClose={() => setModalEvaluation(false)}
        title="Évaluer la résolution"
        size="sm"
        footer={
          <>
            <CitoyenButton variant="secondary" onClick={() => setModalEvaluation(false)}>
              Annuler
            </CitoyenButton>
            <CitoyenButton onClick={evaluer} disabled={actionLoading}>
              {actionLoading ? "..." : "Envoyer"}
            </CitoyenButton>
          </>
        }
      >
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          Donnez votre avis sur la qualité du traitement de ce signalement.
        </p>
        <div className="mb-3 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setNote(n)} aria-label={`Note ${n}`}>
              <Star
                className={`h-7 w-7 ${n <= note ? "fill-amber-500 text-amber-500" : "text-gray-300 dark:text-gray-600"}`}
              />
            </button>
          ))}
        </div>
        <textarea
          value={commentaireEval}
          onChange={(e) => setCommentaireEval(e.target.value)}
          rows={3}
          placeholder="Un commentaire sur la qualité du service (optionnel)..."
          className={inputClass}
        />
      </CitoyenModal>
    </CitoyenLayout>
  );
};

export default SignalementDetailPage;
