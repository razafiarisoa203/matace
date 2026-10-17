// Service mocké du module Citoyen.
// Aucun backend n'existe encore pour le domaine des signalements citoyens :
// ce service simule les appels API (latence + stockage en mémoire).
// Chaque méthode pourra être remplacée par un appel axiosConfig sans changer l'UI.

import {
  initialSignalements,
  initialInfrastructuresPubliques,
  initialInterventionsPubliques,
  initialNotifications,
  DEMO_CITOYEN_ID,
} from "../data/mockData";
import { authService } from "../../../services/api/authService";
import { STATUTS_SIGNALEMENT } from "../constants";

const LATENCE = 300;

const clone = (data) => JSON.parse(JSON.stringify(data));

const wait = (ms = LATENCE) => new Promise((resolve) => setTimeout(resolve, ms));

const now = () => new Date().toISOString();

// Identifiant du citoyen connecté (repli sur l'id de démonstration).
const idCitoyenCourant = () => {
  const u = authService.getUserInfo() || {};
  return u.id_citizen || u.citizen_id || u.user_id || DEMO_CITOYEN_ID;
};

let signalements = clone(initialSignalements);
let infrastructures = clone(initialInfrastructuresPubliques);
let interventions = clone(initialInterventionsPubliques);
let notifications = clone(initialNotifications);

let compteurs = {
  SIG: 1000,
  SUIVI: 1000,
  COM: 100,
  NOT: notifications.length,
};

const nextId = (prefixe, largeur = 4) => {
  compteurs[prefixe] += 1;
  return `${prefixe}-${String(compteurs[prefixe]).padStart(largeur, "0")}`;
};

// Génère un identifiant unique de suivi lisible (ex : SUIVI-4F9A2C).
const genererSuivi = () => {
  const aleatoire = Math.random().toString(16).slice(2, 8).toUpperCase();
  const suivi = `SUIVI-${aleatoire}`;
  if (signalements.some((s) => s.id_suivi === suivi)) return genererSuivi();
  return suivi;
};

const creerNotification = ({ id_signal, id_suivi, titre, message }) => {
  const notif = {
    id_notification: nextId("NOT"),
    id_signal,
    id_suivi,
    titre,
    message,
    type: "statut",
    lue: false,
    created_at: now(),
  };
  notifications = [notif, ...notifications];
  return notif;
};

// Déduit le quartier à partir des coordonnées (approximation de démonstration).
const devinerQuartier = (lat, lng) => {
  if (lat == null || lng == null) return null;
  let meilleur = null;
  let distanceMin = Infinity;
  signalements.concat(infrastructures).forEach((lieu) => {
    if (lieu.latitude == null || lieu.longitude == null) return;
    const d =
      Math.pow(lieu.latitude - lat, 2) + Math.pow(lieu.longitude - lng, 2);
    if (d < distanceMin && lieu.quartier) {
      distanceMin = d;
      meilleur = lieu.quartier;
    }
  });
  return meilleur;
};

export const citoyenService = {
  // ------------------------------------------------------------------
  // SIGNALEMENTS DU CITOYEN
  // ------------------------------------------------------------------
  getMesSignalements: async (filtres = {}) => {
    await wait();
    const courant = idCitoyenCourant();
    let resultat = clone(
      signalements.filter(
        (s) => s.id_citizen === courant || s.id_citizen === DEMO_CITOYEN_ID
      )
    );
    if (filtres.statut) resultat = resultat.filter((s) => s.statut === filtres.statut);
    if (filtres.categorie)
      resultat = resultat.filter((s) => s.categorie === filtres.categorie);
    if (filtres.recherche) {
      const q = filtres.recherche.toLowerCase();
      resultat = resultat.filter(
        (s) =>
          s.titre?.toLowerCase().includes(q) ||
          s.id_suivi?.toLowerCase().includes(q) ||
          s.id_signal?.toLowerCase().includes(q)
      );
    }
    return resultat;
  },

  getSignalement: async (id) => {
    await wait();
    const s = signalements.find(
      (x) => x.id_signal === id || x.id_suivi === id
    );
    if (!s) throw new Error(`Signalement ${id} introuvable`);
    return clone(s);
  },

  // Crée un signalement et renvoie l'identifiant unique de suivi.
  createSignalement: async (donnees) => {
    await wait(450);
    const idSignal = nextId("SIG");
    const idSuivi = genererSuivi();
    const quartier =
      donnees.quartier || devinerQuartier(donnees.latitude, donnees.longitude) || "analakely";
    const signal = {
      id_signal: `SIG-2025-${String(idSignal).split("-")[1]}`,
      id_suivi: idSuivi,
      id_citizen: idCitoyenCourant(),
      titre: donnees.titre,
      description: donnees.description,
      categorie: donnees.categorie,
      urgence: donnees.urgence || "moyenne",
      statut: "nouveau",
      quartier,
      commune: donnees.commune || "Antananarivo Renivohitra",
      latitude: donnees.latitude ?? null,
      longitude: donnees.longitude ?? null,
      photo: donnees.photo || null,
      date_signalement: now(),
      updated_at: now(),
      public: donnees.public !== false,
      confirmations: 0,
      confirme_par: [],
      historique: [
        {
          statut: "nouveau",
          date: now(),
          commentaire: "Signalement créé par le citoyen.",
        },
      ],
      commentaires: [],
      evaluation: null,
    };
    signalements = [signal, ...signalements];
    creerNotification({
      id_signal: signal.id_signal,
      id_suivi: signal.id_suivi,
      titre: "Signalement enregistré",
      message: `Votre signalement ${signal.id_suivi} a bien été enregistré. Un service compétent va le prendre en charge.`,
    });
    return clone(signal);
  },

  // Modifie un signalement tant qu'il n'est pas encore pris en charge.
  updateSignalement: async (id, donnees) => {
    await wait();
    const cible = signalements.find((s) => s.id_signal === id);
    if (!cible) throw new Error(`Signalement ${id} introuvable`);
    if (cible.statut !== "nouveau") {
      throw new Error("Ce signalement ne peut plus être modifié (déjà pris en charge).");
    }
    let maj = null;
    signalements = signalements.map((s) => {
      if (s.id_signal !== id) return s;
      maj = {
        ...s,
        titre: donnees.titre ?? s.titre,
        description: donnees.description ?? s.description,
        categorie: donnees.categorie ?? s.categorie,
        urgence: donnees.urgence ?? s.urgence,
        photo: donnees.photo ?? s.photo,
        latitude: donnees.latitude ?? s.latitude,
        longitude: donnees.longitude ?? s.longitude,
        quartier: donnees.quartier ?? s.quartier,
        updated_at: now(),
      };
      return maj;
    });
    return clone(maj);
  },

  // Annule (supprime) un signalement tant qu'il n'est pas pris en charge.
  annulerSignalement: async (id) => {
    await wait();
    const cible = signalements.find((s) => s.id_signal === id);
    if (!cible) throw new Error(`Signalement ${id} introuvable`);
    if (cible.statut !== "nouveau") {
      throw new Error("Ce signalement ne peut plus être annulé (déjà pris en charge).");
    }
    signalements = signalements.filter((s) => s.id_signal !== id);
    return { id_signal: id };
  },

  // Ajoute un commentaire / une information complémentaire.
  ajouterCommentaire: async (id, message, auteur = "Citoyen") => {
    await wait(250);
    let maj = null;
    signalements = signalements.map((s) => {
      if (s.id_signal !== id) return s;
      const commentaire = {
        id: nextId("COM"),
        auteur,
        message,
        date: now(),
      };
      maj = {
        ...s,
        commentaires: [...s.commentaires, commentaire],
        updated_at: now(),
      };
      return maj;
    });
    if (!maj) throw new Error(`Signalement ${id} introuvable`);
    return clone(maj);
  },

  // Confirme un signalement existant (constaté également).
  confirmerSignalement: async (id) => {
    await wait(250);
    const courant = idCitoyenCourant();
    let maj = null;
    signalements = signalements.map((s) => {
      if (s.id_signal !== id) return s;
      if (s.confirme_par?.includes(courant)) return s;
      maj = {
        ...s,
        confirmations: (s.confirmations || 0) + 1,
        confirme_par: [...(s.confirme_par || []), courant],
      };
      return maj;
    });
    if (!maj) throw new Error(`Signalement ${id} introuvable`);
    return clone(maj);
  },

  // Évalue la résolution d'un signalement résolu.
  evaluerSignalement: async (id, { note, commentaire = "" }) => {
    await wait(250);
    if (!note || note < 1 || note > 5) throw new Error("La note doit être comprise entre 1 et 5.");
    let maj = null;
    signalements = signalements.map((s) => {
      if (s.id_signal !== id) return s;
      maj = {
        ...s,
        evaluation: { note: Number(note), commentaire, date: now() },
      };
      return maj;
    });
    if (!maj) throw new Error(`Signalement ${id} introuvable`);
    return clone(maj);
  },

  // ------------------------------------------------------------------
  // ESPACE PUBLIC (transparence)
  // ------------------------------------------------------------------
  getSignalementsPublics: async (filtres = {}) => {
    await wait();
    let resultat = clone(signalements.filter((s) => s.public));
    if (filtres.categorie)
      resultat = resultat.filter((s) => s.categorie === filtres.categorie);
    if (filtres.statut) resultat = resultat.filter((s) => s.statut === filtres.statut);
    if (filtres.quartier)
      resultat = resultat.filter((s) => s.quartier === filtres.quartier);
    if (filtres.du) {
      resultat = resultat.filter(
        (s) => new Date(s.date_signalement) >= new Date(filtres.du)
      );
    }
    if (filtres.au) {
      resultat = resultat.filter(
        (s) => new Date(s.date_signalement) <= new Date(filtres.au)
      );
    }
    return resultat;
  },

  getInfrastructuresPubliques: async (filtres = {}) => {
    await wait();
    let resultat = clone(infrastructures);
    if (filtres.type) resultat = resultat.filter((i) => i.type === filtres.type);
    if (filtres.etat) resultat = resultat.filter((i) => i.etat === filtres.etat);
    if (filtres.quartier)
      resultat = resultat.filter((i) => i.quartier === filtres.quartier);
    if (filtres.recherche) {
      const q = filtres.recherche.toLowerCase();
      resultat = resultat.filter(
        (i) =>
          i.nom?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
      );
    }
    return resultat;
  },

  // Les interventions ne sont exposées que si la transparence est activée.
  getInterventionsPubliques: async (filtres = {}) => {
    await wait();
    let resultat = clone(interventions);
    if (filtres.quartier)
      resultat = resultat.filter((i) => i.quartier === filtres.quartier);
    return resultat;
  },

  // ------------------------------------------------------------------
  // NOTIFICATIONS
  // ------------------------------------------------------------------
  getNotifications: async () => {
    await wait(200);
    return clone(notifications);
  },

  marquerNotificationLue: async (id) => {
    await wait(150);
    notifications = notifications.map((n) =>
      n.id_notification === id ? { ...n, lue: true } : n
    );
    return clone(notifications.find((n) => n.id_notification === id));
  },

  marquerToutesNotificationsLues: async () => {
    await wait(200);
    notifications = notifications.map((n) => ({ ...n, lue: true }));
    return clone(notifications);
  },

  // ------------------------------------------------------------------
  // STATISTIQUES (tableau de bord)
  // ------------------------------------------------------------------
  getStatistiques: async () => {
    await wait(250);
    const courant = idCitoyenCourant();
    const mes = signalements.filter(
      (s) => s.id_citizen === courant || s.id_citizen === DEMO_CITOYEN_ID
    );
    const parStatut = {};
    Object.keys(STATUTS_SIGNALEMENT).forEach((k) => {
      parStatut[k] = mes.filter((s) => s.statut === k).length;
    });
    const evaluations = mes
      .filter((s) => s.evaluation?.note)
      .map((s) => s.evaluation.note);
    const noteMoyenne =
      evaluations.length > 0
        ? evaluations.reduce((a, b) => a + b, 0) / evaluations.length
        : null;
    return {
      total: mes.length,
      parStatut,
      nouveaux: parStatut.nouveau || 0,
      enTraitement: (parStatut.pris_en_charge || 0) + (parStatut.en_cours || 0),
      resolus: parStatut.resolu || 0,
      rejetes: parStatut.rejete || 0,
      notificationsNonLues: notifications.filter((n) => !n.lue).length,
      signalementsPublics: signalements.filter((s) => s.public).length,
      noteMoyenne,
    };
  },
};

export default citoyenService;
