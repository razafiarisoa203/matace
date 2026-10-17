// Utilitaires de formatage du module Citoyen.

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

export const formatCoordonnees = (lat, lng) => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return "—";
  }
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
};

export const formatNombre = (n) => (Number(n) || 0).toLocaleString("fr-FR");
