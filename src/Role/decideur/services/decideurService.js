// Service mocké du module Décideur.
// Rôle de pilotage : lecture consolidée et actions de décision.
// Les infrastructures/signalements/interventions sont une copie de la scène du
// Gestionnaire (lecture seule) ; plans, projets et budgets sont propres au Décideur.

import {
  initialInfrastructures,
  initialSignalements,
  initialInterventions,
  initialPlans,
  initialProjets,
  initialBudgets,
  initialPartages,
} from "../data/mockData";
import { classerInfrastructures } from "../utils/score";

const LATENCE = 320;
const clone = (d) => JSON.parse(JSON.stringify(d));
const wait = (ms = LATENCE) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString();

let infrastructures = clone(initialInfrastructures);
let signalements = clone(initialSignalements);
let interventions = clone(initialInterventions);
let plans = clone(initialPlans);
let projets = clone(initialProjets);
let budgets = clone(initialBudgets);
let partages = clone(initialPartages);

let compteurs = {
  PRT: partages.length,
};

const nextId = (prefixe) => {
  compteurs[prefixe] = (compteurs[prefixe] || 0) + 1;
  return `${prefixe}-${String(compteurs[prefixe]).padStart(4, "0")}`;
};

const dansIntervalle = (date, du, au) => {
  if (!date) return true;
  const d = new Date(date).getTime();
  if (du && d < new Date(du).getTime()) return false;
  if (au && d > new Date(au).getTime()) return false;
  return true;
};

const filtrerListe = (liste, filtres = {}) =>
  liste.filter((i) => {
    if (filtres.etat && i.etat !== filtres.etat) return false;
    if (filtres.type && i.type !== filtres.type) return false;
    if (filtres.statut && i.statut !== filtres.statut) return false;
    if (filtres.territoire && i.perimetre !== filtres.territoire && i.territoire !== filtres.territoire)
      return false;
    if (filtres.commune && i.commune !== filtres.commune) return false;
    if (filtres.fokontany && i.fokontany !== filtres.fokontany) return false;
    if ((filtres.du || filtres.au) && !dansIntervalle(i.updated_at || i.created_at, filtres.du, filtres.au))
      return false;
    if (filtres.recherche) {
      const q = filtres.recherche.toLowerCase();
      const champs = [i.nom, i.id_infra, i.titre, i.id_signal, i.commune, i.fokontany];
      if (!champs.some((c) => c?.toLowerCase().includes(q))) return false;
    }
    return true;
  });

export const decideurService = {
  // ------------------------------------------------------------------
  // LECTURE CONSOLIDÉE
  // ------------------------------------------------------------------
  getInfrastructures: async (filtres = {}) => {
    await wait();
    return clone(filtrerListe(infrastructures, filtres));
  },

  getSignalements: async (filtres = {}) => {
    await wait();
    return clone(filtrerListe(signalements, filtres));
  },

  getInterventions: async (filtres = {}) => {
    await wait();
    return clone(filtrerListe(interventions, filtres));
  },

  // Indicateurs clés de décision
  getKPI: async () => {
    await wait(250);
    const critiques = infrastructures.filter((i) => i.etat === "critique");
    const degrades = infrastructures.filter((i) => i.etat === "degrade");
    const signalementsOuverts = signalements.filter(
      (s) => s.statut === "nouveau" || s.statut === "en_cours"
    );
    const interventionsEnCours = interventions.filter((i) => i.statut === "en_cours");
    const coutEstimeTotal = plans.reduce((s, p) => s + (Number(p.cout_estime) || 0), 0);
    const enveloppe = budgets.reduce((s, b) => s + (Number(b.enveloppe_totale) || 0), 0);
    const engage = budgets.reduce((s, b) => s + (Number(b.engage) || 0), 0);

    return {
      totalInfrastructures: infrastructures.length,
      infrastructuresCritiques: critiques.length,
      infrastructuresDegradees: degrades.length,
      tauxCritique: infrastructures.length
        ? Math.round((critiques.length / infrastructures.length) * 100)
        : 0,
      signalementsOuverts: signalementsOuverts.length,
      tauxResolution: signalements.length
        ? Math.round(
            (signalements.filter((s) => s.statut === "resolu").length / signalements.length) * 100
          )
        : 0,
      interventionsEnCours: interventionsEnCours.length,
      coutEstimeTotal,
      plansEnAttente: plans.filter((p) => p.statut === "en_attente_validation").length,
      projetsPriorises: projets.filter((p) => p.statut === "priorise" || p.statut === "programme")
        .length,
      budgetEnveloppe: enveloppe,
      budgetEngage: engage,
      tauxEngagement: enveloppe ? Math.round((engage / enveloppe) * 100) : 0,
      alertesNonLues: critiques.length + signalementsOuverts.filter((s) => s.priorite_proposee === "urgente").length,
    };
  },

  // Comparaison des indicateurs entre territoires
  getComparaisonTerritoires: async () => {
    await wait(300);
    const territoires = [...new Set(infrastructures.map((i) => i.perimetre))];
    return territoires.map((t) => {
      const infras = infrastructures.filter((i) => i.perimetre === t);
      const sigs = signalements.filter((s) => s.perimetre === t);
      const inter = interventions.filter((i) => infras.some((x) => x.id_infra === i.id_infra));
      const scores = classerInfrastructures(infras);
      const scoreMoyen = scores.length
        ? Math.round(scores.reduce((s, i) => s + i.score, 0) / scores.length)
        : 0;
      return {
        territoire: t,
        totalInfrastructures: infras.length,
        critiques: infras.filter((i) => i.etat === "critique").length,
        signalements: sigs.length,
        interventions: inter.length,
        coutEstime: inter.reduce((s, i) => s + (Number(i.cout_prevu) || 0), 0),
        scoreMoyenPriorite: scoreMoyen,
      };
    });
  },

  // Classement des infrastructures selon le score de priorité
  getClassementPriorite: async (filtres = {}) => {
    await wait(300);
    return clone(classerInfrastructures(filtrerListe(infrastructures, filtres)));
  },

  // Infrastructures critiques et zones prioritaires
  getZonesCritiques: async () => {
    await wait(250);
    const critiques = classerInfrastructures(
      infrastructures.filter((i) => i.etat === "critique" || i.etat === "degrade")
    );
    return clone(critiques);
  },

  // Évolution des signalements sur les 6 derniers mois
  getEvolutionSignalements: async () => {
    await wait(250);
    const mois = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      mois.push({
        cle: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleDateString("fr-FR", { month: "short" }),
        recus: 0,
        resolus: 0,
      });
    }
    signalements.forEach((s) => {
      const cle = (s.date_signalement || "").slice(0, 7);
      const cible = mois.find((m) => m.cle === cle);
      if (cible) cible.recus += 1;
      if (s.statut === "resolu") {
        const cleRes = (s.updated_at || "").slice(0, 7);
        const cibleRes = mois.find((m) => m.cle === cleRes);
        if (cibleRes) cibleRes.resolus += 1;
      }
    });
    return mois;
  },

  // Coûts estimés des interventions par statut / territoire
  getCoutsEstimes: async () => {
    await wait(250);
    const parStatut = {};
    interventions.forEach((i) => {
      if (!parStatut[i.statut]) parStatut[i.statut] = { prevu: 0, reel: 0, nombre: 0 };
      parStatut[i.statut].prevu += Number(i.cout_prevu) || 0;
      parStatut[i.statut].reel += Number(i.cout_reel) || 0;
      parStatut[i.statut].nombre += 1;
    });
    return {
      totalPrevu: interventions.reduce((s, i) => s + (Number(i.cout_prevu) || 0), 0),
      totalReel: interventions.reduce((s, i) => s + (Number(i.cout_reel) || 0), 0),
      parStatut,
      interventions: clone(interventions),
    };
  },

  // ------------------------------------------------------------------
  // PLANS D'INTERVENTION : valider / rejeter / reporter
  // ------------------------------------------------------------------
  getPlans: async (filtres = {}) => {
    await wait();
    let resultat = clone(plans);
    if (filtres.statut) resultat = resultat.filter((p) => p.statut === filtres.statut);
    return resultat;
  },

  decisionPlan: async (id, decision, motif = "", dateReport = null) => {
    await wait();
    let maj = null;
    plans = plans.map((p) => {
      if (p.id_plan !== id) return p;
      maj = {
        ...p,
        statut: decision,
        motif_decision: motif || null,
        date_report: dateReport,
        updated_at: now(),
      };
      return maj;
    });
    if (!maj) throw new Error(`Plan ${id} introuvable`);
    return clone(maj);
  },

  // ------------------------------------------------------------------
  // PROJETS DE RÉHABILITATION : prioriser / valider
  // ------------------------------------------------------------------
  getProjets: async () => {
    await wait();
    return clone([...projets].sort((a, b) => a.rang - b.rang));
  },

  prioriserProjet: async (id, rang) => {
    await wait();
    let maj = null;
    projets = projets.map((p) => {
      if (p.id_projet !== id) return p;
      maj = { ...p, rang: Number(rang), statut: "priorise", updated_at: now() };
      return maj;
    });
    if (!maj) throw new Error(`Projet ${id} introuvable`);
    projets.sort((a, b) => a.rang - b.rang);
    return clone(maj);
  },

  decisionProjet: async (id, statut) => {
    await wait();
    let maj = null;
    projets = projets.map((p) => {
      if (p.id_projet !== id) return p;
      maj = { ...p, statut, updated_at: now() };
      return maj;
    });
    if (!maj) throw new Error(`Projet ${id} introuvable`);
    return clone(maj);
  },

  // ------------------------------------------------------------------
  // BUDGET : valider / rejeter / programmer
  // ------------------------------------------------------------------
  getBudgets: async () => {
    await wait();
    return clone(budgets);
  },

  decisionBudget: async (id, decision, motif = "") => {
    await wait();
    let maj = null;
    budgets = budgets.map((b) => {
      if (b.id_budget !== id) return b;
      maj = { ...b, statut: decision, motif_decision: motif || null, updated_at: now() };
      return maj;
    });
    if (!maj) throw new Error(`Budget ${id} introuvable`);
    return clone(maj);
  },

  // ------------------------------------------------------------------
  // ALERTES
  // ------------------------------------------------------------------
  getAlertes: async () => {
    await wait(200);
    const alertes = [];
    infrastructures
      .filter((i) => i.etat === "critique")
      .forEach((i) =>
        alertes.push({
          id_alerte: `ALR-INF-${i.id_infra}`,
          niveau: "critique",
          titre: `Infrastructure critique : ${i.nom}`,
          message: `État critique constaté sur ${i.id_infra} (${i.commune || "—"}).`,
          id_infra: i.id_infra,
          created_at: i.updated_at,
        })
      );
    signalements
      .filter((s) => s.priorite_proposee === "urgente" && s.statut !== "resolu" && s.statut !== "rejete")
      .forEach((s) =>
        alertes.push({
          id_alerte: `ALR-SIG-${s.id_signal}`,
          niveau: "haute",
          titre: `Signalement urgent : ${s.titre}`,
          message: s.description,
          id_signal: s.id_signal,
          created_at: s.date_signalement,
        })
      );
    plans
      .filter((p) => p.statut === "en_attente_validation" && p.priorite_proposee === "urgente")
      .forEach((p) =>
        alertes.push({
          id_alerte: `ALR-PLN-${p.id_plan}`,
          niveau: "haute",
          titre: `Plan urgent à valider : ${p.titre}`,
          message: `Plan ${p.id_plan} en attente de décision.`,
          id_plan: p.id_plan,
          created_at: p.date_soumission,
        })
      );
    return clone(alertes);
  },

  // ------------------------------------------------------------------
  // PARTAGE
  // ------------------------------------------------------------------
  getPartages: async () => {
    await wait(200);
    return clone(partages);
  },

  creerPartage: async (type, reference) => {
    await wait(300);
    const id = nextId("PRT");
    const partage = {
      id_partage: id,
      type,
      reference,
      lien: `${window.location.origin}/#/partage/${id}`,
      expire_le: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      created_at: now(),
    };
    partages = [partage, ...partages];
    return clone(partage);
  },

  // ------------------------------------------------------------------
  // EXPORT (CSV / données tabulaires pour Excel et PDF)
  // ------------------------------------------------------------------
  construireTableau: async (ressource = "infrastructures", filtres = {}) => {
    await wait(250);
    let donnees = [];
    if (ressource === "signalements") donnees = filtrerListe(signalements, filtres);
    else if (ressource === "interventions") donnees = filtrerListe(interventions, filtres);
    else if (ressource === "plans") donnees = plans;
    else if (ressource === "projets") donnees = [...projets].sort((a, b) => a.rang - b.rang);
    else if (ressource === "budgets") donnees = budgets;
    else donnees = classerInfrastructures(filtrerListe(infrastructures, filtres));

    if (!donnees.length) return { colonnes: [], lignes: [], nombre: 0 };

    const colonnes = Object.keys(donnees[0]).filter((c) => typeof donnees[0][c] !== "object");
    const lignes = donnees.map((d) => colonnes.map((c) => d[c]));
    return { colonnes, lignes, nombre: donnees.length, donnees: clone(donnees) };
  },

  // Export tabulaire du tableau de bord (KPI + comparaison territoires)
  construireTableauBord: async () => {
    await wait(300);
    const kpi = await decideurService.getKPI();
    const comparaison = await decideurService.getComparaisonTerritoires();
    return { kpi, comparaison };
  },
};

export default decideurService;
