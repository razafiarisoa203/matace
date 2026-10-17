// Service mocké du module Administrateur.
// Les endpoints d'administration ne sont pas encore disponibles côté backend :
// ce service simule les appels API avec une latence et un stockage en mémoire.
// Chaque méthode peut être remplacée par un appel axiosConfig sans changer l'UI.

import {
  initialUtilisateurs,
  initialRoles,
  groupesPermissions,
  initialJournalActivite,
  initialTentativesConnexion,
  initialReferentiels,
  initialReglesAlerte,
  initialConfigNotification,
  initialScoring,
  initialJeuxDonnees,
  initialCouches,
  initialStyles,
  initialFondsCarte,
  initialServices,
  initialLogsSysteme,
  initialErreurs,
  initialMetriques,
  initialSauvegardes,
  initialMisesAJour,
  initialTableauxBord,
  initialRessourcesGlobales,
  REFERENTIEL_TYPES,
} from "../data/mockData";

const LATENCE = 300;

const clone = (data) => JSON.parse(JSON.stringify(data));
const wait = (ms = LATENCE) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => new Date().toISOString();

let utilisateurs = clone(initialUtilisateurs);
let roles = clone(initialRoles);
let journalActivite = clone(initialJournalActivite);
let tentativesConnexion = clone(initialTentativesConnexion);
let referentiels = clone(initialReferentiels);
let reglesAlerte = clone(initialReglesAlerte);
let configNotification = clone(initialConfigNotification);
let scoring = clone(initialScoring);
let jeuxDonnees = clone(initialJeuxDonnees);
let couches = clone(initialCouches);
let styles = clone(initialStyles);
let fondsCarte = clone(initialFondsCarte);
let services = clone(initialServices);
let logsSysteme = clone(initialLogsSysteme);
let erreurs = clone(initialErreurs);
let metriques = clone(initialMetriques);
let sauvegardes = clone(initialSauvegardes);
let misesAJour = clone(initialMisesAJour);

let compteurs = {
  USR: utilisateurs.length,
  ACT: journalActivite.length,
  LOG: tentativesConnexion.length,
  REF: 100,
  ALR: reglesAlerte.length,
  SCR: scoring.length,
  GEO: jeuxDonnees.length,
  LYR: couches.length,
  STY: styles.length,
  BAS: fondsCarte.length,
  BAK: sauvegardes.length,
};

const nextId = (prefixe, largeur = 3) => {
  compteurs[prefixe] += 1;
  return `${prefixe}-${String(compteurs[prefixe]).padStart(largeur, "0")}`;
};

// Trace chaque action d'administration dans le journal d'activité.
const tracer = (utilisateur, action, cible, niveau = "info") => {
  journalActivite = [
    {
      id: nextId("ACT", 4),
      date: now(),
      utilisateur,
      action,
      cible,
      niveau,
    },
    ...journalActivite,
  ];
};

const ACTEUR = "admin@exemple.mg";

export const adminService = {
  // ==================================================================
  // SYNTHÈSE / DASHBOARD
  // ==================================================================
  async getSynthese() {
    await wait();
    const totalUtilisateurs = utilisateurs.length;
    const utilisateursActifs = utilisateurs.filter((u) => u.statut === "actif").length;
    const servicesUp = services.filter((s) => s.statut === "up").length;
    return {
      utilisateurs: {
        total: totalUtilisateurs,
        actifs: utilisateursActifs,
        desactifs: totalUtilisateurs - utilisateursActifs,
        administrateurs: utilisateurs.filter((u) => u.role === "administrateur").length,
        decideurs: utilisateurs.filter((u) => u.role === "decideur").length,
        gestionnaires: utilisateurs.filter((u) => u.role === "gestionnaire").length,
      },
      services: { total: services.length, up: servicesUp },
      erreursOuvertes: erreurs.filter((e) => !e.resolue).length,
      reglesAlerteActives: reglesAlerte.filter((r) => r.actif).length,
      jeuxDonnees: jeuxDonnees.length,
      couches: couches.length,
      derniereSauvegarde: sauvegardes[0] || null,
      tentativesEchouees24h: tentativesConnexion.filter(
        (t) => t.resultat === "echec" && new Date(t.date) > new Date(Date.now() - 24 * 3600 * 1000)
      ).length,
    };
  },

  // ==================================================================
  // COMPTES UTILISATEURS
  // ==================================================================
  async listUsers(params = {}) {
    await wait();
    let resultat = clone(utilisateurs);
    if (params.role) resultat = resultat.filter((u) => u.role === params.role);
    if (params.statut) resultat = resultat.filter((u) => u.statut === params.statut);
    if (params.recherche) {
      const q = params.recherche.toLowerCase();
      resultat = resultat.filter(
        (u) =>
          u.nom?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.id?.toLowerCase().includes(q)
      );
    }
    return resultat;
  },

  async createUser(data) {
    await wait();
    const user = {
      id: nextId("USR"),
      nom: data.nom,
      email: data.email,
      telephone: data.telephone || "",
      role: data.role || "gestionnaire",
      statut: "actif",
      dernier_login: null,
      created_at: now(),
    };
    utilisateurs = [user, ...utilisateurs];
    tracer(ACTEUR, `Création du compte ${user.id} (${user.role})`, `users/${user.id}`);
    return clone(user);
  },

  async updateUser(id, data) {
    await wait();
    utilisateurs = utilisateurs.map((u) => (u.id === id ? { ...u, ...data } : u));
    tracer(ACTEUR, `Mise à jour du compte ${id}`, `users/${id}`);
    return clone(utilisateurs.find((u) => u.id === id));
  },

  async disableUser(id) {
    await wait();
    utilisateurs = utilisateurs.map((u) => (u.id === id ? { ...u, statut: "desactif" } : u));
    tracer(ACTEUR, `Désactivation du compte ${id}`, `users/${id}`, "warning");
    return { success: true };
  },

  async enableUser(id) {
    await wait();
    utilisateurs = utilisateurs.map((u) => (u.id === id ? { ...u, statut: "actif" } : u));
    tracer(ACTEUR, `Réactivation du compte ${id}`, `users/${id}`);
    return { success: true };
  },

  async deleteUser(id) {
    await wait();
    utilisateurs = utilisateurs.filter((u) => u.id !== id);
    tracer(ACTEUR, `Suppression du compte ${id}`, `users/${id}`, "warning");
    return { success: true };
  },

  // ==================================================================
  // RÔLES & PERMISSIONS
  // ==================================================================
  async listRoles() {
    await wait();
    return clone(roles);
  },

  async listPermissions() {
    await wait();
    return clone(groupesPermissions);
  },

  async saveRoles(nouveauxRoles) {
    await wait(500);
    roles = clone(nouveauxRoles);
    tracer(ACTEUR, "Mise à jour des rôles et permissions", "roles", "warning");
    return clone(roles);
  },

  async assignRole(userId, roleId) {
    await wait();
    utilisateurs = utilisateurs.map((u) => (u.id === userId ? { ...u, role: roleId } : u));
    tracer(ACTEUR, `Attribution du rôle ${roleId} à ${userId}`, `users/${userId}`);
    return { success: true };
  },

  async revokeRole(userId, roleId) {
    await wait();
    utilisateurs = utilisateurs.map((u) =>
      u.id === userId && u.role === roleId ? { ...u, role: "gestionnaire" } : u
    );
    tracer(ACTEUR, `Retrait du rôle ${roleId} de ${userId}`, `users/${userId}`, "warning");
    return { success: true };
  },

  // ==================================================================
  // JOURNAUX D'ACTIVITÉ & CONNEXIONS
  // ==================================================================
  async getActivityLogs(params = {}) {
    await wait();
    let resultat = clone(journalActivite);
    if (params.niveau) resultat = resultat.filter((l) => l.niveau === params.niveau);
    if (params.recherche) {
      const q = params.recherche.toLowerCase();
      resultat = resultat.filter(
        (l) =>
          l.action?.toLowerCase().includes(q) ||
          l.utilisateur?.toLowerCase().includes(q) ||
          l.cible?.toLowerCase().includes(q)
      );
    }
    return resultat;
  },

  async getLoginAttempts(params = {}) {
    await wait();
    let resultat = clone(tentativesConnexion);
    if (params.resultat) resultat = resultat.filter((l) => l.resultat === params.resultat);
    if (params.recherche) {
      const q = params.recherche.toLowerCase();
      resultat = resultat.filter(
        (l) => l.email?.toLowerCase().includes(q) || l.ip?.toLowerCase().includes(q)
      );
    }
    return resultat;
  },

  // ==================================================================
  // RÉFÉRENTIELS
  // ==================================================================
  async getReferentiels(type) {
    await wait();
    if (!REFERENTIEL_TYPES.some((r) => r.id === type)) {
      throw new Error(`Référentiel inconnu : ${type}`);
    }
    return clone(referentiels[type] || []);
  },

  async saveReferentiel(type, data) {
    await wait();
    if (data.id) {
      referentiels[type] = referentiels[type].map((r) => (r.id === data.id ? { ...r, ...data } : r));
      tracer(ACTEUR, `Mise à jour d'une entrée du référentiel ${type}`, `referentiels/${type}/${data.id}`);
    } else {
      const nouvelle = { ...data, id: nextId("REF") };
      referentiels[type] = [...(referentiels[type] || []), nouvelle];
      tracer(ACTEUR, `Ajout d'une entrée au référentiel ${type}`, `referentiels/${type}/${nouvelle.id}`);
    }
    return clone(referentiels[type]);
  },

  async deleteReferentiel(type, id) {
    await wait();
    referentiels[type] = (referentiels[type] || []).filter((r) => r.id !== id);
    tracer(ACTEUR, `Suppression d'une entrée du référentiel ${type}`, `referentiels/${type}/${id}`, "warning");
    return clone(referentiels[type]);
  },

  // ==================================================================
  // SEUILS D'ALERTE & NOTIFICATIONS
  // ==================================================================
  async getAlertRules() {
    await wait();
    return clone(reglesAlerte);
  },

  async saveAlertRule(data) {
    await wait();
    if (data.id) {
      reglesAlerte = reglesAlerte.map((r) => (r.id === data.id ? { ...r, ...data, updated_at: now() } : r));
      tracer(ACTEUR, `Mise à jour de la règle d'alerte ${data.id}`, `alertes/${data.id}`);
    } else {
      const nouvelle = { ...data, id: nextId("ALR-CFG"), updated_at: now() };
      reglesAlerte = [nouvelle, ...reglesAlerte];
      tracer(ACTEUR, `Création de la règle d'alerte ${nouvelle.id}`, `alertes/${nouvelle.id}`);
    }
    return clone(reglesAlerte);
  },

  async deleteAlertRule(id) {
    await wait();
    reglesAlerte = reglesAlerte.filter((r) => r.id !== id);
    tracer(ACTEUR, `Suppression de la règle d'alerte ${id}`, `alertes/${id}`, "warning");
    return clone(reglesAlerte);
  },

  async toggleAlertRule(id, actif) {
    await wait();
    reglesAlerte = reglesAlerte.map((r) => (r.id === id ? { ...r, actif, updated_at: now() } : r));
    return clone(reglesAlerte);
  },

  async getNotificationConfig() {
    await wait();
    return clone(configNotification);
  },

  async saveNotificationConfig(data) {
    await wait();
    configNotification = { ...configNotification, ...data };
    tracer(ACTEUR, "Mise à jour de la configuration des notifications", "notification/config");
    return clone(configNotification);
  },

  // ==================================================================
  // SCORE DE PRIORITÉ
  // ==================================================================
  async getScoringConfig() {
    await wait();
    return clone(scoring);
  },

  async saveScoringConfig(nouveauScoring) {
    await wait(500);
    scoring = clone(nouveauScoring);
    tracer(ACTEUR, "Mise à jour des pondérations du score de priorité", "scoring", "warning");
    return clone(scoring);
  },

  // ==================================================================
  // DONNÉES GÉOSPATIALES
  // ==================================================================
  async listGeodata() {
    await wait();
    return clone(jeuxDonnees);
  },

  async importGeodata({ nom, format, taille_mo, entites, crs }) {
    await wait(600);
    const jeu = {
      id: nextId("GEO"),
      nom: nom || "Jeu de données importé",
      format: format || "GeoJSON",
      taille_mo: Number(taille_mo) || 1,
      entites: Number(entites) || 0,
      crs: crs || "EPSG:4326",
      importe_par: ACTEUR,
      created_at: now(),
    };
    jeuxDonnees = [jeu, ...jeuxDonnees];
    tracer(ACTEUR, `Import du jeu de données ${jeu.id} (${jeu.nom})`, `geospatial/${jeu.id}`);
    return clone(jeu);
  },

  async deleteGeodata(id) {
    await wait();
    jeuxDonnees = jeuxDonnees.filter((g) => g.id !== id);
    tracer(ACTEUR, `Suppression du jeu de données ${id}`, `geospatial/${id}`, "warning");
    return { success: true };
  },

  // ==================================================================
  // CARTOGRAPHIE : COUCHES, STYLES, FONDS DE CARTE
  // ==================================================================
  async listLayers() {
    await wait();
    return clone(couches);
  },

  async saveLayer(data) {
    await wait();
    if (data.id) {
      couches = couches.map((c) => (c.id === data.id ? { ...c, ...data } : c));
    } else {
      const nouvelle = { ...data, id: nextId("LYR") };
      couches = [...couches, nouvelle];
    }
    tracer(ACTEUR, `Enregistrement de la couche ${data.id || "nouvelle"}`, "layers");
    return clone(couches);
  },

  async deleteLayer(id) {
    await wait();
    couches = couches.filter((c) => c.id !== id);
    tracer(ACTEUR, `Suppression de la couche ${id}`, `layers/${id}`, "warning");
    return clone(couches);
  },

  async listStyles() {
    await wait();
    return clone(styles);
  },

  async saveStyle(data) {
    await wait();
    if (data.id) {
      styles = styles.map((s) => (s.id === data.id ? { ...s, ...data } : s));
    } else {
      const nouveau = { ...data, id: nextId("STY") };
      styles = [...styles, nouveau];
    }
    tracer(ACTEUR, `Enregistrement du style ${data.id || "nouveau"}`, "styles");
    return clone(styles);
  },

  async deleteStyle(id) {
    await wait();
    styles = styles.filter((s) => s.id !== id);
    tracer(ACTEUR, `Suppression du style ${id}`, `styles/${id}`, "warning");
    return clone(styles);
  },

  async getBasemaps() {
    await wait();
    return clone(fondsCarte);
  },

  async saveBasemap(data) {
    await wait();
    if (data.id) {
      fondsCarte = fondsCarte.map((b) => (b.id === data.id ? { ...b, ...data } : b));
    } else {
      const nouveau = { ...data, id: nextId("BAS") };
      fondsCarte = [...fondsCarte, nouveau];
    }
    tracer(ACTEUR, `Enregistrement du fond de carte ${data.id || "nouveau"}`, "basemaps");
    return clone(fondsCarte);
  },

  async deleteBasemap(id) {
    await wait();
    fondsCarte = fondsCarte.filter((b) => b.id !== id);
    tracer(ACTEUR, `Suppression du fond de carte ${id}`, `basemaps/${id}`, "warning");
    return clone(fondsCarte);
  },

  // ==================================================================
  // SUPERVISION DES MICROSERVICES
  // ==================================================================
  async getServicesStatus() {
    await wait();
    return clone(services);
  },

  async refreshService(serviceId) {
    await wait(400);
    services = services.map((s) =>
      s.id === serviceId
        ? { ...s, latence_ms: s.statut === "down" ? null : 30 + Math.floor(Math.random() * 120), dernier_check: now() }
        : s
    );
    return clone(services.find((s) => s.id === serviceId));
  },

  async restartService(serviceId) {
    await wait(900);
    services = services.map((s) =>
      s.id === serviceId ? { ...s, statut: "up", latence_ms: 45, dernier_check: now() } : s
    );
    tracer(ACTEUR, `Redémarrage du microservice ${serviceId}`, `services/${serviceId}`, "warning");
    return clone(services.find((s) => s.id === serviceId));
  },

  // ==================================================================
  // LOGS, ERREURS & PERFORMANCE
  // ==================================================================
  async getSystemLogs(params = {}) {
    await wait();
    let resultat = clone(logsSysteme);
    if (params.niveau) resultat = resultat.filter((l) => l.niveau === params.niveau);
    if (params.service) resultat = resultat.filter((l) => l.service === params.service);
    return resultat;
  },

  async getErrors(params = {}) {
    await wait();
    let resultat = clone(erreurs);
    if (params.resolue === true) resultat = resultat.filter((e) => e.resolue);
    if (params.resolue === false) resultat = resultat.filter((e) => !e.resolue);
    if (params.service) resultat = resultat.filter((e) => e.service === params.service);
    return resultat;
  },

  async resolveError(id) {
    await wait();
    erreurs = erreurs.map((e) => (e.id === id ? { ...e, resolue: true } : e));
    tracer(ACTEUR, `Marquage de l'erreur ${id} comme résolue`, `errors/${id}`);
    return clone(erreurs);
  },

  async getMetrics() {
    await wait();
    const jitter = (v, amp = 5) => Math.max(0, Math.min(100, v + Math.round((Math.random() - 0.5) * amp)));
    return {
      ...metriques,
      cpu_pct: jitter(metriques.cpu_pct),
      memoire_pct: jitter(metriques.memoire_pct),
      disque_pct: jitter(metriques.disque_pct, 2),
      temps_reponse_ms: Math.max(50, metriques.temps_reponse_ms + Math.round((Math.random() - 0.5) * 60)),
      requetes_par_s: Math.max(1, metriques.requetes_par_s + Math.round((Math.random() - 0.5) * 40)),
      services_up: services.filter((s) => s.statut === "up").length,
      services_total: services.length,
    };
  },

  // ==================================================================
  // SAUVEGARDES, RESTAURATIONS & MISES À JOUR
  // ==================================================================
  async listBackups() {
    await wait();
    return clone(sauvegardes);
  },

  async createBackup() {
    await wait(1200);
    const sauvegarde = {
      id: nextId("BAK", 4),
      date: now(),
      taille_go: Number((2.5 + Math.random() * 2).toFixed(1)),
      type: "complète",
      statut: "terminee",
      planifiee: false,
    };
    sauvegardes = [sauvegarde, ...sauvegardes];
    tracer(ACTEUR, `Création de la sauvegarde ${sauvegarde.id}`, `backups/${sauvegarde.id}`);
    return clone(sauvegarde);
  },

  async deleteBackup(id) {
    await wait();
    sauvegardes = sauvegardes.filter((b) => b.id !== id);
    tracer(ACTEUR, `Suppression de la sauvegarde ${id}`, `backups/${id}`, "warning");
    return { success: true };
  },

  async restoreBackup(id) {
    await wait(1500);
    tracer(ACTEUR, `Restauration de la sauvegarde ${id}`, `backups/${id}`, "warning");
    return { success: true, id };
  },

  async getUpdates() {
    await wait();
    return clone(misesAJour);
  },

  async applyUpdate(id) {
    await wait(1500);
    let composant = "";
    misesAJour = misesAJour.map((u) => {
      if (u.id !== id) return u;
      composant = u.composant;
      return { ...u, version_actuelle: u.version_disponible, applique: true };
    });
    tracer(ACTEUR, `Application de la mise à jour ${id} (${composant})`, `updates/${id}`, "warning");
    return clone(misesAJour);
  },

  // ==================================================================
  // TABLEAUX DE BORD GLOBAUX & DONNÉES GLOBALES
  // ==================================================================
  async getAllDashboards() {
    await wait();
    return clone(initialTableauxBord);
  },

  async listGlobalResources() {
    await wait(100);
    return Object.keys(initialRessourcesGlobales).concat("utilisateurs");
  },

  async getGlobalData(resource) {
    await wait();
    if (resource === "utilisateurs") {
      return clone(utilisateurs).map((u) => ({
        id: u.id,
        libelle: u.nom,
        role: u.role,
        statut: u.statut,
        email: u.email,
      }));
    }
    return clone(initialRessourcesGlobales[resource] || []);
  },
};

export default adminService;
