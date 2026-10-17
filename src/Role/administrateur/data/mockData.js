// Données fictives du module Administrateur.
// Ces données alimentent le service mocké (services/adminService.js).
// Elles seront remplacées par les appels API une fois le backend disponible.

const jours = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

// ------------------------------------------------------------------
// COMPTES UTILISATEURS
// ------------------------------------------------------------------
export const initialUtilisateurs = [
  {
    id: "USR-001",
    nom: "Rakoto Andrianina",
    email: "rakoto.andrianina@exemple.mg",
    telephone: "+261 34 12 345 67",
    role: "administrateur",
    statut: "actif",
    dernier_login: jours(0),
    created_at: jours(720),
  },
  {
    id: "USR-002",
    nom: "Rasoa Hanitra",
    email: "rasoa.hanitra@exemple.mg",
    telephone: "+261 32 98 765 43",
    role: "decideur",
    statut: "actif",
    dernier_login: jours(1),
    created_at: jours(540),
  },
  {
    id: "USR-003",
    nom: "Andry Rakotomalala",
    email: "andry.r@exemple.mg",
    telephone: "+261 33 45 678 90",
    role: "gestionnaire",
    statut: "actif",
    dernier_login: jours(0),
    created_at: jours(300),
  },
  {
    id: "USR-004",
    nom: "Voahangy Ranaivo",
    email: "voahangy.r@exemple.mg",
    telephone: "+261 34 11 22 33",
    role: "gestionnaire",
    statut: "actif",
    dernier_login: jours(3),
    created_at: jours(210),
  },
  {
    id: "USR-005",
    nom: "Hery Manampisoa",
    email: "hery.m@exemple.mg",
    telephone: "+261 32 55 66 77",
    role: "decideur",
    statut: "desactif",
    dernier_login: jours(45),
    created_at: jours(650),
  },
  {
    id: "USR-006",
    nom: "Miora Razafy",
    email: "miora.razafy@exemple.mg",
    telephone: "+261 33 77 88 99",
    role: "gestionnaire",
    statut: "actif",
    dernier_login: jours(6),
    created_at: jours(120),
  },
  {
    id: "USR-007",
    nom: "Jean-Claude Razafinjato",
    email: "jc.razafinjato@exemple.mg",
    telephone: "+261 34 20 20 20",
    role: "administrateur",
    statut: "actif",
    dernier_login: jours(2),
    created_at: jours(400),
  },
  {
    id: "USR-008",
    nom: "Nirina Andriamampianina",
    email: "nirina.a@exemple.mg",
    telephone: "+261 32 31 31 31",
    role: "gestionnaire",
    statut: "desactif",
    dernier_login: jours(90),
    created_at: jours(800),
  },
];

// ------------------------------------------------------------------
// RÔLES & PERMISSIONS
// ------------------------------------------------------------------
export const groupesPermissions = [
  {
    id: "utilisateurs",
    nom: "Utilisateurs & rôles",
    permissions: [
      { id: "users.read", label: "Consulter les comptes" },
      { id: "users.write", label: "Créer / modifier les comptes" },
      { id: "users.delete", label: "Supprimer les comptes" },
      { id: "roles.assign", label: "Attribuer les rôles" },
      { id: "policies.manage", label: "Gérer les politiques d'accès" },
    ],
  },
  {
    id: "referentiels",
    nom: "Référentiels & configuration",
    permissions: [
      { id: "referentiels.manage", label: "Gérer les référentiels" },
      { id: "alertes.manage", label: "Configurer les seuils et notifications" },
      { id: "scoring.manage", label: "Configurer le score de priorité" },
    ],
  },
  {
    id: "geospatial",
    nom: "Géospatial & cartographie",
    permissions: [
      { id: "geo.import", label: "Importer des jeux de données" },
      { id: "geo.export", label: "Exporter des jeux de données" },
      { id: "geo.delete", label: "Supprimer des jeux de données" },
      { id: "layers.manage", label: "Gérer couches, styles et fonds de carte" },
    ],
  },
  {
    id: "systeme",
    nom: "Système & supervision",
    permissions: [
      { id: "system.supervise", label: "Superviser les microservices" },
      { id: "system.logs", label: "Consulter logs et erreurs" },
      { id: "system.backup", label: "Gérer sauvegardes et mises à jour" },
    ],
  },
  {
    id: "donnees",
    nom: "Données & tableaux de bord",
    permissions: [
      { id: "data.read_all", label: "Accéder à toutes les données" },
      { id: "dashboards.read_all", label: "Accéder à tous les tableaux de bord" },
    ],
  },
];

export const PERMISSIONS_GLOBALES = groupesPermissions.flatMap((g) =>
  g.permissions.map((p) => p.id)
);

export const initialRoles = [
  {
    id: "administrateur",
    nom: "Administrateur",
    description: "Responsable technique et fonctionnel. Contrôle tout le paramétrage.",
    permissions: [...PERMISSIONS_GLOBALES],
  },
  {
    id: "decideur",
    nom: "Décideur",
    description: "Valide les décisions d'investissement et arbitre les priorités.",
    permissions: [
      "referentiels.manage",
      "scoring.manage",
      "geo.export",
      "data.read_all",
      "dashboards.read_all",
    ],
  },
  {
    id: "gestionnaire",
    nom: "Gestionnaire",
    description: "Gère les infrastructures, signalements et interventions sur le terrain.",
    permissions: ["referentiels.manage", "geo.import", "geo.export", "dashboards.read_all"],
  },
];

// ------------------------------------------------------------------
// JOURNAUX D'ACTIVITÉ & TENTATIVES DE CONNEXION
// ------------------------------------------------------------------
export const initialJournalActivite = [
  {
    id: "ACT-0001",
    date: jours(0),
    utilisateur: "rakoto.andrianina@exemple.mg",
    action: "Mise à jour de la configuration des notifications",
    cible: "notification/config",
    niveau: "info",
  },
  {
    id: "ACT-0002",
    date: jours(0),
    utilisateur: "andry.r@exemple.mg",
    action: "Import d'un jeu de données géospatial",
    cible: "geospatial/GEO-002",
    niveau: "info",
  },
  {
    id: "ACT-0003",
    date: jours(1),
    utilisateur: "jc.razafinjato@exemple.mg",
    action: "Désactivation du compte USR-008",
    cible: "users/USR-008",
    niveau: "warning",
  },
  {
    id: "ACT-0004",
    date: jours(1),
    utilisateur: "rasoa.hanitra@exemple.mg",
    action: "Consultation du tableau de bord décideur",
    cible: "dashboards/decideur",
    niveau: "info",
  },
  {
    id: "ACT-0005",
    date: jours(2),
    utilisateur: "rakoto.andrianina@exemple.mg",
    action: "Modification des pondérations du score de priorité",
    cible: "scoring",
    niveau: "warning",
  },
  {
    id: "ACT-0006",
    date: jours(3),
    utilisateur: "voahangy.r@exemple.mg",
    action: "Connexion réussie",
    cible: "auth/login",
    niveau: "info",
  },
  {
    id: "ACT-0007",
    date: jours(4),
    utilisateur: "inconnu@exemple.mg",
    action: "Tentative de connexion échouée (mot de passe invalide)",
    cible: "auth/login",
    niveau: "error",
  },
  {
    id: "ACT-0008",
    date: jours(5),
    utilisateur: "rakoto.andrianina@exemple.mg",
    action: "Création d'un compte gestionnaire",
    cible: "users/USR-006",
    niveau: "info",
  },
  {
    id: "ACT-0009",
    date: jours(6),
    utilisateur: "jc.razafinjato@exemple.mg",
    action: "Restauration de la sauvegarde BAK-0002",
    cible: "backups/BAK-0002",
    niveau: "warning",
  },
  {
    id: "ACT-0010",
    date: jours(7),
    utilisateur: "rakoto.andrianina@exemple.mg",
    action: "Suppression de la couche cartographique LYR-006",
    cible: "layers/LYR-006",
    niveau: "warning",
  },
];

export const initialTentativesConnexion = [
  {
    id: "LOG-0001",
    date: jours(0),
    email: "rakoto.andrianina@exemple.mg",
    ip: "196.12.34.21",
    resultat: "succes",
    detail: "Authentification SSO Keycloak",
  },
  {
    id: "LOG-0002",
    date: jours(0),
    email: "andry.r@exemple.mg",
    ip: "41.210.8.114",
    resultat: "succes",
    detail: "Authentification SSO Keycloak",
  },
  {
    id: "LOG-0003",
    date: jours(0),
    email: "inconnu@exemple.mg",
    ip: "102.176.43.9",
    resultat: "echec",
    detail: "Mot de passe invalide (3e tentative)",
  },
  {
    id: "LOG-0004",
    date: jours(1),
    email: "rasoa.hanitra@exemple.mg",
    ip: "196.12.34.55",
    resultat: "succes",
    detail: "Authentification SSO Keycloak",
  },
  {
    id: "LOG-0005",
    date: jours(1),
    email: "hery.m@exemple.mg",
    ip: "41.210.8.201",
    resultat: "echec",
    detail: "Compte désactivé",
  },
  {
    id: "LOG-0006",
    date: jours(2),
    email: "voahangy.r@exemple.mg",
    ip: "197.215.9.33",
    resultat: "succes",
    detail: "Authentification SSO Keycloak",
  },
  {
    id: "LOG-0007",
    date: jours(3),
    email: "inconnu@exemple.mg",
    ip: "45.83.220.17",
    resultat: "echec",
    detail: "Compte inconnu",
  },
  {
    id: "LOG-0008",
    date: jours(4),
    email: "miora.razafy@exemple.mg",
    ip: "196.12.34.77",
    resultat: "succes",
    detail: "Authentification SSO Keycloak",
  },
];

// ------------------------------------------------------------------
// RÉFÉRENTIELS
// ------------------------------------------------------------------
export const REFERENTIEL_TYPES = [
  { id: "types_infrastructure", label: "Types d'infrastructures" },
  { id: "etats", label: "États" },
  { id: "categories_signalements", label: "Catégories de signalements" },
  { id: "unites", label: "Unités" },
  { id: "priorites", label: "Priorités" },
];

export const initialReferentiels = {
  types_infrastructure: [
    { id: "REF-T01", code: "route", libelle: "Route", description: "Voirie routière", actif: true },
    { id: "REF-T02", code: "pont", libelle: "Pont", description: "Ouvrage d'art", actif: true },
    { id: "REF-T03", code: "reseau_eau", libelle: "Réseau d'eau", description: "Adduction et assainissement", actif: true },
    { id: "REF-T04", code: "batiment_public", libelle: "Bâtiment public", description: "Écoles, hôpitaux, mairies", actif: true },
    { id: "REF-T05", code: "ponton", libelle: "Ponton", description: "Infrastructure fluviale", actif: false },
  ],
  etats: [
    { id: "REF-E01", code: "bon", libelle: "Bon", description: "Aucune dégradation", actif: true },
    { id: "REF-E02", code: "moyen", libelle: "Moyen", description: "Dégradation légère", actif: true },
    { id: "REF-E03", code: "degrade", libelle: "Dégradé", description: "Dégradation notable", actif: true },
    { id: "REF-E04", code: "critique", libelle: "Critique", description: "Risque immédiat", actif: true },
  ],
  categories_signalements: [
    { id: "REF-C01", code: "voirie", libelle: "Voirie", description: "Routes, trottoirs", actif: true },
    { id: "REF-C02", code: "eau", libelle: "Eau", description: "Fuites, adduction", actif: true },
    { id: "REF-C03", code: "electricite", libelle: "Électricité", description: "Éclairage, lignes", actif: true },
    { id: "REF-C04", code: "assainissement", libelle: "Assainissement", description: "Drainage, caniveaux", actif: true },
    { id: "REF-C05", code: "batiment", libelle: "Bâtiment", description: "Constructions publiques", actif: true },
  ],
  unites: [
    { id: "REF-U01", code: "m", libelle: "Mètre", description: "Longueur", actif: true },
    { id: "REF-U02", code: "km", libelle: "Kilomètre", description: "Longueur", actif: true },
    { id: "REF-U03", code: "m2", libelle: "Mètre carré", description: "Surface", actif: true },
    { id: "REF-U04", code: "m3", libelle: "Mètre cube", description: "Volume", actif: true },
    { id: "REF-U05", code: "unite", libelle: "Unité", description: "Comptage", actif: true },
  ],
  priorites: [
    { id: "REF-P01", code: "basse", libelle: "Basse", description: "Ordinaire", actif: true },
    { id: "REF-P02", code: "moyenne", libelle: "Moyenne", description: "À planifier", actif: true },
    { id: "REF-P03", code: "haute", libelle: "Haute", description: "À traiter rapidement", actif: true },
    { id: "REF-P04", code: "urgente", libelle: "Urgente", description: "Intervention immédiate", actif: true },
  ],
};

// ------------------------------------------------------------------
// SEUILS D'ALERTE & NOTIFICATIONS
// ------------------------------------------------------------------
export const initialReglesAlerte = [
  {
    id: "ALR-CFG-01",
    nom: "Infrastructure en état critique",
    indicateur: "etat_infrastructure",
    operateur: "==",
    seuil: "critique",
    canaux: ["email", "in_app"],
    destinataires: ["gestionnaires", "decideurs"],
    actif: true,
    updated_at: jours(10),
  },
  {
    id: "ALR-CFG-02",
    nom: "Afflux de signalements sur 7 jours",
    indicateur: "signalements_7j",
    operateur: ">=",
    seuil: "20",
    canaux: ["email", "sms"],
    destinataires: ["gestionnaires"],
    actif: true,
    updated_at: jours(21),
  },
  {
    id: "ALR-CFG-03",
    nom: "Microservice indisponible",
    indicateur: "service_down_minutes",
    operateur: ">=",
    seuil: "10",
    canaux: ["email", "in_app", "webhook"],
    destinataires: ["administrateurs"],
    actif: true,
    updated_at: jours(5),
  },
  {
    id: "ALR-CFG-04",
    nom: "Score de priorité élevé",
    indicateur: "score_priorite",
    operateur: ">=",
    seuil: "80",
    canaux: ["in_app"],
    destinataires: ["decideurs"],
    actif: false,
    updated_at: jours(30),
  },
];

export const initialConfigNotification = {
  canal_defaut: "email",
  frequence_digest: "quotidien",
  heure_digest: "08:00",
  activer_email: true,
  activer_sms: false,
  activer_push: true,
  activer_webhook: false,
};

export const CANAUX_NOTIFICATION = [
  { id: "email", label: "E-mail" },
  { id: "sms", label: "SMS" },
  { id: "in_app", label: "Notification in-app" },
  { id: "webhook", label: "Webhook" },
];

export const OPERATEURS_ALERTE = [
  { id: "==", label: "égal à" },
  { id: ">=", label: "supérieur ou égal à" },
  { id: ">", label: "supérieur à" },
  { id: "<=", label: "inférieur ou égal à" },
  { id: "<", label: "inférieur à" },
];

// ------------------------------------------------------------------
// SCORE DE PRIORITÉ
// ------------------------------------------------------------------
export const initialScoring = [
  {
    id: "SCR-01",
    code: "etat",
    nom: "État de l'infrastructure",
    description: "Poids selon la gravité de la dégradation observée.",
    poids: 30,
    actif: true,
  },
  {
    id: "SCR-02",
    code: "signalements",
    nom: "Volume de signalements",
    description: "Nombre de signalements citoyens sur les 30 derniers jours.",
    poids: 20,
    actif: true,
  },
  {
    id: "SCR-03",
    code: "priorite_metier",
    nom: "Priorité métier",
    description: "Priorité portée par le gestionnaire de terrain.",
    poids: 15,
    actif: true,
  },
  {
    id: "SCR-04",
    code: "anciennete",
    nom: "Ancienneté depuis la dernière intervention",
    description: "Plus l'intervention est ancienne, plus le poids augmente.",
    poids: 15,
    actif: true,
  },
  {
    id: "SCR-05",
    code: "cout",
    nom: "Coût estimé des réparations",
    description: "Impact budgétaire estimé de la remise en état.",
    poids: 10,
    actif: true,
  },
  {
    id: "SCR-06",
    code: "population",
    nom: "Population impactée",
    description: "Nombre d'habitants concernés par la défaillance.",
    poids: 10,
    actif: true,
  },
];

// ------------------------------------------------------------------
// DONNÉES GÉOSPATIALES
// ------------------------------------------------------------------
export const initialJeuxDonnees = [
  {
    id: "GEO-001",
    nom: "Routes nationales",
    format: "Shapefile",
    taille_mo: 42.5,
    entites: 12450,
    crs: "EPSG:32738",
    importe_par: "andry.r@exemple.mg",
    created_at: jours(120),
  },
  {
    id: "GEO-002",
    nom: "Ponts et ouvrages d'art",
    format: "GeoJSON",
    taille_mo: 3.2,
    entites: 342,
    crs: "EPSG:4326",
    importe_par: "andry.r@exemple.mg",
    created_at: jours(60),
  },
  {
    id: "GEO-003",
    nom: "Réseaux d'eau potable",
    format: "GeoPackage",
    taille_mo: 18.7,
    entites: 5230,
    crs: "EPSG:32738",
    importe_par: "miora.razafy@exemple.mg",
    created_at: jours(30),
  },
  {
    id: "GEO-004",
    nom: "Zones inondables Antananarivo",
    format: "Shapefile",
    taille_mo: 76.1,
    entites: 89,
    crs: "EPSG:32738",
    importe_par: "rakoto.andrianina@exemple.mg",
    created_at: jours(15),
  },
  {
    id: "GEO-005",
    nom: "Bâtiments publics",
    format: "CSV (WKT)",
    taille_mo: 1.4,
    entites: 1180,
    crs: "EPSG:4326",
    importe_par: "voahangy.r@exemple.mg",
    created_at: jours(7),
  },
];

// ------------------------------------------------------------------
// CARTOGRAPHIE : COUCHES, STYLES, FONDS DE CARTE
// ------------------------------------------------------------------
export const initialCouches = [
  {
    id: "LYR-001",
    nom: "Infrastructures",
    type: "WFS",
    source: "servicegeospatial/wfs/infrastructures",
    style: "STY-001",
    ordre: 1,
    visible: true,
  },
  {
    id: "LYR-002",
    nom: "Signalements",
    type: "WFS",
    source: "servicegeospatial/wfs/signalements",
    style: "STY-002",
    ordre: 2,
    visible: true,
  },
  {
    id: "LYR-003",
    nom: "Zones inondables",
    type: "WMS",
    source: "servicegeospatial/wms/zones_inondables",
    style: "STY-003",
    ordre: 3,
    visible: false,
  },
  {
    id: "LYR-004",
    nom: "Réseaux d'eau",
    type: "WFS",
    source: "servicegeospatial/wfs/reseaux_eau",
    style: "STY-004",
    ordre: 4,
    visible: true,
  },
  {
    id: "LYR-005",
    nom: "Territoires (communes)",
    type: "GeoJSON",
    source: "servicegeospatial/geojson/communes",
    style: "STY-005",
    ordre: 5,
    visible: true,
  },
];

export const initialStyles = [
  { id: "STY-001", nom: "style_infrastructures", couleur: "#10b981", taille_symbole: 8, opacite: 0.85 },
  { id: "STY-002", nom: "style_signalements", couleur: "#f59e0b", taille_symbole: 10, opacite: 0.9 },
  { id: "STY-003", nom: "style_inondations", couleur: "#3b82f6", taille_symbole: 6, opacite: 0.35 },
  { id: "STY-004", nom: "style_reseaux_eau", couleur: "#06b6d4", taille_symbole: 5, opacite: 0.8 },
  { id: "STY-005", nom: "style_territoires", couleur: "#8b5cf6", taille_symbole: 4, opacite: 0.5 },
];

export const initialFondsCarte = [
  {
    id: "BAS-001",
    nom: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    actif: true,
  },
  {
    id: "BAS-002",
    nom: "CartoDB Dark Matter",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "© CARTO",
    actif: false,
  },
  {
    id: "BAS-003",
    nom: "ESRI Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
    actif: false,
  },
];

// ------------------------------------------------------------------
// SUPERVISION DES MICROSERVICES
// ------------------------------------------------------------------
export const initialServices = [
  { id: "auth", nom: "Auth", statut: "up", latence_ms: 42, uptime_pct: 99.95, version: "2.3.1", dernier_check: jours(0) },
  { id: "citoyen", nom: "Citoyen", statut: "up", latence_ms: 88, uptime_pct: 99.7, version: "1.8.0", dernier_check: jours(0) },
  { id: "notification", nom: "Notification", statut: "degraded", latence_ms: 320, uptime_pct: 98.2, version: "1.2.4", dernier_check: jours(0) },
  { id: "territoire", nom: "Territoire", statut: "up", latence_ms: 61, uptime_pct: 99.9, version: "2.0.2", dernier_check: jours(0) },
  { id: "infrastructure", nom: "Infrastructure", statut: "up", latence_ms: 95, uptime_pct: 99.6, version: "3.1.0", dernier_check: jours(0) },
  { id: "geospatial", nom: "Geospatial", statut: "up", latence_ms: 140, uptime_pct: 99.4, version: "1.5.3", dernier_check: jours(0) },
  { id: "analytics", nom: "Analytics", statut: "down", latence_ms: null, uptime_pct: 95.1, version: "0.9.7", dernier_check: jours(0) },
];

// ------------------------------------------------------------------
// LOGS SYSTÈME, ERREURS & MÉTRIQUES
// ------------------------------------------------------------------
export const initialLogsSysteme = [
  { id: "SYS-0001", date: jours(0), niveau: "INFO", service: "auth", message: "Rafraîchissement du pool de connexions JWT" },
  { id: "SYS-0002", date: jours(0), niveau: "WARN", service: "notification", message: "Latence élevée détectée sur le canal SMS (> 300 ms)" },
  { id: "SYS-0003", date: jours(0), niveau: "ERROR", service: "analytics", message: "Connexion à la base analytique refusée (pool saturé)" },
  { id: "SYS-0004", date: jours(0), niveau: "INFO", service: "geospatial", message: "Import GEO-005 terminé (1180 entités)" },
  { id: "SYS-0005", date: jours(1), niveau: "INFO", service: "territoire", message: "Référentiel des communes rechargé (1546 entrées)" },
  { id: "SYS-0006", date: jours(1), niveau: "WARN", service: "infrastructure", message: "Nombreux appels simultanés sur /infrastructures (rate-limit proche)" },
  { id: "SYS-0007", date: jours(2), niveau: "INFO", service: "citoyen", message: "Nettoyage des pièces jointes orphelines (42 fichiers)" },
  { id: "SYS-0008", date: jours(2), niveau: "ERROR", service: "notification", message: "Échec d'envoi batch e-mail : serveur SMTP indisponible" },
];

export const initialErreurs = [
  {
    id: "ERR-001",
    date: jours(0),
    service: "analytics",
    code: "DB_POOL_EXHAUSTED",
    message: "Connexion à la base analytique refusée (pool saturé)",
    occurrences: 14,
    resolue: false,
  },
  {
    id: "ERR-002",
    date: jours(0),
    service: "notification",
    code: "SMTP_TIMEOUT",
    message: "Délai dépassé lors de l'envoi d'un lot d'e-mails",
    occurrences: 3,
    resolue: false,
  },
  {
    id: "ERR-003",
    date: jours(2),
    service: "geospatial",
    code: "INVALID_CRS",
    message: "Fichier importé avec un système de coordonnées inconnu",
    occurrences: 1,
    resolue: true,
  },
  {
    id: "ERR-004",
    date: jours(4),
    service: "auth",
    code: "TOKEN_EXPIRED",
    message: "Renouvellement de token échoué pour 2 clients",
    occurrences: 7,
    resolue: true,
  },
];

export const initialMetriques = {
  cpu_pct: 38,
  memoire_pct: 61,
  disque_pct: 47,
  temps_reponse_ms: 214,
  requetes_par_s: 142,
  services_total: 7,
  services_up: 5,
};

// ------------------------------------------------------------------
// SAUVEGARDES & MISES À JOUR
// ------------------------------------------------------------------
export const initialSauvegardes = [
  { id: "BAK-0001", date: jours(0), taille_go: 3.4, type: "complète", statut: "terminee", planifiee: true },
  { id: "BAK-0002", date: jours(7), taille_go: 3.3, type: "complète", statut: "terminee", planifiee: true },
  { id: "BAK-0003", date: jours(8), taille_go: 0.9, type: "incrémentale", statut: "terminee", planifiee: true },
  { id: "BAK-0004", date: jours(14), taille_go: 3.1, type: "complète", statut: "echouee", planifiee: true },
  { id: "BAK-0005", date: jours(15), taille_go: 1.2, type: "incrémentale", statut: "terminee", planifiee: false },
];

export const initialMisesAJour = [
  {
    id: "UPD-001",
    composant: "servicegeospatial",
    version_actuelle: "1.5.3",
    version_disponible: "1.6.0",
    date_sortie: jours(3),
    description: "Support GeoPackage 2.0 et amélioration des performances WFS.",
    critique: false,
    applique: false,
  },
  {
    id: "UPD-002",
    composant: "serviceauth",
    version_actuelle: "2.3.1",
    version_disponible: "2.3.2",
    date_sortie: jours(1),
    description: "Correctif de sécurité sur le rafraîchissement des tokens.",
    critique: true,
    applique: false,
  },
  {
    id: "UPD-003",
    composant: "servicenotification",
    version_actuelle: "1.2.4",
    version_disponible: "1.2.4",
    date_sortie: jours(40),
    description: "À jour.",
    critique: false,
    applique: true,
  },
];

// ------------------------------------------------------------------
// TABLEAUX DE BORD GLOBAUX & DONNÉES GLOBALES
// ------------------------------------------------------------------
export const initialTableauxBord = [
  {
    id: "citoyen",
    nom: "Citoyen",
    description: "Signalements déposés et suivi par les citoyens.",
    indicateurs: [
      { label: "Signalements déposés", valeur: 1284 },
      { label: "Signalements traités", valeur: 967 },
      { label: "Utilisateurs citoyens", valeur: 3421 },
      { label: "Taux de résolution", valeur: "75 %" },
    ],
  },
  {
    id: "gestionnaire",
    nom: "Gestionnaire",
    description: "Infrastructures, interventions et alertes de terrain.",
    indicateurs: [
      { label: "Infrastructures suivies", valeur: 512 },
      { label: "Interventions en cours", valeur: 38 },
      { label: "Signalements ouverts", valeur: 47 },
      { label: "Alertes actives", valeur: 6 },
    ],
  },
  {
    id: "decideur",
    nom: "Décideur",
    description: "Priorités, budgets et plans d'investissement.",
    indicateurs: [
      { label: "Priorités arbitrées", valeur: 89 },
      { label: "Budget engagé", valeur: "12,4 Md Ar" },
      { label: "Projets en cours", valeur: 23 },
      { label: "Signalements critiques", valeur: 9 },
    ],
  },
  {
    id: "administrateur",
    nom: "Administrateur",
    description: "Santé technique et paramétrage de la plateforme.",
    indicateurs: [
      { label: "Microservices opérationnels", valeur: "5 / 7" },
      { label: "Comptes utilisateurs", valeur: 8 },
      { label: "Erreurs non résolues", valeur: 2 },
      { label: "Dernière sauvegarde", valeur: "aujourd'hui" },
    ],
  },
];

export const initialRessourcesGlobales = {
  infrastructures: [
    { id: "INF-0001", libelle: "Route RN7 - PK 12", type: "route", etat: "degrade", commune: "Antananarivo Renivohitra" },
    { id: "INF-0002", libelle: "Pont de Tanambao", type: "pont", etat: "critique", commune: "Antananarivo Renivohitra" },
    { id: "INF-0003", libelle: "Réseau d'eau - Ambohipo", type: "reseau_eau", etat: "moyen", commune: "Antananarivo Renivohitra" },
    { id: "INF-0004", libelle: "École de Mahamasina", type: "batiment_public", etat: "bon", commune: "Antananarivo Renivohitra" },
    { id: "INF-0005", libelle: "Route RN2 - Toamasina", type: "route", etat: "degrade", commune: "Toamasina I" },
  ],
  signalements: [
    { id: "SIG-0001", libelle: "Nid-de-poule RN7", categorie: "voirie", statut: "ouvert", priorite: "haute" },
    { id: "SIG-0002", libelle: "Fuite canalisation Ambohipo", categorie: "eau", statut: "en_cours", priorite: "urgente" },
    { id: "SIG-0003", libelle: "Lampadaire hors service", categorie: "electricite", statut: "ouvert", priorite: "basse" },
    { id: "SIG-0004", libelle: "Caniveau obstrué Analakely", categorie: "assainissement", statut: "resolu", priorite: "moyenne" },
  ],
  interventions: [
    { id: "INT-0001", libelle: "Réfection tronçon RN7", statut: "en_cours", cout: 250000000 },
    { id: "INT-0002", libelle: "Réparation pont Tanambao", statut: "planifiee", cout: 980000000 },
    { id: "INT-0003", libelle: "Curage caniveaux Analakely", statut: "terminee", cout: 12000000 },
  ],
  alertes: [
    { id: "ALR-0001", libelle: "Pont Tanambao en état critique", niveau: "critique", service: "infrastructure" },
    { id: "ALR-0002", libelle: "Service analytics indisponible", niveau: "critique", service: "analytics" },
    { id: "ALR-0003", libelle: "Latence élevée notification", niveau: "warning", service: "notification" },
  ],
};
