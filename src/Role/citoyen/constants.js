// Constantes du module Citoyen
// Acteur : habitant, usager ou résident du territoire. Il utilise la plateforme
// pour signaler un problème urbain, suivre son traitement et consulter les
// informations publiques relatives aux infrastructures.

export const ROLE_CITOYEN = {
  slug: "citoyen",
  label: "Citoyen",
  applicationId: 16,
};

// Niveau d'urgence déclaré par le citoyen lors du signalement.
export const NIVEAUX_URGENCE = {
  basse: {
    value: "basse",
    label: "Basse",
    color:
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  },
  moyenne: {
    value: "moyenne",
    label: "Moyenne",
    color:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  },
  haute: {
    value: "haute",
    label: "Haute",
    color:
      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800",
  },
  urgente: {
    value: "urgente",
    label: "Urgente",
    color:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  },
};

// Catégories de problèmes urbains : orientent le signalement vers le service compétent.
export const CATEGORIES_SIGNALEMENT = {
  voirie: {
    value: "voirie",
    label: "Route dégradée / Voirie",
    service: "Service Voirie",
    color:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  },
  eclairage: {
    value: "eclairage",
    label: "Lampadaire hors service",
    service: "Service Éclairage public",
    color:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800",
  },
  eau: {
    value: "eau",
    label: "Fuite d'eau / Réseau d'eau",
    service: "Service Eau potable",
    color:
      "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800",
  },
  dechets: {
    value: "dechets",
    label: "Poubelle débordante / Déchets",
    service: "Service Propreté",
    color:
      "bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/40 dark:text-lime-300 dark:border-lime-800",
  },
  mobilier: {
    value: "mobilier",
    label: "Mobilier urbain endommagé",
    service: "Service Mobilier urbain",
    color:
      "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800",
  },
  assainissement: {
    value: "assainissement",
    label: "Canal / Assainissement bouché",
    service: "Service Assainissement",
    color:
      "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-800",
  },
  espace_vert: {
    value: "espace_vert",
    label: "Espace vert / Arbre dangereux",
    service: "Service Espaces verts",
    color:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
  },
  autre: {
    value: "autre",
    label: "Autre problème urbain",
    service: "Service central",
    color:
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  },
};

// Statut du signalement côté citoyen.
// Cycle : nouveau -> pris en charge -> en cours -> résolu / rejeté.
export const STATUTS_SIGNALEMENT = {
  nouveau: {
    value: "nouveau",
    label: "Nouveau",
    color:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  },
  pris_en_charge: {
    value: "pris_en_charge",
    label: "Pris en charge",
    color:
      "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800",
  },
  en_cours: {
    value: "en_cours",
    label: "En cours de traitement",
    color:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800",
  },
  resolu: {
    value: "resolu",
    label: "Résolu",
    color:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
  },
  rejete: {
    value: "rejete",
    label: "Rejeté",
    color:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  },
};

// Un signalement n'est modifiable / annulable que tant qu'il n'est pas pris en charge.
export const STATUTS_MODIFIABLES = ["nouveau"];

// Quartiers disponibles pour le filtrage et la saisie.
export const QUARTIERS = [
  { value: "analakely", label: "Analakely" },
  { value: "tanambao", label: "Tanambao" },
  { value: "ambohipo", label: "Ambohipo" },
  { value: "isotry", label: "Isotry" },
  { value: "anosy", label: "Anosy" },
  { value: "ambatonakanga", label: "Ambatonakanga" },
  { value: "andoharanofotsy", label: "Andoharanofotsy" },
];

// Fonctionnalités autorisées (affichage pédagogique).
export const FONCTIONNALITES_CITOYEN = [
  {
    theme: "Compte",
    items: [
      "Créer un compte, se connecter et gérer son profil.",
    ],
  },
  {
    theme: "Signalements",
    items: [
      "Signaler un problème urbain et choisir sa catégorie.",
      "Ajouter un titre, une description et un niveau d'urgence.",
      "Prendre ou téléverser une photo pour documenter le problème.",
      "Géolocaliser automatiquement le signalement grâce au GPS.",
      "Déplacer manuellement le point sur la carte si besoin.",
      "Envoyer le signalement et recevoir un identifiant unique de suivi.",
      "Consulter et suivre ses signalements et leur historique.",
      "Modifier ou annuler un signalement tant qu'il n'est pas pris en charge.",
      "Ajouter un commentaire ou une information complémentaire.",
    ],
  },
  {
    theme: "Participation",
    items: [
      "Confirmer un signalement existant afin d'indiquer qu'il a été constaté.",
      "Évaluer la résolution d'un signalement.",
    ],
  },
  {
    theme: "Transparence",
    items: [
      "Consulter une carte publique des problèmes signalés.",
      "Filtrer les signalements publics par catégorie, statut, quartier ou période.",
      "Consulter les informations générales des infrastructures publiques.",
      "Consulter les interventions déjà réalisées.",
    ],
  },
];

// État d'une infrastructure publique (consultation citoyenne).
export const ETATS_INFRASTRUCTURE = {
  bon: {
    value: "bon",
    label: "Bon",
    color:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
  },
  moyen: {
    value: "moyen",
    label: "Moyen",
    color:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800",
  },
  degrade: {
    value: "degrade",
    label: "Dégradé",
    color:
      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800",
  },
  critique: {
    value: "critique",
    label: "Critique",
    color:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  },
};

// Types d'infrastructures publiques.
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
];

export const getConstant = (dict, key, fallbackLabel = "—") =>
  dict?.[key] || {
    value: key,
    label: fallbackLabel,
    color:
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  };

export const labelForCategorie = (value) =>
  CATEGORIES_SIGNALEMENT[value]?.label || value || "—";
