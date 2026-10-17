// Service mocké du module Gestionnaire.
// Aucun backend n'existe encore pour le domaine "infrastructures" : ce service
// simule les appels API avec une latence et un stockage en mémoire.
// Chaque méthode peut être remplacée par un appel axiosConfig sans changer l'UI.

import {
  initialInfrastructures,
  initialSignalements,
  initialInterventions,
  initialAlertes,
  initialTransmissions,
} from "../data/mockData";
import { ETATS_INFRASTRUCTURE } from "../constants";

const LATENCE = 350;

const clone = (data) => JSON.parse(JSON.stringify(data));

const wait = (ms = LATENCE) => new Promise((resolve) => setTimeout(resolve, ms));

let infrastructures = clone(initialInfrastructures);
let signalements = clone(initialSignalements);
let interventions = clone(initialInterventions);
let alertes = clone(initialAlertes);
let transmissions = clone(initialTransmissions);

let compteurs = {
  INF: infrastructures.length,
  SIG: signalements.length,
  INT: interventions.length,
  ALR: alertes.length,
  TRS: transmissions.length,
};

const nextId = (prefixe, largeur = 4) => {
  compteurs[prefixe] += 1;
  return `${prefixe}-${String(compteurs[prefixe]).padStart(largeur, "0")}`;
};

const now = () => new Date().toISOString();

const creerAlerte = ({ niveau = "info", titre, message, id_infra = null, id_signal = null }) => {
  const alerte = {
    id_alerte: nextId("ALR"),
    niveau,
    titre,
    message,
    id_infra,
    id_signal,
    lue: false,
    created_at: now(),
  };
  alertes = [alerte, ...alertes];
  return alerte;
};

export const gestionnaireService = {
  // ------------------------------------------------------------------
  // INFRASTRUCTURES
  // ------------------------------------------------------------------
  getInfrastructures: async (filtres = {}) => {
    await wait();
    let resultat = clone(infrastructures);
    if (filtres.etat) resultat = resultat.filter((i) => i.etat === filtres.etat);
    if (filtres.type) resultat = resultat.filter((i) => i.type === filtres.type);
    if (filtres.statut) resultat = resultat.filter((i) => i.statut === filtres.statut);
    if (filtres.perimetre) resultat = resultat.filter((i) => i.perimetre === filtres.perimetre);
    if (filtres.recherche) {
      const q = filtres.recherche.toLowerCase();
      resultat = resultat.filter(
        (i) =>
          i.nom?.toLowerCase().includes(q) ||
          i.id_infra?.toLowerCase().includes(q) ||
          i.commune?.toLowerCase().includes(q) ||
          i.fokontany?.toLowerCase().includes(q)
      );
    }
    return resultat;
  },

  getInfrastructure: async (id) => {
    await wait();
    const infra = infrastructures.find((i) => i.id_infra === id);
    if (!infra) throw new Error(`Infrastructure ${id} introuvable`);
    return clone(infra);
  },

  createInfrastructure: async (donnees) => {
    await wait();
    const infra = {
      statut: donnees.statut || "actif",
      etat: donnees.etat || "bon",
      priorite: donnees.priorite || "moyenne",
      photo: donnees.photo || null,
      dernier_controle: now(),
      cout_estime: Number(donnees.cout_estime) || 0,
      created_at: now(),
      updated_at: now(),
      ...donnees,
      id_infra: nextId("INF"),
    };
    infrastructures = [infra, ...infrastructures];
    if (infra.etat === "critique") {
      creerAlerte({
        niveau: "critique",
        titre: `Infrastructure critique : ${infra.nom}`,
        message: `Nouvelle infrastructure enregistrée avec un état critique (${infra.id_infra}).`,
        id_infra: infra.id_infra,
      });
    }
    return clone(infra);
  },

  updateInfrastructure: async (id, donnees) => {
    await wait();
    let maj = null;
    infrastructures = infrastructures.map((i) => {
      if (i.id_infra !== id) return i;
      maj = { ...i, ...donnees, updated_at: now() };
      return maj;
    });
    if (!maj) throw new Error(`Infrastructure ${id} introuvable`);
    if (donnees.etat === "critique") {
      creerAlerte({
        niveau: "critique",
        titre: `Infrastructure critique : ${maj.nom}`,
        message: `L'état de ${maj.id_infra} a été mis à jour en "critique".`,
        id_infra: maj.id_infra,
      });
    }
    return clone(maj);
  },

  // Met à jour l'état après inspection : bon, moyen, dégradé, critique
  updateEtatInfrastructure: async (id, etat) => {
    if (!ETATS_INFRASTRUCTURE[etat]) throw new Error(`État inconnu : ${etat}`);
    return gestionnaireService.updateInfrastructure(id, {
      etat,
      dernier_controle: now(),
    });
  },

  // Suppression logique -> archivage (le gestionnaire ne supprime pas définitivement)
  archiverInfrastructure: async (id) => {
    return gestionnaireService.updateInfrastructure(id, { statut: "archive" });
  },

  // ------------------------------------------------------------------
  // SIGNALEMENTS CITOYENS
  // ------------------------------------------------------------------
  getSignalements: async (filtres = {}) => {
    await wait();
    let resultat = clone(signalements);
    if (filtres.statut) resultat = resultat.filter((s) => s.statut === filtres.statut);
    if (filtres.perimetre) resultat = resultat.filter((s) => s.perimetre === filtres.perimetre);
    if (filtres.id_infra) resultat = resultat.filter((s) => s.id_infra === filtres.id_infra);
    if (filtres.recherche) {
      const q = filtres.recherche.toLowerCase();
      resultat = resultat.filter(
        (s) =>
          s.titre?.toLowerCase().includes(q) ||
          s.id_signal?.toLowerCase().includes(q) ||
          s.declarant?.toLowerCase().includes(q)
      );
    }
    return resultat;
  },

  getSignalement: async (id) => {
    await wait();
    const s = signalements.find((x) => x.id_signal === id);
    if (!s) throw new Error(`Signalement ${id} introuvable`);
    return clone(s);
  },

  createSignalement: async (donnees) => {
    await wait();
    const signal = {
      source: donnees.source || "agent",
      statut: "nouveau",
      priorite_proposee: donnees.priorite_proposee || "moyenne",
      priorite_validee: null,
      id_infra: donnees.id_infra || null,
      date_signalement: now(),
      updated_at: now(),
      photos: donnees.photos || [],
      ...donnees,
      id_signal: nextId("SIG"),
    };
    signalements = [signal, ...signalements];
    return clone(signal);
  },

  // Change le statut d'un signalement : nouveau, en cours, résolu, rejeté
  updateStatutSignalement: async (id, statut, motif = "") => {
    await wait();
    let maj = null;
    signalements = signalements.map((s) => {
      if (s.id_signal !== id) return s;
      maj = { ...s, statut, updated_at: now() };
      if (statut === "rejete" && motif) maj.motif_rejet = motif;
      return maj;
    });
    if (!maj) throw new Error(`Signalement ${id} introuvable`);
    return clone(maj);
  },

  // Rattache un signalement à une infrastructure
  rattacherSignalement: async (idSignal, idInfra) => {
    await wait();
    if (idInfra && !infrastructures.some((i) => i.id_infra === idInfra)) {
      throw new Error(`Infrastructure ${idInfra} introuvable`);
    }
    let maj = null;
    signalements = signalements.map((s) => {
      if (s.id_signal !== idSignal) return s;
      maj = { ...s, id_infra: idInfra, updated_at: now() };
      return maj;
    });
    if (!maj) throw new Error(`Signalement ${idSignal} introuvable`);
    return clone(maj);
  },

  // Le gestionnaire propose une priorité (le décideur la valide ensuite)
  proposerPriorite: async (idSignal, priorite) => {
    await wait();
    let maj = null;
    signalements = signalements.map((s) => {
      if (s.id_signal !== idSignal) return s;
      maj = { ...s, priorite_proposee: priorite, updated_at: now() };
      return maj;
    });
    if (!maj) throw new Error(`Signalement ${idSignal} introuvable`);
    return clone(maj);
  },

  // ------------------------------------------------------------------
  // INTERVENTIONS / MAINTENANCE
  // ------------------------------------------------------------------
  getInterventions: async (filtres = {}) => {
    await wait();
    let resultat = clone(interventions);
    if (filtres.statut) resultat = resultat.filter((i) => i.statut === filtres.statut);
    if (filtres.id_infra) resultat = resultat.filter((i) => i.id_infra === filtres.id_infra);
    if (filtres.equipe) resultat = resultat.filter((i) => i.equipe === filtres.equipe);
    if (filtres.recherche) {
      const q = filtres.recherche.toLowerCase();
      resultat = resultat.filter(
        (i) =>
          i.titre?.toLowerCase().includes(q) ||
          i.id_inter?.toLowerCase().includes(q) ||
          i.id_infra?.toLowerCase().includes(q)
      );
    }
    return resultat;
  },

  getIntervention: async (id) => {
    await wait();
    const i = interventions.find((x) => x.id_inter === id);
    if (!i) throw new Error(`Intervention ${id} introuvable`);
    return clone(i);
  },

  // Planifier une intervention ou une maintenance
  createIntervention: async (donnees) => {
    await wait();
    const intervention = {
      type: donnees.type || "maintenance",
      statut: donnees.equipe ? "affectee" : "planifiee",
      avancement: 0,
      cout_reel: 0,
      date_realisation: null,
      photos: [],
      created_at: now(),
      updated_at: now(),
      ...donnees,
      id_inter: nextId("INT"),
    };
    interventions = [intervention, ...interventions];
    return clone(intervention);
  },

  updateIntervention: async (id, donnees) => {
    await wait();
    let maj = null;
    interventions = interventions.map((i) => {
      if (i.id_inter !== id) return i;
      maj = { ...i, ...donnees, updated_at: now() };
      return maj;
    });
    if (!maj) throw new Error(`Intervention ${id} introuvable`);
    return clone(maj);
  },

  // Affecter une intervention à une équipe ou à un agent
  affecterIntervention: async (id, { equipe, agent }) => {
    return gestionnaireService.updateIntervention(id, {
      equipe: equipe || null,
      agent: agent || null,
      statut: equipe || agent ? "affectee" : "planifiee",
    });
  },

  // Enregistrer une intervention réalisée : date, coût, photos, observations
  enregistrerRealisation: async (id, { date_realisation, cout_reel, observations, photos }) => {
    await wait();
    let maj = null;
    interventions = interventions.map((i) => {
      if (i.id_inter !== id) return i;
      maj = {
        ...i,
        date_realisation: date_realisation || now(),
        cout_reel: Number(cout_reel) || 0,
        observations: observations ?? i.observations,
        photos: photos && photos.length ? photos : i.photos,
        statut: "terminee",
        avancement: 100,
        updated_at: now(),
      };
      return maj;
    });
    if (!maj) throw new Error(`Intervention ${id} introuvable`);
    if (maj.id_infra) {
      await gestionnaireService.updateInfrastructure(maj.id_infra, { statut: "actif" });
    }
    return clone(maj);
  },

  // Mettre à jour le coût et l'avancement des travaux
  updateAvancement: async (id, { avancement, cout_reel }) => {
    return gestionnaireService.updateIntervention(id, {
      ...(avancement !== undefined ? { avancement: Number(avancement) } : {}),
      ...(cout_reel !== undefined ? { cout_reel: Number(cout_reel) } : {}),
    });
  },

  // ------------------------------------------------------------------
  // ALERTES / NOTIFICATIONS
  // ------------------------------------------------------------------
  getAlertes: async (filtres = {}) => {
    await wait(200);
    let resultat = clone(alertes);
    if (filtres.nonLues) resultat = resultat.filter((a) => !a.lue);
    if (filtres.niveau) resultat = resultat.filter((a) => a.niveau === filtres.niveau);
    return resultat;
  },

  marquerAlerteLue: async (id) => {
    await wait(150);
    alertes = alertes.map((a) => (a.id_alerte === id ? { ...a, lue: true } : a));
    return clone(alertes.find((a) => a.id_alerte === id));
  },

  marquerToutesAlertesLues: async () => {
    await wait(200);
    alertes = alertes.map((a) => ({ ...a, lue: true }));
    return clone(alertes);
  },

  // ------------------------------------------------------------------
  // SIGNALER UNE INFRASTRUCTURE CRITIQUE AU DÉCIDEUR
  // ------------------------------------------------------------------
  getTransmissions: async () => {
    await wait(200);
    return clone(transmissions);
  },

  signalerAuDecideur: async (idInfra, { priorite = "haute", message = "" } = {}) => {
    await wait();
    const infra = infrastructures.find((i) => i.id_infra === idInfra);
    if (!infra) throw new Error(`Infrastructure ${idInfra} introuvable`);
    const transmission = {
      id_transmission: nextId("TRS"),
      id_infra: idInfra,
      id_alerte: null,
      priorite,
      message:
        message ||
        `Proposition de priorisation ${priorite} pour l'infrastructure ${infra.nom} (${idInfra}).`,
      statut: "en_attente_validation",
      transmis_par: "agent-gestionnaire",
      created_at: now(),
    };
    transmissions = [transmission, ...transmissions];
    creerAlerte({
      niveau: priorite === "urgente" ? "critique" : "haute",
      titre: `Transmission au décideur : ${infra.nom}`,
      message: transmission.message,
      id_infra: idInfra,
    });
    return clone(transmission);
  },

  // ------------------------------------------------------------------
  // IMPORT DE DONNÉES (Shapefile, GeoJSON, CSV)
  // ------------------------------------------------------------------
  // Analyse un contenu GeoJSON / CSV en lignes normalisées (pas d'écriture).
  parseImport: async (mode, contenu) => {
    await wait(400);
    if (mode === "geojson") {
      let json;
      try {
        json = JSON.parse(contenu);
      } catch {
        throw new Error("Fichier GeoJSON invalide (JSON attendu).");
      }
      const features = json.features || [];
      const lignes = features.map((f, index) => {
        const p = f.properties || {};
        const coords = f.geometry?.coordinates;
        let lng;
        let lat;
        if (f.geometry?.type === "Point" && Array.isArray(coords)) {
          [lng, lat] = coords;
        }
        return {
          _ligne: index + 1,
          nom: p.nom || p.name || `Infrastructure importée ${index + 1}`,
          type: p.type || "bâtiment_public",
          etat: p.etat || "bon",
          commune: p.commune || "",
          latitude: lat ?? p.latitude ?? null,
          longitude: lng ?? p.longitude ?? null,
        };
      });
      return { mode, total: lignes.length, lignes };
    }

    if (mode === "csv") {
      const lignesBrutes = contenu.split(/\r?\n/).filter((l) => l.trim());
      if (lignesBrutes.length < 2) throw new Error("CSV vide ou sans données.");
      const entetes = lignesBrutes[0].split(/[,;]/).map((h) => h.trim().toLowerCase());
      const lignes = lignesBrutes.slice(1).map((ligne, index) => {
        const valeurs = ligne.split(/[,;]/);
        const obj = { _ligne: index + 1 };
        entetes.forEach((h, i) => {
          obj[h] = (valeurs[i] || "").trim();
        });
        return {
          _ligne: index + 1,
          nom: obj.nom || obj.name || `Infrastructure importée ${index + 1}`,
          type: obj.type || "bâtiment_public",
          etat: obj.etat || "bon",
          commune: obj.commune || "",
          latitude: obj.latitude ? Number(obj.latitude) : null,
          longitude: obj.longitude ? Number(obj.longitude) : null,
        };
      });
      return { mode, total: lignes.length, lignes };
    }

    // Shapefile : l'analyse réelle nécessite un backend SIG.
    // On simule une extraction à partir du nom de fichier.
    return {
      mode,
      total: 0,
      lignes: [],
      avertissement:
        "L'import Shapefile sera traité côté serveur (backend SIG requis). " +
        "Vous pouvez néanmoins déposer l'archive : elle sera mise en file d'attente.",
    };
  },

  // Importe (crée) les lignes validées issues de l'analyse.
  importInfrastructures: async (lignes = []) => {
    await wait(500);
    const creees = lignes.map((ligne) => {
      const infra = {
        id_infra: nextId("INF"),
        nom: ligne.nom,
        type: ligne.type,
        statut: "actif",
        etat: ligne.etat || "bon",
        priorite: ligne.priorite || "moyenne",
        perimetre: ligne.perimetre || "antananarivo-1",
        commune: ligne.commune || "",
        fokontany: ligne.fokontany || "",
        latitude: ligne.latitude ?? null,
        longitude: ligne.longitude ?? null,
        annee_construction: ligne.annee_construction || null,
        longueur_m: ligne.longueur_m || null,
        description: ligne.description || "Importée",
        photo: null,
        dernier_controle: now(),
        cout_estime: Number(ligne.cout_estime) || 0,
        created_at: now(),
        updated_at: now(),
      };
      return infra;
    });
    infrastructures = [...creees, ...infrastructures];
    return { total: creees.length, infrastructures: clone(creees) };
  },

  // ------------------------------------------------------------------
  // RAPPORTS / EXPORT
  // ------------------------------------------------------------------
  getStatistiques: async () => {
    await wait(250);
    const parEtat = {};
    Object.keys(ETATS_INFRASTRUCTURE).forEach((k) => {
      parEtat[k] = infrastructures.filter((i) => i.etat === k).length;
    });
    const parType = {};
    infrastructures.forEach((i) => {
      parType[i.type] = (parType[i.type] || 0) + 1;
    });
    const signalementsParStatut = {};
    signalements.forEach((s) => {
      signalementsParStatut[s.statut] = (signalementsParStatut[s.statut] || 0) + 1;
    });
    const interventionsParStatut = {};
    interventions.forEach((i) => {
      interventionsParStatut[i.statut] = (interventionsParStatut[i.statut] || 0) + 1;
    });
    const coutTotalPrevu = interventions.reduce((sum, i) => sum + (Number(i.cout_prevu) || 0), 0);
    const coutTotalReel = interventions.reduce((sum, i) => sum + (Number(i.cout_reel) || 0), 0);
    return {
      totalInfrastructures: infrastructures.length,
      totalSignalements: signalements.length,
      signalementsNouveaux: signalements.filter((s) => s.statut === "nouveau").length,
      totalInterventions: interventions.length,
      interventionsEnCours: interventions.filter((i) => i.statut === "en_cours").length,
      alertesNonLues: alertes.filter((a) => !a.lue).length,
      parEtat,
      parType,
      signalementsParStatut,
      interventionsParStatut,
      coutTotalPrevu,
      coutTotalReel,
    };
  },

  // Génère un rapport technique / d'intervention (données structurées, exportables)
  genererRapport: async (type = "technique", { du, au } = {}) => {
    await wait(500);
    const dansIntervalle = (date) => {
      if (!date) return false;
      const d = new Date(date).getTime();
      if (du && d < new Date(du).getTime()) return false;
      if (au && d > new Date(au).getTime()) return false;
      return true;
    };

    if (type === "intervention") {
      const lignes = interventions.filter((i) => dansIntervalle(i.updated_at));
      const totalPrevu = lignes.reduce((s, i) => s + (Number(i.cout_prevu) || 0), 0);
      const totalReel = lignes.reduce((s, i) => s + (Number(i.cout_reel) || 0), 0);
      return {
        type: "intervention",
        titre: "Rapport d'interventions",
        genere_le: now(),
        periode: { du: du || null, au: au || null },
        lignes: clone(lignes),
        totaux: { nombre: lignes.length, cout_prevu: totalPrevu, cout_reel: totalReel },
      };
    }

    // Rapport technique : état du parc d'infrastructures
    const stats = await gestionnaireService.getStatistiques();
    return {
      type: "technique",
      titre: "Rapport technique du parc d'infrastructures",
      genere_le: now(),
      periode: { du: du || null, au: au || null },
      lignes: clone(infrastructures).filter((i) => dansIntervalle(i.updated_at)),
      statistiques: stats,
    };
  },

  // Export CSV du périmètre (infrastructures, signalements ou interventions)
  exporter: async (ressource = "infrastructures", filtres = {}) => {
    await wait(300);
    let donnees = [];
    if (ressource === "signalements") {
      donnees = await gestionnaireService.getSignalements(filtres);
    } else if (ressource === "interventions") {
      donnees = await gestionnaireService.getInterventions(filtres);
    } else {
      donnees = await gestionnaireService.getInfrastructures(filtres);
    }

    if (!donnees.length) return { ressource, contenu: "", nombre: 0 };

    const colonnes = Object.keys(donnees[0]).filter(
      (c) => typeof donnees[0][c] !== "object"
    );
    const echapper = (v) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const entete = colonnes.join(";");
    const corps = donnees
      .map((ligne) => colonnes.map((c) => echapper(ligne[c])).join(";"))
      .join("\n");

    return { ressource, contenu: `${entete}\n${corps}`, nombre: donnees.length };
  },
};

export default gestionnaireService;
