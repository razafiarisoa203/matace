// Génération de rapports techniques / d'intervention et export des données.
import React, { useState } from "react";
import { FileBarChart, Download, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { jsPDF } from "jspdf";
import GestionnaireLayout, { PageHeader } from "../components/GestionnaireLayout";
import Button from "../components/Buttons";
import { gestionnaireService } from "../services/gestionnaireService";
import { ETATS_INFRASTRUCTURE, getConstant, labelForType } from "../constants";
import { formatDate, formatDateTime, formatMontant, telechargerContenu } from "../utils/format";

const RapportsPage = () => {
  const [du, setDu] = useState("");
  const [au, setAu] = useState("");
  const [rapport, setRapport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const afficherToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const generer = async (type) => {
    setLoading(true);
    try {
      const res = await gestionnaireService.genererRapport(type, { du, au });
      setRapport(res);
      afficherToast("Rapport généré.");
    } catch (err) {
      afficherToast(err.message || "Erreur.");
    } finally {
      setLoading(false);
    }
  };

  const exporter = async (ressource) => {
    const res = await gestionnaireService.exporter(ressource);
    if (res.nombre === 0) {
      afficherToast("Aucune donnée à exporter.");
      return;
    }
    telechargerContenu(res.contenu, `${ressource}.csv`);
    afficherToast(`${res.nombre} ligne(s) exportée(s) vers ${ressource}.csv.`);
  };

  const exporterPDF = () => {
    if (!rapport) return;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 16;
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(22, 101, 52);
    doc.text(rapport.titre, margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text(`Généré le ${formatDateTime(rapport.genere_le)}`, margin, y);
    y += 6;
    if (rapport.periode?.du || rapport.periode?.au) {
      doc.text(`Période : ${rapport.periode.du || "—"} → ${rapport.periode.au || "—"}`, margin, y);
      y += 6;
    }
    y += 2;

    if (rapport.type === "technique" && rapport.statistiques) {
      const s = rapport.statistiques;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(35, 35, 35);
      doc.setFontSize(11);
      doc.text("Synthèse", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Infrastructures : ${s.totalInfrastructures}`, margin, y);
      y += 5;
      doc.text(`Signalements : ${s.totalSignalements} (nouveaux : ${s.signalementsNouveaux})`, margin, y);
      y += 5;
      doc.text(`Interventions en cours : ${s.interventionsEnCours}`, margin, y);
      y += 5;
      doc.text(`Alertes non lues : ${s.alertesNonLues}`, margin, y);
      y += 5;
      doc.text(`Coût prévu : ${formatMontant(s.coutTotalPrevu)}`, margin, y);
      y += 5;
      doc.text(`Coût réel : ${formatMontant(s.coutTotalReel)}`, margin, y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.text("État du parc", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      Object.entries(ETATS_INFRASTRUCTURE).forEach(([key, cfg]) => {
        doc.text(`${cfg.label} : ${s.parEtat[key] || 0}`, margin, y);
        y += 5;
      });
    }

    if (rapport.lignes?.length) {
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Détail", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      rapport.lignes.forEach((l) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        const texte = l.nom
          ? `${l.id_infra || l.id_inter} — ${l.nom} (${labelForType(l.type)})`
          : `${l.id_inter} — ${l.titre}`;
        doc.text(doc.splitTextToSize(texte, 178), margin, y);
        y += 6;
      });
    }

    doc.save(`${rapport.titre.replace(/\s+/g, "_").toLowerCase()}.pdf`);
    afficherToast("PDF généré.");
  };

  return (
    <GestionnaireLayout>
      <PageHeader
        title="Rapports & export"
        description="Générer des rapports techniques ou d'intervention et exporter les données de votre périmètre."
      />

      {toast && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border-l-4 border-green-500 bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      {/* Paramètres */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-2">
          <FileBarChart className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Rapports</h2>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Du
            <input
              type="date"
              value={du}
              onChange={(e) => setDu(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Au
            <input
              type="date"
              value={au}
              onChange={(e) => setAu(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => generer("technique")} disabled={loading}>
            <FileText className="h-4 w-4" /> Rapport technique
          </Button>
          <Button onClick={() => generer("intervention")} disabled={loading} variant="secondary">
            <FileText className="h-4 w-4" /> Rapport d'intervention
          </Button>
          {rapport && (
            <Button onClick={exporterPDF} variant="secondary">
              <Download className="h-4 w-4" /> Télécharger PDF
            </Button>
          )}
        </div>
      </div>

      {/* Exports */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-2">
          <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Exporter les données</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => exporter("infrastructures")}>
            <Download className="h-4 w-4" /> Infrastructures (CSV)
          </Button>
          <Button variant="secondary" onClick={() => exporter("signalements")}>
            <Download className="h-4 w-4" /> Signalements (CSV)
          </Button>
          <Button variant="secondary" onClick={() => exporter("interventions")}>
            <Download className="h-4 w-4" /> Interventions (CSV)
          </Button>
        </div>
      </div>

      {/* Aperçu du rapport */}
      {rapport && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-1 font-semibold text-gray-900 dark:text-white">{rapport.titre}</h2>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            Généré le {formatDateTime(rapport.genere_le)}
            {rapport.periode?.du || rapport.periode?.au
              ? ` · Période : ${rapport.periode.du || "—"} → ${rapport.periode.au || "—"}`
              : ""}
          </p>

          {rapport.type === "technique" && rapport.statistiques && (
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.entries(ETATS_INFRASTRUCTURE).map(([key, cfg]) => (
                <div
                  key={key}
                  className="rounded-lg border border-gray-100 p-3 text-center dark:border-gray-700"
                >
                  <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {rapport.statistiques.parEtat[key] || 0}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{cfg.label}</div>
                </div>
              ))}
            </div>
          )}

          {rapport.type === "intervention" && rapport.totaux && (
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                <div className="text-xs text-gray-500 dark:text-gray-400">Interventions</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {rapport.totaux.nombre}
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                <div className="text-xs text-gray-500 dark:text-gray-400">Coût prévu</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatMontant(rapport.totaux.cout_prevu)}
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                <div className="text-xs text-gray-500 dark:text-gray-400">Coût réel</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatMontant(rapport.totaux.cout_reel)}
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Référence
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Libellé
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {rapport.lignes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                      Aucune donnée sur la période.
                    </td>
                  </tr>
                ) : (
                  rapport.lignes.slice(0, 100).map((l) => (
                    <tr key={l.id_infra || l.id_inter}>
                      <td className="px-3 py-2 text-gray-900 dark:text-white">
                        {l.id_infra || l.id_inter}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {l.nom || l.titre}
                        <span className="ml-2 text-xs text-gray-400">
                          {l.etat ? getConstant(ETATS_INFRASTRUCTURE, l.etat)?.label : labelForType(l.type)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                        {formatDate(l.updated_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span>
          Les exports concernent uniquement le périmètre du gestionnaire. Les règles globales de
          priorisation et les seuils d'alerte ne peuvent pas être modifiés ici.
        </span>
      </div>
    </GestionnaireLayout>
  );
};

export default RapportsPage;
