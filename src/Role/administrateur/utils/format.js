// Utilitaires de formatage du module Administrateur.

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

export const formatNombre = (n) => {
  if (n === null || n === undefined || n === "") return "—";
  return Number(n).toLocaleString("fr-FR");
};

export const formatTaille = (mo) => {
  if (mo === null || mo === undefined) return "—";
  if (mo >= 1024) return `${(mo / 1024).toFixed(2)} Go`;
  return `${Number(mo).toFixed(1)} Mo`;
};

export const formatDuree = (ms) => {
  if (ms === null || ms === undefined) return "—";
  return `${formatNombre(ms)} ms`;
};

// Déclenche le téléchargement d'un contenu texte dans le navigateur.
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

// Convertit un tableau d'objets homogènes en CSV.
export const versCsv = (lignes) => {
  if (!lignes || lignes.length === 0) return "";
  const colonnes = Object.keys(lignes[0]);
  const echapper = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const entete = colonnes.map(echapper).join(";");
  const corps = lignes.map((l) => colonnes.map((c) => echapper(l[c])).join(";"));
  return [entete, ...corps].join("\n");
};
