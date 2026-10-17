// Page d'import de données d'infrastructures (Shapefile, GeoJSON, CSV).
import React from "react";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import GestionnaireLayout, { PageHeader } from "../components/GestionnaireLayout";
import ImportWizard from "../components/ImportWizard";
import { RESTRICTIONS_GESTIONNAIRE } from "../constants";

const ImportPage = () => (
  <GestionnaireLayout>
    <PageHeader
      title="Import de données SIG"
      description="Importer des infrastructures depuis un fichier Shapefile, GeoJSON ou CSV."
    />

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
        <ImportWizard
          onImported={() => {
            /* l'utilisateur peut consulter la liste mise à jour */
          }}
        />

        <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-700">
          <Link
            to="/gestionnaire/infrastructures"
            className="text-sm font-medium text-green-600 hover:underline dark:text-green-400"
          >
            Voir les infrastructures importées →
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex items-center gap-2">
          <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Formats acceptés</h2>
        </div>
        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <li>
            <strong className="text-gray-800 dark:text-gray-200">GeoJSON</strong> : un FeatureCollection
            (points, lignes ou polygones). Les propriétés <code>nom</code>, <code>type</code>,{" "}
            <code>etat</code> sont reconnues.
          </li>
          <li>
            <strong className="text-gray-800 dark:text-gray-200">CSV</strong> : colonnes{" "}
            <code>nom;type;etat;commune;latitude;longitude</code>.
          </li>
          <li>
            <strong className="text-gray-800 dark:text-gray-200">Shapefile</strong> : archive{" "}
            <code>.zip</code> contenant <code>.shp/.dbf/.shx</code> (traitement serveur SIG requis).
          </li>
        </ul>

        <div className="mt-5 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          <p className="mb-1 font-semibold">Limites du rôle Gestionnaire</p>
          <ul className="list-disc space-y-1 pl-4">
            {RESTRICTIONS_GESTIONNAIRE.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </GestionnaireLayout>
);

export default ImportPage;
