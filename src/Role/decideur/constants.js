// Constantes du module Décideur.
// Le décideur (responsable municipal, directeur technique ou élu) pilote :
// comprendre la situation, comparer les territoires et choisir les priorités.

export const ROLE_DECIDEUR = {
  slug: "decideur",
  label: "Décideur",
  applicationId: 15,
};

// Statut d'un plan d'intervention soumis par le gestionnaire
export const STATUTS_PLAN = {
  en_attente_validation: {
    value: "en_attente_validation",
    label: "En attente de validation",
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  },
  valide: {
    value: "valide",
    label: "Validé",
    color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
  },
  rejete: {
    value: "rejete",
    label: "Rejeté",
    color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  },
  reporte: {
    value: "reporte",
    label: "Reporté",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800",
  },
};

// Statut d'un projet de réhabilitation
export const STATUTS_PROJET = {
  propose: {
    value: "propose",
    label: "Proposé",
    color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  },
  priorise: {
    value: "priorise",
    label: "Priorisé",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800",
  },
  programme: {
    value: "programme",
    label: "Programmé",
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  },
  approuve: {
    value: "approuve",
    label: "Approuvé",
    color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
  },
  rejete: {
    value: "rejete",
    label: "Rejeté",
    color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  },
};

// Statut d'une programmation budgétaire
export const STATUTS_BUDGET = {
  brouillon: {
    value: "brouillon",
    label: "Brouillon",
    color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  },
  soumis: {
    value: "soumis",
    label: "Soumis",
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  },
  valide: {
    value: "valide",
    label: "Validé",
    color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
  },
  rejete: {
    value: "rejete",
    label: "Rejeté",
    color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  },
};

// Niveaux de décision de priorité
export const NIVEAUX_PRIORITE = {
  1: { value: 1, label: "Critique", color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800" },
  2: { value: 2, label: "Élevé", color: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800" },
  3: { value: 3, label: "Moyen", color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800" },
  4: { value: 4, label: "Faible", color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800" },
};

// Territoires de comparaison (arrondissements d'Antananarivo)
export const TERRITOIRES = [
  { value: "antananarivo-1", label: "Antananarivo 1er" },
  { value: "antananarivo-2", label: "Antananarivo 2e" },
  { value: "antananarivo-3", label: "Antananarivo 3e" },
];

// Sévérité d'une alerte
export const NIVEAUX_ALERTE = {
  critique: {
    value: "critique",
    label: "Critique",
    color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  },
  haute: {
    value: "haute",
    label: "Haute",
    color: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800",
  },
  info: {
    value: "info",
    label: "Info",
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  },
};

export const FONCTIONNALITES_DECIDEUR = [
  {
    theme: "Pilotage",
    items: [
      "Consulter le tableau de bord global et les KPI.",
      "Visualiser la carte des infrastructures par état, type et territoire.",
      "Filtrer par quartier, commune, type, état ou période.",
      "Consulter les infrastructures critiques et les zones prioritaires.",
      "Comparer les indicateurs entre territoires.",
      "Consulter le classement des infrastructures selon le score de priorité.",
    ],
  },
  {
    theme: "Décision",
    items: [
      "Valider, rejeter ou reporter un plan d'intervention.",
      "Prioriser les projets de réhabilitation.",
      "Valider un budget ou une programmation budgétaire.",
    ],
  },
  {
    theme: "Suivi & diffusion",
    items: [
      "Consulter les signalements citoyens et leur évolution.",
      "Consulter les coûts estimés des interventions.",
      "Recevoir les alertes sur les infrastructures critiques.",
      "Exporter les rapports et tableaux de bord en PDF ou Excel.",
      "Partager une vue cartographique ou un rapport.",
    ],
  },
];

// Actions non autorisées au décideur (affichage pédagogique)
export const RESTRICTIONS_DECIDEUR = [
  "Il ne saisit pas directement les infrastructures ni ne modifie leur état technique.",
  "Il ne traite pas les signalements citoyens au quotidien.",
  "Il n'affecte pas les interventions aux équipes.",
  "Il ne crée pas d'utilisateurs ni ne modifie les rôles.",
];

export const getConstant = (dict, key, fallbackLabel = "—") =>
  dict?.[key] || {
    value: key,
    label: fallbackLabel,
    color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  };
