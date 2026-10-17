// Données fictives du module Décideur.
// Les infrastructures, signalements et interventions proviennent du module
// Gestionnaire afin de garder une scène cohérente. On ajoute ici les objets
// propres à la décision : plans d'intervention, projets, budgets.

import {
  initialInfrastructures,
  initialSignalements,
  initialInterventions,
} from "../../gestionnaire/data/mockData";

export { initialInfrastructures, initialSignalements, initialInterventions };

const jours = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

// Plans d'intervention soumis à validation (par le gestionnaire)
export const initialPlans = [
  {
    id_plan: "PLN-0001",
    titre: "Plan de réhabilitation du pont de Tanambao",
    id_infra: "INF-0002",
    territoire: "antananarivo-1",
    soumis_par: "agent-gestionnaire",
    priorite_proposee: "urgente",
    cout_estime: 980000000,
    duree_mois: 9,
    description: "Renforcement structurel complet des poutres et tablier.",
    statut: "en_attente_validation",
    motif_decision: null,
    date_soumission: jours(4),
    updated_at: jours(4),
  },
  {
    id_plan: "PLN-0002",
    titre: "Réfection de la RN7 PK12",
    id_infra: "INF-0001",
    territoire: "antananarivo-1",
    soumis_par: "agent-gestionnaire",
    priorite_proposee: "haute",
    cout_estime: 250000000,
    duree_mois: 4,
    description: "Reprise complète de la couche de roulement sur 3,4 km.",
    statut: "en_attente_validation",
    motif_decision: null,
    date_soumission: jours(6),
    updated_at: jours(6),
  },
  {
    id_plan: "PLN-0003",
    titre: "Curage et réhabilitation du canal d'Isotry",
    id_infra: "INF-0005",
    territoire: "antananarivo-2",
    soumis_par: "agent-gestionnaire",
    priorite_proposee: "urgente",
    cout_estime: 320000000,
    duree_mois: 6,
    description: "Curage, reprise des berges et pose de grilles.",
    statut: "en_attente_validation",
    motif_decision: null,
    date_soumission: jours(2),
    updated_at: jours(2),
  },
  {
    id_plan: "PLN-0004",
    titre: "Maintenance préventive éclairage Avenue",
    id_infra: "INF-0004",
    territoire: "antananarivo-1",
    soumis_par: "agent-gestionnaire",
    priorite_proposee: "basse",
    cout_estime: 45000000,
    duree_mois: 1,
    description: "Remplacement préventif de 40 luminaires.",
    statut: "rejete",
    motif_decision: "Budget déjà consommé sur l'exercice en cours ; à reporter.",
    date_soumission: jours(40),
    updated_at: jours(30),
  },
];

// Projets de réhabilitation (classement à prioriser)
export const initialProjets = [
  {
    id_projet: "PRJ-0001",
    titre: "Reconstruction du pont de Tanambao",
    id_infra: "INF-0002",
    territoire: "antananarivo-1",
    cout_estime: 980000000,
    beneficiaires: 45000,
    impact: "élevé",
    rang: 1,
    statut: "priorise",
    updated_at: jours(3),
  },
  {
    id_projet: "PRJ-0002",
    titre: "Réseau d'assainissement Isotry",
    id_infra: "INF-0005",
    territoire: "antananarivo-2",
    cout_estime: 320000000,
    beneficiaires: 22000,
    impact: "élevé",
    rang: 2,
    statut: "priorise",
    updated_at: jours(2),
  },
  {
    id_projet: "PRJ-0003",
    titre: "Réhabilitation RN7 PK12",
    id_infra: "INF-0001",
    territoire: "antananarivo-1",
    cout_estime: 250000000,
    beneficiaires: 60000,
    impact: "moyen",
    rang: 3,
    statut: "propose",
    updated_at: jours(5),
  },
  {
    id_projet: "PRJ-0004",
    titre: "Extension centre de santé Anosy",
    id_infra: "INF-0008",
    territoire: "antananarivo-3",
    cout_estime: 540000000,
    beneficiaires: 30000,
    impact: "élevé",
    rang: 4,
    statut: "programme",
    updated_at: jours(7),
  },
  {
    id_projet: "PRJ-0005",
    titre: "Réhabilitation réseau d'eau Ambohipo",
    id_infra: "INF-0003",
    territoire: "antananarivo-2",
    cout_estime: 180000000,
    beneficiaires: 15000,
    impact: "moyen",
    rang: 5,
    statut: "propose",
    updated_at: jours(9),
  },
];

// Programmations budgétaires
export const initialBudgets = [
  {
    id_budget: "BGT-0001",
    exercice: 2026,
    libelle: "Programme d'investissement infrastructures 2026",
    enveloppe_totale: 3000000000,
    engage: 2450000000,
    repartition: {
      "antananarivo-1": 1400000000,
      "antananarivo-2": 800000000,
      "antananarivo-3": 250000000,
    },
    statut: "soumis",
    soumis_par: "direction-technique",
    motif_decision: null,
    updated_at: jours(5),
  },
  {
    id_budget: "BGT-0002",
    exercice: 2026,
    libelle: "Fonds d'urgence infrastructures critiques",
    enveloppe_totale: 800000000,
    engage: 0,
    repartition: {
      "antananarivo-1": 500000000,
      "antananarivo-2": 300000000,
      "antananarivo-3": 0,
    },
    statut: "brouillon",
    soumis_par: "direction-technique",
    motif_decision: null,
    updated_at: jours(1),
  },
  {
    id_budget: "BGT-0003",
    exercice: 2025,
    libelle: "Programme d'investissement 2025 (clôturé)",
    enveloppe_totale: 2500000000,
    engage: 2500000000,
    repartition: {
      "antananarivo-1": 1200000000,
      "antananarivo-2": 900000000,
      "antananarivo-3": 400000000,
    },
    statut: "valide",
    soumis_par: "direction-technique",
    motif_decision: null,
    updated_at: jours(300),
  },
];

// Journal des partages (vues cartographiques / rapports)
export const initialPartages = [
  {
    id_partage: "PRT-0001",
    type: "rapport",
    reference: "Rapport technique du parc - janvier 2026",
    lien: "#/partage/PRT-0001",
    expire_le: jours(-30),
    created_at: jours(2),
  },
];
