// Présentation du rôle Décideur : fonctionnalités autorisées et limites.
import React from "react";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import DecideurLayout, { PageHeader } from "../components/DecideurLayout";
import { FONCTIONNALITES_DECIDEUR, RESTRICTIONS_DECIDEUR, ROLE_DECIDEUR } from "../constants";

const RoleDecideurPage = () => (
  <DecideurLayout>
    <PageHeader
      title="Cadre du rôle Décideur"
      description="Le décideur est l'acteur de pilotage : responsable municipal, directeur technique ou élu chargé d'arbitrer les priorités et les budgets."
    />

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Fonctionnalités autorisées</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {FONCTIONNALITES_DECIDEUR.map((groupe) => (
            <div key={groupe.theme}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                {groupe.theme}
              </h3>
              <ul className="space-y-2">
                {groupe.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Ce qu'il ne fait pas</h2>
        </div>
        <ul className="space-y-3">
          {RESTRICTIONS_DECIDEUR.map((r) => (
            <li key={r} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          Identifiant de rôle : <span className="font-mono">{ROLE_DECIDEUR.slug}</span> · Application{" "}
          {ROLE_DECIDEUR.applicationId}.
        </p>
      </div>
    </div>
  </DecideurLayout>
);

export default RoleDecideurPage;
