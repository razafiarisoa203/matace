// Utilitaires de formatage du module Gestionnaire.

export const formatDate = (dateString) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatMontant = (montant) => {
  const n = Number(montant) || 0;
  return `${n.toLocaleString("fr-FR")} Ar`;
};

export const formatNombre = (n) => (Number(n) || 0).toLocaleString("fr-FR");

export const formatCoordonnees = (lat, lng) => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return "—";
  }
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
};

// Déclenche le téléchargement d'un contenu texte (CSV) dans le navigateur.
export const telechargerContenu = (contenu, nomFichier, mimeType = "text/csv;charset=utf-8;") => {
  const blob = new Blob(["\ufeff" + contenu], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  URL.revokeObjectURL(url);
};
