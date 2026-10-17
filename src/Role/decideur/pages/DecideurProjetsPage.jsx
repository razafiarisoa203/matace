// Priorisation et décision sur les projets de réhabilitation.
import React, { useState } from "react";
import { Hammer, ArrowUp, ArrowDown, CheckCircle2, XCircle, Users, TrendingUp } from "lucide-react";
import DecideurLayout, { PageHeader } from "../components/DecideurLayout";
import Badge from "../../gestionnaire/components/Badge";
import Button from "../../gestionnaire/components/Buttons";
import EmptyState from "../../gestionnaire/components/EmptyState";
import { useAsyncData } from "../../gestionnaire/hooks/useAsyncData";
import { decideurService } from "../services/decideurService";
import { STATUTS_PROJET, TERRITOIRES, getConstant } from "../constants";
import { formatMontant, formatNombre } from "../../gestionnaire/utils/format";

const labelTerritoire = (v) => TERRITOIRES.find((t) => t.value === v)?.label || v;
const IMPACT_COULEUR = {
  élevé: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  moyen: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  faible: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

const DecideurProjetsPage = () => {
  const [toast, setToast] = useState("");
  const { data, loading, recharger } = useAsyncData(() => decideurService.getProjets(), []);

  const projets = data || [];

  const afficherToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };

  const deplacer = async (projet, direction) => {
    const index = projets.findIndex((p) => p.id_projet === projet.id_projet);
    const voisin = projets[index + direction];
    if (!voisin) return;
    await decideurService.prioriserProjet(projet.id_projet, voisin.rang);
    await decideurService.prioriserProjet(voisin.id_projet, projet.rang);
    recharger();
  };

  const decider = async (projet, statut) => {
    await decideurService.decisionProjet(projet.id_projet, statut);
    afficherToast(`Projet ${projet.id_projet} : ${getConstant(STATUTS_PROJET, statut).label}.`);
    recharger();
  };

  return (
    <DecideurLayout>
      <PageHeader
        title="Projets de réhabilitation"
        description="Ordonner les projets par urgence et impact, puis les prioriser, approuver ou rejeter."
      />

      {toast && (
        <div className="mb-4 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          {toast}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Chargement des projets...</p>
      ) : projets.length === 0 ? (
        <EmptyState icon={Hammer} title="Aucun projet" description="Aucun projet à prioriser." />
      ) : (
        <div className="space-y-3">
          {projets.map((p, idx) => (
            <div
              key={p.id_projet}
              className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <button
                    onClick={() => deplacer(p, -1)}
                    disabled={idx === 0}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 dark:hover:bg-gray-700"
                    aria-label="Monter"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <span className="text-center text-lg font-bold text-gray-400 dark:text-gray-500">
                    {p.rang}
                  </span>
                  <button
                    onClick={() => deplacer(p, 1)}
                    disabled={idx === projets.length - 1}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 dark:hover:bg-gray-700"
                    aria-label="Descendre"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{p.titre}</h3>
                    <Badge config={getConstant(STATUTS_PROJET, p.statut)} />
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        IMPACT_COULEUR[p.impact] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Impact {p.impact}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{p.id_projet} · {p.id_infra}</span>
                    <span>{labelTerritoire(p.territoire)}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {formatNombre(p.beneficiaires)} bénéficiaires
                    </span>
                    <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                      <TrendingUp className="h-3.5 w-3.5" /> {formatMontant(p.cout_estime)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                <Button
                  variant="secondary"
                  onClick={() => decider(p, "priorise")}
                  disabled={p.statut === "priorise"}
                >
                  Prioriser
                </Button>
                <Button variant="secondary" onClick={() => decider(p, "approuve")}>
                  <CheckCircle2 className="h-4 w-4 text-green-600" /> Approuver
                </Button>
                <Button variant="ghost" onClick={() => decider(p, "rejete")}>
                  <XCircle className="h-4 w-4 text-red-500" /> Rejeter
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DecideurLayout>
  );
};

export default DecideurProjetsPage;
