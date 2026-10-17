// Création d'un signalement : catégorie, titre, description, urgence, photo, GPS.
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle2, Copy, FilePlus, List } from "lucide-react";
import CitoyenLayout, { PageHeader } from "../components/CitoyenLayout";
import { CitoyenToast, CitoyenButton } from "../components/CitoyenUI";
import SignalementForm from "../components/SignalementForm";
import { citoyenService } from "../services/citoyenService";

const NouveauSignalementPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [cree, setCree] = useState(null);
  const [copie, setCopie] = useState(false);

  const envoyer = async (donnees) => {
    setLoading(true);
    setErreur("");
    try {
      const signal = await citoyenService.createSignalement(donnees);
      setCree(signal);
    } catch (err) {
      setErreur(err.message || "Erreur lors de l'envoi du signalement.");
    } finally {
      setLoading(false);
    }
  };

  const copierSuivi = async () => {
    try {
      await navigator.clipboard.writeText(cree.id_suivi);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      /* la copie peut échouer selon le navigateur */
    }
  };

  if (cree) {
    return (
      <CitoyenLayout>
        <PageHeader
          title="Signalement envoyé"
          description="Votre signalement a bien été enregistré."
        />
        <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            Merci pour votre contribution
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Conservez votre identifiant unique de suivi pour suivre le traitement.
          </p>

          <div className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/30">
            <span className="font-mono text-lg font-bold tracking-wider text-green-700 dark:text-green-300">
              {cree.id_suivi}
            </span>
            <button
              onClick={copierSuivi}
              className="rounded-md p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50"
              title="Copier"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          {copie && <p className="mt-1 text-xs text-green-600">Identifiant copié.</p>}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <CitoyenButton onClick={() => navigate(`/citoyen/signalements/${cree.id_signal}`)}>
              <FilePlus className="h-4 w-4" /> Voir le détail
            </CitoyenButton>
            <CitoyenButton variant="secondary" onClick={() => setCree(null)}>
              <FilePlus className="h-4 w-4" /> Nouveau signalement
            </CitoyenButton>
            <Link to="/citoyen/signalements">
              <CitoyenButton variant="ghost">
                <List className="h-4 w-4" /> Mes signalements
              </CitoyenButton>
            </Link>
          </div>
        </div>
      </CitoyenLayout>
    );
  }

  return (
    <CitoyenLayout>
      <PageHeader
        title="Nouveau signalement"
        description="Décrivez le problème urbain et localisez-le précisément."
      />

      {erreur && <CitoyenToast message={erreur} tone="error" onClose={() => setErreur("")} />}

      <div className="max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <SignalementForm
          onSubmit={envoyer}
          onCancel={() => navigate("/citoyen/signalements")}
          loading={loading}
        />
      </div>
    </CitoyenLayout>
  );
};

export default NouveauSignalementPage;
