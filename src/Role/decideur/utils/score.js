// Calcul du score de priorité d'une infrastructure.
// Score 0-100 : plus il est élevé, plus l'infrastructure est prioritaire.
// Le décideur consulte ce classement pour arbitrer les actions.

const POIDS_ETAT = { critique: 40, degrade: 28, moyen: 16, bon: 6 };
const POIDS_PRIORITE = { urgente: 30, haute: 20, moyenne: 12, basse: 5 };

// Normalise une valeur dans [0, max].
const borne = (valeur, max) => Math.max(0, Math.min(max, valeur));

export const calculerScorePriorite = (infra) => {
  if (!infra) return { score: 0, niveau: 4, detail: {} };

  const etatScore = POIDS_ETAT[infra.etat] ?? 10;
  const prioriteScore = POIDS_PRIORITE[infra.priorite] ?? 10;

  // Poids du coût : plus le coût estimé est élevé, plus il pèse (max 15).
  const cout = Number(infra.cout_estime) || 0;
  const coutScore = borne(Math.log10(cout + 1) * 2.5, 15);

  // Poids de l'ancienneté : une infra ancienne est plus prioritaire (max 15).
  const annee = Number(infra.annee_construction) || 2005;
  const age = new Date().getFullYear() - annee;
  const ageScore = borne(age / 2, 15);

  const score = Math.round(etatScore + prioriteScore + coutScore + ageScore);

  const niveau = score >= 80 ? 1 : score >= 60 ? 2 : score >= 40 ? 3 : 4;

  return {
    score,
    niveau,
    detail: {
      etat: Math.round(etatScore),
      priorite: Math.round(prioriteScore),
      cout: Math.round(coutScore),
      age: Math.round(ageScore),
    },
  };
};

export const classerInfrastructures = (infrastructures = []) =>
  [...infrastructures]
    .map((i) => ({ ...i, ...calculerScorePriorite(i) }))
    .sort((a, b) => b.score - a.score);
