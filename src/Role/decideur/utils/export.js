// Export PDF / Excel(CSV) du module Décideur.
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Export CSV (ouvrable dans Excel).
export const exporterCSV = (nomFichier, colonnes, lignes, separateur = ";") => {
  const echapper = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const contenu =
    colonnes.map(echapper).join(separateur) +
    "\n" +
    lignes.map((l) => l.map(echapper).join(separateur)).join("\n");
  const blob = new Blob(["\ufeff" + contenu], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomFichier.endsWith(".csv") ? nomFichier : `${nomFichier}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Export PDF d'un tableau.
export const exporterPDF = (nomFichier, titre, colonnes, lignes, meta = {}) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(22, 101, 52);
  doc.text(titre, 14, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(`Généré le ${new Date().toLocaleString("fr-FR")}`, 14, 22);
  if (meta.sousTitre) doc.text(meta.sousTitre, 14, 27);

  autoTable(doc, {
    startY: meta.sousTitre ? 31 : 26,
    head: [colonnes],
    body: lignes,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [22, 101, 52], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 250, 246] },
    margin: { left: 14, right: 14 },
    didDrawPage: () => {
      const page = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`MATAC · ${titre} · page ${page}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 6, {
        align: "right",
      });
    },
  });

  doc.save(nomFichier.endsWith(".pdf") ? nomFichier : `${nomFichier}.pdf`);
};

// Impression / ouverture d'une vue PDF dans un nouvel onglet (pour partage rapide).
export const ouvrirPDF = (titre, colonnes, lignes, meta = {}) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(22, 101, 52);
  doc.text(titre, 14, 16);
  autoTable(doc, {
    startY: 24,
    head: [colonnes],
    body: lignes,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 101, 52], textColor: 255 },
  });
  doc.output("dataurlnewwindow", { filename: meta.filename || "rapport.pdf" });
};

// Copie d'un lien dans le presse-papiers (partage).
export const copierLien = async (lien) => {
  try {
    await navigator.clipboard.writeText(lien);
    return true;
  } catch {
    return false;
  }
};
