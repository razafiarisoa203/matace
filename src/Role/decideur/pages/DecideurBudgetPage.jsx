// Programmation budgétaire : consultation et validation.
import React, { useState } from "react";
import { Wallet, CheckCircle2, XCircle, Coins } from "lucide-react";
import DecideurLayout, { PageHeader } from "../components/DecideurLayout";
import Badge from "../../gestionnaire/components/Badge";
import Button from "../../gestionnaire/components/Buttons";
import Modal from "../../gestionnaire/components/Modal";
import { TextAreaField } from "../../gestionnaire/components/Field";
import EmptyState from "../../gestionnaire/components/EmptyState";
import { ProgressBar } from "../components/Charts";
import { useAsyncData } from "../../gestionnaire/hooks/useAsyncData";
import { decideurService } from "../services/decideurService";
import { STATUTS_BUDGET, TERRITOIRES, getConstant } from "../constants";
import { formatMontant, formatDate } from "../../gestionnaire/utils/format";

const labelTerritoire = (v) => TERRITOIRES.find((t) => t.value === v)?.label || v;

const DecideurBudgetPage = () => {
  const [selection, setSelection] = useState(null);
  const [decision, setDecision] = useState("valide");
  const [motif, setMotif] = useState("");
  const [toast, setToast] = useState("");

  const { data, loading, recharger } = useAsyncData(() => decideurService.getBudgets(), []);

  const budgets = data || [];
  const totalEnveloppe = budgets.reduce((s, b) => s + (Number(b.enveloppe_totale) || 0), 0);
  const totalEngage = budgets.reduce((s, b) => s + (Number(b.engage) || 0), 0);
  const tauxGlobal = totalEnveloppe ? Math.round((totalEngage / totalEnveloppe) * 100) : 0;

  const afficherToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };

  const ouvrir = (b) => {
    setSelection(b);
    setDecision("valide");
    setMotif("");
  };

  const confirmer = async () => {
    if (decision === "rejete" && !motif.trim()) {
      afficherToast("Un motif est requis pour rejeter un budget.");
      return;
    }
    await decideurService.decisionBudget(selection.id_budget, decision, motif);
    setSelection(null);
    afficherToast(`Budget ${selection.id_budget} : décision enregistrée.`);
    recharger();
  };

  return (
    <DecideurLayout>
      <PageHeader
        title="Budget"
        description="Consulter les enveloppes, le taux d'engagement et valider les programmations budgétaires."
      />

      {toast && (
        <div className="mb-4 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          {toast}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Chargement du budget...</p>
      ) : budgets.length === 0 ? (
        <EmptyState icon={Wallet} title="Aucune programmation" description="Aucun budget enregistré." />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border-l-4 border-emerald-500 bg-white p-4 shadow-sm dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <Coins className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Enveloppe totale</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatMontant(totalEnveloppe)}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border-l-4 border-blue-500 bg-white p-4 shadow-sm dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <Wallet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Engagé</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatMontant(totalEngage)}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border-l-4 border-yellow-500 bg-white p-4 shadow-sm dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Taux d'engagement global</p>
              <p className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{tauxGlobal}%</p>
              <ProgressBar value={tauxGlobal} color="#eab308" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {budgets.map((b) => {
              const taux = b.enveloppe_totale
                ? Math.round((Number(b.engage) / Number(b.enveloppe_totale)) * 100)
                : 0;
              return (
                <div
                  key={b.id_budget}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {b.id_budget} · Exercice {b.exercice}
                      </p>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{b.libelle}</h3>
                    </div>
                    <Badge config={getConstant(STATUTS_BUDGET, b.statut)} />
                  </div>

                  <div className="mb-3 flex items-baseline justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Engagé / enveloppe</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatMontant(b.engage)} / {formatMontant(b.enveloppe_totale)}
                    </span>
                  </div>
                  <ProgressBar value={taux} color={taux >= 90 ? "#dc2626" : "#16a34a"} />

                  <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-700">
                    <p className="mb-2 text-xs font-medium uppercase text-gray-400 dark:text-gray-500">
                      Répartition par territoire
                    </p>
                    <ul className="space-y-1.5">
                      {Object.entries(b.repartition || {}).map(([terr, montant]) => (
                        <li key={terr} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {labelTerritoire(terr)}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatMontant(montant)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Maj {formatDate(b.updated_at)}
                    </span>
                    <Button variant="secondary" onClick={() => ouvrir(b)}>
                      Décider
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal
        isOpen={Boolean(selection)}
        onClose={() => setSelection(null)}
        title={selection ? `Décision budgétaire · ${selection.id_budget}` : ""}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelection(null)}>
              Annuler
            </Button>
            <Button onClick={confirmer}>Confirmer</Button>
          </>
        }
      >
        {selection && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-900/40">
              <p className="font-medium text-gray-900 dark:text-white">{selection.libelle}</p>
              <p className="text-gray-500 dark:text-gray-400">
                Enveloppe {formatMontant(selection.enveloppe_totale)} · Engagé{" "}
                {formatMontant(selection.engage)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDecision("valide")}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium ${
                  decision === "valide"
                    ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" /> Valider
              </button>
              <button
                type="button"
                onClick={() => setDecision("rejete")}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium ${
                  decision === "rejete"
                    ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300"
                }`}
              >
                <XCircle className="h-4 w-4" /> Rejeter
              </button>
            </div>

            <TextAreaField
              label="Motif"
              required={decision === "rejete"}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Commentaire sur la décision..."
            />
          </div>
        )}
      </Modal>
    </DecideurLayout>
  );
};

export default DecideurBudgetPage;
