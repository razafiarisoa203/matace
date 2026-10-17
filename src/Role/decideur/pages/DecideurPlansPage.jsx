// Validation des plans d'intervention soumis par le gestionnaire.
import React, { useMemo, useState } from "react";
import { ClipboardCheck, CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import DecideurLayout, { PageHeader } from "../components/DecideurLayout";
import Badge from "../../gestionnaire/components/Badge";
import Button from "../../gestionnaire/components/Buttons";
import Modal from "../../gestionnaire/components/Modal";
import { TextAreaField, TextField } from "../../gestionnaire/components/Field";
import EmptyState from "../../gestionnaire/components/EmptyState";
import { useAsyncData } from "../../gestionnaire/hooks/useAsyncData";
import { decideurService } from "../services/decideurService";
import { STATUTS_PLAN, TERRITOIRES, getConstant } from "../constants";
import { formatDate, formatMontant } from "../../gestionnaire/utils/format";

const labelTerritoire = (v) => TERRITOIRES.find((t) => t.value === v)?.label || v;
const PRIORITES_COULEUR = {
  urgente: "text-red-600 dark:text-red-400",
  haute: "text-orange-600 dark:text-orange-400",
  moyenne: "text-blue-600 dark:text-blue-400",
  basse: "text-gray-500 dark:text-gray-400",
};

const DecideurPlansPage = () => {
  const [filtreStatut, setFiltreStatut] = useState("");
  const [selection, setSelection] = useState(null);
  const [decision, setDecision] = useState("valide");
  const [motif, setMotif] = useState("");
  const [dateReport, setDateReport] = useState("");
  const [toast, setToast] = useState("");

  const { data, loading, recharger } = useAsyncData(
    () => decideurService.getPlans(filtreStatut ? { statut: filtreStatut } : {}),
    [filtreStatut]
  );

  const plans = useMemo(() => data || [], [data]);

  const afficherToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };

  const ouvrir = (plan) => {
    setSelection(plan);
    setDecision("valide");
    setMotif("");
    setDateReport("");
  };

  const confirmer = async () => {
    if (decision !== "valide" && !motif.trim()) {
      afficherToast("Un motif est requis pour rejeter ou reporter.");
      return;
    }
    if (decision === "reporte" && !dateReport) {
      afficherToast("Sélectionnez une nouvelle date pour le report.");
      return;
    }
    await decideurService.decisionPlan(
      selection.id_plan,
      decision,
      motif,
      decision === "reporte" ? dateReport : null
    );
    setSelection(null);
    afficherToast(`Plan ${selection.id_plan} : décision enregistrée (${decision}).`);
    recharger();
  };

  const libelleDecision = { valide: "validé", rejete: "rejeté", reporte: "reporté" };

  return (
    <DecideurLayout>
      <PageHeader
        title="Plans d'intervention"
        description="Valider, rejeter ou reporter les plans soumis par le gestionnaire, selon les priorités et le budget."
      />

      {toast && (
        <div className="mb-4 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          {toast}
        </div>
      )}

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filtrer par statut
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            className="mt-1 block w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Tous</option>
            {Object.values(STATUTS_PLAN).map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Chargement des plans...</p>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Aucun plan"
          description="Aucun plan d'intervention ne correspond à ce filtre."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {plans.map((p) => (
            <div
              key={p.id_plan}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{p.id_plan}</p>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{p.titre}</h3>
                </div>
                <Badge config={getConstant(STATUTS_PLAN, p.statut)} />
              </div>

              <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                {p.description}
              </p>

              <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Infrastructure</span>
                  <p className="font-medium text-gray-900 dark:text-white">{p.id_infra}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Territoire</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {labelTerritoire(p.territoire)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Coût estimé</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatMontant(p.cout_estime)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Priorité proposée</span>
                  <p className={`font-medium capitalize ${PRIORITES_COULEUR[p.priorite_proposee] || ""}`}>
                    {p.priorite_proposee}
                  </p>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Soumis le {formatDate(p.date_soumission)}
                </span>
                <Button variant="secondary" onClick={() => ouvrir(p)}>
                  <Eye className="h-4 w-4" /> Décider
                </Button>
              </div>

              {p.motif_decision && (
                <p className="mt-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-500 dark:bg-gray-900/40 dark:text-gray-400">
                  Motif : {p.motif_decision}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(selection)}
        onClose={() => setSelection(null)}
        title={selection ? `Décision · ${selection.id_plan}` : ""}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelection(null)}>
              Annuler
            </Button>
            <Button onClick={confirmer}>Confirmer la décision</Button>
          </>
        }
      >
        {selection && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-900/40">
              <p className="font-medium text-gray-900 dark:text-white">{selection.titre}</p>
              <p className="text-gray-500 dark:text-gray-400">
                {formatMontant(selection.cout_estime)} · {labelTerritoire(selection.territoire)} ·{" "}
                {selection.duree_mois} mois
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Décision</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: "valide", label: "Valider", icon: CheckCircle2, cls: "green" },
                  { v: "reporte", label: "Reporter", icon: Clock, cls: "yellow" },
                  { v: "rejete", label: "Rejeter", icon: XCircle, cls: "red" },
                ].map((o) => {
                  const Icon = o.icon;
                  const actif = decision === o.v;
                  return (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => setDecision(o.v)}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-sm font-medium transition-colors ${
                        actif
                          ? o.cls === "green"
                            ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : o.cls === "yellow"
                              ? "border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {decision === "reporte" && (
              <TextField
                label="Nouvelle date souhaitée"
                type="date"
                required
                value={dateReport}
                onChange={(e) => setDateReport(e.target.value)}
              />
            )}

            <TextAreaField
              label="Motif"
              required={decision !== "valide"}
              placeholder={
                decision === "valide"
                  ? "Commentaire facultatif..."
                  : "Expliquez la raison de la décision..."
              }
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
            />

            <p className="text-xs text-gray-400 dark:text-gray-500">
              La décision sera journalisée ({libelleDecision[decision]}).
            </p>
          </div>
        )}
      </Modal>
    </DecideurLayout>
  );
};

export default DecideurPlansPage;
