// Rapports exportables et partage de vues.
import React, { useState } from "react";
import { Share2, FileText, Download, Link2, Copy, Calendar, Coins } from "lucide-react";
import DecideurLayout, { PageHeader } from "../components/DecideurLayout";
import Badge from "../../gestionnaire/components/Badge";
import Button from "../../gestionnaire/components/Buttons";
import EmptyState from "../../gestionnaire/components/EmptyState";
import { BarChart } from "../components/Charts";
import { useAsyncData } from "../../gestionnaire/hooks/useAsyncData";
import { decideurService } from "../services/decideurService";
import { TERRITOIRES } from "../constants";
import { formatDate, formatMontant } from "../../gestionnaire/utils/format";
import { exporterCSV, exporterPDF, copierLien } from "../utils/export";

const labelTerritoire = (v) => TERRITOIRES.find((t) => t.value === v)?.label || v;

const DecideurRapportsPage = () => {
  const [toast, setToast] = useState("");
  const [enCours, setEnCours] = useState(false);

  const { data, loading } = useAsyncData(async () => {
    const [bord, couts, partages] = await Promise.all([
      decideurService.construireTableauBord(),
      decideurService.getCoutsEstimes(),
      decideurService.getPartages(),
    ]);
    return { bord, couts, partages };
  }, []);

  const bord = data?.bord;
  const couts = data?.couts;
  const partages = data?.partages || [];

  const afficherToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 3500);
  };

  const colonnesComparaison = [
    "Territoire",
    "Infrastructures",
    "Critiques",
    "Signalements",
    "Interventions",
    "Coût estimé",
    "Score moyen",
  ];
  const lignesComparaison = (bord?.comparaison || []).map((c) => [
    labelTerritoire(c.territoire),
    c.totalInfrastructures,
    c.critiques,
    c.signalements,
    c.interventions,
    c.coutEstime,
    c.scoreMoyenPriorite,
  ]);

  const lignesKPI = bord
    ? [
        ["Infrastructures totales", bord.kpi.totalInfrastructures],
        ["Infrastructures critiques", bord.kpi.infrastructuresCritiques],
        ["Taux de criticité (%)", bord.kpi.tauxCritique],
        ["Signalements ouverts", bord.kpi.signalementsOuverts],
        ["Taux de résolution (%)", bord.kpi.tauxResolution],
        ["Interventions en cours", bord.kpi.interventionsEnCours],
        ["Plans en attente", bord.kpi.plansEnAttente],
        ["Projets priorisés", bord.kpi.projetsPriorises],
        ["Budget enveloppe (Ar)", bord.kpi.budgetEnveloppe],
        ["Budget engagé (Ar)", bord.kpi.budgetEngage],
        ["Taux d'engagement (%)", bord.kpi.tauxEngagement],
      ]
    : [];

  const rapportBordCSV = () => {
    exporterCSV("rapport_tableau_bord", ["Indicateur", "Valeur"], lignesKPI);
    afficherToast("Rapport tableau de bord (CSV) généré.");
  };
  const rapportBordPDF = () => {
    exporterPDF("rapport_tableau_bord", "Rapport — Tableau de bord Décideur", ["Indicateur", "Valeur"], lignesKPI, {
      sousTitre: "Synthèse globale",
    });
    afficherToast("Rapport tableau de bord (PDF) généré.");
  };
  const comparaisonCSV = () => {
    exporterCSV("rapport_comparaison_territoires", colonnesComparaison, lignesComparaison);
    afficherToast("Comparaison des territoires (CSV) générée.");
  };
  const comparaisonPDF = () => {
    exporterPDF(
      "rapport_comparaison_territoires",
      "Rapport — Comparaison des territoires",
      colonnesComparaison,
      lignesComparaison,
      { sousTitre: "MATAC · Décideur" }
    );
    afficherToast("Comparaison des territoires (PDF) générée.");
  };

  const partagerRapport = async () => {
    setEnCours(true);
    try {
      const res = await decideurService.creerPartage("rapport", "Rapport de synthèse — tableau de bord");
      const ok = await copierLien(res.lien);
      afficherToast(ok ? `Lien copié : ${res.lien}` : `Lien : ${res.lien}`);
    } finally {
      setEnCours(false);
    }
  };

  const copierPartage = async (lien) => {
    const ok = await copierLien(lien);
    afficherToast(ok ? "Lien copié dans le presse-papiers." : `Lien : ${lien}`);
  };

  const donneesCouts = couts
    ? Object.entries(couts.parStatut).map(([statut, v]) => ({
        label: statut,
        value: v.prevu,
      }))
    : [];

  return (
    <DecideurLayout>
      <PageHeader
        title="Rapports & partage"
        description="Générer des rapports PDF/Excel de synthèse et partager une vue via un lien."
        actions={
          <Button onClick={partagerRapport} disabled={enCours}>
            <Share2 className="h-4 w-4" /> {enCours ? "Génération..." : "Partager un rapport"}
          </Button>
        }
      />

      {toast && (
        <div className="mb-4 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          {toast}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Préparation des rapports...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Rapport — Tableau de bord
                </h2>
              </div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Synthèse des indicateurs clés de décision.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={rapportBordCSV}>
                  <Download className="h-4 w-4" /> Excel (CSV)
                </Button>
                <Button variant="secondary" onClick={rapportBordPDF}>
                  <FileText className="h-4 w-4" /> PDF
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Rapport — Comparaison des territoires
                </h2>
              </div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Indicateurs comparés par territoire.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={comparaisonCSV}>
                  <Download className="h-4 w-4" /> Excel (CSV)
                </Button>
                <Button variant="secondary" onClick={comparaisonPDF}>
                  <FileText className="h-4 w-4" /> PDF
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-2">
              <Coins className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Coûts estimés des interventions
              </h2>
            </div>
            {couts && (
              <>
                <div className="mb-4 flex flex-wrap gap-6 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Total prévu :{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatMontant(couts.totalPrevu)}
                    </span>
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    Total réel :{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatMontant(couts.totalReel)}
                    </span>
                  </span>
                </div>
                <BarChart data={donneesCouts} height={180} />
              </>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 dark:border-gray-700">
              <Link2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Partages actifs</h2>
            </div>
            {partages.length === 0 ? (
              <EmptyState
                icon={Share2}
                title="Aucun partage"
                description="Créez un partage pour diffuser une vue ou un rapport."
              />
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {partages.map((p) => (
                  <li key={p.id_partage} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          config={{
                            label: p.type,
                            color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
                          }}
                        />
                        <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {p.reference}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <Calendar className="h-3.5 w-3.5" /> Expire le {formatDate(p.expire_le)}
                      </p>
                    </div>
                    <Button variant="ghost" onClick={() => copierPartage(p.lien)}>
                      <Copy className="h-4 w-4" /> Copier le lien
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </DecideurLayout>
  );
};

export default DecideurRapportsPage;
