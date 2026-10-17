// Comparaison des indicateurs entre territoires.
import React, { useState } from "react";
import { Scale, Download, FileText } from "lucide-react";
import DecideurLayout, { PageHeader } from "../components/DecideurLayout";
import Button from "../../gestionnaire/components/Buttons";
import { BarChart, ProgressBar } from "../components/Charts";
import { useAsyncData } from "../../gestionnaire/hooks/useAsyncData";
import { decideurService } from "../services/decideurService";
import { TERRITOIRES } from "../constants";
import { formatMontant } from "../../gestionnaire/utils/format";
import { exporterCSV, exporterPDF } from "../utils/export";

const labelTerritoire = (v) => TERRITOIRES.find((t) => t.value === v)?.label || v;

const DecideurTerritoiresPage = () => {
  const [toast, setToast] = useState("");
  const { data, loading } = useAsyncData(() => decideurService.getComparaisonTerritoires(), []);
  const comparaison = data || [];

  const colonnes = [
    "Territoire",
    "Infrastructures",
    "Critiques",
    "Signalements",
    "Interventions",
    "Coût estimé",
    "Score moyen",
  ];
  const lignes = comparaison.map((c) => [
    labelTerritoire(c.territoire),
    c.totalInfrastructures,
    c.critiques,
    c.signalements,
    c.interventions,
    c.coutEstime,
    c.scoreMoyenPriorite,
  ]);

  const afficherToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };

  const exportCSV = () => {
    exporterCSV("comparaison_territoires", colonnes, lignes);
    afficherToast("Export CSV généré.");
  };
  const exportPDF = () => {
    exporterPDF("comparaison_territoires", "Comparaison des territoires", colonnes, lignes, {
      sousTitre: "MATAC · Décideur",
    });
    afficherToast("Export PDF généré.");
  };

  const donneesBarres = comparaison.map((c) => ({
    label: labelTerritoire(c.territoire),
    value: c.critiques,
    color: "#dc2626",
  }));

  return (
    <DecideurLayout>
      <PageHeader
        title="Comparer les territoires"
        description="Comparer les indicateurs (infrastructures, criticité, signalements, coûts) entre territoires."
        actions={
          <>
            <Button variant="secondary" onClick={exportCSV}>
              <Download className="h-4 w-4" /> Excel (CSV)
            </Button>
            <Button variant="secondary" onClick={exportPDF}>
              <FileText className="h-4 w-4" /> PDF
            </Button>
          </>
        }
      />

      {toast && (
        <div className="mb-4 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          {toast}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Scale className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Infrastructures critiques par territoire
              </h2>
              <BarChart data={donneesBarres} height={200} />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">
                Score moyen de priorité
              </h2>
              <div className="space-y-4">
                {comparaison.map((c) => (
                  <ProgressBar
                    key={c.territoire}
                    value={c.scoreMoyenPriorite}
                    label={labelTerritoire(c.territoire)}
                    color="#0ea5e9"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    {colonnes.map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {comparaison.map((c) => (
                    <tr key={c.territoire} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {labelTerritoire(c.territoire)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {c.totalInfrastructures}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
                        {c.critiques}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {c.signalements}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {c.interventions}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatMontant(c.coutEstime)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                        {c.scoreMoyenPriorite}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DecideurLayout>
  );
};

export default DecideurTerritoiresPage;
