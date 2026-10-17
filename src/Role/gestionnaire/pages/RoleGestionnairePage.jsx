// Présentation du rôle Gestionnaire : fonctionnalités autorisées et limites.
import React from "react";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import GestionnaireLayout, { PageHeader } from "../components/GestionnaireLayout";
import { FONCTIONNALITES_GESTIONNAIRE, RESTRICTIONS_GESTIONNAIRE } from "../constants";

const RoleGestionnairePage = () => (
  <GestionnaireLayout>
    <PageHeader
      title="Cadre du rôle Gestionnaire"
      description="Le gestionnaire est l'acteur opérationnel : responsable de service technique, chef de quartier, gestionnaire de réseau ou agent chargé du suivi des infrastructures."
    />

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Fonctionnalités autorisées */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Fonctionnalités autorisées</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {FONCTIONNALITES_GESTIONNAIRE.map((groupe) => (
            <div key={groupe.theme}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
                {groupe.theme}
              </h3>
              <ul className="space-y-2">
                {groupe.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Ce qu'il ne fait pas */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Ce qu'il ne fait pas</h2>
        </div>
        <ul className="space-y-3">
          {RESTRICTIONS_GESTIONNAIRE.map((r) => (
            <li key={r} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          Selon l'organisation, le gestionnaire peut proposer une priorité, mais le décideur la
          valide.
        </p>
      </div>
    </div>
  </GestionnaireLayout>
);

export default RoleGestionnairePage;
