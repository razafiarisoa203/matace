// Planification et suivi des interventions / maintenances.
import React, { useMemo, useState } from "react";
import {
  Wrench,
  Plus,
  Search,
  Users,
  ClipboardCheck,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import GestionnaireLayout, { PageHeader } from "../components/GestionnaireLayout";
import Badge from "../components/Badge";
import Button from "../components/Buttons";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import InterventionForm from "../components/InterventionForm";
import { useAsyncData } from "../hooks/useAsyncData";
import { gestionnaireService } from "../services/gestionnaireService";
import {
  STATUTS_INTERVENTION,
  PRIORITES,
  EQUIPES,
  AGENTS,
  getConstant,
} from "../constants";
import { formatDate, formatMontant } from "../utils/format";

const nomEquipe = (id) => EQUIPES.find((e) => e.id === id)?.nom || "—";
const nomAgent = (id) => AGENTS.find((a) => a.id === id)?.nom || "—";

const InterventionsPage = () => {
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");
  const [modalCreation, setModalCreation] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [modalAffecter, setModalAffecter] = useState(null);
  const [equipeCible, setEquipeCible] = useState("");
  const [agentCible, setAgentCible] = useState("");
  const [modalRealisation, setModalRealisation] = useState(null);
  const [realisation, setRealisation] = useState({
    date_realisation: "",
    cout_reel: "",
    observations: "",
    photos: "",
  });
  const [modalAvancement, setModalAvancement] = useState(null);
  const [avancementForm, setAvancementForm] = useState({ avancement: 0, cout_reel: 0 });

  const { data: interventions, loading, recharger } = useAsyncData(
    () => gestionnaireService.getInterventions(),
    []
  );
  const { data: infrastructures } = useAsyncData(
    () => gestionnaireService.getInfrastructures(),
    []
  );
  const { data: signalements } = useAsyncData(() => gestionnaireService.getSignalements(), []);

  const liste = useMemo(() => interventions || [], [interventions]);

  const filtres = useMemo(() => {
    const q = recherche.toLowerCase();
    return liste.filter((i) => {
      const matchRecherche =
        !q ||
        i.titre?.toLowerCase().includes(q) ||
        i.id_inter?.toLowerCase().includes(q) ||
        i.id_infra?.toLowerCase().includes(q);
      const matchStatut = !filtreStatut || i.statut === filtreStatut;
      return matchRecherche && matchStatut;
    });
  }, [liste, recherche, filtreStatut]);

  const afficherToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const planifier = async (donnees) => {
    setActionLoading(true);
    try {
      await gestionnaireService.createIntervention(donnees);
      afficherToast("Intervention planifiée.");
      setModalCreation(false);
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur.");
    } finally {
      setActionLoading(false);
    }
  };

  const affecter = async () => {
    if (!modalAffecter) return;
    setActionLoading(true);
    try {
      await gestionnaireService.affecterIntervention(modalAffecter.id_inter, {
        equipe: equipeCible,
        agent: agentCible,
      });
      afficherToast("Intervention affectée.");
      setModalAffecter(null);
      setEquipeCible("");
      setAgentCible("");
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur.");
    } finally {
      setActionLoading(false);
    }
  };

  const enregistrerRealisation = async () => {
    if (!modalRealisation) return;
    setActionLoading(true);
    try {
      await gestionnaireService.enregistrerRealisation(modalRealisation.id_inter, {
        date_realisation: realisation.date_realisation || undefined,
        cout_reel: realisation.cout_reel,
        observations: realisation.observations,
        photos: realisation.photos ? realisation.photos.split(",").map((p) => p.trim()) : [],
      });
      afficherToast("Réalisation enregistrée.");
      setModalRealisation(null);
      setRealisation({ date_realisation: "", cout_reel: "", observations: "", photos: "" });
      await recharger();
    } catch (err) {
      afficherToast(err.message || "Erreur.");
    } finally {
      setActionLoading(false);
    }
  };

  const majAvancement = async () => {
    if (!modalAvancement) return;
    setActionLoading(true);
    try {
      await gestionnaireService.updateAvancement(modalAvancement.id_inter, {
        avancement: avancementForm.avancement,
        cout_reel: avancementForm.cout_reel,
      });
      afficherToast("Avancement et coût mis à jour.");
      setModalAvancement(null);
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
        title="Interventions & maintenance"
        description="Planifier, affecter et enregistrer les interventions réalisées (date, coût, photos, observations)."
        actions={
          <Button onClick={() => setModalCreation(true)}>
            <Plus className="h-4 w-4" /> Planifier une intervention
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
            placeholder="Rechercher par intitulé, ID intervention ou infrastructure..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          <option value="">Tous les statuts</option>
          {Object.values(STATUTS_INTERVENTION).map((s) => (
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
          <EmptyState icon={Wrench} title="Aucune intervention" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  {["ID", "Intitulé", "Infrastructure", "Équipe / Agent", "Priorité", "Statut", "Avancement", "Coût réel", "Actions"].map(
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
                  <tr key={i.id_inter} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {i.id_inter}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="max-w-xs truncate">{i.titre}</div>
                      <div className="text-xs text-gray-400">{i.type}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {i.id_infra || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <div>{nomEquipe(i.equipe)}</div>
                      <div className="text-xs text-gray-400">{nomAgent(i.agent)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge config={getConstant(PRIORITES, i.priorite)} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge config={getConstant(STATUTS_INTERVENTION, i.statut)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{ width: `${i.avancement || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {i.avancement || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatMontant(i.cout_reel)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          title="Affecter équipe/agent"
                          onClick={() => {
                            setModalAffecter(i);
                            setEquipeCible(i.equipe || "");
                            setAgentCible(i.agent || "");
                          }}
                          className="rounded-md p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                        >
                          <Users className="h-4 w-4" />
                        </button>
                        <button
                          title="Mettre à jour avancement / coût"
                          onClick={() => {
                            setModalAvancement(i);
                            setAvancementForm({
                              avancement: i.avancement || 0,
                              cout_reel: i.cout_reel || 0,
                            });
                          }}
                          className="rounded-md p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
                        >
                          <TrendingUp className="h-4 w-4" />
                        </button>
                        <button
                          title="Enregistrer la réalisation"
                          onClick={() => {
                            setModalRealisation(i);
                            setRealisation({
                              date_realisation: i.date_realisation
                                ? i.date_realisation.slice(0, 10)
                                : "",
                              cout_reel: i.cout_reel || "",
                              observations: i.observations || "",
                              photos: "",
                            });
                          }}
                          className="rounded-md p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                        >
                          <ClipboardCheck className="h-4 w-4" />
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
        {filtres.length} intervention(s). Coût total réel affiché = somme des réalisations.
      </p>

      {/* Planifier */}
      <Modal
        isOpen={modalCreation}
        onClose={() => setModalCreation(false)}
        title="Planifier une intervention"
        size="lg"
      >
        <InterventionForm
          infrastructures={infrastructures || []}
          signalements={signalements || []}
          agents={AGENTS}
          onSubmit={planifier}
          onCancel={() => setModalCreation(false)}
          loading={actionLoading}
        />
      </Modal>

      {/* Affecter */}
      <Modal
        isOpen={!!modalAffecter}
        onClose={() => setModalAffecter(null)}
        title="Affecter l'intervention"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalAffecter(null)}>
              Annuler
            </Button>
            <Button onClick={affecter} disabled={actionLoading}>
              {actionLoading ? "..." : "Affecter"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Équipe
            <select
              value={equipeCible}
              onChange={(e) => setEquipeCible(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">— Non affectée —</option>
              {EQUIPES.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Agent
            <select
              value={agentCible}
              onChange={(e) => setAgentCible(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">— Non affecté —</option>
              {AGENTS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nom}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Modal>

      {/* Avancement */}
      <Modal
        isOpen={!!modalAvancement}
        onClose={() => setModalAvancement(null)}
        title="Mettre à jour l'avancement et le coût"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalAvancement(null)}>
              Annuler
            </Button>
            <Button onClick={majAvancement} disabled={actionLoading}>
              {actionLoading ? "..." : "Enregistrer"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Avancement : {avancementForm.avancement}%
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={avancementForm.avancement}
              onChange={(e) =>
                setAvancementForm((p) => ({ ...p, avancement: Number(e.target.value) }))
              }
              className="mt-2 w-full"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Coût réel engagé (Ar)
            <input
              type="number"
              value={avancementForm.cout_reel}
              onChange={(e) => setAvancementForm((p) => ({ ...p, cout_reel: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </label>
        </div>
      </Modal>

      {/* Réalisation */}
      <Modal
        isOpen={!!modalRealisation}
        onClose={() => setModalRealisation(null)}
        title="Enregistrer une intervention réalisée"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalRealisation(null)}>
              Annuler
            </Button>
            <Button onClick={enregistrerRealisation} disabled={actionLoading}>
              {actionLoading ? "..." : "Marquer terminée"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date de réalisation
              <input
                type="date"
                value={realisation.date_realisation}
                onChange={(e) =>
                  setRealisation((p) => ({ ...p, date_realisation: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Coût réel (Ar)
              <input
                type="number"
                value={realisation.cout_reel}
                onChange={(e) => setRealisation((p) => ({ ...p, cout_reel: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </label>
          </div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Observations
            <textarea
              rows={3}
              value={realisation.observations}
              onChange={(e) => setRealisation((p) => ({ ...p, observations: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Photos (URLs séparées par des virgules)
            <input
              value={realisation.photos}
              onChange={(e) => setRealisation((p) => ({ ...p, photos: e.target.value }))}
              placeholder="https://.../photo1.jpg, https://.../photo2.jpg"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </label>
        </div>
      </Modal>

      <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
        Dernière mise à jour enregistrée le {formatDate(new Date())}.
      </p>
    </GestionnaireLayout>
  );
};

export default InterventionsPage;
