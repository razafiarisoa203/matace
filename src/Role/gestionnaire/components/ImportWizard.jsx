// Assistant d'import de données d'infrastructures : GeoJSON, Shapefile, CSV.
import React, { useState } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import Button from "./Buttons";
import Badge from "./Badge";
import { MODES_IMPORT, getConstant, TYPES_INFRASTRUCTURE, ETATS_INFRASTRUCTURE } from "../constants";
import { gestionnaireService } from "../services/gestionnaireService";

const etapes = ["Fichier", "Aperçu", "Import"];

const ImportWizard = ({ onImported }) => {
  const [etape, setEtape] = useState(0);
  const [mode, setMode] = useState("geojson");
  const [contenuTexte, setContenuTexte] = useState("");
  const [fichier, setFichier] = useState(null);
  const [analyse, setAnalyse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [resultat, setResultat] = useState(null);

  const modeConfig = MODES_IMPORT.find((m) => m.value === mode);

  const reset = () => {
    setEtape(0);
    setContenuTexte("");
    setFichier(null);
    setAnalyse(null);
    setErreur("");
    setResultat(null);
  };

  const handleFichier = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFichier(f);
    setErreur("");
    // Shapefile (binaire) : pas de lecture texte
    if (mode === "shapefile") {
      setContenuTexte("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setContenuTexte(ev.target.result || "");
    reader.readAsText(f);
  };

  const analyser = async () => {
    setErreur("");
    if (mode !== "shapefile" && !contenuTexte) {
      setErreur("Veuillez sélectionner un fichier à analyser.");
      return;
    }
    setLoading(true);
    try {
      const res = await gestionnaireService.parseImport(mode, contenuTexte);
      setAnalyse(res);
      setEtape(1);
    } catch (err) {
      setErreur(err.message || "Erreur d'analyse du fichier.");
    } finally {
      setLoading(false);
    }
  };

  const importer = async () => {
    if (!analyse?.lignes?.length) {
      setErreur("Aucune ligne exploitable à importer.");
      return;
    }
    setLoading(true);
    try {
      const res = await gestionnaireService.importInfrastructures(analyse.lignes);
      setResultat(res);
      setEtape(2);
      if (onImported) onImported(res);
    } catch (err) {
      setErreur(err.message || "Erreur lors de l'import.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Fil d'étapes */}
      <ol className="flex items-center gap-2 text-sm">
        {etapes.map((label, index) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                index <= etape
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {index + 1}
            </span>
            <span
              className={
                index <= etape
                  ? "font-medium text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }
            >
              {label}
            </span>
            {index < etapes.length - 1 && <span className="mx-1 text-gray-300">—</span>}
          </li>
        ))}
      </ol>

      {erreur && (
        <div className="flex items-start gap-2 rounded-lg border-l-4 border-red-500 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{erreur}</span>
        </div>
      )}

      {/* Étape 1 : sélection du fichier */}
      {etape === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {MODES_IMPORT.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => {
                  setMode(m.value);
                  reset();
                }}
                className={`flex flex-col items-start gap-1 rounded-lg border-2 p-4 text-left transition-colors ${
                  mode === m.value
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-200 hover:border-green-300 dark:border-gray-700"
                }`}
              >
                <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-gray-900 dark:text-white">{m.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{m.hint}</span>
              </button>
            ))}
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white px-6 py-10 text-center hover:border-green-400 dark:border-gray-700 dark:bg-gray-800">
            <UploadCloud className="mb-2 h-8 w-8 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {fichier ? fichier.name : "Cliquez pour choisir un fichier"}
            </span>
            <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Formats acceptés : {modeConfig?.accept}
            </span>
            <input
              type="file"
              accept={modeConfig?.accept}
              onChange={handleFichier}
              className="hidden"
            />
          </label>

          <div className="flex justify-end">
            <Button onClick={analyser} disabled={loading || (mode !== "shapefile" && !contenuTexte)}>
              {loading ? "Analyse..." : "Analyser le fichier"}
            </Button>
          </div>
        </div>
      )}

      {/* Étape 2 : aperçu */}
      {etape === 1 && analyse && (
        <div className="space-y-4">
          {analyse.avertissement && (
            <div className="flex items-start gap-2 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{analyse.avertissement}</span>
            </div>
          )}

          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>{analyse.total}</strong> entité(s) détectée(s) dans le fichier {analyse.mode}.
          </p>

          {analyse.lignes.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    {["#", "Nom", "Type", "État", "Commune", "Coordonnées"].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {analyse.lignes.slice(0, 50).map((l) => (
                    <tr key={l._ligne} className="text-gray-700 dark:text-gray-300">
                      <td className="px-3 py-2">{l._ligne}</td>
                      <td className="px-3 py-2">{l.nom}</td>
                      <td className="px-3 py-2">
                        {TYPES_INFRASTRUCTURE.find((t) => t.value === l.type)?.label || l.type}
                      </td>
                      <td className="px-3 py-2">
                        <Badge config={getConstant(ETATS_INFRASTRUCTURE, l.etat)} />
                      </td>
                      <td className="px-3 py-2">{l.commune || "—"}</td>
                      <td className="px-3 py-2">
                        {l.latitude != null && l.longitude != null
                          ? `${l.latitude}, ${l.longitude}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setEtape(0)}>
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <Button onClick={importer} disabled={loading || analyse.total === 0}>
              {loading ? "Import..." : `Importer ${analyse.total} entité(s)`}
            </Button>
          </div>
        </div>
      )}

      {/* Étape 3 : résultat */}
      {etape === 2 && resultat && (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Import terminé
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {resultat.total} infrastructure(s) ont été créées avec succès.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={reset}>
              Nouvel import
            </Button>
          </div>
        </div>
      )}

      {/* Note constante */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Mode courant : {modeConfig?.label}. Les imports Shapefile réels nécessitent un traitement
        côté serveur SIG.
      </p>
    </div>
  );
};

export default ImportWizard;
