// Données géospatiales : import, export et suppression de jeux de données.
import React, { useState } from "react";
import { Map, Upload, Download, Trash2, FileSpreadsheet } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import AdminPage from "../components/AdminPage";
import {
  AdminBadge,
  AdminButton,
  AdminConfirmModal,
  AdminEmptyState,
  AdminLoading,
  AdminModal,
  AdminTable,
  AdminTextField,
  AdminToast,
} from "../components/AdminUI";
import { useAsyncData } from "../hooks/useAsyncData";
import { adminService } from "../services/adminService";
import { formatDate, formatTaille, formatNombre, versCsv, telechargerContenu } from "../utils/format";

const FORM_VIDE = { nom: "", format: "GeoJSON", taille_mo: 1, entites: 0, crs: "EPSG:4326" };

const GeospatialDataPage = () => {
  const { data: jeux, loading, recharger } = useAsyncData(() => adminService.listGeodata(), []);

  const [modalImport, setModalImport] = useState(false);
  const [form, setForm] = useState(FORM_VIDE);
  const [fichier, setFichier] = useState(null);
  const [aSupprimer, setASupprimer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const importer = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const jeu = await adminService.importGeodata({
        ...form,
        nom: form.nom || fichier?.name || "Jeu de données importé",
      });
      setToast({ message: `Jeu de données ${jeu.id} importé (${formatNombre(jeu.entites)} entités).`, tone: "success" });
      setModalImport(false);
      setForm(FORM_VIDE);
      setFichier(null);
      await recharger();
    } catch (err) {
      setToast({ message: err.message || "Erreur lors de l'import.", tone: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const exporter = (jeu) => {
    if (!jeu) return;
    const csv = versCsv([jeu]);
    telechargerContenu(csv, `${jeu.id}-${jeu.nom.replace(/\s+/g, "_").toLowerCase()}.csv`);
    setToast({ message: `Export du jeu ${jeu.id} lancé.`, tone: "success" });
  };

  const exporterTout = () => {
    if (!jeux?.length) {
      setToast({ message: "Aucun jeu de données à exporter.", tone: "error" });
      return;
    }
    telechargerContenu(versCsv(jeux), "jeux-donnees-geospatiaux.csv");
    setToast({ message: `${jeux.length} jeu(x) de données exporté(s).`, tone: "success" });
  };

  const supprimer = async () => {
    if (!aSupprimer) return;
    setActionLoading(true);
    try {
      await adminService.deleteGeodata(aSupprimer.id);
      setToast({ message: `Jeu de données ${aSupprimer.id} supprimé.`, tone: "success" });
      setASupprimer(null);
      await recharger();
    } catch (err) {
      setToast({ message: err.message || "Erreur lors de la suppression.", tone: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <AdminPage
        title="Données géospatiales"
        description="Importer, exporter et supprimer des jeux de données géospatiales de la plateforme."
        actions={
          <>
            <AdminButton variant="secondary" onClick={exporterTout}>
              <Download className="h-4 w-4" /> Tout exporter
            </AdminButton>
            <AdminButton onClick={() => setModalImport(true)}>
              <Upload className="h-4 w-4" /> Importer
            </AdminButton>
          </>
        }
      >
        {toast && <AdminToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}

        {loading ? (
          <AdminLoading message="Chargement des jeux de données..." />
        ) : !jeux?.length ? (
          <AdminEmptyState
            icon={Map}
            title="Aucun jeu de données"
            description="Aucun jeu de données géospatial n'est encore stocké."
            action={
              <AdminButton onClick={() => setModalImport(true)}>
                <Upload className="h-4 w-4" /> Importer un fichier
              </AdminButton>
            }
          />
        ) : (
          <AdminTable
            headers={["ID", "Nom", "Format", "Système de coordonnées", "Entités", "Taille", "Importé le", "Actions"]}
          >
            {jeux.map((g) => (
              <tr key={g.id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 text-sm text-slate-400">{g.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                    {g.nom}
                  </div>
                  <div className="text-xs text-slate-500">par {g.importe_par}</div>
                </td>
                <td className="px-4 py-3">
                  <AdminBadge tone="blue">{g.format}</AdminBadge>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-300">{g.crs}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{formatNombre(g.entites)}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{formatTaille(g.taille_mo)}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{formatDate(g.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      title="Exporter"
                      onClick={() => exporter(g)}
                      className="rounded-md p-1.5 text-sky-400 hover:bg-sky-500/10"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      title="Supprimer"
                      onClick={() => setASupprimer(g)}
                      className="rounded-md p-1.5 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}

        <p className="mt-3 text-xs text-slate-500">
          Formats acceptés à l'import : GeoJSON, Shapefile, GeoPackage, CSV (WKT). Les fichiers
          volumineux sont indexés en tâche de fond.
        </p>
      </AdminPage>

      <AdminModal
        isOpen={modalImport}
        onClose={() => setModalImport(false)}
        title="Importer un jeu de données géospatial"
        footer={
          <>
            <AdminButton variant="secondary" onClick={() => setModalImport(false)}>
              Annuler
            </AdminButton>
            <AdminButton onClick={importer} disabled={actionLoading || (!fichier && !form.nom)}>
              {actionLoading ? "Import en cours..." : "Importer"}
            </AdminButton>
          </>
        }
      >
        <form onSubmit={importer} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-300">Fichier</span>
            <input
              type="file"
              accept=".geojson,.json,.shp,.zip,.gpkg,.csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setFichier(f || null);
                if (f && !form.nom) setForm({ ...form, nom: f.name.replace(/\.[^.]+$/, "") });
              }}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-600 file:px-3 file:py-1 file:text-sm file:text-white"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminTextField
              label="Nom du jeu de données"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              placeholder="Ex. Routes nationales"
            />
            <AdminTextField
              label="Format"
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value })}
              placeholder="Ex. GeoJSON"
            />
            <AdminTextField
              label="Nombre d'entités"
              type="number"
              value={form.entites}
              onChange={(e) => setForm({ ...form, entites: e.target.value })}
            />
            <AdminTextField
              label="Système de coordonnées"
              value={form.crs}
              onChange={(e) => setForm({ ...form, crs: e.target.value })}
              placeholder="EPSG:4326"
            />
          </div>
          {fichier && (
            <p className="text-xs text-slate-400">
              Fichier sélectionné : <span className="text-emerald-400">{fichier.name}</span> (
              {formatTaille(fichier.size / (1024 * 1024))})
            </p>
          )}
        </form>
      </AdminModal>

      <AdminConfirmModal
        isOpen={!!aSupprimer}
        onClose={() => setASupprimer(null)}
        onConfirm={supprimer}
        loading={actionLoading}
        title="Supprimer le jeu de données"
        message={`Voulez-vous supprimer le jeu de données ${aSupprimer?.id} (${aSupprimer?.nom}) ? Les couches cartographiques qui l'utilisent cesseront d'afficher ces données.`}
      />
    </AdminLayout>
  );
};

export default GeospatialDataPage;
