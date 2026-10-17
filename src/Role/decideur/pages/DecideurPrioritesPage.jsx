// Classement des infrastructures selon le score de priorité de décision.
import React, { useMemo, useState } from "react";
import { ListOrdered, Download, FileText, Info } from "lucide-react";
import DecideurLayout, { PageHeader } from "../components/DecideurLayout";
import Badge from "../../gestionnaire/components/Badge";
import Button from "../../gestionnaire/components/Buttons";
import Modal from "../../gestionnaire/components/Modal";
import EmptyState from "../../gestionnaire/components/EmptyState";
import { useAsyncData } from "../../gestionnaire/hooks/useAsyncData";
import { decideurService } from "../services/decideurService";
import { NIVEAUX_PRIORITE, TERRITOIRES, getConstant } from "../constants";
import { ETATS_INFRASTRUCTURE } from "../../gestionnaire/constants";
import { labelForType } from "../../gestionnaire/constants";
import { formatMontant } from "../../gestionnaire/utils/format";
import { exporterCSV, exporterPDF } from "../utils/export";

const labelTerritoire = (v) => TERRITOIRES.find((t) => t.value === v)?.label || v;

const DecideurPrioritesPage = () => {
  const [filtreTerritoire, setFiltreTerritoire] = useState("");
  const [filtreNiveau, setFiltreNiveau] = useState("");
  const [detail, setDetail] = useState(null);
  const [toast, setToast] = useState("");

  const { data, loading } = useAsyncData(
    () => decideurService.getClassementPriorite(filtreTerritoire ? { territoire: filtreTerritoire } : {}),
    [filtreTerritoire]
  );

  const classement = useMemo(() => {
    const liste = data || [];
    return filtreNiveau ? liste.filter((i) => String(i.niveau) === filtreNiveau) : liste;
  }, [data, filtreNiveau]);

  const afficherToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };

  const colonnes = ["Rang", "ID", "Nom", "Type", "Territoire", "État", "Score", "Niveau", "Coût estimé"];
  const lignes = classement.map((i, idx) => [
    idx + 1,
    i.id_infra,
    i.nom,
    labelForType(i.type),
    labelTerritoire(i.perimetre),
    getConstant(ETATS_INFRASTRUCTURE, i.etat).label,
    i.score,
    getConstant(NIVEAUX_PRIORITE, i.niveau).label,
    i.cout_estime,
  ]);

  const exportCSV = () => {
    exporterCSV("classement_priorites", colonnes, lignes);
    afficherToast("Export CSV généré.");
  };
  const exportPDF = () => {
    exporterPDF("classement_priorites", "Classement des priorités", colonnes, lignes, {
      sousTitre: "MATAC · Décideur",
    });
    afficherToast("Export PDF généré.");
  };

  return (
    <DecideurLayout>
      <PageHeader
        title="Priorités"
        description="Classement des infrastructures selon un score de priorité (état, urgence, coût, ancienneté)."
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

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Territoire
          <select
            value={filtreTerritoire}
            onChange={(e) => setFiltreTerritoire(e.target.value)}
            className="mt-1 block w-56 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Tous</option>
            {TERRITOIRES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Niveau
          <select
            value={filtreNiveau}
            onChange={(e) => setFiltreNiveau(e.target.value)}
            className="mt-1 block w-56 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Tous</option>
            {Object.values(NIVEAUX_PRIORITE).map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
        </label>

        <span className="ml-auto flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Info className="h-4 w-4" /> Cliquez sur une ligne pour le détail du score.
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Calcul du classement...</p>
      ) : classement.length === 0 ? (
        <EmptyState
          icon={ListOrdered}
          title="Aucune infrastructure"
          description="Aucune infrastructure ne correspond aux filtres sélectionnés."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  {["Rang", "Infrastructure", "Territoire", "État", "Score", "Niveau", "Coût estimé"].map(
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
                {classement.map((i, idx) => (
                  <tr
                    key={i.id_infra}
                    onClick={() => setDetail(i)}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40"
                  >
                    <td className="px-4 py-3 text-sm font-bold text-gray-400 dark:text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{i.nom}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {i.id_infra} · {labelForType(i.type)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {labelTerritoire(i.perimetre)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge config={getConstant(ETATS_INFRASTRUCTURE, i.etat)} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{i.score}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge config={getConstant(NIVEAUX_PRIORITE, i.niveau)} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatMontant(i.cout_estime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail ? `Détail du score · ${detail.nom}` : ""}
        size="sm"
      >
        {detail && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Score total</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {detail.score} / 100
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Niveau</span>
              <Badge config={getConstant(NIVEAUX_PRIORITE, detail.niveau)} />
            </div>
            <div className="border-t border-gray-100 pt-3 dark:border-gray-700">
              <p className="mb-2 font-medium text-gray-800 dark:text-gray-200">Contribution des critères</p>
              <ul className="space-y-2">
                {Object.entries(detail.detail || {}).map(([cle, val]) => (
                  <li key={cle} className="flex items-center justify-between">
                    <span className="capitalize text-gray-600 dark:text-gray-400">{cle}</span>
                    <span className="font-medium text-gray-900 dark:text-white">+{val}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              État {getConstant(ETATS_INFRASTRUCTURE, detail.etat).label} · Priorité proposée{" "}
              {detail.priorite || "—"} · Construit en {detail.annee_construction || "—"}
            </p>
          </div>
        )}
      </Modal>
    </DecideurLayout>
  );
};

export default DecideurPrioritesPage;
