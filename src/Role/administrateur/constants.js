// Constantes pour le module Administrateur
export const ADMIN_NAV_ITEMS = [
  { label: "Tableau de bord", path: "/admin/dashboard", icon: "Home" },
  { label: "Comptes utilisateurs", path: "/admin/comptes", icon: "Users" },
  { label: "Rôles & Permissions", path: "/admin/roles", icon: "Shield" },
  { label: "Journaux & Connexions", path: "/admin/journaux", icon: "FileText" },
  { label: "Référentiels", path: "/admin/referentiels", icon: "Database" },
  { label: "Seuils & Notifications", path: "/admin/alertes-config", icon: "Bell" },
  { label: "Scoring priorité", path: "/admin/scoring", icon: "BarChart3" },
  { label: "Données géospatiales", path: "/admin/geospatial", icon: "Map" },
  { label: "Cartographie", path: "/admin/cartographie", icon: "Layers" },
  { label: "Supervision microservices", path: "/admin/supervision", icon: "Server" },
  { label: "Logs & Erreurs", path: "/admin/logs", icon: "Activity" },
  { label: "Sauvegardes & Mises à jour", path: "/admin/backup", icon: "HardDrive" },
  { label: "Accès global / Données", path: "/admin/donnees", icon: "Globe" },
];

export const ADMIN_MICROSERVICES = ["auth", "citoyen", "notification", "territoire", "infrastructure", "geospatial", "analytics"];
