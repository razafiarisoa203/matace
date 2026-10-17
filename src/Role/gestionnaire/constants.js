// Constantes du module Gestionnaire
// Acteur opérationnel : responsable de service technique, chef de quartier,
// gestionnaire de réseau ou agent chargé du suivi des infrastructures.

export const ROLE_GESTIONNAIRE = {
  slug: "gestionnaire",
  label: "Gestionnaire",
  applicationId: 15,
};

// Etat d'une infrastructure après inspection
export const ETATS_INFRASTRUCTURE = {
  bon: {
    value: "bon",
    label: "Bon",
    color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
  },
  moyen: {
    value: "moyen",
    label: "Moyen",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800",
  },
  degrade: {
    value: "degrade",
    label: "Dégradé",
    color: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800",
  },
  critique: {
    value: "critique",
    label: "Critique",
    color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  },
};

// Statut d'un signalement citoyen
export const STATUTS_SIGNALEMENT = {
  nouveau: {
    value: "nouveau",
    label: "Nouveau",
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  },
  en_cours: {
    value: "en_cours",
    label: "En cours",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800",
  },
  resolu: {
    value: "resolu",
    label: "Résolu",
    color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
  },
  rejete: {
    value: "rejete",
    label: "Rejeté",
    color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  },
};

// Statut d'une intervention / maintenance
export const STATUTS_INTERVENTION = {
  planifiee: {
    value: "planifiee",
    label: "Planifiée",
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  },
  affectee: {
    value: "affectee",
    label: "Affectée",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800",
  },
  en_cours: {
    value: "en_cours",
    label: "En cours",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800",
  },
  terminee: {
    value: "terminee",
    label: "Terminée",
    color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
  },
  annulee: {
    value: "annulee",
    label: "Annulée",
    color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  },
};

// Niveau de priorité (le gestionnaire propose, le décideur valide)
export const PRIORITES = {
  basse: {
    value: "basse",
    label: "Basse",
    color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  },
  moyenne: {
    value: "moyenne",
    label: "Moyenne",
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  },
  haute: {
    value: "haute",
    label: "Haute",
    color: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800",
  },
  urgente: {
    value: "urgente",
    label: "Urgente",
    color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  },
};

// Types d'infrastructures
export const TYPES_INFRASTRUCTURE = [
  { value: "route", label: "Route / Voirie" },
  { value: "pont", label: "Pont / Ouvrage d'art" },
  { value: "reseau_eau", label: "Réseau d'eau" },
  { value: "reseau_assainissement", label: "Réseau d'assainissement" },
  { value: "eclairage", label: "Éclairage public" },
  { value: "marché", label: "Marché" },
  { value: "école", label: "École / Établissement" },
  { value: "centre_sante", label: "Centre de santé" },
  { value: "espace_vert", label: "Espace vert" },
  { value: "bâtiment_public", label: "Bâtiment public" },
];

// Statuts d'une infrastructure (cycle de vie administratif)
export const STATUTS_INFRASTRUCTURE = {
  actif: {
    value: "actif",
    label: "Actif",
    color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
  },
  en_travaux: {
    value: "en_travaux",
    label: "En travaux",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800",
  },
  hors_service: {
    value: "hors_service",
    label: "Hors service",
    color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  },
  archive: {
    value: "archive",
    label: "Archivé",
    color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  },
};

export const MODES_IMPORT = [
  { value: "geojson", label: "GeoJSON", accept: ".geojson,.json", hint: "Fichier .geojson / .json" },
  { value: "shapefile", label: "Shapefile", accept: ".zip,.shp", hint: "Archive .zip contenant .shp/.dbf/.shx" },
  { value: "csv", label: "CSV", accept: ".csv", hint: "Colonnes : nom, type, etat, latitude, longitude" },
];

export const EQUIPES = [
  { id: "eq-1", nom: "Équipe Voirie Nord", specialite: "route" },
  { id: "eq-2", nom: "Équipe Réseau Eau", specialite: "reseau_eau" },
  { id: "eq-3", nom: "Équipe Assainissement", specialite: "reseau_assainissement" },
  { id: "eq-4", nom: "Équipe Éclairage", specialite: "eclairage" },
  { id: "eq-5", nom: "Équipe Maintenance Générale", specialite: "generale" },
];

export const AGENTS = [
  { id: "ag-1", nom: "Rakoto Jean", equipe: "eq-1" },
  { id: "ag-2", nom: "Randria Hery", equipe: "eq-1" },
  { id: "ag-3", nom: "Rasoa Nirina", equipe: "eq-2" },
  { id: "ag-4", nom: "Ravelo Mamy", equipe: "eq-3" },
  { id: "ag-5", nom: "Rakotomalala Fara", equipe: "eq-4" },
  { id: "ag-6", nom: "Andria Sitraka", equipe: "eq-5" },
];

export const PERIMETRES = [
  { value: "antananarivo-1", label: "Antananarivo - 1er Arrondissement" },
  { value: "antananarivo-2", label: "Antananarivo - 2e Arrondissement" },
  { value: "antananarivo-3", label: "Antananarivo - 3e Arrondissement" },
];

// Libellés des actions non autorisées au gestionnaire (affichage pédagogique)
export const RESTRICTIONS_GESTIONNAIRE = [
  "Il ne crée pas d'utilisateurs ni ne modifie les rôles.",
  "Il ne modifie pas les règles globales de priorisation ou les seuils d'alerte.",
  "Il ne supprime pas définitivement des données sensibles sans validation.",
];

// Fonctionnalités autorisées, regroupées par thème.
export const FONCTIONNALITES_GESTIONNAIRE = [
  {
    theme: "Infrastructures",
    items: [
      "Créer, modifier et mettre à jour les infrastructures.",
      "Enregistrer la localisation, les caractéristiques et l'état.",
      "Mettre à jour l'état après inspection : bon, moyen, dégradé, critique.",
      "Importer des données : Shapefile, GeoJSON, CSV.",
      "Consulter la carte et les couches liées à son périmètre.",
    ],
  },
  {
    theme: "Signalements",
    items: [
      "Traiter les signalements citoyens.",
      "Rattacher un signalement à une infrastructure.",
      "Changer le statut : nouveau, en cours, résolu, rejeté.",
    ],
  },
  {
    theme: "Interventions",
    items: [
      "Planifier une intervention ou une maintenance.",
      "Affecter une intervention à une équipe ou à un agent.",
      "Enregistrer une intervention réalisée (date, coût, photos, observations).",
      "Mettre à jour le coût et l'avancement des travaux.",
    ],
  },
  {
    theme: "Alertes & rapports",
    items: [
      "Consulter les alertes et notifications.",
      "Signaler une infrastructure critique au décideur.",
      "Générer des rapports techniques et d'intervention.",
      "Exporter les données de son périmètre.",
    ],
  },
];

export const getConstant = (dict, key, fallbackLabel = "—") =>
  dict?.[key] || {
    value: key,
    label: fallbackLabel,
    color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  };

export const labelForType = (value) =>
  TYPES_INFRASTRUCTURE.find((t) => t.value === value)?.label || value || "—";
